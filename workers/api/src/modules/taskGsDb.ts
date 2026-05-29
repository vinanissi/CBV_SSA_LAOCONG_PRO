import type { Env } from '../contracts';
import {
  gsAddTaskComment,
  gsAssignTask,
  gsCompleteTask,
  gsCreateTask,
  gsGetTaskDetail,
  gsGetTaskWorkspaceSnapshot,
  gsTaskDbHealth,
  gsTaskDbValidate,
  gsUpdateTaskStatus,
  isTaskDbRuntimeConfigured,
  isTaskDbRuntimeMode,
  type SnapshotFilters,
} from '../adapters/googleSheetTaskDbAdapter';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { canCreateTask, canAssignTask } from '../auth/taskPermissions';
import { gsGetUserDirectory, type AuthGasUser } from '../adapters/googleSheetAuthAdapter';
import { createEnvelope, createTraceId } from '../utils/envelope';
import { forbidden, notFound, badRequest } from '../utils/errors';
import type { CreateTaskBody } from '../contracts';

/**
 * Role-agnostic directory enrichment for the workspace snapshot.
 *
 * The GAS snapshot ships `displayOwner` baked to the raw USER_ID (e.g. "USR_008")
 * and carries no directory map. ADMIN/MANAGER hydrate names via the admin-only
 * `/api/users` endpoint, but OPERATOR/STAFF get 403 there — so their cards keep
 * rendering raw codes. Embedding a minimal `userDisplayMap` + `usersById` in the
 * snapshot lets every role resolve names without any privileged call.
 *
 * Short in-memory cache keeps this rate-limit safe (one extra GAS call / TTL window).
 */
const USER_DIRECTORY_TTL_MS = 5 * 60 * 1000;
let userDirectoryCache: { users: AuthGasUser[]; expiresAt: number } | null = null;

function isRawUserCode(value: string): boolean {
  return /^USR[_-]?\w*$/i.test(value.trim());
}

function directoryLabel(user: AuthGasUser): string {
  const display = String(user.displayName || '').trim();
  if (display && !isRawUserCode(display)) return display;
  const email = String(user.email || '').trim();
  if (email) return email;
  return String(user.userCode || user.userId || '').trim();
}

async function loadUserDirectory(env: Env): Promise<AuthGasUser[] | null> {
  const now = Date.now();
  if (userDirectoryCache && userDirectoryCache.expiresAt > now) {
    return userDirectoryCache.users;
  }
  const result = await gsGetUserDirectory(env);
  if (!result.ok || !Array.isArray(result.data?.users)) return null;
  userDirectoryCache = { users: result.data.users, expiresAt: now + USER_DIRECTORY_TTL_MS };
  return result.data.users;
}

function buildDirectoryMaps(users: AuthGasUser[]): {
  userDisplayMap: Record<string, string>;
  usersById: Record<string, Record<string, unknown>>;
} {
  const userDisplayMap: Record<string, string> = {};
  const usersById: Record<string, Record<string, unknown>> = {};
  for (const user of users) {
    const label = directoryLabel(user);
    const id = String(user.userId || '').trim();
    const code = String(user.userCode || '').trim();
    if (label) {
      if (id) userDisplayMap[id] = label;
      if (code) userDisplayMap[code] = label;
    }
    const record = {
      id: id || code,
      userCode: code || id,
      displayName: String(user.displayName || '').trim() || label,
      email: String(user.email || '').trim() || undefined,
      role: user.role,
      directoryRole: user.directoryRole,
    };
    if (id) usersById[id] = record;
    if (code && code !== id) usersById[code] = record;
  }
  return { userDisplayMap, usersById };
}

function taskDbErrorEnvelope(result: { code: string; message: string; retryable: boolean; traceId?: string }) {
  return createEnvelope<null>(null, {
    ok: false,
    status: 'FAIL',
    errors: [result.message],
    warnings: [result.code],
    traceId: result.traceId,
  });
}

export async function handleTaskDbHealth(env: Env) {
  if (!isTaskDbRuntimeConfigured(env)) {
    return taskDbErrorEnvelope({
      code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED',
      message: 'Google Sheet runtime chưa cấu hình.',
      retryable: false,
    });
  }
  const result = await gsTaskDbHealth(env);
  if (!result.ok) return taskDbErrorEnvelope(result);
  return createEnvelope(result.data, { warnings: result.warnings, traceId: result.traceId });
}

