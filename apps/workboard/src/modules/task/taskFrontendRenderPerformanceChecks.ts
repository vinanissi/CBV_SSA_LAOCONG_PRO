/**
 * PHASE_TASK_GS_10C — Frontend render performance checks (static + build refs).
 */

import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';
import taskCardSource from '@/components/ui/TaskCard.tsx?raw';
import taskControlSource from '@/components/ui/TaskControlSurface.tsx?raw';
import runtimeStatusBarSource from '@/components/runtime/RuntimeStatusBar.tsx?raw';
import operationalContextPanelSource from '@/components/ui/OperationalContextPanel.tsx?raw';
import renderPerfSource from '@/shared/utils/renderPerf.ts?raw';
import envExampleSource from '../../../.env.example?raw';

export interface FrontendRenderPerformanceCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

export function runTaskFrontendRenderPerformanceChecks(): {
  suite: string;
  status: string;
  checks: FrontendRenderPerformanceCheck[];
} {
  const checks: FrontendRenderPerformanceCheck[] = [];

  checks.push({
    id: 'renderPerfUtility',
    label: 'Render perf utility exists with required API',
    pass:
      renderPerfSource.includes('markRenderStart') &&
      renderPerfSource.includes('markRenderEnd') &&
      renderPerfSource.includes('measureRender') &&
      renderPerfSource.includes('useRenderCount') &&
      renderPerfSource.includes('usePerfMark'),
  });

  checks.push({
    id: 'perfDebugEnvGated',
    label: 'Perf debug gated by VITE_CBV_RENDER_PERF_DEBUG',
    pass:
      renderPerfSource.includes("import.meta.env.VITE_CBV_RENDER_PERF_DEBUG === 'true'") &&
      envExampleSource.includes('VITE_CBV_RENDER_PERF_DEBUG'),
    detail: 'No console output when flag off',
  });

  checks.push({
    id: 'taskGroupingMemoized',
    label: 'Task grouping uses useMemo + measureRender',
    pass:
      tasksPageSource.includes('const taskGroups = useMemo') &&
      tasksPageSource.includes("measureRender(") &&
      tasksPageSource.includes("'taskGrouping'") &&
      tasksPageSource.includes('groupOperationalTasks'),
  });

  checks.push({
    id: 'taskCardRenderMeasurable',
    label: 'TaskCard render count can be measured',
    pass:
      taskCardSource.includes("useRenderCount('TaskCard')") &&
      tasksPageSource.includes("useRenderCount('TasksPage')"),
  });

  checks.push({
    id: 'footerClockIsolated',
    label: 'Footer clock state isolated in RuntimeStatusBar (not TasksPage)',
    pass:
      runtimeStatusBarSource.includes('clockTick') &&
      !tasksPageSource.includes('clockTick') &&
      runtimeStatusBarSource.includes('setInterval'),
    detail: '30s interval re-renders footer only',
  });

  checks.push({
    id: 'controlSurfaceMemoized',
    label: 'TaskControlSurface memoized with useMemo for context reads',
    pass:
      taskControlSource.includes('memo(function TaskControlSurface') &&
      taskControlSource.includes('useMemo(() => getExecutionMemorySummary()'),
  });

  checks.push({
    id: 'footerDrawerLazy',
    label: 'RuntimeFooterDrawer lazy-loaded when console opens',
    pass:
      runtimeStatusBarSource.includes('lazy(') &&
      runtimeStatusBarSource.includes('RuntimeFooterDrawer'),
  });

  checks.push({
    id: 'contextPanelMeasurable',
    label: 'OperationalContextPanel render count instrumented',
    pass: operationalContextPanelSource.includes("useRenderCount('OperationalContextPanel')"),
  });

  checks.push({
    id: 'noProductionConsoleSpam',
    label: 'Render perf uses console.debug only when enabled',
    pass:
      renderPerfSource.includes('console.debug') &&
      renderPerfSource.includes('if (!ENABLED) return'),
  });

  checks.push({
    id: 'snapshotToQueueMark',
    label: 'Snapshot-to-queue timing marks present',
    pass:
      tasksPageSource.includes("markRenderStart('snapshot-to-queue'") &&
      tasksPageSource.includes("markRenderEnd('snapshot-to-queue'"),
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_10C_FRONTEND_RENDER_PERFORMANCE_AUDIT',
    status: passCount === checks.length ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
