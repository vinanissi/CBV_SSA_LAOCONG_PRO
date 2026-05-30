import type { TaskItem } from '@/api/contracts';
import { getEscalationSignals, type EscalationLevel } from './escalationRuntime';
import { getWaitingDependency } from './coordinationRuntime';

export type CoordinationSignalLevel = 'CRITICAL_BLOCK' | 'ACTIVE_WAITING' | 'AWARENESS' | 'HISTORICAL';

export function getCoordinationSignalLevel(task: TaskItem): CoordinationSignalLevel {
  const esc = getEscalationSignals(task);
  if (esc.some((e) => e.level === 'CRITICAL')) return 'CRITICAL_BLOCK';
  if (getWaitingDependency(task)) return 'ACTIVE_WAITING';
  if (esc.some((e) => e.level === 'HIGH')) return 'AWARENESS';
  const stale = task.urgency?.staleDays ?? 0;
  if (stale > 365) return 'HISTORICAL';
  return 'AWARENESS';
}

export function shouldShowCoordinationChipOnCard(task: TaskItem): boolean {
  const level = getCoordinationSignalLevel(task);
  return level === 'CRITICAL_BLOCK' || level === 'ACTIVE_WAITING';
}

export function shouldShowEscalationOnCard(task: TaskItem): boolean {
  const level = getCoordinationSignalLevel(task);
  if (level === 'HISTORICAL') return false;
  return getEscalationSignals(task).some((e) => e.level === 'CRITICAL' || e.level === 'HIGH');
}

export function filterCoordinationSignalsForDegraded(degraded: boolean, showAll: boolean): boolean {
  if (degraded && !showAll) return false;
  return true;
}

export function escalationLevelOrder(level: EscalationLevel): number {
  return { CRITICAL: 0, HIGH: 1, AWARENESS: 2 }[level];
}
