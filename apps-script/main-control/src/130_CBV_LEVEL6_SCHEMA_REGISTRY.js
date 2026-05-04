/**
 * CBV Level 6 Pro — schema registry, physical sheet resolver, validation.
 * Dependencies: 01_CBV_CORE_V2_UTILS.js, 02_CBV_CORE_V2_SHEETS.js, 00_CBV_CORE_V2_CONSTANTS.js
 */
var CBV_LEVEL6 = CBV_LEVEL6 || {};

CBV_LEVEL6.SHEETS = {
  SCHEMA_REGISTRY: 'CBV_SCHEMA_REGISTRY',
  MIGRATION_LOG: 'CBV_MIGRATION_LOG',
  ERROR_CODE: 'CBV_ERROR_CODE',
  ERROR_LOG: 'CBV_ERROR_LOG',
  PERMISSION_RULE: 'CBV_PERMISSION_RULE',
  RETRY_POLICY: 'CBV_RETRY_POLICY',
  EVENT_CONSUMER: 'CBV_EVENT_CONSUMER',
  BACKUP_LOG: 'CBV_BACKUP_LOG',
  ROLLBACK_LOG: 'CBV_ROLLBACK_LOG',
  DEV_GOVERNANCE_CHECK: 'CBV_DEV_GOVERNANCE_CHECK'
};

CBV_LEVEL6.HEADERS = {
  SCHEMA_REGISTRY: [
    'SCHEMA_ID', 'MODULE_CODE', 'TABLE_CODE', 'PHYSICAL_SHEET_NAME', 'FIELD_NAME', 'FIELD_TYPE', 'IS_KEY', 'IS_LABEL',
    'REQUIRED', 'DEFAULT_VALUE', 'ENUM_SOURCE', 'APP_LABEL', 'STATUS', 'SCHEMA_VERSION', 'CREATED_AT', 'UPDATED_AT', 'NOTE'
  ],
  MIGRATION_LOG: [
    'MIGRATION_ID', 'MODULE_CODE', 'FROM_VERSION', 'TO_VERSION', 'MIGRATION_NAME', 'STATUS', 'STARTED_AT', 'FINISHED_AT',
    'EXECUTED_BY', 'RESULT_JSON', 'ERROR_CODE', 'ERROR_MESSAGE', 'ROLLBACK_AVAILABLE', 'ROLLBACK_HANDLER'
  ],
  ERROR_CODE: [
    'ERROR_CODE', 'MODULE_CODE', 'SEVERITY', 'USER_MESSAGE', 'TECH_MESSAGE', 'RETRYABLE', 'HTTP_STATUS', 'STATUS',
    'CREATED_AT', 'UPDATED_AT'
  ],
  ERROR_LOG: [
    'ERROR_ID', 'MODULE_CODE', 'ERROR_CODE', 'SEVERITY', 'COMMAND_ID', 'EVENT_ID', 'ENTITY_TYPE', 'ENTITY_ID', 'SOURCE',
    'MESSAGE', 'STACK', 'PAYLOAD_JSON', 'CREATED_AT', 'CREATED_BY'
  ],
  PERMISSION_RULE: [
    'RULE_ID', 'ROLE', 'MODULE_CODE', 'ACTION', 'ALLOW', 'CONDITION_TYPE', 'CONDITION_JSON', 'PRIORITY', 'STATUS',
    'CREATED_AT', 'UPDATED_AT'
  ],
  RETRY_POLICY: [
    'POLICY_ID', 'MODULE_CODE', 'EVENT_TYPE', 'MAX_RETRY', 'BACKOFF_TYPE', 'BASE_DELAY_SECONDS', 'MAX_DELAY_SECONDS',
    'DEAD_LETTER_AFTER', 'STATUS', 'UPDATED_AT'
  ],
  EVENT_CONSUMER: [
    'CONSUMER_ID', 'EVENT_TYPE', 'MODULE_CODE', 'HANDLER_NAME', 'ENABLED', 'PRIORITY', 'RETRY_POLICY_ID', 'STATUS',
    'CREATED_AT', 'UPDATED_AT'
  ],
  BACKUP_LOG: [
    'BACKUP_ID', 'MODULE_CODE', 'DB_ID', 'BACKUP_FILE_ID', 'BACKUP_FILE_URL', 'STATUS', 'CREATED_AT', 'CREATED_BY', 'NOTE'
  ],
  ROLLBACK_LOG: [
    'ROLLBACK_ID', 'MODULE_CODE', 'MIGRATION_ID', 'STATUS', 'STARTED_AT', 'FINISHED_AT', 'EXECUTED_BY', 'RESULT_JSON',
    'ERROR_CODE', 'ERROR_MESSAGE'
  ],
  DEV_GOVERNANCE_CHECK: [
    'CHECK_ID', 'MODULE_CODE', 'CHECK_NAME', 'SEVERITY', 'STATUS', 'MESSAGE', 'CREATED_AT', 'PAYLOAD_JSON'
  ]
};

