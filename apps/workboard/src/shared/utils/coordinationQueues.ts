import type { TaskItem } from '@/api/contracts';
import { getWaitingDependency } from './coordinationRuntime';
import { getEscalationSignals } from './escalationRuntime';
import { getOverloadedOwnerIds } from './teamPressure';

export type CoordinationQueueMode =
  | 'all'
  | 'wait_response'
  | 'wait_approval'
  | 'wait_customer'
  | 'wait_document'
  | 'follow_up'
  | 'escalation'
  | 'overload';

export interface CoordinationQueueDef {
  key: CoordinationQueueMode;
  label: string;
}

export const COORDINATION_QUEUES: CoordinationQueueDef[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'wait_response', label: 'Chờ phản hồi' },
  { key: 'wait_approval', label: 'Chờ duyệt' },
  { key: 'wait_customer', label: 'Chờ khách' },
  { key: 'wait_document', label: 'Chờ tài liệu' },
  { key: 'follow_up', label: 'Follow-up' },
  { key: 'escalation', label: 'Escalation' },
  { key: 'overload', label: 'Quá tải' },
];

export function filterTasksByCoordinationQueue(
  tasks: TaskItem[],
  mode: CoordinationQueueMode,
  allTasksForPressure?: TaskItem[],
): TaskItem[] {
  if (mode === 'all') return tasks;

  const overloaded = getOverloadedOwnerIds(allTasksForPressure ?? tasks);

  return tasks.filter((task) => {
    const waiting = getWaitingDependency(task);
    const pa = (task.pendingAction || '').toLowerCase();
    const esc = getEscalationSignals(task);

    switch (mode) {
      case 'wait_response':
        return task.status === 'WAITING' || task.urgency?.isWaiting;
      case 'wait_approval':
        return task.status === 'WAITING_APPROVAL';
      case 'wait_customer':
        return waiting?.waitingType === 'CUSTOMER' || pa.includes('khách') || pa.includes('gọi');
      case 'wait_document':
        return waiting?.waitingType === 'DOCUMENT' || pa.includes('gplx') || pa.includes('tài liệu') || pa.includes('upload');
      case 'follow_up':
        return esc.some((e) => e.suggestAction.toLowerCase().includes('follow'));
      case 'escalation':
        return esc.some((e) => e.level === 'CRITICAL' || e.level === 'HIGH') || task.urgency?.needsEscalation;
      case 'overload':
        return Boolean(task.ownerId && overloaded.has(task.ownerId));
      default:
        return true;
    }
  });
}
