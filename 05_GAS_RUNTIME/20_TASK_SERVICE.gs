/**
 * CBV Task Service - Public API for TASK_CENTER.
 * Task belongs to HTX; users shared. Workflow enforced by GAS.
 * Dependencies: 20_TASK_REPOSITORY, 20_TASK_VALIDATION, 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_*
 */

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
  if (data.RELATED_ENTITY_TYPE != null) assertValidEnumValue('RELATED_ENTITY_TYPE', data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
  var taskTypeId = (data.TASK_TYPE_ID && String(data.TASK_TYPE_ID).trim()) ? data.TASK_TYPE_ID : '';
  if (taskTypeId && typeof assertActiveTaskTypeId === 'function') assertActiveTaskTypeId(taskTypeId, 'TASK_TYPE_ID');

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
    IS_DELETED: false
  };
  taskAppendMain(record);
  _addTaskUpdateLog(record.ID, 'NOTE', 'Task created', 'NEW', 'NEW');
  return cbvResponse(true, 'TASK_CREATED', 'Task đã tạo', record, []);
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
  if (Object.keys(patch).length === 0) return cbvResponse(true, 'TASK_NO_CHANGE', 'No editable fields', task, []);

  if (patch.DON_VI_ID != null && String(patch.DON_VI_ID).trim() && typeof assertActiveDonViId === 'function') assertActiveDonViId(patch.DON_VI_ID, 'DON_VI_ID');
  if (patch.TASK_TYPE_ID != null && String(patch.TASK_TYPE_ID).trim() && typeof assertActiveTaskTypeId === 'function') assertActiveTaskTypeId(patch.TASK_TYPE_ID, 'TASK_TYPE_ID');
  if (patch.OWNER_ID != null && typeof assertActiveUserId === 'function') assertActiveUserId(patch.OWNER_ID, 'OWNER_ID');
  if (patch.REPORTER_ID != null && patch.REPORTER_ID !== '' && typeof assertActiveUserId === 'function') assertActiveUserId(patch.REPORTER_ID, 'REPORTER_ID');
  if (patch.PRIORITY != null) assertValidEnumValue('TASK_PRIORITY', patch.PRIORITY, 'PRIORITY');
  if (patch.RELATED_ENTITY_TYPE != null) assertValidEnumValue('RELATED_ENTITY_TYPE', patch.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');

  patch.UPDATED_AT = cbvNow();
  patch.UPDATED_BY = cbvUser();
  taskUpdateMain(task._rowNumber, patch);
  var updated = Object.assign({}, task, patch);
  _addTaskUpdateLog(id, 'NOTE', 'Task updated', '', '');
  return cbvResponse(true, 'TASK_UPDATED', 'Đã cập nhật', updated, []);
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
  if (sameOwner && String(current.STATUS) !== 'NEW') return cbvResponse(true, 'TASK_NO_CHANGE', 'Đã giao đúng người', current, []);

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
  var updated = Object.assign({}, current, patch);
  return cbvResponse(true, 'TASK_ASSIGNED', 'Đã giao task', updated, []);
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
  if (oldStatus === newStatus) return cbvResponse(true, 'TASK_NO_CHANGE', 'Trạng thái không đổi', current, []);

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
  var updated = Object.assign({}, current, patch);
  return cbvResponse(true, 'TASK_STATUS_CHANGED', 'Đã cập nhật trạng thái', updated, []);
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
  return cbvResponse(true, 'TASK_STARTED', 'Đã bắt đầu', Object.assign({}, task, patch), []);
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
  return cbvResponse(true, 'TASK_REOPENED', 'Đã mở lại', Object.assign({}, task, patch), []);
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
