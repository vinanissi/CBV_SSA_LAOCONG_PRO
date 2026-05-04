/**
 * HO_SO V2 — module WebApp (self-register, connection cache, auto sync, health).
 * Dependencies: 180 (HOSO_Config_*), print worker optional.
 */

var HOSO_PACKAGE_STALE_MS_ = 6 * 60 * 60 * 1000;

/**
 * @param {boolean} ok
 * @param {string} code
 * @param {string} message
 * @param {Object} data
 * @param {Object|null} error
 * @returns {Object}
 */
function HOSO_stdResponse_(ok, code, message, data, error) {
  return {
    ok: !!ok,
    code: code || (ok ? 'OK' : 'ERROR'),
    message: message != null ? String(message) : '',
    data: data == null ? {} : data,
    error: error == null ? null : error
  };
}

/**
 * @param {*} obj
 * @returns {string}
 */
function HOSO_json_(obj) {
  if (typeof cbvCoreV2SafeStringify_ === 'function') {
    return cbvCoreV2SafeStringify_(obj);
  }
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return '{"ok":false}';
  }
}

/**
 * @returns {string}
 */
function HOSO_now_() {
  if (typeof cbvCoreV2IsoNow_ === 'function') {
    return cbvCoreV2IsoNow_();
  }
  return new Date().toISOString();
}

/**
 * @param {string} token
 * @returns {{ ok: boolean, failResponse?: Object }}
 */
function HOSO_assertWebAppToken_(token) {
  var expected = '';
  try {
    expected = String(PropertiesService.getScriptProperties().getProperty('CBV_HOSO_WEBAPP_TOKEN') || '').trim();
  } catch (e) {
    expected = '';
  }
  if (!expected) {
    return {
      ok: false,
      failResponse: HOSO_stdResponse_(false, 'UNAUTHORIZED', 'HO_SO WebApp token not configured', {}, { code: 'UNAUTHORIZED', message: 'CBV_HOSO_WEBAPP_TOKEN missing', stack: '' })
    };
  }
  if (String(token || '').trim() !== expected) {
    return {
      ok: false,
      failResponse: HOSO_stdResponse_(false, 'UNAUTHORIZED', 'Invalid or missing token', {}, { code: 'UNAUTHORIZED', message: 'Token mismatch', stack: '' })
    };
  }
  return { ok: true };
}

/**
 * @param {Object} payload
 * @returns {Object}
 */
function HOSO_callMainControl_(payload) {
  var url = '';
  try {
    url = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_CONTROL_WEBAPP_URL') || '').trim();
  } catch (e0) {
    url = '';
  }
  if (!url) {
    return HOSO_stdResponse_(false, 'MAIN_URL_MISSING', 'CBV_MAIN_CONTROL_WEBAPP_URL not set', {}, { code: 'MAIN_URL_MISSING', message: 'Set main WebApp URL', stack: '' });
  }
  try {
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: HOSO_json_(payload || {})
    });
    var txt = res.getContentText() || '{}';
    var parsed = JSON.parse(txt);
    return parsed;
  } catch (e2) {
    return HOSO_stdResponse_(false, 'MAIN_CALL_FAILED', String(e2 && e2.message ? e2.message : e2), {}, { code: 'MAIN_CALL_FAILED', message: String(e2 && e2.message ? e2.message : e2), stack: String(e2 && e2.stack ? e2.stack : '') });
  }
}

/**
 * @param {string} eventType
 * @param {Object} [payload]
 */
function HOSO_emitConnectionEventToMain_try_(eventType, payload) {
  try {
    var tok = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim();
    if (!tok) return;
    HOSO_callMainControl_({
      action: 'INGEST_EVENT',
      token: tok,
      eventType: String(eventType || '').trim(),
      moduleCode: 'HO_SO_V2',
      entityType: 'CONNECTION',
      entityId: 'HO_SO_V2',
      payload: payload || {},
      createdBy: 'HO_SO_WEBAPP'
    });
  } catch (e) {
    /* swallow */
  }
}

/**
 * @param {Object} event
 * @returns {Object}
 */
