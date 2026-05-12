/**
 * CBV Test Console WebApp FE — model builders for dashboard and report library.
 */

var CBV_TEST_CONSOLE_WEBAPP_DEFAULT_REPORT_LIMIT_ = 20;
var CBV_TEST_CONSOLE_WEBAPP_MAX_REPORT_LIMIT_ = 100;

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 * @returns {Object<string, number>}
 */
function CBV_TestConsole_WebApp_headerMap_(sh) {
  var map = {};
  if (!sh || sh.getLastRow() < 1 || sh.getLastColumn() < 1) return map;
  var hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var i;
  for (i = 0; i < hdr.length; i++) {
    var k = String(hdr[i] || '').trim();
    if (k) map[k] = i + 1;
  }
  return map;
}

/**
 * Read-only report sheet lookup. Does not create sheets or headers.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function CBV_TestConsole_WebApp_getReportSheetReadOnly_() {
  try {
    var opened = typeof MC_Obs_openModuleDb_ === 'function' ? MC_Obs_openModuleDb_() : { ok: false };
    if (!opened || !opened.ok || !opened.ss) return null;
    return opened.ss.getSheetByName(CBV_TEST_CONSOLE_REPORT_SHEET_NAME_) || null;
  } catch (e) {
    return null;
  }
}

/**
 * @param {Object<string, number>} map
 * @param {Array} row
 * @param {number} rowNumber
 * @returns {Object}
 */
function CBV_TestConsole_WebApp_reportRowToObject_(map, row, rowNumber) {
  function get(k) {
    var c = map[k];
    return c ? row[c - 1] : '';
  }
  return {
    rowNumber: rowNumber,
    checkedAt: String(get('CHECKED_AT') || ''),
    traceId: String(get('TRACE_ID') || ''),
    phase: String(get('PHASE') || ''),
    status: String(get('STATUS') || ''),
    severity: String(get('SEVERITY') || ''),
    testSuite: String(get('TEST_SUITE') || ''),
    runBy: String(get('RUN_BY') || ''),
    ok: String(get('OK') || '').toUpperCase() === 'TRUE',
    envelopeOk: String(get('ENVELOPE_OK') || '').toUpperCase() === 'TRUE',
    contractVersion: String(get('CONTRACT_VERSION') || ''),
    nextStep: String(get('NEXT_STEP') || ''),
    summary: String(get('SUMMARY') || ''),
    reportJson: String(get('REPORT_JSON') || '{}'),
    driveFileId: String(get('DRIVE_FILE_ID') || ''),
    driveFileUrl: String(get('DRIVE_FILE_URL') || ''),
    exportFileName: String(get('EXPORT_FILE_NAME') || ''),
    note: String(get('NOTE') || '')
  };
}

/**
 * @param {number=} limit
 * @returns {{ reports: Object[], reportCount: number, sheetAvailable: boolean }}
 */
function CBV_TestConsole_WebApp_listReportsModel_(limit) {
  var n = parseInt(limit, 10);
  if (!isFinite(n) || n <= 0) n = CBV_TEST_CONSOLE_WEBAPP_DEFAULT_REPORT_LIMIT_;
  if (n > CBV_TEST_CONSOLE_WEBAPP_MAX_REPORT_LIMIT_) n = CBV_TEST_CONSOLE_WEBAPP_MAX_REPORT_LIMIT_;

  var sh = CBV_TestConsole_WebApp_getReportSheetReadOnly_();
  if (!sh) return { reports: [], reportCount: 0, sheetAvailable: false };

  var last = sh.getLastRow();
  if (last < 2) return { reports: [], reportCount: 0, sheetAvailable: true };

  var map = CBV_TestConsole_WebApp_headerMap_(sh);
  var start = Math.max(2, last - n + 1);
  var values = sh.getRange(start, 1, last - start + 1, sh.getLastColumn()).getValues();
  var out = [];
  var i;
  for (i = values.length - 1; i >= 0; i--) {
    out.push(CBV_TestConsole_WebApp_reportRowToObject_(map, values[i], start + i));
  }
  return { reports: out, reportCount: Math.max(0, last - 1), sheetAvailable: true };
}

/**
 * @param {string} traceId
 * @returns {Object|null}
 */
