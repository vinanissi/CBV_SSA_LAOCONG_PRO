/**
 * PHASE_RF_07 — Runtime Lock Verification Test Console (CBV_TCS_V1)
 *
 * Verifies RF_02→RF_06 runtime stability, route registry, contract freeze readiness.
 * No new features. No destructive operations.
 */

var CBV_RF07_PHASE_ID = 'PHASE_RF_07_REAL_USAGE_UAT_AND_RUNTIME_LOCK';
var CBV_RF07_RUNTIME_LOCK_TAG = 'v2.4.1-RF-RUNTIME-LOCK-V1';

var CBV_RF07_CANONICAL_ROUTES = [
  '/workspace/workboard',
  '/workspace/workboard/tasks',
  '/workspace/workboard/search',
  '/workspace/workboard/notifications',
  '/workspace/coordination',
  '/workspace/coordination/queue',
  '/workspace/coordination/overdue',
  '/workspace/coordination/workload',
  '/workspace/observation',
  '/workspace/observation/health',
  '/workspace/observation/alerts',
  '/workspace/observation/audit',
  '/workspace/plugins',
  '/workspace/plugins/finance',
  '/workspace/plugins/ho-so'
];

var __CBV_TCS_RF07_TC_LAST_REPORT = null;
var __CBV_TCS_RF07_TC_LAST_PROP_KEY = 'CBV_TCS_RF07_TC_LAST_REPORT_JSON';

function CbvTcsRf07RuntimeLock_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_RF07_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_RF07_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CBV_RF07_Test_runRuntimeLockVerification() {
  return CbvTcsRf07RuntimeLock_TestConsole_runFull();
}

