/**
 * PHASE_CHECKLIST_03B_INLINE_ACTIONS — derive inline actions from runtime state (no storage).
 */

import type { ChecklistInlineAction } from './checklistInlineActionTypes';
import type { SmartChecklistItem } from './smartChecklistTypes';

export function deriveChecklistInlineActions(
  item: SmartChecklistItem,
  allowMutate = true,
): ChecklistInlineAction[] {
  const id = item.id?.trim() || '';
  const feedbackCount = item.responseCount ?? item.feedback?.length ?? 0;
  const attachmentCount = item.attachmentCount ?? item.attachments?.length ?? 0;
  const linkCount = item.linkCount ?? item.links?.length ?? 0;
  const historyCount = item.historyCount ?? item.history?.length ?? 0;

  const feedbackAction: ChecklistInlineAction = {
    id: `${id}-inline-feedback`,
    checklistItemId: id,
    type: allowMutate ? 'add_feedback' : 'view_feedback',
    label: 'Phản hồi',
    enabled: Boolean(id),
    reasonDisabled: id ? null : 'Thiếu mã mục checklist',
  };

  const attachmentAction: ChecklistInlineAction = {
    id: `${id}-inline-attachment`,
    checklistItemId: id,
    type: allowMutate ? 'add_attachment' : 'view_attachment',
    label: 'Tài liệu',
    enabled: Boolean(id),
    reasonDisabled: id ? null : 'Thiếu mã mục checklist',
  };

  const linkAction: ChecklistInlineAction = {
    id: `${id}-inline-link`,
    checklistItemId: id,
    type: allowMutate ? 'add_link' : 'view_link',
    label: 'Liên kết',
    enabled: Boolean(id),
    reasonDisabled: id ? null : 'Thiếu mã mục checklist',
  };

  const historyAction: ChecklistInlineAction = {
    id: `${id}-inline-history`,
    checklistItemId: id,
    type: allowMutate ? 'add_history' : 'view_history',
    label: 'Lịch sử',
    enabled: Boolean(id),
    reasonDisabled: id ? null : 'Thiếu mã mục checklist',
  };

  return [
    { ...feedbackAction, label: `${feedbackAction.label} ${feedbackCount}` },
    { ...attachmentAction, label: `${attachmentAction.label} ${attachmentCount}` },
    { ...linkAction, label: `${linkAction.label} ${linkCount}` },
    { ...historyAction, label: `${historyAction.label} ${historyCount}` },
  ];
}
