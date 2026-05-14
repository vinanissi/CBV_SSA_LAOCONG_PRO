/**
 * MILESTONE_01 — Internal operational workspace — Full test (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Run Milestone 01 Full Operational Workspace Test
 *
 * Phase 107 — status/envelope cannot contradict (no GO with envelopeOk=false / ERROR checks).
 */

var __CBV_TCS_MILESTONE01_TC_LAST_REPORT = null;
var __CBV_TCS_MILESTONE01_TC_LAST_PROP_KEY = 'CBV_TCS_MILESTONE01_TC_LAST_REPORT_JSON';

function CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function (k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

/** Structural: all keys present, check rows shaped, non-empty reportText. */
function CbvTcsMilestone01OpWorkspace__structuralEnvelopeOk_(rep) {
  var base = CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_(rep);
  if (!base.ok) return { ok: false, reasons: ['missing:' + (base.missing || []).join(',')] };
  var ic = CbvTcsMilestone01OpWorkspace__validateAllCheckItems_(rep.checks || []);
  if (!ic.ok) return { ok: false, reasons: ['check_contract:' + (ic.bad || []).join('|')] };
  if (!String(rep.reportText || '').trim()) return { ok: false, reasons: ['reportText_empty'] };
  return { ok: true, reasons: [] };
}

function CbvTcsMilestone01OpWorkspace__validateCheckItem_(c, idx) {
  var missing = [];
  if (!c || typeof c !== 'object') return { ok: false, missing: ['object'] };
  if (typeof c.code !== 'string' || !String(c.code).trim()) missing.push('code');
  if (typeof c.ok !== 'boolean') missing.push('ok');
  if (typeof c.severity !== 'string' || !String(c.severity).trim()) missing.push('severity');
  if (typeof c.message !== 'string') missing.push('message');
  if (c.detail === undefined) missing.push('detail');
  return { ok: missing.length === 0, missing: missing };
}

function CbvTcsMilestone01OpWorkspace__validateAllCheckItems_(checks) {
  var bad = [];
  (checks || []).forEach(function (c, i) {
    var v = CbvTcsMilestone01OpWorkspace__validateCheckItem_(c, i);
    if (!v.ok) bad.push('i' + i + ':' + v.missing.join(','));
  });
  return { ok: bad.length === 0, bad: bad };
}

/**
 * From checks + external warnings only (no envelopeOk field semantics).
 */
function CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings) {
  var ext = externalWarnings || [];
  var crit = (checks || []).filter(function (c) {
    return c && c.ok === false && String(c.severity || '').toUpperCase() === 'CRITICAL';
  });
  if (crit.length) {
    return {
      ok: false,
      status: 'FAIL',
      severity: 'CRITICAL',
      errors: crit.map(function (c) { return 'CRITICAL:' + (c.code || '?'); }),
      warnings: [],
      nextStep: 'Fix CRITICAL checks: ' + crit.map(function (c) { return c.code; }).join(', ') + '.'
    };
  }
  var err = (checks || []).filter(function (c) {
    return c && c.ok === false && String(c.severity || '').toUpperCase() === 'ERROR';
  });
  if (err.length) {
    return {
      ok: false,
      status: 'FAIL',
      severity: 'ERROR',
      errors: err.map(function (c) { return 'ERROR:' + (c.code || '?') + ' — ' + (c.message || ''); }),
      warnings: [],
      nextStep: 'Fix ERROR checks: ' + err.map(function (c) { return c.code; }).join(', ') + '.'
    };
  }
  var warnMsgs = ext.slice();
  (checks || []).forEach(function (c) {
    if (c && c.ok === false && String(c.severity || '').toUpperCase() === 'WARNING') {
      warnMsgs.push('CHECK_WARN:' + (c.code || '?') + ' — ' + (c.message || ''));
    }
  });
  if (warnMsgs.length) {
    return {
      ok: true,
      status: 'GO_WITH_WARNINGS',
      severity: 'WARNING',
      errors: [],
      warnings: warnMsgs,
      nextStep: 'Review warnings; rerun after mitigation if needed.'
    };
  }
  return {
    ok: true,
    status: 'GO',
    severity: 'OK',
    errors: [],
    warnings: [],
    nextStep: 'Milestone 01 test clean; keep Drive evidence append-only.'
  };
}

