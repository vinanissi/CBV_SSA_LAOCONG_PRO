import type { TaskItem, UserContext, UserRole } from '@/api/contracts';
import type { TaskOperationalBundle } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import { runCaseDiscovery, winnerAnchorSource, type DiscoveryWinner } from './caseDiscovery';
import { resolveCaseKeyWithDiagnostics } from './caseKeyResolver';
import {
  actorFromTask,
  caseTypeLabel,
  inferLifecycleFromTaskStatus,
  minConfidence,
} from './caseLifecycle';
import type {
  CaseReadModel,
  CaseTypeCode,
  Confidence,
  DiagnosticsField,
  DiscoveryOutcome,
  RelationField,
} from './caseReadModelTypes';

const FINANCE_ROLES: UserRole[] = ['ADMIN', 'FINANCE', 'MANAGER'];

export interface DeriveCaseReadModelInput {
  task?: TaskItem;
  taskTitle?: string;
  operationalBundle?: TaskOperationalBundle | null;
  operator?: UserContext;
  manualCaseKey?: string;
}

function defaultCaseTypeForSource(source: string): CaseTypeCode {
  switch (source) {
    case 'HO_SO_ANCHORED':
      return 'HO_SO';
    case 'FINANCE_ANCHORED':
      return 'FINANCE';
    case 'ALERT_ANCHORED':
      return 'OPERATIONS';
    default:
      return 'OPERATIONS';
  }
}

function buildPermissions(task: TaskItem | undefined, operator?: UserContext) {
  const canView = task?.permissionAllowed !== false;
  const role = operator?.role ?? 'STAFF';
  const canSeePrivateFields = FINANCE_ROLES.includes(role);
  return {
    canView,
    canOpenSource: canView,
    canOpenRelated: canView,
    canSeePrivateFields,
    canMutateTask: canView,
  };
}

function buildMemorySummary(
  bundle: TaskOperationalBundle | null | undefined,
  taskId: string,
  checklistCount = 0,
) {
  const timeline = bundle?.timeline ?? [];
  const documents = bundle?.documents ?? [];
  const latest = timeline[0];
  const recent = latest
    ? [
        {
          memoryType: 'Timeline',
          label: latest.eventLabel || latest.payload || 'Hoạt động gần nhất',
          at: latest.createdAt ?? null,
          actor: actorFromTask(undefined, latest.actor, 'TASK_UPDATE_LOG'),
          sourceRuntime: 'TASK_GS_01' as const,
          deepLink: `/inbox/${taskId}`,
        },
      ]
    : [];

  return {
    lastActivityAt: latest?.createdAt ?? null,
    lastActivityText: latest?.eventLabel ?? null,
    counts: {
      timeline: timeline.length,
      checklist: checklistCount,
      attachments: documents.length,
      comments: 0,
      decisions: 0,
      handoffs: 0,
      evidence: 0,
    },
    recent,
  };
}

function buildRelations(
  task: TaskItem,
  anchorSource: string,
  hoSoId?: string,
): RelationField[] {
  const relations: RelationField[] = [
    {
      targetType: 'TASK',
      targetId: task.taskId,
      role: 'PRIMARY',
      label: task.title?.trim() || null,
      source: 'TASK_MAIN',
      confidence: 'HIGH',
      projectionKey: 'task',
    },
  ];

  if (anchorSource === 'HO_SO_ANCHORED' && hoSoId) {
    relations.unshift({
      targetType: 'HO_SO',
      targetId: hoSoId,
      role: 'PRIMARY',
      label: hoSoId,
      source: 'TASK_MAIN',
      confidence: 'MEDIUM',
      projectionKey: 'hoSo',
    });
  }

  if (anchorSource === 'FINANCE_ANCHORED' && task.relatedEntityId?.trim()) {
    relations.unshift({
      targetType: 'FINANCE_TRANSACTION',
      targetId: task.relatedEntityId.trim(),
      role: 'PRIMARY',
      label: task.relatedEntityId.trim(),
      source: 'TASK_MAIN',
      confidence: 'MEDIUM',
      projectionKey: 'finance',
    });
  }

  if (anchorSource === 'ALERT_ANCHORED' && task.relatedEntityId?.trim()) {
    relations.unshift({
      targetType: 'ALERT',
      targetId: task.relatedEntityId.trim(),
      role: 'SOURCE',
      label: null,
      source: 'HOME_ALERT',
      confidence: 'LOW',
      projectionKey: 'alerts',
    });
  }

  return relations;
}

