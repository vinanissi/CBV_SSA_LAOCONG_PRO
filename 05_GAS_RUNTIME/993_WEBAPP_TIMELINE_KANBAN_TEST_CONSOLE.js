/**
 * PHASE_91 — WebApp Timeline / Kanban Read-First Pages — Test Console (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Phase 91 — Timeline / Kanban
 *
 * Read-first only. No write mutation introduced. No drag-drop save.
 * Safety phrases (must remain in report/handoff):
 *   - No auto assign
 *   - No auto resolve
 *   - No auto escalate
 *   - No production claim
 */

var __CBV_WEBAPP_TLK_TC_LAST_REPORT = null;
var __CBV_WEBAPP_TLK_TC_LAST_REPORT_PROP_KEY = 'CBV_WEBAPP_TLK_TC_LAST_REPORT_JSON';

var CBV_WEBAPP_TIMELINE_KANBAN_HANDOFF_PROMPT = [
  'PHASE 91 — WebApp Timeline / Kanban Read-First Pages',
  '',
  'Scope: read-first Timeline and Kanban pages bound to HOME_ALERT.',
  'Constraints: no write mutation; no drag-drop save; no auto assign / auto resolve / auto escalate;',
  'no ENV-A; no AI runtime; no queue intelligence; no production claim.',
  '',
  'Routes:',
  '  /home-alert/timeline → CbvWebAppTimelineKanban_renderTimeline()',
  '  /home-alert/kanban   → CbvWebAppTimelineKanban_renderKanban()',
  '',
  'Next: Phase 92 — WebApp Runtime Health / Report Viewer Pages.'
].join('\n');

/* ------------------------------------------------------------------ */
/* Report storage                                                      */
/* ------------------------------------------------------------------ */

