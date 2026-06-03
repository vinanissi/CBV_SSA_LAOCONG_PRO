/**
 * PHASE_CHECKLIST_01_SMART_CHECKLIST — display helpers (no I/O).
 */

export function formatSmartChecklistUpdatedAt(iso: string | null | undefined): string {
  if (!iso?.trim()) return 'chưa có';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'chưa có';
  try {
    return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

/** HH:mm for inline feedback stream (vi-VN). */
export function formatChecklistFeedbackTime(iso: string | null | undefined): string {
  if (!iso?.trim()) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export function formatAttachmentSizeLabel(size: number | null | undefined): string | null {
  if (size == null || !Number.isFinite(size) || size < 0) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function smartChecklistStatusGlyph(status: string, doneFallback: boolean): string {
  const s = status.trim().toLowerCase();
  if (s === 'done' || doneFallback) return '☑';
  if (s === 'blocked') return '⊘';
  if (s === 'skipped') return '⊝';
  return '☐';
}
