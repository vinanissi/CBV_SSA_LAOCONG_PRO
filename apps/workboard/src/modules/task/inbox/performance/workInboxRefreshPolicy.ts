/** PHASE_WORK_INBOX_LATENCY_P0_FIX — deferred bundle refresh + optimistic patch (no layout change). */

import type { TaskDetail } from '@/api/contracts';

export type WorkInboxRefreshPolicy = 'SELECTIVE' | 'SNAPSHOT' | 'BUNDLE_ONLY' | 'NONE';

/** Slow record-action threshold for operator messaging (ms). */
export const ACTION_SLOW_SYNC_MS = 4000;

export const ACTION_SLOW_SYNC_MESSAGE =
  'Đã ghi nhận thao tác, hệ thống đang đồng bộ nền';

/** Default defer before background operational bundle refresh after record-action. */
export const DEFERRED_BUNDLE_REFRESH_MS = 750;

export interface WorkInboxActionRefreshPlan {
  refreshPolicy: WorkInboxRefreshPolicy;
  needsOperationalBundleRefresh: boolean;
  needsSnapshotRefresh: boolean;
  affectedTaskPatch?: TaskDetail | Partial<TaskDetail>;
  snapshotRefreshSkipped?: boolean;
  bundleRefreshTriggered?: boolean;
  /** Non-blocking operational refresh delay (ms). */
  deferOperationalRefreshMs?: number;
  bundleRefreshNonBlocking?: boolean;
  optimisticPatchApplied?: boolean;
  toastBeforeBundleRefresh?: boolean;
}

export function buildBundleOnlyRefreshPlan(taskPatch?: TaskDetail): WorkInboxActionRefreshPlan {
  return {
    refreshPolicy: 'BUNDLE_ONLY',
    needsOperationalBundleRefresh: true,
    needsSnapshotRefresh: false,
    affectedTaskPatch: taskPatch,
    snapshotRefreshSkipped: true,
    bundleRefreshTriggered: true,
    deferOperationalRefreshMs: DEFERRED_BUNDLE_REFRESH_MS,
    bundleRefreshNonBlocking: true,
  };
}

export function buildNoRefreshPlan(): WorkInboxActionRefreshPlan {
  return {
    refreshPolicy: 'NONE',
    needsOperationalBundleRefresh: false,
    needsSnapshotRefresh: false,
    snapshotRefreshSkipped: true,
    bundleRefreshTriggered: false,
  };
}

export function buildSnapshotRefreshPlan(taskPatch?: TaskDetail): WorkInboxActionRefreshPlan {
  return {
    refreshPolicy: 'SNAPSHOT',
    needsOperationalBundleRefresh: true,
    needsSnapshotRefresh: true,
    affectedTaskPatch: taskPatch,
    snapshotRefreshSkipped: false,
    bundleRefreshTriggered: true,
    deferOperationalRefreshMs: DEFERRED_BUNDLE_REFRESH_MS,
    bundleRefreshNonBlocking: true,
  };
}

export interface ApplyRefreshPlanDeps {
  onTaskUpdated?: (task: TaskDetail) => void;
  onSnapshotRefresh?: () => void;
  onOperationalRefresh?: () => void;
}

let deferredRefreshTimer: ReturnType<typeof setTimeout> | null = null;

export function applyWorkInboxRefreshPlan(
  plan: WorkInboxActionRefreshPlan,
  deps: ApplyRefreshPlanDeps,
): void {
  if (plan.affectedTaskPatch && deps.onTaskUpdated) {
    deps.onTaskUpdated(plan.affectedTaskPatch as TaskDetail);
    plan.optimisticPatchApplied = true;
  }
  if (plan.needsSnapshotRefresh) {
    deps.onSnapshotRefresh?.();
  }
  if (plan.needsOperationalBundleRefresh) {
    const deferMs = plan.deferOperationalRefreshMs ?? 0;
    const run = () => {
      plan.toastBeforeBundleRefresh = true;
      deps.onOperationalRefresh?.();
    };
    if (deferMs > 0 && plan.bundleRefreshNonBlocking) {
      if (deferredRefreshTimer) clearTimeout(deferredRefreshTimer);
      deferredRefreshTimer = setTimeout(run, deferMs);
    } else {
      run();
    }
  }
}

export function markDeferredBundleRefreshTrace(deferMs: number): void {
  try {
    const key = 'cbv_work_inbox_latency_p0_fe';
    const raw = sessionStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      deferredBundleRefreshMs: deferMs,
      optimisticPatchApplied: true,
      toastBeforeBundleRefresh: true,
      at: new Date().toISOString(),
    });
    sessionStorage.setItem(key, JSON.stringify(list.slice(-40)));
  } catch {
    /* ignore */
  }
}
