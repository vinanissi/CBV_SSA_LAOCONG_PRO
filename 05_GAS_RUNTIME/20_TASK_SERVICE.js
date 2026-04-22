/**
 * CBV Task Service - Public API for TASK_CENTER.
 * Task belongs to HTX; users shared. Workflow enforced by GAS.
 * Dependencies: 20_TASK_REPOSITORY, 20_TASK_VALIDATION, 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_*
 */

/** STATUS values where DUE_DATE still matters for SLA (align TASK_OPEN / OVERDUE_HINT). */
var TASK_MAIN_STATUSES_ELIGIBLE_OVERDUE = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING'];

/**
 * @param {*} dueVal - Sheet Date or parseable string
 * @returns {number|null} start-of-day millis in script timezone, or null
 */
function _taskMainDueDateStartMillis(dueVal) {
  if (dueVal === undefined || dueVal === null || dueVal === '') return null;
  var d = dueVal instanceof Date ? new Date(dueVal.getTime()) : new Date(dueVal);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function _taskMainTodayStartMillis() {
  var t = new Date();
  t.setHours(0, 0, 0, 0);
  return t.getTime();
}

/**
 * True when task has DUE_DATE before today and STATUS is still open (not DONE/CANCELLED/ARCHIVED).
 * @param {Object} row - TASK_MAIN row object
 * @returns {boolean}
 */
function taskMainIsOverdue(row) {
  if (!row) return false;
  var st = String(row.STATUS || '').trim();
  if (TASK_MAIN_STATUSES_ELIGIBLE_OVERDUE.indexOf(st) === -1) return false;
  var dueMs = _taskMainDueDateStartMillis(row.DUE_DATE);
  if (dueMs === null) return false;
  return dueMs < _taskMainTodayStartMillis();
}

/** Vietnamese label for UI / API consumers. */
function taskMainOverdueDisplay(row) {
  return taskMainIsOverdue(row) ? 'Quá hạn' : '';
}

/**
 * Shallow copy with derived overdue fields (not persisted on sheet).
 * @param {Object} row
 * @returns {Object}
 */
function taskMainWithOverdueFields(row) {
  if (!row) return row;
  var o = Object.assign({}, row);
  o.IS_OVERDUE = taskMainIsOverdue(o);
  o.OVERDUE_DISPLAY = taskMainOverdueDisplay(o);
  return o;
}

/**
 * Calculates progress from TASK_CHECKLIST (source of truth).
 * @param {string} taskId
 * @returns {number} 0–100
 */
function calculateProgress(taskId) {
  var items = taskGetChecklistItems(taskId);
  if (items.length === 0) return 0;
  var done = items.filter(function(r) { return String(r.IS_DONE) === 'true' || r.IS_DONE === true; }).length;
  return Math.round((done / items.length) * 100);
}

/**
 * Recalculates progress and updates TASK_MAIN.PROGRESS_PERCENT.
 * @param {string} taskId
 */
function syncTaskProgress(taskId) {
  var task = taskFindById(taskId);
  if (!task) return;
  var pct = calculateProgress(taskId);
  if (Number(task.PROGRESS_PERCENT) === pct) return;
  var patch = {
    PROGRESS_PERCENT: pct,
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser()
  };
  taskUpdateMain(task._rowNumber, patch);
}

/**
 * Internal: append log row. Uses UPDATE_TYPE, ACTION.
 */
function _addTaskUpdateLog(taskId, updateType, content, oldStatus, newStatus) {
  assertValidUpdateType(updateType);
  var actorId = (typeof mapCurrentUserEmailToInternalId === 'function' ? mapCurrentUserEmailToInternalId() : null) || cbvUser();
  var action = content || '';
  if (updateType === 'STATUS_CHANGE' && (oldStatus || newStatus)) {
    action = (oldStatus ? oldStatus + ' → ' : '') + (newStatus || '') + (action ? ' | ' + action : '');
  }
  var record = {
    ID: cbvMakeId('TLOG'),
    TASK_ID: taskId,
    UPDATE_TYPE: updateType,
    ACTION: action,
    ACTOR_ID: actorId,
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser(),
    IS_DELETED: false
  };
  taskAppendUpdateLog(record);
  return record;
}

/**
 * TASK PRO: SHARED_WITH (comma-separated IDs), IS_PRIVATE, PENDING_ACTION (Bot/AppSheet CMD).
 * Defaults: empty list, not private, no pending command. Caller may override via data.
 * @param {Object} data
 * @returns {{ SHARED_WITH: string, IS_PRIVATE: boolean, PENDING_ACTION: string }}
 */
function _taskProFieldsFromCreatePayload(data) {
  data = data || {};
  var sw = data.SHARED_WITH != null && String(data.SHARED_WITH).trim() !== ''
    ? String(data.SHARED_WITH).trim() : '';
  var priv = data.IS_PRIVATE === true || String(data.IS_PRIVATE || '').toLowerCase() === 'true';
  var pend = data.PENDING_ACTION != null && String(data.PENDING_ACTION).trim() !== ''
    ? String(data.PENDING_ACTION).trim() : '';
  return { SHARED_WITH: sw, IS_PRIVATE: priv, PENDING_ACTION: pend };
}

/**
 * Create task. DON_VI_ID, OWNER_ID, TITLE, PRIORITY required.
 * @param {Object} data
 * @returns {Object} cbvResponse
 */
function createTask(data) {
  ensureRequired(data.TITLE, 'TITLE');
  ensureMaxLength(data.TITLE, 500, 'TITLE');
  ensureRequired(data.OWNER_ID, 'OWNER_ID');
  ensureRequired(data.DON_VI_ID, 'DON_VI_ID');
  ensureRequired(data.PRIORITY, 'PRIORITY');
  if (typeof assertActiveUserId === 'function') assertActiveUserId(data.OWNER_ID, 'OWNER_ID');
  if (typeof assertActiveDonViId === 'function') assertActiveDonViId(data.DON_VI_ID, 'DON_VI_ID');
  if (data.REPORTER_ID && typeof assertActiveUserId === 'function') assertActiveUserId(data.REPORTER_ID, 'REPORTER_ID');
  assertValidEnumValue('TASK_PRIORITY', data.PRIORITY, 'PRIORITY');
  if (data.RELATED_ENTITY_TYPE != null && String(data.RELATED_ENTITY_TYPE).trim() !== '') {
    if (typeof assertValidRelatedEntityType === 'function') assertValidRelatedEntityType(data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
    else assertValidEnumValue('RELATED_ENTITY_TYPE', data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
  }
  var taskTypeId = (data.TASK_TYPE_ID && String(data.TASK_TYPE_ID).trim()) ? data.TASK_TYPE_ID : '';
  if (taskTypeId && typeof assertActiveTaskTypeId === 'function') assertActiveTaskTypeId(taskTypeId, 'TASK_TYPE_ID');

  var pro = _taskProFieldsFromCreatePayload(data);

  var record = {
    ID: cbvMakeId('TASK'),
    TASK_CODE: data.TASK_CODE || cbvMakeId('TK'),
    TITLE: data.TITLE,
    DESCRIPTION: data.DESCRIPTION || '',
    TASK_TYPE_ID: taskTypeId,
    STATUS: 'NEW',
    PRIORITY: data.PRIORITY,
    DON_VI_ID: data.DON_VI_ID || '',
    OWNER_ID: data.OWNER_ID,
    REPORTER_ID: data.REPORTER_ID || (typeof mapCurrentUserEmailToInternalId === 'function' ? mapCurrentUserEmailToInternalId() : null) || '',
    SHARED_WITH: pro.SHARED_WITH,
    IS_PRIVATE: pro.IS_PRIVATE,
    START_DATE: data.START_DATE || '',
    DUE_DATE: data.DUE_DATE || '',
    DONE_AT: '',
    PROGRESS_PERCENT: 0,
    RESULT_SUMMARY: '',
    RELATED_ENTITY_TYPE: data.RELATED_ENTITY_TYPE || 'NONE',
    RELATED_ENTITY_ID: data.RELATED_ENTITY_ID || '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser(),
    IS_STARRED: false,
    IS_PINNED: false,
    IS_DELETED: false,
    PENDING_ACTION: pro.PENDING_ACTION
  };
  taskAppendMain(record);
  _addTaskUpdateLog(record.ID, 'NOTE', 'Task created', 'NEW', 'NEW');
  if (typeof cbvTryEmitCoreEvent_ === 'function') {
    cbvTryEmitCoreEvent_({
      eventType: typeof CBV_CORE_EVENT_TYPE_TASK_CREATED !== 'undefined' ? CBV_CORE_EVENT_TYPE_TASK_CREATED : 'TASK_CREATED',
      sourceModule: 'TASK',
      refId: record.ID,
      entityType: 'TASK_MAIN',
      payload: { STATUS: record.STATUS, TITLE: record.TITLE, DON_VI_ID: record.DON_VI_ID }
    });
  }
  if (typeof cbvTaskStatusSnapshotSet_ === 'function') cbvTaskStatusSnapshotSet_(record.ID, record.STATUS);
  return cbvResponse(true, 'TASK_CREATED', 'Task đã tạo', taskMainWithOverdueFields(record), []);
}

/**
 * Update task fields. STATUS, DONE_AT, PROGRESS_PERCENT are protected.
 * @param {string} id - Task ID
 * @param {Object} patch - Fields to update
 * @returns {Object} cbvResponse
 */
function updateTask(id, patch) {
  if (!id || !patch || Object.keys(patch).length === 0) {
    return cbvResponse(false, 'INVALID_PATCH', 'No valid patch', {}, ['id and patch required']);
  }
  var task = taskFindById(id);
  cbvAssert(task, 'Task not found');
  ensureTaskEditable(id);

  var blocked = ['STATUS', 'DONE_AT', 'PROGRESS_PERCENT'];
  blocked.forEach(function(k) {
    if (patch[k] !== undefined) delete patch[k];
  });
  if (Object.keys(patch).length === 0) return cbvResponse(true, 'TASK_NO_CHANGE', 'No editable fields', taskMainWithOverdueFields(task), []);

  // TODO(phase-FUTURE): if patch touches SHARED_WITH / IS_PRIVATE / PENDING_ACTION, align validation
  // with 45_SHARED_WITH_SERVICE (shareTaskWith, setTaskPrivate) and pending-feedback rules.

  if (patch.DON_VI_ID != null && String(patch.DON_VI_ID).trim() && typeof assertActiveDonViId === 'function') assertActiveDonViId(patch.DON_VI_ID, 'DON_VI_ID');
  if (patch.TASK_TYPE_ID != null && String(patch.TASK_TYPE_ID).trim() && typeof assertActiveTaskTypeId === 'function') assertActiveTaskTypeId(patch.TASK_TYPE_ID, 'TASK_TYPE_ID');
  if (patch.OWNER_ID != null && typeof assertActiveUserId === 'function') assertActiveUserId(patch.OWNER_ID, 'OWNER_ID');
  if (patch.REPORTER_ID != null && patch.REPORTER_ID !== '' && typeof assertActiveUserId === 'function') assertActiveUserId(patch.REPORTER_ID, 'REPORTER_ID');
  if (patch.PRIORITY != null) assertValidEnumValue('TASK_PRIORITY', patch.PRIORITY, 'PRIORITY');
  if (patch.RELATED_ENTITY_TYPE != null && String(patch.RELATED_ENTITY_TYPE).trim() !== '') {
    if (typeof assertValidRelatedEntityType === 'function') assertValidRelatedEntityType(patch.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
    else assertValidEnumValue('RELATED_ENTITY_TYPE', patch.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
  }

  patch.UPDATED_AT = cbvNow();
  patch.UPDATED_BY = cbvUser();
  taskUpdateMain(task._rowNumber, patch);
  var updated = Object.assign({}, task, patch);
  _addTaskUpdateLog(id, 'NOTE', 'Task updated', '', '');
  return cbvResponse(true, 'TASK_UPDATED', 'Đã cập nhật', taskMainWithOverdueFields(updated), []);
}

/**
 * Assign task to owner. If NEW, transitions to ASSIGNED.
 * @param {string} taskId
 * @param {string} ownerId
 * @returns {Object} cbvResponse
 */
function assignTask(taskId, ownerId) {
  ensureRequired(ownerId, 'OWNER_ID');
  if (typeof assertActiveUserId === 'function') assertActiveUserId(ownerId, 'OWNER_ID');
  var current = taskFindById(taskId);
  cbvAssert(current, 'Task not found');
  ensureTaskEditable(taskId);
  cbvAssert(['NEW', 'ASSIGNED', 'IN_PROGRESS'].indexOf(String(current.STATUS)) !== -1, 'Cannot assign task in status: ' + current.STATUS);

  var sameOwner = String(current.OWNER_ID) === String(ownerId);
  if (sameOwner && String(current.STATUS) !== 'NEW') return cbvResponse(true, 'TASK_NO_CHANGE', 'Đã giao đúng người', taskMainWithOverdueFields(current), []);

  var oldStatus = String(current.STATUS);
  var patch = {
    OWNER_ID: ownerId,
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser()
  };
  if (oldStatus === 'NEW') patch.STATUS = 'ASSIGNED';
  taskUpdateMain(current._rowNumber, patch);
  if (oldStatus === 'NEW') {
    _addTaskUpdateLog(taskId, 'STATUS_CHANGE', 'Assigned to ' + ownerId, oldStatus, 'ASSIGNED');
  } else {
    _addTaskUpdateLog(taskId, 'NOTE', 'Reassigned to ' + ownerId, '', '');
  }
  if (patch.STATUS && typeof cbvTryEmitCoreEvent_ === 'function') {
    cbvTryEmitCoreEvent_({
      eventType: typeof CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED !== 'undefined' ? CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED : 'TASK_STATUS_CHANGED',
      sourceModule: 'TASK',
      refId: taskId,
      entityType: 'TASK_MAIN',
      payload: { previousStatus: oldStatus, newStatus: String(patch.STATUS), note: '' }
    });
  }
  if (patch.STATUS && typeof cbvTaskStatusSnapshotSet_ === 'function') cbvTaskStatusSnapshotSet_(taskId, String(patch.STATUS));
  var updated = Object.assign({}, current, patch);
  return cbvResponse(true, 'TASK_ASSIGNED', 'Đã giao task', taskMainWithOverdueFields(updated), []);
}

/**
 * Set task STATUS. Enforces transitions. DONE requires checklist completion.
 * @param {string} taskId
 * @param {string} newStatus
 * @param {string} note
 * @returns {Object} cbvResponse
 */
function setTaskStatus(taskId, newStatus, note) {
  var current = taskFindById(taskId);
  cbvAssert(current, 'Task not found');
  cbvAssert(String(current.STATUS) !== 'ARCHIVED', 'Cannot edit ARCHIVED task');
  var oldStatus = String(current.STATUS);
  if (oldStatus === newStatus) return cbvResponse(true, 'TASK_NO_CHANGE', 'Trạng thái không đổi', taskMainWithOverdueFields(current), []);

  if (newStatus === 'DONE') ensureTaskCanComplete(taskId);
  cbvAssert(validateTaskTransition(oldStatus, newStatus), 'Invalid transition: ' + oldStatus + ' -> ' + newStatus);

  var patch = {
    STATUS: newStatus,
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser()
  };
  if (newStatus === 'DONE') {
    patch.DONE_AT = cbvNow();
    patch.PROGRESS_PERCENT = 100;
    if (note) patch.RESULT_SUMMARY = note;
  }
  taskUpdateMain(current._rowNumber, patch);
  _addTaskUpdateLog(taskId, 'STATUS_CHANGE', note || '', oldStatus, newStatus);
  if (typeof cbvTryEmitCoreEvent_ === 'function') {
    cbvTryEmitCoreEvent_({
      eventType: typeof CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED !== 'undefined' ? CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED : 'TASK_STATUS_CHANGED',
      sourceModule: 'TASK',
      refId: taskId,
      entityType: 'TASK_MAIN',
      payload: { previousStatus: oldStatus, newStatus: String(newStatus), note: note || '' }
    });
  }
  if (typeof cbvTaskStatusSnapshotSet_ === 'function') cbvTaskStatusSnapshotSet_(taskId, String(newStatus));
  var updated = Object.assign({}, current, patch);
  return cbvResponse(true, 'TASK_STATUS_CHANGED', 'Đã cập nhật trạng thái', taskMainWithOverdueFields(updated), []);
}

/**
 * Mark task DONE. Idempotent if already DONE.
 * @param {string} taskId
 * @param {string} resultSummary
 * @returns {Object} cbvResponse
 */
function completeTask(taskId, resultSummary) {
  return setTaskStatus(taskId, 'DONE', resultSummary || '');
}

/**
 * Cancel task. Idempotent if already CANCELLED.
 * @param {string} taskId
 * @param {string} note
 * @returns {Object} cbvResponse
 */
function cancelTask(taskId, note) {
  return setTaskStatus(taskId, 'CANCELLED', note || '');
}

/**
 * BẮT ĐẦU - Start task. NEW/ASSIGNED → IN_PROGRESS. Sets START_DATE if blank.
 * @param {string} taskId
 * @returns {Object} cbvResponse
 */
function taskStartAction(taskId) {
  var task = taskFindById(taskId);
  cbvAssert(task, 'Task not found');
  cbvAssert(['NEW', 'ASSIGNED'].indexOf(String(task.STATUS)) !== -1, 'Can only start NEW or ASSIGNED task');
  var patch = { STATUS: 'IN_PROGRESS', UPDATED_AT: cbvNow(), UPDATED_BY: cbvUser() };
  if (!task.START_DATE || String(task.START_DATE).trim() === '') {
    patch.START_DATE = cbvNow();
  }
  taskUpdateMain(task._rowNumber, patch);
  _addTaskUpdateLog(taskId, 'STATUS_CHANGE', 'Bắt đầu', String(task.STATUS), 'IN_PROGRESS');
  if (typeof cbvTryEmitCoreEvent_ === 'function') {
    cbvTryEmitCoreEvent_({
      eventType: typeof CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED !== 'undefined' ? CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED : 'TASK_STATUS_CHANGED',
      sourceModule: 'TASK',
      refId: taskId,
      entityType: 'TASK_MAIN',
      payload: { previousStatus: String(task.STATUS), newStatus: 'IN_PROGRESS', note: '' }
    });
  }
  if (typeof cbvTaskStatusSnapshotSet_ === 'function') cbvTaskStatusSnapshotSet_(taskId, 'IN_PROGRESS');
  return cbvResponse(true, 'TASK_STARTED', 'Đã bắt đầu', taskMainWithOverdueFields(Object.assign({}, task, patch)), []);
}

/**
 * HOÀN THÀNH - Complete task. Alias for completeTask.
 * @param {string} taskId
 * @param {string} resultSummary
 * @returns {Object} cbvResponse
 */
function taskCompleteAction(taskId, resultSummary) {
  return completeTask(taskId, resultSummary);
}

/**
 * HỦY - Cancel task. Alias for cancelTask.
 * @param {string} taskId
 * @param {string} note
 * @returns {Object} cbvResponse
 */
function taskCancelAction(taskId, note) {
  return cancelTask(taskId, note);
}

/**
 * MỞ LẠI - Reopen task. DONE/CANCELLED → IN_PROGRESS.
 * @param {string} taskId
 * @returns {Object} cbvResponse
 */
function taskReopenAction(taskId) {
  var task = taskFindById(taskId);
  cbvAssert(task, 'Task not found');
  var s = String(task.STATUS);
  cbvAssert(['DONE', 'CANCELLED'].indexOf(s) !== -1, 'Can only reopen DONE or CANCELLED task');
  var patch = { STATUS: 'IN_PROGRESS', UPDATED_AT: cbvNow(), UPDATED_BY: cbvUser() };
  if (s === 'DONE') patch.DONE_AT = '';
  taskUpdateMain(task._rowNumber, patch);
  _addTaskUpdateLog(taskId, 'STATUS_CHANGE', 'Mở lại', s, 'IN_PROGRESS');
  if (typeof cbvTryEmitCoreEvent_ === 'function') {
    cbvTryEmitCoreEvent_({
      eventType: typeof CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED !== 'undefined' ? CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED : 'TASK_STATUS_CHANGED',
      sourceModule: 'TASK',
      refId: taskId,
      entityType: 'TASK_MAIN',
      payload: { previousStatus: s, newStatus: 'IN_PROGRESS', note: '' }
    });
  }
  if (typeof cbvTaskStatusSnapshotSet_ === 'function') cbvTaskStatusSnapshotSet_(taskId, 'IN_PROGRESS');
  return cbvResponse(true, 'TASK_REOPENED', 'Đã mở lại', taskMainWithOverdueFields(Object.assign({}, task, patch)), []);
}

/** Alias for setTaskStatus. */
function updateTaskStatus(taskId, newStatus, note) {
  return setTaskStatus(taskId, newStatus, note || '');
}

/**
 * Add checklist item.
 * @param {Object} data - { TASK_ID, TITLE, DESCRIPTION?, IS_REQUIRED?, ITEM_NO?, NOTE? }
 * @returns {Object} cbvResponse
 */
function addChecklistItem(data) {
  ensureRequired(data.TASK_ID, 'TASK_ID');
  ensureRequired(data.TITLE, 'TITLE');
  ensureMaxLength(data.TITLE, 500, 'TITLE');
  var task = taskFindById(data.TASK_ID);
  cbvAssert(task, 'Task not found');
  ensureTaskEditable(data.TASK_ID);
  cbvAssert(String(task.STATUS) !== 'DONE', 'Cannot add checklist when task is DONE');

  var items = taskGetChecklistItems(data.TASK_ID);
  var nextNo = items.length + 1;
  if (data.ITEM_NO != null && !isNaN(Number(data.ITEM_NO))) nextNo = Number(data.ITEM_NO);

  var record = {
    ID: cbvMakeId('TCL'),
    TASK_ID: data.TASK_ID,
    ITEM_NO: nextNo,
    TITLE: data.TITLE,
    DESCRIPTION: data.DESCRIPTION || '',
    IS_REQUIRED: data.IS_REQUIRED === true || String(data.IS_REQUIRED) === 'true',
    IS_DONE: false,
    DONE_AT: '',
    DONE_BY: '',
    NOTE: data.NOTE || '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser(),
    IS_DELETED: false
  };
  taskAppendChecklist(record);
  syncTaskProgress(data.TASK_ID);
  _addTaskUpdateLog(data.TASK_ID, 'NOTE', data.TITLE, '', '');
  return cbvResponse(true, 'TASK_CHECKLIST_ADDED', 'Checklist item added', record, []);
}

/**
 * Mark checklist item done.
 * @param {string} checklistId
 * @param {string} note
 * @returns {Object} cbvResponse
 */
function markChecklistDone(checklistId, note) {
  var current = taskFindChecklistById(checklistId);
  cbvAssert(current, 'Checklist item not found');
  ensureTaskEditable(current.TASK_ID);
  if (String(current.IS_DONE) === 'true' || current.IS_DONE === true) {
    return cbvResponse(true, 'TASK_NO_CHANGE', 'Checklist item already done', current, []);
  }

  var actorId = (typeof mapCurrentUserEmailToInternalId === 'function' ? mapCurrentUserEmailToInternalId() : null) || '';
  var patch = {
    IS_DONE: true,
    DONE_AT: cbvNow(),
    DONE_BY: actorId,
    NOTE: note || current.NOTE || '',
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser()
  };
  taskUpdateChecklist(current._rowNumber, patch);
  syncTaskProgress(current.TASK_ID);
  _addTaskUpdateLog(current.TASK_ID, 'NOTE', note || current.TITLE, '', '');
  if (typeof cbvTryEmitCoreEvent_ === 'function') {
    cbvTryEmitCoreEvent_({
      eventType: typeof CBV_CORE_EVENT_TYPE_TASK_CHECKLIST_UPDATED !== 'undefined' ? CBV_CORE_EVENT_TYPE_TASK_CHECKLIST_UPDATED : 'TASK_CHECKLIST_UPDATED',
      sourceModule: 'TASK',
      refId: current.TASK_ID,
      entityType: 'TASK_MAIN',
      payload: { checklistId: checklistId, taskId: current.TASK_ID, note: note || '' }
    });
  }
  var updated = Object.assign({}, current, patch);
  return cbvResponse(true, 'TASK_CHECKLIST_DONE', 'Checklist item done', updated, []);
}

/**
 * Add attachment. ATTACHMENT_TYPE required.
 * @param {Object} data - { TASK_ID, FILE_URL, ATTACHMENT_TYPE, TITLE?, DRIVE_FILE_ID?, NOTE? }
 * @returns {Object} cbvResponse
 */
function addTaskAttachment(data) {
  ensureRequired(data.TASK_ID, 'TASK_ID');
  ensureRequired(data.FILE_URL, 'FILE_URL');
  ensureRequired(data.ATTACHMENT_TYPE, 'ATTACHMENT_TYPE');
  ensureTaskEditable(data.TASK_ID);
  assertValidEnumValue('TASK_ATTACHMENT_TYPE', data.ATTACHMENT_TYPE, 'ATTACHMENT_TYPE');

  var record = {
    ID: cbvMakeId('TATT'),
    TASK_ID: data.TASK_ID,
    ATTACHMENT_TYPE: data.ATTACHMENT_TYPE,
    TITLE: data.TITLE || '',
    FILE_URL: data.FILE_URL,
    DRIVE_FILE_ID: data.DRIVE_FILE_ID || '',
    NOTE: data.NOTE || '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser(),
    IS_DELETED: false
  };
  taskAppendAttachment(record);
  _addTaskUpdateLog(data.TASK_ID, 'NOTE', 'Attachment added: ' + (record.TITLE || record.FILE_URL || ''), '', '');
  return cbvResponse(true, 'TASK_ATTACHMENT_ADDED', 'Đã gắn file', record, []);
}

/**
 * Soft-delete attachment (IS_DELETED = true). Web App action deleteAttachment.
 * @param {string} taskId
 * @param {string} attachmentId
 * @returns {Object} cbvResponse
 */
function removeTaskAttachment(taskId, attachmentId) {
  ensureRequired(taskId, 'TASK_ID');
  ensureRequired(attachmentId, 'attachmentId');
  var att = typeof taskFindAttachmentById === 'function' ? taskFindAttachmentById(attachmentId) : null;
  cbvAssert(att, 'Attachment not found');
  cbvAssert(String(att.TASK_ID) === String(taskId), 'Attachment does not belong to this task');
  if (String(att.IS_DELETED) === 'true' || att.IS_DELETED === true) {
    return cbvResponse(true, 'TASK_NO_CHANGE', 'Attachment already removed', att, []);
  }
  ensureTaskEditable(taskId);
  var patch = {
    IS_DELETED: true,
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser()
  };
  taskUpdateAttachment(att._rowNumber, patch);
  var label = (att.TITLE && String(att.TITLE).trim()) ? String(att.TITLE).trim()
    : ((att.FILE_URL && String(att.FILE_URL).trim()) ? String(att.FILE_URL).trim() : attachmentId);
  _addTaskUpdateLog(taskId, 'NOTE', 'Attachment removed: ' + label, '', '');
  var updated = Object.assign({}, att, patch);
  return cbvResponse(true, 'TASK_ATTACHMENT_REMOVED', 'Đã gỡ file đính kèm', updated, []);
}

/**
 * Add update log entry (NOTE, QUESTION, ANSWER). CONTENT required.
 * @param {Object} data - { taskId, updateType, content }
 * @returns {Object} cbvResponse
 */
function addTaskUpdateLog(data) {
  var taskId = data.taskId || data.TASK_ID;
  var updateType = data.updateType || data.UPDATE_TYPE;
  var content = data.content || data.CONTENT || '';
  ensureRequired(taskId, 'taskId');
  ensureRequired(updateType, 'updateType');
  ensureRequired(content, 'content');
  ensureTaskEditable(taskId);
  cbvAssert(['NOTE', 'QUESTION', 'ANSWER'].indexOf(updateType) !== -1, 'updateType must be NOTE, QUESTION, or ANSWER');

  var record = _addTaskUpdateLog(taskId, updateType, content, '', '');
  if (typeof cbvTryEmitCoreEvent_ === 'function') {
    cbvTryEmitCoreEvent_({
      eventType: typeof CBV_CORE_EVENT_TYPE_TASK_LOG_ADDED !== 'undefined' ? CBV_CORE_EVENT_TYPE_TASK_LOG_ADDED : 'TASK_LOG_ADDED',
      sourceModule: 'TASK',
      refId: taskId,
      entityType: 'TASK_MAIN',
      payload: { updateType: updateType, content: content }
    });
  }
  return cbvResponse(true, 'TASK_LOG_ADDED', 'Đã thêm ghi chú', record, []);
}

/** Legacy alias. */
function addTaskLogEntry(taskId, action, note) {
  return addTaskUpdateLog({ taskId: taskId, updateType: action, content: note });
}

/** Legacy alias. */
function createTaskAttachment(data) {
  return addTaskAttachment(data);
}

/**
 * Soft delete TASK_ATTACHMENT — đánh IS_DELETED = true, ghi log.
 *
 * Rules:
 *  - Không xóa dòng khỏi sheet (soft delete).
 *  - Idempotent: đã IS_DELETED=true → trả success ngay, không write.
 *  - Block nếu task cha ARCHIVED (ensureTaskEditable).
 *  - Ghi 1 dòng vào TASK_UPDATE_LOG sau khi xóa.
 *
 * @param {string} attachmentId  ID của TASK_ATTACHMENT cần xóa mềm
 * @param {string} [note]        Lý do xóa (tuỳ chọn)
 * @returns {Object} cbvResponse
 */
function deleteTaskAttachment(attachmentId, note) {
  // 1. Validate đầu vào
  ensureRequired(attachmentId, 'attachmentId');

  // 2. Tìm attachment — throw nếu không tồn tại
  var attachment = taskFindAttachmentById(attachmentId);
  cbvAssert(attachment, 'Không tìm thấy attachment: ' + attachmentId);

  // 3. Idempotent check
  var alreadyDeleted = attachment.IS_DELETED === true
    || String(attachment.IS_DELETED).toLowerCase() === 'true';
  if (alreadyDeleted) {
    return cbvResponse(
      true,
      'TASK_ATTACHMENT_ALREADY_DELETED',
      'Attachment đã được xóa trước đó',
      attachment,
      []
    );
  }

  // 4. Block nếu task cha ARCHIVED
  ensureTaskEditable(attachment.TASK_ID);

  // 5. Ghi soft delete
  var patch = {
    IS_DELETED: true,
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser()
  };
  taskUpdateAttachment(attachment._rowNumber, patch);

  // 6. Ghi log
  var logNote = 'Attachment deleted: '
    + (attachment.TITLE || attachment.FILE_URL || attachmentId)
    + (note ? ' | ' + note : '');
  _addTaskUpdateLog(attachment.TASK_ID, 'NOTE', logNote, '', '');

  return cbvResponse(
    true,
    'TASK_ATTACHMENT_DELETED',
    'Đã xóa file đính kèm',
    Object.assign({}, attachment, patch),
    []
  );
}

/**
 * Backfill IS_STARRED = false và IS_PINNED = false cho các row đang blank.
 * Chạy 1 lần sau khi deploy fix.
 */
function backfillStarPin() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.TASK_MAIN);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var starIdx = headers.indexOf('IS_STARRED');
  var pinIdx = headers.indexOf('IS_PINNED');
  if (starIdx < 0 || pinIdx < 0) {
    Logger.log('Không tìm thấy cột IS_STARRED hoặc IS_PINNED');
    return;
  }
  var updates = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][starIdx] === '' || data[i][starIdx] === null || data[i][starIdx] === undefined) {
      sheet.getRange(i + 1, starIdx + 1).setValue(false);
      updates++;
    }
    if (data[i][pinIdx] === '' || data[i][pinIdx] === null || data[i][pinIdx] === undefined) {
      sheet.getRange(i + 1, pinIdx + 1).setValue(false);
      updates++;
    }
  }
  Logger.log('Backfill xong: ' + updates + ' ô đã cập nhật');
}

