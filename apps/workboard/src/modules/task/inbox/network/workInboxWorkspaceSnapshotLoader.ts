/**
 * PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — deduped workspace snapshot loader with TTL.
 */

import type { ApiEnvelope, TaskWorkspaceSnapshot } from '@/api/contracts';
import { api } from '@/api/client';
import { NETWORK_CACHE_TTL_MS } from './workInboxNetworkCacheConfig';
import {
  finishWorkInboxNetworkTrace,
  startWorkInboxNetworkTrace,
  type WorkInboxNetworkRequestGroup,
} from './workInboxNetworkTrace';

export interface WorkspaceSnapshotParams {
  limit?: number;
  status?: string;
  assignee?: string;
  priority?: string;
  q?: string;
}

export interface LoadWorkspaceSnapshotOptions {
  params?: WorkspaceSnapshotParams;
  caller: string;
  reason: string;
  requestGroup: WorkInboxNetworkRequestGroup;
  force?: boolean;
  signal?: AbortSignal;
}

export interface LoadWorkspaceSnapshotResult {
  envelope: ApiEnvelope<TaskWorkspaceSnapshot>;
  dedupeKey: string;
  deduped: boolean;
  cacheHit: boolean;
}

interface ResultCacheEntry {
  envelope: ApiEnvelope<TaskWorkspaceSnapshot>;
  fetchedAt: number;
}

function buildDedupeKey(params?: WorkspaceSnapshotParams): string {
  const p = params ?? {};
  return `workspace-snapshot:${p.limit ?? ''}:${p.status ?? ''}:${p.assignee ?? ''}:${p.priority ?? ''}:${p.q ?? ''}`;
}

const inFlightByKey = new Map<string, Promise<ApiEnvelope<TaskWorkspaceSnapshot>>>();
const resultCache = new Map<string, ResultCacheEntry>();

function isCacheFresh(entry: ResultCacheEntry | undefined): boolean {
  return Boolean(entry && Date.now() - entry.fetchedAt < NETWORK_CACHE_TTL_MS.WORKSPACE_SNAPSHOT);
}

export function invalidateWorkspaceSnapshotResultCache(dedupeKey?: string): void {
  if (dedupeKey) resultCache.delete(dedupeKey);
  else resultCache.clear();
}

export async function loadWorkspaceSnapshotNetwork(
  options: LoadWorkspaceSnapshotOptions,
): Promise<LoadWorkspaceSnapshotResult> {
  const dedupeKey = buildDedupeKey(options.params);
  const route = '/api/tasks/workspace-snapshot';

  if (options.signal?.aborted) {
    return {
      envelope: {
        ok: false,
        status: 'FAIL',
        data: null as unknown as TaskWorkspaceSnapshot,
        warnings: [],
        errors: ['Aborted'],
        traceId: `ws-abort-${Date.now()}`,
      },
      dedupeKey,
      deduped: false,
      cacheHit: false,
    };
  }

  const cached = resultCache.get(dedupeKey);
  if (!options.force && isCacheFresh(cached)) {
    const trace = startWorkInboxNetworkTrace({
      route,
      dedupeKey,
      caller: options.caller,
      reason: options.reason,
      requestGroup: options.requestGroup,
    });
    finishWorkInboxNetworkTrace(trace.traceId, { cacheHit: true });
    return { envelope: cached!.envelope, dedupeKey, deduped: false, cacheHit: true };
  }

  const trace = startWorkInboxNetworkTrace({
    route,
    dedupeKey,
    caller: options.caller,
    reason: options.reason,
    requestGroup: options.requestGroup,
  });

  let deduped = false;
  let promise = inFlightByKey.get(dedupeKey);
  if (!promise) {
    promise = api.getTaskWorkspaceSnapshot(options.params).finally(() => {
      if (inFlightByKey.get(dedupeKey) === promise) inFlightByKey.delete(dedupeKey);
    });
    inFlightByKey.set(dedupeKey, promise);
  } else {
    deduped = true;
  }

  try {
    const envelope = await promise;
    if (envelope.ok && envelope.data) {
      resultCache.set(dedupeKey, { envelope, fetchedAt: Date.now() });
    }
    finishWorkInboxNetworkTrace(trace.traceId, { deduped });
    return { envelope, dedupeKey, deduped, cacheHit: false };
  } catch {
    finishWorkInboxNetworkTrace(trace.traceId, { aborted: true, deduped });
    return {
      envelope: {
        ok: false,
        status: 'FAIL',
        data: null as unknown as TaskWorkspaceSnapshot,
        warnings: [],
        errors: ['Không kết nối được workspace snapshot'],
        traceId: `ws-net-${Date.now()}`,
      },
      dedupeKey,
      deduped,
      cacheHit: false,
    };
  }
}
