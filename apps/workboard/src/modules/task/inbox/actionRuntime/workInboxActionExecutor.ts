import { api } from '@/api/client';
import type { ApiEnvelope, TaskDetail, TaskWriteResult } from '@/api/contracts';
import type { WorkInboxRuntimeContext } from '@/runtime/rcla/workInboxRuntimeContextTypes';
import { appendExecutionLog } from '@/shared/utils/inlineExecution';
import { appendOperationalTimeline, appendServerActionAudit } from '../operationalRuntime/workInboxOperationalService';
import { actionCodeToOp, normalizeWorkInboxRole } from '../operationalRuntime/workInboxOperationalPermissions';
import {
  buildBundleOnlyRefreshPlan,
  buildNoRefreshPlan,
  markDeferredBundleRefreshTrace,
  type WorkInboxActionRefreshPlan,
} from '../performance/workInboxRefreshPolicy';
import {
  createWorkInboxTraceId,
  setActiveWorkInboxTraceId,
  startWorkInboxTrace,
} from '../performance/workInboxPerformanceTrace';
import {
  extractPerformanceTraceFromEnvelope,
  ingestWorkInboxLatencyTrace,
} from '../performance/workInboxLatencyProfile';
import {
  isCombinedActionAvailable,
  mapActionCodeToCombined,
  recordWorkInboxCombinedAction,
  type WorkInboxCombinedActionType,
} from './workInboxCombinedActionClient';
import type {
  WorkInboxActionCode,
  WorkInboxActionResult,
  WorkInboxAuditEvent,
  WorkInboxTimelineEvent,
} from './workInboxActionTypes';

function fail(
  action: WorkInboxActionCode,
  taskId: string,
  actor: string,
  error: string,
  traceId: string,
): WorkInboxActionResult {
  return {
    ok: false,
    action,
    taskId,
    actor,
    traceId,
    timestamp: new Date().toISOString(),
    timelineWritten: false,
    auditWritten: false,
    error,
  };
}

function success(
  action: WorkInboxActionCode,
  taskId: string,
  actor: string,
  traceId: string,
  opts: {
    timelineWritten: boolean;
    auditWritten: boolean;
    message?: string;
    refreshPlan?: WorkInboxActionRefreshPlan;
    combinedActionUsed?: boolean;
    fallbackEndpointUsed?: boolean;
  },
): WorkInboxActionResult {
  return {
    ok: true,
    action,
    taskId,
    actor,
    traceId,
    timestamp: new Date().toISOString(),
    timelineWritten: opts.timelineWritten,
    auditWritten: opts.auditWritten,
    message: opts.message,
    refreshPlan: opts.refreshPlan,
    combinedActionUsed: opts.combinedActionUsed,
    fallbackEndpointUsed: opts.fallbackEndpointUsed,
  };
}

function assertPermission(ctx: WorkInboxRuntimeContext, action: WorkInboxActionCode): string | null {
  const op = actionCodeToOp(action);
  if (!op) return null;
  if (op === 'NAVIGATE') return null;
  if (!ctx.permissions.ops[op]) {
    return 'Bạn không có quyền thao tác việc này';
  }
  return null;
}

async function writeTimelineLegacy(
  ctx: WorkInboxRuntimeContext,
  taskId: string,
  event: WorkInboxTimelineEvent,
  label: string,
  traceId: string,
  payload?: Record<string, unknown>,
): Promise<boolean> {
  appendExecutionLog({ taskId, kind: 'STATUS', action: event, meta: label });
  const server = await appendOperationalTimeline({
    taskId,
    eventType: event,
    eventLabel: label,
    actor: ctx.operator.userId || ctx.operator.displayName || 'OPERATOR',
    payload: payload ?? {},
    traceId,
  });
  if (!server) {
    const res = await api.addTaskComment(taskId, `[${event}] ${label}`);
    return res.ok;
  }
  return server;
}

