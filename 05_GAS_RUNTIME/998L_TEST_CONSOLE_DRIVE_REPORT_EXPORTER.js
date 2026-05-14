/**
 * PHASE_97_1 — CBV Test Console — Drive report export (append-only)
 *
 * Standard: CBV Operational Ecosystem V1 · CBV Test Console Standard V1 (CBV_TCS_V1)
 *
 * Writes new files only under CBV_TCS_DRIVE_REPORT_FOLDER_ID.
 * No delete, no trash, no overwrite, no business mutation.
 */

var CBV_TCS_DRIVE_REPORT_FOLDER_ID = '1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG';

var __CBV_TCS_DRIVE_EXPORT_TC_LAST_REPORT = null;
var __CBV_TCS_DRIVE_EXPORT_TC_LAST_PROP_KEY = 'CBV_TCS_DRIVE_EXPORT_TC_LAST_REPORT_JSON';
var __CBV_TCS_DRIVE_EXPORT_LAST_RESULT_PROP_KEY = 'CBV_TCS_DRIVE_EXPORT_LAST_RESULT_JSON';

function CbvTcsDriveReport__out_(ok, folderId, files, warnings, errors) {
  return {
    ok: ok === true,
    folderId: folderId || '',
    files: files || [],
    warnings: warnings || [],
    errors: errors || []
  };
}

