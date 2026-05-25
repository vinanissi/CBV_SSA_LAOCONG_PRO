import type { Env } from '../contracts';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { FINANCE, getFinanceAlerts, PROJECTION_LABEL } from '../adapters/mockData';
import { fetchGasProjection } from '../adapters/gasAdapter';
import { createEnvelope } from '../utils/envelope';
import { forbidden } from '../utils/errors';

export async function handleFinanceList(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'FINANCE')) {
    return forbidden('Không có quyền xem tài chính');
  }

  const warnings = [PROJECTION_LABEL, 'Chỉ xem — xác nhận cần thao tác thủ công'];
  const gas = await fetchGasProjection(env, '/finance');
  if (gas.warning) warnings.push(gas.warning);

  const items = FINANCE.map((f) => ({ ...f, permissionAllowed: true }));
  return createEnvelope(items, { warnings });
}

export async function handleFinanceAlerts(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'FINANCE')) {
    return forbidden('Không có quyền xem cảnh báo tài chính');
  }

  const warnings = [PROJECTION_LABEL];
  const gas = await fetchGasProjection(env, '/finance/alerts');
  if (gas.warning) warnings.push(gas.warning);

  return createEnvelope(getFinanceAlerts(), { warnings });
}
