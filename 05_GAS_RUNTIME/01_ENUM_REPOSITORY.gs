/**
 * CBV Enum Repository - Reads ENUM_DICTIONARY sheet.
 * Fallback to CBV_ENUM (00_CORE_CONSTANTS.gs) if sheet missing or not initialized.
 */
var _enumCache = null;
var _enumFallbackUsed = false;

function _getEnumSheet() {
  var ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(CBV_CONFIG.SHEETS.ENUM_DICTIONARY);
}

/**
 * Loads enum rows from ENUM_DICTIONARY sheet.
 * @returns {Array<Object>} Rows with ENUM_GROUP, ENUM_VALUE, IS_ACTIVE
 */
function _loadEnumRowsFromSheet() {
  var sheet = _getEnumSheet();
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 3) return [];
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var groupIdx = headers.indexOf('ENUM_GROUP');
  var valueIdx = headers.indexOf('ENUM_VALUE');
  var activeIdx = headers.indexOf('IS_ACTIVE');
  if (groupIdx === -1 || valueIdx === -1) return [];
  var data = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  return data.map(function(row) {
    var o = {};
    headers.forEach(function(h, i) { o[h] = row[i]; });
    return o;
  });
}

/**
 * Builds map: ENUM_GROUP -> [ENUM_VALUE, ...] (active only).
 * Caches result. Clears cache when sheet may have changed.
 * @returns {Object}
 */
function buildEnumMap() {
  if (_enumCache) return _enumCache;
  var rows = _loadEnumRowsFromSheet();
  var map = {};
  rows.forEach(function(r) {
    var group = String(r.ENUM_GROUP || '').trim();
    var value = String(r.ENUM_VALUE || '').trim();
    if (!group || !value) return;
    var active = r.IS_ACTIVE === true || r.IS_ACTIVE === 'TRUE' || String(r.IS_ACTIVE) === 'true';
    if (!active) return;
    if (!map[group]) map[group] = [];
    if (map[group].indexOf(value) === -1) map[group].push(value);
  });
  if (Object.keys(map).length === 0) {
    _enumFallbackUsed = true;
    return _getFallbackEnumMap();
  }
  _enumCache = map;
  return map;
}

/**
 * Fallback when ENUM_DICTIONARY is empty or missing.
 * Uses CBV_ENUM from 00_CORE_CONSTANTS.gs. Maps group names to arrays.
 */
function _getFallbackEnumMap() {
  var finType = CBV_ENUM.FINANCE_TYPE || CBV_ENUM.FIN_TRANS_TYPE || [];
  var finStatus = CBV_ENUM.FINANCE_STATUS || CBV_ENUM.FIN_STATUS || [];
  var fallback = {
    ROLE: CBV_ENUM.ROLE || [],
    HO_SO_TYPE: CBV_ENUM.HO_SO_TYPE || [],
    HO_SO_STATUS: CBV_ENUM.HO_SO_STATUS || [],
    FILE_GROUP: CBV_ENUM.FILE_GROUP || [],
    TASK_TYPE: CBV_ENUM.TASK_TYPE || [],
    TASK_STATUS: CBV_ENUM.TASK_STATUS || [],
    TASK_PRIORITY: CBV_ENUM.PRIORITY || [],
    ATTACHMENT_TYPE: CBV_ENUM.ATTACHMENT_TYPE || [],
    UPDATE_TYPE: CBV_ENUM.UPDATE_TYPE || [],
    FINANCE_TYPE: finType,
    FINANCE_STATUS: finStatus,
    FIN_TRANS_TYPE: finType,
    FIN_STATUS: finStatus,
    FIN_CATEGORY: CBV_ENUM.FIN_CATEGORY || [],
    PAYMENT_METHOD: CBV_ENUM.PAYMENT_METHOD || [],
    MASTER_CODE_STATUS: CBV_ENUM.MASTER_CODE_STATUS || [],
    RELATED_ENTITY_TYPE: ['NONE', 'HO_SO', 'FINANCE_TRANSACTION', 'TASK', 'UNIT']
  };
  if (typeof Logger !== 'undefined') {
    Logger.log('ENUM FALLBACK: Using CBV_ENUM - ENUM_DICTIONARY sheet missing or empty');
  }
  return fallback;
}

/**
 * Clears enum cache. Call after seeding or manual sheet edits.
 */
function clearEnumCache() {
  _enumCache = null;
  _enumFallbackUsed = false;
}

/**
 * @returns {boolean} True if fallback was used in last buildEnumMap
 */
function wasEnumFallbackUsed() {
  return _enumFallbackUsed;
}
