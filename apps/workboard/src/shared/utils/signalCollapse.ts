import type { TaskItem } from '@/api/contracts';
import { getCardOwnerMetaShort, getTaskOwnerDisplay } from '@/runtime/userDisplay';
import { getPrimaryEscalationSignal } from './escalationRuntime';
import { getWaitingDependency } from './coordinationRuntime';
import {
  SIGNAL_PRIORITY,
  signalKindToPattern,
  type SignalKind,
  type DominantPattern,
} from './signalHierarchy';

export type SignalIntensity = 'full' | 'muted' | 'minimal';

export interface RawTaskSignal {
  kind: SignalKind;
  label: string;
  priority: number;
}

export interface DominantSignalResult {
  kind: SignalKind;
  label: string;
  pattern: DominantPattern;
  intensity: SignalIntensity;
}

export interface CollapsedCardSignals {
  primary: DominantSignalResult | null;
  secondary: { kind: SignalKind; label: string } | null;
  metaShort: string;
  suppressed: RawTaskSignal[];
}

export interface SignalCollapseContext {
  escalationCount?: number;
  totalVisible?: number;
  ownerOverloaded?: boolean;
  viewed?: boolean;
}

const VIEWED_KEY = 'cbv_signal_viewed_tasks';

export function markTaskSignalViewed(taskId: string): void {
  try {
    const raw = sessionStorage.getItem(VIEWED_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(taskId);
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...set].slice(-80)));
  } catch {
    // ignore
  }
}

export function hasViewedTaskSignal(taskId: string): boolean {
  try {
    const raw = sessionStorage.getItem(VIEWED_KEY);
    if (!raw) return false;
    return (JSON.parse(raw) as string[]).includes(taskId);
  } catch {
    return false;
  }
}

export function buildSignalCollapseContext(tasks: TaskItem[]): SignalCollapseContext {
  let escalationCount = 0;
  for (const t of tasks) {
    const esc = getPrimaryEscalationSignal(t);
    if (esc && (esc.level === 'CRITICAL' || esc.level === 'HIGH')) escalationCount++;
    else if (t.urgency?.needsEscalation) escalationCount++;
  }
  return { escalationCount, totalVisible: tasks.length };
}

function collectRawSignals(task: TaskItem, ownerOverloaded?: boolean): RawTaskSignal[] {
  const signals: RawTaskSignal[] = [];
  const u = task.urgency;

  if (task.status === 'DONE') {
    return [{ kind: 'BACKGROUND', label: '', priority: SIGNAL_PRIORITY.BACKGROUND }];
  }

  if (u?.isBlocked || task.status === 'BLOCKED') {
    signals.push({ kind: 'CRITICAL_BLOCK', label: 'Bị kẹt', priority: SIGNAL_PRIORITY.CRITICAL_BLOCK });
  }

  const esc = getPrimaryEscalationSignal(task);
  if (u?.needsEscalation || (esc && esc.level === 'CRITICAL')) {
    signals.push({ kind: 'ESCALATION', label: 'Escalation', priority: SIGNAL_PRIORITY.ESCALATION });
  } else if (esc && esc.level === 'HIGH') {
    signals.push({ kind: 'ESCALATION', label: esc.label.replace(/^Chờ /, 'Chờ ').slice(0, 16), priority: SIGNAL_PRIORITY.ESCALATION });
  }

  if (task.isOverdue || u?.isOverdue) {
    signals.push({ kind: 'OVERDUE', label: 'Quá hạn', priority: SIGNAL_PRIORITY.OVERDUE });
  }

  const waiting = getWaitingDependency(task);
  if (waiting && (task.status === 'WAITING' || task.status === 'WAITING_APPROVAL' || u?.isWaiting)) {
    const short = waiting.waitingLabel.replace(/^Chờ /, '').slice(0, 18);
    signals.push({ kind: 'WAITING_DEPENDENCY', label: short || 'Chờ', priority: SIGNAL_PRIORITY.WAITING_DEPENDENCY });
  } else if (u?.isWaiting || task.status === 'WAITING' || task.status === 'WAITING_APPROVAL') {
    signals.push({ kind: 'FOLLOW_UP', label: 'Chờ phản hồi', priority: SIGNAL_PRIORITY.FOLLOW_UP });
  }

  const staleDays = u?.staleDays ?? 0;
  if (u?.isStale && staleDays >= 7 && staleDays <= 365) {
    signals.push({ kind: 'STALE', label: `${staleDays}d`, priority: SIGNAL_PRIORITY.STALE });
  } else if (u?.isStale && staleDays > 365) {
    signals.push({ kind: 'AWARENESS', label: 'Cũ', priority: SIGNAL_PRIORITY.AWARENESS });
  }

  if (!task.ownerId && u?.noOwner) {
    signals.push({ kind: 'AWARENESS', label: 'Chưa giao', priority: SIGNAL_PRIORITY.AWARENESS });
  }

  if (ownerOverloaded) {
    signals.push({ kind: 'AWARENESS', label: 'Quá tải', priority: SIGNAL_PRIORITY.AWARENESS });
  }

  if (!signals.length) {
    signals.push({ kind: 'BACKGROUND', label: '', priority: SIGNAL_PRIORITY.BACKGROUND });
  }

  return signals.sort((a, b) => a.priority - b.priority);
}

