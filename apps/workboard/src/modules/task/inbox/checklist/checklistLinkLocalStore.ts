/**
 * PHASE_CHECKLIST_04_LINKS — local link references (read-model first; no new tables).
 */

import type { ChecklistLink, ChecklistLinkByItemId } from './checklistLinkTypes';
import { inferChecklistLinkType, isValidChecklistLinkUrl } from './checklistLinkUtils';

const STORAGE_VERSION = 'v1';
const STORAGE_PREFIX = `cbv-checklist-link:${STORAGE_VERSION}:`;

function storageKey(taskId: string): string {
  return `${STORAGE_PREFIX}${taskId.trim()}`;
}

function safeParse(raw: string | null): ChecklistLinkByItemId {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ChecklistLinkByItemId;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function normalizeEntry(entry: unknown): ChecklistLink | null {
  if (!entry || typeof entry !== 'object') return null;
  const e = entry as ChecklistLink;
  const label = String(e.label ?? '').trim();
  const url = String(e.url ?? '').trim();
  const checklistItemId = String(e.checklistItemId ?? '').trim();
  const id = String(e.id ?? '').trim();
  if (!label || !checklistItemId || !id) return null;
  const type = e.type?.trim() || (url ? inferChecklistLinkType(url) : 'external');
  return {
    id,
    checklistItemId,
    label,
    url,
    type,
    description: e.description?.trim() || null,
    source: e.source?.trim() || 'manual',
    createdBy: e.createdBy?.trim() || null,
    createdAt: e.createdAt?.trim() || null,
  };
}

function sortLinks(list: ChecklistLink[]): ChecklistLink[] {
  return [...list].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return ta - tb;
  });
}

export function loadChecklistLinksForTask(taskId: string): ChecklistLinkByItemId {
  if (!taskId.trim()) return {};
  const key = storageKey(taskId);
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    const map = safeParse(raw);
    const out: ChecklistLinkByItemId = {};
    for (const [itemId, rows] of Object.entries(map)) {
      if (!Array.isArray(rows)) continue;
      const normalized = rows.map(normalizeEntry).filter(Boolean) as ChecklistLink[];
      if (normalized.length) out[itemId] = sortLinks(normalized);
    }
    return out;
  } catch {
    return {};
  }
}

export function saveChecklistLinksForTask(taskId: string, map: ChecklistLinkByItemId): void {
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

export function makeChecklistLinkId(): string {
  return `clnk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function appendChecklistLink(
  map: ChecklistLinkByItemId,
  entry: ChecklistLink,
): ChecklistLinkByItemId {
  const itemId = entry.checklistItemId;
  const prev = map[itemId] ?? [];
  return { ...map, [itemId]: sortLinks([...prev, entry]) };
}

export function removeChecklistLinksForItem(
  map: ChecklistLinkByItemId,
  checklistItemId: string,
): ChecklistLinkByItemId {
  if (!map[checklistItemId]) return map;
  const next = { ...map };
  delete next[checklistItemId];
  return next;
}

export function removeChecklistLink(
  map: ChecklistLinkByItemId,
  checklistItemId: string,
  linkId: string,
): ChecklistLinkByItemId {
  const prev = map[checklistItemId];
  if (!prev?.length) return map;
  const nextList = prev.filter((l) => l.id !== linkId);
  if (nextList.length === 0) return removeChecklistLinksForItem(map, checklistItemId);
  return { ...map, [checklistItemId]: nextList };
}

/** Allow register with label only (disabled open) or label+url. */
export function canOpenChecklistLink(link: ChecklistLink): boolean {
  return isValidChecklistLinkUrl(link.url);
}
