/**
 * CBV Master Code Admin Service - Safe admin operations for MASTER_CODE.
 * Validates before write, audits every change, respects IS_SYSTEM and ALLOW_EDIT.
 * Dependencies: 02_MASTER_CODE_SERVICE, 01_ENUM_SERVICE, 03_SHARED_*, logAdminAudit
 */

/** Allowed columns for admin patch (when ALLOW_EDIT=TRUE, !IS_SYSTEM) */
var ADMIN_MASTER_CODE_PATCH_COLUMNS = ['NAME', 'DISPLAY_TEXT', 'SHORT_NAME', 'NOTE', 'SORT_ORDER'];

/**
 * @param {string} id
 * @returns {Object|null} Row with _rowNumber (from _findById)
 */
function _adminFindMasterCodeById(id) {
  return _findById(CBV_CONFIG.SHEETS.MASTER_CODE, id);
}

/**
 * @param {string} masterGroup
 * @param {string} code
 * @returns {boolean} True if (MASTER_GROUP, CODE) already exists (excluding IS_DELETED optional)
 */
function _adminMasterCodeExists(masterGroup, code) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.MASTER_CODE);
  if (!sheet || sheet.getLastRow() < 2) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var groupIdx = headers.indexOf('MASTER_GROUP');
  var codeIdx = headers.indexOf('CODE');
  var deletedIdx = headers.indexOf('IS_DELETED');
  if (groupIdx === -1 || codeIdx === -1) return false;
  var data = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  var g = String(masterGroup || '').trim();
  var c = String(code || '').trim();
  for (var i = 0; i < data.length; i++) {
    var deleted = deletedIdx >= 0 && (data[i][deletedIdx] === true || String(data[i][deletedIdx]) === 'true');
    if (deleted) continue;
    if (String(data[i][groupIdx] || '').trim() === g && String(data[i][codeIdx] || '').trim() === c) {
      return true;
    }
  }
  return false;
}

/**
 * Create a new master code row. Prevents duplicate (MASTER_GROUP, CODE).
 * @param {Object} data - { MASTER_GROUP, CODE, NAME, DISPLAY_TEXT?, SHORT_NAME?, PARENT_CODE?, STATUS?, SORT_ORDER?, NOTE? }
 * @returns {Object} cbvResponse shape with data.created
 */
function adminCreateMasterCodeRow(data) {
  assertAdminAuthority();
  ensureRequired(data, 'data');
  ensureRequired(data.MASTER_GROUP, 'MASTER_GROUP');
  ensureRequired(data.CODE, 'CODE');
  ensureRequired(data.NAME, 'NAME');
  var group = String(data.MASTER_GROUP).trim();
  var code = String(data.CODE).trim();
  cbvAssert(!_adminMasterCodeExists(group, code), 'Duplicate master code: ' + group + '/' + code);

  var status = data.STATUS != null ? String(data.STATUS).trim() : 'ACTIVE';
  assertValidEnumValue('MASTER_CODE_STATUS', status, 'STATUS');

  var now = cbvNow();
  var user = cbvUser();
  var record = {
    ID: cbvMakeId('MC'),
    MASTER_GROUP: group,
    CODE: code,
    NAME: String(data.NAME || ''),
    DISPLAY_TEXT: data.DISPLAY_TEXT != null ? String(data.DISPLAY_TEXT) : '',
    SHORT_NAME: data.SHORT_NAME != null ? String(data.SHORT_NAME) : '',
    PARENT_CODE: data.PARENT_CODE != null ? String(data.PARENT_CODE) : '',
    STATUS: status,
    SORT_ORDER: data.SORT_ORDER != null ? data.SORT_ORDER : '',
    IS_SYSTEM: false,
    ALLOW_EDIT: true,
    NOTE: data.NOTE != null ? String(data.NOTE) : '',
    CREATED_AT: now,
    CREATED_BY: user,
    UPDATED_AT: now,
    UPDATED_BY: user,
    IS_DELETED: false
  };

  _appendRecord(CBV_CONFIG.SHEETS.MASTER_CODE, record);
  clearMasterCodeCache();

  logAdminAudit('MASTER_CODE_EDIT', 'MASTER_CODE', record.ID, 'CREATE', {}, record);

  return cbvResponse(true, 'MASTER_CODE_CREATED', 'Master code row created', { created: record });
}

