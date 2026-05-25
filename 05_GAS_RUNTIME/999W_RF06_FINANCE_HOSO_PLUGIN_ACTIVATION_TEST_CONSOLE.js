/**
 * PHASE_RF_06 — Finance + HO_SO Plugin Activation Test Console (CBV_TCS_V1)
 */

var __CBV_TCS_RF06_TC_LAST_REPORT = null;
var __CBV_TCS_RF06_TC_LAST_PROP_KEY = 'CBV_TCS_RF06_TC_LAST_REPORT_JSON';

function CbvTcsRf06FinanceHoSoPluginActivation_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_RF06_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_RF06_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CBV_RF06_Test_runFinanceHoSoPluginActivationHealth() {
  return CbvTcsRf06FinanceHoSoPluginActivation_TestConsole_runFull();
}

function CbvTcsRf06FinanceHoSoPluginActivation_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSRF06_')
    : ('WSRF06_' + new Date().getTime());
  var checks = [];
  var externalWarnings = [];

  function addCheck(code, ok, severity, message, detail) {
    var sev = ok ? (severity || 'OK') : (severity === 'WARNING' ? 'WARNING' : 'ERROR');
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
  }

  addCheck('RF05_REGISTRY', typeof CBV_PluginRegistry_list === 'function', 'OK', 'RF_05 registry', {});

  var finP = CBV_PluginRegistry_get('cbv-plugin-finance');
  var hsP = CBV_PluginRegistry_get('cbv-plugin-ho-so');
  var finStatusOk = finP && (finP.status === 'ACTIVE_READONLY' || finP.status === 'PARTIAL' || finP.status === 'STUB');
  var hsStatusOk = hsP && (hsP.status === 'ACTIVE_READONLY' || hsP.status === 'PARTIAL' || hsP.status === 'STUB');
  addCheck('FINANCE_DESCRIPTOR_STATUS', finStatusOk, finP && finP.status !== 'STUB' ? 'OK' : 'WARNING', 'FINANCE status', finP ? { status: finP.status } : {});
  addCheck('HO_SO_DESCRIPTOR_STATUS', hsStatusOk, hsP && hsP.status !== 'STUB' ? 'OK' : 'WARNING', 'HO_SO status', hsP ? { status: hsP.status } : {});

  var ctx = CBV_Permission_getCurrentUserContext();
  var finProj = typeof CBV_Rf06Finance_getProjection_ === 'function' ? CBV_Rf06Finance_getProjection_(ctx) : null;
  addCheck('FINANCE_PROJECTION_ENVELOPE', !!(finProj && finProj.ok === true && finProj.phase === CBV_RF06_PHASE_ID), finProj && finProj.ok ? 'OK' : 'ERROR', 'Finance projection', finProj || {});

  var hsProj = typeof CBV_Rf06HoSo_getProjection_ === 'function' ? CBV_Rf06HoSo_getProjection_(ctx) : null;
  addCheck('HO_SO_PROJECTION_ENVELOPE', !!(hsProj && hsProj.ok === true), hsProj && hsProj.ok ? 'OK' : 'ERROR', 'HO_SO projection', hsProj || {});

  var finSearch = typeof CBV_Rf06Finance_search_ === 'function' ? CBV_Rf06Finance_search_(ctx, 'FIN') : null;
  addCheck('FINANCE_SEARCH_ADAPTER', Array.isArray(finSearch), 'OK', 'Finance search DTO array', { count: finSearch ? finSearch.length : 0 });

  var hsSearch = typeof CBV_Rf06HoSo_search_ === 'function' ? CBV_Rf06HoSo_search_(ctx, 'HS') : null;
  addCheck('HO_SO_SEARCH_ADAPTER', Array.isArray(hsSearch), 'OK', 'HO_SO search DTO array', { count: hsSearch ? hsSearch.length : 0 });

  if (finSearch && finSearch[0]) {
    addCheck('SEARCH_DTO_SHAPE', !!(finSearch[0].id && finSearch[0].module && finSearch[0].href), 'OK', 'RF_02 search DTO', finSearch[0]);
  } else {
    addCheck('SEARCH_DTO_SHAPE', true, 'OK', 'Search empty (OK)', {});
  }

  var finAlerts = typeof CBV_Rf06Finance_getAlerts_ === 'function' ? CBV_Rf06Finance_getAlerts_(ctx) : null;
  var finNoAuto = !!(finAlerts && finAlerts.data && finAlerts.data.autoResolve === false && finAlerts.data.autoEscalate === false);
  addCheck('FINANCE_ALERTS_NO_AUTO', finNoAuto, finNoAuto ? 'OK' : 'ERROR', 'Finance alerts', finAlerts ? finAlerts.data : {});

  var hsAlerts = typeof CBV_Rf06HoSo_getAlerts_ === 'function' ? CBV_Rf06HoSo_getAlerts_(ctx) : null;
  var hsNoAuto = !!(hsAlerts && hsAlerts.data && hsAlerts.data.autoResolve === false && hsAlerts.data.autoEscalate === false);
  addCheck('HO_SO_ALERTS_NO_AUTO', hsNoAuto, hsNoAuto ? 'OK' : 'ERROR', 'HO_SO alerts', hsAlerts ? hsAlerts.data : {});

  var finTl = typeof CBV_Rf06Finance_getTimeline_ === 'function' ? CBV_Rf06Finance_getTimeline_(ctx, '') : null;
  addCheck('FINANCE_TIMELINE_SAFE', !!(finTl && finTl.ok === true), 'OK', 'Timeline empty-safe', finTl || {});

  var hsTl = typeof CBV_Rf06HoSo_getTimeline_ === 'function' ? CBV_Rf06HoSo_getTimeline_(ctx, '') : null;
  addCheck('HO_SO_TIMELINE_SAFE', !!(hsTl && hsTl.ok === true), 'OK', 'Timeline empty-safe', hsTl || {});

  if (finP && finP.actions) {
    var locked = finP.actions.every(function (a) { return a.autoExecute !== true; });
    addCheck('QUICK_ACTIONS_LOCKED', locked, locked ? 'OK' : 'ERROR', 'No auto-execute', {});
  }

  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_RF06_FINANCE_ITEMS', paths.indexOf('/workspace/plugins/finance/items') >= 0, 'OK', 'Finance items route', {});
    addCheck('ROUTE_RF06_HOSO_SEARCH', paths.indexOf('/workspace/plugins/ho-so/search') >= 0, 'OK', 'HO_SO search route', {});
    addCheck('REGRESSION_RF05_PLUGINS', paths.indexOf('/workspace/plugins') >= 0, 'OK', 'RF_05 preserved', {});
  } catch (eRg) {
    addCheck('ROUTE_RF06_FINANCE_ITEMS', false, 'ERROR', String(eRg), {});
  }

  addCheck('RENDERER_RF06', typeof CbvRf06_renderPageByType_ === 'function', 'OK', 'RF06 renderer', {});

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P.' };

  var draft = {
    ok: runFin.ok,
    phase: CBV_RF06_PHASE_ID,
    status: runFin.status,
    checkedAt: new Date().toISOString(),
    runBy: (typeof cbvUser === 'function') ? cbvUser() : '',
    traceId: traceId,
    testSuite: 'CBV_RF06_Test_runFinanceHoSoPluginActivationHealth',
    summary: 'RF_06 Finance/HO_SO Activation: ' + runFin.status,
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

  var reportText = 'PHASE_RF_06_FINANCE_HOSO_PLUGIN_ACTIVATION\ntraceId=' + traceId;
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
    detail: { keysOk: keysOk, mode: 'CBV_TCS_V1_RF06' }
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
  draft.summary = 'RF_06 Finance/HO_SO Activation: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nenvelopeOk=' + String(draft.envelopeOk);
  draft.reportJson = draft;

  CbvTcsRf06FinanceHoSoPluginActivation_TestConsole__storeLatest_(draft);
  return draft;
}

function CbvTcsRf06FinanceHoSoPluginActivation_TestConsole_copyLatestReport() {
  var rep = __CBV_TCS_RF06_TC_LAST_REPORT;
  if (!rep) {
    try {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_RF06_TC_LAST_PROP_KEY);
      if (raw) rep = JSON.parse(raw);
    } catch (e0) { /* */ }
  }
  if (!rep) return { ok: false, message: 'No RF_06 report yet.' };
  var json = JSON.stringify(rep, null, 2);
  var html = HtmlService.createHtmlOutput('<textarea style="width:100%;height:420px">' + json.replace(/</g, '&lt;') + '</textarea>').setWidth(640).setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, 'RF_06 Latest Test Report JSON');
  return { ok: true, message: 'Dialog opened.' };
}
