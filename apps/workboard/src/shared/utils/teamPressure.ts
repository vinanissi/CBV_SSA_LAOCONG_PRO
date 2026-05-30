import type { TaskItem } from '@/api/contracts';
import { getTaskOwnerDisplay } from '@/runtime/userDisplay';
import { isOwnerOverloadedByIdentity } from '@/runtime/runtimeIdentity';

export interface OwnerPressure {
  ownerId: string;
  displayName: string;
  pending: number;
  overdue: number;
  waitingApprovals: number;
  overloaded: boolean;
}

export function computeTeamPressure(tasks: TaskItem[]): OwnerPressure[] {
  const map = new Map<string, OwnerPressure>();

  for (const task of tasks) {
    if (task.status === 'DONE') continue;
    const id = task.ownerId || '_unassigned';
    const name = id === '_unassigned' ? 'Chưa giao' : getTaskOwnerDisplay(task);
    const entry = map.get(id) ?? {
      ownerId: id,
      displayName: name,
      pending: 0,
      overdue: 0,
      waitingApprovals: 0,
      overloaded: false,
    };

    entry.pending += 1;
    if (task.isOverdue || task.urgency?.isOverdue) entry.overdue += 1;
    if (task.status === 'WAITING_APPROVAL') entry.waitingApprovals += 1;
    map.set(id, entry);
  }

  return [...map.values()]
    .map((p) => ({
      ...p,
      overloaded: isOwnerOverloadedByIdentity(p.ownerId, p.pending, p.overdue),
    }))
    .sort((a, b) => b.pending - a.pending);
}

export function getOwnerOverloadHint(ownerId: string, tasks: TaskItem[]): string | null {
  if (!ownerId) return null;
  const pressure = computeTeamPressure(tasks).find((p) => p.ownerId === ownerId);
  if (!pressure?.overloaded) return null;
  return `⚠ ${pressure.displayName} đang quá tải (${pressure.pending} việc, ${pressure.overdue} quá hạn)`;
}

export function getOverloadedOwnerIds(tasks: TaskItem[]): Set<string> {
  return new Set(computeTeamPressure(tasks).filter((p) => p.overloaded).map((p) => p.ownerId));
}
