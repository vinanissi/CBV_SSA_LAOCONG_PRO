import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TaskDetail, TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { RIGHT_CONTEXT_ROOT_ID } from '@/modules/task/inbox/rightContextPortal';
import { FocusTaskWorkspace } from './FocusTaskWorkspace';
import { RightContextTabs } from './RightContextTabs';
import type { FocusPendingAction } from '@/modules/task/inbox/actionRuntime/useWorkInboxActionRuntime';
import type { WorkInboxActionCode } from '@/modules/task/inbox/actionRuntime/workInboxActionTypes';
import type { TaskOperationalBundle } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import type { WorkInboxOperationalOp } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalPermissions';
import { buildFocusProgressRuntime } from '@/modules/task/inbox/operationalRuntime/focusProgressRuntime';

function formatTaskTimestamp(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.trim();
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface WorkInboxFocusRuntimeProps {
  items: WorkInboxFocusItem[];
  tasks: TaskItem[];
  initialIndex?: number;
  taskDetail?: TaskDetail | null;
  detailLoading?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  onBackToInbox: () => void;
  onPrimary: (item: WorkInboxFocusItem) => void;
  onPause?: (item: WorkInboxFocusItem) => void;
  onForward?: (item: WorkInboxFocusItem) => void;
  onComplete?: (item: WorkInboxFocusItem) => void;
  isFocusActionPending?: (taskId: string, action: FocusPendingAction) => boolean;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onMoreMenuOpen?: () => void;
  onMoreAction?: (code: WorkInboxActionCode) => void;
  moreMenuOpen?: boolean;
  onQuickCall?: () => void;
  onQuickMessage?: () => void;
  onQuickAppointment?: () => void;
  onQuickGuide?: () => void;
  onQuickFormTemplate?: () => void;
  onSaveNote?: (content: string) => void;
  operationalBundle?: TaskOperationalBundle | null;
  operationalLoading?: boolean;
  operationalError?: string | null;
  operationalDegraded?: boolean;
  onRetryOperational?: () => void;
  opPermissions?: Record<WorkInboxOperationalOp, boolean>;
  attachDialogOpen?: boolean;
  onAttachDialogOpenChange?: (open: boolean) => void;
  onFocusIndexChange?: (index: number) => void;
}

export function WorkInboxFocusRuntime({
  items,
  tasks,
  initialIndex = 0,
  taskDetail = null,
  detailLoading = false,
  detailError = null,
  onRetryDetail,
  onBackToInbox,
  onPrimary,
  onPause,
  onForward,
  onComplete,
  isFocusActionPending,
  onNavigatePrev,
  onNavigateNext,
  onMoreMenuOpen,
  onMoreAction,
  moreMenuOpen,
  onQuickCall,
  onQuickMessage,
  onQuickAppointment,
  onQuickGuide,
  onQuickFormTemplate,
  onSaveNote,
  operationalBundle = null,
  operationalLoading = false,
  operationalError = null,
  operationalDegraded = false,
  onRetryOperational,
  opPermissions,
  attachDialogOpen,
  onAttachDialogOpenChange,
  onFocusIndexChange,
}: WorkInboxFocusRuntimeProps) {
  const [focusIndex, setFocusIndex] = useState(initialIndex);
  const [rightMount, setRightMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRightMount(document.getElementById(RIGHT_CONTEXT_ROOT_ID));
  }, []);

  useEffect(() => {
    setFocusIndex((prev) => (prev === initialIndex ? prev : initialIndex));
  }, [initialIndex]);

  const taskById = useMemo(() => {
    const map = new Map<string, TaskItem>();
    for (const t of tasks) {
      if (t.taskId) map.set(t.taskId, t);
    }
    return map;
  }, [tasks]);

  const safeIndex = items.length > 0 ? Math.min(Math.max(0, focusIndex), items.length - 1) : 0;
  const current = items[safeIndex] ?? null;
  const runtimeTask = current ? taskById.get(current.id) : undefined;

  const updatedLabel = formatTaskTimestamp(runtimeTask?.updatedAt);
  const createdLabel = updatedLabel;
  const summaryText = runtimeTask?.pendingAction?.trim() || runtimeTask?.title;
  const focusProgress = buildFocusProgressRuntime(safeIndex, items.length);

  const handleIndexChange = useCallback(
    (index: number) => {
      setFocusIndex(index);
      onFocusIndexChange?.(index);
    },
    [onFocusIndexChange],
  );

  const workspace = (
    <section
      className="work-inbox-focus-runtime work-inbox-focus-runtime--workspace-only"
      aria-label="Focus Runtime"
      data-cbv-panel="work-inbox-focus-runtime"
    >
      <FocusTaskWorkspace
        items={items}
        initialIndex={initialIndex}
        runtimeTask={runtimeTask}
        summaryText={summaryText}
        onBackToInbox={onBackToInbox}
        onPrimary={onPrimary}
        onPause={onPause}
        onForward={onForward}
        onComplete={onComplete}
        isPending={isFocusActionPending}
        onIndexChange={handleIndexChange}
        onSelectTaskByIndex={handleIndexChange}
        onNavigatePrev={onNavigatePrev}
        onNavigateNext={onNavigateNext}
        onMoreMenuOpen={onMoreMenuOpen}
        onMoreAction={onMoreAction}
        moreMenuOpen={moreMenuOpen}
        focusProgress={focusProgress}
        opPermissions={opPermissions}
        attachDialogOpen={attachDialogOpen}
        onAttachDialogOpenChange={onAttachDialogOpenChange}
      />
      <div
        className="work-inbox-focus-runtime__status-anchor"
        data-cbv-panel="bottom-runtime-status-bar"
        aria-hidden
      />
    </section>
  );

  const rightPanel =
    current && rightMount
      ? createPortal(
          <RightContextTabs
            item={current}
            runtimeTask={runtimeTask}
            taskDetail={taskDetail?.taskId === current.id ? taskDetail : null}
            detailLoading={detailLoading}
            detailError={detailError}
            createdLabel={createdLabel}
            updatedLabel={updatedLabel}
            onRetryDetail={onRetryDetail}
            onQuickCall={onQuickCall}
            onQuickMessage={onQuickMessage}
            onQuickAppointment={onQuickAppointment}
            onQuickGuide={onQuickGuide}
            onQuickFormTemplate={onQuickFormTemplate}
            operationalBundle={operationalBundle}
            operationalLoading={operationalLoading}
            operationalError={operationalError}
            operationalDegraded={operationalDegraded}
            onRetryOperational={onRetryOperational}
            onSaveNote={onSaveNote}
            opPermissions={opPermissions}
            attachDialogOpen={attachDialogOpen}
            onAttachDialogOpenChange={onAttachDialogOpenChange}
          />,
          rightMount,
        )
      : null;

  return (
    <>
      {workspace}
      {rightPanel}
    </>
  );
}
