import type { TaskCardModel, WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { derivePrimaryActionHref } from '@/modules/task/adapters/workInboxAdapter';
import { INBOX_ROUTE, TASKS_LEGACY_ROUTE } from '@/shared/routes/inboxRoutes';

export type WorkInboxOpenTarget = {
  taskId: string;
  title?: string;
  href: string;
};

/** Canonical V3 open route; legacy fallback documented in hotfix report. */
export function buildWorkInboxOpenHref(taskId: string, preferInbox = true): string {
  const id = taskId.trim();
  const base = preferInbox ? INBOX_ROUTE : TASKS_LEGACY_ROUTE;
  return `${base}/${encodeURIComponent(id || 'unknown-task')}`;
}

export function resolveWorkInboxOpenTarget(
  model: Pick<TaskCardModel, 'id' | 'title' | 'primaryActionHref'>,
  options?: { preferInbox?: boolean },
): WorkInboxOpenTarget | null {
  const taskId = model.id?.trim();
  if (!taskId) {
    console.warn('[WorkInboxV3] Cannot open task — missing task id', {
      title: model.title,
    });
    return null;
  }

  const href = model.primaryActionHref?.trim() || derivePrimaryActionHref(taskId);
  if (!model.primaryActionHref?.trim()) {
    console.warn('[WorkInboxV3] Missing primaryActionHref — using derived route', {
      taskId,
      title: model.title,
      href,
    });
  }

  const preferInbox = options?.preferInbox ?? href.startsWith(INBOX_ROUTE);
  const canonical = href.startsWith(INBOX_ROUTE) || href.startsWith(TASKS_LEGACY_ROUTE)
    ? href
    : buildWorkInboxOpenHref(taskId, preferInbox);

  return { taskId, title: model.title, href: canonical };
}

export function resolveFocusItemOpenTarget(item: WorkInboxFocusItem): WorkInboxOpenTarget | null {
  return resolveWorkInboxOpenTarget({
    id: item.id,
    title: item.title,
    primaryActionHref: item.detailHref || item.primaryActionHref,
  });
}

export function findFocusIndexByTaskId(items: WorkInboxFocusItem[], taskId: string | null | undefined): number {
  if (!taskId || items.length === 0) return 0;
  const idx = items.findIndex((item) => item.id === taskId);
  return idx >= 0 ? idx : 0;
}
