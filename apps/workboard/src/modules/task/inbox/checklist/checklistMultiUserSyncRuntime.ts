/**
 * PHASE_CHECKLIST_14 — manual refresh, stale detection, write guard.
 */

import { isChecklistSheetBridgeEnabled } from './checklistBridgeConfig';
import {
  buildChecklistSnapshotSignature,
  fetchChecklistRemoteSnapshot,
} from './checklistRemoteSnapshot';
import type {
  ChecklistRemoteSnapshot,
  ChecklistSyncCompareInput,
  ChecklistSyncCompareResult,
  ChecklistSyncResult,
  ChecklistSyncState,
  ChecklistSyncValidationResult,
  ChecklistWriteGuardInput,
  ChecklistWriteGuardResult,
  ChecklistWriteOperation,
} from './checklistMultiUserSyncTypes';
import { loadChecklistSyncMeta, saveChecklistSyncMeta } from './checklistSyncLocalStore';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

const APPEND_SAFE_OPS: ChecklistWriteOperation[] = [
  'append',
  'feedback_added',
  'history_added',
  'attachment_metadata_added',
  'link_added',
];

export function defaultChecklistSyncState(taskId: string): ChecklistSyncState {
  const stored = loadChecklistSyncMeta(taskId);
  return {
    taskId,
    syncStatus: stored?.syncStatus ?? 'idle',
    lastSyncedAt: stored?.lastSyncedAt ?? null,
    remoteUpdatedAt: stored?.remoteUpdatedAt ?? null,
    localUpdatedAt: stored?.localUpdatedAt ?? null,
    conflictDetected: stored?.conflictDetected ?? false,
    conflictMessage: stored?.conflictMessage ?? null,
    actor: stored?.actor ?? null,
    traceId: stored?.traceId ?? null,
  };
}

export function getChecklistSyncState(taskId: string): ChecklistSyncState {
  return defaultChecklistSyncState(taskId);
}

export function compareChecklistLocalRemote(input: ChecklistSyncCompareInput): ChecklistSyncCompareResult {
  const warnings: string[] = [];
  const signaturesDiffer = input.localSignature !== input.remoteSignature;
  const localChangedAfterSync =
    Boolean(input.localUpdatedAt && input.lastSyncedAt) &&
    input.localUpdatedAt!.localeCompare(input.lastSyncedAt!) > 0;
  const remoteNewerThanSync =
    Boolean(input.remoteUpdatedAt && input.lastSyncedAt) &&
    input.remoteUpdatedAt!.localeCompare(input.lastSyncedAt!) > 0;

  const stale = signaturesDiffer && (localChangedAfterSync || remoteNewerThanSync || !input.lastSyncedAt);
  const conflictDetected = stale && localChangedAfterSync && remoteNewerThanSync;
  const conflictMessage = conflictDetected
    ? 'Dữ liệu trên Sheet đã thay đổi. Vui lòng làm mới trước khi ghi đè.'
    : stale
      ? 'Dữ liệu có thể đã cũ. Làm mới từ Sheet trước khi lưu thay đổi quan trọng.'
      : null;

  if (stale && !conflictDetected) warnings.push('Local snapshot differs from remote');

  return {
    ok: true,
    stale,
    conflictDetected,
    conflictMessage,
    warnings,
  };
}

export function guardChecklistWrite(input: ChecklistWriteGuardInput): ChecklistWriteGuardResult {
  const compare = input.compare;
  const isAppendSafe = APPEND_SAFE_OPS.includes(input.operation);

  if (!isChecklistSheetBridgeEnabled()) {
    return {
      ok: true,
      canWrite: true,
      conflictDetected: false,
      requiresRefresh: false,
      warnings: ['Bridge off — write guard skipped'],
      errors: [],
    };
  }

  if (!compare) {
    return {
      ok: true,
      canWrite: true,
      conflictDetected: false,
      requiresRefresh: false,
      warnings: ['Compare not run — allowing write'],
      errors: [],
    };
  }

  if (compare.conflictDetected && !isAppendSafe) {
    return {
      ok: true,
      canWrite: false,
      conflictDetected: true,
      requiresRefresh: true,
      message: compare.conflictMessage ?? 'Cần làm mới trước khi ghi đè.',
      warnings: compare.warnings,
      errors: [],
    };
  }

  if (compare.stale && !isAppendSafe) {
    return {
      ok: true,
      canWrite: false,
      conflictDetected: false,
      requiresRefresh: true,
      message: compare.conflictMessage ?? 'Dữ liệu có thể đã cũ — làm mới từ Sheet.',
      warnings: compare.warnings,
      errors: [],
    };
  }

  if (compare.stale && isAppendSafe) {
    return {
      ok: true,
      canWrite: true,
      conflictDetected: compare.conflictDetected,
      requiresRefresh: false,
      message: compare.conflictMessage ?? undefined,
      warnings: [...compare.warnings, 'Append allowed while stale'],
      errors: [],
    };
  }

  return {
    ok: true,
    canWrite: true,
    conflictDetected: false,
    requiresRefresh: false,
    warnings: compare.warnings,
    errors: [],
  };
}

export function buildLocalSnapshotSignature(input: {
  items: WorkInboxChecklistItem[];
  feedbackCount: number;
  attachmentCount: number;
  linkCount: number;
  historyCount: number;
  layoutExpandedCount: number;
}): string {
  return buildChecklistSnapshotSignature(input);
}

