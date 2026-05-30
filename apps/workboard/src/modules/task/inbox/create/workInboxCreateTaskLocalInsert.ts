import type { TaskDetail, TaskItem, TaskWorkspaceSnapshot, UserContext } from '@/api/contracts';

export function mapCreatedTaskToTaskItem(task: TaskDetail, user: UserContext): TaskItem {
  return {
    taskId: task.taskId,
    title: task.title,
    status: task.status ?? 'NEW',
    priority: task.priority ?? 'MEDIUM',
    owner: task.displayAssigneeName ?? task.ownerId ?? user.displayName,
    ownerId: task.ownerId ?? user.userId,
    dueDate: task.dueDate ?? '',
    href: `/inbox/${encodeURIComponent(task.taskId)}`,
    permissionAllowed: true,
    isMine: true,
    module: 'TASK',
    source: 'work_inbox_user_create',
  };
}

export function insertCreatedTaskIntoSnapshot(
  snapshot: TaskWorkspaceSnapshot | null,
  task: TaskDetail,
  user: UserContext,
): TaskWorkspaceSnapshot | null {
  if (!snapshot) return snapshot;
  const item = mapCreatedTaskToTaskItem(task, user);
  const exists = snapshot.tasks.some((t) => t.taskId === item.taskId);
  if (exists) return snapshot;
  const tasks = [item, ...snapshot.tasks];
  return {
    ...snapshot,
    tasks,
    counts: {
      ...snapshot.counts,
      total: (snapshot.counts?.total ?? snapshot.tasks.length) + 1,
      open: (snapshot.counts?.open ?? 0) + 1,
    },
  };
}
