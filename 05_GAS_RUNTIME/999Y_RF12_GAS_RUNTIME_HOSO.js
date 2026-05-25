/**
 * RF_12 — GAS Runtime API — HoSo read stubs (write not enabled).
 */

function getHoSo_() {
  bootstrapSheets_();
  var sheet = getSpreadsheet_().getSheetByName(RF12_CONFIG.SHEETS.HOSO);
  if (!sheet || sheet.getLastRow() < 2) return [];
  return [];
}

function getHoSoAlerts_() {
  return [];
}
