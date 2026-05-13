/**
 * PHASE_95 — WebApp Pilot UAT / Staff Trial Runbook — Test Console
 * Standard: CBV_TCS_V1
 *
 * Menu: 🧪 CBV Test Console → Phase 95 — Pilot UAT
 *
 * Read-first only. No mutation. No production claim.
 */

var __CBV_WEBAPP_UAT_TC_LAST_REPORT = null;
var __CBV_WEBAPP_UAT_TC_LAST_REPORT_PROP_KEY = 'CBV_WEBAPP_UAT_TC_LAST_REPORT_JSON';

var CBV_WEBAPP_UAT_HANDOFF_PROMPT = [
  'PHASE 95 — WebApp Pilot UAT / Staff Trial Runbook',
  '',
  'Scope: define the runbook + scripts + feedback schema + triage matrix',
  'for the pilot staff trial against the Phase 94 frozen WebApp. No new feature.',
  'No mutation. No write actions. No AppSheet Bot. No AI runtime.',
  '',
  'Roles + frozen routes (READ_FIRST, PILOT):',
  '  Admin     → /workspace · /runtime/health · /reports · /admin/reference · ?action=ping',
  '  Supervisor→ /workspace · /home-alert/sla · /home-alert/timeline · /home-alert/kanban',
  '  Operator  → /workspace · /home-alert/my-queue (desktop/tablet/mobile)',
  '',
  'Severity ladder: BLOCKER · HIGH · MEDIUM · LOW · OBSERVATION.',
  'Go-criteria summary:',
  '  GO              = no BLOCKER + no security leak + no mutation UI + role goals met.',
  '  GO_WITH_WARNINGS= GO + ≤2 HIGH issues with explicit waivers.',
  '  NO_GO           = any BLOCKER / security leak / route crash / fake mutation UI /',
  '                    operator cannot use core queue / production claim observed.',
  '',
  'Safety phrases (must remain verbatim on every operational route footer):',
  '  No auto assign',
  '  No auto resolve',
  '  No auto escalate',
  '  No production claim',
  '  (Timeline/Kanban also: No drag-drop save)',
  '',
  'Next:',
  '  - On GO / GO_WITH_WARNINGS: Phase 96 — Controlled WebApp Action Design /',
  '    Mutation Guard Blueprint.',
  '  - On NO_GO: Phase 96 must be a UAT Fix Pack, NOT mutation design.'
].join('\n');

/* ------------------------------------------------------------------ */
/* Report storage                                                      */
/* ------------------------------------------------------------------ */

