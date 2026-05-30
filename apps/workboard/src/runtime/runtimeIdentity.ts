/**
 * PHASE_TASK_GS_10 — Operational Runtime Identity Layer (FE).
 * Normalizes USER_DIRECTORY snapshot into RuntimeUser; no per-card sheet queries.
 */

import type {
  RuntimeUser,
  RuntimeUserCapabilities,
  RuntimeUserMode,
  UserContext,
  UserDirectoryRecord,
} from '@/api/contracts';
import type { QuickAction, QuickActionId } from '@/shared/utils/quickActionRuntime';
import { hydrateUserDirectoryFromSnapshot } from '@/runtime/userDisplay';

const DEFAULT_WORKLOAD_LIMIT = 12;
const DEFAULT_OVERLOAD_OVERDUE = 4;

let runtimeUsersById: Record<string, RuntimeUser> = {};
let sessionUserId: string | null = null;

function parseIntSafe(val: unknown, fallback: number): number {
  const n = parseInt(String(val ?? ''), 10);
  return Number.isNaN(n) ? fallback : n;
}

function deriveModeFromRecord(rec: Partial<UserDirectoryRecord>, role?: string): RuntimeUserMode {
  if (rec.mode) return rec.mode;
  if (rec.flags?.isAdmin) return 'admin';
  if (rec.flags?.isSupervisor) return 'supervisor';
  if (rec.flags?.isOperator) return 'operator';
  const r = String(role || rec.role || rec.directoryRole || '').toUpperCase();
  if (r === 'ADMIN') return 'admin';
  if (r === 'MANAGER' || r === 'SUPERVISOR') return 'supervisor';
  if (r === 'OPERATOR' || r === 'STAFF') return 'operator';
  return 'viewer';
}

function deriveCapabilities(rec: Partial<UserDirectoryRecord>, mode: RuntimeUserMode): RuntimeUserCapabilities {
  if (
    rec.capabilities &&
    typeof rec.capabilities.canAssign === 'boolean' &&
    typeof rec.capabilities.canApprove === 'boolean'
  ) {
    return rec.capabilities;
  }
  const isAdmin = rec.flags?.isAdmin || mode === 'admin';
  const isSupervisor = rec.flags?.isSupervisor || mode === 'supervisor';
  const isOperator = rec.flags?.isOperator || mode === 'operator';
  return {
    canAssign: isAdmin || isSupervisor || isOperator,
    canApprove: isAdmin || isSupervisor,
    canEscalate: isAdmin || isSupervisor,
    canResolve: isAdmin || isSupervisor || isOperator,
  };
}

export function normalizeRuntimeUser(raw: Partial<UserDirectoryRecord | RuntimeUser>): RuntimeUser {
  const id = String(raw.id || raw.userCode || '').trim();
  const userCode = String(raw.userCode || raw.id || '').trim();
  const displayName = String(raw.displayName || raw.fullName || userCode || id).trim();
  const mode = deriveModeFromRecord(raw, raw.role);
  const workloadLimit = parseIntSafe(raw.workload?.workloadLimit, DEFAULT_WORKLOAD_LIMIT);
  const activeQueueCount = parseIntSafe(raw.workload?.activeQueueCount, 0);

  return {
    id,
    userCode,
    displayName,
    fullName: raw.fullName,
    email: raw.email,
    role: raw.role,
    directoryRole: raw.directoryRole,
    status: raw.status,
    mode,
    capabilities: deriveCapabilities(raw, mode),
    workload: {
      activeQueueCount,
      workloadLimit,
      isOverloaded:
        raw.workload?.isOverloaded ??
        (activeQueueCount > 0 && workloadLimit > 0 && activeQueueCount >= workloadLimit),
    },
    queueDefaults: {
      defaultQueue: raw.queueDefaults?.defaultQueue ?? '',
      defaultDashboard: raw.queueDefaults?.defaultDashboard ?? '',
    },
    relationships: {
      supervisorId: raw.relationships?.supervisorId,
      teamId: raw.relationships?.teamId,
      donViId: raw.relationships?.donViId,
    },
    flags: {
      isOperator: raw.flags?.isOperator ?? mode === 'operator',
      isSupervisor: raw.flags?.isSupervisor ?? mode === 'supervisor',
      isAdmin: raw.flags?.isAdmin ?? mode === 'admin',
    },
  };
}

function indexRuntimeUser(user: RuntimeUser): void {
  const keys = new Set<string>();
  if (user.userCode) keys.add(user.userCode);
  if (user.id && user.id !== user.userCode) keys.add(user.id);
  for (const key of keys) {
    runtimeUsersById[key] = user;
  }
}

/** Bind session user id — call once after auth */
export function bindSessionIdentity(user: UserContext | null): void {
  sessionUserId = user?.userId ?? null;
}

