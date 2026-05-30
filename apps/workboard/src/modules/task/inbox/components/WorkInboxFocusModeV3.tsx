import { useCallback, useEffect, useState } from 'react';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { clampFocusIndex } from '@/modules/task/inbox/focusModeModels';
import type { FocusPendingAction } from '@/modules/task/useFocusTaskActions';
import { WorkInboxStatusChip } from './WorkInboxStatusChip';

const ASSIGNEE_FALLBACK = 'Chưa gán';

interface WorkInboxFocusModeV3Props {
  items: WorkInboxFocusItem[];
  initialIndex?: number;
  onExit: () => void;
  onOpenDetail?: (item: WorkInboxFocusItem) => void;
  onComplete?: (item: WorkInboxFocusItem) => void;
  onForward?: (item: WorkInboxFocusItem) => void;
  onPause?: (item: WorkInboxFocusItem) => void;
  isPending?: (taskId: string, action: FocusPendingAction) => boolean;
}

export function WorkInboxFocusModeV3({
  items,
  initialIndex = 0,
  onExit,
  onOpenDetail,
  onComplete,
  onForward,
  onPause,
  isPending,
}: WorkInboxFocusModeV3Props) {
  const [index, setIndex] = useState(() => clampFocusIndex(initialIndex, items.length));

  useEffect(() => {
    setIndex((prev) => clampFocusIndex(prev, items.length));
  }, [items.length]);

  const safeIndex = clampFocusIndex(index, items.length);
  const current = items.length > 0 ? items[safeIndex] : null;

  const goPrev = useCallback(() => {
    setIndex((i) => clampFocusIndex(i - 1, items.length));
  }, [items.length]);

  const goNext = useCallback(() => {
    setIndex((i) => clampFocusIndex(i + 1, items.length));
  }, [items.length]);

  if (!current) {
    return (
      <section
        className="work-inbox-focus-v3 rounded-lg border border-border/70 bg-surface-raised/60 p-6 text-center"
        aria-label="Focus Mode V3"
        data-cbv-panel="work-inbox-focus-v3"
      >
        <p className="text-sm text-operational-muted">Không có công việc để focus</p>
        <button type="button" className="btn-secondary mt-4 text-xs" onClick={onExit}>
          Thoát Focus
        </button>
      </section>
    );
  }

  const assignee = current.assigneeName?.trim() || ASSIGNEE_FALLBACK;
  const progressLabel = `${current.progressIndex} / ${current.progressTotal}`;
  const atStart = safeIndex <= 0;
  const atEnd = safeIndex >= items.length - 1;
  const completeBusy = isPending?.(current.id, 'complete') ?? false;
  const forwardBusy = isPending?.(current.id, 'forward') ?? false;
  const pauseBusy = isPending?.(current.id, 'pause') ?? false;

  return (
    <section
      className="work-inbox-focus-v3 rounded-lg border-2 border-border/80 bg-surface-content shadow-md"
      aria-label="Focus Mode V3"
      data-cbv-panel="work-inbox-focus-v3"
    >
      <header className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <h2 className="text-sm font-semibold text-operational-text">Focus Mode</h2>
        <span className="rounded-full bg-surface-overlay px-2.5 py-0.5 text-xs font-semibold tabular-nums text-operational-secondary">
          {progressLabel}
        </span>
      </header>

      <div className="work-inbox-focus-v3__body space-y-3 p-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-operational-text">{current.title}</h3>
          {current.code && current.code !== current.id && (
            <p className="mt-0.5 text-xs text-operational-muted">{current.code}</p>
          )}
        </div>

        <WorkInboxStatusChip status={current.status} />

        <p className="flex items-center gap-1.5 text-sm text-operational-secondary">
          <span aria-hidden>👤</span>
          <span>{assignee}</span>
        </p>

        {current.dueLabel && (
          <p className="text-sm text-operational-muted">{current.dueLabel}</p>
        )}

        <div className="work-inbox-focus-v3__primary pt-1">
          <button
            type="button"
            className="work-inbox-primary-action w-full rounded-md border border-border bg-surface-raised px-4 py-2 text-sm font-semibold text-operational-text hover:bg-surface-overlay"
            onClick={() => onOpenDetail?.(current)}
          >
            {current.primaryActionLabel || 'Mở chi tiết'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary flex-1 min-w-[7rem] text-xs"
            disabled={!current.canComplete || !onComplete || completeBusy}
            title={
              !onComplete
                ? 'Hoàn thành chưa khả dụng'
                : current.canComplete
                  ? 'Hoàn tất việc qua runtime TASK_MAIN'
                  : 'Đã hoàn thành'
            }
            onClick={() => onComplete?.(current)}
          >
            {completeBusy ? 'Đang hoàn tất…' : 'Hoàn thành'}
          </button>
          <button
            type="button"
            className="btn-secondary flex-1 min-w-[7rem] text-xs"
            disabled={!current.canForward || !onForward || forwardBusy}
            title={
              !onForward
                ? 'Chuyển tiếp chưa khả dụng'
                : current.canForward
                  ? 'Chuyển xử lý — WAITING (chưa đổi OWNER nếu không assign)'
                  : 'Không áp dụng'
            }
            onClick={() => onForward?.(current)}
          >
            {forwardBusy ? 'Đang chuyển…' : 'Chuyển tiếp'}
          </button>
          <button
            type="button"
            className="btn-secondary flex-1 min-w-[7rem] text-xs"
            disabled={!current.canPause || !onPause || pauseBusy}
            title={
              !onPause
                ? 'Tạm dừng chưa khả dụng'
                : current.canPause
                  ? 'Tạm dừng — WAITING'
                  : 'Không áp dụng'
            }
            onClick={() => onPause?.(current)}
          >
            {pauseBusy ? 'Đang tạm dừng…' : 'Tạm dừng'}
          </button>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 px-4 py-3">
        <div className="flex gap-2">
          <button type="button" className="btn-secondary text-xs" disabled={atStart} onClick={goPrev}>
            Việc trước
          </button>
          <button type="button" className="btn-secondary text-xs" disabled={atEnd} onClick={goNext}>
            Việc tiếp
          </button>
        </div>
        <button type="button" className="btn-secondary text-xs font-medium" onClick={onExit}>
          Thoát Focus
        </button>
      </footer>
    </section>
  );
}
