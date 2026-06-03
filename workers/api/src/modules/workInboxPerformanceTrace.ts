/** PHASE_WORK_INBOX_LATENCY_PROFILING — Worker timing wrapper (extended breakdown). */

import type { ApiEnvelope } from '../contracts';

export type WorkInboxPerfStatus = 'OK' | 'WARNING' | 'DEGRADED' | 'FAIL';

export type WorkInboxLatencyClass =
  | 'FAST'
  | 'ACCEPTABLE'
  | 'WARNING'
  | 'DEGRADED'
  | 'FAIL';

export interface WorkInboxWorkerLatencyBreakdown {
  totalMs?: number;
  validationMs?: number;
  routeMs?: number;
  gasCallMs?: number;
  responseBuildMs?: number;
}

export interface WorkInboxGasLatencyBreakdown {
  totalMs?: number;
  parseMs?: number;
  dispatchMs?: number;
  readMs?: number;
  writeMs?: number;
  timelineAppendMs?: number;
  auditAppendMs?: number;
  responseMs?: number;
  taskLookupMs?: number;
  mutationMs?: number;
  bundleTimelineMs?: number;
  bundleNotesMs?: number;
  bundleAppointmentsMs?: number;
  bundleDocumentsMs?: number;
  bundleAuditsMs?: number;
}

export interface WorkInboxSheetLatencyBreakdown {
  openSpreadsheetMs?: number;
  getSheetMs?: number;
  taskLookupMs?: number;
  readRows?: number;
  writeRows?: number;
  rowsScanned?: number;
}

export interface WorkInboxPerformanceTraceEnvelope {
  traceId: string;
  phase: 'WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT' | 'WORK_INBOX_LATENCY_PROFILING';
  action: string;
  taskId?: string;
  actor?: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  totalDurationMs?: number;
  layerTimings: {
    workerTotalMs?: number;
    workerToGasMs?: number;
    gasTotalMs?: number;
    gasSheetReadMs?: number;
    gasSheetWriteMs?: number;
    authResolveMs?: number;
  };
  fe?: Record<string, number>;
  worker?: WorkInboxWorkerLatencyBreakdown;
  gas?: WorkInboxGasLatencyBreakdown;
  sheet?: WorkInboxSheetLatencyBreakdown;
  requestCount: number;
  sheetReadCount?: number;
  sheetWriteCount?: number;
  refreshCount: number;
  status: WorkInboxPerfStatus;
  latencyStatus?: WorkInboxLatencyClass;
  warnings: string[];
  errors: string[];
}

export function classifyDuration(ms: number): WorkInboxPerfStatus {
  if (ms <= 1500) return 'OK';
  if (ms <= 3000) return 'WARNING';
  if (ms <= 7000) return 'DEGRADED';
  return 'FAIL';
}

export function classifyLatencyDuration(ms: number): WorkInboxLatencyClass {
  if (ms < 1000) return 'FAST';
  if (ms < 3000) return 'ACCEPTABLE';
  if (ms < 5000) return 'WARNING';
  if (ms < 10000) return 'DEGRADED';
  return 'FAIL';
}

export interface WorkerPerfContext {
  traceId: string;
  action: string;
  startedAt: number;
  authStart?: number;
  gasStart?: number;
  validationEnd?: number;
  gasEnd?: number;
  responseStart?: number;
  sheetReadCount: number;
  sheetWriteCount: number;
}

export function beginWorkerPerf(traceId: string, action: string): WorkerPerfContext {
  return {
    traceId,
    action,
    startedAt: Date.now(),
    sheetReadCount: 0,
    sheetWriteCount: 0,
  };
}

export function markWorkerValidationEnd(ctx: WorkerPerfContext): void {
  ctx.validationEnd = Date.now();
  ctx.gasStart = ctx.validationEnd;
}

export function markWorkerGasEnd(ctx: WorkerPerfContext): void {
  ctx.gasEnd = Date.now();
  ctx.responseStart = ctx.gasEnd;
}

function buildWorkerBreakdown(ctx: WorkerPerfContext, durationMs: number): WorkInboxWorkerLatencyBreakdown {
  const validationEnd = ctx.validationEnd ?? ctx.startedAt;
  const gasStart = ctx.gasStart ?? validationEnd;
  const gasEnd = ctx.gasEnd ?? gasStart;
  const responseStart = ctx.responseStart ?? gasEnd;
  return {
    totalMs: durationMs,
    validationMs: Math.max(0, validationEnd - ctx.startedAt),
    routeMs: Math.max(0, gasStart - ctx.startedAt),
    gasCallMs: Math.max(0, gasEnd - gasStart),
    responseBuildMs: Math.max(0, durationMs - (responseStart - ctx.startedAt)),
  };
}

