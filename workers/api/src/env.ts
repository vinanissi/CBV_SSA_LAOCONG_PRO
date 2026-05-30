import type { Env } from './contracts';

export function getEnv(env: Env) {
  return {
    gasBaseUrl: env.CBV_GAS_API_BASE_URL?.trim() ?? '',
    gasWriteBaseUrl: env.CBV_GAS_WRITE_API_BASE_URL?.trim() ?? '',
    appSheetBaseUrl: env.CBV_APPSHEET_API_BASE_URL?.trim() ?? '',
    appSheetApiKey: env.CBV_APPSHEET_API_KEY?.trim() ?? '',
    taskWriteMode: (env.CBV_TASK_WRITE_MODE?.trim() ?? 'locked').toLowerCase(),
    allowedOrigins: (env.CBV_ALLOWED_ORIGINS ?? 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  };
}

export function getTaskDbEnv(env: Env) {
  const gasTaskApiUrl = env.GAS_TASK_API_URL?.trim() ?? env.CBV_GAS_API_BASE_URL?.trim() ?? '';
  const runtimeMode = env.CBV_TASK_RUNTIME_MODE?.trim() ?? '';
  const taskSheetId = env.CBV_TASK_SHEET_ID?.trim() ?? '1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE';
  return {
    gasTaskApiUrl: gasTaskApiUrl.replace(/\/+$/, ''),
    gasTaskApiToken: env.GAS_TASK_API_TOKEN?.trim() ?? '',
    taskSheetId,
    runtimeMode,
    isConfigured: Boolean(gasTaskApiUrl),
  };
}

/** GAS URL set + write mode gas — real Sheet runtime, no mock fallback on reads */
export function isGasRuntimeMode(env: Env): boolean {
  const cfg = getEnv(env);
  const taskDb = getTaskDbEnv(env);
  if (taskDb.runtimeMode === 'google_sheet_existing_db' && taskDb.isConfigured) return true;
  const hasGasUrl = Boolean(cfg.gasBaseUrl || (cfg.taskWriteMode === 'gas' && cfg.gasWriteBaseUrl));
  return cfg.taskWriteMode === 'gas' && hasGasUrl;
}
