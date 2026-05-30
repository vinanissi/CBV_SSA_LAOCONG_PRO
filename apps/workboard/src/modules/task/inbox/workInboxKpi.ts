import type { TaskItem, TaskWorkspaceCounts } from '@/api/contracts';

export interface WorkInboxKpiMetrics {
  total: number;
  overdue: number;
  open: number;
  alerts: number;
}

/** Derive operator KPIs from existing snapshot counts or task rows — no new API. */
export function deriveWorkInboxKpi(
  tasks: TaskItem[],
  counts?: TaskWorkspaceCounts | null,
): WorkInboxKpiMetrics {
  if (counts) {
    const open = (counts.open ?? 0) + (counts.inProgress ?? 0);
    const alerts = (counts.blocked ?? 0) + (counts.overdue ?? 0) + (counts.noOwner ?? 0);
    return {
      total: counts.total ?? tasks.length,
      overdue: counts.overdue ?? 0,
      open,
      alerts,
    };
  }

  const total = tasks.length;
  const overdue = tasks.filter((t) => t.isOverdue || t.urgency?.isOverdue).length;
  const open = tasks.filter((t) => {
    const s = (t.status || '').toUpperCase();
    return s !== 'DONE' && s !== 'COMPLETED';
  }).length;
  const alerts = tasks.filter(
    (t) =>
      t.isOverdue ||
      t.urgency?.isBlocked ||
      t.urgency?.needsEscalation ||
      t.urgency?.noOwner,
  ).length;

  return { total, overdue, open, alerts };
}
