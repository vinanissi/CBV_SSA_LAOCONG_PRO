/**
 * MILESTONE_06 — Staff Workboard Production MVP — Full test (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Run Milestone 06 Staff Workboard Production MVP Test
 *
 * Depends: 998Y, 999A, 998L, 998P, 998H, 998F, 998Q, 998W, 998U, 998S, 998O
 */

/** M06 — CBV UI Marker Contract (workboard shell + card + mobile); preflight + default page checks. Pre-commit: strings must stay findable in this file for scripts/cbv-marker-contract-self-check.mjs (see also cbv-marker-probe in HTML template). */
var CBV_TCS_M06_WORKBOARD_UI_MARKERS = [
  'cbv-workboard',
  'cbv-workboard-summary',
  'cbv-workboard-section',
  'cbv-workboard-task-card',
  'cbv-workboard-primary-cta',
  'cbv-workboard-secondary-cta',
  'cbv-workboard-empty-state',
  'cbv-workboard-sla-badge',
  'cbv-workboard-next-action',
  'cbv-workboard-safe-disabled',
  'cbv-workboard-mobile-stack',
  'cbv-workboard-bottom-nav',
  'cbv-workboard-filter-chip',
  'cbv-workboard-sticky-urgent',
  'cbv-action-xl',
  'cbv-thumb-zone'
];

var __CBV_TCS_MILESTONE06_TC_LAST_REPORT = null;
var __CBV_TCS_MILESTONE06_TC_LAST_PROP_KEY = 'CBV_TCS_MILESTONE06_TC_LAST_REPORT_JSON';

function CbvTcsMilestone06StaffWorkboard_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_MILESTONE06_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_MILESTONE06_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsMilestone06__buildEvidenceHtml_(checks) {
  var failed = (checks || []).filter(function (c) { return c && c.ok === false; });
  var rows = failed.map(function (c) {
    return '<tr><td>' + String(c.code || '').replace(/</g, '&lt;') + '</td><td>' + String(c.severity || '').replace(/</g, '&lt;') + '</td><td>' + String(c.message || '').replace(/</g, '&lt;') + '</td></tr>';
  }).join('');
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>MILESTONE_06 Evidence</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>' +
    '<h1>MILESTONE_06 — Failed checks</h1>' +
    (failed.length ? ('<table><thead><tr><th>code</th><th>severity</th><th>message</th></tr></thead><tbody>' + rows + '</tbody></table>') : '<p>No failed checks.</p>') +
    '</body></html>';
}

