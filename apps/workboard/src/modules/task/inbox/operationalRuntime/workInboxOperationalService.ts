import type { UserContext } from '@/api/contracts';
import { workInboxOperationalApi } from './workInboxOperationalApi';
import { getActiveWorkInboxTraceId } from '../performance/workInboxPerformanceTrace';
import { appendWorkInboxActionAudit } from '../actionRuntime/workInboxActionAudit';
import type { WorkInboxAuditEvent } from '../actionRuntime/workInboxActionTypes';
import { normalizeWorkInboxRole } from './workInboxOperationalPermissions';
import { getApiBaseUrl, isWorkerApiConfigured } from '@/api/apiBase';

const API_BASE = getApiBaseUrl();

async function postJson<T>(path: string, body: unknown) {
  if (!isWorkerApiConfigured()) return { ok: false as const, data: null as T };
  const traceId = getActiveWorkInboxTraceId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (traceId) headers['X-CBV-Trace-Id'] = traceId;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false as const, data: null as T };
  return { ok: true as const, data: (await res.json()) as T };
}

export async function appendServerActionAudit(params: {
  taskId: string;
  action: WorkInboxAuditEvent | string;
  actor: string;
  operator: UserContext;
  traceId: string;
  beforeState?: string;
  afterState?: string;
  payload?: Record<string, unknown>;
}): Promise<boolean> {
  appendWorkInboxActionAudit({
    taskId: params.taskId,
    action: params.action,
    actor: params.actor,
    traceId: params.traceId,
    meta: params.afterState,
  });

  const res = await postJson<{ ok: boolean }>('/api/work-inbox/audit', {
    taskId: params.taskId,
    traceId: params.traceId,
    action: params.action,
    actor: params.actor,
    actorRole: normalizeWorkInboxRole(params.operator.role),
    beforeState: params.beforeState ?? '',
    afterState: params.afterState ?? '',
    payload: params.payload ?? {},
  });
  return res.ok && (res.data as { ok?: boolean })?.ok !== false;
}

export async function appendOperationalTimeline(params: {
  taskId: string;
  eventType: string;
  eventLabel: string;
  actor: string;
  payload?: Record<string, unknown>;
  traceId?: string;
}): Promise<boolean> {
  const res = await postJson<{ ok: boolean }>('/api/work-inbox/timeline', {
    taskId: params.taskId,
    eventType: params.eventType,
    eventLabel: params.eventLabel,
    actor: params.actor,
    payload: params.payload ?? {},
    traceId: params.traceId,
  });
  return res.ok && (res.data as { ok?: boolean })?.ok !== false;
}

export { workInboxOperationalApi };
