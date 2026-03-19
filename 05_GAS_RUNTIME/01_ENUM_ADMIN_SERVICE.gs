/**
 * CBV Enum Admin Service - Safe admin operations for ENUM_DICTIONARY.
 * Validates before write, audits every change, prevents duplicates.
 * Dependencies: 01_ENUM_SERVICE, 01_ENUM_REPOSITORY, 01_ENUM_SEED, 03_SHARED_*, logAdminAudit
 */

/** Allowed columns for admin patch */
var ADMIN_ENUM_PATCH_COLUMNS = ['DISPLAY_TEXT', 'SORT_ORDER', 'NOTE'];

/**
 * @param {string} id
 * @returns {Object|null} Row with _rowNumber
 */
function _adminFindEnumById(id) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.ENUM_DICTIONARY);
  if (!sheet || sheet.getLastRow() < 2) return null;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIdx = headers.indexOf('ID');
  if (idIdx === -1) return null;
  var data = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][idIdx] || '') === String(id)) {
      var row = { _rowNumber: i + 2 };
      headers.forEach(function(h, j) { row[h] = data[i][j]; });
      return row;
    }
  }
  return null;
}

/**
 * @param {string} enumGroup
 * @param {string} enumValue
 * @returns {boolean} True if (ENUM_GROUP, ENUM_VALUE) already exists
 */
function _adminEnumExists(enumGroup, enumValue) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.ENUM_DICTIONARY);
  if (!sheet || sheet.getLastRow() < 2) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var groupIdx = headers.indexOf('ENUM_GROUP');
  var valueIdx = headers.indexOf('ENUM_VALUE');
  if (groupIdx === -1 || valueIdx === -1) return false;
  var data = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][groupIdx] || '').trim() === String(enumGroup || '').trim() &&
        String(data[i][valueIdx] || '').trim() === String(enumValue || '').trim()) {
      return true;
    }
  }
  return false;
}

/**
 * @param {string} enumGroup
 * @returns {boolean} True if group is allowed (exists in sheet or CBV_ENUM)
 */
function _adminIsAllowedEnumGroup(enumGroup) {
  if (!enumGroup || String(enumGroup).trim() === '') return false;
  var g = String(enumGroup).trim();
  if (CBV_ENUM[g] && CBV_ENUM[g].length >= 0) return true;
  var map = buildEnumMap();
  if (map[g] && map[g].length > 0) return true;
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.ENUM_DICTIONARY);
  if (!sheet || sheet.getLastRow() < 2) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var groupIdx = headers.indexOf('ENUM_GROUP');
  if (groupIdx === -1) return false;
  var data = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][groupIdx] || '').trim() === g) return true;
  }
  return false;
}

/**
 * Create a new enum row. Prevents duplicate (ENUM_GROUP, ENUM_VALUE).
 * @param {Object} data - { ENUM_GROUP, ENUM_VALUE, DISPLAY_TEXT?, SORT_ORDER?, NOTE? }
 * @returns {Object} cbvResponse shape with data.created
 */
