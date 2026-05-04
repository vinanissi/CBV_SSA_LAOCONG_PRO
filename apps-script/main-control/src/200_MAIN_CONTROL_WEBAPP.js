/**
 * MAIN_CONTROL — central WebApp (connection package, health, event ingest).
 * Dependencies: 03 (core DB id), 21 (command log helpers optional), 30 (emitEvent), 70 (registry sheet), 150 (config props).
 */

/**
 * @param {boolean} ok
 * @param {string} code
 * @param {string} message
 * @param {Object} data
 * @param {Object|null} error
 * @returns {Object}
 */
function MC_stdResponse_(ok, code, message, data, error) {
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
function MC_json_(obj) {
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
function MC_now_() {
  if (typeof cbvCoreV2IsoNow_ === 'function') {
    return cbvCoreV2IsoNow_();
  }
  try {
    return new Date().toISOString();
  } catch (e2) {
    return String(new Date());
  }
}

/**
 * @param {string} prefix
 * @returns {string}
 */
function MC_uuid_(prefix) {
  var p = prefix || 'MC';
  return p + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
}

/**
 * @param {string} token
 * @returns {{ ok: boolean, failResponse?: Object }}
 */
function MC_assertWebAppToken_(token) {
  var expected = '';
  try {
    expected = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim();
  } catch (e) {
    expected = '';
  }
  if (!expected) {
    return {
      ok: false,
      failResponse: MC_stdResponse_(false, 'UNAUTHORIZED', 'Server token not configured', {}, { code: 'UNAUTHORIZED', message: 'CBV_MAIN_WEBAPP_TOKEN missing', stack: '' })
    };
  }
  var got = String(token || '').trim();
  if (got !== expected) {
    return {
      ok: false,
      failResponse: MC_stdResponse_(false, 'UNAUTHORIZED', 'Invalid or missing token', {}, { code: 'UNAUTHORIZED', message: 'Token mismatch', stack: '' })
    };
  }
  return { ok: true };
}

/**
 * @param {string} moduleCode
 * @returns {string}
 */
function MC_lookupModuleDbIdFromRegistry_(moduleCode) {
  try {
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.MODULE_REGISTRY);
    if (!sheet || sheet.getLastRow() < 2) return '';
    var map = cbvCoreV2ReadHeaderMap_(sheet);
    var cCode = map['MODULE_CODE'];
    var cDb = map['MODULE_DB_ID'];
    if (!cCode || !cDb) return '';
    var cSt = map['STATUS'];
    var want = String(moduleCode || '').trim().toUpperCase();
    var last = sheet.getLastRow();
    var r;
    for (r = 2; r <= last; r++) {
      var code = String(sheet.getRange(r, cCode).getValue() || '').trim().toUpperCase();
      if (code !== want) continue;
      if (cSt) {
        var st = String(sheet.getRange(r, cSt).getValue() || '').trim().toUpperCase();
        if (st && st !== 'ACTIVE') continue;
      }
      return String(sheet.getRange(r, cDb).getValue() || '').trim();
    }
  } catch (e) {
    return '';
  }
  return '';
}

/**
 * ScriptProperties keys: CBV_<MODULE>_DB_ID variants (e.g. HO_SO_V2 → CBV_HO_SO_V2_DB_ID, CBV_HOSO_V2_DB_ID).
 * @param {string} moduleCode
 * @returns {string}
 */
function MC_lookupModuleDbIdFromScriptProps_(moduleCode) {
  var mod = String(moduleCode || '').trim().toUpperCase();
  var candidates = [];
  var sanitized = mod.replace(/[^A-Z0-9]/g, '_');
  candidates.push('CBV_' + sanitized + '_DB_ID');
  if (mod === 'HO_SO_V2') {
    candidates.push('CBV_HOSO_V2_DB_ID');
  }
  var i;
  for (i = 0; i < candidates.length; i++) {
    try {
      var v = String(PropertiesService.getScriptProperties().getProperty(candidates[i]) || '').trim();
      if (v) return v;
    } catch (e) {
      /* ignore */
    }
  }
  return '';
}

/**
 * Append one row to CBV_EVENT_LOG if sheet + headers exist (no ensure, no throw).
 * @param {string} eventType
 * @param {string} moduleCode
 * @param {string} entityId
 * @param {Object} payloadObj
 */
function MC_appendEventLogRowTry_(eventType, moduleCode, entityId, payloadObj) {
  try {
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.EVENT_LOG);
    if (!sheet || sheet.getLastRow() < 1) return;
    var map = cbvCoreV2ReadHeaderMap_(sheet);
    if (!map['EVENT_ID'] || !map['EVENT_TYPE']) return;
    var row = {
      EVENT_ID: MC_uuid_('EVT'),
      EVENT_TYPE: String(eventType || '').trim(),
      MODULE_CODE: String(moduleCode || '').trim(),
      ENTITY_TYPE: 'WEBAPP',
      ENTITY_ID: String(entityId || MC_uuid_('ENT')).trim(),
      SOURCE_COMMAND_ID: '',
      PAYLOAD_JSON: MC_json_(payloadObj || {}),
      CREATED_AT: MC_now_(),
      CREATED_BY: 'MAIN_CONTROL_WEBAPP'
    };
    cbvCoreV2AppendRowByHeaders_(sheet, row);
  } catch (e) {
    /* swallow */
  }
}

