import type { Env, TaskFilter } from './contracts';
import { handleMe } from './auth/me';
import { handleAuthLogin, handleAuthLogout, handleAuthMe, handleGetUsers } from './auth/authHandlers';
import { handleHealth, handleRuntimeConnectivity } from './modules/workboard';
import { handleToday, handleHomeAlertClaim, handleHomeAlertResolve } from './modules/homeAlert';
import { handleTasksList, handleTaskDetail } from './modules/tasks';
import {
  handleCreateTask,
  handleUpdateTask,
  handleTaskWriteCapability,
} from './modules/taskWrite';
import {
  handleTaskDbHealth,
  handleTaskDbValidate,
  handleTaskWorkspaceSnapshot,
  handleTaskDbDetail,
  handleTaskDbCreate,
  handleTaskDbStatus,
  handleTaskDbAssign,
  handleTaskDbComment,
  handleTaskDbComplete,
  isTaskDbRuntimeConfigured,
  isTaskDbRuntimeMode,
} from './modules/taskGsDb';
import { handleFinanceList, handleFinanceAlerts } from './modules/finance';
import { handleHoSoList, handleHoSoAlerts } from './modules/hoso';
import {
  handleCoordination,
  handleCoordinationQueue,
  handleCoordinationOverdue,
  handleCoordinationWorkload,
} from './modules/coordination';
import { handleObservation, handleObservationAlerts, handleObservationHealth } from './modules/observation';
import { handlePlugins, handlePluginDetail } from './modules/plugins';
import { handleModulesList, handleModuleDetail, handleModulesStatus, handleModuleOpenLog } from './modules/modules';
import { handleSearch } from './modules/search';
import {
  handleWorkInboxAppendAudit,
  handleWorkInboxAppendTimeline,
  handleWorkInboxFormTemplates,
  handleWorkInboxOperationalBundle,
  handleWorkInboxOperationalWrite,
  handleWorkInboxSopLookup,
} from './modules/workInboxOperational';
import { handleWorkInboxRecordAction } from './modules/workInboxCombinedAction';
import { handleWorkInboxCreateTask } from './modules/workInboxCreateTask';
import {
  handleWorkInboxChecklistCreate,
  handleWorkInboxChecklistDelete,
  handleWorkInboxChecklistList,
  handleWorkInboxChecklistToggle,
  handleWorkInboxChecklistUpdate,
} from './modules/workInboxChecklist';
import { handleWorkInboxChecklistBridge } from './modules/workInboxChecklistBridge';
import {
  handleWorkInboxAttachmentsCreate,
  handleWorkInboxAttachmentsDelete,
  handleWorkInboxAttachmentsList,
  handleWorkInboxAttachmentsUpdate,
} from './modules/workInboxAttachments';
import type { ApiEnvelopeWire } from './utils/envelope';
import { corsJsonResponse, createEnvelope } from './utils/envelope';
import { withCors } from './cors';
import { decodeRouteTaskId, logRouteValidationError, validateTaskId } from './utils/routeParams';
import { createTraceId } from './utils/envelope';
import { resolveUserContext } from './auth/userContext';
import { badRequest } from './utils/errors';

function parseRouteTaskId(request: Request, raw: string): { taskId: string } | { error: ReturnType<typeof badRequest> } {
  const { taskId, encodedTaskId } = decodeRouteTaskId(raw);
  const validationError = validateTaskId(taskId);
  if (validationError) {
    const traceId = request.headers.get('X-CBV-Trace-Id') ?? request.headers.get('x-cbv-trace-id') ?? createTraceId();
    const user = resolveUserContext(request);
    logRouteValidationError({
      traceId,
      route: new URL(request.url).pathname,
      taskId,
      encodedTaskId,
      actor: user.userId,
      validationError,
    });
    return { error: badRequest(validationError, traceId) };
  }
  return { taskId };
}

