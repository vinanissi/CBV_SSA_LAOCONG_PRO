import type { Env } from '../contracts';
import { getEnv } from '../env';

const TIMEOUT_MS = 5000;

export async function fetchGasProjection(
  env: Env,
  path: string,
): Promise<{ ok: boolean; data?: unknown; warning?: string }> {
  const { gasBaseUrl } = getEnv(env);
  if (!gasBaseUrl) {
    return { ok: false, warning: 'GAS adapter chưa cấu hình — dùng projection local' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${gasBaseUrl}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return { ok: false, warning: `GAS adapter trả lỗi ${res.status}` };
    }
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, warning: 'GAS adapter không phản hồi — dùng projection local' };
  } finally {
    clearTimeout(timer);
  }
}

export function gasAdapterStatus(env: Env): string {
  return getEnv(env).gasBaseUrl ? 'CONFIGURED' : 'NOT_CONFIGURED';
}
