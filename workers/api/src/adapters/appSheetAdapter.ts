import type { Env } from '../contracts';
import { getEnv } from '../env';

const TIMEOUT_MS = 5000;

export async function fetchAppSheetProjection(
  env: Env,
  path: string,
): Promise<{ ok: boolean; data?: unknown; warning?: string }> {
  const { appSheetBaseUrl, appSheetApiKey } = getEnv(env);
  if (!appSheetBaseUrl || !appSheetApiKey) {
    return { ok: false, warning: 'AppSheet adapter chưa cấu hình — dùng projection local' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${appSheetBaseUrl}${path}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'X-AppSheet-Api-Key': appSheetApiKey,
      },
    });
    if (!res.ok) {
      return { ok: false, warning: `AppSheet adapter trả lỗi ${res.status}` };
    }
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, warning: 'AppSheet adapter không phản hồi — dùng projection local' };
  } finally {
    clearTimeout(timer);
  }
}

export function appSheetAdapterStatus(env: Env): string {
  const { appSheetBaseUrl, appSheetApiKey } = getEnv(env);
  return appSheetBaseUrl && appSheetApiKey ? 'CONFIGURED' : 'NOT_CONFIGURED';
}
