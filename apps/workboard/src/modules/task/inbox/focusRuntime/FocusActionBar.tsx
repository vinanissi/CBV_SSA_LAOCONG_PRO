import type { TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { focusPrimaryLabel } from '@/modules/task/useFocusTaskActions';
import { isReducedPrimaryActionBarEnabled } from './focusActionBarReducedPrimaryConfig';
import { showFocusRuntimeFeedback } from './focusRuntimeFeedback';
import { useWorkInboxMoreMenuDismiss } from './useWorkInboxMoreMenuDismiss';
import type { FocusPendingAction } from '@/modules/task/inbox/actionRuntime/useWorkInboxActionRuntime';
import type { WorkInboxActionCode } from '@/modules/task/inbox/actionRuntime/workInboxActionTypes';

const MORE_ACTIONS: { code: WorkInboxActionCode; label: string }[] = [
  { code: 'ACTION_MORE_COPY_LINK', label: 'Sao chép link' },
  { code: 'ACTION_MORE_PRIORITY', label: 'Đánh dấu ưu tiên' },
  { code: 'ACTION_MORE_ATTACH', label: 'Đính kèm tài liệu' },
  { code: 'ACTION_MORE_SUBTASK', label: 'Tạo việc con' },
  { code: 'ACTION_MORE_EXPORT', label: 'Xuất báo cáo' },
];

export type FocusActionBarLayout = 'inline' | 'sticky-bottom';

interface FocusActionBarProps {
  layout?: FocusActionBarLayout;
  /** Right panel detail tab region visible (three-region focus layout). */
  rightPanelDetailVisible?: boolean;
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  onPrimary: (item: WorkInboxFocusItem) => void;
  onPause?: (item: WorkInboxFocusItem) => void;
  onForward?: (item: WorkInboxFocusItem) => void;
  onComplete?: (item: WorkInboxFocusItem) => void;
  isPending?: (taskId: string, action: FocusPendingAction) => boolean;
  onMoreMenuOpen?: () => void;
  onMoreMenuClose?: () => void;
  onMoreAction?: (code: WorkInboxActionCode) => void;
  moreMenuOpen?: boolean;
}

export function FocusActionBar({
  layout = 'inline',
  rightPanelDetailVisible = false,
  item,
  runtimeTask,
  onPrimary,
  onPause,
  onForward,
  onComplete,
  isPending,
  onMoreMenuOpen,
  onMoreMenuClose,
  onMoreAction,
  moreMenuOpen = false,
}: FocusActionBarProps) {
  const { anchorRef: moreMenuTriggerRef, menuRef: moreMenuRef, closeMenu } = useWorkInboxMoreMenuDismiss({
    open: moreMenuOpen,
    onClose: () => onMoreMenuClose?.(),
  });

  const sticky = layout === 'sticky-bottom';
  const reducedPrimary = sticky && isReducedPrimaryActionBarEnabled();
  const primaryLabel = focusPrimaryLabel(runtimeTask);
  const pendingPrimary = isPending?.(item.id, 'primary') ?? false;
  const pendingPause = isPending?.(item.id, 'pause') ?? false;
  const pendingForward = isPending?.(item.id, 'forward') ?? false;
  const pendingComplete = isPending?.(item.id, 'complete') ?? false;

  const showPrimaryInBar = !reducedPrimary || (reducedPrimary && !rightPanelDetailVisible);
  const showOpenDetailInMore = reducedPrimary && rightPanelDetailVisible;

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

  const barClass = [
    'work-inbox-focus-action-bar',
    sticky ? 'work-inbox-focus-action-bar--sticky-bottom' : 'work-inbox-focus-action-bar--inline',
    reducedPrimary ? 'work-inbox-focus-action-bar--reduced-primary' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={barClass}
      data-cbv-panel="work-inbox-focus-action-bar"
      data-cbv-action-bar-layout={layout}
      data-cbv-reduced-primary={reducedPrimary ? 'true' : 'false'}
      role="toolbar"
      aria-label="Thao tác việc"
    >
      {showPrimaryInBar ? (
        <button
          type="button"
          className="work-inbox-focus-action-bar__primary"
          disabled={pendingPrimary}
          onClick={() => onPrimary(item)}
        >
          {pendingPrimary ? 'Đang xử lý…' : sticky ? primaryLabel : `▶ ${primaryLabel}`}
        </button>
      ) : null}

      <div
        className={
          reducedPrimary
            ? 'work-inbox-focus-action-bar__secondary work-inbox-focus-action-bar__secondary--reduced'
            : 'work-inbox-focus-action-bar__secondary'
        }
      >
        {reducedPrimary && !rightPanelDetailVisible ? (
          <button
            type="button"
            className="work-inbox-focus-action-bar__secondary-btn"
            disabled={pendingPrimary}
            onClick={() => onPrimary(item)}
          >
            {pendingPrimary ? 'Đang xử lý…' : primaryLabel}
          </button>
        ) : null}

        <button
          type="button"
          className="work-inbox-focus-action-bar__secondary-btn"
          disabled={!item.canPause || !onPause || pendingPause}
          title={item.canPause ? 'Tạm dừng' : 'Không áp dụng'}
          onClick={() => handleSecondary(onPause, item.canPause, 'Tạm dừng chưa khả dụng')}
        >
          {pendingPause ? 'Đang tạm dừng…' : sticky || reducedPrimary ? 'Tạm dừng' : '⏸ Tạm dừng'}
        </button>
        <button
          type="button"
          className="work-inbox-focus-action-bar__secondary-btn"
          disabled={!item.canForward || !onForward || pendingForward}
          title={item.canForward ? 'Chuyển giao' : 'Không áp dụng'}
          onClick={() => handleSecondary(onForward, item.canForward, 'Chuyển giao chưa khả dụng')}
        >
          {pendingForward ? 'Đang chuyển…' : sticky || reducedPrimary ? 'Chuyển giao' : '⇄ Chuyển giao'}
        </button>
        {onComplete && (
          <button
            type="button"
            className={
              reducedPrimary
                ? 'work-inbox-focus-action-bar__secondary-btn work-inbox-focus-action-bar__complete-btn'
                : 'work-inbox-focus-action-bar__secondary-btn'
            }
            disabled={!item.canComplete || pendingComplete}
            onClick={() => handleSecondary(onComplete, item.canComplete, 'Hoàn thành chưa khả dụng')}
          >
            {pendingComplete ? 'Đang hoàn tất…' : sticky || reducedPrimary ? 'Hoàn thành' : '✓ Hoàn thành'}
          </button>
        )}
        <div className="work-inbox-focus-action-bar__more-menu-anchor relative">
          <button
            ref={moreMenuTriggerRef}
            type="button"
            className="work-inbox-focus-action-bar__secondary-btn"
            aria-expanded={moreMenuOpen ? true : undefined}
            aria-haspopup="menu"
            onClick={() => {
              if (!onMoreMenuOpen && !onMoreMenuClose) {
                showFocusRuntimeFeedback();
                return;
              }
              if (moreMenuOpen) closeMenu(true);
              else onMoreMenuOpen?.();
            }}
          >
            {sticky || reducedPrimary ? 'Thao tác khác' : '⋯ Thao tác khác'}
          </button>
          {moreMenuOpen && (
            <ul
              ref={moreMenuRef}
              className={
                sticky
                  ? 'work-inbox-more-menu work-inbox-more-menu--drop-up'
                  : 'work-inbox-more-menu'
              }
              role="menu"
              data-cbv-more-menu="true"
              data-cbv-more-menu-placement={sticky ? 'drop-up' : 'drop-down'}
            >
              {showOpenDetailInMore ? (
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="work-inbox-more-menu__item"
                    disabled={pendingPrimary}
                    onClick={() => {
                      onPrimary(item);
                      closeMenu(false);
                    }}
                  >
                    {pendingPrimary ? 'Đang xử lý…' : primaryLabel}
                  </button>
                </li>
              ) : null}
              {onMoreAction
                ? MORE_ACTIONS.map((a) => (
                    <li key={a.code} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="work-inbox-more-menu__item"
                        onClick={() => {
                          onMoreAction(a.code);
                        }}
                      >
                        {a.label}
                      </button>
                    </li>
                  ))
                : null}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export const TaskActionBar = FocusActionBar;
