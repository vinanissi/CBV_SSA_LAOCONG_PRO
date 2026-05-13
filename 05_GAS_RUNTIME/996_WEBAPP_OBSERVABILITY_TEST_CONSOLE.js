/**
 * PHASE_92 — WebApp Observability — Test Console (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Phase 92 — Observability
 *
 * Read-first only. No write mutation introduced. No auto-heal.
 * Safety phrases (must remain in report/handoff):
 *   - No auto-heal
 *   - No auto resolve
 *   - No auto escalate
 *   - No production claim
 */

var __CBV_WEBAPP_OBS_TC_LAST_REPORT = null;
var __CBV_WEBAPP_OBS_TC_LAST_REPORT_PROP_KEY = 'CBV_WEBAPP_OBS_TC_LAST_REPORT_JSON';

var CBV_WEBAPP_OBSERVABILITY_HANDOFF_PROMPT = [
  'PHASE 92 — WebApp Runtime Health / Report Viewer Pages',
  '',
  'Scope: read-first Operational Observability Layer (Runtime Health + Report Viewer).',
  'Constraints: no destructive write; no auto-heal / auto resolve / auto escalate;',
  'no AI runtime; no ENV-A; no queue intelligence; no production claim.',
  '',
  'Routes:',
  '  /runtime/health → CbvWebAppObservability_renderRuntimeHealth()',
  '  /reports        → CbvWebAppObservability_renderReportViewer()',
  '',
  'Sources: PropertiesService phase reports + SYSTEM_HEALTH_LOG + CBV_TEST_REPORTS (if present).',
  'Missing CBV_TEST_REPORTS is a WARNING, not a FAIL (read-first does not auto-create).',
  '',
  'Next: Phase 93 — WebApp Admin Reference Viewer / Settings Read-First.'
].join('\n');