/**
 * Append MODULE_DB_ID to row 1 when missing (CBV_MODULE_REGISTRY).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Object<string, number>} map header → 1-based col (mutated)
 */
function MC_ensureModuleRegistryDbIdColumn_(sheet, map) {
  if (map['MODULE_DB_ID']) return;
  var maxCol = 0;
  var k;
  for (k in map) {
    if (Object.prototype.hasOwnProperty.call(map, k) && map[k] > maxCol) {
      maxCol = map[k];
    }
  }
  if (maxCol < 1) maxCol = sheet.getLastColumn();
  if (maxCol < 1) maxCol = 1;
  var newCol = maxCol + 1;
  sheet.getRange(1, newCol).setValue('MODULE_DB_ID');
  map['MODULE_DB_ID'] = newCol;
}

/**
 * Upsert MODULE_CODE row on CBV_MODULE_REGISTRY (auto-add MODULE_DB_ID column if sheet exists).
 * @param {string} moduleCode
 * @param {string} moduleDbId
 * @returns {{ ok: boolean, skipped?: boolean, reason?: string }}
 */
function MC_upsertModuleRegistry_(moduleCode, moduleDbId) {
  try {
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.MODULE_REGISTRY);
    if (!sheet) {
      return { ok: false, skipped: true, reason: 'NO_SHEET' };
    }
    var map = cbvCoreV2ReadHeaderMap_(sheet);
    var cCode = map['MODULE_CODE'];
    if (!cCode) {
      return { ok: false, skipped: true, reason: 'NO_MODULE_CODE_COL' };
    }
    MC_ensureModuleRegistryDbIdColumn_(sheet, map);
    if (!map['MODULE_DB_ID']) {
      return { ok: false, reason: 'MODULE_DB_ID_COLUMN_APPEND_FAILED' };
    }

    var m = String(moduleCode || '').trim().toUpperCase();
    var d = String(moduleDbId || '').trim();
    var now = MC_now_();
    var row = cbvCoreV2FindFirstRowInColumn_(sheet, 'MODULE_CODE', m);
    if (row >= 2) {
      var upd = {};
      upd.MODULE_DB_ID = d;
      if (map['STATUS']) upd.STATUS = 'ACTIVE';
      if (map['UPDATED_AT']) upd.UPDATED_AT = now;
      cbvCoreV2UpdateRowByHeaders_(sheet, row, upd);
    } else {
      var full = {};
      if (map['MODULE_CODE']) full.MODULE_CODE = m;
      if (map['MODULE_NAME']) full.MODULE_NAME = m;
      if (map['STATUS']) full.STATUS = 'ACTIVE';
      if (map['MODULE_DB_ID']) full.MODULE_DB_ID = d;
      if (map['VERSION']) full.VERSION = 'v1';
      if (map['ENTRY_HANDLER']) full.ENTRY_HANDLER = '';
      if (map['OWNER']) full.OWNER = 'ADMIN';
      if (map['IS_LEVEL6']) full.IS_LEVEL6 = 'FALSE';
      if (map['CREATED_AT']) full.CREATED_AT = now;
      if (map['UPDATED_AT']) full.UPDATED_AT = now;
      cbvCoreV2AppendRowByHeaders_(sheet, full);
    }
    MC_appendEventLogRowTry_('MODULE_REGISTERED', m, m, { moduleDbId: d });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: String(e && e.message ? e.message : e) };
  }
}

