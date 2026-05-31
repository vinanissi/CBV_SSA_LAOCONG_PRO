import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '@/api/client';
import type { TaskDetail, TaskFilter, TaskItem, TaskWorkspaceSnapshot, UserContext } from '@/api/contracts';
import { TaskGroupedList, type InlineExecState, type InlineExecHandlers } from '@/components/ui/TaskGroupSection';
import { OperationalContextPanel } from '@/components/ui/OperationalContextPanel';
import { TaskControlSurface } from '@/components/ui/TaskControlSurface';
import { OperationalAlertHeader } from '@/components/ui/OperationalAlertHeader';
import { TaskListSkeleton } from '@/components/states/TaskListSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import {
  STABLE_DETAIL_PANEL_INVOKER,
  registerDetailPanelRenderer,
  useDetailPanel,
} from '@/components/layout/DetailPanel';
import { useTaskWrite } from '@/modules/task/TaskWriteContext';
import { useTaskRuntimeTelemetryPublisher } from '@/runtime/TaskRuntimeTelemetryContext';
import {
  isRenderPerfEnabled,
  markRenderEnd,
  markRenderStart,
  usePerfMark,
  useRenderCount,
} from '@/shared/utils/renderPerf';
import {
  deriveVisibleTaskRuntime,
  getTaskFilterLabel,
  applyTaskFilter,
} from '@/shared/utils/taskFilterRuntime';
import { isFilterDebugEnabled, logTaskFilterChange, logFilterClick } from '@/shared/utils/taskFilterDebug';
import { normalizeTaskFilterKey } from '@/shared/constants/taskFilterKeys';
import { hydrateUserDirectoryFromSnapshot, hasUserDirectoryLoaded, saveUsersDirectory, enrichTasksUserFieldsFromDirectory } from '@/runtime/userDisplay';
import {
  getIdentityLandingDefaults,
  hydrateRuntimeIdentityFromSnapshot,
  resolveRuntimeUser,
  getCurrentRuntimeUser,
} from '@/runtime/runtimeIdentity';
import { getTaskNextAction } from '@/shared/utils/taskNextAction';
import { pushRecentTask, markTaskInterrupted } from '@/shared/utils/recentContext';
import { recordTaskSwitch, recordQueueSize, recordResumeFlow, recordInterruptedTask, recordSignalSaturation } from '@/shared/utils/taskOperatorObservation';
import {
  loadTaskWorkingContext,
  saveTaskWorkingContext,
  type GroupMode,
} from '@/shared/utils/workingContext';
import {
  quickFocusFromLegacy,
  quickFocusToLegacy,
  type QuickFocusFilter,
} from '@/shared/utils/quickFocusFilters';
import { computeTeamPressure, getOverloadedOwnerIds } from '@/shared/utils/teamPressure';
import { saveCoordinationMemory } from '@/shared/utils/coordinationMemory';
import { buildSignalCollapseContext, markTaskSignalViewed } from '@/shared/utils/signalCollapse';
import { buildResumeFlowSnapshot } from '@/shared/utils/flowResume';
import { loadFocusQueueMode, saveFocusQueueMode } from '@/shared/utils/focusQueueMode';
import { useInlineExecution } from '@/modules/task/useInlineExecution';
import { useFocusTaskActions } from '@/modules/task/useFocusTaskActions';
import type { QuickAction } from '@/shared/utils/quickActionRuntime';
import type { MicroUpdateOption } from '@/shared/utils/microUpdateFlow';
import type { HandoffTarget } from '@/shared/utils/handoffQuickActions';
import { recordDetailOpen } from '@/shared/utils/taskOperatorObservation';
import { usePerTaskFeedback } from '@/shared/hooks/usePerTaskFeedback';
import { FEEDBACK_COPY } from '@/shared/utils/operatorFeedbackCopy';
import { errorFeedback, successFeedback } from '@/shared/utils/runtimeFeedback';
import { WorkInboxGroupsPanel } from '@/modules/task/inbox/WorkInboxGroupsPanel';
import { LegacyTaskRuntimePanel } from '@/modules/task/inbox/LegacyTaskRuntimePanel';
import { collectRuntimeTasksFromSnapshot } from '@/modules/task/inbox/inboxGroups';
import {
  getInitialLegacyRuntimeVisible,
  shouldRenderLegacyTaskRuntime,
  shouldShowWorkInboxV3Panel,
} from '@/modules/task/inbox/workInboxRuntimeTransition';
import {
  isWorkInboxFocusRuntimeEnabled,
} from '@/modules/task/inbox/workInboxGroupsFeature';
import { WorkInboxCreateTaskDialog } from '@/modules/task/inbox/create/WorkInboxCreateTaskDialog';
import { canRoleCreateWorkInboxTask } from '@/modules/task/inbox/create/workInboxCreateTaskTypes';
import {
  insertCreatedTaskIntoSnapshot,
  mapCreatedTaskToTaskItem,
} from '@/modules/task/inbox/create/workInboxCreateTaskLocalInsert';
import { INBOX_ROUTE, isWorkInboxRoute, TASKS_LEGACY_ROUTE } from '@/shared/routes/inboxRoutes';
import { resolveWorkInboxOpenTarget } from '@/modules/task/inbox/workInboxOpenAction';
import type { TaskCardModel, WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { NETWORK_CACHE_TTL_MS } from '@/modules/task/inbox/network/workInboxNetworkCacheConfig';
import { loadTaskDetailNetwork } from '@/modules/task/inbox/network/workInboxTaskDetailLoader';
import { invalidateWorkspaceSnapshotCache } from '@/modules/task/inbox/network/workInboxNetworkInvalidation';
import { loadWorkspaceSnapshotNetwork } from '@/modules/task/inbox/network/workInboxWorkspaceSnapshotLoader';
import { invalidateWorkInboxCachesForAction } from '@/modules/task/inbox/network/workInboxNetworkInvalidation';
import { showFocusRuntimeFeedback } from '@/modules/task/inbox/focusRuntime/focusRuntimeFeedback';
import { evaluateTaskMainRuntimeHealth } from '@/shared/utils/taskMainRuntimeHealth';

const DETAIL_CACHE_TTL_MS = NETWORK_CACHE_TTL_MS.TASK_DETAIL;
const SNAPSHOT_LIMIT = 100;

interface DetailCacheEntry {
  detail: TaskDetail;
  fetchedAt: number;
}

function patchTaskInSnapshot(snapshot: TaskWorkspaceSnapshot, updated: TaskItem): TaskWorkspaceSnapshot {
  const patch = (list: TaskItem[]) =>
    list.map((t) => (t.taskId === updated.taskId ? { ...t, ...updated } : t));
  return {
    ...snapshot,
    tasks: patch(snapshot.tasks),
    blockedTasks: patch(snapshot.blockedTasks),
    dueTasks: patch(snapshot.dueTasks),
    overdueTasks: patch(snapshot.overdueTasks),
  };
}

interface TasksPageProps {
  user?: UserContext;
}

export function TasksPage({ user }: TasksPageProps) {
  useRenderCount('TasksPage');
  const firstRenderRef = useRef(true);
  if (firstRenderRef.current && isRenderPerfEnabled()) {
    markRenderStart('tasks-page-first-render');
    firstRenderRef.current = false;
    requestAnimationFrame(() => markRenderEnd('tasks-page-first-render'));
  }

  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const parseGroupMode = (raw: string | null): GroupMode => (raw === 'status' ? 'status' : 'cognition');

  const [activeFilter, setActiveFilter] = useState<TaskFilter>(() =>
    normalizeTaskFilterKey(searchParams.get('filter')),
  );
  const [activeGroupMode, setActiveGroupMode] = useState<GroupMode>(() =>
    parseGroupMode(searchParams.get('group')),
  );

  useEffect(() => {
    const urlFilter = normalizeTaskFilterKey(searchParams.get('filter'));
    const urlGroup = parseGroupMode(searchParams.get('group'));
    setActiveFilter((prev) => (prev === urlFilter ? prev : urlFilter));
    setActiveGroupMode((prev) => (prev === urlGroup ? prev : urlGroup));
  }, [searchParams]);
  const [quickFocus, setQuickFocus] = useState<QuickFocusFilter>(() => {
    const ctx = loadTaskWorkingContext();
    if (ctx?.quickFocus) return ctx.quickFocus;
    if (ctx) return quickFocusFromLegacy(ctx.rhythmMode ?? 'all', ctx.coordinationMode ?? 'all');
    const landing = getIdentityLandingDefaults(resolveRuntimeUser(user?.userId));
    if (landing.quickFocus) return landing.quickFocus as QuickFocusFilter;
    return 'all';
  });
  const [focusQueueMode, setFocusQueueMode] = useState(() => {
    const ctx = loadTaskWorkingContext();
    return ctx?.focusQueueMode ?? loadFocusQueueMode();
  });
  const restoredRef = useRef(false);
  const [snapshot, setSnapshot] = useState<TaskWorkspaceSnapshot | null>(null);
  const [detail, setDetailState] = useState<TaskDetail | null>(null);
  const [detailFetching, setDetailFetching] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inlineExec, setInlineExec] = useState<InlineExecState | null>(null);
  const [execMemoryTick, setExecMemoryTick] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterFeedback, setFilterFeedback] = useState<string | null>(null);
  const filterFeedbackTimerRef = useRef<number | null>(null);
  const selectedTaskIdRef = useRef<string | null>(null);
  const detailCacheRef = useRef<Map<string, DetailCacheEntry>>(new Map());
  const hasSnapshotRef = useRef(false);
  const { setDetail, clearDetail, bumpDetailContent } = useDetailPanel();
  const panelDetailRef = useRef<TaskDetail | null>(null);
  const panelLoadingRef = useRef(false);
  const panelErrorRef = useRef<string | undefined>(undefined);
  const degradedRef = useRef(false);
  const { registerTaskChanged, openWorkInboxCreate, registerOpenWorkInboxCreate, capability } = useTaskWrite();
  const publishRuntimeTelemetry = useTaskRuntimeTelemetryPublisher();
  const taskFeedback = usePerTaskFeedback();
  const taskFeedbackRef = useRef(taskFeedback);
  taskFeedbackRef.current = taskFeedback;

  const handleAcceptRef = useRef<(task: TaskItem | TaskDetail) => Promise<void>>(async () => {});
  const handleCompleteRef = useRef<(task: TaskItem | TaskDetail) => Promise<void>>(async () => {});
  const inlineHandlersRef = useRef<InlineExecHandlers | null>(null);
  const inlineExecRef = useRef<InlineExecState | null>(null);
  const [workInboxCreateOpen, setWorkInboxCreateOpen] = useState(false);
  const loadWorkspaceRef = useRef<(soft?: boolean, force?: boolean) => void>(() => {});

  const focusedTaskId = taskId ?? detail?.taskId ?? selectedTaskIdRef.current;

  const queueRuntime = useMemo(() => {
    const started = performance.now();
    const result = deriveVisibleTaskRuntime({
      snapshot,
      filter: activeFilter,
      groupMode: activeGroupMode,
      quickFocus,
      focusQueueMode,
      operator: user ? { userId: user.userId, displayName: user.displayName } : getCurrentRuntimeUser(),
      pinnedTaskId: focusedTaskId,
    });
    if (isFilterDebugEnabled()) {
      logTaskFilterChange({
        event: 'task_filter_changed',
        filter: activeFilter,
        groupMode: activeGroupMode,
        focusMode: focusQueueMode,
        quickFocus,
        visibleCount: result.counts.visible,
        groupCount: result.counts.groups,
        selectedTaskId: focusedTaskId,
        durationMs: performance.now() - started,
        warnings: result.warnings,
      });
    }
    return result;
  }, [snapshot, activeFilter, activeGroupMode, quickFocus, focusQueueMode, user, focusedTaskId]);

  const {
    groups: taskGroups,
    flatTasks,
    summaryText,
    filterNotice,
    emptyTitle,
    emptyMessage,
    warnings: filterWarnings,
  } = queueRuntime;

  const onWorkInboxRoute = isWorkInboxRoute(location.pathname);
  const showWorkInboxV3Panel = shouldShowWorkInboxV3Panel(location.pathname);
  const renderLegacyRuntime = shouldRenderLegacyTaskRuntime(location.pathname);
  const suppressDetailPanel =
    onWorkInboxRoute && showWorkInboxV3Panel && isWorkInboxFocusRuntimeEnabled();

  const [showLegacyRuntime, setShowLegacyRuntime] = useState(() =>
    getInitialLegacyRuntimeVisible(location.pathname),
  );

  useEffect(() => {
    setShowLegacyRuntime(getInitialLegacyRuntimeVisible(location.pathname));
  }, [location.pathname]);

  const inboxRuntimeTasks = useMemo(
    () => collectRuntimeTasksFromSnapshot(snapshot),
    [snapshot],
  );

  const teamPressure = useMemo(() => {
    if (!snapshot?.tasks) return [];
    const opCtx = user
      ? { userId: user.userId, displayName: user.displayName }
      : getCurrentRuntimeUser();
    const { tasks: tabTasks } = applyTaskFilter(snapshot.tasks, activeFilter, opCtx);
    return computeTeamPressure(tabTasks);
  }, [snapshot, activeFilter, user]);
  const overloadedOwnerIds = useMemo(
    () => getOverloadedOwnerIds(snapshot?.tasks ?? []),
    [snapshot],
  );
  const signalContext = useMemo(() => buildSignalCollapseContext(flatTasks), [flatTasks]);

  const runtime = snapshot?.runtime;
  const connected = api.isRealTaskRuntime() && Boolean(runtime?.connected ?? !error);

  const runtimeHealth = useMemo(
    () =>
      evaluateTaskMainRuntimeHealth({
        connected,
        error: error && snapshot ? error : null,
        hasSnapshot: Boolean(snapshot),
        warnings,
        runtime: snapshot?.runtime ?? null,
      }),
    [connected, error, snapshot, warnings],
  );

  const degraded = runtimeHealth.degraded;
  const staleMsg = runtimeHealth.staleMessage;
  degradedRef.current = degraded;

  registerDetailPanelRenderer(() => {
    const taskDetail = panelDetailRef.current;
    if (!taskDetail) return null;
    return (
      <OperationalContextPanel
        key={taskDetail.taskId}
        detail={taskDetail}
        loading={panelLoadingRef.current}
        error={panelErrorRef.current}
        degraded={degradedRef.current}
        onUpdated={(updated) => {
          setDetailState(updated);
          detailCacheRef.current.set(updated.taskId, { detail: updated, fetchedAt: Date.now() });
          setSnapshot((s) => (s ? patchTaskInSnapshot(s, updated) : s));
          panelDetailRef.current = updated;
          bumpDetailContent();
        }}
        onAccept={(t) => handleAcceptRef.current(t)}
        onComplete={(t) => handleCompleteRef.current(t)}
        inlineHandlers={inlineHandlersRef.current ?? undefined}
        inlineExec={
          inlineExecRef.current?.taskId === taskDetail.taskId ? inlineExecRef.current : null
        }
        onRefreshWorkspace={() => loadWorkspaceRef.current(true, true)}
        actionFeedback={taskFeedbackRef.current.getFeedback(taskDetail.taskId)}
      />
    );
  });

  const showPanel = useCallback(
    (taskDetail: TaskDetail, loading = false, detailError?: string | null) => {
      panelDetailRef.current = taskDetail;
      panelLoadingRef.current = loading;
      panelErrorRef.current = detailError ?? undefined;
      if (!suppressDetailPanel) {
        setDetail(taskDetail.title, STABLE_DETAIL_PANEL_INVOKER);
      }
    },
    [setDetail, suppressDetailPanel],
  );

  const applyDetailPatch = useCallback(
    (updated: TaskDetail) => {
      setDetailState(updated);
      detailCacheRef.current.set(updated.taskId, { detail: updated, fetchedAt: Date.now() });
      setSnapshot((s) => (s ? patchTaskInSnapshot(s, updated) : s));
      panelDetailRef.current = updated;
      panelLoadingRef.current = false;
      if (!suppressDetailPanel) {
        setDetail(updated.title, STABLE_DETAIL_PANEL_INVOKER);
        bumpDetailContent();
      }
    },
    [setDetail, bumpDetailContent, suppressDetailPanel],
  );

  const loadWorkspace = useCallback(
    (soft = false, force = false) => {
      const hasStale = hasSnapshotRef.current;
      if (!soft && !hasStale) setInitialLoading(true);
      else setRefreshing(true);

      const requestGroup = soft ? 'refresh' : 'initial_load';

      return loadWorkspaceSnapshotNetwork({
        params: { limit: SNAPSHOT_LIMIT },
        caller: 'TasksPage.loadWorkspace',
        reason: force ? 'MANUAL_FORCE' : soft ? 'SOFT_REFRESH' : 'INITIAL',
        requestGroup,
        force,
      })
        .then(({ envelope: res }) => {
          if (!res.ok) {
            const msg = res.errors[0] ?? 'Không tải được workspace task';
            if (hasStale) setWarnings((prev) => [...prev, msg]);
            else setError(msg);
            return;
          }
          setError(null);
          hasSnapshotRef.current = true;
          hydrateUserDirectoryFromSnapshot(res.data);
          hydrateRuntimeIdentityFromSnapshot(res.data);
          if (!hasUserDirectoryLoaded()) {
            api.getUsers().then((userRes) => {
              if (userRes.ok && userRes.data?.length) saveUsersDirectory(userRes.data);
            });
          }
          const enrichedSnapshot: TaskWorkspaceSnapshot = {
            ...res.data,
            tasks: enrichTasksUserFieldsFromDirectory(res.data.tasks ?? []),
            blockedTasks: enrichTasksUserFieldsFromDirectory(res.data.blockedTasks ?? []),
            dueTasks: enrichTasksUserFieldsFromDirectory(res.data.dueTasks ?? []),
            overdueTasks: enrichTasksUserFieldsFromDirectory(res.data.overdueTasks ?? []),
          };
          setSnapshot(enrichedSnapshot);
          if (isRenderPerfEnabled()) {
            markRenderStart('snapshot-to-queue', {
              source: enrichedSnapshot.runtime?.cacheSource ?? (enrichedSnapshot.runtime?.cacheHit ? 'cache' : 'live'),
              taskCount: enrichedSnapshot.tasks?.length ?? 0,
            });
          }
          const w = [...(res.warnings ?? []), ...(enrichedSnapshot.schemaWarnings ?? [])];
          if (enrichedSnapshot.runtime?.mode === 'mock_dev_only') w.push('Dev mock — cấu hình VITE_CBV_API_BASE_URL');
          if (
            enrichedSnapshot.runtime?.workerLatencyMs &&
            enrichedSnapshot.runtime.workerLatencyMs >= 2000 &&
            !enrichedSnapshot.runtime.cacheHit
          ) {
            w.push('TASK_MAIN phản hồi chậm — vẫn đồng bộ được');
          }
          setWarnings(w);
          const queueOnLoad = deriveVisibleTaskRuntime({
            snapshot: enrichedSnapshot,
            filter: activeFilter,
            groupMode: activeGroupMode,
            quickFocus,
            focusQueueMode,
            operator: user ? { userId: user.userId, displayName: user.displayName } : getCurrentRuntimeUser(),
            pinnedTaskId: selectedTaskIdRef.current || taskId,
          });
          recordQueueSize(queueOnLoad.flatTasks.length);
          recordSignalSaturation(
            enrichedSnapshot.tasks.filter((t) => t.urgency?.needsEscalation || t.isOverdue).length,
            enrichedSnapshot.tasks.length,
          );
          const keepId = selectedTaskIdRef.current || taskId;
          if (keepId) {
            const idx = queueOnLoad.flatTasks.findIndex((t) => t.taskId === keepId);
            if (idx >= 0) setSelectedIndex(idx);
          }
        })
        .catch(() => {
          if (hasStale) {
            setWarnings((prev) => [...prev, 'Không kết nối — đang hiển thị bản gần nhất']);
          } else {
            setError('Không kết nối được dữ liệu');
          }
        })
        .finally(() => {
          setInitialLoading(false);
          setRefreshing(false);
        });
    },
    [activeFilter, taskId, activeGroupMode, quickFocus, focusQueueMode, user],
  );

  const bumpExecMemory = useCallback(() => setExecMemoryTick((t) => t + 1), []);

  const { runQuickAction, runMicroUpdate, runHandoff } = useInlineExecution({
    onTaskUpdated: applyDetailPatch,
    onRefresh: () => {
      bumpExecMemory();
    },
  });

  const handleQuickAction = useCallback(
    async (task: TaskItem, action: QuickAction) => {
      const outcome = await runQuickAction(task, action);
      if (!outcome.ok) {
        taskFeedback.setFeedback(
          task.taskId,
          'inline',
          errorFeedback(outcome.error, { traceId: outcome.traceId, source: action.id }),
          false,
        );
        return;
      }
      if (outcome.localOnly && outcome.message) {
        taskFeedback.setFeedback(
          task.taskId,
          'inline',
          successFeedback(outcome.message, action.id),
        );
      }
      if (outcome.mode === 'micro') setInlineExec({ taskId: task.taskId, mode: 'micro', actionId: action.id });
      else if (outcome.mode === 'handoff') setInlineExec({ taskId: task.taskId, mode: 'handoff', actionId: 'HANDOFF' });
      else setInlineExec(null);
      if (outcome.ok && outcome.mode === 'done' && !outcome.localOnly) {
        taskFeedback.setFeedback(task.taskId, 'inline', successFeedback(FEEDBACK_COPY.success.generic, action.id));
      }
      bumpExecMemory();
    },
    [runQuickAction, bumpExecMemory, taskFeedback],
  );

  const handleMicroUpdate = useCallback(
    async (task: TaskItem, actionId: string, option: MicroUpdateOption) => {
      const outcome = await runMicroUpdate(task, actionId, option);
      if (!outcome.ok) {
        taskFeedback.setFeedback(
          task.taskId,
          'inline',
          errorFeedback(outcome.error, { traceId: outcome.traceId, source: String(actionId) }),
          false,
        );
        return;
      }
      setInlineExec(null);
      taskFeedback.setFeedback(task.taskId, 'inline', successFeedback(FEEDBACK_COPY.success.generic, String(actionId)));
      bumpExecMemory();
    },
    [runMicroUpdate, bumpExecMemory, taskFeedback],
  );

  const handleHandoff = useCallback(
    async (task: TaskItem, target: HandoffTarget) => {
      const outcome = await runHandoff(task, target);
      if (!outcome.ok) {
        taskFeedback.setFeedback(
          task.taskId,
          'inline',
          errorFeedback(outcome.error, { traceId: outcome.traceId, source: 'handoff' }),
          false,
        );
        return;
      }
      setInlineExec(null);
      taskFeedback.setFeedback(task.taskId, 'inline', successFeedback(FEEDBACK_COPY.success.generic, 'handoff'));
      bumpExecMemory();
    },
    [runHandoff, bumpExecMemory, taskFeedback],
  );

  const handleExecDismiss = useCallback((task: TaskItem) => {
    setInlineExec((prev) => (prev?.taskId === task.taskId ? null : prev));
  }, []);

  const inlineHandlers = useMemo<InlineExecHandlers>(
    () => ({
      onQuickAction: handleQuickAction,
      onMicroUpdate: handleMicroUpdate,
      onHandoff: handleHandoff,
      onExecDismiss: handleExecDismiss,
    }),
    [handleQuickAction, handleMicroUpdate, handleHandoff, handleExecDismiss],
  );

  inlineHandlersRef.current = inlineHandlers;
  inlineExecRef.current = inlineExec;
  loadWorkspaceRef.current = loadWorkspace;

  useEffect(() => {
    if (detail && !initialLoading) {
      showPanel(detail, false);
    }
  }, [detail?.taskId, initialLoading, showPanel]);

  useEffect(() => {
    if (!detail || initialLoading) return;
    panelDetailRef.current = detail;
    panelLoadingRef.current = false;
    bumpDetailContent();
  }, [
    detail?.taskId,
    detail?.updatedAt,
    detail?.status,
    inlineExec,
    taskFeedback.feedbackMap,
    initialLoading,
    bumpDetailContent,
  ]);

  const handleAccept = useCallback(
    async (task: TaskItem | TaskDetail) => {
      await taskFeedback.runWithFeedback(
        task.taskId,
        'accept',
        {
          pending: FEEDBACK_COPY.pending.accept,
          success: FEEDBACK_COPY.success.accept,
          error: FEEDBACK_COPY.error.accept,
        },
        async () => {
          const res = await api.updateTaskStatus(task.taskId, 'IN_PROGRESS', 'Nhận việc');
          if (res.ok && res.data?.task) {
            applyDetailPatch(res.data.task as TaskDetail);
            invalidateWorkInboxCachesForAction(task.taskId);
            return { ok: true };
          }
          return { ok: false, error: res.errors[0], traceId: res.traceId };
        },
        { retry: () => handleAccept(task) },
      );
    },
    [applyDetailPatch, taskFeedback],
  );

  const handleComplete = useCallback(
    async (task: TaskItem | TaskDetail) => {
      await taskFeedback.runWithFeedback(
        task.taskId,
        'complete',
        {
          pending: FEEDBACK_COPY.pending.complete,
          success: FEEDBACK_COPY.success.complete,
          error: FEEDBACK_COPY.error.complete,
        },
        async () => {
          const res = await api.completeTask(task.taskId, 'Hoàn tất từ quick action');
          if (res.ok && res.data?.task) {
            applyDetailPatch(res.data.task as TaskDetail);
            invalidateWorkInboxCachesForAction(task.taskId);
            return { ok: true };
          }
          return { ok: false, error: res.errors[0], traceId: res.traceId };
        },
        { retry: () => handleComplete(task) },
      );
    },
    [applyDetailPatch, taskFeedback],
  );

  handleAcceptRef.current = handleAccept;
  handleCompleteRef.current = handleComplete;

  const detailRequestGenRef = useRef(0);

  const loadTaskDetail = useCallback(
    (id: string, item?: TaskItem, force = false) => {
      selectedTaskIdRef.current = id;
      detailRequestGenRef.current += 1;
      const generation = detailRequestGenRef.current;

      const cached = detailCacheRef.current.get(id);
      const cacheFresh = cached && Date.now() - cached.fetchedAt < DETAIL_CACHE_TTL_MS;

      if (cacheFresh && !force) {
        setDetailState(cached.detail);
        setDetailError(null);
        setDetailFetching(false);
        showPanel(cached.detail, false);
        return;
      }

      setDetailFetching(true);
      setDetailError(null);

      if (item) {
        const stub = { ...item, description: '', timeline: [], files: [] } as TaskDetail;
        setDetailState(stub);
        showPanel(stub, true);
      } else if (cached) {
        setDetailState(cached.detail);
        showPanel(cached.detail, true);
      }

      void loadTaskDetailNetwork({
        taskId: id,
        caller: 'TasksPage.loadTaskDetail',
        reason: force ? 'MANUAL_RETRY' : item ? 'QUEUE_STUB' : 'ROUTE_OR_OPEN',
        requestGroup: item ? 'task_open' : 'task_open',
        force,
      }).then(({ envelope: res, stale }) => {
        if (stale || generation !== detailRequestGenRef.current) return;
        if (res.ok && res.data) {
          detailCacheRef.current.set(id, { detail: res.data, fetchedAt: Date.now() });
          setDetailState(res.data);
          setDetailError(null);
          showPanel(res.data, false);
        } else {
          const msg = res.errors[0] ?? 'Không tải được chi tiết việc';
          setDetailError(msg);
          if (item || cached) {
            const fallback = (cached?.detail ?? { ...item, description: '', timeline: [], files: [] }) as TaskDetail;
            setDetailState(fallback);
            showPanel(fallback, false, msg);
          }
        }
      }).finally(() => {
        if (generation === detailRequestGenRef.current) {
          setDetailFetching(false);
        }
      });
    },
    [showPanel],
  );

  const onRetryDetail = useCallback(() => {
    const id = selectedTaskIdRef.current ?? focusedTaskId;
    if (id) loadTaskDetail(id, undefined, true);
  }, [focusedTaskId, loadTaskDetail]);

  const canCreateTaskUi = canRoleCreateWorkInboxTask(user?.role) && Boolean(capability?.canCreate ?? true);

  const handleOpenCreate = useCallback(() => {
    openWorkInboxCreate();
  }, [openWorkInboxCreate]);

  useEffect(() => {
    registerOpenWorkInboxCreate(() => {
      setWorkInboxCreateOpen(true);
    });
  }, [registerOpenWorkInboxCreate]);

  useEffect(() => {
    if (searchParams.get('create') === '1' && canCreateTaskUi) {
      setWorkInboxCreateOpen(true);
      const params = new URLSearchParams(searchParams);
      params.delete('create');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams, canCreateTaskUi]);

  const handleWorkInboxTaskCreated = useCallback(
    (created: TaskDetail) => {
      if (!user) return;
      showFocusRuntimeFeedback('Đã tạo việc');
      setSnapshot((s) => insertCreatedTaskIntoSnapshot(s, created, user));
      applyDetailPatch(created);
      detailCacheRef.current.set(created.taskId, { detail: created, fetchedAt: Date.now() });
      selectedTaskIdRef.current = created.taskId;
      recordDetailOpen(created.taskId);
      const runtimeTask = mapCreatedTaskToTaskItem(created, user);
      const flatIdx = flatTasks.findIndex((t) => t.taskId === created.taskId);
      if (flatIdx < 0) setSelectedIndex(0);
      navigate(`${INBOX_ROUTE}/${encodeURIComponent(created.taskId)}${window.location.search}`);
      loadTaskDetail(created.taskId, runtimeTask, false);
    },
    [user, applyDetailPatch, flatTasks, navigate, loadTaskDetail],
  );

  const openWorkInboxTask = useCallback(
    (model: TaskCardModel) => {
      const target = resolveWorkInboxOpenTarget(model, { preferInbox: onWorkInboxRoute });
      if (!target) return;

      const runtimeTask =
        inboxRuntimeTasks.find((t) => t.taskId === target.taskId) ??
        flatTasks.find((t) => t.taskId === target.taskId);

      const prevId = selectedTaskIdRef.current;
      if (prevId && prevId !== target.taskId) {
        markTaskInterrupted(prevId);
        recordInterruptedTask(prevId);
      }
      recordTaskSwitch(prevId, target.taskId);

      if (runtimeTask) {
        const next = getTaskNextAction(runtimeTask);
        pushRecentTask({
          taskId: runtimeTask.taskId,
          title: runtimeTask.title,
          nextActionLabel: next.label,
        });
        saveCoordinationMemory(runtimeTask);
        markTaskSignalViewed(runtimeTask.taskId);
      }

      saveTaskWorkingContext({
        selectedTaskId: target.taskId,
        filter: activeFilter,
        groupMode: activeGroupMode,
        quickFocus,
        panelOpen: true,
      });
      recordDetailOpen(target.taskId);
      selectedTaskIdRef.current = target.taskId;

      const flatIdx = flatTasks.findIndex((t) => t.taskId === target.taskId);
      if (flatIdx >= 0) setSelectedIndex(flatIdx);

      navigate(`${target.href}${window.location.search}`);
      loadTaskDetail(target.taskId, runtimeTask);
    },
    [
      inboxRuntimeTasks,
      flatTasks,
      navigate,
      loadTaskDetail,
      onWorkInboxRoute,
      activeFilter,
      activeGroupMode,
      quickFocus,
    ],
  );

  const openWorkInboxTaskFromFocusItem = useCallback(
    (item: WorkInboxFocusItem) => {
      openWorkInboxTask({
        id: item.id,
        title: item.title,
        status: item.status,
        group: item.group,
        primaryActionLabel: item.primaryActionLabel,
        primaryActionHref: item.detailHref || item.primaryActionHref,
      });
    },
    [openWorkInboxTask],
  );

  const {
    onFocusPrimary,
    onFocusComplete,
    onFocusPause,
    onFocusForward,
    isFocusActionPending,
  } = useFocusTaskActions({
    tasks: inboxRuntimeTasks,
    onTaskUpdated: applyDetailPatch,
    onRefresh: () => {
      bumpExecMemory();
    },
    onOpenItem: openWorkInboxTaskFromFocusItem,
    operatorId: user?.userId,
  });

  const openTask = useCallback(
    (task: TaskItem) => {
      const prevId = selectedTaskIdRef.current;
      if (prevId && prevId !== task.taskId) {
        markTaskInterrupted(prevId);
        recordInterruptedTask(prevId);
      }
      recordTaskSwitch(prevId, task.taskId);
      const next = getTaskNextAction(task);
      pushRecentTask({
        taskId: task.taskId,
        title: task.title,
        nextActionLabel: next.label,
      });
      saveTaskWorkingContext({
        selectedTaskId: task.taskId,
        filter: activeFilter,
        groupMode: activeGroupMode,
        quickFocus,
        panelOpen: true,
      });
      saveCoordinationMemory(task);
      markTaskSignalViewed(task.taskId);
      recordDetailOpen(task.taskId);
      const flatIdx = flatTasks.findIndex((t) => t.taskId === task.taskId);
      if (flatIdx >= 0) setSelectedIndex(flatIdx);
      navigate(`/tasks/${task.taskId}${window.location.search}`);
      loadTaskDetail(task.taskId, task);
    },
    [flatTasks, navigate, loadTaskDetail, activeFilter, activeGroupMode, quickFocus],
  );

  const resumeTask = useCallback(
    (id: string) => {
      recordResumeFlow(id);
      const task = flatTasks.find((t) => t.taskId === id);
      if (task) openTask(task);
      else {
        navigate(`/tasks/${id}${window.location.search}`);
        loadTaskDetail(id);
      }
    },
    [flatTasks, openTask, navigate, loadTaskDetail],
  );

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const ctx = loadTaskWorkingContext();
    if (!ctx) return;

    const params = new URLSearchParams(searchParams);
    let changed = false;
    if (!searchParams.get('filter') && ctx.filter) {
      params.set('filter', normalizeTaskFilterKey(ctx.filter));
      changed = true;
    }
    if (!searchParams.get('group') && ctx.groupMode) {
      params.set('group', ctx.groupMode);
      changed = true;
    }
    if (changed) {
      setSearchParams(params);
      setActiveFilter(normalizeTaskFilterKey(params.get('filter')));
      setActiveGroupMode(parseGroupMode(params.get('group')));
    }

    if (ctx.quickFocus) setQuickFocus(ctx.quickFocus);
    else if (ctx.rhythmMode || ctx.coordinationMode) {
      setQuickFocus(quickFocusFromLegacy(ctx.rhythmMode ?? 'all', ctx.coordinationMode ?? 'all'));
    }

    if (!taskId && ctx.selectedTaskId && ctx.panelOpen) {
      navigate(`/tasks/${ctx.selectedTaskId}?${params.toString()}`);
    }

    if (ctx.scrollY != null) {
      requestAnimationFrame(() => {
        const el = document.querySelector('.main-canvas')?.parentElement;
        if (el) el.scrollTop = ctx.scrollY!;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveTaskWorkingContext({
      selectedTaskId: focusedTaskId ?? undefined,
      filter: activeFilter,
      groupMode: activeGroupMode,
      quickFocus,
      ...quickFocusToLegacy(quickFocus),
      panelOpen: Boolean(focusedTaskId),
    });
  }, [focusedTaskId, activeFilter, activeGroupMode, quickFocus]);

  useEffect(() => {
    const el = document.querySelector('.main-canvas')?.parentElement;
    if (!el) return;
    function onScroll() {
      saveTaskWorkingContext({ scrollY: el!.scrollTop });
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    registerTaskChanged((mode) => {
      if (mode === 'snapshot') {
        invalidateWorkspaceSnapshotCache();
        loadWorkspace(true, true);
      }
    });
  }, [registerTaskChanged, loadWorkspace]);

  useEffect(() => {
    if (!taskId) return;
    loadTaskDetail(taskId);
  }, [taskId, loadTaskDetail]);

  // Auto-scroll focused task into view
  useEffect(() => {
    if (!focusedTaskId) return;
    const el = document.getElementById(`task-card-${focusedTaskId}`);
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: degraded ? 'auto' : 'smooth' });
    }
  }, [focusedTaskId, degraded]);

  // Keyboard: J/K, Enter, ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        clearDetail();
        setDetailState(null);
        selectedTaskIdRef.current = null;
        navigate(onWorkInboxRoute ? INBOX_ROUTE : TASKS_LEGACY_ROUTE);
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatTasks.length - 1));
      }
      if (key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && flatTasks[selectedIndex]) {
        openTask(flatTasks[selectedIndex]);
      }
      if (key === 'r' && !e.ctrlKey && !e.metaKey) {
        const snap = buildResumeFlowSnapshot();
        const id = snap.lastTask?.taskId ?? snap.items[0]?.taskId;
        if (id) {
          e.preventDefault();
          resumeTask(id);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flatTasks, selectedIndex, clearDetail, navigate, openTask, resumeTask, onWorkInboxRoute]);

  // Sync selectedIndex when flat list changes
  useEffect(() => {
    if (focusedTaskId) {
      const idx = flatTasks.findIndex((t) => t.taskId === focusedTaskId);
      if (idx >= 0) setSelectedIndex(idx);
    }
  }, [flatTasks, focusedTaskId]);

  // Clear selection when focused task is absent from both legacy queue and inbox runtime
  useEffect(() => {
    if (!focusedTaskId || !snapshot) return;
    const inLegacyQueue = flatTasks.some((t) => t.taskId === focusedTaskId);
    const inInboxRuntime = inboxRuntimeTasks.some((t) => t.taskId === focusedTaskId);
    if (!inLegacyQueue && !inInboxRuntime && taskId) {
      clearDetail();
      setDetailState(null);
      selectedTaskIdRef.current = null;
      setFilterFeedback('Việc đang chọn không thuộc bộ lọc hiện tại — đã đóng panel.');
      if (filterFeedbackTimerRef.current) window.clearTimeout(filterFeedbackTimerRef.current);
      filterFeedbackTimerRef.current = window.setTimeout(() => setFilterFeedback(null), 5000);
      const listRoute = onWorkInboxRoute ? INBOX_ROUTE : TASKS_LEGACY_ROUTE;
      navigate(`${listRoute}?${searchParams.toString()}`, { replace: true });
    }
  }, [
    flatTasks,
    inboxRuntimeTasks,
    focusedTaskId,
    taskId,
    snapshot,
    clearDetail,
    navigate,
    searchParams,
    onWorkInboxRoute,
  ]);

  function showFilterFeedback(notice: string) {
    setFilterFeedback(notice);
    if (filterFeedbackTimerRef.current) window.clearTimeout(filterFeedbackTimerRef.current);
    filterFeedbackTimerRef.current = window.setTimeout(() => setFilterFeedback(null), 4000);
  }

  const updateSearchParams = useCallback(
    (nextFilter: TaskFilter, nextGroup: GroupMode) => {
      const params = new URLSearchParams(searchParams);
      params.set('filter', nextFilter);
      params.set('group', nextGroup);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const selectFilter = useCallback(
    (f: TaskFilter) => {
      const before = activeFilter;
      logFilterClick({
        nextFilter: f,
        activeFilterBefore: before,
        activeFilterAfter: f,
        groupMode: activeGroupMode,
        quickFocus,
        focusQueueMode,
        source: 'tab',
      });
      setActiveFilter(f);
      updateSearchParams(f, activeGroupMode);
      showFilterFeedback(`Đã áp dụng bộ lọc: ${getTaskFilterLabel(f)}`);
    },
    [activeFilter, activeGroupMode, quickFocus, focusQueueMode, updateSearchParams],
  );

  const selectGroupMode = useCallback(
    (mode: GroupMode) => {
      logFilterClick({
        activeFilterBefore: activeFilter,
        groupMode: mode,
        quickFocus,
        focusQueueMode,
        source: 'group',
      });
      setActiveGroupMode(mode);
      updateSearchParams(activeFilter, mode);
      showFilterFeedback(`Hiển thị theo: ${mode === 'cognition' ? 'Cognition' : 'Trạng thái'}`);
    },
    [activeFilter, activeGroupMode, quickFocus, focusQueueMode, updateSearchParams],
  );

  const selectQuickFocus = useCallback(
    (focus: QuickFocusFilter) => {
      logFilterClick({
        activeFilterBefore: activeFilter,
        groupMode: activeGroupMode,
        quickFocus: focus,
        focusQueueMode,
        source: 'quickFocus',
      });
      setQuickFocus(focus);
      saveTaskWorkingContext({ quickFocus: focus, ...quickFocusToLegacy(focus) });
      const label = focus === 'all' ? 'Tất cả quick focus' : focus;
      showFilterFeedback(focus === 'all' ? 'Đã tắt quick focus' : `Quick focus: ${label}`);
    },
    [activeFilter, activeGroupMode, focusQueueMode],
  );

  const handleFocusQueueModeChange = useCallback(
    (next: boolean) => {
      logFilterClick({
        activeFilterBefore: activeFilter,
        groupMode: activeGroupMode,
        quickFocus,
        focusQueueMode: next,
        source: 'focus',
      });
      setFocusQueueMode(next);
      saveFocusQueueMode(next);
      saveTaskWorkingContext({ focusQueueMode: next });
      showFilterFeedback(
        next ? 'Focus mode — ẩn việc nền, gom signal thực thi' : 'Đã tắt Focus mode',
      );
    },
    [activeFilter, activeGroupMode, quickFocus],
  );

  useEffect(() => {
    publishRuntimeTelemetry({
      runtime: runtime ?? null,
      counts: snapshot?.counts ?? null,
      connected,
      refreshing: refreshing || (initialLoading && !snapshot),
      degraded,
      warnings,
      error: error && snapshot ? error : null,
      staleMessage: staleMsg,
    });
    return () => publishRuntimeTelemetry(null);
  }, [
    runtime,
    snapshot?.counts,
    connected,
    refreshing,
    initialLoading,
    snapshot,
    degraded,
    warnings,
    error,
    staleMsg,
    publishRuntimeTelemetry,
  ]);

  usePerfMark('TasksPage:filters', [activeFilter, quickFocus, activeGroupMode, focusQueueMode]);

  useEffect(() => {
    if (snapshot && !initialLoading && flatTasks.length > 0 && isRenderPerfEnabled()) {
      requestAnimationFrame(() => {
        markRenderEnd('snapshot-to-queue', undefined, {
          taskCount: flatTasks.length,
          selectedTaskId: focusedTaskId,
        });
      });
    }
  }, [snapshot, initialLoading, flatTasks.length, focusedTaskId]);

  const legacyLoadingBody = (
    <>
      <h1 className="task-workspace-title text-2xl font-semibold tracking-tight text-slate-900">
        Việc vận hành
      </h1>
      <OperationalAlertHeader onCreate={handleOpenCreate} createEnabled={canCreateTaskUi} enableSecondaryFeeds={false} />
      <TaskControlSurface
        activeFilter={activeFilter}
        groupMode={activeGroupMode}
        quickFocus={quickFocus}
        teamPressure={teamPressure}
        focusQueueMode={focusQueueMode}
        currentTaskId={focusedTaskId}
        execMemoryTick={execMemoryTick}
        onFilterChange={selectFilter}
        onGroupModeChange={selectGroupMode}
        onQuickFocusChange={selectQuickFocus}
        onFocusQueueModeChange={handleFocusQueueModeChange}
        onResumeTask={resumeTask}
      />
      <TaskListSkeleton rows={4} />
    </>
  );

  if (initialLoading && !snapshot) {
    return (
      <div className={`task-runtime-zone space-y-2 ${focusQueueMode ? 'focus-queue-mode' : ''}`}>
        {showWorkInboxV3Panel && (
          <WorkInboxGroupsPanel
            tasks={[]}
            counts={null}
            loading
            selectedTaskId={focusedTaskId}
            taskDetail={detail}
            detailLoading={detailFetching}
            detailError={detailError}
            onRetryDetail={onRetryDetail}
            onSelectTask={openWorkInboxTask}
            onOpenTask={openWorkInboxTask}
            onFocusPrimary={onFocusPrimary}
            onFocusComplete={onFocusComplete}
            onFocusPause={onFocusPause}
            onFocusForward={onFocusForward}
            isFocusActionPending={isFocusActionPending}
            user={user}
            onTaskUpdated={applyDetailPatch}
            onRefreshWorkspace={() => loadWorkspaceRef.current(true, true)}
          />
        )}
        {renderLegacyRuntime ? (
          <LegacyTaskRuntimePanel
            open={showLegacyRuntime}
            onToggle={() => setShowLegacyRuntime((v) => !v)}
            showToggle={onWorkInboxRoute}
          >
            {legacyLoadingBody}
          </LegacyTaskRuntimePanel>
        ) : (
          legacyLoadingBody
        )}
      </div>
    );
  }

  if (error && !snapshot) {
    return <ErrorState message={error} onRetry={() => loadWorkspace()} />;
  }

  const legacyRuntimeBody = (
    <>
      <h1 className="task-workspace-title text-2xl font-semibold tracking-tight text-slate-900">
        Việc vận hành
      </h1>

      <OperationalAlertHeader
        onCreate={handleOpenCreate}
        createEnabled={canCreateTaskUi}
        snapshotOverdueCount={snapshot?.counts?.overdue}
        enableSecondaryFeeds={Boolean(snapshot)}
      />

      <TaskControlSurface
        activeFilter={activeFilter}
        groupMode={activeGroupMode}
        quickFocus={quickFocus}
        teamPressure={teamPressure}
        focusQueueMode={focusQueueMode}
        currentTaskId={focusedTaskId}
        execMemoryTick={execMemoryTick}
        filterFeedback={filterFeedback ?? filterNotice}
        queueSummary={summaryText}
        onFilterChange={selectFilter}
        onGroupModeChange={selectGroupMode}
        onQuickFocusChange={selectQuickFocus}
        onFocusQueueModeChange={handleFocusQueueModeChange}
        onResumeTask={resumeTask}
      />

      {filterWarnings.length > 0 && (
        <p className="task-filter-degraded-note text-xs text-amber-800" role="status">
          {filterWarnings[0]}
        </p>
      )}

      {flatTasks.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      ) : (
        <TaskGroupedList
          groups={taskGroups}
          focusedTaskId={focusedTaskId}
          selectedIndex={selectedIndex}
          suppressSignals={degraded}
          focusQueueMode={focusQueueMode}
          overloadedOwnerIds={overloadedOwnerIds}
          signalContext={signalContext}
          inlineExec={inlineExec}
          inlineHandlers={inlineHandlers}
          onOpen={openTask}
          onAccept={handleAccept}
          onComplete={handleComplete}
          onHoSo={() => navigate('/hoso')}
          getTaskFeedback={taskFeedback.getFeedback}
          isActionPending={taskFeedback.isPending}
          header={
            <span className="task-meta-passive text-xs" role="status">
              {summaryText}
            </span>
          }
        />
      )}
    </>
  );

  return (
    <div className={`task-runtime-zone space-y-2 ${focusQueueMode ? 'focus-queue-mode' : ''} ${degraded ? 'motion-reduce' : ''}`}>
      {showWorkInboxV3Panel && (
        <WorkInboxGroupsPanel
          tasks={inboxRuntimeTasks}
          counts={snapshot?.counts ?? null}
          loading={refreshing || (initialLoading && Boolean(snapshot))}
          selectedTaskId={focusedTaskId}
          taskDetail={detail}
          detailLoading={detailFetching}
          detailError={detailError}
          onRetryDetail={onRetryDetail}
          onSelectTask={openWorkInboxTask}
          onOpenTask={openWorkInboxTask}
          onFocusPrimary={onFocusPrimary}
          onFocusComplete={onFocusComplete}
          onFocusPause={onFocusPause}
          onFocusForward={onFocusForward}
          isFocusActionPending={isFocusActionPending}
          user={user}
          onTaskUpdated={applyDetailPatch}
          onRefreshWorkspace={() => loadWorkspaceRef.current(true, true)}
        />
      )}

      {renderLegacyRuntime ? (
        <LegacyTaskRuntimePanel
          open={showLegacyRuntime}
          onToggle={() => setShowLegacyRuntime((v) => !v)}
          showToggle={onWorkInboxRoute}
        >
          {legacyRuntimeBody}
        </LegacyTaskRuntimePanel>
      ) : (
        !showWorkInboxV3Panel && legacyRuntimeBody
      )}

      {user && (
        <WorkInboxCreateTaskDialog
          open={workInboxCreateOpen}
          operator={user}
          onClose={() => setWorkInboxCreateOpen(false)}
          onCreated={handleWorkInboxTaskCreated}
        />
      )}
    </div>
  );
}