function HOSO_emitMainEvent_(event) {
  var ev = event || {};
  var tok = '';
  try {
    tok = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim();
  } catch (e) {
    tok = '';
  }
  if (!tok) {
    return HOSO_stdResponse_(false, 'MAIN_TOKEN_MISSING', 'CBV_MAIN_WEBAPP_TOKEN not set', {}, { code: 'MAIN_TOKEN_MISSING', message: '', stack: '' });
  }
  var body = {
    action: 'INGEST_EVENT',
    token: tok,
    eventType: ev.eventType || ev.EVENT_TYPE || 'HOSO_EVENT',
    moduleCode: ev.moduleCode || ev.MODULE_CODE || 'HO_SO_V2',
    entityType: ev.entityType || ev.ENTITY_TYPE || 'HO_SO',
    entityId: String(ev.entityId || ev.ENTITY_ID || 'HOSO_' + Utilities.getUuid().slice(0, 8)),
    sourceCommandId: String(ev.sourceCommandId || ev.SOURCE_COMMAND_ID || ''),
    payload: ev.payload != null ? ev.payload : ev,
    createdBy: String(ev.createdBy || ev.CREATED_BY || 'HO_SO_WEBAPP')
  };
  return HOSO_callMainControl_(body);
}

/**
 * @param {Object} mainPkgResponse
 * @returns {string}
 */
function HOSO_extractModuleDbIdFromMainPackage_(mainPkgResponse) {
  var o = mainPkgResponse;
  if (!o || !o.data || !o.data.package) return '';
  var id = o.data.package.moduleDbId;
  return id != null ? String(id).trim() : '';
}

/**
 * @param {string} updatedAtIso
 * @returns {boolean}
 */
function HOSO_isConnectionCacheStale_(updatedAtIso) {
  var s = String(updatedAtIso || '').trim();
  if (!s) return true;
  try {
    var t = new Date(s).getTime();
    if (isNaN(t)) return true;
    return Date.now() - t > HOSO_PACKAGE_STALE_MS_;
  } catch (e) {
    return true;
  }
}

/**
 * Self-register bound spreadsheet as MAIN_CONTROL module DB (WebApp / menu; no throw).
 * @returns {Object}
 */
function HOSO_registerModule_() {
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e0) {
    ss = null;
  }
  var id = '';
  if (ss) {
    try {
      id = String(ss.getId() || '').trim();
    } catch (eId) {
      id = '';
    }
  }
  if (!id) {
    try {
      id = String(PropertiesService.getScriptProperties().getProperty('CBV_HOSO_BOUND_SPREADSHEET_ID') || '').trim();
    } catch (eB) {
      id = '';
    }
  }
  if (!id) {
    return HOSO_stdResponse_(false, 'NO_ACTIVE_SPREADSHEET', 'No active spreadsheet; set CBV_HOSO_BOUND_SPREADSHEET_ID or open HOSO DB', {}, { code: 'NO_ACTIVE_SPREADSHEET', message: '', stack: '' });
  }
  var tok = '';
  try {
    tok = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim();
  } catch (e2) {
    tok = '';
  }
  if (!tok) {
    return HOSO_stdResponse_(false, 'MAIN_TOKEN_MISSING', 'Set CBV_MAIN_WEBAPP_TOKEN first', {}, { code: 'MAIN_TOKEN_MISSING', message: '', stack: '' });
  }
  return HOSO_callMainControl_({
    action: 'REGISTER_MODULE',
    moduleCode: 'HO_SO_V2',
    moduleDbId: id,
    token: tok
  });
}

/**
 * @returns {void}
 */
function HOSO_registerModule_trySilent_() {
  try {
    var r = HOSO_registerModule_();
    if (!r || !r.ok) {
      Logger.log('[HOSO_registerModule_] ' + HOSO_json_(r || {}));
    }
  } catch (e) {
    Logger.log('[HOSO_registerModule_] ' + String(e && e.message ? e.message : e));
  }
}

/**
 * @returns {Object}
 */
function HOSO_refreshConnectionPackage_() {
  HOSO_registerModule_trySilent_();

  var tok = '';
  try {
    tok = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim();
  } catch (e) {
    tok = '';
  }
  if (!tok) {
    return HOSO_stdResponse_(false, 'MAIN_TOKEN_MISSING', 'Set CBV_MAIN_WEBAPP_TOKEN first', {}, { code: 'MAIN_TOKEN_MISSING', message: '', stack: '' });
  }

  function fetchPkg() {
    return HOSO_callMainControl_({
      action: 'GET_CONNECTION_PACKAGE',
      moduleCode: 'HO_SO_V2',
      token: tok
    });
  }

  var out = fetchPkg();
  var mid = HOSO_extractModuleDbIdFromMainPackage_(out);
  var retried = false;
  if (!mid && out && out.ok) {
    Utilities.sleep(500);
    out = fetchPkg();
    mid = HOSO_extractModuleDbIdFromMainPackage_(out);
    retried = true;
  }

  if (out && out.ok) {
    try {
      PropertiesService.getScriptProperties().setProperty('CBV_HOSO_CONNECTION_PACKAGE_JSON', HOSO_json_(out));
      PropertiesService.getScriptProperties().setProperty('CBV_HOSO_CONNECTION_PACKAGE_UPDATED_AT', HOSO_now_());
    } catch (e2) {
      /* ignore */
    }
    HOSO_emitConnectionEventToMain_try_('CONNECTION_REFRESHED', { moduleDbId: mid, retried: retried });
  } else {
    HOSO_emitConnectionEventToMain_try_('CONNECTION_FAILED', { result: out });
  }

  return out && typeof out === 'object' ? out : HOSO_stdResponse_(false, 'REFRESH_UNEXPECTED', 'Invalid main response', {}, null);
}

