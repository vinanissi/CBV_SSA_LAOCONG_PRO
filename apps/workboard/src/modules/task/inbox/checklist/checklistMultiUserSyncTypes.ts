/**
 * PHASE_CHECKLIST_14 — multi-user sync types.
 */

export type ChecklistSyncStatus =
  | 'idle'
  | 'refreshing'
  | 'synced'
  | 'stale'
  | 'conflict'
  | 'error';

export type ChecklistSyncResultStatus = 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';

export type ChecklistWriteOperation =
  | 'update'
  | 'delete'
  | 'append'
  | 'feedback_added'
  | 'history_added'
  | 'attachment_metadata_added'
  | 'link_added';

export interface ChecklistSyncState {
  taskId: string;
  syncStatus: ChecklistSyncStatus;
  lastSyncedAt?: string | null;
  remoteUpdatedAt?: string | null;
  localUpdatedAt?: string | null;
  conflictDetected: boolean;
  conflictMessage?: string | null;
  actor?: string | null;
  traceId?: string | null;
}

export interface ChecklistRemoteSnapshot {
  taskId: string;
  items: import('./workInboxChecklistTypes').WorkInboxChecklistItem[];
  feedbackByItemId: import('./checklistFeedbackTypes').ChecklistFeedbackByItemId;
  attachmentsByItemId: import('./checklistAttachmentTypes').ChecklistAttachmentByItemId;
  linksByItemId: import('./checklistLinkTypes').ChecklistLinkByItemId;
  historyByItemId: import('./checklistHistoryTypes').ChecklistHistoryByItemId;
  layoutExpandedItemIds: string[];
  remoteUpdatedAt: string | null;
  signature: string;
}

export interface ChecklistSyncCompareInput {
  taskId: string;
  localSignature: string;
  remoteSignature: string;
  lastSyncedAt?: string | null;
  localUpdatedAt?: string | null;
  remoteUpdatedAt?: string | null;
}

export interface ChecklistSyncCompareResult {
  ok: boolean;
  stale: boolean;
  conflictDetected: boolean;
  conflictMessage?: string | null;
  warnings: string[];
}

export interface ChecklistSyncResult {
  ok: boolean;
  status: ChecklistSyncResultStatus;
  traceId: string;
  taskId: string;
  pulledItemsCount?: number;
  pulledFeedbackCount?: number;
  pulledAttachmentsCount?: number;
  pulledLinksCount?: number;
  pulledHistoryCount?: number;
  pulledLayoutCount?: number;
  syncState: ChecklistSyncState;
  snapshot?: ChecklistRemoteSnapshot | null;
  warnings: string[];
  errors: string[];
}

export interface ChecklistWriteGuardInput {
  taskId: string;
  operation: ChecklistWriteOperation;
  syncState: ChecklistSyncState;
  compare?: ChecklistSyncCompareResult | null;
}

export interface ChecklistWriteGuardResult {
  ok: boolean;
  canWrite: boolean;
  conflictDetected: boolean;
  requiresRefresh: boolean;
  message?: string;
  warnings: string[];
  errors: string[];
}

export interface ChecklistSyncValidationResult {
  ok: boolean;
  status: ChecklistSyncResultStatus;
  checkedAt: string;
  traceId: string;
  sync: { manualRefresh: boolean; staleDetection: boolean; writeGuard: boolean };
  bridge: { enabled: boolean };
  ui: { statusBar: boolean };
  warnings: string[];
  errors: string[];
  nextStep: string;
}
