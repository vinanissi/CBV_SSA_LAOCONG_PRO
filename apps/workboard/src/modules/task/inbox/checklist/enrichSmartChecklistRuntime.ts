/**
 * Compose Smart Checklist enrichments (feedback + attachments).
 */

import type { ChecklistAttachmentByItemId } from './checklistAttachmentTypes';
import type { ChecklistFeedbackByItemId } from './checklistFeedbackTypes';
import type { ChecklistLinkByItemId } from './checklistLinkTypes';
import { enrichSmartChecklistWithAttachments } from './enrichSmartChecklistWithAttachments';
import { enrichSmartChecklistWithFeedback } from './enrichSmartChecklistWithFeedback';
import { enrichSmartChecklistWithInlineActions } from './enrichSmartChecklistWithInlineActions';
import { enrichSmartChecklistWithHistory } from './enrichSmartChecklistWithHistory';
import { enrichSmartChecklistWithLinks } from './enrichSmartChecklistWithLinks';
import type { ChecklistCrudOverlayByItemId } from './checklistCrudOverlayTypes';
import { enrichSmartChecklistWithCrudLayout } from './enrichSmartChecklistWithCrudLayout';
import type { ChecklistHistoryByItemId } from './checklistHistoryTypes';
import type { ChecklistListLayoutState } from './checklistLayoutTypes';
import type { SmartChecklistItem } from './smartChecklistTypes';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

export interface SmartChecklistEnrichmentMaps {
  feedbackByItemId?: ChecklistFeedbackByItemId | null;
  attachmentsByItemId?: ChecklistAttachmentByItemId | null;
  linksByItemId?: ChecklistLinkByItemId | null;
  historyByItemId?: ChecklistHistoryByItemId | null;
  legacyById?: Record<string, WorkInboxChecklistItem> | null;
  overlayByItemId?: ChecklistCrudOverlayByItemId | null;
  layout?: ChecklistListLayoutState | null;
  allowMutate?: boolean;
}

export function enrichSmartChecklistItem(
  item: SmartChecklistItem,
  maps: SmartChecklistEnrichmentMaps,
): SmartChecklistItem {
  let next = enrichSmartChecklistWithFeedback(item, maps.feedbackByItemId);
  next = enrichSmartChecklistWithAttachments(next, maps.attachmentsByItemId);
  next = enrichSmartChecklistWithLinks(next, maps.linksByItemId);
  next = enrichSmartChecklistWithHistory(next, maps.historyByItemId);
  next = enrichSmartChecklistWithInlineActions(next, maps.allowMutate !== false);
  return next;
}

export function enrichSmartChecklistListRuntime(
  items: SmartChecklistItem[],
  maps: SmartChecklistEnrichmentMaps,
): SmartChecklistItem[] {
  return items.map((item, index) => {
    const next = enrichSmartChecklistItem(item, maps);
    return enrichSmartChecklistWithCrudLayout(next, {
      legacy: maps.legacyById?.[item.id] ?? null,
      overlayByItemId: maps.overlayByItemId,
      layout: maps.layout,
      fallbackSortOrder: index + 1,
    });
  });
}
