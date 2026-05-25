import type { Env } from '../contracts';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { HOSO, getHoSoAlerts, PROJECTION_LABEL } from '../adapters/mockData';
import { fetchGasProjection } from '../adapters/gasAdapter';
import { createEnvelope } from '../utils/envelope';
import { forbidden } from '../utils/errors';

export async function handleHoSoList(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'HO_SO')) {
    return forbidden('Không có quyền xem hồ sơ');
  }

  const warnings = [PROJECTION_LABEL, 'Chỉ xem — duyệt cần thao tác thủ công'];
  const gas = await fetchGasProjection(env, '/hoso');
  if (gas.warning) warnings.push(gas.warning);

  const items = HOSO.map((h) => ({ ...h, permissionAllowed: true }));
  return createEnvelope(items, { warnings });
}

export async function handleHoSoAlerts(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'HO_SO')) {
    return forbidden('Không có quyền xem cảnh báo hồ sơ');
  }

  const warnings = [PROJECTION_LABEL];
  const gas = await fetchGasProjection(env, '/hoso/alerts');
  if (gas.warning) warnings.push(gas.warning);

  return createEnvelope(getHoSoAlerts(), { warnings });
}
