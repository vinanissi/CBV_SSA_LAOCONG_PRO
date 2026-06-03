/**
 * PHASE_WORK_INBOX_CHECKLIST_RUNTIME_V1 — FE types (aligned with Worker contracts).
 */

export type ChecklistItemStatus = 'open' | 'done';

export interface WorkInboxChecklistItem {
  checklistId: string;
  taskId: string;
  title: string;
  status: ChecklistItemStatus;
  sortOrder: number;
  isDone: boolean;
  isRequired?: boolean;
  note?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface WorkInboxChecklistListResult {
  ok: boolean;
  items: WorkInboxChecklistItem[];
  error?: string;
}

export interface WorkInboxChecklistMutateResult {
  ok: boolean;
  item?: WorkInboxChecklistItem;
  error?: string;
}
