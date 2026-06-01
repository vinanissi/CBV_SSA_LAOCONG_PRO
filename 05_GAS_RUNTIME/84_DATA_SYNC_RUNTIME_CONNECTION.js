/**
 * CBV_DATA_SYNC_RUNTIME v1 — Connection check (PHASE_DSR_02_CONNECTION_CHECK).
 *
 * Read-only inspection of SOURCE and DESTINATION spreadsheets.
 * No sync, backup, diff, triggers, or business sheet writes.
 */

var CBV_DSR_CONNECTION_VERSION = '1.1.0-connection-check';
var CBV_DSR_HEADER_PREVIEW_MAX_COLS = 20;

var CBV_DSR_REQUIRED_CONFIG_KEYS = [
  'DSR_VERSION',
  'SOURCE_SPREADSHEET_ID',
  'DESTINATION_SPREADSHEET_ID',
  'SYNC_MODE',
  'SAFETY_MODE'
];

var CBV_DSR_CONNECTION_CONFIG_PLACEHOLDERS = [
  { key: 'LAST_CONNECTION_CHECK_AT', value: '', description: 'Last connection check timestamp (ISO)' },
  { key: 'LAST_CONNECTION_RESULT', value: '', description: 'Last connection check result (CONNECTED, NEEDS_CONFIG, …)' }
];

var CBV_DSR_EXPECTED_SYNC_MODE = 'ONE_WAY_SOURCE_TO_DESTINATION';
var CBV_DSR_EXPECTED_SAFETY_MODE = 'BACKUP_BEFORE_WRITE';

/**
 * Read SYNC_CONFIG key/value map from host spreadsheet.
 */
function cbvDsrReadConfig_(ss) {
  var config = {};
  if (!ss) return { ok: false, config: config, error: 'No active spreadsheet' };
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.CONFIG);
  if (!sheet) return { ok: false, config: config, error: 'SYNC_CONFIG missing' };
  var last = sheet.getLastRow();
  if (last < 2) return { ok: true, config: config };
  var data = sheet.getRange(2, 1, last - 1, 2).getValues();
  data.forEach(function (row) {
    var k = String(row[0] || '').trim();
    if (k) config[k] = row[1] == null ? '' : String(row[1]).trim();
  });
  return { ok: true, config: config };
}

function cbvDsrIsValidSpreadsheetId_(id) {
  var s = String(id || '').trim();
  return s.length >= 10 && /^[a-zA-Z0-9_-]+$/.test(s);
}

/**
 * Validate connection config. Missing SOURCE/DEST IDs → needsConfig (non-destructive).
 */
function cbvDsrValidateConnectionConfig_(config) {
  var c = config || {};
  var warnings = [];
  var errors = [];
  var missing = [];

  CBV_DSR_REQUIRED_CONFIG_KEYS.forEach(function (k) {
    if (c[k] === undefined || c[k] === null || String(c[k]).trim() === '') {
      missing.push(k);
    }
  });

  var srcId = String(c.SOURCE_SPREADSHEET_ID || '').trim();
  var destId = String(c.DESTINATION_SPREADSHEET_ID || '').trim();

  if (!srcId || !destId) {
    return {
      ok: false,
      needsConfig: true,
      missing: missing,
      warnings: warnings.concat(missing.map(function (k) { return 'Missing or empty: ' + k; })),
      errors: errors,
      sourceId: srcId,
      destinationId: destId
    };
  }

  if (!cbvDsrIsValidSpreadsheetId_(srcId)) errors.push('SOURCE_SPREADSHEET_ID invalid format');
  if (!cbvDsrIsValidSpreadsheetId_(destId)) errors.push('DESTINATION_SPREADSHEET_ID invalid format');

  if (String(c.SYNC_MODE || '').trim() && String(c.SYNC_MODE).trim() !== CBV_DSR_EXPECTED_SYNC_MODE) {
    warnings.push('SYNC_MODE expected ' + CBV_DSR_EXPECTED_SYNC_MODE + ', got: ' + c.SYNC_MODE);
  }
  if (String(c.SAFETY_MODE || '').trim() && String(c.SAFETY_MODE).trim() !== CBV_DSR_EXPECTED_SAFETY_MODE) {
    warnings.push('SAFETY_MODE expected ' + CBV_DSR_EXPECTED_SAFETY_MODE + ', got: ' + c.SAFETY_MODE);
  }

  return {
    ok: errors.length === 0,
    needsConfig: false,
    missing: missing,
    warnings: warnings,
    errors: errors,
    sourceId: srcId,
    destinationId: destId
  };
}

