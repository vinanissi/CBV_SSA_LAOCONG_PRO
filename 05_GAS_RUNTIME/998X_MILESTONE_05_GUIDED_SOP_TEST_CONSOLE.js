/**
 * MILESTONE_05 — Guided SOP Runtime — Full test (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Run Milestone 05 Guided SOP Runtime Test
 *
 * Depends: 998W, 998L, 998P, 998U, 998F, 998H, 998Q (optional task adapters).
 */

var __CBV_TCS_MILESTONE05_TC_LAST_REPORT = null;
var __CBV_TCS_MILESTONE05_TC_LAST_PROP_KEY = 'CBV_TCS_MILESTONE05_TC_LAST_REPORT_JSON';

function CbvTcsMilestone05GuidedSop_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_MILESTONE05_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_MILESTONE05_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsMilestone05__buildEvidenceHtml_(checks) {
  var failed = (checks || []).filter(function (c) { return c && c.ok === false; });
  var rows = failed.map(function (c) {
    return '<tr><td>' + String(c.code || '').replace(/</g, '&lt;') + '</td><td>' + String(c.severity || '').replace(/</g, '&lt;') + '</td><td>' + String(c.message || '').replace(/</g, '&lt;') + '</td></tr>';
  }).join('');
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>MILESTONE_05 Evidence</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>' +
    '<h1>MILESTONE_05 — Failed checks</h1>' +
    (failed.length ? ('<table><thead><tr><th>code</th><th>severity</th><th>message</th></tr></thead><tbody>' + rows + '</tbody></table>') : '<p>No failed checks.</p>') +
    '</body></html>';
}

