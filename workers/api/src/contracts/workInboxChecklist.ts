/**
 * PHASE_WORK_INBOX_CHECKLIST_RUNTIME_V1 — checklist contracts (Worker ↔ GAS).
 */

export type ChecklistItemStatus = 'open' | 'done';

export interface WorkInboxChecklistItem {
  checklistId: string;
  taskId: string;
  title: string;
  status: ChecklistItemStatus;
  sortOrder: number;
  isRequired?: boolean;
  isDone: boolean;
  doneAt?: string;
  doneBy?: string;
  note?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

export interface WorkInboxChecklistListResponse {
  taskId: string;
  items: WorkInboxChecklistItem[];
  refreshPolicy?: 'CHECKLIST_ONLY' | 'SELECTIVE' | 'NONE';
}

export interface WorkInboxChecklistMutateResponse {
  item?: WorkInboxChecklistItem;
  checklistId?: string;
  deleted?: boolean;
  timelineEvent?: { eventType?: string; eventLabel?: string } | null;
  auditEvent?: { action?: string; auditId?: string } | null;
  refreshPolicy?: 'CHECKLIST_ONLY' | 'SELECTIVE' | 'NONE';
}

export interface WorkInboxChecklistCreateBody {
  title: string;
  sortOrder?: number;
  isRequired?: boolean;
  note?: string;
  traceId?: string;
}

export interface WorkInboxChecklistUpdateBody {
  title?: string;
  sortOrder?: number;
  note?: string;
  traceId?: string;
}

export interface WorkInboxChecklistToggleBody {
  isDone?: boolean;
  traceId?: string;
}
