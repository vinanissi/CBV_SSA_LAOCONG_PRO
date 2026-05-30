/**
 * PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME — USER-safe task create with timeline + audit.
 */

function wiOpMapCreatePriority_(raw) {
  var p = String(raw || 'NORMAL').trim().toUpperCase();
  if (p === 'LOW') return 'LOW';
  if (p === 'HIGH') return 'HIGH';
  if (p === 'MEDIUM') return 'MEDIUM';
  if (p === 'NORMAL') return 'MEDIUM';
  return 'MEDIUM';
}

function wiOpBuildCreateDescription_(payload) {
  var parts = [];
  var desc = String(payload.description || '').trim();
  if (desc) parts.push(desc);
  var phone = String(payload.relatedPhone || payload.phone || '').trim();
  var plate = String(payload.relatedPlate || payload.plate || '').trim();
  if (phone) parts.push('[SĐT: ' + phone + ']');
  if (plate) parts.push('[Biển số: ' + plate + ']');
  return parts.join('\n');
}

function wiOpCreateUserTask_(payload, actor, traceId) {
  payload = payload || {};
  actor = actor || {};
  var actorRole = String(payload.actorRole || actor.role || '').toUpperCase();
  var title = String(payload.title || '').trim();

  if (!title) return { ok: false, message: 'title là bắt buộc' };
  if (title.length > 200) return { ok: false, message: 'title tối đa 200 ký tự' };

  var description = wiOpBuildCreateDescription_(payload);
  if (description.length > 2000) return { ok: false, message: 'description tối đa 2000 ký tự' };

  var requestedOwner = String(payload.assignee || payload.ownerId || '').trim();
  if ((actorRole === 'USER' || actorRole === 'STAFF' || actorRole === 'VIEWER' || actorRole === 'VIEW_ONLY') && requestedOwner) {
    var actorId = String(actor.userId || '').trim();
    if (requestedOwner !== actorId) {
      return { ok: false, message: 'Không có quyền giao việc cho người khác' };
    }
  }

  var ownerId = actor.userId || actor.displayName;
  if (actorRole === 'ADMIN' || actorRole === 'MANAGER') {
    if (requestedOwner) ownerId = requestedOwner;
  }

  var createPayload = {
    title: title,
    description: description,
    priority: wiOpMapCreatePriority_(payload.priority),
    dueDate: payload.dueDate || '',
    assignee: ownerId,
    ownerId: ownerId,
    note: 'work_inbox_user_create',
    traceId: traceId || payload.traceId,
    source: 'work_inbox_user_create',
  };

  var created = taskDbCreateTask_(createPayload, actor);
  if (!created.ok) return created;

  var taskId = created.task && created.task.taskId ? created.task.taskId : '';
  var actorLabel = actor.displayName || actor.userId || 'USER';
  var timelineEvent = null;
  var auditEvent = null;

  if (taskId && typeof wiOpAppendTimelineAndAuditCombined_ === 'function') {
    var combined = wiOpAppendTimelineAndAuditCombined_(
      {
        taskId: taskId,
        eventType: 'TASK_CREATED_BY_USER',
        eventLabel: 'Tạo việc từ Work Inbox',
        actor: actorLabel,
        payload: { source: 'work_inbox_user_create', actorRole: actorRole },
      },
      {
        taskId: taskId,
        traceId: traceId || payload.traceId,
        action: 'ACTION_USER_CREATE_TASK',
        actor: actorLabel,
        actorRole: actorRole,
        beforeState: '',
        afterState: 'NEW',
        payload: { title: title, ownerId: ownerId },
      },
    );
    timelineEvent = combined && combined.timeline ? combined.timeline : null;
    auditEvent = combined && combined.audit ? combined.audit : null;
  } else if (taskId) {
    if (typeof wiOpAppendTimeline_ === 'function') {
      timelineEvent = wiOpAppendTimeline_({
        taskId: taskId,
        eventType: 'TASK_CREATED_BY_USER',
        eventLabel: 'Tạo việc từ Work Inbox',
        actor: actorLabel,
        payload: { source: 'work_inbox_user_create', actorRole: actorRole },
      });
    }
    if (typeof wiOpAppendActionAudit_ === 'function') {
      auditEvent = wiOpAppendActionAudit_({
        taskId: taskId,
        traceId: traceId || payload.traceId,
        action: 'ACTION_USER_CREATE_TASK',
        actor: actorLabel,
        actorRole: actorRole,
        beforeState: '',
        afterState: 'NEW',
        payload: { title: title, ownerId: ownerId },
      });
    }
  }

  return {
    ok: true,
    task: created.task,
    taskPatch: created.task,
    timelineEvent: timelineEvent,
    auditEvent: auditEvent,
    refreshPolicy: 'SELECTIVE',
    log: created.log,
  };
}
