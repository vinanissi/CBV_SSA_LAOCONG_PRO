/**
 * PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — deduped task detail loader with TTL + abort.
 */

import type { ApiEnvelope, TaskDetail } from '@/api/contracts';
import { api } from '@/api/client';
import { NETWORK_CACHE_TTL_MS } from './workInboxNetworkCacheConfig';
import {
  finishWorkInboxNetworkTrace,
  startWorkInboxNetworkTrace,
  type WorkInboxNetworkRequestGroup,
} from './workInboxNetworkTrace';

export interface LoadTaskDetailParams {
  taskId: string;
  caller: string;
  reason: string;
  requestGroup: WorkInboxNetworkRequestGroup;
  signal?: AbortSignal;
  requestId?: string;
  force?: boolean;
}

export interface LoadTaskDetailResult {
  envelope: ApiEnvelope<TaskDetail | null>;
  requestId: string;
  stale: boolean;
  deduped: boolean;
  cacheHit: boolean;
}

interface ResultCacheEntry {
  envelope: ApiEnvelope<TaskDetail | null>;
  fetchedAt: number;
}

let requestSeq = 0;
const inFlightByTask = new Map<string, Promise<ApiEnvelope<TaskDetail | null>>>();
const resultCache = new Map<string, ResultCacheEntry>();
let activeTaskId: string | null = null;
let activeAbort: AbortController | null = null;

function nextRequestId(taskId: string): string {
  requestSeq += 1;
  return `td-${taskId}-${requestSeq}-${Date.now().toString(36)}`;
}

function isCacheFresh(entry: ResultCacheEntry | undefined): boolean {
  return Boolean(entry && Date.now() - entry.fetchedAt < NETWORK_CACHE_TTL_MS.TASK_DETAIL);
}

export function invalidateTaskDetailResultCache(taskId?: string): void {
  if (taskId) resultCache.delete(taskId.trim());
  else resultCache.clear();
}

export function abortInFlightTaskDetail(taskId?: string): void {
  if (taskId && activeTaskId === taskId.trim()) {
    activeAbort?.abort();
    activeAbort = null;
    activeTaskId = null;
    inFlightByTask.delete(taskId.trim());
    return;
  }
  if (!taskId) {
    activeAbort?.abort();
    activeAbort = null;
    activeTaskId = null;
    inFlightByTask.clear();
  }
}

export async function loadTaskDetailNetwork(
  params: LoadTaskDetailParams,
): Promise<LoadTaskDetailResult> {
  const taskId = params.taskId.trim();
  const requestId = params.requestId ?? nextRequestId(taskId);
  const dedupeKey = `task-detail:${taskId}`;

  if (params.signal?.aborted) {
    return {
      envelope: {
        ok: false,
        status: 'FAIL',
        data: null,
        warnings: [],
        errors: ['Aborted'],
        traceId: requestId,
      },
      requestId,
      stale: true,
      deduped: false,
      cacheHit: false,
    };
  }

  const cached = resultCache.get(taskId);
  if (!params.force && isCacheFresh(cached)) {
    const trace = startWorkInboxNetworkTrace({
      route: `/api/tasks/${taskId}`,
      dedupeKey,
      caller: params.caller,
      reason: params.reason,
      requestGroup: params.requestGroup,
      taskId,
    });
    finishWorkInboxNetworkTrace(trace.traceId, { cacheHit: true });
    return {
      envelope: cached!.envelope,
      requestId,
      stale: false,
      deduped: false,
      cacheHit: true,
    };
  }

  const trace = startWorkInboxNetworkTrace({
    route: `/api/tasks/${taskId}`,
    dedupeKey,
    caller: params.caller,
    reason: params.reason,
    requestGroup: params.requestGroup,
    taskId,
  });

  if (activeTaskId && activeTaskId !== taskId) {
    activeAbort?.abort();
    inFlightByTask.delete(activeTaskId);
  }
  if (!params.signal) {
    activeAbort?.abort();
    activeAbort = new AbortController();
    activeTaskId = taskId;
  }
  const signal = params.signal ?? activeAbort!.signal;

  let deduped = false;
  let promise = inFlightByTask.get(taskId);
  if (!promise) {
    promise = api.getTaskDetail(taskId).finally(() => {
      if (inFlightByTask.get(taskId) === promise) inFlightByTask.delete(taskId);
    });
    inFlightByTask.set(taskId, promise);
  } else {
    deduped = true;
  }

  try {
    const envelope = await promise;
    const aborted = Boolean(signal.aborted);
    const stale = aborted || (activeTaskId !== null && activeTaskId !== taskId);
    if (stale) {
      finishWorkInboxNetworkTrace(trace.traceId, { aborted, staleIgnored: true, deduped });
      return { envelope, requestId, stale: true, deduped, cacheHit: false };
    }
    if (envelope.ok && envelope.data) {
      resultCache.set(taskId, { envelope, fetchedAt: Date.now() });
    }
    finishWorkInboxNetworkTrace(trace.traceId, { deduped });
    return { envelope, requestId, stale: false, deduped, cacheHit: false };
  } catch {
    finishWorkInboxNetworkTrace(trace.traceId, { aborted: Boolean(signal.aborted), deduped });
    return {
      envelope: {
        ok: false,
        status: 'FAIL',
        data: null,
        warnings: [],
        errors: ['Không kết nối được API chi tiết việc'],
        traceId: requestId,
      },
      requestId,
      stale: Boolean(signal.aborted),
      deduped,
      cacheHit: false,
    };
  }
}
