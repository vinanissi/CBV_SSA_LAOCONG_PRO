/**
 * DATA_SYNC_BUILDER — Form sheet → plan JSON (DATA_SYNC_CONTROL!A2).
 * Layout (DATA_SYNC_MODULE_DESIGN.md §2.1): B6/B8 = URL (id chỉ trên dòng JOB B12+);
 *   hàng 7 & 9 = dán header ngang từ cột A. JOB ~A12; COLUMN_MAPS A–H (+ K:M cột không sync). Legacy: header hàng 6/8 cột B.
 */

/**
 * @returns {string}
 */
function dataSyncGetBuilderSheetName_() {
  return (CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.DATA_SYNC_BUILDER)
    ? CBV_CONFIG.SHEETS.DATA_SYNC_BUILDER
    : 'DATA_SYNC_BUILDER';
}

/** Hàng dán header mặc định (form mới: 7 & 9 từ cột A). Legacy dùng dataSyncGetBuilderHeaderPasteConfig_. */
var _BUILDER_PASTE_HEADER_START_COL_NEW = 1;
var _BUILDER_PASTE_SOURCE_ROW_NEW = 7;
var _BUILDER_PASTE_TARGET_ROW_NEW = 9;
/** Legacy: một hàng header / sheet — cột B */
var _BUILDER_PASTE_HEADER_START_COL_LEGACY = 2;
var _BUILDER_PASTE_SOURCE_ROW_LEGACY = 6;
var _BUILDER_PASTE_TARGET_ROW_LEGACY = 8;

/** Layout mới: JOB A12+; map ~A36. Layout cũ (JOB A8) vẫn đọc được qua dataSyncGetBuilderJobDataStart_. */
var _BUILDER_JOB_HEADER_ROW_NEW = 11;
var _BUILDER_JOB_DATA_START_NEW = 12;
var _BUILDER_LEGACY_JOB_DATA_START = 8;

/** Khoảng cố định từ hàng JOB đầu tiên → khối COLUMN_MAPS (đồng nhất bản cũ/mới). */
var _BUILDER_MAP_NOTE_OFFSET = 22;
var _BUILDER_MAP_HEADER_OFFSET = 23;
var _BUILDER_MAP_DATA_OFFSET = 24;

/** Cột M/N (cùng hàng đầu tiên của bảng JOB). */
var _BUILDER_PASTE_SOURCE_COL = 13;
var _BUILDER_PASTE_TARGET_COL = 14;

/** Xóa maps + dropdown tối đa đến hàng này khi regenerate */
var _BUILDER_MAP_MAX_ROW = 2000;

/** COLUMN_MAPS: A–E plan + F–H hiển thị; K–M = cột không sync (theo job). */
var _BUILDER_MAP_ENTRY_WIDTH = 8;
var _BUILDER_DIFF_COL_START = 11;

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 * @returns {number}
 */
