/**
 * CBV_OBS_CORE — Schema (B1 minimal foundation).
 *
 * Principles:
 * - Generic: NO dependency on MAIN_CONTROL.
 * - DB resolver must be provided by module config (no ActiveSpreadsheet fallback).
 * - Add-only, idempotent: create sheets if missing; append missing headers only (never reorder/delete).
 * - Public API prefix: CBV_Obs_
 * - Private helper suffix: _
 */

var CBV_OBS_CORE_VERSION = '0.1.0';

var CBV_OBS_CORE_DEFAULT_HEADERS_ = {
  health: [
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
  testRun: [
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
  testResult: [
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
  finding: [
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
  audit: [
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
  eventTrace: [
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
  runtimeMetric: [
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
  aiExport: [
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
  dashboard: [
    'DASHBOARD_KEY',
    'DASHBOARD_VALUE',
    'STATUS',
    'SEVERITY',
    'UPDATED_AT',
    'NOTE'
  ],
  operatorGuide: [
    'SECTION',
    'STEP_NO',
    'TITLE',
    'INSTRUCTION',
    'UPDATED_AT'
  ]
};

function CBV_Obs_getDefaultHeaders() {
  try {
    return CBV_Obs_stdResponse_(true, 'CBV_OBS_DEFAULT_HEADERS_OK', 'OK', { version: CBV_OBS_CORE_VERSION, headers: CBV_OBS_CORE_DEFAULT_HEADERS_ }, null);
  } catch (e) {
    return CBV_Obs_stdResponse_(false, 'CBV_OBS_DEFAULT_HEADERS_EXCEPTION', String(e && e.message ? e.message : e), {}, { message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function CBV_Obs_normalizeConfig(config) {
  try {
    var c = config || {};
    var moduleCode = String(c.moduleCode || '').trim().toUpperCase();
    var modulePrefix = String(c.modulePrefix || '').trim().toUpperCase();
    var dbResolver = c.dbResolver;

    if (!moduleCode) return CBV_Obs_stdResponse_(false, 'CBV_OBS_CONFIG_INVALID', 'moduleCode required', { field: 'moduleCode' }, { message: 'moduleCode required', stack: '' });
    if (!modulePrefix) return CBV_Obs_stdResponse_(false, 'CBV_OBS_CONFIG_INVALID', 'modulePrefix required', { field: 'modulePrefix' }, { message: 'modulePrefix required', stack: '' });
    if (typeof dbResolver !== 'function') return CBV_Obs_stdResponse_(false, 'CBV_OBS_CONFIG_INVALID', 'dbResolver must be a function', { field: 'dbResolver' }, { message: 'dbResolver must be function', stack: '' });

    var sheets = c.sheets && typeof c.sheets === 'object' ? c.sheets : {};
    function defName_(type) {
      return modulePrefix + '_OBS_' + String(type || '').trim().toUpperCase();
    }
    var normalizedSheets = {
      health: String(sheets.health || defName_('HEALTH')),
      testRun: String(sheets.testRun || defName_('TEST_RUN')),
      testResult: String(sheets.testResult || defName_('TEST_RESULT')),
      finding: String(sheets.finding || defName_('FINDING')),
      audit: String(sheets.audit || defName_('AUDIT')),
      eventTrace: String(sheets.eventTrace || defName_('EVENT_TRACE')),
      runtimeMetric: String(sheets.runtimeMetric || defName_('RUNTIME_METRIC')),
      aiExport: String(sheets.aiExport || defName_('AI_EXPORT')),
      dashboard: String(sheets.dashboard || defName_('DASHBOARD')),
      operatorGuide: String(sheets.operatorGuide || defName_('OPERATOR_GUIDE'))
    };

    var out = {
      moduleCode: moduleCode,
      modulePrefix: modulePrefix,
      dbResolver: dbResolver,
      sheets: normalizedSheets
    };
    return CBV_Obs_stdResponse_(true, 'CBV_OBS_CONFIG_OK', 'OK', { config: out }, null);
  } catch (e) {
    return CBV_Obs_stdResponse_(false, 'CBV_OBS_CONFIG_EXCEPTION', String(e && e.message ? e.message : e), {}, { message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function CBV_Obs_ensureSheets(config) {
  try {
    var norm = CBV_Obs_normalizeConfig(config);
    if (!norm.ok) return norm;
    var c = norm.data.config;

    var opened = CBV_Obs_openDb_(c);
    if (!opened.ok) return opened;
    var ss = opened.data.ss;

    var out = [];
    var types = Object.keys(CBV_OBS_CORE_DEFAULT_HEADERS_);
    var i;
    for (i = 0; i < types.length; i++) {
      var t = types[i];
      var sheetName = CBV_Obs_getSheetName_(c, t);
      var headers = CBV_OBS_CORE_DEFAULT_HEADERS_[t] || [];
      var ensured = CBV_Obs_ensureSheet_(ss, sheetName, headers);
      out.push({ sheetType: t, sheetName: sheetName, result: ensured });
    }

    var anyFail = false;
    for (i = 0; i < out.length; i++) if (!out[i].result || out[i].result.ok === false) anyFail = true;
    return CBV_Obs_stdResponse_(!anyFail, anyFail ? 'CBV_OBS_ENSURE_SHEETS_WARN' : 'CBV_OBS_ENSURE_SHEETS_OK', anyFail ? 'Some sheets/headers could not be ensured' : 'OK', { results: out }, null);
  } catch (e) {
    return CBV_Obs_stdResponse_(false, 'CBV_OBS_ENSURE_SHEETS_EXCEPTION', String(e && e.message ? e.message : e), {}, { message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function CBV_Obs_schemaReport(config) {
  try {
    var norm = CBV_Obs_normalizeConfig(config);
    if (!norm.ok) return norm;
    var c = norm.data.config;

    var opened = CBV_Obs_openDb_(c);
    if (!opened.ok) return opened;
    var ss = opened.data.ss;

    var data = { moduleCode: c.moduleCode, modulePrefix: c.modulePrefix, sheets: [] };
    var types = Object.keys(CBV_OBS_CORE_DEFAULT_HEADERS_);
    var i;
    for (i = 0; i < types.length; i++) {
      var t = types[i];
      var sheetName = CBV_Obs_getSheetName_(c, t);
      var sh = null;
      try { sh = ss.getSheetByName(sheetName); } catch (e0) { sh = null; }
      var existing = sh ? CBV_Obs_getHeaders_(sh) : [];
      var required = CBV_OBS_CORE_DEFAULT_HEADERS_[t] || [];
      var missing = CBV_Obs_findMissingHeaders_(existing, required);
      data.sheets.push({
        sheetType: t,
        sheetName: sheetName,
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
    return CBV_Obs_stdResponse_(true, anyMissing ? 'CBV_OBS_SCHEMA_WARN' : 'CBV_OBS_SCHEMA_OK', anyMissing ? 'OBS schema has missing sheets/headers' : 'OK', data, null);
  } catch (e) {
    return CBV_Obs_stdResponse_(false, 'CBV_OBS_SCHEMA_REPORT_EXCEPTION', String(e && e.message ? e.message : e), {}, { message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

// ---------------- Private helpers ----------------

function CBV_Obs_stdResponse_(ok, code, message, data, error) {
  return {
    ok: !!ok,
    code: code || (ok ? 'OK' : 'ERROR'),
    message: message != null ? String(message) : '',
    data: data == null ? {} : data,
    error: error == null ? null : error
  };
}

function CBV_Obs_safeJson_(value) {
  try {
    if (typeof cbvCoreV2SafeStringify_ === 'function') return cbvCoreV2SafeStringify_(value);
  } catch (e0) {
    /* ignore */
  }
  try {
    return JSON.stringify(value == null ? {} : value);
  } catch (e1) {
    return '{}';
  }
}

function CBV_Obs_now_() {
  try {
    if (typeof cbvCoreV2IsoNow_ === 'function') return cbvCoreV2IsoNow_();
  } catch (e0) {
    /* ignore */
  }
  try {
    return new Date().toISOString();
  } catch (e1) {
    return String(new Date());
  }
}

function CBV_Obs_user_() {
  try {
    var email = String(Session.getActiveUser().getEmail() || '').trim();
    if (email) return email;
  } catch (e0) {
    /* ignore */
  }
  return 'SYSTEM';
}

function CBV_Obs_makeId_(prefix) {
  var p = String(prefix || 'OBS').trim().toUpperCase();
  try {
    return p + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
  } catch (e) {
    return p + '_' + String(new Date().getTime());
  }
}

function CBV_Obs_openDb_(config) {
  try {
    if (!config || typeof config.dbResolver !== 'function') {
      return CBV_Obs_stdResponse_(false, 'CBV_OBS_DB_RESOLVER_MISSING', 'dbResolver missing', {}, { message: 'dbResolver missing', stack: '' });
    }
    var r = null;
    try {
      r = config.dbResolver();
    } catch (e0) {
      return CBV_Obs_stdResponse_(false, 'CBV_OBS_DB_RESOLVER_EXCEPTION', 'dbResolver threw', {}, { message: String(e0 && e0.message ? e0.message : e0), stack: String(e0 && e0.stack ? e0.stack : '') });
    }

    // Allow resolver to return Spreadsheet directly or { ss } or { ok, ss }.
    var ss = null;
    if (r && typeof r.getId === 'function' && typeof r.getSheetByName === 'function') {
      ss = r;
    } else if (r && typeof r === 'object' && r.ss) {
      ss = r.ss;
    }
    if (!ss) {
      return CBV_Obs_stdResponse_(false, 'CBV_OBS_DB_OPEN_FAILED', 'dbResolver did not return a Spreadsheet', { returnType: typeof r }, { message: 'Resolver must return Spreadsheet or {ss}', stack: '' });
    }
    return CBV_Obs_stdResponse_(true, 'CBV_OBS_DB_OPEN_OK', 'OK', { ss: ss }, null);
  } catch (e) {
    return CBV_Obs_stdResponse_(false, 'CBV_OBS_DB_OPEN_EXCEPTION', String(e && e.message ? e.message : e), {}, { message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function CBV_Obs_ensureSheet_(ss, sheetName, headers) {
  var created = false;
  var sh = null;
  try { sh = ss.getSheetByName(sheetName); } catch (e0) { sh = null; }
  if (!sh) {
    try {
      sh = ss.insertSheet(sheetName);
      created = true;
    } catch (e1) {
      return { ok: false, created: false, appendedHeaders: [], error: { message: String(e1 && e1.message ? e1.message : e1), stack: String(e1 && e1.stack ? e1.stack : '') } };
    }
  }
  var ensured = CBV_Obs_ensureHeaders_(sh, headers || []);
  if (!ensured.ok) return { ok: false, created: created, appendedHeaders: [], error: ensured.error || null };
  return { ok: true, created: created, appendedHeaders: ensured.appended || [] };
}

function CBV_Obs_ensureHeaders_(sheet, headers) {
  var existing = CBV_Obs_getHeaders_(sheet);
  var missing = CBV_Obs_findMissingHeaders_(existing, headers || []);
  if (!missing.length) return { ok: true, appended: [], existing: existing };
  try {
    var startCol = (sheet.getLastColumn() || existing.length || 0) + 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
    return { ok: true, appended: missing, existing: existing };
  } catch (e) {
    return { ok: false, appended: [], existing: existing, error: { message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') } };
  }
}

function CBV_Obs_getHeaders_(sheet) {
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

function CBV_Obs_findMissingHeaders_(existing, required) {
  var ex = existing || [];
  var req = required || [];
  var set = {};
  var i;
  for (i = 0; i < ex.length; i++) set[String(ex[i] || '').trim()] = true;
  var missing = [];
  for (i = 0; i < req.length; i++) {
    var h = String(req[i] || '').trim();
    if (!h) continue;
    if (!set[h]) missing.push(h);
  }
  return missing;
}

function CBV_Obs_getSheetName_(config, sheetType) {
  var t = String(sheetType || '').trim();
  var c = config || {};
  var sheets = c.sheets || {};
  if (sheets && sheets[t]) return String(sheets[t]);
  return String(c.modulePrefix || 'MOD') + '_OBS_' + t.toUpperCase();
}

