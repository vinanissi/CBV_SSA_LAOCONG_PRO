/**
 * PHASE_CHECKLIST_11 — write satellite data through Sheet bridge.
 */

import type { UserContext } from '@/api/contracts';
import { callChecklistBridge } from './checklistBridgeApi';
import type { ChecklistAttachment } from './checklistAttachmentTypes';
import type { ChecklistFeedback } from './checklistFeedbackTypes';
import type { ChecklistHistoryEntry } from './checklistHistoryTypes';
import type { ChecklistLink } from './checklistLinkTypes';

function operatorLabel(operator: UserContext): string {
  return (
    operator.displayName?.trim() ||
    operator.userId?.trim() ||
    operator.email?.trim() ||
    'OPERATOR'
  );
}

export async function bridgeAppendFeedback(
  taskId: string,
  entry: ChecklistFeedback,
  operator: UserContext,
): Promise<boolean> {
  const res = await callChecklistBridge<{ feedback: ChecklistFeedback }>(taskId, 'appendFeedback', {
    taskId,
    checklistItemId: entry.checklistItemId,
    id: entry.id,
    message: entry.message,
    author: entry.author ?? operatorLabel(operator),
    createdAt: entry.createdAt,
  });
  return res.ok;
}

export async function bridgeAppendAttachment(
  taskId: string,
  entry: ChecklistAttachment,
  operator: UserContext,
): Promise<boolean> {
  const res = await callChecklistBridge(taskId, 'appendAttachmentMetadata', {
    taskId,
    checklistItemId: entry.checklistItemId,
    id: entry.id,
    name: entry.name,
    url: entry.url,
    mimeType: entry.mimeType,
    size: entry.size,
    source: entry.source,
    createdBy: entry.createdBy ?? operatorLabel(operator),
    createdAt: entry.createdAt,
  });
  return res.ok;
}

export async function bridgeAppendLink(
  taskId: string,
  entry: ChecklistLink,
  operator: UserContext,
): Promise<boolean> {
  const res = await callChecklistBridge(taskId, 'appendLink', {
    taskId,
    checklistItemId: entry.checklistItemId,
    id: entry.id,
    label: entry.label,
    url: entry.url,
    type: entry.type,
    description: entry.description,
    source: entry.source,
    createdBy: entry.createdBy ?? operatorLabel(operator),
    createdAt: entry.createdAt,
  });
  return res.ok;
}

export async function bridgeAppendHistory(
  taskId: string,
  entry: ChecklistHistoryEntry,
  operator: UserContext,
): Promise<boolean> {
  const res = await callChecklistBridge(taskId, 'appendHistory', {
    taskId,
    checklistItemId: entry.checklistItemId,
    type: entry.type,
    message: entry.message,
    actor: entry.actor ?? operatorLabel(operator),
    refId: entry.refId,
    refType: entry.refType,
    metadata: entry.metadata,
  });
  return res.ok;
}

export async function bridgeEnsureItemDriveFolder(
  taskId: string,
  checklistItemId: string,
): Promise<boolean> {
  const res = await callChecklistBridge(taskId, 'ensureChecklistItemDriveFolder', {
    taskId,
    checklistItemId,
  });
  return res.ok;
}
