import type { TaskWorkspaceCounts, TaskWorkspaceRuntime } from '@/api/contracts';
import { evaluateTaskMainRuntimeHealth } from './taskMainRuntimeHealth';

export type RuntimeHealthLevel = 'healthy' | 'warning' | 'critical';

export interface RuntimeHealthInput {
  connected: boolean;
  degraded?: boolean;
  runtime?: TaskWorkspaceRuntime | null;
  warnings?: string[];
  error?: string | null;
  staleMessage?: string | null;
}

export function getRuntimeLatencyMs(runtime?: TaskWorkspaceRuntime | null): number | undefined {
  if (!runtime) return undefined;
  return runtime.workerLatencyMs ?? runtime.gasDurationMs ?? runtime.latencyMs;
}

export function isRuntimeSlow(runtime?: TaskWorkspaceRuntime | null): boolean {
  const latency = getRuntimeLatencyMs(runtime);
  return typeof latency === 'number' && latency >= 2000;
}

export function getRuntimeHealthLevel(input: RuntimeHealthInput): RuntimeHealthLevel {
  const { connected, degraded, runtime, warnings = [], error, staleMessage } = input;

  if (!connected && !runtime) return 'critical';
  if (error && !runtime) return 'critical';
  if (!connected) return 'critical';
  if (warnings.some((w) => w.includes('mock') || w.includes('Không kết nối'))) return 'critical';

  if (degraded || staleMessage) return 'warning';
  if (isRuntimeSlow(runtime) && !degraded) return 'warning';
  if (error) return 'warning';
  if (warnings.length > 0) return 'warning';
  if (runtime?.mode === 'mock_dev_only') return 'warning';

  return 'healthy';
}

export function getCompactConnectionLabel(
  connected: boolean,
  runtime?: TaskWorkspaceRuntime | null,
  _degraded?: boolean,
  options?: { warnings?: string[]; error?: string | null },
): string {
  return evaluateTaskMainRuntimeHealth({
    connected,
    error: options?.error ?? null,
    hasSnapshot: Boolean(runtime),
    warnings: options?.warnings ?? [],
    runtime,
  }).operatorLabel;
}

/** Status bar / footer — full telemetry context from TasksPage. */
export function getCompactConnectionLabelFromTelemetry(input: {
  connected: boolean;
  degraded?: boolean;
  runtime?: TaskWorkspaceRuntime | null;
  warnings?: string[];
  error?: string | null;
  staleMessage?: string | null;
}): string {
  const health = evaluateTaskMainRuntimeHealth({
    connected: input.connected,
    error: input.error ?? null,
    hasSnapshot: Boolean(input.runtime),
    warnings: input.warnings ?? [],
    runtime: input.runtime,
  });
  if (input.staleMessage) return health.operatorLabel;
  if (input.degraded) return health.operatorLabel;
  return health.operatorLabel;
}

export function getCompactCountsLine(counts: TaskWorkspaceCounts): string {
  const parts = [`${counts.total} việc`];
  if (counts.overdue > 0) parts.push(`${counts.overdue} quá hạn`);
  else if (counts.blocked > 0) parts.push(`${counts.blocked} kẹt`);
  return parts.join(' · ');
}

export function getRuntimeCacheLabel(runtime: TaskWorkspaceRuntime, refreshing?: boolean): string {
  if (runtime.stale || runtime.cacheSource === 'stale') return 'stale';
  if (runtime.cacheSource === 'worker' || runtime.workerCacheHit) return 'worker hit';
  if (runtime.cacheSource === 'gas' && runtime.cacheHit) return 'gas hit';
  if (runtime.cacheHit) return 'hit';
  if (refreshing) return 'refresh';
  return 'miss';
}

export interface RuntimeDiagnosticRow {
  label: string;
  value: string;
}

export function buildRuntimeDiagnostics(
  runtime: TaskWorkspaceRuntime | null | undefined,
  connected: boolean,
  refreshing?: boolean,
): RuntimeDiagnosticRow[] {
  if (!runtime) {
    return [{ label: 'Runtime', value: connected ? 'waiting…' : 'disconnected' }];
  }

  const latency = getRuntimeLatencyMs(runtime);
  const rows: RuntimeDiagnosticRow[] = [
    { label: 'Mode', value: runtime.mode },
    { label: 'DB', value: runtime.dbSheet || '—' },
    { label: 'Source', value: runtime.cacheSource ?? (runtime.workerCacheHit ? 'worker' : runtime.cacheHit ? 'gas' : 'live') },
    { label: 'Sync', value: runtime.lastSyncAt?.slice(0, 19) ?? '—' },
    { label: 'Cache', value: getRuntimeCacheLabel(runtime, refreshing) },
  ];

  if (latency != null) rows.push({ label: 'Latency', value: `${latency}ms` });
  if (runtime.payloadBytesApprox != null && runtime.payloadBytesApprox > 0) {
    rows.push({ label: 'Payload', value: `${Math.round(runtime.payloadBytesApprox / 1024)}KB` });
  }
  if (runtime.rowsReturned != null || runtime.rowsScanned != null) {
    rows.push({
      label: 'Rows',
      value: `${runtime.rowsReturned ?? '—'}/${runtime.rowsScanned ?? '—'}`,
    });
  }
  if (runtime.gasDurationMs != null) rows.push({ label: 'GAS', value: `${runtime.gasDurationMs}ms` });
  if (runtime.generatedAt) rows.push({ label: 'Generated', value: runtime.generatedAt.slice(0, 19) });

  return rows;
}

export function getExpandedCountsDetail(counts: TaskWorkspaceCounts): RuntimeDiagnosticRow[] {
  return [
    { label: 'Tổng', value: String(counts.total) },
    { label: 'Mở', value: String(counts.open) },
    { label: 'Xử lý', value: String(counts.inProgress) },
    { label: 'Kẹt', value: String(counts.blocked) },
    { label: 'Quá hạn', value: String(counts.overdue) },
    { label: 'Hôm nay', value: String(counts.dueToday) },
  ];
}

export function getPrimaryRuntimeNotice(input: RuntimeHealthInput): string | null {
  const { staleMessage, error, warnings = [] } = input;
  if (staleMessage) return staleMessage;
  if (error) return error;
  const filtered = warnings.filter((w) => !w.includes('chậm') || input.degraded);
  return filtered[0] ?? null;
}

export function getStatusDotClass(health: RuntimeHealthLevel): string {
  switch (health) {
    case 'critical':
      return 'runtime-dot-critical';
    case 'warning':
      return 'runtime-dot-warning';
    default:
      return 'runtime-dot-healthy';
  }
}
