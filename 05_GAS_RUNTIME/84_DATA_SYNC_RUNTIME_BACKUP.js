/**
 * CBV_DATA_SYNC_RUNTIME v1 — Destination backup (PHASE_DSR_03_BACKUP_RUNTIME).
 *
 * Additive backup sheets on DESTINATION only (copyTo + rename).
 * Append-only host index/log/audit/report. No sync, diff, apply, triggers.
 */

var CBV_DSR_BACKUP_VERSION = '1.2.0-backup-runtime';

var CBV_DSR_PROTECTED_RUNTIME_SHEETS = [
  'DASHBOARD_SYNC',
  'SYNC_CONFIG',
  'SYNC_PLAN',
  'SYNC_LOG',
  'SYNC_AUDIT',
  'SYNC_REPORT',
  'SYNC_BACKUP_INDEX',
  'SYNC_SELECTION'
];

var CBV_DSR_BACKUP_CONFIG_SEED = [
  { key: 'BACKUP_SCOPE', value: 'ALL_DESTINATION_BUSINESS_SHEETS', description: 'Backup scope for destination sheets' },
  { key: 'BACKUP_INCLUDE_RUNTIME_SHEETS', value: 'FALSE', description: 'Include DSR runtime tabs in backup when TRUE' },
  { key: 'BACKUP_NAME_PREFIX', value: 'BAK', description: 'Prefix for backup sheet names' },
  { key: 'LAST_BACKUP_AT', value: '', description: 'Last backup run timestamp (ISO)' },
  { key: 'LAST_BACKUP_RUN_ID', value: '', description: 'Last backup run ID' }
];

var CBV_DSR_BACKUP_INDEX_STATUS = {
  CREATED: 'BACKUP_CREATED',
  SKIPPED_RUNTIME: 'SKIPPED_RUNTIME_SHEET',
  SKIPPED_EXISTING: 'SKIPPED_EXISTING_BACKUP',
  SKIPPED_EMPTY: 'SKIPPED_EMPTY_OR_INVALID',
  FAILED: 'FAILED'
};

function cbvDsrSeedBackupConfigPlaceholders_(ss, actor) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.CONFIG);
  if (!sheet) return { ok: false };
  var now = cbvDsrIso_(cbvDsrNow_());
  var seeded = [];
  CBV_DSR_BACKUP_CONFIG_SEED.forEach(function (item) {
    if (cbvDsrFindConfigRowIndex_(sheet, item.key) >= 0) return;
    sheet.appendRow([item.key, item.value, item.description, now, actor]);
    seeded.push(item.key);
  });
  return { ok: true, seeded: seeded };
}

function cbvDsrConfigBool_(config, key, defaultFalse) {
  var v = String((config || {})[key] || '').trim().toUpperCase();
  if (!v) return !!defaultFalse;
  return v === 'TRUE' || v === 'YES' || v === '1';
}

function cbvDsrFormatBackupTimestamp_(d) {
  var dt = d || cbvDsrNow_();
  try {
    return Utilities.formatDate(dt, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'yyyyMMdd_HHmmss');
  } catch (e) {
    return Utilities.formatDate(dt, 'GMT', 'yyyyMMdd_HHmmss');
  }
}

/**
 * Validate backup-specific config (destination ID required).
 */
function cbvDsrValidateBackupConfig_(config) {
  var c = config || {};
  var warnings = [];
  var errors = [];
  var destId = String(c.DESTINATION_SPREADSHEET_ID || '').trim();

  if (!destId) {
    return {
      ok: false,
      needsConfig: true,
      warnings: ['Missing or empty: DESTINATION_SPREADSHEET_ID'],
      errors: errors,
      destinationId: destId
    };
  }

  if (!cbvDsrIsValidSpreadsheetId_(destId)) {
    errors.push('DESTINATION_SPREADSHEET_ID invalid format');
  }

  if (String(c.SYNC_MODE || '').trim() && String(c.SYNC_MODE).trim() !== CBV_DSR_EXPECTED_SYNC_MODE) {
    warnings.push('SYNC_MODE expected ' + CBV_DSR_EXPECTED_SYNC_MODE + ', got: ' + c.SYNC_MODE);
  }
  if (String(c.SAFETY_MODE || '').trim() && String(c.SAFETY_MODE).trim() !== CBV_DSR_EXPECTED_SAFETY_MODE) {
    warnings.push('SAFETY_MODE expected ' + CBV_DSR_EXPECTED_SAFETY_MODE + ', got: ' + c.SAFETY_MODE);
  }

  return {
    ok: errors.length === 0,
    needsConfig: false,
    warnings: warnings,
    errors: errors,
    destinationId: destId
  };
}

