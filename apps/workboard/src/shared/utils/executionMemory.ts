import {
  getUnfinishedActions,
  getUnfinishedForTask,
  type UnfinishedAction,
} from './taskContinuation';

export interface ExecutionMemorySummary {
  count: number;
  items: UnfinishedAction[];
  message: string | null;
}

export function getExecutionMemorySummary(): ExecutionMemorySummary {
  const items = getUnfinishedActions();
  const count = items.length;
  let message: string | null = null;

  if (count === 1) {
    message = `⚠ Bạn chưa cập nhật kết quả: ${items[0].actionLabel}`;
  } else if (count > 1) {
    message = `⚠ Có ${count} hành động chưa xác nhận kết quả`;
  }

  return { count, items, message };
}

export function hasPendingExecution(taskId: string): boolean {
  return Boolean(getUnfinishedForTask(taskId)?.needsUpdate);
}

export function getTaskExecutionReminder(taskId: string): string | null {
  const u = getUnfinishedForTask(taskId);
  if (!u?.needsUpdate) return null;
  return `Chưa cập nhật: ${u.actionLabel}`;
}
