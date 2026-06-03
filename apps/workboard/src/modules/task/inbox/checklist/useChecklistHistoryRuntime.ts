import { useCallback, useEffect, useState } from 'react';
import type { UserContext } from '@/api/contracts';
import {
  appendChecklistHistoryEntry,
  loadChecklistHistoryForTask,
  makeChecklistHistoryId,
  removeChecklistHistoryForItem,
  saveChecklistHistoryForTask,
} from './checklistHistoryLocalStore';
import type {
  ChecklistHistoryByItemId,
  ChecklistHistoryEntry,
  ChecklistHistoryEntryType,
  ChecklistHistorySource,
} from './checklistHistoryTypes';
import { isChecklistSheetBridgeEnabled } from './checklistBridgeConfig';
import { bridgeAppendHistory } from './checklistBridgePersist';
import { loadChecklistHistoryFromBridge } from './checklistBridgeSatelliteLoaders';

export interface RecordChecklistHistoryInput {
  checklistItemId: string;
  type: ChecklistHistoryEntryType;
  message: string;
  source?: ChecklistHistorySource;
  refId?: string | null;
  refType?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UseChecklistHistoryRuntimeOptions {
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

export function useChecklistHistoryRuntime(options: UseChecklistHistoryRuntimeOptions) {
  const taskId = options.taskId?.trim() || '';
  const canMutate = options.canMutate !== false;
  const [historyByItemId, setHistoryByItemId] = useState<ChecklistHistoryByItemId>({});

  useEffect(() => {
    if (!taskId) {
      setHistoryByItemId({});
      return;
    }
    if (!isChecklistSheetBridgeEnabled()) {
      setHistoryByItemId(loadChecklistHistoryForTask(taskId));
      return;
    }
    let cancelled = false;
    loadChecklistHistoryFromBridge(taskId).then((fromBridge) => {
      if (cancelled) return;
      setHistoryByItemId(fromBridge ?? loadChecklistHistoryForTask(taskId));
    });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const persist = useCallback(
    (next: ChecklistHistoryByItemId) => {
      setHistoryByItemId(next);
      if (taskId && !isChecklistSheetBridgeEnabled()) {
        saveChecklistHistoryForTask(taskId, next);
      }
    },
    [taskId],
  );

  const recordEvent = useCallback(
    (input: RecordChecklistHistoryInput) => {
      const checklistItemId = input.checklistItemId?.trim();
      const message = input.message?.trim();
      if (!checklistItemId || !message) return { ok: false as const };
      const entry: ChecklistHistoryEntry = {
        id: makeChecklistHistoryId(),
        checklistItemId,
        type: input.type,
        message,
        actor: operatorLabel(options.operator),
        createdAt: new Date().toISOString(),
        source: input.source ?? 'local',
        refId: input.refId ?? null,
        refType: input.refType ?? null,
        metadata: input.metadata,
      };
      const next = appendChecklistHistoryEntry(historyByItemId, entry);
      persist(next);
      if (isChecklistSheetBridgeEnabled() && taskId) {
        void bridgeAppendHistory(taskId, entry, options.operator).catch(() => {
          saveChecklistHistoryForTask(taskId, next);
        });
      }
      return { ok: true as const, entry };
    },
    [historyByItemId, options.operator, persist, taskId],
  );

  const addManualNote = useCallback(
    (checklistItemId: string, message: string) => {
      if (!canMutate) return { ok: false as const, error: 'Không thể ghi lịch sử' };
      return recordEvent({
        checklistItemId,
        type: 'manual_history_note_added',
        message: message.trim(),
        source: 'local',
        refType: 'checklist',
      });
    },
    [canMutate, recordEvent],
  );

  const clearHistoryForItem = useCallback(
    (checklistItemId: string) => {
      persist(removeChecklistHistoryForItem(historyByItemId, checklistItemId));
    },
    [historyByItemId, persist],
  );

  const replaceFromRemote = useCallback(
    (map: ChecklistHistoryByItemId) => {
      setHistoryByItemId(map);
      if (taskId) saveChecklistHistoryForTask(taskId, map);
    },
    [taskId],
  );

  return {
    historyByItemId,
    recordEvent,
    addManualNote,
    clearHistoryForItem,
    replaceFromRemote,
    canMutate,
  };
}
