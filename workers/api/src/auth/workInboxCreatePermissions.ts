/**
 * PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME — create permission helpers.
 */

import type { UserContext } from '../contracts';

export type WorkInboxPilotRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'USER' | 'VIEWER';

export function normalizeWorkInboxPilotRole(role: string | undefined): WorkInboxPilotRole {
  const r = String(role ?? 'OPERATOR').toUpperCase();
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'MANAGER') return 'MANAGER';
  if (r === 'USER') return 'USER';
  if (r === 'VIEWER' || r === 'VIEW_ONLY') return 'VIEWER';
  if (r === 'STAFF' || r === 'OPERATOR' || r === 'FINANCE' || r === 'HO_SO') return 'OPERATOR';
  return 'OPERATOR';
}

export function canUserCreateWorkInboxTask(user: UserContext): boolean {
  const role = normalizeWorkInboxPilotRole(user.role);
  if (role === 'VIEWER') return false;
  if (role === 'ADMIN' || role === 'MANAGER' || role === 'USER' || role === 'OPERATOR') return true;
  return user.permissions.includes('CREATE_OWN_TASK');
}

export function canUserAssignOnCreate(user: UserContext): boolean {
  const role = normalizeWorkInboxPilotRole(user.role);
  return role === 'ADMIN' || role === 'MANAGER';
}

export function enforceCreateOwnerForUser(user: UserContext, requestedAssignee?: string): string | null {
  const assignee = requestedAssignee?.trim();
  if (!assignee) return null;
  if (canUserAssignOnCreate(user)) return assignee;
  if (assignee !== user.userId) {
    return '__FORBIDDEN__';
  }
  return assignee;
}
