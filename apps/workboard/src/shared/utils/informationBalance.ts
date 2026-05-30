import type { TaskItem, TaskDetail } from '@/api/contracts';
import { getCardOwnerMetaShort, getTaskOwnerDisplay } from '@/runtime/userDisplay';
import type { CollapsedCardSignals, RawTaskSignal } from './signalCollapse';
import type { SignalKind } from './signalHierarchy';

export interface CompactCardLine {
  /** Single scan line: "⚠ Escalation · hạn 04/22 · Trần Thị B" */
  line: string;
  /** Hover tooltip for suppressed signals */
  suppressedTooltip: string;
  /** Dominant label only (no meta) */
  dominant: string | null;
}

export function formatDueShort(dueDate?: string | null): string {
  if (!dueDate) return '';
  return `hạn ${dueDate.slice(5).replace('-', '/')}`;
}

export function prefixDominantSignal(label: string, kind: SignalKind): string {
  if (!label) return '';
  if (kind === 'ESCALATION' || kind === 'CRITICAL_BLOCK') return `⚠ ${label}`;
  return label;
}

function buildSuppressedTooltip(signals: RawTaskSignal[]): string {
  return signals
    .map((s) => s.label)
    .filter(Boolean)
    .join(' · ');
}

/**
 * Collapse card metadata into one operational scan line.
 * Default queue: dominant + at most 2 contextual tokens.
 * Expanded (focus/hover): may include owner + due + secondary.
 */
export function buildCompactCardLine(
  task: TaskItem,
  collapsed: CollapsedCardSignals,
  expanded = false,
  focusMode = false,
): CompactCardLine {
  const parts: string[] = [];
  const primary = collapsed.primary;
  const owner = getCardOwnerMetaShort(task);
  const due = formatDueShort(task.dueDate);

  if (primary?.label) {
    parts.push(prefixDominantSignal(primary.label, primary.kind));
  }

  if (focusMode) {
    return {
      line: primary?.label ? prefixDominantSignal(primary.label, primary.kind) : '',
      suppressedTooltip: buildSuppressedTooltip(collapsed.suppressed),
      dominant: primary?.label ? prefixDominantSignal(primary.label, primary.kind) : null,
    };
  }

  if (expanded) {
    if (due) parts.push(due);
    if (owner) parts.push(owner);
    if (collapsed.secondary?.label) parts.push(collapsed.secondary.label);
  } else {
    if (due) parts.push(due);
    if (owner && parts.length < 3) parts.push(owner);
  }

  return {
    line: parts.join(' · '),
    suppressedTooltip: buildSuppressedTooltip(collapsed.suppressed),
    dominant: primary?.label ? prefixDominantSignal(primary.label, primary.kind) : null,
  };
}

/** Panel execution header — owner + SLA in one line */
export function buildPanelExecutionMeta(task: TaskItem | TaskDetail): string {
  const parts: string[] = [];
  const owner = getTaskOwnerDisplay(task);
  if (owner && owner !== 'Chưa giao') parts.push(owner);
  const due = formatDueShort(task.dueDate);
  if (due) parts.push(due);
  const sla = 'slaStatus' in task ? task.slaStatus : undefined;
  if (sla === 'OVERDUE') parts.push('SLA quá hạn');
  else if (sla === 'AT_RISK') parts.push('SLA rủi ro');
  return parts.join(' · ');
}

export function estimateCardMetaDensity(line: string): number {
  return line.split('·').length;
}

export function isMetadataCompressed(line: string, maxParts = 3): boolean {
  return estimateCardMetaDensity(line) <= maxParts;
}
