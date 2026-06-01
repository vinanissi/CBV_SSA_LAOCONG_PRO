/**
 * CBV_DATA_SYNC_RUNTIME v1 — Manual sync apply (PHASE_DSR_05_MANUAL_SYNC_APPLY).
 *
 * Guarded SOURCE → DESTINATION value copy. Manual menu only.
 * See: 00_SYSTEM_BRAIN/003_AUDIT/DSR/SYNC_GUARD_CONTRACT.md
 */

var CBV_DSR_SYNC_APPLY_VERSION = '1.4.1-whitelist-sync-guard';

var CBV_DSR_SYNC_APPLY_CONFIG_SEED = [
  { key: 'SYNC_ALLOWED', value: 'FALSE', description: 'Operator must set TRUE to allow manual sync apply' },
  { key: 'LAST_SYNC_AT', value: '', description: 'Last manual sync apply timestamp (ISO)' },
  { key: 'LAST_SYNC_RUN_ID', value: '', description: 'Last manual sync apply run ID' },
  { key: 'LAST_SYNC_RESULT', value: '', description: 'Last manual sync apply result status' }
];

function cbvDsrSeedSyncApplyConfigPlaceholders_(ss, actor) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.CONFIG);
  if (!sheet) return { ok: false };
  var now = cbvDsrIso_(cbvDsrNow_());
  var seeded = [];
  CBV_DSR_SYNC_APPLY_CONFIG_SEED.forEach(function (item) {
    if (cbvDsrFindConfigRowIndex_(sheet, item.key) >= 0) return;
    sheet.appendRow([item.key, item.value, item.description, now, actor]);
    seeded.push(item.key);
  });
  return { ok: true, seeded: seeded };
}

function cbvDsrShouldIncludeSheetInSyncApply_(name, config) {
  if (typeof cbvDsrValidateSheetSyncPermission_ === 'function') {
    var perm = cbvDsrValidateSheetSyncPermission_(name, config);
    return perm.allowed === true;
  }
  return cbvDsrShouldIncludeSheetInDiff_(name, 'SOURCE', config);
}

/**
 * Latest backup from config + SYNC_BACKUP_INDEX scan.
 */
function cbvDsrGetLatestBackupStatus_(hostSs, config) {
  var out = {
    exists: false,
    lastBackupAt: String((config || {}).LAST_BACKUP_AT || '').trim(),
    lastBackupRunId: String((config || {}).LAST_BACKUP_RUN_ID || '').trim(),
    lastBackupResult: String((config || {}).LAST_BACKUP_RESULT || '').trim(),
    backupCreatedCount: 0,
    message: ''
  };
  var okResults = ['BACKUP_COMPLETED', 'BACKUP_COMPLETED_WITH_WARNINGS'];
  if (out.lastBackupResult && okResults.indexOf(out.lastBackupResult) < 0) {
    out.message = 'LAST_BACKUP_RESULT is ' + out.lastBackupResult;
    return out;
  }
  var sheet = hostSs.getSheetByName(CBV_DSR_SHEETS.BACKUP_INDEX);
  if (sheet && sheet.getLastRow() >= 2) {
    var last = sheet.getLastRow();
    var start = Math.max(2, last - 499);
    var rows = sheet.getRange(start, 1, last - start + 1, 8).getValues();
    for (var i = rows.length - 1; i >= 0; i--) {
      var status = String(rows[i][7] || '').trim();
      if (status === 'BACKUP_CREATED') {
        out.backupCreatedCount++;
        if (!out.exists) {
          out.exists = true;
          out.lastBackupAt = out.lastBackupAt || String(rows[i][2] || '');
          out.lastBackupRunId = out.lastBackupRunId || String(rows[i][1] || '');
        }
      }
    }
  }
  if (!out.exists) {
    out.message = 'No BACKUP_CREATED row in SYNC_BACKUP_INDEX; run Backup DESTINATION (menu 5)';
  } else if (!out.lastBackupAt) {
    out.message = 'Backup index found; set LAST_BACKUP_AT via backup run recommended';
  } else {
    out.message = 'Latest backup OK (' + out.backupCreatedCount + ' BACKUP_CREATED row(s))';
  }
  return out;
}

