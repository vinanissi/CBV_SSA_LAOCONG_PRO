import type { TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { focusPrimaryLabel } from '@/modules/task/useFocusTaskActions';
import { showFocusRuntimeFeedback } from './focusRuntimeFeedback';
import type { FocusPendingAction } from '@/modules/task/inbox/actionRuntime/useWorkInboxActionRuntime';
import type { WorkInboxActionCode } from '@/modules/task/inbox/actionRuntime/workInboxActionTypes';

const MORE_ACTIONS: { code: WorkInboxActionCode; label: string }[] = [
  { code: 'ACTION_MORE_COPY_LINK', label: 'Sao chép link' },
  { code: 'ACTION_MORE_PRIORITY', label: 'Đánh dấu ưu tiên' },
  { code: 'ACTION_MORE_ATTACH', label: 'Đính kèm tài liệu' },
  { code: 'ACTION_MORE_SUBTASK', label: 'Tạo việc con' },
  { code: 'ACTION_MORE_EXPORT', label: 'Xuất báo cáo' },
];

interface FocusActionBarProps {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  onPrimary: (item: WorkInboxFocusItem) => void;
  onPause?: (item: WorkInboxFocusItem) => void;
  onForward?: (item: WorkInboxFocusItem) => void;
  onComplete?: (item: WorkInboxFocusItem) => void;
  isPending?: (taskId: string, action: FocusPendingAction) => boolean;
  onMoreMenuOpen?: () => void;
  onMoreAction?: (code: WorkInboxActionCode) => void;
  moreMenuOpen?: boolean;
}

export function FocusActionBar({
  item,
  runtimeTask,
  onPrimary,
  onPause,
  onForward,
  onComplete,
  isPending,
  onMoreMenuOpen,
  onMoreAction,
  moreMenuOpen,
}: FocusActionBarProps) {
  const primaryLabel = focusPrimaryLabel(runtimeTask);
  const pendingPrimary = isPending?.(item.id, 'primary') ?? false;
  const pendingPause = isPending?.(item.id, 'pause') ?? false;
  const pendingForward = isPending?.(item.id, 'forward') ?? false;
  const pendingComplete = isPending?.(item.id, 'complete') ?? false;

  const handleSecondary = (
    handler: ((i: WorkInboxFocusItem) => void) | undefined,
    enabled: boolean,
    missingTitle: string,
  ) => {
    if (!enabled) return;
    if (handler) {
      handler(item);
      return;
    }
    showFocusRuntimeFeedback(missingTitle);
  };

  return (
    <div className="work-inbox-focus-action-bar work-inbox-focus-action-bar--inline" data-cbv-panel="work-inbox-focus-action-bar">
      <button
        type="button"
        className="work-inbox-focus-action-bar__primary"
        disabled={pendingPrimary}
        onClick={() => onPrimary(item)}
      >
        {pendingPrimary ? 'Đang xử lý…' : `▶ ${primaryLabel}`}
      </button>
      <div className="work-inbox-focus-action-bar__secondary">
        <button
          type="button"
          className="work-inbox-focus-action-bar__secondary-btn"
          disabled={!item.canPause || !onPause || pendingPause}
          title={item.canPause ? 'Tạm dừng' : 'Không áp dụng'}
          onClick={() => handleSecondary(onPause, item.canPause, 'Tạm dừng chưa khả dụng')}
        >
          {pendingPause ? 'Đang tạm dừng…' : '⏸ Tạm dừng'}
        </button>
        <button
          type="button"
          className="work-inbox-focus-action-bar__secondary-btn"
          disabled={!item.canForward || !onForward || pendingForward}
          title={item.canForward ? 'Chuyển giao' : 'Không áp dụng'}
          onClick={() => handleSecondary(onForward, item.canForward, 'Chuyển giao chưa khả dụng')}
        >
          {pendingForward ? 'Đang chuyển…' : '⇄ Chuyển giao'}
        </button>
        {onComplete && (
          <button
            type="button"
            className="work-inbox-focus-action-bar__secondary-btn"
            disabled={!item.canComplete || pendingComplete}
            onClick={() => handleSecondary(onComplete, item.canComplete, 'Hoàn thành chưa khả dụng')}
          >
            {pendingComplete ? 'Đang hoàn tất…' : '✓ Hoàn thành'}
          </button>
        )}
        <div className="relative">
          <button
            type="button"
            className="work-inbox-focus-action-bar__secondary-btn"
            onClick={() => (onMoreMenuOpen ? onMoreMenuOpen() : showFocusRuntimeFeedback())}
          >
            ⋯ Thao tác khác
          </button>
          {moreMenuOpen && onMoreAction && (
            <ul className="work-inbox-more-menu" role="menu">
              {MORE_ACTIONS.map((a) => (
                <li key={a.code} role="none">
                  <button type="button" role="menuitem" className="work-inbox-more-menu__item" onClick={() => onMoreAction(a.code)}>
                    {a.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export const TaskActionBar = FocusActionBar;
