/** PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME + related entity model */

import type { TaskDetail } from '@/api/contracts';

export type WorkInboxCreateTaskPriority = 'LOW' | 'NORMAL' | 'HIGH';

export interface WorkInboxCreateTaskForm {
  title: string;
  description: string;
  taskTypeId: string;
  donViId: string;
  ownerId: string;
  priority: WorkInboxCreateTaskPriority;
  dueDate: string;
  relatedEntityType: string;
  relatedEntityValue: string;
}

export interface WorkInboxCreateTaskRequest {
  traceId?: string;
  actor?: string;
  actorRole?: string;
  title: string;
  description?: string;
  taskTypeId?: string;
  donViId?: string;
  ownerId?: string;
  priority?: WorkInboxCreateTaskPriority;
  dueDate?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  /** @deprecated legacy — mapped server-side if relatedEntity* absent */
  relatedPhone?: string;
  /** @deprecated legacy */
  relatedPlate?: string;
  assignee?: string;
}

export interface WorkInboxCreateTaskResult {
  ok: boolean;
  traceId?: string;
  task?: TaskDetail;
  taskPatch?: TaskDetail;
  timelineEvent?: { eventType: string; eventLabel?: string } | null;
  auditEvent?: { action: string } | null;
  refreshPolicy?: 'SELECTIVE' | 'SNAPSHOT' | 'BUNDLE_ONLY' | 'NONE';
  error?: string;
}

export const DEFAULT_CREATE_FORM: WorkInboxCreateTaskForm = {
  title: '',
  description: '',
  taskTypeId: '',
  donViId: '',
  ownerId: '',
  priority: 'NORMAL',
  dueDate: '',
  relatedEntityType: '',
  relatedEntityValue: '',
};

export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 2000;

export function canRoleCreateWorkInboxTask(role: string | undefined): boolean {
  const r = String(role ?? '').toUpperCase();
  if (r === 'VIEW_ONLY' || r === 'VIEWER') return false;
  if (r === 'ADMIN' || r === 'MANAGER' || r === 'USER' || r === 'STAFF' || r === 'OPERATOR') return true;
  return false;
}

/** @deprecated Use validateTaskCreationInput + validateRelatedEntityInput */
export function validateCreateTaskForm(form: WorkInboxCreateTaskForm): string | null {
  const title = form.title.trim();
  if (!title) return 'Tên việc là bắt buộc';
  if (title.length > TITLE_MAX) return `Tên việc tối đa ${TITLE_MAX} ký tự`;
  if (form.description.trim().length > DESCRIPTION_MAX) return `Mô tả tối đa ${DESCRIPTION_MAX} ký tự`;
  if (form.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate)) return 'Ngày hạn không hợp lệ';
  return null;
}
