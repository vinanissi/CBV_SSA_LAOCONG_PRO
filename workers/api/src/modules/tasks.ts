import type { Env, TaskFilter } from '../contracts';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { getTasks, getTaskDetail } from '../adapters/mockData';
import { getWrittenTasks, getWrittenTask } from '../adapters/taskWriteStore';
import { gasGetTasks, gasGetTaskDetail, isGasConfigured } from '../adapters/gasAdapter';
import { createEnvelope } from '../utils/envelope';
import { forbidden, notFound } from '../utils/errors';

export async function handleTasksList(request: Request, env: Env, filter?: TaskFilter) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) {
    return forbidden('Không có quyền xem việc');
  }

  const warnings: string[] = [];

  if (isGasConfigured(env)) {
    const gas = await gasGetTasks(env, user, filter);
    if (gas.ok && Array.isArray(gas.data)) {
      if (gas.warnings.length) warnings.push(...gas.warnings);
      warnings.push('GAS Sheet runtime — RF_12');
      const merged = mergeWithLocalWrites(gas.data, user, filter);
      return createEnvelope(merged, { warnings });
    }
    const failMsg = !gas.ok ? (gas.warning ?? gas.errors[0] ?? 'GAS read fallback — dùng projection local') : 'GAS read fallback';
    warnings.push(failMsg);
  } else {
    warnings.push('Worker projection — demo local');
  }

  return createEnvelope(getTasksMerged(user, filter), { warnings });
}

function mergeWithLocalWrites(gasTasks: ReturnType<typeof getTasks>, user: ReturnType<typeof resolveUserContext>, filter?: TaskFilter) {
  const byId = new Map(gasTasks.map((t) => [t.taskId, t]));
  for (const t of getWrittenTasks()) {
    byId.set(t.taskId, {
      ...t,
      permissionAllowed: true,
      isMine: t.ownerId === user.userId,
    });
  }
  return applyFilter(Array.from(byId.values()), user, filter);
}

function getTasksMerged(user: ReturnType<typeof resolveUserContext>, filter?: TaskFilter) {
  const demoAll = getTasks(user, undefined);
  const written = getWrittenTasks().map((t) => ({
    ...t,
    permissionAllowed: true,
    isMine: t.ownerId === user.userId,
  }));
  const byId = new Map(demoAll.map((t) => [t.taskId, t]));
  for (const t of written) byId.set(t.taskId, t);
  return applyFilter(Array.from(byId.values()), user, filter);
}

function applyFilter(items: ReturnType<typeof getTasks>, user: ReturnType<typeof resolveUserContext>, filter?: TaskFilter) {
  switch (filter) {
    case 'mine':
      return items.filter((t) => t.ownerId === user.userId);
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

  const warnings: string[] = [];

  if (isGasConfigured(env)) {
    const gas = await gasGetTaskDetail(env, user, taskId);
    if (gas.ok && gas.data) {
      if (gas.warnings.length) warnings.push(...gas.warnings);
      warnings.push('GAS Sheet runtime — RF_12');
      return createEnvelope(gas.data, { warnings });
    }
    warnings.push(!gas.ok ? (gas.warning ?? gas.errors[0] ?? 'GAS detail fallback') : 'GAS detail fallback');
  } else {
    warnings.push('Worker projection — demo local');
  }

  const written = getWrittenTask(taskId);
  const detail = written ?? getTaskDetail(user, taskId);
  if (!detail) return notFound('Không tìm thấy việc');

  return createEnvelope(detail, { warnings });
}