async function writeAuditLegacy(
  ctx: WorkInboxRuntimeContext,
  taskId: string,
  action: WorkInboxAuditEvent,
  traceId: string,
  beforeState: string,
  afterState: string,
  payload?: Record<string, unknown>,
): Promise<boolean> {
  return appendServerActionAudit({
    taskId,
    action,
    actor: ctx.operator.userId || ctx.operator.displayName || 'OPERATOR',
    operator: ctx.operator,
    traceId,
    beforeState,
    afterState,
    payload,
  });
}

export interface ActionExecutorDeps {
  onTaskUpdated?: (task: TaskDetail) => void;
  onApplyRefreshPlan?: (plan: WorkInboxActionRefreshPlan) => void;
  onForceSnapshotRefresh?: () => void;
}

function applyRefreshPlan(deps: ActionExecutorDeps, plan: WorkInboxActionRefreshPlan): void {
  if (plan.deferOperationalRefreshMs && plan.bundleRefreshNonBlocking) {
    markDeferredBundleRefreshTrace(plan.deferOperationalRefreshMs);
  }
  deps.onApplyRefreshPlan?.(plan);
}

async function tryCombinedAction(
  ctx: WorkInboxRuntimeContext,
  combinedType: WorkInboxCombinedActionType,
  taskId: string,
  traceId: string,
  beforeState: string,
  note: string | undefined,
  payload: Record<string, unknown>,
  runApi: (call: () => Promise<unknown>) => Promise<unknown>,
): Promise<{ ok: true; task?: TaskDetail; traceId: string } | { ok: false; useFallback: true } | { ok: false; error: string }> {
  if (!isCombinedActionAvailable()) {
    return { ok: false, useFallback: true };
  }
  const actor = ctx.operator.userId || ctx.operator.displayName || 'OPERATOR';
  const res = (await runApi(() =>
    recordWorkInboxCombinedAction({
      traceId,
      action: combinedType,
      taskId,
      actor,
      actorRole: normalizeWorkInboxRole(ctx.operator.role),
      beforeState,
      note,
      payload,
    }),
  )) as ApiEnvelope<{
    taskPatch?: TaskDetail;
    combinedActionUsed?: boolean;
  }>;

  if (!res.ok) {
    if (res.errors.some((e) => e.includes('404') || e.includes('UNKNOWN_ACTION'))) {
      return { ok: false, useFallback: true };
    }
    return { ok: false, error: res.errors[0] ?? 'Combined action thất bại' };
  }

  const task = (res.data?.taskPatch ?? undefined) as TaskDetail | undefined;
  return { ok: true, task, traceId: res.traceId ?? traceId };
}

