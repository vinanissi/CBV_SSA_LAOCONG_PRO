import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { WorkInboxRuntimeContext, WorkInboxRuntimeContextInput } from './workInboxRuntimeContextTypes';
import { buildWorkInboxOpPermissions } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalPermissions';
import { buildFocusProgressRuntime } from '@/modules/task/inbox/operationalRuntime/focusProgressRuntime';

const WorkInboxRuntimeContextReact = createContext<WorkInboxRuntimeContext | null>(null);

export function WorkInboxRuntimeContextProvider({
  value,
  children,
}: {
  value: WorkInboxRuntimeContextInput;
  children: ReactNode;
}) {
  const ctx = useMemo((): WorkInboxRuntimeContext => {
    const currentFocusItem =
      value.focusItems.length > 0
        ? value.focusItems[Math.min(Math.max(0, value.focusIndex), value.focusItems.length - 1)] ?? null
        : null;
    const currentTask = currentFocusItem
      ? value.tasks.find((t) => t.taskId === currentFocusItem.id) ?? null
      : null;
    const ops = value.permissions?.ops ?? buildWorkInboxOpPermissions(value.operator.role);
    const perms = value.permissions ?? {};
    return {
      ...value,
      currentFocusItem,
      currentTask,
      operationalBundle: value.operationalBundle ?? null,
      operationalLoading: value.operationalLoading ?? false,
      focusProgress: buildFocusProgressRuntime(value.focusIndex, value.focusItems.length),
      permissions: {
        canWrite: perms.canWrite ?? (ops.START || ops.PAUSE || ops.COMPLETE),
        canAssign: perms.canAssign ?? ops.HANDOFF,
        ops,
      },
      refreshOperational: value.refreshOperational,
    };
  }, [value]);

  return (
    <WorkInboxRuntimeContextReact.Provider value={ctx}>{children}</WorkInboxRuntimeContextReact.Provider>
  );
}

export function useWorkInboxRuntimeContext(): WorkInboxRuntimeContext {
  const ctx = useContext(WorkInboxRuntimeContextReact);
  if (!ctx) {
    throw new Error('useWorkInboxRuntimeContext: missing WorkInboxRuntimeContextProvider');
  }
  return ctx;
}

export function useWorkInboxRuntimeContextOptional(): WorkInboxRuntimeContext | null {
  return useContext(WorkInboxRuntimeContextReact);
}