function dataSyncGetBuilderJobDataStart_(sh) {
  if (!sh) return _BUILDER_JOB_DATA_START_NEW;
  var vNew = String(sh.getRange(_BUILDER_JOB_DATA_START_NEW, 1).getValue() || '').trim();
  if (vNew) return _BUILDER_JOB_DATA_START_NEW;
  var vLeg = String(sh.getRange(_BUILDER_LEGACY_JOB_DATA_START, 1).getValue() || '').trim();
  if (vLeg && /^JOB_/i.test(vLeg)) return _BUILDER_LEGACY_JOB_DATA_START;
  return _BUILDER_JOB_DATA_START_NEW;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 * @returns {number}
 */
function dataSyncGetBuilderMapDataStart_(sh) {
  return dataSyncGetBuilderJobDataStart_(sh) + _BUILDER_MAP_DATA_OFFSET;
}

/**
 * Hàng JOB cuối cùng (dòng trước khối ghi chú COLUMN_MAPS). Số dòng JOB tối đa = `_BUILDER_MAP_NOTE_OFFSET` (layout cố định).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 * @returns {number}
 */
function dataSyncGetBuilderJobDataEndRow_(sh) {
  return dataSyncGetBuilderJobDataStart_(sh) + _BUILDER_MAP_NOTE_OFFSET - 1;
}

/**
 * Form mới (hình spec): A6 chứa "source spreadsheet"; header ở hàng 7 & 9 từ cột A.
 * Legacy: A6 = "Source →", header hàng 6 & 8 cột B.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 * @returns {{ srcRow: number, tgtRow: number, startCol: number }}
 */
function dataSyncGetBuilderHeaderPasteConfig_(sh) {
  if (!sh) {
    return { srcRow: _BUILDER_PASTE_SOURCE_ROW_NEW, tgtRow: _BUILDER_PASTE_TARGET_ROW_NEW, startCol: _BUILDER_PASTE_HEADER_START_COL_NEW };
  }
  var a6 = String(sh.getRange(6, 1).getValue() || '').toLowerCase();
  if (a6.indexOf('source spreadsheet') !== -1) {
    return { srcRow: _BUILDER_PASTE_SOURCE_ROW_NEW, tgtRow: _BUILDER_PASTE_TARGET_ROW_NEW, startCol: _BUILDER_PASTE_HEADER_START_COL_NEW };
  }
  return { srcRow: _BUILDER_PASTE_SOURCE_ROW_LEGACY, tgtRow: _BUILDER_PASTE_TARGET_ROW_LEGACY, startCol: _BUILDER_PASTE_HEADER_START_COL_LEGACY };
}

/**
 * Đọc **hàng 1** của sheet nguồn/đích (mở từ B6+D6, B8+D8) và ghi ngang vào hàng header dán (form mới: 7 & 9 từ cột A).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} [sh]
 * @returns {{ srcCols: number, tgtCols: number }}
 */
function dataSyncFillHeaderRowsFromFormLinks_(sh) {
  sh = sh || SpreadsheetApp.getActive().getSheetByName(dataSyncGetBuilderSheetName_());
  if (!sh) throw new Error('Chưa có DATA_SYNC_BUILDER');
  var a6 = String(sh.getRange(6, 1).getValue() || '').toLowerCase();
  if (a6.indexOf('source spreadsheet') === -1) {
    throw new Error('Chỉ hỗ trợ form mới (A6 chứa "source spreadsheet"). Legacy: dán header tay.');
  }
  var rawB6 = String(sh.getRange(6, 2).getValue() || '').trim();
  var d6 = String(sh.getRange(6, 4).getValue() || '').trim();
  var rawB8 = String(sh.getRange(8, 2).getValue() || '').trim();
  var d8 = String(sh.getRange(8, 4).getValue() || '').trim();
  if (!d6 || !d8) {
    throw new Error('Cần đủ D6 (tên tab nguồn) và D8 (tên tab đích).');
  }
  var idSrc = cbvNormalizeGoogleSpreadsheetId(rawB6);
  var idTgt = cbvNormalizeGoogleSpreadsheetId(rawB8);
  if (!idSrc || !idTgt) {
    throw new Error('Cần link spreadsheet hợp lệ ở B6 và B8.');
  }
  var ssSrc = SpreadsheetApp.openById(idSrc);
  var ssTgt = SpreadsheetApp.openById(idTgt);
  var sheetSrc = ssSrc.getSheetByName(d6);
  var sheetTgt = ssTgt.getSheetByName(d8);
  if (!sheetSrc) throw new Error('Không tìm thấy sheet nguồn: ' + d6);
  if (!sheetTgt) throw new Error('Không tìm thấy sheet đích: ' + d8);
  var lcSrc = sheetSrc.getLastColumn();
  var lcTgt = sheetTgt.getLastColumn();
  if (lcSrc < 1) throw new Error('Sheet nguồn không có cột (hàng 1).');
  if (lcTgt < 1) throw new Error('Sheet đích không có cột (hàng 1).');
  var rowSrc = sheetSrc.getRange(1, 1, 1, lcSrc).getValues()[0];
  var rowTgt = sheetTgt.getRange(1, 1, 1, lcTgt).getValues()[0];
  var cfg = dataSyncGetBuilderHeaderPasteConfig_(sh);
  var maxClear = Math.max(rowSrc.length, rowTgt.length, 60);
  sh.getRange(cfg.srcRow, cfg.startCol, 1, maxClear).clearContent();
  sh.getRange(cfg.tgtRow, cfg.startCol, 1, maxClear).clearContent();
  sh.getRange(cfg.srcRow, cfg.startCol, 1, rowSrc.length).setValues([rowSrc]);
  sh.getRange(cfg.tgtRow, cfg.startCol, 1, rowTgt.length).setValues([rowTgt]);
  return { srcCols: rowSrc.length, tgtCols: rowTgt.length };
}

/**
 * Đồng bộ B6/D6/B8/D8 → dòng JOB đầu (B–E = source_ss, source_sheet, target_ss, target_sheet). Chỉ layout form mới.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 */
function dataSyncSyncMetaFormToFirstJobRow_(sh) {
  var jStart = dataSyncGetBuilderJobDataStart_(sh);
  if (jStart !== _BUILDER_JOB_DATA_START_NEW) return;
  var a6 = String(sh.getRange(6, 1).getValue() || '').toLowerCase();
  if (a6.indexOf('source spreadsheet') === -1) return;
  var rawB6 = String(sh.getRange(6, 2).getValue() || '').trim();
  var d6 = String(sh.getRange(6, 4).getValue() || '').trim();
  var rawB8 = String(sh.getRange(8, 2).getValue() || '').trim();
  var d8 = String(sh.getRange(8, 4).getValue() || '').trim();
  /** B6/B8 giữ URL; chỉ id thuần ghi xuống JOB (B12+). */
  var b6 = cbvNormalizeGoogleSpreadsheetId(rawB6);
  var b8 = cbvNormalizeGoogleSpreadsheetId(rawB8);
  if (!b6 && !d6 && !b8 && !d8) return;
  sh.getRange(jStart, 2, 1, 4).setValues([[b6, d6, b8, d8]]);
}

/**
 * Cột B,D mỗi dòng JOB: URL spreadsheet → id (ghi lại ô).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 */
function dataSyncNormalizeJobSpreadsheetIdCells_(sh) {
  var jobStart = dataSyncGetBuilderJobDataStart_(sh);
  var endJ = Math.min(sh.getLastRow(), dataSyncGetBuilderJobDataEndRow_(sh));
  var r;
  for (r = jobStart; r <= endJ; r++) {
    var jid = String(sh.getRange(r, 1).getValue() || '').trim();
    if (!jid) break;
    var cols = [2, 4];
    var ci;
    for (ci = 0; ci < cols.length; ci++) {
      var col = cols[ci];
      var raw = String(sh.getRange(r, col).getValue() || '').trim();
      if (!raw) continue;
      var norm = cbvNormalizeGoogleSpreadsheetId(raw);
      if (norm !== raw) sh.getRange(r, col).setValue(norm);
    }
  }
}

/**
 * Form mới: một cặp tên tab từ D6 (source sheet) và D8 (target sheet).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 * @returns {{ src: string, tgt: string } | null}
 */
function dataSyncGetMetaSheetPairForImport_(sh) {
  var a6 = String(sh.getRange(6, 1).getValue() || '').toLowerCase();
  if (a6.indexOf('source spreadsheet') === -1) return null;
  var d6 = String(sh.getRange(6, 4).getValue() || '').trim();
  var d8 = String(sh.getRange(8, 4).getValue() || '').trim();
  if (!d6 || !d8) return null;
  return { src: d6, tgt: d8 };
}

/**
 * Trước Generate: cột G (keyColumns) = `from` của dòng COLUMN_MAPS đầu tiên theo job_id.
 * Không ghi đè key dạng composite (có dấu phẩy).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 */
function dataSyncSyncKeyColumnFromFirstMap_(sh) {
  var jobStart = dataSyncGetBuilderJobDataStart_(sh);
  var mapDataStart = dataSyncGetBuilderMapDataStart_(sh);
  var lr = sh.getLastRow();
  var firstByJob = {};
  var r;
  var endMap = Math.min(Math.max(lr, mapDataStart), mapDataStart + _BUILDER_MAP_MAX_ROW - 1);
  for (r = mapDataStart; r <= endMap; r++) {
    var jid = String(sh.getRange(r, 1).getValue() || '').trim();
    var fr = String(sh.getRange(r, 2).getValue() || '').trim();
    if (!jid || !fr) continue;
    if (!(jid in firstByJob)) firstByJob[jid] = fr;
  }
  var endJ = Math.min(lr, dataSyncGetBuilderJobDataEndRow_(sh));
  for (r = jobStart; r <= endJ; r++) {
    var jid2 = String(sh.getRange(r, 1).getValue() || '').trim();
    if (!jid2) break;
    if (!firstByJob[jid2]) continue;
    var cur = String(sh.getRange(r, 7).getValue() || '').trim();
    if (cur.indexOf(',') !== -1) continue;
    sh.getRange(r, 7).setValue(firstByJob[jid2]);
  }
}

/**
 * Tạo sheet mẫu DATA_SYNC_BUILDER một lần. Nếu sheet đã tồn tại → trả về luôn (không ghi đè).
 * Muốn làm lại mẫu: xóa tab DATA_SYNC_BUILDER rồi chạy menu lại.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function ensureDataSyncBuilderSheet() {
  var ss = SpreadsheetApp.getActive();
  var name = dataSyncGetBuilderSheetName_();
  var sheet = ss.getSheetByName(name);
  if (sheet) {
    return sheet;
  }
  sheet = ss.insertSheet(name);

  var rTitle = sheet.getRange('A1');
  rTitle.setValue('DATA_SYNC_BUILDER — hàng 6/8 meta (B,D); hàng 7/9 dán header từ A; JOB A12; → CONTROL A2');
  rTitle.setFontWeight('bold');
  sheet.getRange('A2').setValue('version');
  sheet.getRange('B2').setValue('1.0');
  sheet.getRange('A3').setValue('planId (optional)');
  sheet.getRange('A4').setValue('description (optional)');

  sheet.getRange('A5').setValue('DÁN HEADER (1 hàng = danh sách tên cột ngang từ cột A)');
  sheet.getRange('A5').setFontWeight('bold');

  sheet.getRange('A6').setValue('source spreadsheet:');
  sheet.getRange('B6').setValue('');
  sheet.getRange('C6').setValue('source sheet:');
  sheet.getRange('D6').setValue('_TEST_SYNC_SOURCE');
  sheet.getRange('A6:D6').setFontWeight('bold');

  sheet.getRange(7, 1, 1, 5).setValues([['MA_HO_SO', 'HO_TEN', 'TINH_TRANG', 'SO_TIEN', 'NGAY_TAO']]);

  sheet.getRange('A8').setValue('target spreadsheet:');
  sheet.getRange('B8').setValue('');
  sheet.getRange('C8').setValue('target sheet:');
  sheet.getRange('D8').setValue('_TEST_SYNC_TARGET');
  sheet.getRange('A8:D8').setFontWeight('bold');

  sheet.getRange(9, 1, 1, 6).setValues([['MA_HO_SO', 'HO_TEN', 'BIEN_SO_XE', 'TINH_TRANG', 'SO_TIEN', 'NGAY_TAO']]);

  var jHdr = _BUILDER_JOB_HEADER_ROW_NEW;
  var jData = _BUILDER_JOB_DATA_START_NEW;
  var mapNoteRow = _BUILDER_JOB_DATA_START_NEW + _BUILDER_MAP_NOTE_OFFSET;
  var mapHdrRow = _BUILDER_JOB_DATA_START_NEW + _BUILDER_MAP_HEADER_OFFSET;
  var mapDataRow = _BUILDER_JOB_DATA_START_NEW + _BUILDER_MAP_DATA_OFFSET;

  var rJobNote = sheet.getRange('A10');
  rJobNote.setValue('JOBS — một dòng = một job. Hàng 6/8 (B,D) đồng bộ xuống JOB khi Generate. Import nhiều job: menu Import — điền hai cột bên phải bảng cùng hàng JOB.');
  rJobNote.setFontStyle('italic');
  var jobHeaders = [
    'job_id',
    'source_spreadsheet_id',
    'source_sheet',
    'target_spreadsheet_id',
    'target_sheet',
    'mode',
    'keyColumns',
    'onDuplicateSourceKey',
    'keyNormalization',
    'maxErrorRows',
    'onMissingTargetColumn',
    'onSourceKeyMissing'
  ];
  var rJobHdr = sheet.getRange(jHdr, 1, 1, jobHeaders.length);
  rJobHdr.setValues([jobHeaders]);
  rJobHdr.setFontWeight('bold');

  sheet.getRange(jData, 1, 1, 12).setValues([[
    'JOB_1',
    '',
    '_TEST_SYNC_SOURCE',
    '',
    '_TEST_SYNC_TARGET',
    'append_only',
    'MA_HO_SO',
    'error',
    'upper_trim',
    '5',
    'error',
    'error'
  ]]);

  var rMapNote = sheet.getRange('A' + mapNoteRow);
  rMapNote.setValue(
    'COLUMN_MAPS — A–E = plan (from→to); F–H = chỉ số cột 1-based + same_name (Yes/No). K–M: cột chỉ nguồn / chỉ đích (không sync), cùng hàng dòng map đầu của job.'
  );
  rMapNote.setFontStyle('italic');
  var mapHeaders = ['job_id', 'from', 'to', 'transform', 'enumMapRef', 'src_col#', 'tgt_col#', 'same_name'];
  var rMapHdr = sheet.getRange(mapHdrRow, 1, 1, mapHeaders.length);
  rMapHdr.setValues([mapHeaders]);
  rMapHdr.setFontWeight('bold');
  var diffHdr = ['job_id', 'cols_src_only', 'cols_tgt_only'];
  sheet.getRange(mapHdrRow, _BUILDER_DIFF_COL_START, 1, diffHdr.length).setValues([diffHdr]).setFontWeight('bold');

  sheet.getRange(mapDataRow, 1, 3, 8).setValues([
    ['JOB_1', 'MA_HO_SO', 'MA_HO_SO', '', '', 1, 1, 'Yes'],
    ['JOB_1', 'HO_TEN', 'HO_TEN', '', '', 2, 2, 'Yes'],
    ['JOB_1', 'TINH_TRANG', 'TINH_TRANG', '', '', 3, 4, 'Yes']
  ]);
  sheet.getRange(mapDataRow, _BUILDER_DIFF_COL_START, 1, 3).setValues([['JOB_1', '', 'BIEN_SO_XE']]);

  sheet.setColumnWidths(1, 1, 120);
  sheet.setColumnWidths(2, 11, 140);
  sheet.setColumnWidth(13, 200);
  sheet.setColumnWidth(14, 200);
  dataSyncSyncMetaFormToFirstJobRow_(sheet);

  sheet.getRange('A1').setWrap(true);
  return sheet;
}

/**
 * Thêm nhãn form (hàng 5–9 hoặc legacy) nếu sheet builder cũ chưa có.
 */
function ensureDataSyncBuilderPasteArea() {
  var sh = SpreadsheetApp.getActive().getSheetByName(dataSyncGetBuilderSheetName_());
  if (!sh) return null;
  var a5 = sh.getRange(5, 1).getValue();
  if (a5 === '' || a5 == null) {
    sh.getRange(5, 1).setValue('DÁN HEADER (1 hàng = danh sách tên cột ngang từ cột A)').setFontWeight('bold');
  }
  var a6 = String(sh.getRange(6, 1).getValue() || '').trim();
  if (!a6) {
    sh.getRange(6, 1).setValue('source spreadsheet:').setFontWeight('bold');
    sh.getRange(6, 3).setValue('source sheet:').setFontWeight('bold');
    sh.getRange(8, 1).setValue('target spreadsheet:').setFontWeight('bold');
    sh.getRange(8, 3).setValue('target sheet:').setFontWeight('bold');
  }

  sh.setColumnWidth(13, 200);
  sh.setColumnWidth(14, 200);

  var jStart = dataSyncGetBuilderJobDataStart_(sh);
  var mapHdrRow = jStart + _BUILDER_MAP_HEADER_OFFSET;
  var h6 = String(sh.getRange(mapHdrRow, 6).getValue() || '').trim();
  if (h6 !== 'src_col#') {
    sh.getRange(mapHdrRow, 1, 1, _BUILDER_MAP_ENTRY_WIDTH)
      .setValues([['job_id', 'from', 'to', 'transform', 'enumMapRef', 'src_col#', 'tgt_col#', 'same_name']])
      .setFontWeight('bold');
  }
  var hK = String(sh.getRange(mapHdrRow, _BUILDER_DIFF_COL_START).getValue() || '').trim();
  if (!hK) {
    sh.getRange(mapHdrRow, _BUILDER_DIFF_COL_START, 1, 3)
      .setValues([['job_id', 'cols_src_only', 'cols_tgt_only']])
      .setFontWeight('bold');
  }
  return sh;
}

/**
 * Đọc hàng 1 sheet (header), bỏ ô trống.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {string[]}
 */
function dataSyncGetHeaderRow1Values_(sheet) {
  if (!sheet) return [];
  var lc = sheet.getLastColumn();
  if (lc < 1) return [];
  var raw = sheet.getRange(1, 1, 1, lc).getValues()[0];
  var out = [];
  var i;
  for (i = 0; i < raw.length; i++) {
    var h = String(raw[i] || '').trim();
    if (h) out.push(h);
  }
  return out;
}

/**
 * Đọc một hàng dán header (trái → phải), từ cột start đến lastColumn.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 * @param {number} row
 * @param {number} startCol
 * @returns {string[]}
 */
function dataSyncReadHorizontalHeaderRow_(sh, row, startCol) {
  if (!sh || row < 1) return [];
  var lc = sh.getLastColumn();
  if (lc < startCol) return [];
  var raw = sh.getRange(row, startCol, 1, lc - startCol + 1).getValues()[0];
  var out = [];
  var i;
  for (i = 0; i < raw.length; i++) {
    var h = String(raw[i] || '').trim();
    if (h) out.push(h);
  }
  return out;
}

/**
 * Một hàng raw (mảng ô) → tên cột không rỗng (giữ thứ tự).
 * @param {Array} raw
 * @returns {string[]}
 */
function dataSyncRawRowToHeaderNames_(raw) {
  var out = [];
  var i;
  for (i = 0; i < raw.length; i++) {
    var h = String(raw[i] || '').trim();
    if (h) out.push(h);
  }
  return out;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 * @param {number} row
 * @param {number} startCol
 * @returns {Array}
 */
function dataSyncGetBuilderHeaderRowRaw_(sh, row, startCol) {
  if (!sh || row < 1) return [];
  var lc = sh.getLastColumn();
  if (lc < startCol) return [];
  return sh.getRange(row, startCol, 1, lc - startCol + 1).getValues()[0];
}

/**
 * Chỉ số cột 1-based (theo sheet) của tên header trong một hàng raw dán form.
 * @param {Array} raw
 * @param {number} startCol
 * @param {string} name
 * @returns {number|string}
 */
function dataSyncColumnIndex1BasedInRaw_(raw, startCol, name) {
  var w = String(name || '').trim().toLowerCase();
  var i;
  for (i = 0; i < raw.length; i++) {
    if (String(raw[i] || '').trim().toLowerCase() === w) return startCol + i;
  }
  return '';
}

/**
 * Chỉ số cột 1-based trên sheet thật (hàng 1).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} name
 * @returns {number|string}
 */
function dataSyncSheetHeaderColumnIndexByName_(sheet, name) {
  if (!sheet) return '';
  var lc = sheet.getLastColumn();
  if (lc < 1) return '';
  var raw = sheet.getRange(1, 1, 1, lc).getValues()[0];
  var w = String(name || '').trim().toLowerCase();
  var i;
  for (i = 0; i < raw.length; i++) {
    if (String(raw[i] || '').trim().toLowerCase() === w) return i + 1;
  }
  return '';
}

/**
 * @param {string[]} hAll
 * @param {{ from: string, to: string }[]} pairs
 * @returns {string[]}
 */
function dataSyncHeadersNotInMappedFrom_(hAll, pairs) {
  var m = {};
  var i;
  for (i = 0; i < pairs.length; i++) {
    m[String(pairs[i].from || '').trim().toLowerCase()] = true;
  }
  return hAll.filter(function(h) {
    return !m[String(h || '').trim().toLowerCase()];
  });
}

/**
 * @param {string[]} hAll
 * @param {{ from: string, to: string }[]} pairs
 * @returns {string[]}
 */
function dataSyncHeadersNotInMappedTo_(hAll, pairs) {
  var m = {};
  var i;
  for (i = 0; i < pairs.length; i++) {
    m[String(pairs[i].to || '').trim().toLowerCase()] = true;
  }
  return hAll.filter(function(h) {
    return !m[String(h || '').trim().toLowerCase()];
  });
}

/**
 * Ghép cặp from→to khi tên cột khớp (không phân biệt hoa thường).
 * @param {string[]} hSrc
 * @param {string[]} hTgt
 * @returns {{ from: string, to: string }[]}
 */
function dataSyncMatchHeadersToColumnPairs_(hSrc, hTgt) {
  var tgtByLower = {};
  var i;
  for (i = 0; i < hTgt.length; i++) {
    var t = String(hTgt[i] || '').trim();
    if (!t) continue;
    tgtByLower[t.toLowerCase()] = t;
  }
  var pairs = [];
  for (i = 0; i < hSrc.length; i++) {
    var s = String(hSrc[i] || '').trim();
    if (!s) continue;
    var tl = tgtByLower[s.toLowerCase()];
    if (tl) pairs.push({ from: s, to: tl });
  }
  return pairs;
}

/**
 * Import: đọc hai cột (13–14) cùng hàng với JOB → ghi bảng JOB. F:L lấy mẫu từ dòng đầu hoặc default.
 * @returns {number} số job đã import
 */
function dataSyncImportJobsFromPasteColumns_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(dataSyncGetBuilderSheetName_());
  if (!sh) throw new Error('Chưa có DATA_SYNC_BUILDER');

  dataSyncSyncMetaFormToFirstJobRow_(sh);
  var jobStart = dataSyncGetBuilderJobDataStart_(sh);
  var jobEndRow = dataSyncGetBuilderJobDataEndRow_(sh);
  var jobSlotCount = jobEndRow - jobStart + 1;

  /** F:L = 7 cột; tránh (jobStart,6,jobStart,12) → numRows=jobStart, tpl 12 phần tử */
  var tpl = sh.getRange(jobStart, 6, 1, 7).getValues()[0];
  if (!tpl || tpl.every(function(x) { return x === '' || x == null; })) {
    tpl = ['upsert', 'MA_HO_SO', 'error', 'upper_trim', '0', 'error', 'error'];
  }

  /** Id spreadsheet từ form B6/B8 (giống sync meta) — không để trống B,D sau import. */
  var idSrcMeta = '';
  var idTgtMeta = '';
  var a6 = String(sh.getRange(6, 1).getValue() || '').toLowerCase();
  if (a6.indexOf('source spreadsheet') !== -1) {
    idSrcMeta = cbvNormalizeGoogleSpreadsheetId(String(sh.getRange(6, 2).getValue() || '').trim());
    idTgtMeta = cbvNormalizeGoogleSpreadsheetId(String(sh.getRange(8, 2).getValue() || '').trim());
  }

  var pairs = [];
  var r;
  for (r = jobStart; r <= jobEndRow; r++) {
    var sv = sh.getRange(r, _BUILDER_PASTE_SOURCE_COL).getValue();
    var tv = sh.getRange(r, _BUILDER_PASTE_TARGET_COL).getValue();
    var s = sv == null ? '' : String(sv).trim();
    var t = tv == null ? '' : String(tv).trim();
    if (!s && !t) break;
    if (!s || !t) {
      throw new Error('Hàng ' + r + ': cần đủ tên sheet nguồn và đích (hai cột import cùng hàng).');
    }
    pairs.push({ src: s, tgt: t });
  }
  if (pairs.length === 0) {
    var metaPair = dataSyncGetMetaSheetPairForImport_(sh);
    if (metaPair) pairs.push(metaPair);
  }
  if (pairs.length === 0) {
    throw new Error(
      'Chưa có tên sheet: điền D6 & D8 (source sheet / target sheet), hoặc hai cột bên phải bảng JOB (từ hàng ' + jobStart + ').'
    );
  }
  if (pairs.length > jobSlotCount) {
    throw new Error('Quá nhiều job: tối đa ' + jobSlotCount + ' dòng trong bảng JOB (trước COLUMN_MAPS).');
  }

  /** Chỉ xóa vùng bảng JOB — không tràn xuống COLUMN_MAPS (trước đây dùng 200 hàng). */
  var clearR = sh.getRange(jobStart, 1, jobSlotCount, 12);
  clearR.clearContent();
  clearR.clearDataValidations();

  var n;
  for (n = 0; n < pairs.length; n++) {
    var jid = 'JOB_' + (n + 1);
    var row = [jid, idSrcMeta || '', pairs[n].src, idTgtMeta || '', pairs[n].tgt].concat(tpl);
    sh.getRange(jobStart + n, 1, 1, 12).setValues([row]);
  }
  return pairs.length;
}

/**
 * Xóa vùng COLUMN_MAPS rồi điền cặp from/to (khớp tên).
 * Nếu hàng 6 và 8 có dán header → dùng hai hàng đó cho mọi job (cùng lược đồ cột).
 * Nếu không → đọc hàng 1 thật trên sheet nguồn/đích (mỗi job một cặp sheet).
 * Luôn đặt keyColumns (G) = `from` của cặp map đầu (khớp sheet / form, tránh mẫu MA_HO_SO lệch).
 */
function dataSyncAutoFillColumnMapsFromHeaders_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(dataSyncGetBuilderSheetName_());
  if (!sh) throw new Error('Chưa có DATA_SYNC_BUILDER');

  dataSyncSyncMetaFormToFirstJobRow_(sh);
  var pasteCfg = dataSyncGetBuilderHeaderPasteConfig_(sh);
  var jobStart = dataSyncGetBuilderJobDataStart_(sh);
  var mapDataStart = dataSyncGetBuilderMapDataStart_(sh);
  var mapHdrRow = jobStart + _BUILDER_MAP_HEADER_OFFSET;
  var mapClearNumRows = Math.max(0, _BUILDER_MAP_MAX_ROW - mapDataStart + 1);
  var rngMap = sh.getRange(mapDataStart, 1, mapClearNumRows, _BUILDER_MAP_ENTRY_WIDTH);
  rngMap.clearContent();
  rngMap.clearDataValidations();
  sh.getRange(mapDataStart, _BUILDER_DIFF_COL_START, mapClearNumRows, 3).clearContent();

  var hPasteSrc = dataSyncReadHorizontalHeaderRow_(sh, pasteCfg.srcRow, pasteCfg.startCol);
  var hPasteTgt = dataSyncReadHorizontalHeaderRow_(sh, pasteCfg.tgtRow, pasteCfg.startCol);
  var usePaste = hPasteSrc.length > 0 && hPasteTgt.length > 0;
  var rawSrcGlobal;
  var rawTgtGlobal;
  if (usePaste) {
    rawSrcGlobal = dataSyncGetBuilderHeaderRowRaw_(sh, pasteCfg.srcRow, pasteCfg.startCol);
    rawTgtGlobal = dataSyncGetBuilderHeaderRowRaw_(sh, pasteCfg.tgtRow, pasteCfg.startCol);
  }

  var last = sh.getLastRow();
  var endJ = Math.min(last, dataSyncGetBuilderJobDataEndRow_(sh));
  var outRows = [];
  var diffByJob = {};
  var firstMapRowByJob = {};
  var jobOrder = [];
  var r;
  for (r = jobStart; r <= endJ; r++) {
    var jid = String(sh.getRange(r, 1).getValue() || '').trim();
    if (!jid) break;
    var srcName = String(sh.getRange(r, 3).getValue() || '').trim();
    var tgtName = String(sh.getRange(r, 5).getValue() || '').trim();
    if (!srcName || !tgtName) continue;

    var pairs;
    var hNamesSrc;
    var hNamesTgt;
    var sSrc;
    var sTgt;
    if (usePaste) {
      hNamesSrc = dataSyncRawRowToHeaderNames_(rawSrcGlobal);
      hNamesTgt = dataSyncRawRowToHeaderNames_(rawTgtGlobal);
      pairs = dataSyncMatchHeadersToColumnPairs_(hNamesSrc, hNamesTgt);
    } else {
      sSrc = ss.getSheetByName(srcName);
      sTgt = ss.getSheetByName(tgtName);
      if (!sSrc || !sTgt) {
        throw new Error('Job ' + jid + ': không mở được sheet ' + (!sSrc ? srcName : tgtName));
      }
      hNamesSrc = dataSyncGetHeaderRow1Values_(sSrc);
      hNamesTgt = dataSyncGetHeaderRow1Values_(sTgt);
      pairs = dataSyncMatchHeadersToColumnPairs_(hNamesSrc, hNamesTgt);
    }
    if (pairs.length === 0) {
      throw new Error(
        usePaste
          ? 'Không có cặp cột trùng tên giữa header đã dán (hai hàng header form).'
          : 'Job ' + jid + ': không có cột trùng tên giữa header hai sheet.'
      );
    }
    sh.getRange(r, 7).setValue(pairs[0].from);

    var srcOnly = dataSyncHeadersNotInMappedFrom_(hNamesSrc, pairs);
    var tgtOnly = dataSyncHeadersNotInMappedTo_(hNamesTgt, pairs);
    diffByJob[jid] = {
      src: srcOnly.join(', '),
      tgt: tgtOnly.join(', ')
    };
    jobOrder.push(jid);
    firstMapRowByJob[jid] = mapDataStart + outRows.length;

    var p;
    for (p = 0; p < pairs.length; p++) {
      var sc;
      var tc;
      if (usePaste) {
        sc = dataSyncColumnIndex1BasedInRaw_(rawSrcGlobal, pasteCfg.startCol, pairs[p].from);
        tc = dataSyncColumnIndex1BasedInRaw_(rawTgtGlobal, pasteCfg.startCol, pairs[p].to);
      } else {
        sc = dataSyncSheetHeaderColumnIndexByName_(sSrc, pairs[p].from);
        tc = dataSyncSheetHeaderColumnIndexByName_(sTgt, pairs[p].to);
      }
      var sameNm =
        String(pairs[p].from || '').trim().toLowerCase() === String(pairs[p].to || '').trim().toLowerCase()
          ? 'Yes'
          : 'No';
      outRows.push([jid, pairs[p].from, pairs[p].to, '', '', sc, tc, sameNm]);
    }
  }

  if (outRows.length === 0) {
    throw new Error('Không tạo được dòng map nào.');
  }
  sh.getRange(mapDataStart, 1, outRows.length, _BUILDER_MAP_ENTRY_WIDTH).setValues(outRows);

  var j;
  for (j = 0; j < jobOrder.length; j++) {
    var jidW = jobOrder[j];
    var row0 = firstMapRowByJob[jidW];
    var d = diffByJob[jidW];
    sh.getRange(row0, _BUILDER_DIFF_COL_START, 1, 3).setValues([[jidW, d.src, d.tgt]]);
  }

  sh.getRange(mapHdrRow, 1, 1, _BUILDER_MAP_ENTRY_WIDTH)
    .setValues([['job_id', 'from', 'to', 'transform', 'enumMapRef', 'src_col#', 'tgt_col#', 'same_name']])
    .setFontWeight('bold');
  sh.getRange(mapHdrRow, _BUILDER_DIFF_COL_START, 1, 3)
    .setValues([['job_id', 'cols_src_only', 'cols_tgt_only']])
    .setFontWeight('bold');

  return outRows.length;
}

