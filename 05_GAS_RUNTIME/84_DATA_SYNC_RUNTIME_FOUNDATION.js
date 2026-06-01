/**
 * CBV_DATA_SYNC_RUNTIME v1 — Foundation (PHASE_DSR_01_FOUNDATION).
 *
 * Principles:
 * - Idempotent sheet/header bootstrap only — no SOURCE → DESTINATION sync.
 * - Append-only SYNC_LOG, SYNC_AUDIT, SYNC_REPORT.
 * - No triggers; manual-first via 🚀 CBV Runtime menu.
 * - Does not delete sheets or overwrite business rows.
 *
 * Dependencies: 90_BOOTSTRAP_INIT (ensureSheetExists, ensureHeadersMatchOrReport, _writeHeaders)
 */

var CBV_DSR_VERSION = '1.0.0-foundation';
var CBV_DSR_SHEETS = {
  DASHBOARD: 'DASHBOARD_SYNC',
  CONFIG: 'SYNC_CONFIG',
  PLAN: 'SYNC_PLAN',
  LOG: 'SYNC_LOG',
  AUDIT: 'SYNC_AUDIT',
  REPORT: 'SYNC_REPORT',
  BACKUP_INDEX: 'SYNC_BACKUP_INDEX',
  SELECTION: 'SYNC_SELECTION'
};

var CBV_DSR_HEADERS = {
  SYNC_CONFIG: ['KEY', 'VALUE', 'DESCRIPTION', 'UPDATED_AT', 'UPDATED_BY'],
  SYNC_PLAN: [
    'RUN_ID', 'PLAN_AT', 'SOURCE_SHEET', 'DESTINATION_SHEET', 'ACTION',
    'SOURCE_ROWS', 'SOURCE_COLS', 'DEST_ROWS', 'DEST_COLS', 'HEADER_STATUS', 'STATUS', 'MESSAGE'
  ],
  SYNC_LOG: ['RUN_ID', 'LOG_AT', 'LEVEL', 'PHASE', 'ACTION', 'STATUS', 'MESSAGE', 'DETAIL_JSON', 'ACTOR'],
  SYNC_AUDIT: [
    'AUDIT_ID', 'RUN_ID', 'AUDIT_AT', 'AUDIT_TYPE', 'ENTITY_TYPE', 'ENTITY_ID',
    'ACTION', 'BEFORE_JSON', 'AFTER_JSON', 'NOTE', 'ACTOR'
  ],
  SYNC_REPORT: [
    'REPORT_ID', 'RUN_ID', 'REPORT_AT', 'PHASE', 'RESULT', 'SUMMARY',
    'WARNINGS_JSON', 'ERRORS_JSON', 'NEXT_STEP', 'REPORT_JSON'
  ],
  SYNC_BACKUP_INDEX: [
    'BACKUP_ID', 'RUN_ID', 'BACKUP_AT', 'SOURCE_SHEET', 'BACKUP_SHEET', 'ROWS', 'COLS', 'STATUS', 'MESSAGE'
  ],
  SYNC_SELECTION: [
    'RUN_ID', 'SELECTED_AT', 'SHEET_NAME', 'IN_WHITELIST', 'FORBIDDEN', 'DIFF_STATUS',
    'OPERATOR_DECISION', 'APPROVED_BY', 'APPROVED_AT', 'APPLY_STATUS', 'MESSAGE', 'DETAIL_JSON'
  ]
};

var CBV_DSR_CONFIG_SEED = [
  { key: 'DSR_VERSION', value: CBV_DSR_VERSION, description: 'Data Sync Runtime version' },
  { key: 'SOURCE_SPREADSHEET_ID', value: '', description: 'Source spreadsheet ID (set in PHASE_DSR_02)' },
  { key: 'DESTINATION_SPREADSHEET_ID', value: '', description: 'Destination spreadsheet ID (set in PHASE_DSR_02)' },
  { key: 'SYNC_MODE', value: 'MANUAL', description: 'Sync execution mode — MANUAL until connection phase' },
  { key: 'SAFETY_MODE', value: 'STRICT', description: 'Safety profile — no destructive ops in foundation' },
  { key: 'LAST_BOOTSTRAP_AT', value: '', description: 'Last foundation bootstrap timestamp (ISO)' }
];