function cbvDsrGetLatestDiffStatus_(config) {
  var status = String((config || {}).LAST_DIFF_RESULT || '').trim();
  return {
    status: status,
    exists: !!status,
    lastDiffAt: String((config || {}).LAST_DIFF_AT || '').trim(),
    lastDiffRunId: String((config || {}).LAST_DIFF_RUN_ID || '').trim(),
    ready: status === 'READY_FOR_SYNC'
  };
}

/**
 * Enforce SYNC_GUARD_CONTRACT — no destination writes if any guard fails.
 */
function cbvDsrValidateSyncGuards_(hostSs, config) {
  var guards = [];
  var blocked = [];

  function add(name, pass, message) {
    guards.push({ name: name, pass: !!pass, message: message || '' });
    if (!pass) blocked.push(name + ': ' + (message || 'failed'));
  }

  add('MANUAL_OPERATOR_ACTION', true, 'Invoked via manual menu — not scheduled');

  var syncAllowed = cbvDsrConfigBool_(config, 'SYNC_ALLOWED', false);
  add('SYNC_ALLOWED', syncAllowed, syncAllowed ? 'TRUE' : 'SYNC_ALLOWED must be TRUE in SYNC_CONFIG');

  var conn = cbvDsrValidateConnectionConfig_(config);
  add('SOURCE_SPREADSHEET_ID', conn.sourceId && cbvDsrIsValidSpreadsheetId_(conn.sourceId),
    conn.sourceId ? 'valid' : 'missing or invalid');
  add('DESTINATION_SPREADSHEET_ID', conn.destinationId && cbvDsrIsValidSpreadsheetId_(conn.destinationId),
    conn.destinationId ? 'valid' : 'missing or invalid');

  var syncMode = String((config || {}).SYNC_MODE || '').trim();
  add('SYNC_MODE', syncMode === CBV_DSR_EXPECTED_SYNC_MODE,
    'expected ' + CBV_DSR_EXPECTED_SYNC_MODE + ', got ' + (syncMode || '(empty)'));

  var safetyMode = String((config || {}).SAFETY_MODE || '').trim();
  add('SAFETY_MODE', safetyMode === CBV_DSR_EXPECTED_SAFETY_MODE,
    'expected ' + CBV_DSR_EXPECTED_SAFETY_MODE + ', got ' + (safetyMode || '(empty)'));

  if (!conn.needsConfig && conn.errors && conn.errors.length) {
    conn.errors.forEach(function (e) { blocked.push('CONFIG: ' + e); });
  }

  var backup = cbvDsrGetLatestBackupStatus_(hostSs, config);
  add('LATEST_BACKUP_EXISTS', backup.exists, backup.message);

  var diff = cbvDsrGetLatestDiffStatus_(config);
  add('LATEST_DIFF_STATUS', diff.ready,
    diff.ready ? 'READY_FOR_SYNC' : ('LAST_DIFF_RESULT=' + (diff.status || '(empty)') + ' — run Diff Preview (menu 6)'));

  var ok = blocked.length === 0;
  return {
    ok: ok,
    guards: guards,
    blocked: blocked,
    guardStatus: ok ? 'PASS' : 'BLOCKED',
    latestBackup: backup,
    latestDiff: diff,
    connection: conn
  };
}

function cbvDsrBuildSyncApplyPlan_(sourceSs, destSs, config) {
  if (typeof cbvDsrBuildWhitelistApplyPlan_ === 'function') {
    return cbvDsrBuildWhitelistApplyPlan_(sourceSs, destSs, config);
  }
  var plan = [];
  if (!sourceSs) return plan;
  sourceSs.getSheets().forEach(function (sh) {
    var name = sh.getName();
    if (!cbvDsrShouldIncludeSheetInSyncApply_(name, config)) {
      plan.push({ sheetName: name, eligible: false, reason: 'Excluded (runtime or BAK_)' });
      return;
    }
    plan.push({
      sheetName: name,
      eligible: true,
      sourceRows: sh.getLastRow(),
      sourceCols: sh.getLastColumn()
    });
  });
  return plan;
}

function cbvDsrCreateDestinationSheetIfMissing_(destSs, sheetName) {
  var sheet = destSs.getSheetByName(sheetName);
  if (sheet) return { sheet: sheet, created: false };
  sheet = destSs.insertSheet(sheetName);
  return { sheet: sheet, created: true };
}

