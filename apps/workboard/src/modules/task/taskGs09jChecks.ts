/**
 * PHASE_TASK_GS_09J — Visual stability runtime checks (FE).
 */

import { getHotSignalClass, resolveCardHotSignalClass } from '@/shared/utils/hotSignalRuntime';
import { loadFocusQueueMode, saveFocusQueueMode } from '@/shared/utils/focusQueueMode';
import { ACTION_ZONE_WIDTH_REM, HOT_SIGNAL_BAR_PX } from '@/shared/utils/scanRhythm';
import { collapseTaskSignals } from '@/shared/utils/signalCollapse';
import type { TaskItem } from '@/api/contracts';

export interface Gs09jCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function readStyleSheets(): string {
  return Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText);
      } catch {
        return [];
      }
    })
    .join('\n');
}

function ruleSlice(cls: string): string {
  const styleText = readStyleSheets();
  const idx = styleText.indexOf(`.${cls}`);
  return idx >= 0 ? styleText.slice(idx, idx + 400) : '';
}

function mockHotTask(): TaskItem {
  return {
    taskId: 't-09j',
    title: 'Visual stability hot signal',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    owner: 'Test',
    ownerId: 'USR_001',
    dueDate: '2026-04-22',
    href: '/tasks/t-09j',
    permissionAllowed: true,
    module: 'TASK',
    source: 'test',
    urgency: { needsEscalation: true, isOverdue: false, isWaiting: false, isStale: false, isBlocked: false },
  } as TaskItem;
}

export function runTaskGs09jChecks(): { suite: string; status: string; checks: Gs09jCheck[] } {
  const checks: Gs09jCheck[] = [];
  const styleText = readStyleSheets();
  const collapsed = collapseTaskSignals(mockHotTask());

  for (const cls of ['task-signal-hot', 'task-signal-overdue', 'task-signal-waiting', 'task-signal-blocked']) {
    checks.push({
      id: `hotSignal_${cls}`,
      label: `Hot signal class .${cls} defined`,
      pass: styleText.includes(`.${cls}`),
      detail: cls,
    });
  }

  checks.push({
    id: 'hotSignalMapping',
    label: 'Escalation maps to task-signal-hot',
    pass: getHotSignalClass('ESCALATION') === 'task-signal-hot' && resolveCardHotSignalClass(collapsed) === 'task-signal-hot',
    detail: resolveCardHotSignalClass(collapsed),
  });

  checks.push({
    id: 'actionZoneStable',
    label: 'Fixed action zone width class present',
    pass: styleText.includes('.task-card-action-zone') && ruleSlice('task-card-action-zone').includes('4.25rem'),
    detail: `${ACTION_ZONE_WIDTH_REM}rem`,
  });

  checks.push({
    id: 'actionSlotAlignment',
    label: 'Action slot baseline classes present',
    pass: styleText.includes('.task-action-slot') && styleText.includes('.task-card-row'),
    detail: 'task-action-slot + task-card-row',
  });

  checks.push({
    id: 'controlStripCompressed',
    label: 'Unified operational control strip',
    pass: styleText.includes('.operational-control-strip') && styleText.includes('.operational-control-primary'),
    detail: 'single strip container',
  });

  checks.push({
    id: 'focusModeToggle',
    label: 'Focus queue toggle class present',
    pass: styleText.includes('.focus-queue-toggle'),
    detail: 'focus-queue-toggle',
  });

  checks.push({
    id: 'focusModePersistence',
    label: 'Focus queue mode persistence round-trip',
    pass: (() => {
      saveFocusQueueMode(true);
      const loaded = loadFocusQueueMode();
      saveFocusQueueMode(false);
      return loaded === true;
    })(),
    detail: 'sessionStorage cbv_focus_queue_mode',
  });

  checks.push({
    id: 'panelExecutionGravity',
    label: 'Panel execution gravity zone',
    pass: styleText.includes('.panel-execution-gravity') && styleText.includes('.panel-next-action-primary'),
    detail: 'execution command zone',
  });

  checks.push({
    id: 'noSaturatedCardBg',
    label: 'Hot signals use border only (no red-50 card tint on patterns)',
    pass: !ruleSlice('task-signal-hot').includes('bg-red') && !ruleSlice('task-signal-overdue').includes('bg-red-50'),
    detail: `${HOT_SIGNAL_BAR_PX}px border bar`,
  });

  checks.push({
    id: 'scanRhythmClasses',
    label: 'Queue scan rhythm classes present',
    pass: styleText.includes('.task-card-scan-row') && styleText.includes('.task-card-title'),
    detail: 'scan row + title',
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_09J_VISUAL_STABILITY_RUNTIME',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