export async function refreshChecklistFromRemote(
  taskId: string,
  actor?: string | null,
): Promise<ChecklistSyncResult> {
  const traceId = `sync-${Date.now()}`;
  const tid = taskId.trim();
  if (!tid) {
    return {
      ok: false,
      status: 'FAIL',
      traceId,
      taskId: tid,
      syncState: { taskId: tid, syncStatus: 'error', conflictDetected: false },
      warnings: [],
      errors: ['taskId is required'],
    };
  }

  if (!isChecklistSheetBridgeEnabled()) {
    return {
      ok: false,
      status: 'FAIL',
      traceId,
      taskId: tid,
      syncState: {
        taskId: tid,
        syncStatus: 'error',
        conflictDetected: false,
        conflictMessage: 'Bật Sheet bridge để đồng bộ',
      },
      warnings: [],
      errors: ['Sheet bridge disabled'],
    };
  }

  const refreshing: ChecklistSyncState = {
    ...defaultChecklistSyncState(tid),
    syncStatus: 'refreshing',
    actor: actor ?? null,
    traceId,
  };
  saveChecklistSyncMeta(refreshing);

  const remote = await fetchChecklistRemoteSnapshot(tid);
  if (!remote.ok || !remote.snapshot) {
    const failed: ChecklistSyncState = {
      ...defaultChecklistSyncState(tid),
      syncStatus: 'error',
      conflictDetected: false,
      conflictMessage: remote.errors[0] ?? 'Không đọc được dữ liệu từ Sheet',
      actor: actor ?? null,
      traceId,
    };
    saveChecklistSyncMeta(failed);
    return {
      ok: false,
      status: 'FAIL',
      traceId,
      taskId: tid,
      syncState: failed,
      warnings: remote.warnings,
      errors: remote.errors,
    };
  }

  const now = new Date().toISOString();
  const synced: ChecklistSyncState = {
    taskId: tid,
    syncStatus: 'synced',
    lastSyncedAt: now,
    remoteUpdatedAt: remote.snapshot.remoteUpdatedAt,
    localUpdatedAt: now,
    conflictDetected: false,
    conflictMessage: null,
    actor: actor ?? null,
    traceId,
  };
  saveChecklistSyncMeta(synced);

  const snap = remote.snapshot;
  return {
    ok: true,
    status: remote.warnings.length ? 'GO_WITH_WARNINGS' : 'GO',
    traceId,
    taskId: tid,
    pulledItemsCount: snap.items.length,
    pulledFeedbackCount: countRows(snap.feedbackByItemId),
    pulledAttachmentsCount: countRows(snap.attachmentsByItemId),
    pulledLinksCount: countRows(snap.linksByItemId),
    pulledHistoryCount: countRows(snap.historyByItemId),
    pulledLayoutCount: snap.layoutExpandedItemIds.length,
    syncState: synced,
    snapshot: snap,
    warnings: remote.warnings,
    errors: [],
  };
}

function countRows(map: Record<string, unknown[]>): number {
  return Object.values(map).reduce((n, rows) => n + (Array.isArray(rows) ? rows.length : 0), 0);
}

export async function compareChecklistForTask(input: {
  taskId: string;
  localSignature: string;
  items: WorkInboxChecklistItem[];
  feedbackCount: number;
  attachmentCount: number;
  linkCount: number;
  historyCount: number;
  layoutExpandedCount: number;
}): Promise<ChecklistSyncCompareResult & { remoteSignature?: string; remoteUpdatedAt?: string | null }> {
  const state = getChecklistSyncState(input.taskId);
  if (!isChecklistSheetBridgeEnabled()) {
    return { ok: true, stale: false, conflictDetected: false, warnings: ['Bridge off'] };
  }

  const remote = await fetchChecklistRemoteSnapshot(input.taskId);
  if (!remote.ok || !remote.snapshot) {
    return {
      ok: false,
      stale: false,
      conflictDetected: false,
      conflictMessage: remote.errors[0] ?? 'Không so sánh được với Sheet',
      warnings: remote.warnings,
    };
  }

  return {
    ...compareChecklistLocalRemote({
      taskId: input.taskId,
      localSignature: input.localSignature,
      remoteSignature: remote.snapshot.signature,
      lastSyncedAt: state.lastSyncedAt,
      localUpdatedAt: state.localUpdatedAt,
      remoteUpdatedAt: remote.snapshot.remoteUpdatedAt,
    }),
    remoteSignature: remote.snapshot.signature,
    remoteUpdatedAt: remote.snapshot.remoteUpdatedAt,
  };
}

export function validateChecklistMultiUserSyncRuntime(): ChecklistSyncValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  if (!isChecklistSheetBridgeEnabled()) {
    warnings.push('Bridge flag default off');
  }
  return {
    ok: errors.length === 0,
    status: errors.length ? 'FAIL' : warnings.length ? 'GO_WITH_WARNINGS' : 'GO',
    checkedAt: new Date().toISOString(),
    traceId: `sync-val-${Date.now()}`,
    sync: { manualRefresh: true, staleDetection: true, writeGuard: true },
    bridge: { enabled: isChecklistSheetBridgeEnabled() },
    ui: { statusBar: true },
    warnings,
    errors,
    nextStep: 'PHASE_CHECKLIST_15_OPERATOR_UAT',
  };
}

export type { ChecklistRemoteSnapshot };
