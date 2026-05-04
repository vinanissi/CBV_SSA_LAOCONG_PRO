/**
 * HO_SO V2 — print worker: PENDING job → Docs template merge → PDF → Drive → row update.
 * Sheets via HOSO_Config_getSheet_ only (no hardcoded spreadsheet/tab names).
 */

/** @returns {{ source: string }} */
function HosoPrintWorker_configContext_() {
  return { source: 'PRINT_WORKER' };
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {Object<string, number>}
 */
function HosoPrintWorker_getHeaderMap_(sheet) {
  if (typeof cbvCoreV2ReadHeaderMap_ === 'function') {
    return cbvCoreV2ReadHeaderMap_(sheet);
  }
  return cbvCoreV2ReadHeaderMap_local_(sheet);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} rowIndex
 * @returns {Object<string, string>}
 */
function HosoPrintWorker_rowToObject_(sheet, rowIndex) {
  var map = HosoPrintWorker_getHeaderMap_(sheet);
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return {};
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var vals = sheet.getRange(rowIndex, 1, rowIndex, lastCol).getValues()[0];
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
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} rowIndex
 * @param {Object<string, *>} updates
 */
function HosoPrintWorker_updateRow_(sheet, rowIndex, updates) {
  if (typeof cbvCoreV2UpdateRowByHeaders_ === 'function') {
    cbvCoreV2UpdateRowByHeaders_(sheet, rowIndex, updates);
    return;
  }
  cbvCoreV2UpdateRowByHeaders_local_(sheet, rowIndex, updates);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} columnName
 * @param {string} value
 * @returns {number} row or -1
 */
function HosoPrintWorker_findFirstBy_(sheet, columnName, value) {
  if (typeof cbvCoreV2FindFirstRowInColumn_ === 'function') {
    return cbvCoreV2FindFirstRowInColumn_(sheet, columnName, value);
  }
  return cbvCoreV2FindFirstRowInColumn_local_(sheet, columnName, value);
}

/**
 * @param {string} templateCode
 * @returns {Object<string, string>|null}
 */
function HosoPrintWorker_findTemplate_(templateCode) {
  var ctx = HosoPrintWorker_configContext_();
  var sh = HOSO_Config_getSheet_('TEMPLATE', ctx);
  var tc = String(templateCode || '').trim();
  if (!tc) return null;
  var last = sh.getLastRow();
  if (last < 2) return null;
  var map = HosoPrintWorker_getHeaderMap_(sh);
  var cCode = map['TEMPLATE_CODE'];
  var cStatus = map['STATUS'];
  if (!cCode || !cStatus) return null;
  var r;
  for (r = 2; r <= last; r++) {
    var code = String(sh.getRange(r, cCode).getValue() || '').trim();
    if (code !== tc) continue;
    var st = String(sh.getRange(r, cStatus).getValue() || '').trim().toUpperCase();
    if (st !== 'ACTIVE') continue;
    return HosoPrintWorker_rowToObject_(sh, r);
  }
  return null;
}

/**
 * Escape for use inside a RegExp pattern (Document replaceText).
 * @param {string} text
 * @returns {string}
 */
function HosoPrintWorker_escapeReplaceText_(text) {
  return String(text == null ? '' : text).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

/**
 * Replacement side for Document.replaceText ($ is special).
 * @param {string} text
 * @returns {string}
 */
function HosoPrintWorker_escapeReplaceValue_(text) {
  return String(text == null ? '' : text).replace(/\$/g, '$$$$');
}

/**
 * @param {*} raw
 * @returns {*}
 */
function HosoPrintWorker_parseJson_(raw) {
  if (typeof cbvCoreV2SafeParseJson_ === 'function') {
    return cbvCoreV2SafeParseJson_(raw);
  }
  return cbvCoreV2SafeParseJson_local_(raw);
}

/**
 * @returns {string}
 */
function HosoPrintWorker_now_() {
  if (typeof cbvCoreV2IsoNow_ === 'function') {
    return cbvCoreV2IsoNow_();
  }
  return cbvCoreV2IsoNow_local_();
}

/**
 * @param {string} part
 * @returns {string}
 */
function HosoPrintWorker_sanitizeFilePart_(part) {
  var s = String(part == null ? '' : part).replace(/[\\/:*?"<>|\r\n\t\f\v]/g, '_').trim();
  return s || 'NA';
}

/**
 * @param {string} templateSourceId
 * @param {string} [outputFolderId]
 * @returns {GoogleAppsScript.Drive.Folder}
 */
function HosoPrintWorker_resolvePdfFolder_(templateSourceId, outputFolderId) {
  var fid = String(outputFolderId || '').trim();
  if (fid) {
    try {
      return DriveApp.getFolderById(fid);
    } catch (e1) {
      /* fall through */
    }
  }
  try {
    var tplFile = DriveApp.getFileById(String(templateSourceId || '').trim());
    var parents = tplFile.getParents();
    if (parents.hasNext()) return parents.next();
  } catch (e2) {
    /* fall through */
  }
  return DriveApp.getRootFolder();
}

/**
 * @param {Object<string, string>} printRow
 * @returns {string}
 */
function HosoPrintWorker_resolveHoSoIdFromJob_(printRow) {
  var hid = String((printRow && printRow.HO_SO_ID) || '').trim();
  if (hid) return hid;
  var payload = HosoPrintWorker_parseJson_((printRow && printRow.PAYLOAD_JSON) || '');
  if (payload && payload.hoSoId != null) return String(payload.hoSoId).trim();
  return '';
}

/**
 * @param {string} hoSoId
 * @returns {Object<string, string>|null}
 */
function HosoPrintWorker_buildMergeData_(hoSoId) {
  var id = String(hoSoId || '').trim();
  if (!id) return null;
  var ctx = HosoPrintWorker_configContext_();
  var masterSh = HOSO_Config_getSheet_('MASTER', ctx);
  var mRow = HosoPrintWorker_findFirstBy_(masterSh, 'HO_SO_ID', id);
  if (mRow < 2) return null;
  var master = HosoPrintWorker_rowToObject_(masterSh, mRow);

  var xvSh = HOSO_Config_getSheet_('XA_VIEN', ctx);
  var xvRow = HosoPrintWorker_findFirstBy_(xvSh, 'HO_SO_ID', id);
  var xv = xvRow >= 2 ? HosoPrintWorker_rowToObject_(xvSh, xvRow) : {};

  var ptSh = HOSO_Config_getSheet_('PHUONG_TIEN', ctx);
  var ptRow = HosoPrintWorker_findFirstBy_(ptSh, 'HO_SO_ID', id);
  var pt = ptRow >= 2 ? HosoPrintWorker_rowToObject_(ptSh, ptRow) : {};

  var txSh = HOSO_Config_getSheet_('TAI_XE', ctx);
  var txRow = HosoPrintWorker_findFirstBy_(txSh, 'HO_SO_ID', id);
  var tx = txRow >= 2 ? HosoPrintWorker_rowToObject_(txSh, txRow) : {};

  var tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  var printDate = Utilities.formatDate(new Date(), tz, 'dd/MM/yyyy HH:mm');

  return {
    HO_SO_ID: id,
    HO_SO_CODE: String(master.HO_SO_CODE || ''),
    TITLE: String(master.TITLE || ''),
    HO_SO_TYPE: String(master.HO_SO_TYPE || ''),
    STATUS: String(master.STATUS || ''),

    XA_VIEN_HO_TEN: String(xv.HO_TEN || ''),
    XA_VIEN_CCCD: String(xv.CCCD || ''),
    XA_VIEN_PHONE_1: String(xv.PHONE_1 || ''),
    XA_VIEN_DIA_CHI: String(xv.DIA_CHI || ''),

    PHUONG_TIEN_BIEN_SO: String(pt.BIEN_SO || ''),
    PHUONG_TIEN_LOAI_XE: String(pt.LOAI_XE || ''),
    PHUONG_TIEN_HIEU_XE: String(pt.HIEU_XE || ''),
    PHUONG_TIEN_SO_KHUNG: String(pt.SO_KHUNG || ''),
    PHUONG_TIEN_SO_MAY: String(pt.SO_MAY || ''),

    TAI_XE_HO_TEN: String(tx.HO_TEN || ''),
    TAI_XE_CCCD: String(tx.CCCD || ''),
    TAI_XE_PHONE: String(tx.PHONE || ''),
    TAI_XE_GPLX_SO: String(tx.GPLX_SO || ''),

    PRINT_DATE: printDate
  };
}

/**
 * @param {GoogleAppsScript.Document.Document} doc
 * @param {Object<string, string>} merge
 */
function HosoPrintWorker_applyMergeToDoc_(doc, merge) {
  var body = doc.getBody();
  var keys = Object.keys(merge);
  var i;
  for (i = 0; i < keys.length; i++) {
    var k = keys[i];
    var val = merge[k] == null ? '' : String(merge[k]);
    var pattern = '\\{\\{' + HosoPrintWorker_escapeReplaceText_(k) + '\\}\\}';
    body.replaceText(pattern, HosoPrintWorker_escapeReplaceValue_(val));
  }
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} rowIndex
 * @param {Object<string, string>} rowObj
 * @returns {Object}
 */
function HosoPrintWorker_processRow_(sheet, rowIndex, rowObj) {
  var markError = function(code, message) {
    var fin = HosoPrintWorker_now_();
    try {
      HosoPrintWorker_updateRow_(sheet, rowIndex, {
        STATUS: 'ERROR',
        ERROR_CODE: code,
        ERROR_MESSAGE: String(message || '').slice(0, 2000),
        FINISHED_AT: fin
      });
    } catch (eUp) {
      return { ok: false, code: 'PRINT_UPDATE_FAILED', message: String(eUp && eUp.message ? eUp.message : eUp) };
    }
    return { ok: false, code: code, message: String(message || '') };
  };

  var templateCode = String((rowObj && rowObj.TEMPLATE_CODE) || '').trim();
  if (!templateCode) {
    return markError('PRINT_TEMPLATE_NOT_FOUND', 'TEMPLATE_CODE empty');
  }

  var hoSoId = HosoPrintWorker_resolveHoSoIdFromJob_(rowObj);
  if (!hoSoId) {
    return markError('PRINT_HOSO_NOT_FOUND', 'HO_SO_ID missing');
  }

  var merge = HosoPrintWorker_buildMergeData_(hoSoId);
  if (!merge) {
    return markError('PRINT_HOSO_NOT_FOUND', 'HO_SO row not found for ' + hoSoId);
  }

  var templateRow = HosoPrintWorker_findTemplate_(templateCode);
  if (!templateRow) {
    return markError('PRINT_TEMPLATE_NOT_FOUND', 'No ACTIVE template for ' + templateCode);
  }

  var sourceId = String(templateRow.TEMPLATE_SOURCE_ID || '').trim();
  if (!sourceId) {
    return markError('PRINT_TEMPLATE_SOURCE_ID_MISSING', 'TEMPLATE_SOURCE_ID empty');
  }

  var cfg = {};
  if (templateRow.CONFIG_JSON) {
    var parsed = HosoPrintWorker_parseJson_(templateRow.CONFIG_JSON);
    if (parsed && typeof parsed === 'object') cfg = parsed;
  }
  var outFolderId = cfg.outputFolderId != null ? String(cfg.outputFolderId).trim() : '';
  var keepDocCopy = cfg.keepDocCopy === true;

  var tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  var ts = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  var codePart = HosoPrintWorker_sanitizeFilePart_(merge.HO_SO_CODE || merge.HO_SO_ID);
  var tplPart = HosoPrintWorker_sanitizeFilePart_(templateCode);
  var pdfName = codePart + '_' + tplPart + '_' + ts + '.pdf';
  var tempDocName = 'tmp_print_' + tplPart + '_' + ts;

  var folder = HosoPrintWorker_resolvePdfFolder_(sourceId, outFolderId);
  var copyFile;
  try {
    copyFile = DriveApp.getFileById(sourceId).makeCopy(tempDocName, folder);
  } catch (eCopy) {
    return markError('PRINT_DOC_COPY_FAILED', String(eCopy && eCopy.message ? eCopy.message : eCopy));
  }

  var copyId = copyFile.getId();
  try {
    var doc = DocumentApp.openById(copyId);
    HosoPrintWorker_applyMergeToDoc_(doc, merge);
    doc.saveAndClose();
  } catch (eDoc) {
    try {
      copyFile.setTrashed(true);
    } catch (eTr) {
      /* ignore */
    }
    return markError('PRINT_DOC_COPY_FAILED', String(eDoc && eDoc.message ? eDoc.message : eDoc));
  }

  var pdfFile;
  try {
    var blob = copyFile.getAs(MimeType.PDF);
    blob.setName(pdfName);
    pdfFile = folder.createFile(blob);
  } catch (ePdf) {
    try {
      if (!keepDocCopy) copyFile.setTrashed(true);
    } catch (eT2) {
      /* ignore */
    }
    return markError('PRINT_PDF_EXPORT_FAILED', String(ePdf && ePdf.message ? ePdf.message : ePdf));
  }

  if (!keepDocCopy) {
    try {
      copyFile.setTrashed(true);
    } catch (eTr3) {
      /* ignore */
    }
  }

  var pdfId = pdfFile.getId();
  var pdfUrl = pdfFile.getUrl();
  var finOk = HosoPrintWorker_now_();

  try {
    HosoPrintWorker_updateRow_(sheet, rowIndex, {
      STATUS: 'DONE',
      OUTPUT_FILE_ID: pdfId,
      OUTPUT_FILE_URL: pdfUrl,
      OUTPUT_PDF_URL: pdfUrl,
      ERROR_CODE: '',
      ERROR_MESSAGE: '',
      FINISHED_AT: finOk
    });
  } catch (eFin) {
    return { ok: false, code: 'PRINT_UPDATE_FAILED', message: String(eFin && eFin.message ? eFin.message : eFin), data: { pdfId: pdfId, pdfUrl: pdfUrl } };
  }

  return {
    ok: true,
    code: 'PRINT_DONE',
    message: 'PDF created',
    data: { outputFileId: pdfId, outputFileUrl: pdfUrl, outputPdfUrl: pdfUrl }
  };
}

/**
 * @returns {Object}
 */
function HosoPrintWorker_runPending() {
  if (typeof HOSO_SchemaV2_ensurePrintJobSheet === 'function') {
    HOSO_SchemaV2_ensurePrintJobSheet();
  }
  var ctx = HosoPrintWorker_configContext_();
  var sheet = HOSO_Config_getSheet_('PRINT_JOB', ctx);
  var map = HosoPrintWorker_getHeaderMap_(sheet);
  var colSt = map['STATUS'];
  if (!colSt) return { ok: false, code: 'PRINT_UPDATE_FAILED', message: 'STATUS column missing on PRINT_JOB' };

  var last = sheet.getLastRow();
  var jobs = [];
  var r;
  var count = 0;
  for (r = 2; r <= last && count < 10; r++) {
    var st = String(sheet.getRange(r, colSt).getValue() || '').trim().toUpperCase();
    if (st !== 'PENDING') continue;
    var rowObj = HosoPrintWorker_rowToObject_(sheet, r);
    var res = HosoPrintWorker_processRow_(sheet, r, rowObj);
    jobs.push({ printJobId: String(rowObj.PRINT_JOB_ID || ''), result: res });
    count++;
  }
  return { ok: true, processed: jobs.length, jobs: jobs };
}

/**
 * @param {string} printJobId
 * @returns {Object}
 */
function HosoPrintWorker_runOne(printJobId) {
  if (typeof HOSO_SchemaV2_ensurePrintJobSheet === 'function') {
    HOSO_SchemaV2_ensurePrintJobSheet();
  }
  var ctx = HosoPrintWorker_configContext_();
  var sheet = HOSO_Config_getSheet_('PRINT_JOB', ctx);
  var jid = String(printJobId || '').trim();
  if (!jid) {
    return { ok: false, code: 'PRINT_JOB_NOT_FOUND', message: 'printJobId empty' };
  }
  var row = HosoPrintWorker_findFirstBy_(sheet, 'PRINT_JOB_ID', jid);
  if (row < 2) {
    return { ok: false, code: 'PRINT_JOB_NOT_FOUND', message: 'Job not found: ' + jid };
  }
  var rowObj = HosoPrintWorker_rowToObject_(sheet, row);
  var st = String(rowObj.STATUS || '').trim().toUpperCase();
  if (st !== 'PENDING') {
    return { ok: false, code: 'PRINT_JOB_NOT_PENDING', message: 'STATUS is ' + String(rowObj.STATUS || '') };
  }
  return HosoPrintWorker_processRow_(sheet, row, rowObj);
}

function HosoPrintWorker_menuRunPending() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var out = HosoPrintWorker_runPending();
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Print Worker — run pending', out);
    } else {
      SpreadsheetApp.getUi().alert(JSON.stringify(out, null, 2));
    }
  } catch (e) {
    var msg = String(e && e.message ? e.message : e);
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Print Worker — run pending', { ok: false, error: msg });
    } else {
      SpreadsheetApp.getUi().alert(msg);
    }
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

function HosoPrintWorker_menuRunSelected() {
  try {
    hoSoV2SetRuntimeSource_('MENU');
    var ui = SpreadsheetApp.getUi();
    var sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rng = SpreadsheetApp.getActiveSpreadsheet().getActiveRange();
    if (!rng) {
      ui.alert('Chưa chọn ô.');
      return;
    }
    var ctx = HosoPrintWorker_configContext_();
    var expected = HOSO_Config_getSheetName_('PRINT_JOB', ctx);
    if (String(sh.getName()) !== String(expected)) {
      ui.alert('Mở sheet đúng queue in: ' + expected + ' (đang ở: ' + sh.getName() + ')');
      return;
    }
    var row = rng.getRow();
    if (row < 2) {
      ui.alert('Chọn một dòng dữ liệu (từ dòng 2).');
      return;
    }
    var rowObj = HosoPrintWorker_rowToObject_(sh, row);
    var jid = String(rowObj.PRINT_JOB_ID || '').trim();
    if (!jid) {
      ui.alert('PRINT_JOB_ID trống.');
      return;
    }
    var out = HosoPrintWorker_runOne(jid);
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Print Worker — run one', out);
    } else {
      ui.alert(JSON.stringify(out, null, 2));
    }
  } catch (e2) {
    var msg2 = String(e2 && e2.message ? e2.message : e2);
    if (typeof hoSoV2AdminAlertJson_ === 'function') {
      hoSoV2AdminAlertJson_('Print Worker — run one', { ok: false, error: msg2 });
    } else {
      SpreadsheetApp.getUi().alert(msg2);
    }
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

/**
 * Xóa trigger cũ cùng handler, cài time-driven mỗi 1 phút.
 */
function HosoPrintWorker_installTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var i;
  for (i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'HosoPrintWorker_runPending') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('HosoPrintWorker_runPending')
    .timeBased()
    .everyMinutes(1)
    .create();
  try {
    SpreadsheetApp.getUi().alert('Đã cài trigger: HosoPrintWorker_runPending mỗi 1 phút.');
  } catch (eUi) {
    /* headless */
  }
}

/**
 * Dry run: job PENDING đầu tiên — chỉ merge + tìm template, không tạo file.
 * @returns {Object}
 */
function test_HosoPrintWorker_DryRun() {
  var ctx = HosoPrintWorker_configContext_();
  var sheet = HOSO_Config_getSheet_('PRINT_JOB', ctx);
  var map = HosoPrintWorker_getHeaderMap_(sheet);
  var colSt = map['STATUS'];
  if (!colSt) {
    return { ok: false, printJobId: '', hoSoId: '', templateCode: '', templateFound: false, mergeKeys: [], error: 'STATUS column missing' };
  }
  var last = sheet.getLastRow();
  var r;
  var rowObj = null;
  for (r = 2; r <= last; r++) {
    var st = String(sheet.getRange(r, colSt).getValue() || '').trim().toUpperCase();
    if (st === 'PENDING') {
      rowObj = HosoPrintWorker_rowToObject_(sheet, r);
      break;
    }
  }
  if (!rowObj) {
    return { ok: false, printJobId: '', hoSoId: '', templateCode: '', templateFound: false, mergeKeys: [], error: 'No PENDING job' };
  }
  var printJobId = String(rowObj.PRINT_JOB_ID || '');
  var templateCode = String(rowObj.TEMPLATE_CODE || '');
  var hoSoId = HosoPrintWorker_resolveHoSoIdFromJob_(rowObj);
  var tpl = HosoPrintWorker_findTemplate_(templateCode);
  var merge = hoSoId ? HosoPrintWorker_buildMergeData_(hoSoId) : null;
  return {
    ok: true,
    printJobId: printJobId,
    hoSoId: hoSoId,
    templateCode: templateCode,
    templateFound: !!tpl,
    mergeKeys: merge ? Object.keys(merge) : []
  };
}

/** WebApp / AppSheet alias; canonical: HosoPrintWorker_runPending. */
function HOSO_PrintWorker_runPending() {
  return HosoPrintWorker_runPending();
}