function applyEscalationSaturation(
  primary: RawTaskSignal,
  ctx: SignalCollapseContext,
  escLevel?: 'CRITICAL' | 'HIGH' | 'AWARENESS',
): SignalIntensity {
  if (primary.kind !== 'ESCALATION') {
    if (primary.kind === 'AWARENESS' || primary.kind === 'BACKGROUND') return 'minimal';
    if (primary.kind === 'STALE') return 'muted';
    return 'full';
  }

  if (escLevel === 'CRITICAL' || primary.label === 'Escalation') return 'full';

  const total = ctx.totalVisible ?? 1;
  const escRatio = (ctx.escalationCount ?? 0) / Math.max(total, 1);
  if (ctx.viewed) return 'minimal';
  if (escRatio > 0.25) return 'muted';
  return 'full';
}

export function getCollapsedMetaShort(task: TaskItem, primaryKind: SignalKind): string {
  if (primaryKind === 'OVERDUE' || primaryKind === 'CRITICAL_BLOCK' || primaryKind === 'ESCALATION') {
    return getCardOwnerMetaShort(task);
  }
  if (task.dueDate) {
    return task.dueDate.slice(5).replace('-', '/');
  }
  return getCardOwnerMetaShort(task);
}

export function collapseTaskSignals(task: TaskItem, ctx: SignalCollapseContext = {}): CollapsedCardSignals {
  const raw = collectRawSignals(task, ctx.ownerOverloaded);
  const primaryRaw = raw[0];

  if (primaryRaw.kind === 'BACKGROUND' || !primaryRaw.label) {
    return {
      primary: null,
      secondary: null,
      metaShort: getCollapsedMetaShort(task, 'BACKGROUND'),
      suppressed: raw.slice(1),
    };
  }

  const esc = getPrimaryEscalationSignal(task);
  const intensity = applyEscalationSaturation(primaryRaw, ctx, esc?.level);

  const primary: DominantSignalResult = {
    kind: primaryRaw.kind,
    label: primaryRaw.label,
    pattern: signalKindToPattern(primaryRaw.kind),
    intensity,
  };

  let secondary: { kind: SignalKind; label: string } | null = null;
  const secondaryCandidate = raw.find((s) => s.priority > primaryRaw.priority && s.label && s.kind !== 'BACKGROUND');
  if (secondaryCandidate && primaryRaw.priority <= SIGNAL_PRIORITY.OVERDUE) {
    if (secondaryCandidate.kind === 'STALE' || secondaryCandidate.kind === 'AWARENESS') {
      secondary = { kind: secondaryCandidate.kind, label: secondaryCandidate.label };
    }
  }

  return {
    primary,
    secondary,
    metaShort: getCollapsedMetaShort(task, primaryRaw.kind),
    suppressed: raw.filter((s) => s !== primaryRaw && s !== secondaryCandidate),
  };
}

export function getExpandedSignalDetail(task: TaskItem, ctx: SignalCollapseContext = {}): {
  collapsed: CollapsedCardSignals;
  allSignals: RawTaskSignal[];
} {
  const allSignals = collectRawSignals(task, ctx.ownerOverloaded);
  const collapsed = collapseTaskSignals(task, ctx);
  return { collapsed, allSignals };
}

export function getFullMetaLine(task: TaskItem): string {
  const parts: string[] = [];
  parts.push(getTaskOwnerDisplay(task));
  if (task.dueDate) parts.push(`hạn ${task.dueDate.slice(5).replace('-', '/')}`);
  const u = task.urgency;
  if (u?.isStale && u.staleDays) {
    parts.push(u.staleDays > 365 ? 'lâu không cập nhật' : `${u.staleDays}d chưa cập nhật`);
  }
  if (task.updatedAt) {
    parts.push(`cập nhật ${task.updatedAt.slice(0, 10)}`);
  }
  return parts.join(' · ');
}