function CbvTcsMilestone01OpWorkspace__selfTestAggregator_() {
  var cases = [];
  var f1 = CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(
    [{ code: 'A', ok: true, severity: 'OK', message: '', detail: {} }],
    []
  );
  cases.push({ id: 'run_status_all_ok', pass: f1.ok === true && f1.status === 'GO' });

  var f2 = CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(
    [{ code: 'B', ok: false, severity: 'ERROR', message: 'x', detail: {} }],
    []
  );
  cases.push({ id: 'err_check', pass: f2.ok === false && f2.status === 'FAIL' });

  var f3 = CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(
    [{ code: 'C', ok: false, severity: 'WARNING', message: 'w', detail: {} }],
    []
  );
  cases.push({ id: 'warn_only', pass: f3.ok === true && f3.status === 'GO_WITH_WARNINGS' });

  var f4 = CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(
    [{ code: 'D', ok: true, severity: 'OK', message: '', detail: {} }],
    []
  );
  cases.push({ id: 'all_ok', pass: f4.ok === true && f4.status === 'GO' });

  var comb = CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_({
    checks: [{ code: 'E', ok: true, severity: 'OK', message: '', detail: {} }],
    envelopeOk: false,
    externalWarnings: [],
    errors: [],
    warnings: []
  });
  cases.push({ id: 'envelope_false', pass: comb.ok === false && comb.status === 'FAIL' });

  return { ok: cases.every(function (x) { return x.pass; }), cases: cases };
}

/**
 * Final ok/status/severity including envelope contract (Phase 107).
 * Rule: envelopeOk === false => FAIL + ok=false + severity ERROR.
 */
function CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_(payload) {
  var checksArr = payload.checks || [];
  var envelopeOk = payload.envelopeOk === true;
  var extWarn = payload.externalWarnings || [];
  var errors = [].concat(payload.errors || []);
  var warnings = [].concat(payload.warnings || []);

  if (!envelopeOk) {
    if (errors.indexOf('ENVELOPE_CONTRACT_FAILED') < 0) errors.push('ENVELOPE_CONTRACT_FAILED');
    var runEnv = CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checksArr, extWarn);
    var mergedErr = errors.concat(runEnv.ok ? [] : (runEnv.errors || []));
    return {
      ok: false,
      status: 'FAIL',
      severity: 'ERROR',
      errors: mergedErr,
      warnings: warnings.concat(runEnv.warnings || []),
      nextStep: 'Fix envelope (structural fields, envelopeOk, check rows, reportText) and failing checks; rerun.'
    };
  }

  var run = CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checksArr, extWarn);
  if (!run.ok) {
    return {
      ok: false,
      status: run.status,
      severity: run.severity,
      errors: errors.concat(run.errors || []),
      warnings: warnings.concat(run.warnings || []),
      nextStep: run.nextStep
    };
  }
  return {
    ok: true,
    status: run.status,
    severity: run.severity,
    errors: errors,
    warnings: warnings.concat(run.warnings || []),
    nextStep: run.nextStep
  };
}

