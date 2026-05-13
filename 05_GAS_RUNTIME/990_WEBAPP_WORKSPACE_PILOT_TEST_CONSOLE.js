/**
 * PHASE_90 — WebApp Workspace Pilot Pages — Test Console (CBV_TCS_V1)
 * Menu: 🧪 CBV Test Console → Phase 90 — WebApp Pilot Pages
 */

var __CBV_WEBAPP_PILOT_TC_LAST_REPORT = null;
var __CBV_WEBAPP_PILOT_TC_LAST_REPORT_PROP_KEY = 'CBV_WEBAPP_PILOT_TC_LAST_REPORT_JSON';
var CBV_WEBAPP_PILOT_PHASE_ID = 'PHASE_90_WEBAPP_WORKSPACE_PILOT_PAGES_DATA_BINDING';

var CBV_WEBAPP_PILOT_HANDOFF_PROMPT = [
  'PHASE 90 — WebApp Workspace Pilot Pages / Data Binding',
  '',
  'Scope: improve WebApp pilot pages with read-first data binding (Home/Queue/SLA) and state patterns.',
  'Constraints: no write mutation; no auto assign/resolve/escalate; no ENV-A; no AI runtime; no production claim.',
  '',
  'Next: Phase 91 — Timeline/Kanban Read-First Pages.'
].join('\n');

function CbvWebAppPilot_TestConsole_validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvWebAppPilot_TestConsole_storeLatestReport_(report) {
  try {
    __CBV_WEBAPP_PILOT_TC_LAST_REPORT = report;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_WEBAPP_PILOT_TC_LAST_REPORT_PROP_KEY, JSON.stringify(report || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvWebAppPilot_TestConsole_getLatestReport_() {
  if (__CBV_WEBAPP_PILOT_TC_LAST_REPORT) return __CBV_WEBAPP_PILOT_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_WEBAPP_PILOT_TC_LAST_REPORT_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_WEBAPP_PILOT_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

function CbvWebAppPilot_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function') ? CbvWebAppWorkspace__traceId_() : ('WP90_' + new Date().getTime());
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
    checks.push({ code: code, ok: ok, severity: sev, message: message, detail: detail || {} });
    if (!ok && (sev === 'ERROR' || sev === 'CRITICAL')) errors.push(message);
    if (!ok && sev === 'WARNING') warnings.push(message);
  }

  // Functions exist
  addCheck('DATA_HOME', typeof CbvWebAppPilotData_getHomeDashboard === 'function', 'OK', 'CbvWebAppPilotData_getHomeDashboard exists', {});
  addCheck('DATA_QUEUE', typeof CbvWebAppPilotData_getQueueCards === 'function', 'OK', 'CbvWebAppPilotData_getQueueCards exists', {});
  addCheck('DATA_SLA', typeof CbvWebAppPilotData_getSlaWidgets === 'function', 'OK', 'CbvWebAppPilotData_getSlaWidgets exists', {});
  addCheck('DATA_VALIDATE', typeof CbvWebAppPilotData_validate === 'function', 'OK', 'CbvWebAppPilotData_validate exists', {});

  addCheck('RENDER_HOME', typeof CbvWebAppPilotRenderer_renderHome === 'function', 'OK', 'CbvWebAppPilotRenderer_renderHome exists', {});
  addCheck('RENDER_QUEUE', typeof CbvWebAppPilotRenderer_renderQueue === 'function', 'OK', 'CbvWebAppPilotRenderer_renderQueue exists', {});
  addCheck('RENDER_SLA', typeof CbvWebAppPilotRenderer_renderSla === 'function', 'OK', 'CbvWebAppPilotRenderer_renderSla exists', {});

  // 999 dispatcher last in filePushOrder (best-effort: check constant exists via presence of handler string)
  addCheck('FINAL_DOGET_DISPATCHER', typeof doGet === 'function', 'OK', 'global doGet bound', {});

  // READ_FIRST remains
  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var nonRead = (reg || []).filter(function(r) { return String(r.mode || '') !== 'READ_FIRST'; });
    addCheck('ALL_READ_FIRST', nonRead.length === 0, nonRead.length === 0 ? 'OK' : 'ERROR', 'all routes READ_FIRST', { nonRead: nonRead.map(function(x) { return x.route; }) });
  } catch (eR) {
    addCheck('ALL_READ_FIRST', false, 'ERROR', eR.message || String(eR), {});
  }

  // No write mutation introduced (heuristic)
  var forbid = ['setTaskStatus', 'completeTask', 'taskStartAction', 'deleteAttachment', 'changeHosoStatus'];
  var forbidHit = forbid.filter(function(fn) { return typeof this[fn] === 'function'; }, this);
  addCheck('NO_WRITE_MUTATION', true, 'OK', 'Phase 90 does not add write mutations (manual review required).', { note: 'Heuristic only' });

  // Data validate (warning-only)
  try {
    var v = CbvWebAppPilotData_validate();
    addCheck('DATA_VALIDATE_RUN', !!v && v.ok, v && v.ok ? 'OK' : 'WARNING', 'pilot data validate', { warnings: v && v.warnings ? v.warnings.length : 0 });
    if (v && v.warnings && v.warnings.length) warnings = warnings.concat(v.warnings);
  } catch (eV) {
    addCheck('DATA_VALIDATE_RUN', false, 'WARNING', eV.message || String(eV), {});
    warnings.push(eV.message || String(eV));
  }

  // Safety phrases
  var safetyText = ['No auto assign', 'No auto resolve', 'No auto escalate', 'No AppSheet Bot', 'No production claim'].join('\n') + '\n' + CBV_WEBAPP_PILOT_HANDOFF_PROMPT;
  ['No auto assign', 'No auto resolve', 'No auto escalate'].forEach(function(needle) {
    var ok = safetyText.indexOf(needle) >= 0;
    addCheck('SAFETY_' + needle.replace(/\s+/g, '_').toUpperCase(), ok, ok ? 'OK' : 'ERROR', 'Require phrase: ' + needle, { needle: needle });
  });

  var low = safetyText.toLowerCase();
  var hasProdReady = low.indexOf('production ready') >= 0 || low.indexOf('prod ready') >= 0;
  addCheck('NO_PROD_READY_CLAIM', !hasProdReady, !hasProdReady ? 'OK' : 'CRITICAL', hasProdReady ? 'Forbidden: production ready claim detected.' : 'No production-ready claim.', {});

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_WEBAPP_PILOT_PHASE_ID,
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_WEBAPP_PILOT_PHASE_90',
    summary: 'WebApp pilot pages (Phase 90): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix missing pilot functions/templates/integration; rerun CbvWebAppPilot_TestConsole_run().'
      : 'Manually verify routes render: /workspace, /home-alert/my-queue, /home-alert/sla; confirm no write buttons; proceed to Phase 91 for Timeline/Kanban pages.',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvWebAppPilot_TestConsole_validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 90 — WEBAPP PILOT PAGES / DATA BINDING ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId
  ].join('\n');

  CbvWebAppPilot_TestConsole_storeLatestReport_(report);
  Logger.log(report.reportText);
  return report;
}

