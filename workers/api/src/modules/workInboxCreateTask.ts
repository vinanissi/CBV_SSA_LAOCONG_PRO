import type { Env } from '../contracts';
import type { WorkInboxCreateTaskRequest, WorkInboxCreateTaskResponse } from '../contracts/workInboxCreateTask';
import { resolveUserContext } from '../auth/userContext';
import {
  canUserAssignOnCreate,
  canUserCreateWorkInboxTask,
  enforceCreateOwnerForUser,
  normalizeWorkInboxPilotRole,
} from '../auth/workInboxCreatePermissions';
import { isTaskDbRuntimeConfigured, isTaskDbRuntimeMode, taskDbRuntimeRequired } from './taskGsDb';
import { gsWiOpCreateUserTask } from '../adapters/googleSheetWorkInboxOperationalAdapter';
import { createEnvelope, createTraceId } from '../utils/envelope';
import { badRequest, forbidden } from '../utils/errors';
import { extractRequestTraceId } from './workInboxPerformanceTrace';

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;

function normalizePhone(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  return value.replace(/[^\d+]/g, '').trim() || undefined;
}

function validateDueDate(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return 'dueDate không hợp lệ (YYYY-MM-DD)';
  return null;
}

export async function handleWorkInboxCreateTask(request: Request, env: Env) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());

  if (!canUserCreateWorkInboxTask(user)) {
    return forbidden('Không có quyền tạo việc');
  }

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

  let body: WorkInboxCreateTaskRequest;
  try {
    body = (await request.json()) as WorkInboxCreateTaskRequest;
  } catch {
    return badRequest('Body JSON không hợp lệ', traceId);
  }

  const title = body.title?.trim() ?? '';
  if (!title) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['title là bắt buộc'], traceId });
  }
  if (title.length > TITLE_MAX) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: [`title tối đa ${TITLE_MAX} ký tự`], traceId });
  }

  const description = body.description?.trim() ?? '';
  if (description.length > DESCRIPTION_MAX) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: [`description tối đa ${DESCRIPTION_MAX} ký tự`],
      traceId,
    });
  }

  const dueErr = validateDueDate(body.dueDate);
  if (dueErr) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: [dueErr], traceId });
  }

  if (body.assignee && !canUserAssignOnCreate(user)) {
    const enforced = enforceCreateOwnerForUser(user, body.assignee);
    if (enforced === '__FORBIDDEN__') {
      return forbidden('Không có quyền giao việc cho người khác');
    }
  }

  const actorRole = normalizeWorkInboxPilotRole(body.actorRole ?? user.role);
  const payload: Record<string, unknown> = {
    traceId,
    actorRole,
    title,
    description,
    taskTypeId: body.taskTypeId?.trim(),
    donViId: body.donViId?.trim(),
    priority: body.priority ?? 'NORMAL',
    dueDate: body.dueDate,
    relatedEntityType: body.relatedEntityType?.trim(),
    relatedEntityId: body.relatedEntityId?.trim(),
    relatedPhone: normalizePhone(body.relatedPhone),
    relatedPlate: body.relatedPlate?.trim(),
  };

  const ownerId = body.ownerId?.trim() || body.assignee?.trim() || user.userId;
  payload.ownerId = ownerId;
  payload.assignee = ownerId;

  if (canUserAssignOnCreate(user) && body.assignee?.trim() && body.assignee.trim() !== user.userId) {
    payload.assignee = body.assignee.trim();
    payload.ownerId = body.assignee.trim();
  }

  const result = await gsWiOpCreateUserTask(env, payload, user, traceId);
  if (!result.ok) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: [result.message],
      traceId: result.traceId ?? traceId,
    });
  }

  const data = result.data as WorkInboxCreateTaskResponse;
  const response = {
    task: data.task,
    taskPatch: data.taskPatch ?? data.task,
    timelineEvent: data.timelineEvent ?? null,
    auditEvent: data.auditEvent ?? null,
    refreshPolicy: data.refreshPolicy ?? 'SELECTIVE',
  };

  return createEnvelope(response, {
    traceId: result.traceId ?? traceId,
    warnings: ['WORK_INBOX_USER_CREATE — timeline TASK_CREATED_BY_USER + audit ACTION_USER_CREATE_TASK', ...result.warnings],
  });
}
