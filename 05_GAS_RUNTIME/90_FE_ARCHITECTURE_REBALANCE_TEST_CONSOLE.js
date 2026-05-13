/**
 * PHASE_88 — FE ARCHITECTURE REBALANCE CLOSEOUT — Test Console (CBV_TCS_V1)
 *
 * Purpose: architecture closeout gate (docs/decision/ownership/rules) — no large runtime.
 * Menu location: 🧪 CBV Test Console → Phase 88 — FE Architecture (only).
 */

var __CBV_FE_ARCH_TEST_CONSOLE_LAST_REPORT = null;

var CBV_FE_ARCH_PHASE_ID = 'PHASE_88_FE_ARCHITECTURE_REBALANCE_CLOSEOUT';

var CBV_FE_ARCH_DECISION_TEXT = [
  'FINAL FE ARCHITECTURE (WebApp-led hybrid)',
  '',
  '- Sheets/GAS = operational database + runtime',
  '- WebApp = operational workspace',
  '- AppSheet = lightweight operator shell',
  '',
  'Meaning:',
  '- Sheets/GAS keeps data, runtime, audit, test, report, orchestration.',
  '- WebApp is the primary FE for operational workspace (WebApp-led).',
  '- AppSheet is a lightweight shell for mobile quick CRUD / fallback / field operations.',
  '',
  'Rules:',
  '- No AppSheet Bot.',
  '- No auto assign / auto resolve / auto escalate.',
  '- No destructive migration.',
  '- No production claim.',
  '- Manual-first → Auto-later; Human-in-the-loop; Audit-first.'
].join('\n');

var CBV_FE_ARCH_OWNERSHIP_MATRIX_TEXT = [
  'FE Ownership Matrix (minimum)',
  '',
  '- HOME / Today Workspace → WebApp primary',
  '- My Queue → Both (AppSheet lightweight, WebApp advanced)',
  '- Unassigned Queue → AppSheet primary initially (WebApp optional)',
  '- Escalated Queue → Both',
  '- Blocked Queue → Both',
  '- SLA Dashboard → WebApp primary',
  '- Timeline → WebApp only',
  '- Kanban → WebApp only',
  '- Runtime Health → WebApp only',
  '- Test Console → WebApp/GAS dialog only',
  '- Report Viewer → WebApp only',
  '- Admin Reference Viewer → WebApp only',
  '- Quick Mobile Form → AppSheet only',
  '- Upload / Capture → AppSheet primary',
  '- AI Review → WebApp later'
].join('\n');

/** Short prompt for AI / next implementer. */
var CBV_FE_ARCH_HANDOFF_PROMPT = [
  'PHASE 88 — FE Architecture Rebalance Closeout',
  '',
  'Final architecture: Sheets/GAS = operational database + runtime; WebApp = operational workspace; AppSheet = lightweight operator shell (WebApp-led hybrid).',
  '',
  'Do NOT do next:',
  '- No AppSheet Bot.',
  '- No auto assign / auto resolve / auto escalate.',
  '- No destructive migration.',
  '- No production claim.',
  '- No AI runtime / queue intelligence.',
  '',
  'Next recommended phase: Phase 89 — WebApp Operational Workspace Skeleton (route registry + FE test baseline + read-first pages).'
].join('\n');