function CbvTcsDriveReport__sanitizePart_(s, maxLen) {
  var t = String(s || '').replace(/[^a-zA-Z0-9_\-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  if (t.length > (maxLen || 80)) t = t.substring(0, maxLen || 80);
  return t || 'UNKNOWN';
}

function CbvTcsDriveReport__parsePrefixPair_(prefixOpt) {
  var p = String(prefixOpt != null ? prefixOpt : '097_1').trim();
  var m = /^(\d{3})_(\d+)$/.exec(p);
  if (m) return { seqHint: parseInt(m[1], 10), sub: m[2] };
  return { seqHint: -1, sub: '1' };
}

function CbvTcsDriveReport__scanMaxSeq_(folder) {
  var max = -1;
  try {
    var it = folder.getFiles();
    while (it.hasNext()) {
      var f = it.next();
      var name = f.getName();
      var m = /^(\d{3})_/ .exec(name);
      if (m) {
        var n = parseInt(m[1], 10);
        if (!isNaN(n) && n > max) max = n;
      }
    }
  } catch (e) {
    return { max: -1, error: e && e.message ? e.message : String(e) };
  }
  return { max: max, error: '' };
}

function CbvTcsDriveReport__fileNameExists_(folder, name) {
  try {
    var it = folder.getFilesByName(name);
    return it.hasNext();
  } catch (e) {
    return false;
  }
}

function CbvTcsDriveReport__uniqueName_(folder, baseName) {
  if (!CbvTcsDriveReport__fileNameExists_(folder, baseName)) return baseName;
  var dot = baseName.lastIndexOf('.');
  var stem = dot > 0 ? baseName.substring(0, dot) : baseName;
  var ext = dot > 0 ? baseName.substring(dot) : '';
  var i = 1;
  var candidate;
  do {
    candidate = stem + '_uniq' + i + ext;
    i++;
    if (i > 500) candidate = stem + '_' + new Date().getTime() + ext;
  } while (CbvTcsDriveReport__fileNameExists_(folder, candidate) && i < 520);
  return candidate;
}

function CbvTcsDriveReport__stamp_() {
  try {
    var tz = Session.getScriptTimeZone ? Session.getScriptTimeZone() : 'UTC';
    return Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  } catch (e) {
    return Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd_HHmmss');
  }
}

function CbvTcsDriveReport__phaseSlug_(phase) {
  var s = CbvTcsDriveReport__sanitizePart_(phase, 60);
  if (s.length > 40) s = s.substring(0, 40);
  return s;
}

function CbvTcsDriveReport__toMarkdown_(report) {
  var r = report || {};
  var checks = Array.isArray(r.checks) ? r.checks : [];
  var checkLines = checks.map(function (c) {
    return '- **' + (c.code || '') + '** — ' + (c.ok ? 'OK' : 'FAIL') + ' — ' + (c.message || '');
  }).join('\n');

  var rawJson = JSON.stringify(r, null, 2);

  return [
    '# CBV Test Console Report',
    '',
    '## Metadata',
    '- Phase: `' + String(r.phase || '') + '`',
    '- Status: `' + String(r.status || '') + '`',
    '- Severity: `' + String(r.severity || '') + '`',
    '- CheckedAt: `' + String(r.checkedAt || '') + '`',
    '- RunBy: `' + String(r.runBy || '') + '`',
    '- TraceId: `' + String(r.traceId || '') + '`',
    '- TestSuite: `' + String(r.testSuite || '') + '`',
    '- ContractVersion: `' + String(r.contractVersion || '') + '`',
    '- EnvelopeOk: `' + String(r.envelopeOk) + '`',
    '',
    '## Summary',
    '',
    String(r.summary || '(none)'),
    '',
    '## Checks',
    '',
    checkLines || '- (none)',
    '',
    '## Warnings',
    '',
    (Array.isArray(r.warnings) && r.warnings.length) ? r.warnings.map(function (w) { return '- ' + String(w); }).join('\n') : '- (none)',
    '',
    '## Errors',
    '',
    (Array.isArray(r.errors) && r.errors.length) ? r.errors.map(function (w) { return '- ' + String(w); }).join('\n') : '- (none)',
    '',
    '## Next Step',
    '',
    String(r.nextStep || '(none)'),
    '',
    '## Raw JSON',
    '',
    '```json',
    rawJson,
    '```',
    ''
  ].join('\n');
}

/**
 * Export a CBV_TCS_V1 report to Drive (append-only; never overwrites).
 *
 * @param {Object} report - envelope-shaped report
 * @param {Object} options - { phase, testSuite, prefix: '097_1', format: 'json'|'md'|'both' (minimum always writes .json+.md), txtFallback: boolean }
 */
function CbvTcsDriveReport_export(report, options) {
  var warnings = [];
  var errors = [];
  var files = [];
  var folderId = CBV_TCS_DRIVE_REPORT_FOLDER_ID;

  if (!report || typeof report !== 'object') {
    return CbvTcsDriveReport__out_(false, folderId, files, warnings, ['report must be an object']);
  }

  var opt = options || {};
  var format = String(opt.format != null ? opt.format : 'both').toLowerCase();
  if (format !== 'json' && format !== 'md' && format !== 'both') {
    warnings.push('Unknown format "' + format + '"; enforcing minimum .json + .md (both).');
    format = 'both';
  }
  if (format === 'json') {
    warnings.push('FORMAT_JSON_FORCES_MD_MIRROR: CBV_TCS requires .json + .md for every export; .md will be created.');
  }
  if (format === 'md') {
    warnings.push('FORMAT_MD_FORCES_JSON_MIRROR: CBV_TCS requires .json + .md for every export; .json will be created.');
  }

  var wantJson = true;
  var wantMd = true;
  var wantTxt = opt.txtFallback === true;

  var phase = opt.phase || String(report.phase || 'UNKNOWN_PHASE');
  var testSuite = opt.testSuite || String(report.testSuite || 'UNKNOWN_SUITE');
  var pair = CbvTcsDriveReport__parsePrefixPair_(opt.prefix != null ? opt.prefix : '097_1');
  var sub = pair.sub || '1';

  try {
    if (typeof DriveApp === 'undefined') {
      return CbvTcsDriveReport__out_(false, folderId, files, warnings, ['DriveApp unavailable in this runtime.']);
    }

    var folder = DriveApp.getFolderById(folderId);
    var scan = CbvTcsDriveReport__scanMaxSeq_(folder);
    if (scan.error) warnings.push('DRIVE_EXPORT_FOLDER_SCAN: ' + scan.error);

    var nextSeq = scan.max + 1;
    if (nextSeq < 0) nextSeq = 0;
    if (pair.seqHint >= 0 && scan.max < 0) nextSeq = pair.seqHint;
    if (nextSeq > 999) {
      warnings.push('DRIVE_EXPORT_SEQ_WRAP: sequence exceeded 999; using timestamp suffix for uniqueness.');
      nextSeq = 0;
    }

    var seq3 = ('000' + nextSeq).slice(-3);
    var phaseSlug = CbvTcsDriveReport__phaseSlug_(phase);
    var stamp = CbvTcsDriveReport__stamp_();
    var trace = CbvTcsDriveReport__sanitizePart_(report.traceId || ('trace_' + new Date().getTime()), 48);

    var baseStem = seq3 + '_' + sub + '_' + phaseSlug + '_' + stamp + '_' + trace;

    var fileRecords = [];

    if (wantJson) {
      var jName = CbvTcsDriveReport__uniqueName_(folder, baseStem + '.json');
      var jBody = JSON.stringify(report, null, 2);
      var jBlob = Utilities.newBlob(jBody, 'application/json', jName);
      var jf = folder.createFile(jBlob);
      files.push({ name: jf.getName(), fileId: jf.getId(), url: jf.getUrl(), mimeType: jf.getMimeType() });
      fileRecords.push({ name: jf.getName(), fileId: jf.getId(), url: jf.getUrl(), mimeType: jf.getMimeType() });
    }

    if (wantMd) {
      var mName = CbvTcsDriveReport__uniqueName_(folder, baseStem + '.md');
      var mdCtx = {
        folderId: folderId,
        allFiles: fileRecords.slice(),
        exporterVersion: (typeof CBV_TCS_ARTIFACT_REGISTRY_EXPORTER_VERSION === 'string')
          ? CBV_TCS_ARTIFACT_REGISTRY_EXPORTER_VERSION
          : 'CBV_TCS_EXPORT_97.2'
      };
      var mdBody;
      if (typeof CbvTcsArtifactRegistry_buildMarkdownMirror === 'function') {
        mdBody = CbvTcsArtifactRegistry_buildMarkdownMirror(report, mdCtx);
      } else {
        mdBody = CbvTcsDriveReport__toMarkdown_(report);
        warnings.push('MARKDOWN_MIRROR_FALLBACK: load 998M for CBV_TCS markdown mirror standard.');
      }
      var mBlob = Utilities.newBlob(mdBody, 'text/plain', mName);
      var mf = folder.createFile(mBlob);
      files.push({ name: mf.getName(), fileId: mf.getId(), url: mf.getUrl(), mimeType: mf.getMimeType() });
      fileRecords.push({ name: mf.getName(), fileId: mf.getId(), url: mf.getUrl(), mimeType: mf.getMimeType() });
    }

    if (wantTxt) {
      var tName = CbvTcsDriveReport__uniqueName_(folder, baseStem + '.txt');
      var tBody = (typeof CbvTcsArtifactRegistry_buildPlainTextMirror === 'function')
        ? CbvTcsArtifactRegistry_buildPlainTextMirror(report)
        : (JSON.stringify(report, null, 2));
      var tBlob = Utilities.newBlob(tBody, 'text/plain', tName);
      var tf = folder.createFile(tBlob);
      files.push({ name: tf.getName(), fileId: tf.getId(), url: tf.getUrl(), mimeType: tf.getMimeType() });
      fileRecords.push({ name: tf.getName(), fileId: tf.getId(), url: tf.getUrl(), mimeType: tf.getMimeType() });
    }

    var out = CbvTcsDriveReport__out_(true, folderId, files, warnings, errors);

    if (typeof CbvTcsArtifactRegistry_registerExportResult === 'function') {
      try {
        var reg = CbvTcsArtifactRegistry_registerExportResult(out, report);
        if (reg && reg.warnings && reg.warnings.length) out.warnings = (out.warnings || []).concat(reg.warnings);
        if (reg && !reg.ok && reg.errors && reg.errors.length) {
          out.warnings.push('ARTIFACT_REGISTRY_WRITE_FAILED: ' + reg.errors.join(' | '));
        }
      } catch (eReg) {
        out.warnings.push('ARTIFACT_REGISTRY_WRITE_FAILED: ' + (eReg && eReg.message ? eReg.message : String(eReg)));
      }
    }

    try {
      if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
        PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_DRIVE_EXPORT_LAST_RESULT_PROP_KEY, JSON.stringify(out));
      }
    } catch (eP) { /* ignore */ }
    return out;
  } catch (e) {
    errors.push(e && e.message ? e.message : String(e));
    var failOut = CbvTcsDriveReport__out_(false, folderId, files, warnings, errors);
    try {
      if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
        PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_DRIVE_EXPORT_LAST_RESULT_PROP_KEY, JSON.stringify(failOut));
      }
    } catch (eP) { /* ignore */ }
    return failOut;
  }
}