/**
 * @param {string} moduleRaw
 * @returns {string}
 */
function cbvL6NormalizeModuleCode_(moduleRaw) {
  var m = String(moduleRaw || '').trim().toUpperCase();
  if (m === 'HO_SO') return 'HOSO';
  return m;
}

/**
 * @param {string} sheetKey — key in CBV_LEVEL6.SHEETS
 * @param {string} headerKey — key in CBV_LEVEL6.HEADERS
 * @returns {{ sheet: GoogleAppsScript.Spreadsheet.Sheet, created: boolean, appendedHeaders: string[] }}
 */
function cbvL6EnsureCoreSheet_(sheetKey, headerKey) {
  var name = CBV_LEVEL6.SHEETS[sheetKey];
  var headers = CBV_LEVEL6.HEADERS[headerKey];
  return cbvCoreV2EnsureSheetWithHeaders_(name, headers);
}

/**
 * Idempotent: ensure all Level 6 hardening sheets exist with headers.
 * @returns {Object[]}
 */
function cbvL6EnsureAllHardeningSheets_() {
  var pairs = [
    ['SCHEMA_REGISTRY', 'SCHEMA_REGISTRY'],
    ['MIGRATION_LOG', 'MIGRATION_LOG'],
    ['ERROR_CODE', 'ERROR_CODE'],
    ['ERROR_LOG', 'ERROR_LOG'],
    ['PERMISSION_RULE', 'PERMISSION_RULE'],
    ['RETRY_POLICY', 'RETRY_POLICY'],
    ['EVENT_CONSUMER', 'EVENT_CONSUMER'],
    ['BACKUP_LOG', 'BACKUP_LOG'],
    ['ROLLBACK_LOG', 'ROLLBACK_LOG'],
    ['DEV_GOVERNANCE_CHECK', 'DEV_GOVERNANCE_CHECK']
  ];
  var out = [];
  var i;
  for (i = 0; i < pairs.length; i++) {
    var er = cbvL6EnsureCoreSheet_(pairs[i][0], pairs[i][1]);
    out.push({
      name: CBV_LEVEL6.SHEETS[pairs[i][0]],
      created: er.created,
      appendedHeaders: er.appendedHeaders || []
    });
  }
  return out;
}

/**
 * Resolve physical sheet from HO_SO_V2 / config. Fallback: HO_SO_* names (aligned with HO_SO_V2.SHEETS).
 * @param {string} moduleCode
 * @param {string} tableCode
 * @returns {string}
 */
