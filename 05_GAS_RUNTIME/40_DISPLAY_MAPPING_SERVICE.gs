/**
 * CBV Display Mapping Service - Consistent display text for ENUM_DICTIONARY and MASTER_CODE.
 * DB stores machine value (CODE / ENUM_VALUE); UI shows display value.
 * Do not replace stored values with DISPLAY_TEXT; do not overwrite explicit DISPLAY_TEXT.
 */

var _enumDisplayCache = null;
var _masterCodeDisplayCache = null;

/**
 * Converts machine value to readable label: IN_PROGRESS -> "In Progress"
 * @param {string} val
 * @returns {string}
 */
function _humanizeEnumValue(val) {
  if (!val) return '';
  var s = String(val).trim();
  return s.split('_').map(function(part) {
    return part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : '';
  }).join(' ').trim() || s;
}

/**
 * @param {string} enumGroup
 * @param {string} enumValue
 * @returns {string} Display text (DISPLAY_TEXT if present, else humanized ENUM_VALUE)
 */
function getEnumDisplay(enumGroup, enumValue) {
  if (!enumGroup || enumValue === null || enumValue === undefined) return '';
  var map = _loadEnumDisplayMap();
  var key = String(enumGroup).trim() + '|' + String(enumValue).trim();
  return map[key] || _humanizeEnumValue(enumValue);
}

/**
 * @param {string} masterGroup
 * @param {string} code
 * @returns {string} Display text
 */
function getMasterCodeDisplay(masterGroup, code) {
  if (!masterGroup || code === null || code === undefined) return '';
  var map = _loadMasterCodeDisplayMap();
  var key = String(masterGroup).trim() + '|' + String(code).trim();
  return map[key] || String(code).trim();
}

/**
 * @returns {Object} Map key -> display string
 */
function _loadEnumDisplayMap() {
  if (_enumDisplayCache) return _enumDisplayCache;
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.ENUM_DICTIONARY);
  var map = {};
  if (!sheet || sheet.getLastRow() < 2) {
    _enumDisplayCache = map;
    return map;
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var groupIdx = headers.indexOf('ENUM_GROUP');
  var valueIdx = headers.indexOf('ENUM_VALUE');
  var displayIdx = headers.indexOf('DISPLAY_TEXT');
  if (groupIdx === -1 || valueIdx === -1) {
    _enumDisplayCache = map;
    return map;
  }
  var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  rows.forEach(function(row) {
    var group = String(row[groupIdx] || '').trim();
    var value = String(row[valueIdx] || '').trim();
    if (!group || !value) return;
    var key = group + '|' + value;
    var display = displayIdx >= 0 ? String(row[displayIdx] || '').trim() : '';
    map[key] = display || _humanizeEnumValue(value);
  });
  _enumDisplayCache = map;
  return map;
}

/**
 * @returns {Object} Map key -> display string
 */
function _loadMasterCodeDisplayMap() {
  if (_masterCodeDisplayCache) return _masterCodeDisplayCache;
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.MASTER_CODE);
  var map = {};
  if (!sheet || sheet.getLastRow() < 2) {
    _masterCodeDisplayCache = map;
    return map;
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var groupIdx = headers.indexOf('MASTER_GROUP');
  var codeIdx = headers.indexOf('CODE');
  var nameIdx = headers.indexOf('NAME');
  var shortIdx = headers.indexOf('SHORT_NAME');
  var displayIdx = headers.indexOf('DISPLAY_TEXT');
  if (groupIdx === -1 || codeIdx === -1) {
    _masterCodeDisplayCache = map;
    return map;
  }
  var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  rows.forEach(function(row) {
    var group = String(row[groupIdx] || '').trim();
    var code = String(row[codeIdx] || '').trim();
    if (!group || !code) return;
    var key = group + '|' + code;
    var display = displayIdx >= 0 ? String(row[displayIdx] || '').trim() : '';
    if (display) {
      map[key] = display;
    } else {
      var name = nameIdx >= 0 ? String(row[nameIdx] || '').trim() : '';
      var shortName = shortIdx >= 0 ? String(row[shortIdx] || '').trim() : '';
      map[key] = _computeMasterCodeDisplayText(shortName, name, code);
    }
  });
  _masterCodeDisplayCache = map;
  return map;
}

