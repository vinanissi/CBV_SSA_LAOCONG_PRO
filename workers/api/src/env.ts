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
