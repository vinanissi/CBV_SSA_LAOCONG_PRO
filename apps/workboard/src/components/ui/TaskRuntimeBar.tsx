import type { TaskWorkspaceRuntime } from '@/api/contracts';
import { evaluateTaskMainRuntimeHealth } from '@/shared/utils/taskMainRuntimeHealth';

interface TaskRuntimeBarProps {
  runtime: TaskWorkspaceRuntime | null;
  connected: boolean;
  refreshing?: boolean;
  degraded?: boolean;
}

export function TaskRuntimeBar({ runtime, connected, refreshing, degraded }: TaskRuntimeBarProps) {
  const health = evaluateTaskMainRuntimeHealth({
    connected,
    error: null,
    hasSnapshot: Boolean(runtime),
    warnings: [],
    runtime,
  });
  const latency = runtime?.workerLatencyMs ?? runtime?.gasDurationMs ?? runtime?.latencyMs;
  const slow = health.state === 'slow_live';
  const showDegraded = degraded || health.degraded;
  const statusLabel = health.operatorLabel;
  const statusClass = !connected
    ? 'bg-status-warn'
    : showDegraded
      ? 'bg-amber-400'
      : health.state === 'slow_live'
        ? 'bg-amber-300'
        : 'bg-status-ok';

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
