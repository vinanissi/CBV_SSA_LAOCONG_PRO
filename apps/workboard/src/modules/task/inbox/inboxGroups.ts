import type { TaskItem, TaskWorkspaceSnapshot } from '@/api/contracts';
import type { InboxGroup, InboxItem } from '@/modules/task/types/workInboxTypes';

export interface InboxGroupBucket {
  key: InboxGroup;
  label: string;
  items: InboxItem[];
}

export const INBOX_GROUP_ORDER: readonly InboxGroup[] = [
  'need_action',
  'waiting',
  'follow_up',
  'completed',
] as const;

export const INBOX_GROUP_LABELS: Record<InboxGroup, string> = {
  need_action: '🔥 Cần làm ngay',
  waiting: '🟡 Chờ xử lý',
  follow_up: '👀 Theo dõi',
  completed: '✅ Hoàn thành',
};

/**
 * Collect unique tasks from workspace snapshot (runtime source for inbox adapter).
 */
export function collectRuntimeTasksFromSnapshot(snapshot: TaskWorkspaceSnapshot | null): TaskItem[] {
  if (!snapshot) return [];
  const byId = new Map<string, TaskItem>();
  const lists = [snapshot.tasks, snapshot.blockedTasks, snapshot.dueTasks, snapshot.overdueTasks];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const task of list) {
      if (task?.taskId) byId.set(task.taskId, task);
    }
  }
  return Array.from(byId.values());
}

/**
 * Partition adapter output by InboxItem.group — fixed order, no status re-derivation.
 */
export function buildInboxGroups(items: InboxItem[]): InboxGroupBucket[] {
  const safeItems = Array.isArray(items) ? items : [];
  return INBOX_GROUP_ORDER.map((key) => ({
    key,
    label: INBOX_GROUP_LABELS[key],
    items: safeItems.filter((item) => item.group === key),
  }));
}

/** Non-empty buckets only (operator preview). */
export function buildVisibleInboxGroups(items: InboxItem[]): InboxGroupBucket[] {
  return buildInboxGroups(items).filter((bucket) => bucket.items.length > 0);
}