function cbvDsrSeedConnectionConfigPlaceholders_(ss, actor) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.CONFIG);
  if (!sheet) return { ok: false };
  var now = cbvDsrIso_(cbvDsrNow_());
  var seeded = [];
  CBV_DSR_CONNECTION_CONFIG_PLACEHOLDERS.forEach(function (item) {
    if (cbvDsrFindConfigRowIndex_(sheet, item.key) >= 0) return;
    sheet.appendRow([item.key, item.value, item.description, now, actor]);
    seeded.push(item.key);
  });
  return { ok: true, seeded: seeded };
}

/**
 * Open spreadsheet by ID — read metadata only; no writes to target workbook.
 */
function cbvDsrOpenSpreadsheetByIdSafe_(spreadsheetId, role) {
  var out = {
    role: role || '',
    spreadsheetId: String(spreadsheetId || '').trim(),
    ok: false,
    title: '',
    url: '',
    sheetCount: 0,
    sheets: [],
    error: ''
  };
  if (!out.spreadsheetId) {
    out.error = 'Empty spreadsheet ID';
    return out;
  }
  try {
    var ss = SpreadsheetApp.openById(out.spreadsheetId);
    return cbvDsrInspectSpreadsheet_(ss, role);
  } catch (e) {
    out.error = String(e.message || e);
    return out;
  }
}

/**
 * Inspect spreadsheet — sheet list and per-sheet read-only summaries.
 */
function cbvDsrInspectSpreadsheet_(spreadsheet, role) {
  var out = {
    role: role || '',
    spreadsheetId: '',
    ok: false,
    title: '',
    url: '',
    sheetCount: 0,
    sheets: [],
    error: ''
  };
  if (!spreadsheet) {
    out.error = 'Spreadsheet is null';
    return out;
  }
  try {
    out.spreadsheetId = spreadsheet.getId();
    out.title = spreadsheet.getName();
    out.url = spreadsheet.getUrl();
    var sheetList = spreadsheet.getSheets();
    out.sheetCount = sheetList.length;
    out.sheets = sheetList.map(function (sh) {
      return cbvDsrInspectSheet_(sh);
    });
    out.ok = true;
  } catch (e) {
    out.error = String(e.message || e);
  }
  return out;
}

/**
 * Read-only sheet summary — dimensions + header row preview (max 20 columns).
 */
function cbvDsrInspectSheet_(sheet) {
  var summary = { name: '', rows: 0, cols: 0, headerPreview: [] };
  if (!sheet) return summary;
  try {
    summary.name = sheet.getName();
    summary.rows = sheet.getLastRow();
    summary.cols = sheet.getLastColumn();
    var previewCols = Math.min(summary.cols, CBV_DSR_HEADER_PREVIEW_MAX_COLS);
    if (previewCols > 0) {
      summary.headerPreview = sheet.getRange(1, 1, 1, previewCols).getValues()[0].map(function (cell) {
        return String(cell == null ? '' : cell);
      });
    }
  } catch (e) {
    summary.error = String(e.message || e);
  }
  return summary;
}

function cbvDsrEmptyEndpoint_(role) {
  return {
    role: role,
    spreadsheetId: '',
    ok: false,
    title: '',
    url: '',
    sheetCount: 0,
    sheets: [],
    error: ''
  };
}

/**
 * Append connection check results to LOG / AUDIT / REPORT (host spreadsheet only).
 */
