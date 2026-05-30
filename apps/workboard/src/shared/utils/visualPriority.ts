import type { DominantPattern } from './signalHierarchy';
import type { SignalIntensity } from './signalCollapse';
import { getAttentionLevel, getAttentionStyle } from './taskAttention';
import type { TaskItem } from '@/api/contracts';
import type { CollapsedCardSignals } from './signalCollapse';

export function getDominantPatternClass(pattern: DominantPattern, intensity: SignalIntensity): string {
  const fade = intensity === 'minimal' ? ' signal-intensity-minimal' : intensity === 'muted' ? ' signal-intensity-muted' : '';
  switch (pattern) {
    case 'critical':
      return `signal-pattern-critical${fade}`;
    case 'escalation':
      return `signal-pattern-escalation${fade}`;
    case 'overdue':
      return `signal-pattern-overdue${fade}`;
    case 'waiting':
      return `signal-pattern-waiting${fade}`;
    case 'stale':
      return `signal-pattern-stale${fade}`;
    case 'awareness':
      return `signal-pattern-awareness${fade}`;
    default:
      return `signal-pattern-neutral${fade}`;
  }
}

export function getDominantLabelClass(intensity: SignalIntensity, pattern: DominantPattern): string {
  const base = 'dominant-signal-label';
  if (intensity === 'minimal') return `${base} dominant-minimal`;
  if (intensity === 'muted') return `${base} dominant-muted`;
  switch (pattern) {
    case 'critical':
      return `${base} dominant-critical`;
    case 'escalation':
      return `${base} dominant-escalation`;
    case 'overdue':
      return `${base} dominant-overdue`;
    case 'waiting':
      return `${base} dominant-waiting`;
    default:
      return `${base} dominant-default`;
  }
}

/** Fallback card chrome when signal collapse suppressed (degraded mode). */
export function getLegacyAttentionCardClass(task: TaskItem): string {
  return getAttentionStyle(getAttentionLevel(task)).card;
}

export function shouldShowNextActionChip(collapsed: CollapsedCardSignals, nextPriority: string): boolean {
  if (collapsed.primary) return false;
  return nextPriority === 'HIGH';
}

export function shortenNextActionLabel(label: string): string {
  if (label.length <= 14) return label;
  return `${label.slice(0, 12)}…`;
}
