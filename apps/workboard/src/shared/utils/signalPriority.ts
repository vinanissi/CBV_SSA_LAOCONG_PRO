import type { SignalKind } from './signalHierarchy';
import { SIGNAL_PRIORITY } from './signalHierarchy';

/** GS_09H — 4-level signal strength for card vs panel disclosure */
export type SignalLevel = 1 | 2 | 3 | 4;

export function getSignalLevel(kind: SignalKind): SignalLevel {
  if (kind === 'CRITICAL_BLOCK') return 1;
  if (kind === 'ESCALATION' || kind === 'OVERDUE') return 2;
  if (kind === 'WAITING_DEPENDENCY' || kind === 'FOLLOW_UP') return 3;
  return 4;
}

export function isDominantSignal(kind: SignalKind): boolean {
  return getSignalLevel(kind) <= 2;
}

export function shouldShowSecondaryOnCard(
  primaryKind: SignalKind,
  secondaryKind: SignalKind,
  expanded: boolean,
): boolean {
  if (!expanded) return false;
  if (getSignalLevel(secondaryKind) >= 4) return false;
  return getSignalLevel(secondaryKind) > getSignalLevel(primaryKind);
}

export function compareSignalPriority(a: SignalKind, b: SignalKind): number {
  return SIGNAL_PRIORITY[a] - SIGNAL_PRIORITY[b];
}
