/**
 * MAIN_CONTROL_OBS — Schema (Local Observability Layer for MAIN_CONTROL).
 *
 * Goals:
 * - Add-only, idempotent: create sheets if missing; append missing headers only (never reorder/delete).
 * - Strict Core DB open via CBV_CORE_DB_ID (no ActiveSpreadsheet fallback unless explicit WARN in report).
 *
 * Public:
 * - MC_Obs_schemaReport()
 * - MC_Obs_ensureSheets()
 *
 * Private:
 * - MC_Obs_openModuleDb_()
 * - MC_Obs_ensureSheet_(ss, sheetName, headers)
 * - MC_Obs_ensureHeaders_(sheet, headers)
 * - MC_Obs_getHeaders_(sheet)
 * - MC_Obs_makeId_(prefix)
 */

var MC_OBS_SCHEMA_ = {
  MODULE_CODE: 'MAIN_CONTROL',
  MODULE_PREFIX: 'MC',
  SHEETS: {
    HEALTH: 'MC_OBS_HEALTH',
    TEST_RUN: 'MC_OBS_TEST_RUN',
    TEST_RESULT: 'MC_OBS_TEST_RESULT',
    FINDING: 'MC_OBS_FINDING',
    AUDIT: 'MC_OBS_AUDIT',
    EVENT_TRACE: 'MC_OBS_EVENT_TRACE',
    RUNTIME_METRIC: 'MC_OBS_RUNTIME_METRIC',
    AI_EXPORT: 'MC_OBS_AI_EXPORT',
    DASHBOARD: 'MC_OBS_DASHBOARD',
    OPERATOR_GUIDE: 'MC_OBS_OPERATOR_GUIDE'
  },
  HEADERS: {
    MC_OBS_HEALTH: [
      'HEALTH_ID',
      'MODULE_CODE',
      'CHECK_CODE',
      'STATUS',
      'SEVERITY',
      'MESSAGE',
      'DATA_JSON',
      'CHECKED_AT',
      'CHECKED_BY'
    ],
    MC_OBS_TEST_RUN: [
      'RUN_ID',
      'MODULE_CODE',
      'RUN_TYPE',
      'STATUS',
      'TOTAL_TESTS',
      'PASSED',
      'WARNED',
      'FAILED',
      'BLOCKED',
      'STARTED_AT',
      'FINISHED_AT',
      'DURATION_MS',
      'TRIGGERED_BY',
      'SUMMARY_JSON',
      'NOTE'
    ],
    MC_OBS_TEST_RESULT: [
      'RESULT_ID',
      'RUN_ID',
      'MODULE_CODE',
      'TEST_CODE',
      'TEST_NAME',
      'STATUS',
      'SEVERITY',
      'MESSAGE',
      'EXPECTED',
      'ACTUAL',
      'DATA_JSON',
      'ERROR_CODE',
      'ERROR_MESSAGE',
      'STARTED_AT',
      'FINISHED_AT',
      'DURATION_MS'
    ],
    MC_OBS_FINDING: [
      'FINDING_ID',
      'RUN_ID',
      'MODULE_CODE',
      'SOURCE_TYPE',
      'SOURCE_CODE',
      'SEVERITY',
      'STATUS',
      'MESSAGE',
      'ACTION_REQUIRED',
      'OWNER',
      'IS_RESOLVED',
      'RESOLVED_AT',
      'RESOLVED_BY',
      'DATA_JSON',
      'CREATED_AT',
      'UPDATED_AT',
      'NOTE'
    ],
    MC_OBS_AUDIT: [
      'AUDIT_ID',
      'MODULE_CODE',
      'ENTITY_TYPE',
      'ENTITY_ID',
      'ACTION',
      'FIELD_NAME',
      'OLD_VALUE',
      'NEW_VALUE',
      'ACTOR_EMAIL',
      'SOURCE',
      'COMMAND_ID',
      'CORRELATION_ID',
      'DATA_JSON',
      'CREATED_AT'
    ],
    MC_OBS_EVENT_TRACE: [
      'TRACE_ID',
      'MODULE_CODE',
      'EVENT_ID',
      'EVENT_TYPE',
      'ENTITY_TYPE',
      'ENTITY_ID',
      'DIRECTION',
      'STATUS',
      'SOURCE_MODULE',
      'TARGET_MODULE',
      'CORRELATION_ID',
      'IDEMPOTENCY_KEY',
      'MESSAGE',
      'PAYLOAD_JSON',
      'CREATED_AT'
    ],
    MC_OBS_RUNTIME_METRIC: [
      'METRIC_ID',
      'MODULE_CODE',
      'METRIC_TYPE',
      'METRIC_NAME',
      'METRIC_VALUE',
      'UNIT',
      'STATUS',
      'SEVERITY',
      'DATA_JSON',
      'RECORDED_AT'
    ],
    MC_OBS_AI_EXPORT: [
      'EXPORT_ID',
      'MODULE_CODE',
      'RUN_ID',
      'EXPORT_TYPE',
      'STATUS',
      'EXPORT_JSON',
      'EXPORT_MARKDOWN',
      'FILE_ID',
      'FILE_URL',
      'CREATED_AT',
      'CREATED_BY',
      'NOTE'
    ],
    MC_OBS_DASHBOARD: [
      'ITEM_KEY',
      'ITEM_LABEL',
      'STATUS',
      'SEVERITY',
      'VALUE_TEXT',
      'DATA_JSON',
      'UPDATED_AT',
      'NOTE'
    ],
    MC_OBS_OPERATOR_GUIDE: [
      'STEP_NO',
      'TITLE',
      'CONTENT',
      'UPDATED_AT',
      'NOTE'
    ]
  }
};

