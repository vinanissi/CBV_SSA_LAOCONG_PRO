/** PHASE_WORK_INBOX_OPERATIONAL_FETCH_LOOP_HOTFIX — fetch trace (dev diagnostics). */

export type OperationalBundleFetchReason =
  | 'TASK_SELECT'
  | 'MANUAL_REFRESH'
  | 'ACTION_REFRESH'
  | 'RETRY';

export interface OperationalBundleFetchTrace {
  taskId: string;
  requestId: string;
  caller: string;
  reason: OperationalBundleFetchReason;
  startedAt: string;
  completedAt?: string;
  aborted?: boolean;
  stale?: boolean;
  deduped?: boolean;
  ok?: boolean;
  durationMs?: number;
}

const traces: OperationalBundleFetchTrace[] = [];
const MAX_TRACES = 80;

export function logOperationalBundleFetchStart(params: {
  taskId: string;
  requestId: string;
  caller: string;
  reason: OperationalBundleFetchReason;
}): void {
  const entry: OperationalBundleFetchTrace = {
    taskId: params.taskId,
    requestId: params.requestId,
    caller: params.caller,
    reason: params.reason,
    startedAt: new Date().toISOString(),
  };
  traces.push(entry);
  if (traces.length > MAX_TRACES) traces.shift();
  if (import.meta.env.DEV) {
    console.info('[CBV OpBundle]', JSON.stringify(entry));
  }
}

export function logOperationalBundleFetchEnd(params: {
  requestId: string;
  ok: boolean;
  aborted?: boolean;
  stale?: boolean;
  deduped?: boolean;
}): void {
  const entry = traces.find((t) => t.requestId === params.requestId);
  if (entry) {
    entry.completedAt = new Date().toISOString();
    entry.ok = params.ok;
    entry.aborted = params.aborted;
    entry.stale = params.stale;
    entry.deduped = params.deduped;
    entry.durationMs = Date.now() - new Date(entry.startedAt).getTime();
    if (import.meta.env.DEV) {
      console.info('[CBV OpBundle]', JSON.stringify(entry));
    }
  }
}

export function getOperationalBundleFetchTraces(): OperationalBundleFetchTrace[] {
  return [...traces];
}

export function resetOperationalBundleFetchTraces(): void {
  traces.length = 0;
}
