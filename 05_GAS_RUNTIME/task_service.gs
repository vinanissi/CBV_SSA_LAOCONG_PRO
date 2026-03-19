const TASK_ALLOWED_TRANSITIONS = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING', 'DONE', 'CANCELLED'],
  WAITING: ['IN_PROGRESS', 'CANCELLED'],
  DONE: ['ARCHIVED'],
  CANCELLED: ['ARCHIVED']
};

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
    RESULT_NOTE: '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser(),
    IS_DELETED: false
  };
  _appendRecord(CBV_CONFIG.SHEETS.TASK_MAIN, record);
  addTaskUpdate(record.ID, 'CREATED', 'Task created', 'NEW', 'NEW');
  return cbvResponse(true, 'TASK_CREATED', 'Task đã tạo', record, []);
}

function addTaskUpdate(taskId, action, note, oldStatus, newStatus) {
  const record = {
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

function setTaskStatus(taskId, newStatus, note) {
  const current = _findById(CBV_CONFIG.SHEETS.TASK_MAIN, taskId);
  cbvAssert(current, 'Task not found');
  if (newStatus === 'DONE') ensureTaskCanComplete(taskId);
  ensureTransition(String(current.STATUS), newStatus, TASK_ALLOWED_TRANSITIONS);

  const oldStatus = current.STATUS;
  current.STATUS = newStatus;
  current.UPDATED_AT = cbvNow();
  current.UPDATED_BY = cbvUser();
  if (newStatus === 'DONE') current.DONE_AT = cbvNow();
  if (note) current.RESULT_NOTE = note;

  _updateRow(CBV_CONFIG.SHEETS.TASK_MAIN, current._rowNumber, current);
  addTaskUpdate(taskId, 'STATUS_CHANGED', note || '', oldStatus, newStatus);
  return cbvResponse(true, 'TASK_STATUS_CHANGED', 'Đã cập nhật trạng thái', current, []);
}

function addChecklistItem(data) {
  ensureRequired(data.TASK_ID, 'TASK_ID');
  ensureRequired(data.TITLE, 'TITLE');
  cbvAssert(_findById(CBV_CONFIG.SHEETS.TASK_MAIN, data.TASK_ID), 'Task not found');

  const record = {
    ID: cbvMakeId('TCL'),
    TASK_ID: data.TASK_ID,
    ITEM_NO: data.ITEM_NO || '',
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
  addTaskUpdate(data.TASK_ID, 'CHECKLIST_ADDED', data.TITLE, '', '');
  return cbvResponse(true, 'TASK_CHECKLIST_ADDED', 'Checklist item added', record, []);
}

function markChecklistDone(checklistId, note) {
  const current = _findById(CBV_CONFIG.SHEETS.TASK_CHECKLIST, checklistId);
  cbvAssert(current, 'Checklist item not found');
  current.IS_DONE = true;
  current.DONE_AT = cbvNow();
  current.DONE_BY = cbvUser();
  current.NOTE = note || current.NOTE || '';
  _updateRow(CBV_CONFIG.SHEETS.TASK_CHECKLIST, current._rowNumber, current);
  addTaskUpdate(current.TASK_ID, 'CHECKLIST_DONE', note || current.TITLE, '', '');
  return cbvResponse(true, 'TASK_CHECKLIST_DONE', 'Checklist item done', current, []);
}
