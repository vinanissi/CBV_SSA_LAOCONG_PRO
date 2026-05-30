/**
 * PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — session TTL cache for static runtime endpoints.
 */

import type { ApiEnvelope, ModuleRegistryEntry, ModuleStatusResponse, TaskWriteCapability } from '@/api/contracts';
import { api } from '@/api/client';
import { NETWORK_CACHE_TTL_MS } from './workInboxNetworkCacheConfig';
import { finishWorkInboxNetworkTrace, startWorkInboxNetworkTrace } from './workInboxNetworkTrace';

type CacheSlot<T> = { envelope: ApiEnvelope<T>; fetchedAt: number };

const modulesCache: { entry?: CacheSlot<{ modules: ModuleRegistryEntry[] }> } = {};
const modulesStatusCache: { entry?: CacheSlot<ModuleStatusResponse> } = {};
const writeCapabilityCache: { entry?: CacheSlot<TaskWriteCapability> } = {};

function isFresh<T>(slot: CacheSlot<T> | undefined): slot is CacheSlot<T> {
  return Boolean(slot && Date.now() - slot.fetchedAt < NETWORK_CACHE_TTL_MS.STATIC_RUNTIME);
}

async function loadCached<T>(
  route: string,
  dedupeKey: string,
  slot: { entry?: CacheSlot<T> },
  fetcher: () => Promise<ApiEnvelope<T>>,
): Promise<ApiEnvelope<T>> {
  if (isFresh(slot.entry)) {
    const trace = startWorkInboxNetworkTrace({
      route,
      dedupeKey,
      caller: 'workInboxStaticRuntimeCache',
      reason: 'TTL_HIT',
      requestGroup: 'static_runtime',
    });
    finishWorkInboxNetworkTrace(trace.traceId, { cacheHit: true });
    return slot.entry.envelope;
  }

  const trace = startWorkInboxNetworkTrace({
    route,
    dedupeKey,
    caller: 'workInboxStaticRuntimeCache',
    reason: 'TTL_MISS',
    requestGroup: 'static_runtime',
  });

  const envelope = await fetcher();
  if (envelope.ok && envelope.data) {
    slot.entry = { envelope, fetchedAt: Date.now() };
  }
  finishWorkInboxNetworkTrace(trace.traceId, {});
  return envelope;
}

let modulesInFlight: Promise<ApiEnvelope<{ modules: ModuleRegistryEntry[] }>> | null = null;
let statusInFlight: Promise<ApiEnvelope<ModuleStatusResponse>> | null = null;
let writeCapInFlight: Promise<ApiEnvelope<TaskWriteCapability>> | null = null;

export function invalidateStaticRuntimeCache(): void {
  modulesCache.entry = undefined;
  modulesStatusCache.entry = undefined;
  writeCapabilityCache.entry = undefined;
}

export async function getCachedModules(): Promise<ApiEnvelope<{ modules: ModuleRegistryEntry[] }>> {
  if (isFresh(modulesCache.entry)) {
    const trace = startWorkInboxNetworkTrace({
      route: '/api/modules',
      dedupeKey: 'static:modules',
      caller: 'getCachedModules',
      reason: 'TTL_HIT',
      requestGroup: 'static_runtime',
    });
    finishWorkInboxNetworkTrace(trace.traceId, { cacheHit: true });
    return modulesCache.entry.envelope;
  }
  if (!modulesInFlight) {
    modulesInFlight = loadCached('/api/modules', 'static:modules', modulesCache, () => api.getModules()).finally(
      () => {
        modulesInFlight = null;
      },
    );
  }
  return modulesInFlight;
}

export async function getCachedModulesStatus(): Promise<ApiEnvelope<ModuleStatusResponse>> {
  if (isFresh(modulesStatusCache.entry)) {
    const trace = startWorkInboxNetworkTrace({
      route: '/api/modules/status',
      dedupeKey: 'static:modules-status',
      caller: 'getCachedModulesStatus',
      reason: 'TTL_HIT',
      requestGroup: 'static_runtime',
    });
    finishWorkInboxNetworkTrace(trace.traceId, { cacheHit: true });
    return modulesStatusCache.entry.envelope;
  }
  if (!statusInFlight) {
    statusInFlight = loadCached(
      '/api/modules/status',
      'static:modules-status',
      modulesStatusCache,
      () => api.getModulesStatus(),
    ).finally(() => {
      statusInFlight = null;
    });
  }
  return statusInFlight;
}

export async function getCachedTaskWriteCapability(): Promise<ApiEnvelope<TaskWriteCapability>> {
  if (isFresh(writeCapabilityCache.entry)) {
    const trace = startWorkInboxNetworkTrace({
      route: '/api/tasks/write-capability',
      dedupeKey: 'static:write-capability',
      caller: 'getCachedTaskWriteCapability',
      reason: 'TTL_HIT',
      requestGroup: 'static_runtime',
    });
    finishWorkInboxNetworkTrace(trace.traceId, { cacheHit: true });
    return writeCapabilityCache.entry.envelope;
  }
  if (!writeCapInFlight) {
    writeCapInFlight = loadCached(
      '/api/tasks/write-capability',
      'static:write-capability',
      writeCapabilityCache,
      () => api.getTaskWriteCapability(),
    ).finally(() => {
      writeCapInFlight = null;
    });
  }
  return writeCapInFlight;
}
