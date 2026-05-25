import type { Env, TaskFilter } from '../contracts';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { getTasks, getTaskDetail } from '../adapters/mockData';
import { getWrittenTasks, getWrittenTask } from '../adapters/taskWriteStore';
import { fetchGasProjection } from '../adapters/gasAdapter';
import { createEnvelope } from '../utils/envelope';
import { forbidden, notFound } from '../utils/errors';

export async function handleTasksList(request: Request, env: Env, filter?: TaskFilter) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) {
    return forbidden('Không có quyền xem việc');
  }

  const warnings = ['Worker projection — demo local'];
  const gas = await fetchGasProjection(env, `/tasks${filter ? `?filter=${filter}` : ''}`);
  if (gas.warning) warnings.push(gas.warning);

  return createEnvelope(getTasksMerged(user, filter), { warnings });
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
  let items = Array.from(byId.values());
  switch (filter) {
    case 'mine':
      items = items.filter((t) => t.ownerId === user.userId);
      break;
    case 'pending':
      items = items.filter((t) => ['NEW', 'WAITING', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status));
      break;
    case 'overdue':
      items = items.filter((t) => t.isOverdue);
      break;
    case 'approval':
      items = items.filter((t) => t.status === 'WAITING' || t.status === 'WAITING_APPROVAL');
      break;
  }
  return items;
}

export async function handleTaskDetail(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) {
    return forbidden('Không có quyền xem chi tiết việc');
  }

  const warnings = ['Worker projection — demo local'];
  const gas = await fetchGasProjection(env, `/tasks/${taskId}`);
  if (gas.warning) warnings.push(gas.warning);

  const written = getWrittenTask(taskId);
  const detail = written ?? getTaskDetail(user, taskId);
  if (!detail) return notFound('Không tìm thấy việc');

  return createEnvelope(detail, { warnings });
}
