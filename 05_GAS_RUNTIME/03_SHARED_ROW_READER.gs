/**
 * CBV Shared Row Reader - Blank-row detection and normalized data row filtering.
 * Centralizes logic so fully blank trailing (or interstitial) rows are ignored globally.
 * Audit-only fields (CREATED_AT, UPDATED_AT, IS_DELETED, etc.) do NOT count as evidence of a real row.
 *
 * Dependencies: 00_CORE_UTILS (cbvAssert), 90_BOOTSTRAP_SCHEMA (getSchemaHeaders - optional)
 * Used by: 03_SHARED_REPOSITORY, 90_BOOTSTRAP_AUDIT, 99_DEBUG_SAMPLE_DATA (via filterRealDataRows)
 */

/** Audit-only columns: never treat as evidence of a real row */
var CBV_AUDIT_ONLY_COLUMNS = ['CREATED_AT', 'UPDATED_AT', 'CREATED_BY', 'UPDATED_BY', 'IS_DELETED'];

/**
 * Meaningful business fields per table. A row is "effectively blank" only if ALL these are blank.
 * Excludes audit-only columns. Partial rows (any meaningful field filled) still count as real.
 */
var CBV_MEANINGFUL_FIELDS = {
  USER_DIRECTORY: ['ID', 'USER_CODE', 'FULL_NAME', 'DISPLAY_NAME', 'EMAIL', 'PHONE', 'ROLE', 'POSITION', 'STATUS', 'IS_SYSTEM', 'ALLOW_LOGIN', 'NOTE'],
  ADMIN_AUDIT_LOG: ['ID', 'AUDIT_TYPE', 'ENTITY_TYPE', 'ENTITY_ID', 'ACTION', 'BEFORE_JSON', 'AFTER_JSON', 'NOTE', 'ACTOR_ID'],
  ENUM_DICTIONARY: ['ID', 'ENUM_GROUP', 'ENUM_VALUE', 'DISPLAY_TEXT', 'SORT_ORDER', 'IS_ACTIVE', 'NOTE'],
  MASTER_CODE: ['ID', 'MASTER_GROUP', 'CODE', 'NAME', 'DISPLAY_TEXT', 'STATUS', 'SORT_ORDER', 'IS_SYSTEM', 'ALLOW_EDIT', 'NOTE'],
  DON_VI: ['ID', 'DON_VI_TYPE', 'CODE', 'NAME', 'PARENT_ID', 'STATUS', 'MANAGER_USER_ID', 'IS_DELETED'],
  HO_SO_MASTER: ['ID', 'HO_SO_TYPE', 'CODE', 'NAME', 'STATUS', 'HTX_ID', 'OWNER_ID', 'PHONE', 'EMAIL', 'ID_NO', 'ADDRESS', 'START_DATE', 'END_DATE', 'NOTE', 'TAGS'],
  HO_SO_FILE: ['ID', 'HO_SO_ID', 'FILE_GROUP', 'FILE_NAME', 'FILE_URL', 'DRIVE_FILE_ID', 'STATUS', 'NOTE'],
  HO_SO_RELATION: ['ID', 'FROM_HO_SO_ID', 'TO_HO_SO_ID', 'RELATION_TYPE', 'START_DATE', 'END_DATE', 'STATUS', 'NOTE'],
  TASK_MAIN: ['ID', 'TASK_CODE', 'TITLE', 'DESCRIPTION', 'TASK_TYPE_ID', 'STATUS', 'PRIORITY', 'DON_VI_ID', 'OWNER_ID', 'REPORTER_ID', 'START_DATE', 'DUE_DATE', 'DONE_AT', 'PROGRESS_PERCENT', 'RESULT_SUMMARY', 'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID'],
  TASK_CHECKLIST: ['ID', 'TASK_ID', 'ITEM_NO', 'TITLE', 'IS_REQUIRED', 'IS_DONE', 'DONE_AT', 'DONE_BY', 'NOTE'],
  TASK_UPDATE_LOG: ['ID', 'TASK_ID', 'UPDATE_TYPE', 'ACTION', 'ACTOR_ID'],
  TASK_ATTACHMENT: ['ID', 'TASK_ID', 'ATTACHMENT_TYPE', 'TITLE', 'FILE_URL', 'DRIVE_FILE_ID', 'NOTE'],
  FINANCE_ATTACHMENT: ['ID', 'FINANCE_ID', 'ATTACHMENT_TYPE', 'TITLE', 'FILE_NAME', 'FILE_URL', 'DRIVE_FILE_ID', 'NOTE'],
  FINANCE_TRANSACTION: ['ID', 'TRANS_CODE', 'TRANS_DATE', 'TRANS_TYPE', 'STATUS', 'CATEGORY', 'AMOUNT', 'DON_VI_ID', 'COUNTERPARTY', 'PAYMENT_METHOD', 'REFERENCE_NO', 'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID', 'DESCRIPTION', 'EVIDENCE_URL', 'CONFIRMED_AT', 'CONFIRMED_BY'],
  FINANCE_LOG: ['ID', 'FIN_ID', 'ACTION', 'BEFORE_JSON', 'AFTER_JSON', 'NOTE', 'ACTOR_ID']
};

