/**
 * MILESTONE_03 — Daily operation flow — Full test (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Run Milestone 03 Daily Operation Flow Test
 *
 * Depends: 998P (envelope), 998L (Drive bundle), 998S (daily runtime), 998F (VI), 998H (route URL).
 */

var __CBV_TCS_MILESTONE03_TC_LAST_REPORT = null;
var __CBV_TCS_MILESTONE03_TC_LAST_PROP_KEY = 'CBV_TCS_MILESTONE03_TC_LAST_REPORT_JSON';

function CbvTcsMilestone03DailyOp_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_MILESTONE03_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_MILESTONE03_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsMilestone03DailyOp_TestConsole__getLatest_() {
  if (__CBV_TCS_MILESTONE03_TC_LAST_REPORT) return __CBV_TCS_MILESTONE03_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_MILESTONE03_TC_LAST_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_TCS_MILESTONE03_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

function CbvTcsMilestone03DailyOp__buildEvidenceHtml_(checks) {
  var failed = (checks || []).filter(function (c) { return c && c.ok === false; });
  var rows = failed.map(function (c) {
    return '<tr><td>' + String(c.code || '').replace(/</g, '&lt;') + '</td><td>' + String(c.severity || '').replace(/</g, '&lt;') + '</td><td>' + String(c.message || '').replace(/</g, '&lt;') + '</td></tr>';
  }).join('');
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>MILESTONE_03 Evidence</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>' +
    '<h1>MILESTONE_03 — Failed checks</h1>' +
    (failed.length ? ('<table><thead><tr><th>code</th><th>severity</th><th>message</th></tr></thead><tbody>' + rows + '</tbody></table>') : '<p>No failed checks.</p>') +
    '</body></html>';
}

function CbvTcsMilestone03DailyOp__buildAiHandoffMd_(draft, traceId) {
  return [
    '# AI Handoff — Milestone 03 (Daily operation flow)',
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

function CbvTcsMilestone03DailyOp__viValidateDetail_(vu) {
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
 * One-click Milestone 03 daily operation verification + Drive 6-file bundle.
 */
function CbvTcsMilestone03DailyOp_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSM03_')
    : ('WSM03_' + new Date().getTime());

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

  addCheck('PAGE_TYPES_DAILY', typeof CBV_WEBAPP_WS_PAGE_TYPES !== 'undefined' && !!CBV_WEBAPP_WS_PAGE_TYPES.DAILY_OPERATION_HOME, 'OK', 'DAILY_OPERATION_HOME page type', {});

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_WS_DAILY', paths.indexOf('/workspace/daily') >= 0, paths.indexOf('/workspace/daily') >= 0 ? 'OK' : 'ERROR', '/workspace/daily', {});
    addCheck('ROUTE_DAILY_ALIAS', paths.indexOf('/daily') >= 0, paths.indexOf('/daily') >= 0 ? 'OK' : 'ERROR', '/daily', {});
  } catch (eR) {
    addCheck('ROUTE_WS_DAILY', false, 'ERROR', String(eR), {});
  }

  addCheck('FN_DAILY_MODEL', typeof CbvDailyOp_getDailyHomeModel_ === 'function', 'OK', 'CbvDailyOp_getDailyHomeModel_', {});
  addCheck('FN_URGENT', typeof CbvDailyOp_getUrgentItems_ === 'function', 'OK', 'CbvDailyOp_getUrgentItems_', {});
  addCheck('FN_BLOCKED', typeof CbvDailyOp_getBlockedItems_ === 'function', 'OK', 'CbvDailyOp_getBlockedItems_', {});
  addCheck('FN_NEXT_ACTIONS', typeof CbvDailyOp_getNextActions_ === 'function', 'OK', 'CbvDailyOp_getNextActions_', {});
  addCheck('FN_RANK', typeof CbvDailyOp_rankTaskUrgency_ === 'function', 'OK', 'CbvDailyOp_rankTaskUrgency_', {});
  addCheck('FN_CARD_V2', typeof CbvDailyOp_buildTaskCardV2Html_ === 'function', 'OK', 'CbvDailyOp_buildTaskCardV2Html_', {});
  addCheck('DRIVE_BUNDLE_FN', typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function', 'OK', 'CbvTcsDriveReport_exportMilestoneFullTestBundle', {});

  try {
    var dm = CbvDailyOp_getDailyHomeModel_('', 'ALL');
    var shape = !!(dm && dm.counts && typeof dm.counts.inbox === 'number');
    addCheck('DAILY_MODEL_SHAPE', shape, shape ? 'OK' : 'WARNING', 'Daily home model counts', { keys: dm ? Object.keys(dm) : [] });
  } catch (eI) {
    addCheck('DAILY_MODEL_SHAPE', false, 'WARNING', String(eI), {});
  }

  var probeTask = {
    taskId: 'TC_PROBE',
    title: 'TC probe card',
    status: 'OPEN',
    priority: 'NORMAL',
    slaState: 'SLA_WARNING',
    assignedTo: '',
    nextAction: '',
    sourceModule: 'HOME_ALERT',
    dueAt: ''
  };
  try {
    var cardHtml = CbvDailyOp_buildTaskCardV2Html_(probeTask);
    var mk = ['cbv-daily-task-card', 'cbv-daily-primary-action', 'cbv-daily-secondary-action', 'cbv-daily-priority-badge', 'cbv-daily-sla-badge', 'cbv-daily-next-action'];
    var miss = mk.filter(function (x) { return cardHtml.indexOf(x) < 0; });
    addCheck('TASK_CARD_MARKERS', miss.length === 0, miss.length ? 'ERROR' : 'OK', 'Task card V2 markers', { missing: miss });
  } catch (eC) {
    addCheck('TASK_CARD_MARKERS', false, 'ERROR', String(eC), {});
  }

  try {
    var na = CbvDailyOp_getNextActionForTask_({ status: 'BLOCKED', slaState: '', title: 'x' });
    var okNa = typeof na === 'string' && na.length > 0;
    addCheck('NEXT_ACTION_ENGINE', okNa, okNa ? 'OK' : 'ERROR', 'CbvDailyOp_getNextActionForTask_', { sample: na });
  } catch (eN) {
    addCheck('NEXT_ACTION_ENGINE', false, 'ERROR', String(eN), {});
  }

  try {
    var pri = (typeof CbvWebAppVi_buildPrimaryNavHtml_ === 'function') ? CbvWebAppVi_buildPrimaryNavHtml_('/workspace/daily') : '';
    var sec = (typeof CbvWebAppVi_buildSecondaryNavHtml_ === 'function') ? CbvWebAppVi_buildSecondaryNavHtml_('/workspace/daily') : '';
    var hasPri = pri.indexOf('cbv-primary-nav') >= 0 && pri.indexOf('/workspace/daily') >= 0;
    var hasSec = sec.indexOf('cbv-secondary-quick-links') >= 0 && sec.indexOf('/home-alert/sla') >= 0;
    var noDup = pri.indexOf('/home-alert/sla') < 0;
    addCheck('NAV_PRIMARY', hasPri, hasPri ? 'OK' : 'ERROR', 'Primary nav contains Daily', { len: pri.length });
    addCheck('NAV_SECONDARY', hasSec, hasSec ? 'OK' : 'ERROR', 'Secondary quick links include SLA', { len: sec.length });
    addCheck('NAV_NO_DUP_SLA', noDup, noDup ? 'OK' : 'ERROR', 'SLA not duplicated in primary strip', {});
    var staffMark = pri.indexOf('cbv-staff-default-daily') >= 0;
    addCheck('NAV_STAFF_DEFAULT_DAILY', staffMark, staffMark ? 'OK' : 'WARNING', 'Daily link carries staff default marker', {});
  } catch (eNav) {
    addCheck('NAV_PRIMARY', false, 'ERROR', String(eNav), {});
  }

  var probe = (typeof CbvDailyOp_probeDailyMarkersInProject_ === 'function') ? CbvDailyOp_probeDailyMarkersInProject_() : { ok: false, missing: ['probe_fn'] };
  addCheck('UI_MARKERS_DAILY', probe.ok === true, probe.ok ? 'OK' : 'ERROR', 'Daily + shell marker probe', probe.detail || probe);

  try {
    var phrases = (typeof CBV_WEBAPP_WS_SAFETY_PHRASES !== 'undefined' && CBV_WEBAPP_WS_SAFETY_PHRASES) ? CBV_WEBAPP_WS_SAFETY_PHRASES.join(' ') : '';
    var safety = phrases.indexOf('No auto assign') >= 0 && phrases.indexOf('No auto resolve') >= 0 && phrases.indexOf('No auto escalate') >= 0;
    addCheck('SAFETY_PHRASES', safety, safety ? 'OK' : 'WARNING', 'Workspace safety phrases (manual-first)', {});
  } catch (eY) {
    addCheck('SAFETY_PHRASES', false, 'WARNING', String(eY), {});
  }

  try {
    var reg2 = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths2 = (reg2 || []).map(function (r) { return r.route; });
    addCheck('ROUTE_STAFF_PRESERVED', paths2.indexOf('/workspace/staff/tasks') >= 0, paths2.indexOf('/workspace/staff/tasks') >= 0 ? 'OK' : 'ERROR', 'Staff tasks route preserved', {});
    var admOk = paths2.indexOf('/runtime/health') >= 0 && paths2.indexOf('/reports') >= 0;
    addCheck('ROUTE_ADMIN_PRESERVED', admOk, admOk ? 'OK' : 'ERROR', 'Admin placeholder routes still registered', {});
  } catch (eP) {
    addCheck('ROUTE_STAFF_PRESERVED', false, 'WARNING', String(eP), {});
  }

  try {
    var fb = (typeof CbvStaffWorkspace_submitFeedbackSafe_ === 'function') ? CbvStaffWorkspace_submitFeedbackSafe_({}) : null;
    var vOk = fb && fb.ok === false && (fb.errors || []).length > 0;
    addCheck('FEEDBACK_VALIDATION_ONLY', vOk, vOk ? 'OK' : 'WARNING', 'Empty payload rejected (no silent mutation)', fb || {});
  } catch (eF) {
    addCheck('FEEDBACK_VALIDATION_ONLY', false, 'WARNING', String(eF), {});
  }

  var vu = null;
  try {
    vu = (typeof CbvWebAppVi_validate === 'function') ? CbvWebAppVi_validate() : null;
    var viDetail = CbvTcsMilestone03DailyOp__viValidateDetail_(vu);
    addCheck('VI_VALIDATE', vu && vu.ok === true, vu && vu.ok ? 'OK' : 'ERROR', 'CbvWebAppVi_validate', viDetail);
    if (vu && vu.warnings) vu.warnings.forEach(function (w) { externalWarnings.push('VI_VALIDATE: ' + w); });
  } catch (eV) {
    addCheck('VI_VALIDATE', false, 'WARNING', String(eV), { viOk: false, exception: String(eV) });
  }

  try {
    var tDaily = (typeof CbvWebAppVi_getRouteLabel === 'function') ? CbvWebAppVi_getRouteLabel('/workspace/daily') : '';
    var tAlias = (typeof CbvWebAppVi_getRouteLabel === 'function') ? CbvWebAppVi_getRouteLabel('/daily') : '';
    var titlesOk = String(tDaily || '').trim().length > 0 && String(tAlias || '').trim().length > 0;
    addCheck('VI_ROUTE_TITLE_DAILY', titlesOk, titlesOk ? 'OK' : 'ERROR', 'VI titles for /workspace/daily and /daily', { tDaily: tDaily, tAlias: tAlias });
    var navDaily = (typeof CbvWebAppVi_getLabel === 'function') ? CbvWebAppVi_getLabel('nav_daily') : '';
    addCheck('VI_NAV_LABEL_DAILY', String(navDaily || '').trim().length > 0, String(navDaily || '').trim().length > 0 ? 'OK' : 'ERROR', 'nav_daily label', { nav_daily: navDaily });
  } catch (eT) {
    addCheck('VI_ROUTE_TITLE_DAILY', false, 'ERROR', String(eT), {});
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
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['M01_FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P before 998T.' };

  var reportText = [
    '=== MILESTONE_03 — DAILY OPERATION FLOW TEST ===',
    'traceId=' + traceId,
    'runStatus=' + runFin.status,
    'runOk=' + String(runFin.ok),
    'failedChecks=' + JSON.stringify((checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) { return c.code; }))
  ].join('\n');

  var draft = {
    ok: runFin.ok,
    phase: 'MILESTONE_03_DAILY_OPERATION_FLOW',
    status: runFin.status,
    checkedAt: now,
    runBy: runBy,
    traceId: traceId,
    testSuite: 'MILESTONE_03_DAILY_OPERATION_FLOW',
    summary: 'Milestone 03 daily operation test (pre-envelope): ' + runFin.status + ' (' + runFin.severity + ')',
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep,
    severity: runFin.severity,
    reportText: reportText,
    reportJson: { driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '', milestone03: true },
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
      mode: 'CBV_TCS_V1_MILESTONE03'
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
  draft.summary = 'Milestone 03 daily operation test: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nfinalOk=' + String(fin.ok) + '\nenvelopeOk=' + String(draft.envelopeOk);

  var bundleEx = null;
  try {
    if (typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function' && typeof CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_ === 'function') {
      var exportDraft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, true, {
        preWrite: true,
        expectedMinFiles: 6,
        note: 'Milestone 03 Drive bundle'
      });
      exportDraft.reportJson.finalStatus = exportDraft.status;
      exportDraft.reportJson.ok = exportDraft.ok;
      exportDraft.reportJson.severity = exportDraft.severity;
      exportDraft.reportJson.envelopeOk = exportDraft.envelopeOk;

      var handoffMd = CbvTcsMilestone03DailyOp__buildAiHandoffMd_(exportDraft, traceId);
      bundleEx = CbvTcsDriveReport_exportMilestoneFullTestBundle(exportDraft, {
        tagStem: '105_MILESTONE_03_DAILY_OPERATION_FLOW',
        aiHandoffMarkdown: handoffMd,
        evidenceHtml: CbvTcsMilestone03DailyOp__buildEvidenceHtml_(exportDraft.checks)
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

  CbvTcsMilestone03DailyOp_TestConsole__storeLatest_(draft);
  try { Logger.log(draft.reportText); } catch (eL) { /* ignore */ }
  return draft;
}

function CbvTcsMilestone03DailyOp_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvTcsMilestone03DailyOp_TestConsole__getLatest_();
  if (!r) {
    ui.alert('No report', 'Run Milestone 03 Daily Operation Flow Test first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Milestone 03 — copy report');
  return { ok: true };
}
