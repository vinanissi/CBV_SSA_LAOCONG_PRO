import type { UserContext, UserRole } from '../contracts';

const ALLOWED_ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'STAFF', 'FINANCE', 'HO_SO', 'VIEW_ONLY'];

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    'ADMIN_ALL',
    'TASK_VIEW',
    'TASK_CREATE',
    'TASK_UPDATE',
    'TASK_ASSIGN',
    'FINANCE_VIEW',
    'HO_SO_VIEW',
    'COORDINATION_VIEW',
    'OBSERVATION_VIEW',
    'PLUGIN_VIEW',
    'SEARCH',
    'TASK_ASSIGN',
    'FINANCE_CONFIRM_PAYMENT',
    'HO_SO_APPROVAL',
  ],
  MANAGER: [
    'TASK_VIEW',
    'TASK_CREATE',
    'TASK_UPDATE',
    'TASK_ASSIGN',
    'FINANCE_VIEW',
    'HO_SO_VIEW',
    'COORDINATION_VIEW',
    'OBSERVATION_VIEW',
    'PLUGIN_VIEW',
    'SEARCH',
  ],
  STAFF: ['TASK_VIEW', 'TASK_UPDATE_OWN', 'SEARCH'],
  FINANCE: ['TASK_VIEW', 'FINANCE_VIEW', 'SEARCH'],
  HO_SO: ['TASK_VIEW', 'HO_SO_VIEW', 'SEARCH'],
  VIEW_ONLY: ['TASK_VIEW', 'FINANCE_VIEW', 'HO_SO_VIEW', 'OBSERVATION_VIEW', 'PLUGIN_VIEW', 'SEARCH'],
};

const ROLE_PROFILES: Record<UserRole, { userId: string; displayName: string; email: string }> = {
  ADMIN: { userId: 'USR-LOCAL-ADMIN', displayName: 'Quản trị Local', email: 'admin.local@cbv.demo' },
  MANAGER: { userId: 'USR-LOCAL-MGR', displayName: 'Quản lý Local', email: 'manager.local@cbv.demo' },
  STAFF: { userId: 'USR-LOCAL-STAFF', displayName: 'Nhân viên Local', email: 'staff.local@cbv.demo' },
  FINANCE: { userId: 'USR-LOCAL-FIN', displayName: 'Tài chính Local', email: 'finance.local@cbv.demo' },
  HO_SO: { userId: 'USR-LOCAL-HS', displayName: 'Hồ sơ Local', email: 'hoso.local@cbv.demo' },
  VIEW_ONLY: { userId: 'USR-LOCAL-VIEW', displayName: 'Chỉ xem Local', email: 'view.local@cbv.demo' },
};

export function parseRoleHeader(request: Request): UserRole | null {
  const raw = request.headers.get('x-cbv-role')?.trim().toUpperCase();
  if (!raw) return null;
  return ALLOWED_ROLES.includes(raw as UserRole) ? (raw as UserRole) : null;
}

export function resolveUserContext(request: Request): UserContext {
  const headerRole = parseRoleHeader(request);
  const role: UserRole = headerRole ?? 'MANAGER';
  const profile = ROLE_PROFILES[role];

  return {
    ...profile,
    role,
    permissions: ROLE_PERMISSIONS[role],
    source: 'LOCAL_STUB',
    demoLabel: 'Worker projection — demo local',
  };
}

export function hasPermission(user: UserContext, permission: string): boolean {
  if (user.permissions.includes('ADMIN_ALL')) return true;
  return user.permissions.includes(permission);
}

export function canViewModule(user: UserContext, module: 'TASK' | 'FINANCE' | 'HO_SO' | 'COORDINATION' | 'OBSERVATION' | 'PLUGIN'): boolean {
  switch (module) {
    case 'TASK':
      return hasPermission(user, 'TASK_VIEW');
    case 'FINANCE':
      return hasPermission(user, 'FINANCE_VIEW');
    case 'HO_SO':
      return hasPermission(user, 'HO_SO_VIEW');
    case 'COORDINATION':
      return hasPermission(user, 'COORDINATION_VIEW');
    case 'OBSERVATION':
      return hasPermission(user, 'OBSERVATION_VIEW');
    case 'PLUGIN':
      return hasPermission(user, 'PLUGIN_VIEW');
  }
}

export function filterWriteActions<T extends { disabled?: boolean; executionMode?: string; permission?: string }>(
  user: UserContext,
  actions: T[],
): T[] {
  return actions.map((action) => {
    const isWrite =
      action.executionMode === 'EXECUTION_LOCKED' ||
      action.permission === 'TASK_ASSIGN' ||
      action.permission === 'FINANCE_CONFIRM_PAYMENT' ||
      action.permission === 'HO_SO_APPROVAL';

    if (isWrite || user.role === 'VIEW_ONLY') {
      return {
        ...action,
        disabled: true,
        executionMode: 'EXECUTION_LOCKED',
        disabledReason: 'Chỉ xem trong phiên bản này',
      } as T;
    }

    if (action.permission && !hasPermission(user, action.permission)) {
      return { ...action, disabled: true, disabledReason: 'Không có quyền' } as T;
    }

    return action;
  });
}
