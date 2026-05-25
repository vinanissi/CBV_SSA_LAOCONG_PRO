import type {
  CreateTaskBody,
  Env,
  TaskDetail,
  TaskFilter,
  TaskItem,
  TaskWriteEvent,
  UpdateTaskBody,
  UserContext,
} from '../contracts';
import { getEnv } from '../env';
import type { StoredTask } from '../auth/taskPermissions';

const TIMEOUT_MS = 15000;

export interface GasEnvelope<T> {
  ok: boolean;
  status: string;
  data: T;
  warnings: string[];
  errors: string[];
  traceId: string;
}

export type GasCallResult<T> =
  | { ok: true; data: T; warnings: string[]; traceId: string }
  | { ok: false; warning?: string; errors: string[]; traceId?: string };

function resolveGasBaseUrl(env: Env): string {
  const { gasBaseUrl, gasWriteBaseUrl, taskWriteMode } = getEnv(env);
  if (gasBaseUrl) return gasBaseUrl.replace(/\/+$/, '');
  if (taskWriteMode === 'gas' && gasWriteBaseUrl) return gasWriteBaseUrl.replace(/\/+$/, '');
  return '';
}

function actorPayload(user: UserContext) {
  return {
    userId: user.userId,
    displayName: user.displayName,
    role: user.role,
    email: user.email,
  };
}

async function callGasGet<T>(
  env: Env,
  action: string,
  params: Record<string, string> = {},
  user?: UserContext,
): Promise<GasCallResult<T>> {
  const base = resolveGasBaseUrl(env);
  if (!base) {
    return { ok: false, warning: 'GAS adapter chưa cấu hình — dùng projection local', errors: [] };
  }

  const qs = new URLSearchParams({ action, ...params });
  if (user) {
    qs.set('actorUserId', user.userId);
    qs.set('actorName', user.displayName);
    qs.set('actorRole', user.role);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${base}?${qs.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      redirect: 'follow',
    });
    if (!res.ok) {
      return { ok: false, errors: [`GAS adapter trả lỗi ${res.status}`] };
    }
    const json = (await res.json()) as GasEnvelope<T>;
    if (!json.ok) {
      return { ok: false, errors: json.errors?.length ? json.errors : ['GAS request failed'], traceId: json.traceId };
    }
    return { ok: true, data: json.data, warnings: json.warnings ?? [], traceId: json.traceId };
  } catch {
    return { ok: false, warning: 'GAS adapter không phản hồi — dùng projection local', errors: ['GAS_TIMEOUT'] };
  } finally {
    clearTimeout(timer);
  }
}

async function callGasPost<T>(
  env: Env,
  action: string,
  payload: Record<string, unknown>,
  user: UserContext,
  traceId: string,
): Promise<GasCallResult<T>> {
  const base = resolveGasBaseUrl(env);
  if (!base) {
    return { ok: false, errors: ['GAS write adapter chưa cấu hình'], traceId };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(base, {
      method: 'POST',
      signal: controller.signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload, traceId, _actor: actorPayload(user) }),
      redirect: 'follow',
    });
    if (!res.ok) {
      return { ok: false, errors: [`GAS write trả lỗi ${res.status}`], traceId };
    }
    const json = (await res.json()) as GasEnvelope<T>;
    if (!json.ok) {
      return { ok: false, errors: json.errors?.length ? json.errors : ['GAS write failed'], traceId: json.traceId ?? traceId };
    }
    return { ok: true, data: json.data, warnings: json.warnings ?? [], traceId: json.traceId ?? traceId };
  } catch {
    return { ok: false, errors: ['GAS write adapter không phản hồi'], traceId };
  } finally {
    clearTimeout(timer);
  }
}

export function gasAdapterStatus(env: Env): string {
  return resolveGasBaseUrl(env) ? 'CONFIGURED' : 'NOT_CONFIGURED';
}

export function isGasConfigured(env: Env): boolean {
  return Boolean(resolveGasBaseUrl(env));
}

export async function gasHealth(env: Env) {
  return callGasGet<{ service: string; version: string }>(env, 'health');
}

export async function gasGetTasks(env: Env, user: UserContext, filter?: TaskFilter) {
  const params: Record<string, string> = {};
  if (filter) params.filter = filter;
  const result = await callGasGet<TaskItem[]>(env, 'tasks', params, user);
  if (!result.ok || !Array.isArray(result.data)) return result;

  const today = new Date().toISOString().slice(0, 10);
  const items = result.data.map((t) => ({
    ...t,
    isMine: t.ownerId === user.userId || t.owner === user.displayName,
    isOverdue: Boolean(t.dueDate && t.dueDate < today && t.status !== 'DONE'),
    permissionAllowed: true,
  }));

  if (filter === 'mine') {
    return { ...result, data: items.filter((t) => t.isMine) };
  }
  return { ...result, data: items };
}

export async function gasGetTaskDetail(env: Env, user: UserContext, taskId: string) {
  return callGasGet<TaskDetail>(env, 'task_detail', { taskId }, user);
}

export async function gasCreateTask(
  env: Env,
  body: CreateTaskBody,
  user: UserContext,
  traceId: string,
): Promise<
  | { ok: true; task: StoredTask; event: TaskWriteEvent; warnings: string[] }
  | { ok: false; code: string; message: string }
> {
  const result = await callGasPost<{ task: StoredTask; event: TaskWriteEvent }>(
    env,
    'create_task',
    body as unknown as Record<string, unknown>,
    user,
    traceId,
  );
  if (!result.ok) {
    const code = result.errors.includes('GAS_TIMEOUT') ? 'GAS_WRITE_TIMEOUT' : 'GAS_WRITE_FAILED';
    return { ok: false, code, message: result.errors[0] ?? 'GAS write failed' };
  }
  if (!result.data?.task) {
    return { ok: false, code: 'GAS_WRITE_INVALID', message: 'GAS write response không hợp lệ' };
  }
  return { ok: true, task: result.data.task, event: result.data.event, warnings: result.warnings };
}

export async function gasUpdateTask(
  env: Env,
  taskId: string,
  body: UpdateTaskBody,
  user: UserContext,
  traceId: string,
): Promise<
  | { ok: true; task: StoredTask; event: TaskWriteEvent; warnings: string[] }
  | { ok: false; code: string; message: string }
> {
  const result = await callGasPost<{ task: StoredTask; event: TaskWriteEvent }>(
    env,
    'update_task',
    { ...body, taskId } as Record<string, unknown>,
    user,
    traceId,
  );
  if (!result.ok) {
    const code = result.errors.includes('GAS_TIMEOUT') ? 'GAS_WRITE_TIMEOUT' : 'GAS_WRITE_FAILED';
    return { ok: false, code, message: result.errors[0] ?? 'GAS write failed' };
  }
  if (!result.data?.task) {
    return { ok: false, code: 'GAS_WRITE_INVALID', message: 'GAS write response không hợp lệ' };
  }
  return { ok: true, task: result.data.task, event: result.data.event, warnings: result.warnings };
}

/** @deprecated Use gasGetTasks — kept for backward compat during RF migration */
export async function fetchGasProjection(
  env: Env,
  path: string,
): Promise<{ ok: boolean; data?: unknown; warning?: string }> {
  if (!isGasConfigured(env)) {
    return { ok: false, warning: 'GAS adapter chưa cấu hình — dùng projection local' };
  }
  const action = path.includes('task') ? 'tasks' : 'health';
  const result = await callGasGet(env, action);
  if (!result.ok) return { ok: false, warning: result.warning ?? result.errors[0] };
  return { ok: true, data: result.data };
}
