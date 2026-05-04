/**
 * CBV Core V2 — sheet ensure (idempotent create + append missing headers only).
 * Dependencies: 01_CBV_CORE_V2_UTILS.js, 00_CBV_CORE_V2_CONSTANTS.js
 */

/**
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function cbvCoreV2GetSpreadsheet_() {
  if (typeof cbvCoreV2OpenCoreSpreadsheet_ === 'function') {
    return cbvCoreV2OpenCoreSpreadsheet_();
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Độ rộng ghi dữ liệu: trùng với vùng sheet đang dùng (tránh appendRow/setValues lệch 7 vs 43).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {number}
 */
function cbvCoreV2SheetOutputWidth_(sheet) {
  var n = sheet.getLastColumn();
  if (n < 1) return 0;
  var row1 = sheet.getRange(1, 1, 1, n).getValues()[0];
  var lastH = 0;
  var i;
  for (i = 0; i < row1.length; i++) {
    if (String(row1[i] || '').trim() !== '') lastH = i + 1;
  }
  var w = Math.max(n, lastH);
  try {
    var dr = sheet.getDataRange();
    if (dr && dr.getNumColumns() > w) w = dr.getNumColumns();
  } catch (e) {
    /* ignore */
  }
  return w;
}

function cbvCoreV2ReadHeaderMap_(sheet) {
  var width = cbvCoreV2SheetOutputWidth_(sheet);
  if (width < 1) return {};
  var headers = sheet.getRange(1, 1, 1, width).getValues()[0];
  var map = {};
  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').trim();
    if (h) map[h] = c + 1;
  }
  return map;
}

/**
 * Ensure sheet exists and row 1 contains at least `requiredHeaders` in order; append missing names at end only.
 * @param {string} sheetName
 * @param {string[]} requiredHeaders
 * @returns {{ sheet: GoogleAppsScript.Spreadsheet.Sheet, created: boolean, appendedHeaders: string[] }}
 */
function cbvCoreV2EnsureSheetWithHeaders_(sheetName, requiredHeaders) {
  var ss = cbvCoreV2GetSpreadsheet_();
  var sheet = ss.getSheetByName(sheetName);
  var created = false;
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    created = true;
  }
  var appended = [];
  var dataLastCol = sheet.getLastColumn();
  if (dataLastCol < 1) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return { sheet: sheet, created: created, appendedHeaders: requiredHeaders.slice() };
  }
  /**
   * Cột cuối có tiêu đề thật ở hàng 1 (không dùng getLastColumn làm “điểm append” — getLastColumn
   * phản ánh cả dữ liệu các hàng dưới, dễ tạo khoảng trống lớn hoặc lệch với manifest).
   */
  var scanCols = Math.max(dataLastCol, 1);
  try {
    var drScan = sheet.getDataRange();
    if (drScan && drScan.getNumColumns() > scanCols) scanCols = drScan.getNumColumns();
  } catch (eScan) {
    /* ignore */
  }
  var row1Raw = sheet.getRange(1, 1, 1, scanCols).getValues()[0];
  var lastHeaderCol = 0;
  var i;
  for (i = 0; i < row1Raw.length; i++) {
    if (String(row1Raw[i] || '').trim() !== '') lastHeaderCol = i + 1;
  }
  var map = {};
  for (i = 0; i < row1Raw.length; i++) {
    var hn = String(row1Raw[i] || '').trim();
    if (hn) map[hn] = i + 1;
  }
  var needAppend = [];
  for (i = 0; i < requiredHeaders.length; i++) {
    var req = requiredHeaders[i];
    if (!map[req]) needAppend.push(req);
  }
  if (!needAppend.length) {
    return { sheet: sheet, created: created, appendedHeaders: appended };
  }
  if (lastHeaderCol < 1) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    appended = requiredHeaders.slice();
  } else {
    var startCol = lastHeaderCol + 1;
    var numAppendCols = needAppend.length;
    /** getRange(row,col,numRows,numColumns) — không phải (startRow,startCol,endRow,endCol) */
    sheet.getRange(1, startCol, 1, numAppendCols).setValues([needAppend]);
    appended = needAppend.slice();
  }
  return { sheet: sheet, created: created, appendedHeaders: appended };
}

/**
 * Same as cbvCoreV2EnsureSheetWithHeaders_ but on an arbitrary spreadsheet (isolated module DB).
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} sheetName
 * @param {string[]} requiredHeaders
 * @returns {{ sheet: GoogleAppsScript.Spreadsheet.Sheet, created: boolean, appendedHeaders: string[] }}
 */
