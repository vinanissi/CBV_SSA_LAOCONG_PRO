/**
 * PHASE_UI_CBV_WORK_INBOX_V3 — Runtime transition checks.
 */

import panelSource from './LegacyTaskRuntimePanel.tsx?raw';
import transitionSource from './workInboxRuntimeTransition.ts?raw';
import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';
import {
  getInitialLegacyRuntimeVisible,
  isLegacyTaskRuntimeAvailable,
  isWorkInboxV3PrimaryEnabled,
  shouldShowWorkInboxV3Panel,
} from './workInboxRuntimeTransition';

export interface RuntimeTransitionCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

export function runRuntimeTransitionChecks(): {
  suite: string;
  status: string;
  checks: RuntimeTransitionCheck[];
} {
  const checks: RuntimeTransitionCheck[] = [];

  checks.push({
    id: 'legacyPanelComponent',
    label: 'LegacyTaskRuntimePanel exists',
    pass: panelSource.includes('Hiện Runtime cũ') && panelSource.includes('Runtime cũ'),
  });

  checks.push({
    id: 'featureFlagsDefined',
    label: 'feature flags defined',
    pass:
      transitionSource.includes('VITE_CBV_WORK_INBOX_V3_PRIMARY') &&
      transitionSource.includes('VITE_CBV_LEGACY_TASK_RUNTIME'),
  });

  checks.push({
    id: 'inboxV3PrimaryDefault',
    label: '/inbox shows V3 when primary',
    pass: shouldShowWorkInboxV3Panel('/inbox'),
  });

  checks.push({
    id: 'inboxLegacyHiddenInitially',
    label: '/inbox legacy hidden initially',
    pass: getInitialLegacyRuntimeVisible('/inbox') === false,
  });

  checks.push({
    id: 'tasksLegacyOpenInitially',
    label: '/tasks legacy open initially',
    pass: getInitialLegacyRuntimeVisible('/tasks') === true,
  });

  checks.push({
    id: 'tasksPageUsesLegacyPanel',
    label: 'TasksPage uses LegacyTaskRuntimePanel',
    pass:
      tasksPageSource.includes('LegacyTaskRuntimePanel') &&
      tasksPageSource.includes('showLegacyRuntime'),
  });

  checks.push({
    id: 'noLegacyDeletion',
    label: 'TaskGroupedList preserved',
    pass: tasksPageSource.includes('TaskGroupedList'),
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_RUNTIME_TRANSITION',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}

/** Documented fallback when primary flag off (no env mutation in checks). */
export function describePrimaryFlagFallback(): string {
  if (isWorkInboxV3PrimaryEnabled()) return 'V3 primary on /inbox';
  if (isLegacyTaskRuntimeAvailable()) return 'Legacy-first on all work-inbox routes';
  return 'V3 panel on all work-inbox routes (legacy UI hidden)';
}
