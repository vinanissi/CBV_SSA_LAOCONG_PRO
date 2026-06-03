/**
 * Pure projection helpers: Task + bundle → Case runtime slices.
 * Read-only — no API calls, no persistence.
 */

import type { TaskDetail, TaskItem } from '@/api/contracts';
import { adaptToSmartChecklistItem } from '@/modules/task/inbox/checklist/adaptToSmartChecklistItem';
import { loadChecklistAttachmentsForTask } from '@/modules/task/inbox/checklist/checklistAttachmentLocalStore';
import { loadChecklistLinksForTask } from '@/modules/task/inbox/checklist/checklistLinkLocalStore';
import { loadChecklistFeedbackForTask } from '@/modules/task/inbox/checklist/checklistFeedbackLocalStore';
import { loadChecklistHistoryForTask } from '@/modules/task/inbox/checklist/checklistHistoryLocalStore';
import { enrichSmartChecklistItem } from '@/modules/task/inbox/checklist/enrichSmartChecklistRuntime';
import type { WorkInboxChecklistItem } from '@/modules/task/inbox/checklist/workInboxChecklistTypes';
import type { TaskOperationalBundle, TaskTimelineEntry } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import { buildFocusHandoffView, formatFocusTimelineActor, formatFocusTimelineFriendlyLabel } from '@/modules/task/inbox/focusRuntime/focusLayoutShared';
import { caseTypeLabel, inferLifecycleFromTaskStatus } from './caseLifecycle';
import type { CaseReadModel, CaseTypeCode } from './caseReadModelTypes';
import { DIAGNOSTIC_MESSAGES, makeRuntimeDiagnostic } from './caseReadModelDiagnostics';
import { discoverySourceLabel, formatCaseKeyDisplayLabel } from './ocmsStripLabels';
import type {
  CaseChecklistItem,
  CaseContextField,
  CaseDocumentRef,
  CaseHandoff,
  CaseLifecycleCode,
  CaseRuntimeDiagnostic,
  CaseTaskRef,
  CaseTimelineEntry,
  CaseTimelineEntryType,
  WorkflowStateField,
} from './caseRuntimeReadModelTypes';

const COMMENT_EVENT_HINTS = new Set(['NOTE', 'COMMENT', 'CHAT']);

function mapTimelineEntryType(eventType: string): CaseTimelineEntryType {
  const t = eventType.trim().toUpperCase();
  if (COMMENT_EVENT_HINTS.has(t) || t.includes('NOTE') || t.includes('COMMENT')) return 'COMMENT';
  if (t.includes('HANDOFF')) return 'HANDOFF';
  if (t.includes('CHECKLIST')) return 'CHECKLIST';
  if (t.includes('ATTACHMENT') || t.includes('DOCUMENT')) return 'DOCUMENT';
  if (t.includes('STATUS') || t.includes('TASK_')) return 'TASK_UPDATE';
  return 'OTHER';
}

export function projectWorkflowState(lifecycle: CaseReadModel['lifecycle']): WorkflowStateField {
  const code = (lifecycle.code || 'ACTIVE') as CaseLifecycleCode;
  return {
    code,
    label: lifecycle.label,
    source: lifecycle.source === 'INFERRED' ? 'TASK_STATUS' : 'LIFECYCLE',
    confidence: lifecycle.confidence,
  };
}

export function projectCaseContext(
  task: TaskItem,
  ocms: CaseReadModel,
  taskDetail?: TaskDetail | null,
): CaseContextField {
  return {
    summary: taskDetail?.description?.trim() || null,
    sourceTaskId: task.taskId,
    sourceModule: task.module?.trim() || 'TASK',
    relatedEntityType: task.relatedEntityType?.trim() || null,
    relatedEntityId: task.relatedEntityId?.trim() || null,
    operationalNote: null,
    caseTypeLabel: caseTypeLabel(ocms.caseType),
    discoveryLine: `${ocms.source} · ${discoverySourceLabel(ocms.source)}`,
  };
}

export function projectChecklist(
  items: WorkInboxChecklistItem[] | undefined,
  taskId: string,
): CaseChecklistItem[] {
  if (!items?.length) return [];
  const feedbackMap =
    typeof localStorage !== 'undefined' ? loadChecklistFeedbackForTask(taskId) : {};
  const attachmentsMap =
    typeof localStorage !== 'undefined' ? loadChecklistAttachmentsForTask(taskId) : {};
  const linksMap = typeof localStorage !== 'undefined' ? loadChecklistLinksForTask(taskId) : {};
  const historyMap =
    typeof localStorage !== 'undefined' ? loadChecklistHistoryForTask(taskId) : {};
  return items
    .filter((i) => i.taskId === taskId)
    .map((i) => {
      const smart = enrichSmartChecklistItem(adaptToSmartChecklistItem(i), {
        feedbackByItemId: feedbackMap,
        attachmentsByItemId: attachmentsMap,
        linksByItemId: linksMap,
        historyByItemId: historyMap,
      });
      return {
        id: smart.id,
        label: smart.title,
        done: smart.status === 'done',
        required: Boolean(i.isRequired),
        source: 'TASK_CHECKLIST' as const,
        promoteToTaskCandidate:
          Boolean(i.isRequired) && smart.status !== 'done',
        note: smart.note || null,
        responseCount: smart.responseCount,
        attachmentCount: smart.attachmentCount,
        linkCount: smart.linkCount,
        updatedAt: smart.updatedAt ?? null,
      };
    });
}