/**
 * Dropdown from/to: nếu đã dán hàng 6/8 thì list theo dán; không thì theo hàng 1 sheet từng job.
 */
function dataSyncApplyColumnMapDropdowns_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(dataSyncGetBuilderSheetName_());
  if (!sh) throw new Error('Chưa có DATA_SYNC_BUILDER');

  dataSyncSyncMetaFormToFirstJobRow_(sh);
  var pasteCfg = dataSyncGetBuilderHeaderPasteConfig_(sh);
  var listFromPasteSrc = dataSyncReadHorizontalHeaderRow_(sh, pasteCfg.srcRow, pasteCfg.startCol);
  var listFromPasteTgt = dataSyncReadHorizontalHeaderRow_(sh, pasteCfg.tgtRow, pasteCfg.startCol);
  var usePasteLists = listFromPasteSrc.length > 0 && listFromPasteTgt.length > 0;

  var jobStart = dataSyncGetBuilderJobDataStart_(sh);
  var mapDataStart = dataSyncGetBuilderMapDataStart_(sh);
  var jobMeta = {};
  var lr = sh.getLastRow();
  var r;
  for (r = jobStart; r <= Math.min(lr, dataSyncGetBuilderJobDataEndRow_(sh)); r++) {
    var jid = String(sh.getRange(r, 1).getValue() || '').trim();
    if (!jid) break;
    jobMeta[jid] = {
      src: String(sh.getRange(r, 3).getValue() || '').trim(),
      tgt: String(sh.getRange(r, 5).getValue() || '').trim()
    };
  }

  var lastMap = Math.max(lr, mapDataStart);
  for (r = mapDataStart; r <= lastMap; r++) {
    var mj = String(sh.getRange(r, 1).getValue() || '').trim();
    if (!mj && !String(sh.getRange(r, 2).getValue() || '').trim()) continue;
    if (!mj) continue;
    var meta = jobMeta[mj];
    sh.getRange(r, 2).clearDataValidations();
    sh.getRange(r, 3).clearDataValidations();
    if (!meta || !meta.src || !meta.tgt) continue;
    var listSrc;
    var listTgt;
    if (usePasteLists) {
      listSrc = listFromPasteSrc.slice(0, 450);
      listTgt = listFromPasteTgt.slice(0, 450);
    } else {
      var sheetSrc = ss.getSheetByName(meta.src);
      var sheetTgt = ss.getSheetByName(meta.tgt);
      if (!sheetSrc || !sheetTgt) continue;
      var hSrc = dataSyncGetHeaderRow1Values_(sheetSrc);
      var hTgt = dataSyncGetHeaderRow1Values_(sheetTgt);
      if (hSrc.length === 0 || hTgt.length === 0) continue;
      listSrc = hSrc.slice(0, 450);
      listTgt = hTgt.slice(0, 450);
    }
    var dvB = SpreadsheetApp.newDataValidation().requireValueInList(listSrc, true).setAllowInvalid(true).build();
    var dvC = SpreadsheetApp.newDataValidation().requireValueInList(listTgt, true).setAllowInvalid(true).build();
    sh.getRange(r, 2).setDataValidation(dvB);
    sh.getRange(r, 3).setDataValidation(dvC);
  }
}

