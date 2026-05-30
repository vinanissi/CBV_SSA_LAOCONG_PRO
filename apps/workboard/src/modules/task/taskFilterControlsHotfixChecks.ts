/**
 * HOTFIX — filter controls interaction checks.
 */

import taskControlSource from '@/components/ui/TaskControlSurface.tsx?raw';
import quickFocusSource from '@/components/ui/QuickFocusFilters.tsx?raw';
import groupModeSource from '@/components/ui/GroupModeSelect.tsx?raw';
import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';
import filterKeysSource from '@/shared/constants/taskFilterKeys.ts?raw';
import filterRuntimeSource from '@/shared/utils/taskFilterRuntime.ts?raw';
import filterDebugSource from '@/shared/utils/taskFilterDebug.ts?raw';
import styleSource from '@/styles/index.css?raw';

export interface FilterControlsHotfixCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

export function runTaskFilterControlsHotfixChecks(): {
  suite: string;
  status: string;
  checks: FilterControlsHotfixCheck[];
} {
  const checks: FilterControlsHotfixCheck[] = [];

  checks.push({
    id: 'taskFilterKeyMap',
    label: 'TaskFilterKey enum/map unified (mine/pending/overdue/approval)',
    pass:
      filterKeysSource.includes("key: 'mine'") &&
      filterKeysSource.includes("key: 'pending'") &&
      filterKeysSource.includes("key: 'overdue'") &&
      filterKeysSource.includes("key: 'approval'") &&
      filterKeysSource.includes('TASK_FILTER_KEYS'),
  });

  checks.push({
    id: 'activeFilterClassBinding',
    label: 'TaskControlSurface uses activeFilter for tab class + aria-selected',
    pass:
      taskControlSource.includes('activeFilter') &&
      taskControlSource.includes('activeFilter === tab.key') &&
      taskControlSource.includes('task-filter-tab-active'),
  });

  checks.push({
    id: 'tabOnClickHandler',
    label: 'Tab onClick calls onFilterChange(tab.key)',
    pass:
      taskControlSource.includes('onClick={() => onFilterChange(tab.key)}') &&
      taskControlSource.includes('TASK_FILTER_TABS.map'),
  });

  checks.push({
    id: 'groupSelectControlled',
    label: 'Group select uses controlled value prop',
    pass:
      groupModeSource.includes('value={mode}') &&
      !groupModeSource.includes('defaultValue'),
  });

  checks.push({
    id: 'focusToggleControlled',
    label: 'Focus toggle uses aria-pressed and onFocusQueueModeChange',
    pass:
      taskControlSource.includes('aria-pressed={focusQueueMode}') &&
      taskControlSource.includes('onFocusQueueModeChange(!focusQueueMode)'),
  });

  checks.push({
    id: 'quickChipAriaPressed',
    label: 'Quick focus chips use aria-pressed when active',
    pass:
      quickFocusSource.includes('aria-pressed={isActive}') &&
      quickFocusSource.includes('quick-focus-chip-active'),
  });

  checks.push({
    id: 'activeCssExists',
    label: 'Explicit active CSS for tabs/chips/focus exists',
    pass:
      styleSource.includes('.task-filter-tab-active') &&
      styleSource.includes('.task-filter-tab[aria-selected=\'true\']') &&
      styleSource.includes('background: #dbeafe'),
  });

  checks.push({
    id: 'deriveUsesActiveState',
    label: 'deriveVisibleTaskRuntime receives activeFilter/groupMode/quickFocus/focusMode',
    pass:
      tasksPageSource.includes('activeFilter') &&
      tasksPageSource.includes('activeGroupMode') &&
      tasksPageSource.includes('setActiveFilter') &&
      filterRuntimeSource.includes('deriveVisibleTaskRuntime'),
  });

  checks.push({
    id: 'filterClickDebug',
    label: 'Filter click debug log env-gated',
    pass:
      filterDebugSource.includes('logFilterClick') &&
      filterDebugSource.includes('[CBV filter click]') &&
      tasksPageSource.includes('logFilterClick'),
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'HOTFIX_TASK_FILTER_CONTROLS_NOT_WORKING',
    status: passCount === checks.length ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
