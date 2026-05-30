import type { TaskItem } from '@/api/contracts';
import { getWaitingDependency } from './coordinationRuntime';

export type EscalationLevel = 'CRITICAL' | 'HIGH' | 'AWARENESS';

export interface EscalationSignal {
  level: EscalationLevel;
  label: string;
  suggestAction: string;
}

export function getEscalationSignals(task: TaskItem): EscalationSignal[] {
  const signals: EscalationSignal[] = [];
  const waiting = getWaitingDependency(task);
  const staleDays = task.urgency?.staleDays ?? 0;

  if (task.isOverdue || task.urgency?.isOverdue) {
    signals.push({
      level: 'CRITICAL',
      label: 'Quá hạn SLA',
      suggestAction: 'Ưu tiên xử lý ngay',
    });
  }

  if (task.urgency?.needsEscalation) {
    signals.push({
      level: 'CRITICAL',
      label: 'Cần escalation',
      suggestAction: 'Escalate tới quản lý',
    });
  }

  if (waiting?.waitingDurationHours != null && waiting.waitingDurationHours >= 48) {
    signals.push({
      level: 'HIGH',
      label: `Chờ ${waiting.waitingDurationHours}h`,
      suggestAction: `Follow-up: ${waiting.waitingLabel}`,
    });
  } else if (waiting?.waitingDurationHours != null && waiting.waitingDurationHours >= 24) {
    signals.push({
      level: 'AWARENESS',
      label: `Chờ ${waiting.waitingDurationHours}h`,
      suggestAction: 'Theo dõi phản hồi',
    });
  }

  if (task.status === 'WAITING_APPROVAL' && staleDays >= 3) {
    signals.push({
      level: 'HIGH',
      label: 'Duyệt stale',
      suggestAction: 'Nhắc người duyệt',
    });
  }

  if (task.urgency?.isBlocked && staleDays >= 5) {
    signals.push({
      level: 'HIGH',
      label: 'Blocked lâu',
      suggestAction: 'Gỡ vướng / escalate',
    });
  }

  return signals;
}

export function getPrimaryEscalationSignal(task: TaskItem): EscalationSignal | null {
  const signals = getEscalationSignals(task);
  if (!signals.length) return null;
  const order: EscalationLevel[] = ['CRITICAL', 'HIGH', 'AWARENESS'];
  return signals.sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level))[0];
}

export function getEscalationChipClass(level: EscalationLevel): string {
  switch (level) {
    case 'CRITICAL':
      return 'escalation-chip escalation-critical';
    case 'HIGH':
      return 'escalation-chip escalation-high';
    default:
      return 'escalation-chip escalation-awareness';
  }
}
