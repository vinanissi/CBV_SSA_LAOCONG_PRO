/**
 * MAIN_CONTROL_OBS — Self Test Runner.
 *
 * Public:
 * - MC_Obs_runSelfTest()
 * - MC_Obs_runSmokeTest()
 * - MC_Obs_runSchemaTest()
 * - MC_Obs_generateSampleData()
 */

function MC_Obs_runSelfTest() {
  return MC_Obs_runTestsImpl_('SELF_TEST');
}

function MC_Obs_runSmokeTest() {
  return MC_Obs_runTestsImpl_('SMOKE_TEST');
}

function MC_Obs_runSchemaTest() {
  return MC_Obs_runTestsImpl_('SCHEMA_TEST');
}

function MC_Obs_generateSampleData() {
  // Add-only sample data for OBS sheets only. Never touches other modules.
  try {
    var runId = MC_Obs_makeIdSafe_('RUN');
    var startedAt = MC_Obs_isoNowSafe_();
    var actor = MC_Obs_actorSafe_();

    if (typeof MC_Obs_appendTestRun === 'function') {
      MC_Obs_appendTestRun({
        RUN_ID: runId,
        RUN_TYPE: 'SAMPLE_DATA',
        STATUS: 'OK',
        TOTAL_TESTS: 0,
        PASSED: 0,
        WARNED: 0,
        FAILED: 0,
        BLOCKED: 0,
        STARTED_AT: startedAt,
        FINISHED_AT: startedAt,
        DURATION_MS: 0,
        TRIGGERED_BY: actor,
        SUMMARY_JSON: { note: 'Generated sample OBS-only rows', prefix: 'TEST_' },
        NOTE: 'TEST_SAMPLE_DATA'
      });
    }

    // Event trace sample.
    if (typeof MC_Obs_appendEventTrace === 'function') {
      MC_Obs_appendEventTrace({
        RUN_ID: runId,
        EVENT_ID: 'TEST_EVT_' + String(new Date().getTime()),
        EVENT_TYPE: 'OBS_SAMPLE',
        ENTITY_TYPE: 'OBS',
        ENTITY_ID: 'TEST_ENTITY',
        DIRECTION: 'INTERNAL',
        STATUS: 'OK',
        SOURCE_MODULE: 'MAIN_CONTROL',
        TARGET_MODULE: 'MAIN_CONTROL',
        CORRELATION_ID: 'TEST_CORR_' + String(new Date().getTime()),
        IDEMPOTENCY_KEY: 'TEST_IDEMP_' + String(new Date().getTime()),
        MESSAGE: 'TEST_ sample event trace',
        PAYLOAD_JSON: { sample: true, t: startedAt }
      });
    }

    // Audit sample.
    if (typeof MC_Obs_appendAudit === 'function') {
      MC_Obs_appendAudit({
        ENTITY_TYPE: 'OBS',
        ENTITY_ID: 'TEST_ENTITY',
        ACTION: 'TEST_SAMPLE',
        FIELD_NAME: 'NOTE',
        OLD_VALUE: '',
        NEW_VALUE: 'TEST_ sample audit row',
        ACTOR_EMAIL: actor,
        SOURCE: 'MC_OBS_SAMPLE',
        COMMAND_ID: runId,
        CORRELATION_ID: 'TEST_CORR_' + String(new Date().getTime()),
        DATA_JSON: { sample: true }
      });
    }

    // Runtime metric sample.
    if (typeof MC_Obs_appendRuntimeMetric === 'function') {
      MC_Obs_appendRuntimeMetric({
        METRIC_TYPE: 'OBS',
        METRIC_NAME: 'TEST_SAMPLE_METRIC',
        METRIC_VALUE: 1,
        UNIT: 'count',
        STATUS: 'OK',
        SEVERITY: 'OK',
        DATA_JSON: { sample: true }
      });
    }

    // Finding sample.
    if (typeof MC_Obs_appendFinding === 'function') {
      MC_Obs_appendFinding({
        RUN_ID: runId,
        SOURCE_TYPE: 'OBS',
        SOURCE_CODE: 'TEST_SAMPLE_FINDING',
        SEVERITY: 'WARN',
        STATUS: 'OPEN',
        MESSAGE: 'TEST_ sample finding (non-blocking)',
        ACTION_REQUIRED: 'Review and close if not needed',
        OWNER: actor,
        IS_RESOLVED: 'FALSE',
        DATA_JSON: { sample: true },
        NOTE: 'TEST_SAMPLE_DATA'
      });
    }

    return MC_Obs_stdResponse_(true, 'MC_OBS_SAMPLE_DATA_OK', 'OK', { runId: runId }, null);
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_SAMPLE_DATA_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_runTestsImpl_(runType) {
  // No throw outward; all writes are best-effort.
  try {
    var runId = MC_Obs_makeIdSafe_('RUN');
    var startedAt = MC_Obs_isoNowSafe_();
    var actor = MC_Obs_actorSafe_();

    var tests = MC_Obs_buildTestList_(String(runType || 'SELF_TEST').trim().toUpperCase());

    // Create MC_OBS_TEST_RUN row (best-effort).
    try {
      if (typeof MC_Obs_appendTestRun === 'function') {
        MC_Obs_appendTestRun({
          RUN_ID: runId,
          RUN_TYPE: String(runType || 'SELF_TEST').trim().toUpperCase(),
          STATUS: 'OK',
          TOTAL_TESTS: tests.length,
          PASSED: 0,
          WARNED: 0,
          FAILED: 0,
          BLOCKED: 0,
          STARTED_AT: startedAt,
          FINISHED_AT: '',
          DURATION_MS: '',
          TRIGGERED_BY: actor,
          SUMMARY_JSON: { phase: 'STARTED' },
          NOTE: ''
        });
      }
    } catch (e0) {
      /* swallow */
    }

    var counts = { passed: 0, warned: 0, failed: 0, blocked: 0, skipped: 0 };
    var results = [];
    var i;
    for (i = 0; i < tests.length; i++) {
      var r = MC_Obs_runSingleTest_(runId, tests[i]);
      results.push(r);
      var st = String(r.status || '').toUpperCase();
      if (st === 'OK') counts.passed++;
      else if (st === 'WARN') counts.warned++;
      else if (st === 'ERROR') counts.failed++;
      else if (st === 'BLOCKER') counts.blocked++;
      else counts.skipped++;
    }

    var finishedAt = MC_Obs_isoNowSafe_();
    var dur = MC_Obs_durationMsSafe_(startedAt, finishedAt);

    var overall = 'OK';
    if (counts.blocked > 0) overall = 'BLOCKER';
    else if (counts.failed > 0) overall = 'ERROR';
    else if (counts.warned > 0) overall = 'WARN';

    // Update: append a final test-run row (append-only) with summary.
    // (We avoid updating existing row to stay strictly append-only).
    try {
      if (typeof MC_Obs_appendTestRun === 'function') {
        MC_Obs_appendTestRun({
          RUN_ID: runId,
          RUN_TYPE: String(runType || 'SELF_TEST').trim().toUpperCase(),
          STATUS: overall,
          TOTAL_TESTS: tests.length,
          PASSED: counts.passed,
          WARNED: counts.warned,
          FAILED: counts.failed,
          BLOCKED: counts.blocked,
          STARTED_AT: startedAt,
          FINISHED_AT: finishedAt,
          DURATION_MS: dur,
          TRIGGERED_BY: actor,
          SUMMARY_JSON: { phase: 'FINISHED', counts: counts },
          NOTE: 'FINAL'
        });
      }
    } catch (e1) {
      /* swallow */
    }

    // Refresh dashboard best-effort (operator-first).
    try {
      if (typeof MC_Obs_refreshDashboard === 'function') MC_Obs_refreshDashboard();
    } catch (dErr) {
      /* swallow */
    }

    return MC_Obs_stdResponse_(overall === 'OK', overall === 'OK' ? 'MC_OBS_TEST_OK' : 'MC_OBS_TEST_WARN', overall === 'OK' ? 'OK' : 'Self test completed with findings', {
      runId: runId,
      runType: String(runType || 'SELF_TEST').trim().toUpperCase(),
      status: overall,
      counts: counts,
      startedAt: startedAt,
      finishedAt: finishedAt,
      durationMs: dur,
      results: results
    }, null);
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_TEST_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_buildTestList_(runType) {
  var list = [
    { code: 'OBS_SCHEMA_OK', name: 'OBS schema ensure/report', fn: MC_Obs_testObsSchema_ },
    { code: 'OBS_HEALTH_OK', name: 'OBS health check', fn: MC_Obs_testObsHealth_ },
    { code: 'CORE_DB_OPEN_OK', name: 'Open Core DB strict', fn: MC_Obs_testCoreDbOpen_ },
    { code: 'CONTROL_PLANE_SCHEMA_PRESENT', name: 'Control plane schema present', fn: MC_Obs_testControlPlaneSchemaPresent_ },
    { code: 'CONNECTION_PACKAGE_SHEET_OK', name: 'CBV_CONNECTION_PACKAGE sheet exists', fn: MC_Obs_testConnectionPackageSheet_ },
    { code: 'MODULE_REGISTRY_HEADERS_OK', name: 'CBV_MODULE_REGISTRY headers extended', fn: MC_Obs_testModuleRegistryHeaders_ },
    { code: 'WEBAPP_TOKEN_PRESENT_OR_WARN', name: 'WebApp token present or warn', fn: MC_Obs_testWebAppToken_ },
    { code: 'MAIN_CONTROL_URL_PRESENT_OR_WARN', name: 'MAIN_CONTROL URL present or warn', fn: MC_Obs_testMainControlUrl_ },
    { code: 'EVENT_TRACE_WRITE_OK', name: 'Write event trace', fn: MC_Obs_testEventTraceWrite_ },
    { code: 'AUDIT_WRITE_OK', name: 'Write audit', fn: MC_Obs_testAuditWrite_ },
    { code: 'AI_EXPORT_BUILD_OK', name: 'Build AI export', fn: MC_Obs_testAiExportBuild_ }
  ];
  // For schema-only run, keep subset.
  if (runType === 'SCHEMA_TEST') {
    return [list[0], list[2], list[3], list[4], list[5]];
  }
  // For smoke test, keep minimal.
  if (runType === 'SMOKE_TEST') {
    return [list[0], list[1], list[2], list[8], list[9]];
  }
  return list;
}

function MC_Obs_runSingleTest_(runId, def) {
  var startedAt = MC_Obs_isoNowSafe_();
  var finishedAt = startedAt;
  var status = 'SKIPPED';
  var severity = 'INFO';
  var message = 'SKIPPED';
  var expected = '';
  var actual = '';
  var dataJson = {};
  var errorCode = '';
  var errorMessage = '';

  try {
    if (!def || typeof def.fn !== 'function') {
      status = 'SKIPPED';
      severity = 'WARN';
      message = 'Test function missing';
    } else {
      var out = def.fn(runId);
      status = String(out && out.status ? out.status : 'OK').toUpperCase();
      severity = String(out && out.severity ? out.severity : status).toUpperCase();
      message = String(out && out.message ? out.message : 'OK');
      expected = out && out.expected != null ? String(out.expected) : '';
      actual = out && out.actual != null ? String(out.actual) : '';
      dataJson = out && out.data ? out.data : {};
      errorCode = out && out.errorCode ? String(out.errorCode) : '';
      errorMessage = out && out.errorMessage ? String(out.errorMessage) : '';
    }
  } catch (e) {
    status = 'ERROR';
    severity = 'ERROR';
    message = 'Exception';
    errorCode = 'EXCEPTION';
    errorMessage = String(e && e.message ? e.message : e);
    dataJson = { stack: String(e && e.stack ? e.stack : '') };
  } finally {
    finishedAt = MC_Obs_isoNowSafe_();
  }

  var dur = MC_Obs_durationMsSafe_(startedAt, finishedAt);
  var resultId = MC_Obs_makeIdSafe_('RES');
  var row = {
    RESULT_ID: resultId,
    RUN_ID: runId,
    MODULE_CODE: 'MAIN_CONTROL',
    TEST_CODE: String(def && def.code ? def.code : ''),
    TEST_NAME: String(def && def.name ? def.name : ''),
    STATUS: status,
    SEVERITY: severity,
    MESSAGE: message,
    EXPECTED: expected,
    ACTUAL: actual,
    DATA_JSON: dataJson,
    ERROR_CODE: errorCode,
    ERROR_MESSAGE: errorMessage,
    STARTED_AT: startedAt,
    FINISHED_AT: finishedAt,
    DURATION_MS: dur
  };

  // Append test result (best-effort).
  try {
    if (typeof MC_Obs_appendTestResult === 'function') MC_Obs_appendTestResult(row);
  } catch (e2) {
    /* swallow */
  }

  // If warning/error/blocker then create finding (best-effort).
  try {
    if (typeof MC_Obs_appendFinding === 'function') {
      if (status === 'WARN' || status === 'ERROR' || status === 'BLOCKER') {
        MC_Obs_appendFinding({
          RUN_ID: runId,
          SOURCE_TYPE: 'SELF_TEST',
          SOURCE_CODE: String(def && def.code ? def.code : ''),
          SEVERITY: status === 'BLOCKER' ? 'BLOCKER' : (status === 'ERROR' ? 'ERROR' : 'WARN'),
          STATUS: 'OPEN',
          MESSAGE: message,
          ACTION_REQUIRED: 'Investigate and resolve',
          OWNER: MC_Obs_actorSafe_(),
          IS_RESOLVED: 'FALSE',
          DATA_JSON: { testResultId: resultId, expected: expected, actual: actual, data: dataJson, errorCode: errorCode, errorMessage: errorMessage },
          NOTE: ''
        });
      }
    }
  } catch (e3) {
    /* swallow */
  }

  return { testCode: row.TEST_CODE, status: status, message: message, severity: severity, durationMs: dur };
}

// Individual tests (no side effects outside OBS).

function MC_Obs_testObsSchema_() {
  if (typeof MC_Obs_schemaReport !== 'function') return { status: 'ERROR', severity: 'ERROR', message: 'MC_Obs_schemaReport missing' };
  var rep = MC_Obs_schemaReport();
  if (!rep || !rep.ok) return { status: 'ERROR', severity: 'ERROR', message: 'schemaReport failed', data: { report: rep || null } };
  var sheets = rep.data && rep.data.sheets ? rep.data.sheets : [];
  var missing = [];
  var i;
  for (i = 0; i < sheets.length; i++) {
    if (!sheets[i].exists) missing.push({ sheetName: sheets[i].sheetName, reason: 'MISSING_SHEET' });
    else if (sheets[i].missingHeaders && sheets[i].missingHeaders.length) missing.push({ sheetName: sheets[i].sheetName, reason: 'MISSING_HEADERS', missingHeaders: sheets[i].missingHeaders });
  }
  if (missing.length) return { status: 'WARN', severity: 'WARN', message: 'OBS schema incomplete', data: { missing: missing } };
  return { status: 'OK', severity: 'OK', message: 'OBS schema OK' };
}

function MC_Obs_testObsHealth_() {
  if (typeof MC_Obs_healthCheck !== 'function') return { status: 'ERROR', severity: 'ERROR', message: 'MC_Obs_healthCheck missing' };
  var h = MC_Obs_healthCheck();
  if (!h) return { status: 'ERROR', severity: 'ERROR', message: 'healthCheck returned null' };
  if (h.code === 'MC_OBS_HEALTH_BLOCKER') return { status: 'BLOCKER', severity: 'BLOCKER', message: 'OBS health has blockers', data: { health: h } };
  if (h.code === 'MC_OBS_HEALTH_WARN') return { status: 'WARN', severity: 'WARN', message: 'OBS health warnings', data: { health: h } };
  return { status: 'OK', severity: 'OK', message: 'OBS health OK' };
}

function MC_Obs_testCoreDbOpen_() {
  if (typeof MC_Obs_openModuleDb_ !== 'function') return { status: 'ERROR', severity: 'ERROR', message: 'MC_Obs_openModuleDb_ missing' };
  var o = MC_Obs_openModuleDb_();
  if (!o || !o.ok) return { status: 'BLOCKER', severity: 'BLOCKER', message: 'Core DB open failed', data: { open: o || null } };
  return { status: 'OK', severity: 'OK', message: 'Core DB open OK', actual: String(o.coreDbId || '') };
}

function MC_Obs_testControlPlaneSchemaPresent_() {
  if (typeof MC_CONTROL_PLANE_SCHEMA_ === 'undefined') return { status: 'WARN', severity: 'WARN', message: 'MC_CONTROL_PLANE_SCHEMA_ missing' };
  return { status: 'OK', severity: 'OK', message: 'MC_CONTROL_PLANE_SCHEMA_ present' };
}

function MC_Obs_testConnectionPackageSheet_() {
  var o = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!o.ok) return { status: 'BLOCKER', severity: 'BLOCKER', message: 'Core DB open failed' };
  var sh = null;
  try { sh = o.ss.getSheetByName('CBV_CONNECTION_PACKAGE'); } catch (e) { sh = null; }
  if (!sh) return { status: 'ERROR', severity: 'ERROR', message: 'CBV_CONNECTION_PACKAGE missing' };
  return { status: 'OK', severity: 'OK', message: 'CBV_CONNECTION_PACKAGE present' };
}

function MC_Obs_testModuleRegistryHeaders_() {
  var o = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!o.ok) return { status: 'BLOCKER', severity: 'BLOCKER', message: 'Core DB open failed' };
  var sh = null;
  try { sh = o.ss.getSheetByName('CBV_MODULE_REGISTRY'); } catch (e) { sh = null; }
  if (!sh) return { status: 'ERROR', severity: 'ERROR', message: 'CBV_MODULE_REGISTRY missing' };
  var headers = (typeof MC_Obs_getHeaders_ === 'function') ? MC_Obs_getHeaders_(sh) : [];
  var need = ['MODULE_DB_ID', 'MODULE_WEBAPP_URL', 'ENV_CODE', 'UPDATED_BY', 'HEALTH_STATUS', 'LAST_HEALTH_AT', 'NOTE'];
  var set = {};
  var i;
  for (i = 0; i < headers.length; i++) set[String(headers[i] || '').trim()] = true;
  var missing = [];
  for (i = 0; i < need.length; i++) if (!set[need[i]]) missing.push(need[i]);
  if (missing.length) return { status: 'WARN', severity: 'WARN', message: 'Registry missing extended headers', data: { missingHeaders: missing } };
  return { status: 'OK', severity: 'OK', message: 'Registry headers OK' };
}

function MC_Obs_testWebAppToken_() {
  var token = '';
  try { token = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim(); } catch (e) { token = ''; }
  if (!token) return { status: 'WARN', severity: 'WARN', message: 'CBV_MAIN_WEBAPP_TOKEN missing', expected: 'present', actual: 'missing' };
  return { status: 'OK', severity: 'OK', message: 'CBV_MAIN_WEBAPP_TOKEN present', expected: 'present', actual: 'present' };
}

function MC_Obs_testMainControlUrl_() {
  var url = '';
  try { url = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_CONTROL_WEBAPP_URL') || '').trim(); } catch (e) { url = ''; }
  if (!url) return { status: 'WARN', severity: 'WARN', message: 'CBV_MAIN_CONTROL_WEBAPP_URL missing', expected: 'present', actual: 'missing' };
  return { status: 'OK', severity: 'OK', message: 'CBV_MAIN_CONTROL_WEBAPP_URL present', expected: 'present', actual: 'present' };
}

function MC_Obs_testEventTraceWrite_() {
  if (typeof MC_Obs_appendEventTrace !== 'function') return { status: 'ERROR', severity: 'ERROR', message: 'MC_Obs_appendEventTrace missing' };
  var r = MC_Obs_appendEventTrace({
    EVENT_ID: 'TEST_EVT_' + String(new Date().getTime()),
    EVENT_TYPE: 'OBS_SELF_TEST',
    ENTITY_TYPE: 'OBS',
    ENTITY_ID: 'TEST',
    DIRECTION: 'INTERNAL',
    STATUS: 'OK',
    SOURCE_MODULE: 'MAIN_CONTROL',
    TARGET_MODULE: 'MAIN_CONTROL',
    CORRELATION_ID: 'TEST_CORR_' + String(new Date().getTime()),
    IDEMPOTENCY_KEY: 'TEST_IDEMP_' + String(new Date().getTime()),
    MESSAGE: 'TEST_ event trace write',
    PAYLOAD_JSON: { test: true }
  });
  if (r && r.ok) return { status: 'OK', severity: 'OK', message: 'Event trace write OK' };
  return { status: 'WARN', severity: 'WARN', message: 'Event trace write failed (non-blocking)', data: { appendResult: r || null } };
}

function MC_Obs_testAuditWrite_() {
  if (typeof MC_Obs_appendAudit !== 'function') return { status: 'ERROR', severity: 'ERROR', message: 'MC_Obs_appendAudit missing' };
  var r = MC_Obs_appendAudit({
    ENTITY_TYPE: 'OBS',
    ENTITY_ID: 'TEST',
    ACTION: 'SELF_TEST',
    FIELD_NAME: 'STATUS',
    OLD_VALUE: '',
    NEW_VALUE: 'OK',
    ACTOR_EMAIL: MC_Obs_actorSafe_(),
    SOURCE: 'MC_OBS_TEST',
    COMMAND_ID: MC_Obs_makeIdSafe_('CMD'),
    CORRELATION_ID: 'TEST_CORR_' + String(new Date().getTime()),
    DATA_JSON: { test: true }
  });
  if (r && r.ok) return { status: 'OK', severity: 'OK', message: 'Audit write OK' };
  return { status: 'WARN', severity: 'WARN', message: 'Audit write failed (non-blocking)', data: { appendResult: r || null } };
}

function MC_Obs_testAiExportBuild_() {
  if (typeof MC_Obs_buildAiExportJson !== 'function' || typeof MC_Obs_buildAiExportMarkdown !== 'function') {
    return { status: 'ERROR', severity: 'ERROR', message: 'AI export builders missing' };
  }
  var jsonObj = MC_Obs_buildAiExportJson();
  var md = MC_Obs_buildAiExportMarkdown();
  if (!jsonObj || typeof jsonObj !== 'object') return { status: 'ERROR', severity: 'ERROR', message: 'AI export JSON invalid' };
  if (!md || String(md).length < 20) return { status: 'WARN', severity: 'WARN', message: 'AI export Markdown looks empty', data: { length: String(md || '').length } };
  return { status: 'OK', severity: 'OK', message: 'AI export build OK', data: { markdownLength: String(md).length } };
}

// Small safe helpers (avoid relying on later-loaded files).

function MC_Obs_isoNowSafe_() {
  try {
    if (typeof MC_now_ === 'function') return MC_now_();
  } catch (e0) {
    /* ignore */
  }
  try {
    return new Date().toISOString();
  } catch (e1) {
    return String(new Date());
  }
}

function MC_Obs_actorSafe_() {
  try {
    var email = String(Session.getActiveUser().getEmail() || '').trim();
    if (email) return email;
  } catch (e0) {
    /* ignore */
  }
  return 'SYSTEM';
}

function MC_Obs_makeIdSafe_(prefix) {
  try {
    if (typeof MC_Obs_makeId_ === 'function') return MC_Obs_makeId_(prefix);
  } catch (e0) {
    /* ignore */
  }
  try {
    if (typeof MC_uuid_ === 'function') return MC_uuid_(prefix);
  } catch (e1) {
    /* ignore */
  }
  return String(prefix || 'ID') + '_' + String(new Date().getTime());
}

function MC_Obs_durationMsSafe_(startedIso, finishedIso) {
  try {
    var a = new Date(String(startedIso || ''));
    var b = new Date(String(finishedIso || ''));
    var ms = b.getTime() - a.getTime();
    return isFinite(ms) ? ms : '';
  } catch (e) {
    return '';
  }
}

