import { INBOX_ROUTE, TASKS_LEGACY_ROUTE, isWorkInboxRoute } from '@/shared/routes/inboxRoutes';
import { isWorkInboxGroupsV3Enabled } from './workInboxGroupsFeature';

function envEnabled(flag: string | undefined): boolean {
  return flag !== 'false' && flag !== '0';
}

/** V3 is the primary operator surface on /inbox (default on when unset). */
export function isWorkInboxV3PrimaryEnabled(): boolean {
  return envEnabled(import.meta.env.VITE_CBV_WORK_INBOX_V3_PRIMARY);
}

/** Legacy cognition list + filters remain available in UI (default on when unset). */
export function isLegacyTaskRuntimeAvailable(): boolean {
  return envEnabled(import.meta.env.VITE_CBV_LEGACY_TASK_RUNTIME);
}

export function isOnInboxRoute(pathname: string): boolean {
  return pathname.startsWith(INBOX_ROUTE);
}

export function isOnTasksLegacyRoute(pathname: string): boolean {
  return pathname.startsWith(TASKS_LEGACY_ROUTE);
}

/**
 * Show Work Inbox V3 groups/cards/focus panel.
 * Primary on /inbox; on /tasks only when legacy UI is fully hidden.
 */
export function shouldShowWorkInboxV3Panel(pathname: string): boolean {
  if (!isWorkInboxGroupsV3Enabled()) return false;
  if (!isWorkInboxRoute(pathname)) return false;

  if (isWorkInboxV3PrimaryEnabled()) {
    return isOnInboxRoute(pathname);
  }

  return !isLegacyTaskRuntimeAvailable();
}

/** Initial expand state for legacy runtime panel (local UI only). */
export function getInitialLegacyRuntimeVisible(pathname: string): boolean {
  if (!isLegacyTaskRuntimeAvailable()) return false;
  if (!isWorkInboxV3PrimaryEnabled()) return true;
  return isOnTasksLegacyRoute(pathname);
}

/** Hide legacy cognition runtime on /inbox when V3 is primary (no "Hiện Runtime cũ" gap). */
export function shouldRenderLegacyTaskRuntime(pathname: string): boolean {
  if (!isLegacyTaskRuntimeAvailable()) return false;
  if (isWorkInboxV3PrimaryEnabled() && isOnInboxRoute(pathname)) return false;
  return true;
}
