import { useCallback, useMemo, useRef } from 'react';
import type { TaskDetail, TaskItem, UserContext } from '@/api/contracts';
import { normalizeRuntimeUser, resolveRuntimeUser } from '@/runtime/runtimeIdentity';
import { WorkInboxRuntimeContextProvider } from '@/runtime/rcla/workInboxRuntimeContextRegistry';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import type { TaskOperationalBundle } from '../operationalRuntime/workInboxOperationalTypes';
import { WorkInboxFocusRuntime } from '../focusRuntime/WorkInboxFocusRuntime';
import { useWorkInboxActionRuntime } from './useWorkInboxActionRuntime';
import { PauseReasonDialog } from './dialogs/PauseReasonDialog';
import { HandoffDialog } from './dialogs/HandoffDialog';
import { AppointmentDialog } from '../operationalRuntime/dialogs/AppointmentDialog';
import { useWorkInboxOperationalBundle } from '../operationalRuntime/useWorkInboxOperationalBundle';
import { mergeWorkInboxTaskPatch } from '../performance/workInboxTaskPatchMerge';

interface WorkInboxFocusActionHostProps {
  items: WorkInboxFocusItem[];
  tasks: TaskItem[];
  focusIndex: number;
  taskDetail: TaskDetail | null;
  detailLoading: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  user: UserContext;
  operationalBundle: TaskOperationalBundle | null;
  operationalLoading: boolean;
  operationalError?: string | null;
  operationalDegraded?: boolean;
  refreshOperational: () => void;
  onBackToInbox: () => void;
  onOpenItem: (item: WorkInboxFocusItem) => void;
  onTaskUpdated: (task: TaskDetail) => void;
  onSnapshotRefresh?: () => void;
  onFocusIndexChange: (index: number) => void;
  /** Sticky task id from route/selection — prevents fetch loop when focusItems rebuild. */
  selectedTaskId?: string | null;
}

function FocusRuntimeWithActions(props: WorkInboxFocusActionHostProps) {
  const mergeAndUpdateTask = useCallback(
    (patch: TaskDetail) => {
      props.onTaskUpdated(mergeWorkInboxTaskPatch(props.taskDetail, patch));
    },
    [props.onTaskUpdated, props.taskDetail],
  );

  const actions = useWorkInboxActionRuntime({
    onTaskUpdated: mergeAndUpdateTask,
    onSnapshotRefresh: props.onSnapshotRefresh,
    onOpenItem: props.onOpenItem,
    onFocusIndexChange: props.onFocusIndexChange,
  });

  return (
    <>
      <WorkInboxFocusRuntime
        items={props.items}
        tasks={props.tasks}
        initialIndex={props.focusIndex}
        taskDetail={props.taskDetail}
        detailLoading={props.detailLoading}
        detailError={props.detailError}
        onRetryDetail={props.onRetryDetail}
        operationalBundle={props.operationalBundle}
        operationalLoading={props.operationalLoading}
        operationalError={props.operationalError}
        operationalDegraded={props.operationalDegraded}
        onRetryOperational={props.refreshOperational}
        onBackToInbox={props.onBackToInbox}
        onPrimary={actions.onFocusPrimary}
        onPause={actions.onFocusPause}
        onForward={actions.onFocusForward}
        onComplete={actions.onFocusComplete}
        isFocusActionPending={actions.isFocusActionPending}
        onNavigatePrev={actions.onNavigatePrev}
        onNavigateNext={actions.onNavigateNext}
        onMoreMenuOpen={() => actions.setMoreMenuOpen(true)}
        onMoreAction={actions.onMoreAction}
        moreMenuOpen={actions.moreMenuOpen}
        onQuickCall={actions.onQuickCall}
        onQuickMessage={actions.onQuickMessage}
        onQuickAppointment={actions.onQuickAppointment}
        onQuickGuide={actions.onQuickGuide}
        onQuickFormTemplate={actions.onQuickFormTemplate}
        onSaveNote={actions.onSaveNote}
        opPermissions={actions.opPermissions}
        attachDialogOpen={actions.attachDialogOpen}
        onAttachDialogOpenChange={actions.setAttachDialogOpen}
        onFocusIndexChange={props.onFocusIndexChange}
      />
      <PauseReasonDialog
        open={actions.pauseDialogOpen}
        onClose={() => actions.setPauseDialogOpen(false)}
        onConfirm={actions.onFocusPauseConfirm}
      />
      <HandoffDialog
        open={actions.handoffDialogOpen}
        assigneeOptions={actions.operatorOptions}
        onClose={() => actions.setHandoffDialogOpen(false)}
        onConfirm={actions.onFocusHandoffConfirm}
      />
      <AppointmentDialog
        open={actions.appointmentDialogOpen}
        onClose={() => actions.setAppointmentDialogOpen(false)}
        onConfirm={actions.onAppointmentConfirm}
      />
    </>
  );
}

export function WorkInboxFocusActionHost(
  props: Omit<WorkInboxFocusActionHostProps, 'operationalBundle' | 'operationalLoading' | 'refreshOperational'>,
) {
  const stableTaskId = useMemo(() => {
    const fromDetail = props.taskDetail?.taskId?.trim();
    const fromItem = props.items[props.focusIndex]?.id?.trim();
    const fromSelected = props.selectedTaskId?.trim();
    return fromDetail || fromItem || fromSelected || null;
  }, [props.taskDetail?.taskId, props.items, props.focusIndex, props.selectedTaskId]);

  const { bundle, loading: operationalLoading, error: operationalError, degraded: operationalDegraded, refresh, refreshForAction } =
    useWorkInboxOperationalBundle(stableTaskId);

  const refreshRef = useRef(refresh);
  const refreshForActionRef = useRef(refreshForAction);
  refreshRef.current = refresh;
  refreshForActionRef.current = refreshForAction;

  const stableRefreshOperational = useCallback(() => {
    refreshRef.current();
  }, []);

  const stableActionRefreshOperational = useCallback(() => {
    refreshForActionRef.current();
  }, []);

  const runtimeUser = useMemo(
    () =>
      resolveRuntimeUser(props.user.userId) ??
      normalizeRuntimeUser({
        id: props.user.userId,
        userCode: props.user.userId,
        displayName: props.user.displayName,
      }),
    [props.user.userId, props.user.displayName],
  );

  const providerValue = useMemo(
    () => ({
      operator: props.user,
      runtimeUser,
      tasks: props.tasks,
      focusItems: props.items,
      focusIndex: props.focusIndex,
      taskDetail: props.taskDetail,
      detailLoading: props.detailLoading,
      detailError: props.detailError,
      operationalBundle: bundle,
      operationalLoading,
      refreshOperational: stableActionRefreshOperational,
    }),
    [
      props.user,
      runtimeUser,
      props.tasks,
      props.items,
      props.focusIndex,
      props.taskDetail,
      props.detailLoading,
      props.detailError,
      bundle,
      operationalLoading,
      stableActionRefreshOperational,
    ],
  );

  return (
    <WorkInboxRuntimeContextProvider value={providerValue}>
      <FocusRuntimeWithActions
        {...props}
        operationalBundle={bundle}
        operationalLoading={operationalLoading}
        operationalError={operationalError}
        operationalDegraded={operationalDegraded}
        refreshOperational={stableRefreshOperational}
      />
    </WorkInboxRuntimeContextProvider>
  );
}
