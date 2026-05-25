import type { Env } from '../contracts';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { getObservationData, ALERTS, PROJECTION_LABEL } from '../adapters/mockData';
import { fetchGasProjection } from '../adapters/gasAdapter';
import { createEnvelope } from '../utils/envelope';
import { forbidden } from '../utils/errors';

export async function handleObservation(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'OBSERVATION')) {
    return forbidden('Không có quyền xem thông báo');
  }

  const warnings = [PROJECTION_LABEL];
  const gas = await fetchGasProjection(env, '/observation');
  if (gas.warning) warnings.push(gas.warning);

  return createEnvelope(getObservationData(), { warnings });
}

export async function handleObservationHealth(request: Request, env: Env) {
  const envelope = await handleObservation(request, env);
  if (!envelope.ok || !envelope.data) return envelope;
  return createEnvelope(envelope.data.statusCards, { warnings: envelope.warnings });
}

export async function handleObservationAlerts(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'OBSERVATION')) {
    return forbidden('Không có quyền xem cảnh báo');
  }

  const warnings = [PROJECTION_LABEL];
  const gas = await fetchGasProjection(env, '/observation/alerts');
  if (gas.warning) warnings.push(gas.warning);

  return createEnvelope(ALERTS, { warnings });
}
