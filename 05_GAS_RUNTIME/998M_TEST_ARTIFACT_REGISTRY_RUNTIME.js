/**
 * PHASE_97_2 — CBV Test Artifact Registry + Markdown mirror helpers
 *
 * Append-only sheet `CBV_TEST_ARTIFACT_REGISTRY` (one row per Drive artifact).
 * No row delete/update. No Drive delete/trash/overwrite.
 *
 * Standard: CBV Operational Ecosystem V1 · CBV_TCS_V1
 */

var CBV_TCS_ARTIFACT_REGISTRY_PHASE_ID = 'PHASE_97_2_TEST_ARTIFACT_REGISTRY_MARKDOWN_MIRROR';
var CBV_TCS_ARTIFACT_REGISTRY_CONTRACT_VERSION = 'CBV_TCS_V1';
var CBV_TCS_ARTIFACT_REGISTRY_EXPORTER_VERSION = 'CBV_TCS_EXPORT_97.2';

var CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME = 'CBV_TEST_ARTIFACT_REGISTRY';

var CBV_TCS_ARTIFACT_REGISTRY_HEADERS = [
  'ARTIFACT_ID',
  'CREATED_AT',
  'CREATED_BY',
  'PHASE',
  'TEST_SUITE',
  'TRACE_ID',
  'STATUS',
  'SEVERITY',
  'CONTRACT_VERSION',
  'ENVELOPE_OK',
  'FOLDER_ID',
  'FILE_NAME',
  'FILE_ID',
  'FILE_URL',
  'MIME_TYPE',
  'ARTIFACT_KIND',
  'FORMAT',
  'SOURCE',
  'EXPORTER_VERSION',
  'REPORT_CHECKED_AT',
  'REPORT_RUN_BY',
  'REPORT_SUMMARY',
  'REPORT_WARNINGS_COUNT',
  'REPORT_ERRORS_COUNT',
  'IS_DELETED'
];

function CbvTcsArtifactRegistry__getSpreadsheet_() {
  try {
    if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getActiveSpreadsheet) {
      return SpreadsheetApp.getActiveSpreadsheet();
    }
  } catch (e) { /* ignore */ }
  return null;
}

function CbvTcsArtifactRegistry__newId_() {
  return 'ART-' + new Date().getTime() + '-' + Math.floor(Math.random() * 9000 + 1000);
}

