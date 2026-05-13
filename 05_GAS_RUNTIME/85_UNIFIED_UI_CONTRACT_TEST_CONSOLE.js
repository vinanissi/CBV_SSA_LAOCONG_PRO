/**
 * PHASE_85 — CBV Unified UI Contract — Test Console (isolated from operational menus).
 * Follows CBV Test Console Standard envelope (CBV_TEST_CONSOLE_V1).
 */

var __CBV_UI_CONTRACT_TEST_CONSOLE_LAST_REPORT = null;

/** Short prompt for AI / next implementer (mirrors 00_SYSTEM_BRAIN handoff). */
var CBV_UI_CONTRACT_HANDOFF_PROMPT = [
  'PHASE 85 — CBV Unified UI Contract (follow-up)',
  '',
  'Context: CBV_UI_CONTRACT sheet drives shared metadata for AppSheet (daily shell) and GAS WebApp (advanced UI).',
  'Rules: keep OPERATOR_PRIMARY_TEXT / OPERATOR_SECONDARY_TEXT / OPERATOR_META_TEXT / OPERATOR_NEXT_ACTION / OPERATOR_DASHBOARD_GROUP / OPERATOR_DASHBOARD_SORT for HOME_ALERT_* screens.',
  'Never map UI contract display fields to DISPLAY_*, CARD_*, UX_*, DESKTOP_* column names.',
  'AppSheet expressions in APPSHEET_DEEPLINK_EXPR must not start with "="; do not use _THISUSER (use USEREMAIL(), USERSETTINGS("Role")).',
  'No AppSheet Bot, no auto-escalation, no destructive migration, no ENV-A, no AI runtime in this phase.',
  '',
  'Runtime: 84_UNIFIED_UI_CONTRACT_RUNTIME.js — CbvUiContract_bootstrap, validate, healthCheck, generatePilotMatrix, buildWebAppRouteMap, buildAppSheetGuideData.',
  'Docs: docs/ui-contract/CBV_UNIFIED_UI_CONTRACT.md and related files in docs/ui-contract/.',
  '',
  'Next: bind AppSheet views to APPSHEET_VIEW + hints; implement WebApp routes from WEBAPP_ROUTE; extend pilot matrix when screens go live.'
].join('\n');

function CbvUiContract_TestConsole_validateEnvelope_(rep) {
  return CbvUiContract__validateEnvelope_(rep);
}

