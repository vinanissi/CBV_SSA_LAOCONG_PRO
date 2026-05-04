/**
 * HOSO — CONFIG-driven health (DB id + sheet registry vs physical tabs).
 * Dependencies: 180_HOSO_CONFIG_ADAPTER.js
 */

/**
 * @returns {{
 *   ok: boolean,
 *   moduleCode: string,
 *   dbId: string,
 *   issues: Array<{ code: string, message?: string, tableCode?: string, sheetName?: string }>
 * }}
 */
function HOSO_Config_healthCheck_() {
  var issues = [];
  var tables = [
    'MASTER',
    'XA_VIEN',
    'PHUONG_TIEN',
    'TAI_XE',
    'GIAY_TO',
    'ATTACHMENT',
    'SEARCH_INDEX',
    'PRINT_JOB'
  ];

  var dbId = '';
  try {
    dbId = HOSO_Config_getDbId_({ source: 'HEALTH' });
  } catch (e) {
    issues.push({ code: 'HOSO_DB_ID_ERROR', message: String((e && e.message) || e) });
  }

  if (!dbId) {
    issues.push({ code: 'HOSO_DB_ID_MISSING' });
  }

  var i;
  for (i = 0; i < tables.length; i++) {
    var tc = tables[i];
    try {
      var name = HOSO_Config_getSheetName_(tc, { source: 'HEALTH' });
      if (!name) issues.push({ code: 'HOSO_SHEET_MAPPING_MISSING', tableCode: tc });
      else if (dbId) {
        var ss = SpreadsheetApp.openById(dbId);
        if (!ss.getSheetByName(name)) {
          issues.push({ code: 'HOSO_SHEET_NOT_FOUND', tableCode: tc, sheetName: name });
        }
      }
    } catch (e2) {
      issues.push({
        code: 'HOSO_SHEET_CHECK_ERROR',
        tableCode: tc,
        message: String((e2 && e2.message) || e2)
      });
    }
  }

  return {
    ok: issues.length === 0,
    moduleCode: 'HOSO',
    dbId: dbId,
    issues: issues
  };
}