/**
 * MASTER_CODE DISPLAY_TEXT auto-generation (when empty):
 * - if SHORT_NAME exists: SHORT_NAME + " - " + NAME
 * - else if CODE and NAME exist: CODE + " - " + NAME
 * - else NAME or CODE
 */
function _computeMasterCodeDisplayText(shortName, name, code) {
  var sn = String(shortName || '').trim();
  var n = String(name || '').trim();
  var c = String(code || '').trim();
  if (sn && n) return sn + ' - ' + n;
  if (c && n) return c + ' - ' + n;
  return n || c || '';
}

/**
 * Idempotent. Fills DISPLAY_TEXT only when empty. Does not overwrite explicit values.
 * @returns {Object} { ok, updated, skipped, errors }
 */
function ensureDisplayTextForEnumRows() {
  var result = { ok: true, updated: 0, skipped: 0, errors: [] };
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.ENUM_DICTIONARY);
  if (!sheet || sheet.getLastRow() < 2) return result;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var groupIdx = headers.indexOf('ENUM_GROUP');
  var valueIdx = headers.indexOf('ENUM_VALUE');
  var displayIdx = headers.indexOf('DISPLAY_TEXT');
  var updatedAtIdx = headers.indexOf('UPDATED_AT');
  var updatedByIdx = headers.indexOf('UPDATED_BY');
  if (groupIdx === -1 || valueIdx === -1 || displayIdx === -1) {
    result.errors.push('ENUM_DICTIONARY missing required columns');
    result.ok = false;
    return result;
  }

  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';
  var lastRow = sheet.getLastRow();

  for (var r = 2; r <= lastRow; r++) {
    var row = sheet.getRange(r, 1, r, headers.length).getValues()[0];
    var display = String(row[displayIdx] || '').trim();
    if (display) {
      result.skipped++;
      continue;
    }
    var group = String(row[groupIdx] || '').trim();
    var value = String(row[valueIdx] || '').trim();
    if (!group || !value) {
      result.skipped++;
      continue;
    }
    var newDisplay = _humanizeEnumValue(value);
    if (!newDisplay) {
      result.skipped++;
      continue;
    }
    sheet.getRange(r, displayIdx + 1).setValue(newDisplay);
    if (updatedAtIdx >= 0) sheet.getRange(r, updatedAtIdx + 1).setValue(now);
    if (updatedByIdx >= 0) sheet.getRange(r, updatedByIdx + 1).setValue(user);
    result.updated++;
  }

  if (result.updated > 0 && typeof clearEnumCache === 'function') clearEnumCache();
  if (result.updated > 0) _enumDisplayCache = null;
  Logger.log('ensureDisplayTextForEnumRows: updated=' + result.updated + ', skipped=' + result.skipped);
  return result;
}

/**
 * Idempotent. Fills DISPLAY_TEXT only when empty. Does not overwrite explicit values.
 * @returns {Object} { ok, updated, skipped, errors }
 */
