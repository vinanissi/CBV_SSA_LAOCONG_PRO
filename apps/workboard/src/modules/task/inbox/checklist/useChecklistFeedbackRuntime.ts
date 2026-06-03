import { useCallback, useEffect, useState } from 'react';
import type { UserContext } from '@/api/contracts';
import {
  appendChecklistFeedback,
  loadChecklistFeedbackForTask,
  makeChecklistFeedbackId,
  removeChecklistFeedbackForItem,
  saveChecklistFeedbackForTask,
} from './checklistFeedbackLocalStore';
import type { ChecklistFeedback, ChecklistFeedbackByItemId } from './checklistFeedbackTypes';
import { isChecklistSheetBridgeEnabled } from './checklistBridgeConfig';
import { bridgeAppendFeedback } from './checklistBridgePersist';
import { loadChecklistFeedbackFromBridge } from './checklistBridgeSatelliteLoaders';

export interface UseChecklistFeedbackRuntimeOptions {
  taskId: string;
  operator: UserContext;
  canMutate?: boolean;
}

function operatorLabel(operator: UserContext): string {
  return (
    operator.displayName?.trim() ||
    operator.userId?.trim() ||
    operator.email?.trim() ||
    'OPERATOR'
  );
}

export function useChecklistFeedbackRuntime(options: UseChecklistFeedbackRuntimeOptions) {
  const taskId = options.taskId?.trim() || '';
  const canMutate = options.canMutate !== false;
  const [feedbackByItemId, setFeedbackByItemId] = useState<ChecklistFeedbackByItemId>({});

  useEffect(() => {
    if (!taskId) {
      setFeedbackByItemId({});
      return;
    }
    if (!isChecklistSheetBridgeEnabled()) {
      setFeedbackByItemId(loadChecklistFeedbackForTask(taskId));
      return;
    }
    let cancelled = false;
    loadChecklistFeedbackFromBridge(taskId).then((fromBridge) => {
      if (cancelled) return;
      setFeedbackByItemId(fromBridge ?? loadChecklistFeedbackForTask(taskId));
    });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const persist = useCallback(
    (next: ChecklistFeedbackByItemId) => {
      setFeedbackByItemId(next);
      if (taskId && !isChecklistSheetBridgeEnabled()) {
        saveChecklistFeedbackForTask(taskId, next);
      }
    },
    [taskId],
  );

  const addFeedback = useCallback(
    (checklistItemId: string, message: string) => {
      const trimmed = message.trim();
      if (!trimmed || !canMutate || !checklistItemId.trim()) {
        return { ok: false as const, error: 'Nội dung phản hồi không hợp lệ' };
      }
      const entry: ChecklistFeedback = {
        id: makeChecklistFeedbackId(),
        checklistItemId: checklistItemId.trim(),
        message: trimmed,
        author: operatorLabel(options.operator),
        createdAt: new Date().toISOString(),
      };
      const next = appendChecklistFeedback(feedbackByItemId, entry);
      persist(next);
      if (isChecklistSheetBridgeEnabled() && taskId) {
        void bridgeAppendFeedback(taskId, entry, options.operator).catch(() => {
          saveChecklistFeedbackForTask(taskId, next);
        });
      }
      return { ok: true as const, feedback: entry };
    },
    [canMutate, feedbackByItemId, options.operator, persist, taskId],
  );

  const clearFeedbackForItem = useCallback(
    (checklistItemId: string) => {
      persist(removeChecklistFeedbackForItem(feedbackByItemId, checklistItemId));
    },
    [feedbackByItemId, persist],
  );

  const getFeedbackForItem = useCallback(
    (checklistItemId: string): ChecklistFeedback[] => {
      return feedbackByItemId[checklistItemId] ?? [];
    },
    [feedbackByItemId],
  );

  const replaceFromRemote = useCallback(
    (map: ChecklistFeedbackByItemId) => {
      setFeedbackByItemId(map);
      if (taskId) saveChecklistFeedbackForTask(taskId, map);
    },
    [taskId],
  );

  return {
    feedbackByItemId,
    addFeedback,
    clearFeedbackForItem,
    getFeedbackForItem,
    replaceFromRemote,
    canMutate,
  };
}
