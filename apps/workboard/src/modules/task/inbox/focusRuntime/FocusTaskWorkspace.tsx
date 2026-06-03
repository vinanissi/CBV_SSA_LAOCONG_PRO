import { useCallback, useEffect, useState } from 'react';
import type { TaskDetail, TaskItem, UserContext } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import type { TaskOperationalBundle } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import { clampFocusIndex } from '@/modules/task/inbox/focusModeModels';
import { CompactTaskHeader } from './CompactTaskHeader';
import { FocusHeader } from './FocusHeader';
import { FocusContentCards } from './FocusContentCards';
import { FocusActionBar } from './FocusActionBar';
import { isStickyBottomActionBarEnabled } from './focusActionBarLayoutConfig';
import { isCenterNextTaskBlockVisible } from './focusCenterLayoutConfig';
import { NextTaskCard } from './NextTaskCard';
import type { FocusPendingAction } from '@/modules/task/inbox/actionRuntime/useWorkInboxActionRuntime';
import type { WorkInboxActionCode } from '@/modules/task/inbox/actionRuntime/workInboxActionTypes';
import type { FocusProgressRuntime } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import type { WorkInboxOperationalOp } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalPermissions';
import { CaseWorkspace } from '@/modules/ocms/CaseWorkspace';
import { isCaseWorkspaceEnabled, isOcmsCaseStripEnabled } from '@/modules/ocms/ocmsFeature';
import { useCaseReadModel } from '@/modules/ocms/useCaseReadModel';
import { WorkInboxCaseContextStrip } from '@/modules/ocms/WorkInboxCaseContextStrip';
import { useWorkInboxChecklistRuntime } from '@/modules/task/inbox/checklist/useWorkInboxChecklistRuntime';
import { useWorkInboxLayout } from '@/modules/task/inbox/WorkInboxLayoutContext';
import { resolveRuntimeUser } from '@/runtime/runtimeIdentity';

const ASSIGNEE_FALLBACK = 'Chưa gán';

interface FocusTaskWorkspaceProps {
  items: WorkInboxFocusItem[];
  initialIndex?: number;
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  summaryText?: string;
  onBackToInbox: () => void;
  onPrimary: (item: WorkInboxFocusItem) => void;
  onPause?: (item: WorkInboxFocusItem) => void;
  onForward?: (item: WorkInboxFocusItem) => void;
  onComplete?: (item: WorkInboxFocusItem) => void;
  isPending?: (taskId: string, action: FocusPendingAction) => boolean;
  onIndexChange?: (index: number) => void;
  onSelectTaskByIndex?: (index: number) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onMoreMenuOpen?: () => void;
  onMoreMenuClose?: () => void;
  onMoreAction?: (code: WorkInboxActionCode) => void;
  moreMenuOpen?: boolean;
  focusProgress?: FocusProgressRuntime;
  opPermissions?: Record<WorkInboxOperationalOp, boolean>;
  attachDialogOpen?: boolean;
  onAttachDialogOpenChange?: (open: boolean) => void;
  operationalBundle?: TaskOperationalBundle | null;
  operator?: UserContext;
}

