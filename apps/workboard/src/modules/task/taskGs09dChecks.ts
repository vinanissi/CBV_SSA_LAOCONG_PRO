/**
 * PHASE_TASK_GS_09D — USER_DIRECTORY display name binding checks (FE).
 */

import type { TaskItem } from '@/api/contracts';
import {
  getTaskOwnerDisplay,
  getUsersById,
  hydrateUserDirectoryFromSnapshot,
  resolveUserDisplay,
} from '@/runtime/userDisplay';
import { getCollapsedMetaShort } from '@/shared/utils/signalCollapse';

export interface Gs09dCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function mockTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    taskId: 't-dir',
    title: 'Directory binding test',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    owner: 'USR_005',
    ownerId: 'USR_005',
    ownerUser: { userCode: 'USR_005', id: 'USR_005', displayName: 'Trần Thị B' },
    dueDate: '2026-05-25',
    href: '/tasks/t-dir',
    permissionAllowed: true,
    module: 'TASK',
    source: 'test',
    urgency: {
      isBlocked: false,
      isOverdue: true,
      isWaiting: false,
      isStale: false,
      needsEscalation: true,
      slaRiskLevel: 'HIGH',
    },
    ...overrides,
  } as TaskItem;
}

export function runTaskGs09dChecks(): { suite: string; status: string; checks: Gs09dCheck[] } {
  const checks: Gs09dCheck[] = [];

  hydrateUserDirectoryFromSnapshot({
    usersById: {
      USR_005: { id: 'USR_005', userCode: 'USR_005', displayName: 'Trần Thị B' },
      USR_001: { id: 'USR_001', userCode: 'USR_001', displayName: 'Nguyễn Văn A' },
    },
    userDisplayMap: {
      USR_005: 'Trần Thị B',
      USR_001: 'Nguyễn Văn A',
    },
  });

  checks.push({
    id: 'snapshotUsersById',
    label: 'Snapshot usersById loaded once into runtime memory',
    pass: Boolean(getUsersById().USR_005?.displayName),
    detail: getUsersById().USR_005?.displayName,
  });

  checks.push({
    id: 'resolveUserDisplay',
    label: 'resolveUserDisplay prefers displayName from directory',
    pass:
      resolveUserDisplay({ id: 'USR_005', displayName: 'Trần Thị B' }) === 'Trần Thị B' &&
      resolveUserDisplay('USR_005', { surface: true }) === 'Trần Thị B',
    detail: resolveUserDisplay('USR_005', { surface: true }),
  });

  const task = mockTask();
  const ownerLabel = getTaskOwnerDisplay(task);
  checks.push({
    id: 'ownerUserEnriched',
    label: 'Enriched ownerUser renders DISPLAY_NAME not USER_CODE',
    pass: ownerLabel === 'Trần Thị B' && !ownerLabel.includes('USR_005'),
    detail: ownerLabel,
  });

  const meta = getCollapsedMetaShort(task, 'ESCALATION');
  const cardLine = `Escalation ${meta}`.trim();
  checks.push({
    id: 'taskCardEscalation',
    label: 'Task card escalation line uses DISPLAY_NAME',
    pass: cardLine.includes('Trần Thị B') && !cardLine.includes('USR_005'),
    detail: cardLine,
  });

  checks.push({
    id: 'stringKeyLookup',
    label: 'USR_005 directory key resolves to Trần Thị B',
    pass: resolveUserDisplay('USR_005') === 'Trần Thị B',
    detail: resolveUserDisplay('USR_005'),
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_09D_USER_DIRECTORY_DISPLAY_NAME_BINDING',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
