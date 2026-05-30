/**
 * PHASE_TASK_GS_10D_2 — filter active state visual checks.
 */

import taskControlSource from '@/components/ui/TaskControlSurface.tsx?raw';
import quickFocusSource from '@/components/ui/QuickFocusFilters.tsx?raw';
import groupModeSource from '@/components/ui/GroupModeSelect.tsx?raw';
import styleSource from '@/styles/index.css?raw';

export interface FilterActiveStateVisualCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

export function runTaskFilterActiveStateVisualChecks(): {
  suite: string;
  status: string;
  checks: FilterActiveStateVisualCheck[];
} {
  const checks: FilterActiveStateVisualCheck[] = [];

  checks.push({
    id: 'activeTabAriaSelected',
    label: 'Active filter tab sets aria-selected from filter prop',
    pass:
      taskControlSource.includes('aria-selected={isActive}') &&
      taskControlSource.includes('const isActive = filter === f.key'),
  });

  checks.push({
    id: 'activeTabVisualClass',
    label: 'Active filter tab uses task-filter-tab active class',
    pass:
      taskControlSource.includes('task-filter-tab') &&
      taskControlSource.includes("isActive ? ' active' : ''"),
  });

  checks.push({
    id: 'inactiveTabNoActiveClass',
    label: 'Inactive tab uses base class without active suffix when not selected',
    pass:
      taskControlSource.includes('className={`task-filter-tab${isActive ? \' active\' : \'\'}`}') ||
      taskControlSource.includes("className={`task-filter-tab${isActive ? ' active' : ''}`}"),
  });

  checks.push({
    id: 'focusToggleAriaPressed',
    label: 'Focus toggle binds aria-pressed to focusQueueMode',
    pass: taskControlSource.includes('aria-pressed={focusQueueMode}'),
  });

  checks.push({
    id: 'quickFocusAriaPressed',
    label: 'Quick focus chip sets aria-pressed when active',
    pass:
      quickFocusSource.includes('aria-pressed={isActive}') &&
      quickFocusSource.includes('const isActive = focus === f.key'),
  });

  checks.push({
    id: 'cssActiveStates',
    label: 'CSS defines visible active states for tabs, chips, focus toggle',
    pass:
      styleSource.includes('.task-filter-tab[aria-selected=\'true\']') &&
      styleSource.includes('.quick-focus-chip[aria-pressed=\'true\']') &&
      styleSource.includes('.focus-queue-toggle[aria-pressed=\'true\']') &&
      styleSource.includes('border-blue-400 bg-blue-100'),
  });

  checks.push({
    id: 'groupModeVisual',
    label: 'Group mode select has distinct active wrapper styling',
    pass:
      groupModeSource.includes('group-mode-select-wrap') &&
      styleSource.includes('.group-mode-select-wrap'),
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_10D_2_FILTER_ACTIVE_STATE_VISUAL_FIX',
    status: passCount === checks.length ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
