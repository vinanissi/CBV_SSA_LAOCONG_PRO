import type { TaskItem } from '@/api/contracts';
import { getTaskOwnerDisplay } from '@/runtime/userDisplay';
import { collapseTaskSignals, type SignalCollapseContext } from './signalCollapse';

const HISTORICAL_STALE_DAYS = 365;

export function isHistoricalStale(task: TaskItem): boolean {
  const days = task.urgency?.staleDays ?? 0;
  return days > HISTORICAL_STALE_DAYS;
}

/** Card meta — minimal scan line */
export function getFilteredCriticalSignal(task: TaskItem, ctx?: SignalCollapseContext): string | null {
  const c = collapseTaskSignals(task, ctx);
  return c.primary?.label ?? null;
}

/** Card meta — minimal scan line */
export function getFilteredMetaLine(task: TaskItem, ctx?: SignalCollapseContext): string {
  const c = collapseTaskSignals(task, ctx);
  return c.metaShort;
}

/** Panel meta — full detail */
export function getFilteredMetaLineFull(task: TaskItem): string {
  const parts: string[] = [];
  parts.push(getTaskOwnerDisplay(task));
  if (task.dueDate) parts.push(`hạn ${task.dueDate.slice(5).replace('-', '/')}`);
  const u = task.urgency;
  if (u?.isStale && u.staleDays) {
    parts.push(u.staleDays > 365 ? 'lâu không cập nhật' : `${u.staleDays}d chưa cập nhật`);
  }
  return parts.join(' · ');
}

export function filterRuntimeWarningsForCards(degraded: boolean, warnings: string[]): string[] {
  if (!degraded) return warnings;
  return warnings.filter((w) => !w.includes('chậm') && !w.includes('đồng bộ'));
}
