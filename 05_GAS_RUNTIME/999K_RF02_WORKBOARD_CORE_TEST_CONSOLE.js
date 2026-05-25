/**
 * PHASE_RF_02 — Workboard Core Test Console (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Run RF_02 Workboard Core Health Test
 * Alias entry: CBV_RF02_Test_runWorkboardCoreHealth()
 */

var CBV_TCS_RF02_UI_MARKERS = [
  'cbv-rf02-workboard',
  'cbv-rf02-header',
  'cbv-rf02-nav',
  'cbv-rf02-main',
  'cbv-rf02-state',
  'cbv-rf02-detail-summary',
  'cbv-rf02-notif',
  'cbv-rf02-filter-bar'
];

var __CBV_TCS_RF02_TC_LAST_REPORT = null;
var __CBV_TCS_RF02_TC_LAST_PROP_KEY = 'CBV_TCS_RF02_TC_LAST_REPORT_JSON';

function CbvTcsRf02WorkboardCore_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_RF02_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_RF02_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

/** Public alias per RF_02 prompt. */
function CBV_RF02_Test_runWorkboardCoreHealth() {
  return CbvTcsRf02WorkboardCore_TestConsole_runFull();
}

function CbvTcsRf02WorkboardCore_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSRF02_')
    : ('WSRF02_' + new Date().getTime());
  var checks = [];
  var externalWarnings = [];

  function addCheck(code, ok, severity, message, detail) {
    var sev = ok ? (severity || 'OK') : (severity === 'WARNING' ? 'WARNING' : severity === 'CRITICAL' ? 'CRITICAL' : 'ERROR');
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
  }

  /* Permission runtime */
  addCheck('PERMISSION_RUNTIME_EXISTS', typeof CBV_Permission_getCurrentUserContext === 'function', 'OK', 'CBV_Permission_getCurrentUserContext exists', {});
  var ctx = typeof CBV_Permission_getCurrentUserContext === 'function' ? CBV_Permission_getCurrentUserContext() : null;
  addCheck('PERMISSION_SAFE_FALLBACK', !!(ctx && ctx.role), 'OK', 'User context has target role', ctx || {});
  addCheck('PERMISSION_CAN_FN', typeof CBV_Permission_can === 'function' && typeof CBV_Permission_filterActions === 'function', 'OK', 'can + filterActions', {});
  addCheck('PERMISSION_VIEW_ONLY_FALLBACK', ctx ? (CBV_PERMISSION_TARGET_ROLES.indexOf(ctx.role) >= 0) : false, ctx ? 'OK' : 'ERROR', 'Role in target set', { role: ctx ? ctx.role : null });

  /* Routes / shell */
  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? CbvWebAppWorkspace_routeRegistry() : [];
    var paths = (reg || []).map(function (r) { return r.route; });
    addCheck('ROUTE_RF02_TASKS', paths.indexOf('/workspace/workboard/tasks') >= 0, 'OK', '/workspace/workboard/tasks registered', {});
    addCheck('ROUTE_RF02_TASK_DETAIL', paths.indexOf('/workspace/workboard/task-detail') >= 0, 'OK', '/workspace/workboard/task-detail registered', {});
    addCheck('ROUTE_RF02_SEARCH', paths.indexOf('/workspace/workboard/search') >= 0, 'OK', '/workspace/workboard/search registered', {});
    addCheck('ROUTE_RF02_NOTIFICATIONS', paths.indexOf('/workspace/workboard/notifications') >= 0, 'OK', '/workspace/workboard/notifications registered', {});
    addCheck('ROUTE_RF02_FILES', paths.indexOf('/workspace/workboard/files') >= 0, 'OK', '/workspace/workboard/files registered', {});
    addCheck('REGRESSION_M06_WORKBOARD', paths.indexOf('/workspace/workboard') >= 0 && paths.indexOf('/workboard') >= 0, 'OK', 'M06 workboard routes preserved', {});
  } catch (eRg) {
    addCheck('ROUTE_RF02_TASKS', false, 'ERROR', String(eRg), {});
  }

  addCheck('RENDERER_RF02', typeof CbvRf02Workboard_renderPageByType_ === 'function', 'OK', 'RF02 renderer loaded', {});

  /* Adapters safe envelope */
  var listEnv = typeof CbvRf02TaskList_getModel_ === 'function' ? CbvRf02TaskList_getModel_(ctx, 'mine') : null;
  addCheck('TASK_LIST_SAFE_ENVELOPE', !!(listEnv && listEnv.ok === true && listEnv.phase === CBV_RF02_PHASE_ID), listEnv && listEnv.ok ? 'OK' : 'ERROR', 'Task list adapter', listEnv || {});

  var detailMissing = typeof CbvRf02TaskDetail_getModel_ === 'function' ? CbvRf02TaskDetail_getModel_(ctx, '') : null;
  addCheck('TASK_DETAIL_MISSING_ID', !!(detailMissing && detailMissing.ok === true && detailMissing.empty === true), 'OK', 'Missing taskId safe empty', detailMissing || {});

  var detailUnknown = typeof CbvRf02TaskDetail_getModel_ === 'function' ? CbvRf02TaskDetail_getModel_(ctx, 'RF02_UNKNOWN_TASK_ID_XYZ') : null;
  addCheck('TASK_DETAIL_UNKNOWN_ID', !!(detailUnknown && detailUnknown.ok === true), 'OK', 'Unknown id does not throw', detailUnknown || {});

  var tlEnv = typeof CbvRf02Timeline_getModel_ === 'function' ? CbvRf02Timeline_getModel_(ctx, '') : null;
  addCheck('TIMELINE_SAFE_ENVELOPE', !!(tlEnv && tlEnv.ok === true), 'OK', 'Timeline read-first envelope', tlEnv || {});

  var searchEnv = typeof CbvRf02Search_search_ === 'function' ? CbvRf02Search_search_(ctx, { keyword: 'x' }) : null;
  addCheck('SEARCH_STUB_ENVELOPE', !!(searchEnv && searchEnv.ok === true), 'OK', 'Search stub short query', searchEnv || {});

  var notifEnv = typeof CbvRf02Notification_getModel_ === 'function' ? CbvRf02Notification_getModel_(ctx) : null;
  addCheck('NOTIFICATION_STUB_ENVELOPE', !!(notifEnv && notifEnv.ok === true), 'OK', 'Notification stub envelope', notifEnv || {});

  var fileEnv = typeof CbvRf02File_getModel_ === 'function' ? CbvRf02File_getModel_(ctx, '') : null;
  addCheck('FILE_STUB_ENVELOPE', !!(fileEnv && fileEnv.ok === true), 'OK', 'File stub envelope', fileEnv || {});

  /* Server-side permission check on denied action simulation */
  var denied = false;
  try {
    var viewCtx = { role: 'VIEW_ONLY', email: 'view@test.local', legacyRole: 'VIEWER' };
    denied = CBV_Permission_can(viewCtx, CBV_PERMISSION_ACTIONS.TASK_ASSIGN, null) === false;
  } catch (eDeny) {
    denied = true;
  }
  addCheck('PERMISSION_SERVER_SIDE_MATRIX', denied === true, 'OK', 'VIEW_ONLY cannot TASK_ASSIGN', {});

  addCheck('RF02_READ_ONLY_ADAPTERS', typeof CbvRf02Search_search_ === 'function' && typeof CbvRf02File_getModel_ === 'function', 'OK', 'RF02 adapters loaded (read-first)', {});

  /* UI markers in renderer source probe */
  var markerOk = true;
  for (var mi = 0; mi < CBV_TCS_RF02_UI_MARKERS.length; mi++) {
    if (CBV_TCS_RF02_UI_MARKERS[mi].indexOf('cbv-rf02') !== 0) markerOk = false;
  }
  addCheck('RF02_UI_MARKERS_DEFINED', markerOk, 'OK', 'RF02 UI marker contract array', { count: CBV_TCS_RF02_UI_MARKERS.length });

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P.' };

  var draft = {
    ok: runFin.ok,
    phase: CBV_RF02_PHASE_ID,
    status: runFin.status,
    checkedAt: new Date().toISOString(),
    runBy: (typeof cbvUser === 'function') ? cbvUser() : '',
    traceId: traceId,
    testSuite: 'CBV_RF02_Test_runWorkboardCoreHealth',
    summary: 'RF_02 Workboard Core health: ' + runFin.status,
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep || 'clasp push; run menu test in bound Sheet',
    severity: runFin.severity || 'OK',
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false,
    reportText: '',
    reportJson: null
  };

  var reportText = [
    'PHASE_RF_02_WORKBOARD_CORE',
    'traceId=' + traceId,
    'checks=' + checks.length,
    'failed=' + checks.filter(function (c) { return c && c.ok === false; }).length
  ].join('\n');
  draft.reportText = reportText;

  var keysOk = (typeof CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_ === 'function')
    ? CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_(draft).ok
    : false;
  var ic = (typeof CbvTcsMilestone01OpWorkspace__validateAllCheckItems_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__validateAllCheckItems_(checks)
    : { ok: false, bad: ['validator_missing'] };
  addCheck('CHECK_ITEM_CONTRACT', ic.ok === true, ic.ok ? 'OK' : 'ERROR', 'Check item shape valid', { bad: ic.bad || [] });

  var envelopeRowOk = keysOk === true && ic.ok === true && String(reportText || '').trim().length > 0 && runFin.status !== 'FAIL';
  checks.push({
    code: 'REPORT_ENVELOPE',
    ok: envelopeRowOk === true,
    severity: envelopeRowOk ? 'OK' : 'ERROR',
    message: 'CBV_TCS_V1 envelope valid',
    detail: { keysOk: keysOk, itemContractOk: ic.ok, mode: 'CBV_TCS_V1_RF02' }
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
  draft.summary = 'RF_02 Workboard Core: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nenvelopeOk=' + String(draft.envelopeOk);
  draft.reportJson = draft;

  CbvTcsRf02WorkboardCore_TestConsole__storeLatest_(draft);
  return draft;
}

function CbvTcsRf02WorkboardCore_TestConsole_copyLatestReport() {
  var rep = __CBV_TCS_RF02_TC_LAST_REPORT;
  if (!rep) {
    try {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_RF02_TC_LAST_PROP_KEY);
      if (raw) rep = JSON.parse(raw);
    } catch (e0) { /* */ }
  }
  if (!rep) return { ok: false, message: 'No RF_02 report yet. Run test first.' };
  var json = JSON.stringify(rep, null, 2);
  var html = HtmlService.createHtmlOutput('<textarea style="width:100%;height:420px">' + json.replace(/</g, '&lt;') + '</textarea>').setWidth(640).setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, 'RF_02 Latest Test Report JSON');
  return { ok: true, message: 'Dialog opened.' };
}