export function finishWorkerPerf(
  ctx: WorkerPerfContext,
  opts: {
    gasTotalMs?: number;
    gasSheetReadMs?: number;
    gasSheetWriteMs?: number;
    authResolveMs?: number;
    warnings?: string[];
    errors?: string[];
    requestCount?: number;
    sheetReadCount?: number;
    sheetWriteCount?: number;
  } = {},
): WorkInboxPerformanceTraceEnvelope {
  const endedAt = Date.now();
  const durationMs = endedAt - ctx.startedAt;
  const status = classifyDuration(durationMs);
  const latencyStatus = classifyLatencyDuration(durationMs);
  const warnings = [...(opts.warnings ?? [])];
  const errors = [...(opts.errors ?? [])];
  if (status === 'WARNING') warnings.push(`Worker slow ${durationMs}ms`);
  if (status === 'DEGRADED') warnings.push(`Worker degraded ${durationMs}ms`);
  if (status === 'FAIL') errors.push(`Worker fail threshold ${durationMs}ms`);

  return {
    traceId: ctx.traceId,
    phase: 'WORK_INBOX_LATENCY_PROFILING',
    action: ctx.action,
    startedAt: new Date(ctx.startedAt).toISOString(),
    endedAt: new Date(endedAt).toISOString(),
    durationMs,
    totalDurationMs: durationMs,
    layerTimings: {
      workerTotalMs: durationMs,
      workerToGasMs: opts.gasTotalMs,
      gasTotalMs: opts.gasTotalMs,
      gasSheetReadMs: opts.gasSheetReadMs,
      gasSheetWriteMs: opts.gasSheetWriteMs,
      authResolveMs: opts.authResolveMs,
    },
    worker: buildWorkerBreakdown(ctx, durationMs),
    requestCount: opts.requestCount ?? 1,
    sheetReadCount: opts.sheetReadCount ?? ctx.sheetReadCount,
    sheetWriteCount: opts.sheetWriteCount ?? ctx.sheetWriteCount,
    refreshCount: 0,
    status,
    latencyStatus,
    warnings,
    errors,
  };
}

function asNum(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function asRecord(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

export function mergeGasPerformanceTrace(
  envelope: WorkInboxPerformanceTraceEnvelope,
  gasTrace: Record<string, unknown> | undefined,
): WorkInboxPerformanceTraceEnvelope {
  if (!gasTrace) return envelope;
  const lt = gasTrace.layerTimings as Record<string, number> | undefined;
  if (lt?.gasTotalMs) envelope.layerTimings.gasTotalMs = lt.gasTotalMs;
  if (lt?.gasSheetReadMs) envelope.layerTimings.gasSheetReadMs = lt.gasSheetReadMs;
  if (lt?.gasSheetWriteMs) envelope.layerTimings.gasSheetWriteMs = lt.gasSheetWriteMs;
  if (typeof gasTrace.sheetReadCount === 'number') envelope.sheetReadCount = gasTrace.sheetReadCount as number;
  if (typeof gasTrace.sheetWriteCount === 'number') envelope.sheetWriteCount = gasTrace.sheetWriteCount as number;

  const gas = asRecord(gasTrace.gas) ?? asRecord(gasTrace);
  const gasBreakdown: WorkInboxGasLatencyBreakdown = {
    totalMs: asNum(gas?.totalMs) ?? asNum(lt?.gasTotalMs) ?? asNum(gasTrace.durationMs),
    parseMs: asNum(gas?.parseMs),
    dispatchMs: asNum(gas?.dispatchMs),
    readMs: asNum(gas?.readMs) ?? lt?.gasSheetReadMs,
    writeMs: asNum(gas?.writeMs) ?? lt?.gasSheetWriteMs,
    timelineAppendMs: asNum(gas?.timelineAppendMs),
    auditAppendMs: asNum(gas?.auditAppendMs),
    responseMs: asNum(gas?.responseMs),
    taskLookupMs: asNum(gas?.taskLookupMs),
    mutationMs: asNum(gas?.mutationMs),
    bundleTimelineMs: asNum(gas?.bundleTimelineMs),
    bundleNotesMs: asNum(gas?.bundleNotesMs),
    bundleAppointmentsMs: asNum(gas?.bundleAppointmentsMs),
    bundleDocumentsMs: asNum(gas?.bundleDocumentsMs),
    bundleAuditsMs: asNum(gas?.bundleAuditsMs),
  };
  envelope.gas = gasBreakdown;

  const sheet = asRecord(gasTrace.sheet);
  if (sheet) {
    envelope.sheet = {
      openSpreadsheetMs: asNum(sheet.openSpreadsheetMs),
      getSheetMs: asNum(sheet.getSheetMs),
      taskLookupMs: asNum(sheet.taskLookupMs),
      readRows: asNum(sheet.readRows),
      writeRows: asNum(sheet.writeRows),
      rowsScanned: asNum(sheet.rowsScanned),
    };
  }

  if (typeof gasTrace.latencyStatus === 'string') {
    envelope.latencyStatus = gasTrace.latencyStatus as WorkInboxLatencyClass;
  }

  return envelope;
}

export function attachPerfToEnvelope<T extends Record<string, unknown>>(
  data: T,
  perf: WorkInboxPerformanceTraceEnvelope,
): T & { performanceTrace: WorkInboxPerformanceTraceEnvelope } {
  return { ...data, performanceTrace: perf };
}

export function extractRequestTraceId(request: Request, fallback?: string): string {
  return (
    request.headers.get('x-cbv-trace-id') ??
    request.headers.get('X-CBV-Trace-Id') ??
    fallback ??
    `cbv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  );
}

export type ApiEnvelopeWithPerf<T> = ApiEnvelope<T> & {
  performanceTrace: WorkInboxPerformanceTraceEnvelope;
};

export function envelopeWithRoutePerf<T>(
  request: Request,
  action: string,
  perfCtx: WorkerPerfContext,
  envelope: ApiEnvelope<T>,
  gasResult?: { performanceTrace?: Record<string, unknown>; workerLatencyMs?: number },
): ApiEnvelopeWithPerf<T> {
  markWorkerGasEnd(perfCtx);
  let perf = finishWorkerPerf(perfCtx, {
    gasTotalMs: gasResult?.workerLatencyMs,
    sheetReadCount: perfCtx.sheetReadCount,
    sheetWriteCount: perfCtx.sheetWriteCount,
  });
  perf = mergeGasPerformanceTrace(perf, gasResult?.performanceTrace);
  perf.traceId = extractRequestTraceId(request, envelope.traceId);
  perf.action = action;
  return { ...envelope, performanceTrace: perf };
}