/**
 * @returns {string}
 */
function MC_getMainWebAppUrl_() {
  try {
    var u = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_CONTROL_WEBAPP_URL') || '').trim();
    if (u) return u;
  } catch (e1) {
    /* ignore */
  }
  try {
    var svc = ScriptApp.getService();
    if (svc) return String(svc.getUrl() || '').trim();
  } catch (e2) {
    /* ignore */
  }
  return '';
}

/**
 * @param {string} moduleCode
 * @returns {Object}
 */
function MC_getConnectionPackage_(moduleCode) {
  var mod = String(moduleCode || 'HO_SO_V2').trim().toUpperCase();
  if (mod === 'HO_SO' || mod === 'HOSO') mod = 'HO_SO_V2';

  var coreDbId = '';
  try {
    coreDbId = String(PropertiesService.getScriptProperties().getProperty('CBV_CORE_DB_ID') || '').trim();
  } catch (e0) {
    coreDbId = '';
  }
  if (!coreDbId && typeof cbvCoreV2GetCoreDbId_ === 'function') {
    coreDbId = String(cbvCoreV2GetCoreDbId_() || '').trim();
  }

  var configDbId = '';
  try {
    configDbId = String(PropertiesService.getScriptProperties().getProperty('CBV_CONFIG_DB_ID') || '').trim();
  } catch (e1) {
    configDbId = '';
  }

  var moduleDbId = MC_lookupModuleDbIdFromRegistry_(mod);
  if (!moduleDbId) {
    moduleDbId = MC_lookupModuleDbIdFromScriptProps_(mod);
  }

  var warning = '';
  if (!moduleDbId) {
    warning = 'MODULE_DB_ID_NOT_FOUND';
  }

  var issuedAt = MC_now_();
  var exp = new Date();
  exp.setHours(exp.getHours() + 24);

  var pkg = {
    coreDbId: coreDbId,
    configDbId: configDbId,
    moduleDbId: moduleDbId,
    moduleCode: mod,
    mainControlWebAppUrl: MC_getMainWebAppUrl_(),
    version: '1.0.0'
  };

  var data = {
    moduleCode: mod,
    issuedAt: issuedAt,
    expiresAt: exp.toISOString(),
    package: pkg
  };
  if (warning) data.warning = warning;

  return MC_stdResponse_(true, 'CONNECTION_PACKAGE_ISSUED', warning ? 'OK (see warning)' : 'OK', data, null);
}

/**
 * @param {Object} body
 * @returns {Object}
 */
