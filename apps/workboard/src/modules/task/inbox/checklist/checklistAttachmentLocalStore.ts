/**
 * PHASE_CHECKLIST_03_ATTACHMENTS — local attachment references (read-model first; no new tables).
 */

import type {
  ChecklistAttachment,
  ChecklistAttachmentByItemId,
} from './checklistAttachmentTypes';

const STORAGE_VERSION = 'v1';
const STORAGE_PREFIX = `cbv-checklist-attachment:${STORAGE_VERSION}:`;

function storageKey(taskId: string): string {
  return `${STORAGE_PREFIX}${taskId.trim()}`;
}

function safeParse(raw: string | null): ChecklistAttachmentByItemId {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ChecklistAttachmentByItemId;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function normalizeEntry(entry: unknown): ChecklistAttachment | null {
  if (!entry || typeof entry !== 'object') return null;
  const e = entry as ChecklistAttachment;
  const name = String(e.name ?? '').trim();
  const checklistItemId = String(e.checklistItemId ?? '').trim();
  const id = String(e.id ?? '').trim();
  if (!name || !checklistItemId || !id) return null;
  const sizeRaw = e.size;
  const size =
    sizeRaw == null
      ? null
      : Number.isFinite(Number(sizeRaw))
        ? Math.max(0, Math.floor(Number(sizeRaw)))
        : null;
  return {
    id,
    checklistItemId,
    name,
    url: e.url?.trim() || null,
    mimeType: e.mimeType?.trim() || null,
    size,
    source: e.source?.trim() || 'local',
    createdBy: e.createdBy?.trim() || null,
    createdAt: e.createdAt?.trim() || null,
  };
}

function sortAttachments(list: ChecklistAttachment[]): ChecklistAttachment[] {
  return [...list].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return ta - tb;
  });
}

export function loadChecklistAttachmentsForTask(taskId: string): ChecklistAttachmentByItemId {
  if (!taskId.trim()) return {};
  const key = storageKey(taskId);
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    const map = safeParse(raw);
    const out: ChecklistAttachmentByItemId = {};
    for (const [itemId, rows] of Object.entries(map)) {
      if (!Array.isArray(rows)) continue;
      const normalized = rows.map(normalizeEntry).filter(Boolean) as ChecklistAttachment[];
      if (normalized.length) out[itemId] = sortAttachments(normalized);
    }
    return out;
  } catch {
    return {};
  }
}

export function saveChecklistAttachmentsForTask(taskId: string, map: ChecklistAttachmentByItemId): void {
  const key = storageKey(taskId);
  try {
    if (typeof localStorage === 'undefined') return;
    const hasAny = Object.values(map).some((rows) => rows.length > 0);
    if (!hasAny) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    /* quota / private mode */
  }
}

export function makeChecklistAttachmentId(): string {
  return `ca-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function appendChecklistAttachment(
  map: ChecklistAttachmentByItemId,
  entry: ChecklistAttachment,
): ChecklistAttachmentByItemId {
  const itemId = entry.checklistItemId;
  const prev = map[itemId] ?? [];
  return { ...map, [itemId]: sortAttachments([...prev, entry]) };
}

export function removeChecklistAttachmentsForItem(
  map: ChecklistAttachmentByItemId,
  checklistItemId: string,
): ChecklistAttachmentByItemId {
  if (!map[checklistItemId]) return map;
  const next = { ...map };
  delete next[checklistItemId];
  return next;
}

export function removeChecklistAttachment(
  map: ChecklistAttachmentByItemId,
  checklistItemId: string,
  attachmentId: string,
): ChecklistAttachmentByItemId {
  const prev = map[checklistItemId];
  if (!prev?.length) return map;
  const nextList = prev.filter((a) => a.id !== attachmentId);
  if (nextList.length === 0) {
    return removeChecklistAttachmentsForItem(map, checklistItemId);
  }
  return { ...map, [checklistItemId]: nextList };
}
