/**
 * PHASE_CHECKLIST_05_HISTORY — display helpers.
 */

import type { ChecklistHistoryEntryType } from './checklistHistoryTypes';

export function formatChecklistHistoryTime(iso: string | null | undefined): string {
  if (!iso?.trim()) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export function checklistHistoryTypeLabel(type: ChecklistHistoryEntryType): string {
  const t = (type || '').trim().toLowerCase();
  if (t === 'feedback_added') return 'Phản hồi';
  if (t === 'attachment_added') return 'Tài liệu';
  if (t === 'attachment_removed') return 'Gỡ tài liệu';
  if (t === 'link_added') return 'Liên kết';
  if (t === 'link_removed') return 'Gỡ liên kết';
  if (t === 'checklist_status_changed') return 'Trạng thái';
  if (t === 'manual_history_note_added') return 'Ghi chú';
  if (t === 'note_updated') return 'Ghi chú mục';
  return 'Hoạt động';
}
