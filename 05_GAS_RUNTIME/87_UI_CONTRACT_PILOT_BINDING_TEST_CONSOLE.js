/**
 * PHASE_86 — UI CONTRACT PILOT BINDING — Test Console (isolated from business menus).
 */

var __CBV_UI_PILOT_BINDING_TEST_CONSOLE_LAST_REPORT = null;

var CBV_UI_PILOT_BINDING_HANDOFF_PROMPT = [
  'PHASE 86 — UI Contract Pilot Binding',
  '',
  'CBV_UI_CONTRACT is the source of truth for AppSheet view names, security hints, and WebApp routes.',
  'Run CbvUiPilotBinding_validate after updating the CBV_UI_CONTRACT sheet; fix missing APPSHEET_VIEW / WEBAPP_ROUTE before pilot.',
  'No AppSheet Bot, no auto assign/resolve/escalate, no ENV-A or AI runtime.',
  '',
  'Next: bind real AppSheet views; stub or implement WebApp routes read-first; run pilot with 1 admin, 1 supervisor, 1–2 operators.',
  'See docs/ui-contract/PHASE_86_UI_CONTRACT_PILOT_BINDING.md and pilot checklists.'
].join('\n');

function CbvUiPilotBinding_TestConsole_validateEnvelope_(rep) {
  return CbvUiPilotBinding__validateEnvelope_(rep);
}

