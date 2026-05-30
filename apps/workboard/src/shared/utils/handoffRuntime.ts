import type { TaskItem, TimelineItem } from '@/api/contracts';
import { getTaskOwnerDisplay, resolveUserRefLabel } from '@/runtime/userDisplay';
import { getWaitingDependency } from './coordinationRuntime';

export type HandoffKind = 'OWNER' | 'HANDOFF' | 'WAITING' | 'EXTERNAL';

export interface HandoffStep {
  label: string;
  actor?: string;
  kind: HandoffKind;
}

const HANDOFF_RE = /giao|handoff|chuyển|assign|→/i;
const WAITING_RE = /chờ|waiting|pending/i;

export function isHandoffTimelineItem(item: TimelineItem): boolean {
  const text = `${item.action} ${item.message}`.toLowerCase();
  return HANDOFF_RE.test(text) || text.includes('→');
}

export function isWaitingTimelineItem(item: TimelineItem): boolean {
  const text = `${item.action} ${item.message}`.toLowerCase();
  return WAITING_RE.test(text);
}

export function parseHandoffFromTimeline(items: TimelineItem[]): HandoffStep[] {
  const steps: HandoffStep[] = [];
  for (const item of items) {
    const text = `${item.action} ${item.message}`;
    if (isHandoffTimelineItem(item)) {
      const arrow = text.match(/(\S+)\s*→\s*(\S+)/);
      steps.push({
        kind: 'HANDOFF',
        label: arrow
          ? `${resolveUserRefLabel(arrow[1])} → ${resolveUserRefLabel(arrow[2])}`
          : text.slice(0, 48),
        actor: item.actor,
      });
    } else if (isWaitingTimelineItem(item)) {
      steps.push({ kind: 'WAITING', label: item.message || item.action, actor: item.actor });
    }
  }
  return steps.slice(0, 5);
}

export function buildHandoffChain(task: TaskItem, timeline: TimelineItem[] = []): HandoffStep[] {
  const chain: HandoffStep[] = [];

  if (task.ownerId || task.owner) {
    chain.push({ kind: 'OWNER', label: getTaskOwnerDisplay(task), actor: task.ownerId });
  }

  const fromTimeline = parseHandoffFromTimeline(timeline);
  chain.push(...fromTimeline);

  const waiting = getWaitingDependency(task);
  if (waiting) {
    const target = waiting.waitingOwner ?? waiting.waitingType;
    if (!chain.some((s) => s.label.includes(target))) {
      chain.push({
        kind: 'WAITING',
        label: waiting.waitingLabel,
        actor: waiting.waitingOwner ? resolveUserRefLabel(waiting.waitingOwner) : undefined,
      });
    }
    if (waiting.waitingType === 'FINANCE_APPROVAL') {
      chain.push({ kind: 'EXTERNAL', label: 'FINANCE' });
    }
    if (waiting.waitingType === 'CUSTOMER') {
      chain.push({ kind: 'EXTERNAL', label: 'CUSTOMER' });
    }
    if (waiting.waitingType === 'MANAGER_APPROVAL') {
      chain.push({ kind: 'EXTERNAL', label: 'SUPERVISOR' });
    }
  }

  return chain.slice(0, 6);
}

export function formatHandoffChain(steps: HandoffStep[]): string {
  return steps.map((s) => s.label).join(' → ');
}
