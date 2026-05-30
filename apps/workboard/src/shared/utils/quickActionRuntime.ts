import type { TaskItem } from '@/api/contracts';
import { getTaskNextAction } from './taskNextAction';

export type QuickActionId =
  | 'ACCEPT'
  | 'CALL'
  | 'CONFIRM'
  | 'RESCHEDULE'
  | 'COMPLETE'
  | 'HANDOFF'
  | 'FOLLOW'
  | 'WAIT_CUSTOMER'
  | 'WAIT_APPROVAL'
  | 'CONTINUE';

export interface QuickAction {
  id: QuickActionId;
  label: string;
  shortLabel: string;
  primary?: boolean;
}

const MAX_CARD_ACTIONS = 4;

export function getQuickActionsForTask(task: TaskItem): QuickAction[] {
  if (task.status === 'DONE') return [];

  const next = getTaskNextAction(task);
  const actions: QuickAction[] = [];

  switch (next.type) {
    case 'ACCEPT':
      actions.push({ id: 'ACCEPT', label: 'Nhận việc', shortLabel: 'Nhận', primary: true });
      break;
    case 'CALL_CUSTOMER':
      actions.push({ id: 'CALL', label: 'Gọi khách', shortLabel: 'Gọi', primary: true });
      break;
    case 'FOLLOW_UP':
    case 'WAIT_FINANCE':
      actions.push({ id: 'FOLLOW', label: 'Theo dõi', shortLabel: 'Theo dõi', primary: true });
      actions.push({ id: 'CONFIRM', label: 'Xác nhận', shortLabel: 'Xác nhận' });
      break;
    case 'WAIT_APPROVAL':
      actions.push({ id: 'WAIT_APPROVAL', label: 'Chờ duyệt', shortLabel: 'Duyệt', primary: true });
      break;
    case 'UNBLOCK':
      actions.push({ id: 'CONFIRM', label: 'Gỡ vướng', shortLabel: 'Gỡ', primary: true });
      break;
    case 'PRIORITIZE':
      actions.push({ id: 'CONTINUE', label: 'Xử lý ngay', shortLabel: 'Xử lý', primary: true });
      break;
    case 'UPDATE_PROGRESS':
      actions.push({ id: 'CONFIRM', label: 'Cập nhật', shortLabel: 'Cập nhật', primary: true });
      break;
    case 'CONTINUE':
      actions.push({ id: 'CONTINUE', label: 'Tiếp tục', shortLabel: 'Tiếp tục', primary: true });
      break;
    default:
      actions.push({ id: 'CONTINUE', label: 'Xử lý', shortLabel: 'Xử lý', primary: true });
  }

  if (next.type !== 'ACCEPT' && task.status !== 'WAITING' && task.status !== 'WAITING_APPROVAL') {
    actions.push({ id: 'WAIT_CUSTOMER', label: 'Chờ khách', shortLabel: 'Chờ KH' });
  }

  if (task.status === 'IN_PROGRESS' || task.status === 'WAITING') {
    actions.push({ id: 'HANDOFF', label: 'Chuyển', shortLabel: 'Chuyển' });
  }

  actions.push({ id: 'COMPLETE', label: 'Hoàn tất', shortLabel: 'Xong' });

  const seen = new Set<QuickActionId>();
  const deduped: QuickAction[] = [];
  for (const a of actions) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    deduped.push(a);
  }

  return deduped.slice(0, MAX_CARD_ACTIONS);
}

export function quickActionToNextActionType(id: QuickActionId): string {
  switch (id) {
    case 'CALL':
      return 'CALL_CUSTOMER';
    case 'FOLLOW':
      return 'FOLLOW_UP';
    case 'CONFIRM':
      return 'UPDATE_PROGRESS';
    default:
      return id;
  }
}