function cbvDsrGetBackupNamePrefix_(config) {
  var p = String((config || {}).BACKUP_NAME_PREFIX || 'BAK').trim();
  return p || 'BAK';
}

function cbvDsrIsBackupSheetName_(name, config) {
  var n = String(name || '').trim();
  var prefix = cbvDsrGetBackupNamePrefix_(config);
  return n.indexOf(prefix + '_') === 0 || n.indexOf('BAK_') === 0;
}

function cbvDsrIsProtectedRuntimeSheet_(name, config) {
  var n = String(name || '').trim();
  if (cbvDsrConfigBool_(config, 'BACKUP_INCLUDE_RUNTIME_SHEETS', false)) return false;
  return CBV_DSR_PROTECTED_RUNTIME_SHEETS.indexOf(n) >= 0;
}

/**
 * Whether a destination sheet is eligible for backup in this run.
 */
function cbvDsrShouldBackupSheet_(sheet, config) {
  if (!sheet) return false;
  var name = sheet.getName();
  if (cbvDsrIsBackupSheetName_(name, config)) return false;
  if (cbvDsrIsProtectedRuntimeSheet_(name, config)) return false;
  var scope = String((config || {}).BACKUP_SCOPE || 'ALL_DESTINATION_BUSINESS_SHEETS').trim();
  if (scope === 'ALL_DESTINATION_BUSINESS_SHEETS' || !scope) return true;
  return false;
}

function cbvDsrTruncateSheetNamePart_(name, maxLen) {
  var s = String(name || '').replace(/[\\/?*[\]]/g, '_');
  if (s.length <= maxLen) return s;
  return s.substring(0, maxLen);
}

/**
 * BAK_<originalSheetName>_<yyyyMMdd_HHmmss> with optional _02 suffix if collision.
 */
function cbvDsrMakeBackupSheetName_(sheetName, runId, config, destSs, timestamp) {
  var prefix = cbvDsrGetBackupNamePrefix_(config);
  var ts = timestamp || cbvDsrFormatBackupTimestamp_(cbvDsrNow_());
  var maxLen = 100;
  var suffix = '_' + ts;
  var head = prefix + '_';
  var avail = maxLen - head.length - suffix.length;
  if (avail < 1) avail = 10;
  var shortName = cbvDsrTruncateSheetNamePart_(sheetName, avail);
  var base = head + shortName + suffix;
  var candidate = base;
  var n = 2;
  while (destSs && destSs.getSheetByName(candidate)) {
    var extra = '_' + (n < 10 ? '0' + n : String(n));
    var avail2 = maxLen - head.length - suffix.length - extra.length;
    shortName = cbvDsrTruncateSheetNamePart_(sheetName, Math.max(avail2, 5));
    candidate = head + shortName + suffix + extra;
    n++;
    if (n > 99) throw new Error('Too many backup name collisions for ' + sheetName);
  }
  return candidate;
}

function cbvDsrBuildBackupPlan_(destSpreadsheet, config) {
  var plan = [];
  if (!destSpreadsheet) return plan;
  destSpreadsheet.getSheets().forEach(function (sheet) {
    var name = sheet.getName();
    if (!cbvDsrShouldBackupSheet_(sheet, config)) {
      var status = cbvDsrIsBackupSheetName_(name, config)
        ? CBV_DSR_BACKUP_INDEX_STATUS.SKIPPED_EXISTING
        : CBV_DSR_BACKUP_INDEX_STATUS.SKIPPED_RUNTIME;
      plan.push({
        sourceSheet: name,
        sheet: sheet,
        eligible: false,
        status: status,
        message: status === CBV_DSR_BACKUP_INDEX_STATUS.SKIPPED_EXISTING
          ? 'Already a backup sheet'
          : 'Excluded by backup scope / runtime protection'
      });
      return;
    }
    var rows = sheet.getLastRow();
    var cols = sheet.getLastColumn();
    if (rows < 1 && cols < 1) {
      plan.push({
        sourceSheet: name,
        sheet: sheet,
        eligible: false,
        status: CBV_DSR_BACKUP_INDEX_STATUS.SKIPPED_EMPTY,
        message: 'Empty sheet'
      });
      return;
    }
    plan.push({ sourceSheet: name, sheet: sheet, eligible: true, rows: rows, cols: cols });
  });
  return plan;
}

