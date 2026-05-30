/**
 * PHASE_UI_CBV_WORK_INBOX_V3 — Phase B adapter sanity checks (no Vitest in workboard).
 * Run: import { runWorkInboxAdapterChecks } from './workInboxAdapterChecks'
 */

import type { TaskItem } from '@/api/contracts';
import {
  mapInboxItemToTaskCardModel,
  mapInboxItemsToTaskCardModels,
  mapTaskToInboxItem,
  mapTasksToInboxItems,
} from './workInboxAdapter';
import type { InboxItem } from '@/modules/task/types/workInboxTypes';

export interface WorkInboxAdapterCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function mockRuntimeTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    taskId: 'TASK-001',
    title: 'Việc mẫu',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    owner: 'USR_001',
    ownerId: 'USR_001',
    dueDate: '2026-05-29',
    href: '/tasks/TASK-001',
    permissionAllowed: true,
    module: 'TASK',
    source: 'google_sheet_existing_db',
    ...overrides,
  };
}

export function runWorkInboxAdapterChecks(): {
  suite: string;
  status: string;
  checks: WorkInboxAdapterCheck[];
} {
  const checks: WorkInboxAdapterCheck[] = [];

  let empty: InboxItem;
  try {
    empty = mapTaskToInboxItem({});
    checks.push({
      id: 'mapsEmptyRawTaskSafely',
      label: 'maps empty raw task safely',
      pass: empty.id === 'unknown-task' && empty.title === 'Chưa có tiêu đề' && empty.group === 'need_action',
      detail: `${empty.id} / ${empty.status} / ${empty.group}`,
    });
  } catch (e) {
    checks.push({
      id: 'mapsEmptyRawTaskSafely',
      label: 'maps empty raw task safely',
      pass: false,
      detail: String(e),
    });
    empty = mapTaskToInboxItem(null);
  }

  const completed = mapTaskToInboxItem({ taskId: 'c1', status: 'COMPLETED', title: 'Done' });
  checks.push({
    id: 'mapsCompletedStatus',
    label: 'maps completed status',
    pass: completed.status === 'completed' && completed.group === 'completed',
    detail: `${completed.status} → ${completed.group}`,
  });

  const waiting = mapTaskToInboxItem({
    taskId: 'w1',
    status: 'WAITING',
    title: 'Wait',
    urgency: { isWaiting: true } as TaskItem['urgency'],
  });
  checks.push({
    id: 'mapsWaitingStatus',
    label: 'maps waiting status',
    pass: waiting.status === 'waiting' && waiting.group === 'waiting',
    detail: `${waiting.status} → ${waiting.group}`,
  });

  const overdue = mapTaskToInboxItem(
    mockRuntimeTask({
      taskId: 'o1',
      isOverdue: true,
      urgency: { isOverdue: true, slaRiskLevel: 'HIGH' } as TaskItem['urgency'],
    }),
  );
  checks.push({
    id: 'mapsOverdueStatus',
    label: 'maps overdue status',
    pass: overdue.status === 'overdue' && overdue.dueLabel === 'Quá hạn',
    detail: overdue.dueLabel,
  });

  const unknown = mapTaskToInboxItem({ taskId: 'u1', status: 'IN_PROGRESS', title: 'X' });
  checks.push({
    id: 'mapsUnknownToNeedAction',
    label: 'maps unknown to need_action',
    pass: unknown.status === 'unknown' && unknown.group === 'need_action',
    detail: `${unknown.status} → ${unknown.group}`,
  });

  const card = mapInboxItemToTaskCardModel(completed);
  checks.push({
    id: 'mapsInboxItemToTaskCardModel',
    label: 'maps InboxItem to TaskCardModel',
    pass:
      card.id === completed.id &&
      card.title === completed.title &&
      card.primaryActionHref.includes('/inbox/c1'),
    detail: card.primaryActionHref,
  });

  const list = mapTasksToInboxItems([{ taskId: 'a' }, null, { taskId: 'b', status: 'DONE', title: 'B' }]);
  const cards = mapInboxItemsToTaskCardModels(list);
  checks.push({
    id: 'mapsArraySafely',
    label: 'maps array safely',
    pass: list.length === 3 && cards.length === 3 && !list.some((i) => !i.id),
    detail: list.map((i) => i.id).join(', '),
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_PHASE_B_DATA_ADAPTER',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}
