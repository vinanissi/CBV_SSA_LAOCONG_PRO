import type { Env } from '../contracts';
import type { TaskOperationalBundle } from '../contracts/workInboxOperational';
import {
  gsWiOpAddDocument,
  gsWiOpAppendActionAudit,
  gsWiOpAppendTimeline,
  gsWiOpCreateAppointment,
  gsWiOpGetTaskOperational,
  gsWiOpListFormTemplates,
  gsWiOpLookupSop,
  gsWiOpSaveNote,
  mapGasTimeline,
} from '../adapters/googleSheetWorkInboxOperationalAdapter';
import { isTaskDbRuntimeConfigured, isTaskDbRuntimeMode } from './taskGsDb';
import { resolveUserContext } from '../auth/userContext';
import { actionCodeToOp, canWorkInboxOp, normalizeWorkInboxRole } from '../auth/workInboxPermissions';
import { createEnvelope, createTraceId } from '../utils/envelope';
import {
  beginWorkerPerf,
  envelopeWithRoutePerf,
  extractRequestTraceId,
  markWorkerValidationEnd,
} from './workInboxPerformanceTrace';
import { workInboxOperationalMemoryStore } from './workInboxOperationalStore';

export async function handleWorkInboxOperationalBundle(
  request: Request,
  env: Env,
  taskId: string,
) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());
  const perfCtx = beginWorkerPerf(traceId, 'LOAD_OPERATIONAL_BUNDLE');

  markWorkerValidationEnd(perfCtx);

  if (isTaskDbRuntimeMode(env) && isTaskDbRuntimeConfigured(env)) {
    const result = await gsWiOpGetTaskOperational(env, user, taskId);
    if (!result.ok) {
      const envFail = createEnvelope<TaskOperationalBundle | null>(null, {
        ok: false,
        status: 'FAIL',
        errors: [result.message],
        traceId: result.traceId ?? traceId,
      });
      return envelopeWithRoutePerf(request, 'LOAD_OPERATIONAL_BUNDLE', perfCtx, envFail, result);
    }
    const data = result.data as TaskOperationalBundle;
    if (data && Array.isArray(data.timeline)) {
      data.timeline = mapGasTimeline(data.timeline as unknown[]);
    }
    const envOk = createEnvelope(data, { traceId: result.traceId ?? traceId });
    return envelopeWithRoutePerf(request, 'LOAD_OPERATIONAL_BUNDLE', perfCtx, envOk, result);
  }

  const envMem = createEnvelope(workInboxOperationalMemoryStore.getBundle(taskId), { traceId });
  return envelopeWithRoutePerf(request, 'LOAD_OPERATIONAL_BUNDLE', perfCtx, envMem);
}

