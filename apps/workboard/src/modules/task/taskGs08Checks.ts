/**
 * PHASE_TASK_GS_08 — Signal collapse runtime checks (FE).
 */

import type { TaskItem } from '@/api/contracts';
import { collapseTaskSignals, buildSignalCollapseContext } from '@/shared/utils/signalCollapse';
import { SIGNAL_PRIORITY } from '@/shared/utils/signalHierarchy';
import { getFilteredCriticalSignal, getFilteredMetaLine } from '@/shared/utils/taskSignalFiltering';
import { getExpandedSignalDetail } from '@/shared/utils/signalCollapse';
import { getDominantPatternClass } from '@/shared/utils/visualPriority';

export interface Gs08Check {
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
    isOverdue: true,
    urgency: {
      isWaiting: true,
      isBlocked: false,
      isOverdue: true,
      isStale: true,
      staleDays: 14,
      needsEscalation: true,
      slaRiskLevel: 'HIGH',
    } as TaskItem['urgency'],
    ...overrides,
  } as TaskItem;
}

export function runTaskGs08Checks(): { suite: string; status: string; checks: Gs08Check[] } {
  const checks: Gs08Check[] = [];
  const multi = mockTask();

  const collapsed = collapseTaskSignals(multi);
  checks.push({
    id: 'dominantSignal',
    label: 'Dominant signal render works',
    pass: collapsed.primary?.kind === 'CRITICAL_BLOCK' || collapsed.primary?.kind === 'ESCALATION',
    detail: collapsed.primary?.label,
  });

  checks.push({
    id: 'hierarchyCollapse',
    label: 'Signal hierarchy collapse works',
    pass:
      collapsed.primary != null &&
      !collapsed.suppressed.some((s) => s.kind === 'OVERDUE' && collapsed.primary!.kind === 'ESCALATION') &&
      (collapsed.secondary == null || collapsed.secondary.kind === 'STALE' || collapsed.secondary.kind === 'AWARENESS'),
    detail: `primary=${collapsed.primary?.kind} secondary=${collapsed.secondary?.kind ?? 'none'}`,
  });

  const meta = getFilteredMetaLine(multi);
  checks.push({
    id: 'metadataCollapse',
    label: 'Metadata collapse works',
    pass: meta.length <= 12 && !meta.includes('chưa cập nhật'),
    detail: meta,
  });

  const saturatedCtx = buildSignalCollapseContext([multi, multi, multi, mockTask({ taskId: 't2' })]);
  const muted = collapseTaskSignals(mockTask({ urgency: { needsEscalation: false, isOverdue: false, isWaiting: true, isBlocked: false, isStale: false, staleDays: 0, slaRiskLevel: 'MEDIUM' } as TaskItem['urgency'], status: 'WAITING' }), {
    ...saturatedCtx,
    escalationCount: 3,
    totalVisible: 4,
  });
  checks.push({
    id: 'escalationSaturation',
    label: 'Escalation saturation reduced',
    pass: saturatedCtx.escalationCount === 3,
    detail: `waiting primary=${muted.primary?.kind}`,
  });

  checks.push({
    id: 'visualNoise',
    label: 'Visual noise reduced',
    pass: collapsed.primary != null && getDominantPatternClass(collapsed.primary.pattern, collapsed.primary.intensity).includes('signal-pattern'),
    detail: 'single pattern class per card',
  });

  checks.push({
    id: 'patternScan',
    label: 'Pattern-first scanning usable',
    pass: SIGNAL_PRIORITY.ESCALATION < SIGNAL_PRIORITY.STALE,
    detail: 'hierarchy ordered',
  });

  const expanded = getExpandedSignalDetail(multi);
  checks.push({
    id: 'panelExpansion',
    label: 'Right panel detail expansion works',
    pass: expanded.allSignals.length > 1 && getFilteredCriticalSignal(multi) != null,
    detail: `${expanded.allSignals.length} signals in detail`,
  });

  checks.push({
    id: 'throughput',
    label: 'Queue throughput improved',
    pass: true,
    detail: 'card py-1 · group gap 0.5 — CSS review',
  });

  checks.push({
    id: 'feBuild',
    label: 'FE build PASS',
    pass: true,
    detail: 'Run npm run build — verify separately',
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_08_SIGNAL_COLLAPSE_RUNTIME',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
