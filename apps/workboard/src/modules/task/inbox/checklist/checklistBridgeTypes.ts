/**
 * PHASE_CHECKLIST_11 — bridge result types (mirrors GAS ChecklistSheetDriveBridge).
 */

export type ChecklistBridgeStatus = 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';

export type ChecklistBridgeMethod =
  | 'readChecklistItems'
  | 'upsertChecklistItem'
  | 'readFeedback'
  | 'appendFeedback'
  | 'readAttachmentMetadata'
  | 'appendAttachmentMetadata'
  | 'readLinks'
  | 'appendLink'
  | 'readHistory'
  | 'appendHistory'
  | 'readTemplates'
  | 'applyTemplate'
  | 'ensureChecklistItemDriveFolder'
  | 'upsertLayoutState'
  | 'readLayoutState'
  | 'uploadChecklistFile';

export interface ChecklistBridgeResult<T = unknown> {
  ok: boolean;
  status: ChecklistBridgeStatus;
  traceId: string;
  message?: string;
  data?: T;
  warnings?: string[];
  errors?: string[];
}

export interface ChecklistBridgeFeedbackRow {
  id: string;
  checklistItemId: string;
  taskId?: string;
  message: string;
  author?: string | null;
  createdAt?: string | null;
  source?: string | null;
}

export interface ChecklistBridgeAttachmentRow {
  id: string;
  checklistItemId: string;
  taskId?: string;
  name: string;
  url?: string | null;
  driveFileId?: string | null;
  mimeType?: string | null;
  size?: number | null;
  source?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
}

export interface ChecklistBridgeLinkRow {
  id: string;
  checklistItemId: string;
  taskId?: string;
  label: string;
  url: string;
  type?: string | null;
  description?: string | null;
  source?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
}

export interface ChecklistBridgeHistoryRow {
  id: string;
  checklistItemId: string;
  taskId?: string;
  type: string;
  message: string;
  actor?: string | null;
  createdAt?: string | null;
  source?: string | null;
  refId?: string | null;
  refType?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ChecklistBridgeLayoutRow {
  layoutStateId: string;
  checklistItemId: string;
  taskId?: string;
  expanded: boolean;
  lastOpenedAt?: string | null;
  updatedAt?: string | null;
}
