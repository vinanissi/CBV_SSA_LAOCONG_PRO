/**
 * MAIN_CONTROL Control Plane — Schema (Phase B).
 * Add-only, idempotent. Never deletes/renames existing headers.
 *
 * Public:
 * - MC_Schema_report()
 * - MC_Schema_ensureControlPlaneSheets()
 */

/**
 * Control Plane schema manifest for MAIN_CONTROL.
 * NOTE: Keep constant name unique (avoid collisions).
 */
var MC_CONTROL_PLANE_SCHEMA_ = {
  sheets: {
    // Core sheets (should already exist via CBV_CoreV2_bootstrap, but ensure defensively).
    CBV_MODULE_REGISTRY: {
      name: 'CBV_MODULE_REGISTRY',
      requiredHeaders: null, // use CBV_CORE_V2.HEADERS.MODULE_REGISTRY when available
      extraHeaders: [
        'MODULE_DB_ID',
        'MODULE_WEBAPP_URL',
        'ENV_CODE',
        'UPDATED_BY',
        'HEALTH_STATUS',
        'LAST_HEALTH_AT',
        'NOTE'
      ]
    },
    CBV_EVENT_QUEUE: { name: 'CBV_EVENT_QUEUE', requiredHeaders: null },
    CBV_EVENT_LOG: { name: 'CBV_EVENT_LOG', requiredHeaders: null },
    CBV_COMMAND_LOG: { name: 'CBV_COMMAND_LOG', requiredHeaders: null },
    CBV_AUDIT_LOG: { name: 'CBV_AUDIT_LOG', requiredHeaders: null },
    CBV_IDEMPOTENCY: { name: 'CBV_IDEMPOTENCY', requiredHeaders: null },
    CBV_SYSTEM_HEALTH: { name: 'CBV_SYSTEM_HEALTH', requiredHeaders: null },

    // Phase B new sheet
    CBV_CONNECTION_PACKAGE: {
      name: 'CBV_CONNECTION_PACKAGE',
      requiredHeaders: [
        'PACKAGE_ID',
        'MODULE_CODE',
        'MODULE_NAME',
        'ENV_CODE',
        'MODULE_DB_ID',
        'MODULE_WEBAPP_URL',
        'MAIN_CONTROL_WEBAPP_URL',
        'CONFIG_DB_ID',
        'CORE_DB_ID',
        'VERSION',
        'STATUS',
        'ISSUED_AT',
        'EXPIRES_AT',
        'PACKAGE_JSON',
        'CREATED_AT',
        'UPDATED_AT',
        'CREATED_BY',
        'NOTE'
      ]
    }
  }
};

function MC_cpStdResponse_(ok, code, message, data, error) {
  if (typeof MC_stdResponse_ === 'function') {
    return MC_stdResponse_(ok, code, message, data, error);
  }
  return {
    ok: !!ok,
    code: code || (ok ? 'OK' : 'ERROR'),
    message: message != null ? String(message) : '',
    data: data == null ? {} : data,
    error: error == null ? null : error
  };
}

/**
 * Open Core DB strictly by CBV_CORE_DB_ID (no active spreadsheet fallback).
 * @returns {{ ok: boolean, ss?: GoogleAppsScript.Spreadsheet.Spreadsheet, coreDbId?: string, error?: Object }}
 */
