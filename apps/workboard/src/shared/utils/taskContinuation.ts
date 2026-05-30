import type { TaskItem } from '@/api/contracts';
import { getTaskNextAction } from './taskNextAction';

const UNFINISHED_KEY = 'cbv_unfinished_actions';
const ACTION_STARTED_KEY = 'cbv_action_started';

export interface UnfinishedAction {
  taskId: string;
  title: string;
  actionType: string;
  actionLabel: string;
  startedAt: string;
  needsUpdate: boolean;
}

export interface CompletionOption {
  id: string;
  label: string;
  note: string;
}

const CALL_OPTIONS: CompletionOption[] = [
  { id: 'contacted', label: 'Đã liên hệ', note: 'Đã liên hệ khách — cập nhật từ flow' },
  { id: 'no_answer', label: 'Không nghe máy', note: 'Gọi khách — không nghe máy' },
  { id: 'callback', label: 'Hẹn gọi lại', note: 'Gọi khách — hẹn gọi lại' },
];

export function getCompletionOptions(actionType: string): CompletionOption[] {
  if (actionType === 'CALL_CUSTOMER' || actionType === 'CALL' || actionType === 'FOLLOW_UP' || actionType === 'FOLLOW') return CALL_OPTIONS;
  if (actionType === 'CONFIRM' || actionType === 'UPDATE_PROGRESS') {
    return [
      { id: 'confirmed', label: 'Đã xác nhận', note: 'Xác nhận — hoàn tất bước' },
      { id: 'pending', label: 'Chưa xong', note: 'Xác nhận — chưa xong' },
    ];
  }
  if (actionType === 'UPDATE_PROGRESS') {
    return [{ id: 'updated', label: 'Đã cập nhật', note: 'Cập nhật tiến độ từ flow' }];
  }
  return [];
}

export function markActionStarted(task: TaskItem, override?: { type: string; label: string }): void {
  const next = override ?? getTaskNextAction(task);
  const actionType = override?.type ?? next.type;
  const actionLabel = override?.label ?? next.label;
  if (!['CALL_CUSTOMER', 'FOLLOW_UP', 'UPDATE_PROGRESS', 'CONFIRM'].includes(actionType) && !override) return;
  try {
    const entry: UnfinishedAction = {
      taskId: task.taskId,
      title: task.title,
      actionType,
      actionLabel,
      startedAt: new Date().toISOString(),
      needsUpdate: true,
    };
    const map = loadUnfinishedMap();
    map[task.taskId] = entry;
    sessionStorage.setItem(UNFINISHED_KEY, JSON.stringify(map));
    sessionStorage.setItem(ACTION_STARTED_KEY, task.taskId);
  } catch {
    // ignore
  }
}

function loadUnfinishedMap(): Record<string, UnfinishedAction> {
  try {
    const raw = sessionStorage.getItem(UNFINISHED_KEY);
    return raw ? (JSON.parse(raw) as Record<string, UnfinishedAction>) : {};
  } catch {
    return {};
  }
}

export function getUnfinishedActions(): UnfinishedAction[] {
  return Object.values(loadUnfinishedMap()).filter((a) => a.needsUpdate);
}

export function getUnfinishedForTask(taskId: string): UnfinishedAction | null {
  return loadUnfinishedMap()[taskId] ?? null;
}

export function clearUnfinishedAction(taskId: string): void {
  try {
    const map = loadUnfinishedMap();
    delete map[taskId];
    sessionStorage.setItem(UNFINISHED_KEY, JSON.stringify(map));
    if (sessionStorage.getItem(ACTION_STARTED_KEY) === taskId) {
      sessionStorage.removeItem(ACTION_STARTED_KEY);
    }
  } catch {
    // ignore
  }
}

export function needsCompletionPrompt(task: TaskItem): boolean {
  const u = getUnfinishedForTask(task.taskId);
  if (!u?.needsUpdate) return false;
  const next = getTaskNextAction(task);
  return u.actionType === next.type || ['CALL_CUSTOMER', 'FOLLOW_UP'].includes(u.actionType);
}

export function getInterruptionMessage(task: TaskItem): string | null {
  const u = getUnfinishedForTask(task.taskId);
  if (!u?.needsUpdate) return null;
  if (u.actionType === 'CALL_CUSTOMER' || u.actionType === 'FOLLOW_UP') {
    return `Đã ${u.actionLabel.toLowerCase()} nhưng chưa cập nhật kết quả.`;
  }
  return `Chưa hoàn tất: ${u.actionLabel}`;
}
