/**
 * CBV_TEST_REPORTS — idempotent sheet bootstrap + append-only row writes
 *
 * Standard: CBV Operational Ecosystem V1 · CBV_TCS_V1
 *
 * - Does not delete sheets or truncate data rows.
 * - Creates CBV_TEST_REPORTS if missing; adds only missing header columns on row 1.
 * - appendReport appends one new row (no overwrite of existing rows).
 */

var CBV_TCS_REPORTS_SHEET_NAME = 'CBV_TEST_REPORTS';

/** Canonical header order (new sheets); missing headers are appended as new columns on existing sheets. */
function CbvTcsReports_getCanonicalHeaders_() {
  return [
    'CHECKED_AT',
    'TRACE_ID',
    'PHASE',
    'TEST_SUITE',
    'STATUS',
    'SEVERITY',
    'ENVELOPE_OK',
    'RUN_BY',
    'SUMMARY',
    'ERROR_COUNT',
    'WARNING_COUNT',
    'REPORT_JSON',
    'DRIVE_FOLDER_ID',
    'DRIVE_FILE_COUNT',
    'CREATED_BY_RUNTIME'
  ];
}

/**
 * Ensure CBV_TEST_REPORTS exists with required headers (idempotent).
 * @returns {{ ok: boolean, created: boolean, headersAdded: string[], error: string, sheet: GoogleAppsScript.Spreadsheet.Sheet|null }}
 */
function CbvTcsReports_ensureSheet_() {
  var out = { ok: false, created: false, headersAdded: [], error: '', sheet: null };
  try {
    if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getActiveSpreadsheet) {
      out.error = 'NO_SPREADSHEET_RUNTIME';
      return out;
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      out.error = 'NO_ACTIVE_SPREADSHEET';
      return out;
    }
    var name = CBV_TCS_REPORTS_SHEET_NAME;
    var sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      out.created = true;
    }
    out.sheet = sh;
    var want = CbvTcsReports_getCanonicalHeaders_();
    var lastCol = sh.getLastColumn();
    if (lastCol < 1) {
      sh.getRange(1, 1, 1, want.length).setValues([want]);
      out.headersAdded = want.slice();
      out.ok = true;
      return out;
    }
    var headerVals = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    var seen = {};
    var c;
    for (c = 0; c < headerVals.length; c++) {
      var k = String(headerVals[c] || '').trim();
      if (k) seen[k] = true;
    }
    var added = [];
    for (var i = 0; i < want.length; i++) {
      var h = want[i];
      if (seen[h]) continue;
      var nc = sh.getLastColumn() + 1;
      sh.getRange(1, nc).setValue(h);
      seen[h] = true;
      added.push(h);
    }
    out.headersAdded = added;
    out.ok = true;
    return out;
  } catch (e) {
    out.error = e && e.message ? e.message : String(e);
    return out;
  }
}

/**
 * Map header name -> 0-based column index from row 1.
 */
function CbvTcsReports__headerIndexMap_(sh) {
  var lastCol = sh.getLastColumn();
  if (lastCol < 1) return {};
  var row = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  var j;
  for (j = 0; j < row.length; j++) {
    var key = String(row[j] || '').trim();
    if (key && map[key] === undefined) map[key] = j;
  }
  return map;
}

/**
 * Append one report envelope as a sheet row (append-only). Calls ensureSheet_ first.
 * @param {Object} report - CBV_TCS_V1 envelope-shaped object
 * @returns {{ ok: boolean, error?: string, rowWritten?: number }}
 */
function CbvTcsReports_appendReport_(report) {
  var ens = CbvTcsReports_ensureSheet_();
  if (!ens.ok || !ens.sheet) {
    return { ok: false, error: ens.error || 'ensure_failed' };
  }
  var sh = ens.sheet;
  var colMap = CbvTcsReports__headerIndexMap_(sh);
  var want = CbvTcsReports_getCanonicalHeaders_();
  var miss = want.filter(function (h) { return colMap[h] === undefined; });
  if (miss.length) {
    return { ok: false, error: 'MISSING_HEADERS_AFTER_ENSURE:' + miss.join(',') };
  }
  var r = report || {};
  var checks = r.checks || [];
  var errC = checks.filter(function (x) {
    return x && x.ok === false && (String(x.severity || '').toUpperCase() === 'ERROR' || String(x.severity || '').toUpperCase() === 'CRITICAL');
  }).length;
  var warnC = checks.filter(function (x) {
    return x && x.ok === false && String(x.severity || '').toUpperCase() === 'WARNING';
  }).length;
  var rj = r.reportJson && typeof r.reportJson === 'object' ? r.reportJson : {};
  var folderId = (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? String(CBV_TCS_DRIVE_REPORT_FOLDER_ID) : '';
  var driveFc = rj.driveFileCount != null ? rj.driveFileCount : '';
  var jsonStr = '';
  try {
    jsonStr = JSON.stringify(r);
  } catch (eJ) {
    jsonStr = '{"stringifyError":true}';
  }
  if (jsonStr.length > 49000) jsonStr = jsonStr.substring(0, 49000);
  var field = {
    CHECKED_AT: r.checkedAt || new Date(),
    TRACE_ID: String(r.traceId || ''),
    PHASE: String(r.phase || ''),
    TEST_SUITE: String(r.testSuite || ''),
    STATUS: String(r.status || ''),
    SEVERITY: String(r.severity || ''),
    ENVELOPE_OK: r.envelopeOk === true ? 'TRUE' : 'FALSE',
    RUN_BY: String(r.runBy || ''),
    SUMMARY: String(r.summary || '').substring(0, 49000),
    ERROR_COUNT: errC,
    WARNING_COUNT: warnC,
    REPORT_JSON: jsonStr,
    DRIVE_FOLDER_ID: folderId,
    DRIVE_FILE_COUNT: driveFc,
    CREATED_BY_RUNTIME: 'M08_TEST_CONSOLE'
  };
  var numCols = sh.getLastColumn();
  var fullRow = [];
  var z;
  for (z = 0; z < numCols; z++) fullRow[z] = '';
  var hi;
  for (hi = 0; hi < want.length; hi++) {
    var hk = want[hi];
    var ix = colMap[hk];
    if (ix !== undefined) fullRow[ix] = field[hk];
  }
  sh.appendRow(fullRow);
  return { ok: true, rowWritten: sh.getLastRow() };
}
