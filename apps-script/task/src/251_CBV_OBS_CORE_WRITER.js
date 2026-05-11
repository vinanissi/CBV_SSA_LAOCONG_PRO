// VENDORED FROM core-runtime-lib
// SOURCE: apps-script/core-runtime-lib/src/301_CBV_OBS_CORE_WRITER.js
// VERSION: 0.1.0

/**
 * CBV_OBS_CORE — Writer (B1 minimal foundation).
 *
 * Requirements:
 * - Write by header map (not column order).
 * - Ensure sheets/headers before append.
 * - No throw outward from public APIs.
 *
 * Public:
 * - CBV_Obs_appendHealth(config, payload)
 * - CBV_Obs_appendTestRun(config, payload)
 * - CBV_Obs_appendTestResult(config, payload)
 * - CBV_Obs_appendFinding(config, payload)
 * - CBV_Obs_appendAudit(config, payload)
 * - CBV_Obs_appendEventTrace(config, payload)
 * - CBV_Obs_appendRuntimeMetric(config, payload)
 * - CBV_Obs_appendAiExport(config, payload)
 * - CBV_Obs_appendDashboardRow(config, payload)
 * - CBV_Obs_appendOperatorGuideRow(config, payload)
 */

function CBV_Obs_appendHealth(config, payload) {
  return CBV_Obs_appendRow_(config, 'health', payload || {});
}
function CBV_Obs_appendTestRun(config, payload) {
  return CBV_Obs_appendRow_(config, 'testRun', payload || {});
}
function CBV_Obs_appendTestResult(config, payload) {
  return CBV_Obs_appendRow_(config, 'testResult', payload || {});
}
function CBV_Obs_appendFinding(config, payload) {
  return CBV_Obs_appendRow_(config, 'finding', payload || {});
}
function CBV_Obs_appendAudit(config, payload) {
  return CBV_Obs_appendRow_(config, 'audit', payload || {});
}
function CBV_Obs_appendEventTrace(config, payload) {
  return CBV_Obs_appendRow_(config, 'eventTrace', payload || {});
}
function CBV_Obs_appendRuntimeMetric(config, payload) {
  return CBV_Obs_appendRow_(config, 'runtimeMetric', payload || {});
}
function CBV_Obs_appendAiExport(config, payload) {
  return CBV_Obs_appendRow_(config, 'aiExport', payload || {});
}
function CBV_Obs_appendDashboardRow(config, payload) {
  return CBV_Obs_appendRow_(config, 'dashboard', payload || {});
}
function CBV_Obs_appendOperatorGuideRow(config, payload) {
  return CBV_Obs_appendRow_(config, 'operatorGuide', payload || {});
}

// ---------------- private ----------------