function cbvDsrNow_() {
  if (typeof cbvNow === 'function') return cbvNow();
  return new Date();
}

function cbvDsrActor_() {
  if (typeof cbvUser === 'function') return cbvUser();
  try {
    return Session.getActiveUser().getEmail() || 'system';
  } catch (e) {
    return 'system';
  }
}

function cbvDsrRunId_() {
  return 'RUN_DSR_' + Utilities.getUuid();
}

function cbvDsrIso_(d) {
  var dt = d || cbvDsrNow_();
  try {
    return Utilities.formatDate(dt, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', "yyyy-MM-dd'T'HH:mm:ss");
  } catch (e2) {
    return String(dt);
  }
}

function cbvDsrActiveSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Ensure sheet exists with append-friendly headers (row 1).
 * Never deletes sheets. Headers written only when empty or safely extendable.
 */
function cbvDsrEnsureSheetWithHeaders_(ss, sheetName, headers) {
  var out = { sheetName: sheetName, created: false, headersWritten: false, extended: false, ok: true };
  if (!ss || !sheetName) {
    out.ok = false;
    out.error = 'Missing spreadsheet or sheet name';
    return out;
  }
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    out.created = true;
  }
  var hdrs = headers || [];
  if (!hdrs.length) {
    out.sheet = sheet;
    return out;
  }
  if (typeof ensureHeadersMatchOrReport === 'function' && typeof _writeHeaders === 'function') {
    var check = ensureHeadersMatchOrReport(sheet, hdrs);
    if (check.match) {
      out.sheet = sheet;
      return out;
    }
    if (out.created || (check.canExtend && check.missingCount)) {
      _writeHeaders(sheet, hdrs);
      out.headersWritten = true;
      out.extended = !out.created && !!check.missingCount;
    } else if (check.mismatchReason) {
      out.ok = false;
      out.error = check.mismatchReason;
      out.detail = check;
    }
    out.sheet = sheet;
    return out;
  }
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    sheet.getRange(1, 1, 1, hdrs.length).setValues([hdrs]);
    out.headersWritten = true;
  }
  out.sheet = sheet;
  return out;
}

function cbvDsrEnsureFoundationSheets_() {
  var ss = cbvDsrActiveSpreadsheet_();
  var result = { ok: true, sheets: [], errors: [] };
  var specs = [
    { name: CBV_DSR_SHEETS.CONFIG, headers: CBV_DSR_HEADERS.SYNC_CONFIG },
    { name: CBV_DSR_SHEETS.PLAN, headers: CBV_DSR_HEADERS.SYNC_PLAN },
    { name: CBV_DSR_SHEETS.LOG, headers: CBV_DSR_HEADERS.SYNC_LOG },
    { name: CBV_DSR_SHEETS.AUDIT, headers: CBV_DSR_HEADERS.SYNC_AUDIT },
    { name: CBV_DSR_SHEETS.REPORT, headers: CBV_DSR_HEADERS.SYNC_REPORT },
    { name: CBV_DSR_SHEETS.BACKUP_INDEX, headers: CBV_DSR_HEADERS.SYNC_BACKUP_INDEX },
    { name: CBV_DSR_SHEETS.SELECTION, headers: CBV_DSR_HEADERS.SYNC_SELECTION }
  ];
  specs.forEach(function (spec) {
    var row = cbvDsrEnsureSheetWithHeaders_(ss, spec.name, spec.headers);
    result.sheets.push(row);
    if (!row.ok) {
      result.ok = false;
      result.errors.push(spec.name + ': ' + String(row.error || 'header check failed'));
    }
  });
  var dash = cbvDsrEnsureDashboardShell_(ss);
  result.sheets.push(dash);
  if (!dash.ok) {
    result.ok = false;
    result.errors.push(CBV_DSR_SHEETS.DASHBOARD + ': ' + String(dash.error || 'dashboard failed'));
  }
  return result;
}

