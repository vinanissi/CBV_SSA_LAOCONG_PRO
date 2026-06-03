/**
 * PHASE_CHECKLIST_04_LINKS — merge links into SmartChecklistItem read model.
 */

import type { ChecklistLinkByItemId } from './checklistLinkTypes';
import type { SmartChecklistItem } from './smartChecklistTypes';

export function enrichSmartChecklistWithLinks(
  item: SmartChecklistItem,
  linksByItemId: ChecklistLinkByItemId | null | undefined,
): SmartChecklistItem {
  const rows = linksByItemId?.[item.id];
  const links = Array.isArray(rows) ? rows : [];
  return {
    ...item,
    links,
    linkCount: links.length,
  };
}
