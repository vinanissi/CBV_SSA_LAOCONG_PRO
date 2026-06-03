import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ChecklistSyncState } from '@/modules/task/inbox/checklist/checklistMultiUserSyncTypes';

export interface ChecklistSyncFooterPayload {
  taskId: string;
  syncState: ChecklistSyncState;
  bridgeOn: boolean;
  busy?: boolean;
  message?: string | null;
  onRefresh?: () => void;
}

interface ChecklistSyncFooterContextValue {
  payload: ChecklistSyncFooterPayload | null;
  setPayload: (payload: ChecklistSyncFooterPayload | null) => void;
}

const ChecklistSyncFooterContext = createContext<ChecklistSyncFooterContextValue | null>(null);

export function ChecklistSyncFooterProvider({ children }: { children: ReactNode }) {
  const [payload, setPayloadState] = useState<ChecklistSyncFooterPayload | null>(null);

  const setPayload = useCallback((next: ChecklistSyncFooterPayload | null) => {
    setPayloadState(next);
  }, []);

  const value = useMemo(() => ({ payload, setPayload }), [payload, setPayload]);

  return (
    <ChecklistSyncFooterContext.Provider value={value}>{children}</ChecklistSyncFooterContext.Provider>
  );
}

export function useChecklistSyncFooterPublisher() {
  const ctx = useContext(ChecklistSyncFooterContext);
  return ctx?.setPayload ?? (() => {});
}

export function useChecklistSyncFooterState() {
  const ctx = useContext(ChecklistSyncFooterContext);
  return ctx?.payload ?? null;
}
