import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getCachedTaskWriteCapability } from '@/modules/task/inbox/network/workInboxStaticRuntimeCache';
import type { TaskWriteCapability } from '@/api/contracts';

export type TaskChangedMode = 'snapshot' | 'patch';

interface TaskWriteContextValue {
  capability: TaskWriteCapability | null;
  loading: boolean;
  refreshCapability: () => Promise<void>;
  createOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
  openWorkInboxCreate: () => void;
  registerOpenWorkInboxCreate: (fn: () => void) => void;
  onTaskChanged: (mode?: TaskChangedMode) => void;
  registerTaskChanged: (fn: (mode?: TaskChangedMode) => void) => void;
}

const TaskWriteContext = createContext<TaskWriteContextValue | null>(null);

export function TaskWriteProvider({ children }: { children: ReactNode }) {
  const [capability, setCapability] = useState<TaskWriteCapability | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const changedHandlerRef = useRef<((mode?: TaskChangedMode) => void) | null>(null);
  const workInboxCreateRef = useRef<(() => void) | null>(null);

  const refreshCapability = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCachedTaskWriteCapability();
      if (res.ok && res.data) {
        setCapability((prev) => {
          if (
            prev &&
            prev.canCreate === res.data!.canCreate &&
            prev.canUpdate === res.data!.canUpdate &&
            prev.writeMode === res.data!.writeMode
          ) {
            return prev;
          }
          return res.data!;
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCapability();
  }, [refreshCapability]);

  const registerTaskChanged = useCallback((fn: (mode?: TaskChangedMode) => void) => {
    changedHandlerRef.current = fn;
  }, []);

  const onTaskChanged = useCallback((mode?: TaskChangedMode) => {
    changedHandlerRef.current?.(mode);
  }, []);

  const registerOpenWorkInboxCreate = useCallback((fn: () => void) => {
    workInboxCreateRef.current = fn;
  }, []);

  const openCreate = useCallback(() => setCreateOpen(true), []);
  const closeCreate = useCallback(() => setCreateOpen(false), []);

  const openWorkInboxCreate = useCallback(() => {
    if (workInboxCreateRef.current) {
      workInboxCreateRef.current();
      return;
    }
    openCreate();
  }, [openCreate]);

  const value = useMemo<TaskWriteContextValue>(
    () => ({
      capability,
      loading,
      refreshCapability,
      createOpen,
      openCreate,
      closeCreate,
      openWorkInboxCreate,
      registerOpenWorkInboxCreate,
      onTaskChanged,
      registerTaskChanged,
    }),
    [capability, loading, refreshCapability, createOpen, openCreate, closeCreate, openWorkInboxCreate, registerOpenWorkInboxCreate, onTaskChanged, registerTaskChanged],
  );

  return <TaskWriteContext.Provider value={value}>{children}</TaskWriteContext.Provider>;
}

export function useTaskWrite() {
  const ctx = useContext(TaskWriteContext);
  if (!ctx) throw new Error('useTaskWrite must be used within TaskWriteProvider');
  return ctx;
}
