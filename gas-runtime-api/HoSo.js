/**
 * RF_12 — GAS Runtime API — HoSo read stubs (write not enabled).
 */

function getHoSo_() {
  bootstrapSheets_();
  var ss = getSpreadsheet_();
  if (!ss) return [];
  var sheet = ss.getSheetByName(RF12_CONFIG.SHEETS.HOSO);
  if (!sheet || sheet.getLastRow() < 2) return [];
  return [];
}

function getHoSoAlerts_() {
  return [];
}