function adminCreateEnumRow(data) {
  assertAdminAuthority();
  ensureRequired(data, 'data');
  ensureRequired(data.ENUM_GROUP, 'ENUM_GROUP');
  ensureRequired(data.ENUM_VALUE, 'ENUM_VALUE');
  var group = String(data.ENUM_GROUP).trim();
  var value = String(data.ENUM_VALUE).trim();
  cbvAssert(_adminIsAllowedEnumGroup(group), 'Enum group not allowed or unknown: ' + group);
  cbvAssert(!_adminEnumExists(group, value), 'Duplicate enum: ' + group + '/' + value);

  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.ENUM_DICTIONARY);
  cbvAssert(sheet, 'Missing sheet: ENUM_DICTIONARY');
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  if (headers.length === 0 || headers.indexOf('ENUM_GROUP') === -1) {
    var enumHeaders = typeof ENUM_DICTIONARY_HEADERS !== 'undefined' ? ENUM_DICTIONARY_HEADERS : ['ID', 'ENUM_GROUP', 'ENUM_VALUE', 'DISPLAY_TEXT', 'SORT_ORDER', 'IS_ACTIVE', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'];
    sheet.getRange(1, 1, 1, enumHeaders.length).setValues([enumHeaders]);
    headers = enumHeaders;
  }

  var now = cbvNow();
  var user = cbvUser();
  var record = {
    ID: cbvMakeId('ENUM'),
    ENUM_GROUP: group,
    ENUM_VALUE: value,
    DISPLAY_TEXT: data.DISPLAY_TEXT != null ? String(data.DISPLAY_TEXT) : '',
    SORT_ORDER: data.SORT_ORDER != null ? data.SORT_ORDER : '',
    IS_ACTIVE: true,
    NOTE: data.NOTE != null ? String(data.NOTE) : '',
    CREATED_AT: now,
    CREATED_BY: user,
    UPDATED_AT: now,
    UPDATED_BY: user
  };

  var row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
  sheet.appendRow(row);
  clearEnumCache();

  logAdminAudit('ENUM_EDIT', 'ENUM_DICTIONARY', record.ID, 'CREATE', {}, record);

  return cbvResponse(true, 'ENUM_CREATED', 'Enum row created', { created: record });
}

/**
 * Update enum row. Only DISPLAY_TEXT, SORT_ORDER, NOTE are patchable.
 * @param {string} id - Row ID
 * @param {Object} patch - { DISPLAY_TEXT?, SORT_ORDER?, NOTE? }
 * @returns {Object} cbvResponse shape
 */
function adminUpdateEnumRow(id, patch) {
  assertAdminAuthority();
  ensureRequired(id, 'id');
  ensureRequired(patch, 'patch');
  var row = _adminFindEnumById(id);
  cbvAssert(row, 'Enum row not found: ' + id);

  var allowed = {};
  ADMIN_ENUM_PATCH_COLUMNS.forEach(function(col) {
    if (patch[col] !== undefined) allowed[col] = patch[col];
  });
  if (Object.keys(allowed).length === 0) {
    return cbvResponse(true, 'ENUM_NO_CHANGE', 'No allowed columns to update', {});
  }

  var before = cbvClone(row);
  delete before._rowNumber;
  var now = cbvNow();
  var user = cbvUser();
  allowed.UPDATED_AT = now;
  allowed.UPDATED_BY = user;

  _updateRow(CBV_CONFIG.SHEETS.ENUM_DICTIONARY, row._rowNumber, allowed);
  clearEnumCache();

  var after = cbvClone(before);
  Object.keys(allowed).forEach(function(k) { after[k] = allowed[k]; });

  logAdminAudit('ENUM_EDIT', 'ENUM_DICTIONARY', id, 'UPDATE', before, after);

  return cbvResponse(true, 'ENUM_UPDATED', 'Enum row updated', { id: id });
}

/**
 * Set enum row active or inactive.
 * @param {string} id - Row ID
 * @param {boolean} isActive
 * @returns {Object} cbvResponse shape
 */
function adminSetEnumActive(id, isActive) {
  assertAdminAuthority();
  ensureRequired(id, 'id');
  var row = _adminFindEnumById(id);
  cbvAssert(row, 'Enum row not found: ' + id);

  var before = cbvClone(row);
  delete before._rowNumber;
  var after = cbvClone(before);
  after.IS_ACTIVE = !!isActive;
  after.UPDATED_AT = cbvNow();
  after.UPDATED_BY = cbvUser();

  _updateRow(CBV_CONFIG.SHEETS.ENUM_DICTIONARY, row._rowNumber, {
    IS_ACTIVE: after.IS_ACTIVE,
    UPDATED_AT: after.UPDATED_AT,
    UPDATED_BY: after.UPDATED_BY
  });
  clearEnumCache();

  var action = isActive ? 'ACTIVATE' : 'INACTIVATE';
  logAdminAudit('ENUM_EDIT', 'ENUM_DICTIONARY', id, action, before, after);

  return cbvResponse(true, 'ENUM_ACTIVE_SET', 'Enum active set to ' + isActive, { id: id, isActive: isActive });
}
