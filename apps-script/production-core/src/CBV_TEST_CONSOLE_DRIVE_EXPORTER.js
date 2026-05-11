/**
 * CBV Test Console Runtime V2 — Drive export + prefix allocator.
 */

var CBV_TEST_CONSOLE_DEFAULT_REPORT_FOLDER_ID_ = '1dSQIAwbg-m20oHXh8RCVYS6NvTuQ05Bc';

var CBV_TEST_CONSOLE_REPORT_FOLDER_PROP_ = 'CBV_TEST_CONSOLE_REPORT_FOLDER_ID';

/**
 * Ensures ScriptProperties contains CBV_TEST_CONSOLE_REPORT_FOLDER_ID (default prod folder).
 * @returns {string} folder id
 */
function CBV_TestConsole_ensureReportFolderProperty_() {
  var props = PropertiesService.getScriptProperties();
  var cur = '';
  try {
    cur = String(props.getProperty(CBV_TEST_CONSOLE_REPORT_FOLDER_PROP_) || '').trim();
  } catch (e0) {
    cur = '';
  }
  if (!cur) {
    cur = CBV_TEST_CONSOLE_DEFAULT_REPORT_FOLDER_ID_;
    try {
      props.setProperty(CBV_TEST_CONSOLE_REPORT_FOLDER_PROP_, cur);
    } catch (e1) {
      /* ignore */
    }
  }
  return cur;
}

/**
 * @param {string[]} fileNames
 * @returns {number} max prefix seen, or -1 if none
 */
function CBV_TestConsole_maxPrefixFromFileNames_(fileNames) {
  var max = -1;
  var re = /^(\d{3})_[A-Z0-9_]+_REPORT_\d{8}_\d{6}\.md$/i;
  var i;
  for (i = 0; i < fileNames.length; i++) {
    var m = re.exec(String(fileNames[i] || '').trim());
    if (!m) continue;
    var n = parseInt(m[1], 10);
    if (isFinite(n) && n > max) max = n;
  }
  return max;
}

/**
 * @param {GoogleAppsScript.Drive.Folder} folder
 * @returns {string} next three-digit prefix
 */
function CBV_TestConsole_getNextReportPrefix_(folder) {
  if (!folder) throw new Error('CBV_TEST_CONSOLE_FOLDER_MISSING');
  var names = [];
  var it = folder.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    try {
      names.push(String(f.getName() || ''));
    } catch (e0) {
      /* ignore */
    }
  }
  var max = CBV_TestConsole_maxPrefixFromFileNames_(names);
  var next = max + 1;
  if (next > 999) {
    throw new Error('CBV_TEST_REPORT_PREFIX_EXHAUSTED');
  }
  return ('00' + String(next)).slice(-3);
}

/**
 * @param {{ prefix?: string, contextTag?: string, checkedAtIso?: string }} context
 * @returns {string}
 */
function CBV_TestConsole_buildReportFileName_(context) {
  var c = context || {};
  var p = String(c.prefix != null ? c.prefix : '000');
  if (p.length === 1) p = '00' + p;
  else if (p.length === 2) p = '0' + p;
  else if (p.length > 3) p = p.slice(-3);
  var tag = String(c.contextTag || 'CONTEXT').replace(/[^A-Za-z0-9_]/g, '_').toUpperCase();
  if (!tag) tag = 'CONTEXT';
  var tz = 'Asia/Ho_Chi_Minh';
  try {
    tz = Session.getScriptTimeZone() || tz;
  } catch (e0) {
    /* ignore */
  }
  var d = c.checkedAtIso ? new Date(String(c.checkedAtIso)) : new Date();
  var dateStr = Utilities.formatDate(d, tz, 'yyyyMMdd_HHmmss');
  return p + '_' + tag + '_REPORT_' + dateStr + '.md';
}

/**
 * @param {Object} report
 * @returns {Object} report mutated with driveFileId, driveFileUrl, exportFileName if ok
 */
function CBV_TestConsole_exportReportToDrive_(report) {
  var r = report || {};
  var folderId = CBV_TestConsole_ensureReportFolderProperty_();
  var folder = null;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (e0) {
    r.warnings = r.warnings || [];
    r.warnings.push('Drive export skipped: folder not accessible (' + String(e0 && e0.message ? e0.message : e0) + ')');
    return r;
  }
  var prefix = CBV_TestConsole_getNextReportPrefix_(folder);
  var ctxTag = String(r.testSuite || 'CONTEXT').replace(/[^A-Za-z0-9_]/g, '_').toUpperCase();
  var name = CBV_TestConsole_buildReportFileName_({
    prefix: prefix,
    contextTag: ctxTag,
    checkedAtIso: r.checkedAt
  });
  var body = String(r.reportText != null ? r.reportText : CBV_TestConsole_buildReportMarkdown_(r));
  try {
    var blob = Utilities.newBlob(body, 'text/markdown', name);
    var file = folder.createFile(blob);
    r.exportFileName = name;
    r.driveFileId = file.getId();
    r.driveFileUrl = file.getUrl();
  } catch (e1) {
    r.warnings = r.warnings || [];
    r.warnings.push('Drive export failed: ' + String(e1 && e1.message ? e1.message : e1));
  }
  return r;
}

/**
 * @returns {{ ok: boolean, message: string, data: Object }}
 */
function CBV_TestConsole_DriveExporter_selfTest() {
  var data = { steps: [] };
  function pushStep(name, ok, detail) {
    data.steps.push({ name: name, ok: !!ok, detail: detail || '' });
  }
  try {
    var names = ['000_FOO_REPORT_20260101_120000.md', '002_BAR_REPORT_20260101_120001.md', 'bad.md', '1000_X_REPORT_20260101_120002.md'];
    var max = CBV_TestConsole_maxPrefixFromFileNames_(names);
    pushStep('max_prefix_parse', max === 2, 'max=' + String(max));
    var folderId = CBV_TestConsole_ensureReportFolderProperty_();
    pushStep('folder_property', !!folderId, folderId);
    var okAll = true;
    var i;
    for (i = 0; i < data.steps.length; i++) {
      if (!data.steps[i].ok) okAll = false;
    }
    return {
      ok: okAll,
      message: okAll ? 'Drive exporter self-test OK' : 'Drive exporter self-test had failures',
      data: data,
      error: okAll ? null : { code: 'SELF_TEST_FAIL', message: 'See steps' }
    };
  } catch (e) {
    return {
      ok: false,
      message: String(e && e.message ? e.message : e),
      data: data,
      error: { code: 'EXCEPTION', message: String(e && e.message ? e.message : e) }
    };
  }
}
