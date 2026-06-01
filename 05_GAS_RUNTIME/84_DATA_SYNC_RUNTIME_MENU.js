/**
 * CBV_DATA_SYNC_RUNTIME v1 — Operator menu (PHASE_DSR_01_FOUNDATION).
 * Separate from CBV PRO business menu and CBV Test Console.
 */

function buildCbvRuntimeMenu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;
  ui.createMenu('🚀 CBV Runtime')
    .addSubMenu(
      ui.createMenu('🔁 Data Sync Runtime')
        .addItem('1. Bootstrap DSR Foundation', 'menuCbvDsrBootstrapFoundation')
        .addItem('2. Open Sync Dashboard', 'menuCbvDsrOpenDashboard')
        .addItem('3. Health Check Foundation', 'menuCbvDsrHealthCheckFoundation')
        .addItem('4. Connection Check SOURCE/DEST', 'menuCbvDsrConnectionCheck')
        .addItem('5. Backup DESTINATION', 'menuCbvDsrBackupDestination')
        .addItem('6. Diff Preview SOURCE ↔ DEST', 'menuCbvDsrDiffPreview')
        .addItem('7. Manual Sync Apply SOURCE → DEST', 'menuCbvDsrManualSyncApply')
        .addItem('8. Generate Runtime Report', 'menuCbvDsrGenerateRuntimeReport')
        .addSeparator()
        .addItem('9. Build Selective Sync Plan', 'menuCbvDsrBuildSelectiveSyncPlan')
        .addItem('10. Manual Selective Sync Apply', 'menuCbvDsrManualSelectiveSyncApply')
        .addItem('11. Open Sync Selection', 'menuCbvDsrOpenSyncSelection')
    )
    .addToUi();
}

