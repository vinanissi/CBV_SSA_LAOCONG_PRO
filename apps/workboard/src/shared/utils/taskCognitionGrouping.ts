import type { TaskItem } from '@/api/contracts';
import { getAttentionLevel, sortByAttention } from './taskAttention';
import { getTaskNextAction } from './taskNextAction';

export type CognitionGroupKey =
  | 'act_now'
  | 'quick_win'
  | 'waiting_response'
  | 'waiting_approval'
  | 'batchable'
  | 'monitor'
  | 'awareness';

export interface CognitionTaskGroup {
  key: CognitionGroupKey;
  label: string;
  tasks: TaskItem[];
  defaultCollapsed?: boolean;
}

const COGNITION_ORDER: CognitionGroupKey[] = [
  'act_now',
  'quick_win',
  'waiting_response',
  'waiting_approval',
  'batchable',
  'monitor',
  'awareness',
];

const COGNITION_LABELS: Record<CognitionGroupKey, string> = {
  act_now: 'Cần xử lý ngay',
  quick_win: 'Việc nhanh (<5 phút)',
  waiting_response: 'Chờ phản hồi',
  waiting_approval: 'Chờ duyệt',
  batchable: 'Có thể xử lý hàng loạt',
  monitor: 'Theo dõi',
  awareness: 'Awareness / nền',
};

const COGNITION_COLLAPSED: CognitionGroupKey[] = ['awareness', 'monitor'];

export function classifyCognitionGroup(task: TaskItem): CognitionGroupKey {
  const level = getAttentionLevel(task);
  const next = getTaskNextAction(task);

  if (level === 'ACTION_NOW') return 'act_now';
  if (task.status === 'WAITING_APPROVAL') return 'waiting_approval';
  if (task.status === 'WAITING' || task.urgency?.isWaiting) return 'waiting_response';
  if (next.type === 'ACCEPT' && !task.isOverdue) return 'quick_win';
  if (level === 'BACKGROUND') return 'awareness';
  if (task.status === 'IN_PROGRESS' && !task.isOverdue && !task.urgency?.isBlocked) return 'batchable';
  if (level === 'AWARENESS') return 'monitor';
  return 'monitor';
}

export function groupCognitionTasks(tasks: TaskItem[]): CognitionTaskGroup[] {
  const buckets = new Map<CognitionGroupKey, TaskItem[]>();
  for (const key of COGNITION_ORDER) buckets.set(key, []);

  for (const task of tasks) {
    if (task.status === 'DONE') continue;
    buckets.get(classifyCognitionGroup(task))!.push(task);
  }

  return COGNITION_ORDER.map((key) => ({
    key,
    label: COGNITION_LABELS[key],
    tasks: sortByAttention(buckets.get(key) ?? []),
    defaultCollapsed: COGNITION_COLLAPSED.includes(key),
  })).filter((g) => g.tasks.length > 0);
}

export function cognitionGroupsToTaskGroups(groups: CognitionTaskGroup[]) {
  return groups.map((g) => ({
    key: g.key as string,
    label: g.label,
    tasks: g.tasks,
    defaultCollapsed: g.defaultCollapsed,
  }));
}
