/**
 * PHASE_CHECKLIST_03_ATTACHMENTS — merge attachment refs into SmartChecklistItem.
 */

import type { ChecklistAttachmentByItemId } from './checklistAttachmentTypes';
import type { SmartChecklistItem } from './smartChecklistTypes';

export function enrichSmartChecklistWithAttachments(
  item: SmartChecklistItem,
  attachmentsByItemId: ChecklistAttachmentByItemId | null | undefined,
): SmartChecklistItem {
  const rows = attachmentsByItemId?.[item.id];
  const attachments = Array.isArray(rows) ? rows : [];
  return {
    ...item,
    attachments,
    attachmentCount: attachments.length,
  };
}
