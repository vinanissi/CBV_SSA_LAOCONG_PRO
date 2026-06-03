/**
 * PHASE_CHECKLIST_06 — merge sortOrder, archive overlay, layout expanded into SmartChecklistItem.
 */

import type { ChecklistCrudOverlayByItemId } from './checklistCrudOverlayTypes';
import type { ChecklistListLayoutState } from './checklistLayoutTypes';
import { isChecklistItemLayoutExpanded } from './checklistLayoutLocalStore';
import type { SmartChecklistItem } from './smartChecklistTypes';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

export interface ChecklistCrudLayoutEnrichmentInput {
  legacy?: WorkInboxChecklistItem | null;
  overlayByItemId?: ChecklistCrudOverlayByItemId | null;
  layout?: ChecklistListLayoutState | null;
  fallbackSortOrder?: number;
}

export function enrichSmartChecklistWithCrudLayout(
  item: SmartChecklistItem,
  input: ChecklistCrudLayoutEnrichmentInput,
): SmartChecklistItem {
  const overlay = input.overlayByItemId?.[item.id];
  const legacyNote = input.legacy?.note?.trim() || '';
  const overlayNote = overlay?.note?.trim() || '';
  const note = overlayNote || legacyNote || item.note?.trim() || '';
  const sortOrder =
    typeof input.legacy?.sortOrder === 'number' && Number.isFinite(input.legacy.sortOrder)
      ? input.legacy.sortOrder
      : (input.fallbackSortOrder ?? 0);
  const isArchived = Boolean(overlay?.isArchived);
  const layoutExpanded = input.layout
    ? isChecklistItemLayoutExpanded(input.layout, item.id)
    : false;

  return {
    ...item,
    note,
    sortOrder,
    isArchived,
    layoutExpanded,
  };
}
