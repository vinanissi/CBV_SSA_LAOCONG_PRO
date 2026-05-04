/**
 * CBV Core V2 — CBV_IDEMPOTENCY (host HO_SO / CORE DB).
 */

/**
 * @param {string} key
 * @returns {{ row: number, status: string, commandId: string, resultJson: string } | null}
 */
function cbvCoreV2IdempotencyFindSuccess_(key) {
  if (!cbvCoreV2IsNonEmptyString_(key)) return null;
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.IDEMPOTENCY);
  if (!sheet) return null;
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var kCol = map['IDEMPOTENCY_KEY'];
  var stCol = map['STATUS'];
  if (!kCol || !stCol) return null;
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var keys = sheet.getRange(2, kCol, last, kCol).getValues();
  var statuses = sheet.getRange(2, stCol, last, stCol).getValues();
  var cmdCol = map['COMMAND_ID'];
  var resCol = map['RESULT_JSON'];
  var r;
  for (r = keys.length - 1; r >= 0; r--) {
    if (String(keys[r][0]) === String(key) && String(statuses[r][0]) === CBV_CORE_V2.IDEMPOTENCY_STATUS.SUCCESS) {
      var row = r + 2;
      var commandId = cmdCol ? String(sheet.getRange(row, cmdCol).getValue() || '') : '';
      var resultJson = resCol ? String(sheet.getRange(row, resCol).getValue() || '') : '';
      return { row: row, status: CBV_CORE_V2.IDEMPOTENCY_STATUS.SUCCESS, commandId: commandId, resultJson: resultJson };
    }
  }
  return null;
}

/**
 * @param {string} key
 * @param {string} commandType
 * @param {string} moduleCode
 * @param {string} commandId
 * @param {string} resultJson
 * @param {string} status SUCCESS | FAILED
 */
function cbvCoreV2IdempotencyUpsert_(key, commandType, moduleCode, commandId, resultJson, status) {
  var res = cbvCoreV2EnsureCoreSheet_('IDEMPOTENCY', 'IDEMPOTENCY');
  var sheet = res.sheet;
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var row = cbvCoreV2FindFirstRowInColumn_(sheet, 'IDEMPOTENCY_KEY', key);
  var now = cbvCoreV2IsoNow_();
  if (row < 2) {
    var fields = {
      IDEMPOTENCY_KEY: key,
      COMMAND_TYPE: commandType,
      MODULE_CODE: moduleCode,
      STATUS: status,
      COMMAND_ID: commandId,
      RESULT_JSON: resultJson,
      CREATED_AT: now,
      EXPIRED_AT: ''
    };
    cbvCoreV2AppendRowByHeaders_(sheet, fields);
  } else {
    cbvCoreV2UpdateRowByHeaders_(sheet, row, {
      COMMAND_TYPE: commandType,
      MODULE_CODE: moduleCode,
      STATUS: status,
      COMMAND_ID: commandId,
      RESULT_JSON: resultJson
    });
  }
}
