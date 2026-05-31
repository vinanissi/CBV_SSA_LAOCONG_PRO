import type { Env } from '../contracts';
import type {
  WorkInboxAttachmentCreateBody,
  WorkInboxAttachmentListResponse,
  WorkInboxAttachmentMutateResponse,
  WorkInboxAttachmentUpdateBody,
} from '../contracts/workInboxAttachments';
import {
  gsWiOpCreateAttachment,
  gsWiOpListAttachments,
  gsWiOpSoftDeleteAttachment,
  gsWiOpUpdateAttachment,
} from '../adapters/googleSheetWorkInboxOperationalAdapter';
import { resolveUserContext } from '../auth/userContext';
import { canWorkInboxOp, normalizeWorkInboxRole } from '../auth/workInboxPermissions';
import { createEnvelope, createTraceId } from '../utils/envelope';
import { isTaskDbRuntimeConfigured, isTaskDbRuntimeMode, taskDbRuntimeRequired } from './taskGsDb';
import { extractRequestTraceId } from './workInboxPerformanceTrace';

function canMutateAttachment(role: string): boolean {
  return canWorkInboxOp(normalizeWorkInboxRole(role), 'DOCUMENT');
}

export async function handleWorkInboxAttachmentsList(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());
  const blocked = taskDbRuntimeRequired(env, traceId);
  if (blocked) return blocked;

  if (!isTaskDbRuntimeMode(env) || !isTaskDbRuntimeConfigured(env)) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Runtime TASK_MAIN chưa cấu hình'], traceId });
  }

  const result = await gsWiOpListAttachments(env, user, taskId, traceId);
  if (!result.ok) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: [result.message], traceId: result.traceId ?? traceId });
  }
  return createEnvelope(result.data as WorkInboxAttachmentListResponse, { traceId: result.traceId ?? traceId });
}

export async function handleWorkInboxAttachmentsCreate(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());
  if (!canMutateAttachment(user.role)) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Không có quyền thêm tài liệu'], traceId });
  }
  const blocked = taskDbRuntimeRequired(env, traceId);
  if (blocked) return blocked;

  let body: WorkInboxAttachmentCreateBody;
  try {
    body = (await request.json()) as WorkInboxAttachmentCreateBody;
  } catch {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Body JSON không hợp lệ'], traceId });
  }

  const type = String(body.type || '').toUpperCase();
  if (type !== 'LINK' && type !== 'TEXT') {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['type phải là LINK hoặc TEXT'], traceId });
  }
  if (type === 'LINK' && !body.url?.trim()) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['url là bắt buộc cho LINK'], traceId });
  }
  if (type === 'TEXT' && !body.textContent?.trim() && !body.title?.trim()) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['textContent hoặc title là bắt buộc cho TEXT'], traceId });
  }

  const result = await gsWiOpCreateAttachment(
    env,
    { taskId, type, title: body.title?.trim(), url: body.url?.trim(), textContent: body.textContent?.trim(), note: body.note?.trim(), traceId },
    user,
    traceId,
  );
  if (!result.ok) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: [result.message], traceId: result.traceId ?? traceId });
  }
  return createEnvelope(result.data as WorkInboxAttachmentMutateResponse, {
    traceId: result.traceId ?? traceId,
    warnings: result.warnings,
  });
}

export async function handleWorkInboxAttachmentsUpdate(
  request: Request,
  env: Env,
  taskId: string,
  attachmentId: string,
) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());
  if (!canMutateAttachment(user.role)) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Không có quyền sửa tài liệu'], traceId });
  }
  const blocked = taskDbRuntimeRequired(env, traceId);
  if (blocked) return blocked;

  let body: WorkInboxAttachmentUpdateBody;
  try {
    body = (await request.json()) as WorkInboxAttachmentUpdateBody;
  } catch {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Body JSON không hợp lệ'], traceId });
  }

  const result = await gsWiOpUpdateAttachment(
    env,
    { taskId, attachmentId, ...body, traceId },
    user,
    traceId,
  );
  if (!result.ok) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: [result.message], traceId: result.traceId ?? traceId });
  }
  return createEnvelope(result.data as WorkInboxAttachmentMutateResponse, { traceId: result.traceId ?? traceId });
}

export async function handleWorkInboxAttachmentsDelete(
  request: Request,
  env: Env,
  taskId: string,
  attachmentId: string,
) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());
  if (!canMutateAttachment(user.role)) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Không có quyền xóa tài liệu'], traceId });
  }
  const blocked = taskDbRuntimeRequired(env, traceId);
  if (blocked) return blocked;

  const result = await gsWiOpSoftDeleteAttachment(env, { taskId, attachmentId, traceId }, user, traceId);
  if (!result.ok) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: [result.message], traceId: result.traceId ?? traceId });
  }
  return createEnvelope(result.data as WorkInboxAttachmentMutateResponse, { traceId: result.traceId ?? traceId });
}