function finalizeOutcome(
  discovery: DiscoveryWinner,
  keyOk: boolean,
  confidence: Confidence,
): DiscoveryOutcome {
  if (!keyOk || discovery.outcome === 'NONE') return 'NONE';
  if (confidence === 'LOW' || discovery.outcome === 'PARTIAL') return 'PARTIAL';
  return 'RESOLVED';
}

export function deriveCaseReadModel(input: DeriveCaseReadModelInput): CaseReadModel | null {
  const { task, operationalBundle, operator, manualCaseKey, taskTitle } = input;
  if (!task?.taskId?.trim()) return null;

  const permissions = buildPermissions(task, operator);
  if (!permissions.canView) return null;

  const discovery = runCaseDiscovery(task, manualCaseKey);
  if (!discovery) return null;

  const anchorSource = winnerAnchorSource(discovery);
  const keyResult = resolveCaseKeyWithDiagnostics(
    anchorSource,
    discovery.sourceId,
    manualCaseKey,
    task.taskId,
  );

  if (!keyResult.ok || !keyResult.caseKey) {
    return null;
  }

  const lifecycle = inferLifecycleFromTaskStatus(task.status, task.updatedAt);
  const caseType = defaultCaseTypeForSource(anchorSource);
  const title = task.title?.trim() || taskTitle?.trim() || `Case ${caseTypeLabel(caseType)}`;

  const missingProjections: string[] = [];
  const warnings = [...keyResult.warnings];

  if (task.relatedHoSoId?.trim() && anchorSource !== 'HO_SO_ANCHORED' && discovery.isMixed) {
    missingProjections.push('hoSo');
  }
  if (
    task.relatedEntityType?.toUpperCase().includes('FINANCE') &&
    anchorSource !== 'FINANCE_ANCHORED'
  ) {
    missingProjections.push('finance');
  }

  const relations = buildRelations(task, anchorSource, task.relatedHoSoId?.trim());
  const primaryHoSo = relations.find((r) => r.targetType === 'HO_SO' && r.role === 'PRIMARY');
  const missingRelations: string[] = [];
  if (anchorSource === 'HO_SO_ANCHORED' && !primaryHoSo) {
    missingRelations.push('PRIMARY:HO_SO');
    warnings.push('Chưa xác định thực thể chính');
  }

  let confidence: Confidence = lifecycle.confidence;
  if (missingRelations.length > 0 || missingProjections.length > 0) {
    confidence = minConfidence(confidence, 'LOW');
  }
  if (keyResult.warnings.some((w) => w.startsWith('CASE_KEY_FALLBACK'))) {
    confidence = minConfidence(confidence, 'LOW');
  }

  const discoveryOutcome = finalizeOutcome(discovery, true, confidence);

  if (discoveryOutcome === 'NONE') return null;

  if (missingProjections.length > 0) {
    warnings.push('Chưa đọc được dữ liệu liên quan');
  }

  if (confidence === 'UNKNOWN') {
    warnings.push('Chưa đọc được ngữ cảnh case.');
  }

  const diagnostics: DiagnosticsField = {
    confidence,
    missingRelations,
    missingProjections,
    staleSources: [],
    warnings,
    runtimeState: 'NOT_WIRED',
    discoveryCandidates: discovery.isMixed ? discovery.candidates : undefined,
    discoveryOutcome,
  };

  const responsible = actorFromTask(
    task.ownerId || task.owner,
    task.ownerDisplayName || task.displayOwner || task.displayAssigneeName,
  );
  const support =
    task.assignedTo && task.assignedTo !== task.ownerId
      ? [actorFromTask(task.assignedTo, task.assignedToDisplayName || task.displayAssigneeName)]
      : [];

  return {
    caseKey: keyResult.caseKey,
    caseType,
    title,
    lifecycle,
    result: null,
    responsibility: {
      responsible,
      support,
      reviewer: [],
      escalation: [],
      watcher: [],
    },
    relations,
    workItems: [],
    memorySummary: buildMemorySummary(
      operationalBundle?.taskId === task.taskId ? operationalBundle : null,
      task.taskId,
    ),
    projections: {},
    permissions,
    source: discovery.source,
    diagnostics,
  };
}
