/**
 * HOSO — CONFIG adapter (tracked resolver + enum/rule bridge).
 * Dependencies: 168_CBV_CONFIG_TRACKED_RESOLVER.js (and CONFIG stack); optional 163/164 for enum/rules; optional 151 (HOSO_SETUP_SHEETS) or 110 (HO_SO_V2) for legacy sheet names.
 */

/**
 * Cached connection package JSON (written by HO_SO WebApp refresh).
 * @returns {Object|null}
 */
function HOSO_Config_readCachedConnectionPackage_() {
  var raw = '';
  try {
    raw = String(PropertiesService.getScriptProperties().getProperty('CBV_HOSO_CONNECTION_PACKAGE_JSON') || '').trim();
  } catch (e) {
    return null;
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e2) {
    return null;
  }
}

/**
 * moduleDbId from MAIN_CONTROL connection package (cached).
 * @returns {string}
 */
function HOSO_Config_getModuleDbIdFromCachedPackage_() {
  var o = HOSO_Config_readCachedConnectionPackage_();
  if (!o) return '';
  var pkg = null;
  if (o.data && o.data.package) pkg = o.data.package;
  else if (o.package) pkg = o.package;
  if (!pkg || pkg.moduleDbId == null) return '';
  return String(pkg.moduleDbId).trim();
}

/**
 * @param {Object} [context]
 * @returns {string}
 */
function HOSO_Config_getDbId_(context) {
  var fromPkg = HOSO_Config_getModuleDbIdFromCachedPackage_();
  if (fromPkg) return fromPkg;
  var prop = '';
  try {
    prop = String(PropertiesService.getScriptProperties().getProperty('CBV_HOSO_V2_DB_ID') || '').trim();
  } catch (e) {
    prop = '';
  }
  if (prop) return prop;
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
  var n = '';
  try {
    n = String(
      CBV_Config_getSheetNameTracked('HOSO', tableCode, {
        moduleCode: 'HOSO',
        source: (context && context.source) || 'HOSO_SERVICE'
      }) || ''
    ).trim();
  } catch (e) {
    n = '';
  }
  if (n) return n;
  try {
    var tc = String(tableCode || '').trim();
    if (typeof HO_SO_V2 !== 'undefined' && HO_SO_V2.SHEETS && HO_SO_V2.SHEETS[tc]) {
      return String(HO_SO_V2.SHEETS[tc]).trim();
    }
  } catch (e2) {
    /* ignore */
  }
  return '';
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
    if (typeof HOSO_Config_getDbId_ === 'function') {
      var id = String(HOSO_Config_getDbId_({ source: 'LEGACY' }) || '').trim();
      if (id) ss = SpreadsheetApp.openById(id);
    } else if (typeof CBV_Config_getDbId === 'function') {
      var idLegacy = String(CBV_Config_getDbId('HOSO') || '').trim();
      if (idLegacy) ss = SpreadsheetApp.openById(idLegacy);
    }
  } catch (e1) {
    ss = null;
  }
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;
  return ss.getSheetByName(physical) || null;
}