/**
 * Get meaningful fields for a table. Falls back to all headers except audit-only if unknown.
 * @param {string} tableName - Sheet name (e.g. 'USER_DIRECTORY', 'TASK_MAIN')
 * @param {string[]} [headers] - Optional headers for generic fallback
 * @returns {string[]}
 */
function getMeaningfulFieldsForTable(tableName, headers) {
  var known = CBV_MEANINGFUL_FIELDS[tableName];
  if (known && known.length > 0) return known;
  if (headers && headers.length > 0) {
    return headers.filter(function(h) {
      var k = String(h || '').trim();
      return k && CBV_AUDIT_ONLY_COLUMNS.indexOf(k) === -1;
    });
  }
  return [];
}

/**
 * Check if a value is effectively blank (null, undefined, or whitespace-only string).
 * @param {*} value
 * @returns {boolean}
 */
function _isBlankValue(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'number') return value === 0 ? false : false; // 0 is meaningful
  return String(value).trim() === '';
}

/**
 * Determines if a row is effectively blank: all meaningful business fields are empty.
 * Audit-only fields (CREATED_AT, UPDATED_AT, IS_DELETED, etc.) do NOT make a row real.
 * @param {Object} rowObj - Row as { headerKey: value, ... }, must include _rowNumber
 * @param {string[]} meaningfulFields - Columns that count as "has data"
 * @param {Object} [options] - { strict: if true, require at least one meaningful field to exist }
 * @returns {boolean} - true if row should be ignored (fully blank)
 */
function isEffectivelyBlankRow(rowObj, meaningfulFields, options) {
  options = options || {};
  if (!meaningfulFields || meaningfulFields.length === 0) return false; // unknown schema: treat as real
  var hasAny = false;
  for (var i = 0; i < meaningfulFields.length; i++) {
    var col = meaningfulFields[i];
    var val = rowObj[col];
    if (!_isBlankValue(val)) {
      hasAny = true;
      break;
    }
  }
  return !hasAny;
}

/**
 * Filter rows to keep only those with at least one meaningful field filled.
 * Fully blank rows are excluded. Partial rows (some data, missing required) are kept.
 * @param {Object[]} rowObjs - Array of { headerKey: value, _rowNumber, ... }
 * @param {string[]} meaningfulFields - Columns that count as "has data"
 * @param {Object} [options] - Passed to isEffectivelyBlankRow
 * @returns {Object[]}
 */
function filterRealDataRows(rowObjs, meaningfulFields, options) {
  if (!rowObjs || rowObjs.length === 0) return [];
  if (!meaningfulFields || meaningfulFields.length === 0) return rowObjs;
  return rowObjs.filter(function(r) {
    return !isEffectivelyBlankRow(r, meaningfulFields, options);
  });
}

/**
 * Read data rows from sheet and return only non-blank rows.
 * Uses sheet name to resolve meaningful fields. Safe for audit, migration, seed verification.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} [tableName] - Defaults to sheet.getName()
 * @returns {Object[]} Rows as { headerKey: value, _rowNumber }
 */
function readNormalizedRows(sheet, tableName) {
  var loaded = loadSheetDataSafe(sheet, tableName);
  return loaded.rows;
}

/**
 * Safe data loader for audit, validation, and repair.
 * - Row 1 = header (never validated as data)
 * - Data rows = row 2+, filtered to exclude fully blank trailing/intermediate rows
 * - Each row has _rowNumber = actual sheet row for logging
 * - Do NOT use getLastRow() for validation accuracy; use rows.length or rowCount
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} [tableName] - Defaults to sheet.getName()
 * @returns {{ headers: string[], rows: Object[], rowCount: number }}
 */
function loadSheetDataSafe(sheet, tableName) {
  var empty = { headers: [], rows: [], rowCount: 0 };
  if (!sheet) return empty;
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return empty;

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { headers: headers, rows: [], rowCount: 0 };

  var name = String(tableName || sheet.getName() || '').trim() || 'UNKNOWN';
  var raw = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var rowObjs = raw.map(function(row, idx) {
    var o = { _rowNumber: idx + 2 };
    headers.forEach(function(h, i) { o[h] = row[i]; });
    return o;
  });
  var meaningful = getMeaningfulFieldsForTable(name, headers);
  var rows = filterRealDataRows(rowObjs, meaningful);
  return { headers: headers, rows: rows, rowCount: rows.length };
}
