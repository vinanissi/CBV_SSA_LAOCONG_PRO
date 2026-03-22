/**
 * Menu handler: run enum health check and show result.
 */
function runEnumHealthCheck() {
  var h = typeof enumHealthCheck === 'function' ? enumHealthCheck({}) : null;
  if (!h) {
    SpreadsheetApp.getUi().alert('Enum sync engine not loaded');
    return;
  }
  var msg = 'Status: ' + (h.status || 'N/A') + '\nRegistry: ' + (h.enumRegistryValid ? 'OK' : 'FAIL') + '\nUsage: ' + (h.enumUsageValid ? 'OK' : 'FAIL');
  if (h.summary) msg += '\n\nDuplicates: ' + (h.summary.duplicateCount || 0) + ', Missing: ' + (h.summary.missingGroupCount || 0) + ', Invalid usage: ' + (h.summary.invalidUsageCount || 0);
  SpreadsheetApp.getUi().alert('Enum Health', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Menu handler: run schema and data repair (must-fix pass).
 */
function runSchemaAndDataRepair() {
  var r = typeof repairSchemaAndData === 'function' ? repairSchemaAndData({}) : null;
  if (!r) {
    SpreadsheetApp.getUi().alert('repairSchemaAndData not available');
    return;
  }
  var msg = 'Schema: ' + (r.schemaRepairs && r.schemaRepairs.length ? r.schemaRepairs.join('; ') : 'none') +
    '\nUser: ' + (r.userRepaired || 0) +
    '\nHO_SO: ' + (r.hoSoRepaired || 0) +
    '\nHO_SO_FILE: ' + (r.hoSoFileRepaired || 0) +
    '\nFinance: ' + (r.financeStatusFilled || 0) + ' STATUS, ' + (r.financeTransTypeFilled || 0) + ' TRANS_TYPE' +
    '\nTASK_UPDATE_LOG: ' + (r.taskLogUpdateTypeFilled || 0) + ' UPDATE_TYPE, ' + (r.taskLogActionFilled || 0) + ' ACTION' +
    '\nTASK_MAIN HTX_ID: ' + (r.taskMainHtxFilled || 0);
  if ((r.manualReviewTotal || 0) > 0) {
    msg += '\n\nManual review: ' + r.manualReviewTotal + ' rows (see 09_AUDIT/DATA_QUALITY_REPAIR_REPORT.md)';
  }
  SpreadsheetApp.getUi().alert('Schema & Data Repair', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Menu handler: run safe repair in dry-run mode.
 */
function runSafeRepairDryRun() {
  var r = typeof runSafeRepair === 'function' ? runSafeRepair({ dryRun: true, createMissingEnums: true, fillMissingDisplayText: true }) : null;
  if (!r) {
    SpreadsheetApp.getUi().alert('runSafeRepair not available');
    return;
  }
  var msg = 'Dry run: ' + (r.dryRun ? 'Yes' : 'No') + '\nPlanned: ' + (r.planned ? r.planned.length : 0) + ' actions';
  if (r.planned && r.planned.length > 0) {
    msg += '\n\n' + r.planned.slice(0, 5).map(function(p) { return p.action + ': ' + (p.group || '') + '=' + (p.value || ''); }).join('\n');
    if (r.planned.length > 5) msg += '\n... and ' + (r.planned.length - 5) + ' more';
  }
  SpreadsheetApp.getUi().alert('Safe Repair (Dry Run)', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * CBV Menu - onOpen installs menu. Idempotent (menu recreated each open).
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CBV_SSA')
    .addItem('Init All', 'initAll')
    .addItem('Protect Sensitive Sheets', 'protectSensitiveSheets')
    .addItem('Self Audit', 'selfAuditBootstrap')
    .addItem('Run Schema & Data Repair', 'runSchemaAndDataRepair')
    .addItem('Install Triggers', 'installTriggers')
    .addSeparator()
    .addItem('Run All Tests', 'runAllModuleTests')
    .addItem('Seed Golden Data', 'seedGoldenDataset')
    .addItem('Verify AppSheet Ready', 'verifyAppSheetReadiness')
    .addItem('Enum Health Check', 'runEnumHealthCheck')
    .addItem('Run Safe Repair (dry run)', 'runSafeRepairDryRun')
    .addSeparator()
    .addItem('Audit System', 'auditSystem')
    .addToUi();
}