function CbvFeArchitecture_TestConsole_validateEnvelope_(rep) {
  var need = [
    'ok',
    'phase',
    'status',
    'checkedAt',
    'runBy',
    'traceId',
    'testSuite',
    'summary',
    'checks',
    'warnings',
    'errors',
    'nextStep',
    'severity',
    'reportText',
    'reportJson',
    'contractVersion',
    'envelopeOk'
  ];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvFeArchitecture_TestConsole_run() {
  var traceId = (typeof Utilities !== 'undefined' && Utilities.getUuid) ? ('FE88_' + Utilities.getUuid()) : ('FE88_' + new Date().getTime());
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

  function mustContain(label, text, needle, severity) {
    var ok = String(text || '').indexOf(needle) >= 0;
    addCheck(label, ok, ok ? 'OK' : (severity || 'ERROR'), 'Require phrase: ' + needle, { needle: needle });
  }

  // Core decision phrases
  mustContain('DECISION_SHEETS_GAS', CBV_FE_ARCH_DECISION_TEXT, 'Sheets/GAS = operational database + runtime', 'ERROR');
  mustContain('DECISION_WEBAPP', CBV_FE_ARCH_DECISION_TEXT, 'WebApp = operational workspace', 'ERROR');
  mustContain('DECISION_APPSHEET', CBV_FE_ARCH_DECISION_TEXT, 'AppSheet = lightweight operator shell', 'ERROR');

  // Core prohibitions (must exist as prohibitions)
  mustContain('RULE_NO_BOT', CBV_FE_ARCH_DECISION_TEXT, 'No AppSheet Bot', 'ERROR');
  mustContain('RULE_NO_AUTO_ASSIGN', CBV_FE_ARCH_DECISION_TEXT, 'No auto assign', 'ERROR');
  mustContain('RULE_NO_AUTO_RESOLVE', CBV_FE_ARCH_DECISION_TEXT, 'No auto resolve', 'ERROR');
  mustContain('RULE_NO_AUTO_ESCALATE', CBV_FE_ARCH_DECISION_TEXT, 'No auto escalate', 'ERROR');
  mustContain('RULE_NO_PROD_CLAIM', CBV_FE_ARCH_DECISION_TEXT, 'No production claim', 'ERROR');

  // Ownership matrix minimum items
  mustContain('OWN_HOME', CBV_FE_ARCH_OWNERSHIP_MATRIX_TEXT, 'HOME / Today Workspace', 'ERROR');
  mustContain('OWN_MY_QUEUE', CBV_FE_ARCH_OWNERSHIP_MATRIX_TEXT, 'My Queue', 'ERROR');
  mustContain('OWN_UNASSIGNED', CBV_FE_ARCH_OWNERSHIP_MATRIX_TEXT, 'Unassigned Queue', 'ERROR');
  mustContain('OWN_TIMELINE', CBV_FE_ARCH_OWNERSHIP_MATRIX_TEXT, 'Timeline → WebApp only', 'ERROR');
  mustContain('OWN_KANBAN', CBV_FE_ARCH_OWNERSHIP_MATRIX_TEXT, 'Kanban → WebApp only', 'ERROR');
  mustContain('OWN_RUNTIME_HEALTH', CBV_FE_ARCH_OWNERSHIP_MATRIX_TEXT, 'Runtime Health → WebApp only', 'ERROR');
  mustContain('OWN_QUICK_MOBILE_FORM', CBV_FE_ARCH_OWNERSHIP_MATRIX_TEXT, 'Quick Mobile Form → AppSheet only', 'ERROR');

  // “No production claim” must not be flipped into a recommendation.
  var low = (CBV_FE_ARCH_DECISION_TEXT + '\n' + CBV_FE_ARCH_HANDOFF_PROMPT).toLowerCase();
  var hasProdReadyClaim = (low.indexOf('production ready') >= 0) || (low.indexOf('prod ready') >= 0);
  addCheck('NO_PROD_READY_CLAIM', !hasProdReadyClaim, !hasProdReadyClaim ? 'OK' : 'CRITICAL', hasProdReadyClaim ? 'Forbidden: production ready claim detected in Phase 88 text.' : 'No production-ready claim in Phase 88 text.', {});

  // Menu wrapper presence (helps detect missed wrapper updates after clasp push)
  addCheck('MENU_RUN', typeof menuCbvTestConsoleFeArch88_run === 'function', 'OK', 'menuCbvTestConsoleFeArch88_run', {});
  addCheck('MENU_MATRIX', typeof menuCbvTestConsoleFeArch88_matrix === 'function', 'OK', 'menuCbvTestConsoleFeArch88_matrix', {});
  addCheck('MENU_DECISION', typeof menuCbvTestConsoleFeArch88_decision === 'function', 'OK', 'menuCbvTestConsoleFeArch88_decision', {});
  addCheck('MENU_HANDOFF', typeof menuCbvTestConsoleFeArch88_handoff === 'function', 'OK', 'menuCbvTestConsoleFeArch88_handoff', {});
  addCheck('MENU_COPY', typeof menuCbvTestConsoleFeArch88_copyReport === 'function', 'OK', 'menuCbvTestConsoleFeArch88_copyReport', {});

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_FE_ARCH_PHASE_ID,
    status: status,
    checkedAt: (typeof cbvNow === 'function') ? cbvNow() : new Date(),
    runBy: (typeof cbvUser === 'function') ? cbvUser() : '',
    traceId: traceId,
    testSuite: 'CBV_FE_ARCHITECTURE_PHASE_88',
    summary: 'FE architecture closeout gate: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix missing Phase 88 menu bindings or missing required decision/matrix/rules text; rerun CbvFeArchitecture_TestConsole_run().'
      : 'Proceed to Phase 89 (WebApp workspace skeleton): route registry + FE test baseline + read-first pages.',
    severity: severity,
    reportText: '',
    reportJson: {
      decisionText: CBV_FE_ARCH_DECISION_TEXT,
      ownershipMatrixText: CBV_FE_ARCH_OWNERSHIP_MATRIX_TEXT
    },
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvFeArchitecture_TestConsole_validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });
  if (!env.ok) {
    warnings.push('Envelope missing: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }

  report.reportText = [
    '=== PHASE 88 — FE ARCHITECTURE REBALANCE CLOSEOUT ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId
  ].join('\n');

  __CBV_FE_ARCH_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function CbvFeArchitecture_TestConsole_showOwnershipMatrix() {
  SpreadsheetApp.getUi().alert('Phase 88 — FE ownership matrix', CBV_FE_ARCH_OWNERSHIP_MATRIX_TEXT.substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvFeArchitecture_TestConsole_showDecision() {
  SpreadsheetApp.getUi().alert('Phase 88 — Architecture decision', CBV_FE_ARCH_DECISION_TEXT.substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvFeArchitecture_TestConsole_showHandoffPrompt() {
  SpreadsheetApp.getUi().alert('Phase 88 — AI handoff prompt', CBV_FE_ARCH_HANDOFF_PROMPT.substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  return { ok: true };
}

function CbvFeArchitecture_TestConsole_copyLatestReport() {
  var ui = SpreadsheetApp.getUi();
  var r = __CBV_FE_ARCH_TEST_CONSOLE_LAST_REPORT;
  if (!r) {
    ui.alert('No report', 'Run "Run FE Architecture Health Check" first, or execute CbvFeArchitecture_TestConsole_run() in the script editor.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 88 — copy report');
  return { ok: true };
}

