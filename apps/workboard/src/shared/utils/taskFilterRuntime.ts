/**
 * PHASE_TASK_GS_10D — operational filter / queue derivation contract.
 */

import type { TaskFilter, TaskItem, TaskWorkspaceSnapshot, UserContext, RuntimeUser } from '@/api/contracts';
import { getAttentionLevel } from '@/shared/utils/taskAttention';
import { filterTasksByCoordinationQueue } from '@/shared/utils/coordinationQueues';
import { filterTasksByRhythm } from '@/shared/utils/taskRhythm';
import {
  cognitionGroupsToTaskGroups,
  groupCognitionTasks,
} from '@/shared/utils/taskCognitionGrouping';
import { flattenTaskGroups, groupOperationalTasks, type TaskGroup } from '@/shared/utils/taskGrouping';
import {
  quickFocusToLegacy,
  type QuickFocusFilter,
} from '@/shared/utils/quickFocusFilters';
import { TASK_FILTER_TABS, normalizeTaskFilterKey, type TaskFilterKey } from '@/shared/constants/taskFilterKeys';
import type { GroupMode } from '@/shared/utils/workingContext';
import {
  normalizeUserLookupKey,
  resolveTaskOwnerId,
  resolveTaskReporterId,
} from '@/runtime/userDisplay';
import { getCurrentRuntimeUser } from '@/runtime/runtimeIdentity';

const FILTER_LABELS: Record<TaskFilter, string> = Object.fromEntries(
  TASK_FILTER_TABS.map((f) => [f.key, f.label]),
) as Record<TaskFilter, string>;

export type { TaskFilterKey };
export { TASK_FILTER_TABS };

