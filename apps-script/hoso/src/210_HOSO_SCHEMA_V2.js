/**
 * HO_SO_V2 — self-healing production schema (sheets + headers, append-only).
 * Dependencies: 180 (HOSO_Config_getDbId_), 110 (HO_SO_V2 optional merge), 02 (local header helpers optional).
 */

/** @type {Object[]} */
var HOSO_SCHEMA_V2_RELATIONS_ = [
  { fromSheet: 'HO_SO_FILE', fromColumn: 'HO_SO_ID', toSheet: 'HO_SO_MASTER', toColumn: 'HO_SO_ID' },
  { fromSheet: 'HO_SO_RELATION', fromColumn: 'FROM_HO_SO_ID', toSheet: 'HO_SO_MASTER', toColumn: 'HO_SO_ID' },
  { fromSheet: 'HO_SO_RELATION', fromColumn: 'TO_HO_SO_ID', toSheet: 'HO_SO_MASTER', toColumn: 'HO_SO_ID' },
  { fromSheet: 'HO_SO_DETAIL_XA_VIEN', fromColumn: 'HO_SO_ID', toSheet: 'HO_SO_MASTER', toColumn: 'HO_SO_ID' },
  { fromSheet: 'HO_SO_DETAIL_CHU_XE', fromColumn: 'HO_SO_ID', toSheet: 'HO_SO_MASTER', toColumn: 'HO_SO_ID' },
  { fromSheet: 'HO_SO_DETAIL_TAI_XE', fromColumn: 'HO_SO_ID', toSheet: 'HO_SO_MASTER', toColumn: 'HO_SO_ID' },
  { fromSheet: 'HO_SO_DETAIL_PHUONG_TIEN', fromColumn: 'HO_SO_ID', toSheet: 'HO_SO_MASTER', toColumn: 'HO_SO_ID' },
  { fromSheet: 'HO_SO_SEARCH_INDEX', fromColumn: 'HO_SO_ID', toSheet: 'HO_SO_MASTER', toColumn: 'HO_SO_ID' },
  { fromSheet: 'PRINT_JOB', fromColumn: 'HO_SO_ID', toSheet: 'HO_SO_MASTER', toColumn: 'HO_SO_ID' }
];

/**
 * @param {string[]} a
 * @param {string[]} b
 * @returns {string[]}
 */
function HOSO_SchemaV2_mergeHeaders_(a, b) {
  var seen = {};
  var out = [];
  var i;
  var h;
  for (i = 0; i < (a || []).length; i++) {
    h = String(a[i] || '').trim();
    if (!h || seen[h]) continue;
    seen[h] = true;
    out.push(h);
  }
  for (i = 0; i < (b || []).length; i++) {
    h = String(b[i] || '').trim();
    if (!h || seen[h]) continue;
    seen[h] = true;
    out.push(h);
  }
  return out;
}

/**
 * @returns {string}
 */
function HOSO_SchemaV2_now_() {
  if (typeof cbvCoreV2IsoNow_ === 'function') {
    return cbvCoreV2IsoNow_();
  }
  try {
    return new Date().toISOString();
  } catch (e) {
    return String(new Date());
  }
}

/**
 * @param {*} obj
 * @returns {string}
 */
function HOSO_SchemaV2_json_(obj) {
  if (typeof cbvCoreV2SafeStringify_ === 'function') {
    return cbvCoreV2SafeStringify_(obj);
  }
  try {
    return JSON.stringify(obj);
  } catch (e2) {
    return '{}';
  }
}

/**
 * @param {boolean} ok
 * @param {string} code
 * @param {string} message
 * @param {Object|null} data
 * @param {Object|null} err
 * @returns {Object}
 */
