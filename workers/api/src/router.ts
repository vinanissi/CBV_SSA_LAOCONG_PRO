import type { Env, TaskFilter } from './contracts';
import { handleMe } from './auth/me';
import { handleHealth, handleToday } from './modules/workboard';
import { handleTasksList, handleTaskDetail } from './modules/tasks';
import {
  handleCreateTask,
  handleUpdateTask,
  handleTaskWriteCapability,
} from './modules/taskWrite';
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
import { handleSearch } from './modules/search';
import { jsonEnvelope } from './utils/envelope';
import { createEnvelope } from './utils/envelope';
import { withCors } from './cors';

function resolveStatus(envelope: { ok: boolean; errors: string[] }): number {
  if (envelope.ok) return 200;
  if (envelope.errors.some((e) => e.includes('Không có quyền'))) return 403;
  if (
    envelope.errors.some(
      (e) =>
        e.includes('Role không hợp lệ') ||
        e.includes('Thiếu tham số') ||
        e.includes('không hợp lệ') ||
        e.includes('Không được cập nhật') ||
        e.includes('Body JSON'),
    )
  ) {
    return 400;
  }
  if (envelope.errors.some((e) => e.includes('Không tìm thấy'))) return 404;
  if (envelope.errors.some((e) => e.includes('Chức năng ghi chưa được bật'))) return 423;
  return 400;
}

export async function route(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return withCors(new Response(null, { status: 204 }), request, env);
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  let envelope;

  if (request.method === 'POST' && path === '/api/tasks') {
    envelope = await handleCreateTask(request, env);
    return withCors(jsonEnvelope(envelope as import('./contracts').ApiEnvelope<unknown>, resolveStatus(envelope)), request, env);
  }

  if (request.method === 'PATCH' && /^\/api\/tasks\/[^/]+$/.test(path)) {
    const taskId = path.split('/').pop()!;
    envelope = await handleUpdateTask(request, env, taskId);
    return withCors(jsonEnvelope(envelope as import('./contracts').ApiEnvelope<unknown>, resolveStatus(envelope)), request, env);
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    envelope = createEnvelope(null, {
      errors: ['Method not allowed for this route'],
      ok: false,
      status: 'FAIL',
    });
    return withCors(jsonEnvelope(envelope, 405), request, env);
  }

  switch (true) {
    case path === '/api/health':
      envelope = handleHealth(env);
      break;
    case path === '/api/me':
      envelope = handleMe(request);
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
      const taskId = path.split('/').pop()!;
      envelope = await handleTaskDetail(request, env, taskId);
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

  return withCors(
    jsonEnvelope(envelope as import('./contracts').ApiEnvelope<unknown>, resolveStatus(envelope)),
    request,
    env,
  );
}
