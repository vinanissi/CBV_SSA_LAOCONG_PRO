/**
 * PHASE_TASK_GS_10D — filter runtime debug (env-gated).
 */

import type { TaskFilter } from '@/api/contracts';
import type { GroupMode } from '@/shared/utils/workingContext';
import type { QuickFocusFilter } from '@/shared/utils/quickFocusFilters';

export interface TaskFilterDebugPayload {
  event: 'task_filter_changed';
  filter: TaskFilter;
  groupMode: GroupMode;
  focusMode: boolean;
  quickFocus: QuickFocusFilter;
  visibleCount: number;
  groupCount: number;
  selectedTaskId?: string | null;
  durationMs?: number;
  warnings?: string[];
}

export interface TaskFilterClickDebugPayload {
  nextFilter?: TaskFilter;
  activeFilterBefore?: TaskFilter;
  activeFilterAfter?: TaskFilter;
  groupMode?: GroupMode;
  quickFocus?: QuickFocusFilter;
  focusQueueMode?: boolean;
  source?: string;
}

const ENABLED = import.meta.env.VITE_CBV_FILTER_DEBUG === 'true';

export function isFilterDebugEnabled(): boolean {
  return ENABLED;
}

export function logTaskFilterChange(payload: TaskFilterDebugPayload): void {
  if (!ENABLED) return;
  // eslint-disable-next-line no-console
  console.debug('[CBV filter]', payload);
}

export function logFilterClick(payload: TaskFilterClickDebugPayload): void {
  if (!ENABLED) return;
  // eslint-disable-next-line no-console
  console.debug('[CBV filter click]', payload);
}
