import type { CreateTaskBody, Env, TaskDetail, TaskItem, UserContext } from '../contracts';
import { getTaskDbEnv, getEnv } from '../env';
import { createTraceId } from '../utils/envelope';

const TIMEOUT_SNAPSHOT_MS = 8000;
const TIMEOUT_DETAIL_MS = 5000;
const TIMEOUT_WRITE_MS = 8000;
const WORKER_SNAPSHOT_CACHE_MS = 30_000;
const WORKER_SNAPSHOT_STALE_MS = 120_000;

export type SnapshotCacheSource = 'worker' | 'gas' | 'stale';

export interface TaskDbGasEnvelope<T> {
  ok: boolean;
  action?: string;
  code?: string;
  traceId: string;
  data: T;
  warnings: string[];
  errors: string[];
  status?: string;
  allowedActions?: string[];
  performanceTrace?: Record<string, unknown>;
}

export type TaskDbCallResult<T> =
  | {
      ok: true;
      data: T;
      warnings: string[];
      traceId: string;
      workerCacheHit?: boolean;
      performanceTrace?: Record<string, unknown>;
      workerLatencyMs?: number;
    }
  | {
      ok: false;
      code: string;
      message: string;
      retryable: boolean;
      traceId?: string;
      performanceTrace?: Record<string, unknown>;
    };

export interface TaskWorkspaceRuntime {
  mode: string;
  dbSheet: string;
  sheetId: string;
  lastSyncAt: string;
  cacheHit: boolean;
  connected?: boolean;
  latencyMs?: number;
  workerLatencyMs?: number;
  workerCacheHit?: boolean;
  cacheTtlSec?: number;
  gasDurationMs?: number;
  sheetReadMs?: number;
  mappingMs?: number;
  rowsScanned?: number;
  rowsReturned?: number;
  payloadBytesApprox?: number;
  generatedAt?: string;
  cacheSource?: SnapshotCacheSource;
  stale?: boolean;
}

export interface TaskWorkspaceSnapshot {
  tasks: TaskItem[];
  counts: {
    total: number;
    open: number;
    inProgress: number;
    blocked: number;
    done: number;
    dueToday: number;
    overdue: number;
    noOwner?: number;
  };
  blockedTasks: TaskItem[];
  dueTasks: TaskItem[];
  overdueTasks: TaskItem[];
  userDisplayMap?: Record<string, string>;
  usersById?: Record<string, { id: string; userCode: string; displayName: string; role?: string; email?: string }>;
  runtimeUsersById?: Record<string, Record<string, unknown>>;
  runtime: TaskWorkspaceRuntime;
  schemaWarnings?: string[];
}

export interface TaskDbValidateResult {
  ok: boolean;
  spreadsheetId: string;
  mode: string;
  sheets: Record<string, { exists: boolean; headers: string[]; missing: string[]; unknown: string[] }>;
  missingRequired: string[];
  warnings: string[];
}

export interface SnapshotFilters {
  status?: string;
  assignee?: string;
  priority?: string;
  q?: string;
  limit?: number;
}

interface WorkerCacheEntry<T> {
  data: T;
  expiresAt: number;
  staleUntil: number;
  key: string;
}

const workerSnapshotCache = new Map<string, WorkerCacheEntry<TaskWorkspaceSnapshot>>();

function snapshotDataCacheKey(filters: SnapshotFilters): string {
  return JSON.stringify(filters);
}

function getWorkerSnapshotCache(key: string, allowStale = false): TaskWorkspaceSnapshot | null {
  const hit = workerSnapshotCache.get(key);
  if (!hit) return null;
  const now = Date.now();
  if (now <= hit.expiresAt) return hit.data;
  if (allowStale && now <= hit.staleUntil) return hit.data;
  workerSnapshotCache.delete(key);
  return null;
}