export async function handleWorkInboxOperationalWrite(
  request: Request,
  env: Env,
  taskId: string,
  kind: 'appointment' | 'note' | 'document',
) {
  const user = resolveUserContext(request);
  const traceId = createTraceId();
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;

  const role = normalizeWorkInboxRole(user.role);
  if (kind === 'appointment' && !canWorkInboxOp(role, 'APPOINTMENT')) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Không có quyền tạo lịch hẹn'], traceId });
  }
  if (kind === 'note' && !canWorkInboxOp(role, 'NOTES')) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Không có quyền ghi chú'], traceId });
  }
  if (kind === 'document' && !canWorkInboxOp(role, 'DOCUMENT')) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Không có quyền tài liệu'], traceId });
  }

  if (isTaskDbRuntimeMode(env) && isTaskDbRuntimeConfigured(env)) {
    if (kind === 'appointment') {
      const res = await gsWiOpCreateAppointment(env, user, taskId, {
        title: body.title ?? 'Lịch hẹn',
        description: body.description,
        startAt: body.startAt,
        endAt: body.endAt,
      });
      if (!res.ok) {
        return createEnvelope(null, { ok: false, status: 'FAIL', errors: [res.message], traceId });
      }
      await gsWiOpAppendTimeline(
        env,
        user,
        taskId,
        'TASK_APPOINTMENT_CREATED',
        body.title ?? 'Lịch hẹn',
        user.userId,
        { appointment: true },
        traceId,
      );
      await gsWiOpAppendActionAudit(env, user, {
        traceId,
        taskId,
        action: 'ACTION_CREATE_APPOINTMENT',
        actor: user.userId,
        actorRole: role,
        beforeState: '',
        afterState: 'SCHEDULED',
        payload: body,
      });
      return createEnvelope(res.data, { traceId });
    }
    if (kind === 'note') {
      const res = await gsWiOpSaveNote(env, user, taskId, body.content ?? '');
      if (!res.ok) {
        return createEnvelope(null, { ok: false, status: 'FAIL', errors: [res.message], traceId });
      }
      await gsWiOpAppendTimeline(env, user, taskId, 'TASK_NOTE_ADDED', 'Ghi chú', user.userId, {}, traceId);
      await gsWiOpAppendActionAudit(env, user, {
        traceId,
        taskId,
        action: 'ACTION_NOTE_ADDED',
        actor: user.userId,
        actorRole: role,
        beforeState: '',
        afterState: 'NOTE',
        payload: { content: body.content },
      });
      return createEnvelope(res.data, { traceId });
    }
    const res = await gsWiOpAddDocument(env, user, taskId, {
      title: body.title ?? 'Tài liệu',
      url: body.url,
    });
    if (!res.ok) {
      return createEnvelope(null, { ok: false, status: 'FAIL', errors: [res.message], traceId });
    }
    await gsWiOpAppendTimeline(env, user, taskId, 'TASK_DOCUMENT_ADDED', body.title ?? 'Tài liệu', user.userId, {}, traceId);
    await gsWiOpAppendActionAudit(env, user, {
      traceId,
      taskId,
      action: 'ACTION_DOCUMENT_ADDED',
      actor: user.userId,
      actorRole: role,
      beforeState: '',
      afterState: 'DOCUMENT',
      payload: body,
    });
    return createEnvelope(res.data, { traceId });
  }

  if (kind === 'appointment') {
    const row = workInboxOperationalMemoryStore.createAppointment(
      taskId,
      { title: body.title ?? 'Lịch hẹn', description: body.description, startAt: body.startAt, endAt: body.endAt },
      user.userId,
    );
    workInboxOperationalMemoryStore.appendTimeline({
      taskId,
      eventType: 'TASK_APPOINTMENT_CREATED',
      eventLabel: row.title,
      actor: user.userId,
      payload: JSON.stringify(row),
    });
    return createEnvelope({ appointment: row }, { traceId });
  }
  if (kind === 'note') {
    const row = workInboxOperationalMemoryStore.saveNote(taskId, body.content ?? '', user.userId);
    workInboxOperationalMemoryStore.appendTimeline({
      taskId,
      eventType: 'TASK_NOTE_ADDED',
      eventLabel: 'Ghi chú',
      actor: user.userId,
      payload: JSON.stringify({ noteId: row.noteId }),
    });
    return createEnvelope({ note: row }, { traceId });
  }
  const row = workInboxOperationalMemoryStore.addDocument(
    taskId,
    { title: body.title ?? 'Tài liệu', url: body.url },
    user.userId,
  );
  workInboxOperationalMemoryStore.appendTimeline({
    taskId,
    eventType: 'TASK_DOCUMENT_ADDED',
    eventLabel: row.title,
    actor: user.userId,
    payload: JSON.stringify(row),
  });
  return createEnvelope({ document: row }, { traceId });
}

export async function handleWorkInboxSopLookup(request: Request, env: Env) {
  const user = resolveUserContext(request);
  const url = new URL(request.url);
  const module = url.searchParams.get('module') ?? 'WORK_INBOX';
  const taskType = url.searchParams.get('taskType') ?? url.searchParams.get('status') ?? 'TASK';

  if (isTaskDbRuntimeMode(env) && isTaskDbRuntimeConfigured(env)) {
    const res = await gsWiOpLookupSop(env, user, { module, taskType });
    if (!res.ok) {
      return createEnvelope(null, { ok: false, status: 'FAIL', errors: [res.message] });
    }
    return createEnvelope(res.data, { traceId: res.traceId });
  }

  return createEnvelope({
    sop: {
      sop_id: 'SOP-MODULE-INBOX',
      code: 'WORK_INBOX',
      title: 'Vận hành Work Inbox V3',
      category: 'MODULE',
      url: 'https://docs.google.com/document/d/placeholder-inbox',
      active: true,
    },
  });
}

