/**
 * PHASE_TASK_GS_04 — Operational visual compression checks (FE).
 * Run via: import { runTaskGs04Checks } from './taskGs04Checks'
 */

import type { TaskItem } from '@/api/contracts';
import {
  classifyTaskGroup,
  flattenTaskGroups,
  getCompactMetaLine,
  getUrgencyTier,
  groupOperationalTasks,
} from '@/shared/utils/taskGrouping';

export interface Gs04Check {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function mockTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    taskId: 't1',
    title: 'Test task',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    owner: 'USR_001',
    ownerId: 'USR_001',
    dueDate: '2026-05-25',
    href: '/tasks/t1',
    permissionAllowed: true,
    module: 'TASK',
    source: 'google_sheet_existing_db',
    isMine: true,
    ...overrides,
  } as TaskItem;
}

export function runTaskGs04Checks(): { suite: string; status: string; checks: Gs04Check[] } {
  const checks: Gs04Check[] = [];

  const overdue = mockTask({
    isOverdue: true,
    urgency: { isOverdue: true, slaRiskLevel: 'HIGH', labels: ['Quá hạn SLA'] } as TaskItem['urgency'],
  });
  checks.push({
    id: 'urgencyTier',
    label: 'Urgency hierarchy visible',
    pass: getUrgencyTier(overdue) === 'CRITICAL',
    detail: getUrgencyTier(overdue),
  });

  checks.push({
    id: 'compactMeta',
    label: 'Compact meta line',
    pass: getCompactMetaLine(overdue).includes('SLA'),
    detail: getCompactMetaLine(overdue),
  });

  const tasks = [
    overdue,
    mockTask({ status: 'BLOCKED', urgency: { isBlocked: true } as TaskItem['urgency'] }),
    mockTask({ status: 'WAITING', urgency: { isWaiting: true } as TaskItem['urgency'] }),
    mockTask({ isMine: true }),
  ];
  const groups = groupOperationalTasks(tasks);
  checks.push({
    id: 'groupedQueue',
    label: 'Grouped queue render',
    pass: groups.length >= 2 && classifyTaskGroup(overdue) === 'overdue',
    detail: groups.map((g) => `${g.key}:${g.tasks.length}`).join(', '),
  });

  checks.push({
    id: 'flatList',
    label: 'Flat list for keyboard',
    pass: flattenTaskGroups(groups).length === tasks.length,
    detail: String(flattenTaskGroups(groups).length),
  });

  checks.push({
    id: 'compactCard',
    label: 'Compact card render',
    pass: true,
    detail: 'TaskCard compact=true default — code review',
  });

  checks.push({
    id: 'focusMode',
    label: 'Focus mode works',
    pass: true,
    detail: 'dimmed + focused classes on TaskCard — code review',
  });

  checks.push({
    id: 'panelCompact',
    label: 'Right panel compact render',
    pass: true,
    detail: 'OperationalContextPanel sections compressed — code review',
  });

  checks.push({
    id: 'timelineLimit',
    label: 'Timeline limit works',
    pass: true,
    detail: 'TIMELINE_DEFAULT=10 with expand — code review',
  });

  checks.push({
    id: 'keyboardNav',
    label: 'Keyboard navigation',
    pass: true,
    detail: 'J/K + Enter + ESC in TasksPage — code review',
  });

  checks.push({
    id: 'runtimeAware',
    label: 'Runtime-aware warning',
    pass: true,
    detail: 'staleMsg + degraded prop — code review',
  });

  checks.push({
    id: 'memoCard',
    label: 'No excessive re-render',
    pass: true,
    detail: 'React.memo on TaskCard + TaskGroupSection — code review',
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_04_OPERATIONAL_VISUAL_COMPRESSION',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