/**
 * Auto refresh cache when needed (single pass, no loop).
 * @returns {{ didRefresh: boolean, wasStale: boolean, reason: string, refreshResult: Object|null }}
 */
function HOSO_autoSyncConnection_() {
  var out = {
    didRefresh: false,
    wasStale: false,
    reason: '',
    refreshResult: null
  };

  var raw = '';
  try {
    raw = String(PropertiesService.getScriptProperties().getProperty('CBV_HOSO_CONNECTION_PACKAGE_JSON') || '').trim();
  } catch (e0) {
    raw = '';
  }

  var updatedAtStr = '';
  try {
    updatedAtStr = String(PropertiesService.getScriptProperties().getProperty('CBV_HOSO_CONNECTION_PACKAGE_UPDATED_AT') || '').trim();
  } catch (e1) {
    updatedAtStr = '';
  }

  var stale = HOSO_isConnectionCacheStale_(updatedAtStr);
  var mid = '';
  if (typeof HOSO_Config_getModuleDbIdFromCachedPackage_ === 'function') {
    mid = String(HOSO_Config_getModuleDbIdFromCachedPackage_() || '').trim();
  }

  var need = false;
  if (!raw) {
    need = true;
    out.reason = 'NO_PACKAGE';
  }
  if (stale) {
    need = true;
    out.wasStale = true;
    out.reason = out.reason || 'STALE';
  }
  if (!mid) {
    need = true;
    out.reason = out.reason || 'EMPTY_MODULE_DB';
  }

  if (need) {
    out.refreshResult = HOSO_refreshConnectionPackage_();
    out.didRefresh = true;
  }

  return out;
}

/**
 * @returns {Object}
 */
function HOSO_getConnectionPackage_() {
  var raw = '';
  try {
    raw = String(PropertiesService.getScriptProperties().getProperty('CBV_HOSO_CONNECTION_PACKAGE_JSON') || '').trim();
  } catch (e) {
    raw = '';
  }
  if (!raw) {
    return HOSO_stdResponse_(false, 'NO_LOCAL_PACKAGE', 'Run refresh first', {}, { code: 'NO_LOCAL_PACKAGE', message: '', stack: '' });
  }
  try {
    return JSON.parse(raw);
  } catch (e2) {
    return HOSO_stdResponse_(false, 'PACKAGE_JSON_INVALID', String(e2 && e2.message ? e2.message : e2), {}, { code: 'PACKAGE_JSON_INVALID', message: String(e2 && e2.message ? e2.message : e2), stack: '' });
  }
}

/**
 * @returns {string}
 */
function HOSO_getDbId_() {
  if (typeof HOSO_Config_getModuleDbIdFromCachedPackage_ === 'function') {
    var a = String(HOSO_Config_getModuleDbIdFromCachedPackage_() || '').trim();
    if (a) return a;
  }
  var p = '';
  try {
    p = String(PropertiesService.getScriptProperties().getProperty('CBV_HOSO_V2_DB_ID') || '').trim();
  } catch (e) {
    p = '';
  }
  if (p) return p;
  throw new Error('HOSO_CONFIG_DB_ID_MISSING');
}

/**
 * @returns {Object}
 */