export async function route(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return withCors(new Response(null, { status: 204 }), request, env);
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  let envelope: ApiEnvelopeWire<unknown>;

  if (request.method === 'POST' && path === '/api/auth/login') {
    envelope = await handleAuthLogin(request, env);
    return corsJsonResponse(request, env, envelope);
  }
  if (request.method === 'POST' && path === '/api/auth/logout') {
    envelope = await handleAuthLogout(request, env);
    return corsJsonResponse(request, env, envelope);
  }

  if (request.method === 'GET' && path === '/api/auth/me') {
    envelope = await handleAuthMe(request, env);
    return corsJsonResponse(request, env, envelope);
  }
  if (request.method === 'GET' && path === '/api/users') {
    envelope = await handleGetUsers(request, env);
    return corsJsonResponse(request, env, envelope);
  }

  // TASK_GS_01 — existing DB binding routes
  if (request.method === 'GET' && path === '/api/tasks/health') {
    envelope = await handleTaskDbHealth(env);
    return corsJsonResponse(request, env, envelope);
  }
  if (request.method === 'GET' && path === '/api/tasks/validate-db') {
    envelope = await handleTaskDbValidate(env);
    return corsJsonResponse(request, env, envelope);
  }
  if (request.method === 'GET' && path === '/api/tasks/workspace-snapshot') {
    envelope = await handleTaskWorkspaceSnapshot(request, env, url);
    return corsJsonResponse(request, env, envelope);
  }

  if (request.method === 'POST' && path === '/api/tasks') {
    if (isTaskDbRuntimeMode(env)) {
      envelope = await handleTaskDbCreate(request, env);
    } else if (isTaskDbRuntimeConfigured(env)) {
      envelope = createEnvelope(null, {
        ok: false,
        status: 'FAIL',
        errors: ['POST /api/tasks yêu cầu CBV_TASK_RUNTIME_MODE=google_sheet_existing_db'],
        warnings: ['TASK_RUNTIME_LEGACY_WRITE_BLOCKED'],
        traceId: `rt-${Date.now()}`,
      });
    } else {
      envelope = await handleCreateTask(request, env);
    }
    return corsJsonResponse(request, env, envelope);
  }

  const taskSubMatch = path.match(/^\/api\/tasks\/([^/]+)\/(status|assign|comments|complete)$/);
  if (taskSubMatch && request.method === 'POST') {
    if (!isTaskDbRuntimeMode(env)) {
      envelope = createEnvelope(null, {
        ok: false,
        status: 'FAIL',
        errors: [
          'Task write phải qua TASK_MAIN (google_sheet_existing_db) — không dùng legacy TASKS/TASK_TIMELINE',
        ],
        warnings: ['TASK_RUNTIME_LEGACY_WRITE_BLOCKED'],
        traceId: `rt-${Date.now()}`,
      });
      return corsJsonResponse(request, env, envelope);
    }
    const parsed = parseRouteTaskId(request, taskSubMatch[1]);
    if ('error' in parsed) {
      envelope = parsed.error;
      return corsJsonResponse(request, env, envelope);
    }
    const taskId = parsed.taskId;
    const sub = taskSubMatch[2];
    if (sub === 'status') envelope = await handleTaskDbStatus(request, env, taskId);
    else if (sub === 'assign') envelope = await handleTaskDbAssign(request, env, taskId);
    else if (sub === 'comments') envelope = await handleTaskDbComment(request, env, taskId);
    else envelope = await handleTaskDbComplete(request, env, taskId);
    return corsJsonResponse(request, env, envelope);
  }

  if (request.method === 'PATCH' && /^\/api\/tasks\/[^/]+$/.test(path)) {
    const rawId = path.split('/').pop()!;
    const parsed = parseRouteTaskId(request, rawId);
    if ('error' in parsed) {
      envelope = parsed.error;
      return corsJsonResponse(request, env, envelope);
    }
    const taskId = parsed.taskId;
    if (isTaskDbRuntimeMode(env)) {
      envelope = createEnvelope(null, {
        ok: false,
        status: 'FAIL',
        errors: ['PATCH không hỗ trợ trong TASK_GS_01 — dùng POST /api/tasks/:id/status|assign|complete'],
        warnings: ['TASK_RUNTIME_LEGACY_WRITE_BLOCKED'],
        traceId: `rt-${Date.now()}`,
      });
    } else {
      envelope = await handleUpdateTask(request, env, taskId);
    }
    return corsJsonResponse(request, env, envelope);
  }

  const homeAlertMatch = path.match(/^\/api\/home-alert\/([^/]+)\/(claim|resolve)$/);
  if (homeAlertMatch && request.method === 'POST') {
    const alertId = homeAlertMatch[1];
    const action = homeAlertMatch[2];
    envelope =
      action === 'claim'
        ? await handleHomeAlertClaim(request, env, alertId)
        : await handleHomeAlertResolve(request, env, alertId);
    return corsJsonResponse(request, env, envelope);
  }

  if (request.method === 'POST' && path === '/api/modules/open-log') {
    envelope = await handleModuleOpenLog(request, env);
    return corsJsonResponse(request, env, envelope);
  }

  const wiOpBundleMatch = path.match(/^\/api\/work-inbox\/tasks\/([^/]+)\/operational$/);
  if (wiOpBundleMatch && request.method === 'GET') {
    const parsed = parseRouteTaskId(request, wiOpBundleMatch[1]);
    if ('error' in parsed) {
      envelope = parsed.error;
      return corsJsonResponse(request, env, envelope);
    }
    envelope = await handleWorkInboxOperationalBundle(request, env, parsed.taskId);
    return corsJsonResponse(request, env, envelope);
  }

  const wiOpWriteMatch = path.match(/^\/api\/work-inbox\/tasks\/([^/]+)\/(appointment|note|document)$/);
  if (wiOpWriteMatch && request.method === 'POST') {
    const parsed = parseRouteTaskId(request, wiOpWriteMatch[1]);
    if ('error' in parsed) {
      envelope = parsed.error;
      return corsJsonResponse(request, env, envelope);
    }
    envelope = await handleWorkInboxOperationalWrite(
      request,
      env,
      parsed.taskId,
      wiOpWriteMatch[2] as 'appointment' | 'note' | 'document',
    );
    return corsJsonResponse(request, env, envelope);
  }

  if (request.method === 'GET' && path === '/api/work-inbox/sop') {
    envelope = await handleWorkInboxSopLookup(request, env);
    return corsJsonResponse(request, env, envelope);
  }

  if (request.method === 'GET' && path === '/api/work-inbox/form-templates') {
    envelope = await handleWorkInboxFormTemplates(request, env);
    return corsJsonResponse(request, env, envelope);
  }

  if (request.method === 'POST' && path === '/api/work-inbox/create-task') {
    envelope = await handleWorkInboxCreateTask(request, env);
    return corsJsonResponse(request, env, envelope);
  }

  const wiChecklistMatch = path.match(/^\/api\/work-inbox\/tasks\/([^/]+)\/checklist(?:\/([^/]+))?(?:\/(toggle))?$/);
  if (wiChecklistMatch) {
    const parsed = parseRouteTaskId(request, wiChecklistMatch[1]);
    if ('error' in parsed) {
      envelope = parsed.error;
      return corsJsonResponse(request, env, envelope);
    }
    const checklistId = wiChecklistMatch[2];
    const subAction = wiChecklistMatch[3];
    if (request.method === 'GET' && !checklistId) {
      envelope = await handleWorkInboxChecklistList(request, env, parsed.taskId);
    } else if (request.method === 'POST' && !checklistId) {
      envelope = await handleWorkInboxChecklistCreate(request, env, parsed.taskId);
    } else if (request.method === 'PATCH' && checklistId && !subAction) {
      envelope = await handleWorkInboxChecklistUpdate(request, env, parsed.taskId, checklistId);
    } else if (request.method === 'POST' && checklistId && subAction === 'toggle') {
      envelope = await handleWorkInboxChecklistToggle(request, env, parsed.taskId, checklistId);
    } else if (request.method === 'DELETE' && checklistId && !subAction) {
      envelope = await handleWorkInboxChecklistDelete(request, env, parsed.taskId, checklistId);
    } else {
      envelope = createEnvelope(null, {
        ok: false,
        status: 'FAIL',
        errors: ['Method not allowed for checklist route'],
      });
      return corsJsonResponse(request, env, envelope, 405);
    }
    return corsJsonResponse(request, env, envelope);
  }

  const wiChecklistBridgeMatch = path.match(/^\/api\/work-inbox\/tasks\/([^/]+)\/checklist-bridge$/);
  if (wiChecklistBridgeMatch && request.method === 'POST') {
    const parsed = parseRouteTaskId(request, wiChecklistBridgeMatch[1]);
    if ('error' in parsed) {
      envelope = parsed.error;
      return corsJsonResponse(request, env, envelope);
    }
    envelope = await handleWorkInboxChecklistBridge(request, env, parsed.taskId);
    return corsJsonResponse(request, env, envelope);
  }

  const wiAttachMatch = path.match(/^\/api\/work-inbox\/tasks\/([^/]+)\/attachments(?:\/([^/]+))?$/);
  if (wiAttachMatch) {
    const parsed = parseRouteTaskId(request, wiAttachMatch[1]);
    if ('error' in parsed) {
      envelope = parsed.error;
      return corsJsonResponse(request, env, envelope);
    }
    const attachmentId = wiAttachMatch[2];
    if (request.method === 'GET' && !attachmentId) {
      envelope = await handleWorkInboxAttachmentsList(request, env, parsed.taskId);
    } else if (request.method === 'POST' && !attachmentId) {
      envelope = await handleWorkInboxAttachmentsCreate(request, env, parsed.taskId);
    } else if (request.method === 'PATCH' && attachmentId) {
      envelope = await handleWorkInboxAttachmentsUpdate(request, env, parsed.taskId, attachmentId);
    } else if (request.method === 'DELETE' && attachmentId) {
      envelope = await handleWorkInboxAttachmentsDelete(request, env, parsed.taskId, attachmentId);
    } else {
      envelope = createEnvelope(null, { ok: false, status: 'FAIL', errors: ['Method not allowed for attachments route'] });
      return corsJsonResponse(request, env, envelope, 405);
    }
    return corsJsonResponse(request, env, envelope);
  }

  if (request.method === 'POST' && path === '/api/work-inbox/record-action') {
    envelope = await handleWorkInboxRecordAction(request, env);
    return corsJsonResponse(request, env, envelope);
  }

  if (request.method === 'POST' && path === '/api/work-inbox/audit') {
    envelope = await handleWorkInboxAppendAudit(request, env);
    return corsJsonResponse(request, env, envelope);
  }

  if (request.method === 'POST' && path === '/api/work-inbox/timeline') {
    envelope = await handleWorkInboxAppendTimeline(request, env);
    return corsJsonResponse(request, env, envelope);
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    envelope = createEnvelope(null, {
      errors: ['Method not allowed for this route'],
      ok: false,
      status: 'FAIL',
    });
    return corsJsonResponse(request, env, envelope, 405);
  }

  switch (true) {
    case path === '/api/health':
      envelope = await handleHealth(env);
      break;
    case path === '/api/runtime/connectivity':
      envelope = await handleRuntimeConnectivity(request, env);
      break;
    case path === '/api/me':
      envelope = await handleMe(request, env);
      break;
    case path === '/api/tasks/write-capability':
      envelope = handleTaskWriteCapability(request, env);
      break;
    case path === '/api/today':
      envelope = await handleToday(request, env);
      break;
    case path === '/api/tasks':
      envelope = await handleTasksList(request, env, url.searchParams.get('filter') as TaskFilter | undefined);
      break;
    case /^\/api\/tasks\/[^/]+$/.test(path): {
      const rawId = path.split('/').pop()!;
      const parsed = parseRouteTaskId(request, rawId);
      if ('error' in parsed) {
        envelope = parsed.error;
        break;
      }
      const taskId = parsed.taskId;
      if (isTaskDbRuntimeMode(env) || isTaskDbRuntimeConfigured(env)) {
        envelope = await handleTaskDbDetail(request, env, taskId);
      } else {
        envelope = await handleTaskDetail(request, env, taskId);
      }
      break;
    }
    case path === '/api/finance':
      envelope = await handleFinanceList(request, env);
      break;
    case path === '/api/finance/alerts':
      envelope = await handleFinanceAlerts(request, env);
      break;
    case path === '/api/hoso':
      envelope = await handleHoSoList(request, env);
      break;
    case path === '/api/hoso/alerts':
      envelope = await handleHoSoAlerts(request, env);
      break;
    case path === '/api/coordination':
      envelope = await handleCoordination(request, env);
      break;
    case path === '/api/coordination/queue':
      envelope = await handleCoordinationQueue(request, env);
      break;
    case path === '/api/coordination/workload':
      envelope = await handleCoordinationWorkload(request, env);
      break;
    case path === '/api/coordination/overdue':
      envelope = await handleCoordinationOverdue(request, env);
      break;
    case path === '/api/observation':
      envelope = await handleObservation(request, env);
      break;
    case path === '/api/observation/health':
      envelope = await handleObservationHealth(request, env);
      break;
    case path === '/api/observation/alerts':
      envelope = await handleObservationAlerts(request, env);
      break;
    case path === '/api/modules':
      envelope = await handleModulesList(request, env);
      break;
    case path === '/api/modules/status':
      envelope = await handleModulesStatus(request, env);
      break;
    case /^\/api\/modules\/[^/]+$/.test(path): {
      const moduleId = path.split('/').pop()!;
      envelope = await handleModuleDetail(request, env, moduleId);
      break;
    }
    case path === '/api/plugins':
      envelope = await handlePlugins(request, env);
      break;
    case /^\/api\/plugins\/[^/]+$/.test(path): {
      const pluginId = path.split('/').pop()!;
      envelope = await handlePluginDetail(request, env, pluginId);
      break;
    }
    case path === '/api/search':
      envelope = await handleSearch(request, env, url.searchParams.get('q') ?? '');
      break;
    default:
      envelope = createEnvelope(null, {
        errors: [`Route not found: ${path}`],
        ok: false,
        status: 'FAIL',
      });
  }

  return corsJsonResponse(request, env, envelope);
}
