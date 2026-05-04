/**
 * HOSO — CONFIG adapter (tracked resolver + enum/rule bridge).
 * Dependencies: 168_CBV_CONFIG_TRACKED_RESOLVER.js; optional 163/164 for enum/rules; optional 151 (HOSO_SETUP_SHEETS) or apps hoso (HO_SO_V2) for legacy sheet names.
 */

/**
 * @param {Object} [context]
 * @returns {string}
 */
function HOSO_Config_getDbId_(context) {
  return CBV_Config_getDbIdTracked('HOSO', {
    moduleCode: 'HOSO',
    source: (context && context.source) || 'HOSO_SERVICE'
  });
}

/**
 * @param {string} tableCode
 * @param {Object} [context]
 * @returns {string}
 */
function HOSO_Config_getSheetName_(tableCode, context) {
  return CBV_Config_getSheetNameTracked('HOSO', tableCode, {
    moduleCode: 'HOSO',
    source: (context && context.source) || 'HOSO_SERVICE'
  });
}

/**
 * @param {Object} [context]
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function HOSO_Config_openDb_(context) {
  var dbId = HOSO_Config_getDbId_(context);
  if (!dbId) throw new Error('HOSO_CONFIG_DB_ID_MISSING');
  return SpreadsheetApp.openById(dbId);
}

/**
 * DEV/TEST/MENU: active spreadsheet when DB id missing; production paths should not rely on this.
 * @param {Object} [context]
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function HOSO_Config_openDbWithFallback_(context) {
  try {
    return HOSO_Config_openDb_(context);
  } catch (e) {
    var src = (context && context.source) || '';
    if (src === 'TEST' || src === 'MENU' || src === 'HEALTH') {
      return SpreadsheetApp.getActiveSpreadsheet();
    }
    throw e;
  }
}

/**
 * @param {string} tableCode
 * @param {Object} [context]
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function HOSO_Config_getSheet_(tableCode, context) {
  var ss = HOSO_Config_openDb_(context);
  var sheetName = HOSO_Config_getSheetName_(tableCode, context);
  if (!sheetName) throw new Error('HOSO_CONFIG_SHEET_NAME_MISSING:' + tableCode);
  var sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('HOSO_PHYSICAL_SHEET_NOT_FOUND:' + sheetName);
  return sh;
}

/**
 * @param {string} tableCode
 * @param {Object} [context]
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function HOSO_Config_getSheetWithFallback_(tableCode, context) {
  try {
    return HOSO_Config_getSheet_(tableCode, context);
  } catch (e) {
    var source = (context && context.source) || '';
    if (source === 'TEST' || source === 'MENU' || source === 'HEALTH') {
      if (typeof HosoService_getSheetLegacy_ === 'function') {
        return HosoService_getSheetLegacy_(tableCode);
      }
    }
    throw e;
  }
}

/**
 * @param {string} enumGroup
 * @returns {Object[]}
 */
function HOSO_Config_getEnum_(enumGroup) {
  if (typeof Config_getEnum_ === 'function') {
    return Config_getEnum_(enumGroup);
  }
  return [];
}

/**
 * @returns {Object[]}
 */
function HOSO_Config_getRules_() {
  if (typeof Config_getRules_ === 'function') {
    return Config_getRules_('HOSO');
  }
  return [];
}

/**
 * Legacy sheet open (constants + untracked DB id + active SS). Used only from HOSO_Config_getSheetWithFallback_ for TEST/MENU.
 * @param {string} tableCode
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function HosoService_getSheetLegacy_(tableCode) {
  var sk = String(tableCode || '').trim();
  var physical = '';
  if (typeof HO_SO_V2 !== 'undefined' && HO_SO_V2.SHEETS && HO_SO_V2.SHEETS[sk]) {
    physical = String(HO_SO_V2.SHEETS[sk]);
  } else if (typeof HOSO_SETUP_SHEETS !== 'undefined' && HOSO_SETUP_SHEETS[sk]) {
    physical = String(HOSO_SETUP_SHEETS[sk]);
  }
  if (!physical) return null;
  var ss;
  try {
    if (typeof CBV_Config_getDbId === 'function') {
      var id = String(CBV_Config_getDbId('HOSO') || '').trim();
      if (id) ss = SpreadsheetApp.openById(id);
    }
  } catch (e1) {
    ss = null;
  }
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;
  return ss.getSheetByName(physical) || null;
}
