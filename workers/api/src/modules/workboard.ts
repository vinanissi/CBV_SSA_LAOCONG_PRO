import type { Env, HealthData } from '../contracts';
import { gasAdapterStatus } from '../adapters/gasAdapter';
import { appSheetAdapterStatus } from '../adapters/appSheetAdapter';
import { isTaskWriteEnabled, getTaskWriteAdapterStatus } from '../adapters/taskWriteAdapter';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { getTodaySummary } from '../adapters/mockData';
import { fetchGasProjection } from '../adapters/gasAdapter';
import { createEnvelope } from '../utils/envelope';
import { forbidden } from '../utils/errors';

export function handleHealth(env: Env) {
  const writeEnabled = isTaskWriteEnabled(env);
  const data: HealthData = {
    service: 'cbv-api-bridge',
    version: 'RF-11-V1',
    mode: 'READ_FIRST',
    adapter: `mock:${gasAdapterStatus(env)}:${appSheetAdapterStatus(env)}:write=${getTaskWriteAdapterStatus(env)}`,
    readOnly: !writeEnabled,
    writesLocked: !writeEnabled,
    taskWriteMode: writeEnabled ? 'ENABLED' : 'LOCKED',
  };

  return createEnvelope(data, {
    warnings: writeEnabled
      ? ['Task write local enabled — chưa ghi production sheet']
      : ['Write actions locked', 'WRITE_ADAPTER_NOT_CONFIGURED'],
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