function cbvCoreV2EnsureSheetWithHeadersOnSpreadsheet_(ss, sheetName, requiredHeaders) {
  var sheet = ss.getSheetByName(sheetName);
  var created = false;
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    created = true;
  }
  var appended = [];
  var dataLastCol = sheet.getLastColumn();
  if (dataLastCol < 1) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return { sheet: sheet, created: created, appendedHeaders: requiredHeaders.slice() };
  }
  var scanCols = Math.max(dataLastCol, 1);
  try {
    var drScan = sheet.getDataRange();
    if (drScan && drScan.getNumColumns() > scanCols) scanCols = drScan.getNumColumns();
  } catch (eScan) {
    /* ignore */
  }
  var row1Raw = sheet.getRange(1, 1, 1, scanCols).getValues()[0];
  var lastHeaderCol = 0;
  var i;
  for (i = 0; i < row1Raw.length; i++) {
    if (String(row1Raw[i] || '').trim() !== '') lastHeaderCol = i + 1;
  }
  var map = {};
  for (i = 0; i < row1Raw.length; i++) {
    var hn = String(row1Raw[i] || '').trim();
    if (hn) map[hn] = i + 1;
  }
  var needAppend = [];
  for (i = 0; i < requiredHeaders.length; i++) {
    var req = requiredHeaders[i];
    if (!map[req]) needAppend.push(req);
  }
  if (!needAppend.length) {
    return { sheet: sheet, created: created, appendedHeaders: appended };
  }
  if (lastHeaderCol < 1) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    appended = requiredHeaders.slice();
  } else {
    var startCol = lastHeaderCol + 1;
    var numAppendCols = needAppend.length;
    sheet.getRange(1, startCol, 1, numAppendCols).setValues([needAppend]);
    appended = needAppend.slice();
  }
  return { sheet: sheet, created: created, appendedHeaders: appended };
}

/**
 * Append one data row aligned to physical columns in row 1 (safe if legacy columns precede manifest order).
 * Không dùng appendRow: trên một số sheet getLastColumn() nhỏ (vd 7) trong khi vùng dữ liệu rộng (vd 43),
 * appendRow/setValues nội bộ dễ báo lỗi "Dữ liệu có 7 nhưng dải ô có 43".
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Object<string, *>} valuesByHeader
 */
function cbvCoreV2AppendRowByHeaders_(sheet, valuesByHeader) {
  var width = cbvCoreV2SheetOutputWidth_(sheet);
  if (width < 1) throw new Error('Sheet has no header row');
  var headers = sheet.getRange(1, 1, 1, width).getValues()[0];
  var row = [];
  var c;
  for (c = 0; c < width; c++) {
    var h = String((headers[c] != null ? headers[c] : '') || '').trim();
    row.push(h && valuesByHeader.hasOwnProperty(h) ? valuesByHeader[h] : '');
  }
  var lr = sheet.getLastRow();
  var targetRow = lr + 1;
  /** 1 hàng × width cột; tránh numRows=targetRow (lỗi "1 hàng dữ liệu vs 7 hàng dải ô") */
  sheet.getRange(targetRow, 1, 1, width).setValues([row]);
}

/**
 * @param {string} sheetKey — key in CBV_CORE_V2.SHEETS
 * @param {string} headerKey — key in CBV_CORE_V2.HEADERS
 */
function cbvCoreV2EnsureCoreSheet_(sheetKey, headerKey) {
  var name = CBV_CORE_V2.SHEETS[sheetKey];
  var headers = CBV_CORE_V2.HEADERS[headerKey];
  return cbvCoreV2EnsureSheetWithHeaders_(name, headers);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} columnName
 * @param {*} searchValue
 * @returns {number} row index or -1
 */
function cbvCoreV2FindFirstRowInColumn_(sheet, columnName, searchValue) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var col = map[columnName];
  if (!col) return -1;
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var numRows = last - 2 + 1;
  var values = sheet.getRange(2, col, numRows, 1).getValues();
  var target = searchValue == null ? '' : String(searchValue);
  for (var r = 0; r < values.length; r++) {
    if (String(values[r][0]) === target) return r + 2;
  }
  return -1;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} row
 * @param {Object<string, *>} updatesByHeader
 */
function cbvCoreV2UpdateRowByHeaders_(sheet, row, updatesByHeader) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var keys = Object.keys(updatesByHeader);
  for (var i = 0; i < keys.length; i++) {
    var h = keys[i];
    var col = map[h];
    if (col) {
      sheet.getRange(row, col).setValue(updatesByHeader[h]);
    }
  }
}
