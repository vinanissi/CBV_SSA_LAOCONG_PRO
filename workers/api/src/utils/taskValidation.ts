import type { CreateTaskBody, UpdateTaskBody } from '../contracts';

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const TASK_STATUSES = ['NEW', 'IN_PROGRESS', 'WAITING', 'WAITING_APPROVAL', 'BLOCKED', 'DONE'] as const;
export const TASK_MODULES = ['TASK', 'FINANCE', 'HO_SO'] as const;

const UPDATE_WHITELIST = ['title', 'description', 'status', 'assignee', 'priority', 'dueDate', 'note'] as const;

export function validateCreateTask(body: CreateTaskBody): string[] {
  const errors: string[] = [];
  if (!body.title?.trim()) errors.push('Tên việc không được để trống');
  if (body.priority && !TASK_PRIORITIES.includes(body.priority as (typeof TASK_PRIORITIES)[number])) {
    errors.push('Ưu tiên không hợp lệ');
  }
  if (body.module && !TASK_MODULES.includes(body.module as (typeof TASK_MODULES)[number])) {
    errors.push('Loại việc không hợp lệ');
  }
  if (body.dueDate && Number.isNaN(Date.parse(body.dueDate))) {
    errors.push('Hạn xử lý không hợp lệ');
  }
  return errors;
}

export function validateUpdateTask(body: UpdateTaskBody): string[] {
  const errors: string[] = [];
  const keys = Object.keys(body);
  for (const key of keys) {
    if (!UPDATE_WHITELIST.includes(key as (typeof UPDATE_WHITELIST)[number])) {
      errors.push(`Không được cập nhật trường: ${key}`);
    }
  }
  if (body.title !== undefined && !body.title.trim()) errors.push('Tên việc không được để trống');
  if (body.status && !TASK_STATUSES.includes(body.status as (typeof TASK_STATUSES)[number])) {
    errors.push('Trạng thái không hợp lệ');
  }
  if (body.priority && !TASK_PRIORITIES.includes(body.priority as (typeof TASK_PRIORITIES)[number])) {
    errors.push('Ưu tiên không hợp lệ');
  }
  if (body.dueDate && Number.isNaN(Date.parse(body.dueDate))) {
    errors.push('Hạn xử lý không hợp lệ');
  }
  return errors;
}

export function pickUpdateFields(body: UpdateTaskBody): UpdateTaskBody {
  const picked: UpdateTaskBody = {};
  for (const key of UPDATE_WHITELIST) {
    if (body[key as keyof UpdateTaskBody] !== undefined) {
      (picked as Record<string, unknown>)[key] = body[key as keyof UpdateTaskBody];
    }
  }
  return picked;
}