/** Hydrate identity cache from workspace snapshot (1 load per snapshot) */
export function hydrateRuntimeIdentityFromSnapshot(snapshot?: {
  runtimeUsersById?: Record<string, RuntimeUser>;
  usersById?: Record<string, UserDirectoryRecord>;
  userDisplayMap?: Record<string, string>;
} | null): void {
  hydrateUserDirectoryFromSnapshot(snapshot);
  if (!snapshot) return;

  const source = snapshot.runtimeUsersById ?? snapshot.usersById;
  if (!source) return;

  for (const [key, raw] of Object.entries(source)) {
    indexRuntimeUser(normalizeRuntimeUser({ ...raw, id: raw.id || key }));
  }
}

export function getRuntimeUsersById(): Record<string, RuntimeUser> {
  return runtimeUsersById;
}

export function resolveRuntimeUser(ref?: string | UserContext | null): RuntimeUser | null {
  if (!ref) return null;
  if (typeof ref === 'object' && 'userId' in ref) {
    return runtimeUsersById[ref.userId] ?? normalizeRuntimeUser({
      id: ref.userId,
      userCode: ref.userId,
      displayName: ref.displayName,
      role: ref.role,
    });
  }
  const key = String(ref).trim();
  return runtimeUsersById[key] ?? null;
}

export function getCurrentRuntimeUser(): RuntimeUser | null {
  if (!sessionUserId) return null;
  return resolveRuntimeUser(sessionUserId);
}

export function getUserCapabilities(user?: RuntimeUser | string | null): RuntimeUserCapabilities {
  const resolved = typeof user === 'string' ? resolveRuntimeUser(user) : user;
  return (
    resolved?.capabilities ?? {
      canAssign: false,
      canApprove: false,
      canEscalate: false,
      canResolve: true,
    }
  );
}

export function getUserRuntimeMode(user?: RuntimeUser | string | null): RuntimeUserMode {
  const resolved = typeof user === 'string' ? resolveRuntimeUser(user) : user;
  return resolved?.mode ?? 'viewer';
}

export function getWorkloadLimitForUser(userId?: string): number {
  const u = resolveRuntimeUser(userId);
  return u?.workload.workloadLimit ?? DEFAULT_WORKLOAD_LIMIT;
}

export function isOwnerOverloadedByIdentity(
  ownerId: string,
  pending: number,
  overdue: number,
): boolean {
  const limit = getWorkloadLimitForUser(ownerId);
  const sheetOverloaded = resolveRuntimeUser(ownerId)?.workload.isOverloaded;
  if (sheetOverloaded) return true;
  return pending >= limit || overdue >= DEFAULT_OVERLOAD_OVERDUE;
}

const QUEUE_ALIAS: Record<string, string> = {
  escalation: 'escalation',
  overload: 'overload',
  wait_response: 'wait_response',
  wait_approval: 'wait_approval',
  wait_customer: 'wait_customer',
  follow_up: 'follow_up',
  my_queue: 'all',
  operator: 'all',
};

const ACTION_CAPABILITY: Partial<Record<QuickActionId, keyof RuntimeUserCapabilities>> = {
  HANDOFF: 'canAssign',
  ACCEPT: 'canAssign',
  WAIT_APPROVAL: 'canApprove',
  COMPLETE: 'canResolve',
  CONFIRM: 'canResolve',
};

/** Apply DEFAULT_QUEUE / DEFAULT_DASHBOARD for landing state */
export function getIdentityLandingDefaults(user?: RuntimeUser | null): {
  quickFocus?: string;
  filter?: string;
} {
  const u = user ?? getCurrentRuntimeUser();
  if (!u) return {};
  const q = u.queueDefaults.defaultQueue.trim().toLowerCase();
  const dash = u.queueDefaults.defaultDashboard.trim().toLowerCase();
  const result: { quickFocus?: string; filter?: string } = {};

  if (q) {
    result.quickFocus = QUEUE_ALIAS[q] ?? q;
  }
  if (dash === 'tasks' || dash === 'my_tasks') {
    result.filter = 'mine';
  } else if (dash === 'overdue') {
    result.filter = 'overdue';
  }

  if (u.flags.isSupervisor && !q) result.quickFocus = 'escalation';
  if (u.flags.isOperator && !q) result.quickFocus = 'all';

  return result;
}

/** Filter inline actions by runtime identity capabilities */
export function filterQuickActionsByIdentity(
  actions: QuickAction[],
  user?: RuntimeUser | null,
): QuickAction[] {
  const u = user ?? getCurrentRuntimeUser();
  if (!u) return actions;
  const cap = u.capabilities;
  return actions.filter((a) => {
    const key = ACTION_CAPABILITY[a.id];
    if (!key) return true;
    return cap[key];
  });
}

export function canPerformInlineAction(actionId: QuickActionId, user?: RuntimeUser | null): boolean {
  const key = ACTION_CAPABILITY[actionId];
  if (!key) return true;
  return getUserCapabilities(user ?? getCurrentRuntimeUser())[key];
}
