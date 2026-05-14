/**
 * PHASE_97 — WebApp Staff Trial / Feedback Capture — Test Console
 * Standard: CBV_TCS_V1
 *
 * Menu: 🧪 CBV Test Console → Phase 97 — Staff Trial
 */

var __CBV_WEBAPP_STAFF_TRIAL_TC_LAST_REPORT = null;
var __CBV_WEBAPP_STAFF_TRIAL_TC_LAST_REPORT_PROP_KEY = 'CBV_WEBAPP_STAFF_TRIAL_TC_LAST_REPORT_JSON';

var CBV_WEBAPP_STAFF_TRIAL_TC_HANDOFF = [
  'PHASE 97 — Staff Trial Execution / Feedback Capture',
  '',
  'Pilot only: read-first WebApp; append-only feedback sheet CBV_WEBAPP_UAT_FEEDBACK.',
  'No business mutation. No AppSheet Bot. No AI runtime decisions.',
  '',
  'Runtime: 998J — CbvWebAppStaffTrial_*',
  'After FAIL: no phase jump; fix trial blockers first (CBV_TCS_V1).'
].join('\n');

function CbvWebAppStaffTrial_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function (k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvWebAppStaffTrial_TestConsole__storeLatestReport_(report) {
  try {
    __CBV_WEBAPP_STAFF_TRIAL_TC_LAST_REPORT = report;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_WEBAPP_STAFF_TRIAL_TC_LAST_REPORT_PROP_KEY, JSON.stringify(report || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvWebAppStaffTrial_TestConsole__getLatestReport_() {
  if (__CBV_WEBAPP_STAFF_TRIAL_TC_LAST_REPORT) return __CBV_WEBAPP_STAFF_TRIAL_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_WEBAPP_STAFF_TRIAL_TC_LAST_REPORT_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_WEBAPP_STAFF_TRIAL_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

function CbvWebAppStaffTrial_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WS97_')
    : ('WS97_' + new Date().getTime());

  var checks = [];
  var warnings = [];
  var errors = [];

  function addCheck(code, ok, severity, message, detail) {
    var sev;
    if (ok) sev = severity || 'OK';
    else {
      if (severity === 'WARNING' || severity === 'ERROR' || severity === 'CRITICAL') sev = severity;
      else sev = 'ERROR';
    }
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
    if (!ok && (sev === 'ERROR' || sev === 'CRITICAL')) errors.push(message);
    if (!ok && sev === 'WARNING') warnings.push(message);
  }

  addCheck('RUNTIME_VALIDATE', typeof CbvWebAppStaffTrial_validate === 'function', 'OK', 'CbvWebAppStaffTrial_validate exists', {});
  addCheck('RUNTIME_ENSURE', typeof CbvWebAppStaffTrial_ensureSchema === 'function', 'OK', 'CbvWebAppStaffTrial_ensureSchema exists', {});
  addCheck('RUNTIME_CREATE', typeof CbvWebAppStaffTrial_createFeedback === 'function', 'OK', 'CbvWebAppStaffTrial_createFeedback exists', {});
  addCheck('RUNTIME_LIST', typeof CbvWebAppStaffTrial_listRecentFeedback === 'function', 'OK', 'CbvWebAppStaffTrial_listRecentFeedback exists', {});
  addCheck('RUNTIME_HANDOFF', typeof CbvWebAppStaffTrial_buildHandoffPrompt === 'function', 'OK', 'CbvWebAppStaffTrial_buildHandoffPrompt exists', {});

  addCheck('ROUTE961_BUILD', typeof CbvWebAppRouteUrl_build === 'function', 'OK', 'Phase 96.1 CbvWebAppRouteUrl_build present', {});
  try {
    var u = (typeof CbvWebAppRouteUrl_build === 'function') ? CbvWebAppRouteUrl_build('/workspace') : '';
    addCheck('ROUTE961_SAMPLE', u.indexOf('?route=') >= 0 && u.indexOf('googleusercontent.com') < 0, 'OK', 'Sample build uses ?route= and avoids googleusercontent', { sample: u });
  } catch (eU) {
    addCheck('ROUTE961_SAMPLE', false, 'WARNING', String(eU), {});
  }

  var vd = null;
  try {
    vd = CbvWebAppStaffTrial_validate();
    if (vd && vd.warnings) warnings = warnings.concat(vd.warnings);
    if (vd && vd.errors) errors = errors.concat(vd.errors);
    addCheck('STAFF_TRIAL_VALIDATE', vd && vd.ok === true, vd && vd.ok ? 'OK' : 'ERROR', 'CbvWebAppStaffTrial_validate', { detail: vd ? vd.data : null });
  } catch (eV) {
    addCheck('STAFF_TRIAL_VALIDATE', false, 'CRITICAL', String(eV), {});
  }

  var low = (CBV_WEBAPP_STAFF_TRIAL_TC_HANDOFF || '').toLowerCase();
  addCheck('NO_PROD_READY_PHRASE', low.indexOf('production ready') < 0 && low.indexOf('prod ready') < 0, 'OK', 'TC handoff snippet has no production-ready shorthand claim.', {});

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_WEBAPP_STAFF_TRIAL_PHASE_ID,
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_WEBAPP_STAFF_TRIAL_PHASE_97',
    summary: 'Staff Trial (Phase 97): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix Phase 97 errors (sheet headers, 998H load order, namespace mutation probe) and rerun.'
      : 'Run staff trial per WEBAPP_STAFF_TRIAL_RUNBOOK_VI.md; append feedback; triage per matrix.',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: CBV_WEBAPP_STAFF_TRIAL_CONTRACT_VERSION,
    envelopeOk: false
  };

  var env = CbvWebAppStaffTrial_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 97 — STAFF TRIAL / FEEDBACK CAPTURE ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId
  ].join('\n');

  CbvWebAppStaffTrial_TestConsole__storeLatestReport_(report);
  try { Logger.log(report.reportText); } catch (eLog) { /* ignore */ }
  return report;
}

function CbvWebAppStaffTrial_TestConsole__alert_(title, payload) {
  var s = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert(title, s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CbvWebAppStaffTrial_TestConsole_showRunbook() {
  var rb = CbvWebAppStaffTrial_getRunbook();
  var md = rb && rb.data && rb.data.markdownVi ? rb.data.markdownVi : String(rb);
  CbvWebAppStaffTrial_TestConsole__alert_('Phase 97 — Runbook (VI)', md);
  return { ok: true };
}

function CbvWebAppStaffTrial_TestConsole_showFeedbackSchema() {
  CbvWebAppStaffTrial_TestConsole__alert_('Phase 97 — Feedback schema', CbvWebAppStaffTrial_getFeedbackSchema().data || {});
  return { ok: true };
}

function CbvWebAppStaffTrial_TestConsole_showTriageMatrix() {
  CbvWebAppStaffTrial_TestConsole__alert_('Phase 97 — Triage matrix', CbvWebAppStaffTrial_getTriageMatrix().data || {});
  return { ok: true };
}

function CbvWebAppStaffTrial_TestConsole_copyAiHandoffPrompt() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var text = CbvWebAppStaffTrial_buildHandoffPrompt({});
  var esc = JSON.stringify(text);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:320px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + esc + ';document.getElementById("t").value=DATA;function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(580).setHeight(440), 'Phase 97 — AI handoff prompt');
  return { ok: true };
}

function CbvWebAppStaffTrial_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvWebAppStaffTrial_TestConsole__getLatestReport_();
  if (!r) {
    ui.alert('No report', 'Run Staff Trial Health Check first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 97 — copy report');
  return { ok: true };
}
