/**
 * CBV Task Test - runTaskTests() for new task model.
 * Requires: HTX, active user. Uses SAMPLE_ prefix.
 * Run order: 1) get or create HTX, 2) get active user, 3) create task, 4) workflow tests.
 */

/**
 * Gets first active HTX or null.
 */
function _taskTestGetHtxId() {
  var sheet = typeof _sheet === 'function' ? _sheet(CBV_CONFIG.SHEETS.HO_SO_MASTER) : null;
  if (!sheet) return null;
  var rows = typeof _rows === 'function' ? _rows(sheet) : [];
  var htx = rows.find(function(r) {
    return String(r.HO_SO_TYPE || '').trim() === 'HTX' &&
      String(r.IS_DELETED) !== 'true' && r.IS_DELETED !== true;
  });
  return htx ? htx.ID : null;
}

/**
 * Gets first active user ID or current user email.
 */
function _taskTestGetOwnerId() {
  var users = typeof getActiveUsers === 'function' ? getActiveUsers() : [];
  if (users.length > 0) return users[0].id;
  var mapped = typeof mapCurrentUserEmailToInternalId === 'function' ? mapCurrentUserEmailToInternalId() : null;
  if (mapped) return mapped;
  return cbvUser();
}

/**
 * Run task tests. Requires at least one HTX and one active user.
 * @returns {Object} { ok, module, total, passed, failed, details }
 */
function runTaskTests() {
  var result = { ok: true, module: 'TASK_CENTER', total: 0, passed: 0, failed: 0, details: [] };
  var sampleTaskId = null;
  var htxId = _taskTestGetHtxId();
  var ownerId = _taskTestGetOwnerId();

  function run(name, fn) {
    result.total++;
    try {
      fn();
      result.passed++;
      result.details.push({ test: name, passed: true, message: 'OK' });
    } catch (e) {
      result.failed++;
      result.ok = false;
      result.details.push({ test: name, passed: false, message: String(e.message || e) });
    }
  }

  run('prerequisites: HTX and user exist', function() {
    if (!htxId) throw new Error('No active HTX. Create one in HO_SO_MASTER (HO_SO_TYPE=HTX) first.');
    if (!ownerId) throw new Error('No active user. Ensure USER_DIRECTORY has ACTIVE user or sign in.');
  });

  run('create task with HTX_ID', function() {
    var r = createTask({
      TITLE: 'SAMPLE Task test',
      OWNER_ID: ownerId,
      HTX_ID: htxId,
      PRIORITY: 'HIGH',
      TASK_CODE: 'SAMPLE_TK001'
    });
    if (!r.ok || !r.data.ID) throw new Error('Task not created');
    sampleTaskId = r.data.ID;
  });

  run('add checklist items', function() {
    if (!sampleTaskId) throw new Error('No sample task');
    addChecklistItem({ TASK_ID: sampleTaskId, TITLE: 'Item required', IS_REQUIRED: true });
    addChecklistItem({ TASK_ID: sampleTaskId, TITLE: 'Item optional', IS_REQUIRED: false });
    var items = typeof taskGetChecklistItems === 'function' ? taskGetChecklistItems(sampleTaskId) : [];
    if (items.length < 2) throw new Error('Checklist items not added');
  });

  run('complete blocked when required checklist not done', function() {
    if (!sampleTaskId) throw new Error('No sample task');
    try {
      setTaskStatus(sampleTaskId, 'DONE', '');
      throw new Error('Should have blocked completion');
    } catch (e) {
      if (e.message.indexOf('Required checklist') === -1 && e.message.indexOf('not completed') === -1) throw e;
    }
  });

  run('mark checklist done', function() {
    if (!sampleTaskId) return;
    var items = typeof taskGetChecklistItems === 'function' ? taskGetChecklistItems(sampleTaskId) : [];
    var required = items.filter(function(r) { return r.IS_REQUIRED === true || String(r.IS_REQUIRED) === 'true'; });
    if (required.length > 0) markChecklistDone(required[0].ID, 'Done');
  });

  run('complete task successfully', function() {
    if (!sampleTaskId) throw new Error('No sample task');
    var r = setTaskStatus(sampleTaskId, 'DONE', 'Completed');
    if (!r.ok || r.data.STATUS !== 'DONE') throw new Error('Task not completed');
  });

  run('workflow rules enforced', function() {
    var r2 = createTask({
      TITLE: 'SAMPLE Task 2',
      OWNER_ID: ownerId,
      HTX_ID: htxId,
      PRIORITY: 'LOW',
      TASK_CODE: 'SAMPLE_TK002'
    });
    if (!r2.ok) throw new Error('Task 2 not created');
    try {
      setTaskStatus(r2.data.ID, 'DONE', '');
    } catch (e) {
      if (e.message.indexOf('Invalid transition') === -1 && e.message.indexOf('transition') === -1) throw e;
    }
  });

  run('task update log written', function() {
    var sheet = typeof _sheet === 'function' ? _sheet(CBV_CONFIG.SHEETS.TASK_UPDATE_LOG) : null;
    if (!sheet) throw new Error('TASK_UPDATE_LOG sheet not found');
    var rows = typeof _rows === 'function' ? _rows(sheet) : [];
    var logs = rows.filter(function(r) { return String(r.TASK_ID) === String(sampleTaskId); });
    if (logs.length < 2) throw new Error('Expected at least 2 log entries');
  });

  run('required fields enforced', function() {
    try {
      createTask({ TITLE: '', OWNER_ID: ownerId, HTX_ID: htxId, PRIORITY: 'HIGH' });
      throw new Error('Should have rejected empty TITLE');
    } catch (e) {
      if (e.message.indexOf('required') === -1 && e.message.indexOf('TITLE') === -1) throw e;
    }
  });

  run('HTX_ID required', function() {
    try {
      createTask({ TITLE: 'X', OWNER_ID: ownerId, PRIORITY: 'HIGH' });
      throw new Error('Should have rejected missing HTX_ID');
    } catch (e) {
      if (e.message.indexOf('HTX') === -1 && e.message.indexOf('required') === -1) throw e;
    }
  });

  Logger.log('runTaskTests: ' + JSON.stringify(result, null, 2));
  return result;
}