export async function executeWorkInboxAction(
  ctx: WorkInboxRuntimeContext,
  action: WorkInboxActionCode,
  payload: Record<string, string | undefined> = {},
  deps: ActionExecutorDeps = {},
): Promise<WorkInboxActionResult> {
  const task = ctx.currentTask;
  const item = ctx.currentFocusItem;
  const taskId = task?.taskId ?? item?.id ?? '';
  const actor = ctx.operator.userId || ctx.operator.displayName || 'OPERATOR';
  const traceId = createWorkInboxTraceId(action);
  const perf = startWorkInboxTrace({ action, taskId, actor, traceId });
  setActiveWorkInboxTraceId(traceId);
  const actionStarted = performance.now();
  let lastPerformanceTrace: Record<string, unknown> | undefined;

  const runApi = async (call: () => Promise<unknown>): Promise<unknown> => {
    perf.markApiStart();
    try {
      const result = await call();
      if (result && typeof result === 'object') {
        lastPerformanceTrace =
          extractPerformanceTraceFromEnvelope(result as Record<string, unknown>) ?? lastPerformanceTrace;
      }
      return result;
    } finally {
      perf.markApiEnd();
    }
  };

  const finishPlan = (plan: WorkInboxActionRefreshPlan, extra?: { combined?: boolean; fallback?: boolean }) => {
    perf.setP0Flags({
      refreshPolicy: plan.refreshPolicy,
      snapshotRefreshSkipped: plan.snapshotRefreshSkipped,
      bundleRefreshTriggered: plan.bundleRefreshTriggered,
      combinedActionUsed: extra?.combined,
      fallbackEndpointUsed: extra?.fallback,
    });
    if (plan.needsOperationalBundleRefresh || plan.needsSnapshotRefresh) {
      perf.incrementRefresh();
    }
    applyRefreshPlan(deps, plan);
  };

  try {
    if (!taskId || !task) {
      return fail(action, taskId || 'unknown', actor, 'Không có task trong runtime context', traceId);
    }

    const permErr = assertPermission(ctx, action);
    if (permErr) {
      return fail(action, taskId, actor, permErr, traceId);
    }

    const beforeStatus = String(task.status ?? '');
    const combinedType = mapActionCodeToCombined(action);

    if (combinedType) {
      const combinedPayload: Record<string, unknown> = { ...payload };
      if (action === 'ACTION_HANDOFF') {
        combinedPayload.assignee = payload.recipient;
        combinedPayload.comment = payload.comment;
      }
      if (action === 'ACTION_CREATE_APPOINTMENT') {
        combinedPayload.title = payload.title ?? 'Lịch hẹn';
      }

      const combined = await tryCombinedAction(
        ctx,
        combinedType,
        taskId,
        traceId,
        beforeStatus,
        payload.reasonLabel ?? payload.reason ?? payload.note,
        combinedPayload,
        runApi,
      );

      if (combined.ok) {
        const plan = buildBundleOnlyRefreshPlan(combined.task);
        if (combined.task && deps.onTaskUpdated) {
          deps.onTaskUpdated(combined.task);
          plan.optimisticPatchApplied = true;
        }
        finishPlan(plan, { combined: true });
        const messages: Record<string, string> = {
          ACTION_START_PROCESSING: 'Đã bắt đầu xử lý',
          ACTION_PAUSE_TASK: 'Đã chuyển sang tạm dừng',
          ACTION_HANDOFF: 'Đã chuyển giao',
          ACTION_COMPLETE_TASK: 'Đã hoàn tất',
          ACTION_CREATE_APPOINTMENT: 'Đã ghi nhận lịch hẹn',
        };
        return success(action, taskId, actor, combined.traceId, {
          timelineWritten: true,
          auditWritten: true,
          message: messages[action],
          refreshPlan: plan,
          combinedActionUsed: true,
        });
      }

      if (!combined.ok) {
        if ('error' in combined) {
          return fail(action, taskId, actor, combined.error, traceId);
        }
        perf.setP0Flags({ fallbackEndpointUsed: true });
      }
    }

    switch (action) {
      case 'ACTION_START_PROCESSING': {
        const res = (await runApi(() => api.updateTaskStatus(taskId, 'IN_PROGRESS', 'Bắt đầu xử lý'))) as ApiEnvelope<TaskWriteResult>;
        if (!res.ok) return fail(action, taskId, actor, res.errors[0] ?? 'Không thể bắt đầu xử lý', res.traceId ?? traceId);
        const tl = await writeTimelineLegacy(ctx, taskId, 'TASK_STARTED', 'Đã bắt đầu xử lý', res.traceId ?? traceId, {
          status: 'IN_PROGRESS',
        });
        const aud = await writeAuditLegacy(ctx, taskId, 'ACTION_START_PROCESSING', res.traceId ?? traceId, beforeStatus, 'IN_PROGRESS');
        const taskPatch = res.data?.task as TaskDetail | undefined;
        const plan = buildBundleOnlyRefreshPlan(taskPatch);
        finishPlan(plan, { fallback: true });
        return success(action, taskId, actor, res.traceId ?? traceId, {
          timelineWritten: tl,
          auditWritten: aud,
          message: 'Đã bắt đầu xử lý',
          refreshPlan: plan,
          fallbackEndpointUsed: true,
        });
      }

      case 'ACTION_PAUSE_TASK': {
        const reason = payload.reasonLabel ?? payload.reason ?? 'Tạm dừng';
        const res = (await runApi(() => api.updateTaskStatus(taskId, 'ON_HOLD', reason))) as ApiEnvelope<TaskWriteResult>;
        let after = 'ON_HOLD';
        let taskPatch = res.data?.task as TaskDetail | undefined;
        if (!res.ok) {
          const fallback = (await runApi(() => api.updateTaskStatus(taskId, 'WAITING', reason))) as ApiEnvelope<TaskWriteResult>;
          if (!fallback.ok) {
            return fail(action, taskId, actor, fallback.errors[0] ?? 'Không thể tạm dừng', fallback.traceId ?? traceId);
          }
          taskPatch = fallback.data?.task as TaskDetail | undefined;
          after = 'WAITING';
        }
        const tl = await writeTimelineLegacy(ctx, taskId, 'TASK_PAUSED', reason, traceId, { reason });
        const aud = await writeAuditLegacy(ctx, taskId, 'ACTION_PAUSE_TASK', traceId, beforeStatus, after, { reason });
        const plan = buildBundleOnlyRefreshPlan(taskPatch);
        finishPlan(plan, { fallback: true });
        return success(action, taskId, actor, traceId, {
          timelineWritten: tl,
          auditWritten: aud,
          message: 'Đã chuyển sang tạm dừng',
          refreshPlan: plan,
          fallbackEndpointUsed: true,
        });
      }

      case 'ACTION_HANDOFF': {
        const assignee = String(payload.recipient ?? '').trim();
        const comment = String(payload.comment ?? '').trim();
        if (!assignee) {
          return fail(action, taskId, actor, 'Chọn người nhận chuyển giao', traceId);
        }
        const note = `→ ${assignee}${comment ? ` — ${comment}` : ''}`;
        const res = (await runApi(() => api.assignTask(taskId, assignee, note))) as ApiEnvelope<TaskWriteResult>;
        if (!res.ok) return fail(action, taskId, actor, res.errors[0] ?? 'Chuyển giao thất bại', res.traceId ?? traceId);
        const tl = await writeTimelineLegacy(ctx, taskId, 'TASK_HANDOFF', note, res.traceId ?? traceId, { assignee, comment });
        const aud = await writeAuditLegacy(ctx, taskId, 'ACTION_HANDOFF', res.traceId ?? traceId, beforeStatus, assignee, {
          assignee,
          comment,
        });
        const plan = buildBundleOnlyRefreshPlan(res.data?.task as TaskDetail | undefined);
        finishPlan(plan, { fallback: true });
        return success(action, taskId, actor, res.traceId ?? traceId, {
          timelineWritten: tl,
          auditWritten: aud,
          message: 'Đã chuyển giao',
          refreshPlan: plan,
          fallbackEndpointUsed: true,
        });
      }

      case 'ACTION_COMPLETE_TASK': {
        const res = (await runApi(() => api.completeTask(taskId, 'Hoàn tất từ Focus'))) as ApiEnvelope<TaskWriteResult>;
        if (!res.ok) return fail(action, taskId, actor, res.errors[0] ?? 'Không thể hoàn tất', res.traceId ?? traceId);
        const tl = await writeTimelineLegacy(ctx, taskId, 'TASK_COMPLETED', 'Hoàn tất', res.traceId ?? traceId);
        const aud = await writeAuditLegacy(ctx, taskId, 'ACTION_COMPLETE_TASK', res.traceId ?? traceId, beforeStatus, 'DONE');
        const plan = buildBundleOnlyRefreshPlan(res.data?.task as TaskDetail | undefined);
        finishPlan(plan, { fallback: true });
        return success(action, taskId, actor, res.traceId ?? traceId, {
          timelineWritten: tl,
          auditWritten: aud,
          message: 'Đã hoàn tất',
          refreshPlan: plan,
          fallbackEndpointUsed: true,
        });
      }

      case 'ACTION_CALL_CLICK': {
        const phone = payload.phone ?? '';
        const aud = await writeAuditLegacy(ctx, taskId, 'ACTION_CALL_CLICK', traceId, '', phone, { phone });
        const plan = buildNoRefreshPlan();
        finishPlan(plan);
        return success(action, taskId, actor, traceId, {
          timelineWritten: false,
          auditWritten: aud,
          refreshPlan: plan,
          message: phone ? 'Đã sao chép số điện thoại' : undefined,
        });
      }

      case 'ACTION_MESSAGE_CLICK': {
        const aud = await writeAuditLegacy(ctx, taskId, 'ACTION_MESSAGE_CLICK', traceId, '', payload.channel ?? '', {
          channel: payload.channel,
        });
        const plan = buildNoRefreshPlan();
        finishPlan(plan);
        return success(action, taskId, actor, traceId, { timelineWritten: false, auditWritten: aud, refreshPlan: plan });
      }

      case 'ACTION_CREATE_APPOINTMENT': {
        const title = payload.title ?? 'Lịch hẹn';
        const { workInboxOperationalApi } = await import('../operationalRuntime/workInboxOperationalApi');
        const apt = (await runApi(() =>
          workInboxOperationalApi.createAppointment(taskId, {
            title,
            description: payload.description,
            startAt: payload.startAt,
            endAt: payload.endAt,
          }),
        )) as ApiEnvelope<unknown>;
        if (!apt.ok) {
          return fail(action, taskId, actor, apt.errors[0] ?? 'Không tạo được lịch hẹn', traceId);
        }
        const tl = await writeTimelineLegacy(ctx, taskId, 'TASK_APPOINTMENT_CREATED', title, traceId);
        const aud = await writeAuditLegacy(ctx, taskId, 'ACTION_CREATE_APPOINTMENT', traceId, '', 'SCHEDULED', { title });
        const plan = buildBundleOnlyRefreshPlan();
        finishPlan(plan, { fallback: true });
        return success(action, taskId, actor, traceId, {
          timelineWritten: tl,
          auditWritten: aud,
          message: 'Đã ghi nhận lịch hẹn',
          refreshPlan: plan,
          fallbackEndpointUsed: true,
        });
      }

      case 'ACTION_NAVIGATE_NEXT':
      case 'ACTION_NAVIGATE_PREVIOUS': {
        const aud = await writeAuditLegacy(
          ctx,
          taskId,
          action === 'ACTION_NAVIGATE_NEXT' ? 'ACTION_NAVIGATE_NEXT' : 'ACTION_NAVIGATE_PREVIOUS',
          traceId,
          '',
          String(ctx.focusIndex),
        );
        const plan = buildNoRefreshPlan();
        finishPlan(plan);
        return success(action, taskId, actor, traceId, { timelineWritten: false, auditWritten: aud, refreshPlan: plan });
      }

      default:
        return fail(action, taskId, actor, 'Chức năng đang chuẩn bị', traceId);
    }
  } finally {
    const finished = perf.finish();
    ingestWorkInboxLatencyTrace({
      action,
      traceId,
      taskId,
      actor,
      totalDurationMs: finished.durationMs ?? Math.round(performance.now() - actionStarted),
      performanceTrace: lastPerformanceTrace,
      requestCount: finished.requestCount,
      fe: {
        prepareMs: finished.layerTimings.fePrepareMs,
        refreshMs: finished.layerTimings.feRefreshMs,
        renderMs: finished.layerTimings.feRenderMs,
      },
    });
    setActiveWorkInboxTraceId(undefined);
  }
}
