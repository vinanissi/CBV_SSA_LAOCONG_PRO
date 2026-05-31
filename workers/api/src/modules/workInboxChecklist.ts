import type { Env } from '../contracts';
import type {
  WorkInboxChecklistCreateBody,
  WorkInboxChecklistListResponse,
  WorkInboxChecklistMutateResponse,
  WorkInboxChecklistToggleBody,
  WorkInboxChecklistUpdateBody,
} from '../contracts/workInboxChecklist';
import {
  gsWiOpCreateChecklistItem,
  gsWiOpListChecklist,
  gsWiOpSoftDeleteChecklistItem,
  gsWiOpToggleChecklistItem,
  gsWiOpUpdateChecklistItem,
} from '../adapters/googleSheetWorkInboxOperationalAdapter';
import { resolveUserContext } from '../auth/userContext';
import { canWorkInboxOp, normalizeWorkInboxRole } from '../auth/workInboxPermissions';
import { createEnvelope, createTraceId } from '../utils/envelope';
import { isTaskDbRuntimeConfigured, isTaskDbRuntimeMode, taskDbRuntimeRequired } from './taskGsDb';
import { extractRequestTraceId } from './workInboxPerformanceTrace';

function canMutateChecklist(role: string): boolean {
  return canWorkInboxOp(normalizeWorkInboxRole(role), 'NOTES');
}

export async function handleWorkInboxChecklistList(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());

  const blocked = taskDbRuntimeRequired(env, traceId);
  if (blocked) return blocked;

  if (!isTaskDbRuntimeMode(env) || !isTaskDbRuntimeConfigured(env)) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['Runtime TASK_MAIN chưa cấu hình'],
      traceId,
    });
  }

  const result = await gsWiOpListChecklist(env, user, taskId, traceId);
  if (!result.ok) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: [result.message],
      traceId: result.traceId ?? traceId,
    });
  }

  return createEnvelope(result.data as WorkInboxChecklistListResponse, {
    traceId: result.traceId ?? traceId,
    warnings: ['WORK_INBOX_CHECKLIST — list via Worker→GAS'],
  });
}

export async function handleWorkInboxChecklistCreate(
  request: Request,
  env: Env,
  taskId: string,
) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());

  if (!canMutateChecklist(user.role)) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['Không có quyền chỉnh checklist'],
      traceId,
    });
  }

  const blocked = taskDbRuntimeRequired(env, traceId);
  if (blocked) return blocked;

  let body: WorkInboxChecklistCreateBody;
  try {
    body = (await request.json()) as WorkInboxChecklistCreateBody;
  } catch {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Body JSON không hợp lệ'], traceId });
  }

  const title = body.title?.trim() ?? '';
  if (!title) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['title là bắt buộc'], traceId });
  }

  const result = await gsWiOpCreateChecklistItem(
    env,
    { taskId, title, sortOrder: body.sortOrder, isRequired: body.isRequired, note: body.note, traceId },
    user,
    traceId,
  );
  if (!result.ok) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: [result.message],
      traceId: result.traceId ?? traceId,
    });
  }

  return createEnvelope(result.data as WorkInboxChecklistMutateResponse, { traceId: result.traceId ?? traceId });
}

export async function handleWorkInboxChecklistUpdate(
  request: Request,
  env: Env,
  taskId: string,
  checklistId: string,
) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());

  if (!canMutateChecklist(user.role)) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['Không có quyền chỉnh checklist'],
      traceId,
    });
  }

  const blocked = taskDbRuntimeRequired(env, traceId);
  if (blocked) return blocked;

  let body: WorkInboxChecklistUpdateBody;
  try {
    body = (await request.json()) as WorkInboxChecklistUpdateBody;
  } catch {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Body JSON không hợp lệ'], traceId });
  }

  if (body.title !== undefined && !body.title.trim()) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['title không được rỗng'], traceId });
  }

  const result = await gsWiOpUpdateChecklistItem(
    env,
    { taskId, checklistId, title: body.title?.trim(), sortOrder: body.sortOrder, note: body.note, traceId },
    user,
    traceId,
  );
  if (!result.ok) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: [result.message],
      traceId: result.traceId ?? traceId,
    });
  }

  return createEnvelope(result.data as WorkInboxChecklistMutateResponse, { traceId: result.traceId ?? traceId });
}

export async function handleWorkInboxChecklistToggle(
  request: Request,
  env: Env,
  taskId: string,
  checklistId: string,
) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());

  if (!canMutateChecklist(user.role)) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['Không có quyền chỉnh checklist'],
      traceId,
    });
  }

  const blocked = taskDbRuntimeRequired(env, traceId);
  if (blocked) return blocked;

  let body: WorkInboxChecklistToggleBody = {};
  try {
    body = ((await request.json().catch(() => ({}))) as WorkInboxChecklistToggleBody) || {};
  } catch {
    body = {};
  }

  const result = await gsWiOpToggleChecklistItem(
    env,
    { taskId, checklistId, isDone: body.isDone, traceId },
    user,
    traceId,
  );
  if (!result.ok) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: [result.message],
      traceId: result.traceId ?? traceId,
    });
  }

  return createEnvelope(result.data as WorkInboxChecklistMutateResponse, { traceId: result.traceId ?? traceId });
}

export async function handleWorkInboxChecklistDelete(
  request: Request,
  env: Env,
  taskId: string,
  checklistId: string,
) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());

  if (!canMutateChecklist(user.role)) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['Không có quyền chỉnh checklist'],
      traceId,
    });
  }

  const blocked = taskDbRuntimeRequired(env, traceId);
  if (blocked) return blocked;

  const result = await gsWiOpSoftDeleteChecklistItem(
    env,
    { taskId, checklistId, traceId },
    user,
    traceId,
  );
  if (!result.ok) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: [result.message],
      traceId: result.traceId ?? traceId,
    });
  }

  return createEnvelope(result.data as WorkInboxChecklistMutateResponse, { traceId: result.traceId ?? traceId });
}
