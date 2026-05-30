import type { Env, UserContext } from '../contracts';
import type {
  WorkInboxCombinedActionRequest,
  WorkInboxCombinedActionResponse,
} from '../contracts/workInboxCombinedAction';
import { callTaskDbGas } from '../adapters/googleSheetTaskDbAdapter';
import { isTaskDbRuntimeConfigured, isTaskDbRuntimeMode } from './taskGsDb';
import { resolveUserContext } from '../auth/userContext';
import { createEnvelope, createTraceId } from '../utils/envelope';
import {
  beginWorkerPerf,
  envelopeWithRoutePerf,
  extractRequestTraceId,
  markWorkerValidationEnd,
} from './workInboxPerformanceTrace';
import { workInboxOperationalMemoryStore } from './workInboxOperationalStore';

export async function gsWiOpRecordAction(
  env: Env,
  user: UserContext,
  body: WorkInboxCombinedActionRequest,
  traceId: string,
) {
  return callTaskDbGas<WorkInboxCombinedActionResponse>(
    env,
    'wiOpRecordAction',
    {
      action: body.action,
      taskId: body.taskId,
      actorRole: body.actorRole,
      beforeState: body.beforeState ?? '',
      note: body.note,
      payload: body.payload ?? {},
    },
    user,
    traceId,
  );
}

function memoryCombinedAction(
  user: UserContext,
  body: WorkInboxCombinedActionRequest,
  traceId: string,
): WorkInboxCombinedActionResponse {
  const taskId = body.taskId;
  workInboxOperationalMemoryStore.appendTimeline({
    taskId,
    eventType: body.action,
    eventLabel: body.note ?? body.action,
    actor: body.actor,
    payload: JSON.stringify(body.payload ?? {}),
  });
  workInboxOperationalMemoryStore.appendAudit({
    traceId,
    taskId,
    action: body.action,
    actor: body.actor,
    actorRole: body.actorRole,
    beforeState: body.beforeState ?? '',
    afterState: body.action,
    payload: body.payload ?? {},
  });
  return {
    ok: true,
    traceId,
    taskId,
    action: body.action,
    taskPatch: null,
    refreshPolicy: 'BUNDLE_ONLY',
    combinedActionUsed: false,
  };
}

export async function handleWorkInboxRecordAction(request: Request, env: Env) {
  const user = resolveUserContext(request);
  const traceId = extractRequestTraceId(request, createTraceId());
  const perfCtx = beginWorkerPerf(traceId, 'WI_OP_RECORD_ACTION');
  const body = (await request.json().catch(() => ({}))) as WorkInboxCombinedActionRequest;

  markWorkerValidationEnd(perfCtx);

  if (!body.taskId || !body.action) {
    const fail = createEnvelope<WorkInboxCombinedActionResponse | null>(null, {
      ok: false,
      status: 'FAIL',
      errors: ['Thiếu taskId hoặc action'],
      traceId,
    });
    return envelopeWithRoutePerf(request, 'WI_OP_RECORD_ACTION', perfCtx, fail);
  }

  const req: WorkInboxCombinedActionRequest = {
    traceId: body.traceId ?? traceId,
    action: body.action,
    taskId: body.taskId,
    actor: body.actor ?? user.userId,
    actorRole: body.actorRole ?? user.role,
    beforeState: body.beforeState,
    note: body.note,
    payload: body.payload,
  };

  if (isTaskDbRuntimeMode(env) && isTaskDbRuntimeConfigured(env)) {
    const result = await gsWiOpRecordAction(env, user, req, req.traceId);
    if (!result.ok) {
      const fail = createEnvelope<WorkInboxCombinedActionResponse | null>(null, {
        ok: false,
        status: 'FAIL',
        errors: [result.message],
        traceId: result.traceId ?? traceId,
      });
      return envelopeWithRoutePerf(request, 'WI_OP_RECORD_ACTION', perfCtx, fail, result);
    }
    const data = result.data as WorkInboxCombinedActionResponse;
    const ok = createEnvelope(data, { traceId: result.traceId ?? traceId });
    return envelopeWithRoutePerf(request, 'WI_OP_RECORD_ACTION', perfCtx, ok, result);
  }

  const mem = memoryCombinedAction(user, req, traceId);
  const ok = createEnvelope(mem, { traceId });
  return envelopeWithRoutePerf(request, 'WI_OP_RECORD_ACTION', perfCtx, ok);
}
