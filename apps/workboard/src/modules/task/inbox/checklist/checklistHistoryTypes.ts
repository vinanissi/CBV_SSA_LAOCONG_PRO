/**
 * PHASE_CHECKLIST_05_HISTORY — append-only activity log per checklist item.
 */

export type ChecklistHistoryEntryType =
  | 'checklist_status_changed'
  | 'feedback_added'
  | 'attachment_added'
  | 'attachment_removed'
  | 'link_added'
  | 'link_removed'
  | 'note_updated'
  | 'manual_history_note_added'
  | string;

export type ChecklistHistorySource =
  | 'local'
  | 'feedback_runtime'
  | 'attachment_runtime'
  | 'link_runtime'
  | 'checklist_runtime'
  | string;

export interface ChecklistHistoryEntry {
  id: string;
  checklistItemId: string;
  type: ChecklistHistoryEntryType;
  message: string;
  actor?: string | null;
  createdAt?: string | null;
  source?: ChecklistHistorySource;
  refId?: string | null;
  refType?: 'feedback' | 'attachment' | 'link' | 'checklist' | string | null;
  metadata?: Record<string, unknown>;
}

export type ChecklistHistoryByItemId = Record<string, ChecklistHistoryEntry[]>;
