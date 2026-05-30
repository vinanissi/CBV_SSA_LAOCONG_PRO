import type { TaskWorkspaceRuntime } from '@/api/contracts';

interface TaskRuntimeBarProps {
  runtime: TaskWorkspaceRuntime | null;
  connected: boolean;
  refreshing?: boolean;
  degraded?: boolean;
}

export function TaskRuntimeBar({ runtime, connected, refreshing, degraded }: TaskRuntimeBarProps) {
  const isReal = runtime?.mode === 'google_sheet_existing_db';
  const latency = runtime?.workerLatencyMs ?? runtime?.gasDurationMs ?? runtime?.latencyMs;
  const slow = typeof latency === 'number' && latency >= 2000;
  const statusLabel =
    !connected ? 'Disconnected' : degraded || slow ? 'Degraded' : isReal ? 'Connected — TASK_MAIN' : 'Worker OK';
  const statusClass =
    !connected ? 'bg-status-warn' : degraded || slow ? 'bg-amber-400' : isReal ? 'bg-status-ok' : 'bg-amber-400';

  const cacheLabel = runtime?.workerCacheHit
    ? 'stale/worker hit'
    : runtime?.cacheHit
      ? 'hit'
      : refreshing && runtime
        ? 'stale'
        : 'miss';

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border/60 bg-surface-raised/60 px-3 py-2 text-[11px]">
      <span className="inline-flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${statusClass}`} />
        <span className="text-slate-500">Runtime:</span>
        <span className={connected ? 'text-slate-300' : 'text-status-warn'}>{statusLabel}</span>
      </span>
      {runtime && (
        <>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">
            Cache: <span className="text-slate-400">{cacheLabel}</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">
            Sync: <span className="text-slate-400">{runtime.lastSyncAt?.slice(0, 19) ?? '—'}</span>
          </span>
          {latency != null && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">
                Latency: <span className={slow ? 'text-amber-300' : 'text-slate-400'}>{latency}ms</span>
              </span>
            </>
          )}
          {(runtime.rowsReturned != null || runtime.rowsScanned != null) && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">
                Rows:{' '}
                <span className="text-slate-400">
                  {runtime.rowsReturned ?? '—'}/{runtime.rowsScanned ?? '—'}
                </span>
              </span>
            </>
          )}
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">
            Mode: <span className="text-slate-400">{runtime.mode}</span>
          </span>
        </>
      )}
      {refreshing && (
        <span className="text-accent animate-pulse">
          {runtime ? 'Đang làm mới dữ liệu…' : 'Đang đồng bộ dữ liệu TASK_MAIN…'}
        </span>
      )}
    </div>
  );
}