/**
 * Self-test: TASK PRO defaults on create (no sheet I/O). Safe to run in debugger.
 * @returns {boolean}
 */
function taskSelfTestCreateProDefaults() {
  var p0 = _taskProFieldsFromCreatePayload({});
  if (p0.SHARED_WITH !== '' || p0.IS_PRIVATE !== false || p0.PENDING_ACTION !== '') {
    throw new Error('taskSelfTestCreateProDefaults: expected empty SHARED_WITH, IS_PRIVATE false, PENDING_ACTION empty');
  }
  var p1 = _taskProFieldsFromCreatePayload({ IS_PRIVATE: true });
  if (p1.IS_PRIVATE !== true) {
    throw new Error('taskSelfTestCreateProDefaults: IS_PRIVATE override should be true');
  }
  return true;
}

/**
 * Self-test: overdue derivation (no sheet I/O).
 * @returns {boolean}
 */
function taskSelfTestOverdueFields() {
  var y = new Date();
  y.setHours(0, 0, 0, 0);
  y.setDate(y.getDate() - 1);
  var openOverdue = { STATUS: 'IN_PROGRESS', DUE_DATE: y };
  if (!taskMainIsOverdue(openOverdue)) throw new Error('taskSelfTestOverdueFields: expected IN_PROGRESS past due');
  if (taskMainOverdueDisplay(openOverdue) !== 'Quá hạn') throw new Error('taskSelfTestOverdueFields: display');
  var done = { STATUS: 'DONE', DUE_DATE: y };
  if (taskMainIsOverdue(done)) throw new Error('taskSelfTestOverdueFields: DONE not overdue');
  if (taskMainOverdueDisplay(done) !== '') throw new Error('taskSelfTestOverdueFields: DONE display empty');
  if (taskMainIsOverdue({ STATUS: 'NEW', DUE_DATE: '' })) throw new Error('taskSelfTestOverdueFields: blank due');
  var w = taskMainWithOverdueFields(openOverdue);
  if (w.IS_OVERDUE !== true || w.OVERDUE_DISPLAY !== 'Quá hạn') throw new Error('taskSelfTestOverdueFields: withOverdue');
  return true;
}
