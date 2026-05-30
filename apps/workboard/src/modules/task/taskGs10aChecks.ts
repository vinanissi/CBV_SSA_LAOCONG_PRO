/**
 * PHASE_TASK_GS_10A — OWNER_ID / REPORTER_ID → USER_CODE mapping checks (FE).
 */

import type { TaskItem } from '@/api/contracts';
import {
  getTaskOwnerDisplay,
  getTaskOwnerTechnicalId,
  getTaskReporterDisplay,
  getTaskReporterTechnicalId,
  getUsersById,
  hydrateUserDirectoryFromSnapshot,
  resolveUserDisplay,
} from '@/runtime/userDisplay';
import { getCollapsedMetaShort } from '@/shared/utils/signalCollapse';

export interface Gs10aCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function mockTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    taskId: 't-10a',
    title: 'USER_CODE mapping test',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    owner: 'Trần Thị B',
    ownerId: 'USR_005',
    displayOwner: 'Trần Thị B',
    ownerUser: { userCode: 'USR_005', displayName: 'Trần Thị B', id: 'UD_DIR_005' },
    reporterId: 'USR_001',
    displayReporter: 'Nguyễn Văn A',
    reporterUser: { userCode: 'USR_001', displayName: 'Nguyễn Văn A', id: 'UD_DIR_001' },
    dueDate: '2026-05-25',
    href: '/tasks/t-10a',
    permissionAllowed: true,
    module: 'TASK',
    source: 'test',
    urgency: {
      isBlocked: false,
      isOverdue: false,
      isWaiting: false,
      isStale: false,
      needsEscalation: false,
      slaRiskLevel: 'LOW',
    },
    ...overrides,
  } as TaskItem;
}

export function runTaskGs10aChecks(): { suite: string; status: string; checks: Gs10aCheck[] } {
  const checks: Gs10aCheck[] = [];

  hydrateUserDirectoryFromSnapshot({
    usersById: {
      USR_005: { id: 'UD_DIR_005', userCode: 'USR_005', displayName: 'Trần Thị B' },
      USR_001: { id: 'UD_DIR_001', userCode: 'USR_001', displayName: 'Nguyễn Văn A' },
    },
    userDisplayMap: {
      USR_005: 'Trần Thị B',
      USR_001: 'Nguyễn Văn A',
    },
  });

  checks.push({
    id: 'directoryKeyedByUserCode',
    label: 'USER_DIRECTORY indexed by USER_CODE (not internal ID)',
    pass:
      getUsersById().USR_005?.displayName === 'Trần Thị B' &&
      getUsersById().UD_DIR_005?.displayName === 'Trần Thị B',
    detail: getUsersById().USR_005?.displayName,
  });

  checks.push({
    id: 'resolveByUserCode',
    label: 'resolveUserDisplay(USR_005) → Trần Thị B',
    pass: resolveUserDisplay('USR_005', { surface: true }) === 'Trần Thị B',
    detail: resolveUserDisplay('USR_005', { surface: true }),
  });

  const task = mockTask();
  const ownerLabel = getTaskOwnerDisplay(task);
  const reporterLabel = getTaskReporterDisplay(task);

  checks.push({
    id: 'ownerDisplayName',
    label: 'OWNER_ID USR_005 renders DISPLAY_NAME Trần Thị B',
    pass: ownerLabel === 'Trần Thị B' && !ownerLabel.includes('USR_005'),
    detail: ownerLabel,
  });

  checks.push({
    id: 'reporterDisplayName',
    label: 'REPORTER_ID USR_001 renders DISPLAY_NAME Nguyễn Văn A',
    pass: reporterLabel === 'Nguyễn Văn A' && !reporterLabel.includes('USR_001'),
    detail: reporterLabel,
  });

  checks.push({
    id: 'displayOwnerNotRawCode',
    label: 'displayOwner is DISPLAY_NAME not USER_CODE',
    pass: task.displayOwner === 'Trần Thị B' && task.displayOwner !== task.ownerId,
    detail: task.displayOwner,
  });

  checks.push({
    id: 'technicalIdsPreserveUserCode',
    label: 'Technical ids remain USER_CODE for lookup',
    pass:
      getTaskOwnerTechnicalId(task) === 'USR_005' &&
      getTaskReporterTechnicalId(task) === 'USR_001',
    detail: `${getTaskOwnerTechnicalId(task)} / ${getTaskReporterTechnicalId(task)}`,
  });

  const meta = getCollapsedMetaShort(task, 'ESCALATION');
  const cardLine = `Escalation ${meta}`.trim();
  checks.push({
    id: 'taskCardEscalationOwner',
    label: 'Task card escalation meta uses owner DISPLAY_NAME',
    pass: cardLine.includes('Trần Thị B') && !cardLine.includes('USR_005'),
    detail: cardLine,
  });

  const unmapped = getTaskOwnerDisplay(
    mockTask({
      ownerUser: undefined,
      displayOwner: undefined,
      owner: 'USR_005',
      ownerId: 'USR_005',
    }),
  );
  checks.push({
    id: 'fallbackWithoutEnrichment',
    label: 'Fallback lookup by USER_CODE when ownerUser absent',
    pass: unmapped === 'Trần Thị B',
    detail: unmapped,
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_10A_OWNER_REPORTER_USER_CODE_MAPPING_FIX',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
