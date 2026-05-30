import type { SignalKind } from './signalHierarchy';
import type { CollapsedCardSignals } from './signalCollapse';

export type HotSignalClass =
  | 'task-signal-blocked'
  | 'task-signal-hot'
  | 'task-signal-overdue'
  | 'task-signal-waiting'
  | 'task-signal-neutral';

/** Thin left operational signal bar — no full-card tint. */
export function getHotSignalClass(kind: SignalKind | null | undefined): HotSignalClass {
  switch (kind) {
    case 'CRITICAL_BLOCK':
      return 'task-signal-blocked';
    case 'ESCALATION':
      return 'task-signal-hot';
    case 'OVERDUE':
      return 'task-signal-overdue';
    case 'WAITING_DEPENDENCY':
    case 'FOLLOW_UP':
      return 'task-signal-waiting';
    default:
      return 'task-signal-neutral';
  }
}

export function resolveCardHotSignalClass(
  collapsed: CollapsedCardSignals,
  suppressSignals = false,
): HotSignalClass {
  if (suppressSignals || !collapsed.primary) return 'task-signal-neutral';
  return getHotSignalClass(collapsed.primary.kind);
}
