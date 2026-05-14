/**
 * MILESTONE_07 — AppSheet Live Bridge — Full test (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → M07 — Run AppSheet Live Bridge Test
 *
 * Depends: 999B, 999A, 998P, 998L, 998H, 998F, 998Y, 998Z patterns
 */

/** M07 markers — pre-commit: strings must stay findable in this file (scripts/cbv-marker-contract-self-check.mjs). */
var CBV_TCS_M07_LIVE_BRIDGE_UI_MARKERS = [
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

var __CBV_TCS_MILESTONE07_TC_LAST_REPORT = null;
var __CBV_TCS_MILESTONE07_TC_LAST_PROP_KEY = 'CBV_TCS_MILESTONE07_TC_LAST_REPORT_JSON';

function CbvTcsMilestone07AppSheetLiveBridge_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_MILESTONE07_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_MILESTONE07_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsMilestone07__buildEvidenceHtml_(checks) {
  var failed = (checks || []).filter(function (c) { return c && c.ok === false; });
  var rows = failed.map(function (c) {
    return '<tr><td>' + String(c.code || '').replace(/</g, '&lt;') + '</td><td>' + String(c.severity || '').replace(/</g, '&lt;') + '</td><td>' + String(c.message || '').replace(/</g, '&lt;') + '</td></tr>';
  }).join('');
  var markerRow = '<div class="' + CBV_TCS_M07_LIVE_BRIDGE_UI_MARKERS.join(' ') + '" data-cbv-m07-evidence-probe="1" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)"></div>';
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>MILESTONE_07 Evidence</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>' +
    markerRow +
    '<h1>MILESTONE_07 — AppSheet Live Bridge</h1>' +
    (failed.length ? ('<table><thead><tr><th>code</th><th>severity</th><th>message</th></tr></thead><tbody>' + rows + '</tbody></table>') : '<p>No failed checks.</p>') +
    '</body></html>';
}

function CbvTcsMilestone07__buildAiHandoffMd_(draft, traceId) {
  return [
    '# AI Handoff — Milestone 07 (AppSheet Live Bridge)',
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

function CbvTcsMilestone07__viValidateDetail_(vu) {
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
 * One-click Milestone 07 AppSheet Live Bridge + Drive 6-file bundle (append-only).
 */
function CbvTcsMilestone07AppSheetLiveBridge_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSM07_')
    : ('WSM07_' + new Date().getTime());

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
    var e1 = { parameter: { route: '/workspace/staff/task-detail?taskId=M07ABC' } };
    var p1 = (typeof CbvWebAppRoute_parseRouteAndParams_ === 'function') ? CbvWebAppRoute_parseRouteAndParams_(e1.parameter.route, e1) : null;
    var ok1 = p1 && p1.route === '/workspace/staff/task-detail' && String(p1.params.taskId || '') === 'M07ABC';
    addCheck('M07_ROUTE_PARAM_TASK_DETAIL', ok1, ok1 ? 'OK' : 'ERROR', 'Inner ?taskId= parses for handoff routes', p1 || {});
  } catch (eR) {
    addCheck('M07_ROUTE_PARAM_TASK_DETAIL', false, 'ERROR', String(eR), {});
  }

  try {
    var retH = (typeof CbvAppSheetLiveBridge_buildWebAppReturnUrl_ === 'function')
      ? CbvAppSheetLiveBridge_buildWebAppReturnUrl_('/workspace/staff/task-detail', 'M07HAND')
      : '';
    var retS = String(retH || '');
    var handoffOk = retS.indexOf('M07HAND') >= 0 && retS.indexOf('taskId') >= 0;
    addCheck('M07_CONTEXT_HANDOFF', handoffOk, handoffOk ? 'OK' : 'ERROR', 'Return URL preserves taskId for WebApp↔AppSheet handoff', { returnLen: retS.length });
  } catch (eHo) {
    addCheck('M07_CONTEXT_HANDOFF', false, 'ERROR', String(eHo), {});
  }

  addCheck('FN_LIVE_BRIDGE_RIBBON', typeof CbvAppSheetLiveBridge_renderWorkboardRibbon_ === 'function', 'OK', 'CbvAppSheetLiveBridge_renderWorkboardRibbon_', {});
  addCheck('FN_LIVE_BRIDGE_DEEPLINK', typeof CbvAppSheetLiveBridge_buildDeepLink_ === 'function', 'OK', 'CbvAppSheetLiveBridge_buildDeepLink_', {});
  addCheck('FN_LIVE_BRIDGE_RETURN_URL', typeof CbvAppSheetLiveBridge_buildWebAppReturnUrl_ === 'function', 'OK', 'CbvAppSheetLiveBridge_buildWebAppReturnUrl_', {});
  addCheck('FN_LIVE_BRIDGE_HEALTH', typeof CbvAppSheetLiveBridge_runHealth_ === 'function', 'OK', 'CbvAppSheetLiveBridge_runHealth_', {});

  addCheck('FN_APPSHEET_getConfig', typeof CbvAppSheetBridge_getConfig_ === 'function', 'OK', 'CbvAppSheetBridge_getConfig_', {});
  addCheck('FN_APPSHEET_buildUploadLink', typeof CbvAppSheetBridge_buildUploadLink_ === 'function', 'OK', 'CbvAppSheetBridge_buildUploadLink_', {});
  addCheck('FN_APPSHEET_buildFeedbackLink', typeof CbvAppSheetBridge_buildFeedbackLink_ === 'function', 'OK', 'CbvAppSheetBridge_buildFeedbackLink_', {});

  try {
    var h = CbvAppSheetLiveBridge_runHealth_();
    var hBad = (h.checks || []).filter(function (c) { return c && c.ok === false && (c.severity === 'ERROR' || c.severity === 'CRITICAL'); });
    addCheck('M07_RUNTIME_HEALTH', hBad.length === 0, hBad.length === 0 ? 'OK' : 'ERROR', 'CbvAppSheetLiveBridge_runHealth_ core checks', { checks: h.checks || [] });
  } catch (eH) {
    addCheck('M07_RUNTIME_HEALTH', false, 'ERROR', String(eH), {});
  }

  try {
    var cfgDl = (typeof CbvAppSheetBridge_getConfig_ === 'function') ? CbvAppSheetBridge_getConfig_() : null;
    var dlB = CbvAppSheetLiveBridge_buildDeepLink_({
      taskId: 'M07_DLBUILD',
      mode: 'detail',
      route: '/workspace/workboard',
      source: 'test',
      returnRoute: '/workspace/workboard'
    });
    var uB = String((dlB && dlB.url) || '');
    var dlBuildOk =
      cfgDl && cfgDl.configured === true
        ? dlB && dlB.ok === true && /^https:\/\//i.test(uB)
        : dlB && dlB.ok === false && uB.length === 0;
    addCheck(
      'M07_DEEPLINK_BUILDER',
      dlBuildOk,
      dlBuildOk ? 'OK' : 'ERROR',
      'Deep link builder uses resolver (https when configured; empty when safe-disabled)',
      { configured: cfgDl ? cfgDl.configured : null, ok: dlB ? dlB.ok : null, urlLen: uB.length }
    );
  } catch (eBl) {
    addCheck('M07_DEEPLINK_BUILDER', false, 'ERROR', String(eBl), {});
  }

  try {
    var dl0 = CbvAppSheetLiveBridge_buildDeepLink_({ taskId: 'M07_ROW', mode: 'upload', route: '/workspace/workboard', source: 'test', returnRoute: '/workspace/workboard' });
    var url0 = String(dl0.url || '');
    var noFake = url0.indexOf('fake') < 0 && url0.indexOf('example.com') < 0;
    addCheck('M07_DEEPLINK_NO_FAKE_HOST', noFake, noFake ? 'OK' : 'ERROR', 'Upload mode link builder avoids placeholder hosts', { ok: dl0.ok, urlLen: url0.length });
  } catch (eD) {
    addCheck('M07_DEEPLINK_NO_FAKE_HOST', false, 'WARNING', String(eD), {});
  }

  try {
    var pfStates = ['HAS_DATA', 'EMPTY_DATA', 'APPSHEET_UNCONFIGURED', 'MISSING_TASKID', 'QUERY_PARAM_ROUTE'];
    var pfRes = CbvUiMarkerPreflight_runContract_({
      requiredMarkers: CBV_TCS_M07_LIVE_BRIDGE_UI_MARKERS,
      states: pfStates,
      renderer: function (st) {
        var pr = { __preflightState: String(st || ''), taskId: st === 'MISSING_TASKID' ? '' : 'M07_TID', route: '/workspace/workboard', source: 'test', returnRoute: '/workspace/workboard' };
        return (typeof CbvAppSheetLiveBridge_renderWorkboardRibbon_ === 'function') ? CbvAppSheetLiveBridge_renderWorkboardRibbon_(pr) : '';
      }
    });
    var pfOk = pfRes && pfRes.ok === true;
    addCheck(
      'M07_MARKER_PREFLIGHT',
      pfOk,
      pfOk ? 'OK' : 'ERROR',
      'M07 markers in ribbon HTML for every probe state',
      {
        requiredMarkers: pfRes.requiredMarkers,
        missingMarkersUnion: pfRes.missingMarkersUnion,
        statesChecked: pfRes.statesChecked
      }
    );
  } catch (ePf) {
    addCheck('M07_MARKER_PREFLIGHT', false, 'ERROR', String(ePf), {});
  }

  try {
    var pg = (typeof CbvStaffWorkboard_renderPage_ === 'function') ? CbvStaffWorkboard_renderPage_({}) : { bodyHtml: '' };
    var html = String((pg && pg.bodyHtml) || '');
    var miss = CBV_TCS_M07_LIVE_BRIDGE_UI_MARKERS.filter(function (mk) { return html.indexOf(mk) < 0; });
    addCheck('M07_MARKERS_ON_WORKBOARD_PAGE', miss.length === 0, miss.length === 0 ? 'OK' : 'ERROR', 'Staff workboard page embeds M07 ribbon markers', { missing: miss, htmlLen: html.length });
  } catch (eW) {
    addCheck('M07_MARKERS_ON_WORKBOARD_PAGE', false, 'ERROR', String(eW), {});
  }

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('REGRESSION_M06_WORKBOARD', paths.indexOf('/workspace/workboard') >= 0, 'OK', 'M06 workboard route', {});
    addCheck('REGRESSION_M05_SOP', paths.indexOf('/workspace/sop') >= 0, 'OK', 'M05 SOP', {});
    addCheck('REGRESSION_M04_FOCUS', paths.indexOf('/workspace/focus') >= 0, 'OK', 'M04 focus', {});
  } catch (eRg) {
    addCheck('REGRESSION_M06_WORKBOARD', false, 'ERROR', String(eRg), {});
  }

  addCheck('UI_MARKER_PREFLIGHT_RUNTIME', typeof CbvUiMarkerPreflight_runContract_ === 'function', 'OK', 'CbvUiMarkerPreflight_runContract_', {});

  var vu = null;
  try {
    vu = (typeof CbvWebAppVi_validate === 'function') ? CbvWebAppVi_validate() : null;
    var viDetail = CbvTcsMilestone07__viValidateDetail_(vu);
    addCheck('VI_VALIDATE', vu && vu.ok === true, vu && vu.ok ? 'OK' : 'ERROR', 'CbvWebAppVi_validate', viDetail);
    if (vu && vu.warnings) vu.warnings.forEach(function (w) { externalWarnings.push('VI_VALIDATE: ' + w); });
  } catch (eV) {
    addCheck('VI_VALIDATE', false, 'WARNING', String(eV), {});
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
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['M01_FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P before 999C.' };

  var reportText = [
    '=== MILESTONE_07 — APPSHEET LIVE BRIDGE TEST ===',
    'traceId=' + traceId,
    'runStatus=' + runFin.status,
    'runOk=' + String(runFin.ok),
    'failedChecks=' + JSON.stringify((checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) { return c.code; }))
  ].join('\n');

  var draft = {
    ok: runFin.ok,
    phase: 'MILESTONE_07_APPSHEET_LIVE_BRIDGE',
    status: runFin.status,
    checkedAt: now,
    runBy: runBy,
    traceId: traceId,
    testSuite: 'MILESTONE_07_APPSHEET_LIVE_BRIDGE',
    summary: 'Milestone 07 AppSheet live bridge test (pre-envelope): ' + runFin.status + ' (' + runFin.severity + ')',
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep,
    severity: runFin.severity,
    reportText: reportText,
    reportJson: { driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '', milestone07: true },
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
    detail: { keysOk: keysOk, itemContractOk: ic.ok, reportTextLen: String(reportText || '').length, runStatus: runFin.status, mode: 'CBV_TCS_V1_MILESTONE07' }
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
  draft.summary = 'Milestone 07 AppSheet live bridge test: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nfinalOk=' + String(fin.ok) + '\nenvelopeOk=' + String(draft.envelopeOk);

  var bundleEx = null;
  try {
    if (typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function' && typeof CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_ === 'function') {
      var exportDraft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, true, {
        preWrite: true,
        expectedMinFiles: 6,
        note: 'Milestone 07 Drive bundle'
      });
      exportDraft.reportJson.finalStatus = exportDraft.status;
      exportDraft.reportJson.ok = exportDraft.ok;
      exportDraft.reportJson.severity = exportDraft.severity;
      exportDraft.reportJson.envelopeOk = exportDraft.envelopeOk;

      var handoffMd = CbvTcsMilestone07__buildAiHandoffMd_(exportDraft, traceId);
      bundleEx = CbvTcsDriveReport_exportMilestoneFullTestBundle(exportDraft, {
        tagStem: 'MILESTONE_07_APPSHEET_LIVE_BRIDGE',
        aiHandoffMarkdown: handoffMd,
        evidenceHtml: CbvTcsMilestone07__buildEvidenceHtml_(exportDraft.checks)
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

  CbvTcsMilestone07AppSheetLiveBridge_TestConsole__storeLatest_(draft);
  try { Logger.log(draft.reportText); } catch (eL) { /* ignore */ }
  return draft;
}

function CbvTcsMilestone07AppSheetLiveBridge_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = null;
  try {
    if (__CBV_TCS_MILESTONE07_TC_LAST_REPORT) r = __CBV_TCS_MILESTONE07_TC_LAST_REPORT;
    else if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_MILESTONE07_TC_LAST_PROP_KEY);
      if (raw) r = JSON.parse(raw);
    }
  } catch (e) {
    r = null;
  }
  if (!r) {
    ui.alert('No report', 'Run M07 — AppSheet Live Bridge Test first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Milestone 07 — copy report');
  return { ok: true };
}