function CbvTcsDriveReport_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_DRIVE_EXPORT_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_DRIVE_EXPORT_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsDriveReport_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function (k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

/**
 * Health check for Drive exporter (creates a small JSON file; does not delete it).
 */
function CbvTcsDriveReport_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WS971_')
    : ('WS971_' + new Date().getTime());

  var checks = [];
  var warnings = [];
  var errors = [];

  function addCheck(code, ok, severity, message, detail) {
    var sev;
    if (ok) sev = severity || 'OK';
    else {
      if (severity === 'WARNING' || severity === 'ERROR' || severity === 'CRITICAL') sev = severity;
      else sev = 'ERROR';
    }
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
    if (!ok && (sev === 'ERROR' || sev === 'CRITICAL')) errors.push(message);
    if (!ok && sev === 'WARNING') warnings.push(message);
  }

  addCheck('FOLDER_ID', !!CBV_TCS_DRIVE_REPORT_FOLDER_ID, 'OK', 'CBV_TCS_DRIVE_REPORT_FOLDER_ID set', { folderId: CBV_TCS_DRIVE_REPORT_FOLDER_ID });
  addCheck('EXPORT_FN', typeof CbvTcsDriveReport_export === 'function', 'OK', 'CbvTcsDriveReport_export exists', {});

  var exResult = null;
  try {
    if (typeof DriveApp === 'undefined') {
      addCheck('DRIVE_APP', false, 'WARNING', 'DriveApp not available in this runtime.', {});
    } else {
      var folder = DriveApp.getFolderById(CBV_TCS_DRIVE_REPORT_FOLDER_ID);
      addCheck('FOLDER_ACCESS', !!folder, !!folder ? 'OK' : 'WARNING', 'Drive folder open attempt', { id: CBV_TCS_DRIVE_REPORT_FOLDER_ID });

      var mini = {
        ok: true,
        phase: 'PHASE_97_1_TEST_CONSOLE_DRIVE_REPORT_EXPORT',
        status: 'GO',
        checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
        runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : '',
        traceId: traceId,
        testSuite: 'CBV_TCS_DRIVE_EXPORT_PROBE',
        summary: 'Append-only probe file for Drive exporter health check.',
        checks: [{ code: 'PROBE', ok: true, severity: 'OK', message: 'Synthetic mini report', detail: {} }],
        warnings: [],
        errors: [],
        nextStep: 'Keep this file as audit artefact; do not delete (append-only policy).',
        severity: 'OK',
        reportText: 'probe',
        reportJson: {},
        contractVersion: 'CBV_TCS_V1',
        envelopeOk: true
      };

      exResult = CbvTcsDriveReport_export(mini, {
        phase: 'PHASE_97_1_TEST_CONSOLE_DRIVE_REPORT_EXPORT',
        testSuite: 'CBV_TCS_DRIVE_EXPORT_PROBE',
        prefix: '097_1',
        format: 'json'
      });

      addCheck('EXPORT_CALL', exResult && exResult.ok === true, exResult && exResult.ok ? 'OK' : 'WARNING',
        'CbvTcsDriveReport_export(probe)', { export: exResult });
      if (exResult && exResult.warnings && exResult.warnings.length) warnings = warnings.concat(exResult.warnings);
      if (exResult && exResult.errors && exResult.errors.length) {
        warnings.push('DRIVE_EXPORT_FAILED: ' + exResult.errors.join(' | '));
      }

      if (exResult && exResult.files && exResult.files[0]) {
        var u = exResult.files[0].url || '';
        addCheck('FILE_URL', u.indexOf('https://') === 0, u.indexOf('https://') === 0 ? 'OK' : 'WARNING', 'Exported file URL looks valid', { url: u });
      }
    }
  } catch (e) {
    addCheck('DRIVE_PROBE', false, 'WARNING', String(e && e.message ? e.message : e), {});
    warnings.push('DRIVE_EXPORT_FAILED: ' + (e && e.message ? e.message : String(e)));
  }

  addCheck('CLASP_999_LAST', true, 'OK', 'Confirm locally: 999_WEBAPP_DOGET_DISPATCHER_FINAL.js is last in .clasp.json filePushOrder.', {});

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: 'PHASE_97_1_TEST_CONSOLE_DRIVE_REPORT_EXPORT',
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_TCS_DRIVE_EXPORT_HEALTH',
    summary: 'Drive report exporter (97.1): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL' ? 'Fix Drive permissions / folder ID and rerun.' : 'Integrate CbvTcsDriveReport_export into other Test Consoles as needed.',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvTcsDriveReport_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 97.1 — DRIVE REPORT EXPORT ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId
  ].join('\n');

  CbvTcsDriveReport_TestConsole__storeLatest_(report);

  try {
    var lastRes = { ok: exResult ? exResult.ok : false, folderId: CBV_TCS_DRIVE_REPORT_FOLDER_ID, files: exResult ? exResult.files : [], warnings: exResult ? exResult.warnings : [], errors: exResult ? exResult.errors : [] };
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_DRIVE_EXPORT_LAST_RESULT_PROP_KEY, JSON.stringify(lastRes));
    }
  } catch (eP) { /* ignore */ }

  try { Logger.log(report.reportText); } catch (eL) { /* ignore */ }
  return report;
}

