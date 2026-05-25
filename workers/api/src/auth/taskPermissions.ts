import type { TaskDetail, TaskItem, UserContext } from '../contracts';

const ASSIGNABLE_ROLES = ['ADMIN', 'MANAGER'] as const;

export function canCreateTask(user: UserContext): boolean {
  if (user.role === 'VIEW_ONLY') return false;
  return user.role === 'ADMIN' || user.role === 'MANAGER';
}

export function canUpdateTask(
  user: UserContext,
  task: TaskItem & { taskModule?: string; relatedFinanceId?: string; relatedHoSoId?: string },
): boolean {
  if (user.role === 'VIEW_ONLY') return false;
  if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
  if (user.role === 'STAFF') return task.ownerId === user.userId;
  if (user.role === 'FINANCE') {
    return task.taskModule === 'FINANCE' || Boolean(task.relatedFinanceId);
  }
  if (user.role === 'HO_SO') {
    return task.taskModule === 'HO_SO' || Boolean(task.relatedHoSoId);
  }
  return false;
}

export function canAssignTask(user: UserContext): boolean {
  return ASSIGNABLE_ROLES.includes(user.role as (typeof ASSIGNABLE_ROLES)[number]);
}

export function resolveWriteCapability(user: UserContext, writeEnabled: boolean) {
  return {
    canCreate: writeEnabled && canCreateTask(user),
    canUpdate: writeEnabled,
    canAssign: writeEnabled && canAssignTask(user),
  };
}

export type StoredTask = TaskDetail & {
  taskModule: string;
  relatedHoSoId?: string;
  relatedFinanceId?: string;
};
