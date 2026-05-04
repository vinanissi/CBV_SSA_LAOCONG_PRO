/**
 * CBV Core V2 — MODULE_REGISTRY read only (host HO_SO).
 * Full registerModule vẫn qua bridge/library.
 */

/**
 * @param {string} moduleCode
 * @returns {{ entryHandler: string, status: string, version: string } | null}
 */
function cbvCoreV2RegistryGetModule_(moduleCode) {
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.MODULE_REGISTRY);
  if (!sheet) return null;
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var codeCol = map['MODULE_CODE'];
  var handlerCol = map['ENTRY_HANDLER'];
  var statusCol = map['STATUS'];
  var verCol = map['VERSION'];
  if (!codeCol || !handlerCol) return null;
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var codes = sheet.getRange(2, codeCol, last, codeCol).getValues();
  var r;
  for (r = 0; r < codes.length; r++) {
    if (String(codes[r][0]).trim() === String(moduleCode || '').trim()) {
      var row = r + 2;
      return {
        entryHandler: String(handlerCol ? sheet.getRange(row, handlerCol).getValue() || '' : ''),
        status: String(statusCol ? sheet.getRange(row, statusCol).getValue() || '' : ''),
        version: String(verCol ? sheet.getRange(row, verCol).getValue() || '' : '')
      };
    }
  }
  return null;
}