function CbvTcsMilestone05__buildAiHandoffMd_(draft, traceId) {
  return [
    '# AI Handoff — Milestone 05 (Guided SOP Runtime)',
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

function CbvTcsMilestone05__unsafeHitsInHtml_(html, banned) {
  var lower = String(html || '').toLowerCase();
  var hits = [];
  for (var bi = 0; bi < banned.length; bi++) {
    var tok = String(banned[bi] || '');
    if (tok && lower.indexOf(tok.toLowerCase()) >= 0) hits.push(tok);
  }
  return hits;
}

function CbvTcsMilestone05__snippetAroundHit_(html, needle) {
  var h = String(html || '');
  var n = String(needle || '');
  if (!n) return '';
  var idx = h.toLowerCase().indexOf(n.toLowerCase());
  if (idx < 0) return '';
  var s = Math.max(0, idx - 80);
  return h.substring(s, Math.min(h.length, s + 300)).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function CbvTcsMilestone05__viValidateDetail_(vu) {
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
 * One-click Milestone 05 guided SOP verification + Drive 6-file bundle.
 */
function CbvTcsMilestone05GuidedSop_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSM05_')
    : ('WSM05_' + new Date().getTime());

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

  addCheck('PAGE_TYPE_GUIDED_SOP', typeof CBV_WEBAPP_WS_PAGE_TYPES !== 'undefined' && !!CBV_WEBAPP_WS_PAGE_TYPES.GUIDED_SOP_RUNTIME, 'OK', 'GUIDED_SOP_RUNTIME page type', {});

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_WS_SOP', paths.indexOf('/workspace/sop') >= 0, paths.indexOf('/workspace/sop') >= 0 ? 'OK' : 'ERROR', '/workspace/sop', {});
    addCheck('ROUTE_SOP_ALIAS', paths.indexOf('/sop') >= 0, paths.indexOf('/sop') >= 0 ? 'OK' : 'ERROR', '/sop', {});
    addCheck('ROUTE_WS_FOCUS', paths.indexOf('/workspace/focus') >= 0, paths.indexOf('/workspace/focus') >= 0 ? 'OK' : 'ERROR', '/workspace/focus (M04 regression)', {});
    addCheck('ROUTE_WS_EXEC_TASK', paths.indexOf('/workspace/execution/task') >= 0, paths.indexOf('/workspace/execution/task') >= 0 ? 'OK' : 'ERROR', '/workspace/execution/task (M04 regression)', {});
    addCheck('ROUTE_WS_DAILY', paths.indexOf('/workspace/daily') >= 0, paths.indexOf('/workspace/daily') >= 0 ? 'OK' : 'ERROR', '/workspace/daily (M03 regression)', {});
    addCheck('ROUTE_WS_STAFF_TASKS', paths.indexOf('/workspace/staff/tasks') >= 0, paths.indexOf('/workspace/staff/tasks') >= 0 ? 'OK' : 'ERROR', '/workspace/staff/tasks (M02 regression)', {});
    addCheck('ROUTE_M01_TODAY', paths.indexOf('/workspace/today') >= 0, paths.indexOf('/workspace/today') >= 0 ? 'OK' : 'ERROR', '/workspace/today (M01 regression)', {});
  } catch (eR) {
    addCheck('ROUTE_WS_SOP', false, 'ERROR', String(eR), {});
  }

  addCheck('FN_CbvGuidedSop_getTemplateRegistry_', typeof CbvGuidedSop_getTemplateRegistry_ === 'function', 'OK', 'CbvGuidedSop_getTemplateRegistry_', {});
  addCheck('FN_CbvGuidedSop_getTemplateForTask_', typeof CbvGuidedSop_getTemplateForTask_ === 'function', 'OK', 'CbvGuidedSop_getTemplateForTask_', {});
  addCheck('FN_CbvGuidedSop_validateTemplate_', typeof CbvGuidedSop_validateTemplate_ === 'function', 'OK', 'CbvGuidedSop_validateTemplate_', {});
  addCheck('FN_CbvGuidedSop_buildStepFlowModel_', typeof CbvGuidedSop_buildStepFlowModel_ === 'function', 'OK', 'CbvGuidedSop_buildStepFlowModel_', {});
  addCheck('FN_CbvGuidedSop_getCurrentStep_', typeof CbvGuidedSop_getCurrentStep_ === 'function', 'OK', 'CbvGuidedSop_getCurrentStep_', {});
  addCheck('FN_CbvGuidedSop_getNextStep_', typeof CbvGuidedSop_getNextStep_ === 'function', 'OK', 'CbvGuidedSop_getNextStep_', {});
  addCheck('FN_CbvGuidedSop_detectBlockedStep_', typeof CbvGuidedSop_detectBlockedStep_ === 'function', 'OK', 'CbvGuidedSop_detectBlockedStep_', {});
  addCheck('FN_CbvGuidedSop_buildStepperHtml_', typeof CbvGuidedSop_buildStepperHtml_ === 'function', 'OK', 'CbvGuidedSop_buildStepperHtml_', {});
  addCheck('FN_CbvGuidedSop_getStepCta_', typeof CbvGuidedSop_getStepCta_ === 'function', 'OK', 'CbvGuidedSop_getStepCta_', {});
  addCheck('FN_CbvGuidedSop_validateStepReadiness_', typeof CbvGuidedSop_validateStepReadiness_ === 'function', 'OK', 'CbvGuidedSop_validateStepReadiness_', {});
  addCheck('FN_CbvGuidedSop_getStepState_', typeof CbvGuidedSop_getStepState_ === 'function', 'OK', 'CbvGuidedSop_getStepState_', {});
  addCheck('FN_CbvGuidedSop_getStepWarnings_', typeof CbvGuidedSop_getStepWarnings_ === 'function', 'OK', 'CbvGuidedSop_getStepWarnings_', {});
  addCheck('FN_CbvGuidedSop_buildStepWarningHtml_', typeof CbvGuidedSop_buildStepWarningHtml_ === 'function', 'OK', 'CbvGuidedSop_buildStepWarningHtml_', {});

  try {
    var reg0 = CbvGuidedSop_getTemplateRegistry_();
    addCheck('REGISTRY_COUNT', (reg0 || []).length >= 3, (reg0 || []).length >= 3 ? 'OK' : 'ERROR', '>= 3 templates', { count: (reg0 || []).length });
    var ids = (reg0 || []).map(function (t) { return t.templateId; });
    addCheck('TEMPLATE_DEFAULT', ids.indexOf('DEFAULT_TASK_SOP') >= 0, 'OK', 'DEFAULT_TASK_SOP', {});
    addCheck('TEMPLATE_SLA', ids.indexOf('SLA_BREACH_SOP') >= 0, 'OK', 'SLA_BREACH_SOP', {});
    addCheck('TEMPLATE_MISSING', ids.indexOf('MISSING_DATA_SOP') >= 0, 'OK', 'MISSING_DATA_SOP', {});
    var stepOk = true;
    var bad = [];
    for (var ti = 0; ti < (reg0 || []).length; ti++) {
      var vt = CbvGuidedSop_validateTemplate_(reg0[ti]);
      if (!vt.ok) {
        stepOk = false;
        bad = bad.concat(vt.errors || []);
      }
      var stp = reg0[ti].steps || [];
      if (!stp.length) {
        stepOk = false;
        bad.push('no steps: ' + reg0[ti].templateId);
      }
      for (var si = 0; si < stp.length; si++) {
        var s = stp[si] || {};
        if (!s.stepId || typeof s.order !== 'number' || !s.title || !s.instruction || !s.ctaLabel || !s.ctaRoute || s.manualOnly !== true) {
          stepOk = false;
          bad.push('bad step fields ' + reg0[ti].templateId + '/' + (s.stepId || si));
        }
      }
    }
    addCheck('TEMPLATE_STEP_CONTRACT', stepOk, stepOk ? 'OK' : 'ERROR', 'Templates + steps contract', { bad: bad });
  } catch (eT0) {
    addCheck('REGISTRY_COUNT', false, 'ERROR', String(eT0), {});
  }

  try {
    var tNormal = { taskId: 'M05_N', title: 'Ok title', status: 'OPEN', priority: 'NORMAL', slaState: 'OK', assignedTo: 'u@test', sourceModule: 'HOME_ALERT' };
    var curN = CbvGuidedSop_getCurrentStep_(tNormal, CbvGuidedSop_getTemplateForTask_(tNormal));
    addCheck('ENGINE_NORMAL_CURRENT', !!(curN && curN.stepId), !!(curN && curN.stepId) ? 'OK' : 'ERROR', 'normal task current step', { stepId: curN && curN.stepId });

    var tSla = { taskId: 'M05_S', title: 'SLA', status: 'OPEN', priority: 'HIGH', slaState: 'SLA_BREACH', assignedTo: 'u@test', sourceModule: 'HOME_ALERT' };
    var tplS = CbvGuidedSop_getTemplateForTask_(tSla);
    addCheck('ENGINE_SLA_TEMPLATE', tplS && tplS.templateId === 'SLA_BREACH_SOP', tplS && tplS.templateId === 'SLA_BREACH_SOP' ? 'OK' : 'ERROR', 'SLA task picks SLA template', { id: tplS && tplS.templateId });
    var curS = CbvGuidedSop_getCurrentStep_(tSla, tplS);
    addCheck('ENGINE_SLA_STEP', curS && (curS.stepId === 'HANDLE_SLA' || String(curS.title || '').indexOf('SLA') >= 0), 'OK', 'SLA-related current step', { stepId: curS && curS.stepId });

    var tMiss = { taskId: '', title: '(Không tiêu đề)', status: 'OPEN', priority: 'NORMAL', slaState: '', assignedTo: 'u@test', sourceModule: 'X' };
    var tplM = CbvGuidedSop_getTemplateForTask_(tMiss);
    addCheck('ENGINE_MISSING_TEMPLATE', tplM && tplM.templateId === 'MISSING_DATA_SOP', tplM && tplM.templateId === 'MISSING_DATA_SOP' ? 'OK' : 'ERROR', 'missing data template', { id: tplM && tplM.templateId });
    var curM = CbvGuidedSop_getCurrentStep_(tMiss, tplM);
    addCheck('ENGINE_MISSING_STEP', curM && curM.stepId === 'SUPPLY_DATA', curM && curM.stepId === 'SUPPLY_DATA' ? 'OK' : 'ERROR', 'missing-data current step', { stepId: curM && curM.stepId });

    var tBlk = { taskId: 'M05_B', title: 'Blocked', status: 'BLOCKED', priority: 'NORMAL', slaState: '', assignedTo: 'u@test', sourceModule: 'HOME_ALERT' };
    var tplB = CbvGuidedSop_getTemplateForTask_(tBlk);
    var curB = CbvGuidedSop_getCurrentStep_(tBlk, tplB);
    var blkHit = curB && (curB.stepId === 'REPORT_STUCK' || (curB.blockerHints || []).indexOf('BLOCKED_STATUS') >= 0);
    addCheck('ENGINE_BLOCKED_STEP', !!blkHit, blkHit ? 'OK' : 'ERROR', 'blocked task maps to báo kẹt step', { stepId: curB && curB.stepId });
  } catch (eEng) {
    addCheck('ENGINE_NORMAL_CURRENT', false, 'ERROR', String(eEng), {});
  }

  var markers = ['cbv-sop-stepper', 'cbv-sop-current-step', 'cbv-sop-next-step', 'cbv-sop-step-card', 'cbv-sop-step-state', 'cbv-sop-step-cta', 'cbv-sop-manual-only', 'cbv-sop-warning', 'cbv-sop-template-id'];
  try {
    var fm0 = CbvGuidedSop_buildStepFlowModel_({ taskId: 'X', title: 'Y', status: 'OPEN', priority: 'N', slaState: '', assignedTo: 'a', sourceModule: 'Z' });
    var html0 = CbvGuidedSop_buildStepperHtml_(fm0);
    var missM = markers.filter(function (mk) { return html0.indexOf(mk) < 0; });
    addCheck('UI_MARKERS_STEPPER', missM.length === 0, missM.length === 0 ? 'OK' : 'ERROR', 'Stepper markers', { missing: missM });
  } catch (eUi) {
    addCheck('UI_MARKERS_STEPPER', false, 'ERROR', String(eUi), {});
  }

  try {
    var banned = ['Hoàn tất', 'Complete', 'Claim', 'Resolve', 'Auto advance', 'Auto complete', 'auto-resolve', 'auto assign'];
    var fm1 = CbvGuidedSop_buildStepFlowModel_({ taskId: 'Z', title: 'T', status: 'OPEN', priority: 'N', slaState: '', assignedTo: 'a', sourceModule: 'Z' });
    var hStep = CbvGuidedSop_buildStepperHtml_(fm1);
    var hits = CbvTcsMilestone05__unsafeHitsInHtml_(hStep, banned);
    addCheck('CTA_SAFETY_COPY', hits.length === 0, hits.length === 0 ? 'OK' : 'ERROR', 'No forbidden CTA copy in stepper', { hits: hits, snippet: hits.length ? CbvTcsMilestone05__snippetAroundHit_(hStep, hits[0]) : '' });
  } catch (eSafe) {
    addCheck('CTA_SAFETY_COPY', false, 'ERROR', String(eSafe), {});
  }

  try {
    var tWarn = { taskId: 'W', title: '', status: 'OPEN', priority: 'N', slaState: '', assignedTo: '', sourceModule: 'Z' };
    var st = (CbvGuidedSop_getTemplateForTask_(tWarn).steps || [])[0] || {};
    var wr = CbvGuidedSop_getStepWarnings_(tWarn, st);
    var wh = CbvGuidedSop_buildStepWarningHtml_(wr);
    addCheck('VALIDATION_WARNING_HTML', wh.indexOf('cbv-sop-not-hard-block') >= 0 && wh.indexOf('cbv-sop-read-first') >= 0, 'OK', 'Warning-only markers', {});
  } catch (eW) {
    addCheck('VALIDATION_WARNING_HTML', false, 'WARNING', String(eW), {});
  }

  try {
    var rb = CbvExecFlow_renderTaskExecutionBodyHtml_({ taskId: '' });
    var cockpitHtml = String((rb && rb.html) || '');
    addCheck('M05_IN_COCKPIT', cockpitHtml.indexOf('cbv-sop-stepper') >= 0, cockpitHtml.indexOf('cbv-sop-stepper') >= 0 ? 'OK' : 'ERROR', 'Execution cockpit embeds M05 stepper', {});
    addCheck('M04_MARKERS_COCKPIT', cockpitHtml.indexOf('cbv-exec-inline-sop') >= 0 && cockpitHtml.indexOf('cbv-exec-cognition-guide') >= 0, 'OK', 'M04 cockpit markers preserved', {});

    var fp = CbvExecFlow_renderFocusPage_({});
    var fh = String((fp && fp.bodyHtml) || '');
    var hasFocusTask = fh.indexOf('cbv-exec-focus-task') >= 0;
    var focusOk = !hasFocusTask || fh.indexOf('cbv-sop-stepper') >= 0;
    addCheck('M05_IN_FOCUS', focusOk, focusOk ? 'OK' : 'ERROR', 'Focus cockpit includes M05 stepper when a focus task is shown', { hasFocusTask: hasFocusTask, hasStepper: fh.indexOf('cbv-sop-stepper') >= 0 });
    addCheck('M04_MARKERS_FOCUS', fh.indexOf('cbv-exec-focus-mode') >= 0, fh.indexOf('cbv-exec-focus-mode') >= 0 ? 'OK' : 'ERROR', 'M04 focus markers', {});
  } catch (eInt) {
    addCheck('M05_IN_COCKPIT', false, 'ERROR', String(eInt), {});
  }

  try {
    var banned2 = ['Hoàn tất', 'Nhận việc', 'Claim task', 'claim task', 'auto-assign', 'auto assign', 'auto resolve', 'auto escalate'];
    var probeT = { taskId: 'TC_SAFE', title: 'Safe probe', status: 'OPEN', priority: 'NORMAL', slaState: '', assignedTo: 'u@test', nextAction: '', sourceModule: 'HOME_ALERT' };
    var stackH = CbvExecFlow_buildActionStackHtml_(probeT);
    var rb2 = CbvExecFlow_renderTaskExecutionBodyHtml_({ taskId: '' });
    var cockpit2 = String((rb2 && rb2.html) || '');
    var fp2 = CbvExecFlow_renderFocusPage_({});
    var focus2 = String((fp2 && fp2.bodyHtml) || '');
    var union = {};
    [stackH, cockpit2, focus2].forEach(function (zone) {
      CbvTcsMilestone05__unsafeHitsInHtml_(zone, banned2).forEach(function (h) { union[h] = true; });
    });
    var unsafeHits = Object.keys(union);
    addCheck('ACTION_STACK_SAFETY_M05', unsafeHits.length === 0, unsafeHits.length === 0 ? 'OK' : 'ERROR', 'No unsafe mutation CTA copy (M04 rule extended)', { unsafeHits: unsafeHits });
  } catch (eS2) {
    addCheck('ACTION_STACK_SAFETY_M05', false, 'ERROR', String(eS2), {});
  }

  addCheck('FN_RENDER_GUIDED_PAGE', typeof CbvGuidedSop_renderGuidedSopPage_ === 'function', 'OK', 'CbvGuidedSop_renderGuidedSopPage_', {});

  var vu = null;
  try {
    vu = (typeof CbvWebAppVi_validate === 'function') ? CbvWebAppVi_validate() : null;
    var viDetail = CbvTcsMilestone05__viValidateDetail_(vu);
    addCheck('VI_VALIDATE', vu && vu.ok === true, vu && vu.ok ? 'OK' : 'ERROR', 'CbvWebAppVi_validate', viDetail);
    if (vu && vu.warnings) vu.warnings.forEach(function (w) { externalWarnings.push('VI_VALIDATE: ' + w); });
  } catch (eV) {
    addCheck('VI_VALIDATE', false, 'WARNING', String(eV), {});
  }

  try {
    var tSop = (typeof CbvWebAppVi_getRouteLabel === 'function') ? CbvWebAppVi_getRouteLabel('/workspace/sop') : '';
    var tSopA = (typeof CbvWebAppVi_getRouteLabel === 'function') ? CbvWebAppVi_getRouteLabel('/sop') : '';
    addCheck('VI_ROUTE_TITLE_SOP', String(tSop || '').trim().length > 0 && String(tSopA || '').trim().length > 0, 'OK', 'VI titles for /workspace/sop and /sop', { tSop: tSop, tSopA: tSopA });
    var navSop = (typeof CbvWebAppVi_getLabel === 'function') ? CbvWebAppVi_getLabel('nav_sop') : '';
    addCheck('VI_NAV_LABEL_SOP', String(navSop || '').trim().length > 0, 'OK', 'nav_sop label', { nav_sop: navSop });
  } catch (eVt) {
    addCheck('VI_ROUTE_TITLE_SOP', false, 'ERROR', String(eVt), {});
  }

  var vr = null;
  try {
    vr = (typeof CbvWebAppRouteUrl_validate === 'function') ? CbvWebAppRouteUrl_validate() : null;
    addCheck('ROUTE_URL_VALIDATE', vr && vr.ok === true, vr && vr.ok ? 'OK' : 'ERROR', 'CbvWebAppRouteUrl_validate', {});
    if (vr && vr.warnings) vr.warnings.forEach(function (w) { externalWarnings.push('ROUTE_URL_VALIDATE: ' + w); });
  } catch (eH) {
    addCheck('ROUTE_URL_VALIDATE', false, 'WARNING', String(eH), {});
  }

  addCheck('DRIVE_BUNDLE_FN', typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function', 'OK', 'CbvTcsDriveReport_exportMilestoneFullTestBundle', {});

  var now = (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date();
  var runBy = (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : '');

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['M01_FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P before 998X.' };

  var reportText = [
    '=== MILESTONE_05 — GUIDED SOP RUNTIME TEST ===',
    'traceId=' + traceId,
    'runStatus=' + runFin.status,
    'runOk=' + String(runFin.ok),
    'failedChecks=' + JSON.stringify((checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) { return c.code; }))
  ].join('\n');

  var draft = {
    ok: runFin.ok,
    phase: 'MILESTONE_05_GUIDED_SOP_RUNTIME',
    status: runFin.status,
    checkedAt: now,
    runBy: runBy,
    traceId: traceId,
    testSuite: 'MILESTONE_05_GUIDED_SOP_RUNTIME',
    summary: 'Milestone 05 guided SOP test (pre-envelope): ' + runFin.status + ' (' + runFin.severity + ')',
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep,
    severity: runFin.severity,
    reportText: reportText,
    reportJson: { driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '', milestone05: true },
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
    detail: { keysOk: keysOk, itemContractOk: ic.ok, reportTextLen: String(reportText || '').length, runStatus: runFin.status, mode: 'CBV_TCS_V1_MILESTONE05' }
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
  draft.summary = 'Milestone 05 guided SOP test: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nfinalOk=' + String(fin.ok) + '\nenvelopeOk=' + String(draft.envelopeOk);

  var bundleEx = null;
  try {
    if (typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function' && typeof CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_ === 'function') {
      var exportDraft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, true, {
        preWrite: true,
        expectedMinFiles: 6,
        note: 'Milestone 05 Drive bundle'
      });
      exportDraft.reportJson.finalStatus = exportDraft.status;
      exportDraft.reportJson.ok = exportDraft.ok;
      exportDraft.reportJson.severity = exportDraft.severity;
      exportDraft.reportJson.envelopeOk = exportDraft.envelopeOk;

      var handoffMd = CbvTcsMilestone05__buildAiHandoffMd_(exportDraft, traceId);
      bundleEx = CbvTcsDriveReport_exportMilestoneFullTestBundle(exportDraft, {
        tagStem: 'MILESTONE_05_GUIDED_SOP_RUNTIME',
        aiHandoffMarkdown: handoffMd,
        evidenceHtml: CbvTcsMilestone05__buildEvidenceHtml_(exportDraft.checks)
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

  CbvTcsMilestone05GuidedSop_TestConsole__storeLatest_(draft);
  try { Logger.log(draft.reportText); } catch (eL) { /* ignore */ }
  return draft;
}

function CbvTcsMilestone05GuidedSop_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = null;
  try {
    if (__CBV_TCS_MILESTONE05_TC_LAST_REPORT) r = __CBV_TCS_MILESTONE05_TC_LAST_REPORT;
    else if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_MILESTONE05_TC_LAST_PROP_KEY);
      if (raw) r = JSON.parse(raw);
    }
  } catch (e) {
    r = null;
  }
  if (!r) {
    ui.alert('No report', 'Run Milestone 05 Guided SOP Runtime Test first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Milestone 05 — copy report');
  return { ok: true };
}