function setWorkerSnapshotCache(key: string, data: TaskWorkspaceSnapshot): void {
  const now = Date.now();
  workerSnapshotCache.set(key, {
    data,
    expiresAt: now + WORKER_SNAPSHOT_CACHE_MS,
    staleUntil: now + WORKER_SNAPSHOT_STALE_MS,
    key,
  });
}

export function invalidateWorkerSnapshotCache(): void {
  workerSnapshotCache.clear();
}

function enrichSnapshotForUser(data: TaskWorkspaceSnapshot, user: UserContext): TaskWorkspaceSnapshot {
  const today = new Date().toISOString().slice(0, 10);
  const enrich = (tasks: TaskItem[]) =>
    tasks.map((t) => ({
      ...t,
      isMine: t.ownerId === user.userId || t.owner === user.displayName,
      isOverdue: Boolean(t.dueDate && t.dueDate < today && t.status !== 'DONE'),
      permissionAllowed: true,
    }));
  return {
    ...data,
    tasks: enrich(data.tasks ?? []),
    blockedTasks: enrich(data.blockedTasks ?? []),
    dueTasks: enrich(data.dueTasks ?? []),
    overdueTasks: enrich(data.overdueTasks ?? []),
  };
}

function withRuntimeSource(
  data: TaskWorkspaceSnapshot,
  source: SnapshotCacheSource,
  workerCacheHit: boolean,
  workerLatencyMs?: number,
  stale?: boolean,
): TaskWorkspaceSnapshot {
  return {
    ...data,
    runtime: {
      ...data.runtime,
      workerCacheHit,
      cacheSource: source,
      stale: stale ?? false,
      workerLatencyMs: workerLatencyMs ?? data.runtime.workerLatencyMs,
      cacheHit: source === 'gas' ? data.runtime.cacheHit : true,
    },
  };
}

function actorPayload(user: UserContext) {
  return {
    userId: user.userId,
    displayName: user.displayName,
    role: user.role,
    email: user.email,
  };
}

function timeoutForAction(action: string): number {
  if (action === 'getTaskWorkspaceSnapshot') return TIMEOUT_SNAPSHOT_MS;
  if (action === 'getTaskDetail') return TIMEOUT_DETAIL_MS;
  return TIMEOUT_WRITE_MS;
}

function mapGasError(errors: string[], json?: TaskDbGasEnvelope<unknown>): TaskDbCallResult<never> | null {
  const joined = (errors ?? []).join(' ').toLowerCase();
  if (joined.includes('google_sheet_rate_limit') || joined.includes('rate')) {
    return {
      ok: false,
      code: 'GOOGLE_SHEET_RATE_LIMIT',
      message:
        'Google Sheet đang quá tải tạm thời. Đang hiển thị dữ liệu gần nhất.',
      retryable: true,
    };
  }
  if (json?.code === 'UNKNOWN_ACTION') {
    return {
      ok: false,
      code: 'UNKNOWN_ACTION',
      message: json.errors?.[0] ?? 'Action không được phép',
      retryable: false,
    };
  }
  return null;
}

