/**
 * RF_12 — GAS Runtime API — Task read/write (append-only timeline + audit).
 */

function mapTaskRowToWorker_(row) {
  var assignee = String(row.assignee || '').trim();
  return {
    taskId: String(row.task_id || ''),
    title: String(row.title || ''),
    description: String(row.description || ''),
    status: String(row.status || 'NEW'),
    priority: String(row.priority || 'MEDIUM'),
    owner: assignee,
    ownerId: assignee,
    dueDate: String(row.due_date || ''),
    href: '/tasks/' + String(row.task_id || ''),
    permissionAllowed: true,
    isMine: false,
    module: 'TASK',
    taskModule: 'TASK',
    relatedHoSoId: String(row.related_hoso_id || '') || undefined,
    relatedFinanceId: String(row.related_finance_id || '') || undefined,
    source: 'GAS Sheet — RF_12',
    timeline: [],
    files: [],
  };
}

function taskSnapshot_(row) {
  return {
    title: row.title,
    status: row.status,
    priority: row.priority,
    assignee: row.assignee,
    due_date: row.due_date,
    description: row.description,
  };
}

function getTasks_(filter) {
  bootstrapSheets_();
  var sheet = ensureSheetWithHeaders_(RF12_CONFIG.SHEETS.TASKS, RF12_CONFIG.TASK_HEADERS);
  var headerMap = getHeaderMap_(sheet);
  var items = [];
  for (var r = 2; r <= sheet.getLastRow(); r++) {
    var row = rowToObject_(sheet, r, headerMap);
    if (!row.task_id) continue;
    var task = mapTaskRowToWorker_(row);
    items.push(task);
  }

  if (filter === 'mine') {
    // filter applied client-side by worker with actor context
  } else if (filter === 'pending') {
    items = items.filter(function (t) {
      return ['NEW', 'WAITING', 'ASSIGNED', 'IN_PROGRESS'].indexOf(t.status) >= 0;
    });
  } else if (filter === 'overdue') {
    var today = todayDate_();
    items = items.filter(function (t) {
      return t.dueDate && t.dueDate < today && t.status !== 'DONE';
    });
  } else if (filter === 'approval') {
    items = items.filter(function (t) {
      return t.status === 'WAITING' || t.status === 'WAITING_APPROVAL';
    });
  }

  return items;
}

function getTaskDetail_(taskId) {
  bootstrapSheets_();
  var sheet = ensureSheetWithHeaders_(RF12_CONFIG.SHEETS.TASKS, RF12_CONFIG.TASK_HEADERS);
  var headerMap = getHeaderMap_(sheet);
  for (var r = 2; r <= sheet.getLastRow(); r++) {
    var row = rowToObject_(sheet, r, headerMap);
    if (String(row.task_id) === String(taskId)) {
      var task = mapTaskRowToWorker_(row);
      task.timeline = getTimelineForTask_(taskId);
      return task;
    }
  }
  return null;
}

function createTask_(payload, actor, traceId) {
  bootstrapSheets_();
  if (!rf12CanCreate_(actor)) {
    return { ok: false, code: 'FORBIDDEN', message: 'Không có quyền tạo việc' };
  }

  var sanitized = sanitizeTaskPayload_(payload, RF12_CONFIG.ALLOWED_CREATE_FIELDS);
  var errors = validateTaskPayload_(sanitized, 'create');
  if (errors.length) {
    return { ok: false, code: 'VALIDATION', message: errors.join('; ') };
  }

  if (sanitized.assignee && !rf12CanAssign_(actor)) {
    return { ok: false, code: 'FORBIDDEN', message: 'Không có quyền giao việc' };
  }

  var sheet = ensureSheetWithHeaders_(RF12_CONFIG.SHEETS.TASKS, RF12_CONFIG.TASK_HEADERS);
  var headerMap = getHeaderMap_(sheet);
  var taskId = makeId_('TASK');
  var now = nowIso_();
  var assignee = sanitized.assignee ? String(sanitized.assignee).trim() : actor.userId;

  var rowObj = {
    task_id: taskId,
    title: String(sanitized.title).trim(),
    description: String(sanitized.description || '').trim(),
    status: 'NEW',
    priority: String(sanitized.priority || 'MEDIUM').toUpperCase(),
    assignee: assignee,
    due_date: sanitized.dueDate || todayDate_(),
    related_hoso_id: sanitized.relatedHoSoId || '',
    related_finance_id: sanitized.relatedFinanceId || '',
    created_at: now,
    updated_at: now,
    created_by: actor.displayName,
    updated_by: actor.displayName,
  };

  sheet.appendRow(objectToRow_(headerMap, rowObj));

  var event = appendTimeline_({
    taskId: taskId,
    actor: actor.displayName,
    action: 'CREATE',
    before: null,
    after: taskSnapshot_(rowObj),
    note: sanitized.note || 'Tạo việc mới',
    traceId: traceId,
  });

  appendAuditLog_({
    traceId: traceId,
    actor: actor.displayName,
    action: 'create_task',
    status: 'OK',
    detail: { taskId: taskId },
  });

  var task = mapTaskRowToWorker_(rowObj);
  task.timeline = getTimelineForTask_(taskId);
  return { ok: true, task: task, event: event };
}

