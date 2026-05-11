/**
 * CBV Test Console Runtime V2 — append-only report rows (Core DB).
 */

var CBV_TEST_CONSOLE_REPORT_SHEET_NAME_ = 'CBV_TEST_CONSOLE_REPORT';

var CBV_TEST_CONSOLE_REPORT_HEADERS_ = [
  'CHECKED_AT',
  'TRACE_ID',
  'PHASE',
  'STATUS',
  'SEVERITY',
  'TEST_SUITE',
  'RUN_BY',
  'OK',
  'ENVELOPE_OK',
  'CONTRACT_VERSION',
  'NEXT_STEP',
  'SUMMARY',
  'REPORT_JSON',
  'DRIVE_FILE_ID',
  'DRIVE_FILE_URL',
  'EXPORT_FILE_NAME',
  'NOTE'
];

/**
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function CBV_TestConsole_getOrCreateReportSheet_() {
  var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!opened.ok) return null;
  var ss = opened.ss;
  var sh = null;
  try {
    sh = ss.getSheetByName(CBV_TEST_CONSOLE_REPORT_SHEET_NAME_);
  } catch (e0) {
    sh = null;
  }
  if (!sh) {
    try {
      sh = ss.insertSheet(CBV_TEST_CONSOLE_REPORT_SHEET_NAME_);
    } catch (e1) {
      return null;
    }
  }
  try {
    if (sh.getLastRow() < 1) {
      sh.getRange(1, 1, 1, CBV_TEST_CONSOLE_REPORT_HEADERS_.length).setValues([CBV_TEST_CONSOLE_REPORT_HEADERS_]);
    } else {
      var first = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      var need = [];
      var map = {};
      var i;
      for (i = 0; i < first.length; i++) map[String(first[i] || '').trim()] = true;
      for (i = 0; i < CBV_TEST_CONSOLE_REPORT_HEADERS_.length; i++) {
        if (!map[CBV_TEST_CONSOLE_REPORT_HEADERS_[i]]) need.push(CBV_TEST_CONSOLE_REPORT_HEADERS_[i]);
      }
      if (need.length && typeof MC_Obs_ensureHeaders_ === 'function') {
        MC_Obs_ensureHeaders_(sh, need);
      }
    }
  } catch (e2) {
    /* ignore */
  }
  try {
    if (sh.getFrozenRows() < 1) sh.setFrozenRows(1);
  } catch (e3) {
    /* ignore */
  }
  return sh;
}

/**
 * @param {Object} report
 * @returns {Object} report (unchanged; best-effort IO)
 */
function CBV_TestConsole_appendReportSheet_(report) {
  var r = report || {};
  var sh = CBV_TestConsole_getOrCreateReportSheet_();
  if (!sh) {
    r.warnings = r.warnings || [];
    r.warnings.push('REPORT_SHEET_SKIP: Core DB / sheet unavailable');
    return r;
  }
  var row = {
    CHECKED_AT: String(r.checkedAt || ''),
    TRACE_ID: String(r.traceId || ''),
    PHASE: String(r.phase || ''),
    STATUS: String(r.status || ''),
    SEVERITY: String(r.severity || ''),
    TEST_SUITE: String(r.testSuite || ''),
    RUN_BY: String(r.runBy || ''),
    OK: r.ok === true ? 'TRUE' : 'FALSE',
    ENVELOPE_OK: r.envelopeOk === true ? 'TRUE' : 'FALSE',
    CONTRACT_VERSION: String(r.contractVersion || ''),
    NEXT_STEP: String(r.nextStep || ''),
    SUMMARY: String(r.summary || ''),
    REPORT_JSON: String(r.reportJson || '{}'),
    DRIVE_FILE_ID: String(r.driveFileId || ''),
    DRIVE_FILE_URL: String(r.driveFileUrl || ''),
    EXPORT_FILE_NAME: String(r.exportFileName || ''),
    NOTE: 'TEST_CONSOLE_V2'
  };
  try {
    if (typeof cbvCoreV2AppendRowByHeaders_ === 'function') {
      cbvCoreV2AppendRowByHeaders_(sh, row);
    } else {
      var hdr = CBV_TEST_CONSOLE_REPORT_HEADERS_;
      var vals = [];
      var i;
      for (i = 0; i < hdr.length; i++) vals.push(row[hdr[i]] != null ? row[hdr[i]] : '');
      sh.appendRow(vals);
    }
  } catch (e) {
    r.warnings = r.warnings || [];
    r.warnings.push('REPORT_SHEET_APPEND_FAIL: ' + String(e && e.message ? e.message : e));
  }
  return r;
}
