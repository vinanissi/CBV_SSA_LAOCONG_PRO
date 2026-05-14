/**
 * PHASE_96_1 — WebApp canonical route URL — Test Console (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Phase 96.1 — Route URL Fix
 */

var __CBV_WEBAPP_ROUTE_URL_TC_LAST_REPORT = null;
var __CBV_WEBAPP_ROUTE_URL_TC_LAST_REPORT_PROP_KEY = 'CBV_WEBAPP_ROUTE_URL_TC_LAST_REPORT_JSON';

var CBV_WEBAPP_ROUTE_URL_TC_HANDOFF = [
  'PHASE 96.1 — WebApp canonical route URL fix',
  '',
  'Issue: Relative hrefs (/workspace, /home-alert/...) resolve to googleusercontent.com inside Web App iframe.',
  'Fix: All nav and in-page links use CbvWebAppRouteUrl_build(route) → BASE/exec?route=encodeURIComponent(route).',
  '',
  'Canonical BASE (override Script Property CBV_WEBAPP_BASE_URL if needed):',
  '  https://script.google.com/macros/s/AKfycbxJNx9Vw6NBRmSZx0ds7-sNAeyGo6VKTfO8PUDpcz8e7kq1o3W0eUWRP78zPfRlKXBUPA/exec',
  '',
  'Next: Phase 97 — Staff trial execution / feedback capture.'
].join('\n');