/* ------------------------------------------------------------------ */
/* Report storage                                                      */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvWebAppObservability_TestConsole__storeLatestReport_(report) {
  try {
    __CBV_WEBAPP_OBS_TC_LAST_REPORT = report;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_WEBAPP_OBS_TC_LAST_REPORT_PROP_KEY, JSON.stringify(report || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvWebAppObservability_TestConsole__getLatestReport_() {
  if (__CBV_WEBAPP_OBS_TC_LAST_REPORT) return __CBV_WEBAPP_OBS_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_WEBAPP_OBS_TC_LAST_REPORT_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_WEBAPP_OBS_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Route bridge inspection                                             */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_TestConsole__bridgeFor_(routeMarker) {
  // Returns whether the registered placeholder dispatcher in 98_*.js
  // delegates to a Phase 92 renderer.
  var fnName = (routeMarker === 'runtime/health')
    ? 'CbvWebAppPilotRenderer_renderRuntimeHealthPlaceholder'
    : 'CbvWebAppPilotRenderer_renderReportsPlaceholder';
  var token = (routeMarker === 'runtime/health')
    ? 'CbvWebAppObservability_renderRuntimeHealth'
    : 'CbvWebAppObservability_renderReportViewer';
  try {
    var fn = (typeof this !== 'undefined') ? this[fnName] : null;
    if (typeof fn !== 'function') {
      return { ok: false, hint: 'Placeholder dispatcher ' + fnName + ' missing.' };
    }
    var src = fn.toString();
    var ok = src.indexOf(token) >= 0;
    return { ok: ok, hint: ok ? 'route delegates to Phase 92' : 'route does NOT call Phase 92 renderer' };
  } catch (e) {
    return { ok: false, hint: 'inspection error: ' + (e && e.message ? e.message : String(e)) };
  }
}

function CbvWebAppObservability_TestConsole__routeRegistered_(path) {
  try {
    if (typeof CbvWebAppWorkspace_routeRegistry !== 'function') return { ok: false, hint: 'route registry missing' };
    var reg = CbvWebAppWorkspace_routeRegistry() || [];
    var has = reg.some(function(r) { return r.route === path; });
    return { ok: has, hint: has ? path + ' registered' : path + ' not in registry' };
  } catch (e) {
    return { ok: false, hint: 'inspection error: ' + (e && e.message ? e.message : String(e)) };
  }
}

/* ------------------------------------------------------------------ */
/* Main runner                                                         */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WS92_')
    : ('WS92_' + new Date().getTime());

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

  // 1. Data function presence
  addCheck('DATA_RUNTIME_HEALTH', typeof CbvWebAppObservability_getRuntimeHealth === 'function', 'OK',
    'CbvWebAppObservability_getRuntimeHealth exists', {});
  addCheck('DATA_RECENT_REPORTS', typeof CbvWebAppObservability_getRecentReports === 'function', 'OK',
    'CbvWebAppObservability_getRecentReports exists', {});
  addCheck('DATA_REPORT_DETAIL', typeof CbvWebAppObservability_getReportDetail === 'function', 'OK',
    'CbvWebAppObservability_getReportDetail exists', {});
  addCheck('DATA_TRACE_SUMMARY', typeof CbvWebAppObservability_getTraceSummary === 'function', 'OK',
    'CbvWebAppObservability_getTraceSummary exists', {});
  addCheck('DATA_VALIDATE', typeof CbvWebAppObservability_validate === 'function', 'OK',
    'CbvWebAppObservability_validate exists', {});

  // 2. Renderer presence
  addCheck('RENDER_RUNTIME_HEALTH', typeof CbvWebAppObservability_renderRuntimeHealth === 'function', 'OK',
    'CbvWebAppObservability_renderRuntimeHealth exists', {});
  addCheck('RENDER_REPORT_VIEWER', typeof CbvWebAppObservability_renderReportViewer === 'function', 'OK',
    'CbvWebAppObservability_renderReportViewer exists', {});
  addCheck('RENDER_HEALTH_CARD', typeof CbvWebAppObservability_renderHealthCard_ === 'function', 'OK',
    'CbvWebAppObservability_renderHealthCard_ exists', {});
  addCheck('RENDER_REPORT_ROW', typeof CbvWebAppObservability_renderReportRow_ === 'function', 'OK',
    'CbvWebAppObservability_renderReportRow_ exists', {});
  addCheck('RENDER_STATE', typeof CbvWebAppObservability_renderState_ === 'function', 'OK',
    'CbvWebAppObservability_renderState_ exists', {});

  // 3. Route bridges
  var rhBridge = CbvWebAppObservability_TestConsole__bridgeFor_('runtime/health');
  addCheck('ROUTE_RUNTIME_HEALTH_BRIDGE', rhBridge.ok, rhBridge.ok ? 'OK' : 'WARNING',
    '/runtime/health bridge: ' + rhBridge.hint, rhBridge);
  var rpBridge = CbvWebAppObservability_TestConsole__bridgeFor_('reports');
  addCheck('ROUTE_REPORTS_BRIDGE', rpBridge.ok, rpBridge.ok ? 'OK' : 'WARNING',
    '/reports bridge: ' + rpBridge.hint, rpBridge);

  // 4. Routes registered
  var rhReg = CbvWebAppObservability_TestConsole__routeRegistered_('/runtime/health');
  addCheck('ROUTE_RUNTIME_HEALTH_REGISTERED', rhReg.ok, rhReg.ok ? 'OK' : 'ERROR',
    rhReg.hint, rhReg);
  var rpReg = CbvWebAppObservability_TestConsole__routeRegistered_('/reports');
  addCheck('ROUTE_REPORTS_REGISTERED', rpReg.ok, rpReg.ok ? 'OK' : 'ERROR',
    rpReg.hint, rpReg);

  // 5. Sheets visibility (warning-only when missing)
  var vd = null;
  try {
    vd = CbvWebAppObservability_validate();
    var ctrOk = !!(vd && vd.data && vd.data.sheets && vd.data.sheets.cbvTestReports);
    addCheck('CBV_TEST_REPORTS_PRESENT', ctrOk, ctrOk ? 'OK' : 'WARNING',
      ctrOk ? 'CBV_TEST_REPORTS sheet present.' : 'CBV_TEST_REPORTS sheet missing (Phase 92 treats this as WARNING, not FAIL).', {});
    var shlOk = !!(vd && vd.data && vd.data.sheets && vd.data.sheets.systemHealthLog);
    addCheck('SYSTEM_HEALTH_LOG_PRESENT', shlOk, shlOk ? 'OK' : 'WARNING',
      shlOk ? 'SYSTEM_HEALTH_LOG present.' : 'SYSTEM_HEALTH_LOG missing (warning only).', {});
    if (vd && vd.warnings && vd.warnings.length) warnings = warnings.concat(vd.warnings);
  } catch (eV) {
    addCheck('CBV_TEST_REPORTS_PRESENT', false, 'WARNING', 'validate() raised: ' + (eV && eV.message ? eV.message : String(eV)), {});
  }

  // 6. Data smoke (warning-only)
  try {
    if (typeof CbvWebAppObservability_getRuntimeHealth === 'function') {
      var rhRes = CbvWebAppObservability_getRuntimeHealth();
      var rhShape = !!(rhRes && rhRes.data && Array.isArray(rhRes.data.healthCards));
      addCheck('RUNTIME_HEALTH_SHAPE', rhShape, rhShape ? 'OK' : 'WARNING',
        'Runtime health returns { data: { healthCards: [], ... } }', { count: rhRes && rhRes.data ? rhRes.data.healthCards.length : 0 });
    }
    if (typeof CbvWebAppObservability_getRecentReports === 'function') {
      var repRes = CbvWebAppObservability_getRecentReports({ limit: 10 });
      var repShape = !!(repRes && repRes.data && Array.isArray(repRes.data.rows));
      addCheck('RECENT_REPORTS_SHAPE', repShape, repShape ? 'OK' : 'WARNING',
        'Recent reports returns { data: { rows: [] } }', { count: repRes && repRes.data ? repRes.data.count : 0 });
    }
    if (typeof CbvWebAppObservability_getTraceSummary === 'function') {
      var trRes = CbvWebAppObservability_getTraceSummary({ limit: 10 });
      var trShape = !!(trRes && trRes.data && Array.isArray(trRes.data.traces));
      addCheck('TRACE_SUMMARY_SHAPE', trShape, trShape ? 'OK' : 'WARNING',
        'Trace summary returns { data: { traces: [] } }', { count: trRes && trRes.data ? trRes.data.count : 0 });
    }
  } catch (eD) {
    addCheck('DATA_SMOKE', false, 'WARNING', 'data smoke error: ' + (eD && eD.message ? eD.message : String(eD)), {});
  }

  // 7. doGet exists; 999 dispatcher must be last in .clasp.json (verified locally).
  addCheck('FINAL_DOGET_DISPATCHER', typeof doGet === 'function', 'OK',
    'global doGet bound; .clasp.json filePushOrder must keep 999_WEBAPP_DOGET_DISPATCHER_FINAL last (verified locally).', {});

  // 8. All routes READ_FIRST
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

  // 9. Safety phrases + no production claim, no auto-heal recommendation
  var safetyText = [
    'No auto-heal',
    'No auto resolve',
    'No auto escalate',
    'No production claim'
  ].join('\n') + '\n' + CBV_WEBAPP_OBSERVABILITY_HANDOFF_PROMPT;

  ['No auto-heal', 'No auto resolve', 'No auto escalate', 'No production claim'].forEach(function(needle) {
    var ok = safetyText.indexOf(needle) >= 0;
    addCheck('SAFETY_' + needle.replace(/\s+/g, '_').replace(/-/g, '_').toUpperCase(), ok, ok ? 'OK' : 'ERROR',
      'Require phrase: ' + needle, { needle: needle });
  });

  var low = safetyText.toLowerCase();
  var hasAutoHealRecommend =
    low.indexOf('recommend auto-heal') >= 0 ||
    low.indexOf('enable auto-heal') >= 0 ||
    low.indexOf('auto-heal enabled') >= 0;
  addCheck('NO_AUTO_HEAL_RECOMMEND', !hasAutoHealRecommend, !hasAutoHealRecommend ? 'OK' : 'CRITICAL',
    hasAutoHealRecommend ? 'Forbidden: auto-heal recommendation detected.' : 'No auto-heal recommendation.', {});

  var hasProdReady = low.indexOf('production ready') >= 0 || low.indexOf('prod ready') >= 0;
  addCheck('NO_PROD_READY_CLAIM', !hasProdReady, !hasProdReady ? 'OK' : 'CRITICAL',
    hasProdReady ? 'Forbidden: production ready claim detected.' : 'No production-ready claim.', {});

  var hasDeleteReportRec = low.indexOf('enable delete report') >= 0 || low.indexOf('recommend delete report') >= 0;
  var hasEditReportRec = low.indexOf('enable edit report') >= 0 || low.indexOf('recommend edit report') >= 0;
  addCheck('NO_DELETE_REPORT_RECOMMEND', !hasDeleteReportRec, !hasDeleteReportRec ? 'OK' : 'CRITICAL',
    hasDeleteReportRec ? 'Forbidden: delete-report recommendation detected.' : 'No delete-report recommendation.', {});
  addCheck('NO_EDIT_REPORT_RECOMMEND', !hasEditReportRec, !hasEditReportRec ? 'OK' : 'CRITICAL',
    hasEditReportRec ? 'Forbidden: edit-report recommendation detected.' : 'No edit-report recommendation.', {});

  // 10. Phase 92 must not introduce write mutation functions (scoped scan).
  var phase92MutationProbe = [];
  var phase92NoMutation = true;
  try {
    var vForMutation = (vd && vd.data) ? vd : (typeof CbvWebAppObservability_validate === 'function' ? CbvWebAppObservability_validate() : null);
    if (vForMutation && vForMutation.data) {
      phase92NoMutation = !!vForMutation.data.noMutationExposed;
      phase92MutationProbe = (vForMutation.data.mutationProbe || []).slice();
    }
  } catch (eMP) {
    warnings.push('NO_WRITE_MUTATION probe error: ' + (eMP && eMP.message ? eMP.message : String(eMP)));
  }
  addCheck('NO_WRITE_MUTATION', phase92NoMutation, phase92NoMutation ? 'OK' : 'ERROR',
    phase92NoMutation
      ? 'Phase 92 namespace does not introduce write mutations (scoped scan).'
      : 'Phase 92 namespace exposes mutation-like functions: ' + phase92MutationProbe.join(', '),
    { scope: 'CbvWebAppObservability_*', probe: phase92MutationProbe });

  // 11. Compose status
  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: (typeof CBV_WEBAPP_OBSERVABILITY_PHASE_ID === 'string') ? CBV_WEBAPP_OBSERVABILITY_PHASE_ID : 'PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER',
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_WEBAPP_OBSERVABILITY_PHASE_92',
    summary: 'WebApp Observability (Phase 92): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix Phase 92 errors (missing function / route bridge / mutation) and rerun CbvWebAppObservability_TestConsole_run().'
      : 'Manually verify ?route=/runtime/health and ?route=/reports render with read-only cards. Then plan Phase 93 — WebApp Admin Reference Viewer / Settings Read-First.',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: (typeof CBV_WEBAPP_OBSERVABILITY_CONTRACT_VERSION === 'string') ? CBV_WEBAPP_OBSERVABILITY_CONTRACT_VERSION : 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvWebAppObservability_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 92 — WEBAPP RUNTIME HEALTH / REPORT VIEWER ===',
    'status=' + report.status,
    'severity=' + report.severity,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId,
    'checks=' + checks.length + ' warnings=' + warnings.length + ' errors=' + errors.length,
    'safety: No auto-heal · No auto resolve · No auto escalate · No production claim'
  ].join('\n');

  CbvWebAppObservability_TestConsole__storeLatestReport_(report);
  try { Logger.log(report.reportText); } catch (eLog) {}
  return report;
}

/* ------------------------------------------------------------------ */
/* Data peek + handoff + copy                                          */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_TestConsole__alert_(title, payload) {
  var s = JSON.stringify(payload, null, 2);
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert(title, s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CbvWebAppObservability_TestConsole_showRuntimeHealth() {
  var res;
  try { res = CbvWebAppObservability_getRuntimeHealth(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppObservability_TestConsole__alert_('Phase 92 — Runtime Health', res);
  return { ok: true };
}

function CbvWebAppObservability_TestConsole_showRecentReports() {
  var res;
  try { res = CbvWebAppObservability_getRecentReports({ limit: 20 }); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppObservability_TestConsole__alert_('Phase 92 — Recent Reports', res);
  return { ok: true };
}

function CbvWebAppObservability_TestConsole_showTraceSummary() {
  var res;
  try { res = CbvWebAppObservability_getTraceSummary({ limit: 20 }); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppObservability_TestConsole__alert_('Phase 92 — Trace Summary', res);
  return { ok: true };
}

function CbvWebAppObservability_TestConsole_showHandoffPrompt() {
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert('Phase 92 — AI handoff prompt',
      CBV_WEBAPP_OBSERVABILITY_HANDOFF_PROMPT.substring(0, 1800),
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return { ok: true };
}

function CbvWebAppObservability_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvWebAppObservability_TestConsole__getLatestReport_();
  if (!r) {
    ui.alert('No report', 'Run "Run Observability Health Check" first, or execute CbvWebAppObservability_TestConsole_run() in the script editor.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 92 — copy report');
  return { ok: true };
}
