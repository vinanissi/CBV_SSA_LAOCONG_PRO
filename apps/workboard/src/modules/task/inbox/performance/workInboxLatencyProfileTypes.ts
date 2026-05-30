/** PHASE_WORK_INBOX_LATENCY_PROFILING — trace envelope types (measure only). */

export type WorkInboxLatencyClass =
  | 'FAST'
  | 'ACCEPTABLE'
  | 'WARNING'
  | 'DEGRADED'
  | 'FAIL';

export interface WorkInboxFeLatencyBreakdown {
  prepareMs?: number;
  renderMs?: number;
  refreshMs?: number;
}

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

/** Full latency trace envelope (FE session + merged Worker/GAS). */
export interface WorkInboxLatencyTrace {
  traceId: string;
  phase: 'WORK_INBOX_LATENCY_PROFILING';
  action: string;
  taskId?: string;
  actor?: string;
  startedAt: string;
  endedAt?: string;
  totalDurationMs?: number;
  fe: WorkInboxFeLatencyBreakdown;
  worker: WorkInboxWorkerLatencyBreakdown;
  gas: WorkInboxGasLatencyBreakdown;
  sheet: WorkInboxSheetLatencyBreakdown;
  requestCount: number;
  status: WorkInboxLatencyClass;
  warnings: string[];
  errors: string[];
}

export interface WorkInboxLatencyActionRow {
  action: string;
  total: number;
  fe: number;
  worker: number;
  gas: number;
  sheet: number;
  timeline: number;
  audit: number;
  requests: number;
  status: WorkInboxLatencyClass;
  traceId: string;
}

export interface WorkInboxLatencyBottleneck {
  rank: 'P0' | 'P1' | 'P2';
  layer: 'FE' | 'Worker' | 'GAS' | 'Sheet' | 'Timeline' | 'Audit' | 'Bundle';
  finding: string;
  evidence: string;
}
