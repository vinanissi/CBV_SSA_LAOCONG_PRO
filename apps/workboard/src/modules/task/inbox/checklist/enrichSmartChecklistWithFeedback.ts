/**
 * PHASE_CHECKLIST_02_FEEDBACK — merge feedback stream into SmartChecklistItem read model.
 */

import type { ChecklistFeedbackByItemId } from './checklistFeedbackTypes';
import type { SmartChecklistItem } from './smartChecklistTypes';

export function enrichSmartChecklistWithFeedback(
  item: SmartChecklistItem,
  feedbackByItemId: ChecklistFeedbackByItemId | null | undefined,
): SmartChecklistItem {
  const rows = feedbackByItemId?.[item.id];
  const feedback = Array.isArray(rows) ? rows : [];
  return {
    ...item,
    feedback,
    responseCount: feedback.length,
  };
}

/** @deprecated Use enrichSmartChecklistListRuntime from enrichSmartChecklistRuntime.ts */
export function enrichSmartChecklistList(
  items: SmartChecklistItem[],
  feedbackByItemId: ChecklistFeedbackByItemId | null | undefined,
): SmartChecklistItem[] {
  return items.map((i) => enrichSmartChecklistWithFeedback(i, feedbackByItemId));
}
