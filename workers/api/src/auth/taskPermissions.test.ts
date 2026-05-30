/**
 * Permission smoke tests — run: npx tsx src/auth/taskPermissions.test.ts
 */
import assert from 'assert';
import type { UserContext } from '../contracts';
import {
  canAssignTask,
  canCommentTask,
  canCompleteTask,
  canUpdateTask,
  canUserSeeTask,
  toTaskPermissionFields,
} from './taskPermissions';

function user(role: UserContext['role'], userId: string): UserContext {
  const base: Record<UserContext['role'], UserContext> = {
    ADMIN: {
      userId: 'USR_ADMIN',
      displayName: 'Admin',
      email: 'admin@test',
      role: 'ADMIN',
      permissions: ['ADMIN_ALL', 'TASK_VIEW'],
      source: 'test',
    },
    MANAGER: {
      userId: 'USR_MGR',
      displayName: 'Manager',
      email: 'mgr@test',
      role: 'MANAGER',
      permissions: ['TASK_VIEW', 'TASK_UPDATE', 'TASK_ASSIGN'],
      source: 'test',
    },
    STAFF: {
      userId: 'USR_STAFF',
      displayName: 'Staff',
      email: 'staff@test',
      role: 'STAFF',
      permissions: ['TASK_VIEW', 'TASK_UPDATE_OWN'],
      source: 'test',
    },
    VIEW_ONLY: {
      userId: 'USR_VIEW',
      displayName: 'Viewer',
      email: 'view@test',
      role: 'VIEW_ONLY',
      permissions: ['TASK_VIEW'],
      source: 'test',
    },
    FINANCE: {
      userId: 'USR_FIN',
      displayName: 'Finance',
      email: 'fin@test',
      role: 'FINANCE',
      permissions: ['TASK_VIEW', 'FINANCE_VIEW'],
      source: 'test',
    },
    HO_SO: {
      userId: 'USR_HS',
      displayName: 'HoSo',
      email: 'hs@test',
      role: 'HO_SO',
      permissions: ['TASK_VIEW', 'HO_SO_VIEW'],
      source: 'test',
    },
  };
  const u = { ...base[role], userId };
  return u;
}

function run(): void {
  const publicTask = toTaskPermissionFields({
    taskId: 'T1',
    title: 'Public',
    status: 'NEW',
    priority: 'MEDIUM',
    owner: 'Other',
    ownerId: 'USR_OTHER',
    dueDate: '2026-06-01',
    href: '/tasks/T1',
    permissionAllowed: true,
    module: 'TASK',
    source: 'test',
    isPrivate: false,
  });

  const privateOther = toTaskPermissionFields({
    ...publicTask,
    taskId: 'T2',
    isPrivate: true,
    ownerId: 'USR_OTHER',
    reporterId: 'USR_OTHER',
  });

  const privateShared = toTaskPermissionFields({
    ...privateOther,
    taskId: 'T3',
    sharedWith: 'USR_STAFF,USR_MGR',
  });

  const assignedStaff = toTaskPermissionFields({
    ...publicTask,
    taskId: 'T4',
    ownerId: 'USR_STAFF',
  });

  const admin = user('ADMIN', 'USR_ADMIN');
  const staff = user('STAFF', 'USR_STAFF');
  const viewer = user('VIEW_ONLY', 'USR_VIEW');
  const manager = user('MANAGER', 'USR_MGR');

  assert.equal(canUserSeeTask(admin, privateOther), true, 'ADMIN sees all');
  assert.equal(canUserSeeTask(staff, privateOther), false, 'STAFF cannot see unrelated private');
  assert.equal(canUserSeeTask(staff, privateShared), true, 'STAFF sees private when in SHARED_WITH');
  assert.equal(canUserSeeTask(staff, publicTask), true, 'STAFF sees public task');
  assert.equal(canUserSeeTask(manager, publicTask), true, 'MANAGER sees public');

  assert.equal(canUpdateTask(viewer, assignedStaff), false, 'VIEW_ONLY cannot update');
  assert.equal(canCompleteTask(staff, assignedStaff), true, 'STAFF can complete assigned');
  assert.equal(canCompleteTask(staff, privateOther), false, 'STAFF cannot complete unrelated');
  assert.equal(canCommentTask(staff, assignedStaff), true, 'STAFF can comment assigned');
  assert.equal(canAssignTask(staff), false, 'STAFF cannot assign');
  assert.equal(canAssignTask(manager), true, 'MANAGER can assign');

  console.log('taskPermissions smoke: PASS');
}

run();
