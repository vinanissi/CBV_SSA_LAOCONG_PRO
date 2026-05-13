/**
 * PHASE_94 — WebApp UI Foundation Freeze / UAT Hardening — Test Console
 * Standard: CBV_TCS_V1
 *
 * Menu: 🧪 CBV Test Console → Phase 94 — UI Freeze / UAT
 *
 * Read-first only. No mutation introduced. No production claim.
 */

var __CBV_WEBAPP_UI_FREEZE_TC_LAST_REPORT = null;
var __CBV_WEBAPP_UI_FREEZE_TC_LAST_REPORT_PROP_KEY = 'CBV_WEBAPP_UI_FREEZE_TC_LAST_REPORT_JSON';

var CBV_WEBAPP_UI_FREEZE_HANDOFF_PROMPT = [
  'PHASE 94 — WebApp UI Foundation Freeze / UAT Hardening',
  '',
  'Scope: Freeze WebApp UI semantics, route contract, FE states, safety footer,',
  'and UAT checklist. No new feature. No mutation. No write actions.',
  '',
  'Frozen routes (READ_FIRST, PILOT):',
  '  /workspace, /home-alert/my-queue, /home-alert/sla,',
  '  /home-alert/timeline, /home-alert/kanban,',
  '  /runtime/health, /reports, /admin/reference',
  'Support endpoint:',
  '  ?action=ping (READ_ONLY) — handler 999_WEBAPP_DOGET_DISPATCHER_FINAL',
  '',
  'Safety phrases (must remain in renderers / reports):',
  '  No auto assign',
  '  No auto resolve',
  '  No auto escalate',
  '  No production claim',
  '  (Timeline/Kanban also: No drag-drop save)',
  '',
  'FE states: loading, empty, warning, error, partial, ready.',
  '',
  'Next: Phase 95 — WebApp Pilot UAT Runbook / Staff Trial.'
].join('\n');

/* ------------------------------------------------------------------ */
/* Report storage                                                      */
/* ------------------------------------------------------------------ */