export async function handleTaskDbValidate(env: Env) {
  if (!isTaskDbRuntimeConfigured(env)) {
    return taskDbErrorEnvelope({
      code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED',
      message: 'Google Sheet runtime chưa cấu hình.',
      retryable: false,
    });
  }
  const result = await gsTaskDbValidate(env);
  if (!result.ok) return taskDbErrorEnvelope(result);
  const status = result.data?.ok === false || (result.warnings?.length ?? 0) > 0 ? 'GO_WITH_WARNINGS' : 'GO';
  return createEnvelope(result.data, { warnings: result.warnings, status, traceId: result.traceId });
}

export async function handleTaskWorkspaceSnapshot(request: Request, env: Env, url: URL) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) return forbidden('Không có quyền xem việc');

  if (!isTaskDbRuntimeConfigured(env)) {
    return taskDbErrorEnvelope({
      code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED',
      message: 'Google Sheet runtime chưa cấu hình.',
      retryable: false,
    });
  }

  const filters: SnapshotFilters = {};
  const status = url.searchParams.get('status');
  const assignee = url.searchParams.get('assignee');
  const priority = url.searchParams.get('priority');
  const q = url.searchParams.get('q');
  const limit = url.searchParams.get('limit');
  if (status) filters.status = status;
  if (assignee) filters.assignee = assignee;
  if (priority) filters.priority = priority;
  if (q) filters.q = q;
  if (limit) filters.limit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);

  const workerStart = Date.now();
  const result = await gsGetTaskWorkspaceSnapshot(env, user, filters);
  const workerLatencyMs = Date.now() - workerStart;
  if (!result.ok) return taskDbErrorEnvelope(result);

  const warnings = [...result.warnings];
  if (result.data.schemaWarnings?.length) warnings.push(...result.data.schemaWarnings);
  if (isTaskDbRuntimeMode(env)) warnings.push('TASK_GS_03 — performance hardening runtime');
  if (result.workerCacheHit && !warnings.some((w) => w.includes('Worker snapshot cache hit'))) {
    warnings.push('Worker snapshot cache hit');
  }
  const gasMs = result.data.runtime?.gasDurationMs ?? result.data.runtime?.latencyMs ?? 0;
  if (gasMs >= 2000 && !result.data.runtime?.cacheHit && !result.workerCacheHit) {
    warnings.push('GOOGLE_SHEET_RUNTIME_SLOW');
  }

  const data: Record<string, unknown> = {
    ...result.data,
    runtime: {
      ...result.data.runtime,
      connected: true,
      workerLatencyMs,
      workerCacheHit: result.workerCacheHit ?? false,
    },
  };

  // Role-agnostic display-name enrichment: attach a directory map so OPERATOR/STAFF
  // (blocked from /api/users) can resolve owner/assignee names instead of raw USR_* codes.
  const existingMap = (result.data as { userDisplayMap?: Record<string, string> }).userDisplayMap;
  if (!existingMap || Object.keys(existingMap).length === 0) {
    try {
      const directory = await loadUserDirectory(env);
      if (directory?.length) {
        const { userDisplayMap, usersById } = buildDirectoryMaps(directory);
        data.userDisplayMap = userDisplayMap;
        data.usersById = usersById;
      } else {
        warnings.push('USER_DIRECTORY_ENRICH_SKIPPED');
      }
    } catch {
      warnings.push('USER_DIRECTORY_ENRICH_FAILED');
    }
  }

  return createEnvelope(data, { warnings, traceId: result.traceId });
}

export async function handleTaskDbDetail(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) return forbidden('Không có quyền xem chi tiết việc');

  if (!isTaskDbRuntimeConfigured(env)) {
    return taskDbErrorEnvelope({
      code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED',
      message: 'Google Sheet runtime chưa cấu hình.',
      retryable: false,
    });
  }

  const result = await gsGetTaskDetail(env, user, taskId);
  if (!result.ok) return taskDbErrorEnvelope(result);
  if (!result.data) return notFound('Không tìm thấy việc');

  return createEnvelope(result.data, { warnings: result.warnings, traceId: result.traceId });
}

