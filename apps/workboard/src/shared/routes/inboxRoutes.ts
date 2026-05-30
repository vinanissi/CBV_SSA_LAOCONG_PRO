/**
 * CBV_WORK_INBOX_V3 — Phase A route helpers.
 * Canonical operator entry: /inbox. Legacy alias: /tasks.
 */

export const INBOX_ROUTE = '/inbox';
export const TASKS_LEGACY_ROUTE = '/tasks';
export const OPERATIONAL_HOME_ROUTE = '/home';

/** True when pathname is the shared work-inbox shell (/inbox or /tasks). */
export function isWorkInboxRoute(pathname: string): boolean {
  return pathname.startsWith(INBOX_ROUTE) || pathname.startsWith(TASKS_LEGACY_ROUTE);
}