function HOSO_SchemaV2_stdResponse_(ok, code, message, data, err) {
  return {
    ok: !!ok,
    code: code || (ok ? 'OK' : 'ERROR'),
    message: message != null ? String(message) : '',
    data: data == null ? {} : data,
    error: err == null ? null : err
  };
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {Object<string, number>}
 */
function HOSO_SchemaV2_readHeaderMap_(sheet) {
  if (typeof cbvCoreV2ReadHeaderMap_ === 'function') {
    return cbvCoreV2ReadHeaderMap_(sheet);
  }
  return cbvCoreV2ReadHeaderMap_local_(sheet);
}

/**
 * @returns {Object[]}
 */
function HOSO_SchemaV2_getDefinitions_() {
  var v2 = typeof HO_SO_V2 !== 'undefined' && HO_SO_V2 && HO_SO_V2.HEADERS ? HO_SO_V2.HEADERS : {};
  var v2Sheets = typeof HO_SO_V2 !== 'undefined' && HO_SO_V2 && HO_SO_V2.SHEETS ? HO_SO_V2.SHEETS : {};

  var masterProd = [
    'HO_SO_ID', 'HO_SO_CODE', 'HO_SO_TYPE', 'HO_SO_TYPE_ID', 'DISPLAY_NAME', 'OWNER_NAME', 'OWNER_PHONE', 'OWNER_EMAIL',
    'MST', 'CCCD', 'ADDRESS', 'STATUS', 'LIFECYCLE_STATUS', 'PRIORITY', 'SOURCE', 'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID',
    'MAIN_VEHICLE_ID', 'MAIN_DRIVER_ID', 'DON_VI_ID', 'HTX_ID', 'NOTE', 'SEARCH_TEXT', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT',
    'UPDATED_BY', 'IS_DELETED'
  ];

  var fileProd = [
    'FILE_ID', 'HO_SO_ID', 'FILE_TYPE', 'FILE_NAME', 'DRIVE_FILE_ID', 'DRIVE_URL', 'MIME_TYPE', 'FILE_EXT', 'FILE_SIZE',
    'VERSION_NO', 'IS_PRIMARY', 'STATUS', 'OCR_STATUS', 'OCR_TEXT', 'EXTRACT_JSON', 'CHECKSUM', 'UPLOADED_AT', 'UPLOADED_BY',
    'EXPIRES_AT', 'NOTE', 'CREATED_AT', 'UPDATED_AT', 'IS_DELETED'
  ];

  var relationProd = [
    'RELATION_ID', 'FROM_HO_SO_ID', 'TO_HO_SO_ID', 'RELATION_TYPE', 'STATUS', 'START_DATE', 'END_DATE', 'NOTE', 'CREATED_AT',
    'CREATED_BY', 'UPDATED_AT', 'IS_DELETED'
  ];

  var xaProd = [
    'DETAIL_ID', 'HO_SO_ID', 'XA_VIEN_CODE', 'FULL_NAME', 'PHONE', 'EMAIL', 'CCCD', 'CCCD_ISSUE_DATE', 'CCCD_ISSUE_PLACE',
    'ADDRESS', 'TAX_CODE', 'BANK_NAME', 'BANK_ACCOUNT', 'JOIN_DATE', 'STATUS', 'NOTE', 'CREATED_AT', 'UPDATED_AT', 'IS_DELETED'
  ];

  var chuProd = [
    'DETAIL_ID', 'HO_SO_ID', 'OWNER_CODE', 'OWNER_TYPE', 'FULL_NAME', 'COMPANY_NAME', 'PHONE', 'EMAIL', 'CCCD', 'TAX_CODE',
    'ADDRESS', 'REPRESENTATIVE_NAME', 'STATUS', 'NOTE', 'CREATED_AT', 'UPDATED_AT', 'IS_DELETED'
  ];

  var taiProd = [
    'DETAIL_ID', 'HO_SO_ID', 'DRIVER_CODE', 'FULL_NAME', 'PHONE', 'EMAIL', 'CCCD', 'LICENSE_NO', 'LICENSE_CLASS',
    'LICENSE_ISSUE_DATE', 'LICENSE_EXPIRE_DATE', 'ADDRESS', 'STATUS', 'NOTE', 'CREATED_AT', 'UPDATED_AT', 'IS_DELETED'
  ];

  var ptProd = [
    'DETAIL_ID', 'HO_SO_ID', 'VEHICLE_CODE', 'PLATE_NO', 'OLD_PLATE_NO', 'VEHICLE_TYPE', 'BRAND', 'MODEL', 'MANUFACTURE_YEAR',
    'COLOR', 'CHASSIS_NO', 'ENGINE_NO', 'SEAT_COUNT', 'LOAD_CAPACITY', 'BUSINESS_TYPE', 'REGISTRATION_CERT_NO',
    'REGISTRATION_EXPIRE_DATE', 'INSPECTION_CERT_NO', 'INSPECTION_EXPIRE_DATE', 'INSURANCE_NO', 'INSURANCE_EXPIRE_DATE',
    'BADGE_NO', 'BADGE_EXPIRE_DATE', 'CAMERA_STATUS', 'GPS_STATUS', 'STATUS', 'NOTE', 'CREATED_AT', 'UPDATED_AT', 'IS_DELETED'
  ];

  var docReqProd = [
    'REQ_ID', 'HO_SO_TYPE', 'DOC_TYPE', 'DOC_NAME', 'IS_REQUIRED', 'IS_ACTIVE', 'VALIDITY_DAYS', 'RENEW_BEFORE_DAYS',
    'SORT_ORDER', 'NOTE', 'CREATED_AT', 'UPDATED_AT'
  ];

  var updLogProd = [
    'LOG_ID', 'HO_SO_ID', 'ACTION', 'OLD_STATUS', 'NEW_STATUS', 'FIELD_NAME', 'OLD_VALUE', 'NEW_VALUE', 'MESSAGE',
    'ACTOR_EMAIL', 'SOURCE', 'CREATED_AT'
  ];

  var searchProd = [
    'INDEX_ID', 'HO_SO_ID', 'HO_SO_CODE', 'HO_SO_TYPE', 'DISPLAY_NAME', 'OWNER_NAME', 'OWNER_PHONE', 'PLATE_NO',
    'DRIVER_NAME', 'KEYWORDS', 'KEYWORDS_NORMALIZED', 'STATUS', 'UPDATED_AT', 'IS_DELETED'
  ];

  var printJobProd = [
    'PRINT_JOB_ID', 'JOB_TYPE', 'TARGET_TYPE', 'TARGET_ID', 'HO_SO_ID', 'TEMPLATE_ID', 'STATUS', 'PRIORITY', 'PAYLOAD_JSON',
    'OUTPUT_FILE_ID', 'OUTPUT_URL', 'ERROR_CODE', 'ERROR_MESSAGE', 'RETRY_COUNT', 'NEXT_RUN_AT', 'CREATED_AT', 'STARTED_AT',
    'FINISHED_AT', 'UPDATED_AT', 'CREATED_BY'
  ];

  var printTplProd = [
    'TEMPLATE_ID', 'TEMPLATE_CODE', 'TEMPLATE_NAME', 'TARGET_TYPE', 'DOC_TYPE', 'GOOGLE_DOC_TEMPLATE_ID', 'OUTPUT_FOLDER_ID',
    'IS_ACTIVE', 'VERSION', 'NOTE', 'CREATED_AT', 'UPDATED_AT'
  ];

  var auditProd = [
    'AUDIT_ID', 'EVENT_TYPE', 'HO_SO_ID', 'ENTITY_TYPE', 'ENTITY_ID', 'ACTOR_EMAIL', 'SOURCE', 'PAYLOAD_JSON', 'CREATED_AT'
  ];

  var cfgProd = [
    'CONFIG_KEY', 'CONFIG_VALUE', 'CONFIG_TYPE', 'DESCRIPTION', 'IS_ACTIVE', 'UPDATED_AT'
  ];

  var enumProd = [
    'ENUM_ID', 'ENUM_GROUP', 'ENUM_VALUE', 'ENUM_LABEL', 'SORT_ORDER', 'IS_ACTIVE', 'NOTE',
    'DISPLAY_LABEL', 'DESCRIPTION', 'ROLE_ALLOW', 'ROLE_DENY', 'COLOR_CODE', 'ICON_NAME',
    'IS_DEFAULT', 'IS_SYSTEM', 'PARENT_GROUP', 'PARENT_VALUE', 'NEXT_ALLOWED_VALUES',
    'SHOW_IF_EXPR', 'VALID_IF_EXPR', 'UPDATED_AT'
  ];

  var defs = [];

  defs.push({
    tableCode: 'MASTER',
    physicalName: 'HO_SO_MASTER',
    requiredHeaders: HOSO_SchemaV2_mergeHeaders_(masterProd, v2.MASTER || [])
  });

  defs.push({
    tableCode: 'XA_VIEN',
    physicalName: v2Sheets.XA_VIEN || 'HO_SO_XA_VIEN',
    requiredHeaders: [].concat(v2.XA_VIEN || [])
  });

  defs.push({
    tableCode: 'PHUONG_TIEN',
    physicalName: v2Sheets.PHUONG_TIEN || 'HO_SO_PHUONG_TIEN',
    requiredHeaders: [].concat(v2.PHUONG_TIEN || [])
  });

  defs.push({
    tableCode: 'TAI_XE',
    physicalName: v2Sheets.TAI_XE || 'HO_SO_TAI_XE',
    requiredHeaders: [].concat(v2.TAI_XE || [])
  });

  defs.push({
    tableCode: null,
    physicalName: 'HO_SO_FILE',
    requiredHeaders: fileProd.slice()
  });

  defs.push({
    tableCode: 'RELATION',
    physicalName: v2Sheets.RELATION || 'HO_SO_RELATION',
    requiredHeaders: HOSO_SchemaV2_mergeHeaders_(relationProd, v2.RELATION || [])
  });

  defs.push({
    tableCode: null,
    physicalName: 'HO_SO_DETAIL_XA_VIEN',
    requiredHeaders: xaProd.slice()
  });

  defs.push({
    tableCode: null,
    physicalName: 'HO_SO_DETAIL_CHU_XE',
    requiredHeaders: chuProd.slice()
  });

  defs.push({
    tableCode: null,
    physicalName: 'HO_SO_DETAIL_TAI_XE',
    requiredHeaders: taiProd.slice()
  });

  defs.push({
    tableCode: null,
    physicalName: 'HO_SO_DETAIL_PHUONG_TIEN',
    requiredHeaders: ptProd.slice()
  });

  defs.push({
    tableCode: null,
    physicalName: 'DOC_REQUIREMENT',
    requiredHeaders: docReqProd.slice()
  });

  defs.push({
    tableCode: null,
    physicalName: 'HO_SO_UPDATE_LOG',
    requiredHeaders: updLogProd.slice()
  });

  defs.push({
    tableCode: 'SEARCH_INDEX',
    physicalName: v2Sheets.SEARCH_INDEX || 'HO_SO_SEARCH_INDEX',
    requiredHeaders: HOSO_SchemaV2_mergeHeaders_(searchProd, v2.SEARCH_INDEX || [])
  });

  defs.push({
    tableCode: 'PRINT_JOB',
    physicalName: v2Sheets.PRINT_JOB || 'HO_SO_PRINT_JOB',
    requiredHeaders: HOSO_SchemaV2_mergeHeaders_(printJobProd, v2.PRINT_JOB || [])
  });

  defs.push({
    tableCode: 'TEMPLATE',
    physicalName: v2Sheets.TEMPLATE || 'HO_SO_TEMPLATE',
    requiredHeaders: HOSO_SchemaV2_mergeHeaders_(printTplProd, HOSO_SchemaV2_mergeHeaders_(
      ['TEMPLATE_TYPE', 'TEMPLATE_SOURCE_ID', 'TEMPLATE_SOURCE_URL', 'STATUS', 'CONFIG_JSON'],
      v2.TEMPLATE || []
    ))
  });

  defs.push({
    tableCode: null,
    physicalName: 'HO_SO_AUDIT_LOG',
    requiredHeaders: auditProd.slice()
  });

  defs.push({
    tableCode: null,
    physicalName: 'HO_SO_CONFIG',
    requiredHeaders: cfgProd.slice()
  });

  defs.push({
    tableCode: null,
    physicalName: 'HO_SO_ENUM',
    requiredHeaders: enumProd.slice()
  });

  return defs;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string[]} requiredHeaders
 * @param {{ addedColumns: Array }} result
 */
function HOSO_SchemaV2_appendMissingHeaders_(sheet, requiredHeaders, result) {
  var map = HOSO_SchemaV2_readHeaderMap_(sheet);
  var need = [];
  var i;
  for (i = 0; i < requiredHeaders.length; i++) {
    var hn = String(requiredHeaders[i] || '').trim();
    if (!hn || map[hn]) continue;
    need.push(hn);
  }
  if (!need.length) return;

  var scanCols = Math.max(sheet.getLastColumn(), 1);
  try {
    var dr = sheet.getDataRange();
    if (dr && dr.getNumColumns() > scanCols) scanCols = dr.getNumColumns();
  } catch (e0) {
    /* ignore */
  }

  var row1 = sheet.getRange(1, 1, 1, scanCols).getValues()[0];
  var lastHeaderCol = 0;
  var c;
  for (c = 0; c < row1.length; c++) {
    if (String(row1[c] || '').trim() !== '') lastHeaderCol = c + 1;
  }

  if (lastHeaderCol < 1) {
    sheet.getRange(1, 1, 1, need.length).setValues([need]);
  } else {
    sheet.getRange(1, lastHeaderCol + 1, 1, need.length).setValues([need]);
  }

  for (i = 0; i < need.length; i++) {
    result.addedColumns.push({ sheet: sheet.getName(), column: need[i] });
  }
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {{ physicalName: string, requiredHeaders: string[] }} def
 * @param {{ createdSheets: string[], addedColumns: Array, warnings: string[] }} result
 */
function HOSO_SchemaV2_ensureSheet_(ss, def, result) {
  var name = String(def.physicalName || '').trim();
  if (!name) {
    result.warnings.push('SKIP_EMPTY_PHYSICAL_NAME');
    return;
  }
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    result.createdSheets.push(name);
  }
  HOSO_SchemaV2_appendMissingHeaders_(sh, def.requiredHeaders || [], result);
}

/**
 * @returns {Object}
 */
function HOSO_SchemaV2_ensureAll() {
  try {
    var dbId = String(HOSO_Config_getDbId_({ source: 'SCHEMA_V2' }) || '').trim();
    if (!dbId) {
      return HOSO_SchemaV2_stdResponse_(false, 'HOSO_SCHEMA_V2_ERROR', 'HOSO_CONFIG_DB_ID_MISSING', { dbId: '', sheets: [] }, {
        code: 'HOSO_CONFIG_DB_ID_MISSING',
        message: 'No DB id',
        stack: ''
      });
    }
    var ss = SpreadsheetApp.openById(dbId);
    var defs = HOSO_SchemaV2_getDefinitions_();
    var result = {
      dbId: dbId,
      sheets: [],
      createdSheets: [],
      addedColumns: [],
      warnings: []
    };
    var i;
    for (i = 0; i < defs.length; i++) {
      HOSO_SchemaV2_ensureSheet_(ss, defs[i], result);
      result.sheets.push({
        tableCode: defs[i].tableCode || '',
        physicalName: defs[i].physicalName,
        headerCount: (defs[i].requiredHeaders || []).length
      });
    }
    if (typeof HOSO_EnumV2_syncAll === 'function') {
      var er = HOSO_EnumV2_syncAll();
      result.enumSync = er;
      if (!er || !er.ok) {
        result.warnings.push('HOSO_EnumV2_syncAll: ' + (er && er.message ? er.message : 'unknown'));
      }
    } else if (typeof HOSO_Enum_syncAll === 'function') {
      var erLegacy = HOSO_Enum_syncAll();
      result.enumSync = erLegacy;
      if (!erLegacy || !erLegacy.ok) {
        result.warnings.push('HOSO_Enum_syncAll: ' + (erLegacy && erLegacy.message ? erLegacy.message : 'unknown'));
      }
    }
    return HOSO_SchemaV2_stdResponse_(true, 'HOSO_SCHEMA_V2_OK', 'Schema ensured', result, null);
  } catch (e) {
    return HOSO_SchemaV2_stdResponse_(false, 'HOSO_SCHEMA_V2_ERROR', String(e && e.message ? e.message : e), { sheets: [] }, {
      code: 'HOSO_SCHEMA_V2_ERROR',
      message: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : '')
    });
  }
}

