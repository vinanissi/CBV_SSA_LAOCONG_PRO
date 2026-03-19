/**
 * TASK status workflow — strict transitions only.
 * Flow: NEW → ASSIGNED → IN_PROGRESS → WAITING → DONE
 * Exits: CANCELLED (from NEW|ASSIGNED|IN_PROGRESS|WAITING), ARCHIVED (from DONE|CANCELLED)
 * Rules: no NEW→DONE jump; ARCHIVED is terminal (no reopen without rule).
 */
const TASK_VALID_TRANSITIONS = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING', 'DONE', 'CANCELLED'],
  WAITING: ['IN_PROGRESS', 'CANCELLED'],
  DONE: ['ARCHIVED'],
  CANCELLED: ['ARCHIVED'],
  ARCHIVED: []  // terminal — cannot reopen without explicit rule
};

/**
 * @param {string} from - Current STATUS
 * @param {string} to - Target STATUS
 * @returns {boolean} True if transition is allowed
 */
function validateTaskTransition(from, to) {
  var allowed = TASK_VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.indexOf(to) !== -1;
}

/**
 * Blocks any modification to ARCHIVED tasks (cannot edit, add checklist, add attachment).
 */
function ensureTaskEditable(taskId) {
  var task = _findById(CBV_CONFIG.SHEETS.TASK_MAIN, taskId);
  cbvAssert(task, 'Task not found');
  cbvAssert(String(task.STATUS) !== 'ARCHIVED', 'Cannot edit ARCHIVED task');
}

/**
 * Calculates progress from TASK_CHECKLIST (source of truth).
 * Formula: doneCount / totalCount * 100. If no items, returns 0.
 * @param {string} taskId
 * @returns {number} 0–100
 */
function calculateProgress(taskId) {
  var items = _rows(_sheet(CBV_CONFIG.SHEETS.TASK_CHECKLIST))
    .filter(function(r) { return String(r.TASK_ID) === String(taskId); });
  if (items.length === 0) return 0;
  var done = items.filter(function(r) {
    return String(r.IS_DONE) === 'true' || r.IS_DONE === true;
  }).length;
  return Math.round((done / items.length) * 100);
}

/**
 * Recalculates progress from checklist and updates TASK_MAIN.PROGRESS_PERCENT.
 * No manual override — progress is always derived from checklist.
 */
function syncTaskProgress(taskId) {
  var task = _findById(CBV_CONFIG.SHEETS.TASK_MAIN, taskId);
  if (!task) return;
  var pct = calculateProgress(taskId);
  if (Number(task.PROGRESS_PERCENT) === pct) return;
  task.PROGRESS_PERCENT = pct;
  task.UPDATED_AT = cbvNow();
  task.UPDATED_BY = cbvUser();
  _updateRow(CBV_CONFIG.SHEETS.TASK_MAIN, task._rowNumber, task);
}

