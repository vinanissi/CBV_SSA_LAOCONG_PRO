/**
 * PHASE_CHECKLIST_02_FEEDBACK — session-local feedback store (read-model first; no new tables).
 * Keyed by taskId; reversible; cleared when checklist item deleted.
 */

import type { ChecklistFeedback, ChecklistFeedbackByItemId } from './checklistFeedbackTypes';

const STORAGE_VERSION = 'v1';
const STORAGE_PREFIX = `cbv-checklist-feedback:${STORAGE_VERSION}:`;

function storageKey(taskId: string): string {
  return `${STORAGE_PREFIX}${taskId.trim()}`;
}

function safeParse(raw: string | null): ChecklistFeedbackByItemId {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ChecklistFeedbackByItemId;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function normalizeEntry(entry: unknown): ChecklistFeedback | null {
  if (!entry || typeof entry !== 'object') return null;
  const e = entry as ChecklistFeedback;
  const message = String(e.message ?? '').trim();
  if (!message) return null;
  const checklistItemId = String(e.checklistItemId ?? '').trim();
  const id = String(e.id ?? '').trim();
  if (!checklistItemId || !id) return null;
  return {
    id,
    checklistItemId,
    message,
    author: e.author?.trim() || null,
    createdAt: e.createdAt?.trim() || null,
  };
}

function sortFeedback(list: ChecklistFeedback[]): ChecklistFeedback[] {
  return [...list].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return ta - tb;
  });
}

export function loadChecklistFeedbackForTask(taskId: string): ChecklistFeedbackByItemId {
  if (!taskId.trim()) return {};
  const key = storageKey(taskId);
  try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      const map = safeParse(raw);
      const out: ChecklistFeedbackByItemId = {};
      for (const [itemId, rows] of Object.entries(map)) {
        if (!Array.isArray(rows)) continue;
        const normalized = rows.map(normalizeEntry).filter(Boolean) as ChecklistFeedback[];
        if (normalized.length) out[itemId] = sortFeedback(normalized);
      }
    return out;
  } catch {
    return {};
  }
}

export function saveChecklistFeedbackForTask(taskId: string, map: ChecklistFeedbackByItemId): void {
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
    /* quota / private mode — in-memory only for session via hook state */
  }
}

export function makeChecklistFeedbackId(): string {
  return `cf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function appendChecklistFeedback(
  map: ChecklistFeedbackByItemId,
  entry: ChecklistFeedback,
): ChecklistFeedbackByItemId {
  const itemId = entry.checklistItemId;
  const prev = map[itemId] ?? [];
  return { ...map, [itemId]: sortFeedback([...prev, entry]) };
}

export function removeChecklistFeedbackForItem(
  map: ChecklistFeedbackByItemId,
  checklistItemId: string,
): ChecklistFeedbackByItemId {
  if (!map[checklistItemId]) return map;
  const next = { ...map };
  delete next[checklistItemId];
  return next;
}
