import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isWorkInboxRoute } from '@/shared/routes/inboxRoutes';
import { isWorkInboxFocusRuntimeEnabled } from '@/modules/task/inbox/workInboxGroupsFeature';
import type { WorkInboxKpiMetrics } from '@/modules/task/inbox/workInboxKpi';

export type WorkInboxViewMode = 'inbox' | 'focus';

export interface WorkInboxLayoutSnapshot {
  viewMode: WorkInboxViewMode;
  metrics: WorkInboxKpiMetrics;
  focusQueueSize: number;
}

interface WorkInboxLayoutContextValue extends WorkInboxLayoutSnapshot {
  setViewMode: (mode: WorkInboxViewMode) => void;
  enterFocus: () => void;
  showInboxList: () => void;
  publishMetrics: (metrics: WorkInboxKpiMetrics, focusQueueSize: number) => void;
  /** Hide legacy DetailPanel ("Ngữ cảnh vận hành") on /inbox V3. */
  suppressGlobalDetailPanel: boolean;
  /** Three-region focus layout: workspace + outer right tabs. */
  useThreeRegionFocusLayout: boolean;
}

const DEFAULT_METRICS: WorkInboxKpiMetrics = {
  total: 0,
  overdue: 0,
  open: 0,
  alerts: 0,
};

function metricsEqual(a: WorkInboxKpiMetrics, b: WorkInboxKpiMetrics): boolean {
  return (
    a.total === b.total &&
    a.overdue === b.overdue &&
    a.open === b.open &&
    a.alerts === b.alerts
  );
}

const WorkInboxLayoutContext = createContext<WorkInboxLayoutContextValue | null>(null);

export function WorkInboxLayoutProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<WorkInboxViewMode>('focus');
  const [metrics, setMetrics] = useState<WorkInboxKpiMetrics>(DEFAULT_METRICS);
  const [focusQueueSize, setFocusQueueSize] = useState(0);

  const suppressGlobalDetailPanel =
    isWorkInboxRoute(location.pathname) && isWorkInboxFocusRuntimeEnabled();

  const useThreeRegionFocusLayout = suppressGlobalDetailPanel && viewMode === 'focus';

  const publishMetrics = useCallback((next: WorkInboxKpiMetrics, queueSize: number) => {
    setMetrics((prev) => (metricsEqual(prev, next) ? prev : next));
    setFocusQueueSize((prev) => (prev === queueSize ? prev : queueSize));
  }, []);

  const setViewModeGuarded = useCallback((mode: WorkInboxViewMode) => {
    setViewMode((prev) => (prev === mode ? prev : mode));
  }, []);

  const enterFocus = useCallback(() => setViewModeGuarded('focus'), [setViewModeGuarded]);
  const showInboxList = useCallback(() => setViewModeGuarded('inbox'), [setViewModeGuarded]);

  const value = useMemo<WorkInboxLayoutContextValue>(
    () => ({
      viewMode,
      metrics,
      focusQueueSize,
      setViewMode: setViewModeGuarded,
      enterFocus,
      showInboxList,
      publishMetrics,
      suppressGlobalDetailPanel,
      useThreeRegionFocusLayout,
    }),
    [
      viewMode,
      metrics,
      focusQueueSize,
      setViewModeGuarded,
      enterFocus,
      showInboxList,
      publishMetrics,
      suppressGlobalDetailPanel,
      useThreeRegionFocusLayout,
    ],
  );

  return <WorkInboxLayoutContext.Provider value={value}>{children}</WorkInboxLayoutContext.Provider>;
}

export function useWorkInboxLayout(): WorkInboxLayoutContextValue {
  const ctx = useContext(WorkInboxLayoutContext);
  if (!ctx) {
    return {
      viewMode: 'inbox',
      metrics: DEFAULT_METRICS,
      focusQueueSize: 0,
      setViewMode: () => undefined,
      enterFocus: () => undefined,
      showInboxList: () => undefined,
      publishMetrics: () => undefined,
      suppressGlobalDetailPanel: false,
      useThreeRegionFocusLayout: false,
    };
  }
  return ctx;
}