function CbvUiPilotBinding_TestConsole_run() {
  var traceId = typeof CbvUiPilotBinding__traceId_ === 'function' ? CbvUiPilotBinding__traceId_() : ('UIP86TC_' + new Date().getTime());
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
    hc = CbvUiPilotBinding_healthCheck();
    var hOk = !!hc && hc.envelopeOk && hc.ok;
    var hSev = hOk ? 'OK' : (hc && hc.status === 'FAIL' ? 'ERROR' : 'WARNING');
    addCheck('PILOT_HEALTH', hOk, hSev, 'CbvUiPilotBinding_healthCheck', { status: hc && hc.status, envelopeOk: hc && hc.envelopeOk, checkCount: hc && hc.checks ? hc.checks.length : 0 });
  } catch (e0) {
    addCheck('PILOT_HEALTH', false, 'ERROR', e0.message || String(e0), {});
  }

  var asp = null;
  try {
    asp = CbvUiPilotBinding_buildAppSheetBindingPlan();
    addCheck('APPSHEET_PLAN_FN', !!(asp && asp.ok), asp && asp.ok ? 'OK' : 'WARNING', 'buildAppSheetBindingPlan', { missing: asp && asp.missingAppSheetViewNames ? asp.missingAppSheetViewNames.length : -1 });
  } catch (e1) {
    addCheck('APPSHEET_PLAN_FN', false, 'ERROR', e1.message || String(e1), {});
  }

  var wrp = null;
  try {
    wrp = CbvUiPilotBinding_buildWebAppRoutePlan();
    addCheck('WEBAPP_PLAN_FN', !!(wrp && wrp.ok), wrp && wrp.ok ? 'OK' : 'WARNING', 'buildWebAppRoutePlan', { missing: wrp && wrp.missingRouteMetadata ? wrp.missingRouteMetadata.length : -1 });
  } catch (e2) {
    addCheck('WEBAPP_PLAN_FN', false, 'ERROR', e2.message || String(e2), {});
  }

  var cl = null;
  try {
    cl = CbvUiPilotBinding_buildPilotChecklist();
    addCheck('CHECKLIST_FN', !!(cl && cl.ok && cl.sections && cl.sections.length >= 3), 'OK', 'buildPilotChecklist', { sections: cl && cl.sections ? cl.sections.length : 0 });
  } catch (e3) {
    addCheck('CHECKLIST_FN', false, 'ERROR', e3.message || String(e3), {});
  }

  addCheck('MENU_PILOT_HEALTH', typeof menuCbvTestConsoleUiPilot86_health === 'function', 'OK', 'menuCbvTestConsoleUiPilot86_health', {});
  addCheck('MENU_APPSHEET_PLAN', typeof menuCbvTestConsoleUiPilot86_appsheetPlan === 'function', 'OK', 'menuCbvTestConsoleUiPilot86_appsheetPlan', {});
  addCheck('MENU_WEBAPP_PLAN', typeof menuCbvTestConsoleUiPilot86_webappPlan === 'function', 'OK', 'menuCbvTestConsoleUiPilot86_webappPlan', {});
  addCheck('MENU_CHECKLIST', typeof menuCbvTestConsoleUiPilot86_checklist === 'function', 'OK', 'menuCbvTestConsoleUiPilot86_checklist', {});
  addCheck('MENU_HANDOFF', typeof menuCbvTestConsoleUiPilot86_handoff === 'function', 'OK', 'menuCbvTestConsoleUiPilot86_handoff', {});
  addCheck('MENU_COPY', typeof menuCbvTestConsoleUiPilot86_copyReport === 'function', 'OK', 'menuCbvTestConsoleUiPilot86_copyReport', {});

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: typeof CBV_UI_PILOT_BINDING_PHASE_ID !== 'undefined' ? CBV_UI_PILOT_BINDING_PHASE_ID : 'PHASE_86_UI_CONTRACT_PILOT_BINDING',
    status: status,
    checkedAt: typeof cbvNow === 'function' ? cbvNow() : new Date(),
    runBy: typeof CbvUiPilotBinding__actor_ === 'function' ? CbvUiPilotBinding__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_UI_PILOT_BINDING_TEST_CONSOLE',
    summary: 'Pilot binding test console: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL' ? 'Fix validate errors; rerun CbvUiPilotBinding_TestConsole_run().' : 'clasp push; run pilot binding menus; bind AppSheet/WebApp per plans.',
    severity: severity,
    reportText: '',
    reportJson: { healthCheck: hc, appSheetPlan: asp, webAppPlan: wrp, checklist: cl },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: false
  };

  var env = CbvUiPilotBinding_TestConsole_validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });
  if (!env.ok) {
    warnings.push('Envelope missing: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }

  report.reportText = ['=== CBV_UI_PILOT_BINDING (PHASE 86) ===', 'status=' + report.status, 'envelopeOk=' + report.envelopeOk].join('\n');

  __CBV_UI_PILOT_BINDING_TEST_CONSOLE_LAST_REPORT = report;
  try {
    if (typeof CbvUiPilotBinding_appendReportAudit_ === 'function') CbvUiPilotBinding_appendReportAudit_(report);
  } catch (eA) {}
  Logger.log(report.reportText);
  return report;
}

function CbvUiPilotBinding_TestConsole_showAppSheetPlan() {
  var p = CbvUiPilotBinding_buildAppSheetBindingPlan();
  var s = JSON.stringify(p, null, 2);
  SpreadsheetApp.getUi().alert('AppSheet binding plan', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvUiPilotBinding_TestConsole_showWebAppRoutePlan() {
  var p = CbvUiPilotBinding_buildWebAppRoutePlan();
  var s = JSON.stringify(p, null, 2);
  SpreadsheetApp.getUi().alert('WebApp route plan', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvUiPilotBinding_TestConsole_showPilotChecklist() {
  var p = CbvUiPilotBinding_buildPilotChecklist();
  var s = JSON.stringify(p, null, 2);
  SpreadsheetApp.getUi().alert('Pilot checklist', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvUiPilotBinding_TestConsole_showHandoffPrompt() {
  SpreadsheetApp.getUi().alert('Phase 86 — AI handoff', CBV_UI_PILOT_BINDING_HANDOFF_PROMPT.substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvUiPilotBinding_TestConsole_copyLatestReport() {
  var ui = SpreadsheetApp.getUi();
  var r = __CBV_UI_PILOT_BINDING_TEST_CONSOLE_LAST_REPORT;
  if (!r) {
    ui.alert('No report', 'Run CbvUiPilotBinding_TestConsole_run() first or use Run Pilot Binding Health Check.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Pilot binding — copy report');
  return { ok: true };
}
