import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { WorkInboxStatusChip } from './WorkInboxStatusChip';

const ASSIGNEE_FALLBACK = 'Chưa gán';
const DUE_FALLBACK = 'Chưa có hạn';

interface WorkInboxFocusPanelProps {
  items: WorkInboxFocusItem[];
  focusIndex: number;
  onFocusIndexChange: (index: number) => void;
  onOpenDetail: (item: WorkInboxFocusItem) => void;
  onStartFullFocus?: () => void;
}

export function WorkInboxFocusPanel({
  items,
  focusIndex,
  onFocusIndexChange,
  onOpenDetail,
  onStartFullFocus,
}: WorkInboxFocusPanelProps) {
  const current = items.length > 0 ? items[Math.min(focusIndex, items.length - 1)] : null;

  const goNext = () => {
    if (items.length === 0) return;
    onFocusIndexChange((focusIndex + 1) % items.length);
  };

  return (
    <aside
      className="work-inbox-focus-panel work-inbox-focus-panel--compact flex flex-col justify-start rounded-lg border border-border/70 bg-surface-content shadow-sm"
      aria-label="Ngữ cảnh Focus"
      data-cbv-panel="work-inbox-focus-preview"
    >
      <div className="work-inbox-focus-panel__header flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-operational-text">🎯 Focus</h3>
        {current && (
          <span className="text-[11px] font-semibold tabular-nums text-operational-secondary">
            {current.progressIndex} / {current.progressTotal}
          </span>
        )}
      </div>

      {!current ? (
        <p className="work-inbox-focus-panel__empty py-3 text-center text-xs text-operational-muted">
          Chọn việc để bắt đầu Focus
        </p>
      ) : (
        <div className="work-inbox-focus-panel__body flex flex-col">
          <p
            className="work-inbox-focus-panel__title line-clamp-2 text-sm font-semibold leading-snug text-operational-text"
            title={current.title}
          >
            {current.title}
          </p>

          <div className="work-inbox-focus-panel__meta">
            <WorkInboxStatusChip status={current.status} />
            <p className="work-inbox-focus-panel__people text-xs text-operational-secondary">
              <span aria-hidden>👤 </span>
              <span className="truncate">
                {current.assigneeName?.trim() || ASSIGNEE_FALLBACK}
                {' · '}
                {current.dueLabel?.trim() || DUE_FALLBACK}
              </span>
            </p>
          </div>

          <div className="work-inbox-focus-panel__actions">
            <button
              type="button"
              className="work-inbox-primary-action w-full rounded-md border border-border bg-surface-raised px-2 py-1.5 text-xs font-semibold text-operational-text hover:bg-surface-overlay"
              onClick={() => onOpenDetail(current)}
            >
              Mở xử lý
            </button>
            <div className="work-inbox-focus-panel__actions-row flex flex-wrap gap-1.5">
              <button type="button" className="btn-secondary flex-1 min-w-0 text-xs py-1" onClick={goNext}>
                Việc tiếp
              </button>
              {onStartFullFocus && (
                <button
                  type="button"
                  className="btn-secondary flex-1 min-w-0 text-xs py-1"
                  onClick={onStartFullFocus}
                >
                  Mở Focus toàn màn
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