/**
 * Read-only health (no mutations).
 * @returns {Object}
 */
function HOSO_SchemaV2_healthCheck() {
  try {
    var dbId = String(HOSO_Config_getDbId_({ source: 'SCHEMA_V2' }) || '').trim();
    if (!dbId) {
      return HOSO_SchemaV2_stdResponse_(false, 'HOSO_SCHEMA_V2_HEALTH_ERROR', 'HOSO_CONFIG_DB_ID_MISSING', {
        dbId: '',
        missingSheets: [],
        missingColumns: [],
        relationDefinitions: HOSO_SCHEMA_V2_RELATIONS_
      }, { code: 'HOSO_CONFIG_DB_ID_MISSING', message: '', stack: '' });
    }
    var ss = SpreadsheetApp.openById(dbId);
    var defs = HOSO_SchemaV2_getDefinitions_();
    var missingSheets = [];
    var missingColumns = [];
    var i;
    var d;
    for (i = 0; i < defs.length; i++) {
      d = defs[i];
      var sh = ss.getSheetByName(d.physicalName);
      if (!sh) {
        missingSheets.push(d.physicalName);
        continue;
      }
      var map = HOSO_SchemaV2_readHeaderMap_(sh);
      var h;
      for (h = 0; h < d.requiredHeaders.length; h++) {
        var col = String(d.requiredHeaders[h] || '').trim();
        if (!col) continue;
        if (!map[col]) {
          missingColumns.push({ sheet: d.physicalName, column: col });
        }
      }
    }
    var ok = missingSheets.length === 0 && missingColumns.length === 0;
    var dataPayload = {
      dbId: dbId,
      missingSheets: missingSheets,
      missingColumns: missingColumns,
      relationDefinitions: HOSO_SCHEMA_V2_RELATIONS_
    };
    if (typeof HOSO_EnumV2_healthCheck === 'function') {
      dataPayload.enumHealth = HOSO_EnumV2_healthCheck();
    }
    return HOSO_SchemaV2_stdResponse_(ok, ok ? 'HOSO_SCHEMA_V2_HEALTH_OK' : 'HOSO_SCHEMA_V2_HEALTH_DEGRADED', ok ? 'OK' : 'Missing schema', dataPayload, ok ? null : { code: 'SCHEMA_INCOMPLETE', message: 'missingSheets or missingColumns', stack: '' });
  } catch (e) {
    return HOSO_SchemaV2_stdResponse_(false, 'HOSO_SCHEMA_V2_HEALTH_ERROR', String(e && e.message ? e.message : e), {
      missingSheets: [],
      missingColumns: [],
      relationDefinitions: HOSO_SCHEMA_V2_RELATIONS_
    }, { code: 'HOSO_SCHEMA_V2_HEALTH_ERROR', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

/**
 * @returns {Object}
 */
function HOSO_SchemaV2_ensurePrintJobSheet() {
  try {
    var dbId = String(HOSO_Config_getDbId_({ source: 'SCHEMA_V2' }) || '').trim();
    if (!dbId) {
      return HOSO_SchemaV2_stdResponse_(false, 'HOSO_SCHEMA_V2_ERROR', 'HOSO_CONFIG_DB_ID_MISSING', {}, { code: 'HOSO_CONFIG_DB_ID_MISSING', message: '', stack: '' });
    }
    var ss = SpreadsheetApp.openById(dbId);
    var defs = HOSO_SchemaV2_getDefinitions_();
    var def = null;
    var i;
    for (i = 0; i < defs.length; i++) {
      if (defs[i].tableCode === 'PRINT_JOB') {
        def = defs[i];
        break;
      }
    }
    if (!def) {
      return HOSO_SchemaV2_stdResponse_(false, 'HOSO_SCHEMA_V2_ERROR', 'PRINT_JOB definition missing', {}, { code: 'DEF_MISSING', message: '', stack: '' });
    }
    var result = { createdSheets: [], addedColumns: [], warnings: [] };
    HOSO_SchemaV2_ensureSheet_(ss, def, result);
    return HOSO_SchemaV2_stdResponse_(true, 'HOSO_SCHEMA_V2_OK', 'PRINT_JOB sheet ensured', { dbId: dbId, createdSheets: result.createdSheets, addedColumns: result.addedColumns }, null);
  } catch (e) {
    return HOSO_SchemaV2_stdResponse_(false, 'HOSO_SCHEMA_V2_ERROR', String(e && e.message ? e.message : e), {}, {
      code: 'HOSO_SCHEMA_V2_ERROR',
      message: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : '')
    });
  }
}
