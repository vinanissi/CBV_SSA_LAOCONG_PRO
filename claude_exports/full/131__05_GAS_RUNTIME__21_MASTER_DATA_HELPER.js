/**
 * CBV Master Data Helper - Active slices for ref-safe dropdowns.
 * ACTIVE_USERS, ACTIVE_DON_VI, ACTIVE_TASK_TYPE.
 * Dependencies: 00_CORE_CONFIG, 03_SHARED_REPOSITORY
 */

/**
 * Returns rows from USER_DIRECTORY where STATUS=ACTIVE and IS_DELETED=FALSE.
 * @returns {Object[]}
 */
function getActiveUsers() {
  var sheet = typeof _sheet === 'function' ? _sheet(CBV_CONFIG.SHEETS.USER_DIRECTORY) : null;
  if (!sheet) return [];
  var rows = typeof _rows === 'function' ? _rows(sheet) : [];
  return rows.filter(function(r) {
    return String(r.STATUS || '').trim() === 'ACTIVE' &&
      (String(r.IS_DELETED) !== 'true' && r.IS_DELETED !== true);
  });
}

/**
 * Returns rows from DON_VI where STATUS=ACTIVE and IS_DELETED=FALSE.
 * @returns {Object[]}
 */
function getActiveDonVi() {
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.DON_VI) ? CBV_CONFIG.SHEETS.DON_VI : 'DON_VI';
  var sheet = typeof _sheet === 'function' ? _sheet(sheetName) : null;
  if (!sheet) return [];
  var rows = typeof _rows === 'function' ? _rows(sheet) : [];
  return rows.filter(function(r) {
    return String(r.STATUS || '').trim() === 'ACTIVE' &&
      (String(r.IS_DELETED) !== 'true' && r.IS_DELETED !== true);
  });
}

/**
 * Returns TASK_TYPE rows from MASTER_CODE (MASTER_GROUP=TASK_TYPE, STATUS=ACTIVE).
 * @returns {Object[]}
 */
function getActiveTaskType() {
  var sheet = typeof _sheet === 'function' ? _sheet(CBV_CONFIG.SHEETS.MASTER_CODE) : null;
  if (!sheet) return [];
  var rows = typeof _rows === 'function' ? _rows(sheet) : [];
  return rows.filter(function(r) {
    return String(r.MASTER_GROUP || '').trim() === 'TASK_TYPE' &&
      String(r.STATUS || '').trim() === 'ACTIVE' &&
      (String(r.IS_DELETED) !== 'true' && r.IS_DELETED !== true);
  });
}
