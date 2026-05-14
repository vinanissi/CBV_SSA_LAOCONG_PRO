/**
 * MILESTONE_01 — Internal operational workspace — Full test (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Run Milestone 01 Full Operational Workspace Test
 *
 * One click: run checks + append-only Drive bundle (folder CBV_TCS_DRIVE_REPORT_FOLDER_ID).
 */

var __CBV_TCS_MILESTONE01_TC_LAST_REPORT = null;
var __CBV_TCS_MILESTONE01_TC_LAST_PROP_KEY = 'CBV_TCS_MILESTONE01_TC_LAST_REPORT_JSON';

function CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function (k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
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

/**
 * Full Milestone 01 operational workspace verification + Drive evidence bundle.
 */
function CbvTcsMilestone01OpWorkspace_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSM01_')
    : ('WSM01_' + new Date().getTime());

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

  addCheck('PAGE_TYPES', typeof CBV_WEBAPP_WS_PAGE_TYPES !== 'undefined' && !!CBV_WEBAPP_WS_PAGE_TYPES.ROLE_HOME, 'OK', 'ROLE_HOME page type registered', {});
  addCheck('ROLE_RESOLVER', typeof CbvWebAppOpUx_resolveWorkspaceRole_ === 'function', 'OK', 'CbvWebAppOpUx_resolveWorkspaceRole_', {});
  addCheck('TODAY_AGG', typeof CbvWebAppOpUx_getTodayOpsModel_ === 'function', 'OK', 'CbvWebAppOpUx_getTodayOpsModel_', {});
  addCheck('GUIDED_STEPS', typeof CbvWebAppOpUx_getGuidedStepsForRole_ === 'function', 'OK', 'CbvWebAppOpUx_getGuidedStepsForRole_', {});
  addCheck('ACTION_BAR', typeof CbvWebAppOpUx_buildGlobalActionBarHtml_ === 'function', 'OK', 'Global action bar builder', {});
  addCheck('AUGMENT_SHELL', typeof CbvWebAppOpUx_augmentPageForShell_ === 'function', 'OK', 'Shell augment hook', {});
  addCheck('DRIVE_BUNDLE_FN', typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function', 'OK', 'CbvTcsDriveReport_exportMilestoneFullTestBundle', {});

  var probe = (typeof CbvWebAppOpUx_probeUiMarkersInProject_ === 'function') ? CbvWebAppOpUx_probeUiMarkersInProject_() : { components: false, shell: false };
  addCheck('UX_LOADING_MARKERS', probe.components === true, probe.components ? 'OK' : 'ERROR', 'COMPONENTS contains loading/empty/button markers', probe.detail || {});
  addCheck('UX_SHELL_MARKERS', probe.shell === true, probe.shell ? 'OK' : 'ERROR', 'SHELL contains action bar + toast + busy-link markers', probe.detail || {});

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
    addCheck('VI_VALIDATE', vu && vu.ok === true, vu && vu.ok ? 'OK' : 'ERROR', 'CbvWebAppVi_validate', { detail: vu });
  } catch (eV) {
    addCheck('VI_VALIDATE', false, 'WARNING', String(eV), {});
  }

  var vr = null;
  try {
    vr = (typeof CbvWebAppRouteUrl_validate === 'function') ? CbvWebAppRouteUrl_validate() : null;
    addCheck('ROUTE_URL_VALIDATE', vr && vr.ok === true, vr && vr.ok ? 'OK' : 'ERROR', 'CbvWebAppRouteUrl_validate', { detail: vr });
  } catch (eH) {
    addCheck('ROUTE_URL_VALIDATE', false, 'WARNING', String(eH), {});
  }

  var prelimHandoff = [
    '# AI Handoff — Milestone 01 Internal Operational Workspace',
    '',
    '- traceId: `' + traceId + '`',
    '- testSuite: `MILESTONE_01_FULL_OPERATIONAL_WORKSPACE`',
    '',
    '## Checks (pre-bundle)',
    checks.map(function (c) {
      return '- ' + c.code + ': ' + (c.ok ? 'OK' : 'FAIL') + ' — ' + c.message;
    }).join('\n')
  ].join('\n');

  var bundleEx = null;
  try {
    if (typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function') {
      var preReport = {
        ok: true,
        phase: 'MILESTONE_01_INTERNAL_OPERATIONAL_WORKSPACE',
        status: 'GO',
        checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
        runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
        traceId: traceId,
        testSuite: 'MILESTONE_01_FULL_OPERATIONAL_WORKSPACE',
        summary: 'Milestone 01 full workspace test (interim payload for Drive bundle).',
        checks: checks,
        warnings: warnings.slice(),
        errors: [],
        nextStep: 'Final status computed after bundle + envelope checks.',
        severity: 'OK',
        reportText: '',
        reportJson: { driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '' },
        contractVersion: 'CBV_TCS_V1',
        envelopeOk: false
      };
      bundleEx = CbvTcsDriveReport_exportMilestoneFullTestBundle(preReport, {
        tagStem: 'MILESTONE_01_FULL_TEST',
        aiHandoffMarkdown: prelimHandoff
      });
      var fc = bundleEx && bundleEx.files ? bundleEx.files.length : 0;
      addCheck('DRIVE_SIX_FILE_BUNDLE', fc >= 6, fc >= 6 ? 'OK' : (typeof DriveApp === 'undefined' ? 'WARNING' : 'ERROR'),
        'Drive export created at least 6 append-only files', { fileCount: fc, files: bundleEx ? bundleEx.files : [] });
      if (bundleEx && bundleEx.warnings && bundleEx.warnings.length) {
        bundleEx.warnings.forEach(function (w) { warnings.push('DRIVE: ' + w); });
      }
      if (bundleEx && !bundleEx.ok && bundleEx.errors && bundleEx.errors.length) {
        warnings.push('CBV_TEST_REPORT_DRIVE_SAVE_FAILED: ' + bundleEx.errors.join(' | '));
      }
    }
  } catch (eD) {
    addCheck('DRIVE_SIX_FILE_BUNDLE', false, 'WARNING', String(eD && eD.message ? eD.message : eD), {});
    warnings.push('DRIVE_BUNDLE_EXCEPTION: ' + (eD && eD.message ? eD.message : String(eD)));
  }

  errors = [];
  warnings = [];
  checks.forEach(function (c) {
    if (!c.ok && (c.severity === 'ERROR' || c.severity === 'CRITICAL')) errors.push(c.message);
    if (!c.ok && c.severity === 'WARNING') warnings.push(c.message);
  });
  if (vu && vu.warnings) {
    vu.warnings.forEach(function (w) { warnings.push('VI_VALIDATE: ' + w); });
  }
  if (vr && vr.warnings) {
    vr.warnings.forEach(function (w) { warnings.push('ROUTE_URL_VALIDATE: ' + w); });
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: 'MILESTONE_01_INTERNAL_OPERATIONAL_WORKSPACE',
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'MILESTONE_01_FULL_OPERATIONAL_WORKSPACE',
    summary: 'Milestone 01 full workspace test: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix failing checks (envelope, routes, UI markers, VI/route validators, Drive bundle) and rerun.'
      : 'Review Drive folder for new 6-file bundle; distribute AI_HANDOFF to operators.',
    severity: severity,
    reportText: '',
    reportJson: {
      driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '',
      driveFileCount: bundleEx && bundleEx.files ? bundleEx.files.length : 0,
      driveFiles: bundleEx && bundleEx.files ? bundleEx.files : []
    },
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false
  };

  var handoffMd = [
    '# AI Handoff — Milestone 01 Internal Operational Workspace',
    '',
    '- traceId: `' + traceId + '`',
    '- status: `' + status + '`',
    '- testSuite: `MILESTONE_01_FULL_OPERATIONAL_WORKSPACE`',
    '',
    '## Checks summary',
    checks.map(function (c) {
      return '- ' + c.code + ': ' + (c.ok ? 'OK' : 'FAIL') + ' — ' + c.message;
    }).join('\n'),
    '',
    '## Next',
    String(report.nextStep || '')
  ].join('\n');
  report.reportJson.aiHandoffMarkdown = handoffMd;

  var env = CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });
  report.checks = checks;

  errors = [];
  warnings = [];
  checks.forEach(function (c) {
    if (!c.ok && (c.severity === 'ERROR' || c.severity === 'CRITICAL')) errors.push(c.message);
    if (!c.ok && c.severity === 'WARNING') warnings.push(c.message);
  });
  report.warnings = warnings;
  report.errors = errors;
  status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');
  report.status = status;
  report.ok = status !== 'FAIL';
  report.severity = severity;
  report.summary = 'Milestone 01 full workspace test: ' + status + ' (' + severity + ')';

  report.reportText = [
    '=== MILESTONE_01 — FULL OPERATIONAL WORKSPACE TEST ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + traceId,
    'driveFiles=' + (bundleEx && bundleEx.files ? bundleEx.files.length : 0)
  ].join('\n');

  CbvTcsMilestone01OpWorkspace_TestConsole__storeLatest_(report);
  try { Logger.log(report.reportText); } catch (eL) { /* ignore */ }
  return report;
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