function CbvWebAppUat_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvWebAppUat_TestConsole__storeLatestReport_(report) {
  try {
    __CBV_WEBAPP_UAT_TC_LAST_REPORT = report;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_WEBAPP_UAT_TC_LAST_REPORT_PROP_KEY, JSON.stringify(report || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvWebAppUat_TestConsole__getLatestReport_() {
  if (__CBV_WEBAPP_UAT_TC_LAST_REPORT) return __CBV_WEBAPP_UAT_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_WEBAPP_UAT_TC_LAST_REPORT_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_WEBAPP_UAT_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Main runner                                                         */
/* ------------------------------------------------------------------ */

function CbvWebAppUat_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WS95_')
    : ('WS95_' + new Date().getTime());

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

  // 1. Runtime presence
  addCheck('RUNTIME_PILOT_SCOPE', typeof CbvWebAppUat_getPilotScope === 'function', 'OK',
    'CbvWebAppUat_getPilotScope exists', {});
  addCheck('RUNTIME_ADMIN_SCRIPT', typeof CbvWebAppUat_getAdminScript === 'function', 'OK',
    'CbvWebAppUat_getAdminScript exists', {});
  addCheck('RUNTIME_SUPERVISOR_SCRIPT', typeof CbvWebAppUat_getSupervisorScript === 'function', 'OK',
    'CbvWebAppUat_getSupervisorScript exists', {});
  addCheck('RUNTIME_OPERATOR_SCRIPT', typeof CbvWebAppUat_getOperatorScript === 'function', 'OK',
    'CbvWebAppUat_getOperatorScript exists', {});
  addCheck('RUNTIME_FEEDBACK_SCHEMA', typeof CbvWebAppUat_getFeedbackSchema === 'function', 'OK',
    'CbvWebAppUat_getFeedbackSchema exists', {});
  addCheck('RUNTIME_TRIAGE_MATRIX', typeof CbvWebAppUat_getIssueTriageMatrix === 'function', 'OK',
    'CbvWebAppUat_getIssueTriageMatrix exists', {});
  addCheck('RUNTIME_GO_NOGO', typeof CbvWebAppUat_getGoNoGoCriteria === 'function', 'OK',
    'CbvWebAppUat_getGoNoGoCriteria exists', {});
  addCheck('RUNTIME_VALIDATE', typeof CbvWebAppUat_validate === 'function', 'OK',
    'CbvWebAppUat_validate exists', {});

  // 2. Pilot scope shape
  try {
    var scope = CbvWebAppUat_getPilotScope();
    var scopeOk = !!(scope && scope.data
      && scope.data.routes
      && Array.isArray(scope.data.routes.operational)
      && Array.isArray(scope.data.routes.support)
      && Array.isArray(scope.data.roles)
      && Array.isArray(scope.data.outOfScope)
      && Array.isArray(scope.data.safetyRules));
    addCheck('SCOPE_SHAPE', scopeOk, scopeOk ? 'OK' : 'ERROR',
      'Pilot scope returns routes/roles/outOfScope/safetyRules.', { keys: scope && scope.data ? Object.keys(scope.data) : [] });
  } catch (eSc) {
    addCheck('SCOPE_SHAPE', false, 'WARNING', 'pilot scope error: ' + (eSc && eSc.message ? eSc.message : String(eSc)), {});
  }

  // 3. Scripts shape
  ['Admin', 'Supervisor', 'Operator'].forEach(function(role) {
    try {
      var fn = (role === 'Admin') ? CbvWebAppUat_getAdminScript
        : (role === 'Supervisor') ? CbvWebAppUat_getSupervisorScript
        : CbvWebAppUat_getOperatorScript;
      var res = fn();
      var ok = !!(res && res.data && Array.isArray(res.data.steps) && res.data.steps.length > 0);
      addCheck('SCRIPT_' + role.toUpperCase(), ok, ok ? 'OK' : 'ERROR',
        role + ' script returns steps[]', { steps: res && res.data ? res.data.steps.length : 0 });
    } catch (eSc) {
      addCheck('SCRIPT_' + role.toUpperCase(), false, 'WARNING', role + ' script error: ' + (eSc && eSc.message ? eSc.message : String(eSc)), {});
    }
  });

  // 4. Feedback schema field coverage
  try {
    var fb = CbvWebAppUat_getFeedbackSchema();
    var fields = (fb && fb.data && Array.isArray(fb.data.fields)) ? fb.data.fields : [];
    var required = ['UAT_ID', 'SESSION_ID', 'TEST_DATE', 'TESTER_EMAIL', 'TESTER_ROLE', 'ROUTE', 'DEVICE_TYPE', 'SCENARIO', 'RESULT', 'SEVERITY', 'SPEED_RATING', 'USABILITY_RATING', 'CONFUSION_POINT', 'ERROR_MESSAGE', 'SUGGESTED_FIX', 'IS_BLOCKER', 'CREATED_AT'];
    var present = fields.map(function(f) { return f.name; });
    var missing = required.filter(function(r) { return present.indexOf(r) < 0; });
    addCheck('FEEDBACK_SCHEMA_FIELDS', missing.length === 0, missing.length === 0 ? 'OK' : 'ERROR',
      missing.length === 0 ? 'Feedback schema covers all 17 required fields.' : 'Feedback schema missing fields: ' + missing.join(', '),
      { missing: missing, fieldCount: fields.length });
  } catch (eFb) {
    addCheck('FEEDBACK_SCHEMA_FIELDS', false, 'WARNING', 'feedback schema error: ' + (eFb && eFb.message ? eFb.message : String(eFb)), {});
  }

  // 5. Triage matrix shape
  try {
    var tr = CbvWebAppUat_getIssueTriageMatrix();
    var levels = (tr && tr.data && Array.isArray(tr.data.levels)) ? tr.data.levels.map(function(l) { return l.severity; }) : [];
    var expected = ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW', 'OBSERVATION'];
    var missingLv = expected.filter(function(s) { return levels.indexOf(s) < 0; });
    addCheck('TRIAGE_LEVELS', missingLv.length === 0, missingLv.length === 0 ? 'OK' : 'ERROR',
      missingLv.length === 0 ? 'Triage matrix covers BLOCKER/HIGH/MEDIUM/LOW/OBSERVATION.' : 'Missing severity levels: ' + missingLv.join(', '),
      { levels: levels });
  } catch (eTr) {
    addCheck('TRIAGE_LEVELS', false, 'WARNING', 'triage matrix error: ' + (eTr && eTr.message ? eTr.message : String(eTr)), {});
  }

  // 6. Go/No-Go criteria shape
  try {
    var gn = CbvWebAppUat_getGoNoGoCriteria();
    var gnOk = !!(gn && gn.data && Array.isArray(gn.data.GO) && Array.isArray(gn.data.GO_WITH_WARNINGS) && Array.isArray(gn.data.NO_GO));
    addCheck('GO_NOGO_SHAPE', gnOk, gnOk ? 'OK' : 'ERROR',
      'Go/No-Go criteria contains GO / GO_WITH_WARNINGS / NO_GO lists.', { keys: gn && gn.data ? Object.keys(gn.data) : [] });
  } catch (eGn) {
    addCheck('GO_NOGO_SHAPE', false, 'WARNING', 'go/no-go error: ' + (eGn && eGn.message ? eGn.message : String(eGn)), {});
  }

  // 7. Phase 94 freeze dependency acknowledged
  var freezeLoaded = typeof CbvWebAppUiFreeze_getRouteFreezeMatrix === 'function';
  addCheck('PHASE_94_FREEZE_DEP', freezeLoaded, freezeLoaded ? 'OK' : 'WARNING',
    freezeLoaded ? 'Phase 94 freeze runtime present — UAT depends on it.' : 'Phase 94 freeze runtime missing — UAT cannot validate frozen route contract.', {});

  // 8. Handoff text safety
  var safetyText = CBV_WEBAPP_UAT_HANDOFF_PROMPT || '';
  ['No auto assign', 'No auto resolve', 'No auto escalate', 'No production claim', 'No drag-drop save'].forEach(function(needle) {
    var ok = safetyText.indexOf(needle) >= 0;
    addCheck('SAFETY_TEXT_' + needle.replace(/\s+/g, '_').replace(/-/g, '_').toUpperCase(), ok, ok ? 'OK' : 'ERROR',
      'Handoff requires phrase: ' + needle, { needle: needle });
  });

  var low = safetyText.toLowerCase();
  var hasProdReady = low.indexOf('production ready') >= 0 || low.indexOf('prod ready') >= 0;
  addCheck('NO_PROD_READY_CLAIM', !hasProdReady, !hasProdReady ? 'OK' : 'CRITICAL',
    hasProdReady ? 'Forbidden: production-ready claim detected.' : 'No production-ready claim.', {});
  var hasWriteActionRec = low.indexOf('recommend write action') >= 0 || low.indexOf('enable write action') >= 0;
  addCheck('NO_WRITE_ACTION_RECOMMEND', !hasWriteActionRec, !hasWriteActionRec ? 'OK' : 'CRITICAL',
    hasWriteActionRec ? 'Forbidden: write-action recommendation detected.' : 'No write-action recommendation.', {});
  var hasMutationRec = low.indexOf('recommend mutation') >= 0 || low.indexOf('enable mutation') >= 0;
  addCheck('NO_MUTATION_RECOMMEND', !hasMutationRec, !hasMutationRec ? 'OK' : 'CRITICAL',
    hasMutationRec ? 'Forbidden: mutation recommendation detected.' : 'No mutation recommendation.', {});
  var hasBotRec = low.indexOf('recommend appsheet bot') >= 0 || low.indexOf('enable appsheet bot') >= 0;
  addCheck('NO_APPSHEET_BOT_RECOMMEND', !hasBotRec, !hasBotRec ? 'OK' : 'CRITICAL',
    hasBotRec ? 'Forbidden: AppSheet Bot recommendation detected.' : 'No AppSheet Bot recommendation.', {});
  var hasAiRec = low.indexOf('recommend ai runtime') >= 0 || low.indexOf('enable ai runtime') >= 0;
  addCheck('NO_AI_RUNTIME_RECOMMEND', !hasAiRec, !hasAiRec ? 'OK' : 'CRITICAL',
    hasAiRec ? 'Forbidden: AI runtime recommendation detected.' : 'No AI runtime recommendation.', {});

  // 9. Phase 95 namespace must not introduce mutation functions (scoped scan).
  var vd = null;
  var phase95MutationProbe = [];
  var phase95NoMutation = true;
  try {
    vd = (typeof CbvWebAppUat_validate === 'function') ? CbvWebAppUat_validate() : null;
    if (vd && vd.data) {
      phase95NoMutation = !!vd.data.noMutationExposed;
      phase95MutationProbe = (vd.data.mutationProbe || []).slice();
    }
    if (vd && vd.warnings && vd.warnings.length) warnings = warnings.concat(vd.warnings);
    if (vd && vd.errors && vd.errors.length) errors = errors.concat(vd.errors);
  } catch (eMP) {
    warnings.push('NO_WRITE_MUTATION probe error: ' + (eMP && eMP.message ? eMP.message : String(eMP)));
  }
  addCheck('NO_WRITE_MUTATION', phase95NoMutation, phase95NoMutation ? 'OK' : 'ERROR',
    phase95NoMutation
      ? 'Phase 95 namespace does not introduce write mutations (scoped scan).'
      : 'Phase 95 namespace exposes mutation-like functions: ' + phase95MutationProbe.join(', '),
    { scope: 'CbvWebAppUat_*', probe: phase95MutationProbe });

  // 10. Compose status
  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: (typeof CBV_WEBAPP_UAT_PHASE_ID === 'string') ? CBV_WEBAPP_UAT_PHASE_ID : 'PHASE_95_WEBAPP_PILOT_UAT_STAFF_TRIAL_RUNBOOK',
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_WEBAPP_UAT_PHASE_95',
    summary: 'WebApp Pilot UAT readiness (Phase 95): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix Phase 95 errors (missing runtime / shape / mutation) and rerun CbvWebAppUat_TestConsole_run().'
      : 'Schedule the staff trial: run Admin / Supervisor / Operator UAT scripts, capture feedback per WEBAPP_UAT_FEEDBACK_SCHEMA, triage per WEBAPP_UAT_ISSUE_TRIAGE_MATRIX, then evaluate against WEBAPP_PILOT_GO_NO_GO_CRITERIA.',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: (typeof CBV_WEBAPP_UAT_CONTRACT_VERSION === 'string') ? CBV_WEBAPP_UAT_CONTRACT_VERSION : 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvWebAppUat_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 95 — WEBAPP PILOT UAT / STAFF TRIAL READINESS ===',
    'status=' + report.status,
    'severity=' + report.severity,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId,
    'checks=' + checks.length + ' warnings=' + warnings.length + ' errors=' + errors.length,
    'safety: No auto assign · No auto resolve · No auto escalate · No production claim · No drag-drop save'
  ].join('\n');

  CbvWebAppUat_TestConsole__storeLatestReport_(report);
  try { Logger.log(report.reportText); } catch (eLog) {}
  return report;
}

/* ------------------------------------------------------------------ */
/* Show / copy actions                                                 */
/* ------------------------------------------------------------------ */

function CbvWebAppUat_TestConsole__alert_(title, payload) {
  var s = JSON.stringify(payload, null, 2);
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert(title, s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CbvWebAppUat_TestConsole_showPilotScope() {
  var res;
  try { res = CbvWebAppUat_getPilotScope(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppUat_TestConsole__alert_('Phase 95 — Pilot Scope', res);
  return { ok: true };
}

function CbvWebAppUat_TestConsole_showAdminScript() {
  var res;
  try { res = CbvWebAppUat_getAdminScript(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppUat_TestConsole__alert_('Phase 95 — Admin UAT Script', res);
  return { ok: true };
}

function CbvWebAppUat_TestConsole_showSupervisorScript() {
  var res;
  try { res = CbvWebAppUat_getSupervisorScript(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppUat_TestConsole__alert_('Phase 95 — Supervisor UAT Script', res);
  return { ok: true };
}

function CbvWebAppUat_TestConsole_showOperatorScript() {
  var res;
  try { res = CbvWebAppUat_getOperatorScript(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppUat_TestConsole__alert_('Phase 95 — Operator UAT Script', res);
  return { ok: true };
}

function CbvWebAppUat_TestConsole_showFeedbackSchema() {
  var res;
  try { res = CbvWebAppUat_getFeedbackSchema(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppUat_TestConsole__alert_('Phase 95 — Feedback Schema', res);
  return { ok: true };
}

function CbvWebAppUat_TestConsole_showGoNoGoCriteria() {
  var res;
  try { res = CbvWebAppUat_getGoNoGoCriteria(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppUat_TestConsole__alert_('Phase 95 — Go/No-Go Criteria', res);
  return { ok: true };
}

function CbvWebAppUat_TestConsole_showHandoffPrompt() {
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert('Phase 95 — AI handoff prompt',
      CBV_WEBAPP_UAT_HANDOFF_PROMPT.substring(0, 1800),
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return { ok: true };
}

function CbvWebAppUat_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvWebAppUat_TestConsole__getLatestReport_();
  if (!r) {
    ui.alert('No report', 'Run "Run Pilot UAT Readiness Check" first, or execute CbvWebAppUat_TestConsole_run() in the script editor.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 95 — copy report');
  return { ok: true };
}
