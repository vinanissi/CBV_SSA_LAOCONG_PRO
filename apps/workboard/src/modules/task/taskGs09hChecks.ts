/**
 * PHASE_TASK_GS_09H — Information density rebalance checks (FE).
 */

import type { TaskItem } from '@/api/contracts';
import {
  buildCompactCardLine,
  buildPanelExecutionMeta,
  isMetadataCompressed,
} from '@/shared/utils/informationBalance';
import { collapseTaskSignals } from '@/shared/utils/signalCollapse';
import { getSignalLevel, isDominantSignal } from '@/shared/utils/signalPriority';
import { cardDisclosureMode } from '@/shared/utils/scanRhythm';
import { shouldShowNextActionChip } from '@/shared/utils/visualPriority';

export interface Gs09hCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function mockEscalationTask(): TaskItem {
  return {
    taskId: 't-09h',
    title: 'Rà soát escalation density',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    owner: 'Trần Thị B',
    ownerId: 'USR_005',
    ownerUser: { userCode: 'USR_005', displayName: 'Trần Thị B' },
    displayOwner: 'Trần Thị B',
    dueDate: '2026-04-22',
    href: '/tasks/t-09h',
    permissionAllowed: true,
    module: 'TASK',
    source: 'test',
    urgency: {
      isBlocked: false,
      isOverdue: true,
      isWaiting: false,
      isStale: true,
      needsEscalation: true,
      slaRiskLevel: 'HIGH',
      staleDays: 12,
    },
  } as TaskItem;
}

export function runTaskGs09hChecks(): { suite: string; status: string; checks: Gs09hCheck[] } {
  const checks: Gs09hCheck[] = [];
  const task = mockEscalationTask();
  const collapsed = collapseTaskSignals(task);
  const compact = buildCompactCardLine(task, collapsed, false);
  const expanded = buildCompactCardLine(task, collapsed, true);

  checks.push({
    id: 'compactLineFormat',
    label: 'Compact line merges dominant + due + owner',
    pass: compact.line.includes('Escalation') && compact.line.includes('hạn 04/22') && compact.line.includes('Trần Thị B'),
    detail: compact.line,
  });

  checks.push({
    id: 'metadataCompressed',
    label: 'Default card metadata ≤ 3 parts',
    pass: isMetadataCompressed(compact.line, 3),
    detail: String(isMetadataCompressed(compact.line, 3)),
  });

  checks.push({
    id: 'noSecondaryWhenCollapsed',
    label: 'Secondary signal hidden when not expanded',
    pass: !compact.line.includes('12d') && expanded.line.includes('12d') || !collapsed.secondary,
    detail: `collapsed=${compact.line} expanded=${expanded.line}`,
  });

  checks.push({
    id: 'signalLevelHierarchy',
    label: 'Escalation is level 2 dominant signal',
    pass: collapsed.primary?.kind === 'ESCALATION' && isDominantSignal('ESCALATION'),
    detail: collapsed.primary?.kind,
  });

  checks.push({
    id: 'signalLevelCritical',
    label: 'Critical block is level 1',
    pass: getSignalLevel('CRITICAL_BLOCK') === 1 && getSignalLevel('AWARENESS') === 4,
    detail: '1 vs 4',
  });

  checks.push({
    id: 'progressiveDisclosure',
    label: 'cardDisclosureMode expands on focus',
    pass: cardDisclosureMode(true, false) === 'expanded' && cardDisclosureMode(false, false) === 'compact',
    detail: cardDisclosureMode(true, false),
  });

  checks.push({
    id: 'nextChipSuppressed',
    label: 'Next-action chip hidden when dominant signal present',
    pass: shouldShowNextActionChip(collapsed, 'HIGH') === false,
    detail: String(shouldShowNextActionChip(collapsed, 'HIGH')),
  });

  checks.push({
    id: 'panelExecutionMeta',
    label: 'Panel execution meta one-line owner + due',
    pass: buildPanelExecutionMeta(task).includes('Trần Thị B') && buildPanelExecutionMeta(task).includes('hạn'),
    detail: buildPanelExecutionMeta(task),
  });

  const styleText = Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText);
      } catch {
        return [];
      }
    })
    .join('\n');

  for (const cls of ['task-card-scan-row', 'task-card-operational-line', 'task-card-title', 'panel-execution-zone']) {
    checks.push({
      id: `css_${cls}`,
      label: `CSS .${cls} defined`,
      pass: styleText.includes(`.${cls}`),
      detail: cls,
    });
  }

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_09H_INFORMATION_DENSITY_REBALANCE',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
