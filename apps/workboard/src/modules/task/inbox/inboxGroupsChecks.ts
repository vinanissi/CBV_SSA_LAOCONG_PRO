/**
 * PHASE_UI_CBV_WORK_INBOX_V3 — Phase C inbox group builder checks.
 */

import { mapTaskToInboxItem, mapTasksToInboxItems } from '@/modules/task/adapters/workInboxAdapter';
import {
  buildInboxGroups,
  buildVisibleInboxGroups,
  INBOX_GROUP_ORDER,
  collectRuntimeTasksFromSnapshot,
} from './inboxGroups';
import type { InboxItem } from '@/modules/task/types/workInboxTypes';

export interface InboxGroupsCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function item(group: InboxItem['group'], id: string): InboxItem {
  return {
    id,
    title: `Task ${id}`,
    group,
    status: group === 'completed' ? 'completed' : group === 'waiting' ? 'waiting' : 'unknown',
    module: 'TASK',
    primaryActionLabel: 'Mở xử lý',
    primaryActionHref: `/inbox/${id}`,
  };
}

export function runInboxGroupsChecks(): { suite: string; status: string; checks: InboxGroupsCheck[] } {
  const checks: InboxGroupsCheck[] = [];

  const empty = buildInboxGroups([]);
  checks.push({
    id: 'emptyInput',
    label: 'empty input',
    pass: empty.length === 4 && empty.every((b) => b.items.length === 0),
    detail: empty.map((b) => `${b.key}:${b.items.length}`).join(', '),
  });

  const mixed = buildInboxGroups([
    item('need_action', 'n1'),
    item('waiting', 'w1'),
    item('follow_up', 'f1'),
    item('completed', 'c1'),
    item('need_action', 'n2'),
  ]);
  checks.push({
    id: 'needActionGroup',
    label: 'need_action group',
    pass: mixed[0].key === 'need_action' && mixed[0].items.length === 2,
    detail: String(mixed[0].items.length),
  });
  checks.push({
    id: 'waitingGroup',
    label: 'waiting group',
    pass: mixed[1].items.length === 1 && mixed[1].label.includes('Chờ'),
  });
  checks.push({
    id: 'followUpGroup',
    label: 'follow_up group',
    pass: mixed[2].items.length === 1,
  });
  checks.push({
    id: 'completedGroup',
    label: 'completed group',
    pass: mixed[3].items.length === 1,
  });

  checks.push({
    id: 'fixedOrder',
    label: 'fixed group order',
    pass: mixed.map((b) => b.key).join(',') === INBOX_GROUP_ORDER.join(','),
    detail: mixed.map((b) => b.key).join(' → '),
  });

  const visible = buildVisibleInboxGroups([item('waiting', 'w-only')]);
  checks.push({
    id: 'visibleHidesEmpty',
    label: 'visible hides empty buckets',
    pass: visible.length === 1 && visible[0].key === 'waiting',
  });

  const fromAdapter = buildInboxGroups(
    mapTasksToInboxItems([
      { taskId: 'a', status: 'WAITING', title: 'A' },
      { taskId: 'b', status: 'COMPLETED', title: 'B' },
    ]),
  );
  checks.push({
    id: 'usesAdapterOutput',
    label: 'uses adapter output',
    pass: fromAdapter[1].items.length === 1 && fromAdapter[3].items.length === 1,
    detail: `waiting=${fromAdapter[1].items.length} completed=${fromAdapter[3].items.length}`,
  });

  const collected = collectRuntimeTasksFromSnapshot({
    tasks: [{ taskId: 't1', title: 'T', status: 'NEW', priority: 'LOW', owner: 'u', ownerId: 'u', dueDate: '', href: '', permissionAllowed: true, module: 'TASK', source: '' }],
    blockedTasks: [{ taskId: 't1', title: 'T', status: 'NEW', priority: 'LOW', owner: 'u', ownerId: 'u', dueDate: '', href: '', permissionAllowed: true, module: 'TASK', source: '' }],
    dueTasks: [],
    overdueTasks: [],
    runtime: {} as never,
    counts: {} as never,
  });
  checks.push({
    id: 'collectSnapshotDedupes',
    label: 'collect snapshot dedupes',
    pass: collected.length === 1,
  });

  const single = mapTaskToInboxItem({});
  checks.push({
    id: 'mixedInputSafe',
    label: 'mixed input safe',
    pass: single.group === 'need_action' && buildInboxGroups([single])[0].items.length === 1,
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_PHASE_C_INBOX_GROUPS',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}
