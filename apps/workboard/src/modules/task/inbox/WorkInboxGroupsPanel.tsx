import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TaskDetail, TaskItem, TaskWorkspaceCounts, UserContext } from '@/api/contracts';
import { mapTasksToInboxItems } from '@/modules/task/adapters/workInboxAdapter';
import { buildVisibleInboxGroups } from './inboxGroups';
import { mapInboxGroupBucketToCardModels } from './inboxCardModels';
import { mapTaskCardModelsToFocusItems } from './focusModeModels';
import { deriveWorkInboxKpi } from './workInboxKpi';
import { WorkInboxGroupSection } from './components/WorkInboxGroupSection';
import { WorkInboxFocusModeV3 } from './components/WorkInboxFocusModeV3';
import { WorkInboxKpiStrip } from './components/WorkInboxKpiStrip';
import {
  isWorkInboxFocusRuntimeDefault,
  isWorkInboxFocusRuntimeEnabled,
  isWorkInboxFocusV3Enabled,
} from './workInboxGroupsFeature';
import { WorkInboxFocusActionHost } from './actionRuntime/WorkInboxFocusActionHost';
import { findFocusIndexByTaskId, resolveFocusItemOpenTarget } from './workInboxOpenAction';
import { useWorkInboxLayout } from './WorkInboxLayoutContext';
import {
  registerWorkInboxSearchBridge,
  unregisterWorkInboxSearchBridge,
} from './search/workInboxSearchBridgeRegistry';
import { pushRecentSearch } from './search/workInboxRecentSearchStore';
import type { WorkInboxSearchResult } from './search/workInboxSearchTypes';
import { ingestWorkInboxLatencyTrace } from './performance/workInboxLatencyProfile';
import { createWorkInboxTraceId } from './performance/workInboxPerformanceTrace';
import type { TaskCardModel, WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import type { FocusPendingAction } from '@/modules/task/useFocusTaskActions';

const PREVIEW_LIMIT = 10;

type InboxViewMode = 'focus' | 'inbox';

interface WorkInboxGroupsPanelProps {
  tasks: TaskItem[];
  counts?: TaskWorkspaceCounts | null;
  loading?: boolean;
  previewLimit?: number;
  selectedTaskId?: string | null;
  taskDetail?: TaskDetail | null;
  detailLoading?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  onSelectTask: (model: TaskCardModel) => void;
  onOpenTask: (model: TaskCardModel) => void;
  onFocusPrimary?: (item: WorkInboxFocusItem) => void;
  onFocusComplete?: (item: WorkInboxFocusItem) => void;
  onFocusPause?: (item: WorkInboxFocusItem) => void;
  onFocusForward?: (item: WorkInboxFocusItem) => void;
  isFocusActionPending?: (taskId: string, action: FocusPendingAction) => boolean;
  user?: UserContext;
  onTaskUpdated?: (task: TaskDetail) => void;
  onRefreshWorkspace?: () => void;
}

function initialViewMode(): InboxViewMode {
  if (isWorkInboxFocusRuntimeEnabled() && isWorkInboxFocusRuntimeDefault()) {
    return 'focus';
  }
  return 'inbox';
}

export function WorkInboxGroupsPanel({
  tasks,
  counts = null,
  loading = false,
  previewLimit = PREVIEW_LIMIT,
  selectedTaskId = null,
  taskDetail = null,
  detailLoading = false,
  detailError = null,
  onRetryDetail,
  onSelectTask,
  onOpenTask,
  onFocusPrimary,
  onFocusComplete,
  onFocusPause,
  onFocusForward,
  isFocusActionPending,
  user,
  onTaskUpdated,
  onRefreshWorkspace,
}: WorkInboxGroupsPanelProps) {
  const focusRuntimeOn = isWorkInboxFocusRuntimeEnabled();
  const { setViewMode: syncLayoutViewMode, publishMetrics, enterFocus, showInboxList } =
    useWorkInboxLayout();
  const [viewMode, setViewMode] = useState<InboxViewMode>(initialViewMode);
  const [legacyFocusActive, setLegacyFocusActive] = useState(false);
  const [focusPreviewIndex, setFocusPreviewIndex] = useState(0);

  const buckets = useMemo(() => {
    const inboxItems = mapTasksToInboxItems(tasks);
    return buildVisibleInboxGroups(inboxItems);
  }, [tasks]);

  const focusItems = useMemo(() => {
    const cards = buckets.flatMap((bucket) =>
      mapInboxGroupBucketToCardModels(bucket, bucket.items.length),
    );
    return mapTaskCardModelsToFocusItems(cards);
  }, [buckets]);

  const kpi = useMemo(() => deriveWorkInboxKpi(tasks, counts), [tasks, counts]);

  useEffect(() => {
    publishMetrics(kpi, focusItems.length);
  }, [kpi, focusItems.length, publishMetrics]);

  useEffect(() => {
    syncLayoutViewMode(viewMode);
  }, [viewMode, syncLayoutViewMode]);

  useEffect(() => {
    if (!selectedTaskId || focusItems.length === 0) return;
    const idx = findFocusIndexByTaskId(focusItems, selectedTaskId);
    if (focusItems[idx]?.id === selectedTaskId) {
      setFocusPreviewIndex((prev) => (prev === idx ? prev : idx));
      if (focusRuntimeOn) setViewMode('focus');
    }
  }, [selectedTaskId, focusItems, focusRuntimeOn]);

  const handleFocusIndexChange = useCallback((index: number) => {
    setFocusPreviewIndex((prev) => (prev === index ? prev : index));
  }, []);

  const handleOpenFocusItem = useCallback(
    (item: WorkInboxFocusItem) => {
      const target = resolveFocusItemOpenTarget(item);
      if (!target) return;
      onOpenTask({
        id: item.id,
        title: item.title,
        status: item.status,
        group: item.group,
        primaryActionLabel: item.primaryActionLabel,
        primaryActionHref: target.href,
      });
    },
    [onOpenTask],
  );

  const goBackToInbox = useCallback(() => {
    setViewMode('inbox');
    showInboxList();
  }, [showInboxList]);

  const enterFocusMode = useCallback(() => {
    if (focusRuntimeOn) {
      setViewMode('focus');
      enterFocus();
      return;
    }
    if (isWorkInboxFocusV3Enabled()) {
      setLegacyFocusActive(true);
    }
  }, [focusRuntimeOn, enterFocus]);

  useEffect(() => {
    if (!focusRuntimeOn || !user) {
      unregisterWorkInboxSearchBridge();
      return;
    }
    registerWorkInboxSearchBridge({
      focusItems,
      tasks,
      operator: user,
      enterFocus: enterFocusMode,
      openSearchResult: (result: WorkInboxSearchResult, query: string) => {
        const t0 = performance.now();
        const traceId = createWorkInboxTraceId('SEARCH_OPEN');
        pushRecentSearch(query);
        enterFocusMode();
        const idx = result.position - 1;
        setFocusPreviewIndex(idx);
        const item = focusItems[idx];
        if (item) handleOpenFocusItem(item);
        ingestWorkInboxLatencyTrace({
          action: 'SEARCH_OPEN',
          traceId,
          taskId: result.taskId,
          totalDurationMs: performance.now() - t0,
          requestCount: 0,
          fe: { prepareMs: Math.round(performance.now() - t0) },
        });
      },
      jumpToPosition: (position: number) => {
        const idx = position - 1;
        if (idx < 0 || idx >= focusItems.length) {
          return { ok: false, error: `Vị trí phải từ 1 đến ${focusItems.length}` };
        }
        enterFocusMode();
        setFocusPreviewIndex(idx);
        const item = focusItems[idx];
        if (item) handleOpenFocusItem(item);
        return { ok: true };
      },
    });
    return () => unregisterWorkInboxSearchBridge();
  }, [focusRuntimeOn, user, focusItems, tasks, enterFocusMode, handleOpenFocusItem]);

  const focusCtaLabel =
    focusItems.length > 0 ? `🎯 Focus ${focusItems.length} việc` : '🎯 Bắt đầu Focus';

  const headerRow = (
    <div className="work-inbox-groups-header flex flex-wrap items-center justify-between gap-2">
      <p className="text-[11px] font-medium text-operational-muted">
        {viewMode === 'focus' ? 'Focus Runtime' : 'Hộp việc V3'}
      </p>
      {viewMode === 'inbox' && isWorkInboxFocusV3Enabled() && (
        <button
          type="button"
          className="btn-primary shrink-0 px-3 py-1.5 text-xs font-bold shadow-sm"
          onClick={enterFocusMode}
          disabled={focusItems.length === 0}
        >
          {focusCtaLabel}
        </button>
      )}
    </div>
  );

  if (focusRuntimeOn && viewMode === 'focus') {
    return (
      <section
        className="work-inbox-groups work-inbox-groups--focus-runtime"
        aria-label="Hộp việc V3 Focus Runtime"
        data-cbv-panel="work-inbox-groups-v3"
      >
        {user && onTaskUpdated && onRefreshWorkspace ? (
          <WorkInboxFocusActionHost
            items={focusItems}
            tasks={tasks}
            focusIndex={focusPreviewIndex}
            taskDetail={taskDetail}
            detailLoading={detailLoading}
            detailError={detailError}
            onRetryDetail={onRetryDetail}
            selectedTaskId={selectedTaskId}
            user={user}
            onBackToInbox={goBackToInbox}
            onOpenItem={handleOpenFocusItem}
            onTaskUpdated={onTaskUpdated}
            onSnapshotRefresh={onRefreshWorkspace}
            onFocusIndexChange={handleFocusIndexChange}
          />
        ) : (
          <p className="text-xs text-amber-800" role="alert">
            Action runtime cần user context — thiếu RCLA provider props.
          </p>
        )}
      </section>
    );
  }

  if (!focusRuntimeOn && legacyFocusActive) {
    return (
      <section className="work-inbox-groups space-y-2" aria-label="Hộp việc V3" data-cbv-panel="work-inbox-groups-v3">
        <WorkInboxKpiStrip metrics={kpi} loading={loading} variant="compact-line" />
        {headerRow}
        <WorkInboxFocusModeV3
          items={focusItems}
          initialIndex={focusPreviewIndex}
          onExit={() => setLegacyFocusActive(false)}
          onOpenDetail={onFocusPrimary ?? handleOpenFocusItem}
          onComplete={onFocusComplete}
          onPause={onFocusPause}
          onForward={onFocusForward}
          isPending={isFocusActionPending}
        />
      </section>
    );
  }

  if (!loading && buckets.length === 0) {
    return (
      <section
        className="work-inbox-groups space-y-2 rounded-lg border border-border/60 bg-surface-raised/40 px-3 py-2"
        aria-label="Hộp việc V3"
        data-cbv-panel="work-inbox-groups-v3"
      >
        <WorkInboxKpiStrip metrics={kpi} loading={loading} variant="compact-line" />
        {headerRow}
        <p className="text-xs text-operational-muted">Không có công việc</p>
      </section>
    );
  }

  return (
    <section
      className="work-inbox-groups space-y-2"
      aria-label="Hộp việc V3"
      data-cbv-panel="work-inbox-groups-v3"
    >
      <WorkInboxKpiStrip metrics={kpi} loading={loading} variant="compact-line" />
      {headerRow}

      {loading && buckets.length === 0 && (
        <p className="text-[11px] text-operational-muted" role="status">
          Đang đồng bộ nhóm việc…
        </p>
      )}

      <div className="work-inbox-groups-list flex flex-col gap-1.5 min-w-0">
        {buckets.map((bucket) => {
          const cards = mapInboxGroupBucketToCardModels(bucket, previewLimit);
          return (
            <WorkInboxGroupSection
              key={bucket.key}
              bucket={bucket}
              cards={cards}
              totalInGroup={bucket.items.length}
              previewLimit={previewLimit}
              compact
              hideOpenButton
              selectedTaskId={selectedTaskId}
              onOpen={onOpenTask}
              onSelect={onSelectTask}
            />
          );
        })}
      </div>
    </section>
  );
}
