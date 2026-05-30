/** PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — cache invalidation on user actions. */

import { invalidateOperationalBundleResultCache } from '../operationalRuntime/workInboxOperationalBundleLoader';
import { invalidateTaskDetailResultCache } from './workInboxTaskDetailLoader';
import { invalidateWorkspaceSnapshotResultCache } from './workInboxWorkspaceSnapshotLoader';

export function invalidateWorkInboxCachesForAction(taskId: string): void {
  invalidateTaskDetailResultCache(taskId);
  invalidateOperationalBundleResultCache(taskId);
}

export function invalidateWorkspaceSnapshotCache(): void {
  invalidateWorkspaceSnapshotResultCache();
}

export function invalidateAllWorkInboxNetworkCaches(taskId?: string): void {
  if (taskId) invalidateWorkInboxCachesForAction(taskId);
  invalidateWorkspaceSnapshotResultCache();
}
