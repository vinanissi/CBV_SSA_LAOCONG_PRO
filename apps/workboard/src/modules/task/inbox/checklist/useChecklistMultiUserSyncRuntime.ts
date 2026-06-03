/**
 * PHASE_CHECKLIST_14 — multi-user sync hook (manual refresh only).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UserContext } from '@/api/contracts';
import { isChecklistSheetBridgeEnabled } from './checklistBridgeConfig';
import {
  buildLocalSnapshotSignature,
  compareChecklistForTask,
  getChecklistSyncState,
  guardChecklistWrite,
  refreshChecklistFromRemote,
} from './checklistMultiUserSyncRuntime';
import type {
  ChecklistRemoteSnapshot,
  ChecklistSyncCompareResult,
  ChecklistSyncState,
  ChecklistWriteGuardResult,
  ChecklistWriteOperation,
} from './checklistMultiUserSyncTypes';
import { touchChecklistLocalUpdatedAt } from './checklistSyncLocalStore';
import type { ChecklistAttachmentByItemId } from './checklistAttachmentTypes';
import type { ChecklistFeedbackByItemId } from './checklistFeedbackTypes';
import type { ChecklistHistoryByItemId } from './checklistHistoryTypes';
import type { ChecklistLinkByItemId } from './checklistLinkTypes';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

export interface ChecklistSyncApplyHandlers {
  replaceItems: (items: WorkInboxChecklistItem[]) => void;
  replaceFeedback: (map: ChecklistFeedbackByItemId) => void;
  replaceAttachments: (map: ChecklistAttachmentByItemId) => void;
  replaceLinks: (map: ChecklistLinkByItemId) => void;
  replaceHistory: (map: ChecklistHistoryByItemId) => void;
  replaceLayoutExpanded: (itemIds: string[]) => void;
}

export interface UseChecklistMultiUserSyncRuntimeOptions {
  taskId: string;
  operator: UserContext;
  items: WorkInboxChecklistItem[];
  feedbackByItemId: ChecklistFeedbackByItemId;
  attachmentsByItemId: ChecklistAttachmentByItemId;
  linksByItemId: ChecklistLinkByItemId;
  historyByItemId: ChecklistHistoryByItemId;
  layoutExpandedCount: number;
  applyHandlers: ChecklistSyncApplyHandlers;
}

function operatorLabel(operator: UserContext): string {
  return operator.displayName?.trim() || operator.userId?.trim() || operator.email?.trim() || 'OPERATOR';
}

function countMapRows(map: Record<string, unknown[]>): number {
  return Object.values(map).reduce((n, rows) => n + (Array.isArray(rows) ? rows.length : 0), 0);
}

function applyRemoteSnapshot(snapshot: ChecklistRemoteSnapshot, handlers: ChecklistSyncApplyHandlers): void {
  handlers.replaceItems(snapshot.items);
  handlers.replaceFeedback(snapshot.feedbackByItemId);
  handlers.replaceAttachments(snapshot.attachmentsByItemId);
  handlers.replaceLinks(snapshot.linksByItemId);
  handlers.replaceHistory(snapshot.historyByItemId);
  handlers.replaceLayoutExpanded(snapshot.layoutExpandedItemIds);
}

export function useChecklistMultiUserSyncRuntime(options: UseChecklistMultiUserSyncRuntimeOptions) {
  const taskId = options.taskId.trim();
  const bridgeOn = isChecklistSheetBridgeEnabled();
  const [syncState, setSyncState] = useState<ChecklistSyncState>(() => getChecklistSyncState(taskId));
  const [compareResult, setCompareResult] = useState<ChecklistSyncCompareResult | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    setSyncState(getChecklistSyncState(taskId));
  }, [taskId]);

  const localSignature = useMemo(
    () =>
      buildLocalSnapshotSignature({
        items: options.items,
        feedbackCount: countMapRows(options.feedbackByItemId),
        attachmentCount: countMapRows(options.attachmentsByItemId),
        linkCount: countMapRows(options.linksByItemId),
        historyCount: countMapRows(options.historyByItemId),
        layoutExpandedCount: options.layoutExpandedCount,
      }),
    [
      options.items,
      options.feedbackByItemId,
      options.attachmentsByItemId,
      options.linksByItemId,
      options.historyByItemId,
      options.layoutExpandedCount,
    ],
  );

  const runCompare = useCallback(async () => {
    if (!bridgeOn || !taskId) return null;
    const cmp = await compareChecklistForTask({
      taskId,
      localSignature,
      items: options.items,
      feedbackCount: countMapRows(options.feedbackByItemId),
      attachmentCount: countMapRows(options.attachmentsByItemId),
      linkCount: countMapRows(options.linksByItemId),
      historyCount: countMapRows(options.historyByItemId),
      layoutExpandedCount: options.layoutExpandedCount,
    });
    setCompareResult(cmp);
    if (cmp.stale || cmp.conflictDetected) {
      setSyncState((prev) => ({
        ...prev,
        syncStatus: cmp.conflictDetected ? 'conflict' : 'stale',
        conflictDetected: cmp.conflictDetected,
        conflictMessage: cmp.conflictMessage ?? null,
      }));
    }
    return cmp;
  }, [
    bridgeOn,
    taskId,
    localSignature,
    options.items,
    options.feedbackByItemId,
    options.attachmentsByItemId,
    options.linksByItemId,
    options.historyByItemId,
    options.layoutExpandedCount,
  ]);

  const refreshFromRemote = useCallback(async () => {
    if (!taskId) return { ok: false as const, error: 'taskId missing' };
    setSyncMessage(null);
    const result = await refreshChecklistFromRemote(taskId, operatorLabel(options.operator));
    setSyncState(result.syncState);
    if (result.ok && result.snapshot) {
      applyRemoteSnapshot(result.snapshot, options.applyHandlers);
      setCompareResult({
        ok: true,
        stale: false,
        conflictDetected: false,
        warnings: result.warnings,
      });
      setSyncMessage(
        `Đã đồng bộ ${result.pulledItemsCount ?? 0} mục, ${result.pulledFeedbackCount ?? 0} phản hồi.`,
      );
      return { ok: true as const, result };
    }
    setSyncMessage(result.errors[0] ?? 'Đồng bộ thất bại');
    return { ok: false as const, error: result.errors[0] ?? 'Đồng bộ thất bại', result };
  }, [options.applyHandlers, options.operator, taskId]);

  const markLocalMutation = useCallback(() => {
    if (!taskId) return;
    touchChecklistLocalUpdatedAt(taskId);
    setSyncState(getChecklistSyncState(taskId));
  }, [taskId]);

  const checkWriteGuard = useCallback(
    async (operation: ChecklistWriteOperation): Promise<ChecklistWriteGuardResult> => {
      if (!bridgeOn) {
        return {
          ok: true,
          canWrite: true,
          conflictDetected: false,
          requiresRefresh: false,
          warnings: [],
          errors: [],
        };
      }
      const cmp = compareResult ?? (await runCompare());
      const guard = guardChecklistWrite({
        taskId,
        operation,
        syncState,
        compare: cmp,
      });
      if (!guard.canWrite) {
        setSyncMessage(guard.message ?? 'Ghi bị chặn — làm mới từ Sheet.');
        setSyncState((prev) => ({
          ...prev,
          syncStatus: guard.conflictDetected ? 'conflict' : 'stale',
          conflictDetected: guard.conflictDetected,
          conflictMessage: guard.message ?? prev.conflictMessage,
        }));
      }
      return guard;
    },
    [bridgeOn, compareResult, runCompare, syncState, taskId],
  );

  return {
    bridgeOn,
    syncState,
    syncMessage,
    compareResult,
    refreshFromRemote,
    runCompare,
    checkWriteGuard,
    markLocalMutation,
    localSignature,
  };
}
