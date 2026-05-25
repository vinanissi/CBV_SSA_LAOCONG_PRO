import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/api/client';
import type { TaskWriteCapability } from '@/api/contracts';

interface TaskWriteContextValue {
  capability: TaskWriteCapability | null;
  loading: boolean;
  refreshCapability: () => Promise<void>;
  createOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
  onTaskChanged: () => void;
  registerTaskChanged: (fn: () => void) => void;
}

const TaskWriteContext = createContext<TaskWriteContextValue | null>(null);

export function TaskWriteProvider({ children }: { children: ReactNode }) {
  const [capability, setCapability] = useState<TaskWriteCapability | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [changedHandler, setChangedHandler] = useState<(() => void) | null>(null);

  const refreshCapability = useCallback(async () => {
    setLoading(true);
    const res = await api.getTaskWriteCapability();
    if (res.ok && res.data) setCapability(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshCapability();
  }, [refreshCapability]);

  const value: TaskWriteContextValue = {
    capability,
    loading,
    refreshCapability,
    createOpen,
    openCreate: () => setCreateOpen(true),
    closeCreate: () => setCreateOpen(false),
    onTaskChanged: () => changedHandler?.(),
    registerTaskChanged: (fn) => setChangedHandler(() => fn),
  };

  return <TaskWriteContext.Provider value={value}>{children}</TaskWriteContext.Provider>;
}

export function useTaskWrite() {
  const ctx = useContext(TaskWriteContext);
  if (!ctx) throw new Error('useTaskWrite must be used within TaskWriteProvider');
  return ctx;
}