/** Statuses requiring operator action (excludes WAITING_APPROVAL → approval tab). */
const PENDING_ACTION_STATUSES = new Set(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING']);

export interface TaskFilterOperator {
  userId?: string;
  userCode?: string;
  id?: string;
  displayName?: string;
}

export interface TaskFilterContext {
  snapshot: TaskWorkspaceSnapshot | null;
  filter: TaskFilter;
  groupMode: GroupMode;
  quickFocus: QuickFocusFilter;
  focusQueueMode: boolean;
  operator?: TaskFilterOperator | UserContext | RuntimeUser | null;
  pinnedTaskId?: string | null;
}

export interface TaskFilterCounts {
  visible: number;
  groups: number;
  sourceTotal: number;
  tabMatched: number;
}

export interface VisibleTaskRuntime {
  visibleTasks: TaskItem[];
  groups: TaskGroup[];
  flatTasks: TaskItem[];
  counts: TaskFilterCounts;
  activeFilter: TaskFilter;
  groupMode: GroupMode;
  summaryText: string;
  filterNotice: string | null;
  emptyTitle: string;
  emptyMessage: string;
  warnings: string[];
}

export function parseTaskFilter(raw: string | null | undefined): TaskFilter {
  return normalizeTaskFilterKey(raw);
}

export function getTaskFilterLabel(filter: TaskFilter): string {
  return FILTER_LABELS[filter] ?? filter;
}

function resolveOperator(ctx: TaskFilterContext): TaskFilterOperator | null {
  const op = ctx.operator ?? getCurrentRuntimeUser();
  if (!op) return null;
  if ('userId' in op && typeof op.userId === 'string') {
    return {
      userId: op.userId,
      userCode: op.userId,
      displayName: op.displayName,
    };
  }
  const runtime = op as RuntimeUser & TaskFilterOperator;
  const userId =
    ('userId' in runtime && runtime.userId) || runtime.id || runtime.userCode || undefined;
  return {
    userId,
    userCode: runtime.userCode ?? runtime.id ?? userId,
    id: runtime.id ?? userId,
    displayName: runtime.displayName,
  };
}

function operatorLookupKeys(operator: TaskFilterOperator | null): Set<string> {
  const keys = new Set<string>();
  if (!operator) return keys;
  for (const raw of [operator.userId, operator.userCode, operator.id, operator.displayName]) {
    const k = normalizeUserLookupKey(raw ?? '');
    if (k) keys.add(k);
    if (raw?.trim()) keys.add(raw.trim());
  }
  return keys;
}

/** Whether task belongs to current operator (owner or reporter). */
export function isTaskMineForOperator(task: TaskItem, operator: TaskFilterOperator | null): boolean {
  if (task.isMine === true) return true;
  if (!operator) return false;

  const keys = operatorLookupKeys(operator);
  if (keys.size === 0) return false;

  const ownerKey = normalizeUserLookupKey(resolveTaskOwnerId(task));
  const reporterKey = normalizeUserLookupKey(resolveTaskReporterId(task));

  if (ownerKey && keys.has(ownerKey)) return true;
  if (reporterKey && keys.has(reporterKey)) return true;

  if (task.owner && operator.displayName && task.owner.trim() === operator.displayName.trim()) {
    return true;
  }

  return false;
}

function isTaskOverdue(task: TaskItem): boolean {
  if (task.isOverdue || task.urgency?.isOverdue) return true;
  if (task.status === 'DONE' || task.status === 'CANCELLED') return false;
  if (!task.dueDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.dueDate < today;
}

function isTaskPendingAction(task: TaskItem): boolean {
  if (task.status === 'DONE' || task.status === 'CANCELLED') return false;
  if (task.status === 'WAITING_APPROVAL') return false;
  return PENDING_ACTION_STATUSES.has(task.status ?? '');
}

function isTaskAwaitingApproval(task: TaskItem): boolean {
  return task.status === 'WAITING_APPROVAL';
}

export function applyTaskFilter(
  tasks: TaskItem[],
  filter: TaskFilter,
  operator: TaskFilterOperator | null,
): { tasks: TaskItem[]; warnings: string[] } {
  const warnings: string[] = [];
  const open = tasks.filter((t) => t.status !== 'DONE' && t.status !== 'CANCELLED');

  switch (filter) {
    case 'mine': {
      if (!operator?.userId && !operator?.userCode) {
        warnings.push('Không xác định được người dùng hiện tại — không thể lọc “Việc của tôi”.');
        return { tasks: [], warnings };
      }
      const mine = open.filter((t) => isTaskMineForOperator(t, operator));
      if (mine.length === 0 && open.length > 0) {
        warnings.push('Không có việc gán cho bạn trong snapshot hiện tại.');
      }
      return { tasks: mine, warnings };
    }
    case 'pending':
      return { tasks: open.filter(isTaskPendingAction), warnings };
    case 'overdue':
      return { tasks: open.filter(isTaskOverdue), warnings };
    case 'approval':
      return { tasks: open.filter(isTaskAwaitingApproval), warnings };
    default:
      return { tasks: open, warnings };
  }
}

export function deriveTaskCounts(
  sourceTasks: TaskItem[],
  visibleTasks: TaskItem[],
  groups: TaskGroup[],
  tabMatched: number,
): TaskFilterCounts {
  return {
    visible: visibleTasks.length,
    groups: groups.length,
    sourceTotal: sourceTasks.length,
    tabMatched,
  };
}

export function applyFocusQueueFilter(
  tasks: TaskItem[],
  focusMode: boolean,
  pinnedTaskId?: string | null,
): TaskItem[] {
  if (!focusMode) return tasks;
  return tasks.filter((task) => {
    if (pinnedTaskId && task.taskId === pinnedTaskId) return true;
    const level = getAttentionLevel(task);
    return level === 'ACTION_NOW' || level === 'HIGH_ATTENTION';
  });
}

export function groupTasksForMode(tasks: TaskItem[], groupMode: GroupMode, focusMode: boolean): TaskGroup[] {
  if (groupMode === 'cognition') {
    const cognition = groupCognitionTasks(tasks);
    const groups = cognitionGroupsToTaskGroups(cognition);
    if (!focusMode) return groups;
    return groups.map((g) => ({
      ...g,
      defaultCollapsed:
        g.defaultCollapsed ||
        g.key === 'awareness' ||
        g.key === 'monitor' ||
        g.label.includes('Awareness'),
    }));
  }
  const groups = groupOperationalTasks(tasks);
  if (!focusMode) return groups;
  return groups.map((g) => ({
    ...g,
    defaultCollapsed:
      g.defaultCollapsed ||
      g.key === 'upcoming' ||
      g.key === 'other' ||
      g.key === 'stale',
  }));
}

function buildSummaryText(counts: TaskFilterCounts, quickFocus: QuickFocusFilter): string {
  if (counts.visible === 0) {
    return `0 việc · Không có việc phù hợp bộ lọc`;
  }
  const groupPart = counts.groups === 1 ? '1 nhóm' : `${counts.groups} nhóm`;
  let text = `${counts.visible} việc · ${groupPart}`;
  if (quickFocus !== 'all') text += ` · focus: ${quickFocus}`;
  return text;
}

function emptyCopyForFilter(filter: TaskFilter): { title: string; message: string } {
  switch (filter) {
    case 'mine':
      return {
        title: 'Chưa có việc của bạn',
        message: 'Không có việc gán cho tài khoản hiện tại — thử bộ lọc khác hoặc làm mới.',
      };
    case 'pending':
      return {
        title: 'Không có việc chờ xử lý',
        message: 'Không có việc NEW / ASSIGNED / IN_PROGRESS / WAITING trong bộ lọc này.',
      };
    case 'overdue':
      return {
        title: 'Chưa có việc quá hạn',
        message: 'Tốt — không có việc trễ hạn trong snapshot hiện tại.',
      };
    case 'approval':
      return {
        title: 'Không có việc chờ duyệt',
        message: 'Không có việc WAITING_APPROVAL trong bộ lọc này.',
      };
    default:
      return {
        title: 'Chưa có việc trong bộ lọc này',
        message: 'Thử chọn bộ lọc khác hoặc tắt quick focus.',
      };
  }
}

/** Full queue derivation — single source of truth for TasksPage. */
export function deriveVisibleTaskRuntime(ctx: TaskFilterContext): VisibleTaskRuntime {
  const warnings: string[] = [];
  const sourceTasks = ctx.snapshot?.tasks ?? [];
  const operator = resolveOperator(ctx);

  const tabResult = applyTaskFilter(sourceTasks, ctx.filter, operator);
  warnings.push(...tabResult.warnings);

  const { rhythmMode, coordinationMode } = quickFocusToLegacy(ctx.quickFocus);
  const rhythmTasks = filterTasksByRhythm(tabResult.tasks, rhythmMode);
  const coordinationTasks = filterTasksByCoordinationQueue(
    rhythmTasks,
    coordinationMode,
    tabResult.tasks,
  );
  const focusTasks = applyFocusQueueFilter(
    coordinationTasks,
    ctx.focusQueueMode,
    ctx.pinnedTaskId,
  );

  const groups = groupTasksForMode(focusTasks, ctx.groupMode, ctx.focusQueueMode);
  const flatTasks = flattenTaskGroups(groups);
  const counts = deriveTaskCounts(sourceTasks, flatTasks, groups, tabResult.tasks.length);

  const empty = emptyCopyForFilter(ctx.filter);
  const filterLabel = getTaskFilterLabel(ctx.filter);
  const filterNotice =
    counts.visible > 0
      ? `Đã áp dụng bộ lọc: ${filterLabel}`
      : `Đã áp dụng bộ lọc: ${filterLabel} — không có việc phù hợp`;

  return {
    visibleTasks: flatTasks,
    groups,
    flatTasks,
    counts,
    activeFilter: ctx.filter,
    groupMode: ctx.groupMode,
    summaryText: buildSummaryText(counts, ctx.quickFocus),
    filterNotice,
    emptyTitle: empty.title,
    emptyMessage: empty.message,
    warnings,
  };
}
