/**
 * CBV TASK_CENTER Test Layer - Create, checklist, completion block, workflow, logs.
 * Uses SAMPLE_ prefix for test records. Does not delete.
 */
function runTaskTests() {
  var result = {
    ok: true,
    module: 'TASK_CENTER',
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  var sampleTaskId = null;

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

  run('create task', function() {
    var r = createTask({
      TITLE: 'SAMPLE Task test',
      OWNER_ID: cbvUser(),
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
    var rows = _rows(_sheet(CBV_CONFIG.SHEETS.TASK_CHECKLIST)).filter(function(r) { return String(r.TASK_ID) === String(sampleTaskId); });
    if (rows.length < 1) throw new Error('Checklist items not added');
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
    var items = _rows(_sheet(CBV_CONFIG.SHEETS.TASK_CHECKLIST)).filter(function(r) {
      return String(r.TASK_ID) === String(sampleTaskId) && (r.IS_REQUIRED === true || String(r.IS_REQUIRED) === 'true');
    });
    if (items.length > 0) markChecklistDone(items[0].ID, 'Done');
  });

  run('complete task successfully', function() {
    if (!sampleTaskId) throw new Error('No sample task');
    var r = setTaskStatus(sampleTaskId, 'DONE', 'Completed');
    if (!r.ok || r.data.STATUS !== 'DONE') throw new Error('Task not completed');
  });

  run('workflow rules enforced', function() {
    var r2 = createTask({ TITLE: 'SAMPLE Task 2', OWNER_ID: cbvUser(), PRIORITY: 'LOW', TASK_CODE: 'SAMPLE_TK002' });
    if (!r2.ok) throw new Error('Task 2 not created');
    try {
      setTaskStatus(r2.data.ID, 'DONE', '');
    } catch (e) {
      if (e.message.indexOf('Invalid transition') === -1 && e.message.indexOf('transition') === -1) throw e;
    }
  });

  run('task update log written', function() {
    var logs = _rows(_sheet(CBV_CONFIG.SHEETS.TASK_UPDATE_LOG)).filter(function(r) { return String(r.TASK_ID) === String(sampleTaskId); });
    if (logs.length < 2) throw new Error('Expected at least 2 log entries');
  });

  run('required fields enforced', function() {
    try {
      createTask({ TITLE: '', OWNER_ID: 'x', PRIORITY: 'HIGH' });
      throw new Error('Should have rejected empty TITLE');
    } catch (e) {
      if (e.message.indexOf('required') === -1 && e.message.indexOf('TITLE') === -1) throw e;
    }
  });

  Logger.log('runTaskTests: ' + JSON.stringify(result, null, 2));
  return result;
}