function createTask(data) {
  ensureRequired(data.TITLE, 'TITLE');
  ensureRequired(data.OWNER_ID, 'OWNER_ID');
  ensureRequired(data.PRIORITY, 'PRIORITY');
  assertValidEnumValue('TASK_PRIORITY', data.PRIORITY, 'PRIORITY');
  assertValidEnumValue('TASK_TYPE', data.TASK_TYPE || 'GENERAL', 'TASK_TYPE');
  if (data.RELATED_ENTITY_TYPE != null) assertValidEnumValue('RELATED_ENTITY_TYPE', data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');

  const record = {
    ID: cbvMakeId('TASK'),
    TASK_CODE: data.TASK_CODE || cbvMakeId('TK'),
    TITLE: data.TITLE,
    DESCRIPTION: data.DESCRIPTION || '',
    TASK_TYPE: data.TASK_TYPE || 'GENERAL',
    STATUS: 'NEW',
    PRIORITY: data.PRIORITY,
    OWNER_ID: data.OWNER_ID,
    REPORTER_ID: data.REPORTER_ID || cbvUser(),
    RELATED_ENTITY_TYPE: data.RELATED_ENTITY_TYPE || 'NONE',
    RELATED_ENTITY_ID: data.RELATED_ENTITY_ID || '',
    START_DATE: data.START_DATE || '',
    DUE_DATE: data.DUE_DATE || '',
    DONE_AT: '',
    PROGRESS_PERCENT: 0,
    RESULT_NOTE: '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser(),
    IS_DELETED: false
  };
  _appendRecord(CBV_CONFIG.SHEETS.TASK_MAIN, record);
  addTaskUpdate(record.ID, 'NOTE', 'Task created', 'NEW', 'NEW');
  return cbvResponse(true, 'TASK_CREATED', 'Task đã tạo', record, []);
}

var TASK_UPDATE_LOG_ACTIONS = ['NOTE', 'QUESTION', 'ANSWER', 'STATUS_CHANGE'];

function addTaskUpdate(taskId, action, note, oldStatus, newStatus) {
  cbvAssert(TASK_UPDATE_LOG_ACTIONS.indexOf(action) !== -1, 'Invalid UPDATE_TYPE: ' + action);
  var record = {
    ID: cbvMakeId('TLOG'),
    TASK_ID: taskId,
    ACTION: action,
    OLD_STATUS: oldStatus || '',
    NEW_STATUS: newStatus || '',
    NOTE: note || '',
    ACTOR_ID: cbvUser(),
    CREATED_AT: cbvNow()
  };
  _appendRecord(CBV_CONFIG.SHEETS.TASK_UPDATE_LOG, record);
  return record;
}

/**
 * User-initiated log entry. ACTION must be NOTE, QUESTION, or ANSWER.
 * No free text without type — NOTE content required.
 */
function addTaskLogEntry(taskId, action, note) {
  ensureRequired(note, 'NOTE');
  cbvAssert(['NOTE', 'QUESTION', 'ANSWER'].indexOf(action) !== -1, 'ACTION must be NOTE, QUESTION, or ANSWER');
  ensureTaskEditable(taskId);
  var record = addTaskUpdate(taskId, action, note, '', '');
  return cbvResponse(true, 'TASK_LOG_ADDED', 'Đã thêm ghi chú', record, []);
}

function setTaskStatus(taskId, newStatus, note) {
  var current = _findById(CBV_CONFIG.SHEETS.TASK_MAIN, taskId);
  cbvAssert(current, 'Task not found');
  cbvAssert(String(current.STATUS) !== 'ARCHIVED', 'Cannot edit ARCHIVED task');
  var oldStatus = String(current.STATUS);
  if (oldStatus === newStatus) return cbvResponse(true, 'TASK_NO_CHANGE', 'Trạng thái không đổi', current, []); // idempotent
  if (newStatus === 'DONE') ensureTaskCanComplete(taskId);
  cbvAssert(validateTaskTransition(oldStatus, newStatus), 'Invalid transition: ' + oldStatus + ' -> ' + newStatus);

  current.STATUS = newStatus;
  current.UPDATED_AT = cbvNow();
  current.UPDATED_BY = cbvUser();
  if (newStatus === 'DONE') {
    current.DONE_AT = cbvNow();
    current.PROGRESS_PERCENT = 100;
  }
  if (note) current.RESULT_NOTE = note;

  _updateRow(CBV_CONFIG.SHEETS.TASK_MAIN, current._rowNumber, current);
  addTaskUpdate(taskId, 'STATUS_CHANGE', note || '', oldStatus, newStatus);
  return cbvResponse(true, 'TASK_STATUS_CHANGED', 'Đã cập nhật trạng thái', current, []);
}

/** Alias for setTaskStatus. Use for AppSheet/webhook calls. */
function updateTaskStatus(taskId, newStatus, note) {
  return setTaskStatus(taskId, newStatus, note || '');
}

/** Complete task. Idempotent if already DONE. */
function completeTask(taskId, note) {
  return setTaskStatus(taskId, 'DONE', note || '');
}

/** Cancel task. Idempotent if already CANCELLED. */
function cancelTask(taskId, note) {
  return setTaskStatus(taskId, 'CANCELLED', note || '');
}

/**
 * Assign task to owner. Updates OWNER_ID; if NEW, transitions to ASSIGNED.
 * Idempotent if same owner and already ASSIGNED or IN_PROGRESS.
 */
function assignTask(taskId, ownerId) {
  ensureRequired(ownerId, 'OWNER_ID');
  var current = _findById(CBV_CONFIG.SHEETS.TASK_MAIN, taskId);
  cbvAssert(current, 'Task not found');
  cbvAssert(String(current.STATUS) !== 'ARCHIVED', 'Cannot edit ARCHIVED task');
  cbvAssert(['NEW', 'ASSIGNED', 'IN_PROGRESS'].indexOf(String(current.STATUS)) !== -1, 'Cannot assign task in status: ' + current.STATUS);

  var sameOwner = String(current.OWNER_ID) === String(ownerId);
  if (sameOwner && String(current.STATUS) !== 'NEW') return cbvResponse(true, 'TASK_NO_CHANGE', 'Đã giao đúng người', current, []); // idempotent

  current.OWNER_ID = ownerId;
  current.UPDATED_AT = cbvNow();
  current.UPDATED_BY = cbvUser();
  var oldStatus = String(current.STATUS);
  if (oldStatus === 'NEW') {
    current.STATUS = 'ASSIGNED';
    _updateRow(CBV_CONFIG.SHEETS.TASK_MAIN, current._rowNumber, current);
    addTaskUpdate(taskId, 'STATUS_CHANGE', 'Assigned to ' + ownerId, oldStatus, 'ASSIGNED');
  } else {
    _updateRow(CBV_CONFIG.SHEETS.TASK_MAIN, current._rowNumber, current);
    addTaskUpdate(taskId, 'NOTE', 'Reassigned to ' + ownerId, '', '');
  }
  return cbvResponse(true, 'TASK_ASSIGNED', 'Đã giao task', current, []);
}

function addChecklistItem(data) {
  ensureRequired(data.TASK_ID, 'TASK_ID');
  ensureRequired(data.TITLE, 'TITLE');
  ensureTaskEditable(data.TASK_ID);

  const record = {
    ID: cbvMakeId('TCL'),
    TASK_ID: data.TASK_ID,
    ITEM_NO: data.ITEM_NO || '',
    SORT_ORDER: data.SORT_ORDER != null ? Number(data.SORT_ORDER) : (data.ITEM_NO != null ? Number(data.ITEM_NO) : 0),
    TITLE: data.TITLE,
    IS_REQUIRED: data.IS_REQUIRED === true,
    IS_DONE: false,
    DONE_AT: '',
    DONE_BY: '',
    NOTE: data.NOTE || '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser()
  };
  _appendRecord(CBV_CONFIG.SHEETS.TASK_CHECKLIST, record);
  syncTaskProgress(data.TASK_ID);
  addTaskUpdate(data.TASK_ID, 'NOTE', data.TITLE, '', '');
  return cbvResponse(true, 'TASK_CHECKLIST_ADDED', 'Checklist item added', record, []);
}

function createTaskAttachment(data) {
  ensureRequired(data.TASK_ID, 'TASK_ID');
  ensureRequired(data.FILE_URL, 'FILE_URL');
  ensureTaskEditable(data.TASK_ID);
  ensureRequired(data.ATTACHMENT_TYPE, 'ATTACHMENT_TYPE');
  assertValidEnumValue('TASK_ATTACHMENT_TYPE', data.ATTACHMENT_TYPE, 'ATTACHMENT_TYPE');

  var record = {
    ID: cbvMakeId('TATT'),
    TASK_ID: data.TASK_ID,
    ATTACHMENT_TYPE: data.ATTACHMENT_TYPE,
    TITLE: data.TITLE || data.FILE_NAME || '',
    FILE_NAME: data.FILE_NAME || '',
    FILE_URL: data.FILE_URL,
    DRIVE_FILE_ID: data.DRIVE_FILE_ID || '',
    NOTE: data.NOTE || '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser()
  };
  _appendRecord(CBV_CONFIG.SHEETS.TASK_ATTACHMENT, record);
  addTaskUpdate(data.TASK_ID, 'NOTE', 'Attachment added: ' + (record.TITLE || record.FILE_NAME || ''), '', '');
  return cbvResponse(true, 'TASK_ATTACHMENT_ADDED', 'Đã gắn file', record, []);
}

function markChecklistDone(checklistId, note) {
  var current = _findById(CBV_CONFIG.SHEETS.TASK_CHECKLIST, checklistId);
  cbvAssert(current, 'Checklist item not found');
  ensureTaskEditable(current.TASK_ID);
  if (String(current.IS_DONE) === 'true' || current.IS_DONE === true) return cbvResponse(true, 'TASK_NO_CHANGE', 'Checklist item already done', current, []); // idempotent
  current.IS_DONE = true;
  current.DONE_AT = cbvNow();
  current.DONE_BY = cbvUser();
  current.NOTE = note || current.NOTE || '';
  _updateRow(CBV_CONFIG.SHEETS.TASK_CHECKLIST, current._rowNumber, current);
  syncTaskProgress(current.TASK_ID);
  addTaskUpdate(current.TASK_ID, 'NOTE', note || current.TITLE, '', '');
  return cbvResponse(true, 'TASK_CHECKLIST_DONE', 'Checklist item done', current, []);
}
