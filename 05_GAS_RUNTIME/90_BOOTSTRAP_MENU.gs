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
