/**
 * DATA SYNC — Plan JSON on sheet + continuation token for chunked report.
 * DATA_SYNC_MODULE_DESIGN.md §4. Dependencies: 00_CORE_CONFIG, 49_DATA_SYNC_ENGINE (menu calls).
 *
 * Layout (DATA_SYNC_CONTROL):
 *   A1 — label | A2 — full plan JSON (wrap)
 *   D1:E8 — last run dashboard (labels / values)
 *   F1:F2 — continuation token JSON (auto; optional resume for buildDataSyncReport)
 */

/** Plan body (JSON string) */
var DATA_SYNC_PLAN_JSON_CELL = 'A2';

var DATA_SYNC_MIN_PLAN_TEMPLATE = '{"version":"1","jobs":[]}';

/**
 * @returns {string}
 */
function dataSyncGetControlSheetName_() {
  return (CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.DATA_SYNC_CONTROL)
    ? CBV_CONFIG.SHEETS.DATA_SYNC_CONTROL
    : 'DATA_SYNC_CONTROL';
}

/**
 * Creates DATA_SYNC_CONTROL if missing; default plan if A2 empty.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function ensureDataSyncControlSheet() {
  var ss = SpreadsheetApp.getActive();
  var name = dataSyncGetControlSheetName_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  sheet.getRange('A1').setValue('Plan JSON (paste — see DATA_SYNC_MODULE_DESIGN §4)')
    .setFontWeight('bold');
  sheet.getRange('D1').setValue('Last operation').setFontWeight('bold');
  sheet.getRange('E1').setValue('(not run yet)');
  sheet.getRange('D2').setValue('Time (server)');
  sheet.getRange('D3').setValue('ok / canApply');
  sheet.getRange('D4').setValue('continuation?');
  sheet.getRange('D5').setValue('errorRowCount');
  sheet.getRange('D6').setValue('insert / update / skip');
  sheet.getRange('D7').setValue('Notes / payload head');
  sheet.getRange('F1').setValue('Continuation token JSON (auto; clear to start fresh)').setFontWeight('bold');

  var planCell = sheet.getRange(DATA_SYNC_PLAN_JSON_CELL);
  var raw = planCell.getValue();
  if (raw === '' || raw === null || String(raw).trim() === '') {
    planCell.setValue(DATA_SYNC_MIN_PLAN_TEMPLATE);
  }
  planCell.setWrap(true);
  sheet.getRange('A2').setVerticalAlignment('top');

  sheet.setColumnWidth(1, 560);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 520);
  sheet.setColumnWidth(6, 520);

  return sheet;
}

/**
 * Read plan JSON from A2.
 * @returns {Object}
 */
function getDataSyncPlanFromSheet() {
  var ss = SpreadsheetApp.getActive();
  var name = dataSyncGetControlSheetName_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error('Sheet not found: ' + name + '. Use menu Data sync → Ensure control sheet.');
  }
  var txt = sheet.getRange(DATA_SYNC_PLAN_JSON_CELL).getValue();
  txt = txt == null ? '' : String(txt).trim();
  if (!txt) {
    throw new Error('Plan JSON empty in ' + name + '!' + DATA_SYNC_PLAN_JSON_CELL);
  }
  try {
    return JSON.parse(txt);
  } catch (e) {
    throw new Error('Invalid JSON in plan cell: ' + (e.message || e));
  }
}

/**
 * Read optional continuation JSON from F2 (resume chunked report).
 * @returns {Object|null}
 */
function getDataSyncContinuationFromSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(dataSyncGetControlSheetName_());
  if (!sheet) return null;
  var v = sheet.getRange('F2').getValue();
  if (v === '' || v == null) return null;
  var s = String(v).trim();
  if (!s || s === 'null') return null;
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

/**
 * Persist continuation token to F2 (or clear).
 * @param {Object|null} continuation
 */
function dataSyncSetContinuationOnSheet_(continuation) {
  var sheet = ensureDataSyncControlSheet();
  if (!continuation) {
    sheet.getRange('F2').setValue('');
    return;
  }
  sheet.getRange('F2').setValue(JSON.stringify(continuation));
}

/**
 * @param {Object} plan
 */
function saveDataSyncPlanToSheet(plan) {
  var sheet = ensureDataSyncControlSheet();
  sheet.getRange(DATA_SYNC_PLAN_JSON_CELL).setValue(JSON.stringify(plan, null, 2));
}

/**
 * @param {string} operation
 * @param {Object} payload - report or runDataSync result
 */
function dataSyncWriteLastResult_(operation, payload) {
  try {
    var sheet = ensureDataSyncControlSheet();
    var rep = payload && payload.report ? payload.report : payload;

    sheet.getRange('E1').setValue(operation || '');
    sheet.getRange('E2').setValue(String(cbvNow()));
    if (rep) {
      var canApply = rep.canApply != null ? String(rep.canApply) : '';
      var ok = rep.ok != null ? String(rep.ok) : '';
      sheet.getRange('E3').setValue('ok=' + ok + ' canApply=' + canApply);
      var contStr = rep.continuation != null && rep.continuation !== undefined ? JSON.stringify(rep.continuation) : '(null)';
      sheet.getRange('E4').setValue(contStr.substring(0, 3000) + (contStr.length > 3000 ? '…' : ''));
      sheet.getRange('E5').setValue(rep.summary && rep.summary.errorRowCount != null ? String(rep.summary.errorRowCount) : '');
      var ins = rep.summary
        ? [rep.summary.insert, rep.summary.update, rep.summary.skip].join(' / ')
        : '';
      sheet.getRange('E6').setValue(ins);
      sheet.getRange('E7').setValue(JSON.stringify(payload || {}).substring(0, 1500));
    } else {
      sheet.getRange('E3').setValue('');
      sheet.getRange('E4').setValue('');
      sheet.getRange('E5').setValue('');
      sheet.getRange('E6').setValue('');
      sheet.getRange('E7').setValue(JSON.stringify(payload || {}).substring(0, 1500));
    }

    if (rep && Object.prototype.hasOwnProperty.call(rep, 'continuation')) {
      dataSyncSetContinuationOnSheet_(rep.continuation || null);
    }
  } catch (e) {}
}

/**
 * Builds opts for buildDataSyncReport from sheet (plan + optional F2 continuation).
 * @param {Object} [extraOpts]
 * @returns {Object}
 */
function getDataSyncReportOptsFromSheet_(extraOpts) {
  extraOpts = extraOpts || {};
  var plan = getDataSyncPlanFromSheet();
  var cont = getDataSyncContinuationFromSheet_();
  var o = { plan: plan };
  if (cont) o.continuation = cont;
  if (extraOpts.jobId) o.jobId = extraOpts.jobId;
  if (extraOpts.maxRowsPerChunk) o.maxRowsPerChunk = extraOpts.maxRowsPerChunk;
  return o;
}

/** Menu: focus A2 */
function menuDataSyncOpenControlSheet() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ensureDataSyncControlSheet();
  ss.setActiveSheet(sheet);
  sheet.setActiveRange(sheet.getRange(DATA_SYNC_PLAN_JSON_CELL));
}