function cbvDsrWriteConnectionReport_(ss, payload) {
  var p = payload || {};
  var level = p.result === 'CONNECTED' ? 'INFO' : (p.result === 'FAILED' ? 'ERROR' : 'WARNING');

  cbvDsrAppendLog_(ss, {
    runId: p.runId,
    logAt: p.checkedAt,
    level: level,
    phase: p.phase,
    action: 'CONNECTION_CHECK',
    status: p.result,
    message: 'Connection check: ' + p.result,
    detailJson: {
      source: { ok: p.source && p.source.ok, spreadsheetId: p.source && p.source.spreadsheetId, sheetCount: p.source && p.source.sheetCount },
      destination: { ok: p.destination && p.destination.ok, spreadsheetId: p.destination && p.destination.spreadsheetId, sheetCount: p.destination && p.destination.sheetCount },
      warnings: p.warnings,
      errors: p.errors
    },
    actor: p.actor
  });

  cbvDsrAppendAudit_(ss, {
    runId: p.runId,
    auditType: 'CONNECTION_CHECK',
    entityType: 'DSR_CONNECTION',
    entityId: (p.source && p.source.spreadsheetId) || 'SOURCE',
    action: 'INSPECT',
    beforeJson: {},
    afterJson: {
      result: p.result,
      sourceId: p.source && p.source.spreadsheetId,
      destinationId: p.destination && p.destination.spreadsheetId
    },
    note: 'Read-only connection check — no sync or business data modification',
    actor: p.actor
  });

  cbvDsrAppendReport_(ss, {
    runId: p.runId,
    reportAt: p.checkedAt,
    phase: p.phase,
    result: p.result,
    summary: 'DSR connection check SOURCE/DESTINATION',
    warningsJson: p.warnings || [],
    errorsJson: p.errors || [],
    nextStep: p.nextStep || '',
    reportJson: p
  });

  return { ok: true };
}

/**
 * Update DASHBOARD_SYNC connection-related labels (column B only).
 */
function cbvDsrUpdateDashboardConnectionStatus_(ss, payload) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.DASHBOARD);
  if (!sheet) return { ok: false, error: 'DASHBOARD_SYNC missing' };

  var p = payload || {};
  var src = p.source || {};
  var dest = p.destination || {};
  var statusLine = p.result + ' @ ' + (p.checkedAt || '');

  var updates = {
    'Runtime Status': 'Connection: ' + p.result,
    'Configuration': 'SOURCE: ' + (src.spreadsheetId || '(not set)') + ' | DEST: ' + (dest.spreadsheetId || '(not set)'),
    'Last Run': 'Connection check ' + (p.checkedAt || '') + ' — ' + p.result,
    'Foundation Health': src.ok && dest.ok
      ? 'SOURCE sheets: ' + src.sheetCount + ', DEST sheets: ' + dest.sheetCount
      : (src.error || dest.error || 'See SYNC_REPORT'),
    'Next Action': p.nextStep || 'Review SYNC_REPORT'
  };

  var lastRow = sheet.getLastRow();
  if (lastRow < 1) {
    cbvDsrEnsureDashboardShell_(ss);
    lastRow = sheet.getLastRow();
  }

  var labels = lastRow >= 1 ? sheet.getRange(1, 1, lastRow, 1).getValues() : [];
  Object.keys(updates).forEach(function (label) {
    for (var i = 0; i < labels.length; i++) {
      if (String(labels[i][0] || '').trim() === label) {
        sheet.getRange(i + 1, 2).setValue(updates[label]);
        return;
      }
    }
  });

  cbvDsrUpsertDashboardLabel_(sheet, 'Connection Status', statusLine);
  cbvDsrUpsertDashboardLabel_(sheet, 'Last connection refresh', cbvDsrIso_(cbvDsrNow_()));

  return { ok: true };
}

