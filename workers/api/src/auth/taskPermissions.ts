import type { TaskDetail, TaskItem, UserContext } from '../contracts';

const ASSIGNABLE_ROLES = ['ADMIN', 'MANAGER'] as const;

/** Fields used for row-level visibility (GAS may omit some on summary rows). */
export type TaskPermissionFields = Pick<
  TaskItem,
  'taskId' | 'ownerId' | 'owner' | 'module' | 'permissionAllowed'
> & {
  reporterId?: string;
  createdBy?: string;
  assigneeId?: string;
  sharedWith?: string;
  isPrivate?: boolean | string;
  donViId?: string;
  taskModule?: string;
  relatedFinanceId?: string;
  relatedHoSoId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

export function toTaskPermissionFields(
  task: TaskItem | TaskDetail | Record<string, unknown>,
): TaskPermissionFields {
  const t = task as Record<string, unknown>;
  return {
    taskId: String(t.taskId ?? ''),
    ownerId: String(t.ownerId ?? t.owner ?? ''),
    owner: String(t.owner ?? ''),
    module: (t.module as TaskItem['module']) ?? 'TASK',
    permissionAllowed: Boolean(t.permissionAllowed),
    reporterId: t.reporterId != null ? String(t.reporterId) : undefined,
    createdBy: t.createdBy != null ? String(t.createdBy) : undefined,
    assigneeId: t.assigneeId != null ? String(t.assigneeId) : undefined,
    sharedWith: t.sharedWith != null ? String(t.sharedWith) : undefined,
    isPrivate: t.isPrivate as boolean | string | undefined,
    donViId: t.donViId != null ? String(t.donViId) : undefined,
    taskModule: t.taskModule != null ? String(t.taskModule) : undefined,
    relatedFinanceId: t.relatedFinanceId != null ? String(t.relatedFinanceId) : undefined,
    relatedHoSoId: t.relatedHoSoId != null ? String(t.relatedHoSoId) : undefined,
    relatedEntityType: t.relatedEntityType != null ? String(t.relatedEntityType) : undefined,
    relatedEntityId: t.relatedEntityId != null ? String(t.relatedEntityId) : undefined,
  };
}

function normalizeRef(value: string | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

function userRefSet(user: UserContext): Set<string> {
  const refs = [user.userId, user.displayName, user.email].map(normalizeRef).filter(Boolean);
  return new Set(refs);
}

function refMatchesUser(field: string | undefined, user: UserContext): boolean {
  const norm = normalizeRef(field);
  if (!norm) return false;
  const aliases = userRefSet(user);
  if (aliases.has(norm)) return true;
  for (const alias of aliases) {
    if (alias.length >= 3 && norm === alias) return true;
  }
  return false;
}

function parseSharedWithList(sharedWith: string | undefined): string[] {
  if (!sharedWith?.trim()) return [];
  return sharedWith
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isTaskPrivate(task: TaskPermissionFields): boolean {
  const v = task.isPrivate;
  if (v === true) return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === 'yes' || s === '1';
  }
  return false;
}

function isAdminUser(user: UserContext): boolean {
  return user.role === 'ADMIN' || user.permissions.includes('ADMIN_ALL');
}

/**
 * Aligns with GAS `canUserSeeTask` (45_SHARED_WITH_SERVICE.js) + MANAGER scope rules.
 * When `isPrivate` is absent on summary rows, task is treated as public (same as GAS default).
 */
export function canUserSeeTask(user: UserContext, task: TaskPermissionFields): boolean {
  if (isAdminUser(user)) return true;

  if (!isTaskPrivate(task)) {
    if (user.role === 'MANAGER') return true;
    if (user.role === 'VIEW_ONLY' || user.role === 'STAFF') return true;
    if (user.role === 'FINANCE') {
      return (
        task.taskModule === 'FINANCE' ||
        task.relatedEntityType === 'FINANCE' ||
        Boolean(task.relatedFinanceId)
      );
    }
    if (user.role === 'HO_SO') {
      return (
        task.taskModule === 'HO_SO' ||
        task.relatedEntityType === 'HO_SO' ||
        Boolean(task.relatedHoSoId)
      );
    }
    return true;
  }

  if (refMatchesUser(task.ownerId, user) || refMatchesUser(task.owner, user)) return true;
  if (refMatchesUser(task.assigneeId, user)) return true;
  if (refMatchesUser(task.reporterId, user)) return true;
  if (refMatchesUser(task.createdBy, user)) return true;

  const sharedIds = parseSharedWithList(task.sharedWith);
  for (const id of sharedIds) {
    if (refMatchesUser(id, user)) return true;
  }

  if (user.role === 'MANAGER' && task.donViId) {
    const userDonVi = (user as UserContext & { donViId?: string }).donViId;
    if (userDonVi && task.donViId === userDonVi) return true;
  }

  return false;
}

function isTaskAssignedToUser(task: TaskPermissionFields, user: UserContext): boolean {
  return refMatchesUser(task.ownerId, user) || refMatchesUser(task.assigneeId, user) || refMatchesUser(task.owner, user);
}

export function canCreateTask(user: UserContext): boolean {
  if (user.role === 'VIEW_ONLY') return false;
  if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
  if (user.role === 'USER') return user.permissions.includes('CREATE_OWN_TASK');
  if (user.role === 'STAFF') return true;
  return user.permissions.includes('CREATE_OWN_TASK');
}

export function canUpdateTask(user: UserContext, task: TaskPermissionFields): boolean {
  if (user.role === 'VIEW_ONLY') return false;
  if (!canUserSeeTask(user, task)) return false;
  if (isAdminUser(user)) return true;
  if (user.role === 'MANAGER') return true;

  if (user.role === 'STAFF' || user.role === 'USER') {
    return isTaskAssignedToUser(task, user);
  }

  if (user.role === 'FINANCE') {
    return (
      task.taskModule === 'FINANCE' ||
      Boolean(task.relatedFinanceId) ||
      task.relatedEntityType === 'FINANCE'
    );
  }

  if (user.role === 'HO_SO') {
    return task.taskModule === 'HO_SO' || Boolean(task.relatedHoSoId) || task.relatedEntityType === 'HO_SO';
  }

  return false;
}

export function canCommentTask(user: UserContext, task: TaskPermissionFields): boolean {
  return canUpdateTask(user, task);
}

export function canCompleteTask(user: UserContext, task: TaskPermissionFields): boolean {
  return canUpdateTask(user, task);
}

export function canAssignTask(user: UserContext): boolean {
  return ASSIGNABLE_ROLES.includes(user.role as (typeof ASSIGNABLE_ROLES)[number]);
}

export function resolveWriteCapability(user: UserContext, writeEnabled: boolean) {
  return {
    canCreate: writeEnabled && canCreateTask(user),
    canUpdate: writeEnabled && user.role !== 'VIEW_ONLY',
    canAssign: writeEnabled && canAssignTask(user),
  };
}

export type StoredTask = TaskDetail & {
  taskModule: string;
  relatedHoSoId?: string;
  relatedFinanceId?: string;
};
