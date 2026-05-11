/**
 * CBV Test Console Runtime V2 — orchestration (TEST → VERIFY → REPORT).
 */

/**
 * @param {string} suiteCode
 * @returns {Object} ctx for CBV_TestConsole_buildReportEnvelope_
 */
function CBV_TestConsole_runTestSuite_(suiteCode, traceIdOverride) {
  var suite = String(suiteCode || '').trim().toUpperCase();
  if (typeof CBV_TestConsole_registerDefaultSuites_ === 'function' && typeof CBV_TestConsole_getSuite_ === 'function' && typeof CBV_TestConsole_runRegisteredSuite_ === 'function') {
    CBV_TestConsole_registerDefaultSuites_();
    var reg = CBV_TestConsole_getSuite_(suite);
    if (reg && reg.enabled) {
      return CBV_TestConsole_runRegisteredSuite_(suite, traceIdOverride);
    }
  }
  var traceId = traceIdOverride ? String(traceIdOverride) : CBV_TestConsole_newTraceId_();
  var checkedAt = CBV_TestConsole_isoNow_();
  var runBy = CBV_TestConsole_runBy_();
  var checks = [];
  var warnings = [];
  var errors = [];
  var raw = null;
  var summary = '';

  function addCheck(code, ok, severity, message, detail) {
    checks.push({
      code: String(code || ''),
      ok: !!ok,
      severity: String(severity || 'OK').toUpperCase(),
      message: String(message || ''),
      detail: detail != null ? detail : ''
    });
  }

  function mapMcObsResult(res) {
    raw = res;
    if (!res) {
      errors.push('MC_OBS: null response');
      addCheck('MC_OBS_RESPONSE', false, 'ERROR', 'Null response', {});
      summary = 'MC OBS suite returned no response';
      return;
    }
    var ost = String(res.data && res.data.status ? res.data.status : '').toUpperCase();
    var topOk = ost === 'OK' || (ost === '' && res.ok !== false);
    var topSev = 'OK';
    if (ost === 'WARN') {
      topSev = 'WARNING';
      topOk = false;
    } else if (ost === 'ERROR') {
      topSev = 'ERROR';
      topOk = false;
    } else if (ost === 'BLOCKER') {
      topSev = 'CRITICAL';
      topOk = false;
    } else if (res.ok === false && ost === '') {
      topSev = 'ERROR';
      topOk = false;
    }
    if (!topOk && topSev !== 'WARNING') {
      errors.push(String(res.message || 'MC_OBS failed'));
    }
    addCheck('MC_OBS_TOP', topOk, topSev, String(res.message || (topOk ? 'OK' : 'Completed with findings')), res);
    var results = res.data && res.data.results ? res.data.results : [];
    var i;
    for (i = 0; i < results.length; i++) {
      var row = results[i] || {};
      var st = String(row.status || '').toUpperCase();
      var sev = 'OK';
      var cok = st === 'OK';
      if (st === 'WARN') {
        sev = 'WARNING';
        cok = false;
      } else if (st === 'ERROR') {
        sev = 'ERROR';
        cok = false;
      } else if (st === 'BLOCKER') {
        sev = 'CRITICAL';
        cok = false;
      } else if (st === 'SKIPPED') {
        sev = 'WARNING';
        cok = false;
      }
      addCheck(String(row.testCode || 'TEST_' + i), cok, sev, String(row.message || ''), row);
    }
    summary = 'MC OBS ' + suite + ': ' + String(res.message || (topOk ? 'OK' : 'Completed with issues'));
  }

  try {
    if (suite === 'MC_OBS_SELF_TEST') {
      if (typeof MC_Obs_runSelfTest !== 'function') {
        errors.push('MC_Obs_runSelfTest missing');
        addCheck('MC_OBS_SELF_TEST', false, 'ERROR', 'MC_Obs_runSelfTest missing', {});
        summary = 'Missing MC_Obs_runSelfTest';
      } else {
        mapMcObsResult(MC_Obs_runSelfTest());
      }
    } else if (suite === 'MC_OBS_SMOKE_TEST') {
      if (typeof MC_Obs_runSmokeTest !== 'function') {
        errors.push('MC_Obs_runSmokeTest missing');
        addCheck('MC_OBS_SMOKE_TEST', false, 'ERROR', 'MC_Obs_runSmokeTest missing', {});
        summary = 'Missing MC_Obs_runSmokeTest';
      } else {
        mapMcObsResult(MC_Obs_runSmokeTest());
      }
    } else if (suite === 'MC_OBS_SCHEMA_TEST') {
      if (typeof MC_Obs_runSchemaTest !== 'function') {
        errors.push('MC_Obs_runSchemaTest missing');
        addCheck('MC_OBS_SCHEMA_TEST', false, 'ERROR', 'MC_Obs_runSchemaTest missing', {});
        summary = 'Missing MC_Obs_runSchemaTest';
      } else {
        mapMcObsResult(MC_Obs_runSchemaTest());
      }
    } else if (suite === 'CBV_CORE_V2_SELF_TEST') {
      if (typeof CBV_CoreV2_selfTest !== 'function') {
        errors.push('CBV_CoreV2_selfTest missing');
        addCheck('CBV_CORE_V2_SELF_TEST', false, 'ERROR', 'CBV_CoreV2_selfTest missing', {});
        summary = 'Missing CBV_CoreV2_selfTest';
      } else {
        raw = CBV_CoreV2_selfTest();
        var okC = !!(raw && raw.ok);
        if (!okC) errors.push(String(raw && raw.message ? raw.message : 'Core V2 self test failed'));
        addCheck('CBV_CORE_V2_TOP', okC, okC ? 'OK' : 'ERROR', String(raw && raw.message ? raw.message : ''), raw);
        var steps = raw && raw.data && raw.data.steps ? raw.data.steps : [];
        var j;
        for (j = 0; j < steps.length; j++) {
          var s = steps[j] || {};
          var sok = !!s.ok;
          addCheck(String(s.name || 'step_' + j), sok, sok ? 'OK' : 'ERROR', String(s.detail || s.name || ''), s);
        }
        summary = String(raw && raw.message ? raw.message : 'Core V2 self test');
      }
    } else if (suite === 'CBV_L6_SELF_TEST') {
      if (typeof CBV_L6_hardeningSelfTest !== 'function') {
        errors.push('CBV_L6_hardeningSelfTest missing');
        addCheck('CBV_L6_SELF_TEST', false, 'ERROR', 'CBV_L6_hardeningSelfTest missing', {});
        summary = 'Missing CBV_L6_hardeningSelfTest';
      } else {
        raw = CBV_L6_hardeningSelfTest();
        var okL = !!(raw && raw.ok);
        if (!okL) errors.push('Level 6 hardening self-test reported failures');
        addCheck('CBV_L6_TOP', okL, okL ? 'OK' : 'ERROR', okL ? 'OK' : 'FAIL', raw);
        var stL = raw && raw.steps ? raw.steps : [];
        var k;
        for (k = 0; k < stL.length; k++) {
          var t = stL[k] || {};
          var tok = !!t.ok;
          addCheck(String(t.name || 'l6_' + k), tok, tok ? 'OK' : 'ERROR', String(t.message || ''), t);
        }
        summary = okL ? 'Level 6 hardening self-test passed' : 'Level 6 hardening self-test failed';
      }
    } else if (suite === 'TEST_CONSOLE_DRIVE_EXPORTER_SELF_TEST') {
      raw = CBV_TestConsole_DriveExporter_selfTest();
      var okD = !!(raw && raw.ok);
      if (!okD) errors.push(String(raw && raw.message ? raw.message : 'Drive exporter self-test failed'));
      addCheck('DRIVE_EXPORTER_SELF_TEST', okD, okD ? 'OK' : 'ERROR', String(raw && raw.message ? raw.message : ''), raw);
      summary = 'Drive exporter self-test';
    } else if (suite === 'TEST_CONSOLE_RUNTIME_SELF_TEST') {
      raw = CBV_TestConsole_Runtime_selfTest();
      var okR = !!(raw && raw.ok);
      if (!okR) errors.push(String(raw && raw.message ? raw.message : 'Runtime self-test failed'));
      addCheck('RUNTIME_SELF_TEST', okR, okR ? 'OK' : 'ERROR', String(raw && raw.message ? raw.message : ''), raw);
      summary = 'Runtime self-test';
    } else {
      errors.push('Unknown suite: ' + suite);
      addCheck('UNKNOWN_SUITE', false, 'ERROR', 'Unknown suite: ' + suite, { suite: suite });
      summary = 'Unknown test suite code';
    }
  } catch (e) {
    var msg = String(e && e.message ? e.message : e);
    errors.push(msg);
    addCheck('SUITE_EXCEPTION', false, 'ERROR', msg, { stack: String(e && e.stack ? e.stack : '') });
    summary = 'Suite threw exception';
  }

  var maxRank = 0;
  var anyNotOk = false;
  var i2;
  for (i2 = 0; i2 < checks.length; i2++) {
    var ck = checks[i2] || {};
    var rk = CBV_TestConsole_severityRank_(ck.severity);
    if (rk > maxRank) maxRank = rk;
    if (!ck.ok) anyNotOk = true;
  }
  var preliminaryOk = !(maxRank >= 3 || errors.length > 0);

  return {
    phase: CBV_TEST_CONSOLE_DEFAULT_PHASE_,
    testSuite: suite,
    traceId: traceId,
    checkedAt: checkedAt,
    runBy: runBy,
    summary: summary,
    checks: checks,
    warnings: warnings,
    errors: errors,
    rawSuiteResult: raw,
    ok: preliminaryOk
  };
}

