import {
  checklistSyncStatusLabel,
  formatChecklistSyncTime,
} from './checklistSyncDisplayUtils';
import type { ChecklistSyncState } from './checklistMultiUserSyncTypes';

export interface ChecklistSyncStatusBarProps {
  syncState: ChecklistSyncState;
  bridgeOn: boolean;
  busy?: boolean;
  message?: string | null;
  onRefresh?: () => void;
  /** @deprecated Center placement removed — use footer runtime (PHASE_CHECKLIST_SYNC_STATUS_FOOTER_RUNTIME). */
  placement?: 'center' | 'footer';
}

/**
 * Legacy center sync bar — retained for tests/contracts; not mounted in operator CENTER.
 */
export function ChecklistSyncStatusBar({
  syncState,
  bridgeOn,
  busy = false,
  message,
  onRefresh,
  placement = 'center',
}: ChecklistSyncStatusBarProps) {
  if (placement === 'footer') {
    return null;
  }

  if (!bridgeOn) {
    return (
      <div className="work-inbox-checklist-sync work-inbox-checklist-sync--off" role="status">
        <span>Đồng bộ Sheet: tắt (bật bridge để dùng)</span>
      </div>
    );
  }

  const warn = syncState.syncStatus === 'stale' || syncState.syncStatus === 'conflict';

  return (
    <div
      className={
        warn
          ? 'work-inbox-checklist-sync work-inbox-checklist-sync--warn'
          : 'work-inbox-checklist-sync'
      }
      role="status"
      aria-live="polite"
      data-cbv-checklist-sync-placement="center"
    >
      <div className="work-inbox-checklist-sync__row">
        <button
          type="button"
          className="work-inbox-checklist-sync__btn"
          disabled={busy || syncState.syncStatus === 'refreshing'}
          onClick={() => onRefresh?.()}
        >
          {busy || syncState.syncStatus === 'refreshing' ? 'Đang đồng bộ…' : 'Đồng bộ'}
        </button>
        <span className="work-inbox-checklist-sync__meta">
          Đã đồng bộ: {formatChecklistSyncTime(syncState.lastSyncedAt)}
        </span>
        <span className="work-inbox-checklist-sync__status">
          Trạng thái: {checklistSyncStatusLabel(syncState.syncStatus)}
        </span>
      </div>
      {syncState.conflictMessage ? (
        <p className="work-inbox-checklist-sync__conflict" role="alert">
          {syncState.conflictMessage}
        </p>
      ) : null}
      {message ? <p className="work-inbox-checklist-sync__message">{message}</p> : null}
    </div>
  );
}
