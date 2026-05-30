import type { TaskDetail, TaskItem, UserContext } from '@/api/contracts';
import type { RuntimeUser } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import type { TaskOperationalBundle } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import type { WorkInboxOperationalOp } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalPermissions';
import type { FocusProgressRuntime } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';

/** CBV-RCLA v1.1 — Work Inbox V3 runtime context (single registry source). */
export interface WorkInboxRuntimeContext {
  operator: UserContext;
  runtimeUser: RuntimeUser;
  tasks: TaskItem[];
  focusItems: WorkInboxFocusItem[];
  focusIndex: number;
  currentFocusItem: WorkInboxFocusItem | null;
  currentTask: TaskItem | null;
  taskDetail: TaskDetail | null;
  detailLoading: boolean;
  operationalBundle: TaskOperationalBundle | null;
  operationalLoading: boolean;
  focusProgress: FocusProgressRuntime;
  permissions: {
    canWrite: boolean;
    canAssign: boolean;
    ops: Record<WorkInboxOperationalOp, boolean>;
  };
  refreshOperational?: () => void;
}

export type WorkInboxRuntimeContextInput = Omit<
  WorkInboxRuntimeContext,
  'currentFocusItem' | 'currentTask' | 'permissions' | 'focusProgress' | 'operationalBundle' | 'operationalLoading'
> & {
  permissions?: Partial<WorkInboxRuntimeContext['permissions']>;
  operationalBundle?: TaskOperationalBundle | null;
  operationalLoading?: boolean;
  refreshOperational?: () => void;
};