function cbvL6ResolvePhysicalSheetName_(moduleCode, tableCode) {
  var mod = cbvL6NormalizeModuleCode_(moduleCode);
  var tc = String(tableCode || '').trim().toUpperCase();
  if (typeof cbvL6GetConfigSheetName_ === 'function') {
    try {
      var fromCfg = cbvL6GetConfigSheetName_(mod, tc);
      if (fromCfg) return fromCfg;
    } catch (eCfg) {
      /* ignore */
    }
  }
  if (mod === 'HOSO' && typeof CBV_Config_getSheetName === 'function') {
    try {
      var fromCentral = String(CBV_Config_getSheetName('HOSO', tc) || '').trim();
      if (fromCentral) return fromCentral;
    } catch (eC) {
      /* ignore */
    }
  }
  if (mod === 'HOSO' && typeof HO_SO_V2 !== 'undefined' && HO_SO_V2.SHEETS) {
    var map = {
      MASTER: 'MASTER',
      XA_VIEN: 'XA_VIEN',
      PHUONG_TIEN: 'PHUONG_TIEN',
      TAI_XE: 'TAI_XE',
      ATTACHMENT: 'ATTACHMENT',
      PRINT_JOB: 'PRINT_JOB',
      SEARCH_INDEX: 'SEARCH_INDEX',
      GIAY_TO: 'GIAY_TO'
    };
    var sk = map[tc];
    if (sk && HO_SO_V2.SHEETS[sk]) return String(HO_SO_V2.SHEETS[sk]);
  }
  var legacy = {
    MASTER: 'HO_SO_MASTER',
    XA_VIEN: 'HO_SO_XA_VIEN',
    PHUONG_TIEN: 'HO_SO_PHUONG_TIEN',
    TAI_XE: 'HO_SO_TAI_XE',
    ATTACHMENT: 'HO_SO_ATTACHMENT',
    PRINT_JOB: 'HO_SO_PRINT_JOB',
    SEARCH_INDEX: 'HO_SO_SEARCH_INDEX'
  };
  return legacy[tc] || '';
}

/**
 * Read CONFIG_REGISTRY for HOSO sheet override key CBV_L6_SHEET_<TABLE>.
 * @param {string} moduleCode normalized HOSO
 * @param {string} tableCode
 * @returns {string}
 */
function cbvL6GetConfigSheetName_(moduleCode, tableCode) {
  if (cbvL6NormalizeModuleCode_(moduleCode) !== 'HOSO') return '';
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.CONFIG_REGISTRY);
  if (!sheet) return '';
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var kCol = map['CONFIG_KEY'];
  var mCol = map['MODULE_CODE'];
  var jCol = map['CONFIG_JSON'];
  var aCol = map['IS_ACTIVE'];
  if (!kCol || !jCol) return '';
  var wantKey = 'CBV_L6_SHEET_' + String(tableCode || '').trim().toUpperCase();
  var last = sheet.getLastRow();
  if (last < 2) return '';
  var r;
  for (r = 2; r <= last; r++) {
    var key = String(sheet.getRange(r, kCol).getValue() || '').trim();
    if (key !== wantKey) continue;
    if (mCol) {
      var mc = String(sheet.getRange(r, mCol).getValue() || '').trim().toUpperCase();
      if (mc && cbvL6NormalizeModuleCode_(mc) !== 'HOSO') continue;
    }
    if (aCol) {
      var act = String(sheet.getRange(r, aCol).getValue() || '').toUpperCase();
      if (act === 'FALSE' || act === '0') continue;
    }
    var raw = sheet.getRange(r, jCol).getValue();
    if (raw == null || raw === '') {
      return '';
    }
    if (typeof raw === 'string' && raw.trim().charAt(0) === '{') {
      var o = cbvCoreV2SafeParseJson_(raw);
      if (o && o.physicalSheetName) return String(o.physicalSheetName);
      if (o && o.sheetName) return String(o.sheetName);
    }
    return String(raw).trim();
  }
  return '';
}

/**
 * @param {string} moduleCode
 * @param {string} tableCode
 * @returns {Object[]}
 */
