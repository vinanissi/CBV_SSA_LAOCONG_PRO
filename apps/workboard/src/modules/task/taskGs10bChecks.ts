/**
 * PHASE_TASK_GS_10B — USER_DIRECTORY lookup miss fix checks (FE).
 */

import type { TaskItem } from '@/api/contracts';
import {
  enrichTaskUserFieldsFromDirectory,
  getTaskOwnerDisplay,
  getUserDisplayMap,
  hydrateUserDirectoryFromSnapshot,
  normalizeUserLookupKey,
  resolveTaskOwnerId,
  type TaskUserFieldSource,
} from '@/runtime/userDisplay';
import { getCollapsedMetaShort } from '@/shared/utils/signalCollapse';

export interface Gs10bCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function mockTask(overrides: Partial<TaskItem> & TaskUserFieldSource = {}): TaskItem {
  return {
    taskId: 't-10b',
    title: 'Lookup miss fix test',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    owner: 'USR_005',
    ownerId: 'USR_005',
    dueDate: '2026-05-25',
    href: '/tasks/t-10b',
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

export function runTaskGs10bChecks(): { suite: string; status: string; checks: Gs10bCheck[] } {
  const checks: Gs10bCheck[] = [];

  hydrateUserDirectoryFromSnapshot({
    usersById: {
      USR_005: { id: 'UD_DIR_005', userCode: 'USR_005', displayName: 'Nguyễn Văn A' },
    },
    userDisplayMap: {
      USR_005: 'Nguyễn Văn A',
    },
  });

  checks.push({
    id: 'normalizeUserCode',
    label: 'normalizeUserLookupKey trims and uppercases USR codes',
    pass: normalizeUserLookupKey(' usr_005 ') === 'USR_005',
    detail: normalizeUserLookupKey(' usr_005 '),
  });

  checks.push({
    id: 'displayMapLoaded',
    label: 'userDisplayMap keyed by USER_CODE',
    pass: getUserDisplayMap().USR_005 === 'Nguyễn Văn A',
    detail: getUserDisplayMap().USR_005,
  });

  const rawTask = mockTask({ OWNER_ID: ' usr_005 ', ownerId: undefined });
  checks.push({
    id: 'ownerIdAlias',
    label: 'resolveTaskOwnerId reads OWNER_ID alias with trim',
    pass: resolveTaskOwnerId(rawTask) === 'USR_005',
    detail: resolveTaskOwnerId(rawTask),
  });

  const enriched = enrichTaskUserFieldsFromDirectory(mockTask());
  const ownerLabel = getTaskOwnerDisplay(enriched);

  checks.push({
    id: 'ownerDisplayName',
    label: 'OWNER_ID USR_005 renders Nguyễn Văn A',
    pass: ownerLabel === 'Nguyễn Văn A',
    detail: ownerLabel,
  });

  checks.push({
    id: 'notUnknownLabel',
    label: 'Does not render Chưa rõ người when directory mapped',
    pass: !ownerLabel.includes('Chưa rõ người'),
    detail: ownerLabel,
  });

  checks.push({
    id: 'notRawUserCode',
    label: 'Does not render raw USR_005 when directory mapped',
    pass: ownerLabel !== 'USR_005',
    detail: ownerLabel,
  });

  checks.push({
    id: 'enrichedSnapshotFields',
    label: 'enrichTaskUserFieldsFromDirectory sets ownerUser + displayOwner',
    pass:
      enriched.ownerUser?.displayName === 'Nguyễn Văn A' &&
      enriched.displayOwner === 'Nguyễn Văn A',
    detail: enriched.displayOwner,
  });

  const cardMeta = getCollapsedMetaShort(enriched, 'ESCALATION');
  checks.push({
    id: 'taskCardMeta',
    label: 'Task card meta uses DISPLAY_NAME',
    pass: cardMeta.includes('Nguyễn Văn A') && !cardMeta.includes('USR_005'),
    detail: cardMeta,
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_10B_FIX_USER_DIRECTORY_LOOKUP_MISS',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