function CBV_TestConsole_WebApp_findReportByTraceId_(traceId) {
  var want = String(traceId || '').trim();
  if (!want) return null;
  var batch = CBV_TestConsole_WebApp_listReportsModel_(CBV_TEST_CONSOLE_WEBAPP_MAX_REPORT_LIMIT_);
  var reports = batch.reports || [];
  var i;
  for (i = 0; i < reports.length; i++) {
    if (String(reports[i].traceId || '') === want) return reports[i];
  }
  return null;
}

/**
 * @returns {Object[]}
 */
function CBV_TestConsole_WebApp_listSuitesModel_() {
  if (typeof CBV_TestConsole_registerDefaultSuites_ === 'function') CBV_TestConsole_registerDefaultSuites_();
  var list = typeof CBV_TestConsole_listSuites_ === 'function' ? CBV_TestConsole_listSuites_() : [];
  var out = [];
  var i;
  for (i = 0; i < list.length; i++) {
    var s = list[i] || {};
    out.push({
      suiteCode: String(s.suiteCode || ''),
      domain: String(s.domain || ''),
      label: String(s.label || s.suiteCode || ''),
      scope: String(s.scope || ''),
      destructive: !!s.destructive,
      productionSafe: s.productionSafe !== false,
      enabled: s.enabled !== false,
      description: String(s.description || '')
    });
  }
  return out;
}

/**
 * @returns {Object}
 */
function CBV_TestConsole_WebApp_reportFolderModel_() {
  var out = { propertyName: CBV_TEST_CONSOLE_REPORT_FOLDER_PROP_, folderId: '', accessible: false, nextPrefix: '', warning: '' };
  try {
    out.folderId = String(PropertiesService.getScriptProperties().getProperty(CBV_TEST_CONSOLE_REPORT_FOLDER_PROP_) || '').trim();
  } catch (e0) {
    out.warning = 'FOLDER_PROPERTY_READ_FAIL:' + String(e0 && e0.message ? e0.message : e0);
  }
  if (!out.folderId) {
    out.warning = out.warning || 'FOLDER_PROPERTY_MISSING';
    return out;
  }
  try {
    var folder = DriveApp.getFolderById(out.folderId);
    out.accessible = !!folder;
    out.nextPrefix = CBV_TestConsole_getNextReportPrefix_(folder);
  } catch (e1) {
    out.warning = 'FOLDER_ACCESS_FAIL:' + String(e1 && e1.message ? e1.message : e1);
  }
  return out;
}

/**
 * @returns {Object}
 */
function CBV_TestConsole_WebApp_buildDashboardModel_() {
  var health = {};
  try {
    health = typeof MC_healthPayload_ === 'function' ? MC_healthPayload_() : { warning: 'MC_healthPayload_ missing' };
  } catch (e0) {
    health = { error: String(e0 && e0.message ? e0.message : e0) };
  }
  var reports = CBV_TestConsole_WebApp_listReportsModel_(1);
  var suites = CBV_TestConsole_WebApp_listSuitesModel_();
  var folder = CBV_TestConsole_WebApp_reportFolderModel_();
  var activeSession = typeof CBV_TestConsole_Session_getActive_ === 'function' ? CBV_TestConsole_Session_getActive_() : null;
  var guidance = typeof CBV_TestConsole_Guidance_getCurrent_ === 'function' ? CBV_TestConsole_Guidance_getCurrent_() : { session: activeSession, guidance: null };
  var lock = typeof CBV_TestConsole_Lock_get_ === 'function' ? CBV_TestConsole_Lock_get_() : null;
  var timeline = typeof CBV_TestConsole_Timeline_listRecent_ === 'function' ? CBV_TestConsole_Timeline_listRecent_(10, activeSession && activeSession.sessionId) : [];
  return {
    checkedAt: typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString(),
    health: health,
    suites: suites,
    suiteCount: suites.length,
    latestReport: reports.reports.length ? reports.reports[0] : null,
    reportCount: reports.reportCount,
    reportSheetAvailable: reports.sheetAvailable,
    reportFolder: folder,
    webAppUrl: typeof CBV_TestConsole_WebApp_getUrl_ === 'function' ? CBV_TestConsole_WebApp_getUrl_() : '',
    activeSession: activeSession,
    guidance: guidance.guidance || null,
    runtimeLock: lock,
    timeline: timeline
  };
}
