/**
 * PHASE_RF_05 — Plugin Test Console (CBV_TCS_V1)
 */

var CBV_TCS_RF05_UI_MARKERS = [
  'cbv-rf05-plugin',
  'cbv-rf05-nav',
  'cbv-rf05-card',
  'cbv-rf05-detail',
  'cbv-rf05-health-row',
  'cbv-rf05-state'
];

var __CBV_TCS_RF05_TC_LAST_REPORT = null;
var __CBV_TCS_RF05_TC_LAST_PROP_KEY = 'CBV_TCS_RF05_TC_LAST_REPORT_JSON';

function CbvTcsRf05PluginRuntime_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_RF05_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_RF05_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CBV_RF05_Test_runPluginRuntimeHealth() {
  return CbvTcsRf05PluginRuntime_TestConsole_runFull();
}

function CbvTcsRf05PluginRuntime_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSRF05_')
    : ('WSRF05_' + new Date().getTime());
  var checks = [];
  var externalWarnings = ['Plugin registry hardcoded in RF_05'];

  function addCheck(code, ok, severity, message, detail) {
    var sev = ok ? (severity || 'OK') : (severity === 'WARNING' ? 'WARNING' : 'ERROR');
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
  }

  addCheck('PLUGIN_REGISTRY_EXISTS', typeof CBV_PluginRegistry_list === 'function', 'OK', 'Registry list', {});
  var list = CBV_PluginRegistry_list();
  addCheck('PLUGIN_REGISTRY_COUNT', list.length >= 3, 'OK', 'At least 3 plugins', { count: list.length });

  var taskP = CBV_PluginRegistry_get('cbv-plugin-task');
  var finP = CBV_PluginRegistry_get('cbv-plugin-finance');
  var hsP = CBV_PluginRegistry_get('cbv-plugin-ho-so');
  addCheck('TASK_PLUGIN_DESCRIPTOR', !!(taskP && taskP.status === 'ACTIVE'), 'OK', 'TASK ACTIVE', taskP || {});
  addCheck('FINANCE_PLUGIN_DESCRIPTOR', !!(finP && finP.status === 'STUB'), finP ? 'OK' : 'ERROR', 'FINANCE STUB', finP || {});
  addCheck('HO_SO_PLUGIN_DESCRIPTOR', !!(hsP && hsP.status === 'STUB'), hsP ? 'OK' : 'ERROR', 'HO_SO STUB', hsP || {});

  [taskP, finP, hsP].forEach(function (p, idx) {
    if (!p) return;
    var val = CBV_PluginRegistry_validateDescriptor(p);
    addCheck('DESCRIPTOR_CONTRACT_' + p.module, val.ok === true, val.ok ? 'OK' : 'ERROR', 'Descriptor valid', { errors: val.errors, warnings: val.warnings });
  });

  addCheck('PLUGIN_PERMISSION_ACTIONS', typeof CBV_PERMISSION_ACTIONS.PLUGIN_VIEW === 'string', 'OK', 'PLUGIN_* actions', {});

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_RF05_PLUGINS', paths.indexOf('/workspace/plugins') >= 0, 'OK', 'Plugin home', {});
    addCheck('ROUTE_RF05_TASK', paths.indexOf('/workspace/plugins/task') >= 0, 'OK', 'Task plugin route', {});
    addCheck('ROUTE_RF05_HEALTH', paths.indexOf('/workspace/plugins/health') >= 0, 'OK', 'Plugin health route', {});
    addCheck('REGRESSION_RF04_OBSERVATION', paths.indexOf('/workspace/observation') >= 0, 'OK', 'RF_04 preserved', {});
    addCheck('REGRESSION_RF03_COORDINATION', paths.indexOf('/workspace/coordination/queue') >= 0, 'OK', 'RF_03 preserved', {});
  } catch (eRg) {
    addCheck('ROUTE_RF05_PLUGINS', false, 'ERROR', String(eRg), {});
  }

  addCheck('RENDERER_RF05', typeof CbvRf05Plugin_renderPageByType_ === 'function', 'OK', 'RF05 renderer', {});

  var ctx = CBV_Permission_getCurrentUserContext();
  var obs = typeof CBV_PluginObservation_getHealth === 'function' ? CBV_PluginObservation_getHealth(ctx) : null;
  addCheck('PLUGIN_OBSERVATION_ENVELOPE', !!(obs && obs.ok === true), obs && obs.ok ? 'OK' : 'ERROR', 'Observation health', obs || {});

  if (taskP && taskP.coordination) {
    addCheck('TASK_COORDINATION_BINDING', taskP.coordination.queueSupported === true, 'OK', 'TASK queue supported', taskP.coordination);
  }
  if (finP && finP.coordination) {
    addCheck('FINANCE_COORDINATION_STUB', finP.coordination.queueSupported === 'STUB', 'OK', 'FINANCE queue STUB', finP.coordination);
  }

  var dash = typeof CBV_Plugin_getDashboardModel_ === 'function' ? CBV_Plugin_getDashboardModel_(ctx) : null;
  addCheck('PLUGIN_DASHBOARD_ENVELOPE', !!(dash && dash.ok === true), dash && dash.ok ? 'OK' : 'ERROR', 'Dashboard', dash || {});

  var noAuto = true;
  (list || []).forEach(function (p) {
    (p.actions || []).forEach(function (a) {
      if (a.autoExecute === true) noAuto = false;
    });
  });
  addCheck('NO_PLUGIN_AUTO_EXECUTE', noAuto === true, noAuto ? 'OK' : 'ERROR', 'No auto-execute', {});

  if (taskP && taskP.actions && taskP.actions[0]) {
    var qa = taskP.actions[0];
    addCheck('QUICK_ACTION_CONTRACT', !!(qa.actionId && qa.executionMode), 'OK', 'Quick action DTO', qa);
  }

  addCheck('PLUGIN_READ_ONLY', typeof CBV_PluginRegistry_isEnabled === 'function', 'OK', 'Registry read-only API', {});

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P.' };

  var draft = {
    ok: runFin.ok,
    phase: CBV_RF05_PHASE_ID,
    status: runFin.status,
    checkedAt: new Date().toISOString(),
    runBy: (typeof cbvUser === 'function') ? cbvUser() : '',
    traceId: traceId,
    testSuite: 'CBV_RF05_Test_runPluginRuntimeHealth',
    summary: 'RF_05 Plugin Runtime: ' + runFin.status,
    checks: checks,
    warnings: (runFin.warnings || []).concat(externalWarnings),
    errors: runFin.errors || [],
    nextStep: runFin.nextStep || 'clasp push; run menu test',
    severity: runFin.severity || 'OK',
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false,
    reportText: '',
    reportJson: null
  };

  var reportText = 'PHASE_RF_05_PLUGIN_RUNTIME\ntraceId=' + traceId;
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
    detail: { keysOk: keysOk, mode: 'CBV_TCS_V1_RF05' }
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
  draft.summary = 'RF_05 Plugin Runtime: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nenvelopeOk=' + String(draft.envelopeOk);
  draft.reportJson = draft;

  CbvTcsRf05PluginRuntime_TestConsole__storeLatest_(draft);
  return draft;
}

function CbvTcsRf05PluginRuntime_TestConsole_copyLatestReport() {
  var rep = __CBV_TCS_RF05_TC_LAST_REPORT;
  if (!rep) {
    try {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_RF05_TC_LAST_PROP_KEY);
      if (raw) rep = JSON.parse(raw);
    } catch (e0) { /* */ }
  }
  if (!rep) return { ok: false, message: 'No RF_05 report yet.' };
  var json = JSON.stringify(rep, null, 2);
  var html = HtmlService.createHtmlOutput('<textarea style="width:100%;height:420px">' + json.replace(/</g, '&lt;') + '</textarea>').setWidth(640).setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, 'RF_05 Latest Test Report JSON');
  return { ok: true, message: 'Dialog opened.' };
}
