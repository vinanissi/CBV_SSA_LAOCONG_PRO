import type { Env, UserContext, UserRole } from '../contracts';
import { getTaskDbEnv } from '../env';
import { createTraceId } from '../utils/envelope';

const AUTH_TIMEOUT_MS = 8000;

export interface AuthGasUser {
  userId: string;
  userCode?: string;
  displayName: string;
  email: string;
  role: UserRole;
  directoryRole?: string;
  permissions: string[];
  status?: string;
  donViId?: string;
  source: string;
}

interface AuthGasEnvelope<T> {
  ok: boolean;
  code?: string;
  traceId: string;
  data: T;
  errors: string[];
  warnings: string[];
}

export type AuthCallResult<T> =
  | { ok: true; data: T; warnings: string[]; traceId: string }
  | { ok: false; code: string; message: string; traceId?: string };

async function callAuthGas<T>(
  env: Env,
  action: string,
  payload: Record<string, unknown> = {},
  traceId?: string,
): Promise<AuthCallResult<T>> {
  const cfg = getTaskDbEnv(env);
  const tid = traceId ?? createTraceId();

  if (!cfg.isConfigured) {
    return {
      ok: false,
      code: 'AUTH_RUNTIME_NOT_CONFIGURED',
      message: 'Auth runtime chưa cấu hình GAS URL.',
      traceId: tid,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

  try {
    const res = await fetch(cfg.gasTaskApiUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: cfg.gasTaskApiToken,
        action,
        payload,
        traceId: tid,
      }),
      redirect: 'follow',
    });

    if (!res.ok) {
      return { ok: false, code: 'GAS_AUTH_ERROR', message: `GAS trả lỗi ${res.status}`, traceId: tid };
    }

    const json = (await res.json()) as AuthGasEnvelope<T>;
    if (!json.ok) {
      return {
        ok: false,
        code: json.code ?? 'GAS_AUTH_FAILED',
        message: json.errors?.[0] ?? 'Auth request failed',
        traceId: json.traceId ?? tid,
      };
    }

    return { ok: true, data: json.data, warnings: json.warnings ?? [], traceId: json.traceId ?? tid };
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      code: isAbort ? 'GAS_AUTH_TIMEOUT' : 'GAS_AUTH_UNREACHABLE',
      message: isAbort ? 'Auth runtime phản hồi chậm' : 'Không kết nối được auth runtime',
      traceId: tid,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function isAuthRuntimeConfigured(env: Env): boolean {
  return getTaskDbEnv(env).isConfigured;
}

export async function gsAuthLogin(env: Env, identifier: string, password: string) {
  return callAuthGas<{ user: AuthGasUser; mustChangePassword: boolean }>(env, 'authLogin', {
    identifier,
    password,
  });
}

export async function gsAuthMe(env: Env, userId: string) {
  return callAuthGas<{ user: AuthGasUser }>(env, 'authMe', { userId });
}

export async function gsAuthLogout(env: Env, userId: string, displayName: string) {
  return callAuthGas<{ loggedOut: boolean }>(env, 'authLogout', { userId, displayName });
}

export async function gsGetUserDirectory(env: Env) {
  return callAuthGas<{ users: AuthGasUser[] }>(env, 'getUserDirectory');
}

export function mapGasUserToContext(user: AuthGasUser): UserContext {
  return {
    userId: user.userId,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    source: 'USER_DIRECTORY',
  };
}
