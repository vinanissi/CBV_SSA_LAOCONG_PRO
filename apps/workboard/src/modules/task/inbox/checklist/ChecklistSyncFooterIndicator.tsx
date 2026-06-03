import type { ChecklistSyncFooterPayload } from '@/runtime/ChecklistSyncFooterContext';
import {
  checklistSyncIsHealthy,
  checklistSyncNeedsAttention,
  checklistSyncStatusLabel,
  formatChecklistSyncTime,
} from './checklistSyncDisplayUtils';

export function ChecklistSyncFooterIndicator({
  bridgeOn,
  syncState,
  busy = false,
  message,
  onRefresh,
}: ChecklistSyncFooterPayload) {
  if (!bridgeOn) {
    return (
      <span
        className="runtime-checklist-sync runtime-checklist-sync--off"
        role="status"
        title="Checklist Sheet bridge tắt"
      >
        Checklist sync: tắt
      </span>
    );
  }

  const healthy = checklistSyncIsHealthy(syncState, busy);
  const needsAction = checklistSyncNeedsAttention(syncState, busy);
  const timeLabel = formatChecklistSyncTime(syncState.lastSyncedAt);
  const label = busy || syncState.syncStatus === 'refreshing'
    ? 'Đang đồng bộ'
    : checklistSyncStatusLabel(syncState.syncStatus);

  if (healthy) {
    return (
      <span
        className="runtime-checklist-sync runtime-checklist-sync--ok"
        role="status"
        data-cbv-checklist-sync-footer="ok"
        title={syncState.lastSyncedAt ? `Đã đồng bộ ${timeLabel}` : undefined}
      >
        <span className="runtime-checklist-sync__dot" aria-hidden>
          🟢
        </span>
        <span className="runtime-checklist-sync__label">{label}</span>
        {timeLabel !== '—' ? <span className="runtime-checklist-sync__time">{timeLabel}</span> : null}
      </span>
    );
  }

  const icon =
    busy || syncState.syncStatus === 'refreshing'
      ? '🔄'
      : syncState.syncStatus === 'error' || syncState.syncStatus === 'conflict'
        ? '🔴'
        : '🟡';

  return (
    <span
      className={
        syncState.syncStatus === 'error' || syncState.syncStatus === 'conflict'
          ? 'runtime-checklist-sync runtime-checklist-sync--error'
          : 'runtime-checklist-sync runtime-checklist-sync--warn'
      }
      role="status"
      data-cbv-checklist-sync-footer={needsAction ? 'attention' : 'idle'}
      aria-live="polite"
    >
      <span className="runtime-checklist-sync__dot" aria-hidden>
        {icon}
      </span>
      <span className="runtime-checklist-sync__label">{label}</span>
      {timeLabel !== '—' ? (
        <span className="runtime-checklist-sync__time" title="Lần đồng bộ gần nhất">
          {timeLabel}
        </span>
      ) : null}
      {onRefresh ? (
        <button
          type="button"
          className="runtime-checklist-sync__action"
          disabled={busy || syncState.syncStatus === 'refreshing'}
          onClick={() => onRefresh()}
        >
          {busy || syncState.syncStatus === 'refreshing' ? 'Đang đồng bộ…' : 'Thử lại'}
        </button>
      ) : null}
      {syncState.conflictMessage ? (
        <span className="runtime-checklist-sync__detail" role="alert" title={syncState.conflictMessage}>
          {syncState.conflictMessage}
        </span>
      ) : null}
      {message ? (
        <span className="runtime-checklist-sync__detail" title={message}>
          {message}
        </span>
      ) : null}
    </span>
  );
}
