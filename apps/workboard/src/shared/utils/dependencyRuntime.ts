import type { TaskItem } from '@/api/contracts';
import { getTaskNextAction } from './taskNextAction';

export type DependencyKind =
  | 'CUSTOMER'
  | 'FINANCE'
  | 'MANAGER'
  | 'DOCUMENT'
  | 'INVOICE'
  | 'EXTERNAL'
  | 'BLOCKED';

export interface TaskDependency {
  kind: DependencyKind;
  label: string;
  waiting: boolean;
}

function inferKind(text: string, task: TaskItem): DependencyKind {
  const t = text.toLowerCase();
  if (t.includes('khách') || t.includes('gọi') || t.includes('liên hệ')) return 'CUSTOMER';
  if (t.includes('kế toán') || t.includes('finance') || t.includes('thanh toán')) return 'FINANCE';
  if (t.includes('duyệt') || t.includes('quản lý') || t.includes('phê duyệt')) return 'MANAGER';
  if (t.includes('gplx') || t.includes('cccd') || t.includes('tài liệu') || t.includes('upload')) return 'DOCUMENT';
  if (t.includes('hóa đơn') || t.includes('invoice')) return 'INVOICE';
  if (task.urgency?.isBlocked || task.status === 'BLOCKED') return 'BLOCKED';
  return 'EXTERNAL';
}

export function getTaskDependencies(task: TaskItem): TaskDependency[] {
  const deps: TaskDependency[] = [];
  const waiting =
    task.status === 'WAITING' ||
    task.status === 'WAITING_APPROVAL' ||
    task.urgency?.isWaiting ||
    task.urgency?.isBlocked;

  if (task.pendingAction?.trim()) {
    deps.push({
      kind: inferKind(task.pendingAction, task),
      label: task.pendingAction.trim(),
      waiting: Boolean(waiting),
    });
  }

  if (task.blockReason?.trim() && !deps.some((d) => d.label === task.blockReason)) {
    deps.push({
      kind: 'BLOCKED',
      label: task.blockReason.trim(),
      waiting: true,
    });
  }

  if (task.status === 'WAITING_APPROVAL' && !deps.length) {
    deps.push({ kind: 'MANAGER', label: 'Chờ phê duyệt', waiting: true });
  }

  if ((task.status === 'WAITING' || task.urgency?.isWaiting) && !deps.length) {
    const next = getTaskNextAction(task);
    deps.push({ kind: inferKind(next.label, task), label: next.label, waiting: true });
  }

  return deps;
}

export function getPrimaryDependencyChip(task: TaskItem): string | null {
  const deps = getTaskDependencies(task);
  if (!deps.length) return null;
  const d = deps[0];
  const prefix = d.waiting ? '⏳' : '↗';
  return `${prefix} ${d.label.length > 28 ? d.label.slice(0, 28) + '…' : d.label}`;
}

export function getDependencyChipClass(kind: DependencyKind): string {
  switch (kind) {
    case 'CUSTOMER':
      return 'dependency-chip dependency-customer';
    case 'FINANCE':
      return 'dependency-chip dependency-finance';
    case 'MANAGER':
      return 'dependency-chip dependency-manager';
    case 'BLOCKED':
      return 'dependency-chip dependency-blocked';
    default:
      return 'dependency-chip dependency-default';
  }
}