export function FocusTaskWorkspace({
  items,
  initialIndex = 0,
  runtimeTask,
  taskDetail = null,
  summaryText,
  onBackToInbox,
  onPrimary,
  onPause,
  onForward,
  onComplete,
  isPending,
  onIndexChange,
  onSelectTaskByIndex,
  onNavigatePrev,
  onNavigateNext,
  onMoreMenuOpen,
  onMoreMenuClose,
  onMoreAction,
  moreMenuOpen,
  focusProgress,
  opPermissions,
  attachDialogOpen,
  onAttachDialogOpenChange,
  operationalBundle,
  operator,
}: FocusTaskWorkspaceProps) {
  const [index, setIndex] = useState(() => clampFocusIndex(initialIndex, items.length));
  const caseWorkspaceOn = isCaseWorkspaceEnabled();
  const ocmsStripOn = isOcmsCaseStripEnabled() && !caseWorkspaceOn;

  useEffect(() => {
    setIndex((prev) => clampFocusIndex(prev, items.length));
  }, [items.length]);

  useEffect(() => {
    setIndex((prev) => {
      const next = clampFocusIndex(initialIndex, items.length);
      return prev === next ? prev : next;
    });
  }, [initialIndex, items.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => clampFocusIndex(i - 1, items.length));
  }, [items.length]);

  const goNext = useCallback(() => {
    setIndex((i) => clampFocusIndex(i + 1, items.length));
  }, [items.length]);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      const clamped = clampFocusIndex(nextIndex, items.length);
      setIndex(clamped);
      onIndexChange?.(clamped);
      onSelectTaskByIndex?.(clamped);
    },
    [items.length, onIndexChange, onSelectTaskByIndex],
  );

  const safeIndex = clampFocusIndex(index, items.length);
  const current = items.length > 0 ? items[safeIndex] : null;

  const runtimeUser = resolveRuntimeUser(operator);
  const checklistOperator =
    operator ??
    (runtimeUser
      ? {
          userId: runtimeUser.id,
          displayName: runtimeUser.displayName,
          role: (runtimeUser.role as import('@/api/contracts').UserRole) ?? 'STAFF',
          permissions: [],
        }
      : { userId: 'OPERATOR', displayName: 'Operator', role: 'STAFF', permissions: [] });

  const { items: checklistItems } = useWorkInboxChecklistRuntime({
    taskId: caseWorkspaceOn && current?.id ? current.id : '',
    operator: checklistOperator,
    canMutate: opPermissions?.NOTES !== false,
  });

  const { stripView, setCollapsed, readModel, runtimeReadModel } = useCaseReadModel({
    enabled: Boolean(current) && (caseWorkspaceOn || isOcmsCaseStripEnabled()),
    task: runtimeTask,
    taskDetail,
    focusItem: current ?? undefined,
    operationalBundle,
    operator,
    checklistItems: caseWorkspaceOn ? checklistItems : undefined,
  });

  if (!current) {
    return (
      <section
        className="work-inbox-focus-workspace work-inbox-focus-workspace--empty"
        data-cbv-panel="work-inbox-focus-workspace"
        aria-label="Focus Task Workspace"
      >
        <button type="button" className="work-inbox-focus-workspace__back text-xs" onClick={onBackToInbox}>
          ← Quay lại inbox
        </button>
        <p className="mt-4 text-sm text-operational-muted">Không có công việc để focus</p>
      </section>
    );
  }

  const assignee = current.assigneeName?.trim() || ASSIGNEE_FALLBACK;
  const nextItem = items.length > 1 ? items[clampFocusIndex(safeIndex + 1, items.length)] : null;
  const atStart = safeIndex <= 0;
  const atEnd = safeIndex >= items.length - 1;
  const { useThreeRegionFocusLayout } = useWorkInboxLayout();
  const showCenterNextTaskBlock = isCenterNextTaskBlockVisible();
  const stickyActionBar = isStickyBottomActionBarEnabled();
  const headerNextPreview =
    !showCenterNextTaskBlock && !atEnd && nextItem ? nextItem.title : null;

  const actionBar = (
    <FocusActionBar
      layout={stickyActionBar ? 'sticky-bottom' : 'inline'}
      rightPanelDetailVisible={useThreeRegionFocusLayout}
      item={current}
      runtimeTask={runtimeTask}
      onPrimary={onPrimary}
      onPause={opPermissions?.PAUSE !== false ? onPause : undefined}
      onForward={opPermissions?.HANDOFF !== false ? onForward : undefined}
      onComplete={opPermissions?.COMPLETE !== false ? onComplete : undefined}
      isPending={isPending}
      onMoreMenuOpen={onMoreMenuOpen}
      onMoreMenuClose={onMoreMenuClose}
      onMoreAction={onMoreAction}
      moreMenuOpen={moreMenuOpen}
    />
  );

  const workspaceClassName = [
    'work-inbox-focus-workspace',
    'work-inbox-focus-workspace--flat',
    'work-inbox-focus-workspace--density',
    'work-inbox-focus-workspace--focus-density',
    stickyActionBar ? 'work-inbox-focus-workspace--sticky-action-bar' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={workspaceClassName}
      data-cbv-panel="work-inbox-focus-workspace"
      data-cbv-center-next-task={showCenterNextTaskBlock ? 'visible' : 'hidden'}
      data-cbv-action-bar={stickyActionBar ? 'sticky-bottom' : 'inline'}
      aria-label="Focus Task Workspace"
    >
      <FocusHeader
        onBackToInbox={onBackToInbox}
        progressLabel={focusProgress?.label ?? `${safeIndex + 1} / ${items.length}`}
        currentPosition={safeIndex + 1}
        queueTotal={items.length}
        progressSubLabel={focusProgress?.subLabel}
        progressPercent={focusProgress?.percent}
        atStart={atStart}
        atEnd={atEnd}
        onPrev={goPrev}
        onNext={goNext}
        onNavigatePrev={onNavigatePrev}
        onNavigateNext={onNavigateNext}
        nextTaskPreview={headerNextPreview}
      />

      {stickyActionBar ? (
        <div className="work-inbox-focus-workspace__scroll-body">
          {caseWorkspaceOn ? (
            <CaseWorkspace
              item={current}
              runtimeReadModel={runtimeReadModel}
              stripView={stripView}
              summaryText={summaryText}
              operator={operator}
              opPermissions={opPermissions}
              attachDialogOpen={attachDialogOpen}
              onAttachDialogOpenChange={onAttachDialogOpenChange}
              onStripCollapse={() => setCollapsed(true)}
              discoveryOutcome={readModel?.diagnostics.discoveryOutcome}
            />
          ) : (
            <>
              <CompactTaskHeader
                item={current}
                assignee={assignee}
                dueLabel={current.dueLabel?.trim() || 'Chưa có hạn'}
                runtimeTask={runtimeTask}
                taskDetail={taskDetail}
                aiSummaryText={summaryText}
              />

              {ocmsStripOn && stripView ? (
                <WorkInboxCaseContextStrip
                  view={stripView}
                  discoveryOutcome={readModel?.diagnostics.discoveryOutcome}
                  onCollapse={() => setCollapsed(true)}
                />
              ) : null}

              <FocusContentCards
                item={current}
                summaryText={summaryText}
                operator={operator}
                opPermissions={opPermissions}
                attachDialogOpen={attachDialogOpen}
                onAttachDialogOpenChange={onAttachDialogOpenChange}
              />
            </>
          )}

          {showCenterNextTaskBlock ? (
            <NextTaskCard
              nextItem={atEnd ? null : nextItem}
              progressLabel={nextItem ? `${nextItem.progressIndex} / ${nextItem.progressTotal}` : undefined}
              onGoNext={() => (onNavigateNext ? onNavigateNext() : goToIndex(safeIndex + 1))}
            />
          ) : null}
        </div>
      ) : (
        <>
          {caseWorkspaceOn ? (
            <CaseWorkspace
              item={current}
              runtimeReadModel={runtimeReadModel}
              stripView={stripView}
              summaryText={summaryText}
              operator={operator}
              opPermissions={opPermissions}
              attachDialogOpen={attachDialogOpen}
              onAttachDialogOpenChange={onAttachDialogOpenChange}
              onStripCollapse={() => setCollapsed(true)}
              discoveryOutcome={readModel?.diagnostics.discoveryOutcome}
            />
          ) : (
            <>
              <CompactTaskHeader
                item={current}
                assignee={assignee}
                dueLabel={current.dueLabel?.trim() || 'Chưa có hạn'}
                runtimeTask={runtimeTask}
                taskDetail={taskDetail}
                aiSummaryText={summaryText}
              />

              {ocmsStripOn && stripView ? (
                <WorkInboxCaseContextStrip
                  view={stripView}
                  discoveryOutcome={readModel?.diagnostics.discoveryOutcome}
                  onCollapse={() => setCollapsed(true)}
                />
              ) : null}

              <FocusContentCards
                item={current}
                summaryText={summaryText}
                operator={operator}
                opPermissions={opPermissions}
                attachDialogOpen={attachDialogOpen}
                onAttachDialogOpenChange={onAttachDialogOpenChange}
              />
            </>
          )}

          {actionBar}

          {showCenterNextTaskBlock ? (
            <NextTaskCard
              nextItem={atEnd ? null : nextItem}
              progressLabel={nextItem ? `${nextItem.progressIndex} / ${nextItem.progressTotal}` : undefined}
              onGoNext={() => (onNavigateNext ? onNavigateNext() : goToIndex(safeIndex + 1))}
            />
          ) : null}
        </>
      )}

      {stickyActionBar ? actionBar : null}
    </section>
  );
}
