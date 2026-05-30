/**
 * PHASE_WORK_INBOX_OPERATIONAL_FETCH_LOOP_HOTFIX — deduped operational bundle loader.
 */

import type { ApiEnvelope } from '@/api/contracts';
import { workInboxOperationalApi } from './workInboxOperationalApi';
import type { TaskOperationalBundle } from './workInboxOperationalTypes';
import { emptyOperationalBundle } from './workInboxOperationalEmpty';
import {
  logOperationalBundleFetchEnd,
  logOperationalBundleFetchStart,
  type OperationalBundleFetchReason,
} from './workInboxOperationalBundleTrace';
import {
  extractPerformanceTraceFromEnvelope,
  ingestWorkInboxLatencyTrace,
} from '../performance/workInboxLatencyProfile';
import { NETWORK_CACHE_TTL_MS } from '../network/workInboxNetworkCacheConfig';
import {
  finishWorkInboxNetworkTrace,
  startWorkInboxNetworkTrace,
  type WorkInboxNetworkRequestGroup,
} from '../network/workInboxNetworkTrace';

export interface LoadOperationalBundleParams {
  taskId: string;
  reason: OperationalBundleFetchReason;
  caller: string;
  signal?: AbortSignal;
  requestId?: string;
  force?: boolean;
  requestGroup?: WorkInboxNetworkRequestGroup;
}

export interface LoadOperationalBundleResult {
  envelope: ApiEnvelope<TaskOperationalBundle>;
  requestId: string;
  stale: boolean;
  deduped: boolean;
  cacheHit: boolean;
}

interface ResultCacheEntry {
  envelope: ApiEnvelope<TaskOperationalBundle>;
  fetchedAt: number;
}

const resultCache = new Map<string, ResultCacheEntry>();

function isResultCacheFresh(entry: ResultCacheEntry | undefined): boolean {
  return Boolean(entry && Date.now() - entry.fetchedAt < NETWORK_CACHE_TTL_MS.OPERATIONAL_BUNDLE);
}

export function invalidateOperationalBundleResultCache(taskId?: string): void {
  if (taskId) resultCache.delete(taskId.trim());
  else resultCache.clear();
}

let requestSeq = 0;

function nextRequestId(taskId: string): string {
  requestSeq += 1;
  return `op-${taskId}-${requestSeq}-${Date.now().toString(36)}`;
}

const inFlightByTask = new Map<string, Promise<ApiEnvelope<TaskOperationalBundle>>>();

/**
 * Single entry for operational bundle HTTP fetch (all callers must use this).
 */
export async function loadOperationalBundle(
  params: LoadOperationalBundleParams,
): Promise<LoadOperationalBundleResult> {
  const taskId = params.taskId.trim();
  const requestId = params.requestId ?? nextRequestId(taskId);
  const fetchStarted = performance.now();

  const dedupeKey = `operational-bundle:${taskId}`;
  const requestGroup =
    params.requestGroup ??
    (params.reason === 'ACTION_REFRESH'
      ? 'action'
      : params.reason === 'MANUAL_REFRESH'
        ? 'refresh'
        : 'task_open');

  logOperationalBundleFetchStart({
    taskId,
    requestId,
    caller: params.caller,
    reason: params.reason,
  });

  const cached = resultCache.get(taskId);
  if (!params.force && isResultCacheFresh(cached)) {
    const netTrace = startWorkInboxNetworkTrace({
      route: `/api/tasks/${taskId}/operational`,
      dedupeKey,
      caller: params.caller,
      reason: params.reason,
      requestGroup,
      taskId,
    });
    finishWorkInboxNetworkTrace(netTrace.traceId, { cacheHit: true });
    logOperationalBundleFetchEnd({ requestId, ok: true, deduped: false });
    return {
      envelope: cached!.envelope,
      requestId,
      stale: false,
      deduped: false,
      cacheHit: true,
    };
  }

  const netTrace = startWorkInboxNetworkTrace({
    route: `/api/tasks/${taskId}/operational`,
    dedupeKey,
    caller: params.caller,
    reason: params.reason,
    requestGroup,
    taskId,
  });

  if (params.signal?.aborted) {
    logOperationalBundleFetchEnd({ requestId, ok: false, aborted: true });
    finishWorkInboxNetworkTrace(netTrace.traceId, { aborted: true });
    return {
      envelope: {
        ok: false,
        status: 'FAIL',
        data: emptyOperationalBundle(taskId),
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

  let deduped = false;
  let promise = inFlightByTask.get(taskId);

  if (!promise) {
    promise = workInboxOperationalApi.getTaskOperational(taskId, params.signal).finally(() => {
      if (inFlightByTask.get(taskId) === promise) {
        inFlightByTask.delete(taskId);
      }
    });
    inFlightByTask.set(taskId, promise);
  } else {
    deduped = true;
  }

  try {
    const envelope = await promise;
    const stale = Boolean(params.signal?.aborted);
    logOperationalBundleFetchEnd({
      requestId,
      ok: envelope.ok && !stale,
      stale,
      deduped,
    });
    if (stale) {
      finishWorkInboxNetworkTrace(netTrace.traceId, { aborted: true, staleIgnored: true, deduped });
    } else {
      if (envelope.ok && envelope.data) {
        resultCache.set(taskId, { envelope, fetchedAt: Date.now() });
      }
      finishWorkInboxNetworkTrace(netTrace.traceId, { deduped });
    }
    if (!deduped && !stale) {
      ingestWorkInboxLatencyTrace({
        action: 'LOAD_OPERATIONAL_BUNDLE',
        traceId: envelope.traceId ?? requestId,
        taskId,
        totalDurationMs: performance.now() - fetchStarted,
        performanceTrace: extractPerformanceTraceFromEnvelope(
          envelope as unknown as Record<string, unknown>,
        ),
        requestCount: 1,
      });
    }
    return { envelope, requestId, stale, deduped, cacheHit: false };
  } catch {
    const stale = Boolean(params.signal?.aborted);
    logOperationalBundleFetchEnd({ requestId, ok: false, stale, deduped });
    finishWorkInboxNetworkTrace(netTrace.traceId, { aborted: stale, deduped });
    return {
      envelope: {
        ok: false,
        status: 'FAIL',
        data: emptyOperationalBundle(taskId),
        warnings: [],
        errors: ['Không kết nối được API vận hành'],
        traceId: requestId,
      },
      requestId,
      stale,
      deduped,
      cacheHit: false,
    };
  }
}

export function clearOperationalBundleInFlight(taskId?: string): void {
  if (taskId) inFlightByTask.delete(taskId.trim());
  else inFlightByTask.clear();
}
