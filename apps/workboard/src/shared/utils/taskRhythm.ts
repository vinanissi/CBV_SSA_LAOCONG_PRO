import type { TaskItem } from '@/api/contracts';
import type { RhythmMode } from './workingContext';
import { getTaskNextAction } from './taskNextAction';

export interface RhythmModeDef {
  key: RhythmMode;
  label: string;
  description: string;
}

export const RHYTHM_MODES: RhythmModeDef[] = [
  { key: 'all', label: 'Tất cả', description: 'Full queue' },
  { key: 'call', label: 'Gọi điện', description: 'Call queue' },
  { key: 'follow_up', label: 'Follow-up', description: 'Chờ phản hồi follow-up' },
  { key: 'approval', label: 'Duyệt', description: 'Approval queue' },
  { key: 'quick', label: 'Việc nhanh', description: 'Quick wins' },
  { key: 'batch', label: 'Hàng loạt', description: 'Batch processing' },
  { key: 'waiting', label: 'Theo dõi', description: 'Waiting follow-up monitor' },
];

export function filterTasksByRhythm(tasks: TaskItem[], mode: RhythmMode): TaskItem[] {
  if (mode === 'all') return tasks;

  return tasks.filter((task) => {
    const next = getTaskNextAction(task);
    const pa = (task.pendingAction || '').toLowerCase();

    switch (mode) {
      case 'call':
        return next.type === 'CALL_CUSTOMER' || pa.includes('gọi') || pa.includes('khách');
      case 'follow_up':
        return next.type === 'FOLLOW_UP' || task.status === 'WAITING' || task.urgency?.isWaiting;
      case 'approval':
        return task.status === 'WAITING_APPROVAL' || next.type === 'WAIT_APPROVAL';
      case 'quick':
        return next.type === 'ACCEPT' || (next.priority === 'HIGH' && !task.isOverdue);
      case 'batch':
        return task.status === 'IN_PROGRESS' && !task.urgency?.isBlocked && !task.isOverdue;
      case 'waiting':
        return task.status === 'WAITING' || task.status === 'WAITING_APPROVAL' || task.urgency?.isWaiting;
      default:
        return true;
    }
  });
}
