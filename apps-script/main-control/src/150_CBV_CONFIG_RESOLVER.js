/**
 * CBV — central CONFIG DB resolver (HOSO isolation).
 * Script Properties: CBV_CONFIG_DB_ID (required for isolated mode), CBV_CONFIG_ENV (optional, default PROD).
 * Dependencies: 01_CBV_CORE_V2_UTILS.js, 02_CBV_CORE_V2_SHEETS.js
 */

var CBV_CONFIG_CACHE_ = CBV_CONFIG_CACHE_ || null;
var CBV_CONFIG_CACHE_TTL_MS_ = 120000;

/**
 * @returns {string}
 */
function cbvConfigScriptProp_(key) {
  try {
    return String(PropertiesService.getScriptProperties().getProperty(key) || '').trim();
  } catch (e) {
    return '';
  }
}

/**
 * @returns {string}
 */
function cbvConfigDefaultEnv_() {
  var e = cbvConfigScriptProp_('CBV_CONFIG_ENV');
  return e || 'PROD';
}

/**
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet|null}
 */
function cbvConfigOpenSpreadsheet_() {
  var id = cbvConfigScriptProp_('CBV_CONFIG_DB_ID');
  if (!id) return null;
  try {
    return SpreadsheetApp.openById(id);
  } catch (e) {
    return null;
  }
}

/**
 * @returns {Object|null}
 */
function cbvConfigLoadCache_() {
  var now = Date.now();
  if (CBV_CONFIG_CACHE_ && CBV_CONFIG_CACHE_.loadedAt && now - CBV_CONFIG_CACHE_.loadedAt < CBV_CONFIG_CACHE_TTL_MS_) {
    return CBV_CONFIG_CACHE_;
  }
  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) {
    CBV_CONFIG_CACHE_ = { loadedAt: now, ss: null, envByCode: {}, modules: {}, sheets: [] };
    return CBV_CONFIG_CACHE_;
  }
  var envByCode = {};
  var shEnv = ss.getSheetByName('CONFIG_ENV');
  if (shEnv && shEnv.getLastRow() >= 2) {
    var map = cbvCoreV2ReadHeaderMap_(shEnv);
    var ec = map['ENV_CODE'];
    var ck = map['CONFIG_KEY'];
    var cv = map['CONFIG_VALUE'];
    var ia = map['IS_ACTIVE'];
    if (ec && ck && cv) {
      var last = shEnv.getLastRow();
      var r;
      for (r = 2; r <= last; r++) {
        var active = ia ? String(shEnv.getRange(r, ia).getValue() || '').toUpperCase() : 'TRUE';
        if (active === 'FALSE' || active === '0' || active === 'NO') continue;
        var code = String(shEnv.getRange(r, ec).getValue() || '').trim();
        var key = String(shEnv.getRange(r, ck).getValue() || '').trim();
        var val = shEnv.getRange(r, cv).getValue();
        if (!code || !key) continue;
        if (!envByCode[code]) envByCode[code] = {};
        envByCode[code][key] = val != null ? String(val) : '';
      }
    }
  }
  var modules = {};
  var shMod = ss.getSheetByName('CONFIG_MODULE');
  if (shMod && shMod.getLastRow() >= 2) {
    var mMap = cbvCoreV2ReadHeaderMap_(shMod);
    var lastM = shMod.getLastRow();
    var rm;
    for (rm = 2; rm <= lastM; rm++) {
      var rowObj = {};
      var mk;
      for (mk in mMap) {
        if (!Object.prototype.hasOwnProperty.call(mMap, mk)) continue;
        rowObj[mk] = shMod.getRange(rm, mMap[mk]).getValue();
      }
      var mc = String(rowObj.MODULE_CODE || '').trim().toUpperCase();
      if (mc) modules[mc] = rowObj;
    }
  }
  var sheets = [];
  var shReg = ss.getSheetByName('CONFIG_SHEET_REGISTRY');
  if (shReg && shReg.getLastRow() >= 2) {
    var rMap = cbvCoreV2ReadHeaderMap_(shReg);
    var lastR = shReg.getLastRow();
    var rr;
    for (rr = 2; rr <= lastR; rr++) {
      var o = {};
      var rk;
      for (rk in rMap) {
        if (!Object.prototype.hasOwnProperty.call(rMap, rk)) continue;
        o[rk] = shReg.getRange(rr, rMap[rk]).getValue();
      }
      sheets.push(o);
    }
  }
  CBV_CONFIG_CACHE_ = {
    loadedAt: now,
    ss: ss,
    envByCode: envByCode,
    modules: modules,
    sheets: sheets
  };
  return CBV_CONFIG_CACHE_;
}

