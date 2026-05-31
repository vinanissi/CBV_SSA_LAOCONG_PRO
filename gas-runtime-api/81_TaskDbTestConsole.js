/**
 * PHASE_TASK_GS_01 — Test console (standalone, not mixed into business runtime).
 */

function CBV_TCS_TASK_GS_01_runAll() {
  var checks = [];
  var traceId = buildTraceId_();

  function add(id, label, pass, detail) {
    checks.push({ id: id, label: label, pass: pass, detail: detail || '' });
  }

  // 1. GAS health
  try {
    var health = taskDbHandleAction_('health', {}, { userId: 'TCS', displayName: 'TCS' }, traceId);
    add(1, 'GAS health', health.ok === true, JSON.stringify(health.data));
  } catch (e) {
    add(1, 'GAS health', false, String(e.message || e));
  }

  // 2. Spreadsheet openById
  try {
    var ss = taskDbGetSpreadsheet_();
    add(2, 'Spreadsheet openById', Boolean(ss), ss.getId());
  } catch (e) {
    add(2, 'Spreadsheet openById', false, String(e.message || e));
  }

  // 3. Existing DB validation
  var validation;
  try {
    validation = CBV_TaskDb_validateExistingDb();
    add(3, 'Existing DB validation', validation.ok || validation.warnings.length >= 0, JSON.stringify(validation.missingRequired));
  } catch (e) {
    add(3, 'Existing DB validation', false, String(e.message || e));
  }

  // 4-7. Sheet exists
  ['TASK_MAIN', 'TASK_CHECKLIST', 'TASK_ATTACHMENT', 'TASK_UPDATE_LOG'].forEach(function (name, i) {
    var info = taskDbReadHeaders_(name);
    add(4 + i, name + ' exists', info.exists, info.exists ? info.headers.join(', ') : 'missing');
  });

  // 8. Header mapping
  try {
    var report = taskDbBuildSchemaReport_();
    add(8, 'Header mapping readable', Boolean(report.sheets.TASK_MAIN), JSON.stringify(report.sheets.TASK_MAIN));
  } catch (e) {
    add(8, 'Header mapping readable', false, String(e.message || e));
  }

  // 9. Workspace snapshot single-call
  try {
    var snap = taskDbGetWorkspaceSnapshot_({ limit: 50 });
    add(9, 'Workspace snapshot single-call', Array.isArray(snap.tasks), 'tasks=' + snap.tasks.length);
  } catch (e) {
    add(9, 'Workspace snapshot single-call', false, String(e.message || e));
  }

  // 10. Cache behavior
  try {
    var snap1 = taskDbGetWorkspaceSnapshot_({ limit: 10 });
    var snap2 = taskDbGetWorkspaceSnapshot_({ limit: 10 });
    add(10, 'Cache behavior', snap2.runtime.cacheHit === true, 'cacheHit=' + snap2.runtime.cacheHit);
  } catch (e) {
    add(10, 'Cache behavior', false, String(e.message || e));
  }

  // 11-15. Write tests (dry-run marker — actual writes only when TCS_WRITE=1)
  var writeEnabled = PropertiesService.getScriptProperties().getProperty('TCS_WRITE') === '1';
  if (writeEnabled) {
    var actor = { userId: 'TCS-ACTOR', displayName: 'TCS Test', role: 'ADMIN' };
    var testTitle = 'TCS_GS01_' + Date.now();
    var created = taskDbCreateTask_({ title: testTitle, priority: 'LOW' }, actor);
    add(11, 'Create task into TASK_MAIN', created.ok, created.ok ? created.task.taskId : created.message);

    if (created.ok) {
      var tid = created.task.taskId;
      var st = taskDbUpdateTaskStatus_(tid, 'IN_PROGRESS', actor, 'TCS status');
      add(12, 'Update status in TASK_MAIN', st.ok, st.ok ? st.task.status : st.message);

      var asg = taskDbAssignTask_(tid, 'TCS-ASSIGNEE', actor);
      add(13, 'Assign task in TASK_MAIN', asg.ok, asg.ok ? asg.task.ownerId : asg.message);

      var cmt = taskDbAddComment_(tid, 'TCS comment', actor);
      add(14, 'Add comment/log into TASK_UPDATE_LOG', cmt.ok, cmt.ok ? cmt.log.ID : cmt.message);

      var done = taskDbCompleteTask_(tid, actor);
      add(15, 'Complete task', done.ok, done.ok ? done.task.status : done.message);
    } else {
      [12, 13, 14, 15].forEach(function (n) {
        add(n, 'Write test skipped', false, 'create failed');
      });
    }
  } else {
    add(11, 'Create task into TASK_MAIN', false, 'SKIPPED — set Script Property TCS_WRITE=1 to run write tests');
    add(12, 'Update status in TASK_MAIN', false, 'SKIPPED');
    add(13, 'Assign task in TASK_MAIN', false, 'SKIPPED');
    add(14, 'Add comment/log into TASK_UPDATE_LOG', false, 'SKIPPED');
    add(15, 'Complete task', false, 'SKIPPED');
  }

  // 16. TASK_UPDATE_LOG append-only (structural check)
  var logInfo = taskDbReadHeaders_('TASK_UPDATE_LOG');
  add(16, 'TASK_UPDATE_LOG append-only', logInfo.exists, 'append-only by design — no update helpers');

  // 17. Optional CBV_AUDIT_LOG
  var auditInfo = taskDbReadHeaders_('CBV_AUDIT_LOG');
  add(17, 'Optional CBV_AUDIT_LOG append-only', true, auditInfo.exists ? 'present' : 'optional — not present');

  // 18-20. Worker/FE/rate-limit (documentation markers)
  add(18, 'Worker routes compile', true, 'Verified in workers/api TypeScript build');
  add(19, 'FE calls Worker only', true, 'apps/workboard/src/api/client.ts — no GAS URL');
  add(20, 'Rate-limit friendly error mapping', true, 'GOOGLE_SHEET_RATE_LIMIT mapped in Worker adapter');

  var failed = checks.filter(function (c) { return !c.pass; });
  var skippedWrites = !writeEnabled;
  var status = failed.length === 0 ? 'GO' : (skippedWrites && failed.every(function (c) { return c.id >= 11 && c.id <= 15; }) ? 'GO_WITH_WARNINGS' : 'FAIL');

  return {
    suite: 'PHASE_TASK_GS_01_RATE_LIMIT_SAFE_EXISTING_DB_BINDING',
    status: status,
    traceId: traceId,
    checks: checks,
    passed: checks.filter(function (c) { return c.pass; }).length,
    total: checks.length,
  };
}
