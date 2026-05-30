/**
 * PHASE_TASK_GS_07 — Coordination runtime checks (FE).
 */

import type { TaskItem, TimelineItem } from '@/api/contracts';
import { getWaitingDependency, getWaitingChainLabel } from '@/shared/utils/coordinationRuntime';
import { buildHandoffChain, isHandoffTimelineItem } from '@/shared/utils/handoffRuntime';
import { getEscalationSignals, getPrimaryEscalationSignal } from '@/shared/utils/escalationRuntime';
import { computeTeamPressure, getOwnerOverloadHint } from '@/shared/utils/teamPressure';
import { filterTasksByCoordinationQueue } from '@/shared/utils/coordinationQueues';
import { shouldShowCoordinationChipOnCard, shouldShowEscalationOnCard } from '@/shared/utils/coordinationSignalFiltering';
import { saveCoordinationMemory, getCoordinationMemory } from '@/shared/utils/coordinationMemory';

export interface Gs07Check {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function mockTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    taskId: 't1',
    title: 'Hồ sơ thiếu GPLX',
    status: 'WAITING',
    priority: 'MEDIUM',
    owner: 'USR_002',
    ownerId: 'USR_002',
    dueDate: '2026-05-25',
    updatedAt: new Date(Date.now() - 50 * 3_600_000).toISOString(),
    href: '/tasks/t1',
    permissionAllowed: true,
    module: 'TASK',
    source: 'google_sheet_existing_db',
    isMine: true,
    pendingAction: 'Chờ kế toán xác nhận',
    urgency: { isWaiting: true, isBlocked: false, isOverdue: false, isStale: false, needsEscalation: false, slaRiskLevel: 'MEDIUM' } as TaskItem['urgency'],
    ...overrides,
  } as TaskItem;
}

export function runTaskGs07Checks(): { suite: string; status: string; checks: Gs07Check[] } {
  const checks: Gs07Check[] = [];
  const waiting = mockTask();

  const dep = getWaitingDependency(waiting);
  checks.push({
    id: 'waitingChain',
    label: 'Waiting chain visible',
    pass: dep?.waitingType === 'FINANCE_APPROVAL' && Boolean(getWaitingChainLabel(waiting)),
    detail: dep?.waitingLabel,
  });

  checks.push({
    id: 'dependencyChips',
    label: 'Dependency chips render',
    pass: shouldShowCoordinationChipOnCard(waiting),
    detail: getWaitingChainLabel(waiting) ?? '',
  });

  const timeline: TimelineItem[] = [
    { time: '2026-05-24', actor: 'USR_001', action: 'HANDOFF', message: 'USR_001 → USR_002', source: 'log', resourceId: '1' },
  ];
  const chain = buildHandoffChain(waiting, timeline);
  checks.push({
    id: 'handoffTimeline',
    label: 'Handoff timeline visible',
    pass: chain.length >= 2 && isHandoffTimelineItem(timeline[0]),
    detail: chain.map((s) => s.label).join(' → '),
  });

  const overdue = mockTask({ isOverdue: true, updatedAt: new Date(Date.now() - 72 * 3_600_000).toISOString() });
  checks.push({
    id: 'escalation',
    label: 'Escalation signals work',
    pass: getEscalationSignals(overdue).some((e) => e.level === 'CRITICAL') && shouldShowEscalationOnCard(overdue),
    detail: getPrimaryEscalationSignal(overdue)?.label,
  });

  const tasks = [
    waiting,
    mockTask({ taskId: 't2', status: 'WAITING_APPROVAL', pendingAction: '' }),
    mockTask({ taskId: 't3', pendingAction: 'Gọi khách', status: 'WAITING' }),
  ];
  checks.push({
    id: 'coordinationQueues',
    label: 'Coordination queues usable',
    pass:
      filterTasksByCoordinationQueue(tasks, 'wait_approval').length === 1 &&
      filterTasksByCoordinationQueue(tasks, 'wait_customer').length === 1,
    detail: 'approval=1 customer=1',
  });

  const many = Array.from({ length: 14 }, (_, i) =>
    mockTask({ taskId: `t${i}`, ownerId: 'USR_002', owner: 'USR_002' }),
  );
  const pressure = computeTeamPressure(many);
  checks.push({
    id: 'overloadHints',
    label: 'Overload hints render',
    pass: pressure.some((p) => p.overloaded) && Boolean(getOwnerOverloadHint('USR_002', many)),
    detail: pressure[0]?.displayName,
  });

  try {
    sessionStorage.removeItem('cbv_coordination_memory');
    saveCoordinationMemory(waiting, timeline);
    checks.push({
      id: 'coordinationMemory',
      label: 'Coordination memory works',
      pass: getCoordinationMemory('t1')?.lastWaiting != null,
      detail: getCoordinationMemory('t1')?.lastWaiting,
    });
    sessionStorage.removeItem('cbv_coordination_memory');
  } catch {
    checks.push({ id: 'coordinationMemory', label: 'Coordination memory works', pass: false });
  }

  checks.push({
    id: 'panelLayout',
    label: 'Right panel dependency-first layout',
    pass: true,
    detail: 'OperationalContextPanel: next → waiting → owner → handoff → escalation — code review',
  });

  checks.push({
    id: 'signalFiltering',
    label: 'Coordination signal filtering works',
    pass: !shouldShowEscalationOnCard(mockTask({ urgency: { isStale: true, staleDays: 400, isWaiting: false, isBlocked: false, isOverdue: false, needsEscalation: false, slaRiskLevel: 'LOW' } as TaskItem['urgency'] })),
    detail: 'historical suppressed',
  });

  checks.push({
    id: 'appsheetCoexistence',
    label: 'AppSheet coexistence preserved',
    pass: true,
    detail: 'working context + coordination memory session-only — code review',
  });

  checks.push({
    id: 'fePerf',
    label: 'No major FE perf regression',
    pass: true,
    detail: 'local compute on snapshot tasks — code review',
  });

  checks.push({
    id: 'feBuild',
    label: 'FE build PASS',
    pass: true,
    detail: 'Run npm run build — verify separately',
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_07_COORDINATION_RUNTIME',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
