/**
 * CBV Schema Manager - Ensure all required sheets and columns.
 * Idempotent. Never deletes columns. Only creates missing sheets and appends missing columns.
 *
 * Dependencies: 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_INIT, 95_TASK_SYSTEM_BOOTSTRAP
 */

/** Deployment-scope sheets (final architecture) */
var DEPLOYMENT_SHEETS = [
  'USER_DIRECTORY', 'DON_VI', 'MASTER_CODE', 'ENUM_DICTIONARY',
  'TASK_MAIN', 'TASK_CHECKLIST', 'TASK_ATTACHMENT', 'TASK_UPDATE_LOG', 'ADMIN_AUDIT_LOG'
];

/**
 * Ensures all required sheets exist with correct headers. Appends missing columns only.
 * @returns {{ ok: boolean, created: string[], appended: Object, logs: string[], errors: string[] }}
 */
function ensureAllSchemasImpl() {
  var result = { ok: true, created: [], appended: {}, logs: [], errors: [] };

  // 1. Core sheets from manifest (includes USER_DIRECTORY, DON_VI, MASTER_CODE, etc.)
  if (typeof ensureCoreSheetsExist === 'function') {
    var core = ensureCoreSheetsExist();
    if (core.data && core.data.createdSheets) result.created = result.created.concat(core.data.createdSheets);
    if (core.data && core.data.warnings) result.logs = result.logs.concat(core.data.warnings);
    if (!core.ok) result.errors = result.errors.concat(core.errors || []);
  }

  // 2. DON_VI sheet (ensureDonViSheet creates if missing, appends cols)
  if (typeof ensureDonViSheet === 'function') {
    var dv = ensureDonViSheet();
    if (dv.created) result.created.push(typeof getDonViSheetName === 'function' ? getDonViSheetName() : 'DON_VI');
    if (dv.appendedColumns && dv.appendedColumns.length > 0) {
      result.appended['DON_VI'] = dv.appendedColumns;
      result.logs.push('DON_VI: +' + dv.appendedColumns.length + ' cols');
    }
  }

  // 3. ENUM_DICTIONARY - create if missing (seedEnumDictionary does this; ensure we have sheet)
  var ss = SpreadsheetApp.getActive();
  var enumName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.ENUM_DICTIONARY)
    ? CBV_CONFIG.SHEETS.ENUM_DICTIONARY : 'ENUM_DICTIONARY';
  var enumSheet = ss.getSheetByName(enumName);
  if (!enumSheet) {
    enumSheet = ss.insertSheet(enumName);
    var enumHeaders = (typeof ENUM_DICTIONARY_HEADERS !== 'undefined' && ENUM_DICTIONARY_HEADERS)
      ? ENUM_DICTIONARY_HEADERS
      : ['ID', 'ENUM_GROUP', 'ENUM_VALUE', 'DISPLAY_TEXT', 'SORT_ORDER', 'IS_ACTIVE', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'];
    enumSheet.getRange(1, 1, 1, enumHeaders.length).setValues([enumHeaders]);
    result.created.push(enumName);
    result.logs.push('Created ' + enumName);
  }

  // 4. TASK_MAIN schema (append DON_VI_ID, TASK_TYPE_ID if missing)
  if (typeof ensureTaskMainSchemaPro === 'function') {
    var tm = ensureTaskMainSchemaPro();
    if (tm.appendedColumns && tm.appendedColumns.length > 0) {
      result.appended['TASK_MAIN'] = tm.appendedColumns;
      result.logs.push('TASK_MAIN: +' + tm.appendedColumns.length + ' cols');
    }
  }

  // 5. Safe schema append (ensureSchema with appendMissingColumns)
  if (typeof ensureSchema === 'function') {
    var schema = ensureSchema({ appendMissingColumns: true });
    if (schema.findings && schema.findings.length > 0) {
      result.logs.push('Schema: ' + schema.findings.length + ' findings');
    }
  }

  result.ok = result.errors.length === 0;
  return result;
}
