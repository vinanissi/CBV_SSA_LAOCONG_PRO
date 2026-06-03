/**
 * PHASE_LINK_01 — build and parse checklist step deep links (`/inbox/:taskId?step=`).
 */

import { CHECKLIST_STEP_QUERY_KEY } from './stepDeepLinkTypes';

/** Canonical inbox route — keep aligned with `@/shared/routes/inboxRoutes`. */
const INBOX_ROUTE = '/inbox';

export function parseChecklistStepIdFromSearchParams(params: URLSearchParams): string | null {
  const raw = params.get(CHECKLIST_STEP_QUERY_KEY)?.trim();
  return raw || null;
}

export function clearChecklistStepFromSearchParams(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete(CHECKLIST_STEP_QUERY_KEY);
  return next;
}

/** Relative path + query (no origin). */
export function buildChecklistStepDeepLinkPath(taskId: string, checklistItemId: string): string {
  const tid = taskId.trim();
  const cid = checklistItemId.trim();
  const path = `${INBOX_ROUTE}/${encodeURIComponent(tid)}`;
  const qs = new URLSearchParams();
  qs.set(CHECKLIST_STEP_QUERY_KEY, cid);
  return `${path}?${qs.toString()}`;
}

/** Absolute URL for clipboard sharing when `window` is available. */
export function buildChecklistStepDeepLinkHref(taskId: string, checklistItemId: string): string {
  const relative = buildChecklistStepDeepLinkPath(taskId, checklistItemId);
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${relative}`;
  }
  return relative;
}