function MC_schemaOpenCoreDb_() {
  var coreDbId = '';
  try {
    coreDbId = String(PropertiesService.getScriptProperties().getProperty('CBV_CORE_DB_ID') || '').trim();
  } catch (e) {
    coreDbId = '';
  }
  if (!coreDbId && typeof cbvCoreV2GetCoreDbId_ === 'function') {
    try {
      coreDbId = String(cbvCoreV2GetCoreDbId_() || '').trim();
    } catch (e2) {
      coreDbId = '';
    }
  }
  if (!coreDbId) {
    return {
      ok: false,
      error: { code: 'CORE_DB_ID_MISSING', message: 'CBV_CORE_DB_ID missing', stack: '' }
    };
  }
  try {
    var ss = SpreadsheetApp.openById(coreDbId);
    return { ok: true, ss: ss, coreDbId: coreDbId };
  } catch (openErr) {
    return {
      ok: false,
      coreDbId: coreDbId,
      error: { code: 'CORE_DB_OPEN_FAILED', message: String(openErr && openErr.message ? openErr.message : openErr), stack: '' }
    };
  }
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {string[]}
 */
function MC_schemaGetHeaders_(sheet) {
  try {
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return [];
    var values = sheet.getRange(1, 1, 1, lastCol).getValues();
    var row = values && values[0] ? values[0] : [];
    var out = [];
    var i;
    for (i = 0; i < row.length; i++) {
      var v = row[i];
      var s = String(v == null ? '' : v).trim();
      if (!s) continue;
      out.push(s);
    }
    return out;
  } catch (e) {
    return [];
  }
}

/**
 * @param {string[]} existing
 * @param {string[]} required
 * @returns {string[]}
 */
function MC_schemaFindMissingHeaders_(existing, required) {
  var ex = existing || [];
  var req = required || [];
  var set = {};
  var i;
  for (i = 0; i < ex.length; i++) {
    set[String(ex[i] || '').trim()] = true;
  }
  var missing = [];
  for (i = 0; i < req.length; i++) {
    var h = String(req[i] || '').trim();
    if (!h) continue;
    if (!set[h]) missing.push(h);
  }
  return missing;
}

/**
 * Append missing headers to row 1 (add-only).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string[]} headers
 * @returns {{ ok: boolean, appended: string[], existing: string[], error?: Object }}
 */
function MC_schemaEnsureHeaders_(sheet, headers) {
  var existing = MC_schemaGetHeaders_(sheet);
  var missing = MC_schemaFindMissingHeaders_(existing, headers || []);
  if (missing.length === 0) {
    return { ok: true, appended: [], existing: existing };
  }
  try {
    var startCol = (sheet.getLastColumn() || existing.length || 0) + 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
    return { ok: true, appended: missing, existing: existing };
  } catch (e) {
    return {
      ok: false,
      appended: [],
      existing: existing,
      error: { code: 'ENSURE_HEADERS_FAILED', message: String(e && e.message ? e.message : e), stack: '' }
    };
  }
}

/**
 * Ensure sheet exists and has required headers (add-only).
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} sheetName
 * @param {string[]} headers
 * @returns {{ ok: boolean, sheetName: string, created: boolean, appendedHeaders: string[], error?: Object }}
 */
function MC_schemaEnsureSheet_(ss, sheetName, headers) {
  var created = false;
  var sh = null;
  try {
    sh = ss.getSheetByName(sheetName);
  } catch (e0) {
    sh = null;
  }
  if (!sh) {
    try {
      sh = ss.insertSheet(sheetName);
      created = true;
    } catch (createErr) {
      return {
        ok: false,
        sheetName: sheetName,
        created: false,
        appendedHeaders: [],
        error: { code: 'SHEET_CREATE_FAILED', message: String(createErr && createErr.message ? createErr.message : createErr), stack: '' }
      };
    }
  }
  var hdr = MC_schemaEnsureHeaders_(sh, headers || []);
  if (!hdr.ok) {
    return {
      ok: false,
      sheetName: sheetName,
      created: created,
      appendedHeaders: [],
      error: hdr.error || { code: 'SHEET_HEADERS_FAILED', message: 'Failed to ensure headers', stack: '' }
    };
  }
  return { ok: true, sheetName: sheetName, created: created, appendedHeaders: hdr.appended };
}

/**
 * Report current schema status (read-only).
 * @returns {{ ok: boolean, code: string, message: string, data: Object, error: Object|null }}
 */
function MC_Schema_report() {
  var opened = MC_schemaOpenCoreDb_();
  if (!opened.ok) {
    return MC_cpStdResponse_(false, 'MAIN_CONTROL_SCHEMA_REPORT_FAILED', 'Core DB not available', { sheets: [] }, opened.error || null);
  }
  var ss = opened.ss;
  var resultSheets = [];

  var keys = MC_CONTROL_PLANE_SCHEMA_ && MC_CONTROL_PLANE_SCHEMA_.sheets ? MC_CONTROL_PLANE_SCHEMA_.sheets : {};
  var k;
  for (k in keys) {
    if (!Object.prototype.hasOwnProperty.call(keys, k)) continue;
    var def = keys[k] || {};
    var name = String(def.name || '').trim();
    if (!name) continue;
    var sh = null;
    try {
      sh = ss.getSheetByName(name);
    } catch (e1) {
      sh = null;
    }
    var existing = sh ? MC_schemaGetHeaders_(sh) : [];

    var required = [];
    if (def.requiredHeaders && def.requiredHeaders.length) {
      required = def.requiredHeaders.slice(0);
    } else if (typeof CBV_CORE_V2 !== 'undefined' && CBV_CORE_V2.HEADERS) {
      // Map core sheets to their known header set if present.
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.MODULE_REGISTRY)) required = (CBV_CORE_V2.HEADERS.MODULE_REGISTRY || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.EVENT_QUEUE)) required = (CBV_CORE_V2.HEADERS.EVENT_QUEUE || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.EVENT_LOG)) required = (CBV_CORE_V2.HEADERS.EVENT_LOG || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.COMMAND_LOG)) required = (CBV_CORE_V2.HEADERS.COMMAND_LOG || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.AUDIT_LOG)) required = (CBV_CORE_V2.HEADERS.AUDIT_LOG || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.IDEMPOTENCY)) required = (CBV_CORE_V2.HEADERS.IDEMPOTENCY || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.SYSTEM_HEALTH)) required = (CBV_CORE_V2.HEADERS.SYSTEM_HEALTH || []).slice(0);
    }
    if (def.extraHeaders && def.extraHeaders.length) {
      required = required.concat(def.extraHeaders);
    }
    var missing = MC_schemaFindMissingHeaders_(existing, required);

    resultSheets.push({
      sheetName: name,
      exists: !!sh,
      lastRow: sh ? sh.getLastRow() : 0,
      lastColumn: sh ? sh.getLastColumn() : 0,
      missingHeaders: missing,
      existingHeadersCount: existing.length
    });
  }

  return MC_cpStdResponse_(true, 'MAIN_CONTROL_SCHEMA_REPORT_OK', 'OK', { sheets: resultSheets, coreDbId: opened.coreDbId }, null);
}