function MC_Obs_schemaReport() {
  try {
    var opened = MC_Obs_openModuleDb_();
    if (!opened.ok) return MC_Obs_stdResponse_(false, 'MC_OBS_SCHEMA_REPORT_FAILED', opened.message || 'Core DB not available', opened.data || {}, opened.error || null);
    var ss = opened.ss;
    var data = { coreDbId: opened.coreDbId || '', sheets: [], warnings: opened.warnings || [] };
    var sheets = MC_OBS_SCHEMA_.SHEETS;
    var sheetKeys = Object.keys(sheets);
    var i;
    for (i = 0; i < sheetKeys.length; i++) {
      var name = sheets[sheetKeys[i]];
      var sh = null;
      try {
        sh = ss.getSheetByName(name);
      } catch (e0) {
        sh = null;
      }
      var existing = sh ? MC_Obs_getHeaders_(sh) : [];
      var required = MC_OBS_SCHEMA_.HEADERS[name] || [];
      var missing = [];
      var set = {};
      var j;
      for (j = 0; j < existing.length; j++) set[String(existing[j] || '').trim()] = true;
      for (j = 0; j < required.length; j++) {
        var h = String(required[j] || '').trim();
        if (h && !set[h]) missing.push(h);
      }
      data.sheets.push({
        sheetName: name,
        exists: !!sh,
        lastRow: sh ? sh.getLastRow() : 0,
        lastColumn: sh ? sh.getLastColumn() : 0,
        missingHeaders: missing,
        existingHeadersCount: existing.length
      });
    }
    var anyMissing = false;
    for (i = 0; i < data.sheets.length; i++) {
      if (!data.sheets[i].exists || (data.sheets[i].missingHeaders && data.sheets[i].missingHeaders.length)) {
        anyMissing = true;
        break;
      }
    }
    return MC_Obs_stdResponse_(true, anyMissing ? 'MC_OBS_SCHEMA_WARN' : 'MC_OBS_SCHEMA_OK', anyMissing ? 'OBS schema has missing sheets/headers' : 'OK', data, null);
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_SCHEMA_REPORT_EXCEPTION', String(e && e.message ? e.message : e), {}, {
      code: 'EXCEPTION',
      message: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : '')
    });
  }
}

function MC_Obs_ensureSheets() {
  try {
    var opened = MC_Obs_openModuleDb_();
    if (!opened.ok) return MC_Obs_stdResponse_(false, 'MC_OBS_SCHEMA_ENSURE_FAILED', opened.message || 'Core DB not available', opened.data || {}, opened.error || null);
    var ss = opened.ss;

    var out = [];
    var sheets = MC_OBS_SCHEMA_.SHEETS;
    var keys = Object.keys(sheets);
    var i;
    for (i = 0; i < keys.length; i++) {
      var name = sheets[keys[i]];
      var headers = MC_OBS_SCHEMA_.HEADERS[name] || [];
      var ensured = MC_Obs_ensureSheet_(ss, name, headers);
      out.push(ensured);
    }
    var anyFail = false;
    for (i = 0; i < out.length; i++) if (!out[i].ok) anyFail = true;

    return MC_Obs_stdResponse_(!anyFail, anyFail ? 'MC_OBS_SCHEMA_ENSURE_WARN' : 'MC_OBS_SCHEMA_ENSURE_OK', anyFail ? 'Some OBS sheets/headers could not be ensured' : 'OK', { coreDbId: opened.coreDbId, warnings: opened.warnings || [], results: out }, null);
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_SCHEMA_ENSURE_EXCEPTION', String(e && e.message ? e.message : e), {}, {
      code: 'EXCEPTION',
      message: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : '')
    });
  }
}

