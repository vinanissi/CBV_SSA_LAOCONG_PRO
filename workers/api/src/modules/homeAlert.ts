import type { Env, TodaySummary, UserContext } from '../contracts';
import { resolveUserContext, canViewModule } from '../auth/userContext';
import { canUserSeeTask, toTaskPermissionFields } from '../auth/taskPermissions';
import { canClaimHomeAlert, canResolveHomeAlert, canViewHomeAlert } from '../auth/homeAlertPermissions';
import {
  gsClaimHomeAlert,
  gsGetHomeAlertTodaySummary,
  gsResolveHomeAlert,
  isHomeAlertRuntimeConfigured,
  normalizeTodaySummary,
} from '../adapters/googleSheetHomeAlertAdapter';
import { isTaskDbRuntimeMode } from './taskGsDb';
import { getTodaySummary } from '../adapters/mockData';
import { isGasRuntimeMode } from '../env';
import { createEnvelope, createTraceId } from '../utils/envelope';
import { forbidden, notFound, badRequest } from '../utils/errors';

function filterTodayForUser(summary: TodaySummary, user: UserContext): TodaySummary {
  const alerts = (summary.alerts ?? []).filter((a) => canViewHomeAlert(user, a));
  const filterTasks = (tasks: TodaySummary['priorityTasks']) =>
    tasks.filter((t) => canUserSeeTask(user, toTaskPermissionFields(t)));

  return {
    ...summary,
    alerts,
    priorityTasks: filterTasks(summary.priorityTasks),
    myTasks: filterTasks(summary.myTasks),
    overdueTasks: filterTasks(summary.overdueTasks),
  };
}

function homeAlertErrorEnvelope(result: { code: string; message: string; traceId?: string }) {
  return createEnvelope<null>(null, {
    ok: false,
    status: 'FAIL',
    errors: [result.message],
    warnings: [result.code],
    traceId: result.traceId,
  });
}

export async function handleToday(request: Request, env: Env) {
  const user = resolveUserContext(request);
  if (!canViewModule(user, 'TASK')) {
    return forbidden('Không có quyền xem việc hôm nay');
  }

  if (isTaskDbRuntimeMode(env) && isHomeAlertRuntimeConfigured(env)) {
    const result = await gsGetHomeAlertTodaySummary(env, user);
    if (!result.ok) return homeAlertErrorEnvelope(result);

    const normalized = normalizeTodaySummary(result.data);
    const filtered = filterTodayForUser(normalized, user);
    const warnings = [
      ...result.warnings,
      'HOME_ALERT_LIVE — /api/today từ sheet HOME_ALERT',
      ...(result.data.runtime?.source ? [`source:${result.data.runtime.source}`] : []),
    ];
    if ((result.data.warnings ?? []).length) warnings.push(...(result.data.warnings ?? []));

    return createEnvelope(filtered, { warnings, traceId: result.traceId });
  }

  if (isTaskDbRuntimeMode(env) || isGasRuntimeMode(env)) {
    return createEnvelope(null, {
      ok: false,
      status: 'FAIL',
      errors: ['HOME_ALERT runtime chưa cấu hình — không trả mock trong production mode'],
      warnings: ['HOME_ALERT_MOCK_BLOCKED', 'GAS_TASK_API_URL required'],
      traceId: createTraceId(),
    });
  }

  return createEnvelope(getTodaySummary(user), {
    warnings: ['Worker projection — demo local mock'],
  });
}

export async function handleHomeAlertClaim(request: Request, env: Env, alertId: string) {
  const user = resolveUserContext(request);
  const traceId = createTraceId();

  if (!isTaskDbRuntimeMode(env) || !isHomeAlertRuntimeConfigured(env)) {
    return homeAlertErrorEnvelope({
      code: 'HOME_ALERT_RUNTIME_NOT_CONFIGURED',
      message: 'HOME_ALERT runtime chưa cấu hình',
      traceId,
    });
  }

  let body: { note?: string } = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as { note?: string };
  } catch {
    return badRequest('Body JSON không hợp lệ');
  }

  const today = await gsGetHomeAlertTodaySummary(env, user);
  if (!today.ok) return homeAlertErrorEnvelope(today);

  const alert = (today.data.alerts ?? []).find((a) => a.alertId === alertId);
  if (!alert) return notFound('Không tìm thấy alert');

  if (!canClaimHomeAlert(user, alert)) {
    return forbidden('Bạn không có quyền nhận alert này');
  }

  const result = await gsClaimHomeAlert(env, alertId, user, body.note);
  if (!result.ok) return homeAlertErrorEnvelope(result);

  return createEnvelope(result.data, { warnings: result.warnings, traceId: result.traceId });
}

export async function handleHomeAlertResolve(request: Request, env: Env, alertId: string) {
  const user = resolveUserContext(request);
  const traceId = createTraceId();

  if (!isTaskDbRuntimeMode(env) || !isHomeAlertRuntimeConfigured(env)) {
    return homeAlertErrorEnvelope({
      code: 'HOME_ALERT_RUNTIME_NOT_CONFIGURED',
      message: 'HOME_ALERT runtime chưa cấu hình',
      traceId,
    });
  }

  let body: { note?: string } = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as { note?: string };
  } catch {
    return badRequest('Body JSON không hợp lệ');
  }

  const today = await gsGetHomeAlertTodaySummary(env, user);
  if (!today.ok) return homeAlertErrorEnvelope(today);

  const alert = (today.data.alerts ?? []).find((a) => a.alertId === alertId);
  if (!alert) return notFound('Không tìm thấy alert');

  if (!canResolveHomeAlert(user, alert)) {
    return forbidden('Bạn không có quyền đóng alert này');
  }

  const result = await gsResolveHomeAlert(env, alertId, user, body.note);
  if (!result.ok) return homeAlertErrorEnvelope(result);

  return createEnvelope(result.data, { warnings: result.warnings, traceId: result.traceId });
}
