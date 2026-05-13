/**
 * PHASE_87 — APPSHEET PILOT SETUP — Test Console (CBV_TCS_V1; isolated from business menus).
 */

var __CBV_APPSHEET_PILOT_TEST_CONSOLE_LAST_REPORT = null;

var CBV_APPSHEET_PILOT_HANDOFF_PROMPT = [
  'PHASE 87 — AppSheet Pilot Setup Binding',
  '',
  'Use CbvAppSheetPilot_buildViewSetupMatrix / Slice / ManualActions / SecurityFilter / buildUatScript output as the authoritative checklist in AppSheet Designer.',
  'Security: USEREMAIL(), USERSETTINGS("Role"); never _THISUSER; no leading "=" in stored literals.',
  'Manual-only actions (ACK, CLAIM, IN_PROGRESS, WAITING_RESPONSE, ESCALATE, RESOLVE, RELEASE); no AppSheet Bot; no auto assign/resolve/escalate.',
  '',
  'Next: clasp push → 🧪 CBV Test Console → Phase 87 — run health → apply matrices → pilot UAT → signoff doc.',
  'See docs/appsheet/PHASE_87_APPSHEET_PILOT_SETUP_BINDING.md and APPSHEET_*_MATRIX.md.'
].join('\n');

function CbvAppSheetPilot_TestConsole_validateEnvelope_(rep) {
  return CbvAppSheetPilot__validateEnvelope_(rep);
}

