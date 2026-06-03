/**
 * PHASE_CHECKLIST_11 — load satellite checklist data via Sheet bridge.
 */

import { callChecklistBridge } from './checklistBridgeApi';
import type {
  ChecklistBridgeAttachmentRow,
  ChecklistBridgeFeedbackRow,
  ChecklistBridgeHistoryRow,
  ChecklistBridgeLinkRow,
} from './checklistBridgeTypes';
import type { ChecklistAttachment, ChecklistAttachmentByItemId } from './checklistAttachmentTypes';
import type { ChecklistFeedback, ChecklistFeedbackByItemId } from './checklistFeedbackTypes';
import type { ChecklistHistoryByItemId, ChecklistHistoryEntry } from './checklistHistoryTypes';
import type { ChecklistLink, ChecklistLinkByItemId } from './checklistLinkTypes';

function groupByItemId<T extends { checklistItemId: string }>(
  rows: T[],
): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const row of rows) {
    const id = row.checklistItemId.trim();
    if (!id) continue;
    if (!out[id]) out[id] = [];
    out[id].push(row);
  }
  return out;
}

export async function loadChecklistFeedbackFromBridge(
  taskId: string,
): Promise<ChecklistFeedbackByItemId | null> {
  const res = await callChecklistBridge<{ feedback: ChecklistBridgeFeedbackRow[] }>(
    taskId,
    'readFeedback',
    { taskId },
  );
  if (!res.ok || !res.data) return null;
  const grouped = groupByItemId(res.data.feedback ?? []);
  const out: ChecklistFeedbackByItemId = {};
  for (const [itemId, rows] of Object.entries(grouped)) {
    out[itemId] = rows.map(
      (r): ChecklistFeedback => ({
        id: r.id,
        checklistItemId: r.checklistItemId,
        message: r.message,
        author: r.author,
        createdAt: r.createdAt,
      }),
    );
  }
  return out;
}

export async function loadChecklistAttachmentsFromBridge(
  taskId: string,
): Promise<ChecklistAttachmentByItemId | null> {
  const res = await callChecklistBridge<{ attachments: ChecklistBridgeAttachmentRow[] }>(
    taskId,
    'readAttachmentMetadata',
    { taskId },
  );
  if (!res.ok || !res.data) return null;
  const grouped = groupByItemId(res.data.attachments ?? []);
  const out: ChecklistAttachmentByItemId = {};
  for (const [itemId, rows] of Object.entries(grouped)) {
    out[itemId] = rows.map(
      (r): ChecklistAttachment => ({
        id: r.id,
        checklistItemId: r.checklistItemId,
        name: r.name,
        url: r.url,
        mimeType: r.mimeType,
        size: r.size,
        source: r.source ?? (r.driveFileId ? 'drive' : 'url'),
        createdBy: r.createdBy,
        createdAt: r.createdAt,
      }),
    );
  }
  return out;
}

export async function loadChecklistLinksFromBridge(
  taskId: string,
): Promise<ChecklistLinkByItemId | null> {
  const res = await callChecklistBridge<{ links: ChecklistBridgeLinkRow[] }>(
    taskId,
    'readLinks',
    { taskId },
  );
  if (!res.ok || !res.data) return null;
  const grouped = groupByItemId(res.data.links ?? []);
  const out: ChecklistLinkByItemId = {};
  for (const [itemId, rows] of Object.entries(grouped)) {
    out[itemId] = rows.map(
      (r): ChecklistLink => ({
        id: r.id,
        checklistItemId: r.checklistItemId,
        label: r.label,
        url: r.url,
        type: r.type ?? undefined,
        description: r.description,
        source: r.source ?? undefined,
        createdBy: r.createdBy,
        createdAt: r.createdAt,
      }),
    );
  }
  return out;
}

export async function loadChecklistHistoryFromBridge(
  taskId: string,
): Promise<ChecklistHistoryByItemId | null> {
  const res = await callChecklistBridge<{ history: ChecklistBridgeHistoryRow[] }>(
    taskId,
    'readHistory',
    { taskId },
  );
  if (!res.ok || !res.data) return null;
  const grouped = groupByItemId(res.data.history ?? []);
  const out: ChecklistHistoryByItemId = {};
  for (const [itemId, rows] of Object.entries(grouped)) {
    out[itemId] = rows.map(
      (r): ChecklistHistoryEntry => ({
        id: r.id,
        checklistItemId: r.checklistItemId,
        type: r.type,
        message: r.message,
        actor: r.actor,
        createdAt: r.createdAt,
        source: r.source ?? 'checklist_bridge',
        refId: r.refId,
        refType: r.refType ?? undefined,
        metadata: r.metadata,
      }),
    );
  }
  return out;
}
