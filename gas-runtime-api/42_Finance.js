/**
 * RF_12 — GAS Runtime API — Finance read stubs (write not enabled).
 */

function getFinance_( ) {
  bootstrapSheets_();
  var ss = getSpreadsheet_();
  if (!ss) return [];
  var sheet = ss.getSheetByName(RF12_CONFIG.SHEETS.FINANCE);
  if (!sheet || sheet.getLastRow() < 2) return [];
  return [];
}

function getFinanceAlerts_() {
  return [];
}
