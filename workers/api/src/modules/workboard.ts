import type { Env, HealthData } from '../contracts';
import { gasAdapterStatus } from '../adapters/gasAdapter';
import { appSheetAdapterStatus } from '../adapters/appSheetAdapter';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { getTodaySummary } from '../adapters/mockData';
import { fetchGasProjection } from '../adapters/gasAdapter';
import { createEnvelope } from '../utils/envelope';
import { forbidden } from '../utils/errors';

export function handleHealth(env: Env) {
  const data: HealthData = {
    service: 'cbv-api-bridge',
    version: 'RF-09-V1',
    mode: 'READ_FIRST',
    adapter: `mock:${gasAdapterStatus(env)}:${appSheetAdapterStatus(env)}`,
    readOnly: true,
    writesLocked: true,
  };

  return createEnvelope(data, {
    warnings: ['Worker projection — demo local', 'Write actions locked'],
  });
}

export async function handleToday(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) {
    return forbidden('Không có quyền xem việc hôm nay');
  }

  const warnings = ['Worker projection — demo local'];
  const gas = await fetchGasProjection(env, '/workboard/today');
  if (gas.warning) warnings.push(gas.warning);

  return createEnvelope(getTodaySummary(user), { warnings });
}