function ensureDisplayTextForMasterCodeRows() {
  var result = { ok: true, updated: 0, skipped: 0, errors: [] };
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.MASTER_CODE);
  if (!sheet || sheet.getLastRow() < 2) return result;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var groupIdx = headers.indexOf('MASTER_GROUP');
  var codeIdx = headers.indexOf('CODE');
  var nameIdx = headers.indexOf('NAME');
  var shortIdx = headers.indexOf('SHORT_NAME');
  var displayIdx = headers.indexOf('DISPLAY_TEXT');
  var updatedAtIdx = headers.indexOf('UPDATED_AT');
  var updatedByIdx = headers.indexOf('UPDATED_BY');
  if (groupIdx === -1 || codeIdx === -1 || displayIdx === -1) {
    result.errors.push('MASTER_CODE missing required columns');
    result.ok = false;
    return result;
  }

  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';
  var lastRow = sheet.getLastRow();

  for (var r = 2; r <= lastRow; r++) {
    var row = sheet.getRange(r, 1, r, headers.length).getValues()[0];
    var display = String(row[displayIdx] || '').trim();
    if (display) {
      result.skipped++;
      continue;
    }
    var shortName = shortIdx >= 0 ? String(row[shortIdx] || '').trim() : '';
    var name = nameIdx >= 0 ? String(row[nameIdx] || '').trim() : '';
    var code = String(row[codeIdx] || '').trim();
    var newDisplay = _computeMasterCodeDisplayText(shortName, name, code);
    if (!newDisplay) {
      result.skipped++;
      continue;
    }
    sheet.getRange(r, displayIdx + 1).setValue(newDisplay);
    if (updatedAtIdx >= 0) sheet.getRange(r, updatedAtIdx + 1).setValue(now);
    if (updatedByIdx >= 0) sheet.getRange(r, updatedByIdx + 1).setValue(user);
    result.updated++;
  }

  if (result.updated > 0 && typeof clearMasterCodeCache === 'function') clearMasterCodeCache();
  if (result.updated > 0) _masterCodeDisplayCache = null;
  Logger.log('ensureDisplayTextForMasterCodeRows: updated=' + result.updated + ', skipped=' + result.skipped);
  return result;
}

/**
 * USER_DIRECTORY DISPLAY_NAME auto-generation (when empty):
 * - FULL_NAME if present; else USER_CODE; else empty
 */
function _computeUserDirectoryDisplayName(fullName, userCode) {
  var n = String(fullName || '').trim();
  var c = String(userCode || '').trim();
  return n || c || '';
}

/**
 * Idempotent. Fills DISPLAY_NAME only when empty. Does not overwrite explicit values.
 * @returns {Object} { ok, updated, skipped, errors }
 */
function ensureDisplayTextForUserDirectoryRows() {
  var result = { ok: true, updated: 0, skipped: 0, errors: [] };
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.USER_DIRECTORY);
  if (!sheet || sheet.getLastRow() < 2) return result;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var nameIdx = headers.indexOf('FULL_NAME');
  var codeIdx = headers.indexOf('USER_CODE');
  var displayIdx = headers.indexOf('DISPLAY_NAME');
  var updatedAtIdx = headers.indexOf('UPDATED_AT');
  var updatedByIdx = headers.indexOf('UPDATED_BY');
  if (nameIdx === -1 || codeIdx === -1 || displayIdx === -1) {
    result.errors.push('USER_DIRECTORY missing required columns');
    result.ok = false;
    return result;
  }

  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';
  var lastRow = sheet.getLastRow();

  for (var r = 2; r <= lastRow; r++) {
    var row = sheet.getRange(r, 1, r, headers.length).getValues()[0];
    var display = String(row[displayIdx] || '').trim();
    if (display) {
      result.skipped++;
      continue;
    }
    var fullName = String(row[nameIdx] || '').trim();
    var userCode = String(row[codeIdx] || '').trim();
    var newDisplay = _computeUserDirectoryDisplayName(fullName, userCode);
    if (!newDisplay) {
      result.skipped++;
      continue;
    }
    sheet.getRange(r, displayIdx + 1).setValue(newDisplay);
    if (updatedAtIdx >= 0) sheet.getRange(r, updatedAtIdx + 1).setValue(now);
    if (updatedByIdx >= 0) sheet.getRange(r, updatedByIdx + 1).setValue(user);
    result.updated++;
  }

  if (result.updated > 0 && typeof clearUserCache === 'function') clearUserCache();
  Logger.log('ensureDisplayTextForUserDirectoryRows: updated=' + result.updated + ', skipped=' + result.skipped);
  return result;
}

/**
 * Clears display caches. Call after sheet edits.
 */
function clearDisplayMappingCache() {
  _enumDisplayCache = null;
  _masterCodeDisplayCache = null;
}
