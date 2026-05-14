/**
 * MILESTONE_04 — Operation execution flow — Full test (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Run Milestone 04 Operation Execution Flow Test
 *
 * Depends: 998P (envelope), 998L (Drive), 998U (exec flow), 998F (VI), 998H (route URL), 998Q, 998S.
 */

var __CBV_TCS_MILESTONE04_TC_LAST_REPORT = null;
var __CBV_TCS_MILESTONE04_TC_LAST_PROP_KEY = 'CBV_TCS_MILESTONE04_TC_LAST_REPORT_JSON';

function CbvTcsMilestone04ExecFlow_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_MILESTONE04_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_MILESTONE04_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsMilestone04ExecFlow_TestConsole__getLatest_() {
  if (__CBV_TCS_MILESTONE04_TC_LAST_REPORT) return __CBV_TCS_MILESTONE04_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_MILESTONE04_TC_LAST_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_TCS_MILESTONE04_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

function CbvTcsMilestone04__buildEvidenceHtml_(checks) {
  var failed = (checks || []).filter(function (c) { return c && c.ok === false; });
  var rows = failed.map(function (c) {
    return '<tr><td>' + String(c.code || '').replace(/</g, '&lt;') + '</td><td>' + String(c.severity || '').replace(/</g, '&lt;') + '</td><td>' + String(c.message || '').replace(/</g, '&lt;') + '</td></tr>';
  }).join('');
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>MILESTONE_04 Evidence</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>' +
    '<h1>MILESTONE_04 — Failed checks</h1>' +
    (failed.length ? ('<table><thead><tr><th>code</th><th>severity</th><th>message</th></tr></thead><tbody>' + rows + '</tbody></table>') : '<p>No failed checks.</p>') +
    '</body></html>';
}

function CbvTcsMilestone04__buildAiHandoffMd_(draft, traceId) {
  return [
    '# AI Handoff — Milestone 04 (Operation execution flow)',
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

function CbvTcsMilestone04__htmlSignalsRoute_(html, routePath) {
  var h = String(html || '');
  var r = String(routePath || '');
  var out = { ok: false, mode: 'none', encodedSample: '' };
  if (!r) return out;
  if (h.indexOf('data-route="' + r + '"') >= 0) {
    out.ok = true;
    out.mode = 'data-route';
    return out;
  }
  var enc = encodeURIComponent(r);
  out.encodedSample = enc;
  if (h.indexOf(enc) >= 0) {
    out.ok = true;
    out.mode = 'encoded-url';
    return out;
  }
  if (h.indexOf(r) >= 0) {
    out.ok = true;
    out.mode = 'raw-route';
    return out;
  }
  return out;
}

function CbvTcsMilestone04__viValidateDetail_(vu) {
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
 * One-click Milestone 04 execution flow verification + Drive 6-file bundle.
 */
function CbvTcsMilestone04ExecFlow_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSM04_')
    : ('WSM04_' + new Date().getTime());

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

  addCheck('PAGE_TYPES_FOCUS', typeof CBV_WEBAPP_WS_PAGE_TYPES !== 'undefined' && !!CBV_WEBAPP_WS_PAGE_TYPES.FOCUS_MODE, 'OK', 'FOCUS_MODE page type', {});

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_WS_FOCUS', paths.indexOf('/workspace/focus') >= 0, paths.indexOf('/workspace/focus') >= 0 ? 'OK' : 'ERROR', '/workspace/focus', {});
    addCheck('ROUTE_FOCUS_ALIAS', paths.indexOf('/focus') >= 0, paths.indexOf('/focus') >= 0 ? 'OK' : 'ERROR', '/focus', {});
    addCheck('ROUTE_WS_EXEC_TASK', paths.indexOf('/workspace/execution/task') >= 0, paths.indexOf('/workspace/execution/task') >= 0 ? 'OK' : 'ERROR', '/workspace/execution/task', {});
    addCheck('ROUTE_EXEC_TASK_ALIAS', paths.indexOf('/execution/task') >= 0, paths.indexOf('/execution/task') >= 0 ? 'OK' : 'ERROR', '/execution/task', {});
    addCheck('ROUTE_WS_STAFF_DETAIL', paths.indexOf('/workspace/staff/task-detail') >= 0, paths.indexOf('/workspace/staff/task-detail') >= 0 ? 'OK' : 'ERROR', '/workspace/staff/task-detail', {});
    addCheck('ROUTE_STAFF_DETAIL_ALIAS', paths.indexOf('/staff/task-detail') >= 0, paths.indexOf('/staff/task-detail') >= 0 ? 'OK' : 'ERROR', '/staff/task-detail', {});
    addCheck('ROUTE_WS_DAILY', paths.indexOf('/workspace/daily') >= 0, paths.indexOf('/workspace/daily') >= 0 ? 'OK' : 'ERROR', '/workspace/daily (M03 regression)', {});
    addCheck('ROUTE_DAILY_ALIAS', paths.indexOf('/daily') >= 0, paths.indexOf('/daily') >= 0 ? 'OK' : 'ERROR', '/daily (M03 regression)', {});
    addCheck('ROUTE_M01_TODAY', paths.indexOf('/workspace/today') >= 0, paths.indexOf('/workspace/today') >= 0 ? 'OK' : 'ERROR', '/workspace/today', {});
    addCheck('ROUTE_M01_GUIDED', paths.indexOf('/workspace/guided') >= 0, paths.indexOf('/workspace/guided') >= 0 ? 'OK' : 'ERROR', '/workspace/guided', {});
    addCheck('ROUTE_M01_ROLE', paths.indexOf('/workspace/role-home') >= 0, paths.indexOf('/workspace/role-home') >= 0 ? 'OK' : 'ERROR', '/workspace/role-home', {});
    addCheck('ROUTE_M02_STAFF_TASKS', paths.indexOf('/workspace/staff/tasks') >= 0, paths.indexOf('/workspace/staff/tasks') >= 0 ? 'OK' : 'ERROR', '/workspace/staff/tasks', {});
  } catch (eR) {
    addCheck('ROUTE_WS_FOCUS', false, 'ERROR', String(eR), {});
  }

  addCheck('FN_GET_TASK_EXEC_MODEL', typeof CbvExecFlow_getTaskExecutionModel_ === 'function', 'OK', 'CbvExecFlow_getTaskExecutionModel_', {});
  addCheck('FN_GET_FOCUS_MODEL', typeof CbvExecFlow_getFocusModel_ === 'function', 'OK', 'CbvExecFlow_getFocusModel_', {});
  addCheck('FN_PICK_FOCUS_TASK', typeof CbvExecFlow_pickFocusTask_ === 'function', 'OK', 'CbvExecFlow_pickFocusTask_', {});
  addCheck('FN_GET_ACTION_STACK', typeof CbvExecFlow_getActionStack_ === 'function', 'OK', 'CbvExecFlow_getActionStack_', {});
  addCheck('FN_BUILD_ACTION_STACK_HTML', typeof CbvExecFlow_buildActionStackHtml_ === 'function', 'OK', 'CbvExecFlow_buildActionStackHtml_', {});
  addCheck('FN_DETECT_BLOCKERS', typeof CbvExecFlow_detectBlockers_ === 'function', 'OK', 'CbvExecFlow_detectBlockers_', {});
  addCheck('FN_BLOCKER_RESOLUTION', typeof CbvExecFlow_getBlockerResolution_ === 'function', 'OK', 'CbvExecFlow_getBlockerResolution_', {});
  addCheck('FN_URGENCY', typeof CbvExecFlow_getUrgencyExplanation_ === 'function', 'OK', 'CbvExecFlow_getUrgencyExplanation_', {});
  addCheck('FN_OPERATOR_PROMPT', typeof CbvExecFlow_getOperatorPrompt_ === 'function', 'OK', 'CbvExecFlow_getOperatorPrompt_', {});

  var types = ['SLA_BREACH', 'BLOCKED_STATUS', 'UNASSIGNED', 'MISSING_DATA', 'UNKNOWN', 'NEED_SUPPORT'];
  var resOk = true;
  var resDetail = {};
  for (var ti = 0; ti < types.length; ti++) {
    var br = (typeof CbvExecFlow_getBlockerResolution_ === 'function') ? CbvExecFlow_getBlockerResolution_(types[ti]) : null;
    var one = !!(br && String(br.reason || '').trim() && String(br.next || '').trim());
    resDetail[types[ti]] = one;
    if (!one) resOk = false;
  }
  addCheck('BLOCKER_RESOLUTION_MAP', resOk, resOk ? 'OK' : 'ERROR', 'Blocker resolution rows for core types', resDetail);

  try {
    var needSup = CbvExecFlow_detectBlockers_({ status: 'NEED_HELP', title: 'x', assignedTo: 'u@x.com', slaState: '' });
    addCheck('BLOCKER_DETECT_NEED_SUPPORT', needSup.indexOf('NEED_SUPPORT') >= 0, needSup.indexOf('NEED_SUPPORT') >= 0 ? 'OK' : 'WARNING', 'NEED_SUPPORT detection', { types: needSup });
  } catch (eB) {
    addCheck('BLOCKER_DETECT_NEED_SUPPORT', false, 'WARNING', String(eB), {});
  }

  var probe = (typeof CbvExecFlow_probeExecutionMarkersInProject_ === 'function') ? CbvExecFlow_probeExecutionMarkersInProject_() : { ok: false, missing: ['probe_fn'] };
  addCheck('EXEC_MARKER_PROBE', probe.ok === true, probe.ok ? 'OK' : 'ERROR', 'Execution/focus HTML marker probe', probe);

  try {
    var probeT = { taskId: 'TC_SAFE', title: 'Safe probe', status: 'OPEN', priority: 'NORMAL', slaState: '', assignedTo: 'u@test', nextAction: '', sourceModule: 'HOME_ALERT' };
    var stackH = CbvExecFlow_buildActionStackHtml_(probeT);
    var rb = CbvExecFlow_renderTaskExecutionBodyHtml_({ taskId: '' });
    var joined = String(stackH || '') + String((rb && rb.html) || '');
    var banned = ['Hoàn tất', 'Nhận việc', 'Claim task', 'claim task', 'auto-assign', 'auto assign', 'auto resolve', 'auto escalate'];
    var lower = joined.toLowerCase();
    var hit = banned.filter(function (b) { return lower.indexOf(b.toLowerCase()) >= 0; });
    addCheck('ACTION_STACK_SAFETY', hit.length === 0, hit.length === 0 ? 'OK' : 'ERROR', 'No complete/claim/auto-mutation CTA copy in stack + cockpit', { hit: hit, len: joined.length });
  } catch (eS) {
    addCheck('ACTION_STACK_SAFETY', false, 'ERROR', String(eS), {});
  }

  try {
    var em = CbvExecFlow_getTaskExecutionModel_('');
    var cg = CbvExecFlow_buildCognitionGuideHtml_(em);
    var cgOk = cg.indexOf('cbv-exec-cognition-guide') >= 0 && cg.indexOf('cbv-exec-why-urgent') >= 0 && cg.indexOf('cbv-exec-now-do') >= 0 &&
      cg.indexOf('cbv-exec-if-blocked') >= 0 && cg.indexOf('cbv-exec-safety-note') >= 0;
    addCheck('COGNITION_GUIDE_MARKERS', cgOk, cgOk ? 'OK' : 'ERROR', 'Cognition guide markers', { len: cg.length });
  } catch (eC) {
    addCheck('COGNITION_GUIDE_MARKERS', false, 'ERROR', String(eC), {});
  }

  try {
    var fp = CbvExecFlow_renderFocusPage_({});
    var fh = String((fp && fp.bodyHtml) || '');
    var focusOk = fh.indexOf('cbv-exec-focus-mode') >= 0 && (fh.indexOf('cbv-exec-focus-empty') >= 0 || fh.indexOf('cbv-exec-focus-task') >= 0);
    addCheck('FOCUS_RENDER_SMOKE', focusOk, focusOk ? 'OK' : 'WARNING', 'CbvExecFlow_renderFocusPage_ smoke', { len: fh.length });
  } catch (eF) {
    addCheck('FOCUS_RENDER_SMOKE', false, 'WARNING', String(eF), {});
  }

  try {
    var pri = (typeof CbvWebAppVi_buildPrimaryNavHtml_ === 'function') ? CbvWebAppVi_buildPrimaryNavHtml_('/workspace/focus') : '';
    var focSig = CbvTcsMilestone04__htmlSignalsRoute_(pri, '/workspace/focus');
    var hasPri = pri.indexOf('cbv-primary-nav') >= 0 && focSig.ok;
    addCheck('NAV_PRIMARY_FOCUS', hasPri, hasPri ? 'OK' : 'ERROR', 'Primary nav exposes /workspace/focus', { mode: focSig.mode });
  } catch (eNav) {
    addCheck('NAV_PRIMARY_FOCUS', false, 'ERROR', String(eNav), {});
  }

  addCheck('DRIVE_BUNDLE_FN', typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function', 'OK', 'CbvTcsDriveReport_exportMilestoneFullTestBundle', {});

  var vu = null;
  try {
    vu = (typeof CbvWebAppVi_validate === 'function') ? CbvWebAppVi_validate() : null;
    var viDetail = CbvTcsMilestone04__viValidateDetail_(vu);
    addCheck('VI_VALIDATE', vu && vu.ok === true, vu && vu.ok ? 'OK' : 'ERROR', 'CbvWebAppVi_validate', viDetail);
    if (vu && vu.warnings) vu.warnings.forEach(function (w) { externalWarnings.push('VI_VALIDATE: ' + w); });
  } catch (eV) {
    addCheck('VI_VALIDATE', false, 'WARNING', String(eV), { viOk: false, exception: String(eV) });
  }

  try {
    var tFocus = (typeof CbvWebAppVi_getRouteLabel === 'function') ? CbvWebAppVi_getRouteLabel('/workspace/focus') : '';
    var tFocusA = (typeof CbvWebAppVi_getRouteLabel === 'function') ? CbvWebAppVi_getRouteLabel('/focus') : '';
    var titlesFocus = String(tFocus || '').trim().length > 0 && String(tFocusA || '').trim().length > 0;
    addCheck('VI_ROUTE_TITLE_FOCUS', titlesFocus, titlesFocus ? 'OK' : 'ERROR', 'VI titles for focus routes', { tFocus: tFocus, tFocusA: tFocusA });
    var navFocus = (typeof CbvWebAppVi_getLabel === 'function') ? CbvWebAppVi_getLabel('nav_focus') : '';
    addCheck('VI_NAV_LABEL_FOCUS', String(navFocus || '').trim().length > 0, String(navFocus || '').trim().length > 0 ? 'OK' : 'ERROR', 'nav_focus label', { nav_focus: navFocus });
  } catch (eT) {
    addCheck('VI_ROUTE_TITLE_FOCUS', false, 'ERROR', String(eT), {});
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
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['M01_FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P before 998V.' };

  var reportText = [
    '=== MILESTONE_04 — OPERATION EXECUTION FLOW TEST ===',
    'traceId=' + traceId,
    'runStatus=' + runFin.status,
    'runOk=' + String(runFin.ok),
    'failedChecks=' + JSON.stringify((checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) { return c.code; }))
  ].join('\n');

  var draft = {
    ok: runFin.ok,
    phase: 'MILESTONE_04_OPERATION_EXECUTION_FLOW',
    status: runFin.status,
    checkedAt: now,
    runBy: runBy,
    traceId: traceId,
    testSuite: 'MILESTONE_04_OPERATION_EXECUTION_FLOW',
    summary: 'Milestone 04 operation execution test (pre-envelope): ' + runFin.status + ' (' + runFin.severity + ')',
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep,
    severity: runFin.severity,
    reportText: reportText,
    reportJson: { driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '', milestone04: true },
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
      mode: 'CBV_TCS_V1_MILESTONE04'
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
  draft.summary = 'Milestone 04 operation execution test: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nfinalOk=' + String(fin.ok) + '\nenvelopeOk=' + String(draft.envelopeOk);

  var bundleEx = null;
  try {
    if (typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function' && typeof CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_ === 'function') {
      var exportDraft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, true, {
        preWrite: true,
        expectedMinFiles: 6,
        note: 'Milestone 04 Drive bundle'
      });
      exportDraft.reportJson.finalStatus = exportDraft.status;
      exportDraft.reportJson.ok = exportDraft.ok;
      exportDraft.reportJson.severity = exportDraft.severity;
      exportDraft.reportJson.envelopeOk = exportDraft.envelopeOk;

      var handoffMd = CbvTcsMilestone04__buildAiHandoffMd_(exportDraft, traceId);
      bundleEx = CbvTcsDriveReport_exportMilestoneFullTestBundle(exportDraft, {
        tagStem: 'MILESTONE_04_OPERATION_EXECUTION_FLOW',
        aiHandoffMarkdown: handoffMd,
        evidenceHtml: CbvTcsMilestone04__buildEvidenceHtml_(exportDraft.checks)
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

  CbvTcsMilestone04ExecFlow_TestConsole__storeLatest_(draft);
  try { Logger.log(draft.reportText); } catch (eL) { /* ignore */ }
  return draft;
}

function CbvTcsMilestone04ExecFlow_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvTcsMilestone04ExecFlow_TestConsole__getLatest_();
  if (!r) {
    ui.alert('No report', 'Run Milestone 04 Operation Execution Flow Test first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Milestone 04 — copy report');
  return { ok: true };
}
