/**
 * PHASE_CHECKLIST_05_HISTORY — append-only local history (read-model first).
 */

import type {
  ChecklistHistoryByItemId,
  ChecklistHistoryEntry,
} from './checklistHistoryTypes';

const STORAGE_VERSION = 'v1';
const STORAGE_PREFIX = `cbv-checklist-history:${STORAGE_VERSION}:`;

function storageKey(taskId: string): string {
  return `${STORAGE_PREFIX}${taskId.trim()}`;
}

function safeParse(raw: string | null): ChecklistHistoryByItemId {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ChecklistHistoryByItemId;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function normalizeEntry(entry: unknown): ChecklistHistoryEntry | null {
  if (!entry || typeof entry !== 'object') return null;
  const e = entry as ChecklistHistoryEntry;
  const message = String(e.message ?? '').trim();
  const checklistItemId = String(e.checklistItemId ?? '').trim();
  const id = String(e.id ?? '').trim();
  const type = String(e.type ?? 'manual_history_note_added').trim();
  if (!message || !checklistItemId || !id) return null;
  return {
    id,
    checklistItemId,
    type,
    message,
    actor: e.actor?.trim() || null,
    createdAt: e.createdAt?.trim() || null,
    source: e.source?.trim() || 'local',
    refId: e.refId?.trim() || null,
    refType: e.refType?.trim() || null,
    metadata:
      e.metadata && typeof e.metadata === 'object' && !Array.isArray(e.metadata)
        ? e.metadata
        : undefined,
  };
}

function sortHistory(list: ChecklistHistoryEntry[]): ChecklistHistoryEntry[] {
  return [...list].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return ta - tb;
  });
}

export function loadChecklistHistoryForTask(taskId: string): ChecklistHistoryByItemId {
  if (!taskId.trim()) return {};
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey(taskId)) : null;
    const map = safeParse(raw);
    const out: ChecklistHistoryByItemId = {};
    for (const [itemId, rows] of Object.entries(map)) {
      if (!Array.isArray(rows)) continue;
      const normalized = rows.map(normalizeEntry).filter(Boolean) as ChecklistHistoryEntry[];
      if (normalized.length) out[itemId] = sortHistory(normalized);
    }
    return out;
  } catch {
    return {};
  }
}

export function saveChecklistHistoryForTask(taskId: string, map: ChecklistHistoryByItemId): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const key = storageKey(taskId);
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

export function makeChecklistHistoryId(): string {
  return `chist-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function appendChecklistHistoryEntry(
  map: ChecklistHistoryByItemId,
  entry: ChecklistHistoryEntry,
): ChecklistHistoryByItemId {
  const itemId = entry.checklistItemId;
  const prev = map[itemId] ?? [];
  return { ...map, [itemId]: sortHistory([...prev, entry]) };
}

export function removeChecklistHistoryForItem(
  map: ChecklistHistoryByItemId,
  checklistItemId: string,
): ChecklistHistoryByItemId {
  if (!map[checklistItemId]) return map;
  const next = { ...map };
  delete next[checklistItemId];
  return next;
}

export function latestHistoryAt(entries: ChecklistHistoryEntry[]): string | null {
  if (!entries.length) return null;
  const last = entries[entries.length - 1];
  return last.createdAt?.trim() || null;
}
