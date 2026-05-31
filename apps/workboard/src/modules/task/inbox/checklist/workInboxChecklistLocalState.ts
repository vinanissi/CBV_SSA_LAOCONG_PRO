import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

export function upsertChecklistItem(
  items: WorkInboxChecklistItem[],
  item: WorkInboxChecklistItem,
): WorkInboxChecklistItem[] {
  const idx = items.findIndex((i) => i.checklistId === item.checklistId);
  if (idx < 0) {
    return [...items, item].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const next = items.slice();
  next[idx] = item;
  return next.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function removeChecklistItem(
  items: WorkInboxChecklistItem[],
  checklistId: string,
): WorkInboxChecklistItem[] {
  return items.filter((i) => i.checklistId !== checklistId);
}
