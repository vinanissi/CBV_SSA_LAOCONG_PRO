/**
 * PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_P0 — combined mutation + timeline + audit (single GAS round-trip).
 */

function wiOpRecordAction_(payload, actor, traceId) {
  payload = payload || {};
  var action = String(payload.action || '').trim();
  var taskId = String(payload.taskId || '').trim();
  if (!action || !taskId) {
    return { ok: false, message: 'Thiếu action hoặc taskId' };
  }

  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('dispatchMs', 0);

  var actorRole = String(payload.actorRole || payload.actor_role || actor.role || '').toUpperCase();
  var beforeState = String(payload.beforeState || payload.before_state || '');
  var note = String(payload.note || payload.reason || '').trim();
  var innerPayload = payload.payload || {};

  var mutation = null;
  var timelineType = '';
  var timelineLabel = '';
  var auditAction = action;
  var afterState = '';
  var refreshPolicy = 'BUNDLE_ONLY';
  var combinedOpts = typeof taskDbCombinedMutationOpts_ === 'function' ? taskDbCombinedMutationOpts_() : null;

  var mutationStart = Date.now();
  switch (action) {
    case 'START_PROCESSING':
      mutation = taskDbUpdateTaskStatus_(taskId, 'IN_PROGRESS', actor, note || 'Bắt đầu xử lý', combinedOpts);
      timelineType = 'TASK_STARTED';
      timelineLabel = 'Đã bắt đầu xử lý';
      auditAction = 'ACTION_START_PROCESSING';
      afterState = 'IN_PROGRESS';
      break;

    case 'PAUSE_TASK': {
      mutation = taskDbUpdateTaskStatus_(taskId, 'ON_HOLD', actor, note || 'Tạm dừng', combinedOpts);
      if (!mutation.ok) {
        mutation = taskDbUpdateTaskStatus_(taskId, 'WAITING', actor, note || 'Tạm dừng', combinedOpts);
        afterState = 'WAITING';
      } else {
        afterState = 'ON_HOLD';
      }
      timelineType = 'TASK_PAUSED';
      timelineLabel = note || 'Tạm dừng';
      auditAction = 'ACTION_PAUSE_TASK';
      break;
    }

    case 'HANDOFF_TASK': {
      var assignee = String(innerPayload.assignee || innerPayload.recipient || '').trim();
      if (!assignee) return { ok: false, message: 'Thiếu người nhận chuyển giao' };
      var handoffNote = String(innerPayload.comment || note || '').trim();
      var assignNote = '→ ' + assignee + (handoffNote ? ' — ' + handoffNote : '');
      mutation = taskDbAssignTask_(taskId, assignee, actor, assignNote, combinedOpts);
      timelineType = 'TASK_HANDOFF';
      timelineLabel = assignNote;
      auditAction = 'ACTION_HANDOFF';
      afterState = assignee;
      innerPayload = { assignee: assignee, comment: handoffNote };
      break;
    }

    case 'COMPLETE_TASK':
      mutation = taskDbCompleteTask_(taskId, actor, note || 'Hoàn tất', combinedOpts);
      timelineType = 'TASK_COMPLETED';
      timelineLabel = 'Hoàn tất';
      auditAction = 'ACTION_COMPLETE_TASK';
      afterState = 'DONE';
      break;

    case 'SAVE_NOTE': {
      var content = String(innerPayload.content || payload.content || '').trim();
      if (!content) return { ok: false, message: 'Thiếu nội dung ghi chú' };
      var noteRes = wiOpSaveNote_(taskId, content, actor);
      if (!noteRes.ok) return noteRes;
      mutation = { ok: true, task: null, note: noteRes.note };
      timelineType = 'TASK_NOTE_ADDED';
      timelineLabel = 'Ghi chú';
      auditAction = 'ACTION_NOTE_ADDED';
      afterState = 'NOTE';
      refreshPolicy = 'BUNDLE_ONLY';
      break;
    }

    case 'CREATE_APPOINTMENT': {
      var title = String(innerPayload.title || payload.title || 'Lịch hẹn').trim();
      var aptRes = wiOpCreateAppointment_(taskId, {
        title: title,
        description: innerPayload.description || payload.description,
        startAt: innerPayload.startAt || payload.startAt,
        endAt: innerPayload.endAt || payload.endAt,
      }, actor);
      if (!aptRes.ok) return aptRes;
      mutation = { ok: true, task: null, appointment: aptRes.appointment };
      timelineType = 'TASK_APPOINTMENT_CREATED';
      timelineLabel = title;
      auditAction = 'ACTION_CREATE_APPOINTMENT';
      afterState = 'SCHEDULED';
      refreshPolicy = 'BUNDLE_ONLY';
      break;
    }

    default:
      return { ok: false, message: 'Combined action không hỗ trợ: ' + action };
  }

  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('mutationMs', Date.now() - mutationStart);

  if (!mutation || !mutation.ok) {
    return { ok: false, message: (mutation && mutation.message) || 'Mutation thất bại' };
  }

  if (typeof wiOpBeginAppendContext_ === 'function') wiOpBeginAppendContext_();
  var timelineEvent = null;
  var auditEvent = null;
  try {
    if (typeof wiOpAppendTimelineAndAuditCombined_ === 'function') {
      var combinedAppend = wiOpAppendTimelineAndAuditCombined_(
        {
          taskId: taskId,
          eventType: timelineType,
          eventLabel: timelineLabel,
          actor: actor.userId || actor.displayName || 'OPERATOR',
          payload: innerPayload,
          traceId: traceId,
        },
        {
          taskId: taskId,
          traceId: traceId,
          action: auditAction,
          actor: actor.userId || actor.displayName || 'OPERATOR',
          actorRole: actorRole,
          beforeState: beforeState,
          afterState: afterState,
          payload: innerPayload,
        },
      );
      timelineEvent = combinedAppend.timeline;
      auditEvent = combinedAppend.audit;
    } else {
      var timelineStart = Date.now();
      timelineEvent = wiOpAppendTimeline_({
        taskId: taskId,
        eventType: timelineType,
        eventLabel: timelineLabel,
        actor: actor.userId || actor.displayName || 'OPERATOR',
        payload: innerPayload,
        traceId: traceId,
      });
      if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('timelineAppendMs', Date.now() - timelineStart);

      var auditStart = Date.now();
      auditEvent = wiOpAppendActionAudit_({
        taskId: taskId,
        traceId: traceId,
        action: auditAction,
        actor: actor.userId || actor.displayName || 'OPERATOR',
        actorRole: actorRole,
        beforeState: beforeState,
        afterState: afterState,
        payload: innerPayload,
      });
      if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('auditAppendMs', Date.now() - auditStart);
    }

    if (!timelineEvent || !timelineEvent.ok || !auditEvent || !auditEvent.ok) {
      return {
        ok: false,
        message: 'Ghi timeline/audit thất bại sau mutation',
        taskId: taskId,
        action: action,
        partial: { mutation: mutation, timelineEvent: timelineEvent, auditEvent: auditEvent },
      };
    }
  } finally {
    if (typeof wiOpEndAppendContext_ === 'function') wiOpEndAppendContext_();
  }

  var taskPatch = mutation.task || null;
  if (taskPatch && typeof taskDbMapMinimalTaskPatchSlim_ === 'function') {
    taskPatch = taskDbMapMinimalTaskPatchSlim_(mutation.task);
  }
  return {
    ok: true,
    traceId: traceId,
    taskId: taskId,
    action: action,
    taskPatch: taskPatch,
    timelineEvent: timelineEvent,
    auditEvent: auditEvent,
    operationalPatch: mutation.note || mutation.appointment || null,
    refreshPolicy: refreshPolicy,
    combinedActionUsed: true,
  };
}

function wiOpHandleRecordAction_(action, payload, actor, traceId) {
  if (action !== 'wiOpRecordAction') return null;
  var result = wiOpRecordAction_(payload, actor, traceId);
  if (!result.ok) {
    return taskDbBuildResponse_(action, null, {
      traceId: traceId,
      ok: false,
      errors: [result.message || 'wiOpRecordAction failed'],
      code: 'COMBINED_ACTION_FAILED',
    });
  }
  return taskDbBuildResponse_(action, result, { traceId: traceId, code: 'OK' });
}
