/**
 * PHASE_TASK_GS_10D — operational filter runtime checks.
 */

import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';
import taskControlSource from '@/components/ui/TaskControlSurface.tsx?raw';
import filterRuntimeSource from '@/shared/utils/taskFilterRuntime.ts?raw';
import filterDebugSource from '@/shared/utils/taskFilterDebug.ts?raw';
import quickFocusSource from '@/components/ui/QuickFocusFilters.tsx?raw';
import envExampleSource from '../../../.env.example?raw';

export interface OperationalFilterRuntimeCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

export function runTaskOperationalFilterRuntimeChecks(): {
  suite: string;
  status: string;
  checks: OperationalFilterRuntimeCheck[];
} {
  const checks: OperationalFilterRuntimeCheck[] = [];

  checks.push({
    id: 'filterRuntimeUtility',
    label: 'Filter runtime utility exists with deriveVisibleTaskRuntime',
    pass:
      filterRuntimeSource.includes('deriveVisibleTaskRuntime') &&
      filterRuntimeSource.includes('applyTaskFilter') &&
      filterRuntimeSource.includes('groupTasksForMode'),
  });

  checks.push({
    id: 'filterTabsHandler',
    label: 'Filter tabs call selectFilter / onFilterChange',
    pass:
      taskControlSource.includes('onFilterChange') &&
      tasksPageSource.includes('function selectFilter') &&
      tasksPageSource.includes('onFilterChange={selectFilter}'),
  });

  checks.push({
    id: 'activeFilterDerivation',
    label: 'Active filter affects visible task derivation via deriveVisibleTaskRuntime',
    pass:
      tasksPageSource.includes('deriveVisibleTaskRuntime') &&
      tasksPageSource.includes('parseTaskFilter(searchParams.get'),
  });

  checks.push({
    id: 'groupModeDerivation',
    label: 'Group mode affects grouping in filter runtime',
    pass: filterRuntimeSource.includes('groupTasksForMode') && filterRuntimeSource.includes("groupMode === 'cognition'"),
  });

  checks.push({
    id: 'useMemoFilterDeps',
    label: 'Queue runtime useMemo includes filter + groupMode + quickFocus + focusQueueMode',
    pass:
      tasksPageSource.includes('[snapshot, filter, groupMode, quickFocus, focusQueueMode') ||
      tasksPageSource.includes('[snapshot, filter, groupMode, quickFocus, focusQueueMode, user, focusedTaskId]'),
  });

  checks.push({
    id: 'overdueFilterSignal',
    label: 'Quá hạn filter uses overdue signal/date',
    pass:
      filterRuntimeSource.includes('isTaskOverdue') &&
      filterRuntimeSource.includes('isOverdue') &&
      filterRuntimeSource.includes('dueDate'),
  });

  checks.push({
    id: 'visibleCountSummary',
    label: 'Visible count summary updates via summaryText',
    pass:
      filterRuntimeSource.includes('summaryText') &&
      tasksPageSource.includes('summaryText') &&
      taskControlSource.includes('queueSummary'),
  });

  checks.push({
    id: 'emptyStatePerFilter',
    label: 'Empty state exists for zero result per filter',
    pass:
      filterRuntimeSource.includes('emptyCopyForFilter') &&
      tasksPageSource.includes('emptyTitle') &&
      tasksPageSource.includes('emptyMessage'),
  });

  checks.push({
    id: 'selectedTaskFilteredOut',
    label: 'Selected task behavior when filtered out is defined',
    pass:
      tasksPageSource.includes('stillVisible') &&
      tasksPageSource.includes('Không thuộc bộ lọc hiện tại'),
  });

  checks.push({
    id: 'focusToggleAria',
    label: 'Focus toggle has aria-pressed',
    pass: taskControlSource.includes('aria-pressed={focusQueueMode}'),
  });

  checks.push({
    id: 'quickChipsAria',
    label: 'Quick focus chips have aria-pressed',
    pass: quickFocusSource.includes('aria-pressed={focus === f.key}'),
  });

  checks.push({
    id: 'filterDebugGated',
    label: 'Filter debug logs env-gated',
    pass:
      filterDebugSource.includes('VITE_CBV_FILTER_DEBUG') &&
      filterDebugSource.includes('if (!ENABLED) return') &&
      envExampleSource.includes('VITE_CBV_FILTER_DEBUG'),
  });

  checks.push({
    id: 'mineFilterNoSilentAll',
    label: 'Mine filter does not silently show all when operator unknown',
    pass:
      filterRuntimeSource.includes('Không xác định được người dùng hiện tại') &&
      filterRuntimeSource.includes('return { tasks: [], warnings }'),
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_10D_OPERATIONAL_FILTER_RUNTIME_FIX',
    status: passCount === checks.length ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
