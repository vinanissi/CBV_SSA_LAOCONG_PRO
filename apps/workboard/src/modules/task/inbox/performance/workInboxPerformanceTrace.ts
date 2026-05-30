/** PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT — FE trace (append-only, no business logic). */

export type WorkInboxPerfStatus = 'OK' | 'WARNING' | 'DEGRADED' | 'FAIL';

export interface WorkInboxLayerTimings {
  fePrepareMs?: number;
  workerTotalMs?: number;
  workerToGasMs?: number;
  gasTotalMs?: number;
  gasSheetReadMs?: number;
  gasSheetWriteMs?: number;
  workerResponseMs?: number;
  feRefreshMs?: number;
  feRenderMs?: number;
}

export interface WorkInboxPerformanceTrace {
  traceId: string;
  phase: 'WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT' | 'WORK_INBOX_RUNTIME_PERFORMANCE_P0';
  action: string;
  taskId?: string;
  actor?: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  layerTimings: WorkInboxLayerTimings;
  requestCount: number;
  sheetReadCount?: number;
  sheetWriteCount?: number;
  refreshCount: number;
  status: WorkInboxPerfStatus;
  warnings: string[];
  errors: string[];
  rowIndexCacheHit?: boolean;
  rowIndexCacheMiss?: boolean;
  rowIndexFallbackScan?: boolean;
  rowsScanned?: number;
  refreshPolicy?: string;
  snapshotRefreshSkipped?: boolean;
  bundleRefreshTriggered?: boolean;
  combinedActionUsed?: boolean;
  fallbackEndpointUsed?: boolean;
  requestCountBefore?: number;
  requestCountAfter?: number;
}

const STORAGE_KEY = 'cbv_work_inbox_perf_traces';
const MAX_TRACES = 80;

export function createWorkInboxTraceId(action: string): string {
  return `wipt-${action.slice(0, 12).replace(/\W/g, '')}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function classifyWorkInboxDuration(ms: number): WorkInboxPerfStatus {
  if (ms <= 1500) return 'OK';
  if (ms <= 3000) return 'WARNING';
  if (ms <= 7000) return 'DEGRADED';
  return 'FAIL';
}

export function classifySheetOpDuration(ms: number): WorkInboxPerfStatus {
  if (ms <= 800) return 'OK';
  if (ms <= 2000) return 'WARNING';
  if (ms <= 5000) return 'DEGRADED';
  return 'FAIL';
}

export interface WorkInboxTraceSession {
  trace: WorkInboxPerformanceTrace;
  markApiStart: () => void;
  markApiEnd: (opts?: { workerMs?: number; gasMs?: number; sheetRead?: number; sheetWrite?: number }) => void;
  incrementRefresh: () => void;
  setP0Flags: (flags: Partial<Pick<WorkInboxPerformanceTrace, 'refreshPolicy' | 'snapshotRefreshSkipped' | 'bundleRefreshTriggered' | 'combinedActionUsed' | 'fallbackEndpointUsed' | 'rowIndexCacheHit' | 'rowIndexCacheMiss' | 'rowIndexFallbackScan' | 'rowsScanned'>>) => void;
  finish: (opts?: { feRefreshMs?: number; errors?: string[] }) => WorkInboxPerformanceTrace;
}

export function startWorkInboxTrace(params: {
  action: string;
  taskId?: string;
  actor?: string;
  traceId?: string;
}): WorkInboxTraceSession {
  const started = performance.now();
  const trace: WorkInboxPerformanceTrace = {
    traceId: params.traceId ?? createWorkInboxTraceId(params.action),
    phase: 'WORK_INBOX_RUNTIME_PERFORMANCE_P0',
    action: params.action,
    taskId: params.taskId,
    actor: params.actor,
    startedAt: new Date().toISOString(),
    layerTimings: { fePrepareMs: 0 },
    requestCount: 0,
    refreshCount: 0,
    status: 'OK',
    warnings: [],
    errors: [],
  };

  let apiStart = 0;

  return {
    trace,
    markApiStart() {
      apiStart = performance.now();
      trace.requestCount += 1;
    },
    markApiEnd(opts) {
      const apiMs = apiStart ? performance.now() - apiStart : 0;
      trace.layerTimings.workerTotalMs = (trace.layerTimings.workerTotalMs ?? 0) + apiMs;
      if (opts?.workerMs) trace.layerTimings.workerToGasMs = (trace.layerTimings.workerToGasMs ?? 0) + opts.workerMs;
      if (opts?.gasMs) trace.layerTimings.gasTotalMs = (trace.layerTimings.gasTotalMs ?? 0) + opts.gasMs;
      if (opts?.sheetRead) trace.sheetReadCount = (trace.sheetReadCount ?? 0) + opts.sheetRead;
      if (opts?.sheetWrite) trace.sheetWriteCount = (trace.sheetWriteCount ?? 0) + opts.sheetWrite;
      apiStart = 0;
    },
    incrementRefresh() {
      trace.refreshCount += 1;
    },
    setP0Flags(flags) {
      Object.assign(trace, flags);
    },
    finish(opts) {
      const requestCountAfter = trace.requestCount;
      trace.requestCountBefore = trace.requestCountBefore ?? 0;
      trace.requestCountAfter = requestCountAfter;
      const durationMs = Math.round(performance.now() - started);
      trace.endedAt = new Date().toISOString();
      trace.durationMs = durationMs;
      trace.layerTimings.fePrepareMs = Math.round(performance.now() - started - (trace.layerTimings.workerTotalMs ?? 0));
      if (opts?.feRefreshMs) trace.layerTimings.feRefreshMs = opts.feRefreshMs;
      if (opts?.errors?.length) trace.errors.push(...opts.errors);
      trace.status = classifyWorkInboxDuration(durationMs);
      if (trace.status === 'WARNING') trace.warnings.push(`Slow action ${durationMs}ms`);
      if (trace.status === 'DEGRADED') trace.warnings.push(`Degraded action ${durationMs}ms`);
      if (trace.status === 'FAIL') trace.errors.push(`Fail threshold ${durationMs}ms`);
      if (trace.requestCount >= 4) trace.warnings.push(`High request fan-out: ${trace.requestCount} requests`);
      if (trace.refreshCount >= 2) trace.warnings.push(`Multiple refreshes: ${trace.refreshCount}`);
      persistWorkInboxTrace(trace);
      if (trace.status !== 'OK') {
        console.info('[CBV WorkInbox Perf]', trace.action, trace.status, trace.durationMs, trace.traceId);
      }
      return trace;
    },
  };
}

export function persistWorkInboxTrace(trace: WorkInboxPerformanceTrace): void {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const list: WorkInboxPerformanceTrace[] = raw ? JSON.parse(raw) : [];
    list.push(trace);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_TRACES)));
  } catch {
    /* ignore */
  }
}

export function getWorkInboxPerfTraces(): WorkInboxPerformanceTrace[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getActiveWorkInboxTraceId(): string | undefined {
  return (window as unknown as { __cbvWiTraceId?: string }).__cbvWiTraceId;
}

export function setActiveWorkInboxTraceId(traceId: string | undefined): void {
  (window as unknown as { __cbvWiTraceId?: string }).__cbvWiTraceId = traceId;
}
