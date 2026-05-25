import type { Env, HealthData } from '../contracts';
import { gasAdapterStatus, gasHealth, isGasConfigured } from '../adapters/gasAdapter';
import { appSheetAdapterStatus } from '../adapters/appSheetAdapter';
import { isTaskWriteEnabled, getTaskWriteAdapterStatus } from '../adapters/taskWriteAdapter';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { getTodaySummary } from '../adapters/mockData';
import { createEnvelope } from '../utils/envelope';
import { forbidden } from '../utils/errors';

export async function handleHealth(env: Env) {
  const writeEnabled = isTaskWriteEnabled(env);
  const writeStatus = getTaskWriteAdapterStatus(env);
  const gasConfigured = isGasConfigured(env);

  const data: HealthData = {
    service: 'cbv-api-bridge',
    version: 'RF-12-V1',
    mode: gasConfigured ? 'GAS_SHEET_BRIDGE' : 'READ_FIRST',
    adapter: `${gasConfigured ? 'gas' : 'mock'}:${gasAdapterStatus(env)}:${appSheetAdapterStatus(env)}:write=${writeStatus}`,
    readOnly: !writeEnabled,
    writesLocked: !writeEnabled,
    taskWriteMode: writeEnabled ? 'ENABLED' : 'LOCKED',
  };

  const warnings: string[] = [];
  if (gasConfigured) {
    const gas = await gasHealth(env);
    if (!gas.ok) warnings.push(gas.warning ?? gas.errors[0] ?? 'GAS health check failed');
    else warnings.push('GAS Sheet bridge active — RF_12');
  } else if (writeEnabled) {
    warnings.push('Task write local enabled — chưa ghi production sheet');
  } else {
    warnings.push('Write actions locked', 'WRITE_ADAPTER_NOT_CONFIGURED');
  }

  return createEnvelope(data, { warnings });
}

export async function handleToday(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) {
    return forbidden('Không có quyền xem việc hôm nay');
  }

  const warnings = isGasConfigured(env)
    ? ['GAS bridge — today summary uses local projection until full sync']
    : ['Worker projection — demo local'];

  return createEnvelope(getTodaySummary(user), { warnings });
}