/**
 * Update master code row. Only when ALLOW_EDIT=TRUE and IS_SYSTEM=FALSE.
 * @param {string} id - Row ID
 * @param {Object} patch - { NAME?, DISPLAY_TEXT?, SHORT_NAME?, NOTE?, SORT_ORDER? }
 * @returns {Object} cbvResponse shape
 */
function adminUpdateMasterCodeRow(id, patch) {
  assertAdminAuthority();
  ensureRequired(id, 'id');
  ensureRequired(patch, 'patch');
  var row = _adminFindMasterCodeById(id);
  cbvAssert(row, 'Master code row not found: ' + id);

  var isSystem = row.IS_SYSTEM === true || row.IS_SYSTEM === 'TRUE' || String(row.IS_SYSTEM) === 'true';
  cbvAssert(!isSystem, 'Cannot edit system row: ' + id);

  var allowEdit = row.ALLOW_EDIT === true || row.ALLOW_EDIT === 'TRUE' || String(row.ALLOW_EDIT) === 'true';
  cbvAssert(allowEdit, 'Row not editable (ALLOW_EDIT=false): ' + id);

  var allowed = {};
  ADMIN_MASTER_CODE_PATCH_COLUMNS.forEach(function(col) {
    if (patch[col] !== undefined) allowed[col] = patch[col];
  });
  if (Object.keys(allowed).length === 0) {
    return cbvResponse(true, 'MASTER_CODE_NO_CHANGE', 'No allowed columns to update', {});
  }

  var before = cbvClone(row);
  delete before._rowNumber;
  var now = cbvNow();
  var user = cbvUser();
  allowed.UPDATED_AT = now;
  allowed.UPDATED_BY = user;

  _updateRow(CBV_CONFIG.SHEETS.MASTER_CODE, row._rowNumber, allowed);
  clearMasterCodeCache();

  var after = cbvClone(before);
  Object.keys(allowed).forEach(function(k) { after[k] = allowed[k]; });

  logAdminAudit('MASTER_CODE_EDIT', 'MASTER_CODE', id, 'UPDATE', before, after);

  return cbvResponse(true, 'MASTER_CODE_UPDATED', 'Master code row updated', { id: id });
}

/**
 * Set master code status (ACTIVE, INACTIVE, ARCHIVED).
 * @param {string} id - Row ID
 * @param {string} status
 * @returns {Object} cbvResponse shape
 */
function adminSetMasterCodeStatus(id, status) {
  assertAdminAuthority();
  ensureRequired(id, 'id');
  assertValidEnumValue('MASTER_CODE_STATUS', status, 'STATUS');

  var row = _adminFindMasterCodeById(id);
  cbvAssert(row, 'Master code row not found: ' + id);

  var isSystem = row.IS_SYSTEM === true || row.IS_SYSTEM === 'TRUE' || String(row.IS_SYSTEM) === 'true';
  cbvAssert(!isSystem, 'Cannot change status of system row: ' + id);

  var allowEdit = row.ALLOW_EDIT === true || row.ALLOW_EDIT === 'TRUE' || String(row.ALLOW_EDIT) === 'true';
  cbvAssert(allowEdit, 'Row not editable (ALLOW_EDIT=false): ' + id);

  var before = cbvClone(row);
  delete before._rowNumber;
  var after = cbvClone(before);
  after.STATUS = status;
  after.UPDATED_AT = cbvNow();
  after.UPDATED_BY = cbvUser();

  _updateRow(CBV_CONFIG.SHEETS.MASTER_CODE, row._rowNumber, {
    STATUS: status,
    UPDATED_AT: after.UPDATED_AT,
    UPDATED_BY: after.UPDATED_BY
  });
  clearMasterCodeCache();

  var action = status === 'ACTIVE' ? 'ACTIVATE' : 'INACTIVATE';
  logAdminAudit('MASTER_CODE_EDIT', 'MASTER_CODE', id, action, before, after);

  return cbvResponse(true, 'MASTER_CODE_STATUS_SET', 'Master code status set', { id: id, status: status });
}
