import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { TaskWorkspaceCounts, TaskWorkspaceRuntime } from '@/api/contracts';

export interface TaskRuntimeTelemetryPayload {
  runtime: TaskWorkspaceRuntime | null;
  counts?: TaskWorkspaceCounts | null;
  connected: boolean;
  refreshing?: boolean;
  degraded?: boolean;
  warnings?: string[];
  error?: string | null;
  staleMessage?: string | null;
}

interface TaskRuntimeTelemetryContextValue {
  telemetry: TaskRuntimeTelemetryPayload | null;
  setTelemetry: (payload: TaskRuntimeTelemetryPayload | null) => void;
}

const TaskRuntimeTelemetryContext = createContext<TaskRuntimeTelemetryContextValue | null>(null);

export function TaskRuntimeTelemetryProvider({ children }: { children: ReactNode }) {
  const [telemetry, setTelemetryState] = useState<TaskRuntimeTelemetryPayload | null>(null);

  const setTelemetry = useCallback((payload: TaskRuntimeTelemetryPayload | null) => {
    setTelemetryState(payload);
  }, []);

  const value = useMemo(() => ({ telemetry, setTelemetry }), [telemetry, setTelemetry]);

  return (
    <TaskRuntimeTelemetryContext.Provider value={value}>
      {children}
    </TaskRuntimeTelemetryContext.Provider>
  );
}

export function useTaskRuntimeTelemetryPublisher() {
  const ctx = useContext(TaskRuntimeTelemetryContext);
  if (!ctx) {
    throw new Error('useTaskRuntimeTelemetryPublisher requires TaskRuntimeTelemetryProvider');
  }
  return ctx.setTelemetry;
}

export function useTaskRuntimeTelemetryState() {
  const ctx = useContext(TaskRuntimeTelemetryContext);
  return ctx?.telemetry ?? null;
}
