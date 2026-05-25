import type { Env, TaskFilter } from '../contracts';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { getTasks, getTaskDetail } from '../adapters/mockData';
import { getWrittenTask } from '../adapters/taskWriteStore';
import { gasGetTasks, gasGetTaskDetail, isGasConfigured } from '../adapters/gasAdapter';
import { isGasRuntimeMode } from '../env';
import { createEnvelope } from '../utils/envelope';
import { forbidden, notFound } from '../utils/errors';

export async function handleTasksList(request: Request, env: Env, filter?: TaskFilter) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) {
    return forbidden('Không có quyền xem việc');
  }

  const gasRuntime = isGasRuntimeMode(env);
  const warnings: string[] = [];

  if (isGasConfigured(env)) {
    const gas = await gasGetTasks(env, user, filter);
    if (gas.ok && Array.isArray(gas.data)) {
      if (gas.warnings.length) warnings.push(...gas.warnings);
      warnings.push('GAS Sheet runtime — RF_12');
      return createEnvelope(applyFilter(gas.data, user, filter), { warnings });
    }
    const failMsg = !gas.ok ? (gas.warning ?? gas.errors[0] ?? 'GAS read failed') : 'GAS read failed';
    if (gasRuntime) {
      return createEnvelope(null, {
        ok: false,
        status: 'FAIL',
        errors: [failMsg],
        warnings: ['GAS runtime mode — không fallback mock'],
      });
    }
    warnings.push(failMsg);
  } else if (gasRuntime) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['CBV_GAS_API_BASE_URL chưa cấu hình'],
      warnings: ['GAS runtime mode — không fallback mock'],
    });
  } else {
    warnings.push('Worker projection — demo local');
  }

  return createEnvelope(getTasksMerged(user, filter), { warnings });
}

function getTasksMerged(user: ReturnType<typeof resolveUserContext>, filter?: TaskFilter) {
  const demoAll = getTasks(user, undefined);
  const byId = new Map(demoAll.map((t) => [t.taskId, t]));
  return applyFilter(Array.from(byId.values()), user, filter);
}

function applyFilter(items: ReturnType<typeof getTasks>, user: ReturnType<typeof resolveUserContext>, filter?: TaskFilter) {
  switch (filter) {
    case 'mine':
      return items.filter((t) => t.ownerId === user.userId || t.isMine);
    case 'pending':
      return items.filter((t) => ['NEW', 'WAITING', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status));
    case 'overdue':
      return items.filter((t) => t.isOverdue);
    case 'approval':
      return items.filter((t) => t.status === 'WAITING' || t.status === 'WAITING_APPROVAL');
    default:
      return items;
  }
}

export async function handleTaskDetail(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) {
    return forbidden('Không có quyền xem chi tiết việc');
  }

  const gasRuntime = isGasRuntimeMode(env);
  const warnings: string[] = [];

  if (isGasConfigured(env)) {
    const gas = await gasGetTaskDetail(env, user, taskId);
    if (gas.ok && gas.data) {
      if (gas.warnings.length) warnings.push(...gas.warnings);
      warnings.push('GAS Sheet runtime — RF_12');
      return createEnvelope(gas.data, { warnings });
    }
    const failMsg = !gas.ok ? (gas.warning ?? gas.errors[0] ?? 'GAS detail failed') : 'GAS detail failed';
    if (gasRuntime) {
      return createEnvelope(null, {
        ok: false,
        status: 'FAIL',
        errors: [failMsg],
        warnings: ['GAS runtime mode — không fallback mock'],
      });
    }
    warnings.push(failMsg);
  } else if (gasRuntime) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['CBV_GAS_API_BASE_URL chưa cấu hình'],
      warnings: ['GAS runtime mode — không fallback mock'],
    });
  } else {
    warnings.push('Worker projection — demo local');
  }

  const written = getWrittenTask(taskId);
  const detail = written ?? getTaskDetail(user, taskId);
  if (!detail) return notFound('Không tìm thấy việc');

  return createEnvelope(detail, { warnings });
}