function CbvAppSheetPilot_TestConsole_run() {
  var traceId = typeof CbvAppSheetPilot__traceId_ === 'function' ? CbvAppSheetPilot__traceId_() : ('ASP87TC_' + new Date().getTime());
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

  var hc = null;
  try {
    hc = CbvAppSheetPilot_healthCheck();
    var hOk = !!hc && hc.envelopeOk && hc.ok;
    var hSev = hOk ? 'OK' : (hc && hc.status === 'FAIL' ? 'ERROR' : 'WARNING');
    addCheck('APPSHEET_PILOT_HEALTH', hOk, hSev, 'CbvAppSheetPilot_healthCheck', { status: hc && hc.status, envelopeOk: hc && hc.envelopeOk });
  } catch (e0) {
    addCheck('APPSHEET_PILOT_HEALTH', false, 'ERROR', e0.message || String(e0), {});
  }

  try {
    var vm = CbvAppSheetPilot_buildViewSetupMatrix();
    addCheck('VIEW_MATRIX_FN', !!(vm && vm.ok && vm.matrix && vm.matrix.length), vm && vm.ok ? 'OK' : 'WARNING', 'buildViewSetupMatrix', { rows: vm && vm.matrix ? vm.matrix.length : 0 });
  } catch (e1) {
    addCheck('VIEW_MATRIX_FN', false, 'ERROR', e1.message || String(e1), {});
  }

  try {
    var sm = CbvAppSheetPilot_buildSliceSetupMatrix();
    addCheck('SLICE_MATRIX_FN', !!(sm && sm.ok && sm.matrix && sm.matrix.length >= 5), 'OK', 'buildSliceSetupMatrix', { rows: sm && sm.matrix ? sm.matrix.length : 0 });
  } catch (e2) {
    addCheck('SLICE_MATRIX_FN', false, 'ERROR', e2.message || String(e2), {});
  }

  try {
    var am = CbvAppSheetPilot_buildManualActionsMatrix();
    addCheck('ACTIONS_MATRIX_FN', !!(am && am.ok && am.matrix && am.matrix.length >= 7), 'OK', 'buildManualActionsMatrix', {});
  } catch (e3) {
    addCheck('ACTIONS_MATRIX_FN', false, 'ERROR', e3.message || String(e3), {});
  }

  try {
    var fm = CbvAppSheetPilot_buildSecurityFilterMatrix();
    addCheck('SECURITY_MATRIX_FN', !!(fm && fm.ok && fm.matrix && fm.matrix.length), 'OK', 'buildSecurityFilterMatrix', {});
  } catch (e4) {
    addCheck('SECURITY_MATRIX_FN', false, 'ERROR', e4.message || String(e4), {});
  }

  try {
    var uat = CbvAppSheetPilot_buildUatScript();
    addCheck('UAT_SCRIPT_FN', !!(uat && uat.ok && uat.cases && uat.cases.length >= 3), 'OK', 'buildUatScript', { cases: uat && uat.cases ? uat.cases.length : 0 });
  } catch (e5) {
    addCheck('UAT_SCRIPT_FN', false, 'ERROR', e5.message || String(e5), {});
  }

  addCheck('MENU_HEALTH', typeof menuCbvTestConsoleAppSheetPilot87_health === 'function', 'OK', 'menuCbvTestConsoleAppSheetPilot87_health', {});
  addCheck('MENU_VIEWS', typeof menuCbvTestConsoleAppSheetPilot87_views === 'function', 'OK', 'menuCbvTestConsoleAppSheetPilot87_views', {});
  addCheck('MENU_SLICES', typeof menuCbvTestConsoleAppSheetPilot87_slices === 'function', 'OK', 'menuCbvTestConsoleAppSheetPilot87_slices', {});
  addCheck('MENU_ACTIONS', typeof menuCbvTestConsoleAppSheetPilot87_actions === 'function', 'OK', 'menuCbvTestConsoleAppSheetPilot87_actions', {});
  addCheck('MENU_SECURITY', typeof menuCbvTestConsoleAppSheetPilot87_security === 'function', 'OK', 'menuCbvTestConsoleAppSheetPilot87_security', {});
  addCheck('MENU_UAT', typeof menuCbvTestConsoleAppSheetPilot87_uat === 'function', 'OK', 'menuCbvTestConsoleAppSheetPilot87_uat', {});
  addCheck('MENU_HANDOFF', typeof menuCbvTestConsoleAppSheetPilot87_handoff === 'function', 'OK', 'menuCbvTestConsoleAppSheetPilot87_handoff', {});
  addCheck('MENU_COPY', typeof menuCbvTestConsoleAppSheetPilot87_copyReport === 'function', 'OK', 'menuCbvTestConsoleAppSheetPilot87_copyReport', {});

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: typeof CBV_APPSHEET_PILOT_PHASE_ID !== 'undefined' ? CBV_APPSHEET_PILOT_PHASE_ID : 'PHASE_87_APPSHEET_PILOT_SETUP_BINDING',
    status: status,
    checkedAt: typeof cbvNow === 'function' ? cbvNow() : new Date(),
    runBy: typeof CbvAppSheetPilot__actor_ === 'function' ? CbvAppSheetPilot__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_APPSHEET_PILOT_SETUP_TEST_CONSOLE',
    summary: 'AppSheet pilot setup test console: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL' ? 'Fix errors; reload script; rerun CbvAppSheetPilot_TestConsole_run().' : 'Apply docs/appsheet matrices in AppSheet Designer; run UAT script.',
    severity: severity,
    reportText: '',
    reportJson: { healthCheck: hc },
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvAppSheetPilot_TestConsole_validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });
  if (!env.ok) {
    warnings.push('Envelope missing: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }

  report.reportText = ['=== CBV_APPSHEET_PILOT_SETUP (PHASE 87 TCS) ===', 'status=' + report.status, 'envelopeOk=' + report.envelopeOk].join('\n');

  __CBV_APPSHEET_PILOT_TEST_CONSOLE_LAST_REPORT = report;
  try {
    if (typeof CbvAppSheetPilot_appendReportAudit_ === 'function') CbvAppSheetPilot_appendReportAudit_(report);
  } catch (eA) {}
  Logger.log(report.reportText);
  return report;
}

function CbvAppSheetPilot_TestConsole_showViewMatrix() {
  var p = CbvAppSheetPilot_buildViewSetupMatrix();
  var s = JSON.stringify(p, null, 2);
  SpreadsheetApp.getUi().alert('View setup matrix', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvAppSheetPilot_TestConsole_showSliceMatrix() {
  var p = CbvAppSheetPilot_buildSliceSetupMatrix();
  var s = JSON.stringify(p, null, 2);
  SpreadsheetApp.getUi().alert('Slice setup matrix', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvAppSheetPilot_TestConsole_showManualActionsMatrix() {
  var p = CbvAppSheetPilot_buildManualActionsMatrix();
  var s = JSON.stringify(p, null, 2);
  SpreadsheetApp.getUi().alert('Manual actions matrix', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvAppSheetPilot_TestConsole_showSecurityFilterMatrix() {
  var p = CbvAppSheetPilot_buildSecurityFilterMatrix();
  var s = JSON.stringify(p, null, 2);
  SpreadsheetApp.getUi().alert('Security filter matrix', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvAppSheetPilot_TestConsole_showUatScript() {
  var p = CbvAppSheetPilot_buildUatScript();
  var s = JSON.stringify(p, null, 2);
  SpreadsheetApp.getUi().alert('Pilot UAT script', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvAppSheetPilot_TestConsole_showHandoffPrompt() {
  SpreadsheetApp.getUi().alert('Phase 87 — AI handoff', CBV_APPSHEET_PILOT_HANDOFF_PROMPT.substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvAppSheetPilot_TestConsole_copyLatestReport() {
  var ui = SpreadsheetApp.getUi();
  var r = __CBV_APPSHEET_PILOT_TEST_CONSOLE_LAST_REPORT;
  if (!r) {
    ui.alert('No report', 'Run CbvAppSheetPilot_TestConsole_run() first or use Run AppSheet Pilot Setup Health Check.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'AppSheet pilot setup — copy report');
  return { ok: true };
}
