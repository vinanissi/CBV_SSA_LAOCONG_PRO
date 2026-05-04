/**
 * HO_SO V2 — DB helpers (idempotent sheets, ids, rows).
 * Uses Core V2 sheet helpers where possible.
 * DB + sheet names: HOSO_Config_* (tracked CONFIG); legacy constants only for resolve/bootstrap fallback.
 */

/**
 * Physical tab name for logical sheet key (CONFIG tracked + legacy HO_SO_V2.SHEETS).
 * @param {string} sheetKey — TABLE_CODE / HO_SO_V2.SHEETS key
 * @param {Object} [context]
 * @returns {string}
 */
function hoSoV2ResolvePhysicalSheetName_(sheetKey, context) {
  var sk = String(sheetKey || '').trim();
  var ctx = context || hoSoV2GetRuntimeConfigContext_();
  if (typeof HOSO_Config_getSheetName_ === 'function') {
    try {
      var n = String(HOSO_Config_getSheetName_(sk, ctx) || '').trim();
      if (n) return n;
    } catch (eCfg) {
      /* ignore */
    }
  }
  return HO_SO_V2.SHEETS[sk] ? String(HO_SO_V2.SHEETS[sk]) : '';
}

/**
 * HOSO data spreadsheet (CONFIG DB id via tracked resolver; TEST/MENU may fall back to active).
 * @param {Object} [context]
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function hoSoV2Spreadsheet_(context) {
  var ctx = context || hoSoV2GetRuntimeConfigContext_();
  if (typeof HOSO_Config_openDbWithFallback_ === 'function') {
    return HOSO_Config_openDbWithFallback_(ctx);
  }
  if (typeof CBV_Config_getDbId === 'function') {
    try {
      var id = CBV_Config_getDbId('HOSO');
      if (id) return SpreadsheetApp.openById(id);
    } catch (eOpen) {
      /* fall through */
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * @param {string} prefix — HO_SO_V2.ID_PREFIX value
 * @returns {string}
 */
function hoSoV2NewId_(prefix) {
  var tz =
    typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.TIMEZONE
      ? CBV_CONFIG.TIMEZONE
      : Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  var d = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  var rnd = Utilities.getUuid().replace(/-/g, '').slice(0, 4).toUpperCase();
  return prefix + '_' + d + '_' + rnd;
}

/**
 * @param {string} sheetKey — key of HO_SO_V2.SHEETS
 * @param {string} headerKey — key of HO_SO_V2.HEADERS
 * @param {Object} [context]
 * @returns {{ sheet: GoogleAppsScript.Spreadsheet.Sheet, created: boolean, appendedHeaders: string[] }}
 */
function hoSoV2EnsureSheet_(sheetKey, headerKey, context) {
  var ctx = context || hoSoV2GetRuntimeConfigContext_();
  var physical = hoSoV2ResolvePhysicalSheetName_(sheetKey, ctx);
  var headers = HO_SO_V2.HEADERS[headerKey];
  var ss = hoSoV2Spreadsheet_(ctx);
  return cbvCoreV2EnsureSheetWithHeadersOnSpreadsheet_(ss, physical, headers);
}

/**
 * Bootstrap all HO_SO V2 sheets (idempotent).
 * @returns {Object}
 */
function HoSoV2_bootstrapSheets() {
  var keys = Object.keys(HO_SO_V2.SHEETS);
  var out = [];
  var i;
  var ctx = hoSoV2GetRuntimeConfigContext_();
  for (i = 0; i < keys.length; i++) {
    var k = keys[i];
    var r = hoSoV2EnsureSheet_(k, k, ctx);
    out.push({
      sheet: hoSoV2ResolvePhysicalSheetName_(k, ctx),
      created: r.created,
      appendedHeaders: r.appendedHeaders || []
    });
  }
  return { ok: true, sheets: out };
}

/**
 * @returns {Object}
 */
function HosoService_bootstrapSheets() {
  return HoSoV2_bootstrapSheets();
}

/**
 * @param {string} sheetKey
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function hoSoV2GetSheet_(sheetKey) {
  if (typeof HOSO_Config_getSheetWithFallback_ === 'function') {
    return HOSO_Config_getSheetWithFallback_(String(sheetKey || '').trim(), hoSoV2GetRuntimeConfigContext_());
  }
  var physical = hoSoV2ResolvePhysicalSheetName_(sheetKey);
  if (!physical) return null;
  return hoSoV2Spreadsheet_().getSheetByName(physical);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Object<string, *>} valuesByHeader
 */
function hoSoV2AppendRow_(sheet, valuesByHeader) {
  cbvCoreV2AppendRowByHeaders_(sheet, valuesByHeader);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} column
 * @param {string} value
 * @returns {number} row or -1
 */
function hoSoV2FindRowByColumn_(sheet, column, value) {
  return cbvCoreV2FindFirstRowInColumn_(sheet, column, value);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} row
 * @param {Object<string, *>} updates
 */
function hoSoV2UpdateRow_(sheet, row, updates) {
  cbvCoreV2UpdateRowByHeaders_(sheet, row, updates);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} hoSoCol must be HO_SO_ID
 * @param {string} hoSoId
 * @returns {number[]}
 */
function hoSoV2FindAllRowsByHoSoId_(sheet, hoSoCol, hoSoId) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var col = map[hoSoCol];
  if (!col) return [];
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var vals = sheet.getRange(2, col, last, col).getValues();
  var rows = [];
  var r;
  var target = String(hoSoId);
  for (r = 0; r < vals.length; r++) {
    if (String(vals[r][0]) === target) rows.push(r + 2);
  }
  return rows;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} row
 * @returns {Object<string, string>}
 */
function hoSoV2ReadRowAsObject_(sheet, row) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var vals = sheet.getRange(row, 1, row, lastCol).getValues()[0];
  var o = {};
  var c;
  for (c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').trim();
    if (!h) continue;
    var v = vals[c];
    o[h] = v instanceof Date ? v.toISOString() : v != null ? String(v) : '';
  }
  return o;
}

/**
 * @param {string} jsonOrObj
 * @returns {string}
 */
function hoSoV2MetaStringify_(jsonOrObj) {
  if (jsonOrObj == null || jsonOrObj === '') return '';
  if (typeof jsonOrObj === 'string') return jsonOrObj;
  return cbvCoreV2SafeStringify_(jsonOrObj);
}
