/**
 * PHASE_CHECKLIST_06 — layout state in localStorage (no schema migration).
 */

import type { ChecklistListLayoutState } from './checklistLayoutTypes';

const STORAGE_VERSION = 'v1';
const STORAGE_PREFIX = `cbv-checklist-layout:${STORAGE_VERSION}:`;

function storageKey(taskId: string): string {
  return `${STORAGE_PREFIX}${taskId.trim()}`;
}

function defaultState(taskId: string): ChecklistListLayoutState {
  return {
    taskId: taskId.trim(),
    expandedItemIds: [],
    archivedVisible: false,
    updatedAt: null,
  };
}

export function loadChecklistLayoutForTask(taskId: string): ChecklistListLayoutState {
  const id = taskId?.trim();
  if (!id || typeof localStorage === 'undefined') return defaultState(id || '');
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return defaultState(id);
    const parsed = JSON.parse(raw) as ChecklistListLayoutState;
    return {
      ...defaultState(id),
      ...parsed,
      taskId: id,
      expandedItemIds: Array.isArray(parsed.expandedItemIds)
        ? parsed.expandedItemIds.filter((x) => typeof x === 'string')
        : [],
      archivedVisible: Boolean(parsed.archivedVisible),
    };
  } catch {
    return defaultState(id);
  }
}

export function saveChecklistLayoutForTask(taskId: string, state: ChecklistListLayoutState): void {
  const id = taskId?.trim();
  if (!id || typeof localStorage === 'undefined') return;
  const next: ChecklistListLayoutState = {
    ...state,
    taskId: id,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function isChecklistItemLayoutExpanded(
  state: ChecklistListLayoutState,
  checklistItemId: string,
): boolean {
  return state.expandedItemIds.includes(checklistItemId);
}

export function setChecklistItemLayoutExpanded(
  state: ChecklistListLayoutState,
  checklistItemId: string,
  expanded: boolean,
): ChecklistListLayoutState {
  const id = checklistItemId.trim();
  if (!id) return state;
  const set = new Set(state.expandedItemIds);
  if (expanded) set.add(id);
  else set.delete(id);
  return { ...state, expandedItemIds: [...set] };
}

export function expandAllChecklistItems(
  state: ChecklistListLayoutState,
  itemIds: string[],
): ChecklistListLayoutState {
  return { ...state, expandedItemIds: [...new Set(itemIds.map((x) => x.trim()).filter(Boolean))] };
}

export function collapseAllChecklistItems(state: ChecklistListLayoutState): ChecklistListLayoutState {
  return { ...state, expandedItemIds: [] };
}
