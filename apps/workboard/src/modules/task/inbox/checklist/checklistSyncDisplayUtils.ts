import type { ChecklistSyncState } from './checklistMultiUserSyncTypes';

export function formatChecklistSyncTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '—';
  }
}

export function checklistSyncStatusLabel(status: ChecklistSyncState['syncStatus']): string {
  switch (status) {
    case 'refreshing':
      return 'Đang đồng bộ';
    case 'synced':
      return 'Sync OK';
    case 'stale':
      return 'Chưa đồng bộ';
    case 'conflict':
      return 'Lỗi đồng bộ';
    case 'error':
      return 'Lỗi đồng bộ';
    default:
      return 'Chưa đồng bộ';
  }
}

export function checklistSyncIsHealthy(state: ChecklistSyncState, busy: boolean): boolean {
  if (busy || state.syncStatus === 'refreshing') return false;
  if (state.conflictMessage) return false;
  return state.syncStatus === 'synced';
}

export function checklistSyncNeedsAttention(state: ChecklistSyncState, busy: boolean): boolean {
  if (busy || state.syncStatus === 'refreshing') return true;
  if (state.conflictMessage) return true;
  return ['stale', 'conflict', 'error', 'idle'].includes(state.syncStatus);
}
