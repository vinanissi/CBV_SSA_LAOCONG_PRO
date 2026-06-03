/**
 * PHASE_CHECKLIST_14 — per-task sync metadata in localStorage.
 */

import type { ChecklistSyncState } from './checklistMultiUserSyncTypes';

const STORAGE_PREFIX = 'cbv-checklist-sync:v1:';

function storageKey(taskId: string): string {
  return `${STORAGE_PREFIX}${taskId.trim()}`;
}

export function loadChecklistSyncMeta(taskId: string): Partial<ChecklistSyncState> | null {
  if (!taskId.trim() || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(taskId));
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ChecklistSyncState>;
  } catch {
    return null;
  }
}

export function saveChecklistSyncMeta(state: ChecklistSyncState): void {
  if (!state.taskId.trim() || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey(state.taskId), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function touchChecklistLocalUpdatedAt(taskId: string): string {
  const now = new Date().toISOString();
  const prev = loadChecklistSyncMeta(taskId);
  saveChecklistSyncMeta({
    taskId,
    syncStatus: prev?.syncStatus === 'synced' ? 'stale' : (prev?.syncStatus ?? 'idle'),
    lastSyncedAt: prev?.lastSyncedAt ?? null,
    remoteUpdatedAt: prev?.remoteUpdatedAt ?? null,
    localUpdatedAt: now,
    conflictDetected: prev?.conflictDetected ?? false,
    conflictMessage: prev?.conflictMessage ?? null,
    actor: prev?.actor ?? null,
    traceId: prev?.traceId ?? null,
  });
  return now;
}