function cbvDsrEnsureDashboardShell_(ss) {
  var out = cbvDsrEnsureSheetWithHeaders_(ss, CBV_DSR_SHEETS.DASHBOARD, []);
  if (!out.ok) return out;
  var sheet = out.sheet;
  if (!sheet) {
    out.ok = false;
    out.error = 'Dashboard sheet missing';
    return out;
  }
  if (sheet.getLastRow() > 1) {
    out.skipped = 'Dashboard has content — not overwriting';
    return out;
  }
  var now = cbvDsrIso_(cbvDsrNow_());
  var rows = [
    ['CBV DATA SYNC RUNTIME v1', ''],
    ['', ''],
    ['Runtime Status', 'FOUNDATION — not connected'],
    ['Configuration', 'See SYNC_CONFIG tab'],
    ['Last Run', '(none — foundation only)'],
    ['Foundation Health', 'Run menu: Health Check Foundation'],
    ['Next Action', '1. Bootstrap DSR Foundation  2. Set SOURCE/DEST IDs in SYNC_CONFIG (PHASE_DSR_02)'],
    ['', ''],
    ['Operator Instructions', ''],
    ['', 'Use 🚀 CBV Runtime → 🔁 Data Sync Runtime. Do not sync until PHASE_DSR_02+.'],
    ['', 'Append-only logs: SYNC_LOG, SYNC_AUDIT, SYNC_REPORT.'],
    ['', 'No automatic triggers in foundation phase.'],
    ['Last dashboard refresh', now]
  ];
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 480);
  out.dashboardWritten = true;
  return out;
}

function cbvDsrFindConfigRowIndex_(sheet, key) {
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var keys = sheet.getRange(2, 1, last - 1, 1).getValues();
  var want = String(key || '').trim();
  for (var i = 0; i < keys.length; i++) {
    if (String(keys[i][0] || '').trim() === want) return i + 2;
  }
  return -1;
}

function cbvDsrSeedConfigIfMissing_(ss, actor, runId) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.CONFIG);
  if (!sheet) return { ok: false, error: 'SYNC_CONFIG missing' };
  var seeded = [];
  var now = cbvDsrIso_(cbvDsrNow_());
  CBV_DSR_CONFIG_SEED.forEach(function (item) {
    if (cbvDsrFindConfigRowIndex_(sheet, item.key) >= 0) return;
    sheet.appendRow([item.key, item.value, item.description, now, actor]);
    seeded.push(item.key);
  });
  return { ok: true, seeded: seeded };
}

function cbvDsrUpsertConfigKey_(ss, key, value, actor) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.CONFIG);
  if (!sheet) return { ok: false };
  var row = cbvDsrFindConfigRowIndex_(sheet, key);
  var now = cbvDsrIso_(cbvDsrNow_());
  if (row < 0) {
    sheet.appendRow([key, value, '', now, actor]);
  } else {
    sheet.getRange(row, 2).setValue(value);
    sheet.getRange(row, 4, 1, 2).setValues([[now, actor]]);
  }
  return { ok: true };
}

function cbvDsrAppendLog_(ss, payload) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.LOG);
  if (!sheet) return { ok: false, error: 'SYNC_LOG missing' };
  var p = payload || {};
  sheet.appendRow([
    p.runId || '',
    p.logAt || cbvDsrIso_(cbvDsrNow_()),
    p.level || 'INFO',
    p.phase || '',
    p.action || '',
    p.status || '',
    p.message || '',
    p.detailJson != null ? JSON.stringify(p.detailJson) : '',
    p.actor || cbvDsrActor_()
  ]);
  return { ok: true };
}

function cbvDsrAppendAudit_(ss, payload) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.AUDIT);
  if (!sheet) return { ok: false, error: 'SYNC_AUDIT missing' };
  var p = payload || {};
  sheet.appendRow([
    p.auditId || ('AUD_DSR_' + Utilities.getUuid()),
    p.runId || '',
    p.auditAt || cbvDsrIso_(cbvDsrNow_()),
    p.auditType || '',
    p.entityType || '',
    p.entityId || '',
    p.action || '',
    p.beforeJson != null ? JSON.stringify(p.beforeJson) : '',
    p.afterJson != null ? JSON.stringify(p.afterJson) : '',
    p.note || '',
    p.actor || cbvDsrActor_()
  ]);
  return { ok: true };
}

