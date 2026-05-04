/**
 * CBV Core V2 — CBV_COMMAND_LOG append/update.
 */

/**
 * @param {Object} fields map header -> value
 * @returns {number} row number appended
 */
function cbvCoreV2CommandLogAppend_(fields) {
  var res = cbvCoreV2EnsureCoreSheet_('COMMAND_LOG', 'COMMAND_LOG');
  var sheet = res.sheet;
  cbvCoreV2AppendRowByHeaders_(sheet, fields);
  return sheet.getLastRow();
}

/**
 * @param {string} commandId
 * @param {Object} updates
 */
function cbvCoreV2CommandLogUpdateByCommandId_(commandId, updates) {
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.COMMAND_LOG);
  if (!sheet) return;
  var row = cbvCoreV2FindFirstRowInColumn_(sheet, 'COMMAND_ID', commandId);
  if (row < 2) return;
  cbvCoreV2UpdateRowByHeaders_(sheet, row, updates);
}
