/**
 * MILESTONE_02 — Staff operation workspace — Full test (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Run Milestone 02 Staff Workspace Test
 *
 * Depends: 998P (envelope+draft helpers), 998L (Drive bundle), 998Q (staff runtime).
 */

var __CBV_TCS_MILESTONE02_TC_LAST_REPORT = null;
var __CBV_TCS_MILESTONE02_TC_LAST_PROP_KEY = 'CBV_TCS_MILESTONE02_TC_LAST_REPORT_JSON';

function CbvTcsMilestone02StaffWorkspace_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_MILESTONE02_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_MILESTONE02_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsMilestone02StaffWorkspace_TestConsole__getLatest_() {
  if (__CBV_TCS_MILESTONE02_TC_LAST_REPORT) return __CBV_TCS_MILESTONE02_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_MILESTONE02_TC_LAST_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_TCS_MILESTONE02_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

function CbvTcsMilestone02StaffWorkspace__buildEvidenceHtml_(checks) {
  var failed = (checks || []).filter(function (c) { return c && c.ok === false; });
  var rows = failed.map(function (c) {
    return '<tr><td>' + String(c.code || '').replace(/</g, '&lt;') + '</td><td>' + String(c.severity || '').replace(/</g, '&lt;') + '</td><td>' + String(c.message || '').replace(/</g, '&lt;') + '</td></tr>';
  }).join('');
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>MILESTONE_02 Evidence</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>' +
    '<h1>MILESTONE_02 — Failed checks</h1>' +
    (failed.length ? ('<table><thead><tr><th>code</th><th>severity</th><th>message</th></tr></thead><tbody>' + rows + '</tbody></table>') : '<p>No failed checks.</p>') +
    '</body></html>';
}

function CbvTcsMilestone02StaffWorkspace__buildAiHandoffMd_(draft, traceId) {
  return [
    '# AI Handoff — Milestone 02 (Staff operation workspace)',
    '',
    '**finalStatus:** `' + draft.status + '`',
    '**ok:** `' + String(draft.ok) + '`',
    '**severity:** `' + draft.severity + '`',
    '**envelopeOk:** `' + String(draft.envelopeOk) + '`',
    '**traceId:** `' + traceId + '`',
    '',
    draft.status === 'FAIL' ? '## Outcome: FAIL\nDo not claim milestone ready.\n' : '## Outcome\n',
    (draft.checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) {
      return '- **' + c.code + '** (' + c.severity + '): ' + c.message;
    }).join('\n') || '- (none)',
    '',
    '## Next',
    String(draft.nextStep || '')
  ].join('\n');
}

function CbvTcsMilestone02StaffWorkspace__viValidateDetail_(vu) {
  if (!vu) {
    return {
      viOk: false,
      note: 'CbvWebAppVi_validate returned null',
      canonicalOk: false,
      noMutationExposed: false,
      missingRoutes: [],
      missingLabels: [],
      routeKeysCount: 0,
      labelKeysCount: 0,
      navExpectedCount: 0,
      navActualCount: 0,
      errorCount: 0,
      warningCount: 0,
      errorsSample: [],
      warningsSample: []
    };
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
    routeKeysCount: typeof d.routeKeysCount === 'number' ? d.routeKeysCount : 0,
    labelKeysCount: typeof d.labelKeysCount === 'number' ? d.labelKeysCount : 0,
    navExpectedCount: typeof d.navExpectedCount === 'number' ? d.navExpectedCount : 0,
    navActualCount: typeof d.navActualCount === 'number' ? d.navActualCount : 0,
    errorCount: errs.length,
    warningCount: warns.length,
    errorsSample: errs.slice(0, 6),
    warningsSample: warns.slice(0, 4),
    mutationProbeCount: (d.mutationProbe || []).length
  };
}

/**
 * One-click Milestone 02 staff workspace verification + Drive 6-file bundle.
 */
