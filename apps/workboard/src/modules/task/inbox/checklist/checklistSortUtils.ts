/**
 * PHASE_CHECKLIST_06 — sort checklist legacy rows by sortOrder.
 */

import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

export function sortChecklistItems(items: WorkInboxChecklistItem[]): WorkInboxChecklistItem[] {
  return [...items].sort((a, b) => {
    const ao = Number.isFinite(a.sortOrder) ? a.sortOrder : 0;
    const bo = Number.isFinite(b.sortOrder) ? b.sortOrder : 0;
    if (ao !== bo) return ao - bo;
    return a.checklistId.localeCompare(b.checklistId);
  });
}

export function legacyItemsById(items: WorkInboxChecklistItem[]): Record<string, WorkInboxChecklistItem> {
  const map: Record<string, WorkInboxChecklistItem> = {};
  for (const item of items) {
    const id = item.checklistId?.trim();
    if (id) map[id] = item;
  }
  return map;
}
