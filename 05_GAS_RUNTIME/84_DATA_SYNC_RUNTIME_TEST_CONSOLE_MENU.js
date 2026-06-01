/**
 * DSR Test Console menu — under 🧪 CBV Test Console only (PHASE_DSR_07_TEST_CONSOLE).
 */

function buildCbvDsrTestConsoleSubMenu_(ui) {
  var u = ui || SpreadsheetApp.getUi();
  return u.createMenu('🔁 DSR Test Console')
    .addItem('1. Run DSR Full Test', 'menuCbvDsrTestRunFull')
    .addItem('2. Test Foundation', 'menuCbvDsrTestFoundation')
    .addItem('3. Test Connection Guard', 'menuCbvDsrTestConnectionGuard')
    .addItem('4. Test Backup Guard', 'menuCbvDsrTestBackupGuard')
    .addItem('5. Test Diff Preview Guard', 'menuCbvDsrTestDiffPreviewGuard')
    .addItem('6. Test Sync Guard Dry-run', 'menuCbvDsrTestSyncGuardDryRun')
    .addItem('7. Test Runtime Report', 'menuCbvDsrTestRuntimeReport')
    .addItem('8. Build AI Handoff Prompt', 'menuCbvDsrTestBuildAiHandoff')
    .addItem('9. Open DSR Test Report', 'menuCbvDsrTestOpenReport');
}

function menuCbvDsrTestRunFull() {
  var r = cbvDsrTestRunFullSuite();
  SpreadsheetApp.getUi().alert('DSR Test Console', r.status + '\n' + r.summary, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuCbvDsrTestFoundation() {
  var r = cbvDsrTestFoundation();
  SpreadsheetApp.getUi().alert('DSR Test Console', r.status + '\n' + r.summary, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuCbvDsrTestConnectionGuard() {
  var r = cbvDsrTestConnectionGuard();
  SpreadsheetApp.getUi().alert('DSR Test Console', r.status + '\n' + r.summary, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuCbvDsrTestBackupGuard() {
  var r = cbvDsrTestBackupGuard();
  SpreadsheetApp.getUi().alert('DSR Test Console', r.status + '\n' + r.summary, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuCbvDsrTestDiffPreviewGuard() {
  var r = cbvDsrTestDiffPreviewGuard();
  SpreadsheetApp.getUi().alert('DSR Test Console', r.status + '\n' + r.summary, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuCbvDsrTestSyncGuardDryRun() {
  var r = cbvDsrTestSyncGuardDryRun();
  SpreadsheetApp.getUi().alert('DSR Test Console', r.status + '\n' + r.summary, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuCbvDsrTestRuntimeReport() {
  var r = cbvDsrTestRuntimeReport();
  SpreadsheetApp.getUi().alert('DSR Test Console', r.status + '\n' + r.summary, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuCbvDsrTestBuildAiHandoff() {
  var r = cbvDsrTestBuildAiHandoffPrompt();
  if (!r.ok) {
    SpreadsheetApp.getUi().alert('DSR Test Console', r.message || 'No report', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('DSR Test Console — AI Handoff', (r.prompt || '').substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuCbvDsrTestOpenReport() {
  cbvDsrTestOpenReportSheet();
}