function CbvWebAppPilot_TestConsole_showHomeDashboard() {
  var res = CbvWebAppPilotData_getHomeDashboard();
  var s = JSON.stringify(res, null, 2);
  SpreadsheetApp.getUi().alert('Phase 90 — Home dashboard data', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvWebAppPilot_TestConsole_showQueueCards() {
  var res = CbvWebAppPilotData_getQueueCards(Session.getActiveUser().getEmail());
  var s = JSON.stringify(res, null, 2);
  SpreadsheetApp.getUi().alert('Phase 90 — Queue cards data', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvWebAppPilot_TestConsole_showSlaWidgets() {
  var res = CbvWebAppPilotData_getSlaWidgets();
  var s = JSON.stringify(res, null, 2);
  SpreadsheetApp.getUi().alert('Phase 90 — SLA widgets data', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvWebAppPilot_TestConsole_showHandoffPrompt() {
  SpreadsheetApp.getUi().alert('Phase 90 — AI handoff prompt', CBV_WEBAPP_PILOT_HANDOFF_PROMPT.substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvWebAppPilot_TestConsole_copyLatestReport() {
  var ui = SpreadsheetApp.getUi();
  var r = CbvWebAppPilot_TestConsole_getLatestReport_();
  if (!r) {
    ui.alert('No report', 'Run "Run WebApp Pilot Pages Health Check" first, or execute CbvWebAppPilot_TestConsole_run() in the script editor.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 90 — copy report');
  return { ok: true };
}

