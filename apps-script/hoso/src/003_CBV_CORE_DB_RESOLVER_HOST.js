/**
 * Core DB resolver — chạy trong project HO_SO (container).
 * Script Properties `CBV_CORE_DB_ID` ở đây; library Apps Script không đọc được property của host.
 */

function cbvCoreV2GetCoreDbId_() {
  try {
    var id = PropertiesService.getScriptProperties().getProperty('CBV_CORE_DB_ID');
    return String(id || '').trim();
  } catch (e) {
    return '';
  }
}

function cbvCoreV2OpenCoreSpreadsheet_() {
  var id = cbvCoreV2GetCoreDbId_();
  if (id) return SpreadsheetApp.openById(id);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function CBV_CoreV2_setCoreDbId_local(dbId) {
  PropertiesService.getScriptProperties().setProperty('CBV_CORE_DB_ID', String(dbId || '').trim());
  return { ok: true, code: 'CORE_DB_ID_SET', data: { dbId: dbId } };
}

function CBV_CoreV2_getCoreDbId_local() {
  return cbvCoreV2GetCoreDbId_();
}
