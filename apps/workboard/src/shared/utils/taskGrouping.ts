import type { TaskItem } from '@/api/contracts';
import { getTaskOwnerDisplay } from '@/runtime/userDisplay';

export type UrgencyTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';

export type TaskGroupKey =
  | 'overdue'
  | 'blocked'
  | 'waiting'
  | 'approval'
  | 'today'
  | 'upcoming'
  | 'stale'
  | 'mine'
  | 'other';

export interface TaskGroup {
  key: TaskGroupKey | string;
  label: string;
  tasks: TaskItem[];
  defaultCollapsed?: boolean;
}

const GROUP_ORDER: TaskGroupKey[] = [
  'overdue',
  'blocked',
  'waiting',
  'approval',
  'today',
  'upcoming',
  'stale',
  'mine',
  'other',
];

const GROUP_LABELS: Record<TaskGroupKey, string> = {
  overdue: 'Quá hạn',
  blocked: 'Bị kẹt',
  waiting: 'Chờ xử lý',
  approval: 'Chờ duyệt',
  today: 'Hôm nay',
  upcoming: 'Gần tới hạn',
  stale: 'Không cập nhật lâu',
  mine: 'Của tôi',
  other: 'Khác',
};

const DEFAULT_COLLAPSED: TaskGroupKey[] = ['upcoming', 'other', 'mine'];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getUrgencyTier(task: TaskItem): UrgencyTier {
  const u = task.urgency;
  if (u?.needsEscalation || (u?.isOverdue && u?.isBlocked)) return 'CRITICAL';
  if (task.isOverdue || u?.isOverdue || u?.slaRiskLevel === 'HIGH') return 'CRITICAL';
  if (u?.isBlocked || u?.isWaiting || u?.isStale || u?.slaRiskLevel === 'MEDIUM') return 'HIGH';
  if (u?.noOwner || task.status === 'NEW' || task.status === 'ASSIGNED') return 'MEDIUM';
  return 'NORMAL';
}

export function getUrgencyTierStyle(tier: UrgencyTier): {
  border: string;
  badge: string;
  icon: string;
} {
  switch (tier) {
    case 'CRITICAL':
      return {
        border: 'border-l-[3px] border-l-red-500',
        badge: 'bg-red-500/15 text-red-200 border-red-500/40',
        icon: '🔴',
      };
    case 'HIGH':
      return {
        border: 'border-l-[3px] border-l-amber-500',
        badge: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
        icon: '🟠',
      };
    case 'MEDIUM':
      return {
        border: 'border-l-[3px] border-l-slate-500',
        badge: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
        icon: '🟡',
      };
    default:
      return {
        border: '',
        badge: 'bg-surface-overlay text-slate-400 border-border/60',
        icon: '',
      };
  }
}

export function getCompactMetaLine(task: TaskItem): string {
  const parts: string[] = [];
  const u = task.urgency;
  if (task.isOverdue || u?.isOverdue) parts.push('SLA');
  if (u?.isBlocked) parts.push('kẹt');
  if (u?.isWaiting) parts.push('chờ');
  if (u?.isStale && u.staleDays) parts.push(`stale ${u.staleDays}d`);
  if (u?.noOwner || !task.ownerId) parts.push('chưa giao');
  else parts.push(getTaskOwnerDisplay(task));
  if (task.dueDate) parts.push(`hạn ${task.dueDate.slice(5).replace('-', '/')}`);
  return parts.join(' · ');
}

export function getPrimaryUrgencyHint(task: TaskItem): string | null {
  const u = task.urgency;
  if (u?.needsEscalation) return 'Escalation';
  if (task.isOverdue || u?.isOverdue) return 'Quá hạn';
  if (u?.isBlocked) return 'Bị kẹt';
  if (u?.isWaiting) return 'Chờ xử lý';
  if (u?.isStale && u.staleDays) return `Stale ${u.staleDays}d`;
  if (u?.noOwner) return 'Chưa giao';
  return null;
}

export function classifyTaskGroup(task: TaskItem): TaskGroupKey {
  const today = todayIso();
  const u = task.urgency;
  if (task.isOverdue || u?.isOverdue) return 'overdue';
  if (u?.isBlocked || task.status === 'BLOCKED') return 'blocked';
  if (task.status === 'WAITING_APPROVAL') return 'approval';
  if (u?.isWaiting || task.status === 'WAITING') return 'waiting';
  if (task.dueDate === today && task.status !== 'DONE') return 'today';
  if (task.dueDate && task.dueDate > today && task.dueDate <= addDays(today, 3) && task.status !== 'DONE') {
    return 'upcoming';
  }
  if (u?.isStale) return 'stale';
  if (task.isMine) return 'mine';
  return 'other';
}

export function groupOperationalTasks(tasks: TaskItem[]): TaskGroup[] {
  const buckets = new Map<TaskGroupKey, TaskItem[]>();
  for (const key of GROUP_ORDER) buckets.set(key, []);

  for (const task of tasks) {
    if (task.status === 'DONE') continue;
    const key = classifyTaskGroup(task);
    buckets.get(key)!.push(task);
  }

  return GROUP_ORDER.map((key) => ({
    key,
    label: GROUP_LABELS[key],
    tasks: buckets.get(key) ?? [],
    defaultCollapsed: DEFAULT_COLLAPSED.includes(key),
  })).filter((g) => g.tasks.length > 0);
}

export function flattenTaskGroups(groups: TaskGroup[]): TaskItem[] {
  return groups.flatMap((g) => g.tasks);
}