function MC_ingestEvent_(body) {
  var b = body || {};
  try {
    var event = {
      eventType: String(b.eventType || b.EVENT_TYPE || 'WEBAPP_INGEST').trim(),
      moduleCode: String(b.moduleCode || b.MODULE_CODE || 'MAIN_CONTROL').trim(),
      entityType: String(b.entityType || b.ENTITY_TYPE || 'SYSTEM').trim(),
      entityId: String(b.entityId || b.ENTITY_ID || MC_uuid_('ENT')).trim(),
      sourceCommandId: String(b.sourceCommandId || b.SOURCE_COMMAND_ID || '').trim(),
      payload: b.payload != null ? b.payload : b,
      createdBy: String(b.createdBy || b.CREATED_BY || 'WEBAPP').trim()
    };
    var r = CBV_CoreV2_emitEvent(event);
    if (r && r.ok) {
      return MC_stdResponse_(true, 'EVENT_INGESTED', String(r.message || 'OK'), { emit: r.data || {} }, null);
    }
    return MC_stdResponse_(
      false,
      String((r && r.code) || 'EVENT_FAILED'),
      String((r && r.message) || 'Emit failed'),
      {},
      r && r.error ? { code: r.error.code, message: r.error.message, stack: '' } : { code: 'EVENT_FAILED', message: 'emit returned not ok', stack: '' }
    );
  } catch (e) {
    return MC_stdResponse_(false, 'INGEST_ERROR', String(e && e.message ? e.message : e), {}, { code: 'INGEST_ERROR', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

/**
 * @param {string} action
 * @param {Object} payloadObj
 */
function MC_auditWebAppTry_(action, payloadObj) {
  try {
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.COMMAND_LOG);
    if (!sheet) {
      sheet = cbvCoreV2GetSpreadsheet_().getSheetByName('CBV_COMMAND_LOG');
    }
    if (!sheet) return;
    var map = cbvCoreV2ReadHeaderMap_(sheet);
    if (!map['COMMAND_ID']) return;
    var row = {
      COMMAND_ID: MC_uuid_('WEB'),
      COMMAND_TYPE: 'MAIN_CONTROL_WEBAPP',
      MODULE_CODE: 'MAIN_CONTROL',
      SOURCE: 'WEBAPP',
      REQUEST_BY: 'WEBAPP',
      PAYLOAD_JSON: MC_json_({ action: action, payload: payloadObj || {} }),
      IDEMPOTENCY_KEY: '',
      STATUS: 'SUCCESS',
      RESULT_JSON: '',
      ERROR_CODE: '',
      ERROR_MESSAGE: '',
      CREATED_AT: MC_now_(),
      STARTED_AT: MC_now_(),
      FINISHED_AT: MC_now_()
    };
    cbvCoreV2AppendRowByHeaders_(sheet, row);
  } catch (e) {
    try {
      var ev = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.EVENT_LOG);
      if (!ev) return;
      var em = cbvCoreV2ReadHeaderMap_(ev);
      if (!em['EVENT_ID']) return;
      cbvCoreV2AppendRowByHeaders_(ev, {
        EVENT_ID: MC_uuid_('WEB'),
        EVENT_TYPE: 'MAIN_CONTROL_WEBAPP_AUDIT',
        MODULE_CODE: 'MAIN_CONTROL',
        ENTITY_TYPE: 'AUDIT',
        ENTITY_ID: action || 'UNKNOWN',
        SOURCE_COMMAND_ID: '',
        PAYLOAD_JSON: MC_json_(payloadObj || {}),
        CREATED_AT: MC_now_(),
        CREATED_BY: 'WEBAPP'
      });
    } catch (e2) {
      /* swallow */
    }
  }
}

/**
 * @returns {Object}
 */
function MC_healthPayload_() {
  var props = PropertiesService.getScriptProperties();
  var hasToken = !!String(props.getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim();
  var hasCore = !!String(props.getProperty('CBV_CORE_DB_ID') || '').trim();
  var hasCfg = !!String(props.getProperty('CBV_CONFIG_DB_ID') || '').trim();
  var ssOk = false;
  try {
    var ss = cbvCoreV2GetSpreadsheet_();
    ssOk = !!ss;
  } catch (e) {
    ssOk = false;
  }
  return {
    hasWebAppToken: hasToken,
    hasCoreDbId: hasCore,
    hasConfigDbId: hasCfg,
    coreSpreadsheetOk: ssOk,
    checkedAt: MC_now_()
  };
}

/**
 * @param {Object} e
 * @returns {Object}
 */
function MC_WebApp_doGet_(e) {
  var params = (e && e.parameter) || {};
  var token = params.token || '';
  var auth = MC_assertWebAppToken_(token);
  if (!auth.ok) return auth.failResponse;

  var action = String(params.action || '').trim().toLowerCase();
  MC_auditWebAppTry_('GET:' + action, params);

  if (action === 'ping') {
    return MC_stdResponse_(true, 'MAIN_CONTROL_PING', 'pong', { t: MC_now_() }, null);
  }
  if (action === 'health') {
    return MC_stdResponse_(true, 'MAIN_CONTROL_WEBAPP_HEALTH_OK', 'OK', MC_healthPayload_(), null);
  }
  if (action === 'getconnectionpackage') {
    var mod = String(params.module || params.moduleCode || 'HO_SO_V2').trim();
    return MC_getConnectionPackage_(mod);
  }
  return MC_stdResponse_(false, 'UNKNOWN_ACTION', 'Unknown GET action', { action: params.action || '' }, { code: 'UNKNOWN_ACTION', message: String(params.action || ''), stack: '' });
}

/**
 * @param {Object} e
 * @returns {Object}
 */
function MC_WebApp_doPost_(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (parseErr) {
    return MC_stdResponse_(false, 'INVALID_JSON', 'Body must be JSON', {}, { code: 'INVALID_JSON', message: String(parseErr && parseErr.message ? parseErr.message : parseErr), stack: '' });
  }

  var token = body.token || '';
  try {
    if (!token && e && e.parameter && e.parameter.token) token = e.parameter.token;
  } catch (eTok) {
    /* ignore */
  }

  var auth = MC_assertWebAppToken_(token);
  if (!auth.ok) return auth.failResponse;

  var action = String(body.action || '').trim().toUpperCase();
  MC_auditWebAppTry_('POST:' + action, body);

  if (action === 'GET_CONNECTION_PACKAGE') {
    var mod = String(body.moduleCode || body.module || 'HO_SO_V2').trim();
    return MC_getConnectionPackage_(mod);
  }
  if (action === 'INGEST_EVENT') {
    return MC_ingestEvent_(body);
  }
  if (action === 'HEALTH_CHECK') {
    return MC_stdResponse_(true, 'MAIN_CONTROL_WEBAPP_HEALTH_OK', 'OK', MC_healthPayload_(), null);
  }
  if (action === 'REGISTER_MODULE') {
    var mReg = String(body.moduleCode || body.module || '').trim().toUpperCase();
    var dbReg = String(body.moduleDbId || body.module_db_id || '').trim();
    if (!mReg || !dbReg) {
      return MC_stdResponse_(false, 'VALIDATION_ERROR', 'moduleCode and moduleDbId required', {}, { code: 'VALIDATION_ERROR', message: 'moduleCode and moduleDbId required', stack: '' });
    }
    var up = MC_upsertModuleRegistry_(mReg, dbReg);
    if (up.skipped && up.reason === 'NO_SHEET') {
      return MC_stdResponse_(true, 'MODULE_REGISTER_SKIP', 'Registry sheet missing; skipped', { skipped: true, reason: up.reason }, null);
    }
    if (up.ok && !up.skipped) {
      return MC_stdResponse_(true, 'MODULE_REGISTERED', 'Registry updated', { moduleCode: mReg }, null);
    }
    if (up.ok && up.skipped) {
      return MC_stdResponse_(true, 'MODULE_REGISTERED', String(up.reason || 'partial'), { moduleCode: mReg, skipped: true, reason: up.reason }, null);
    }
    return MC_stdResponse_(false, 'MODULE_REGISTER_FAILED', String(up.reason || 'failed'), {}, { code: 'MODULE_REGISTER_FAILED', message: String(up.reason || ''), stack: '' });
  }
  return MC_stdResponse_(false, 'UNKNOWN_ACTION', 'Unknown POST action', { action: action }, { code: 'UNKNOWN_ACTION', message: action, stack: '' });
}

/**
 * @param {Object} obj
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function MC_webAppServe_(obj) {
  return ContentService.createTextOutput(MC_json_(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    return MC_webAppServe_(MC_WebApp_doGet_(e || {}));
  } catch (err) {
    return MC_webAppServe_(
      MC_stdResponse_(false, 'WEBAPP_ERROR', String(err && err.message ? err.message : err), {}, { code: 'WEBAPP_ERROR', message: String(err && err.message ? err.message : err), stack: String(err && err.stack ? err.stack : '') })
    );
  }
}

function doPost(e) {
  try {
    return MC_webAppServe_(MC_WebApp_doPost_(e || {}));
  } catch (err2) {
    return MC_webAppServe_(
      MC_stdResponse_(false, 'WEBAPP_ERROR', String(err2 && err2.message ? err2.message : err2), {}, { code: 'WEBAPP_ERROR', message: String(err2 && err2.message ? err2.message : err2), stack: String(err2 && err2.stack ? err2.stack : '') })
    );
  }
}
