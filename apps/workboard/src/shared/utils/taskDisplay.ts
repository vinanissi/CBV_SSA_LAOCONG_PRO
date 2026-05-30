import type { TaskItem } from '@/api/contracts';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/shared/constants';

const PLATE_RE = /\b(\d{2}[A-Z]-?\d{3,6})\b/i;
const NAME_SPLIT_RE = /[—–-]\s*(.+)$/;

export function extractTaskSubtitle(title: string): string {
  const plate = title.match(PLATE_RE)?.[1];
  const namePart = title.match(NAME_SPLIT_RE)?.[1]?.trim();
  if (namePart && plate) return `${namePart} · ${plate}`;
  if (namePart) return namePart;
  if (plate) return `Biển số ${plate}`;
  return 'Việc vận hành';
}

export function getPriorityStyle(priority: string, status: string) {
  if (status === 'DONE') {
    return { label: 'Hoàn thành', className: 'bg-priority-done-bg text-priority-done border-priority-done/30' };
  }
  switch (priority) {
    case 'URGENT':
      return { label: PRIORITY_LABELS.URGENT, className: 'bg-priority-urgent-bg text-red-300 border-priority-urgent/40' };
    case 'HIGH':
      return { label: PRIORITY_LABELS.HIGH, className: 'bg-priority-high-bg text-amber-200 border-priority-high/40' };
    case 'LOW':
      return { label: PRIORITY_LABELS.LOW, className: 'bg-priority-normal-bg text-slate-400 border-priority-normal/30' };
    default:
      return { label: PRIORITY_LABELS.MEDIUM, className: 'bg-priority-normal-bg text-slate-300 border-priority-normal/30' };
  }
}

export function getUrgencyLabels(task: TaskItem): string[] {
  if (task.urgency?.labels?.length) return task.urgency.labels;
  const labels: string[] = [];
  if (task.isOverdue || task.urgency?.isOverdue) labels.push('Quá hạn SLA');
  if (task.urgency?.isWaiting || task.status === 'WAITING') labels.push('Chờ xử lý');
  if (task.urgency?.isBlocked || task.status === 'BLOCKED') labels.push('Bị kẹt');
  if (task.urgency?.noOwner || !task.ownerId) labels.push('Chưa có người xử lý');
  if (task.urgency?.isStale && task.urgency.staleDays) {
    labels.push(`Không cập nhật ${task.urgency.staleDays} ngày`);
  }
  if (task.pendingAction) labels.push(task.pendingAction);
  return labels;
}

export function getSlaLabel(task: TaskItem): string | null {
  const labels = getUrgencyLabels(task);
  return labels[0] ?? null;
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export { getUrgencyTier, getUrgencyTierStyle, getCompactMetaLine, getPrimaryUrgencyHint } from './taskGrouping';
export type { UrgencyTier } from './taskGrouping';
export { getAttentionLevel, getAttentionStyle, sortByAttention } from './taskAttention';
export type { AttentionLevel } from './taskAttention';
export { getTaskNextAction, getNextActionChipClass } from './taskNextAction';
export type { TaskNextAction, NextActionPriority } from './taskNextAction';
export {
  getFilteredCriticalSignal,
  getFilteredMetaLine,
  filterRuntimeWarningsForCards,
  isHistoricalStale,
} from './taskSignalFiltering';
export { groupCognitionTasks, cognitionGroupsToTaskGroups, classifyCognitionGroup } from './taskCognitionGrouping';
export type { CognitionGroupKey, CognitionTaskGroup } from './taskCognitionGrouping';
