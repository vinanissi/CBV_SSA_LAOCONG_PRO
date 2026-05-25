import type { CreateTaskBody, Env, UpdateTaskBody, UserContext } from '../contracts';
import { getEnv } from '../env';
import { createTaskLocal, getWrittenTask, updateTaskLocal } from './taskWriteStore';
import { gasCreateTask, gasUpdateTask, isGasConfigured } from './gasAdapter';
import type { StoredTask } from '../auth/taskPermissions';
import type { TaskWriteEvent } from '../contracts';

export type WriteAdapterStatus = 'LOCAL' | 'GAS' | 'NOT_CONFIGURED';

export function getTaskWriteAdapterStatus(env: Env): WriteAdapterStatus {
  const { taskWriteMode } = getEnv(env);
  if (taskWriteMode === 'local') return 'LOCAL';
  if (taskWriteMode === 'gas' && isGasConfigured(env)) return 'GAS';
  if (taskWriteMode === 'gas') return 'NOT_CONFIGURED';
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
    const gas = await gasCreateTask(env, body, user, traceId);
    if (!gas.ok) return { ok: false, code: gas.code, message: gas.message };
    return { ok: true, task: gas.task, event: gas.event };
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
    const gas = await gasUpdateTask(env, taskId, body, user, traceId);
    if (!gas.ok) return { ok: false, code: gas.code, message: gas.message };
    return { ok: true, task: gas.task, event: gas.event };
  }

  const existing = getWrittenTask(taskId);
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy việc' };
  }

  const result = updateTaskLocal(taskId, body, user, traceId);
  if (!result) return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy việc' };
  return { ok: true, ...result };
}
