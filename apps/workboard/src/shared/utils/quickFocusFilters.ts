import type { RhythmMode, CoordinationQueueMode } from './workingContext';

/** Intention-first quick focus — merges rhythm + coordination dimensions. */
export type QuickFocusFilter = 'all' | 'quick' | 'call' | 'wait_response' | 'escalation' | 'overload';

export interface QuickFocusDef {
  key: QuickFocusFilter;
  label: string;
  icon: string;
}

export const QUICK_FOCUS_FILTERS: QuickFocusDef[] = [
  { key: 'quick', label: 'Việc nhanh', icon: '⚡' },
  { key: 'call', label: 'Gọi điện', icon: '📞' },
  { key: 'wait_response', label: 'Chờ phản hồi', icon: '⏳' },
  { key: 'escalation', label: 'Escalation', icon: '⚠' },
  { key: 'overload', label: 'Quá tải', icon: '👥' },
];

const RHYTHM_KEYS = new Set<RhythmMode>(['quick', 'call']);
const COORD_KEYS = new Set<CoordinationQueueMode>(['wait_response', 'escalation', 'overload']);

export function quickFocusFromLegacy(rhythm: RhythmMode, coordination: CoordinationQueueMode): QuickFocusFilter {
  if (COORD_KEYS.has(coordination) && coordination !== 'all') {
    return coordination as QuickFocusFilter;
  }
  if (RHYTHM_KEYS.has(rhythm)) {
    return rhythm as QuickFocusFilter;
  }
  return 'all';
}

export function quickFocusToLegacy(focus: QuickFocusFilter): {
  rhythmMode: RhythmMode;
  coordinationMode: CoordinationQueueMode;
} {
  switch (focus) {
    case 'quick':
      return { rhythmMode: 'quick', coordinationMode: 'all' };
    case 'call':
      return { rhythmMode: 'call', coordinationMode: 'all' };
    case 'wait_response':
      return { rhythmMode: 'all', coordinationMode: 'wait_response' };
    case 'escalation':
      return { rhythmMode: 'all', coordinationMode: 'escalation' };
    case 'overload':
      return { rhythmMode: 'all', coordinationMode: 'overload' };
    default:
      return { rhythmMode: 'all', coordinationMode: 'all' };
  }
}
