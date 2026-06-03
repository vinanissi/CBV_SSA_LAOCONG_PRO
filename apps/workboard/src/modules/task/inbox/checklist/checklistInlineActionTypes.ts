/**
 * PHASE_CHECKLIST_03B_INLINE_ACTIONS — derived UI affordances (not persisted).
 */

export type ChecklistInlineActionType =
  | 'add_feedback'
  | 'view_feedback'
  | 'add_attachment'
  | 'view_attachment'
  | string;

export interface ChecklistInlineAction {
  id: string;
  checklistItemId: string;
  type: ChecklistInlineActionType;
  label: string;
  enabled: boolean;
  reasonDisabled?: string | null;
}