function cbvDsrAppendReport_(ss, payload) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.REPORT);
  if (!sheet) return { ok: false, error: 'SYNC_REPORT missing' };
  var p = payload || {};
  sheet.appendRow([
    p.reportId || ('RPT_DSR_' + Utilities.getUuid()),
    p.runId || '',
    p.reportAt || cbvDsrIso_(cbvDsrNow_()),
    p.phase || '',
    p.result || '',
    p.summary || '',
    p.warningsJson != null ? JSON.stringify(p.warningsJson) : '',
    p.errorsJson != null ? JSON.stringify(p.errorsJson) : '',
    p.nextStep || '',
    p.reportJson != null ? JSON.stringify(p.reportJson) : ''
  ]);
  return { ok: true };
}

/**
 * Foundation bootstrap — sheets, headers, config seed, append-only trail.
 */
function cbvDsrBootstrapFoundation() {
  var runId = cbvDsrRunId_();
  var actor = cbvDsrActor_();
  var ss = cbvDsrActiveSpreadsheet_();
  var report = {
    ok: true,
    runId: runId,
    phase: 'PHASE_DSR_01_FOUNDATION',
    sheets: [],
    warnings: []
  };

  var sheetsResult = cbvDsrEnsureFoundationSheets_();
  report.sheets = sheetsResult.sheets;
  if (!sheetsResult.ok) {
    report.ok = false;
    report.errors = sheetsResult.errors;
  }

  var seedResult = cbvDsrSeedConfigIfMissing_(ss, actor, runId);
  report.configSeed = seedResult;

  var now = cbvDsrIso_(cbvDsrNow_());
  cbvDsrUpsertConfigKey_(ss, 'DSR_VERSION', CBV_DSR_VERSION, actor);
  cbvDsrUpsertConfigKey_(ss, 'LAST_BOOTSTRAP_AT', now, actor);

  cbvDsrAppendLog_(ss, {
    runId: runId,
    level: 'INFO',
    phase: 'PHASE_DSR_01_FOUNDATION',
    action: 'BOOTSTRAP',
    status: report.ok ? 'OK' : 'ERROR',
    message: report.ok ? 'DSR foundation bootstrap completed' : 'DSR foundation bootstrap completed with errors',
    detailJson: { sheets: report.sheets, configSeed: seedResult }
  });

  cbvDsrAppendAudit_(ss, {
    runId: runId,
    auditType: 'FOUNDATION_BOOTSTRAP',
    entityType: 'DSR_RUNTIME',
    entityId: 'CBV_DATA_SYNC_RUNTIME',
    action: 'BOOTSTRAP',
    beforeJson: {},
    afterJson: { version: CBV_DSR_VERSION, sheets: (sheetsResult.sheets || []).map(function (s) { return s.sheetName; }) },
    note: 'PHASE_DSR_01 foundation bootstrap — no data sync performed'
  });

  cbvDsrAppendReport_(ss, {
    runId: runId,
    phase: 'PHASE_DSR_01_FOUNDATION',
    result: report.ok ? 'GO' : 'GO_WITH_WARNINGS',
    summary: 'CBV_DATA_SYNC_RUNTIME v1 foundation bootstrap',
    warningsJson: report.warnings,
    errorsJson: report.errors || [],
    nextStep: 'PHASE_DSR_02_CONNECTION_CHECK — set SOURCE/DESTINATION spreadsheet IDs in SYNC_CONFIG',
    reportJson: report
  });

  return report;
}

function cbvDsrOpenDashboard() {
  var ss = cbvDsrActiveSpreadsheet_();
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.DASHBOARD);
  if (!sheet) {
    var ensured = cbvDsrEnsureDashboardShell_(ss);
    sheet = ensured.sheet;
  }
  if (sheet) ss.setActiveSheet(sheet);
  return { ok: !!sheet, sheetName: CBV_DSR_SHEETS.DASHBOARD };
}

