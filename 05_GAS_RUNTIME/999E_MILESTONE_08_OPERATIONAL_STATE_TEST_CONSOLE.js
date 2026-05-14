/**
 * MILESTONE_08 — Operational State Runtime — Full test (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → M08 — Run Operational State Runtime Test
 *
 * Depends: 999D, 999A, 998P, 998L, 998Y, 999B, 999C patterns
 */

/** M08 markers — pre-commit: strings must stay findable in this file (scripts/cbv-marker-contract-self-check.mjs). */
var CBV_TCS_M08_OPERATIONAL_STATE_UI_MARKERS = [
  'cbv-m08-ops-state-root',
  'cbv-m08-state-engine',
  'cbv-m08-state-registry',
  'cbv-m08-transition-contract',
  'cbv-m08-transition-validator',
  'cbv-m08-operational-timeline',
  'cbv-m08-timeline-empty-state',
  'cbv-m08-sla-runtime',
  'cbv-m08-sla-warning',
  'cbv-m08-today-state-dashboard',
  'cbv-m08-supervisor-state-runtime',
  'cbv-m08-event-hook-safe-disabled',
  'cbv-m08-taskid-missing-fallback',
  'cbv-m08-route-query-param-safe',
  'cbv-m08-empty-state',
  'cbv-m08-report-envelope',
  'cbv-m08-operational-state-empty'
];

var __CBV_TCS_MILESTONE08_TC_LAST_REPORT = null;
var __CBV_TCS_MILESTONE08_TC_LAST_PROP_KEY = 'CBV_TCS_MILESTONE08_TC_LAST_REPORT_JSON';

function CbvTcsMilestone08OperationalState_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_MILESTONE08_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_MILESTONE08_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsMilestone08__buildEvidenceHtml_(checks) {
  var failed = (checks || []).filter(function (c) { return c && c.ok === false; });
  var rows = failed.map(function (c) {
    return '<tr><td>' + String(c.code || '').replace(/</g, '&lt;') + '</td><td>' + String(c.severity || '').replace(/</g, '&lt;') + '</td><td>' + String(c.message || '').replace(/</g, '&lt;') + '</td></tr>';
  }).join('');
  var markerRow = '<div class="' + CBV_TCS_M08_OPERATIONAL_STATE_UI_MARKERS.join(' ') + '" data-cbv-m08-evidence-probe="1" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)"></div>';
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>MILESTONE_08 Evidence</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>' +
    markerRow +
    '<h1>MILESTONE_08 — Operational State Runtime</h1>' +
    (failed.length ? ('<table><thead><tr><th>code</th><th>severity</th><th>message</th></tr></thead><tbody>' + rows + '</tbody></table>') : '<p>No failed checks.</p>') +
    '</body></html>';
}

function CbvTcsMilestone08__buildAiHandoffMd_(draft, traceId) {
  return [
    '# AI Handoff — Milestone 08 (Operational State Runtime)',
    '',
    '**finalStatus:** `' + draft.status + '`',
    '**envelopeOk:** `' + String(draft.envelopeOk) + '`',
    '**traceId:** `' + traceId + '`',
    '',
    draft.status === 'FAIL' ? '## Outcome: FAIL\n' : '## Outcome\n',
    (draft.checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) {
      return '- **' + c.code + '** (' + c.severity + '): ' + c.message;
    }).join('\n') || '- (none)',
    '',
    '## Next',
    String(draft.nextStep || '')
  ].join('\n');
}

