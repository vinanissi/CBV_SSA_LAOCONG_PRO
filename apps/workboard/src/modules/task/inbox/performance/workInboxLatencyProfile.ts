/**
 * PHASE_WORK_INBOX_LATENCY_PROFILING — FE latency trace merge + report builder.
 * Loads context via RCLA runtime (no separate profiling context).
 */

import type {
  WorkInboxFeLatencyBreakdown,
  WorkInboxGasLatencyBreakdown,
  WorkInboxLatencyActionRow,
  WorkInboxLatencyBottleneck,
  WorkInboxLatencyClass,
  WorkInboxLatencyTrace,
  WorkInboxSheetLatencyBreakdown,
  WorkInboxWorkerLatencyBreakdown,
} from './workInboxLatencyProfileTypes';

export type {
  WorkInboxLatencyActionRow,
  WorkInboxLatencyBottleneck,
  WorkInboxLatencyClass,
  WorkInboxLatencyTrace,
} from './workInboxLatencyProfileTypes';

const STORAGE_KEY = 'cbv_work_inbox_latency_traces';
const MAX_TRACES = 100;

export function classifyLatencyDuration(ms: number): WorkInboxLatencyClass {
  if (ms < 1000) return 'FAST';
  if (ms < 3000) return 'ACCEPTABLE';
  if (ms < 5000) return 'WARNING';
  if (ms < 10000) return 'DEGRADED';
  return 'FAIL';
}

function asNum(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : 0;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function pickBreakdown(
  src: Record<string, unknown> | null,
  keys: string[],
): Record<string, number> {
  if (!src) return {};
  const out: Record<string, number> = {};
  for (const k of keys) {
    const v = src[k];
    if (typeof v === 'number') out[k] = Math.round(v);
  }
  return out;
}

export interface IngestLatencyParams {
  action: string;
  traceId: string;
  taskId?: string;
  actor?: string;
  startedAt?: string;
  totalDurationMs: number;
  requestCount?: number;
  fe?: Partial<WorkInboxFeLatencyBreakdown>;
  performanceTrace?: Record<string, unknown>;
  workerTrace?: Record<string, unknown>;
}

/** Merge Worker/GAS performanceTrace from API envelope into FE latency store. */
export function ingestWorkInboxLatencyTrace(params: IngestLatencyParams): WorkInboxLatencyTrace {
  const perf = asRecord(params.performanceTrace) ?? asRecord(params.workerTrace);
  const workerRaw = pickBreakdown(asRecord(perf?.worker), [
    'totalMs',
    'validationMs',
    'routeMs',
    'gasCallMs',
    'responseBuildMs',
  ]);
  const worker: WorkInboxWorkerLatencyBreakdown = {
    totalMs: workerRaw.totalMs || asNum(perf?.durationMs),
    validationMs: workerRaw.validationMs,
    routeMs: workerRaw.routeMs,
    gasCallMs: workerRaw.gasCallMs,
    responseBuildMs: workerRaw.responseBuildMs,
  };
  if (!worker.totalMs && perf) {
    worker.totalMs = asNum(asRecord(perf.layerTimings)?.workerTotalMs) || asNum(perf.durationMs);
  }

  const gasSrc = asRecord(perf?.gas) ?? perf;
  const gasRaw = pickBreakdown(gasSrc, [
    'totalMs',
    'parseMs',
    'dispatchMs',
    'readMs',
    'writeMs',
    'timelineAppendMs',
    'auditAppendMs',
    'responseMs',
    'taskLookupMs',
    'mutationMs',
    'bundleTimelineMs',
    'bundleNotesMs',
    'bundleAppointmentsMs',
    'bundleDocumentsMs',
    'bundleAuditsMs',
  ]);
  const gas: WorkInboxGasLatencyBreakdown = { ...gasRaw };
  if (!gas.totalMs && gasSrc) {
    const lt = asRecord(gasSrc.layerTimings);
    gas.totalMs =
      asNum(gasSrc.totalMs) ||
      asNum(gasSrc.durationMs) ||
      asNum(lt?.gasTotalMs);
  }

  const sheet: WorkInboxSheetLatencyBreakdown = pickBreakdown(
    asRecord(perf?.sheet),
    ['openSpreadsheetMs', 'getSheetMs', 'taskLookupMs', 'readRows', 'writeRows', 'rowsScanned'],
  );

  const fe: WorkInboxFeLatencyBreakdown = {
    prepareMs: params.fe?.prepareMs ?? 0,
    renderMs: params.fe?.renderMs ?? 0,
    refreshMs: params.fe?.refreshMs ?? 0,
  };

  const total = Math.round(params.totalDurationMs);
  const trace: WorkInboxLatencyTrace = {
    traceId: params.traceId,
    phase: 'WORK_INBOX_LATENCY_PROFILING',
    action: params.action,
    taskId: params.taskId,
    actor: params.actor,
    startedAt: params.startedAt ?? new Date().toISOString(),
    endedAt: new Date().toISOString(),
    totalDurationMs: total,
    fe,
    worker: {
      totalMs: worker.totalMs || Math.max(0, total - (fe.prepareMs ?? 0) - (fe.refreshMs ?? 0)),
      validationMs: worker.validationMs,
      routeMs: worker.routeMs,
      gasCallMs: worker.gasCallMs,
      responseBuildMs: worker.responseBuildMs,
    },
    gas: {
      ...gas,
      totalMs: gas.totalMs || worker.gasCallMs || 0,
    },
    sheet,
    requestCount: params.requestCount ?? (asNum(perf?.requestCount) || 1),
    status: classifyLatencyDuration(total),
    warnings: Array.isArray(perf?.warnings) ? (perf!.warnings as string[]) : [],
    errors: Array.isArray(perf?.errors) ? (perf!.errors as string[]) : [],
  };

  persistLatencyTrace(trace);
  if (trace.status !== 'FAST' && trace.status !== 'ACCEPTABLE') {
    console.info('[CBV Latency]', trace.action, trace.status, trace.totalDurationMs, trace.traceId);
  }
  return trace;
}

export function persistLatencyTrace(trace: WorkInboxLatencyTrace): void {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const list: WorkInboxLatencyTrace[] = raw ? JSON.parse(raw) : [];
    list.push(trace);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_TRACES)));
  } catch {
    /* ignore */
  }
}