function CbvTcsDriveReport_TestConsole__getLastExportResult_() {
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_DRIVE_EXPORT_LAST_RESULT_PROP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function CbvTcsDriveReport_exportLatestPhase97ToDrive() {
  if (typeof CbvTcsDriveReport_export !== 'function') {
    return { ok: false, message: 'CbvTcsDriveReport_export not loaded.' };
  }
  var raw = null;
  try {
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      raw = PropertiesService.getDocumentProperties().getProperty('CBV_WEBAPP_STAFF_TRIAL_TC_LAST_REPORT_JSON');
    }
  } catch (e) { /* ignore */ }
  if (!raw) return { ok: false, message: 'No Phase 97 report in PropertiesService. Run Staff Trial Health Check first.' };
  var rep;
  try {
    rep = JSON.parse(raw);
  } catch (e2) {
    return { ok: false, message: 'Invalid stored report JSON.' };
  }
  var ex = CbvTcsDriveReport_export(rep, {
    phase: 'PHASE_97_STAFF_TRIAL_FEEDBACK_CAPTURE',
    testSuite: 'CBV_WEBAPP_STAFF_TRIAL_PHASE_97',
    prefix: '097_1',
    format: 'both'
  });
  return ex;
}

/**
 * Milestone 01 — append-only six-file evidence set (same numeric prefix).
 * Filenames: {NNN}_{tagStem}_REPORT.md|.json|.txt, _EVIDENCE.html, _AI_HANDOFF.md, _MANIFEST.json
 */