function cbvL6ReadSchemaRowsFromSheet_(moduleCode, tableCode) {
  var res = cbvL6EnsureCoreSheet_('SCHEMA_REGISTRY', 'SCHEMA_REGISTRY');
  var sh = res.sheet;
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var mCol = map['MODULE_CODE'];
  var tCol = map['TABLE_CODE'];
  if (!mCol || !tCol) return [];
  var wantM = cbvL6NormalizeModuleCode_(moduleCode);
  var wantT = String(tableCode || '').trim().toUpperCase();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var out = [];
  var r;
  for (r = 2; r <= last; r++) {
    var rm = cbvL6NormalizeModuleCode_(String(sh.getRange(r, mCol).getValue() || ''));
    var rt = String(sh.getRange(r, tCol).getValue() || '').trim().toUpperCase();
    if (rm === wantM && rt === wantT) {
      var rowObj = { row: r };
      var keys = Object.keys(map);
      var i;
      for (i = 0; i < keys.length; i++) {
        var hk = keys[i];
        var col = map[hk];
        rowObj[hk] = sh.getRange(r, col).getValue();
      }
      out.push(rowObj);
    }
  }
  return out;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {string[]}
 */
function cbvL6ReadHeaderRow_(sheet) {
  var w = cbvCoreV2SheetOutputWidth_(sheet);
  if (w < 1) return [];
  var row = sheet.getRange(1, 1, 1, w).getValues()[0];
  var out = [];
  var i;
  for (i = 0; i < row.length; i++) {
    var h = String(row[i] || '').trim();
    if (h) out.push(h);
  }
  return out;
}

/**
 * @param {string} fieldType
 * @param {*} sample
 * @returns {string|null}
 */
function cbvL6TypeWarning_(fieldType, sample) {
  var ft = String(fieldType || '').toUpperCase();
  if (!ft || sample === '' || sample == null) return null;
  if (ft === 'NUMBER' && isNaN(Number(sample))) return 'Expected NUMBER';
  if (ft === 'BOOLEAN' && !/^(TRUE|FALSE|YES|NO|0|1)$/i.test(String(sample))) return 'Expected BOOLEAN';
  if (ft === 'DATE' && !(sample instanceof Date) && String(sample).length < 4) return 'Expected DATE';
  return null;
}

/**
 * @param {Object} fieldDef
 * @returns {Object}
 */
function CBV_L6_registerSchemaField(fieldDef) {
  try {
    var def = fieldDef || {};
    var schemaId = String(def.schemaId || def.SCHEMA_ID || '').trim();
    var moduleCode = cbvL6NormalizeModuleCode_(def.moduleCode || def.MODULE_CODE || '');
    var tableCode = String(def.tableCode || def.TABLE_CODE || '').trim().toUpperCase();
    var fieldName = String(def.fieldName || def.FIELD_NAME || '').trim();
    if (!schemaId || !moduleCode || !tableCode || !fieldName) {
      return { ok: false, code: 'VALIDATION_ERROR', message: 'schemaId, moduleCode, tableCode, fieldName required', data: {}, error: { code: 'VALIDATION_ERROR', message: 'Missing fields' } };
    }
    cbvL6EnsureCoreSheet_('SCHEMA_REGISTRY', 'SCHEMA_REGISTRY');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.SCHEMA_REGISTRY);
    var physical = String(def.physicalSheetName || def.PHYSICAL_SHEET_NAME || cbvL6ResolvePhysicalSheetName_(moduleCode, tableCode));
    var now = cbvCoreV2IsoNow_();
    var row = {
      SCHEMA_ID: schemaId,
      MODULE_CODE: moduleCode,
      TABLE_CODE: tableCode,
      PHYSICAL_SHEET_NAME: physical,
      FIELD_NAME: fieldName,
      FIELD_TYPE: String(def.fieldType || def.FIELD_TYPE || 'STRING'),
      IS_KEY: def.isKey != null ? def.isKey : def.IS_KEY,
      IS_LABEL: def.isLabel != null ? def.isLabel : def.IS_LABEL,
      REQUIRED: def.required != null ? def.required : def.REQUIRED,
      DEFAULT_VALUE: def.defaultValue != null ? def.defaultValue : def.DEFAULT_VALUE,
      ENUM_SOURCE: def.enumSource != null ? def.enumSource : def.ENUM_SOURCE,
      APP_LABEL: def.appLabel != null ? def.appLabel : def.APP_LABEL,
      STATUS: String(def.status || def.STATUS || 'ACTIVE'),
      SCHEMA_VERSION: String(def.schemaVersion || def.SCHEMA_VERSION || '1'),
      CREATED_AT: now,
      UPDATED_AT: now,
      NOTE: def.note != null ? def.note : def.NOTE || ''
    };
    cbvCoreV2AppendRowByHeaders_(sheet, row);
    return { ok: true, code: 'SCHEMA_FIELD_REGISTERED', message: 'OK', data: { schemaId: schemaId }, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}

/**
 * @param {string} moduleCode
 * @param {string} tableCode
 * @returns {{ rows: Object[] }}
 */
function CBV_L6_getSchema(moduleCode, tableCode) {
  var rows = cbvL6ReadSchemaRowsFromSheet_(moduleCode, tableCode);
  return { rows: rows };
}

/**
 * @param {string} moduleCode
 * @param {string} tableCode
 * @returns {Object}
 */
function CBV_L6_validateSheetAgainstSchema(moduleCode, tableCode) {
  var missingFields = [];
  var extraFields = [];
  var typeWarnings = [];
  var schemaRows = cbvL6ReadSchemaRowsFromSheet_(moduleCode, tableCode);
  var physicalName = cbvL6ResolvePhysicalSheetName_(moduleCode, tableCode);
  if (!physicalName) {
    return {
      ok: false,
      missingFields: [],
      extraFields: [],
      typeWarnings: [],
      message: 'Cannot resolve physical sheet for ' + moduleCode + '/' + tableCode
    };
  }
  var dataSheet = cbvCoreV2GetSpreadsheet_().getSheetByName(physicalName);
  if (!dataSheet) {
    return {
      ok: false,
      missingFields: schemaRows.map(function (r) {
        return String(r.FIELD_NAME || '');
      }),
      extraFields: [],
      typeWarnings: [],
      message: 'Physical sheet not found: ' + physicalName
    };
  }
  var headers = cbvL6ReadHeaderRow_(dataSheet);
  var headerSet = {};
  var hi;
  for (hi = 0; hi < headers.length; hi++) headerSet[headers[hi]] = true;

  var expected = {};
  var si;
  for (si = 0; si < schemaRows.length; si++) {
    var sr = schemaRows[si];
    var fn = String(sr.FIELD_NAME || '').trim();
    if (!fn) continue;
    expected[fn] = sr;
    if (!headerSet[fn]) missingFields.push(fn);
  }
  var ei;
  for (ei = 0; ei < headers.length; ei++) {
    var h = headers[ei];
    if (!expected[h]) extraFields.push(h);
  }

  if (dataSheet.getLastRow() >= 2 && schemaRows.length) {
    var map = cbvCoreV2ReadHeaderMap_(dataSheet);
    var sampleRow = 2;
    for (si = 0; si < schemaRows.length; si++) {
      var srow = schemaRows[si];
      var fname = String(srow.FIELD_NAME || '').trim();
      var col = map[fname];
      if (!col) continue;
      var cellVal = dataSheet.getRange(sampleRow, col).getValue();
      var tw = cbvL6TypeWarning_(srow.FIELD_TYPE, cellVal);
      if (tw) typeWarnings.push(fname + ': ' + tw);
    }
  }

  var ok = missingFields.length === 0 && typeWarnings.length === 0;
  if (!ok && typeof CBV_L6_logError === 'function') {
    CBV_L6_logError({
      errorCode: 'SCHEMA_MISSING_FIELD',
      moduleCode: cbvL6NormalizeModuleCode_(moduleCode),
      source: 'SCHEMA_VALIDATE',
      message: 'Validate ' + moduleCode + '/' + tableCode + ': missing=' + missingFields.join(','),
      payload: { missingFields: missingFields, typeWarnings: typeWarnings, physicalName: physicalName }
    });
  }
  return {
    ok: ok,
    missingFields: missingFields,
    extraFields: extraFields,
    typeWarnings: typeWarnings,
    message: ok ? 'Schema aligned' : 'Validation reported missing fields or type warnings'
  };
}

/**
 * @returns {Object}
 */
function CBV_L6_validateAllSchemas() {
  var modulesTables = cbvL6ListRegisteredModuleTables_();
  var results = [];
  var allOk = true;
  var i;
  for (i = 0; i < modulesTables.length; i++) {
    var mt = modulesTables[i];
    var v = CBV_L6_validateSheetAgainstSchema(mt.moduleCode, mt.tableCode);
    results.push({ moduleCode: mt.moduleCode, tableCode: mt.tableCode, validation: v });
    if (!v.ok) allOk = false;
  }
  return { ok: allOk, results: results };
}

/**
 * @returns {{ moduleCode: string, tableCode: string }[]}
 */
function cbvL6ListRegisteredModuleTables_() {
  var res = cbvL6EnsureCoreSheet_('SCHEMA_REGISTRY', 'SCHEMA_REGISTRY');
  var sh = res.sheet;
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var mCol = map['MODULE_CODE'];
  var tCol = map['TABLE_CODE'];
  if (!mCol || !tCol) return [];
  var last = sh.getLastRow();
  if (last < 2) return [];
  var seen = {};
  var out = [];
  var r;
  for (r = 2; r <= last; r++) {
    var mc = cbvL6NormalizeModuleCode_(String(sh.getRange(r, mCol).getValue() || ''));
    var tc = String(sh.getRange(r, tCol).getValue() || '').trim().toUpperCase();
    if (!mc || !tc) continue;
    var k = mc + '|' + tc;
    if (seen[k]) continue;
    seen[k] = true;
    out.push({ moduleCode: mc, tableCode: tc });
  }
  return out;
}

/**
 * Seed CBV_SCHEMA_REGISTRY from HO_SO_V2.HEADERS for core tables.
 */
function cbvL6SeedHosoSchemaRegistry_() {
  if (typeof HO_SO_V2 === 'undefined' || !HO_SO_V2.HEADERS || !HO_SO_V2.SHEETS) return;
  var tables = [
    ['MASTER', 'MASTER'],
    ['XA_VIEN', 'XA_VIEN'],
    ['PHUONG_TIEN', 'PHUONG_TIEN'],
    ['TAI_XE', 'TAI_XE'],
    ['ATTACHMENT', 'ATTACHMENT'],
    ['PRINT_JOB', 'PRINT_JOB'],
    ['SEARCH_INDEX', 'SEARCH_INDEX']
  ];
  var ti;
  for (ti = 0; ti < tables.length; ti++) {
    var tCode = tables[ti][0];
    var hKey = tables[ti][1];
    var headers = HO_SO_V2.HEADERS[hKey];
    if (!headers || !headers.length) continue;
    var physical = HO_SO_V2.SHEETS[hKey] || cbvL6ResolvePhysicalSheetName_('HOSO', tCode);
    var fi;
    for (fi = 0; fi < headers.length; fi++) {
      var fname = headers[fi];
      var schemaId = 'HOSO_' + tCode + '_' + fname;
      var sh = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.SCHEMA_REGISTRY);
      if (!sh) continue;
      if (cbvCoreV2FindFirstRowInColumn_(sh, 'SCHEMA_ID', schemaId) >= 2) continue;
      CBV_L6_registerSchemaField({
        schemaId: schemaId,
        moduleCode: 'HOSO',
        tableCode: tCode,
        physicalSheetName: physical,
        fieldName: fname,
        fieldType: 'STRING',
        IS_KEY: fname.indexOf('_ID') >= 0 ? 'TRUE' : '',
        REQUIRED: ''
      });
    }
  }
}

/**
 * @returns {Object}
 */
function CBV_L6_bootstrapSchemaRegistry() {
  try {
    cbvL6EnsureCoreSheet_('SCHEMA_REGISTRY', 'SCHEMA_REGISTRY');
    cbvL6SeedHosoSchemaRegistry_();
    return { ok: true, code: 'L6_SCHEMA_BOOTSTRAP_OK', message: 'Schema registry seeded', data: {}, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}