/**
 * Copy sheet within destination workbook and rename to backup convention.
 */
function cbvDsrCreateBackupSheet_(destSpreadsheet, sourceSheet, runId, config, timestamp) {
  var originalName = sourceSheet.getName();
  var backupName = cbvDsrMakeBackupSheetName_(originalName, runId, config, destSpreadsheet, timestamp);
  try {
    var copied = sourceSheet.copyTo(destSpreadsheet);
    copied.setName(backupName);
    return {
      sourceSheet: originalName,
      backupSheet: backupName,
      rows: copied.getLastRow(),
      cols: copied.getLastColumn(),
      status: CBV_DSR_BACKUP_INDEX_STATUS.CREATED,
      message: 'Backup created'
    };
  } catch (e) {
    return {
      sourceSheet: originalName,
      backupSheet: '',
      rows: 0,
      cols: 0,
      status: CBV_DSR_BACKUP_INDEX_STATUS.FAILED,
      message: String(e.message || e)
    };
  }
}

function cbvDsrAppendBackupIndex_(hostSs, payload) {
  var sheet = hostSs.getSheetByName(CBV_DSR_SHEETS.BACKUP_INDEX);
  if (!sheet) return { ok: false, error: 'SYNC_BACKUP_INDEX missing' };
  var p = payload || {};
  sheet.appendRow([
    p.backupId || ('BKP_DSR_' + Utilities.getUuid()),
    p.runId || '',
    p.backupAt || cbvDsrIso_(cbvDsrNow_()),
    p.sourceSheet || '',
    p.backupSheet || '',
    p.rows != null ? p.rows : '',
    p.cols != null ? p.cols : '',
    p.status || '',
    p.message || ''
  ]);
  return { ok: true };
}

function cbvDsrWriteBackupReport_(hostSs, payload) {
  var p = payload || {};
  var level = p.result === 'BACKUP_COMPLETED' ? 'INFO'
    : (p.result === 'FAILED' || p.result === 'DESTINATION_ERROR' ? 'ERROR' : 'WARNING');

  cbvDsrAppendLog_(hostSs, {
    runId: p.runId,
    logAt: p.backupAt,
    level: level,
    phase: p.phase,
    action: 'BACKUP_DESTINATION',
    status: p.result,
    message: p.summary || ('Backup: ' + p.result),
    detailJson: {
      destination: p.destination,
      backupResults: p.backupResults,
      warnings: p.warnings,
      errors: p.errors
    },
    actor: p.actor
  });

  cbvDsrAppendAudit_(hostSs, {
    runId: p.runId,
    auditType: 'BACKUP_DESTINATION',
    entityType: 'DSR_BACKUP',
    entityId: p.destination && p.destination.spreadsheetId,
    action: 'BACKUP',
    beforeJson: {},
    afterJson: {
      result: p.result,
      created: (p.backupResults || []).filter(function (b) {
        return b.status === CBV_DSR_BACKUP_INDEX_STATUS.CREATED;
      }).length
    },
    note: 'Additive backup copies on DESTINATION only — no sync',
    actor: p.actor
  });

  cbvDsrAppendReport_(hostSs, {
    runId: p.runId,
    reportAt: p.backupAt,
    phase: p.phase,
    result: p.result,
    summary: p.summary || 'DSR destination backup',
    warningsJson: p.warnings || [],
    errorsJson: p.errors || [],
    nextStep: p.nextStep || '',
    reportJson: p
  });

  return { ok: true };
}

