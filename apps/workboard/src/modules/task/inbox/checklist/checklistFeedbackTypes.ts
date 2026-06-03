/**
 * PHASE_CHECKLIST_02_FEEDBACK — operational processing notes per checklist item.
 */

export interface ChecklistFeedback {
  id: string;
  checklistItemId: string;
  author?: string | null;
  message: string;
  createdAt?: string | null;
}

export type ChecklistFeedbackByItemId = Record<string, ChecklistFeedback[]>;
