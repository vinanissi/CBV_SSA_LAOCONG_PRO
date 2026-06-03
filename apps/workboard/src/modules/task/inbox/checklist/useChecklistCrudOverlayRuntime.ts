import { useCallback, useEffect, useState } from 'react';
import {
  loadChecklistCrudOverlayForTask,
  patchChecklistCrudOverlay,
  removeChecklistCrudOverlayForItem,
  saveChecklistCrudOverlayForTask,
} from './checklistCrudOverlayLocalStore';
import type { ChecklistCrudOverlayByItemId } from './checklistCrudOverlayTypes';

export interface UseChecklistCrudOverlayRuntimeOptions {
  taskId: string;
}

export function useChecklistCrudOverlayRuntime(options: UseChecklistCrudOverlayRuntimeOptions) {
  const taskId = options.taskId?.trim() || '';
  const [overlayByItemId, setOverlayByItemId] = useState<ChecklistCrudOverlayByItemId>({});

  useEffect(() => {
    if (!taskId) {
      setOverlayByItemId({});
      return;
    }
    setOverlayByItemId(loadChecklistCrudOverlayForTask(taskId));
  }, [taskId]);

  const persist = useCallback(
    (next: ChecklistCrudOverlayByItemId) => {
      setOverlayByItemId(next);
      if (taskId) saveChecklistCrudOverlayForTask(taskId, next);
    },
    [taskId],
  );

  const setNote = useCallback(
    (checklistItemId: string, note: string) => {
      persist(patchChecklistCrudOverlay(overlayByItemId, checklistItemId, { note: note.trim() }));
    },
    [overlayByItemId, persist],
  );

  const setArchived = useCallback(
    (checklistItemId: string, isArchived: boolean) => {
      persist(patchChecklistCrudOverlay(overlayByItemId, checklistItemId, { isArchived }));
    },
    [overlayByItemId, persist],
  );

  const clearOverlayForItem = useCallback(
    (checklistItemId: string) => {
      persist(removeChecklistCrudOverlayForItem(overlayByItemId, checklistItemId));
    },
    [overlayByItemId, persist],
  );

  return {
    overlayByItemId,
    setNote,
    setArchived,
    clearOverlayForItem,
  };
}
