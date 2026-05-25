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

export function getSlaLabel(task: TaskItem): string | null {
  if (task.isOverdue) return 'Quá hạn SLA';
  if (task.status === 'WAITING') return 'Chờ xử lý';
  if (task.status === 'IN_PROGRESS') return 'Đang xử lý';
  return null;
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