/**
 * VERIFY + BUILD REPORT envelope from ctx.
 * @param {Object} ctx
 * @returns {Object} full report
 */
function CBV_TestConsole_buildReportEnvelope_(ctx) {
  var c = ctx || {};
  var checks = Array.isArray(c.checks) ? c.checks.slice() : [];
  var warnings = Array.isArray(c.warnings) ? c.warnings.slice() : [];
  var errors = Array.isArray(c.errors) ? c.errors.slice() : [];

  var maxRank = 0;
  var anyNotOk = false;
  var i;
  for (i = 0; i < checks.length; i++) {
    var ck = checks[i] || {};
    var rk = CBV_TestConsole_severityRank_(ck.severity);
    if (rk > maxRank) maxRank = rk;
    if (!ck.ok) anyNotOk = true;
  }

  var status = 'GO';
  var ok = true;
  if (maxRank >= 3) {
    status = 'FAIL';
    ok = false;
  } else if (maxRank >= 2 || anyNotOk) {
    status = 'GO_WITH_WARNINGS';
    ok = true;
  }

  var severity = 'OK';
  if (maxRank >= 4) severity = 'CRITICAL';
  else if (maxRank >= 3) severity = 'ERROR';
  else if (maxRank >= 2 || anyNotOk) severity = 'WARNING';

  var nextStep = 'Review checks and attach `traceId` to any follow-up work.';
  if (status === 'FAIL') {
    nextStep = 'Do not promote: remediate ERROR/CRITICAL checks, then re-run the same suite from 🧪 CBV Test Console.';
  } else if (status === 'GO_WITH_WARNINGS') {
    nextStep = 'Proceed with caution: resolve WARNING items on the next maintenance window.';
  } else {
    nextStep = 'Green baseline: keep monitoring; schedule the next routine test run.';
  }

  var report = {
    ok: ok,
    phase: String(c.phase != null ? c.phase : CBV_TEST_CONSOLE_DEFAULT_PHASE_),
    status: status,
    checkedAt: String(c.checkedAt != null ? c.checkedAt : CBV_TestConsole_isoNow_()),
    runBy: String(c.runBy != null ? c.runBy : CBV_TestConsole_runBy_()),
    traceId: String(c.traceId != null ? c.traceId : CBV_TestConsole_newTraceId_()),
    testSuite: String(c.testSuite != null ? c.testSuite : ''),
    summary: String(c.summary != null ? c.summary : ''),
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: nextStep,
    severity: severity,
    reportText: '',
    reportJson: '',
    contractVersion: CBV_TEST_CONSOLE_CONTRACT_VERSION,
    envelopeOk: false
  };

  var slim = {
    ok: report.ok,
    phase: report.phase,
    status: report.status,
    checkedAt: report.checkedAt,
    runBy: report.runBy,
    traceId: report.traceId,
    testSuite: report.testSuite,
    summary: report.summary,
    checks: report.checks,
    warnings: report.warnings,
    errors: report.errors,
    nextStep: report.nextStep,
    severity: report.severity,
    contractVersion: report.contractVersion
  };
  try {
    report.reportJson = JSON.stringify(slim, null, 2);
  } catch (e0) {
    report.reportJson = '{}';
  }
  report.reportText = CBV_TestConsole_buildReportMarkdown_(report);

  var v = CBV_TestConsole_validateReportEnvelope_(report);
  report.envelopeOk = v.envelopeOk;
  if (!v.envelopeOk) {
    report.warnings.push('ENVELOPE_VALIDATION: ' + (v.errors || []).join(', '));
  }

  return report;
}