function CBV_Obs_appendRow_(config, sheetType, rowObject) {
  try {
    var norm = CBV_Obs_normalizeConfig(config);
    if (!norm.ok) return norm;
    var c = norm.data.config;

    // Ensure sheets (best-effort). If ensure fails, still attempt append (sheet may already exist).
    try { CBV_Obs_ensureSheets(c); } catch (e0) { /* swallow */ }

    var opened = CBV_Obs_openDb_(c);
    if (!opened.ok) return opened;
    var ss = opened.data.ss;

    var sheetName = CBV_Obs_getSheetName_(c, sheetType);
    var sh = null;
    try { sh = ss.getSheetByName(sheetName); } catch (e1) { sh = null; }
    if (!sh) return CBV_Obs_stdResponse_(false, 'CBV_OBS_SHEET_MISSING', 'Sheet missing: ' + sheetName, { sheetType: sheetType, sheetName: sheetName }, { message: 'Sheet missing', stack: '' });

    var headers = CBV_OBS_CORE_DEFAULT_HEADERS_[sheetType] || [];
    // Ensure headers on this sheet add-only (best-effort).
    try { CBV_Obs_ensureHeaders_(sh, headers); } catch (e2) { /* swallow */ }

    var merged = CBV_Obs_mergeDefaults_(c, sheetType, rowObject || {});
    var map = CBV_Obs_readHeaderMap_(sh);
    var rowValues = CBV_Obs_buildRowByHeaders_(headers, map, merged);

    // Append via range setValues for predictable width.
    var nextRow = (sh.getLastRow() || 0) + 1;
    var width = rowValues.length;
    sh.getRange(nextRow, 1, 1, width).setValues([rowValues]);

    return CBV_Obs_stdResponse_(true, 'CBV_OBS_ROW_APPENDED', 'OK', { sheetType: sheetType, sheetName: sheetName, row: nextRow }, null);
  } catch (e) {
    return CBV_Obs_stdResponse_(false, 'CBV_OBS_APPEND_ROW_EXCEPTION', String(e && e.message ? e.message : e), {}, { message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function CBV_Obs_readHeaderMap_(sheet) {
  try {
    if (typeof cbvCoreV2ReadHeaderMap_ === 'function') return cbvCoreV2ReadHeaderMap_(sheet);
  } catch (e0) {
    /* ignore */
  }
  // Local fallback.
  var map = {};
  try {
    var headers = CBV_Obs_getHeaders_(sheet);
    var i;
    for (i = 0; i < headers.length; i++) map[String(headers[i] || '').trim()] = i + 1;
  } catch (e1) {
    /* ignore */
  }
  return map;
}

function CBV_Obs_buildRowByHeaders_(headers, headerMap, rowObject) {
  var hdr = headers || [];
  var map = headerMap || {};

  // Width: max between manifest header length and current sheet header width.
  var maxCol = hdr.length;
  var k;
  for (k in map) {
    if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
    if (Number(map[k]) > maxCol) maxCol = Number(map[k]);
  }
  if (maxCol < 1) maxCol = hdr.length || 1;

  var vals = new Array(maxCol);
  var i;
  for (i = 0; i < vals.length; i++) vals[i] = '';

  var obj = rowObject || {};
  // Write only known columns (existing header map). If header missing, ignore field.
  var f;
  for (f in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, f)) continue;
    var col = map[f];
    if (!col) continue;
    var v = obj[f];
    // JSON fields are already merged as string by defaults; but keep safe.
    if (v && typeof v === 'object') v = CBV_Obs_safeJson_(v);
    vals[col - 1] = v;
  }
  return vals;
}

function CBV_Obs_mergeDefaults_(config, sheetType, payload) {
  var c = config || {};
  var p = payload || {};
  var out = {};
  var k;
  for (k in p) if (Object.prototype.hasOwnProperty.call(p, k)) out[k] = p[k];

  var nowIso = CBV_Obs_now_();
  var actor = CBV_Obs_user_();
  var mod = String(c.moduleCode || '').trim().toUpperCase();

  var idField = CBV_Obs_getIdFieldForSheetType_(sheetType);
  if (idField && !out[idField]) out[idField] = CBV_Obs_makeId_(CBV_Obs_defaultIdPrefixForSheetType_(sheetType));

  if (!out.MODULE_CODE && sheetType !== 'operatorGuide' && sheetType !== 'dashboard') {
    out.MODULE_CODE = mod;
  }

  if (sheetType === 'health') {
    if (!out.CHECKED_AT) out.CHECKED_AT = nowIso;
    if (!out.CHECKED_BY) out.CHECKED_BY = actor;
    if (out.DATA_JSON && typeof out.DATA_JSON !== 'string') out.DATA_JSON = CBV_Obs_safeJson_(out.DATA_JSON);
  }

  if (sheetType === 'testRun') {
    if (!out.TRIGGERED_BY) out.TRIGGERED_BY = actor;
    if (out.SUMMARY_JSON && typeof out.SUMMARY_JSON !== 'string') out.SUMMARY_JSON = CBV_Obs_safeJson_(out.SUMMARY_JSON);
  }

  if (sheetType === 'testResult') {
    if (out.DATA_JSON && typeof out.DATA_JSON !== 'string') out.DATA_JSON = CBV_Obs_safeJson_(out.DATA_JSON);
  }

  if (sheetType === 'finding') {
    if (!out.STATUS) out.STATUS = 'OPEN';
    if (!out.IS_RESOLVED) out.IS_RESOLVED = 'FALSE';
    if (!out.CREATED_AT) out.CREATED_AT = nowIso;
    if (!out.UPDATED_AT) out.UPDATED_AT = nowIso;
    if (out.DATA_JSON && typeof out.DATA_JSON !== 'string') out.DATA_JSON = CBV_Obs_safeJson_(out.DATA_JSON);
  }

  if (sheetType === 'audit') {
    if (!out.CREATED_AT) out.CREATED_AT = nowIso;
    if (!out.ACTOR_EMAIL) out.ACTOR_EMAIL = actor;
    if (out.DATA_JSON && typeof out.DATA_JSON !== 'string') out.DATA_JSON = CBV_Obs_safeJson_(out.DATA_JSON);
  }

  if (sheetType === 'eventTrace') {
    if (!out.CREATED_AT) out.CREATED_AT = nowIso;
    if (out.PAYLOAD_JSON && typeof out.PAYLOAD_JSON !== 'string') out.PAYLOAD_JSON = CBV_Obs_safeJson_(out.PAYLOAD_JSON);
  }

  if (sheetType === 'runtimeMetric') {
    if (!out.RECORDED_AT) out.RECORDED_AT = nowIso;
    if (out.DATA_JSON && typeof out.DATA_JSON !== 'string') out.DATA_JSON = CBV_Obs_safeJson_(out.DATA_JSON);
  }

  if (sheetType === 'aiExport') {
    if (!out.CREATED_AT) out.CREATED_AT = nowIso;
    if (!out.CREATED_BY) out.CREATED_BY = actor;
    if (out.EXPORT_JSON && typeof out.EXPORT_JSON !== 'string') out.EXPORT_JSON = CBV_Obs_safeJson_(out.EXPORT_JSON);
  }

  if (sheetType === 'dashboard') {
    if (!out.UPDATED_AT) out.UPDATED_AT = nowIso;
  }

  if (sheetType === 'operatorGuide') {
    if (!out.UPDATED_AT) out.UPDATED_AT = nowIso;
  }

  return out;
}

function CBV_Obs_getIdFieldForSheetType_(sheetType) {
  var t = String(sheetType || '').trim();
  if (t === 'health') return 'HEALTH_ID';
  if (t === 'testRun') return 'RUN_ID';
  if (t === 'testResult') return 'RESULT_ID';
  if (t === 'finding') return 'FINDING_ID';
  if (t === 'audit') return 'AUDIT_ID';
  if (t === 'eventTrace') return 'TRACE_ID';
  if (t === 'runtimeMetric') return 'METRIC_ID';
  if (t === 'aiExport') return 'EXPORT_ID';
  return '';
}

function CBV_Obs_defaultIdPrefixForSheetType_(sheetType) {
  var t = String(sheetType || '').trim();
  if (t === 'health') return 'HLT';
  if (t === 'testRun') return 'RUN';
  if (t === 'testResult') return 'RES';
  if (t === 'finding') return 'FDN';
  if (t === 'audit') return 'AUD';
  if (t === 'eventTrace') return 'TRC';
  if (t === 'runtimeMetric') return 'MET';
  if (t === 'aiExport') return 'EXP';
  return 'OBS';
}