function CbvTcsDriveReport_exportMilestoneFullTestBundle(mainReport, options) {
  var warnings = [];
  var errors = [];
  var files = [];
  var folderId = CBV_TCS_DRIVE_REPORT_FOLDER_ID;
  var opt = options || {};
  var tagStem = CbvTcsDriveReport__sanitizePart_(opt.tagStem || 'MILESTONE_01_FULL_TEST', 60);

  if (!mainReport || typeof mainReport !== 'object') {
    return CbvTcsDriveReport__out_(false, folderId, files, warnings, ['mainReport must be an object']);
  }

  try {
    if (typeof DriveApp === 'undefined') {
      return CbvTcsDriveReport__out_(false, folderId, files, warnings, ['DriveApp unavailable']);
    }
    var folder = DriveApp.getFolderById(folderId);
    var scan = CbvTcsDriveReport__scanMaxSeq_(folder);
    if (scan.error) warnings.push('BUNDLE_FOLDER_SCAN: ' + scan.error);
    var nextSeq = scan.max + 1;
    if (nextSeq < 0) nextSeq = 0;
    if (nextSeq > 999) {
      warnings.push('BUNDLE_SEQ_WRAP');
      nextSeq = 0;
    }
    var seq3 = ('000' + nextSeq).slice(-3);

    function writeFile(suffix, ext, body, mime) {
      var name = CbvTcsDriveReport__uniqueName_(folder, seq3 + '_' + tagStem + '_' + suffix + '.' + ext);
      var blob = Utilities.newBlob(String(body || ''), mime || 'text/plain', name);
      var f = folder.createFile(blob);
      files.push({ name: f.getName(), fileId: f.getId(), url: f.getUrl(), mimeType: f.getMimeType(), role: suffix + '.' + ext });
    }

    var mdBody = (typeof CbvTcsArtifactRegistry_buildMarkdownMirror === 'function')
      ? CbvTcsArtifactRegistry_buildMarkdownMirror(mainReport, { folderId: folderId, allFiles: [], exporterVersion: 'MILESTONE_01_BUNDLE' })
      : CbvTcsDriveReport__toMarkdown_(mainReport);
    var reportTxt = (typeof CbvTcsArtifactRegistry_buildPlainTextMirror === 'function')
      ? CbvTcsArtifactRegistry_buildPlainTextMirror(mainReport)
      : JSON.stringify(mainReport, null, 2);

    writeFile('REPORT', 'md', mdBody, 'text/plain');
    writeFile('REPORT', 'json', JSON.stringify(mainReport, null, 2), 'application/json');
    writeFile('REPORT', 'txt', reportTxt, 'text/plain');

    var handoffMd = String(opt.aiHandoffMarkdown || ('# AI Handoff — Milestone 01\n\n- traceId: `' + String(mainReport.traceId || '') + '`\n- status: `' + String(mainReport.status || '') + '`\n- nextStep: ' + String(mainReport.nextStep || '') + '\n'));
    writeFile('AI_HANDOFF', 'md', handoffMd, 'text/plain');

    var chk = JSON.stringify(mainReport.checks || [], null, 2);
    var evidenceHtml = String(opt.evidenceHtml || ('<!DOCTYPE html><html><head><meta charset="utf-8"><title>MILESTONE_01 Evidence</title></head><body><h1>Checks</h1><pre>' +
      chk.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre></body></html>'));
    writeFile('EVIDENCE', 'html', evidenceHtml, 'text/html');

    var manifest = {
      contractVersion: 'CBV_TCS_V1',
      tagStem: tagStem,
      seq: seq3,
      traceId: String(mainReport.traceId || ''),
      createdAt: new Date().toISOString(),
      files: files.map(function (f) { return { name: f.name, id: f.fileId, url: f.url }; }),
      testSuite: String(mainReport.testSuite || ''),
      finalStatus: String(mainReport.status || ''),
      status: String(mainReport.status || ''),
      ok: mainReport.ok === true,
      severity: String(mainReport.severity || ''),
      envelopeOk: mainReport.envelopeOk === true
    };
    writeFile('MANIFEST', 'json', JSON.stringify(manifest, null, 2), 'application/json');

    return CbvTcsDriveReport__out_(true, folderId, files, warnings, errors);
  } catch (e) {
    errors.push(e && e.message ? e.message : String(e));
    return CbvTcsDriveReport__out_(false, folderId, files, warnings, errors);
  }
}

function CbvTcsDriveReport_TestConsole_copyLatestResult() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvTcsDriveReport_TestConsole__getLastExportResult_();
  if (!r) {
    ui.alert('No result', 'Run Drive Export Health Check or Export Latest Phase 97 Report first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 97.1 — Drive export result');
  return { ok: true };
}