function cbvDsrUpsertDashboardLabel_(sheet, label, value) {
  var lastRow = sheet.getLastRow();
  var labels = lastRow >= 1 ? sheet.getRange(1, 1, lastRow, 1).getValues() : [];
  for (var i = 0; i < labels.length; i++) {
    if (String(labels[i][0] || '').trim() === label) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([label, value]);
}

/**
 * Connection check entrypoint — ensures foundation, validates config, inspects SOURCE/DEST.
 */
function cbvDsrConnectionCheck() {
  var runId = cbvDsrRunId_();
  var actor = cbvDsrActor_();
  var checkedAt = cbvDsrIso_(cbvDsrNow_());
  var phase = 'PHASE_DSR_02_CONNECTION_CHECK';
  var ss = cbvDsrActiveSpreadsheet_();

  var payload = {
    runId: runId,
    checkedAt: checkedAt,
    actor: actor,
    phase: phase,
    result: 'FAILED',
    source: cbvDsrEmptyEndpoint_('SOURCE'),
    destination: cbvDsrEmptyEndpoint_('DESTINATION'),
    warnings: [],
    errors: [],
    nextStep: ''
  };

  try {
    if (!ss.getSheetByName(CBV_DSR_SHEETS.CONFIG)) {
      if (typeof cbvDsrBootstrapFoundation === 'function') cbvDsrBootstrapFoundation();
      else cbvDsrEnsureFoundationSheets_();
    } else {
      cbvDsrEnsureFoundationSheets_();
    }
    cbvDsrSeedConfigIfMissing_(ss, actor, runId);
    cbvDsrSeedConnectionConfigPlaceholders_(ss, actor);

    var configRead = cbvDsrReadConfig_(ss);
    if (!configRead.ok) {
      payload.errors.push(configRead.error || 'Config read failed');
      payload.result = 'FAILED';
      payload.nextStep = 'Run Bootstrap DSR Foundation';
      cbvDsrWriteConnectionReport_(ss, payload);
      cbvDsrUpdateDashboardConnectionStatus_(ss, payload);
      return payload;
    }

    var validation = cbvDsrValidateConnectionConfig_(configRead.config);
    payload.warnings = (payload.warnings || []).concat(validation.warnings || []);

    payload.source.spreadsheetId = validation.sourceId || '';
    payload.destination.spreadsheetId = validation.destinationId || '';

    if (validation.needsConfig) {
      payload.result = 'NEEDS_CONFIG';
      payload.nextStep = 'Set SOURCE_SPREADSHEET_ID and DESTINATION_SPREADSHEET_ID in SYNC_CONFIG, then re-run Connection Check';
      cbvDsrWriteConnectionReport_(ss, payload);
      cbvDsrUpdateDashboardConnectionStatus_(ss, payload);
      cbvDsrUpsertConfigKey_(ss, 'LAST_CONNECTION_CHECK_AT', checkedAt, actor);
      cbvDsrUpsertConfigKey_(ss, 'LAST_CONNECTION_RESULT', payload.result, actor);
      return payload;
    }

    if (validation.errors && validation.errors.length) {
      payload.errors = payload.errors.concat(validation.errors);
      payload.result = 'FAILED';
      payload.nextStep = 'Fix invalid config values in SYNC_CONFIG';
      cbvDsrWriteConnectionReport_(ss, payload);
      cbvDsrUpdateDashboardConnectionStatus_(ss, payload);
      return payload;
    }

    payload.source = cbvDsrOpenSpreadsheetByIdSafe_(validation.sourceId, 'SOURCE');
    payload.destination = cbvDsrOpenSpreadsheetByIdSafe_(validation.destinationId, 'DESTINATION');

    if (payload.source.ok && payload.destination.ok) {
      payload.result = 'CONNECTED';
      payload.nextStep = 'PHASE_DSR_03_BACKUP_RUNTIME — run backup before any write phase';
    } else if (!payload.source.ok && !payload.destination.ok) {
      payload.result = 'FAILED';
      payload.errors.push('SOURCE: ' + (payload.source.error || 'unknown'));
      payload.errors.push('DESTINATION: ' + (payload.destination.error || 'unknown'));
      payload.nextStep = 'Verify spreadsheet IDs and script access permissions';
    } else if (!payload.source.ok) {
      payload.result = 'SOURCE_ERROR';
      payload.errors.push(payload.source.error || 'SOURCE open failed');
      payload.nextStep = 'Fix SOURCE_SPREADSHEET_ID or permissions';
    } else {
      payload.result = 'DESTINATION_ERROR';
      payload.errors.push(payload.destination.error || 'DESTINATION open failed');
      payload.nextStep = 'Fix DESTINATION_SPREADSHEET_ID or permissions';
    }

    cbvDsrWriteConnectionReport_(ss, payload);
    cbvDsrUpdateDashboardConnectionStatus_(ss, payload);
    cbvDsrUpsertConfigKey_(ss, 'LAST_CONNECTION_CHECK_AT', checkedAt, actor);
    cbvDsrUpsertConfigKey_(ss, 'LAST_CONNECTION_RESULT', payload.result, actor);
    if (payload.result === 'CONNECTED') {
      cbvDsrUpsertConfigKey_(ss, 'DSR_VERSION', CBV_DSR_CONNECTION_VERSION, actor);
    }
  } catch (e) {
    payload.result = 'FAILED';
    payload.errors.push(String(e.message || e));
    payload.nextStep = 'Review error and re-run after bootstrap';
    try {
      cbvDsrWriteConnectionReport_(ss, payload);
      cbvDsrUpdateDashboardConnectionStatus_(ss, payload);
    } catch (e2) { /* best effort */ }
  }

  return payload;
}
