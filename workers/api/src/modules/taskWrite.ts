import type { CreateTaskBody, Env, UpdateTaskBody } from '../contracts';
import { resolveUserContext } from '../auth/userContext';
import {
  canAssignTask,
  canCreateTask,
  canUpdateTask,
  resolveWriteCapability,
} from '../auth/taskPermissions';
import { writeCreateTask, writeUpdateTask, isTaskWriteEnabled, getTaskWriteAdapterStatus } from '../adapters/taskWriteAdapter';
import { getWrittenTask, seedWrittenTaskFromDetail } from '../adapters/taskWriteStore';
import { getTaskDetail } from '../adapters/mockData';
import { validateCreateTask, validateUpdateTask, pickUpdateFields } from '../utils/taskValidation';
import { createEnvelope, createTraceId } from '../utils/envelope';
import { forbidden, notFound, badRequest } from '../utils/errors';

function mergeTaskDetail(user: ReturnType<typeof resolveUserContext>, taskId: string) {
  const written = getWrittenTask(taskId);
  if (written) return written;
  return getTaskDetail(user, taskId);
}

export function handleTaskWriteCapability(request: Request, env: Env) {
  const user = resolveUserContext(request);
  const enabled = isTaskWriteEnabled(env);
  const caps = resolveWriteCapability(user, enabled);

  return createEnvelope(
    {
      writeMode: enabled ? ('ENABLED' as const) : ('LOCKED' as const),
      adapterStatus: getTaskWriteAdapterStatus(env),
      canCreate: caps.canCreate,
      canUpdate: enabled && (user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'STAFF' || user.role === 'FINANCE' || user.role === 'HO_SO'),
      message: enabled
        ? 'Ghi việc đã bật — môi trường local an toàn'
        : 'Chức năng ghi chưa được bật cho môi trường này',
    },
    {
      warnings: enabled ? [] : ['WRITE_ADAPTER_NOT_CONFIGURED'],
    },
  );
}

export async function handleCreateTask(request: Request, env: Env) {
  const user = resolveUserContext(request);
  const traceId = createTraceId();

  if (!canCreateTask(user)) {
    return forbidden('Không có quyền tạo việc');
  }

  let body: CreateTaskBody;
  try {
    body = (await request.json()) as CreateTaskBody;
  } catch {
    return badRequest('Body JSON không hợp lệ');
  }

  const validationErrors = validateCreateTask(body);
  if (validationErrors.length > 0) {
    return createEnvelope(null, { errors: validationErrors, ok: false, status: 'FAIL', traceId });
  }

  if (body.assignee && !canAssignTask(user)) {
    return forbidden('Không có quyền giao việc');
  }

  const result = await writeCreateTask(env, body, user, traceId);
  if (!result.ok) {
    return createEnvelope(null, {
      errors: [result.message],
      ok: false,
      status: 'FAIL',
      traceId,
      warnings: result.code === 'WRITE_ADAPTER_NOT_CONFIGURED' ? [result.code] : [],
    });
  }

  return createEnvelope(
    { task: result.task, event: result.event },
    { warnings: ['Ghi local an toàn — chưa ghi bảng production'], traceId },
  );
}

export async function handleUpdateTask(request: Request, env: Env, taskId: string) {
  const user = resolveUserContext(request);
  const traceId = createTraceId();

  const existing = mergeTaskDetail(user, taskId);
  if (!existing) return notFound('Không tìm thấy việc');

  const taskForPerm = {
    ...existing,
    taskModule: (existing as { taskModule?: string }).taskModule ?? 'TASK',
    relatedFinanceId: (existing as { relatedFinanceId?: string }).relatedFinanceId,
    relatedHoSoId: (existing as { relatedHoSoId?: string }).relatedHoSoId,
  };

  if (!canUpdateTask(user, taskForPerm)) {
    return forbidden('Không có quyền cập nhật việc này');
  }

  let body: UpdateTaskBody;
  try {
    body = (await request.json()) as UpdateTaskBody;
  } catch {
    return badRequest('Body JSON không hợp lệ');
  }

  const picked = pickUpdateFields(body);
  const validationErrors = validateUpdateTask(picked);
  if (validationErrors.length > 0) {
    return createEnvelope(null, { errors: validationErrors, ok: false, status: 'FAIL', traceId });
  }

  if (picked.assignee !== undefined && !canAssignTask(user)) {
    return forbidden('Không có quyền đổi người phụ trách');
  }

  if (!getWrittenTask(taskId) && existing) {
    seedWrittenTaskFromDetail(taskForPerm as import('../auth/taskPermissions').StoredTask);
  }

  const result = await writeUpdateTask(env, taskId, picked, user, traceId);
  if (!result.ok) {
    return createEnvelope(null, {
      errors: [result.message],
      ok: false,
      status: 'FAIL',
      traceId,
      warnings: result.code === 'WRITE_ADAPTER_NOT_CONFIGURED' ? [result.code] : [],
    });
  }

  return createEnvelope(
    { task: result.task, event: result.event },
    { warnings: ['Ghi local an toàn — chưa ghi bảng production'], traceId },
  );
}