function cbvDsrClearDestinationSheetSafely_(sheet) {
  if (!sheet) return { cleared: false };
  var rows = sheet.getLastRow();
  var cols = sheet.getLastColumn();
  if (rows < 1 || cols < 1) return { cleared: false, rows: rows, cols: cols };
  sheet.getRange(1, 1, rows, cols).clearContent();
  return { cleared: true, rows: rows, cols: cols };
}

function cbvDsrWriteValuesToDestination_(destSheet, values) {
  if (!destSheet || !values || !values.length) return { rows: 0, cols: 0 };
  var numRows = values.length;
  var numCols = values[0].length;
  if (numCols < 1) return { rows: 0, cols: 0 };
  destSheet.getRange(1, 1, numRows, numCols).setValues(values);
  return { rows: numRows, cols: numCols };
}

function cbvDsrApplySheetSync_(sourceSs, destSs, sheetName) {
  var summary = {
    sheetName: sheetName,
    sourceRows: 0,
    sourceCols: 0,
    destRowsBefore: 0,
    destColsBefore: 0,
    destRowsAfter: 0,
    destColsAfter: 0,
    status: 'FAILED',
    message: ''
  };
  var sourceSheet = sourceSs.getSheetByName(sheetName);
  if (!sourceSheet) {
    summary.message = 'SOURCE sheet missing';
    return summary;
  }
  var destSheet = destSs.getSheetByName(sheetName);
  var created = false;
  if (!destSheet) {
    var cr = cbvDsrCreateDestinationSheetIfMissing_(destSs, sheetName);
    destSheet = cr.sheet;
    created = cr.created;
  }
  summary.destRowsBefore = destSheet.getLastRow();
  summary.destColsBefore = destSheet.getLastColumn();

  var values = [];
  var sRows = sourceSheet.getLastRow();
  var sCols = sourceSheet.getLastColumn();
  if (sRows >= 1 && sCols >= 1) {
    values = sourceSheet.getRange(1, 1, sRows, sCols).getValues();
  }
  summary.sourceRows = values.length;
  summary.sourceCols = values.length > 0 ? values[0].length : 0;

  if (!created) {
    cbvDsrClearDestinationSheetSafely_(destSheet);
  }
  var written = cbvDsrWriteValuesToDestination_(destSheet, values);
  summary.destRowsAfter = written.rows;
  summary.destColsAfter = written.cols;
  summary.status = 'SYNCED';
  summary.message = created ? 'Created sheet and wrote values' : 'Cleared and wrote values';
  return summary;
}

function cbvDsrWriteSyncApplyReport_(hostSs, payload) {
  var p = payload || {};
  var level = p.result === 'SYNC_APPLIED' ? 'INFO'
    : (p.result === 'GUARD_BLOCKED' || p.result === 'CONFIG_REQUIRED' ? 'WARNING' : 'ERROR');

  cbvDsrAppendLog_(hostSs, {
    runId: p.runId,
    logAt: p.finishedAt || p.startedAt,
    level: level,
    phase: p.phase,
    action: 'MANUAL_SYNC_APPLY',
    status: p.result,
    message: p.summary || ('Manual sync: ' + p.result),
    detailJson: {
      guardStatus: p.guardStatus,
      blocked: p.guardBlocked,
      syncedSheets: p.syncedSheets,
      failedSheets: p.failedSheets,
      whitelistCount: p.whitelistCount,
      appliedSheetCount: p.appliedSheetCount,
      skippedSheetCount: p.skippedSheetCount,
      blockedSheetCount: p.blockedSheetCount,
      skippedSheets: p.skippedSheets,
      blockedSheets: p.blockedSheets
    },
    actor: p.actor
  });

  cbvDsrAppendAudit_(hostSs, {
    runId: p.runId,
    auditType: 'MANUAL_SYNC_APPLY',
    entityType: 'DSR_SYNC',
    entityId: p.destinationSpreadsheetId || 'DESTINATION',
    action: p.result === 'SYNC_APPLIED' || p.result === 'PARTIAL_SYNC' ? 'SYNC_WRITE' : 'SYNC_BLOCKED',
    beforeJson: { guardStatus: p.guardStatus },
    afterJson: { result: p.result, syncedCount: (p.syncedSheets || []).length },
    note: 'Guarded manual sync — values only',
    actor: p.actor
  });

  cbvDsrAppendReport_(hostSs, {
    runId: p.runId,
    reportAt: p.finishedAt || p.startedAt,
    phase: p.phase,
    result: p.result,
    summary: p.summary || 'DSR manual sync apply',
    warningsJson: p.warnings || [],
    errorsJson: p.errors || [],
    nextStep: p.nextStep || '',
    reportJson: p
  });

  return { ok: true };
}