function CbvTcsMilestone01OpWorkspace_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_MILESTONE01_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_MILESTONE01_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsMilestone01OpWorkspace_TestConsole__getLatest_() {
  if (__CBV_TCS_MILESTONE01_TC_LAST_REPORT) return __CBV_TCS_MILESTONE01_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_MILESTONE01_TC_LAST_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_TCS_MILESTONE01_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

function CbvTcsMilestone01OpWorkspace__buildEvidenceHtml_(checks) {
  var failed = (checks || []).filter(function (c) { return c && c.ok === false; });
  var rows = failed.map(function (c) {
    return '<tr><td>' + String(c.code || '').replace(/</g, '&lt;') + '</td><td>' + String(c.severity || '').replace(/</g, '&lt;') + '</td><td>' + String(c.message || '').replace(/</g, '&lt;') + '</td></tr>';
  }).join('');
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>MILESTONE_01 Evidence</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>' +
    '<h1>Failed checks</h1>' +
    (failed.length ? ('<table><thead><tr><th>code</th><th>severity</th><th>message</th></tr></thead><tbody>' + rows + '</tbody></table>') : '<p>No failed checks.</p>') +
    '</body></html>';
}

function CbvTcsMilestone01OpWorkspace__cloneCheckRows_(checks) {
  return (checks || []).map(function (c) {
    return { code: c.code, ok: c.ok, severity: c.severity, message: c.message, detail: c.detail || {} };
  });
}

/**
 * Clone base draft + checks, append DRIVE_SIX_FILE_BUNDLE, re-sync REPORT_ENVELOPE + finalize (Phase 107).
 * Used so Drive bundle JSON matches final status before append-only write.
 */
function CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(baseDraft, checksSnapshot, externalWarnings, driveOk, driveDetail) {
  var c2 = CbvTcsMilestone01OpWorkspace__cloneCheckRows_(checksSnapshot);
  c2.push({
    code: 'DRIVE_SIX_FILE_BUNDLE',
    ok: driveOk === true,
    severity: driveOk ? 'OK' : (typeof DriveApp === 'undefined' ? 'WARNING' : 'ERROR'),
    message: 'Drive export >= 6 append-only files',
    detail: driveDetail || {}
  });
  var runRow = CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(c2, externalWarnings || []);
  var keysOk = CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_(baseDraft).ok;
  var ic = CbvTcsMilestone01OpWorkspace__validateAllCheckItems_(c2);
  var structCore = keysOk === true && ic.ok === true && String(baseDraft.reportText || '').trim().length > 0;
  var envelopeRowOk = structCore === true && runRow.status !== 'FAIL';
  var i;
  for (i = 0; i < c2.length; i++) {
    if (c2[i].code === 'REPORT_ENVELOPE') {
      c2[i].ok = envelopeRowOk === true;
      c2[i].severity = envelopeRowOk ? 'OK' : 'ERROR';
      c2[i].detail = {
        keysOk: keysOk,
        itemContractOk: ic.ok,
        reportTextLen: String(baseDraft.reportText || '').length,
        runStatus: runRow.status,
        bad: ic.bad || [],
        mode: 'CBV_TCS_V1_PHASE107_WITH_DRIVE'
      };
      break;
    }
  }
  var rj = {};
  var kk;
  if (baseDraft.reportJson && typeof baseDraft.reportJson === 'object') {
    for (kk in baseDraft.reportJson) {
      if (Object.prototype.hasOwnProperty.call(baseDraft.reportJson, kk)) rj[kk] = baseDraft.reportJson[kk];
    }
  }
  var out = {
    ok: baseDraft.ok,
    phase: baseDraft.phase,
    status: baseDraft.status,
    checkedAt: baseDraft.checkedAt,
    runBy: baseDraft.runBy,
    traceId: baseDraft.traceId,
    testSuite: baseDraft.testSuite,
    summary: baseDraft.summary,
    checks: c2,
    warnings: baseDraft.warnings || [],
    errors: baseDraft.errors || [],
    nextStep: baseDraft.nextStep,
    severity: baseDraft.severity,
    reportText: baseDraft.reportText,
    reportJson: rj,
    contractVersion: baseDraft.contractVersion,
    envelopeOk: false
  };
  out.envelopeOk = envelopeRowOk === true;
  var finx = CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_({
    checks: c2,
    envelopeOk: out.envelopeOk === true,
    externalWarnings: [],
    errors: runRow.errors || [],
    warnings: runRow.warnings || []
  });
  out.ok = finx.ok;
  out.status = finx.status;
  out.severity = finx.severity;
  out.errors = finx.errors || [];
  out.warnings = finx.warnings || [];
  out.nextStep = finx.nextStep;
  out.summary = 'Milestone 01 full workspace test: ' + finx.status + ' (' + finx.severity + ')';
  out.reportText = String(baseDraft.reportText || '') + '\ndriveBundleOk=' + String(driveOk) + '\nfinalStatus=' + out.status;
  return out;
}

function CbvTcsMilestone01OpWorkspace__buildAiHandoffMd_(draft, traceId) {
  return [
    '# AI Handoff — Milestone 01',
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

function CbvTcsMilestone01OpWorkspace_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSM01_')
    : ('WSM01_' + new Date().getTime());

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

  var selfT = CbvTcsMilestone01OpWorkspace__selfTestAggregator_();
  addCheck('AGGREGATOR_SELF_TEST', selfT.ok === true, selfT.ok ? 'OK' : 'ERROR', 'finalize + envelope rules harness', { cases: selfT.cases || [] });

  addCheck('PAGE_TYPES', typeof CBV_WEBAPP_WS_PAGE_TYPES !== 'undefined' && !!CBV_WEBAPP_WS_PAGE_TYPES.ROLE_HOME, 'OK', 'ROLE_HOME page type registered', {});
  addCheck('ROLE_RESOLVER', typeof CbvWebAppOpUx_resolveWorkspaceRole_ === 'function', 'OK', 'CbvWebAppOpUx_resolveWorkspaceRole_', {});
  addCheck('TODAY_AGG', typeof CbvWebAppOpUx_getTodayOpsModel_ === 'function', 'OK', 'CbvWebAppOpUx_getTodayOpsModel_', {});
  addCheck('GUIDED_STEPS', typeof CbvWebAppOpUx_getGuidedStepsForRole_ === 'function', 'OK', 'CbvWebAppOpUx_getGuidedStepsForRole_', {});
  addCheck('ACTION_BAR', typeof CbvWebAppOpUx_buildGlobalActionBarHtml_ === 'function', 'OK', 'Global action bar builder', {});
  addCheck('AUGMENT_SHELL', typeof CbvWebAppOpUx_augmentPageForShell_ === 'function', 'OK', 'Shell augment hook', {});
  addCheck('DRIVE_BUNDLE_FN', typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function', 'OK', 'CbvTcsDriveReport_exportMilestoneFullTestBundle', {});

  var probe = (typeof CbvWebAppOpUx_probeUiMarkersInProject_ === 'function') ? CbvWebAppOpUx_probeUiMarkersInProject_() : { components: false, shell: false, detail: {} };
  addCheck('UX_LOADING_MARKERS', probe.components === true, probe.components ? 'OK' : 'ERROR', 'COMPONENTS raw template markers', probe.detail || {});
  addCheck('UX_SHELL_MARKERS', probe.shell === true, probe.shell ? 'OK' : 'ERROR', 'SHELL raw template markers', probe.detail || {});

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_ROLE_HOME', paths.indexOf('/workspace/role-home') >= 0, paths.indexOf('/workspace/role-home') >= 0 ? 'OK' : 'ERROR', 'Route /workspace/role-home', {});
    addCheck('ROUTE_TODAY', paths.indexOf('/workspace/today') >= 0, paths.indexOf('/workspace/today') >= 0 ? 'OK' : 'ERROR', 'Route /workspace/today', {});
    addCheck('ROUTE_GUIDED', paths.indexOf('/workspace/guided') >= 0, paths.indexOf('/workspace/guided') >= 0 ? 'OK' : 'ERROR', 'Route /workspace/guided', {});
  } catch (eR) {
    addCheck('ROUTE_ROLE_HOME', false, 'WARNING', String(eR), {});
  }

  try {
    var rToday = (typeof CbvWebAppWorkspace_routeByPath === 'function') ? CbvWebAppWorkspace_routeByPath('/workspace/today') : null;
    addCheck('ROUTE_LOOKUP_TODAY', !!rToday, rToday ? 'OK' : 'ERROR', 'routeByPath /workspace/today', {});
  } catch (eL) {
    addCheck('ROUTE_LOOKUP_TODAY', false, 'WARNING', String(eL), {});
  }

  try {
    var em = (typeof Session !== 'undefined' && Session.getActiveUser) ? Session.getActiveUser().getEmail() : '';
    var rp = (typeof CbvWebAppOpUx_resolveWorkspaceRole_ === 'function') ? CbvWebAppOpUx_resolveWorkspaceRole_(em) : null;
    addCheck('ROLE_LOOKUP', !!rp && !!rp.workspaceRole, !!rp && !!rp.workspaceRole ? 'OK' : 'WARNING', 'Role resolver returned pack', { role: rp ? rp.workspaceRole : '' });
  } catch (eRole) {
    addCheck('ROLE_LOOKUP', false, 'WARNING', String(eRole), {});
  }

  try {
    var todayModel = (typeof CbvWebAppOpUx_getTodayOpsModel_ === 'function') ? CbvWebAppOpUx_getTodayOpsModel_('') : null;
    var hasSummary = !!(todayModel && todayModel.summary);
    addCheck('TODAY_MODEL_SHAPE', hasSummary, hasSummary ? 'OK' : 'WARNING', 'Today model has summary', { keys: todayModel ? Object.keys(todayModel) : [] });
  } catch (eT) {
    addCheck('TODAY_MODEL_SHAPE', false, 'WARNING', String(eT), {});
  }

  try {
    var steps = (typeof CbvWebAppOpUx_getGuidedStepsForRole_ === 'function') ? CbvWebAppOpUx_getGuidedStepsForRole_('STAFF') : [];
    addCheck('GUIDED_INLINE', Array.isArray(steps) && steps.length >= 2, Array.isArray(steps) && steps.length >= 2 ? 'OK' : 'WARNING', 'Guided steps for STAFF', { n: steps ? steps.length : 0 });
  } catch (eG) {
    addCheck('GUIDED_INLINE', false, 'WARNING', String(eG), {});
  }

  var vu = null;
  try {
    vu = (typeof CbvWebAppVi_validate === 'function') ? CbvWebAppVi_validate() : null;
    addCheck('VI_VALIDATE', vu && vu.ok === true, vu && vu.ok ? 'OK' : 'ERROR', 'CbvWebAppVi_validate', {});
    if (vu && vu.warnings) vu.warnings.forEach(function (w) { externalWarnings.push('VI_VALIDATE: ' + w); });
  } catch (eV) {
    addCheck('VI_VALIDATE', false, 'WARNING', String(eV), {});
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

  var runFin = CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings);

  var reportText = [
    '=== MILESTONE_01 — FULL OPERATIONAL WORKSPACE TEST ===',
    'traceId=' + traceId,
    'runStatus=' + runFin.status,
    'runOk=' + String(runFin.ok),
    'runSeverity=' + runFin.severity,
    'failedChecks=' + JSON.stringify((checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) { return c.code; }))
  ].join('\n');

  var draft = {
    ok: runFin.ok,
    phase: 'MILESTONE_01_INTERNAL_OPERATIONAL_WORKSPACE',
    status: runFin.status,
    checkedAt: now,
    runBy: runBy,
    traceId: traceId,
    testSuite: 'MILESTONE_01_FULL_OPERATIONAL_WORKSPACE',
    summary: 'Milestone 01 full workspace test (pre-envelope): ' + runFin.status + ' (' + runFin.severity + ')',
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep,
    severity: runFin.severity,
    reportText: reportText,
    reportJson: { driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '', phase107: true },
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false
  };

  var keysOk = CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_(draft).ok;
  var ic = CbvTcsMilestone01OpWorkspace__validateAllCheckItems_(checks);
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
      mode: 'CBV_TCS_V1_PHASE107'
    }
  });
  draft.checks = checks;
  draft.envelopeOk = envelopeRowOk === true;

  var fin = CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_({
    checks: checks,
    envelopeOk: draft.envelopeOk === true,
    externalWarnings: [],
    errors: runFin.errors || [],
    warnings: runFin.warnings || []
  });

  draft.ok = fin.ok;
  draft.status = fin.status;
  draft.severity = fin.severity;
  draft.errors = fin.errors || [];
  draft.warnings = fin.warnings || [];
  draft.nextStep = fin.nextStep;
  draft.summary = 'Milestone 01 full workspace test: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nfinalOk=' + String(fin.ok) + '\nenvelopeOk=' + String(draft.envelopeOk);

  var bundleEx = null;
  try {
    if (typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function') {
      var exportDraft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, true, {
        preWrite: true,
        expectedMinFiles: 6,
        note: 'Drive row optimistic; exporter asserts six files on success.'
      });
      exportDraft.reportJson.finalStatus = exportDraft.status;
      exportDraft.reportJson.ok = exportDraft.ok;
      exportDraft.reportJson.severity = exportDraft.severity;
      exportDraft.reportJson.envelopeOk = exportDraft.envelopeOk;

      var handoffMd = CbvTcsMilestone01OpWorkspace__buildAiHandoffMd_(exportDraft, traceId);
      bundleEx = CbvTcsDriveReport_exportMilestoneFullTestBundle(exportDraft, {
        tagStem: 'MILESTONE_01_FULL_TEST',
        aiHandoffMarkdown: handoffMd,
        evidenceHtml: CbvTcsMilestone01OpWorkspace__buildEvidenceHtml_(exportDraft.checks)
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
    draft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, false, {
      exception: eD && eD.message ? eD.message : String(eD)
    });
    checks = draft.checks;
  }

  if (draft.envelopeOk !== true || draft.ok !== (draft.status !== 'FAIL')) {
    draft.ok = false;
    if (draft.status !== 'FAIL') draft.status = 'FAIL';
    if (draft.severity !== 'CRITICAL') draft.severity = 'ERROR';
    if (draft.errors.indexOf('CONSISTENCY_GUARD') < 0) draft.errors.push('CONSISTENCY_GUARD');
  }

  CbvTcsMilestone01OpWorkspace_TestConsole__storeLatest_(draft);
  try { Logger.log(draft.reportText); } catch (eL) { /* ignore */ }
  return draft;
}

function CbvTcsMilestone01OpWorkspace_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvTcsMilestone01OpWorkspace_TestConsole__getLatest_();
  if (!r) {
    ui.alert('No report', 'Run Milestone 01 Full Operational Workspace Test first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Milestone 01 — copy report');
  return { ok: true };
}
