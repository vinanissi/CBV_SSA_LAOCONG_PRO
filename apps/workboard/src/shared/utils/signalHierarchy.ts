/** Signal priority — lower number = higher dominance on card. */
export type SignalKind =
  | 'CRITICAL_BLOCK'
  | 'ESCALATION'
  | 'OVERDUE'
  | 'WAITING_DEPENDENCY'
  | 'FOLLOW_UP'
  | 'STALE'
  | 'AWARENESS'
  | 'BACKGROUND';

export const SIGNAL_PRIORITY: Record<SignalKind, number> = {
  CRITICAL_BLOCK: 1,
  ESCALATION: 2,
  OVERDUE: 3,
  WAITING_DEPENDENCY: 4,
  FOLLOW_UP: 5,
  STALE: 6,
  AWARENESS: 7,
  BACKGROUND: 8,
};

export type DominantPattern = 'critical' | 'escalation' | 'overdue' | 'waiting' | 'stale' | 'awareness' | 'neutral';

export function signalKindToPattern(kind: SignalKind): DominantPattern {
  switch (kind) {
    case 'CRITICAL_BLOCK':
      return 'critical';
    case 'ESCALATION':
      return 'escalation';
    case 'OVERDUE':
      return 'overdue';
    case 'WAITING_DEPENDENCY':
    case 'FOLLOW_UP':
      return 'waiting';
    case 'STALE':
      return 'stale';
    case 'AWARENESS':
      return 'awareness';
    default:
      return 'neutral';
  }
}

export function isHigherPriority(a: SignalKind, b: SignalKind): boolean {
  return SIGNAL_PRIORITY[a] < SIGNAL_PRIORITY[b];
}
