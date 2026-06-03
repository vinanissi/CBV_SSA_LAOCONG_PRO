import type { TaskDetail, TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';

/** Minimal TASK_MAIN projection from Focus item — real id/title only (OCMS_03D). */
export function buildMinimalTaskFromFocusItem(item: WorkInboxFocusItem): TaskItem {
  return {
    taskId: item.id,
    title: item.title,
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    owner: '',
    ownerId: '',
    dueDate: '',
    href: item.primaryActionHref || `/inbox/${encodeURIComponent(item.id)}`,
    permissionAllowed: true,
    module: 'TASK',
    source: 'TASK_MAIN',
  };
}

/**
 * Resolve TaskItem for OCMS derive — prefer runtime list, then loaded detail, then focus card.
 */
export function resolveOcmsFocusTask(
  runtimeTask?: TaskItem,
  taskDetail?: TaskDetail | null,
  focusItem?: WorkInboxFocusItem,
): TaskItem | undefined {
  if (runtimeTask?.taskId?.trim()) return runtimeTask;

  const focusId = focusItem?.id?.trim();
  if (taskDetail?.taskId?.trim()) {
    if (!focusId || taskDetail.taskId === focusId) return taskDetail;
  }

  if (focusId) return buildMinimalTaskFromFocusItem(focusItem!);
  return undefined;
}
