import { useCallback, useEffect, useState } from 'react';
import {
  collapseAllChecklistItems,
  expandAllChecklistItems,
  isChecklistItemLayoutExpanded,
  loadChecklistLayoutForTask,
  saveChecklistLayoutForTask,
  setChecklistItemLayoutExpanded,
} from './checklistLayoutLocalStore';
import type { ChecklistListLayoutState } from './checklistLayoutTypes';

export interface UseChecklistLayoutRuntimeOptions {
  taskId: string;
}

export function useChecklistLayoutRuntime(options: UseChecklistLayoutRuntimeOptions) {
  const taskId = options.taskId?.trim() || '';
  const [layout, setLayout] = useState<ChecklistListLayoutState>(() =>
    loadChecklistLayoutForTask(taskId),
  );

  useEffect(() => {
    if (!taskId) {
      setLayout({ taskId: '', expandedItemIds: [], archivedVisible: false });
      return;
    }
    setLayout(loadChecklistLayoutForTask(taskId));
  }, [taskId]);

  const persist = useCallback(
    (next: ChecklistListLayoutState) => {
      setLayout(next);
      if (taskId) saveChecklistLayoutForTask(taskId, next);
    },
    [taskId],
  );

  const isExpanded = useCallback(
    (checklistItemId: string) => isChecklistItemLayoutExpanded(layout, checklistItemId),
    [layout],
  );

  const setItemExpanded = useCallback(
    (checklistItemId: string, expanded: boolean) => {
      persist(setChecklistItemLayoutExpanded(layout, checklistItemId, expanded));
    },
    [layout, persist],
  );

  const expandAll = useCallback(
    (itemIds: string[]) => {
      persist(expandAllChecklistItems(layout, itemIds));
    },
    [layout, persist],
  );

  const collapseAll = useCallback(() => {
    persist(collapseAllChecklistItems(layout));
  }, [layout, persist]);

  const toggleArchivedVisible = useCallback(() => {
    persist({ ...layout, archivedVisible: !layout.archivedVisible });
  }, [layout, persist]);

  const replaceExpandedFromRemote = useCallback(
    (itemIds: string[]) => {
      persist({
        ...layout,
        taskId: taskId || layout.taskId,
        expandedItemIds: [...itemIds],
        updatedAt: new Date().toISOString(),
      });
    },
    [layout, persist, taskId],
  );

  return {
    layout,
    archivedVisible: layout.archivedVisible,
    isExpanded,
    setItemExpanded,
    expandAll,
    collapseAll,
    toggleArchivedVisible,
    replaceExpandedFromRemote,
  };
}