function CbvTcsArtifactRegistry__isoNow_() {
  try {
    return (typeof CbvWebAppWorkspace__now_ === 'function') ? String(CbvWebAppWorkspace__now_()) : new Date().toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

function CbvTcsArtifactRegistry__createdBy_() {
  try {
    if (typeof Session !== 'undefined' && Session.getActiveUser) {
      return Session.getActiveUser().getEmail() || '';
    }
  } catch (e) { /* ignore */ }
  return '';
}

function CbvTcsArtifactRegistry__out_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

/**
 * Creates registry sheet + header row if missing (does not clear data).
 */
function CbvTcsArtifactRegistry_ensureSchema() {
  var warnings = [];
  var errors = [];
  try {
    var ss = CbvTcsArtifactRegistry__getSpreadsheet_();
    if (!ss) return CbvTcsArtifactRegistry__out_(false, null, warnings, ['No active spreadsheet.']);

    var sh = ss.getSheetByName(CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME);
    var created = false;
    if (!sh) {
      sh = ss.insertSheet(CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME);
      created = true;
    }

    var hdr = sh.getRange(1, 1, 1, CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length).getValues()[0];
    var first = hdr[0] ? String(hdr[0]).trim() : '';
    if (!first) {
      sh.getRange(1, 1, 1, CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length).setValues([CBV_TCS_ARTIFACT_REGISTRY_HEADERS]);
      return CbvTcsArtifactRegistry__out_(true, { sheetName: CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME, created: created, headerWritten: true }, warnings, errors);
    }

    var mismatch = false;
    for (var c = 0; c < CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length; c++) {
      if (String(hdr[c] || '').trim() !== CBV_TCS_ARTIFACT_REGISTRY_HEADERS[c]) {
        mismatch = true;
        break;
      }
    }
    if (mismatch) {
      errors.push('Row 1 headers do not match Phase 97.2 contract. Fix manually (append-only; do not delete data rows).');
      return CbvTcsArtifactRegistry__out_(false, { sheetName: CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME, created: created }, warnings, errors);
    }

    return CbvTcsArtifactRegistry__out_(true, { sheetName: CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME, created: created, headerWritten: false }, warnings, errors);
  } catch (e) {
    return CbvTcsArtifactRegistry__out_(false, null, warnings, [e && e.message ? e.message : String(e)]);
  }
}

/**
 * Append one registry row. meta keys align with CBV_TCS_ARTIFACT_REGISTRY_HEADERS (subset allowed).
 */
function CbvTcsArtifactRegistry_registerArtifact(meta) {
  var warnings = [];
  try {
    var ensured = CbvTcsArtifactRegistry_ensureSchema();
    if (!ensured.ok) return CbvTcsArtifactRegistry__out_(false, null, ensured.warnings || [], ensured.errors || ['ensureSchema failed']);

    var m = meta || {};
    var ss = CbvTcsArtifactRegistry__getSpreadsheet_();
    var sh = ss.getSheetByName(CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME);
    if (!sh) return CbvTcsArtifactRegistry__out_(false, null, warnings, ['Registry sheet missing.']);

    var rowObj = {
      ARTIFACT_ID: m.ARTIFACT_ID || CbvTcsArtifactRegistry__newId_(),
      CREATED_AT: m.CREATED_AT || CbvTcsArtifactRegistry__isoNow_(),
      CREATED_BY: m.CREATED_BY || CbvTcsArtifactRegistry__createdBy_(),
      PHASE: String(m.PHASE || ''),
      TEST_SUITE: String(m.TEST_SUITE || ''),
      TRACE_ID: String(m.TRACE_ID || ''),
      STATUS: String(m.STATUS || ''),
      SEVERITY: String(m.SEVERITY || ''),
      CONTRACT_VERSION: String(m.CONTRACT_VERSION || 'CBV_TCS_V1'),
      ENVELOPE_OK: m.ENVELOPE_OK === true || m.ENVELOPE_OK === false ? String(m.ENVELOPE_OK) : '',
      FOLDER_ID: String(m.FOLDER_ID || ''),
      FILE_NAME: String(m.FILE_NAME || ''),
      FILE_ID: String(m.FILE_ID || ''),
      FILE_URL: String(m.FILE_URL || ''),
      MIME_TYPE: String(m.MIME_TYPE || ''),
      ARTIFACT_KIND: String(m.ARTIFACT_KIND || ''),
      FORMAT: String(m.FORMAT || ''),
      SOURCE: String(m.SOURCE || ''),
      EXPORTER_VERSION: String(m.EXPORTER_VERSION || CBV_TCS_ARTIFACT_REGISTRY_EXPORTER_VERSION),
      REPORT_CHECKED_AT: String(m.REPORT_CHECKED_AT != null ? m.REPORT_CHECKED_AT : ''),
      REPORT_RUN_BY: String(m.REPORT_RUN_BY != null ? m.REPORT_RUN_BY : ''),
      REPORT_SUMMARY: String(m.REPORT_SUMMARY != null ? m.REPORT_SUMMARY : ''),
      REPORT_WARNINGS_COUNT: m.REPORT_WARNINGS_COUNT != null ? String(m.REPORT_WARNINGS_COUNT) : '',
      REPORT_ERRORS_COUNT: m.REPORT_ERRORS_COUNT != null ? String(m.REPORT_ERRORS_COUNT) : '',
      IS_DELETED: String(m.IS_DELETED != null ? m.IS_DELETED : 'FALSE')
    };

    var row = CBV_TCS_ARTIFACT_REGISTRY_HEADERS.map(function (h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
    sh.appendRow(row);
    return CbvTcsArtifactRegistry__out_(true, { artifactId: rowObj.ARTIFACT_ID, rowNumber: sh.getLastRow() }, warnings, []);
  } catch (e) {
    return CbvTcsArtifactRegistry__out_(false, null, warnings, [e && e.message ? e.message : String(e)]);
  }
}

function CbvTcsArtifactRegistry__kindFromName_(name) {
  var n = String(name || '').toLowerCase();
  if (n.indexOf('.json') === n.length - 5) return 'JSON';
  if (n.indexOf('.md') === n.length - 3) return 'MD';
  if (n.indexOf('.txt') === n.length - 4) return 'TXT';
  return 'OTHER';
}

function CbvTcsArtifactRegistry__formatFromName_(name) {
  var k = CbvTcsArtifactRegistry__kindFromName_(name);
  if (k === 'JSON') return 'json';
  if (k === 'MD') return 'md';
  if (k === 'TXT') return 'txt';
  return 'other';
}

/**
 * Registers one sheet row per file in exportResult.files (append-only).
 */
function CbvTcsArtifactRegistry_registerExportResult(exportResult, report) {
  var warnings = [];
  try {
    if (!exportResult || !Array.isArray(exportResult.files)) {
      return CbvTcsArtifactRegistry__out_(true, { registered: 0 }, ['Nothing to register (no files array).'], []);
    }
    if (!exportResult.ok) {
      return CbvTcsArtifactRegistry__out_(true, { registered: 0 }, ['Export not ok — skipping registry rows for failed export.'], []);
    }
    var r = report || {};
    var wc = Array.isArray(r.warnings) ? r.warnings.length : 0;
    var ec = Array.isArray(r.errors) ? r.errors.length : 0;
    var n = 0;
    for (var i = 0; i < exportResult.files.length; i++) {
      var f = exportResult.files[i];
      var regRow = CbvTcsArtifactRegistry_registerArtifact({
        PHASE: r.phase || '',
        TEST_SUITE: r.testSuite || '',
        TRACE_ID: r.traceId || '',
        STATUS: r.status || '',
        SEVERITY: r.severity || '',
        CONTRACT_VERSION: r.contractVersion || 'CBV_TCS_V1',
        ENVELOPE_OK: r.envelopeOk,
        FOLDER_ID: exportResult.folderId || '',
        FILE_NAME: f.name || '',
        FILE_ID: f.fileId || '',
        FILE_URL: f.url || '',
        MIME_TYPE: f.mimeType || '',
        ARTIFACT_KIND: CbvTcsArtifactRegistry__kindFromName_(f.name),
        FORMAT: CbvTcsArtifactRegistry__formatFromName_(f.name),
        SOURCE: 'CbvTcsDriveReport_export',
        EXPORTER_VERSION: CBV_TCS_ARTIFACT_REGISTRY_EXPORTER_VERSION,
        REPORT_CHECKED_AT: r.checkedAt != null ? String(r.checkedAt) : '',
        REPORT_RUN_BY: r.runBy != null ? String(r.runBy) : '',
        REPORT_SUMMARY: r.summary != null ? String(r.summary) : '',
        REPORT_WARNINGS_COUNT: wc,
        REPORT_ERRORS_COUNT: ec,
        IS_DELETED: 'FALSE'
      });
      if (regRow.ok) n++;
      else if (regRow.errors && regRow.errors.length) warnings = warnings.concat(regRow.errors);
    }
    return CbvTcsArtifactRegistry__out_(true, { registered: n }, warnings, []);
  } catch (e) {
    return CbvTcsArtifactRegistry__out_(false, null, warnings, [e && e.message ? e.message : String(e)]);
  }
}

function CbvTcsArtifactRegistry_listRecent(limit) {
  var lim = parseInt(limit, 10);
  if (!(lim > 0)) lim = 30;
  if (lim > 500) lim = 500;
  try {
    var ss = CbvTcsArtifactRegistry__getSpreadsheet_();
    if (!ss) return CbvTcsArtifactRegistry__out_(false, { rows: [] }, [], ['No active spreadsheet.']);
    var sh = ss.getSheetByName(CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME);
    if (!sh) return CbvTcsArtifactRegistry__out_(true, { rows: [], note: 'Sheet missing — run CbvTcsArtifactRegistry_ensureSchema().' }, ['Sheet missing'], []);

    var lr = sh.getLastRow();
    if (lr < 2) return CbvTcsArtifactRegistry__out_(true, { rows: [] }, [], []);

    var start = Math.max(2, lr - lim + 1);
    var values = sh.getRange(start, 1, lr, CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length).getValues();
    var rows = [];
    for (var i = values.length - 1; i >= 0; i--) {
      var obj = {};
      for (var c = 0; c < CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length; c++) {
        obj[CBV_TCS_ARTIFACT_REGISTRY_HEADERS[c]] = values[i][c];
      }
      rows.push(obj);
    }
    return CbvTcsArtifactRegistry__out_(true, { rows: rows, window: { fromRow: start, toRow: lr } }, [], []);
  } catch (e) {
    return CbvTcsArtifactRegistry__out_(false, null, [], [e && e.message ? e.message : String(e)]);
  }
}

function CbvTcsArtifactRegistry_findByTraceId(traceId) {
  var tid = String(traceId || '').trim();
  if (!tid) {
    return CbvTcsArtifactRegistry__out_(true, { rows: [], match: '' }, ['traceId is empty — provide a substring to search.'], []);
  }
  try {
    var ss = CbvTcsArtifactRegistry__getSpreadsheet_();
    if (!ss) return CbvTcsArtifactRegistry__out_(false, { rows: [] }, [], ['No active spreadsheet.']);
    var sh = ss.getSheetByName(CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME);
    if (!sh || sh.getLastRow() < 2) return CbvTcsArtifactRegistry__out_(true, { rows: [] }, [], []);

    var data = sh.getRange(2, 1, sh.getLastRow(), CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length).getValues();
    var idx = CBV_TCS_ARTIFACT_REGISTRY_HEADERS.indexOf('TRACE_ID');
    var rows = [];
    for (var i = 0; i < data.length; i++) {
      var cell = String(data[i][idx] || '');
      if (cell.indexOf(tid) >= 0) {
        var obj = {};
        for (var c = 0; c < CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length; c++) {
          obj[CBV_TCS_ARTIFACT_REGISTRY_HEADERS[c]] = data[i][c];
        }
        rows.push(obj);
      }
    }
    return CbvTcsArtifactRegistry__out_(true, { rows: rows, match: tid }, [], []);
  } catch (e) {
    return CbvTcsArtifactRegistry__out_(false, null, [], [e && e.message ? e.message : String(e)]);
  }
}

function CbvTcsArtifactRegistry_findByPhase(phase, limit) {
  var ph = String(phase || '').trim();
  var lim = parseInt(limit, 10);
  if (!(lim > 0)) lim = 50;
  if (lim > 500) lim = 500;
  try {
    var ss = CbvTcsArtifactRegistry__getSpreadsheet_();
    if (!ss) return CbvTcsArtifactRegistry__out_(false, { rows: [] }, [], ['No active spreadsheet.']);
    var sh = ss.getSheetByName(CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME);
    if (!sh || sh.getLastRow() < 2) return CbvTcsArtifactRegistry__out_(true, { rows: [] }, [], []);

    var data = sh.getRange(2, 1, sh.getLastRow(), CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length).getValues();
    var pIdx = CBV_TCS_ARTIFACT_REGISTRY_HEADERS.indexOf('PHASE');
    var rows = [];
    for (var i = data.length - 1; i >= 0 && rows.length < lim; i--) {
      if (String(data[i][pIdx] || '') === ph) {
        var obj = {};
        for (var c = 0; c < CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length; c++) {
          obj[CBV_TCS_ARTIFACT_REGISTRY_HEADERS[c]] = data[i][c];
        }
        rows.push(obj);
      }
    }
    return CbvTcsArtifactRegistry__out_(true, { rows: rows, phase: ph }, [], []);
  } catch (e) {
    return CbvTcsArtifactRegistry__out_(false, null, [], [e && e.message ? e.message : String(e)]);
  }
}

function CbvTcsArtifactRegistry_buildMarkdownMirror(report, artifactCtx) {
  var r = report || {};
  var ctx = artifactCtx || {};
  var checks = Array.isArray(r.checks) ? r.checks : [];
  var checkLines = checks.map(function (c) {
    var sev = c.severity != null ? String(c.severity) : '';
    return '- **' + String(c.code || '') + '** — ' + sev + ' — ' + String(c.message || '');
  }).join('\n');

  var rawJson = JSON.stringify(r, null, 2);

  var lines = [
    '# CBV Test Console Report',
    '',
    '## Metadata',
    '',
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
    '',
    '## Artifact Registry',
    '',
    '- FolderId: `' + String(ctx.folderId || '') + '`'
  ];

  if (ctx.fileId) lines.push('- FileId: `' + String(ctx.fileId) + '`');
  if (ctx.fileUrl) lines.push('- FileUrl: `' + String(ctx.fileUrl) + '`');
  if (ctx.fileName) lines.push('- FileName: `' + String(ctx.fileName) + '`');
  if (ctx.exporterVersion) lines.push('- ExporterVersion: `' + String(ctx.exporterVersion) + '`');

  if (ctx.allFiles && ctx.allFiles.length) {
    lines.push('');
    lines.push('### Files (this export)');
    for (var i = 0; i < ctx.allFiles.length; i++) {
      var f = ctx.allFiles[i];
      lines.push('- `' + String(f.name || '') + '` → ' + String(f.url || ''));
    }
  }

  lines.push('');
  return lines.join('\n');
}

function CbvTcsArtifactRegistry_buildPlainTextMirror(report) {
  var r = report || {};
  var lines = [
    'CBV Test Console Report (plain text mirror)',
    'Phase: ' + String(r.phase || ''),
    'Status: ' + String(r.status || ''),
    'Severity: ' + String(r.severity || ''),
    'TraceId: ' + String(r.traceId || ''),
    'TestSuite: ' + String(r.testSuite || ''),
    'Summary: ' + String(r.summary || ''),
    'NextStep: ' + String(r.nextStep || ''),
    '',
    'JSON (same as Drive .json):',
    JSON.stringify(r, null, 2)
  ];
  return lines.join('\n');
}

function CbvTcsArtifactRegistry_buildHandoffPrompt() {
  return [
    '=== CBV — Phase 97.2 Test Artifact Registry / Markdown Mirror ===',
    '',
    'Repo: https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO',
    'Branch: phase/from-v2.4.1-TASK-FIN',
    '',
    'Drive folder (append-only reports): 1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG',
    'Registry sheet: CBV_TEST_ARTIFACT_REGISTRY (one row per artifact file).',
    '',
    'Rules:',
    '- Do not delete or overwrite Drive files or registry rows.',
    '- JSON is source of truth; .md / .txt are AI-auditable mirrors.',
    '- Not certified for production operations.',
    '',
    'Use CbvTcsArtifactRegistry_findByTraceId / listRecent for audit.',
    ''
  ].join('\n');
}

function CbvTcsArtifactRegistry_validate() {
  var warnings = [];
  var errors = [];

  var detail = {
    sheetPresent: false,
    headerOk: false,
    noMutationExposed: true,
    mutationProbe: [],
    mutationAllowlist: [],
    clasp999Note: 'Confirm locally: 999_WEBAPP_DOGET_DISPATCHER_FINAL.js is last in .clasp.json filePushOrder.'
  };

  try {
    var ss = CbvTcsArtifactRegistry__getSpreadsheet_();
    if (!ss) warnings.push('No active spreadsheet — registry sheet checks skipped.');
    else {
      var sh = ss.getSheetByName(CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME);
      if (sh) {
        detail.sheetPresent = true;
        var hdr = sh.getRange(1, 1, 1, CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length).getValues()[0];
        var ok = true;
        for (var c = 0; c < CBV_TCS_ARTIFACT_REGISTRY_HEADERS.length; c++) {
          if (String(hdr[c] || '').trim() !== CBV_TCS_ARTIFACT_REGISTRY_HEADERS[c]) ok = false;
        }
        detail.headerOk = ok;
        if (!ok) errors.push('Registry header row mismatch Phase 97.2 contract.');
      } else {
        warnings.push('Sheet ' + CBV_TCS_ARTIFACT_REGISTRY_SHEET_NAME + ' not found — run CbvTcsArtifactRegistry_ensureSchema().');
      }
    }
  } catch (e) {
    warnings.push('Registry probe: ' + (e && e.message ? e.message : String(e)));
  }

  var low = CbvTcsArtifactRegistry_buildHandoffPrompt().toLowerCase();
  if (low.indexOf('production ready') >= 0 || low.indexOf('prod ready') >= 0) {
    errors.push('Handoff must not contain production-ready shorthand.');
  }

  detail.mutationAllowlist = [
    'CbvTcsArtifactRegistry_ensureSchema',
    'CbvTcsArtifactRegistry_registerArtifact',
    'CbvTcsArtifactRegistry_registerExportResult',
    'CbvTcsArtifactRegistry_listRecent',
    'CbvTcsArtifactRegistry_findByTraceId',
    'CbvTcsArtifactRegistry_findByPhase',
    'CbvTcsArtifactRegistry_validate',
    'CbvTcsArtifactRegistry_buildMarkdownMirror',
    'CbvTcsArtifactRegistry_buildPlainTextMirror',
    'CbvTcsArtifactRegistry_buildHandoffPrompt'
  ];
  var allowPatterns = [/^CbvTcsArtifactRegistry__/, /^CbvTcsArtifactRegistry_TestConsole_/];
  var verbRe = /^(set|update|delete|save|mutate|assign|escalate|resolve|complete|toggle|enable|disable|grant|revoke|provision|deprovision|edit|reset|rotate|heal|repair|clear|remove|trash)[A-Z]/i;

  function isMutationName(name) {
    if (typeof name !== 'string') return false;
    if (name.indexOf('CbvTcsArtifactRegistry_') !== 0) return false;
    if (detail.mutationAllowlist.indexOf(name) >= 0) return false;
    for (var i = 0; i < allowPatterns.length; i++) {
      if (allowPatterns[i].test(name)) return false;
    }
    var action = name.replace(/^CbvTcsArtifactRegistry_/, '').replace(/^_+/, '');
    return verbRe.test(action);
  }

  try {
    var globals = (typeof this !== 'undefined') ? this : {};
    var keys = Object.keys(globals || {});
    for (var k = 0; k < keys.length; k++) {
      var n = keys[k];
      if (isMutationName(n) && typeof globals[n] === 'function') {
        detail.noMutationExposed = false;
        detail.mutationProbe.push(n);
      }
    }
  } catch (eP) {
    warnings.push('Mutation probe skipped: ' + (eP && eP.message ? eP.message : String(eP)));
  }
  if (!detail.noMutationExposed) {
    errors.push('Phase 97.2 namespace exposes mutation-like functions: ' + detail.mutationProbe.join(', '));
  }

  return CbvTcsArtifactRegistry__out_(errors.length === 0, detail, warnings, errors);
}
