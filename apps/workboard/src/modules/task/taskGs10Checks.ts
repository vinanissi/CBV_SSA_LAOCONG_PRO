/**
 * PHASE_TASK_GS_10 — Runtime identity layer checks (FE).
 */

import type { RuntimeUser } from '@/api/contracts';
import {
  canPerformInlineAction,
  filterQuickActionsByIdentity,
  getIdentityLandingDefaults,
  getUserCapabilities,
  getUserRuntimeMode,
  hydrateRuntimeIdentityFromSnapshot,
  normalizeRuntimeUser,
  resolveRuntimeUser,
} from '@/runtime/runtimeIdentity';
import { getQuickActionsForTask } from '@/shared/utils/quickActionRuntime';
import type { TaskItem } from '@/api/contracts';

export interface Gs10Check {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

const OPERATOR: RuntimeUser = normalizeRuntimeUser({
  id: 'USR_005',
  userCode: 'USR_005',
  displayName: 'Trần Thị B',
  mode: 'operator',
  capabilities: { canAssign: true, canApprove: false, canEscalate: false, canResolve: true },
  workload: { activeQueueCount: 8, workloadLimit: 12, isOverloaded: false },
  queueDefaults: { defaultQueue: 'wait_response', defaultDashboard: 'tasks' },
  relationships: {},
  flags: { isOperator: true, isSupervisor: false, isAdmin: false },
});

const VIEWER: RuntimeUser = normalizeRuntimeUser({
  id: 'USR_099',
  userCode: 'USR_099',
  displayName: 'Viewer',
  mode: 'viewer',
  capabilities: { canAssign: false, canApprove: false, canEscalate: false, canResolve: false },
  workload: { activeQueueCount: 0, workloadLimit: 12, isOverloaded: false },
  queueDefaults: { defaultQueue: '', defaultDashboard: '' },
  relationships: {},
  flags: { isOperator: false, isSupervisor: false, isAdmin: false },
});

export function runTaskGs10Checks(): { suite: string; status: string; checks: Gs10Check[] } {
  const checks: Gs10Check[] = [];

  hydrateRuntimeIdentityFromSnapshot({
    runtimeUsersById: { USR_005: OPERATOR, USR_099: VIEWER },
  });

  checks.push({
    id: 'resolveRuntimeUser',
    label: 'resolveRuntimeUser returns DISPLAY_NAME from directory',
    pass: resolveRuntimeUser('USR_005')?.displayName === 'Trần Thị B',
    detail: resolveRuntimeUser('USR_005')?.displayName,
  });

  checks.push({
    id: 'runtimeMode',
    label: 'getUserRuntimeMode works',
    pass: getUserRuntimeMode(OPERATOR) === 'operator',
    detail: getUserRuntimeMode(OPERATOR),
  });

  checks.push({
    id: 'capabilities',
    label: 'getUserCapabilities exposes CAN_ASSIGN/CAN_RESOLVE',
    pass: getUserCapabilities(OPERATOR).canAssign && getUserCapabilities(OPERATOR).canResolve,
    detail: JSON.stringify(getUserCapabilities(OPERATOR)),
  });

  const mockTask = {
    taskId: 't1',
    title: 'Test',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    owner: 'Trần Thị B',
    ownerId: 'USR_005',
    dueDate: '2026-05-25',
    href: '/tasks/t1',
    permissionAllowed: true,
    module: 'TASK' as const,
    source: 'test',
  } satisfies TaskItem;

  const allActions = getQuickActionsForTask(mockTask);
  const viewerActions = filterQuickActionsByIdentity(allActions, VIEWER);
  checks.push({
    id: 'inlineCapabilityFilter',
    label: 'Viewer cannot HANDOFF (CAN_ASSIGN)',
    pass: !viewerActions.some((a) => a.id === 'HANDOFF') && canPerformInlineAction('HANDOFF', VIEWER) === false,
    detail: viewerActions.map((a) => a.id).join(','),
  });

  const landing = getIdentityLandingDefaults(OPERATOR);
  checks.push({
    id: 'landingDefaults',
    label: 'DEFAULT_QUEUE initializes landing quickFocus',
    pass: landing.quickFocus === 'wait_response' && landing.filter === 'mine',
    detail: JSON.stringify(landing),
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_10_RUNTIME_IDENTITY_LAYER',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
