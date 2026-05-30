/**
 * PHASE_TASK_GS_09C — Task card must not show raw USR_* when directory map exists.
 */

import type { TaskItem } from '@/api/contracts';
import {
  getTaskOwnerDisplay,
  getUserDisplayMap,
  saveUserDisplayMap,
  saveUsersDirectory,
  UNKNOWN_USER_SURFACE_LABEL,
} from '@/runtime/userDisplay';
import { collapseTaskSignals, getCollapsedMetaShort } from '@/shared/utils/signalCollapse';
import { getFilteredMetaLine } from '@/shared/utils/taskSignalFiltering';

export interface Gs09cCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function mockEscalationTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    taskId: 't-esc',
    title: 'Task escalation test',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    owner: 'USR_005',
    ownerId: 'USR_005',
    dueDate: '2026-05-25',
    href: '/tasks/t-esc',
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

export function runTaskGs09cChecks(): { suite: string; status: string; checks: Gs09cCheck[] } {
  const checks: Gs09cCheck[] = [];

  saveUserDisplayMap({});
  saveUsersDirectory([]);

  const unmapped = mockEscalationTask();
  const metaUnmapped = getCollapsedMetaShort(unmapped, 'ESCALATION');
  checks.push({
    id: 'unmappedOwnerIdFallback',
    label: 'Unmapped ownerId falls back to USER_CODE not Chưa rõ người xử lý',
    pass: metaUnmapped.includes('USR_005') && !metaUnmapped.includes(UNKNOWN_USER_SURFACE_LABEL),
    detail: metaUnmapped,
  });

  saveUserDisplayMap({ USR_005: 'Nguyễn Văn B' });
  saveUsersDirectory([
    { userId: 'USR_005', userCode: 'USR_005', displayName: 'Nguyễn Văn B', email: '', role: 'STAFF' },
  ]);

  const mapped = mockEscalationTask();
  const collapsed = collapseTaskSignals(mapped);
  const metaMapped = collapsed.metaShort;
  const cardLine = `${collapsed.primary?.label ?? ''} ${metaMapped}`.trim();

  checks.push({
    id: 'mappedDisplayName',
    label: 'Mapped owner shows DISPLAY_NAME on card',
    pass: cardLine.includes('Nguyễn Văn B') && !cardLine.includes('USR_005'),
    detail: cardLine,
  });

  checks.push({
    id: 'filteredMetaLine',
    label: 'Filtered meta line uses display name',
    pass: getFilteredMetaLine(mapped).includes('Nguyễn Văn B') && !getFilteredMetaLine(mapped).includes('USR_005'),
    detail: getFilteredMetaLine(mapped),
  });

  checks.push({
    id: 'ownerUserPriority',
    label: 'ownerUser.displayName takes priority',
    pass:
      getTaskOwnerDisplay({
        owner: 'USR_005',
        ownerId: 'USR_005',
        ownerUser: { userCode: 'USR_005', id: 'USR_005', displayName: 'Nguyễn Văn B' },
      }) === 'Nguyễn Văn B',
    detail: getTaskOwnerDisplay({
      owner: 'USR_005',
      ownerId: 'USR_005',
      ownerUser: { userCode: 'USR_005', id: 'USR_005', displayName: 'Nguyễn Văn B' },
    }),
  });

  checks.push({
    id: 'directoryMapLoaded',
    label: 'User directory map available after seed',
    pass: Boolean(getUserDisplayMap().USR_005),
    detail: getUserDisplayMap().USR_005,
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_09C_FIX_VISIBLE_USER_CODE_IN_TASK_CARD',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
