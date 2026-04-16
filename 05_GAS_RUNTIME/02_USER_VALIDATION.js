/**
 * HTX check via HO_SO_TYPE_ID → MASTER_CODE (no HO_SO_TYPE column).
 * @param {Object} hoSoRow
 * @returns {boolean}
 */
function _userValidationHosoRowIsHtx_(hoSoRow) {
  if (!hoSoRow) return false;
  var tid = String(hoSoRow.HO_SO_TYPE_ID || '').trim();
  if (!tid) return false;
  var mc = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.MASTER_CODE, tid) : null;
  return mc ? String(mc.CODE || '').trim() === 'HTX' : false;
}

/**
 * CBV User Validation - Reusable validation for USER_DIRECTORY.
 * Used by TASK and FINANCE services, admin create/update flows.
 * Dependencies: 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 03_SHARED_REPOSITORY
 */

/**
 * Validates a user record for create. Throws on invalid.
 * Enforces: ID unique, USER_CODE unique, EMAIL unique where present, ROLE enum, STATUS enum.
 * @param {Object} record - User record to validate (before insert)
 */
function validateUserRecordForCreate(record) {
  if (!record) throw new Error('User record is required');
  ensureRequired(record.USER_CODE, 'USER_CODE');
  ensureRequired(record.FULL_NAME, 'FULL_NAME');
  ensureRequired(record.ROLE, 'ROLE');
  ensureRequired(record.STATUS, 'STATUS');
  ensureRequired(record.IS_SYSTEM, 'IS_SYSTEM');
  ensureRequired(record.ALLOW_LOGIN, 'ALLOW_LOGIN');

  if (typeof assertValidEnumValue === 'function') {
    assertValidEnumValue('ROLE', record.ROLE, 'ROLE');
    assertValidEnumValue('USER_DIRECTORY_STATUS', record.STATUS, 'STATUS');
  }

  ensureMaxLength(record.USER_CODE, 50, 'USER_CODE');
  ensureMaxLength(record.FULL_NAME, 200, 'FULL_NAME');
  if (record.EMAIL) ensureMaxLength(record.EMAIL, 255, 'EMAIL');

  var users = typeof getUsersIncludingDeleted === 'function' ? getUsersIncludingDeleted() : [];
  users.forEach(function(u) {
    if (String(u.code).toLowerCase() === String(record.USER_CODE || '').trim().toLowerCase()) {
      throw new Error('USER_CODE already exists: ' + record.USER_CODE);
    }
    if (record.EMAIL && u.email && String(u.email).toLowerCase() === String(record.EMAIL || '').trim().toLowerCase()) {
      throw new Error('EMAIL already exists: ' + record.EMAIL);
    }
  });

  if (record.HTX_ID) {
    var hoSo = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.HO_SO_MASTER, record.HTX_ID) : null;
    if (!hoSo || !_userValidationHosoRowIsHtx_(hoSo)) {
      throw new Error('HTX_ID must reference a valid HTX (HO_SO_TYPE_ID → MASTER_CODE.CODE=HTX)');
    }
  }
}

/**
 * Validates a user patch for update. Throws on invalid.
 * Only validates fields that are present in patch.
 * @param {string} id - User ID
 * @param {Object} patch - Fields to update
 */
function validateUserRecordForUpdate(id, patch) {
  if (!id) throw new Error('User ID is required');
  var existing = typeof getUserById === 'function' ? getUserById(id) : null;
  if (!existing) throw new Error('User not found: ' + id);
  if (!patch || Object.keys(patch).length === 0) return;

  if (patch.ROLE != null) {
    if (typeof assertValidEnumValue === 'function') assertValidEnumValue('ROLE', patch.ROLE, 'ROLE');
  }
  if (patch.STATUS != null) {
    if (typeof assertValidEnumValue === 'function') assertValidEnumValue('USER_DIRECTORY_STATUS', patch.STATUS, 'STATUS');
  }
  if (patch.USER_CODE != null) {
    ensureMaxLength(patch.USER_CODE, 50, 'USER_CODE');
    var users = typeof getUsersIncludingDeleted === 'function' ? getUsersIncludingDeleted() : [];
    users.forEach(function(u) {
      if (u.id !== id && String(u.code).toLowerCase() === String(patch.USER_CODE || '').trim().toLowerCase()) {
        throw new Error('USER_CODE already exists: ' + patch.USER_CODE);
      }
    });
  }
  if (patch.EMAIL != null && String(patch.EMAIL).trim() !== '') {
    ensureMaxLength(patch.EMAIL, 255, 'EMAIL');
    var users2 = typeof getUsersIncludingDeleted === 'function' ? getUsersIncludingDeleted() : [];
    users2.forEach(function(u) {
      if (u.id !== id && u.email && String(u.email).toLowerCase() === String(patch.EMAIL || '').trim().toLowerCase()) {
        throw new Error('EMAIL already exists: ' + patch.EMAIL);
      }
    });
  }
  if (patch.HTX_ID != null && String(patch.HTX_ID).trim() !== '') {
    var hoSo2 = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.HO_SO_MASTER, patch.HTX_ID) : null;
    if (!hoSo2 || !_userValidationHosoRowIsHtx_(hoSo2)) {
      throw new Error('HTX_ID must reference a valid HTX (HO_SO_TYPE_ID → MASTER_CODE.CODE=HTX)');
    }
  }
}
