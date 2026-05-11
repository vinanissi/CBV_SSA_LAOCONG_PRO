/**
 * TASK_OBS — Adapter (uses CBV_OBS_CORE B1).
 *
 * Public:
 * - TaskObs_healthCheck()
 * - TaskObs_healthCheckText()
 * - TaskObs_runSelfTest()
 * - TaskObs_generateSampleData()
 * - TaskObs_generateAiDiagnosticExport()
 * - TaskObs_emitSummaryToMainControl()
 */

function TaskObs_healthCheck() {
  try {
    var cfg = TaskObs_getConfig();
    var findings = [];

    TaskObs_addFinding_(findings, 'INFO', 'TASK_OBS_VERSION', 'TASK_OBS health check', { moduleCode: 'TASK' });

    // 1) Core functions presence.
    var coreMissing = [];
    if (typeof CBV_Obs_ensureSheets !== 'function') coreMissing.push('CBV_Obs_ensureSheets');
    if (typeof CBV_Obs_appendHealth !== 'function') coreMissing.push('CBV_Obs_appendHealth');
    if (typeof CBV_Obs_appendFinding !== 'function') coreMissing.push('CBV_Obs_appendFinding');
    if (coreMissing.length) {
      TaskObs_addFinding_(findings, 'ERROR', 'OBS_CORE_MISSING', 'CBV_OBS_CORE functions missing', { missing: coreMissing });
    } else {
      TaskObs_addFinding_(findings, 'INFO', 'OBS_CORE_PRESENT', 'CBV_OBS_CORE present', {});
    }

    // 2) TASK DB id present.
    var dbId = '';
    try { dbId = TaskObs_getTaskDbId_(); } catch (e0) { dbId = ''; }
    if (!dbId) TaskObs_addFinding_(findings, 'BLOCKER', 'CBV_TASK_DB_ID_MISSING', 'CBV_TASK_DB_ID missing', {});
    else TaskObs_addFinding_(findings, 'INFO', 'CBV_TASK_DB_ID_OK', 'CBV_TASK_DB_ID present', { configured: true });

    // 3) TASK DB open.
    var ss = null;
    if (dbId) {
      try {
        ss = TaskObs_openTaskDb_();
        TaskObs_addFinding_(findings, 'INFO', 'TASK_DB_OPEN_OK', 'TASK DB opened', { spreadsheetId: ss.getId() });
      } catch (e1) {
        TaskObs_addFinding_(findings, 'BLOCKER', 'TASK_DB_OPEN_FAILED', 'TASK DB cannot be opened', { error: String(e1 && e1.message ? e1.message : e1), code: e1 && e1.code ? e1.code : '' });
      }
    }

    // 4) OBS schema report if core is present.
    if (!coreMissing.length && typeof CBV_Obs_schemaReport === 'function') {
      try {
        var rep = CBV_Obs_schemaReport(cfg);
        if (rep && rep.ok) TaskObs_addFinding_(findings, 'INFO', 'OBS_SCHEMA_REPORT_OK', 'OBS schema report OK', {});
        else TaskObs_addFinding_(findings, 'WARN', 'OBS_SCHEMA_REPORT_WARN', 'OBS schema report warnings', { report: rep || null });
      } catch (e2) {
        TaskObs_addFinding_(findings, 'ERROR', 'OBS_SCHEMA_REPORT_EXCEPTION', 'OBS schema report exception', { error: String(e2 && e2.message ? e2.message : e2) });
      }
    }

    // 5) MAIN_CONTROL optional.
    var mainUrl = '';
    var token = '';
    try { mainUrl = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_CONTROL_WEBAPP_URL') || '').trim(); } catch (e3) { mainUrl = ''; }
    try { token = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim(); } catch (e4) { token = ''; }
    if (!mainUrl) TaskObs_addFinding_(findings, 'WARN', 'MAIN_CONTROL_URL_MISSING', 'CBV_MAIN_CONTROL_WEBAPP_URL missing (optional)', {});
    if (!token) TaskObs_addFinding_(findings, 'WARN', 'MAIN_WEBAPP_TOKEN_MISSING', 'CBV_MAIN_WEBAPP_TOKEN missing (optional)', {});

    var summary = TaskObs_countFindings_(findings);
    var ok = summary.blocker === 0 && summary.error === 0;
    var code = ok ? 'TASK_OBS_HEALTH_OK' : (summary.blocker > 0 ? 'TASK_OBS_HEALTH_BLOCKER' : (summary.error > 0 ? 'TASK_OBS_HEALTH_ERROR' : 'TASK_OBS_HEALTH_WARN'));
    var msg = ok ? 'OK' : (summary.blocker > 0 ? 'BLOCKER findings present' : 'Warnings/errors present');

    var res = TaskObs_stdResponse_(ok, code, msg, { summary: summary, findings: findings }, null);

    // Persist health row + findings best-effort.
    try {
      if (typeof CBV_Obs_appendHealth === 'function') {
        CBV_Obs_appendHealth(cfg, {
          CHECK_CODE: 'TASK_OBS_HEALTH_CHECK',
          STATUS: ok ? 'OK' : (summary.blocker > 0 ? 'BLOCKER' : 'WARN'),
          SEVERITY: ok ? 'OK' : (summary.blocker > 0 ? 'BLOCKER' : 'WARN'),
          MESSAGE: msg,
          DATA_JSON: { summary: summary, findings: findings }
        });
      }
      if (typeof CBV_Obs_appendFinding === 'function') {
        // Only persist non-INFO to findings sheet.
        for (var i = 0; i < findings.length; i++) {
          var sev = String(findings[i].severity || '').toUpperCase();
          if (sev === 'INFO') continue;
          CBV_Obs_appendFinding(cfg, {
            SOURCE_TYPE: 'HEALTH',
            SOURCE_CODE: String(findings[i].code || ''),
            SEVERITY: sev,
            STATUS: 'OPEN',
            MESSAGE: String(findings[i].message || ''),
            ACTION_REQUIRED: 'Review',
            OWNER: TaskObs_user_(),
            DATA_JSON: findings[i].data || {}
          });
        }
      }
    } catch (pErr) {
      /* swallow */
    }

    return res;
  } catch (e) {
    return TaskObs_stdResponse_(false, 'TASK_OBS_HEALTH_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function TaskObs_healthCheckText() {
  try {
    var r = TaskObs_healthCheck();
    return TaskObs_safeText_(r);
  } catch (e) {
    return 'TaskObs_healthCheckText error: ' + String(e && e.message ? e.message : e);
  }
}

function TaskObs_runSelfTest() {
  // Operator-friendly: results are written to sheets, returned summary is compact.
  try {
    var cfg = TaskObs_getConfig();
    var runId = TaskObs_makeId_('RUN');
    var startedAt = TaskObs_now_();
    var actor = TaskObs_user_();

    var counts = { passed: 0, warned: 0, failed: 0, blocked: 0 };
    var results = [];

    // Start test run row.
    try {
      if (typeof CBV_Obs_appendTestRun === 'function') {
        CBV_Obs_appendTestRun(cfg, {
          RUN_ID: runId,
          RUN_TYPE: 'SELF_TEST',
          STATUS: 'OK',
          TOTAL_TESTS: 9,
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

    function runTest_(testCode, testName, fn) {
      var status = 'OK';
      var severity = 'OK';
      var message = 'OK';
      var expected = '';
      var actual = '';
      var data = {};
      try {
        var out = fn();
        status = String(out && out.status ? out.status : 'OK').toUpperCase();
        severity = String(out && out.severity ? out.severity : status).toUpperCase();
        message = String(out && out.message ? out.message : 'OK');
        expected = out && out.expected != null ? String(out.expected) : '';
        actual = out && out.actual != null ? String(out.actual) : '';
        data = out && out.data ? out.data : {};
      } catch (e) {
        status = 'ERROR';
        severity = 'ERROR';
        message = 'Exception';
        data = { error: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') };
      }

      TaskObs_appendTestResult_(runId, testCode, testName, status, severity, message, expected, actual, data);

      if (status === 'OK') counts.passed++;
      else if (status === 'WARN') counts.warned++;
      else if (status === 'BLOCKER') counts.blocked++;
      else counts.failed++;

      if (status === 'WARN' || status === 'ERROR' || status === 'BLOCKER') {
        TaskObs_appendFindingFromTest_(runId, testCode, status, message, data);
      }
      results.push({ testCode: testCode, status: status, message: message });
    }

    runTest_('OBS_CORE_PRESENT', 'CBV_OBS_CORE present', function () {
      var missing = [];
      if (typeof CBV_Obs_ensureSheets !== 'function') missing.push('CBV_Obs_ensureSheets');
      if (typeof CBV_Obs_appendTestResult !== 'function') missing.push('CBV_Obs_appendTestResult');
      if (missing.length) return { status: 'ERROR', severity: 'ERROR', message: 'Core missing', data: { missing: missing } };
      return { status: 'OK', severity: 'OK', message: 'OK' };
    });

    runTest_('TASK_DB_ID_PRESENT', 'CBV_TASK_DB_ID present', function () {
      var id = TaskObs_getTaskDbId_();
      if (!id) return { status: 'BLOCKER', severity: 'BLOCKER', message: 'CBV_TASK_DB_ID missing', expected: 'present', actual: 'missing' };
      return { status: 'OK', severity: 'OK', message: 'OK', actual: 'present' };
    });

    runTest_('TASK_DB_OPEN_OK', 'Open TASK DB', function () {
      try {
        var ss = TaskObs_openTaskDb_();
        return { status: 'OK', severity: 'OK', message: 'OK', data: { spreadsheetId: ss.getId() } };
      } catch (e) {
        return { status: 'BLOCKER', severity: 'BLOCKER', message: 'Cannot open TASK DB', data: { error: String(e && e.message ? e.message : e), code: e && e.code ? e.code : '' } };
      }
    });

    runTest_('OBS_SCHEMA_OK', 'Ensure/report OBS schema', function () {
      if (typeof CBV_Obs_ensureSheets !== 'function') return { status: 'ERROR', severity: 'ERROR', message: 'CBV_Obs_ensureSheets missing' };
      var ensured = CBV_Obs_ensureSheets(cfg);
      if (ensured && ensured.ok) return { status: 'OK', severity: 'OK', message: 'OK' };
      return { status: 'WARN', severity: 'WARN', message: 'Schema ensure warnings', data: { ensureSheets: ensured } };
    });

    runTest_('HEALTH_OK', 'Health check', function () {
      var h = TaskObs_healthCheck();
      if (!h) return { status: 'ERROR', severity: 'ERROR', message: 'health null' };
      if (h.code === 'TASK_OBS_HEALTH_BLOCKER') return { status: 'BLOCKER', severity: 'BLOCKER', message: 'Health blockers', data: { health: h } };
      if (h.code === 'TASK_OBS_HEALTH_ERROR') return { status: 'ERROR', severity: 'ERROR', message: 'Health error', data: { health: h } };
      if (h.code === 'TASK_OBS_HEALTH_WARN') return { status: 'WARN', severity: 'WARN', message: 'Health warnings', data: { health: h } };
      return { status: 'OK', severity: 'OK', message: 'OK' };
    });

    runTest_('WRITE_FINDING_OK', 'Write finding', function () {
      if (typeof CBV_Obs_appendFinding !== 'function') return { status: 'ERROR', severity: 'ERROR', message: 'CBV_Obs_appendFinding missing' };
      var r = CBV_Obs_appendFinding(cfg, { SOURCE_TYPE: 'SELF_TEST', SOURCE_CODE: 'WRITE_FINDING_OK', SEVERITY: 'INFO', STATUS: 'OPEN', MESSAGE: 'TEST_ write finding', ACTION_REQUIRED: 'None', OWNER: actor, DATA_JSON: { test: true } });
      if (r && r.ok) return { status: 'OK', severity: 'OK', message: 'OK' };
      return { status: 'WARN', severity: 'WARN', message: 'Write finding failed', data: { result: r } };
    });

    runTest_('WRITE_AUDIT_OK', 'Write audit', function () {
      if (typeof CBV_Obs_appendAudit !== 'function') return { status: 'ERROR', severity: 'ERROR', message: 'CBV_Obs_appendAudit missing' };
      var r = CBV_Obs_appendAudit(cfg, { ENTITY_TYPE: 'TASK_OBS', ENTITY_ID: 'SELF_TEST', ACTION: 'WRITE_AUDIT', FIELD_NAME: 'STATUS', OLD_VALUE: '', NEW_VALUE: 'OK', SOURCE: 'TASK_OBS_TEST', COMMAND_ID: runId, CORRELATION_ID: '', DATA_JSON: { test: true } });
      if (r && r.ok) return { status: 'OK', severity: 'OK', message: 'OK' };
      return { status: 'WARN', severity: 'WARN', message: 'Write audit failed', data: { result: r } };
    });

    runTest_('WRITE_EVENT_TRACE_OK', 'Write event trace', function () {
      if (typeof CBV_Obs_appendEventTrace !== 'function') return { status: 'ERROR', severity: 'ERROR', message: 'CBV_Obs_appendEventTrace missing' };
      var r = CBV_Obs_appendEventTrace(cfg, { EVENT_ID: TaskObs_makeId_('EVT'), EVENT_TYPE: 'TASK_OBS_SELF_TEST', ENTITY_TYPE: 'TASK_OBS', ENTITY_ID: 'SELF_TEST', DIRECTION: 'INTERNAL', STATUS: 'OK', SOURCE_MODULE: 'TASK', TARGET_MODULE: 'TASK', CORRELATION_ID: '', IDEMPOTENCY_KEY: '', MESSAGE: 'TEST_ trace', PAYLOAD_JSON: { test: true } });
      if (r && r.ok) return { status: 'OK', severity: 'OK', message: 'OK' };
      return { status: 'WARN', severity: 'WARN', message: 'Write event trace failed', data: { result: r } };
    });

    runTest_('AI_EXPORT_BUILD_OK', 'Build AI export (local)', function () {
      var jsonObj = TaskObs_buildAiExportJson_();
      var md = TaskObs_buildAiExportMarkdown_();
      if (!jsonObj || typeof jsonObj !== 'object') return { status: 'ERROR', severity: 'ERROR', message: 'AI export JSON invalid' };
      if (!md || String(md).length < 20) return { status: 'WARN', severity: 'WARN', message: 'AI export markdown empty', data: { length: String(md || '').length } };
      return { status: 'OK', severity: 'OK', message: 'OK', data: { markdownLength: String(md).length } };
    });

    var finishedAt = TaskObs_now_();
    var durationMs = TaskObs_durationMs_(startedAt, finishedAt);
    var overall = counts.blocked > 0 ? 'BLOCKER' : (counts.failed > 0 ? 'ERROR' : (counts.warned > 0 ? 'WARN' : 'OK'));

    try {
      if (typeof CBV_Obs_appendTestRun === 'function') {
        CBV_Obs_appendTestRun(cfg, {
          RUN_ID: runId,
          RUN_TYPE: 'SELF_TEST',
          STATUS: overall,
          TOTAL_TESTS: 9,
          PASSED: counts.passed,
          WARNED: counts.warned,
          FAILED: counts.failed,
          BLOCKED: counts.blocked,
          STARTED_AT: startedAt,
          FINISHED_AT: finishedAt,
          DURATION_MS: durationMs,
          TRIGGERED_BY: actor,
          SUMMARY_JSON: { phase: 'FINISHED', counts: counts },
          NOTE: 'FINAL'
        });
      }
    } catch (e9) {
      /* swallow */
    }

    return TaskObs_stdResponse_(overall === 'OK', overall === 'OK' ? 'TASK_OBS_SELF_TEST_OK' : 'TASK_OBS_SELF_TEST_WARN', overall === 'OK' ? 'OK' : 'Self-test completed with findings', { runId: runId, status: overall, counts: counts, startedAt: startedAt, finishedAt: finishedAt, durationMs: durationMs, results: results }, null);
  } catch (e) {
    return TaskObs_stdResponse_(false, 'TASK_OBS_SELF_TEST_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function TaskObs_generateSampleData() {
  try {
    var cfg = TaskObs_getConfig();
    var actor = TaskObs_user_();
    var prefix = 'TEST_';
    if (typeof CBV_Obs_appendFinding === 'function') {
      CBV_Obs_appendFinding(cfg, { SOURCE_TYPE: 'SAMPLE', SOURCE_CODE: prefix + 'FINDING', SEVERITY: 'WARN', STATUS: 'OPEN', MESSAGE: prefix + ' sample finding', ACTION_REQUIRED: 'Review', OWNER: actor, DATA_JSON: { sample: true } });
    }
    if (typeof CBV_Obs_appendAudit === 'function') {
      CBV_Obs_appendAudit(cfg, { ENTITY_TYPE: 'TASK_OBS', ENTITY_ID: prefix + 'ENTITY', ACTION: 'SAMPLE', FIELD_NAME: 'NOTE', OLD_VALUE: '', NEW_VALUE: prefix + ' sample audit', SOURCE: 'TASK_OBS_SAMPLE', COMMAND_ID: TaskObs_makeId_('CMD'), CORRELATION_ID: '', DATA_JSON: { sample: true } });
    }
    if (typeof CBV_Obs_appendEventTrace === 'function') {
      CBV_Obs_appendEventTrace(cfg, { EVENT_ID: TaskObs_makeId_('EVT'), EVENT_TYPE: 'TASK_OBS_SAMPLE', ENTITY_TYPE: 'TASK_OBS', ENTITY_ID: prefix + 'ENTITY', DIRECTION: 'INTERNAL', STATUS: 'OK', SOURCE_MODULE: 'TASK', TARGET_MODULE: 'TASK', CORRELATION_ID: '', IDEMPOTENCY_KEY: '', MESSAGE: prefix + ' sample trace', PAYLOAD_JSON: { sample: true } });
    }
    if (typeof CBV_Obs_appendRuntimeMetric === 'function') {
      CBV_Obs_appendRuntimeMetric(cfg, { METRIC_TYPE: 'TASK_OBS', METRIC_NAME: prefix + 'SAMPLE_METRIC', METRIC_VALUE: 1, UNIT: 'count', STATUS: 'OK', SEVERITY: 'OK', DATA_JSON: { sample: true } });
    }
    return TaskObs_stdResponse_(true, 'TASK_OBS_SAMPLE_OK', 'OK', {}, null);
  } catch (e) {
    return TaskObs_stdResponse_(false, 'TASK_OBS_SAMPLE_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function TaskObs_generateAiDiagnosticExport() {
  try {
    var cfg = TaskObs_getConfig();
    var jsonObj = TaskObs_buildAiExportJson_();
    var md = TaskObs_buildAiExportMarkdown_();
    var runId = TaskObs_makeId_('RUN');

    if (typeof CBV_Obs_appendAiExport !== 'function') {
      return TaskObs_stdResponse_(false, 'TASK_OBS_CORE_MISSING', 'CBV_Obs_appendAiExport not available', {}, { code: 'CORE_MISSING', message: 'CBV_Obs_appendAiExport missing', stack: '' });
    }
    var r = CBV_Obs_appendAiExport(cfg, {
      RUN_ID: runId,
      EXPORT_TYPE: 'AI_DIAGNOSTIC',
      STATUS: 'OK',
      EXPORT_JSON: jsonObj,
      EXPORT_MARKDOWN: md,
      FILE_ID: '',
      FILE_URL: '',
      NOTE: 'sheet-only'
    });
    return TaskObs_stdResponse_(true, 'TASK_OBS_AI_EXPORT_OK', 'OK', { runId: runId, append: r }, null);
  } catch (e) {
    return TaskObs_stdResponse_(false, 'TASK_OBS_AI_EXPORT_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function TaskObs_emitSummaryToMainControl() {
  // Phase C1: stub only. No network call; returns a payload if configured.
  try {
    var url = '';
    var token = '';
    try { url = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_CONTROL_WEBAPP_URL') || '').trim(); } catch (e0) { url = ''; }
    try { token = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim(); } catch (e1) { token = ''; }
    if (!url || !token) {
      return TaskObs_stdResponse_(true, 'TASK_OBS_MAIN_CONTROL_SKIPPED', 'MAIN_CONTROL URL/token not configured (skipped)', { skipped: true, hasUrl: !!url, hasToken: !!token }, null);
    }
    var health = TaskObs_healthCheck();
    var payload = { moduleCode: 'TASK', type: 'TASK_OBS_SUMMARY', token: token, health: { ok: health.ok, code: health.code, summary: health.data && health.data.summary ? health.data.summary : {} } };
    return TaskObs_stdResponse_(true, 'TASK_OBS_MAIN_CONTROL_PAYLOAD_READY', 'Payload ready (no network call in C1)', { url: url, payload: payload }, null);
  } catch (e) {
    return TaskObs_stdResponse_(false, 'TASK_OBS_MAIN_CONTROL_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

// ---------------- private helpers ----------------

function TaskObs_addFinding_(findings, severity, code, message, data) {
  findings.push({
    severity: String(severity || 'INFO').trim().toUpperCase(),
    code: String(code || '').trim(),
    message: message != null ? String(message) : '',
    data: data || {}
  });
}

function TaskObs_countFindings_(findings) {
  var out = { info: 0, warn: 0, error: 0, blocker: 0 };
  var f = findings || [];
  for (var i = 0; i < f.length; i++) {
    var s = String(f[i].severity || '').toUpperCase();
    if (s === 'BLOCKER') out.blocker++;
    else if (s === 'ERROR') out.error++;
    else if (s === 'WARN' || s === 'WARNING') out.warn++;
    else out.info++;
  }
  return out;
}

function TaskObs_appendTestResult_(runId, testCode, testName, status, severity, message, expected, actual, data) {
  try {
    if (typeof CBV_Obs_appendTestResult !== 'function') return;
    CBV_Obs_appendTestResult(TaskObs_getConfig(), {
      RUN_ID: runId,
      TEST_CODE: String(testCode || ''),
      TEST_NAME: String(testName || ''),
      STATUS: String(status || 'OK').toUpperCase(),
      SEVERITY: String(severity || status || 'OK').toUpperCase(),
      MESSAGE: String(message || ''),
      EXPECTED: expected != null ? String(expected) : '',
      ACTUAL: actual != null ? String(actual) : '',
      DATA_JSON: data || {}
    });
  } catch (e) {
    /* swallow */
  }
}

function TaskObs_appendFindingFromTest_(runId, testCode, severity, message, data) {
  try {
    if (typeof CBV_Obs_appendFinding !== 'function') return;
    CBV_Obs_appendFinding(TaskObs_getConfig(), {
      RUN_ID: runId,
      SOURCE_TYPE: 'SELF_TEST',
      SOURCE_CODE: String(testCode || ''),
      SEVERITY: String(severity || 'WARN').toUpperCase(),
      STATUS: 'OPEN',
      MESSAGE: String(message || ''),
      ACTION_REQUIRED: 'Review and resolve',
      OWNER: TaskObs_user_(),
      DATA_JSON: data || {}
    });
  } catch (e) {
    /* swallow */
  }
}

function TaskObs_buildAiExportJson_() {
  var nowIso = TaskObs_now_();
  var by = TaskObs_user_();
  var health = null;
  try { health = TaskObs_healthCheck(); } catch (e0) { health = null; }
  return {
    meta: { moduleCode: 'TASK', generatedAt: nowIso, generatedBy: by },
    health: health || {},
    latestTestRun: {},
    findings: [],
    auditSample: [],
    eventTraceSample: [],
    recommendations: []
  };
}

function TaskObs_buildAiExportMarkdown_() {
  var o = TaskObs_buildAiExportJson_();
  var lines = [];
  lines.push('# TASK — AI Diagnostic Export');
  lines.push('');
  lines.push('GeneratedAt: ' + String(o.meta.generatedAt || ''));
  lines.push('GeneratedBy: ' + String(o.meta.generatedBy || ''));
  lines.push('');
  var h = o.health || {};
  var hs = h && h.data && h.data.summary ? h.data.summary : null;
  lines.push('## Health');
  lines.push('- code: ' + String(h.code || ''));
  lines.push('- ok: ' + String(!!h.ok));
  if (hs) lines.push('- summary: info=' + hs.info + ' warn=' + hs.warn + ' error=' + hs.error + ' blocker=' + hs.blocker);
  lines.push('');
  lines.push('## Raw JSON (copy/paste)');
  lines.push('```json');
  lines.push(TaskObs_safeJson_(o));
  lines.push('```');
  return lines.join('\n');
}

function TaskObs_safeJson_(obj) {
  try {
    if (typeof cbvCoreV2SafeStringify_ === 'function') return cbvCoreV2SafeStringify_(obj);
  } catch (e0) {
    /* ignore */
  }
  try {
    return JSON.stringify(obj == null ? {} : obj, null, 2);
  } catch (e1) {
    return '{}';
  }
}

function TaskObs_safeText_(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return String(obj);
  }
}

function TaskObs_makeId_(prefix) {
  var p = String(prefix || 'TASK').trim().toUpperCase();
  try {
    return p + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
  } catch (e) {
    return p + '_' + String(new Date().getTime());
  }
}

function TaskObs_durationMs_(startedIso, finishedIso) {
  try {
    var a = new Date(String(startedIso || ''));
    var b = new Date(String(finishedIso || ''));
    var ms = b.getTime() - a.getTime();
    return isFinite(ms) ? ms : '';
  } catch (e) {
    return '';
  }
}

