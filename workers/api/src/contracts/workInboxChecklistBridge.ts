/**
 * PHASE_CHECKLIST_11 — Checklist Sheet/Drive bridge (Worker ↔ GAS).
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
  | 'ensureChecklistItemDriveFolder';

export interface ChecklistBridgeRequestBody {
  method: ChecklistBridgeMethod;
  taskId?: string;
  checklistItemId?: string;
  checklistId?: string;
  templateId?: string;
  traceId?: string;
  [key: string]: unknown;
}

export interface ChecklistBridgeResult<T = unknown> {
  ok: boolean;
  status: ChecklistBridgeStatus;
  traceId: string;
  message?: string;
  data?: T;
  warnings?: string[];
  errors?: string[];
}