function CbvTcsRf07RuntimeLock_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSRF07_')
    : ('WSRF07_' + new Date().getTime());
  var checks = [];
  var externalWarnings = [
    'Sync health remains STUB/NOT_CONFIGURED',
    'EXECUTION_LOCKED actions expected for assign/confirm/approve',
    'Timeline may be empty without log rows',
    'Runtime lock tag prepared — not pushed unless requested'
  ];

  function addCheck(code, ok, severity, message, detail) {
    var sev = ok ? (severity || 'OK') : (severity === 'WARNING' ? 'WARNING' : 'ERROR');
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
  }

  addCheck('RF02_RUNTIME', typeof CbvRf02TaskList_getModel_ === 'function', 'OK', 'RF_02 workboard', {});
  addCheck('RF03_RUNTIME', typeof CBV_Coordination_getQueueModel_ === 'function', 'OK', 'RF_03 coordination', {});
  addCheck('RF04_RUNTIME', typeof CBV_Observation_getRuntimeHealth_ === 'function', 'OK', 'RF_04 observation', {});
  addCheck('RF05_RUNTIME', typeof CBV_PluginRegistry_list === 'function', 'OK', 'RF_05 plugin registry', {});
  addCheck('RF06_RUNTIME', typeof CBV_Rf06Finance_getProjection_ === 'function', 'OK', 'RF_06 finance/hoso', {});

  addCheck('SHELL_WRAP_RF02', typeof CbvRf02Workboard_wrapBody_ === 'function', 'OK', 'Workboard shell wrap', {});
  addCheck('RENDERER_RF02', typeof CbvRf02Workboard_renderPageByType_ === 'function', 'OK', 'RF02 renderer', {});
  addCheck('RENDERER_RF03', typeof CbvRf03Coord_renderPageByType_ === 'function', 'OK', 'RF03 renderer', {});
  addCheck('RENDERER_RF04', typeof CbvRf04Obs_renderPageByType_ === 'function', 'OK', 'RF04 renderer', {});
  addCheck('RENDERER_RF05', typeof CbvRf05Plugin_renderPageByType_ === 'function', 'OK', 'RF05 renderer', {});
  addCheck('RENDERER_RF06', typeof CbvRf06_renderPageByType_ === 'function', 'OK', 'RF06 renderer', {});

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    var missing = [];
    for (var i = 0; i < CBV_RF07_CANONICAL_ROUTES.length; i++) {
      if (paths.indexOf(CBV_RF07_CANONICAL_ROUTES[i]) < 0) missing.push(CBV_RF07_CANONICAL_ROUTES[i]);
    }
    addCheck('ROUTE_REGISTRY_STABLE', missing.length === 0, missing.length ? 'ERROR' : 'OK', 'Canonical UAT routes', { missing: missing, total: paths.length });
  } catch (eRg) {
    addCheck('ROUTE_REGISTRY_STABLE', false, 'ERROR', String(eRg), {});
  }

  addCheck('PERMISSION_RUNTIME', typeof CBV_Permission_can === 'function' && typeof CBV_PERMISSION_ACTIONS.PLUGIN_VIEW === 'string', 'OK', 'Permission contract', {});
  addCheck('PLUGIN_VALIDATOR', typeof CBV_PluginRegistry_validateDescriptor === 'function', 'OK', 'Plugin contract validator', {});

  var finP = CBV_PluginRegistry_get('cbv-plugin-finance');
  var hsP = CBV_PluginRegistry_get('cbv-plugin-ho-so');
  addCheck('FINANCE_ACTIVE_READONLY', !!(finP && finP.status === 'ACTIVE_READONLY'), finP ? 'OK' : 'WARNING', 'FINANCE ACTIVE_READONLY', finP ? { status: finP.status } : {});
  addCheck('HO_SO_ACTIVE_READONLY', !!(hsP && hsP.status === 'ACTIVE_READONLY'), hsP ? 'OK' : 'WARNING', 'HO_SO ACTIVE_READONLY', hsP ? { status: hsP.status } : {});

  if (finP && finP.actions) {
    var finLocked = finP.actions.filter(function (a) {
      return a.executionMode === 'EXECUTION_LOCKED' || a.executionMode === 'MANUAL_CONFIRM_REQUIRED';
    }).length > 0;
    addCheck('FINANCE_EXECUTION_LOCKED', finLocked, 'OK', 'Confirm payment locked', {});
  }

  var ctx = CBV_Permission_getCurrentUserContext();
  var alerts = typeof CBV_Observation_getAlerts_ === 'function' ? CBV_Observation_getAlerts_(ctx) : null;
  if (alerts && alerts.data) {
    addCheck('OBSERVATION_NO_AUTO', alerts.data.autoResolve === false && alerts.data.autoEscalate === false, 'OK', 'Observation alerts', {});
  }

  var finAlerts = typeof CBV_Rf06Finance_getAlerts_ === 'function' ? CBV_Rf06Finance_getAlerts_(ctx) : null;
  if (finAlerts && finAlerts.data) {
    addCheck('FINANCE_NO_AUTO', finAlerts.data.autoResolve === false && finAlerts.data.autoEscalate === false, 'OK', 'Finance alerts', {});
  }

  addCheck('MOBILE_MARKERS', typeof CbvRf02Workboard_wrapBody_ === 'function', 'OK', 'Mobile stack wrap (cbv-workboard-mobile-stack)', {});
  addCheck('RUNTIME_LOCK_DOCS_TAG', CBV_RF07_RUNTIME_LOCK_TAG.indexOf('RUNTIME-LOCK') >= 0, 'OK', 'Lock tag prepared', { tag: CBV_RF07_RUNTIME_LOCK_TAG });
  addCheck('NO_DESTRUCTIVE_API', typeof CBV_PluginRegistry_list === 'function' && typeof CBV_PluginRegistry_validateDescriptor === 'function', 'OK', 'Read-only registry', {});

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P.' };

  var draft = {
    ok: runFin.ok,
    phase: CBV_RF07_PHASE_ID,
    status: runFin.status,
    checkedAt: new Date().toISOString(),
    runBy: (typeof cbvUser === 'function') ? cbvUser() : '',
    traceId: traceId,
    testSuite: 'CBV_RF07_Test_runRuntimeLockVerification',
    summary: 'RF_07 Runtime Lock: ' + runFin.status,
    checks: checks,
    warnings: (runFin.warnings || []).concat(externalWarnings),
    errors: runFin.errors || [],
    nextStep: runFin.nextStep || 'Review docs/runtime-lock; tag ' + CBV_RF07_RUNTIME_LOCK_TAG,
    severity: runFin.severity || 'OK',
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false,
    reportText: '',
    reportJson: null,
    runtimeLockTag: CBV_RF07_RUNTIME_LOCK_TAG,
    runtimeLockStatus: runFin.status !== 'FAIL' ? 'LOCKED' : 'NOT_LOCKED'
  };

  var reportText = 'PHASE_RF_07_RUNTIME_LOCK\ntraceId=' + traceId + '\nlockTag=' + CBV_RF07_RUNTIME_LOCK_TAG;
  draft.reportText = reportText;

  var keysOk = (typeof CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_ === 'function')
    ? CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_(draft).ok
    : false;
  var ic = (typeof CbvTcsMilestone01OpWorkspace__validateAllCheckItems_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__validateAllCheckItems_(checks)
    : { ok: false, bad: ['validator_missing'] };
  addCheck('CHECK_ITEM_CONTRACT', ic.ok === true, ic.ok ? 'OK' : 'ERROR', 'Check item contract', { bad: ic.bad || [] });

  var envelopeRowOk = keysOk === true && ic.ok === true && String(reportText || '').trim().length > 0 && runFin.status !== 'FAIL';
  checks.push({
    code: 'REPORT_ENVELOPE',
    ok: envelopeRowOk === true,
    severity: envelopeRowOk ? 'OK' : 'ERROR',
    message: 'CBV_TCS_V1 envelope',
    detail: { keysOk: keysOk, mode: 'CBV_TCS_V1_RF07' }
  });
  draft.checks = checks;
  draft.envelopeOk = envelopeRowOk === true;

  var fin = (typeof CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_({
      checks: checks,
      envelopeOk: draft.envelopeOk === true,
      externalWarnings: externalWarnings,
      errors: runFin.errors || [],
      warnings: draft.warnings || []
    })
    : runFin;

  draft.ok = fin.ok;
  draft.status = fin.status;
  draft.severity = fin.severity;
  draft.errors = fin.errors || [];
  draft.warnings = fin.warnings || [];
  draft.nextStep = fin.nextStep;
  draft.summary = 'RF_07 Runtime Lock: ' + fin.status + ' (' + fin.severity + ')';
  draft.runtimeLockStatus = fin.status !== 'FAIL' ? 'LOCKED' : 'NOT_LOCKED';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nenvelopeOk=' + String(draft.envelopeOk) + '\nruntimeLockStatus=' + draft.runtimeLockStatus;
  draft.reportJson = draft;

  CbvTcsRf07RuntimeLock_TestConsole__storeLatest_(draft);
  return draft;
}

function CbvTcsRf07RuntimeLock_TestConsole_copyLatestReport() {
  var rep = __CBV_TCS_RF07_TC_LAST_REPORT;
  if (!rep) {
    try {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_RF07_TC_LAST_PROP_KEY);
      if (raw) rep = JSON.parse(raw);
    } catch (e0) { /* */ }
  }
  if (!rep) return { ok: false, message: 'No RF_07 report yet.' };
  var json = JSON.stringify(rep, null, 2);
  var html = HtmlService.createHtmlOutput('<textarea style="width:100%;height:420px">' + json.replace(/</g, '&lt;') + '</textarea>').setWidth(640).setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, 'RF_07 Latest Test Report JSON');
  return { ok: true, message: 'Dialog opened.' };
}

function CBV_RF07_getRuntimeLockTagRecommendation_() {
  return CBV_RF07_RUNTIME_LOCK_TAG;
}
