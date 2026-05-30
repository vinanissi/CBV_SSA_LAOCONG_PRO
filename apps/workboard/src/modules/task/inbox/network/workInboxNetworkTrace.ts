/**
 * PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — unified network audit trace (FE).
 */

export type WorkInboxNetworkRequestGroup =
  | 'initial_load'
  | 'task_open'
  | 'next_previous'
  | 'action'
  | 'search_open'
  | 'tab_switch'
  | 'refresh'
  | 'static_runtime';

export interface WorkInboxNetworkTraceEntry {
  traceId: string;
  route: string;
  taskId?: string;
  caller: string;
  reason: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  dedupeKey: string;
  cacheHit: boolean;
  aborted: boolean;
  staleIgnored: boolean;
  requestGroup: WorkInboxNetworkRequestGroup;
  userActionId?: string;
  deduped?: boolean;
}

const traces: WorkInboxNetworkTraceEntry[] = [];
const MAX_TRACES = 200;

let traceSeq = 0;

function nextTraceId(prefix: string): string {
  traceSeq += 1;
  return `${prefix}-${traceSeq}-${Date.now().toString(36)}`;
}

export function startWorkInboxNetworkTrace(params: {
  route: string;
  dedupeKey: string;
  caller: string;
  reason: string;
  requestGroup: WorkInboxNetworkRequestGroup;
  taskId?: string;
  userActionId?: string;
}): WorkInboxNetworkTraceEntry {
  const entry: WorkInboxNetworkTraceEntry = {
    traceId: nextTraceId('net'),
    route: params.route,
    taskId: params.taskId,
    caller: params.caller,
    reason: params.reason,
    startedAt: new Date().toISOString(),
    dedupeKey: params.dedupeKey,
    cacheHit: false,
    aborted: false,
    staleIgnored: false,
    requestGroup: params.requestGroup,
    userActionId: params.userActionId,
  };
  traces.push(entry);
  if (traces.length > MAX_TRACES) traces.shift();
  if (import.meta.env?.DEV) {
    console.info('[CBV Network]', JSON.stringify(entry));
  }
  return entry;
}

export function finishWorkInboxNetworkTrace(
  traceId: string,
  patch: Partial<
    Pick<
      WorkInboxNetworkTraceEntry,
      'cacheHit' | 'aborted' | 'staleIgnored' | 'deduped' | 'endedAt' | 'durationMs'
    >
  >,
): void {
  const entry = traces.find((t) => t.traceId === traceId);
  if (!entry) return;
  Object.assign(entry, patch);
  if (!entry.endedAt) entry.endedAt = new Date().toISOString();
  if (entry.durationMs == null && entry.startedAt) {
    entry.durationMs = Date.now() - new Date(entry.startedAt).getTime();
  }
  if (import.meta.env?.DEV) {
    console.info('[CBV Network]', JSON.stringify(entry));
  }
}

export function getWorkInboxNetworkTraces(): WorkInboxNetworkTraceEntry[] {
  return [...traces];
}

export function resetWorkInboxNetworkTraces(): void {
  traces.length = 0;
}

export function countWorkInboxNetworkTracesByGroup(group: WorkInboxNetworkRequestGroup): number {
  return traces.filter((t) => t.requestGroup === group && !t.cacheHit && !t.deduped).length;
}