function CbvWebAppUiFreeze_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvWebAppUiFreeze_TestConsole__storeLatestReport_(report) {
  try {
    __CBV_WEBAPP_UI_FREEZE_TC_LAST_REPORT = report;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_WEBAPP_UI_FREEZE_TC_LAST_REPORT_PROP_KEY, JSON.stringify(report || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvWebAppUiFreeze_TestConsole__getLatestReport_() {
  if (__CBV_WEBAPP_UI_FREEZE_TC_LAST_REPORT) return __CBV_WEBAPP_UI_FREEZE_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_WEBAPP_UI_FREEZE_TC_LAST_REPORT_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_WEBAPP_UI_FREEZE_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Main runner                                                         */
/* ------------------------------------------------------------------ */

function CbvWebAppUiFreeze_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WS94_')
    : ('WS94_' + new Date().getTime());

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

  // 1. Audit runtime presence
  addCheck('AUDIT_ROUTE_MATRIX', typeof CbvWebAppUiFreeze_getRouteFreezeMatrix === 'function', 'OK',
    'CbvWebAppUiFreeze_getRouteFreezeMatrix exists', {});
  addCheck('AUDIT_UI_STANDARD', typeof CbvWebAppUiFreeze_getUiStandard === 'function', 'OK',
    'CbvWebAppUiFreeze_getUiStandard exists', {});
  addCheck('AUDIT_UAT_CHECKLIST', typeof CbvWebAppUiFreeze_getUatChecklist === 'function', 'OK',
    'CbvWebAppUiFreeze_getUatChecklist exists', {});
  addCheck('AUDIT_VALIDATE', typeof CbvWebAppUiFreeze_validate === 'function', 'OK',
    'CbvWebAppUiFreeze_validate exists', {});

  // 2. Route freeze matrix shape + every frozen route present in registry
  var matrixData = null;
  try {
    var matrix = CbvWebAppUiFreeze_getRouteFreezeMatrix();
    matrixData = matrix && matrix.data ? matrix.data : null;
    var shape = !!(matrixData && Array.isArray(matrixData.routes));
    addCheck('ROUTE_MATRIX_SHAPE', shape, shape ? 'OK' : 'WARNING',
      'Route freeze matrix returns { data: { routes: [], supportEndpoints: [] } }', { count: matrixData ? matrixData.routes.length : 0 });
    if (matrixData && Array.isArray(matrixData.routes)) {
      matrixData.routes.forEach(function(r) {
        addCheck('ROUTE_REG_' + r.route.replace(/[^a-z0-9]+/gi, '_').toUpperCase(),
          r.isRegistered === true, r.isRegistered ? 'OK' : 'ERROR',
          r.isRegistered ? r.route + ' registered' : r.route + ' NOT registered',
          { mode: r.registeredMode, expected: r.mode });
        if (r.isRegistered) {
          var modeOk = r.registeredMode === r.mode;
          addCheck('ROUTE_MODE_' + r.route.replace(/[^a-z0-9]+/gi, '_').toUpperCase(),
            modeOk, modeOk ? 'OK' : 'ERROR',
            modeOk ? r.route + ' mode=' + r.mode : r.route + ' mode drift expected=' + r.mode + ' got=' + r.registeredMode,
            { expected: r.mode, got: r.registeredMode });
        }
      });
    }
    if (matrix && matrix.warnings) warnings = warnings.concat(matrix.warnings);
  } catch (eMx) {
    addCheck('ROUTE_MATRIX_SHAPE', false, 'WARNING', 'matrix error: ' + (eMx && eMx.message ? eMx.message : String(eMx)), {});
  }

  // 3. UI standard shape
  try {
    var uiStd = CbvWebAppUiFreeze_getUiStandard();
    var uiOk = !!(uiStd && uiStd.data && uiStd.data.pageHeader && Array.isArray(uiStd.data.nav) && Array.isArray(uiStd.data.states) && uiStd.data.safetyFooter && uiStd.data.readFirst && uiStd.data.responsive && uiStd.data.accessibility);
    addCheck('UI_STANDARD_SHAPE', uiOk, uiOk ? 'OK' : 'WARNING',
      'UI standard returns required keys (pageHeader/nav/states/safetyFooter/readFirst/responsive/accessibility)', { keys: uiOk ? Object.keys(uiStd.data) : [] });
    // Validate exact base safety phrases
    var basePhrases = (uiStd && uiStd.data && uiStd.data.safetyFooter && uiStd.data.safetyFooter.base) || [];
    ['No auto assign', 'No auto resolve', 'No auto escalate', 'No production claim'].forEach(function(phrase) {
      var has = basePhrases.indexOf(phrase) >= 0;
      addCheck('SAFETY_BASE_' + phrase.replace(/\s+/g, '_').toUpperCase(), has, has ? 'OK' : 'ERROR',
        'Safety footer requires phrase: ' + phrase, { phrase: phrase });
    });
    // Timeline/Kanban add drag-drop save prohibition
    var tkPhrases = (uiStd && uiStd.data && uiStd.data.safetyFooter && uiStd.data.safetyFooter.timelineKanban) || [];
    var hasDrag = tkPhrases.indexOf('No drag-drop save') >= 0;
    addCheck('SAFETY_TK_NO_DRAG_DROP', hasDrag, hasDrag ? 'OK' : 'ERROR',
      'Timeline/Kanban safety footer must include: No drag-drop save', {});
    // FE states
    var states = (uiStd && uiStd.data && uiStd.data.states) || [];
    ['loading', 'empty', 'warning', 'error', 'partial', 'ready'].forEach(function(s) {
      var has = states.indexOf(s) >= 0;
      addCheck('STATE_' + s.toUpperCase(), has, has ? 'OK' : 'ERROR',
        'FE state required: ' + s, { state: s });
    });
  } catch (eUi) {
    addCheck('UI_STANDARD_SHAPE', false, 'WARNING', 'ui standard error: ' + (eUi && eUi.message ? eUi.message : String(eUi)), {});
  }

  // 4. UAT checklist shape
  try {
    var uat = CbvWebAppUiFreeze_getUatChecklist();
    var uatOk = !!(uat && uat.data
      && Array.isArray(uat.data.routeSmoke)
      && Array.isArray(uat.data.dataVisibility)
      && Array.isArray(uat.data.warningStates)
      && Array.isArray(uat.data.noMutationUI)
      && Array.isArray(uat.data.responsive)
      && Array.isArray(uat.data.accessibility)
      && Array.isArray(uat.data.reportAudit)
      && Array.isArray(uat.data.governance));
    addCheck('UAT_CHECKLIST_SHAPE', uatOk, uatOk ? 'OK' : 'WARNING',
      'UAT checklist contains all required groups (routeSmoke, dataVisibility, warningStates, noMutationUI, responsive, accessibility, reportAudit, governance).', { keys: uat && uat.data ? Object.keys(uat.data) : [] });
  } catch (eUa) {
    addCheck('UAT_CHECKLIST_SHAPE', false, 'WARNING', 'uat checklist error: ' + (eUa && eUa.message ? eUa.message : String(eUa)), {});
  }

  // 5. All routes mode = READ_FIRST in the live registry
  try {
    if (typeof CbvWebAppWorkspace_routeRegistry === 'function') {
      var reg = CbvWebAppWorkspace_routeRegistry();
      var nonRead = (reg || []).filter(function(r) { return String(r.mode || '') !== 'READ_FIRST'; });
      addCheck('ALL_READ_FIRST', nonRead.length === 0, nonRead.length === 0 ? 'OK' : 'ERROR',
        'All routes mode=READ_FIRST', { nonRead: nonRead.map(function(x) { return x.route; }) });
    } else {
      addCheck('ALL_READ_FIRST', false, 'WARNING', 'route registry not loaded yet', {});
    }
  } catch (eR) {
    addCheck('ALL_READ_FIRST', false, 'WARNING', eR && eR.message ? eR.message : String(eR), {});
  }

  // 6. doGet exists; 999 dispatcher must be last in .clasp.json (verified locally).
  addCheck('FINAL_DOGET_DISPATCHER', typeof doGet === 'function', 'OK',
    'global doGet bound; .clasp.json filePushOrder must keep 999_WEBAPP_DOGET_DISPATCHER_FINAL last (verified locally + CLASP_PUSH_ORDER.md).', {});

  // 7. Safety phrases + forbidden recommendations on handoff text
  var safetyText = CBV_WEBAPP_UI_FREEZE_HANDOFF_PROMPT || '';
  ['No auto assign', 'No auto resolve', 'No auto escalate', 'No production claim', 'No drag-drop save'].forEach(function(needle) {
    var ok = safetyText.indexOf(needle) >= 0;
    addCheck('SAFETY_TEXT_' + needle.replace(/\s+/g, '_').replace(/-/g, '_').toUpperCase(), ok, ok ? 'OK' : 'ERROR',
      'Handoff requires phrase: ' + needle, { needle: needle });
  });

  var low = safetyText.toLowerCase();
  var hasProdReady = low.indexOf('production ready') >= 0 || low.indexOf('prod ready') >= 0;
  addCheck('NO_PROD_READY_CLAIM', !hasProdReady, !hasProdReady ? 'OK' : 'CRITICAL',
    hasProdReady ? 'Forbidden: production-ready claim detected.' : 'No production-ready claim.', {});
  var hasAutoHealRec = low.indexOf('recommend auto-heal') >= 0 || low.indexOf('enable auto-heal') >= 0 || low.indexOf('auto-heal enabled') >= 0;
  addCheck('NO_AUTO_HEAL_RECOMMEND', !hasAutoHealRec, !hasAutoHealRec ? 'OK' : 'CRITICAL',
    hasAutoHealRec ? 'Forbidden: auto-heal recommendation detected.' : 'No auto-heal recommendation.', {});
  var hasWriteActionRec = low.indexOf('recommend write action') >= 0 || low.indexOf('enable write action') >= 0;
  addCheck('NO_WRITE_ACTION_RECOMMEND', !hasWriteActionRec, !hasWriteActionRec ? 'OK' : 'CRITICAL',
    hasWriteActionRec ? 'Forbidden: write-action recommendation detected.' : 'No write-action recommendation.', {});
  var hasMutationRec = low.indexOf('recommend mutation') >= 0 || low.indexOf('enable mutation') >= 0;
  addCheck('NO_MUTATION_RECOMMEND', !hasMutationRec, !hasMutationRec ? 'OK' : 'CRITICAL',
    hasMutationRec ? 'Forbidden: mutation recommendation detected.' : 'No mutation recommendation.', {});
  var hasDragSaveRec = low.indexOf('recommend drag-drop save') >= 0 || low.indexOf('enable drag-drop save') >= 0;
  addCheck('NO_DRAG_DROP_SAVE_RECOMMEND', !hasDragSaveRec, !hasDragSaveRec ? 'OK' : 'CRITICAL',
    hasDragSaveRec ? 'Forbidden: drag-drop save recommendation detected.' : 'No drag-drop save recommendation.', {});

  // 8. Phase 94 must not introduce mutation functions (scoped scan via validator).
  var vd = null;
  var phase94MutationProbe = [];
  var phase94NoMutation = true;
  try {
    vd = (typeof CbvWebAppUiFreeze_validate === 'function') ? CbvWebAppUiFreeze_validate() : null;
    if (vd && vd.data) {
      phase94NoMutation = !!vd.data.noMutationExposed;
      phase94MutationProbe = (vd.data.mutationProbe || []).slice();
    }
    if (vd && vd.warnings && vd.warnings.length) warnings = warnings.concat(vd.warnings);
    if (vd && vd.errors && vd.errors.length) errors = errors.concat(vd.errors);
  } catch (eMP) {
    warnings.push('NO_WRITE_MUTATION probe error: ' + (eMP && eMP.message ? eMP.message : String(eMP)));
  }
  addCheck('NO_WRITE_MUTATION', phase94NoMutation, phase94NoMutation ? 'OK' : 'ERROR',
    phase94NoMutation
      ? 'Phase 94 namespace does not introduce write mutations (scoped scan).'
      : 'Phase 94 namespace exposes mutation-like functions: ' + phase94MutationProbe.join(', '),
    { scope: 'CbvWebAppUiFreeze_*', probe: phase94MutationProbe });

  // 9. Compose status
  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: (typeof CBV_WEBAPP_UI_FREEZE_PHASE_ID === 'string') ? CBV_WEBAPP_UI_FREEZE_PHASE_ID : 'PHASE_94_WEBAPP_UI_FOUNDATION_FREEZE_UAT_HARDENING',
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_WEBAPP_UI_FREEZE_PHASE_94',
    summary: 'WebApp UI Freeze (Phase 94): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix Phase 94 errors (missing route / mode drift / mutation) and rerun CbvWebAppUiFreeze_TestConsole_run().'
      : 'Run the manual route smoke (?action=ping plus 8 frozen routes), execute the UAT master checklist, then plan Phase 95 — WebApp Pilot UAT Runbook / Staff Trial.',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: (typeof CBV_WEBAPP_UI_FREEZE_CONTRACT_VERSION === 'string') ? CBV_WEBAPP_UI_FREEZE_CONTRACT_VERSION : 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvWebAppUiFreeze_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 94 — WEBAPP UI FOUNDATION FREEZE / UAT HARDENING ===',
    'status=' + report.status,
    'severity=' + report.severity,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId,
    'checks=' + checks.length + ' warnings=' + warnings.length + ' errors=' + errors.length,
    'safety: No auto assign · No auto resolve · No auto escalate · No production claim · No drag-drop save'
  ].join('\n');

  CbvWebAppUiFreeze_TestConsole__storeLatestReport_(report);
  try { Logger.log(report.reportText); } catch (eLog) {}
  return report;
}

/* ------------------------------------------------------------------ */
/* Data peek + handoff + copy                                          */
/* ------------------------------------------------------------------ */

function CbvWebAppUiFreeze_TestConsole__alert_(title, payload) {
  var s = JSON.stringify(payload, null, 2);
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert(title, s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CbvWebAppUiFreeze_TestConsole_showRouteFreezeMatrix() {
  var res;
  try { res = CbvWebAppUiFreeze_getRouteFreezeMatrix(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppUiFreeze_TestConsole__alert_('Phase 94 — Route Freeze Matrix', res);
  return { ok: true };
}

function CbvWebAppUiFreeze_TestConsole_showUiStandard() {
  var res;
  try { res = CbvWebAppUiFreeze_getUiStandard(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppUiFreeze_TestConsole__alert_('Phase 94 — UI Standard', res);
  return { ok: true };
}

function CbvWebAppUiFreeze_TestConsole_showUatChecklist() {
  var res;
  try { res = CbvWebAppUiFreeze_getUatChecklist(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppUiFreeze_TestConsole__alert_('Phase 94 — UAT Checklist', res);
  return { ok: true };
}

function CbvWebAppUiFreeze_TestConsole_showHandoffPrompt() {
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert('Phase 94 — AI handoff prompt',
      CBV_WEBAPP_UI_FREEZE_HANDOFF_PROMPT.substring(0, 1800),
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return { ok: true };
}

function CbvWebAppUiFreeze_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvWebAppUiFreeze_TestConsole__getLatestReport_();
  if (!r) {
    ui.alert('No report', 'Run "Run UI Freeze Health Check" first, or execute CbvWebAppUiFreeze_TestConsole_run() in the script editor.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 94 — copy report');
  return { ok: true };
}