/**
 * @param {Object} report
 */
function CBV_TestConsole_showReportDialog_(report) {
  var r = report || {};
  var txt = String(r.reportText || CBV_TestConsole_buildReportMarkdown_(r));
  var t = HtmlService.createTemplateFromFile('CBV_TEST_CONSOLE_REPORT_DIALOG');
  t.reportText = txt;
  SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(920).setHeight(680), 'CBV Test Console — Report');
}

/**
 * @param {string} prompt
 */
function CBV_TestConsole_showAiHandoffDialog_(prompt) {
  var t = HtmlService.createTemplateFromFile('CBV_TEST_CONSOLE_AI_HANDOFF_DIALOG');
  t.promptText = String(prompt || '');
  SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(920).setHeight(680), 'CBV Test Console — AI Handoff');
}

/**
 * End-to-end operational flow (no menu side-effects).
 * @param {string} suiteCode
 * @returns {{ report: Object, aiHandoff: string }}
 */
function CBV_TestConsole_runFullOperationalFlow_(suiteCode) {
  var ctx = CBV_TestConsole_runTestSuite_(suiteCode);
  var report = CBV_TestConsole_buildReportEnvelope_(ctx);
  CBV_TestConsole_appendReportSheet_(report);
  CBV_TestConsole_exportReportToDrive_(report);
  var aiHandoff = CBV_TestConsole_buildAiHandoffPrompt_(report);
  return { report: report, aiHandoff: aiHandoff };
}
