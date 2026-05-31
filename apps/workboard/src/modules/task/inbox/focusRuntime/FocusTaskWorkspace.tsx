import { useCallback, useEffect, useState } from 'react';
import type { TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { clampFocusIndex } from '@/modules/task/inbox/focusModeModels';
import { CompactTaskHeader } from './CompactTaskHeader';
import { FocusHeader } from './FocusHeader';
import { FocusContentCards } from './FocusContentCards';
import { FocusActionBar } from './FocusActionBar';
import { NextTaskCard } from './NextTaskCard';
import type { FocusPendingAction } from '@/modules/task/inbox/actionRuntime/useWorkInboxActionRuntime';
import type { WorkInboxActionCode } from '@/modules/task/inbox/actionRuntime/workInboxActionTypes';
import type { FocusProgressRuntime } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';
import type { WorkInboxOperationalOp } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalPermissions';

const ASSIGNEE_FALLBACK = 'Chưa gán';

interface FocusTaskWorkspaceProps {
  items: WorkInboxFocusItem[];
  initialIndex?: number;
  runtimeTask?: TaskItem;
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
  onMoreAction?: (code: WorkInboxActionCode) => void;
  moreMenuOpen?: boolean;
  focusProgress?: FocusProgressRuntime;
  opPermissions?: Record<WorkInboxOperationalOp, boolean>;
  attachDialogOpen?: boolean;
  onAttachDialogOpenChange?: (open: boolean) => void;
}

export function FocusTaskWorkspace({
  items,
  initialIndex = 0,
  runtimeTask,
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
  onMoreAction,
  moreMenuOpen,
  focusProgress,
  opPermissions,
  attachDialogOpen,
  onAttachDialogOpenChange,
}: FocusTaskWorkspaceProps) {
  const [index, setIndex] = useState(() => clampFocusIndex(initialIndex, items.length));

  useEffect(() => {
    setIndex((prev) => clampFocusIndex(prev, items.length));
  }, [items.length]);

  useEffect(() => {
    setIndex((prev) => {
      const next = clampFocusIndex(initialIndex, items.length);
      return prev === next ? prev : next;
    });
  }, [initialIndex, items.length]);

  const safeIndex = clampFocusIndex(index, items.length);
  const current = items.length > 0 ? items[safeIndex] : null;
  const nextItem = items.length > 1 ? items[clampFocusIndex(safeIndex + 1, items.length)] : null;
  const atStart = safeIndex <= 0;
  const atEnd = safeIndex >= items.length - 1;

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

  return (
    <section
      className="work-inbox-focus-workspace work-inbox-focus-workspace--flat work-inbox-focus-workspace--density work-inbox-focus-workspace--focus-density"
      data-cbv-panel="work-inbox-focus-workspace"
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
      />

      <CompactTaskHeader
        item={current}
        assignee={assignee}
        dueLabel={current.dueLabel?.trim() || 'Chưa có hạn'}
      />

      <FocusContentCards
        item={current}
        summaryText={summaryText}
        opPermissions={opPermissions}
        attachDialogOpen={attachDialogOpen}
        onAttachDialogOpenChange={onAttachDialogOpenChange}
      />

      <FocusActionBar
        item={current}
        runtimeTask={runtimeTask}
        onPrimary={onPrimary}
        onPause={opPermissions?.PAUSE !== false ? onPause : undefined}
        onForward={opPermissions?.HANDOFF !== false ? onForward : undefined}
        onComplete={opPermissions?.COMPLETE !== false ? onComplete : undefined}
        isPending={isPending}
        onMoreMenuOpen={onMoreMenuOpen}
        onMoreAction={onMoreAction}
        moreMenuOpen={moreMenuOpen}
      />

      <NextTaskCard
        nextItem={atEnd ? null : nextItem}
        progressLabel={nextItem ? `${nextItem.progressIndex} / ${nextItem.progressTotal}` : undefined}
        onGoNext={() => (onNavigateNext ? onNavigateNext() : goToIndex(safeIndex + 1))}
      />
    </section>
  );
}
