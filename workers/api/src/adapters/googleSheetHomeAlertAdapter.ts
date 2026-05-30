import type { AlertItem, Env, TaskItem, TodaySummary, UserContext } from '../contracts';
import { getTaskDbEnv } from '../env';
import { createTraceId } from '../utils/envelope';
import type { TaskDbGasEnvelope } from './googleSheetTaskDbAdapter';

const TIMEOUT_MS = 8000;

export type HomeAlertCallResult<T> =
  | { ok: true; data: T; warnings: string[]; traceId: string }
  | { ok: false; code: string; message: string; retryable: boolean; traceId?: string };

function actorPayload(user: UserContext) {
  return {
    userId: user.userId,
    displayName: user.displayName,
    role: user.role,
    email: user.email,
  };
}

export function isHomeAlertRuntimeConfigured(env: Env): boolean {
  return getTaskDbEnv(env).isConfigured;
}

async function callHomeAlertGas<T>(
  env: Env,
  action: string,
  payload: Record<string, unknown>,
  user?: UserContext,
  traceId?: string,
): Promise<HomeAlertCallResult<T>> {
  const cfg = getTaskDbEnv(env);
  const tid = traceId ?? createTraceId();

  if (!cfg.isConfigured) {
    return {
      ok: false,
      code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED',
      message: 'GAS HOME_ALERT runtime chưa cấu hình.',
      retryable: false,
      traceId: tid,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(cfg.gasTaskApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        action,
        token: cfg.gasTaskApiToken || undefined,
        traceId: tid,
        payload,
        _actor: user ? actorPayload(user) : undefined,
      }),
    });
    clearTimeout(timer);

    const json = (await res.json()) as TaskDbGasEnvelope<T>;
    if (!json.ok) {
      return {
        ok: false,
        code: json.code ?? 'HOME_ALERT_ERROR',
        message: json.errors?.[0] ?? 'HOME_ALERT GAS lỗi',
        retryable: json.code === 'GOOGLE_SHEET_RATE_LIMIT',
        traceId: json.traceId ?? tid,
      };
    }
    return { ok: true, data: json.data, warnings: json.warnings ?? [], traceId: json.traceId ?? tid };
  } catch (err) {
    clearTimeout(timer);
    const aborted = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      code: aborted ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: aborted ? 'HOME_ALERT GAS timeout' : 'Không kết nối HOME_ALERT GAS',
      retryable: true,
      traceId: tid,
    };
  }
}

export type GasTodaySummary = TodaySummary & {
  runtime?: { mode?: string; source?: string; alertCount?: number; generatedAt?: string };
  warnings?: string[];
};

export async function gsGetHomeAlertTodaySummary(env: Env, user: UserContext) {
  return callHomeAlertGas<GasTodaySummary>(env, 'getTodaySummary', {
    operatorId: user.userId,
    alertLimit: 80,
  }, user);
}

export async function gsClaimHomeAlert(env: Env, alertId: string, user: UserContext, note?: string) {
  return callHomeAlertGas<{ alert: AlertItem; alertId: string }>(
    env,
    'claimHomeAlert',
    { alertId, note },
    user,
  );
}

export async function gsResolveHomeAlert(env: Env, alertId: string, user: UserContext, note?: string) {
  return callHomeAlertGas<{ alert: AlertItem; alertId: string }>(
    env,
    'resolveHomeAlert',
    { alertId, note },
    user,
  );
}

export function normalizeTodaySummary(raw: GasTodaySummary): TodaySummary {
  return {
    priorityTasks: (raw.priorityTasks ?? []) as TaskItem[],
    myTasks: (raw.myTasks ?? []) as TaskItem[],
    overdueTasks: (raw.overdueTasks ?? []) as TaskItem[],
    missingHoSo: raw.missingHoSo ?? [],
    pendingFinance: raw.pendingFinance ?? [],
    alerts: raw.alerts ?? [],
    demoLabel: raw.demoLabel ?? '',
  };
}
