/**
 * CONFIG V2_2 — quét spreadsheet nguồn (ID), phân loại tab import / skip.
 * Dependencies: 196
 */

/**
 * @param {string} sourceSpreadsheetId
 * @returns {{
 *   ok: boolean,
 *   message: string,
 *   sourceSpreadsheetId: string,
 *   sourceTitle: string,
 *   sheetNames: string[],
 *   skipped: { sheetName: string, reason: string }[],
 *   importable: string[],
 *   unknownSheets: string[]
 * }}
 */
function cbvConfigV22ImportScanSource_(sourceSpreadsheetId) {
  var id = String(sourceSpreadsheetId || '').trim();
  var skipped = [];
  var importable = [];
  var unknown = [];
  if (!id) {
    return {
      ok: false,
      message: 'sourceSpreadsheetId required',
      sourceSpreadsheetId: id,
      sourceTitle: '',
      sheetNames: [],
      skipped: skipped,
      importable: importable,
      unknownSheets: unknown
    };
  }
  var ss;
  try {
    ss = SpreadsheetApp.openById(id);
  } catch (e) {
    return {
      ok: false,
      message: String(e && e.message ? e.message : e),
      sourceSpreadsheetId: id,
      sourceTitle: '',
      sheetNames: [],
      skipped: skipped,
      importable: importable,
      unknownSheets: unknown
    };
  }
  var sheets = ss.getSheets();
  var names = [];
  var i;
  for (i = 0; i < sheets.length; i++) {
    names.push(String(sheets[i].getName() || '').trim());
  }
  var mappedSource = {
    ENUM_DICTIONARY: true,
    MASTER_CODE: true,
    RULE_DEF: true,
    USER_DIRECTORY: true,
    DOC_REQUIREMENT: true,
    FIN_EXPORT_FILTER: true,
    DON_VI: true
  };
  for (i = 0; i < names.length; i++) {
    var sn = names[i];
    if (!sn) continue;
    if (CBV_CONFIG_V22_IMPORT.SKIP_SOURCE_SHEETS[sn]) {
      skipped.push({ sheetName: sn, reason: CBV_CONFIG_V22_IMPORT.SKIP_SOURCE_SHEETS[sn] });
      continue;
    }
    if (mappedSource[sn]) {
      importable.push(sn);
      continue;
    }
    unknown.push(sn);
  }
  return {
    ok: true,
    message: 'scan_ok',
    sourceSpreadsheetId: id,
    sourceTitle: ss.getName(),
    sheetNames: names.slice(),
    skipped: skipped,
    importable: importable,
    unknownSheets: unknown
  };
}