export function getWorkInboxLatencyTraces(): WorkInboxLatencyTrace[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function latencyTraceToActionRow(trace: WorkInboxLatencyTrace): WorkInboxLatencyActionRow {
  const sheetMs =
    (trace.sheet.openSpreadsheetMs ?? 0) +
    (trace.sheet.getSheetMs ?? 0) +
    (trace.sheet.taskLookupMs ?? 0) +
    (trace.gas.readMs ?? 0) +
    (trace.gas.writeMs ?? 0);
  return {
    action: trace.action,
    total: trace.totalDurationMs ?? 0,
    fe: (trace.fe.prepareMs ?? 0) + (trace.fe.renderMs ?? 0) + (trace.fe.refreshMs ?? 0),
    worker: trace.worker.totalMs ?? 0,
    gas: trace.gas.totalMs ?? 0,
    sheet: sheetMs,
    timeline: trace.gas.timelineAppendMs ?? 0,
    audit: trace.gas.auditAppendMs ?? 0,
    requests: trace.requestCount,
    status: trace.status,
    traceId: trace.traceId,
  };
}

export function buildLatencyActionTable(traces?: WorkInboxLatencyTrace[]): WorkInboxLatencyActionRow[] {
  const list = traces ?? getWorkInboxLatencyTraces();
  const byAction = new Map<string, WorkInboxLatencyTrace>();
  for (const t of list) {
    const prev = byAction.get(t.action);
    if (!prev || (t.totalDurationMs ?? 0) > (prev.totalDurationMs ?? 0)) {
      byAction.set(t.action, t);
    }
  }
  return Array.from(byAction.values()).map(latencyTraceToActionRow);
}

export function identifyLatencyBottlenecks(traces?: WorkInboxLatencyTrace[]): WorkInboxLatencyBottleneck[] {
  const list = traces ?? getWorkInboxLatencyTraces();
  if (!list.length) {
    return [
      {
        rank: 'P0',
        layer: 'GAS',
        finding: 'No live traces captured — deploy GAS + run manual benchmark',
        evidence: 'sessionStorage empty',
      },
    ];
  }

  const totals = { gas: 0, sheet: 0, timeline: 0, audit: 0, worker: 0, fe: 0, bundle: 0, n: 0 };
  for (const t of list) {
    totals.n += 1;
    totals.gas += t.gas.totalMs ?? 0;
    totals.worker += t.worker.totalMs ?? 0;
    totals.fe += (t.fe.prepareMs ?? 0) + (t.fe.renderMs ?? 0) + (t.fe.refreshMs ?? 0);
    totals.timeline += t.gas.timelineAppendMs ?? 0;
    totals.audit += t.gas.auditAppendMs ?? 0;
    totals.sheet +=
      (t.sheet.taskLookupMs ?? 0) +
      (t.gas.readMs ?? 0) +
      (t.gas.writeMs ?? 0) +
      (t.gas.taskLookupMs ?? 0);
    totals.bundle +=
      (t.gas.bundleTimelineMs ?? 0) +
      (t.gas.bundleNotesMs ?? 0) +
      (t.gas.bundleAppointmentsMs ?? 0) +
      (t.gas.bundleDocumentsMs ?? 0) +
      (t.gas.bundleAuditsMs ?? 0);
  }

  const avg = (v: number) => Math.round(v / Math.max(totals.n, 1));
  const ranked: { layer: WorkInboxLatencyBottleneck['layer']; ms: number; key: string }[] = [
    { layer: 'GAS', ms: avg(totals.gas), key: 'gas.totalMs' },
    { layer: 'Sheet', ms: avg(totals.sheet), key: 'sheet reads/writes' },
    { layer: 'Timeline', ms: avg(totals.timeline), key: 'gas.timelineAppendMs' },
    { layer: 'Audit', ms: avg(totals.audit), key: 'gas.auditAppendMs' },
    { layer: 'Bundle', ms: avg(totals.bundle), key: 'operational bundle aggregation' },
    { layer: 'Worker', ms: avg(totals.worker), key: 'worker.totalMs' },
    { layer: 'FE', ms: avg(totals.fe), key: 'fe prepare+render+refresh' },
  ];
  ranked.sort((a, b) => b.ms - a.ms);

  const out: WorkInboxLatencyBottleneck[] = [];
  ranked.forEach((r, i) => {
    const rank: WorkInboxLatencyBottleneck['rank'] = i === 0 || i === 1 ? 'P0' : i <= 4 ? 'P1' : 'P2';
    out.push({
      rank,
      layer: r.layer,
      finding: `${r.layer} avg ${r.ms}ms across ${totals.n} trace(s)`,
      evidence: `Measured field: ${r.key}`,
    });
  });
  return out;
}

export function formatLatencyTableMarkdown(rows: WorkInboxLatencyActionRow[]): string {
  const header =
    '| Action | Total | FE | Worker | GAS | Sheet | Timeline | Audit | Requests | Status |';
  const sep = '|--------|-------|-----|--------|-----|-------|----------|-------|----------|--------|';
  const body = rows.map(
    (r) =>
      `| ${r.action} | ${r.total}ms | ${r.fe} | ${r.worker} | ${r.gas} | ${r.sheet} | ${r.timeline} | ${r.audit} | ${r.requests} | ${r.status} |`,
  );
  return [header, sep, ...body].join('\n');
}

/** Target actions for manual benchmark checklist. */
export const LATENCY_PROFILE_TARGET_ACTIONS = [
  'OPEN_TASK',
  'ACTION_START_PROCESSING',
  'ACTION_PAUSE_TASK',
  'ACTION_HANDOFF',
  'ACTION_COMPLETE_TASK',
  'ACTION_SAVE_NOTE',
  'ACTION_CREATE_APPOINTMENT',
  'NAVIGATE_NEXT',
  'NAVIGATE_PREVIOUS',
  'SEARCH_OPEN',
] as const;

export function extractPerformanceTraceFromEnvelope(
  envelope: Record<string, unknown> | null | undefined,
): Record<string, unknown> | undefined {
  if (!envelope) return undefined;
  const top = envelope.performanceTrace;
  if (top && typeof top === 'object') return top as Record<string, unknown>;
  const data = envelope.data;
  if (data && typeof data === 'object') {
    const dt = (data as Record<string, unknown>).performanceTrace;
    if (dt && typeof dt === 'object') return dt as Record<string, unknown>;
  }
  return undefined;
}