function HOSO_WebApp_healthData_() {
  var props = PropertiesService.getScriptProperties();
  var hasLocalToken = !!String(props.getProperty('CBV_HOSO_WEBAPP_TOKEN') || '').trim();
  var hasMainUrl = !!String(props.getProperty('CBV_MAIN_CONTROL_WEBAPP_URL') || '').trim();
  var hasMainToken = !!String(props.getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim();
  var raw = String(props.getProperty('CBV_HOSO_CONNECTION_PACKAGE_JSON') || '').trim();
  var hasConnectionPackage = !!raw;
  var moduleDbId = '';
  var packageIssuedAt = '';
  try {
    if (typeof HOSO_Config_getModuleDbIdFromCachedPackage_ === 'function') {
      moduleDbId = String(HOSO_Config_getModuleDbIdFromCachedPackage_() || '').trim();
    }
    var o = raw ? JSON.parse(raw) : null;
    if (o && o.data && o.data.issuedAt) packageIssuedAt = String(o.data.issuedAt);
    else if (o && o.issuedAt) packageIssuedAt = String(o.issuedAt);
  } catch (e) {
    /* ignore */
  }
  return {
    hasLocalToken: hasLocalToken,
    hasMainUrl: hasMainUrl,
    hasMainToken: hasMainToken,
    hasConnectionPackage: hasConnectionPackage,
    moduleDbId: moduleDbId,
    packageIssuedAt: packageIssuedAt
  };
}

/**
 * @param {{ didRefresh?: boolean, wasStale?: boolean }} syncInfo
 * @returns {Object}
 */
function HOSO_WebApp_healthResponse_(syncInfo) {
  syncInfo = syncInfo || {};
  var d = HOSO_WebApp_healthData_();
  var mid = String(d.moduleDbId || '').trim();
  if (!mid) {
    return HOSO_stdResponse_(false, 'HOSO_MODULE_NOT_REGISTERED', 'Module not registered to MAIN_CONTROL', d, {
      code: 'HOSO_MODULE_NOT_REGISTERED',
      message: 'No moduleDbId in package',
      stack: ''
    });
  }
  var schemaH = { ok: true, message: '', data: {} };
  if (typeof HOSO_SchemaV2_healthCheck === 'function') {
    schemaH = HOSO_SchemaV2_healthCheck();
  }
  d.schema = schemaH.data || {};
  if (!schemaH.ok) {
    return HOSO_stdResponse_(false, 'HOSO_V2_WEBAPP_HEALTH_SCHEMA_DEGRADED', schemaH.message || 'Schema incomplete', d, {
      code: 'HOSO_V2_WEBAPP_HEALTH_SCHEMA_DEGRADED',
      message: schemaH.message || '',
      stack: ''
    });
  }
  if (syncInfo.wasStale && syncInfo.didRefresh) {
    return HOSO_stdResponse_(true, 'HOSO_PACKAGE_STALE', 'Package outdated, auto refresh triggered', d, null);
  }
  return HOSO_stdResponse_(true, 'HOSO_V2_WEBAPP_HEALTH_OK', 'OK', d, null);
}

/**
 * @param {Object} body
 * @returns {Object}
 */
function HOSO_WebApp_routeAppSheet_(body) {
  var b = body || {};
  var cmd = String(b.command || b.action || '').trim().toUpperCase();
  if (cmd === 'PRINT_WORKER_RUN_PENDING') {
    if (typeof HOSO_SchemaV2_ensurePrintJobSheet === 'function') {
      HOSO_SchemaV2_ensurePrintJobSheet();
    }
    if (typeof HosoPrintWorker_runPending === 'function') {
      var r = HosoPrintWorker_runPending();
      return HOSO_stdResponse_(true, 'PRINT_WORKER_OK', 'OK', { result: r }, null);
    }
    if (typeof HOSO_PrintWorker_runPending === 'function') {
      var r2 = HOSO_PrintWorker_runPending();
      return HOSO_stdResponse_(true, 'PRINT_WORKER_OK', 'OK', { result: r2 }, null);
    }
    return HOSO_stdResponse_(false, 'HANDLER_NOT_FOUND', 'HosoPrintWorker_runPending not loaded', {}, { code: 'HANDLER_NOT_FOUND', message: 'Print worker not available', stack: '' });
  }
  if (cmd === 'HEALTH_CHECK') {
    var syncH = HOSO_autoSyncConnection_();
    return HOSO_WebApp_healthResponse_(syncH);
  }
  return HOSO_stdResponse_(false, 'UNKNOWN_HOSO_ACTION', 'Unknown AppSheet command', { command: cmd }, { code: 'UNKNOWN_HOSO_ACTION', message: cmd, stack: '' });
}

/**
 * @param {Object} e
 * @returns {Object}
 */
function HOSO_WebApp_doGet_(e) {
  var params = (e && e.parameter) || {};
  var auth = HOSO_assertWebAppToken_(params.token || '');
  if (!auth.ok) return auth.failResponse;

  var syncInfo = HOSO_autoSyncConnection_();

  var action = String(params.action || '').trim().toLowerCase();
  if (action === 'ping') {
    return HOSO_stdResponse_(true, 'HOSO_V2_PING', 'pong', { t: HOSO_now_(), sync: syncInfo }, null);
  }
  if (action === 'health') {
    return HOSO_WebApp_healthResponse_(syncInfo);
  }
  if (action === 'refreshconnection') {
    return HOSO_refreshConnectionPackage_();
  }
  if (action === 'getlocalconnection') {
    return HOSO_getConnectionPackage_();
  }
  return HOSO_stdResponse_(false, 'UNKNOWN_ACTION', 'Unknown GET action', { action: params.action || '' }, { code: 'UNKNOWN_ACTION', message: String(params.action || ''), stack: '' });
}

/**
 * @param {Object} e
 * @returns {Object}
 */
function HOSO_WebApp_doPost_(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (parseErr) {
    return HOSO_stdResponse_(false, 'INVALID_JSON', 'Body must be JSON', {}, { code: 'INVALID_JSON', message: String(parseErr && parseErr.message ? parseErr.message : parseErr), stack: '' });
  }

  var token = body.token || '';
  try {
    if (!token && e && e.parameter && e.parameter.token) token = e.parameter.token;
  } catch (eT) {
    /* ignore */
  }

  var auth = HOSO_assertWebAppToken_(token);
  if (!auth.ok) return auth.failResponse;

  var syncInfo = HOSO_autoSyncConnection_();

  var action = String(body.action || '').trim().toUpperCase();

  if (action === 'HEALTH_CHECK') {
    return HOSO_WebApp_healthResponse_(syncInfo);
  }
  if (action === 'REFRESH_CONNECTION') {
    return HOSO_refreshConnectionPackage_();
  }
  if (action === 'FORCE_SYNC') {
    return HOSO_refreshConnectionPackage_();
  }
  if (action === 'ENSURE_SCHEMA') {
    if (typeof HOSO_SchemaV2_ensureAll === 'function') {
      return HOSO_SchemaV2_ensureAll();
    }
    return HOSO_stdResponse_(false, 'HANDLER_NOT_FOUND', 'HOSO_SchemaV2_ensureAll not loaded', {}, { code: 'HANDLER_NOT_FOUND', message: '', stack: '' });
  }
  if (action === 'SCHEMA_HEALTH') {
    if (typeof HOSO_SchemaV2_healthCheck === 'function') {
      return HOSO_SchemaV2_healthCheck();
    }
    return HOSO_stdResponse_(false, 'HANDLER_NOT_FOUND', 'HOSO_SchemaV2_healthCheck not loaded', {}, { code: 'HANDLER_NOT_FOUND', message: '', stack: '' });
  }
  if (action === 'APPSHEET_WEBHOOK') {
    return HOSO_WebApp_routeAppSheet_(body);
  }
  if (action === 'PRINT_WORKER_RUN_PENDING') {
    return HOSO_WebApp_routeAppSheet_({ command: 'PRINT_WORKER_RUN_PENDING', payload: body.payload });
  }
  if (action === 'HOSO_EVENT') {
    return HOSO_emitMainEvent_(body.event || body);
  }

  return HOSO_stdResponse_(false, 'UNKNOWN_ACTION', 'Unknown POST action', { action: action }, { code: 'UNKNOWN_ACTION', message: action, stack: '' });
}

/**
 * @param {Object} obj
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function HOSO_webAppServe_(obj) {
  return ContentService.createTextOutput(HOSO_json_(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    return HOSO_webAppServe_(HOSO_WebApp_doGet_(e || {}));
  } catch (err) {
    return HOSO_webAppServe_(
      HOSO_stdResponse_(false, 'WEBAPP_ERROR', String(err && err.message ? err.message : err), {}, { code: 'WEBAPP_ERROR', message: String(err && err.message ? err.message : err), stack: String(err && err.stack ? err.stack : '') })
    );
  }
}

function doPost(e) {
  try {
    return HOSO_webAppServe_(HOSO_WebApp_doPost_(e || {}));
  } catch (err2) {
    return HOSO_webAppServe_(
      HOSO_stdResponse_(false, 'WEBAPP_ERROR', String(err2 && err2.message ? err2.message : err2), {}, { code: 'WEBAPP_ERROR', message: String(err2 && err2.message ? err2.message : err2), stack: String(err2 && err2.stack ? err2.stack : '') })
    );
  }
}