function cbvDsrHealthCheckFoundation() {
  var runId = cbvDsrRunId_();
  var ss = cbvDsrActiveSpreadsheet_();
  var checks = [];
  var warnings = [];
  var errors = [];

  function add(name, pass, message, detail) {
    checks.push({ name: name, pass: pass, message: message, detail: detail || {} });
    if (!pass) errors.push(name + ': ' + message);
  }

  var required = [
    CBV_DSR_SHEETS.DASHBOARD,
    CBV_DSR_SHEETS.CONFIG,
    CBV_DSR_SHEETS.PLAN,
    CBV_DSR_SHEETS.LOG,
    CBV_DSR_SHEETS.AUDIT,
    CBV_DSR_SHEETS.REPORT,
    CBV_DSR_SHEETS.BACKUP_INDEX,
    CBV_DSR_SHEETS.SELECTION
  ];

  required.forEach(function (name) {
    var sh = ss.getSheetByName(name);
    add('sheet:' + name, !!sh, sh ? 'present' : 'missing');
  });

  Object.keys(CBV_DSR_HEADERS).forEach(function (key) {
    var sheetName = key === 'SYNC_CONFIG' ? CBV_DSR_SHEETS.CONFIG
      : key === 'SYNC_PLAN' ? CBV_DSR_SHEETS.PLAN
      : key === 'SYNC_LOG' ? CBV_DSR_SHEETS.LOG
      : key === 'SYNC_AUDIT' ? CBV_DSR_SHEETS.AUDIT
      : key === 'SYNC_REPORT' ? CBV_DSR_SHEETS.REPORT
      : key === 'SYNC_BACKUP_INDEX' ? CBV_DSR_SHEETS.BACKUP_INDEX
      : key === 'SYNC_SELECTION' ? CBV_DSR_SHEETS.SELECTION
      : CBV_DSR_SHEETS.BACKUP_INDEX;
    var sh = ss.getSheetByName(sheetName);
    if (!sh) return;
    var expected = CBV_DSR_HEADERS[key];
    if (typeof ensureHeadersMatchOrReport === 'function') {
      var chk = ensureHeadersMatchOrReport(sh, expected);
      add('headers:' + sheetName, !!chk.match, chk.match ? 'match' : String(chk.mismatchReason || 'mismatch'), chk);
    } else {
      var row1 = sh.getLastColumn() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
      add('headers:' + sheetName, row1.length >= expected.length, 'column count ' + row1.length);
    }
  });

  var cfg = ss.getSheetByName(CBV_DSR_SHEETS.CONFIG);
  if (cfg) {
    ['DSR_VERSION', 'SYNC_MODE', 'SAFETY_MODE'].forEach(function (k) {
      var idx = cbvDsrFindConfigRowIndex_(cfg, k);
      if (idx < 0) warnings.push('Config key missing: ' + k);
    });
  }

  var ok = errors.length === 0;
  var result = ok ? (warnings.length ? 'GO_WITH_WARNINGS' : 'GO') : 'FAIL';

  cbvDsrAppendLog_(ss, {
    runId: runId,
    level: ok ? 'INFO' : 'ERROR',
    phase: 'PHASE_DSR_01_FOUNDATION',
    action: 'HEALTH_CHECK',
    status: result,
    message: 'Foundation health check: ' + checks.length + ' checks',
    detailJson: { checks: checks, warnings: warnings, errors: errors }
  });

  cbvDsrAppendReport_(ss, {
    runId: runId,
    phase: 'PHASE_DSR_01_FOUNDATION',
    result: result,
    summary: 'DSR foundation health check',
    warningsJson: warnings,
    errorsJson: errors,
    nextStep: ok ? 'Proceed to PHASE_DSR_02_CONNECTION_CHECK when ready' : 'Run Bootstrap DSR Foundation',
    reportJson: { checks: checks }
  });

  return { ok: ok, runId: runId, result: result, checks: checks, warnings: warnings, errors: errors };
}