/**
 * Đọc DATA_SYNC_BUILDER → object plan.
 * @returns {Object}
 * @throws {Error}
 */
function buildPlanObjectFromBuilderSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(dataSyncGetBuilderSheetName_());
  if (!sh) {
    throw new Error('Chưa có sheet ' + dataSyncGetBuilderSheetName_() + '. Menu → Ensure builder sheet.');
  }
  dataSyncSyncMetaFormToFirstJobRow_(sh);
  dataSyncNormalizeJobSpreadsheetIdCells_(sh);
  dataSyncSyncKeyColumnFromFirstMap_(sh);
  var version = String(sh.getRange('B2').getValue() || '1.0').trim();
  var planId = String(sh.getRange('B3').getValue() || '').trim();
  var desc = String(sh.getRange('B4').getValue() || '').trim();
  var plan = { version: version, jobs: [] };
  if (planId) plan.planId = planId;
  if (desc) plan.description = desc;

  var jobStart = dataSyncGetBuilderJobDataStart_(sh);
  var mapDataStart = dataSyncGetBuilderMapDataStart_(sh);
  var last = sh.getLastRow();
  var jobs = [];
  var seenIds = {};
  var r;
  var endJob = Math.min(last, dataSyncGetBuilderJobDataEndRow_(sh));

  for (r = jobStart; r <= endJob; r++) {
    var row = sh.getRange(r, 1, 1, 12).getValues()[0];
    var jid = String(row[0] || '').trim();
    if (!jid) break;
    if (seenIds[jid]) {
      throw new Error('Trùng job_id: ' + jid);
    }
    seenIds[jid] = true;

    var srcSheet = String(row[2] || '').trim();
    var tgtSheet = String(row[4] || '').trim();
    if (!srcSheet || !tgtSheet) {
      throw new Error('Job ' + jid + ': source_sheet và target_sheet bắt buộc.');
    }
    var source = { sheetName: srcSheet };
    var sssid = cbvNormalizeGoogleSpreadsheetId(String(row[1] || ''));
    if (sssid) source.spreadsheetId = sssid;
    var target = { sheetName: tgtSheet };
    var tsid = cbvNormalizeGoogleSpreadsheetId(String(row[3] || ''));
    if (tsid) target.spreadsheetId = tsid;

    var keyCols = String(row[6] || '')
      .split(',')
      .map(function(x) {
        return x.trim();
      })
      .filter(Boolean);
    if (keyCols.length === 0) {
      throw new Error('Job ' + jid + ': keyColumns trống (vd: MA_HO_SO hoặc A,B).');
    }

    var maxEr = parseInt(row[9], 10);
    if (isNaN(maxEr) || maxEr < 0) maxEr = 0;

    var job = {
      id: jid,
      source: source,
      target: target,
      mode: String(row[5] || 'upsert').trim(),
      keyColumns: keyCols,
      onDuplicateSourceKey: String(row[7] || 'error').trim(),
      keyNormalization: String(row[8] || 'upper_trim').trim(),
      maxErrorRows: maxEr,
      onMissingTargetColumn: String(row[10] || 'error').trim(),
      onSourceKeyMissing: String(row[11] || 'error').trim(),
      columnMap: []
    };
    jobs.push(job);
  }

  if (jobs.length === 0) {
    throw new Error('Chưa có dòng job (cột job_id từ hàng ' + jobStart + ').');
  }

  var mapByJob = {};
  var r2;
  var endMap = Math.max(last, mapDataStart);
  for (r2 = mapDataStart; r2 <= endMap; r2++) {
    var mr = sh.getRange(r2, 1, 1, 5).getValues()[0];
    var mjid = String(mr[0] || '').trim();
    var mfrom = String(mr[1] || '').trim();
    var mto = String(mr[2] || '').trim();
    if (!mjid && !mfrom && !mto) {
      continue;
    }
    if (!mjid || !mfrom || !mto) {
      throw new Error('Column map hàng ' + r2 + ': cần đủ job_id, from, to.');
    }
    var ent = { from: mfrom, to: mto };
    var tr = String(mr[3] || '').trim();
    if (tr) ent.transform = tr;
    var er = String(mr[4] || '').trim();
    if (er) ent.enumMapRef = er;
    if (!mapByJob[mjid]) mapByJob[mjid] = [];
    mapByJob[mjid].push(ent);
  }

  var i;
  for (i = 0; i < jobs.length; i++) {
    var j = jobs[i];
    j.columnMap = mapByJob[j.id] || [];
    if (j.columnMap.length === 0) {
      throw new Error('Job ' + j.id + ': chưa có dòng COLUMN_MAPS nào.');
    }
  }

  plan.jobs = jobs;
  return plan;
}
