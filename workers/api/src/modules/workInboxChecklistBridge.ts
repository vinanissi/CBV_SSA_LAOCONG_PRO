import type { Env } from '../contracts';
import type {
  ChecklistBridgeRequestBody,
  ChecklistBridgeResult,
} from '../contracts/workInboxChecklistBridge';
import { gsWiOpClBridge } from '../adapters/googleSheetWorkInboxOperationalAdapter';
import { resolveUserContext } from '../auth/userContext';
import { canWorkInboxOp, normalizeWorkInboxRole } from '../auth/workInboxPermissions';
import { createEnvelope, createTraceId } from '../utils/envelope';
import { isTaskDbRuntimeConfigured, isTaskDbRuntimeMode, taskDbRuntimeRequired } from './taskGsDb';
import { extractRequestTraceId } from './workInboxPerformanceTrace';

const READ_METHODS = new Set([
  'readChecklistItems',
  'readFeedback',
  'readAttachmentMetadata',
  'readLinks',
  'readHistory',
  'readTemplates',
]);

function canMutateBridge(role: string): boolean {
  return canWorkInboxOp(normalizeWorkInboxRole(role), 'NOTES');
}

export async function handleWorkInboxChecklistBridge(
  request: Request,
  env: Env,
  taskId: string,
) {
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

  let body: ChecklistBridgeRequestBody;
  try {
    body = (await request.json()) as ChecklistBridgeRequestBody;
  } catch {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Body JSON không hợp lệ'], traceId });
  }

  const method = body.method;
  if (!method) {
    return createEnvelope(null, { ok: false, status: 'FAIL', errors: ['method là bắt buộc'], traceId });
  }

  if (!READ_METHODS.has(method) && !canMutateBridge(user.role)) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['Không có quyền ghi checklist bridge'],
      traceId,
    });
  }

  const payload = { ...body, taskId: body.taskId || taskId, traceId: body.traceId || traceId };
  const result = await gsWiOpClBridge(env, payload, user, traceId);

  if (!result.ok) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: [result.message],
      traceId: result.traceId ?? traceId,
    });
  }

  return createEnvelope(result.data as ChecklistBridgeResult, {
    traceId: result.traceId ?? traceId,
    warnings: result.warnings ?? ['CHECKLIST_BRIDGE via Worker→GAS'],
  });
}
