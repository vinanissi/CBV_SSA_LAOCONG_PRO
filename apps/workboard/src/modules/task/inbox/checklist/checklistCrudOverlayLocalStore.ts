/**
 * PHASE_CHECKLIST_06 — note + archive overlay (local-first).
 */

import type { ChecklistCrudOverlayByItemId, ChecklistItemCrudOverlay } from './checklistCrudOverlayTypes';

const STORAGE_VERSION = 'v1';
const STORAGE_PREFIX = `cbv-checklist-crud-overlay:${STORAGE_VERSION}:`;

function storageKey(taskId: string): string {
  return `${STORAGE_PREFIX}${taskId.trim()}`;
}

export function loadChecklistCrudOverlayForTask(taskId: string): ChecklistCrudOverlayByItemId {
  const id = taskId?.trim();
  if (!id || typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ChecklistCrudOverlayByItemId;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveChecklistCrudOverlayForTask(
  taskId: string,
  overlay: ChecklistCrudOverlayByItemId,
): void {
  const id = taskId?.trim();
  if (!id || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(overlay));
  } catch {
    /* ignore */
  }
}

export function patchChecklistCrudOverlay(
  overlay: ChecklistCrudOverlayByItemId,
  checklistItemId: string,
  patch: Partial<ChecklistItemCrudOverlay>,
): ChecklistCrudOverlayByItemId {
  const id = checklistItemId.trim();
  if (!id) return overlay;
  const prev = overlay[id] ?? {};
  const next: ChecklistItemCrudOverlay = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return { ...overlay, [id]: next };
}

export function removeChecklistCrudOverlayForItem(
  overlay: ChecklistCrudOverlayByItemId,
  checklistItemId: string,
): ChecklistCrudOverlayByItemId {
  const id = checklistItemId.trim();
  if (!id || !overlay[id]) return overlay;
  const next = { ...overlay };
  delete next[id];
  return next;
}
