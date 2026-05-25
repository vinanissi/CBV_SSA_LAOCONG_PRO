import type { Env, TaskFilter } from '../contracts';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { getTasks, getTaskDetail } from '../adapters/mockData';
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

  return createEnvelope(getTasks(user, filter), { warnings });
}

export async function handleTaskDetail(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) {
    return forbidden('Không có quyền xem chi tiết việc');
  }

  const warnings = ['Worker projection — demo local'];
  const gas = await fetchGasProjection(env, `/tasks/${taskId}`);
  if (gas.warning) warnings.push(gas.warning);

  const detail = getTaskDetail(user, taskId);
  if (!detail) return notFound('Không tìm thấy việc');

  return createEnvelope(detail, { warnings });
}