export async function handleWorkInboxAppendAudit(request: Request, env: Env) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());
  const perfCtx = beginWorkerPerf(traceId, 'APPEND_ACTION_AUDIT');
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const taskId = String(body.taskId ?? '');
  const action = String(body.action ?? '');
  const role = normalizeWorkInboxRole(user.role);
  const op = actionCodeToOp(action);
  if (op && op !== 'NAVIGATE' && !canWorkInboxOp(role, op)) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Không có quyền'], traceId });
  }

  const entry = {
    traceId: String(body.traceId ?? traceId),
    taskId,
    action,
    actor: String(body.actor ?? user.userId),
    actorRole: role,
    beforeState: String(body.beforeState ?? ''),
    afterState: String(body.afterState ?? ''),
    payload: (body.payload as Record<string, unknown>) ?? {},
  };

  if (isTaskDbRuntimeMode(env) && isTaskDbRuntimeConfigured(env)) {
    const res = await gsWiOpAppendActionAudit(env, user, entry);
    if (!res.ok) {
      const envFail = createEnvelope(null, { ok: false, status: 'FAIL', errors: [res.message], traceId });
      return envelopeWithRoutePerf(request, 'APPEND_ACTION_AUDIT', perfCtx, envFail, res);
    }
    const envOk = createEnvelope(res.data, { traceId });
    return envelopeWithRoutePerf(request, 'APPEND_ACTION_AUDIT', perfCtx, envOk, res);
  }

  workInboxOperationalMemoryStore.appendAudit(entry);
  const envMem = createEnvelope({ auditId: entry.traceId, server: false }, { traceId });
  return envelopeWithRoutePerf(request, 'APPEND_ACTION_AUDIT', perfCtx, envMem);
}

export async function handleWorkInboxAppendTimeline(request: Request, env: Env) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());
  const perfCtx = beginWorkerPerf(traceId, 'APPEND_TIMELINE');
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const taskId = String(body.taskId ?? '');
  const eventType = String(body.eventType ?? '');
  const eventLabel = String(body.eventLabel ?? eventType);

  if (isTaskDbRuntimeMode(env) && isTaskDbRuntimeConfigured(env)) {
    const res = await gsWiOpAppendTimeline(
      env,
      user,
      taskId,
      eventType,
      eventLabel,
      String(body.actor ?? user.userId),
      (body.payload as Record<string, unknown>) ?? {},
      String(body.traceId ?? traceId),
    );
    if (!res.ok) {
      const envFail = createEnvelope(null, { ok: false, status: 'FAIL', errors: [res.message], traceId });
      return envelopeWithRoutePerf(request, 'APPEND_TIMELINE', perfCtx, envFail, res);
    }
    const envOk = createEnvelope(res.data, { traceId });
    return envelopeWithRoutePerf(request, 'APPEND_TIMELINE', perfCtx, envOk, res);
  }

  workInboxOperationalMemoryStore.appendTimeline({
    taskId,
    eventType,
    eventLabel,
    actor: String(body.actor ?? user.userId),
    payload: JSON.stringify(body.payload ?? {}),
  });
  const envMem = createEnvelope({ timelineId: traceId, server: false }, { traceId });
  return envelopeWithRoutePerf(request, 'APPEND_TIMELINE', perfCtx, envMem);
}

export async function handleWorkInboxFormTemplates(request: Request, env: Env) {
  const user = resolveUserContext(request);
  const category = new URL(request.url).searchParams.get('category') ?? undefined;

  if (isTaskDbRuntimeMode(env) && isTaskDbRuntimeConfigured(env)) {
    const res = await gsWiOpListFormTemplates(env, user, category);
    if (!res.ok) {
      return createEnvelope(null, { ok: false, status: 'FAIL', errors: [res.message] });
    }
    return createEnvelope(res.data, { traceId: res.traceId });
  }

  return createEnvelope({
    templates: [
      { template_id: 'TPL-GENERAL-01', title: 'Biên bản xử lý chung', category: 'GENERAL', url: '#', active: true },
    ],
  });
}
