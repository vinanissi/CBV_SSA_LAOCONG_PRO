/**
 * PHASE_CHECKLIST_14 — load remote checklist snapshot via Sheet/Drive bridge.
 */

import { callChecklistBridge } from './checklistBridgeApi';
import type { ChecklistBridgeLayoutRow } from './checklistBridgeTypes';
import {
  loadChecklistAttachmentsFromBridge,
  loadChecklistFeedbackFromBridge,
  loadChecklistHistoryFromBridge,
  loadChecklistLinksFromBridge,
} from './checklistBridgeSatelliteLoaders';
import type { ChecklistRemoteSnapshot } from './checklistMultiUserSyncTypes';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

function maxIso(values: (string | null | undefined)[]): string | null {
  let best: string | null = null;
  for (const v of values) {
    const s = String(v || '').trim();
    if (!s) continue;
    if (!best || s.localeCompare(best) > 0) best = s;
  }
  return best;
}

function countMapRows(map: Record<string, unknown[]> | null | undefined): number {
  if (!map) return 0;
  return Object.values(map).reduce((n, rows) => n + (Array.isArray(rows) ? rows.length : 0), 0);
}

export function buildChecklistSnapshotSignature(input: {
  items: WorkInboxChecklistItem[];
  feedbackCount: number;
  attachmentCount: number;
  linkCount: number;
  historyCount: number;
  layoutExpandedCount: number;
}): string {
  const itemPart = [...input.items]
    .map((i) => `${i.checklistId}:${i.updatedAt ?? ''}:${i.title}:${i.isDone ? 1 : 0}:${i.sortOrder}`)
    .sort()
    .join('|');
  return `${itemPart}#f${input.feedbackCount}a${input.attachmentCount}l${input.linkCount}h${input.historyCount}y${input.layoutExpandedCount}`;
}

export async function loadChecklistLayoutFromBridge(
  taskId: string,
): Promise<{ expandedItemIds: string[]; updatedAt: string | null } | null> {
  const res = await callChecklistBridge<{ layoutStates: ChecklistBridgeLayoutRow[] }>(
    taskId,
    'readLayoutState',
    { taskId },
  );
  if (!res.ok || !res.data) return null;
  const expanded = (res.data.layoutStates ?? [])
    .filter((r) => r.expanded)
    .map((r) => r.checklistItemId)
    .filter(Boolean);
  const updatedAt = maxIso((res.data.layoutStates ?? []).map((r) => r.updatedAt));
  return { expandedItemIds: expanded, updatedAt };
}

export async function fetchChecklistRemoteSnapshot(taskId: string): Promise<{
  ok: boolean;
  snapshot: ChecklistRemoteSnapshot | null;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const tid = taskId.trim();
  if (!tid) {
    return { ok: false, snapshot: null, errors: ['taskId is required'], warnings };
  }

  const itemsRes = await callChecklistBridge<{ items: WorkInboxChecklistItem[] }>(
    tid,
    'readChecklistItems',
    { taskId: tid },
  );
  if (!itemsRes.ok) {
    errors.push(itemsRes.message ?? 'readChecklistItems failed');
    return { ok: false, snapshot: null, errors, warnings };
  }

  const [feedbackByItemId, attachmentsByItemId, linksByItemId, historyByItemId, layout] =
    await Promise.all([
      loadChecklistFeedbackFromBridge(tid),
      loadChecklistAttachmentsFromBridge(tid),
      loadChecklistLinksFromBridge(tid),
      loadChecklistHistoryFromBridge(tid),
      loadChecklistLayoutFromBridge(tid),
    ]);

  if (!layout) warnings.push('Layout state not loaded from bridge');

  const items = itemsRes.data?.items ?? [];
  const feedbackCount = countMapRows(feedbackByItemId ?? undefined);
  const attachmentCount = countMapRows(attachmentsByItemId ?? undefined);
  const linkCount = countMapRows(linksByItemId ?? undefined);
  const historyCount = countMapRows(historyByItemId ?? undefined);
  const layoutExpandedItemIds = layout?.expandedItemIds ?? [];

  const remoteUpdatedAt = maxIso([
    ...items.map((i) => i.updatedAt),
    maxIso(
      Object.values(feedbackByItemId ?? {})
        .flat()
        .map((r) => r.createdAt),
    ),
    maxIso(
      Object.values(attachmentsByItemId ?? {})
        .flat()
        .map((r) => r.createdAt),
    ),
    maxIso(
      Object.values(linksByItemId ?? {})
        .flat()
        .map((r) => r.createdAt),
    ),
    maxIso(
      Object.values(historyByItemId ?? {})
        .flat()
        .map((r) => r.createdAt),
    ),
    layout?.updatedAt,
  ]);

  const signature = buildChecklistSnapshotSignature({
    items,
    feedbackCount,
    attachmentCount,
    linkCount,
    historyCount,
    layoutExpandedCount: layoutExpandedItemIds.length,
  });

  return {
    ok: true,
    snapshot: {
      taskId: tid,
      items,
      feedbackByItemId: feedbackByItemId ?? {},
      attachmentsByItemId: attachmentsByItemId ?? {},
      linksByItemId: linksByItemId ?? {},
      historyByItemId: historyByItemId ?? {},
      layoutExpandedItemIds,
      remoteUpdatedAt,
      signature,
    },
    errors,
    warnings,
  };
}
