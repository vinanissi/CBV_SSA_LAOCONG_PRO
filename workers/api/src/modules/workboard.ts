import type { Env, HealthData } from '../contracts';
import { gasAdapterStatus, gasHealth, isGasConfigured } from '../adapters/gasAdapter';
import { appSheetAdapterStatus } from '../adapters/appSheetAdapter';
import { isTaskWriteEnabled, getTaskWriteAdapterStatus } from '../adapters/taskWriteAdapter';
import { createEnvelope } from '../utils/envelope';
import { getEnv, getTaskDbEnv, isGasRuntimeMode } from '../env';

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

/** Diagnostics for browser ↔ Worker ↔ GAS path (connectivity phase). */
export async function handleRuntimeConnectivity(request: Request, env: Env) {
  const healthEnvelope = await handleHealth(env);
  const taskDb = getTaskDbEnv(env);
  const healthData = healthEnvelope.data ?? ({} as HealthData);
  const data = {
    connectivity: 'worker_ok',
    workerService: healthData.service,
    workerVersion: healthData.version,
    mode: healthData.mode,
    gasConfigured: healthData.gasConfigured,
    gasReachable: healthData.gasReachable,
    taskRuntimeMode: taskDb.runtimeMode || 'unset',
    taskDbConfigured: taskDb.isConfigured,
    requestOrigin: request.headers.get('Origin'),
  };
  return createEnvelope(data, { warnings: healthEnvelope.warnings });
}

export { handleToday } from './homeAlert';
