import type { CreateTaskBody, Env, TaskWriteEvent, UpdateTaskBody, UserContext } from '../contracts';
import { getEnv } from '../env';
import { createTaskLocal, getWrittenTask, updateTaskLocal } from './taskWriteStore';
import type { StoredTask } from '../auth/taskPermissions';

const TIMEOUT_MS = 8000;

export type WriteAdapterStatus = 'LOCAL' | 'GAS' | 'NOT_CONFIGURED';

export function getTaskWriteAdapterStatus(env: Env): WriteAdapterStatus {
  const { taskWriteMode, gasWriteBaseUrl } = getEnv(env);
  if (taskWriteMode === 'local') return 'LOCAL';
  if (gasWriteBaseUrl) return 'GAS';
  return 'NOT_CONFIGURED';
}

export function isTaskWriteEnabled(env: Env): boolean {
  return getTaskWriteAdapterStatus(env) !== 'NOT_CONFIGURED';
}

export async function writeCreateTask(
  env: Env,
  body: CreateTaskBody,
  user: UserContext,
  traceId: string,
): Promise<{ ok: true; task: StoredTask; event: TaskWriteEvent } | { ok: false; code: string; message: string }> {
  const status = getTaskWriteAdapterStatus(env);

  if (status === 'NOT_CONFIGURED') {
    return { ok: false, code: 'WRITE_ADAPTER_NOT_CONFIGURED', message: 'Chức năng ghi chưa được bật cho môi trường này' };
  }

  if (status === 'GAS') {
    const gas = await postGasWrite(env, '/tasks', body);
    if (!gas.ok) return { ok: false, code: gas.code, message: gas.message };
    return { ok: true, ...gas.result };
  }

  const result = createTaskLocal(body, user, traceId);
  return { ok: true, ...result };
}

export async function writeUpdateTask(
  env: Env,
  taskId: string,
  body: UpdateTaskBody,
  user: UserContext,
  traceId: string,
): Promise<{ ok: true; task: StoredTask; event: TaskWriteEvent } | { ok: false; code: string; message: string }> {
  const status = getTaskWriteAdapterStatus(env);

  if (status === 'NOT_CONFIGURED') {
    return { ok: false, code: 'WRITE_ADAPTER_NOT_CONFIGURED', message: 'Chức năng ghi chưa được bật cho môi trường này' };
  }

  if (status === 'GAS') {
    const gas = await postGasWrite(env, `/tasks/${taskId}`, body, 'PATCH');
    if (!gas.ok) return { ok: false, code: gas.code, message: gas.message };
    return { ok: true, ...gas.result };
  }

  const existing = getWrittenTask(taskId);
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy việc' };
  }

  const result = updateTaskLocal(taskId, body, user, traceId);
  if (!result) return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy việc' };
  return { ok: true, ...result };
}

async function postGasWrite(
  env: Env,
  path: string,
  body: unknown,
  method = 'POST',
): Promise<
  | { ok: true; result: { task: StoredTask; event: TaskWriteEvent } }
  | { ok: false; code: string; message: string }
> {
  const { gasWriteBaseUrl } = getEnv(env);
  if (!gasWriteBaseUrl) {
    return { ok: false, code: 'WRITE_ADAPTER_NOT_CONFIGURED', message: 'GAS write adapter chưa cấu hình' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${gasWriteBaseUrl}${path}`, {
      method,
      signal: controller.signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { ok: false, code: 'GAS_WRITE_FAILED', message: `GAS write trả lỗi ${res.status}` };
    }
    const json = (await res.json()) as { data?: { task: StoredTask; event: TaskWriteEvent } };
    if (!json.data?.task) {
      return { ok: false, code: 'GAS_WRITE_INVALID', message: 'GAS write response không hợp lệ' };
    }
    return { ok: true, result: json.data };
  } catch {
    return { ok: false, code: 'GAS_WRITE_TIMEOUT', message: 'GAS write adapter không phản hồi' };
  } finally {
    clearTimeout(timer);
  }
}