function menuCbvDsrGenerateRuntimeReport() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = cbvDsrGenerateRuntimeReport();
    var msg = 'Result: ' + r.result +
      '\n' + (r.summary || '') +
      '\nRun ID: ' + r.runId +
      '\nNext: ' + (r.nextStep || '');
    ui.alert('Data Sync Runtime — Runtime Report', msg, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Runtime report failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuCbvDsrManualSyncApply() {
  var ui = SpreadsheetApp.getUi();
  var confirm = ui.alert(
    'Data Sync Runtime — Manual Sync Apply',
    'This will copy SOURCE values into DESTINATION business sheets after guard checks.\n\n' +
      'Requires: SYNC_ALLOWED=TRUE, backup completed, diff READY_FOR_SYNC.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;
  try {
    var r = cbvDsrManualSyncApply();
    var msg = 'Result: ' + r.result +
      '\nGuard: ' + r.guardStatus +
      '\nSynced: ' + (r.syncedSheets ? r.syncedSheets.length : 0) +
      '\nFailed: ' + (r.failedSheets ? r.failedSheets.length : 0) +
      '\nRun ID: ' + r.runId;
    if (r.guardBlocked && r.guardBlocked.length) {
      msg += '\nBlocked: ' + r.guardBlocked.join('; ');
    }
    ui.alert('Data Sync Runtime — Sync Apply', msg, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Sync apply failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuCbvDsrDiffPreview() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = cbvDsrDiffPreview();
    var msg = 'Result: ' + r.result +
      '\nSheets compared: ' + (r.sheetsCompared || 0) +
      '\nMatch: ' + (r.matchCount || 0) +
      '\nMismatch: ' + (r.mismatchCount || 0) +
      '\nReview required: ' + (r.reviewRequiredCount || 0) +
      '\nRun ID: ' + r.runId;
    ui.alert('Data Sync Runtime — Diff Preview', msg, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Diff preview failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuCbvDsrBackupDestination() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = cbvDsrBackupDestination();
    var created = (r.backupResults || []).filter(function (b) {
      return b.status === 'BACKUP_CREATED';
    }).length;
    var msg = 'Result: ' + r.result +
      '\nDestination: ' + (r.destination && r.destination.ok ? r.destination.title : (r.destination && r.destination.spreadsheetId) || 'n/a') +
      '\nBackups created: ' + created +
      '\nWarnings: ' + (r.warnings ? r.warnings.length : 0) +
      '\nErrors: ' + (r.errors ? r.errors.length : 0) +
      '\nRun ID: ' + r.runId;
    ui.alert('Data Sync Runtime — Backup DESTINATION', msg, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Backup failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuCbvDsrConnectionCheck() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = cbvDsrConnectionCheck();
    var msg = 'Result: ' + r.result +
      '\nSOURCE: ' + (r.source && r.source.ok ? r.source.title + ' (' + r.source.sheetCount + ' sheets)' : (r.source && r.source.error) || 'n/a') +
      '\nDEST: ' + (r.destination && r.destination.ok ? r.destination.title + ' (' + r.destination.sheetCount + ' sheets)' : (r.destination && r.destination.error) || 'n/a') +
      '\nWarnings: ' + (r.warnings ? r.warnings.length : 0) +
      '\nErrors: ' + (r.errors ? r.errors.length : 0) +
      '\nRun ID: ' + r.runId;
    ui.alert('Data Sync Runtime — Connection Check', msg, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Connection check failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuCbvDsrBootstrapFoundation() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = cbvDsrBootstrapFoundation();
    var msg = (r.ok ? 'Bootstrap OK' : 'Bootstrap completed with issues') +
      '\nRun ID: ' + r.runId +
      '\nSee SYNC_LOG, SYNC_AUDIT, SYNC_REPORT.';
    ui.alert('Data Sync Runtime', msg, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Bootstrap failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuCbvDsrOpenDashboard() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = cbvDsrOpenDashboard();
    if (!r.ok) {
      ui.alert('Data Sync Runtime', 'Dashboard sheet not found. Run Bootstrap first.', ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Open dashboard failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuCbvDsrBuildSelectiveSyncPlan() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = cbvDsrBuildSelectiveSyncPlan();
    var msg = 'Result: ' + r.result +
      '\nCandidates: ' + (r.candidateSheetCount || 0) +
      '\nRows appended: ' + (r.rowsAppended || 0) +
      '\nRun ID: ' + r.runId +
      '\nNext: ' + (r.nextStep || '');
    ui.alert('Data Sync Runtime — Selective Sync Plan', msg, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Build plan failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuCbvDsrManualSelectiveSyncApply() {
  var ui = SpreadsheetApp.getUi();
  var confirm = ui.alert(
    'Data Sync Runtime — Manual Selective Sync Apply',
    'Syncs only sheets in SYNC_SELECTION with OPERATOR_DECISION=APPROVE and APPLY_STATUS=READY_TO_APPLY.\n\n' +
      'Requires: SYNC_ALLOWED=TRUE, backup, diff READY_FOR_SYNC, whitelist guards.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;
  try {
    var r = cbvDsrManualSelectiveSyncApply();
    var msg = 'Result: ' + r.result +
      '\nApplied: ' + (r.appliedSheetCount || 0) +
      '\nSkipped: ' + (r.skippedSheetCount || 0) +
      '\nHeld: ' + (r.heldSheetCount || 0) +
      '\nBlocked: ' + (r.blockedSheetCount || 0) +
      '\nFailed: ' + (r.failedSheetCount || 0) +
      '\nRun ID: ' + r.runId;
    ui.alert('Data Sync Runtime — Selective Sync Apply', msg, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Selective sync failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuCbvDsrOpenSyncSelection() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = cbvDsrOpenSyncSelection();
    if (!r.ok) {
      ui.alert('Data Sync Runtime', r.error || 'SYNC_SELECTION missing. Run Bootstrap.', ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Open selection failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuCbvDsrHealthCheckFoundation() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = cbvDsrHealthCheckFoundation();
    var msg = 'Result: ' + r.result +
      '\nChecks: ' + (r.checks ? r.checks.length : 0) +
      '\nErrors: ' + (r.errors ? r.errors.length : 0) +
      '\nWarnings: ' + (r.warnings ? r.warnings.length : 0) +
      '\nRun ID: ' + r.runId;
    ui.alert('Data Sync Runtime — Health Check', msg, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Data Sync Runtime', 'Health check failed: ' + String(e.message || e), ui.ButtonSet.OK);
  }
}