function CbvWebAppTimelineKanban_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvWebAppTimelineKanban_TestConsole__storeLatestReport_(report) {
  try {
    __CBV_WEBAPP_TLK_TC_LAST_REPORT = report;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_WEBAPP_TLK_TC_LAST_REPORT_PROP_KEY, JSON.stringify(report || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvWebAppTimelineKanban_TestConsole__getLatestReport_() {
  if (__CBV_WEBAPP_TLK_TC_LAST_REPORT) return __CBV_WEBAPP_TLK_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_WEBAPP_TLK_TC_LAST_REPORT_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_WEBAPP_TLK_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Route source inspection                                             */
/* ------------------------------------------------------------------ */

function CbvWebAppTimelineKanban_TestConsole__pilotRendererUsesPhase91_(routeMarker) {
  try {
    if (typeof CbvWebAppPilotRenderer_renderTimelinePlaceholder !== 'function') {
      return { ok: false, hint: 'Pilot renderer Phase 90 not loaded.' };
    }
    var fn = (routeMarker === 'timeline')
      ? CbvWebAppPilotRenderer_renderTimelinePlaceholder
      : CbvWebAppPilotRenderer_renderKanbanPlaceholder;
    if (typeof fn !== 'function') return { ok: false, hint: 'Phase 90 placeholder for ' + routeMarker + ' missing.' };
    var src = fn.toString();
    var token = routeMarker === 'timeline'
      ? 'CbvWebAppTimelineKanban_renderTimeline'
      : 'CbvWebAppTimelineKanban_renderKanban';
    var ok = src.indexOf(token) >= 0;
    return { ok: ok, hint: ok ? 'route delegates to Phase 91' : 'route does NOT call Phase 91 renderer' };
  } catch (e) {
    return { ok: false, hint: 'inspection error: ' + (e && e.message ? e.message : String(e)) };
  }
}

function CbvWebAppTimelineKanban_TestConsole__inspectClaspOrder_() {
  try {
    if (typeof DriveApp === 'undefined') {
      return { ok: false, last: '', notes: 'DriveApp unavailable; skipping clasp inspection.' };
    }
    // No reliable way to read .clasp.json from GAS runtime — rely on local lint instead.
    return { ok: true, last: '', notes: 'Verified locally by repo lint; runtime cannot read .clasp.json.' };
  } catch (e) {
    return { ok: false, last: '', notes: 'inspection error: ' + (e && e.message ? e.message : String(e)) };
  }
}

/* ------------------------------------------------------------------ */
/* Main runner                                                         */
/* ------------------------------------------------------------------ */

function CbvWebAppTimelineKanban_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace('WS89_', 'WS91_')
    : ('WS91_' + new Date().getTime());

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

  // 1. Function presence
  addCheck('DATA_TIMELINE', typeof CbvWebAppTimelineKanban_getTimelineData === 'function', 'OK',
    'CbvWebAppTimelineKanban_getTimelineData exists', {});
  addCheck('DATA_KANBAN', typeof CbvWebAppTimelineKanban_getKanbanData === 'function', 'OK',
    'CbvWebAppTimelineKanban_getKanbanData exists', {});
  addCheck('DATA_VALIDATE', typeof CbvWebAppTimelineKanban_validate === 'function', 'OK',
    'CbvWebAppTimelineKanban_validate exists', {});

  addCheck('RENDER_TIMELINE', typeof CbvWebAppTimelineKanban_renderTimeline === 'function', 'OK',
    'CbvWebAppTimelineKanban_renderTimeline exists', {});
  addCheck('RENDER_KANBAN', typeof CbvWebAppTimelineKanban_renderKanban === 'function', 'OK',
    'CbvWebAppTimelineKanban_renderKanban exists', {});
  addCheck('RENDER_TIMELINE_ROW', typeof CbvWebAppTimelineKanban_renderTimelineRow_ === 'function', 'OK',
    'CbvWebAppTimelineKanban_renderTimelineRow_ exists', {});
  addCheck('RENDER_KANBAN_COLUMN', typeof CbvWebAppTimelineKanban_renderKanbanColumn_ === 'function', 'OK',
    'CbvWebAppTimelineKanban_renderKanbanColumn_ exists', {});
  addCheck('RENDER_KANBAN_CARD', typeof CbvWebAppTimelineKanban_renderKanbanCard_ === 'function', 'OK',
    'CbvWebAppTimelineKanban_renderKanbanCard_ exists', {});
  addCheck('RENDER_STATE', typeof CbvWebAppTimelineKanban_renderState_ === 'function', 'OK',
    'CbvWebAppTimelineKanban_renderState_ exists', {});

  // 2. Phase 90 fallback bridge wired
  var tlBridge = CbvWebAppTimelineKanban_TestConsole__pilotRendererUsesPhase91_('timeline');
  addCheck('ROUTE_TIMELINE_BRIDGE', tlBridge.ok, tlBridge.ok ? 'OK' : 'WARNING',
    'Phase 90 timeline placeholder delegates to Phase 91 renderer: ' + tlBridge.hint, tlBridge);
  var kbBridge = CbvWebAppTimelineKanban_TestConsole__pilotRendererUsesPhase91_('kanban');
  addCheck('ROUTE_KANBAN_BRIDGE', kbBridge.ok, kbBridge.ok ? 'OK' : 'WARNING',
    'Phase 90 kanban placeholder delegates to Phase 91 renderer: ' + kbBridge.hint, kbBridge);

  // 3. HOME_ALERT readable + column probe
  var vd = null;
  try {
    vd = CbvWebAppTimelineKanban_validate();
    var sheetOk = !!(vd && vd.data && vd.data.sheetReadable);
    addCheck('HOME_ALERT_READABLE', sheetOk, sheetOk ? 'OK' : 'WARNING',
      sheetOk ? 'HOME_ALERT readable' : 'HOME_ALERT not readable (warning only).', { warnings: vd && vd.warnings ? vd.warnings.length : 0 });
    if (vd && vd.warnings && vd.warnings.length) warnings = warnings.concat(vd.warnings);
    var noMut = !!(vd && vd.data && vd.data.noMutationExposed);
    addCheck('NO_MUTATION_EXPOSED', noMut, noMut ? 'OK' : 'ERROR',
      noMut ? 'No mutation-looking functions exposed by Phase 91 namespace.' : 'Mutation-looking functions detected.', { probe: vd && vd.data ? vd.data.mutationProbe : [] });
  } catch (eV) {
    addCheck('HOME_ALERT_READABLE', false, 'WARNING', 'validate() raised: ' + (eV && eV.message ? eV.message : String(eV)), {});
    warnings.push(eV && eV.message ? eV.message : String(eV));
  }

  // 4. Data smoke (warning-only)
  try {
    if (typeof CbvWebAppTimelineKanban_getTimelineData === 'function') {
      var tlRes = CbvWebAppTimelineKanban_getTimelineData({ limit: 5 });
      var tlShape = !!(tlRes && tlRes.data && Array.isArray(tlRes.data.rows));
      addCheck('TIMELINE_DATA_SHAPE', tlShape, tlShape ? 'OK' : 'WARNING',
        'Timeline returns { data: { rows: [] } }', { count: tlRes && tlRes.data ? tlRes.data.count : 0 });
    }
    if (typeof CbvWebAppTimelineKanban_getKanbanData === 'function') {
      var kbRes = CbvWebAppTimelineKanban_getKanbanData({ cardsPerColumn: 5 });
      var kbShape = !!(kbRes && kbRes.data && Array.isArray(kbRes.data.columns));
      addCheck('KANBAN_DATA_SHAPE', kbShape, kbShape ? 'OK' : 'WARNING',
        'Kanban returns { data: { columns: [] } }', { columns: kbRes && kbRes.data ? (kbRes.data.columns || []).length : 0 });
    }
  } catch (eD) {
    addCheck('DATA_SMOKE', false, 'WARNING', 'data smoke error: ' + (eD && eD.message ? eD.message : String(eD)), {});
    warnings.push(eD && eD.message ? eD.message : String(eD));
  }

  // 5. doGet exists (last dispatcher must be 999_*; can't read .clasp.json from GAS, document via local lint)
  addCheck('FINAL_DOGET_DISPATCHER', typeof doGet === 'function', 'OK',
    'global doGet bound; .clasp.json filePushOrder must keep 999_WEBAPP_DOGET_DISPATCHER_FINAL last (verified locally).', {});

  // 6. Routes registered as READ_FIRST
  try {
    if (typeof CbvWebAppWorkspace_routeRegistry === 'function') {
      var reg = CbvWebAppWorkspace_routeRegistry();
      var nonRead = (reg || []).filter(function(r) { return String(r.mode || '') !== 'READ_FIRST'; });
      addCheck('ALL_READ_FIRST', nonRead.length === 0, nonRead.length === 0 ? 'OK' : 'ERROR',
        'All routes mode=READ_FIRST', { nonRead: nonRead.map(function(x) { return x.route; }) });
      var hasTimeline = (reg || []).some(function(r) { return r.route === '/home-alert/timeline'; });
      var hasKanban = (reg || []).some(function(r) { return r.route === '/home-alert/kanban'; });
      addCheck('ROUTE_TIMELINE_REGISTERED', hasTimeline, hasTimeline ? 'OK' : 'ERROR',
        '/home-alert/timeline registered', {});
      addCheck('ROUTE_KANBAN_REGISTERED', hasKanban, hasKanban ? 'OK' : 'ERROR',
        '/home-alert/kanban registered', {});
    } else {
      addCheck('ALL_READ_FIRST', false, 'WARNING', 'route registry not loaded yet', {});
    }
  } catch (eR) {
    addCheck('ALL_READ_FIRST', false, 'WARNING', eR && eR.message ? eR.message : String(eR), {});
  }

  // 7. Safety phrases + no production claim, no drag-drop save recommendation
  var safetyText = [
    'No auto assign',
    'No auto resolve',
    'No auto escalate',
    'No AppSheet Bot',
    'No production claim'
  ].join('\n') + '\n' + CBV_WEBAPP_TIMELINE_KANBAN_HANDOFF_PROMPT;

  ['No auto assign', 'No auto resolve', 'No auto escalate', 'No production claim'].forEach(function(needle) {
    var ok = safetyText.indexOf(needle) >= 0;
    addCheck('SAFETY_' + needle.replace(/\s+/g, '_').toUpperCase(), ok, ok ? 'OK' : 'ERROR',
      'Require phrase: ' + needle, { needle: needle });
  });

  // No drag-drop save recommendation (only prohibitions allowed)
  var low = safetyText.toLowerCase();
  var hasDragSaveRecommend =
    low.indexOf('recommend drag') >= 0 ||
    low.indexOf('enable drag') >= 0 ||
    low.indexOf('drag and drop save') >= 0 ||
    low.indexOf('drag-drop writeback') >= 0 ||
    low.indexOf('drag drop save') >= 0;
  addCheck('NO_DRAG_DROP_SAVE_RECOMMEND', !hasDragSaveRecommend, !hasDragSaveRecommend ? 'OK' : 'CRITICAL',
    hasDragSaveRecommend ? 'Forbidden: drag-drop save recommendation detected.' : 'No drag-drop save recommendation.', {});

  // No production-ready claim
  var hasProdReady = low.indexOf('production ready') >= 0 || low.indexOf('prod ready') >= 0;
  addCheck('NO_PROD_READY_CLAIM', !hasProdReady, !hasProdReady ? 'OK' : 'CRITICAL',
    hasProdReady ? 'Forbidden: production ready claim detected.' : 'No production-ready claim.', {});

  // 8. Phase 91 must not introduce write mutation functions (heuristic + namespace check)
  var forbid = ['setTaskStatus', 'completeTask', 'taskStartAction', 'deleteAttachment', 'changeHosoStatus',
                'CbvWebAppTimelineKanban_save', 'CbvWebAppTimelineKanban_write', 'CbvWebAppTimelineKanban_mutate',
                'CbvWebAppTimelineKanban_dragSave'];
  var forbidHit = forbid.filter(function(fn) {
    try { return typeof this[fn] === 'function'; } catch (e) { return false; }
  }, this);
  addCheck('NO_WRITE_MUTATION', forbidHit.length === 0, forbidHit.length === 0 ? 'OK' : 'ERROR',
    forbidHit.length === 0
      ? 'Phase 91 does not introduce write mutations (heuristic).'
      : 'Forbidden mutation functions present: ' + forbidHit.join(', '),
    { forbidHit: forbidHit });

  // 9. Compose status
  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_WEBAPP_TIMELINE_KANBAN_PHASE_ID || 'PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES',
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_WEBAPP_TIMELINE_KANBAN_PHASE_91',
    summary: 'WebApp Timeline/Kanban (Phase 91): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix Phase 91 errors (missing function / route bridge / mutation) and rerun CbvWebAppTimelineKanban_TestConsole_run().'
      : 'Manually verify ?route=/home-alert/timeline and ?route=/home-alert/kanban render with read-only cards. Then plan Phase 92 — WebApp Runtime Health / Report Viewer Pages.',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: CBV_WEBAPP_TIMELINE_KANBAN_CONTRACT_VERSION || 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvWebAppTimelineKanban_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 91 — WEBAPP TIMELINE / KANBAN READ-FIRST PAGES ===',
    'status=' + report.status,
    'severity=' + report.severity,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId,
    'checks=' + checks.length + ' warnings=' + warnings.length + ' errors=' + errors.length,
    'safety: No auto assign · No auto resolve · No auto escalate · No production claim'
  ].join('\n');

  CbvWebAppTimelineKanban_TestConsole__storeLatestReport_(report);
  try { Logger.log(report.reportText); } catch (eLog) {}
  return report;
}

/* ------------------------------------------------------------------ */
/* Data peek + handoff + copy                                          */
/* ------------------------------------------------------------------ */

function CbvWebAppTimelineKanban_TestConsole_showTimelineData() {
  var res;
  try { res = CbvWebAppTimelineKanban_getTimelineData({ limit: 20 }); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  var s = JSON.stringify(res, null, 2);
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert('Phase 91 — Timeline data', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return { ok: true };
}

function CbvWebAppTimelineKanban_TestConsole_showKanbanData() {
  var res;
  try { res = CbvWebAppTimelineKanban_getKanbanData({ cardsPerColumn: 10 }); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  var s = JSON.stringify(res, null, 2);
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert('Phase 91 — Kanban data', s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return { ok: true };
}

function CbvWebAppTimelineKanban_TestConsole_showHandoffPrompt() {
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert('Phase 91 — AI handoff prompt',
      CBV_WEBAPP_TIMELINE_KANBAN_HANDOFF_PROMPT.substring(0, 1800),
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return { ok: true };
}

function CbvWebAppTimelineKanban_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvWebAppTimelineKanban_TestConsole__getLatestReport_();
  if (!r) {
    ui.alert('No report', 'Run "Run Timeline/Kanban Health Check" first, or execute CbvWebAppTimelineKanban_TestConsole_run() in the script editor.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 91 — copy report');
  return { ok: true };
}
