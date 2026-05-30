import type { TaskFilter } from '@/api/contracts';

/** Canonical filter keys — UI tabs and runtime must use these exactly. */
export type TaskFilterKey = TaskFilter;

export const TASK_FILTER_KEYS = ['mine', 'pending', 'overdue', 'approval'] as const satisfies readonly TaskFilterKey[];

export const TASK_FILTER_TABS: { key: TaskFilterKey; label: string }[] = [
  { key: 'mine', label: 'Việc của tôi' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'overdue', label: 'Quá hạn' },
  { key: 'approval', label: 'Chờ duyệt' },
];

export function isTaskFilterKey(value: string | null | undefined): value is TaskFilterKey {
  return TASK_FILTER_KEYS.includes(value as TaskFilterKey);
}

export function normalizeTaskFilterKey(value: string | null | undefined): TaskFilterKey {
  return isTaskFilterKey(value) ? value : 'mine';
}