function updateTask_(taskId, payload, actor, traceId) {
  bootstrapSheets_();
  var sheet = ensureSheetWithHeaders_(RF12_CONFIG.SHEETS.TASKS, RF12_CONFIG.TASK_HEADERS);
  var headerMap = getHeaderMap_(sheet);
  var targetRow = -1;
  var existing = null;

  for (var r = 2; r <= sheet.getLastRow(); r++) {
    var row = rowToObject_(sheet, r, headerMap);
    if (String(row.task_id) === String(taskId)) {
      targetRow = r;
      existing = row;
      break;
    }
  }

  if (!existing) {
    return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy việc' };
  }

  if (!rf12CanUpdateTask_(actor, existing)) {
    return { ok: false, code: 'FORBIDDEN', message: 'Không có quyền cập nhật việc này' };
  }

  var sanitized = sanitizeTaskPayload_(payload, RF12_CONFIG.ALLOWED_UPDATE_FIELDS);
  var errors = validateTaskPayload_(sanitized, 'update');
  if (errors.length) {
    return { ok: false, code: 'VALIDATION', message: errors.join('; ') };
  }

  if (sanitized.assignee !== undefined && !rf12CanAssign_(actor)) {
    return { ok: false, code: 'FORBIDDEN', message: 'Không có quyền đổi người phụ trách' };
  }

  var before = taskSnapshot_(existing);
  var updated = {
    title: sanitized.title !== undefined ? String(sanitized.title).trim() : existing.title,
    description: sanitized.description !== undefined ? String(sanitized.description).trim() : existing.description,
    status: sanitized.status !== undefined ? String(sanitized.status).toUpperCase() : existing.status,
    priority: sanitized.priority !== undefined ? String(sanitized.priority).toUpperCase() : existing.priority,
    assignee: sanitized.assignee !== undefined ? String(sanitized.assignee).trim() : existing.assignee,
    due_date: sanitized.dueDate !== undefined ? sanitized.dueDate : existing.due_date,
    updated_at: nowIso_(),
    updated_by: actor.displayName,
  };

  Object.keys(updated).forEach(function (key) {
    var idx = headerMap[key.toLowerCase()];
    if (idx !== undefined) {
      sheet.getRange(targetRow, idx + 1).setValue(updated[key]);
    }
  });

  var merged = {};
  Object.keys(existing).forEach(function (k) { merged[k] = existing[k]; });
  Object.keys(updated).forEach(function (k) { merged[k] = updated[k]; });

  var event = appendTimeline_({
    taskId: taskId,
    actor: actor.displayName,
    action: 'UPDATE',
    before: before,
    after: taskSnapshot_(merged),
    note: sanitized.note || 'Cập nhật việc',
    traceId: traceId,
  });

  appendAuditLog_({
    traceId: traceId,
    actor: actor.displayName,
    action: 'update_task',
    status: 'OK',
    detail: { taskId: taskId },
  });

  var task = mapTaskRowToWorker_(merged);
  task.timeline = getTimelineForTask_(taskId);
  return { ok: true, task: task, event: event };
}
