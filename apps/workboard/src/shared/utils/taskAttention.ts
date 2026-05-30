import type { TaskItem } from '@/api/contracts';

export type AttentionLevel = 'ACTION_NOW' | 'HIGH_ATTENTION' | 'AWARENESS' | 'BACKGROUND';

export function getAttentionLevel(task: TaskItem): AttentionLevel {
  const u = task.urgency;
  const staleDays = u?.staleDays ?? 0;

  if (task.status === 'DONE') return 'BACKGROUND';
  if (staleDays > 365 && !task.isOverdue && !u?.isBlocked && !u?.needsEscalation) {
    return 'BACKGROUND';
  }

  if (u?.needsEscalation) return 'ACTION_NOW';
  if ((task.isOverdue || u?.isOverdue) && task.isMine) return 'ACTION_NOW';
  if ((task.isOverdue || u?.isOverdue) && u?.slaRiskLevel === 'HIGH') return 'ACTION_NOW';
  if (u?.isBlocked && task.ownerId && (u.isWaiting || task.status === 'BLOCKED')) return 'ACTION_NOW';

  if (task.isOverdue || u?.isOverdue) return 'HIGH_ATTENTION';
  if (u?.isBlocked) return 'HIGH_ATTENTION';
  if (u?.noOwner || !task.ownerId) return 'HIGH_ATTENTION';
  if (u?.isStale && staleDays >= 5 && staleDays <= 365) return 'HIGH_ATTENTION';
  if (task.dueDate) {
    const diffDays = (new Date(task.dueDate).getTime() - Date.now()) / 86_400_000;
    if (diffDays >= 0 && diffDays <= 3) return 'HIGH_ATTENTION';
  }

  if (u?.isWaiting || task.status === 'WAITING' || task.status === 'WAITING_APPROVAL') {
    return 'AWARENESS';
  }
  if (u?.isStale && staleDays > 365) return 'AWARENESS';

  return 'AWARENESS';
}

export function getAttentionStyle(level: AttentionLevel): {
  card: string;
  signal: string;
  opacity: string;
} {
  switch (level) {
    case 'ACTION_NOW':
      return {
        card: 'attention-action-now border-l-[3px] border-l-red-500 bg-red-50',
        signal: 'text-red-700 font-semibold',
        opacity: '',
      };
    case 'HIGH_ATTENTION':
      return {
        card: 'attention-high border-l-[3px] border-l-amber-500 bg-amber-50/80',
        signal: 'text-amber-800 font-medium',
        opacity: '',
      };
    case 'BACKGROUND':
      return {
        card: 'attention-background opacity-50',
        signal: 'text-operational-muted',
        opacity: 'opacity-50',
      };
    default:
      return {
        card: 'attention-awareness',
        signal: 'text-operational-muted',
        opacity: 'opacity-85',
      };
  }
}

export function sortByAttention(tasks: TaskItem[]): TaskItem[] {
  const order: Record<AttentionLevel, number> = {
    ACTION_NOW: 0,
    HIGH_ATTENTION: 1,
    AWARENESS: 2,
    BACKGROUND: 3,
  };
  return [...tasks].sort((a, b) => order[getAttentionLevel(a)] - order[getAttentionLevel(b)]);
}