function CbvTcsMilestone02StaffWorkspace_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSM02_')
    : ('WSM02_' + new Date().getTime());

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

  var selfT = (typeof CbvTcsMilestone01OpWorkspace__selfTestAggregator_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__selfTestAggregator_()
    : { ok: false, cases: [] };
  addCheck('AGGREGATOR_SELF_TEST', selfT.ok === true, selfT.ok ? 'OK' : 'WARNING', 'Reuse Milestone 01 finalize harness', { cases: selfT.cases || [] });

  addCheck('PAGE_TYPES_STAFF', typeof CBV_WEBAPP_WS_PAGE_TYPES !== 'undefined' && !!CBV_WEBAPP_WS_PAGE_TYPES.STAFF_TASKS, 'OK', 'STAFF_TASKS page type', {});

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_WS_STAFF_TASKS', paths.indexOf('/workspace/staff/tasks') >= 0, paths.indexOf('/workspace/staff/tasks') >= 0 ? 'OK' : 'ERROR', '/workspace/staff/tasks', {});
    addCheck('ROUTE_STAFF_TASKS', paths.indexOf('/staff/tasks') >= 0, paths.indexOf('/staff/tasks') >= 0 ? 'OK' : 'ERROR', '/staff/tasks', {});
    addCheck('ROUTE_WS_STAFF_DETAIL', paths.indexOf('/workspace/staff/task-detail') >= 0, paths.indexOf('/workspace/staff/task-detail') >= 0 ? 'OK' : 'ERROR', '/workspace/staff/task-detail', {});
    addCheck('ROUTE_STAFF_DETAIL', paths.indexOf('/staff/task-detail') >= 0, paths.indexOf('/staff/task-detail') >= 0 ? 'OK' : 'ERROR', '/staff/task-detail', {});
    addCheck('ROUTE_WS_STAFF_FEEDBACK', paths.indexOf('/workspace/staff/feedback') >= 0, paths.indexOf('/workspace/staff/feedback') >= 0 ? 'OK' : 'ERROR', '/workspace/staff/feedback', {});
    addCheck('ROUTE_STAFF_FEEDBACK', paths.indexOf('/staff/feedback') >= 0, paths.indexOf('/staff/feedback') >= 0 ? 'OK' : 'ERROR', '/staff/feedback', {});
  } catch (eR) {
    addCheck('ROUTE_WS_STAFF_TASKS', false, 'ERROR', String(eR), {});
  }

  addCheck('MODEL_INBOX', typeof CbvStaffWorkspace_getTaskInboxModel_ === 'function', 'OK', 'CbvStaffWorkspace_getTaskInboxModel_', {});
  addCheck('MODEL_DETAIL', typeof CbvStaffWorkspace_getTaskDetailModel_ === 'function', 'OK', 'CbvStaffWorkspace_getTaskDetailModel_', {});
  addCheck('ADAPTER_READ', typeof CbvStaffWorkspace_readTasksAdapter_ === 'function', 'OK', 'CbvStaffWorkspace_readTasksAdapter_', {});
  addCheck('ADAPTER_STATUS', typeof CbvStaffWorkspace_getDataSourceStatus_ === 'function', 'OK', 'CbvStaffWorkspace_getDataSourceStatus_', {});
  addCheck('NORMALIZE', typeof CbvStaffWorkspace_normalizeTaskRow_ === 'function', 'OK', 'CbvStaffWorkspace_normalizeTaskRow_', {});
  addCheck('FEEDBACK_SUBMIT', typeof CbvStaffWorkspace_submitFeedbackSafe_ === 'function', 'OK', 'CbvStaffWorkspace_submitFeedbackSafe_', {});
  addCheck('FEEDBACK_SINK', typeof CbvStaffWorkspace_getFeedbackSinkStatus_ === 'function', 'OK', 'CbvStaffWorkspace_getFeedbackSinkStatus_', {});
  addCheck('DRIVE_BUNDLE_FN', typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function', 'OK', 'CbvTcsDriveReport_exportMilestoneFullTestBundle', {});

  try {
    var inv = CbvStaffWorkspace_getTaskInboxModel_('');
    var shape = !!(inv && inv.counts && typeof inv.counts.inbox === 'number');
    addCheck('INBOX_MODEL_SHAPE', shape, shape ? 'OK' : 'WARNING', 'Inbox model counts', { keys: inv ? Object.keys(inv) : [] });
  } catch (eI) {
    addCheck('INBOX_MODEL_SHAPE', false, 'WARNING', String(eI), {});
  }

  try {
    var dm = CbvStaffWorkspace_getTaskDetailModel_('');
    var dOk = !!(dm && dm.empty === true && dm.warnings && dm.warnings.length);
    addCheck('DETAIL_EMPTY_SAFE', dOk, dOk ? 'OK' : 'WARNING', 'No taskId yields safe empty model', { keys: dm ? Object.keys(dm) : [] });
  } catch (eD) {
    addCheck('DETAIL_EMPTY_SAFE', false, 'WARNING', String(eD), {});
  }

  try {
    var fb = CbvStaffWorkspace_submitFeedbackSafe_({});
    var vOk = fb && fb.ok === false && (fb.errors || []).length > 0;
    addCheck('FEEDBACK_VALIDATION_ONLY', vOk, vOk ? 'OK' : 'WARNING', 'Empty payload rejected (no silent mutation)', fb || {});
  } catch (eF) {
    addCheck('FEEDBACK_VALIDATION_ONLY', false, 'WARNING', String(eF), {});
  }

  try {
    var ds = CbvStaffWorkspace_getDataSourceStatus_();
    var noHardcode = ds && ds.hardcodedDbId === false;
    addCheck('NO_HARDCODED_DB_ID', noHardcode, noHardcode ? 'OK' : 'WARNING', 'Adapter status flags', ds || {});
  } catch (eS) {
    addCheck('NO_HARDCODED_DB_ID', false, 'WARNING', String(eS), {});
  }

  var probe = (typeof CbvStaffWorkspace_probeStaffMarkersInProject_ === 'function') ? CbvStaffWorkspace_probeStaffMarkersInProject_() : { ok: false, missing: ['probe_fn'] };
  addCheck('UI_MARKERS_STAFF', probe.ok === true, probe.ok ? 'OK' : 'ERROR', 'Staff + shell/components markers', probe.detail || probe);

  try {
    var raw = '';
    if (typeof CbvStaffWorkspace__readHtmlRaw_ === 'function') {
      raw = CbvStaffWorkspace__readHtmlRaw_('html/WEBAPP_STAFF_TASKS') + CbvStaffWorkspace__readHtmlRaw_('html/WEBAPP_WORKSPACE_SHELL');
    }
    var mob = raw.indexOf('cbv-staff-mobile-stack') >= 0 && raw.indexOf('cbv-mobile-stack') >= 0;
    addCheck('MOBILE_STACK_MARKERS', mob, mob ? 'OK' : 'WARNING', 'Responsive / mobile stack markers present', { len: raw.length });
  } catch (eM) {
    addCheck('MOBILE_STACK_MARKERS', false, 'WARNING', String(eM), {});
  }

  try {
    var phrases = (typeof CBV_WEBAPP_WS_SAFETY_PHRASES !== 'undefined' && CBV_WEBAPP_WS_SAFETY_PHRASES) ? CBV_WEBAPP_WS_SAFETY_PHRASES.join(' ') : '';
    var safety = phrases.indexOf('No auto assign') >= 0 && phrases.indexOf('No auto resolve') >= 0 && phrases.indexOf('No auto escalate') >= 0;
    addCheck('SAFETY_PHRASES', safety, safety ? 'OK' : 'WARNING', 'Workspace safety phrases (manual-first)', {});
  } catch (eY) {
    addCheck('SAFETY_PHRASES', false, 'WARNING', String(eY), {});
  }

  var vu = null;
  try {
    vu = (typeof CbvWebAppVi_validate === 'function') ? CbvWebAppVi_validate() : null;
    var viDetail = CbvTcsMilestone02StaffWorkspace__viValidateDetail_(vu);
    addCheck('VI_VALIDATE', vu && vu.ok === true, vu && vu.ok ? 'OK' : 'ERROR', 'CbvWebAppVi_validate', viDetail);
    if (vu && vu.warnings) vu.warnings.forEach(function (w) { externalWarnings.push('VI_VALIDATE: ' + w); });
  } catch (eV) {
    addCheck('VI_VALIDATE', false, 'WARNING', String(eV), { viOk: false, exception: String(eV) });
  }

  var vr = null;
  try {
    vr = (typeof CbvWebAppRouteUrl_validate === 'function') ? CbvWebAppRouteUrl_validate() : null;
    addCheck('ROUTE_URL_VALIDATE', vr && vr.ok === true, vr && vr.ok ? 'OK' : 'ERROR', 'CbvWebAppRouteUrl_validate', {});
    if (vr && vr.warnings) vr.warnings.forEach(function (w) { externalWarnings.push('ROUTE_URL_VALIDATE: ' + w); });
  } catch (eH) {
    addCheck('ROUTE_URL_VALIDATE', false, 'WARNING', String(eH), {});
  }

  var now = (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date();
  var runBy = (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : '');

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['M01_FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P before 998R.' };

  var reportText = [
    '=== MILESTONE_02 — STAFF OPERATION WORKSPACE TEST ===',
    'traceId=' + traceId,
    'runStatus=' + runFin.status,
    'runOk=' + String(runFin.ok),
    'failedChecks=' + JSON.stringify((checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) { return c.code; }))
  ].join('\n');

  var draft = {
    ok: runFin.ok,
    phase: 'MILESTONE_02_STAFF_OPERATION_WORKSPACE',
    status: runFin.status,
    checkedAt: now,
    runBy: runBy,
    traceId: traceId,
    testSuite: 'MILESTONE_02_STAFF_OPERATION_WORKSPACE',
    summary: 'Milestone 02 staff workspace test (pre-envelope): ' + runFin.status + ' (' + runFin.severity + ')',
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep,
    severity: runFin.severity,
    reportText: reportText,
    reportJson: { driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '', milestone02: true },
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
    detail: {
      keysOk: keysOk,
      itemContractOk: ic.ok,
      reportTextLen: String(reportText || '').length,
      runStatus: runFin.status,
      mode: 'CBV_TCS_V1_MILESTONE02'
    }
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
  draft.summary = 'Milestone 02 staff workspace test: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nfinalOk=' + String(fin.ok) + '\nenvelopeOk=' + String(draft.envelopeOk);

  var bundleEx = null;
  try {
    if (typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function' && typeof CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_ === 'function') {
      var exportDraft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, true, {
        preWrite: true,
        expectedMinFiles: 6,
        note: 'Milestone 02 Drive bundle'
      });
      exportDraft.reportJson.finalStatus = exportDraft.status;
      exportDraft.reportJson.ok = exportDraft.ok;
      exportDraft.reportJson.severity = exportDraft.severity;
      exportDraft.reportJson.envelopeOk = exportDraft.envelopeOk;

      var handoffMd = CbvTcsMilestone02StaffWorkspace__buildAiHandoffMd_(exportDraft, traceId);
      bundleEx = CbvTcsDriveReport_exportMilestoneFullTestBundle(exportDraft, {
        tagStem: 'MILESTONE_02_STAFF_WORKSPACE',
        aiHandoffMarkdown: handoffMd,
        evidenceHtml: CbvTcsMilestone02StaffWorkspace__buildEvidenceHtml_(exportDraft.checks)
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

  CbvTcsMilestone02StaffWorkspace_TestConsole__storeLatest_(draft);
  try { Logger.log(draft.reportText); } catch (eL) { /* ignore */ }
  return draft;
}

function CbvTcsMilestone02StaffWorkspace_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvTcsMilestone02StaffWorkspace_TestConsole__getLatest_();
  if (!r) {
    ui.alert('No report', 'Run Milestone 02 Staff Workspace Test first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Milestone 02 — copy report');
  return { ok: true };
}
