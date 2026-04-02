/**
 * CBV Enum Audit - Consistency checks.
 */
var ENUM_REPO_VALUES = {
  HO_SO_TYPE: ['HTX', 'XA_VIEN', 'XE', 'TAI_XE'],
  HO_SO_STATUS: ['NEW', 'IN_REVIEW', 'ACTIVE', 'EXPIRED', 'CLOSED', 'ARCHIVED', 'INACTIVE'],
  FILE_GROUP: ['CCCD', 'GPLX', 'DANG_KY_XE', 'HOP_DONG', 'KHAC'],
  FILE_TYPE: ['MAIN_DOC', 'ATTACHMENT', 'ID_CARD', 'CONTRACT', 'APPENDIX', 'PHOTO', 'LICENSE', 'EVIDENCE', 'OTHER'],
  PRIORITY: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  ID_TYPE: ['CCCD', 'CMND', 'PASSPORT', 'GPLX', 'MST', 'GIAY_DANG_KY_XE', 'KHAC'],
  SOURCE_CHANNEL: ['DIRECT', 'EMAIL', 'FORM', 'ZALO', 'DRIVE', 'IMPORT', 'INTERNAL'],
  HO_SO_ACTION_TYPE: ['CREATE', 'UPDATE_INFO', 'CHANGE_STATUS', 'ADD_FILE', 'REMOVE_FILE', 'LINK_ENTITY', 'UNLINK_ENTITY', 'CLOSE', 'ARCHIVE'],
  RECORD_STATUS: ['ACTIVE', 'INACTIVE'],
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
  RELATED_ENTITY_TYPE: ['NONE', 'HO_SO', 'FINANCE_TRANSACTION', 'TASK', 'UNIT', 'XA_VIEN', 'TAI_XE', 'PHUONG_TIEN', 'GPS', 'CAMERA', 'DON_VI']
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

  if (!sheet) {
    result.data.fallbackUsed = true;
    result.data.warnings = result.data.warnings || [];
    result.data.warnings.push('ENUM_DICTIONARY sheet missing - GAS uses fallback');
    Logger.log('auditEnumConsistency: ' + JSON.stringify(result, null, 2));
    return result;
  }

  var loaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sheet, CBV_CONFIG.SHEETS.ENUM_DICTIONARY) : null;
  if (!loaded || loaded.rowCount === 0) {
    result.data.fallbackUsed = true;
    result.data.warnings = result.data.warnings || [];
    result.data.warnings.push('ENUM_DICTIONARY sheet empty - GAS uses fallback');
    Logger.log('auditEnumConsistency: ' + JSON.stringify(result, null, 2));
    return result;
  }

  var headers = loaded.headers;
  var groupIdx = headers.indexOf('ENUM_GROUP');
  var valueIdx = headers.indexOf('ENUM_VALUE');
  if (groupIdx === -1 || valueIdx === -1) {
    result.ok = false;
    result.errors.push('ENUM_DICTIONARY missing ENUM_GROUP or ENUM_VALUE column');
    return result;
  }

  var rows = loaded.rows;
  var seen = {};
  var sheetMap = {};

  rows.forEach(function(row) {
    var group = String(row.ENUM_GROUP || row[groupIdx] || '').trim();
    var value = String(row.ENUM_VALUE || row[valueIdx] || '').trim();
    if (!group || !value) return;
    var key = group + '|' + value;
    if (seen[key]) {
      result.data.duplicates.push({ group: group, value: value, row: row._rowNumber || 0 });
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

  var requiredGroups = ['HO_SO_TYPE', 'HO_SO_STATUS', 'FILE_GROUP', 'FILE_TYPE', 'PRIORITY', 'ID_TYPE', 'SOURCE_CHANNEL', 'HO_SO_ACTION_TYPE', 'RECORD_STATUS', 'TASK_TYPE', 'TASK_STATUS', 'TASK_PRIORITY', 'TASK_ATTACHMENT_TYPE', 'ATTACHMENT_TYPE', 'UPDATE_TYPE', 'FINANCE_TYPE', 'FINANCE_STATUS', 'FIN_CATEGORY', 'PAYMENT_METHOD', 'MASTER_CODE_STATUS', 'USER_DIRECTORY_STATUS', 'RELATED_ENTITY_TYPE'];
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