function CbvTcsMilestone08__tryAppendTestReportSheet_(draft) {
  try {
    if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getActiveSpreadsheet) return { ok: false, skipped: 'no_runtime' };
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return { ok: false, skipped: 'no_ss' };
    var sh = ss.getSheetByName('CBV_TEST_REPORTS');
    if (!sh) return { ok: false, skipped: 'sheet_missing' };
    sh.appendRow([
      new Date(),
      String(draft.traceId || ''),
      String(draft.phase || ''),
      String(draft.status || ''),
      String(draft.envelopeOk),
      String(draft.summary || '').substring(0, 4000)
    ]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsMilestone08__viValidateDetail_(vu) {
  if (!vu) {
    return { viOk: false, note: 'CbvWebAppVi_validate returned null', errorCount: 1, warningCount: 0 };
  }
  var d = vu.data || {};
  var errs = vu.errors || [];
  var warns = vu.warnings || [];
  return {
    viOk: vu.ok === true,
    canonicalOk: d.canonicalOk === true,
    noMutationExposed: d.noMutationExposed === true,
    missingRoutes: (d.missingRoutes || []).slice(),
    missingLabels: (d.missingLabels || []).slice(),
    errorCount: errs.length,
    warningCount: warns.length,
    errorsSample: errs.slice(0, 6),
    warningsSample: warns.slice(0, 4)
  };
}

/**
 * One-click Milestone 08 Operational State + Drive 6-file bundle (append-only).
 */
function CbvTcsMilestone08OperationalState_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSM08_')
    : ('WSM08_' + new Date().getTime());

  var checks = [];
  var externalWarnings = [];

  function addCheck(code, ok, severity, message, detail) {
    var sev;
    if (ok) sev = severity || 'OK';
    else {
      if (severity === 'WARNING' || severity === 'ERROR' || severity === 'CRITICAL') sev = severity;
      else sev = 'ERROR';
    }
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
  }

  try {
    var e1 = { parameter: { route: '/workspace/staff/task-detail?taskId=M08ABC' } };
    var p1 = (typeof CbvWebAppRoute_parseRouteAndParams_ === 'function') ? CbvWebAppRoute_parseRouteAndParams_(e1.parameter.route, e1) : null;
    var ok1 = p1 && p1.route === '/workspace/staff/task-detail' && String(p1.params.taskId || '') === 'M08ABC';
    addCheck('M08_ROUTE_QUERY_PARAM_SAFE', ok1, ok1 ? 'OK' : 'ERROR', 'Inner ?taskId= preserved on staff task-detail route', p1 || {});
  } catch (eR) {
    addCheck('M08_ROUTE_QUERY_PARAM_SAFE', false, 'ERROR', String(eR), {});
  }

  var reg = (typeof CbvOpsState_getRegistry_ === 'function') ? CbvOpsState_getRegistry_() : [];
  var need = ['TODO', 'READY', 'IN_PROGRESS', 'WAITING', 'BLOCKED', 'REVIEW', 'DONE', 'CANCELLED'];
  var miss = need.filter(function (s) { return reg.indexOf(s) < 0; });
  addCheck('M08_STATE_REGISTRY_EXISTS', miss.length === 0, miss.length === 0 ? 'OK' : 'ERROR', 'Operational state registry', { missing: miss, reg: reg });

  var c0 = (typeof CbvOpsState_previewTransition_ === 'function')
    ? CbvOpsState_previewTransition_({
      fromState: 'TODO',
      toState: 'READY',
      actor: 't',
      reason: 'r',
      traceId: traceId,
      taskId: 'T1',
      source: 'test'
    })
    : null;
  var needC = ['fromState', 'toState', 'allowed', 'actor', 'reason', 'timestamp', 'traceId', 'taskId', 'source', 'warnings', 'errors'];
  var missC = needC.filter(function (k) { return !c0 || c0[k] === undefined; });
  addCheck('M08_TRANSITION_CONTRACT_EXISTS', missC.length === 0, missC.length === 0 ? 'OK' : 'ERROR', 'Transition contract fields', { missing: missC, sample: c0 });

  var dummy = { taskId: 'D1', status: 'TODO', note: 'x' };
  var snap = JSON.stringify(dummy);
  var badTr = (typeof CbvOpsState_previewTransition_ === 'function')
    ? CbvOpsState_previewTransition_({ fromState: 'TODO', toState: 'DONE', actor: 'a', reason: 'x', traceId: traceId, taskId: 'D1', source: 't' })
    : { allowed: true };
  var goodTr = (typeof CbvOpsState_previewTransition_ === 'function')
    ? CbvOpsState_previewTransition_({ fromState: 'TODO', toState: 'READY', actor: 'a', reason: 'x', traceId: traceId, taskId: 'D1', source: 't' })
    : { allowed: false };
  var after = JSON.stringify(dummy);
  var safe = snap === after && badTr.allowed === false && goodTr.allowed === true;
  addCheck('M08_TRANSITION_VALIDATOR_SAFE', safe, safe ? 'OK' : 'ERROR', 'Preview does not mutate caller objects; invalid blocked; valid allowed', { badAllowed: badTr.allowed, goodAllowed: goodTr.allowed });

  var stMem = (typeof CbvOpsStateTimeline_createMemoryStore_ === 'function') ? CbvOpsStateTimeline_createMemoryStore_() : { events: [] };
  var a1 = (typeof CbvOpsStateTimeline_appendPreview_ === 'function')
    ? CbvOpsStateTimeline_appendPreview_(stMem, { type: 'CREATED', actor: 'u', traceId: traceId, taskId: 'T1' })
    : { ok: false };
  var a2 = (typeof CbvOpsStateTimeline_appendPreview_ === 'function')
    ? CbvOpsStateTimeline_appendPreview_(stMem, { type: 'COMMENTED', actor: 'u', traceId: traceId, taskId: 'T1' })
    : { ok: false };
  var appendOnly = a1.ok === true && a2.ok === true && stMem.events && stMem.events.length === 2 && stMem.events[0].type === 'CREATED';
  addCheck('M08_TIMELINE_APPEND_ONLY_MODEL', appendOnly, appendOnly ? 'OK' : 'ERROR', 'Timeline append-only with type/timestamp/actor/traceId', { len: stMem.events ? stMem.events.length : -1 });

  var tlHtml = (typeof CbvOpsStateTimeline_renderHtml_ === 'function') ? CbvOpsStateTimeline_renderHtml_({ events: [] }) : '';
  var emptyOk = tlHtml.indexOf('cbv-m08-timeline-empty-state') >= 0;
  addCheck('M08_TIMELINE_EMPTY_STATE', emptyOk, emptyOk ? 'OK' : 'ERROR', 'Empty timeline shows empty marker', { len: tlHtml.length });

  var sla = (typeof CbvOpsState_runSlaRuntime_ === 'function')
    ? CbvOpsState_runSlaRuntime_({ opState: 'REVIEW', dueAt: new Date(Date.now() - 86400000).toISOString() })
    : { severity: 'X' };
  var slaSevOk = sla && sla.severity && sla.warningOnly === true;
  addCheck('M08_SLA_RUNTIME_EXISTS', slaSevOk, slaSevOk ? 'OK' : 'ERROR', 'SLA runtime returns severity + warningOnly', sla);

  var esc = sla && sla.autoEscalation === false && sla.warningOnly === true;
  addCheck('M08_SLA_WARNING_ONLY', esc, esc ? 'OK' : 'ERROR', 'SLA path does not auto-escalate', { autoEscalation: sla && sla.autoEscalation });

  var dash = (typeof CbvOpsState_renderTodayDashboardHtml_ === 'function') ? CbvOpsState_renderTodayDashboardHtml_({ workboardCounts: {}, workboardGroups: {} }) : '';
  var missDash = CBV_TCS_M08_OPERATIONAL_STATE_UI_MARKERS.filter(function (mk) { return dash.indexOf(mk) < 0; });
  addCheck('M08_TODAY_STATE_DASHBOARD_MARKERS', missDash.length === 0, missDash.length === 0 ? 'OK' : 'ERROR', 'Dashboard HTML includes all M08 markers', { missing: missDash });

  var sup = (typeof CbvOpsState_buildSupervisorSummaryReadOnly_ === 'function')
    ? CbvOpsState_buildSupervisorSummaryReadOnly_([{ taskId: 'A', status: 'BLOCKED', assignedTo: 'u1' }])
    : {};
  var supOk = sup && sup.readOnly === true && Array.isArray(sup.blockedTaskIds);
  addCheck('M08_SUPERVISOR_STATE_RUNTIME', supOk, supOk ? 'OK' : 'ERROR', 'Supervisor summary read-only', sup);

  var hook = (typeof CbvOpsState_emitEventHookStub_ === 'function') ? CbvOpsState_emitEventHookStub_('task_blocked', { x: 1 }) : {};
  var hookOk = hook && hook.dispatched === false && String(hook.mode || '').indexOf('SAFE') >= 0;
  addCheck('M08_EVENT_HOOK_SAFE_DISABLED', hookOk, hookOk ? 'OK' : 'ERROR', 'Event hook stub stays safe-disabled', hook);

  try {
    var pfStates = ['HAS_DATA', 'EMPTY_DATA', 'APPSHEET_UNCONFIGURED', 'MISSING_TASKID', 'QUERY_PARAM_ROUTE'];
    var pfRes = CbvUiMarkerPreflight_runContract_({
      requiredMarkers: CBV_TCS_M08_OPERATIONAL_STATE_UI_MARKERS,
      states: pfStates,
      renderer: function (st) {
        var pr = {
          __preflightState: String(st || ''),
          taskId: st === 'MISSING_TASKID' ? '' : 'M08_TID',
          route: '/workspace/workboard',
          workboardCounts: { urgent: 0, mine: 0 },
          workboardGroups: {}
        };
        return (typeof CbvOpsState_renderTodayDashboardHtml_ === 'function') ? CbvOpsState_renderTodayDashboardHtml_(pr) : '';
      }
    });
    var pfOk = pfRes && pfRes.ok === true;
    addCheck(
      'M08_MARKER_PREFLIGHT',
      pfOk,
      pfOk ? 'OK' : 'ERROR',
      'M08 markers present for every probe state',
      { missingMarkersUnion: pfRes.missingMarkersUnion, statesChecked: pfRes.statesChecked }
    );
  } catch (ePf) {
    addCheck('M08_MARKER_PREFLIGHT', false, 'ERROR', String(ePf), {});
  }

  try {
    var pg = (typeof CbvStaffWorkboard_renderPage_ === 'function') ? CbvStaffWorkboard_renderPage_({}) : { bodyHtml: '' };
    var html = String((pg && pg.bodyHtml) || '');
    var missW = CBV_TCS_M08_OPERATIONAL_STATE_UI_MARKERS.filter(function (mk) { return html.indexOf(mk) < 0; });
    addCheck('M08_MARKERS_ON_WORKBOARD_PAGE', missW.length === 0, missW.length === 0 ? 'OK' : 'ERROR', 'Staff workboard embeds M08 section markers', { missing: missW, htmlLen: html.length });
  } catch (eW) {
    addCheck('M08_MARKERS_ON_WORKBOARD_PAGE', false, 'ERROR', String(eW), {});
  }

  var m07Markers = (typeof CBV_TCS_M07_LIVE_BRIDGE_UI_MARKERS !== 'undefined') ? CBV_TCS_M07_LIVE_BRIDGE_UI_MARKERS : [];
  if (!m07Markers.length) {
    m07Markers = [
      'cbv-m07-appsheet-live-bridge-root',
      'cbv-m07-appsheet-config-runtime',
      'cbv-m07-appsheet-safe-disabled',
      'cbv-m07-deeplink-builder',
      'cbv-m07-context-handoff',
      'cbv-m07-upload-runtime',
      'cbv-m07-feedback-runtime',
      'cbv-m07-return-workboard',
      'cbv-m07-appsheet-health-runtime',
      'cbv-m07-route-query-param-safe',
      'cbv-m07-taskid-missing-fallback',
      'cbv-m07-empty-state',
      'cbv-m07-report-envelope',
      'cbv-appsheet-live-bridge-safe-disabled'
    ];
  }
  try {
    var pg7 = (typeof CbvStaffWorkboard_renderPage_ === 'function') ? CbvStaffWorkboard_renderPage_({}) : { bodyHtml: '' };
    var h7 = String((pg7 && pg7.bodyHtml) || '');
    var miss7 = m07Markers.filter(function (mk) { return h7.indexOf(mk) < 0; });
    addCheck('REGRESSION_M07_APPSHEET_LIVE_BRIDGE', miss7.length === 0, miss7.length === 0 ? 'OK' : 'ERROR', 'M07 ribbon markers still on workboard', { missing: miss7 });
  } catch (e7) {
    addCheck('REGRESSION_M07_APPSHEET_LIVE_BRIDGE', false, 'ERROR', String(e7), {});
  }

  try {
    var regR = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (regR || []).map(function (r) { return r.route; });
    addCheck('REGRESSION_M06_WORKBOARD', paths.indexOf('/workspace/workboard') >= 0, 'OK', 'M06 workboard route', {});
    addCheck('REGRESSION_M05_SOP', paths.indexOf('/workspace/sop') >= 0, 'OK', 'M05 SOP', {});
    addCheck('REGRESSION_M04_FOCUS', paths.indexOf('/workspace/focus') >= 0, 'OK', 'M04 focus', {});
  } catch (eRg) {
    addCheck('REGRESSION_M06_WORKBOARD', false, 'ERROR', String(eRg), {});
  }

  addCheck('UI_MARKER_PREFLIGHT_RUNTIME', typeof CbvUiMarkerPreflight_runContract_ === 'function', 'OK', 'CbvUiMarkerPreflight_runContract_', {});

  var sheetProbe = { present: false };
  try {
    if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getActiveSpreadsheet) {
      var ssP = SpreadsheetApp.getActiveSpreadsheet();
      sheetProbe.present = !!(ssP && ssP.getSheetByName('CBV_TEST_REPORTS'));
    }
  } catch (eSh) {
    sheetProbe.error = eSh && eSh.message ? eSh.message : String(eSh);
  }
  addCheck(
    'M08_TEST_REPORTS_BOOTSTRAP',
    sheetProbe.present === true,
    sheetProbe.present ? 'OK' : 'WARNING',
    sheetProbe.present ? 'CBV_TEST_REPORTS sheet present (append-only row written after finalize).' : 'CBV_TEST_REPORTS missing — sheet bootstrap optional; Drive bundle still primary evidence.',
    sheetProbe
  );

  var vu = null;
  try {
    vu = (typeof CbvWebAppVi_validate === 'function') ? CbvWebAppVi_validate() : null;
    var viDetail = CbvTcsMilestone08__viValidateDetail_(vu);
    addCheck('VI_VALIDATE', vu && vu.ok === true, vu && vu.ok ? 'OK' : 'ERROR', 'CbvWebAppVi_validate', viDetail);
    if (vu && vu.warnings) vu.warnings.forEach(function (w) { externalWarnings.push('VI_VALIDATE: ' + w); });
  } catch (eV) {
    addCheck('VI_VALIDATE', false, 'WARNING', String(eV), {});
  }

  addCheck('DRIVE_BUNDLE_FN', typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function', 'OK', 'CbvTcsDriveReport_exportMilestoneFullTestBundle', {});

  var now = (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date();
  var runBy = (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : '');

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['M01_FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P before 999E.' };

  var reportText = [
    '=== MILESTONE_08 — OPERATIONAL STATE RUNTIME TEST ===',
    'traceId=' + traceId,
    'runStatus=' + runFin.status,
    'runOk=' + String(runFin.ok),
    'failedChecks=' + JSON.stringify((checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) { return c.code; }))
  ].join('\n');

  var draft = {
    ok: runFin.ok,
    phase: 'MILESTONE_08_OPERATIONAL_STATE_RUNTIME',
    status: runFin.status,
    checkedAt: now,
    runBy: runBy,
    traceId: traceId,
    testSuite: 'MILESTONE_08_OPERATIONAL_STATE_RUNTIME',
    summary: 'Milestone 08 operational state test (pre-envelope): ' + runFin.status + ' (' + runFin.severity + ')',
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep,
    severity: runFin.severity,
    reportText: reportText,
    reportJson: { driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '', milestone08: true },
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false
  };

  var keysOk = (typeof CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_ === 'function')
    ? CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_(draft).ok
    : false;
  var ic = (typeof CbvTcsMilestone01OpWorkspace__validateAllCheckItems_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__validateAllCheckItems_(checks)
    : { ok: false, bad: ['validator_missing'] };
  addCheck('CHECK_ITEM_CONTRACT', ic.ok === true, ic.ok ? 'OK' : 'ERROR', 'Each check row has code/ok/severity/message/detail', { bad: ic.bad || [] });

  var structCore = keysOk === true && ic.ok === true && String(reportText || '').trim().length > 0;
  var envelopeRowOk = structCore === true && runFin.status !== 'FAIL';

  checks.push({
    code: 'REPORT_ENVELOPE',
    ok: envelopeRowOk === true,
    severity: envelopeRowOk ? 'OK' : 'ERROR',
    message: 'Envelope row (top-level keys + check contract + reportText + run not FAIL)',
    detail: { keysOk: keysOk, itemContractOk: ic.ok, reportTextLen: String(reportText || '').length, runStatus: runFin.status, mode: 'CBV_TCS_V1_MILESTONE08' }
  });
  draft.checks = checks;
  draft.envelopeOk = envelopeRowOk === true;

  var fin = (typeof CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_({
      checks: checks,
      envelopeOk: draft.envelopeOk === true,
      externalWarnings: [],
      errors: runFin.errors || [],
      warnings: runFin.warnings || []
    })
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P.' };

  draft.ok = fin.ok;
  draft.status = fin.status;
  draft.severity = fin.severity;
  draft.errors = fin.errors || [];
  draft.warnings = fin.warnings || [];
  draft.nextStep = fin.nextStep;
  draft.summary = 'Milestone 08 operational state test: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nfinalOk=' + String(fin.ok) + '\nenvelopeOk=' + String(draft.envelopeOk);

  var bundleEx = null;
  try {
    if (typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function' && typeof CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_ === 'function') {
      var exportDraft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, true, {
        preWrite: true,
        expectedMinFiles: 6,
        note: 'Milestone 08 Drive bundle'
      });
      exportDraft.reportJson.finalStatus = exportDraft.status;
      exportDraft.reportJson.ok = exportDraft.ok;
      exportDraft.reportJson.severity = exportDraft.severity;
      exportDraft.reportJson.envelopeOk = exportDraft.envelopeOk;

      var handoffMd = CbvTcsMilestone08__buildAiHandoffMd_(exportDraft, traceId);
      bundleEx = CbvTcsDriveReport_exportMilestoneFullTestBundle(exportDraft, {
        tagStem: 'MILESTONE_08_OPERATIONAL_STATE_RUNTIME',
        aiHandoffMarkdown: handoffMd,
        evidenceHtml: CbvTcsMilestone08__buildEvidenceHtml_(exportDraft.checks)
      });
      var fc = bundleEx && bundleEx.files ? bundleEx.files.length : 0;
      var exportOk = !!(bundleEx && bundleEx.ok === true && fc >= 6);

      if (bundleEx && bundleEx.warnings) {
        bundleEx.warnings.forEach(function (w) { externalWarnings.push('DRIVE: ' + w); });
      }
      if (bundleEx && !bundleEx.ok && bundleEx.errors && bundleEx.errors.length) {
        externalWarnings.push('CBV_TEST_REPORT_DRIVE_SAVE_FAILED: ' + bundleEx.errors.join(' | '));
      }

      if (exportOk) {
        draft = exportDraft;
        checks = draft.checks;
        draft.reportJson.driveFileCount = fc;
        draft.reportJson.driveFiles = bundleEx.files || [];
      } else {
        draft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, false, {
          fileCount: fc,
          exportOk: !!(bundleEx && bundleEx.ok),
          errors: bundleEx && bundleEx.errors ? bundleEx.errors : []
        });
        checks = draft.checks;
        draft.reportJson.driveFileCount = fc;
        draft.reportJson.driveFiles = bundleEx && bundleEx.files ? bundleEx.files : [];
      }
    }
  } catch (eD) {
    externalWarnings.push('DRIVE_BUNDLE_EXCEPTION: ' + (eD && eD.message ? eD.message : String(eD)));
    if (typeof CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_ === 'function') {
      draft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, false, {
        exception: eD && eD.message ? eD.message : String(eD)
      });
      checks = draft.checks;
    }
  }

  if (draft.envelopeOk !== true || draft.ok !== (draft.status !== 'FAIL')) {
    draft.ok = false;
    if (draft.status !== 'FAIL') draft.status = 'FAIL';
    if (draft.severity !== 'CRITICAL') draft.severity = 'ERROR';
    if (draft.errors.indexOf('CONSISTENCY_GUARD') < 0) draft.errors.push('CONSISTENCY_GUARD');
  }

  CbvTcsMilestone08__tryAppendTestReportSheet_(draft);
  CbvTcsMilestone08OperationalState_TestConsole__storeLatest_(draft);
  try { Logger.log(draft.reportText); } catch (eL) { /* ignore */ }
  return draft;
}

function CbvTcsMilestone08OperationalState_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = null;
  try {
    if (__CBV_TCS_MILESTONE08_TC_LAST_REPORT) r = __CBV_TCS_MILESTONE08_TC_LAST_REPORT;
    else if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_MILESTONE08_TC_LAST_PROP_KEY);
      if (raw) r = JSON.parse(raw);
    }
  } catch (e) {
    r = null;
  }
  if (!r) {
    ui.alert('No report', 'Run M08 — Operational State Runtime Test first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Milestone 08 — copy report');
  return { ok: true };
}
