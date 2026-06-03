/**
 * PHASE_CHECKLIST_01_SMART_CHECKLIST — legacy Work Inbox checklist → SmartChecklistItem.
 * Non-destructive, backward-compatible, null-safe, idempotent.
 */

import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';
import type { SmartChecklistItem, SmartChecklistItemStatus } from './smartChecklistTypes';

function normalizeStatus(item: WorkInboxChecklistItem): SmartChecklistItemStatus {
  const raw = (item.status || '').trim().toLowerCase();
  if (raw === 'blocked' || raw === 'skipped') return raw;
  if (item.isDone || raw === 'done') return 'done';
  return 'todo';
}

function safeCount(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

/** Map worker/legacy row to Smart Checklist foundation shape (placeholder counts default to 0). */
export function adaptToSmartChecklistItem(item: WorkInboxChecklistItem): SmartChecklistItem {
  const extended = item as WorkInboxChecklistItem & {
    responseCount?: number;
    attachmentCount?: number;
    linkCount?: number;
  };

  return {
    id: item.checklistId?.trim() || '',
    taskId: item.taskId?.trim() || '',
    title: item.title?.trim() || 'Mục checklist',
    status: normalizeStatus(item),
    note: item.note?.trim() || '',
    responseCount: safeCount(extended.responseCount),
    attachmentCount: safeCount(extended.attachmentCount),
    linkCount: safeCount(extended.linkCount),
    updatedBy: item.updatedBy?.trim() || null,
    updatedAt: item.updatedAt?.trim() || null,
  };
}

export function adaptChecklistItems(items: WorkInboxChecklistItem[]): SmartChecklistItem[] {
  return items.map(adaptToSmartChecklistItem);
}