function cbvDsrUpdateDashboardBackupStatus_(hostSs, payload) {
  var sheet = hostSs.getSheetByName(CBV_DSR_SHEETS.DASHBOARD);
  if (!sheet) return { ok: false };
  var p = payload || {};
  var created = (p.backupResults || []).filter(function (b) {
    return b.status === CBV_DSR_BACKUP_INDEX_STATUS.CREATED;
  }).length;

  var updates = {
    'Runtime Status': 'Backup: ' + p.result,
    'Last Run': 'Backup ' + (p.backupAt || '') + ' — ' + created + ' sheet(s)',
    'Next Action': p.nextStep || 'PHASE_DSR_04_DIFF_PREVIEW when ready'
  };

  var lastRow = sheet.getLastRow();
  var labels = lastRow >= 1 ? sheet.getRange(1, 1, lastRow, 1).getValues() : [];
  Object.keys(updates).forEach(function (label) {
    for (var i = 0; i < labels.length; i++) {
      if (String(labels[i][0] || '').trim() === label) {
        sheet.getRange(i + 1, 2).setValue(updates[label]);
        return;
      }
    }
  });

  cbvDsrUpsertDashboardLabel_(sheet, 'Last backup refresh', cbvDsrIso_(cbvDsrNow_()));
  cbvDsrUpsertDashboardLabel_(sheet, 'Backup summary', p.summary || p.result);

  return { ok: true };
}

/**
 * Main backup entry — DESTINATION additive copies only.
 */
