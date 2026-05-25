import type { Env, HealthData } from '../contracts';
import { gasAdapterStatus, gasHealth, isGasConfigured } from '../adapters/gasAdapter';
import { appSheetAdapterStatus } from '../adapters/appSheetAdapter';
import { isTaskWriteEnabled, getTaskWriteAdapterStatus } from '../adapters/taskWriteAdapter';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { getTodaySummary } from '../adapters/mockData';
import { getEnv, isGasRuntimeMode } from '../env';
import { createEnvelope } from '../utils/envelope';
import { forbidden } from '../utils/errors';

export async function handleHealth(env: Env) {
  const writeEnabled = isTaskWriteEnabled(env);
  const writeStatus = getTaskWriteAdapterStatus(env);
  const gasConfigured = isGasConfigured(env);
  const gasRuntime = isGasRuntimeMode(env);
  let gasReachable: boolean | undefined;

  if (gasConfigured) {
    const gas = await gasHealth(env);
    gasReachable = gas.ok;
  }

  const data: HealthData = {
    service: 'cbv-api-bridge',
    version: 'RF-12B-V1',
    mode: gasRuntime ? 'GAS_SHEET_BRIDGE' : gasConfigured ? 'GAS_READ_PROBE' : 'READ_FIRST',
    adapter: `${gasConfigured ? 'gas' : 'mock'}:${gasAdapterStatus(env)}:${appSheetAdapterStatus(env)}:write=${writeStatus}`,
    readOnly: !writeEnabled,
    writesLocked: !writeEnabled,
    taskWriteMode: writeEnabled ? 'ENABLED' : 'LOCKED',
    gasConfigured,
    gasReachable,
    writeAdapterStatus: writeStatus,
  };

  const warnings: string[] = [];
  if (gasConfigured) {
    if (gasReachable) warnings.push('GAS Sheet bridge reachable — RF_12B');
    else warnings.push('GAS configured but health check failed — redeploy Web App or check CBV_SPREADSHEET_ID');
  } else if (getEnv(env).taskWriteMode === 'gas') {
    warnings.push('CBV_TASK_WRITE_MODE=gas but CBV_GAS_API_BASE_URL missing');
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

  const warnings = isGasRuntimeMode(env)
    ? ['GAS bridge — today summary uses local projection until full sync']
    : ['Worker projection — demo local'];

  return createEnvelope(getTodaySummary(user), { warnings });
}