export async function callTaskDbGas<T>(
  env: Env,
  action: string,
  payload: Record<string, unknown> = {},
  user?: UserContext,
  traceId?: string,
): Promise<TaskDbCallResult<T>> {
  const cfg = getTaskDbEnv(env);
  const tid = traceId ?? createTraceId();
  const timeoutMs = timeoutForAction(action);

  if (!cfg.isConfigured) {
    return {
      ok: false,
      code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED',
      message: 'Google Sheet runtime chưa cấu hình.',
      retryable: false,
      traceId: tid,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const workerFetchStartMs = Date.now();

  try {
    const res = await fetch(cfg.gasTaskApiUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CBV-Trace-Id': tid,
      },
      body: JSON.stringify({
        token: cfg.gasTaskApiToken,
        action,
        payload,
        traceId: tid,
        actor: user ? actorPayload(user) : 'worker',
      }),
      redirect: 'follow',
    });

    const workerFetchHeadersReceivedMs = Date.now() - workerFetchStartMs;
    const workerLatencyMs = workerFetchHeadersReceivedMs;

    if (!res.ok) {
      if (res.status === 429) {
        return {
          ok: false,
          code: 'GOOGLE_SHEET_RATE_LIMIT',
          message: 'Google Sheet đang quá tải tạm thời. Đang hiển thị dữ liệu gần nhất.',
          retryable: true,
          traceId: tid,
        };
      }
      return { ok: false, code: 'GAS_TASK_DB_ERROR', message: `GAS trả lỗi ${res.status}`, retryable: false, traceId: tid };
    }

    const json = (await res.json()) as TaskDbGasEnvelope<T>;
    const workerFetchBodyReadMs = Date.now() - workerFetchStartMs - workerFetchHeadersReceivedMs;
    const workerFetchEndMs = Date.now() - workerFetchStartMs;
    const gasPerf = json.performanceTrace;
    if (gasPerf && typeof gasPerf === 'object') {
      const gp = gasPerf as Record<string, unknown>;
      const gas = (gp.gas as Record<string, unknown>) ?? {};
      const gasTotalMs = typeof gas.totalMs === 'number' ? gas.totalMs : undefined;
      const platformOverheadMs =
        gasTotalMs !== undefined ? Math.max(0, workerFetchEndMs - gasTotalMs) : undefined;
      gp.worker = {
        workerFetchStartMs: 0,
        workerFetchHeadersReceivedMs,
        workerFetchBodyReadMs,
        workerFetchEndMs,
        workerResponseSerializedMs: workerFetchBodyReadMs,
        workerToGasGapMs: platformOverheadMs,
      };
    }
    if (!json.ok) {
      const mapped = mapGasError(json.errors ?? [], json);
      if (mapped) return { ...mapped, traceId: json.traceId ?? tid };
      return {
        ok: false,
        code: json.code ?? 'GAS_TASK_DB_FAILED',
        message: json.errors?.[0] ?? 'GAS task DB request failed',
        retryable: false,
        traceId: json.traceId ?? tid,
      };
    }

    const data = json.data as T & { runtime?: TaskWorkspaceRuntime };
    if (data && typeof data === 'object' && data.runtime) {
      data.runtime.workerLatencyMs = workerLatencyMs;
      if (data.runtime.gasDurationMs && data.runtime.gasDurationMs >= 2000) {
        // surface slow runtime via warnings in handler layer
      }
    }

    return {
      ok: true,
      data: json.data,
      warnings: json.warnings ?? [],
      traceId: json.traceId ?? tid,
      performanceTrace: gasPerf,
      workerLatencyMs,
    };
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      code: isAbort ? 'GOOGLE_SHEET_TIMEOUT' : 'GAS_TASK_DB_TIMEOUT',
      message: isAbort ? 'Google Sheet runtime phản hồi chậm — thử lại sau' : 'GAS task DB không phản hồi',
      retryable: true,
      traceId: tid,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function isTaskDbRuntimeConfigured(env: Env): boolean {
  return getTaskDbEnv(env).isConfigured;
}

export function isTaskDbRuntimeMode(env: Env): boolean {
  const cfg = getTaskDbEnv(env);
  if (cfg.runtimeMode === 'google_sheet_existing_db' && cfg.isConfigured) return true;
  const writeMode = getEnv(env).taskWriteMode;
  return writeMode === 'gas' && cfg.isConfigured && !cfg.runtimeMode;
}

export async function gsTaskDbHealth(env: Env) {
  return callTaskDbGas<{ service: string; version: string; mode: string }>(env, 'health');
}

export async function gsTaskDbValidate(env: Env) {
  return callTaskDbGas<TaskDbValidateResult>(env, 'validateExistingDb');
}

export async function gsGetTaskWorkspaceSnapshot(env: Env, user: UserContext, filters: SnapshotFilters = {}) {
  const cacheKey = snapshotDataCacheKey(filters);
  const fresh = getWorkerSnapshotCache(cacheKey, false);
  if (fresh) {
    const enriched = enrichSnapshotForUser(fresh, user);
    return {
      ok: true as const,
      data: withRuntimeSource(enriched, 'worker', true, undefined, false),
      warnings: ['Worker snapshot cache hit'],
      traceId: createTraceId(),
      workerCacheHit: true,
    };
  }

  const workerStart = Date.now();
  const result = await callTaskDbGas<TaskWorkspaceSnapshot>(env, 'getTaskWorkspaceSnapshot', { filters }, user);

  if (!result.ok) {
    const stale = getWorkerSnapshotCache(cacheKey, true);
    if (stale) {
      const enriched = enrichSnapshotForUser(stale, user);
      const workerLatencyMs = Date.now() - workerStart;
      return {
        ok: true as const,
        data: withRuntimeSource(enriched, 'stale', true, workerLatencyMs, true),
        warnings: [
          result.message ?? 'GAS snapshot failed',
          'STALE_SNAPSHOT — dữ liệu có thể chưa đồng bộ',
        ],
        traceId: result.traceId ?? createTraceId(),
        workerCacheHit: true,
      };
    }
    return result;
  }

  const workerLatencyMs = Date.now() - workerStart;
  const raw = result.data;
  setWorkerSnapshotCache(cacheKey, raw);

  const enriched = enrichSnapshotForUser(
    {
      ...raw,
      runtime: {
        ...raw.runtime,
        workerLatencyMs,
      },
    },
    user,
  );

  const gasSource: SnapshotCacheSource = 'gas';
  const data = withRuntimeSource(enriched, gasSource, false, workerLatencyMs, false);

  const gasMs = data.runtime?.gasDurationMs ?? data.runtime?.latencyMs ?? 0;
  const warnings = [...result.warnings];
  if (gasMs >= 2000 && !data.runtime?.cacheHit) {
    warnings.push('GOOGLE_SHEET_RUNTIME_SLOW');
  }

  return { ...result, data, warnings, workerCacheHit: false };
}

export async function gsGetTaskDetail(env: Env, user: UserContext, taskId: string) {
  return callTaskDbGas<TaskDetail>(env, 'getTaskDetail', { taskId }, user);
}

export async function gsCreateTask(env: Env, body: CreateTaskBody, user: UserContext, traceId: string) {
  invalidateWorkerSnapshotCache();
  return callTaskDbGas<{ task: TaskDetail; log: Record<string, unknown> }>(
    env,
    'createTask',
    body as unknown as Record<string, unknown>,
    user,
    traceId,
  );
}

export async function gsUpdateTaskStatus(
  env: Env,
  taskId: string,
  status: string,
  actor: UserContext,
  note?: string,
  traceId?: string,
) {
  invalidateWorkerSnapshotCache();
  return callTaskDbGas<{ task: TaskDetail; log: Record<string, unknown> }>(
    env,
    'updateTaskStatus',
    { taskId, status, note },
    actor,
    traceId,
  );
}

export async function gsAssignTask(
  env: Env,
  taskId: string,
  assignee: string,
  actor: UserContext,
  note?: string,
  traceId?: string,
) {
  invalidateWorkerSnapshotCache();
  return callTaskDbGas<{ task: TaskDetail; log: Record<string, unknown> }>(
    env,
    'assignTask',
    { taskId, assignee, note },
    actor,
    traceId,
  );
}

export async function gsAddTaskComment(
  env: Env,
  taskId: string,
  comment: string,
  actor: UserContext,
  traceId?: string,
) {
  invalidateWorkerSnapshotCache();
  return callTaskDbGas<{ log: Record<string, unknown> }>(env, 'addTaskComment', { taskId, comment }, actor, traceId);
}

export async function gsCompleteTask(env: Env, taskId: string, actor: UserContext, note?: string, traceId?: string) {
  invalidateWorkerSnapshotCache();
  return callTaskDbGas<{ task: TaskDetail; log: Record<string, unknown> }>(
    env,
    'completeTask',
    { taskId, note },
    actor,
    traceId,
  );
}