/**
 * Ensure core control plane sheets exist + ensure add-only headers.
 * @returns {{ ok: boolean, code: string, message: string, data: Object, error: Object|null }}
 */
function MC_Schema_ensureControlPlaneSheets() {
  var opened = MC_schemaOpenCoreDb_();
  if (!opened.ok) {
    return MC_cpStdResponse_(false, 'MAIN_CONTROL_SCHEMA_ENSURE_FAILED', 'Core DB not available', { sheets: [] }, opened.error || null);
  }
  var ss = opened.ss;
  var lock = null;
  try {
    lock = LockService.getDocumentLock();
  } catch (e0) {
    lock = null;
  }
  var locked = false;
  try {
    if (lock) {
      locked = lock.tryLock(15000);
    }
  } catch (e1) {
    locked = false;
  }

  var out = [];
  var keys = MC_CONTROL_PLANE_SCHEMA_ && MC_CONTROL_PLANE_SCHEMA_.sheets ? MC_CONTROL_PLANE_SCHEMA_.sheets : {};
  var k;
  for (k in keys) {
    if (!Object.prototype.hasOwnProperty.call(keys, k)) continue;
    var def = keys[k] || {};
    var name = String(def.name || '').trim();
    if (!name) continue;

    var required = [];
    if (def.requiredHeaders && def.requiredHeaders.length) {
      required = def.requiredHeaders.slice(0);
    } else if (typeof CBV_CORE_V2 !== 'undefined' && CBV_CORE_V2.HEADERS) {
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.MODULE_REGISTRY)) required = (CBV_CORE_V2.HEADERS.MODULE_REGISTRY || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.EVENT_QUEUE)) required = (CBV_CORE_V2.HEADERS.EVENT_QUEUE || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.EVENT_LOG)) required = (CBV_CORE_V2.HEADERS.EVENT_LOG || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.COMMAND_LOG)) required = (CBV_CORE_V2.HEADERS.COMMAND_LOG || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.AUDIT_LOG)) required = (CBV_CORE_V2.HEADERS.AUDIT_LOG || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.IDEMPOTENCY)) required = (CBV_CORE_V2.HEADERS.IDEMPOTENCY || []).slice(0);
      if (name === (CBV_CORE_V2.SHEETS && CBV_CORE_V2.SHEETS.SYSTEM_HEALTH)) required = (CBV_CORE_V2.HEADERS.SYSTEM_HEALTH || []).slice(0);
    }
    if (def.extraHeaders && def.extraHeaders.length) {
      required = required.concat(def.extraHeaders);
    }
    var ensured = MC_schemaEnsureSheet_(ss, name, required);
    out.push({
      sheetName: name,
      ok: ensured.ok,
      created: ensured.created,
      appendedHeaders: ensured.appendedHeaders || [],
      error: ensured.error || null
    });
  }

  try {
    if (locked && lock) lock.releaseLock();
  } catch (eRel) {
    /* ignore */
  }

  var anyFail = false;
  for (k = 0; k < out.length; k++) {
    if (!out[k].ok) {
      anyFail = true;
      break;
    }
  }
  return MC_cpStdResponse_(
    !anyFail,
    anyFail ? 'MAIN_CONTROL_SCHEMA_ENSURE_PARTIAL' : 'MAIN_CONTROL_SCHEMA_ENSURE_OK',
    anyFail ? 'Some sheets/headers could not be ensured' : 'OK',
    { sheets: out, coreDbId: opened.coreDbId },
    null
  );
}

