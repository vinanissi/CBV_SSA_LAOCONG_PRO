/**
 * PHASE_89 — WebApp Operational Workspace Skeleton — Test Console (CBV_TCS_V1)
 * Menu: 🧪 CBV Test Console → Phase 89 — WebApp Workspace
 */

var __CBV_WEBAPP_WS_TC_LAST_REPORT = null;
var __CBV_WEBAPP_WS_TC_LAST_REPORT_PROP_KEY = 'CBV_WEBAPP_WS_TC_LAST_REPORT_JSON';

var CBV_WEBAPP_WS_HANDOFF_PROMPT = [
  'PHASE 89 — WebApp Operational Workspace Skeleton',
  '',
  'This phase provides a read-first WebApp skeleton: route registry + dispatcher + HTML shell + read-first APIs.',
  '',
  'Rules:',
  '- No destructive writes.',
  '- No uncontrolled automation.',
  '- No AppSheet Bot.',
  '- No auto assign.',
  '- No auto resolve.',
  '- No auto escalate.',
  '- No production claim.',
  '',
  'Next: Phase 90 — WebApp Workspace Pilot Pages / Data Binding (still manual-first).'
].join('\n');

function CbvWebAppWorkspace_TestConsole_validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvWebAppWorkspace_TestConsole_storeLatestReport_(report) {
  try {
    __CBV_WEBAPP_WS_TC_LAST_REPORT = report;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_WEBAPP_WS_TC_LAST_REPORT_PROP_KEY, JSON.stringify(report || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvWebAppWorkspace_TestConsole_getLatestReport_() {
  if (__CBV_WEBAPP_WS_TC_LAST_REPORT) return __CBV_WEBAPP_WS_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_WEBAPP_WS_TC_LAST_REPORT_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_WEBAPP_WS_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

function CbvWebAppWorkspace_TestConsole_run() {
  var traceId = CbvWebAppWorkspace__traceId_();
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

  // Registry
  var reg = null;
  try {
    reg = CbvWebAppWorkspace_routeRegistry();
    addCheck('ROUTE_REGISTRY', !!(reg && reg.length >= 6), reg && reg.length >= 6 ? 'OK' : 'ERROR', 'routeRegistry present', { count: reg ? reg.length : 0 });
  } catch (e0) {
    addCheck('ROUTE_REGISTRY', false, 'ERROR', e0.message || String(e0), {});
  }

  // Required routes
  var required = [
    '/workspace',
    '/home-alert/my-queue',
    '/home-alert/sla',
    '/home-alert/timeline',
    '/home-alert/kanban',
    '/runtime/health',
    '/reports',
    '/admin/reference'
  ];
  var have = {};
  (reg || []).forEach(function(r) { have[String(r.route)] = true; });
  required.forEach(function(rt) {
    addCheck('ROUTE_' + rt, !!have[rt], !!have[rt] ? 'OK' : 'ERROR', 'required route exists', { route: rt });
  });

  // All READ_FIRST
  var nonRead = (reg || []).filter(function(r) { return String(r.mode || '').trim() !== 'READ_FIRST'; });
  addCheck('ALL_READ_FIRST', nonRead.length === 0, nonRead.length === 0 ? 'OK' : 'ERROR', 'all routes READ_FIRST', { nonRead: nonRead.map(function(x) { return x.route; }) });

  // API surface exists
  addCheck('API_REGISTRY', typeof CbvWebAppWorkspace_getRouteRegistry === 'function', 'OK', 'CbvWebAppWorkspace_getRouteRegistry exists', {});
  addCheck('API_GET_ROUTE', typeof CbvWebAppWorkspace_getRoute === 'function', 'OK', 'CbvWebAppWorkspace_getRoute exists', {});
  addCheck('API_HOME', typeof CbvWebAppWorkspace_getHomeSummary === 'function', 'OK', 'CbvWebAppWorkspace_getHomeSummary exists', {});
  addCheck('API_QUEUE', typeof CbvWebAppWorkspace_getMyQueueSummary === 'function', 'OK', 'CbvWebAppWorkspace_getMyQueueSummary exists', {});
  addCheck('API_SLA', typeof CbvWebAppWorkspace_getSlaSummary === 'function', 'OK', 'CbvWebAppWorkspace_getSlaSummary exists', {});
  addCheck('API_HEALTH', typeof CbvWebAppWorkspace_getRuntimeHealthSummary === 'function', 'OK', 'CbvWebAppWorkspace_getRuntimeHealthSummary exists', {});
  addCheck('API_VALIDATE', typeof CbvWebAppWorkspace_validate === 'function', 'OK', 'CbvWebAppWorkspace_validate exists', {});

  // Renderer surface exists
  addCheck('RENDER_DOGET', typeof CbvWebAppWorkspace_doGet === 'function', 'OK', 'CbvWebAppWorkspace_doGet exists', {});
  addCheck('RENDER_RENDER', typeof CbvWebAppWorkspace_render === 'function', 'OK', 'CbvWebAppWorkspace_render exists', {});

  // HTML templates existence (best-effort)
  function checkHtml(name) {
    try {
      HtmlService.createHtmlOutputFromFile('html/' + name);
      addCheck('HTML_' + name, true, 'OK', 'HTML template present', {});
    } catch (eH) {
      addCheck('HTML_' + name, false, 'WARNING', 'HTML template not available (manual verify if needed)', { error: eH.message || String(eH) });
      warnings.push('Missing HTML template: ' + name);
    }
  }
  checkHtml('WEBAPP_WORKSPACE_SHELL');
  checkHtml('WEBAPP_WORKSPACE_HOME');
  checkHtml('WEBAPP_WORKSPACE_QUEUE');
  checkHtml('WEBAPP_WORKSPACE_SLA');
  checkHtml('WEBAPP_WORKSPACE_PLACEHOLDER');

  // Safety phrases
  var safetyText = CBV_WEBAPP_WS_SAFETY_PHRASES.join('\n') + '\n' + CBV_WEBAPP_WS_HANDOFF_PROMPT;
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
    phase: CBV_WEBAPP_WS_PHASE_ID,
    status: status,
    checkedAt: CbvWebAppWorkspace__now_(),
    runBy: CbvWebAppWorkspace__actor_(),
    traceId: traceId,
    testSuite: 'CBV_WEBAPP_WORKSPACE_PHASE_89',
    summary: 'WebApp workspace skeleton: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix missing routes/API/renderer/html; rerun CbvWebAppWorkspace_TestConsole_run().'
      : 'Manually open Web App routes to verify rendering; keep read-first; proceed to Phase 90 for pilot page binding.',
    severity: severity,
    reportText: '',
    reportJson: { routeCount: reg ? reg.length : 0 },
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvWebAppWorkspace_TestConsole_validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 89 — WEBAPP WORKSPACE SKELETON ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId
  ].join('\n');

  CbvWebAppWorkspace_TestConsole_storeLatestReport_(report);
  Logger.log(report.reportText);
  return report;
}

function CbvWebAppWorkspace_TestConsole_showRouteRegistry() {
  var reg = CbvWebAppWorkspace_routeRegistry();
  var s = JSON.stringify(reg, null, 2);
  SpreadsheetApp.getUi().alert('Phase 89 — Route registry', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvWebAppWorkspace_TestConsole_showHomeSummary() {
  var res = CbvWebAppWorkspace_getHomeSummary();
  var s = JSON.stringify(res, null, 2);
  SpreadsheetApp.getUi().alert('Phase 89 — Home summary', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvWebAppWorkspace_TestConsole_showHandoffPrompt() {
  SpreadsheetApp.getUi().alert('Phase 89 — AI handoff prompt', CBV_WEBAPP_WS_HANDOFF_PROMPT.substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvWebAppWorkspace_TestConsole_copyLatestReport() {
  var ui = SpreadsheetApp.getUi();
  var r = CbvWebAppWorkspace_TestConsole_getLatestReport_();
  if (!r) {
    ui.alert('No report', 'Run "Run WebApp Workspace Health Check" first, or execute CbvWebAppWorkspace_TestConsole_run() in the script editor.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 89 — copy report');
  return { ok: true };
}

