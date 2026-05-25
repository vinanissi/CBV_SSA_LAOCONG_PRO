import type { Env } from '../contracts';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { getCoordinationData, PROJECTION_LABEL } from '../adapters/mockData';
import { fetchGasProjection } from '../adapters/gasAdapter';
import { createEnvelope } from '../utils/envelope';
import { forbidden } from '../utils/errors';

export async function handleCoordination(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'COORDINATION')) {
    return forbidden('Không có quyền xem phối hợp');
  }

  const warnings = [PROJECTION_LABEL, 'Giao việc — chỉ xem trong phiên bản này'];
  const gas = await fetchGasProjection(env, '/coordination');
  if (gas.warning) warnings.push(gas.warning);

  return createEnvelope(getCoordinationData(), { warnings });
}

export async function handleCoordinationQueue(request: Request, env: Env) {
  const envelope = await handleCoordination(request, env);
  if (!envelope.ok || !envelope.data) return envelope;
  return createEnvelope(envelope.data.queue, { warnings: envelope.warnings });
}

export async function handleCoordinationWorkload(request: Request, env: Env) {
  const envelope = await handleCoordination(request, env);
  if (!envelope.ok || !envelope.data) return envelope;
  return createEnvelope(envelope.data.workload, { warnings: envelope.warnings });
}

export async function handleCoordinationOverdue(request: Request, env: Env) {
  const envelope = await handleCoordination(request, env);
  if (!envelope.ok || !envelope.data) return envelope;
  return createEnvelope(envelope.data.overdue, { warnings: envelope.warnings });
}