function CbvWebAppRouteUrl_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function (k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvWebAppRouteUrl_TestConsole__storeLatestReport_(report) {
  try {
    __CBV_WEBAPP_ROUTE_URL_TC_LAST_REPORT = report;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_WEBAPP_ROUTE_URL_TC_LAST_REPORT_PROP_KEY, JSON.stringify(report || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvWebAppRouteUrl_TestConsole__getLatestReport_() {
  if (__CBV_WEBAPP_ROUTE_URL_TC_LAST_REPORT) return __CBV_WEBAPP_ROUTE_URL_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_WEBAPP_ROUTE_URL_TC_LAST_REPORT_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_WEBAPP_ROUTE_URL_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

function CbvWebAppRouteUrl_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WS961_')
    : ('WS961_' + new Date().getTime());

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

  addCheck('HELPER_GET_BASE', typeof CbvWebAppRouteUrl_getBaseUrl === 'function', 'OK', 'CbvWebAppRouteUrl_getBaseUrl exists', {});
  addCheck('HELPER_BUILD', typeof CbvWebAppRouteUrl_build === 'function', 'OK', 'CbvWebAppRouteUrl_build exists', {});
  addCheck('HELPER_MAP', typeof CbvWebAppRouteUrl_getRouteMap === 'function', 'OK', 'CbvWebAppRouteUrl_getRouteMap exists', {});
  addCheck('HELPER_NAV_VI', typeof CbvWebAppRouteUrl_getNavItemsVi === 'function', 'OK', 'CbvWebAppRouteUrl_getNavItemsVi exists', {});
  addCheck('HELPER_VALIDATE', typeof CbvWebAppRouteUrl_validate === 'function', 'OK', 'CbvWebAppRouteUrl_validate exists', {});

  var base = '';
  try {
    base = CbvWebAppRouteUrl_getBaseUrl();
    addCheck('BASE_PREFIX', base.indexOf('https://script.google.com/macros/s/') === 0, base.indexOf('https://script.google.com/macros/s/') === 0 ? 'OK' : 'ERROR',
      'Base URL uses https://script.google.com/macros/s/...', { base: base });
    addCheck('BASE_EXEC_SUFFIX', /\/exec$/i.test(base), /\/exec$/i.test(base) ? 'OK' : 'ERROR', 'Base URL ends with /exec', {});
    addCheck('BASE_NO_GU', base.indexOf('googleusercontent.com') < 0, base.indexOf('googleusercontent.com') < 0 ? 'OK' : 'CRITICAL',
      'Base URL does not use googleusercontent.com.', {});
  } catch (eB) {
    addCheck('BASE_PREFIX', false, 'WARNING', String(eB), {});
  }

  try {
    var u = CbvWebAppRouteUrl_build('/workspace');
    addCheck('BUILD_HAS_ROUTE_PARAM', u.indexOf('?route=') >= 0, u.indexOf('?route=') >= 0 ? 'OK' : 'ERROR', 'build() includes ?route=', { sample: u });
    addCheck('BUILD_NO_GU', u.indexOf('googleusercontent.com') < 0, u.indexOf('googleusercontent.com') < 0 ? 'OK' : 'CRITICAL', 'build() avoids googleusercontent.com', {});
  } catch (eU) {
    addCheck('BUILD_HAS_ROUTE_PARAM', false, 'WARNING', String(eU), {});
  }

  try {
    var navVi = CbvWebAppRouteUrl_getNavItemsVi();
    var okVi = Array.isArray(navVi) && navVi.length === 13 && navVi[0].url && navVi[0].url.indexOf('https://') === 0;
    addCheck('NAV_VI_ABSOLUTE', okVi, okVi ? 'OK' : 'ERROR', 'Vietnamese nav has 13 absolute https URLs.', { first: navVi && navVi[0] ? navVi[0].url : '' });
  } catch (eN) {
    addCheck('NAV_VI_ABSOLUTE', false, 'WARNING', String(eN), {});
  }

  try {
    var nav = (typeof CbvWebAppVi_getNavItems === 'function') ? CbvWebAppVi_getNavItems() : [];
    var first = nav && nav[0] ? nav[0].href : '';
    var absOk = first.indexOf('https://') === 0 && first.indexOf('?route=') >= 0;
    addCheck('VI_NAV_ABSOLUTE', absOk, absOk ? 'OK' : 'WARNING',
      'CbvWebAppVi_getNavItems first href is absolute with ?route=.', { first: first });
  } catch (eV) {
    addCheck('VI_NAV_ABSOLUTE', false, 'WARNING', String(eV), {});
  }

  try {
    if (typeof CbvWebAppWorkspace_routeRegistry === 'function') {
      var reg = CbvWebAppWorkspace_routeRegistry();
      var paths = (reg || []).map(function (r) { return r.route; }).sort().join('|');
      var expected = '/admin/reference|/daily|/execution/task|/focus|/home-alert/kanban|/home-alert/my-queue|/home-alert/sla|/home-alert/timeline|/reports|/runtime/health|/sop|/staff/feedback|/staff/task-detail|/staff/tasks|/workboard|/workspace|/workspace/daily|/workspace/execution/task|/workspace/focus|/workspace/guided|/workspace/role-home|/workspace/sop|/workspace/staff/feedback|/workspace/staff/task-detail|/workspace/staff/tasks|/workspace/today|/workspace/workboard';
      addCheck('ROUTE_PATHS_UNCHANGED', paths === expected, paths === expected ? 'OK' : 'WARNING',
        paths === expected ? 'Route paths match frozen set.' : 'Route registry drift', { paths: paths });
    } else {
      addCheck('ROUTE_PATHS_UNCHANGED', false, 'WARNING', 'route registry not loaded', {});
    }
  } catch (eR) {
    addCheck('ROUTE_PATHS_UNCHANGED', false, 'WARNING', String(eR), {});
  }

  var low = (CBV_WEBAPP_ROUTE_URL_TC_HANDOFF || '').toLowerCase();
  addCheck('NO_PROD_READY', low.indexOf('production ready') < 0 && low.indexOf('prod ready') < 0, 'OK', 'No production-ready claim in handoff.', {});
  addCheck('NO_WRITE_REC', low.indexOf('recommend write action') < 0, 'OK', 'No write-action recommendation.', {});

  var vd = null;
  try {
    vd = CbvWebAppRouteUrl_validate();
    if (vd && vd.warnings) warnings = warnings.concat(vd.warnings);
    if (vd && vd.errors) errors = errors.concat(vd.errors);
  } catch (eVal) {
    warnings.push('CbvWebAppRouteUrl_validate: ' + (eVal && eVal.message ? eVal.message : String(eVal)));
  }
  addCheck('ROUTE_URL_VALIDATE', vd && vd.ok === true, vd && vd.ok === true ? 'OK' : 'ERROR', 'CbvWebAppRouteUrl_validate', {});

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_WEBAPP_ROUTE_URL_PHASE_ID,
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_WEBAPP_ROUTE_URL_PHASE_96_1',
    summary: 'Route URL (Phase 96.1): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix Phase 96.1 route URL errors and rerun CbvWebAppRouteUrl_TestConsole_run().'
      : 'Manual click-test every nav link; deploy new Apps Script version; then Phase 97.',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: CBV_WEBAPP_ROUTE_URL_CONTRACT_VERSION,
    envelopeOk: false
  };

  var env = CbvWebAppRouteUrl_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 96.1 — WEBAPP CANONICAL ROUTE URL ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId
  ].join('\n');

  CbvWebAppRouteUrl_TestConsole__storeLatestReport_(report);
  try { Logger.log(report.reportText); } catch (eLog) { /* ignore */ }
  return report;
}

function CbvWebAppRouteUrl_TestConsole__alert_(title, payload) {
  var s = JSON.stringify(payload, null, 2);
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert(title, s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CbvWebAppRouteUrl_TestConsole_showRouteMap() {
  CbvWebAppRouteUrl_TestConsole__alert_('Phase 96.1 — Route map', CbvWebAppRouteUrl_getRouteMap());
  return { ok: true };
}

function CbvWebAppRouteUrl_TestConsole_showNavItems() {
  CbvWebAppRouteUrl_TestConsole__alert_('Phase 96.1 — Vietnamese nav URLs', CbvWebAppRouteUrl_getNavItemsVi());
  return { ok: true };
}

function CbvWebAppRouteUrl_TestConsole_showAuditChecklist() {
  var payload = { checklist: 'docs/webapp/WEBAPP_ROUTE_LINK_AUDIT_CHECKLIST.md', sample: CbvWebAppRouteUrl_build('/home-alert/my-queue') };
  CbvWebAppRouteUrl_TestConsole__alert_('Phase 96.1 — Link audit', payload);
  return { ok: true };
}

function CbvWebAppRouteUrl_TestConsole_showHandoffPrompt() {
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert('Phase 96.1 — AI handoff', CBV_WEBAPP_ROUTE_URL_TC_HANDOFF.substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return { ok: true };
}

function CbvWebAppRouteUrl_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvWebAppRouteUrl_TestConsole__getLatestReport_();
  if (!r) {
    ui.alert('No report', 'Run Route URL Health Check first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 96.1 — copy report');
  return { ok: true };
}
