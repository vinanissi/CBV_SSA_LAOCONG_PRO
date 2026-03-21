/**
 * CBV Master Code Service - Validation and lookup for MASTER_CODE sheet.
 * Dynamic business codes (provinces, districts, cost centers, etc.).
 * Not for workflow enums — use enum_service for those.
 */

var _masterCodeCache = null;

/**
 * Loads active codes from MASTER_CODE sheet for a group.
 * @param {string} masterGroup - e.g. PROVINCE, DISTRICT, TASK_GROUP
 * @returns {string[]} Active CODE values
 */
function getMasterCodeValues(masterGroup) {
  if (!masterGroup) return [];
  var map = _buildMasterCodeMap();
  return map[masterGroup] || [];
}

/**
 * Alias for getMasterCodeValues. Returns active CODE values for masterGroup.
 * @param {string} masterGroup
 * @returns {string[]}
 */
function getMasterCodes(masterGroup) {
  return getMasterCodeValues(masterGroup);
}

/**
 * Returns active codes for masterGroup (same as getMasterCodes; MASTER_CODE filters by STATUS=ACTIVE).
 * @param {string} masterGroup
 * @returns {string[]}
 */
function getActiveMasterCodes(masterGroup) {
  return getMasterCodeValues(masterGroup);
}

/**
 * @param {string} masterGroup
 * @param {*} code
 * @returns {boolean}
 */
function isValidMasterCode(masterGroup, code) {
  if (code === null || code === undefined) return false;
  var values = getMasterCodeValues(masterGroup);
  return values.indexOf(String(code).trim()) !== -1;
}

/**
 * Asserts code is valid for masterGroup. Throws if invalid.
 * @param {string} masterGroup
 * @param {*} code
 * @param {string} fieldName - for error message
 */
function assertValidMasterCode(masterGroup, code, fieldName) {
  if (!isValidMasterCode(masterGroup, code)) {
    throw new Error('Invalid ' + (fieldName || masterGroup) + ': ' + code);
  }
}

/**
 * Clears master code cache. Call after MASTER_CODE sheet edits.
 */
function clearMasterCodeCache() {
  _masterCodeCache = null;
  if (typeof clearUserCache === 'function') clearUserCache();
}

/**
 * @returns {Object} Map: MASTER_GROUP -> [CODE, ...]
 */
function _buildMasterCodeMap() {
  if (_masterCodeCache) return _masterCodeCache;
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.MASTER_CODE);
  var map = {};
  if (!sheet || sheet.getLastRow() < 2) {
    _masterCodeCache = map;
    return map;
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var groupIdx = headers.indexOf('MASTER_GROUP');
  var codeIdx = headers.indexOf('CODE');
  var statusIdx = headers.indexOf('STATUS');
  var deletedIdx = headers.indexOf('IS_DELETED');
  if (groupIdx === -1 || codeIdx === -1) {
    _masterCodeCache = map;
    return map;
  }
  var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  rows.forEach(function(row) {
    var group = String(row[groupIdx] || '').trim();
    var code = String(row[codeIdx] || '').trim();
    if (!group || !code) return;
    var status = String(row[statusIdx] || '').trim();
    var active = status === 'ACTIVE';
    var deleted = deletedIdx >= 0 && (row[deletedIdx] === true || String(row[deletedIdx]) === 'true');
    if (!active || deleted) return;
    if (!map[group]) map[group] = [];
    if (map[group].indexOf(code) === -1) map[group].push(code);
  });
  _masterCodeCache = map;
  return map;
}