function CbvUiContract_TestConsole_run() {
  var traceId = typeof CbvUiContract__traceId_ === 'function' ? CbvUiContract__traceId_() : ('UIC_TC_' + new Date().getTime());
  var checks = [];
  var warnings = [];
  var errors = [];

  function addCheck(code, ok, severity, message, detail) {
    var sev;
    if (ok) {
      sev = severity || 'OK';
    } else {
      if (severity === 'WARNING' || severity === 'ERROR' || severity === 'CRITICAL') sev = severity;
      else sev = 'ERROR';
    }
    checks.push({ code: code, ok: ok, severity: sev, message: message, detail: detail || {} });
    if (!ok && (sev === 'ERROR' || sev === 'CRITICAL')) errors.push(message);
    if (!ok && sev === 'WARNING') warnings.push(message);
  }

  var boot = null;
  try {
    boot = CbvUiContract_bootstrap();
    addCheck('BOOTSTRAP', !!boot && boot.ok, 'OK', 'CbvUiContract_bootstrap', boot);
  } catch (e0) {
    addCheck('BOOTSTRAP', false, 'ERROR', e0.message || String(e0), {});
  }

  var val = null;
  try {
    val = CbvUiContract_validate();
    addCheck('VALIDATE', !!val && val.ok, val && val.ok ? 'OK' : 'ERROR', 'CbvUiContract_validate', { errorCount: (val && val.errors) ? val.errors.length : 0 });
    if (val && val.errors && val.errors.length) errors = errors.concat(val.errors);
    if (val && val.warnings && val.warnings.length) warnings = warnings.concat(val.warnings);
  } catch (e1) {
    addCheck('VALIDATE', false, 'ERROR', e1.message || String(e1), {});
  }

  var hc = null;
  try {
    hc = CbvUiContract_healthCheck();
    addCheck('HEALTH_CHECK', !!hc && hc.envelopeOk && hc.ok, hc && hc.ok ? 'OK' : 'WARNING', 'CbvUiContract_healthCheck', { envelopeOk: hc && hc.envelopeOk });
    if (hc && !hc.envelopeOk) warnings.push('healthCheck envelope incomplete');
    if (hc && !hc.ok) warnings.push('healthCheck ok=false');
  } catch (e2) {
    addCheck('HEALTH_CHECK', false, 'ERROR', e2.message || String(e2), {});
  }

  var pm = null;
  try {
    pm = CbvUiContract_generatePilotMatrix();
    addCheck('PILOT_MATRIX', !!pm && pm.ok, 'OK', 'CbvUiContract_generatePilotMatrix', pm && pm.matrix ? { buckets: Object.keys(pm.matrix) } : {});
  } catch (e3) {
    addCheck('PILOT_MATRIX', false, 'ERROR', e3.message || String(e3), {});
  }

  var rm = null;
  try {
    rm = CbvUiContract_buildWebAppRouteMap();
    addCheck('WEBAPP_ROUTE_MAP', !!rm && rm.ok && rm.routes && rm.routes.length >= 5, rm && rm.routes && rm.routes.length >= 5 ? 'OK' : 'WARNING', 'buildWebAppRouteMap: expected several WebApp routes from baseline', { routeCount: rm && rm.routes ? rm.routes.length : 0 });
  } catch (e4) {
    addCheck('WEBAPP_ROUTE_MAP', false, 'ERROR', e4.message || String(e4), {});
  }

  var gd = null;
  try {
    gd = CbvUiContract_buildAppSheetGuideData();
    addCheck('APPSHEET_GUIDE', !!gd && gd.ok && gd.items && gd.items.length >= 1, 'OK', 'buildAppSheetGuideData', { itemCount: gd && gd.items ? gd.items.length : 0 });
  } catch (e5) {
    addCheck('APPSHEET_GUIDE', false, 'ERROR', e5.message || String(e5), {});
  }

  addCheck('MENU_BOOTSTRAP', typeof menuCbvTestConsoleUiContract85_bootstrap === 'function', 'OK', 'menuCbvTestConsoleUiContract85_bootstrap', {});
  addCheck('MENU_HEALTH', typeof menuCbvTestConsoleUiContract85_health === 'function', 'OK', 'menuCbvTestConsoleUiContract85_health', {});
  addCheck('MENU_VALIDATE', typeof menuCbvTestConsoleUiContract85_validate === 'function', 'OK', 'menuCbvTestConsoleUiContract85_validate', {});
  addCheck('MENU_MATRIX', typeof menuCbvTestConsoleUiContract85_pilotMatrix === 'function', 'OK', 'menuCbvTestConsoleUiContract85_pilotMatrix', {});
  addCheck('MENU_HANDOFF', typeof menuCbvTestConsoleUiContract85_handoff === 'function', 'OK', 'menuCbvTestConsoleUiContract85_handoff', {});
  addCheck('MENU_COPY', typeof menuCbvTestConsoleUiContract85_copyReport === 'function', 'OK', 'menuCbvTestConsoleUiContract85_copyReport', {});

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_UI_CONTRACT_PHASE_ID,
    status: status,
    checkedAt: typeof cbvNow === 'function' ? cbvNow() : new Date(),
    runBy: typeof CbvUiContract__actor_ === 'function' ? CbvUiContract__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_UI_CONTRACT_PHASE_85',
    summary: 'UI Contract test console: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL' ? 'Fix validation errors; rerun CbvUiContract_TestConsole_run().' : 'Deploy AppSheet views + WebApp routes per docs/ui-contract; keep human-in-the-loop controls.',
    severity: severity,
    reportText: '',
    reportJson: { bootstrap: boot, validate: val, healthCheck: hc, pilotMatrix: pm, webAppRouteMap: rm, appSheetGuide: gd },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: false
  };

  var env = CbvUiContract_TestConsole_validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });
  if (!env.ok) {
    warnings.push('Envelope missing: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }

  report.reportText = [
    '=== CBV UI CONTRACT (PHASE 85) ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId
  ].join('\n');

  __CBV_UI_CONTRACT_TEST_CONSOLE_LAST_REPORT = report;
  try {
    CbvUiContract_appendReportAudit_(report);
  } catch (eA) {}

  Logger.log(report.reportText);
  return report;
}

function CbvUiContract_TestConsole_showHandoffPrompt() {
  SpreadsheetApp.getUi().alert('Phase 85 — AI handoff prompt', CBV_UI_CONTRACT_HANDOFF_PROMPT.substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvUiContract_TestConsole_copyLatestReport() {
  var ui = SpreadsheetApp.getUi();
  var r = __CBV_UI_CONTRACT_TEST_CONSOLE_LAST_REPORT;
  if (!r) {
    ui.alert('No report', 'Run "Validate UI Contract" or "Run UI Contract Health Check" first, or execute CbvUiContract_TestConsole_run() in the script editor.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'CBV UI Contract — copy report');
  return { ok: true };
}