export function projectTasks(task: TaskItem, isFocusTask = true): CaseTaskRef[] {
  return [
    {
      taskId: task.taskId,
      title: task.title?.trim() || task.taskId,
      status: task.status?.trim() || 'UNKNOWN',
      owner:
        task.ownerDisplayName?.trim() ||
        task.displayOwner?.trim() ||
        task.ownerId?.trim() ||
        null,
      dueDate: task.dueDate?.trim() || null,
      source: 'TASK_MAIN',
      isFocusTask,
    },
  ];
}

export function projectDocuments(
  bundle: TaskOperationalBundle | null | undefined,
  taskId: string,
): CaseDocumentRef[] {
  const docs = bundle?.taskId === taskId ? bundle.documents ?? [] : [];
  return docs.map((d) => ({
    documentId: d.documentId,
    title: d.title?.trim() || 'Tài liệu',
    url: d.url?.trim() || '',
    type: d.source?.trim() || 'link',
    source: 'TASK_DOCUMENT',
    linkedTaskId: d.taskId,
  }));
}

export function projectTimeline(
  bundle: TaskOperationalBundle | null | undefined,
  taskId: string,
  notes?: TaskOperationalBundle['notes'],
): CaseTimelineEntry[] {
  const timeline = bundle?.taskId === taskId ? bundle.timeline ?? [] : [];
  const entries: CaseTimelineEntry[] = timeline.map((e: TaskTimelineEntry) => ({
    entryId: e.timelineId,
    entryType: mapTimelineEntryType(e.eventType || ''),
    label: formatFocusTimelineFriendlyLabel(e),
    actor: formatFocusTimelineActor(e.actor),
    at: e.createdAt ?? null,
    source: e.source?.trim() || 'TASK_TIMELINE',
    linkedTaskId: e.taskId,
    appendOnly: true as const,
  }));

  const noteList = bundle?.taskId === taskId ? notes ?? bundle.notes ?? [] : [];
  for (const n of noteList) {
    entries.push({
      entryId: `note:${n.noteId}`,
      entryType: 'COMMENT',
      label: n.content?.trim() || 'Ghi chú',
      actor: formatFocusTimelineActor(n.author),
      at: n.createdAt ?? null,
      source: 'TASK_NOTE',
      linkedTaskId: n.taskId,
      appendOnly: true,
    });
  }

  return entries.sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

export function projectHandoff(
  bundle: TaskOperationalBundle | null | undefined,
  task: TaskItem,
  taskDetail?: TaskDetail | null,
): CaseHandoff | null {
  const recipient =
    task.ownerDisplayName?.trim() ||
    task.displayAssigneeName?.trim() ||
    task.ownerId?.trim() ||
    '';

  const view = buildFocusHandoffView({
    bundle: bundle?.taskId === task.taskId ? bundle : null,
    taskDetail,
    defaultRecipient: recipient || 'Chưa gán',
  });

  if (!view.hasHandoff) return null;

  return {
    currentState: view.statusLabel || null,
    pendingWork: null,
    risks: null,
    nextAction: view.note?.trim() || null,
    responsiblePerson: view.recipient || null,
    requiredDocuments: null,
    blockerNotes: null,
    derivedFrom: 'TIMELINE',
  };
}

export function collectProjectionDiagnostics(options: {
  ocms: CaseReadModel;
  task: TaskItem;
  checklist: CaseChecklistItem[];
  documents: CaseDocumentRef[];
  timeline: CaseTimelineEntry[];
  handoff: CaseHandoff | null;
}): CaseRuntimeDiagnostic[] {
  const codes: CaseRuntimeDiagnostic[] = [];
  const push = (code: Parameters<typeof makeRuntimeDiagnostic>[0], override?: string) =>
    codes.push(makeRuntimeDiagnostic(code, override ?? DIAGNOSTIC_MESSAGES[code]));

  if (!options.task.title?.trim()) push('MISSING_TITLE');
  if (!options.ocms.responsibility.responsible?.actorId && !options.ocms.responsibility.responsible?.displayName) {
    push('MISSING_RESPONSIBLE');
  }
  if (options.ocms.lifecycle.confidence === 'LOW' || options.ocms.lifecycle.confidence === 'UNKNOWN') {
    push('AMBIGUOUS_LIFECYCLE');
  }
  if (options.ocms.diagnostics.confidence === 'LOW') push('LOW_CONFIDENCE');
  if (options.ocms.source === 'TASK_ANCHORED') push('DERIVED_FROM_TASK_ONLY');
  push('MULTI_TASK_GROUPING_DEFERRED');

  if (options.checklist.length === 0) push('NO_CHECKLIST');
  if (options.documents.length === 0) push('NO_DOCUMENTS');
  if (options.timeline.length === 0) push('NO_TIMELINE');
  if (!options.handoff) push('NO_HANDOFF');

  if (options.ocms.diagnostics.warnings.some((w) => w.includes('FALLBACK'))) {
    push('CASE_KEY_FALLBACK');
  }

  return codes;
}

export function resolveDisplayKey(ocms: CaseReadModel): string {
  return formatCaseKeyDisplayLabel(ocms) ?? ocms.caseKey.split(':').pop() ?? ocms.caseKey;
}

/** Re-export for deriver — lifecycle from task when OCMS already computed */
export { inferLifecycleFromTaskStatus };

export type { CaseTypeCode };
