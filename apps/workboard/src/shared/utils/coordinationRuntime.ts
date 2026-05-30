import type { TaskItem } from '@/api/contracts';
import { getTaskDependencies, type DependencyKind } from './dependencyRuntime';

export type WaitingType =
  | 'FINANCE_APPROVAL'
  | 'CUSTOMER'
  | 'MANAGER_APPROVAL'
  | 'DOCUMENT'
  | 'PARTNER'
  | 'BLOCKED'
  | 'EXTERNAL';

export interface WaitingDependency {
  waitingType: WaitingType;
  waitingLabel: string;
  waitingOwner?: string;
  waitingSince?: string;
  waitingDurationHours?: number;
}

function kindToWaitingType(kind: DependencyKind): WaitingType {
  switch (kind) {
    case 'FINANCE':
      return 'FINANCE_APPROVAL';
    case 'CUSTOMER':
      return 'CUSTOMER';
    case 'MANAGER':
      return 'MANAGER_APPROVAL';
    case 'DOCUMENT':
      return 'DOCUMENT';
    case 'BLOCKED':
      return 'BLOCKED';
    default:
      return 'EXTERNAL';
  }
}

function inferWaitingOwner(task: TaskItem, kind: DependencyKind): string | undefined {
  if (kind === 'FINANCE') return 'FINANCE';
  if (kind === 'CUSTOMER') return 'CUSTOMER';
  if (kind === 'MANAGER') return 'SUPERVISOR';
  if (task.ownerId && kind !== 'EXTERNAL') return task.ownerId;
  return undefined;
}

function hoursSince(iso?: string): number | undefined {
  if (!iso) return undefined;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return undefined;
  return Math.round(ms / 3_600_000);
}

export function getWaitingDependency(task: TaskItem): WaitingDependency | null {
  const deps = getTaskDependencies(task).filter((d) => d.waiting);
  if (!deps.length) return null;

  const primary = deps[0];
  const waitingSince = task.updatedAt ?? task.dueDate;
  const hours = hoursSince(waitingSince);

  return {
    waitingType: kindToWaitingType(primary.kind),
    waitingLabel: primary.label,
    waitingOwner: inferWaitingOwner(task, primary.kind),
    waitingSince,
    waitingDurationHours: hours,
  };
}

export function getWaitingChainLabel(task: TaskItem): string | null {
  const w = getWaitingDependency(task);
  if (!w) return null;
  if (w.waitingDurationHours != null && w.waitingDurationHours >= 24) {
    return `⏳ ${w.waitingLabel} (${w.waitingDurationHours}h)`;
  }
  return `⏳ ${w.waitingLabel}`;
}

export function getWaitingChipClass(type: WaitingType): string {
  switch (type) {
    case 'FINANCE_APPROVAL':
      return 'waiting-chip waiting-finance';
    case 'CUSTOMER':
      return 'waiting-chip waiting-customer';
    case 'MANAGER_APPROVAL':
      return 'waiting-chip waiting-manager';
    case 'DOCUMENT':
      return 'waiting-chip waiting-document';
    case 'BLOCKED':
      return 'waiting-chip waiting-blocked';
    default:
      return 'waiting-chip waiting-default';
  }
}