function CbvTcsMilestone06__buildAiHandoffMd_(draft, traceId) {
  return [
    '# AI Handoff — Milestone 06 (Staff Workboard Production MVP)',
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

function CbvTcsMilestone06__unsafeHitsInHtml_(html, banned) {
  var lower = String(html || '').toLowerCase();
  var hits = [];
  for (var bi = 0; bi < banned.length; bi++) {
    var tok = String(banned[bi] || '');
    if (tok && lower.indexOf(tok.toLowerCase()) >= 0) hits.push(tok);
  }
  return hits;
}

function CbvTcsMilestone06__viValidateDetail_(vu) {
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
 * One-click Milestone 06 staff workboard + route param + Drive 6-file bundle.
 */
function CbvTcsMilestone06StaffWorkboard_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSM06_')
    : ('WSM06_' + new Date().getTime());

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

  /* —— Phase 601 route/query —— */
  try {
    var e1 = { parameter: { route: '/workspace/staff/task-detail?taskId=TC123' } };
    var p1 = (typeof CbvWebAppRoute_parseRouteAndParams_ === 'function') ? CbvWebAppRoute_parseRouteAndParams_(e1.parameter.route, e1) : null;
    var ok1 = p1 && p1.route === '/workspace/staff/task-detail' && String(p1.params.taskId || '') === 'TC123';
    addCheck('ROUTE_PARAM_TASK_DETAIL_QUERY', ok1, ok1 ? 'OK' : 'ERROR', 'Inner ?taskId= on route value parses', p1 || {});

    var enc = encodeURIComponent('/workspace/staff/task-detail?taskId=HAL_123');
    var eEnc = { parameter: { route: enc } };
    var pEnc = CbvWebAppRoute_parseRouteAndParams_(eEnc.parameter.route, eEnc);
    var okEnc = pEnc && pEnc.route === '/workspace/staff/task-detail' && String(pEnc.params.taskId || '') === 'HAL_123';
    addCheck('ROUTE_PARAM_ENCODED_QUERY', okEnc, okEnc ? 'OK' : 'ERROR', 'Encoded route+query parses', pEnc || {});

    var eSep = { parameter: { route: '/workspace/staff/task-detail', taskId: 'HAL_SEP' } };
    var pSep = CbvWebAppRoute_parseRouteAndParams_(eSep.parameter.route, eSep);
    var okSep = pSep && pSep.route === '/workspace/staff/task-detail' && String(pSep.params.taskId || '') === 'HAL_SEP';
    addCheck('ROUTE_PARAM_SEPARATE_TASKID', okSep, okSep ? 'OK' : 'ERROR', 'Separate top-level taskId merges', pSep || {});

    var ePlain = { parameter: { route: '/workspace/today' } };
    var pPlain = CbvWebAppRoute_parseRouteAndParams_(ePlain.parameter.route, ePlain);
    var okPlain = pPlain && pPlain.route === '/workspace/today' && !pPlain.params.taskId;
    addCheck('ROUTE_PARAM_NO_QUERY_REGRESSION', okPlain, okPlain ? 'OK' : 'ERROR', 'Plain route unchanged', pPlain || {});
  } catch (eR) {
    addCheck('ROUTE_PARAM_TASK_DETAIL_QUERY', false, 'ERROR', String(eR), {});
  }

  addCheck('PAGE_TYPE_STAFF_WORKBOARD', typeof CBV_WEBAPP_WS_PAGE_TYPES !== 'undefined' && !!CBV_WEBAPP_WS_PAGE_TYPES.STAFF_WORKBOARD, 'OK', 'STAFF_WORKBOARD page type', {});

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_WS_WORKBOARD', paths.indexOf('/workspace/workboard') >= 0, paths.indexOf('/workspace/workboard') >= 0 ? 'OK' : 'ERROR', '/workspace/workboard', {});
    addCheck('ROUTE_WORKBOARD_ALIAS', paths.indexOf('/workboard') >= 0, paths.indexOf('/workboard') >= 0 ? 'OK' : 'ERROR', '/workboard', {});
    addCheck('REGRESSION_M05_SOP', paths.indexOf('/workspace/sop') >= 0 && paths.indexOf('/sop') >= 0, 'OK', 'M05 SOP routes', {});
    addCheck('REGRESSION_M04_FOCUS', paths.indexOf('/workspace/focus') >= 0 && paths.indexOf('/workspace/execution/task') >= 0, 'OK', 'M04 focus/execution', {});
    addCheck('REGRESSION_M03_DAILY', paths.indexOf('/workspace/daily') >= 0 && paths.indexOf('/daily') >= 0, 'OK', 'M03 daily', {});
    addCheck('REGRESSION_M02_STAFF', paths.indexOf('/workspace/staff/tasks') >= 0 && paths.indexOf('/workspace/staff/task-detail') >= 0, 'OK', 'M02 staff', {});
    addCheck('REGRESSION_M01_TODAY', paths.indexOf('/workspace/today') >= 0 && paths.indexOf('/workspace/role-home') >= 0, 'OK', 'M01 today/role', {});
    addCheck('REGRESSION_M01_HOME', paths.indexOf('/workspace') >= 0, 'OK', '/workspace home', {});
  } catch (eRg) {
    addCheck('ROUTE_WS_WORKBOARD', false, 'ERROR', String(eRg), {});
  }

  addCheck('FN_parseRouteAndParams', typeof CbvWebAppRoute_parseRouteAndParams_ === 'function', 'OK', 'CbvWebAppRoute_parseRouteAndParams_', {});
  addCheck('FN_mergeParams', typeof CbvWebAppRoute_mergeParams_ === 'function', 'OK', 'CbvWebAppRoute_mergeParams_', {});
  addCheck('FN_normalizePath', typeof CbvWebAppRoute_normalizePath_ === 'function', 'OK', 'CbvWebAppRoute_normalizePath_', {});
  addCheck('FN_buildWithQuery', typeof CbvWebAppRouteUrl_buildWithQuery === 'function', 'OK', 'CbvWebAppRouteUrl_buildWithQuery', {});

  addCheck('FN_CbvStaffWorkboard_getModel_', typeof CbvStaffWorkboard_getModel_ === 'function', 'OK', 'CbvStaffWorkboard_getModel_', {});
  addCheck('FN_CbvStaffWorkboard_readTasks_', typeof CbvStaffWorkboard_readTasks_ === 'function', 'OK', 'CbvStaffWorkboard_readTasks_', {});
  addCheck('FN_CbvStaffWorkboard_groupTasks_', typeof CbvStaffWorkboard_groupTasks_ === 'function', 'OK', 'CbvStaffWorkboard_groupTasks_', {});
  addCheck('FN_CbvStaffWorkboard_rankTasks_', typeof CbvStaffWorkboard_rankTasks_ === 'function', 'OK', 'CbvStaffWorkboard_rankTasks_', {});
  addCheck('FN_CbvStaffWorkboard_renderPage_', typeof CbvStaffWorkboard_renderPage_ === 'function', 'OK', 'CbvStaffWorkboard_renderPage_', {});

  addCheck('UI_MARKER_PREFLIGHT_RUNTIME', typeof CbvUiMarkerPreflight_runContract_ === 'function', 'OK', 'CbvUiMarkerPreflight_runContract_', {});

  try {
    var pfStates = ['HAS_DATA', 'EMPTY_DATA', 'APPSHEET_UNCONFIGURED', 'MISSING_TASKID', 'QUERY_PARAM_ROUTE'];
    var pfRes = CbvUiMarkerPreflight_runContract_({
      requiredMarkers: CBV_TCS_M06_WORKBOARD_UI_MARKERS,
      states: pfStates,
      renderer: function (st) {
        var pr = { __preflightState: String(st || '') };
        var pg = CbvStaffWorkboard_renderPage_(pr);
        return String((pg && pg.bodyHtml) || '');
      }
    });
    var pfOk = pfRes && pfRes.ok === true;
    addCheck(
      'WORKBOARD_MARKER_PREFLIGHT',
      pfOk,
      pfOk ? 'OK' : 'ERROR',
      'M06 workboard UI markers in HTML for every probe state (CBV UI Marker Contract Preflight V1)',
      {
        requiredMarkers: pfRes.requiredMarkers,
        foundMarkers: pfRes.foundMarkers,
        missingMarkers: pfRes.missingMarkers,
        statesChecked: pfRes.statesChecked,
        htmlLens: pfRes.htmlLens,
        htmlLen: pfRes.htmlLen,
        missingMarkersUnion: pfRes.missingMarkersUnion,
        warnings: pfRes.warnings || [],
        errors: pfRes.errors || []
      }
    );
  } catch (ePf) {
    addCheck('WORKBOARD_MARKER_PREFLIGHT', false, 'ERROR', String(ePf), {});
  }

  try {
    var m0 = CbvStaffWorkboard_getModel_({});
    var g0 = m0.groups || {};
    var hasGroups = ['urgent', 'mine', 'overdue', 'blocked', 'waiting', 'recent'].every(function (k) { return Array.isArray(g0[k]); });
    var hasCounts = m0.counts && typeof m0.counts.urgent === 'number';
    addCheck('WORKBOARD_MODEL_GROUPS', hasGroups, hasGroups ? 'OK' : 'ERROR', 'groups urgent/mine/overdue/blocked/waiting/recent', { keys: Object.keys(g0) });
    addCheck('WORKBOARD_MODEL_COUNTS', hasCounts, hasCounts ? 'OK' : 'ERROR', 'summary counts', m0.counts || {});
    addCheck('WORKBOARD_MODEL_OK', m0.ok === true, m0.ok ? 'OK' : 'ERROR', 'model ok flag', {});
  } catch (eM) {
    addCheck('WORKBOARD_MODEL_GROUPS', false, 'ERROR', String(eM), {});
  }

  var markers = CBV_TCS_M06_WORKBOARD_UI_MARKERS.slice(0, 10);
  var mobileMarkers = CBV_TCS_M06_WORKBOARD_UI_MARKERS.slice(10);
  try {
    var pg = CbvStaffWorkboard_renderPage_({});
    var html = String((pg && pg.bodyHtml) || '');
    var miss = markers.filter(function (mk) { return html.indexOf(mk) < 0; });
    addCheck('WORKBOARD_TASK_CARD_MARKERS', miss.length === 0, miss.length === 0 ? 'OK' : 'ERROR', 'Production task card markers', { missing: miss, htmlLen: html.length });
    var missM = mobileMarkers.filter(function (mk) { return html.indexOf(mk) < 0; });
    addCheck('WORKBOARD_MOBILE_MARKERS', missM.length === 0, missM.length === 0 ? 'OK' : 'ERROR', 'Mobile-first markers', { missing: missM });
    var appsheetMarkerOk = html.indexOf('cbv-appsheet-config-status') >= 0 &&
      (html.indexOf('cbv-appsheet-safe-disabled') >= 0 || html.indexOf('cbv-appsheet-link') >= 0);
    addCheck('APPSHEET_UI_MARKERS', appsheetMarkerOk, appsheetMarkerOk ? 'OK' : 'ERROR', 'AppSheet bridge UI markers present', {});
  } catch (eH) {
    addCheck('WORKBOARD_TASK_CARD_MARKERS', false, 'ERROR', String(eH), {});
  }

  addCheck('FN_APPSHEET_getConfig', typeof CbvAppSheetBridge_getConfig_ === 'function', 'OK', 'CbvAppSheetBridge_getConfig_', {});
  addCheck('FN_APPSHEET_isConfigured', typeof CbvAppSheetBridge_isConfigured_ === 'function', 'OK', 'CbvAppSheetBridge_isConfigured_', {});
  addCheck('FN_APPSHEET_buildTaskDetailLink', typeof CbvAppSheetBridge_buildTaskDetailLink_ === 'function', 'OK', 'CbvAppSheetBridge_buildTaskDetailLink_', {});
  addCheck('FN_APPSHEET_buildSafeActionHtml', typeof CbvAppSheetBridge_buildSafeActionHtml_ === 'function', 'OK', 'CbvAppSheetBridge_buildSafeActionHtml_', {});

  try {
    var cfg0 = CbvAppSheetBridge_getConfig_();
    var lk = CbvAppSheetBridge_buildTaskDetailLink_({ taskId: 'TC_PROBE' });
    var urlOk = !lk.url || (String(lk.url).indexOf('fake') < 0 && String(lk.url).indexOf('example.com') < 0);
    addCheck('APPSHEET_MISSING_SAFE', cfg0.configured === false || typeof cfg0.configured === 'boolean', 'OK', 'Bridge reports configured state without throwing', { configured: cfg0.configured });
    addCheck('APPSHEET_NO_FAKE_URL', urlOk, urlOk ? 'OK' : 'ERROR', 'No placeholder fake host in link builder', { url: lk.url });
    var unconf = cfg0.configured === false;
    var noUrlWhenMissing = !unconf || (lk.ok === false && !String(lk.url || '').trim());
    addCheck('APPSHEET_UNCONFIGURED_NO_URL', noUrlWhenMissing, noUrlWhenMissing ? 'OK' : 'ERROR', 'When not configured, task detail link stays empty (no fake URL)', { ok: lk.ok, urlLen: String(lk.url || '').length });
  } catch (eA) {
    addCheck('APPSHEET_MISSING_SAFE', false, 'WARNING', String(eA), {});
  }

  try {
    var pg2 = CbvStaffWorkboard_renderPage_({});
    var h2 = String((pg2 && pg2.bodyHtml) || '');
    var banned = ['Hoàn tất', 'Complete', 'Claim', 'Resolve', 'Auto assign', 'Auto resolve', 'Auto escalate'];
    var hits = CbvTcsMilestone06__unsafeHitsInHtml_(h2, banned);
    addCheck('CTA_SAFETY_COPY_M06', hits.length === 0, hits.length === 0 ? 'OK' : 'ERROR', 'No forbidden CTA copy on workboard', { hits: hits });
  } catch (eS) {
    addCheck('CTA_SAFETY_COPY_M06', false, 'ERROR', String(eS), {});
  }

  var vu = null;
  try {
    vu = (typeof CbvWebAppVi_validate === 'function') ? CbvWebAppVi_validate() : null;
    var viDetail = CbvTcsMilestone06__viValidateDetail_(vu);
    addCheck('VI_VALIDATE', vu && vu.ok === true, vu && vu.ok ? 'OK' : 'ERROR', 'CbvWebAppVi_validate', viDetail);
    if (vu && vu.warnings) vu.warnings.forEach(function (w) { externalWarnings.push('VI_VALIDATE: ' + w); });
  } catch (eV) {
    addCheck('VI_VALIDATE', false, 'WARNING', String(eV), {});
  }

  try {
    var nw = (typeof CbvWebAppVi_getLabel === 'function') ? CbvWebAppVi_getLabel('nav_workboard') : '';
    addCheck('VI_NAV_WORKBOARD', String(nw || '').trim().length > 0, 'OK', 'nav_workboard label', { nav_workboard: nw });
    var tw = (typeof CbvWebAppVi_getRouteLabel === 'function') ? CbvWebAppVi_getRouteLabel('/workspace/workboard') : '';
    var ta = (typeof CbvWebAppVi_getRouteLabel === 'function') ? CbvWebAppVi_getRouteLabel('/workboard') : '';
    addCheck('VI_ROUTE_TITLE_WORKBOARD', String(tw || '').trim().length > 0 && String(ta || '').trim().length > 0, 'OK', 'VI titles workboard routes', { ws: tw, alias: ta });
  } catch (eVt) {
    addCheck('VI_NAV_WORKBOARD', false, 'ERROR', String(eVt), {});
  }

  var vr = null;
  try {
    vr = (typeof CbvWebAppRouteUrl_validate === 'function') ? CbvWebAppRouteUrl_validate() : null;
    addCheck('ROUTE_URL_VALIDATE', vr && vr.ok === true, vr && vr.ok ? 'OK' : 'ERROR', 'CbvWebAppRouteUrl_validate', {});
    if (vr && vr.warnings) vr.warnings.forEach(function (w) { externalWarnings.push('ROUTE_URL_VALIDATE: ' + w); });
  } catch (eH2) {
    addCheck('ROUTE_URL_VALIDATE', false, 'WARNING', String(eH2), {});
  }

  addCheck('DRIVE_BUNDLE_FN', typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function', 'OK', 'CbvTcsDriveReport_exportMilestoneFullTestBundle', {});

  var now = (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date();
  var runBy = (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : '');

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['M01_FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P before 998Z.' };

  var reportText = [
    '=== MILESTONE_06 — STAFF WORKBOARD PRODUCTION MVP TEST ===',
    'traceId=' + traceId,
    'runStatus=' + runFin.status,
    'runOk=' + String(runFin.ok),
    'failedChecks=' + JSON.stringify((checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) { return c.code; }))
  ].join('\n');

  var draft = {
    ok: runFin.ok,
    phase: 'MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP',
    status: runFin.status,
    checkedAt: now,
    runBy: runBy,
    traceId: traceId,
    testSuite: 'MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP',
    summary: 'Milestone 06 staff workboard test (pre-envelope): ' + runFin.status + ' (' + runFin.severity + ')',
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep,
    severity: runFin.severity,
    reportText: reportText,
    reportJson: { driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '', milestone06: true },
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
    detail: { keysOk: keysOk, itemContractOk: ic.ok, reportTextLen: String(reportText || '').length, runStatus: runFin.status, mode: 'CBV_TCS_V1_MILESTONE06' }
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
  draft.summary = 'Milestone 06 staff workboard test: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nfinalOk=' + String(fin.ok) + '\nenvelopeOk=' + String(draft.envelopeOk);

  var bundleEx = null;
  try {
    if (typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function' && typeof CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_ === 'function') {
      var exportDraft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, true, {
        preWrite: true,
        expectedMinFiles: 6,
        note: 'Milestone 06 Drive bundle'
      });
      exportDraft.reportJson.finalStatus = exportDraft.status;
      exportDraft.reportJson.ok = exportDraft.ok;
      exportDraft.reportJson.severity = exportDraft.severity;
      exportDraft.reportJson.envelopeOk = exportDraft.envelopeOk;

      var handoffMd = CbvTcsMilestone06__buildAiHandoffMd_(exportDraft, traceId);
      bundleEx = CbvTcsDriveReport_exportMilestoneFullTestBundle(exportDraft, {
        tagStem: 'MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP',
        aiHandoffMarkdown: handoffMd,
        evidenceHtml: CbvTcsMilestone06__buildEvidenceHtml_(exportDraft.checks)
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

  CbvTcsMilestone06StaffWorkboard_TestConsole__storeLatest_(draft);
  try { Logger.log(draft.reportText); } catch (eL) { /* ignore */ }
  return draft;
}

function CbvTcsMilestone06StaffWorkboard_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = null;
  try {
    if (__CBV_TCS_MILESTONE06_TC_LAST_REPORT) r = __CBV_TCS_MILESTONE06_TC_LAST_REPORT;
    else if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_MILESTONE06_TC_LAST_PROP_KEY);
      if (raw) r = JSON.parse(raw);
    }
  } catch (e) {
    r = null;
  }
  if (!r) {
    ui.alert('No report', 'Run Milestone 06 Staff Workboard Production MVP Test first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Milestone 06 — copy report');
  return { ok: true };
}
