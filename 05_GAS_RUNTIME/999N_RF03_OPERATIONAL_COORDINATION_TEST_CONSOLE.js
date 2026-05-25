/**
 * PHASE_RF_03 — Operational Coordination Test Console (CBV_TCS_V1)
 */

var CBV_TCS_RF03_UI_MARKERS = [
  'cbv-rf03-coord',
  'cbv-rf03-nav',
  'cbv-rf03-manager-cards',
  'cbv-rf03-queue-section',
  'cbv-rf03-overdue-card',
  'cbv-rf03-workload-card',
  'cbv-rf03-state'
];

var __CBV_TCS_RF03_TC_LAST_REPORT = null;
var __CBV_TCS_RF03_TC_LAST_PROP_KEY = 'CBV_TCS_RF03_TC_LAST_REPORT_JSON';

function CbvTcsRf03OperationalCoordination_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_RF03_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_RF03_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CBV_RF03_Test_runOperationalCoordinationHealth() {
  return CbvTcsRf03OperationalCoordination_TestConsole_runFull();
}

function CbvTcsRf03OperationalCoordination_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSRF03_')
    : ('WSRF03_' + new Date().getTime());
  var checks = [];
  var externalWarnings = [];

  function addCheck(code, ok, severity, message, detail) {
    var sev = ok ? (severity || 'OK') : (severity === 'WARNING' ? 'WARNING' : 'ERROR');
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
  }

  addCheck('RF02_PERMISSION_AVAILABLE', typeof CBV_Permission_getCurrentUserContext === 'function', 'OK', 'RF_02 permission runtime', {});
  addCheck('RF03_COORDINATION_ACTIONS', typeof CBV_PERMISSION_ACTIONS.COORDINATION_VIEW === 'string', 'OK', 'Coordination permission actions defined', {});

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_RF03_COORDINATION', paths.indexOf('/workspace/coordination') >= 0 || paths.indexOf('/workspace/coordination/manager') >= 0, 'OK', 'Coordination routes registered', { sample: paths.filter(function (p) { return p.indexOf('coordination') >= 0; }) });
    addCheck('ROUTE_RF03_QUEUE', paths.indexOf('/workspace/coordination/queue') >= 0, 'OK', 'Queue route', {});
    addCheck('ROUTE_RF03_OVERDUE', paths.indexOf('/workspace/coordination/overdue') >= 0, 'OK', 'Overdue route', {});
    addCheck('ROUTE_RF03_WORKLOAD', paths.indexOf('/workspace/coordination/workload') >= 0, 'OK', 'Workload route', {});
    addCheck('ROUTE_RF03_ASSIGNMENT', paths.indexOf('/workspace/coordination/assignment') >= 0, 'OK', 'Assignment route', {});
    addCheck('REGRESSION_RF02_WORKBOARD', paths.indexOf('/workspace/workboard/tasks') >= 0, 'OK', 'RF_02 routes preserved', {});
  } catch (eRg) {
    addCheck('ROUTE_RF03_COORDINATION', false, 'ERROR', String(eRg), {});
  }

  addCheck('RENDERER_RF03', typeof CbvRf03Coord_renderPageByType_ === 'function', 'OK', 'RF03 renderer loaded', {});

  var ctx = CBV_Permission_getCurrentUserContext();
  var qEnv = typeof CBV_Coordination_getQueueModel_ === 'function' ? CBV_Coordination_getQueueModel_(ctx) : null;
  addCheck('QUEUE_SAFE_ENVELOPE', !!(qEnv && qEnv.ok === true && qEnv.phase === CBV_RF03_PHASE_ID), qEnv && qEnv.ok ? 'OK' : 'ERROR', 'Queue runtime envelope', qEnv || {});

  var odEnv = typeof CBV_Coordination_getOverdueModel_ === 'function' ? CBV_Coordination_getOverdueModel_(ctx) : null;
  addCheck('OVERDUE_SAFE_ENVELOPE', !!(odEnv && odEnv.ok === true), odEnv && odEnv.ok ? 'OK' : 'ERROR', 'Overdue envelope', odEnv || {});
  addCheck('OVERDUE_UNKNOWN_DUE_SAFE', !!(odEnv && odEnv.data && typeof odEnv.data.unknownDueDateCount === 'number'), 'OK', 'unknownDueDate tracked', odEnv ? odEnv.data : {});

  var wlEnv = typeof CBV_Coordination_getWorkloadModel_ === 'function' ? CBV_Coordination_getWorkloadModel_(ctx) : null;
  addCheck('WORKLOAD_SAFE_ENVELOPE', !!(wlEnv && wlEnv.ok === true), wlEnv && wlEnv.ok ? 'OK' : 'ERROR', 'Workload envelope', wlEnv || {});

  addCheck('ASSIGNMENT_CAN_FN', typeof CBV_Coordination_canAssign === 'function', 'OK', 'canAssign exists', {});
  var assignResult = typeof CBV_Coordination_assignTask === 'function'
    ? CBV_Coordination_assignTask({ taskId: 'RF03_TEST', ownerId: 'U_TEST', confirmed: true })
    : null;
  addCheck('ASSIGNMENT_EXECUTION_LOCKED', !!(assignResult && assignResult.executionLocked === true), 'OK', 'WebApp assign locked', assignResult || {});

  var qa = typeof CBV_Coordination_getQuickActions_ === 'function' ? CBV_Coordination_getQuickActions_(ctx) : [];
  var qaOk = Array.isArray(qa) && qa.length > 0 && qa[0].actionId && qa[0].hasOwnProperty('enabled');
  addCheck('QUICK_ACTION_DTO', qaOk, qaOk ? 'OK' : 'ERROR', 'Quick action DTO shape', { sample: qa[0] || null });

  var ev = typeof CBV_Coordination_buildCoordinationEvent_ === 'function'
    ? CBV_Coordination_buildCoordinationEvent_({ taskId: 'T1', action: 'TEST' })
    : null;
  addCheck('TIMELINE_EVENT_DTO', !!(ev && ev.eventId && ev.source === CBV_RF03_COORDINATION_SOURCE), ev ? 'OK' : 'ERROR', 'Coordination event DTO', ev || {});

  addCheck('RF03_READ_ONLY', typeof CBV_Coordination_getManagerModel_ === 'function', 'OK', 'Manager model read-first', {});

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P.' };

  var draft = {
    ok: runFin.ok,
    phase: CBV_RF03_PHASE_ID,
    status: runFin.status,
    checkedAt: new Date().toISOString(),
    runBy: (typeof cbvUser === 'function') ? cbvUser() : '',
    traceId: traceId,
    testSuite: 'CBV_RF03_Test_runOperationalCoordinationHealth',
    summary: 'RF_03 Operational Coordination: ' + runFin.status,
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep || 'clasp push; run menu in Sheet',
    severity: runFin.severity || 'OK',
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false,
    reportText: '',
    reportJson: null
  };

  var reportText = 'PHASE_RF_03_OPERATIONAL_COORDINATION\ntraceId=' + traceId + '\nchecks=' + checks.length;
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
    detail: { keysOk: keysOk, mode: 'CBV_TCS_V1_RF03' }
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
  draft.summary = 'RF_03 Operational Coordination: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nenvelopeOk=' + String(draft.envelopeOk);
  draft.reportJson = draft;

  CbvTcsRf03OperationalCoordination_TestConsole__storeLatest_(draft);
  return draft;
}

function CbvTcsRf03OperationalCoordination_TestConsole_copyLatestReport() {
  var rep = __CBV_TCS_RF03_TC_LAST_REPORT;
  if (!rep) {
    try {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_RF03_TC_LAST_PROP_KEY);
      if (raw) rep = JSON.parse(raw);
    } catch (e0) { /* */ }
  }
  if (!rep) return { ok: false, message: 'No RF_03 report yet.' };
  var json = JSON.stringify(rep, null, 2);
  var html = HtmlService.createHtmlOutput('<textarea style="width:100%;height:420px">' + json.replace(/</g, '&lt;') + '</textarea>').setWidth(640).setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, 'RF_03 Latest Test Report JSON');
  return { ok: true, message: 'Dialog opened.' };
}
