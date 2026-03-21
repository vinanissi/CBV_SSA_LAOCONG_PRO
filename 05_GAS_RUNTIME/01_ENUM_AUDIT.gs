/**
 * CBV Enum Audit - Consistency checks.
 */
var ENUM_REPO_VALUES = {
  HO_SO_TYPE: ['HTX', 'XA_VIEN', 'XE', 'TAI_XE'],
  HO_SO_STATUS: ['NEW', 'ACTIVE', 'INACTIVE', 'ARCHIVED'],
  FILE_GROUP: ['CCCD', 'GPLX', 'DANG_KY_XE', 'HOP_DONG', 'KHAC'],
  TASK_TYPE: ['GENERAL', 'HO_SO', 'FINANCE', 'OPERATION'],
  TASK_STATUS: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'DONE', 'CANCELLED', 'ARCHIVED'],
  TASK_PRIORITY: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  ATTACHMENT_TYPE: ['FILE', 'IMAGE', 'LINK'],
  TASK_ATTACHMENT_TYPE: ['DRAFT', 'RESULT', 'SOP', 'REFERENCE'],
  UPDATE_TYPE: ['NOTE', 'QUESTION', 'ANSWER', 'STATUS_CHANGE'],
  FINANCE_TYPE: ['INCOME', 'EXPENSE'],
  FINANCE_STATUS: ['NEW', 'CONFIRMED', 'CANCELLED', 'ARCHIVED'],
  FIN_CATEGORY: ['VAN_HANH', 'NHIEN_LIEU', 'SUA_CHUA', 'LUONG', 'THU_KHAC', 'CHI_KHAC'],
  PAYMENT_METHOD: ['CASH', 'BANK', 'OTHER'],
  MASTER_CODE_STATUS: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
  RELATED_ENTITY_TYPE: ['NONE', 'HO_SO', 'FINANCE_TRANSACTION', 'TASK', 'UNIT']
};

function auditEnumConsistency() {
  var result = {
    ok: true,
    code: 'ENUM_AUDIT_OK',
    message: 'Enum audit passed',
    data: {
      sheetExists: false,
      groupsChecked: [],
      mismatches: [],
      duplicates: [],
      missingGroups: [],
      fallbackUsed: false
    },
    errors: []
  };

  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.ENUM_DICTIONARY);
  result.data.sheetExists = !!sheet;

  if (!sheet || sheet.getLastRow() < 2) {
    result.data.fallbackUsed = true;
    result.data.warnings = result.data.warnings || [];
    result.data.warnings.push('ENUM_DICTIONARY sheet missing or empty - GAS uses fallback');
    Logger.log('auditEnumConsistency: ' + JSON.stringify(result, null, 2));
    return result;
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var groupIdx = headers.indexOf('ENUM_GROUP');
  var valueIdx = headers.indexOf('ENUM_VALUE');
  if (groupIdx === -1 || valueIdx === -1) {
    result.ok = false;
    result.errors.push('ENUM_DICTIONARY missing ENUM_GROUP or ENUM_VALUE column');
    return result;
  }

  var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  var seen = {};
  var sheetMap = {};

  rows.forEach(function(row, i) {
    var group = String(row[groupIdx] || '').trim();
    var value = String(row[valueIdx] || '').trim();
    if (!group || !value) return;
    var key = group + '|' + value;
    if (seen[key]) {
      result.data.duplicates.push({ group: group, value: value, row: i + 2 });
    }
    seen[key] = true;
    if (!sheetMap[group]) sheetMap[group] = [];
    if (sheetMap[group].indexOf(value) === -1) sheetMap[group].push(value);
  });

  if (result.data.duplicates.length > 0) {
    result.ok = false;
    result.errors.push('Duplicate enum rows: ' + JSON.stringify(result.data.duplicates));
  }

  Object.keys(ENUM_REPO_VALUES).forEach(function(group) {
    result.data.groupsChecked.push(group);
    var repoVals = ENUM_REPO_VALUES[group];
    var sheetVals = sheetMap[group] || [];
    var missingInSheet = repoVals.filter(function(v) { return sheetVals.indexOf(v) === -1; });
    var extraInSheet = sheetVals.filter(function(v) { return repoVals.indexOf(v) === -1; });
    if (missingInSheet.length > 0 || extraInSheet.length > 0) {
      result.data.mismatches.push({
        group: group,
        missingInSheet: missingInSheet,
        extraInSheet: extraInSheet
      });
    }
  });

  var requiredGroups = ['HO_SO_TYPE', 'HO_SO_STATUS', 'FILE_GROUP', 'TASK_TYPE', 'TASK_STATUS', 'TASK_PRIORITY', 'TASK_ATTACHMENT_TYPE', 'ATTACHMENT_TYPE', 'UPDATE_TYPE', 'FINANCE_TYPE', 'FINANCE_STATUS', 'FIN_CATEGORY', 'PAYMENT_METHOD', 'MASTER_CODE_STATUS', 'USER_DIRECTORY_STATUS', 'RELATED_ENTITY_TYPE'];
  requiredGroups.forEach(function(g) {
    if (!sheetMap[g] || sheetMap[g].length === 0) {
      result.data.missingGroups.push(g);
    }
  });

  if (result.data.mismatches.length > 0 || result.data.missingGroups.length > 0) {
    result.ok = false;
    result.code = 'ENUM_AUDIT_FAIL';
    result.message = 'Enum mismatches or missing groups detected';
  }

  Logger.log('auditEnumConsistency: ' + JSON.stringify(result, null, 2));
  return result;
}