function cbvDsrBackupDestination() {
  var runId = cbvDsrRunId_();
  var actor = cbvDsrActor_();
  var backupAt = cbvDsrIso_(cbvDsrNow_());
  var ts = cbvDsrFormatBackupTimestamp_(cbvDsrNow_());
  var phase = 'PHASE_DSR_03_BACKUP_RUNTIME';
  var hostSs = cbvDsrActiveSpreadsheet_();

  var payload = {
    runId: runId,
    backupAt: backupAt,
    actor: actor,
    phase: phase,
    result: 'FAILED',
    destination: { spreadsheetId: '', ok: false, title: '', url: '', sheetCount: 0 },
    backupPlan: [],
    backupResults: [],
    summary: '',
    warnings: [],
    errors: [],
    nextStep: ''
  };

  try {
    if (!hostSs.getSheetByName(CBV_DSR_SHEETS.CONFIG)) {
      if (typeof cbvDsrBootstrapFoundation === 'function') cbvDsrBootstrapFoundation();
      else cbvDsrEnsureFoundationSheets_();
    } else {
      cbvDsrEnsureFoundationSheets_();
    }
    cbvDsrSeedConfigIfMissing_(hostSs, actor, runId);
    cbvDsrSeedConnectionConfigPlaceholders_(hostSs, actor);
    cbvDsrSeedBackupConfigPlaceholders_(hostSs, actor);

    var configRead = cbvDsrReadConfig_(hostSs);
    if (!configRead.ok) {
      payload.errors.push(configRead.error || 'Config read failed');
      payload.result = 'NEEDS_CONFIG';
      payload.nextStep = 'Run Bootstrap DSR Foundation';
      cbvDsrWriteBackupReport_(hostSs, payload);
      cbvDsrUpdateDashboardBackupStatus_(hostSs, payload);
      return payload;
    }

    var validation = cbvDsrValidateBackupConfig_(configRead.config);
    payload.warnings = payload.warnings.concat(validation.warnings || []);

    if (validation.needsConfig) {
      payload.result = 'NEEDS_CONFIG';
      payload.nextStep = 'Set DESTINATION_SPREADSHEET_ID in SYNC_CONFIG';
      cbvDsrWriteBackupReport_(hostSs, payload);
      cbvDsrUpdateDashboardBackupStatus_(hostSs, payload);
      return payload;
    }

    if (validation.errors && validation.errors.length) {
      payload.errors = payload.errors.concat(validation.errors);
      payload.result = 'NEEDS_CONFIG';
      payload.nextStep = 'Fix DESTINATION_SPREADSHEET_ID in SYNC_CONFIG';
      cbvDsrWriteBackupReport_(hostSs, payload);
      cbvDsrUpdateDashboardBackupStatus_(hostSs, payload);
      return payload;
    }

    var destId = validation.destinationId;
    payload.destination.spreadsheetId = destId;

    var destInfo = cbvDsrOpenSpreadsheetByIdSafe_(destId, 'DESTINATION');
    if (!destInfo.ok) {
      payload.result = 'DESTINATION_ERROR';
      payload.destination = destInfo;
      payload.errors.push(destInfo.error || 'Cannot open DESTINATION');
      payload.nextStep = 'Run Connection Check (menu 4) and verify permissions';
      cbvDsrWriteBackupReport_(hostSs, payload);
      cbvDsrUpdateDashboardBackupStatus_(hostSs, payload);
      return payload;
    }

    var destSs = SpreadsheetApp.openById(destId);
    payload.destination = {
      spreadsheetId: destId,
      ok: true,
      title: destInfo.title,
      url: destInfo.url,
      sheetCount: destSs.getSheets().length
    };

    payload.backupPlan = cbvDsrBuildBackupPlan_(destSs, configRead.config);

    var createdCount = 0;
    var failCount = 0;

    payload.backupPlan.forEach(function (item) {
      if (!item.eligible) {
        payload.backupResults.push({
          sourceSheet: item.sourceSheet,
          backupSheet: '',
          rows: item.rows || 0,
          cols: item.cols || 0,
          status: item.status,
          message: item.message
        });
        cbvDsrAppendBackupIndex_(hostSs, {
          runId: runId,
          backupAt: backupAt,
          sourceSheet: item.sourceSheet,
          backupSheet: '',
          rows: item.rows || 0,
          cols: item.cols || 0,
          status: item.status,
          message: item.message
        });
        return;
      }

      var br = cbvDsrCreateBackupSheet_(destSs, item.sheet, runId, configRead.config, ts);
      payload.backupResults.push(br);
      cbvDsrAppendBackupIndex_(hostSs, {
        runId: runId,
        backupAt: backupAt,
        sourceSheet: br.sourceSheet,
        backupSheet: br.backupSheet,
        rows: br.rows,
        cols: br.cols,
        status: br.status,
        message: br.message
      });

      if (br.status === CBV_DSR_BACKUP_INDEX_STATUS.CREATED) createdCount++;
      else failCount++;
    });

    payload.summary = 'Backed up ' + createdCount + ' sheet(s); failed ' + failCount
      + '; skipped ' + (payload.backupResults.length - createdCount - failCount);

    if (createdCount === 0 && failCount > 0) {
      payload.result = 'FAILED';
      payload.nextStep = 'Review SYNC_BACKUP_INDEX and SYNC_REPORT';
    } else if (createdCount === 0) {
      payload.result = 'NEEDS_CONFIG';
      payload.warnings.push('No eligible sheets to backup');
      payload.nextStep = 'Verify DESTINATION has business sheets and BACKUP_SCOPE';
    } else if (failCount > 0 || payload.warnings.length > 0) {
      payload.result = 'BACKUP_COMPLETED_WITH_WARNINGS';
      payload.nextStep = 'PHASE_DSR_04_DIFF_PREVIEW';
    } else {
      payload.result = 'BACKUP_COMPLETED';
      payload.nextStep = 'PHASE_DSR_04_DIFF_PREVIEW';
    }

    cbvDsrUpsertConfigKey_(hostSs, 'LAST_BACKUP_AT', backupAt, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'LAST_BACKUP_RUN_ID', runId, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'DSR_VERSION', CBV_DSR_BACKUP_VERSION, actor);

    cbvDsrWriteBackupReport_(hostSs, payload);
    cbvDsrUpdateDashboardBackupStatus_(hostSs, payload);
  } catch (e) {
    payload.result = 'FAILED';
    payload.errors.push(String(e.message || e));
    payload.nextStep = 'Review error; re-run after bootstrap';
    try {
      cbvDsrWriteBackupReport_(hostSs, payload);
      cbvDsrUpdateDashboardBackupStatus_(hostSs, payload);
    } catch (e2) { /* best effort */ }
  }

  return payload;
}
