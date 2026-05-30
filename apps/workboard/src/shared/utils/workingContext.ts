import type { TaskFilter } from '@/api/contracts';
import type { QuickFocusFilter } from './quickFocusFilters';

const KEY = 'cbv_task_working_context';

export type GroupMode = 'cognition' | 'status';
export type RhythmMode = 'all' | 'call' | 'follow_up' | 'approval' | 'quick' | 'batch' | 'waiting';
export type CoordinationQueueMode =
  | 'all'
  | 'wait_response'
  | 'wait_approval'
  | 'wait_customer'
  | 'wait_document'
  | 'follow_up'
  | 'escalation'
  | 'overload';

export interface TaskWorkingContext {
  selectedTaskId?: string;
  filter?: TaskFilter;
  groupMode?: GroupMode;
  /** @deprecated use quickFocus — kept for session restore compat */
  rhythmMode?: RhythmMode;
  /** @deprecated use quickFocus — kept for session restore compat */
  coordinationMode?: CoordinationQueueMode;
  quickFocus?: QuickFocusFilter;
  /** GS_09J — long-queue endurance: collapse passive metadata */
  focusQueueMode?: boolean;
  scrollY?: number;
  panelOpen?: boolean;
  savedAt: string;
}

export function saveTaskWorkingContext(partial: Omit<TaskWorkingContext, 'savedAt'>): void {
  try {
    const prev = loadTaskWorkingContext();
    const next: TaskWorkingContext = {
      ...prev,
      ...partial,
      savedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function loadTaskWorkingContext(): TaskWorkingContext | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TaskWorkingContext;
  } catch {
    return null;
  }
}

export function clearTaskWorkingContext(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
