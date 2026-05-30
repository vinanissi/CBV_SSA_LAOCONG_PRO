import type { TaskWorkspaceRuntime } from '@/api/contracts';

/** HH:mm:ss from ISO timestamp for runtime footer console. */
export function formatRuntimeSyncClock(iso?: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(11, 19) || '—';
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return iso.slice(11, 19) || '—';
  }
}

export function formatRuntimeSyncLabel(iso?: string | null): string {
  const clock = formatRuntimeSyncClock(iso);
  return clock === '—' ? 'Sync —' : `Sync ${clock}`;
}

export function pickRuntimeSyncTimestamp(runtime?: TaskWorkspaceRuntime | null): string | null {
  if (!runtime) return null;
  return runtime.lastSyncAt || runtime.generatedAt || null;
}