/**
 * Clear in-memory config cache (e.g. after bootstrap).
 */
function CBV_Config_clearCache() {
  CBV_CONFIG_CACHE_ = null;
  return { ok: true, code: 'CONFIG_CACHE_CLEARED', message: 'OK', data: {}, error: null };
}

/**
 * @param {string} envCode
 * @returns {Object}
 */
function CBV_Config_getEnv(envCode) {
  var code = String(envCode || cbvConfigDefaultEnv_()).trim() || 'PROD';
  var c = cbvConfigLoadCache_();
  if (!c || !c.ss) {
    return { ok: false, envCode: code, values: {}, message: 'CONFIG_DB not configured (CBV_CONFIG_DB_ID)' };
  }
  return { ok: true, envCode: code, values: c.envByCode[code] || {}, message: 'OK' };
}

/**
 * @param {string} key
 * @returns {string}
 */
function CBV_Config_getValue(key) {
  Logger.log('WARNING: using untracked CONFIG resolver');
  var k = String(key || '').trim();
  if (!k) return '';
  var env = cbvConfigDefaultEnv_();
  var c = cbvConfigLoadCache_();
  if (!c || !c.envByCode || !c.envByCode[env]) return '';
  var v = c.envByCode[env][k];
  return v != null ? String(v) : '';
}

/**
 * @param {string} moduleCode
 * @returns {Object|null}
 */
function CBV_Config_getModule(moduleCode) {
  var mc = String(moduleCode || '').trim().toUpperCase();
  if (mc === 'HO_SO') mc = 'HOSO';
  var c = cbvConfigLoadCache_();
  if (!c || !c.modules) return null;
  return c.modules[mc] || null;
}

/**
 * @param {string} moduleCode
 * @returns {string}
 */
function CBV_Config_getDbId(moduleCode) {
  var mc = String(moduleCode || '').trim().toUpperCase();
  if (mc === 'HO_SO') mc = 'HOSO';
  var direct = cbvConfigScriptProp_('CBV_HOSO_DB_ID');
  if (mc === 'HOSO' && direct) {
    Logger.log('WARNING: using untracked CONFIG resolver');
    return direct;
  }
  var mod = CBV_Config_getModule(mc);
  if (!mod) return '';
  var dbKey = String(mod.DB_CONFIG_KEY || mod.db_config_key || '').trim();
  if (!dbKey) dbKey = 'HOSO_DB_ID';
  var v = CBV_Config_getValue(dbKey);
  if (v) return v;
  if (mc === 'HOSO') return cbvConfigScriptProp_('CBV_HOSO_DB_ID');
  return '';
}

/**
 * @param {string} moduleCode
 * @param {string} tableCode — e.g. MASTER, XA_VIEN
 * @returns {string}
 */
function CBV_Config_getSheetName(moduleCode, tableCode) {
  Logger.log('WARNING: using untracked CONFIG resolver');
  var mc = String(moduleCode || '').trim().toUpperCase();
  if (mc === 'HO_SO') mc = 'HOSO';
  var tc = String(tableCode || '').trim().toUpperCase();
  var c = cbvConfigLoadCache_();
  if (!c || !c.sheets) return '';
  var i;
  for (i = 0; i < c.sheets.length; i++) {
    var row = c.sheets[i];
    var rmc = String(row.MODULE_CODE || '').trim().toUpperCase();
    var rtc = String(row.TABLE_CODE || '').trim().toUpperCase();
    var st = String(row.STATUS || '').trim().toUpperCase();
    if (st === 'INACTIVE') continue;
    if (rmc === mc && rtc === tc) {
      return String(row.SHEET_NAME || '').trim();
    }
  }
  return '';
}
