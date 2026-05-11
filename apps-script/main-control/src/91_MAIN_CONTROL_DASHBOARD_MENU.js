/**
 * Main Control — consolidated dashboard menu (operational shortcuts).
 * Does not alter Core V2 / Level 6 implementation logic.
 */

function buildMainControlDashboardMenu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;

  ui.createMenu('📊 CBV Main Control')
    .addItem('Mở Dashboard', 'MainControl_menuOpenDashboard')
    .addSeparator()
    .addItem('Bootstrap Core V2', 'CBV_CoreV2_menuDeploySheets')
    .addItem('Health Check Toàn hệ', 'CBV_CoreV2_menuHealthCheck')
    .addItem('Run Event Worker', 'CBV_CoreV2_menuRunEventWorker')
    .addSeparator()
    .addItem('Rebuild Menus', 'onOpen')
    .addToUi();
}

function MainControl_menuOpenDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheet =
    ss.getSheetByName('CBV_SYSTEM_HEALTH') ||
    ss.getSheetByName('CBV_COMMAND_LOG') ||
    ss.getSheets()[0];

  ss.setActiveSheet(sheet);
}