export async function handleTaskDbCreate(request: Request, env: Env) {
  const user = resolveUserContext(request);
  const traceId = createTraceId();
  if (!canCreateTask(user)) return forbidden('Không có quyền tạo việc');

  if (!isTaskDbRuntimeConfigured(env)) {
    return taskDbErrorEnvelope({ code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED', message: 'Google Sheet runtime chưa cấu hình.', retryable: false, traceId });
  }

  let body: CreateTaskBody;
  try {
    body = (await request.json()) as CreateTaskBody;
  } catch {
    return badRequest('Body JSON không hợp lệ');
  }

  if (!body.title?.trim()) {
    return createEnvelope(null, { errors: ['title là bắt buộc'], ok: false, status: 'FAIL', traceId });
  }

  if (body.assignee && !canAssignTask(user)) return forbidden('Không có quyền giao việc');

  const result = await gsCreateTask(env, body, user, traceId);
  if (!result.ok) return taskDbErrorEnvelope({ ...result, traceId: result.traceId ?? traceId });

  return createEnvelope(
    { task: result.data.task, log: result.data.log },
    { warnings: ['Ghi TASK_MAIN + TASK_UPDATE_LOG — TASK_GS_01', ...result.warnings], traceId: result.traceId },
  );
}

export async function handleTaskDbStatus(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  const traceId = createTraceId();

  if (!isTaskDbRuntimeConfigured(env)) {
    return taskDbErrorEnvelope({ code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED', message: 'Google Sheet runtime chưa cấu hình.', retryable: false, traceId });
  }

  let body: { status?: string; note?: string };
  try {
    body = (await request.json()) as { status?: string; note?: string };
  } catch {
    return badRequest('Body JSON không hợp lệ');
  }

  if (!body.status) {
    return createEnvelope(null, { errors: ['status là bắt buộc'], ok: false, status: 'FAIL', traceId });
  }

  const result = await gsUpdateTaskStatus(env, taskId, body.status, user, body.note, traceId);
  if (!result.ok) return taskDbErrorEnvelope({ ...result, traceId: result.traceId ?? traceId });

  return createEnvelope(
    { task: result.data.task, log: result.data.log },
    { warnings: result.warnings, traceId: result.traceId },
  );
}

export async function handleTaskDbAssign(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  const traceId = createTraceId();

  if (!canAssignTask(user)) return forbidden('Không có quyền giao việc');
  if (!isTaskDbRuntimeConfigured(env)) {
    return taskDbErrorEnvelope({ code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED', message: 'Google Sheet runtime chưa cấu hình.', retryable: false, traceId });
  }

  let body: { assignee?: string; note?: string };
  try {
    body = (await request.json()) as { assignee?: string; note?: string };
  } catch {
    return badRequest('Body JSON không hợp lệ');
  }

  if (!body.assignee) {
    return createEnvelope(null, { errors: ['assignee là bắt buộc'], ok: false, status: 'FAIL', traceId });
  }

  const result = await gsAssignTask(env, taskId, body.assignee, user, body.note, traceId);
  if (!result.ok) return taskDbErrorEnvelope({ ...result, traceId: result.traceId ?? traceId });

  return createEnvelope({ task: result.data.task, log: result.data.log }, { warnings: result.warnings, traceId: result.traceId });
}

export async function handleTaskDbComment(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  const traceId = createTraceId();

  if (!isTaskDbRuntimeConfigured(env)) {
    return taskDbErrorEnvelope({ code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED', message: 'Google Sheet runtime chưa cấu hình.', retryable: false, traceId });
  }

  let body: { comment?: string };
  try {
    body = (await request.json()) as { comment?: string };
  } catch {
    return badRequest('Body JSON không hợp lệ');
  }

  if (!body.comment?.trim()) {
    return createEnvelope(null, { errors: ['comment là bắt buộc'], ok: false, status: 'FAIL', traceId });
  }

  const result = await gsAddTaskComment(env, taskId, body.comment, user, traceId);
  if (!result.ok) return taskDbErrorEnvelope({ ...result, traceId: result.traceId ?? traceId });

  return createEnvelope({ log: result.data.log }, { warnings: result.warnings, traceId: result.traceId });
}

export async function handleTaskDbComplete(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  const traceId = createTraceId();

  if (!isTaskDbRuntimeConfigured(env)) {
    return taskDbErrorEnvelope({ code: 'GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED', message: 'Google Sheet runtime chưa cấu hình.', retryable: false, traceId });
  }

  let body: { note?: string } = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as { note?: string };
  } catch {
    return badRequest('Body JSON không hợp lệ');
  }

  const result = await gsCompleteTask(env, taskId, user, body.note, traceId);
  if (!result.ok) return taskDbErrorEnvelope({ ...result, traceId: result.traceId ?? traceId });

  return createEnvelope({ task: result.data.task, log: result.data.log }, { warnings: result.warnings, traceId: result.traceId });
}

export { isTaskDbRuntimeConfigured, isTaskDbRuntimeMode };
