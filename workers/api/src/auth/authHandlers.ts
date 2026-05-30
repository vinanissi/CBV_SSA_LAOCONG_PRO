import type { Env } from '../contracts';
import {
  gsAuthLogin,
  gsAuthLogout,
  gsAuthMe,
  gsGetUserDirectory,
  mapGasUserToContext,
} from '../adapters/googleSheetAuthAdapter';
import { parseSessionHeader, encodeSession, buildSessionFromUser, sessionToUserContext } from './session';
import { resolveUserContext, hasPermission } from './userContext';
import { createEnvelope, createTraceId } from '../utils/envelope';
import { badRequest, forbidden } from '../utils/errors';

export async function handleAuthLogin(request: Request, env: Env) {
  const traceId = createTraceId();
  let body: { identifier?: string; password?: string };
  try {
    body = (await request.json()) as { identifier?: string; password?: string };
  } catch {
    return badRequest('Body JSON không hợp lệ');
  }

  if (!body.identifier?.trim() || !body.password) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['identifier và password là bắt buộc'],
      traceId,
    });
  }

  const result = await gsAuthLogin(env, body.identifier.trim(), body.password);
  if (!result.ok) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: [result.message],
      warnings: [result.code],
      traceId: result.traceId ?? traceId,
    });
  }

  const user = mapGasUserToContext(result.data.user);
  const session = buildSessionFromUser(user, result.data.mustChangePassword);
  const token = encodeSession(session);

  return createEnvelope(
    {
      token,
      user,
      mustChangePassword: result.data.mustChangePassword,
    },
    {
      warnings: result.warnings,
      traceId: result.traceId,
    },
  );
}

export async function handleAuthMe(request: Request, env: Env) {
  const session = parseSessionHeader(request);
  if (!session) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['Chưa đăng nhập'],
      warnings: ['AUTH_REQUIRED'],
    });
  }

  const refresh = await gsAuthMe(env, session.userId);
  if (refresh.ok) {
    const user = mapGasUserToContext(refresh.data.user);
    return createEnvelope(user, { warnings: refresh.warnings, traceId: refresh.traceId });
  }

  return createEnvelope(sessionToUserContext(session), {
    warnings: ['Auth refresh failed — using cached session', refresh.message],
    traceId: refresh.traceId,
  });
}

export async function handleAuthLogout(request: Request, env: Env) {
  const traceId = createTraceId();
  const user = resolveUserContext(request);
  if (user.source === 'USER_DIRECTORY') {
    await gsAuthLogout(env, user.userId, user.displayName);
  }
  return createEnvelope({ loggedOut: true }, { traceId });
}

export async function handleGetUsers(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!hasPermission(user, 'ADMIN_ALL') && user.role !== 'MANAGER') {
    return forbidden('Không có quyền xem danh sách user');
  }

  const result = await gsGetUserDirectory(env);
  if (!result.ok) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: [result.message],
      warnings: [result.code],
      traceId: result.traceId,
    });
  }

  return createEnvelope(result.data.users ?? [], { warnings: result.warnings, traceId: result.traceId });
}

/** Legacy /api/me — session first, stub fallback */
export async function handleMe(request: Request, env: Env) {
  const session = parseSessionHeader(request);
  if (session) {
    return handleAuthMe(request, env);
  }
  const user = resolveUserContext(request);
  return createEnvelope(user, {
    warnings: ['Auth stub — LOCAL_STUB (no session)', 'Set Authorization header after login'],
  });
}
