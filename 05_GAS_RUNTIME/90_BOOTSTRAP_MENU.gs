/**
 * CBV Menu - onOpen installs menu. Idempotent (menu recreated each open).
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CBV_SSA')
    .addItem('Init All', 'initAll')
    .addItem('Self Audit', 'selfAuditBootstrap')
    .addItem('Install Triggers', 'installTriggers')
    .addSeparator()
    .addItem('Run All Tests', 'runAllModuleTests')
    .addItem('Seed Golden Data', 'seedGoldenDataset')
    .addItem('Verify AppSheet Ready', 'verifyAppSheetReadiness')
    .addSeparator()
    .addItem('Audit System', 'auditSystem')
    .addToUi();
}
