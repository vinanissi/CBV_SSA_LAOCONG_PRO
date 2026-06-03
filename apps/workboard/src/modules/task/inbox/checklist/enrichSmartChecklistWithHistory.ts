/**
 * PHASE_CHECKLIST_05_HISTORY — merge history into SmartChecklistItem.
 */

import { latestHistoryAt } from './checklistHistoryLocalStore';
import type { ChecklistHistoryByItemId } from './checklistHistoryTypes';
import type { SmartChecklistItem } from './smartChecklistTypes';

export function enrichSmartChecklistWithHistory(
  item: SmartChecklistItem,
  historyByItemId: ChecklistHistoryByItemId | null | undefined,
): SmartChecklistItem {
  const rows = historyByItemId?.[item.id];
  const history = Array.isArray(rows) ? rows : [];
  return {
    ...item,
    history,
    historyCount: history.length,
    latestHistoryAt: latestHistoryAt(history),
  };
}
