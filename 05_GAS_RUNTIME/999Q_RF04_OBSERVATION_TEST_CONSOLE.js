/**
 * PHASE_RF_04 — Observation Test Console (CBV_TCS_V1)
 */

var CBV_TCS_RF04_UI_MARKERS = [
  'cbv-rf04-observation',
  'cbv-rf04-nav',
  'cbv-rf04-card',
  'cbv-rf04-health-row',
  'cbv-rf04-proj-row',
  'cbv-rf04-queue-row',
  'cbv-rf04-sync-row',
  'cbv-rf04-audit-row',
  'cbv-rf04-alert-row',
  'cbv-rf04-state'
];

var __CBV_TCS_RF04_TC_LAST_REPORT = null;
var __CBV_TCS_RF04_TC_LAST_PROP_KEY = 'CBV_TCS_RF04_TC_LAST_REPORT_JSON';

function CbvTcsRf04ObservationRuntime_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_RF04_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_RF04_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CBV_RF04_Test_runObservationRuntimeHealth() {
  return CbvTcsRf04ObservationRuntime_TestConsole_runFull();
}

function CbvTcsRf04ObservationRuntime_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSRF04_')
    : ('WSRF04_' + new Date().getTime());
  var checks = [];
  var externalWarnings = [];

  function addCheck(code, ok, severity, message, detail) {
    var sev = ok ? (severity || 'OK') : (severity === 'WARNING' ? 'WARNING' : 'ERROR');
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
  }

  addCheck('RF02_PERMISSION_AVAILABLE', typeof CBV_Permission_getCurrentUserContext === 'function', 'OK', 'RF_02 permission', {});
  addCheck('RF03_COORDINATION_AVAILABLE', typeof CBV_Coordination_getQueueModel_ === 'function', 'OK', 'RF_03 coordination', {});
  addCheck('OBSERVATION_PERMISSION_ACTIONS', typeof CBV_PERMISSION_ACTIONS.OBSERVATION_VIEW === 'string', 'OK', 'OBSERVATION_* actions', {});

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_RF04_OBSERVATION', paths.indexOf('/workspace/observation') >= 0, 'OK', 'Observation home', {});
    addCheck('ROUTE_RF04_HEALTH', paths.indexOf('/workspace/observation/health') >= 0, 'OK', 'Health route', {});
    addCheck('ROUTE_RF04_ALERTS', paths.indexOf('/workspace/observation/alerts') >= 0, 'OK', 'Alerts route', {});
    addCheck('REGRESSION_RF03_COORDINATION', paths.indexOf('/workspace/coordination/queue') >= 0, 'OK', 'RF_03 preserved', {});
    addCheck('REGRESSION_RF02_WORKBOARD', paths.indexOf('/workspace/workboard/tasks') >= 0, 'OK', 'RF_02 preserved', {});
  } catch (eRg) {
    addCheck('ROUTE_RF04_OBSERVATION', false, 'ERROR', String(eRg), {});
  }

  addCheck('RENDERER_RF04', typeof CbvRf04Obs_renderPageByType_ === 'function', 'OK', 'RF04 renderer', {});

  var ctx = CBV_Permission_getCurrentUserContext();
  var rh = typeof CBV_Observation_getRuntimeHealth_ === 'function' ? CBV_Observation_getRuntimeHealth_(ctx) : null;
  addCheck('RUNTIME_HEALTH_ENVELOPE', !!(rh && rh.ok === true && rh.phase === CBV_RF04_PHASE_ID), rh && rh.ok ? 'OK' : 'ERROR', 'Runtime health', rh || {});

  var ph = typeof CBV_Observation_getProjectionHealth_ === 'function' ? CBV_Observation_getProjectionHealth_(ctx) : null;
  addCheck('PROJECTION_HEALTH_ENVELOPE', !!(ph && ph.ok === true), ph && ph.ok ? 'OK' : 'ERROR', 'Projection health', ph || {});

  var qh = typeof CBV_Observation_getQueueHealth_ === 'function' ? CBV_Observation_getQueueHealth_(ctx) : null;
  addCheck('QUEUE_HEALTH_RF03', !!(qh && qh.ok === true), qh && qh.ok ? 'OK' : 'ERROR', 'Queue health uses RF_03', qh || {});

  var sh = typeof CBV_Observation_getSyncHealthStub_ === 'function' ? CBV_Observation_getSyncHealthStub_(ctx) : null;
  var syncOk = !!(sh && sh.ok && sh.data && sh.data.syncs && sh.data.syncs.some(function (s) {
    return s.status === 'NOT_CONFIGURED' || s.status === 'STUB';
  }));
  addCheck('SYNC_STUB_SAFE', syncOk, syncOk ? 'OK' : 'ERROR', 'Sync stub NOT_CONFIGURED/STUB', sh ? sh.data : {});

  var af = typeof CBV_Observation_getAuditFeed_ === 'function' ? CBV_Observation_getAuditFeed_(ctx) : null;
  addCheck('AUDIT_FEED_SAFE', !!(af && af.ok === true), af && af.ok ? 'OK' : 'ERROR', 'Audit read-first', af || {});

  var al = typeof CBV_Observation_getAlerts_ === 'function' ? CBV_Observation_getAlerts_(ctx) : null;
  var alertDtoOk = !!(al && al.ok && al.data && al.data.autoResolve === false && al.data.autoEscalate === false);
  addCheck('ALERT_DTO_NO_AUTO', alertDtoOk, alertDtoOk ? 'OK' : 'ERROR', 'No auto-resolve/escalate', al ? al.data : {});

  if (al && al.data && al.data.alerts && al.data.alerts[0]) {
    var sample = al.data.alerts[0];
    addCheck('ALERT_DTO_SHAPE', !!(sample.alertId && sample.severity && sample.title), 'OK', 'Alert DTO contract', sample);
  } else {
    addCheck('ALERT_DTO_SHAPE', true, 'OK', 'Alert list empty (OK)', {});
  }

  addCheck('OBSERVATION_READ_ONLY', typeof CBV_Observation_getDashboardModel_ === 'function', 'OK', 'Dashboard read-first', {});

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P.' };

  var draft = {
    ok: runFin.ok,
    phase: CBV_RF04_PHASE_ID,
    status: runFin.status,
    checkedAt: new Date().toISOString(),
    runBy: (typeof cbvUser === 'function') ? cbvUser() : '',
    traceId: traceId,
    testSuite: 'CBV_RF04_Test_runObservationRuntimeHealth',
    summary: 'RF_04 Observation Runtime: ' + runFin.status,
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep || 'clasp push; run menu test',
    severity: runFin.severity || 'OK',
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false,
    reportText: '',
    reportJson: null
  };

  var reportText = 'PHASE_RF_04_OBSERVATION_RUNTIME\ntraceId=' + traceId;
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
    detail: { keysOk: keysOk, mode: 'CBV_TCS_V1_RF04' }
  });
  draft.checks = checks;
  draft.envelopeOk = envelopeRowOk === true;

  var fin = (typeof CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_({
      checks: checks,
      envelopeOk: draft.envelopeOk === true,
      externalWarnings: externalWarnings,
      errors: runFin.errors || [],
      warnings: runFin.warnings || []
    })
    : runFin;

  draft.ok = fin.ok;
  draft.status = fin.status;
  draft.severity = fin.severity;
  draft.errors = fin.errors || [];
  draft.warnings = fin.warnings || [];
  draft.nextStep = fin.nextStep;
  draft.summary = 'RF_04 Observation Runtime: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nenvelopeOk=' + String(draft.envelopeOk);
  draft.reportJson = draft;

  CbvTcsRf04ObservationRuntime_TestConsole__storeLatest_(draft);
  return draft;
}

function CbvTcsRf04ObservationRuntime_TestConsole_copyLatestReport() {
  var rep = __CBV_TCS_RF04_TC_LAST_REPORT;
  if (!rep) {
    try {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_RF04_TC_LAST_PROP_KEY);
      if (raw) rep = JSON.parse(raw);
    } catch (e0) { /* */ }
  }
  if (!rep) return { ok: false, message: 'No RF_04 report yet.' };
  var json = JSON.stringify(rep, null, 2);
  var html = HtmlService.createHtmlOutput('<textarea style="width:100%;height:420px">' + json.replace(/</g, '&lt;') + '</textarea>').setWidth(640).setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, 'RF_04 Latest Test Report JSON');
  return { ok: true, message: 'Dialog opened.' };
}
