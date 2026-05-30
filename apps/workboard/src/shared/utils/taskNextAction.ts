import type { TaskItem } from '@/api/contracts';

export type NextActionPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TaskNextAction {
  type: string;
  label: string;
  priority: NextActionPriority;
}

export function getTaskNextAction(task: TaskItem): TaskNextAction {
  if (task.pendingAction?.trim()) {
    return { type: 'PENDING', label: task.pendingAction.trim(), priority: 'HIGH' };
  }

  const s = task.status;
  const u = task.urgency;
  const pa = (task.pendingAction || '').toLowerCase();

  if (s === 'NEW' || s === 'ASSIGNED') {
    return { type: 'ACCEPT', label: 'Nhận việc', priority: 'HIGH' };
  }
  if (s === 'BLOCKED' || u?.isBlocked) {
    return { type: 'UNBLOCK', label: 'Gỡ vướng', priority: 'HIGH' };
  }
  if (task.isOverdue || u?.isOverdue) {
    return { type: 'PRIORITIZE', label: 'Ưu tiên xử lý', priority: 'HIGH' };
  }
  if (s === 'WAITING_APPROVAL') {
    return { type: 'WAIT_APPROVAL', label: 'Chờ duyệt', priority: 'MEDIUM' };
  }
  if (s === 'WAITING' || u?.isWaiting) {
    if (pa.includes('khách') || pa.includes('gọi')) {
      return { type: 'CALL_CUSTOMER', label: 'Gọi khách', priority: 'HIGH' };
    }
    if (pa.includes('kế toán') || pa.includes('finance')) {
      return { type: 'WAIT_FINANCE', label: 'Chờ kế toán', priority: 'MEDIUM' };
    }
    return { type: 'FOLLOW_UP', label: 'Chờ phản hồi', priority: 'MEDIUM' };
  }
  if (s === 'IN_PROGRESS' && u?.isStale) {
    return { type: 'UPDATE_PROGRESS', label: 'Cập nhật tiến độ', priority: 'MEDIUM' };
  }
  if (s === 'IN_PROGRESS') {
    return { type: 'CONTINUE', label: 'Tiếp tục xử lý', priority: 'LOW' };
  }
  if (!task.ownerId || u?.noOwner) {
    return { type: 'ASSIGN', label: 'Giao việc', priority: 'MEDIUM' };
  }

  return { type: 'REVIEW', label: 'Xem chi tiết', priority: 'LOW' };
}

export function getNextActionChipClass(priority: NextActionPriority): string {
  switch (priority) {
    case 'HIGH':
      return 'next-action-chip next-action-high';
    case 'MEDIUM':
      return 'next-action-chip next-action-medium';
    default:
      return 'next-action-chip next-action-low';
  }
}