function MC_Obs_openModuleDb_() {
  var warnings = [];
  var coreDbId = '';
  try {
    coreDbId = String(PropertiesService.getScriptProperties().getProperty('CBV_CORE_DB_ID') || '').trim();
  } catch (e0) {
    coreDbId = '';
  }
  if (!coreDbId && typeof cbvCoreV2GetCoreDbId_ === 'function') {
    try {
      coreDbId = String(cbvCoreV2GetCoreDbId_() || '').trim();
    } catch (e1) {
      coreDbId = '';
    }
  }
  if (!coreDbId) {
    warnings.push('CBV_CORE_DB_ID_MISSING');
    return {
      ok: false,
      message: 'CBV_CORE_DB_ID missing — cannot open Core DB strictly',
      data: { warnings: warnings },
      error: { code: 'CORE_DB_ID_MISSING', message: 'CBV_CORE_DB_ID missing', stack: '' }
    };
  }
  try {
    var ss = SpreadsheetApp.openById(coreDbId);
    return { ok: true, ss: ss, coreDbId: coreDbId, warnings: warnings };
  } catch (openErr) {
    return {
      ok: false,
      coreDbId: coreDbId,
      message: 'Failed to open Core DB',
      data: { coreDbId: coreDbId, warnings: warnings },
      error: { code: 'CORE_DB_OPEN_FAILED', message: String(openErr && openErr.message ? openErr.message : openErr), stack: String(openErr && openErr.stack ? openErr.stack : '') }
    };
  }
}

function MC_Obs_ensureSheet_(ss, sheetName, headers) {
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
  var hdr = MC_Obs_ensureHeaders_(sh, headers || []);
  if (!hdr.ok) {
    return {
      ok: false,
      sheetName: sheetName,
      created: created,
      appendedHeaders: [],
      error: hdr.error || { code: 'ENSURE_HEADERS_FAILED', message: 'Failed to ensure headers', stack: '' }
    };
  }
  return { ok: true, sheetName: sheetName, created: created, appendedHeaders: hdr.appended || [] };
}

function MC_Obs_ensureHeaders_(sheet, headers) {
  var existing = MC_Obs_getHeaders_(sheet);
  var set = {};
  var i;
  for (i = 0; i < existing.length; i++) set[String(existing[i] || '').trim()] = true;
  var missing = [];
  for (i = 0; i < (headers || []).length; i++) {
    var h = String(headers[i] || '').trim();
    if (!h) continue;
    if (!set[h]) missing.push(h);
  }
  if (missing.length === 0) return { ok: true, appended: [], existing: existing };
  try {
    var startCol = (sheet.getLastColumn() || existing.length || 0) + 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
    return { ok: true, appended: missing, existing: existing };
  } catch (e) {
    return { ok: false, appended: [], existing: existing, error: { code: 'ENSURE_HEADERS_FAILED', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') } };
  }
}

function MC_Obs_getHeaders_(sheet) {
  try {
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return [];
    var row = sheet.getRange(1, 1, 1, lastCol).getValues();
    var vals = row && row[0] ? row[0] : [];
    var out = [];
    var i;
    for (i = 0; i < vals.length; i++) {
      var s = String(vals[i] == null ? '' : vals[i]).trim();
      if (!s) continue;
      out.push(s);
    }
    return out;
  } catch (e) {
    return [];
  }
}

function MC_Obs_makeId_(prefix) {
  var p = String(prefix || MC_OBS_SCHEMA_.MODULE_PREFIX || 'MC').trim().toUpperCase();
  try {
    return p + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
  } catch (e) {
    return p + '_' + String(new Date().getTime());
  }
}

function MC_Obs_stdResponse_(ok, code, message, data, error) {
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