function cbvDsrUpdateDashboardSyncApplyStatus_(hostSs, payload) {
  var sheet = hostSs.getSheetByName(CBV_DSR_SHEETS.DASHBOARD);
  if (!sheet) return { ok: false };
  var p = payload || {};
  var synced = (p.syncedSheets || []).length;
  var failed = (p.failedSheets || []).length;

  var updates = {
    'Runtime Status': 'Sync apply: ' + p.result,
    'Last Run': 'Sync ' + (p.finishedAt || '') + ' — ' + synced + ' sheet(s)',
    'Next Action': p.nextStep || 'PHASE_DSR_06_RUNTIME_REPORT'
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

  cbvDsrUpsertDashboardLabel_(sheet, 'Last sync apply', p.finishedAt || '');
  cbvDsrUpsertDashboardLabel_(sheet, 'Guard status', p.guardStatus || '');
  cbvDsrUpsertDashboardLabel_(sheet, 'Sheets synced', String(synced));
  cbvDsrUpsertDashboardLabel_(sheet, 'Sheets failed', String(failed));
  cbvDsrUpsertDashboardLabel_(sheet, 'Next Recommended Action', p.nextStep || '');

  return { ok: true };
}

function cbvDsrFinalizeSyncBlocked_(hostSs, payload, result, nextStep) {
  payload.result = result;
  payload.nextStep = nextStep;
  payload.finishedAt = cbvDsrIso_(cbvDsrNow_());
  payload.summary = result + ': ' + (payload.guardBlocked || payload.errors || []).join('; ');
  cbvDsrWriteSyncApplyReport_(hostSs, payload);
  cbvDsrUpdateDashboardSyncApplyStatus_(hostSs, payload);
  return payload;
}

/**
 * Manual sync apply — guards MUST pass before any DESTINATION write.
 */
function cbvDsrManualSyncApply() {
  var runId = cbvDsrRunId_();
  var actor = cbvDsrActor_();
  var startedAt = cbvDsrIso_(cbvDsrNow_());
  var phase = 'PHASE_DSR_05_MANUAL_SYNC_APPLY';
  var hostSs = cbvDsrActiveSpreadsheet_();

  var payload = {
    runId: runId,
    startedAt: startedAt,
    finishedAt: '',
    actor: actor,
    phase: phase,
    result: 'SYNC_FAILED',
    sourceSpreadsheetId: '',
    destinationSpreadsheetId: '',
    guardStatus: 'PENDING',
    guardBlocked: [],
    latestBackup: null,
    latestDiff: null,
    totalEligibleSheets: 0,
    syncedSheets: [],
    failedSheets: [],
    skippedSheets: [],
    blockedSheets: [],
    whitelistCount: 0,
    forbiddenPatternCount: 0,
    appliedSheetCount: 0,
    skippedSheetCount: 0,
    blockedSheetCount: 0,
    fullWorkbookSyncStatus: '',
    whitelistSyncRequired: false,
    warnings: [],
    errors: [],
    nextStep: '',
    summary: ''
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
    cbvDsrSeedDiffConfigPlaceholders_(hostSs, actor);
    cbvDsrSeedSyncApplyConfigPlaceholders_(hostSs, actor);
    if (typeof cbvDsrSeedWhitelistConfigPlaceholders_ === 'function') {
      cbvDsrSeedWhitelistConfigPlaceholders_(hostSs, actor);
    }

    var configRead = cbvDsrReadConfig_(hostSs);
    if (!configRead.ok) {
      payload.guardStatus = 'FAIL';
      payload.errors.push(configRead.error || 'Config read failed');
      return cbvDsrFinalizeSyncBlocked_(hostSs, payload, 'CONFIG_REQUIRED', 'Run Bootstrap DSR Foundation');
    }

    var config = configRead.config;

    if (typeof cbvDsrSeedSelectiveSyncConfigPlaceholders_ === 'function') {
      cbvDsrSeedSelectiveSyncConfigPlaceholders_(hostSs, actor);
    }
    if (cbvDsrConfigBool_(config, 'SELECTIVE_SYNC_REQUIRED', true)) {
      payload.guardStatus = 'BLOCKED';
      payload.guardBlocked = ['SELECTIVE_SYNC_REQUIRED: use menu 10 Manual Selective Sync Apply'];
      payload.nextStep = 'Menu 9 Build Selective Sync Plan → approve in SYNC_SELECTION → menu 10 apply';
      return cbvDsrFinalizeSyncBlocked_(hostSs, payload, 'SELECTIVE_SYNC_REQUIRED', payload.nextStep);
    }

    var guardResult = cbvDsrValidateSyncGuards_(hostSs, config);
    if (typeof cbvDsrValidateSyncGuardsWhitelist_ === 'function') {
      guardResult = cbvDsrValidateSyncGuardsWhitelist_(hostSs, config, guardResult);
    }
    payload.guardStatus = guardResult.guardStatus;
    payload.guardBlocked = guardResult.blocked;
    payload.latestBackup = guardResult.latestBackup;
    payload.latestDiff = guardResult.latestDiff;
    payload.sourceSpreadsheetId = guardResult.connection && guardResult.connection.sourceId;
    payload.destinationSpreadsheetId = guardResult.connection && guardResult.connection.destinationId;

    if (!guardResult.ok) {
      var result = 'GUARD_BLOCKED';
      if (!cbvDsrConfigBool_(config, 'SYNC_ALLOWED', false)) {
        result = 'GUARD_BLOCKED';
      } else if (!guardResult.latestBackup || !guardResult.latestBackup.exists) {
        result = 'BACKUP_REQUIRED';
      } else if (!guardResult.latestDiff || !guardResult.latestDiff.ready) {
        result = 'DIFF_REQUIRED';
      } else if (guardResult.connection && guardResult.connection.needsConfig) {
        result = 'CONFIG_REQUIRED';
      }
      payload.warnings = guardResult.blocked.slice();
      return cbvDsrFinalizeSyncBlocked_(hostSs, payload, result,
        'Fix guards: SYNC_ALLOWED=TRUE, backup (menu 5), diff READY_FOR_SYNC (menu 6), valid IDs');
    }

    var srcId = guardResult.connection.sourceId;
    var destId = guardResult.connection.destinationId;
    var sourceSs = SpreadsheetApp.openById(srcId);
    var destSs = SpreadsheetApp.openById(destId);

    var wlMeta = guardResult.whitelistValidation || cbvDsrValidateWhitelistSyncConfig_(config);
    payload.whitelistCount = wlMeta.whitelistCount || 0;
    payload.forbiddenPatternCount = wlMeta.forbiddenPatternCount || 0;
    payload.fullWorkbookSyncStatus = wlMeta.fullWorkbookSyncStatus || '';
    payload.whitelistSyncRequired = !!wlMeta.whitelistSyncRequired;

    var plan = cbvDsrBuildSyncApplyPlan_(sourceSs, destSs, config);
    var eligible = plan.filter(function (p) { return p.eligible; });
    payload.skippedSheets = plan.filter(function (p) {
      return !p.eligible && p.decision === 'SKIP';
    }).map(function (p) {
      return { sheetName: p.sheetName, reason: p.reason, whitelistStatus: p.whitelistStatus };
    });
    payload.blockedSheets = plan.filter(function (p) {
      return !p.eligible && (p.decision === 'BLOCK' || p.whitelistStatus === 'FORBIDDEN');
    }).map(function (p) {
      return { sheetName: p.sheetName, reason: p.reason, whitelistStatus: p.whitelistStatus };
    });
    payload.skippedSheetCount = payload.skippedSheets.length;
    payload.blockedSheetCount = payload.blockedSheets.length;
    payload.totalEligibleSheets = eligible.length;

    plan.filter(function (p) { return !p.eligible; }).forEach(function (p) {
      if (typeof cbvDsrLogWhitelistSkip_ === 'function') {
        cbvDsrLogWhitelistSkip_(hostSs, {
          runId: runId,
          phase: 'PHASE_DSR_05B_WHITELIST_SYNC_GUARD',
          action: p.decision === 'BLOCK' ? 'WHITELIST_BLOCK' : 'WHITELIST_SKIP',
          status: p.whitelistStatus,
          message: p.sheetName + ': ' + p.reason,
          sheetName: p.sheetName,
          detailJson: p,
          actor: actor,
          blocked: p.decision === 'BLOCK'
        });
      }
      if (typeof cbvDsrAuditWhitelistDecision_ === 'function') {
        cbvDsrAuditWhitelistDecision_(hostSs, {
          runId: runId,
          sheetName: p.sheetName,
          decision: p.decision,
          action: p.whitelistStatus,
          note: 'No clear/write — whitelist guard',
          afterJson: p,
          actor: actor
        });
      }
    });

    if (eligible.length === 0) {
      payload.warnings.push('No whitelisted SOURCE sheets eligible to sync');
      payload.nextStep = 'Configure SYNC_WHITELIST; ensure SOURCE has whitelisted tabs';
      return cbvDsrFinalizeSyncBlocked_(hostSs, payload, 'SYNC_FAILED', payload.nextStep);
    }

    eligible.forEach(function (item) {
      var perm = typeof cbvDsrValidateSheetSyncPermission_ === 'function'
        ? cbvDsrValidateSheetSyncPermission_(item.sheetName, config)
        : { allowed: true };
      if (!perm.allowed) {
        payload.skippedSheets.push({ sheetName: item.sheetName, reason: perm.reason });
        return;
      }
      try {
        var r = cbvDsrApplySheetSync_(sourceSs, destSs, item.sheetName);
        if (r.status === 'SYNCED') payload.syncedSheets.push(r);
        else payload.failedSheets.push(r);
      } catch (e) {
        payload.failedSheets.push({
          sheetName: item.sheetName,
          status: 'FAILED',
          message: String(e.message || e)
        });
      }
    });

    payload.finishedAt = cbvDsrIso_(cbvDsrNow_());

    if (payload.failedSheets.length === 0) {
      payload.result = 'SYNC_APPLIED';
      payload.nextStep = 'PHASE_DSR_06_RUNTIME_REPORT — verify DESTINATION data';
    } else if (payload.syncedSheets.length > 0) {
      payload.result = 'PARTIAL_SYNC';
      payload.errors = payload.failedSheets.map(function (f) {
        return f.sheetName + ': ' + (f.message || f.status);
      });
      payload.nextStep = 'Review failed sheets in SYNC_REPORT; re-backup before retry';
    } else {
      payload.result = 'SYNC_FAILED';
      payload.nextStep = 'No sheets synced — review SYNC_REPORT';
    }

    payload.appliedSheetCount = payload.syncedSheets.length;
    payload.summary = 'Synced ' + payload.syncedSheets.length + '/' + payload.totalEligibleSheets
      + '; failed ' + payload.failedSheets.length + '; skipped ' + payload.skippedSheetCount
      + '; blocked ' + payload.blockedSheetCount + '; whitelist ' + payload.whitelistCount;

    cbvDsrUpsertConfigKey_(hostSs, 'LAST_SYNC_AT', payload.finishedAt, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'LAST_SYNC_RUN_ID', runId, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'LAST_SYNC_RESULT', payload.result, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'DSR_VERSION', CBV_DSR_SYNC_APPLY_VERSION, actor);

    cbvDsrWriteSyncApplyReport_(hostSs, payload);
    cbvDsrUpdateDashboardSyncApplyStatus_(hostSs, payload);
  } catch (e) {
    payload.result = 'SYNC_FAILED';
    payload.errors.push(String(e.message || e));
    payload.finishedAt = cbvDsrIso_(cbvDsrNow_());
    payload.nextStep = 'Review error; do not set SYNC_ALLOWED until guards understood';
    try {
      cbvDsrWriteSyncApplyReport_(hostSs, payload);
      cbvDsrUpdateDashboardSyncApplyStatus_(hostSs, payload);
    } catch (e2) { /* best effort */ }
  }

  return payload;
}
