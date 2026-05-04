/**
 * CBV Core V2 — utilities (safe JSON, ids, dates).
 * Local implementations: `*_local_`. Public `cbvCoreV2*` supplied by bridge.
 * Dependencies: 00_CORE_UTILS.js (`*_local`), 00_CBV_CORE_V2_CONSTANTS.js
 */

/**
 * @param {*} obj
 * @returns {string}
 */
function cbvCoreV2SafeStringify_local_(obj) {
  try {
    return JSON.stringify(obj, function(key, value) {
      if (typeof value === 'object' && value !== null) {
        if (value instanceof Date) {
          return value.toISOString();
        }
      }
      return value;
    });
  } catch (e) {
    return JSON.stringify({ _error: 'stringify_failed', message: String(e && e.message ? e.message : e) });
  }
}

/**
 * @param {string} raw
 * @returns {*}
 */
function cbvCoreV2SafeParseJson_local_(raw) {
  if (raw == null || raw === '') return null;
  try {
    return JSON.parse(String(raw));
  } catch (e) {
    return null;
  }
}

/**
 * @param {string} [prefix]
 * @returns {string}
 */
function cbvCoreV2NewCommandId_local_(prefix) {
  var p = prefix || 'CMD';
  if (typeof cbvMakeId_local === 'function') {
    return cbvMakeId_local(p);
  }
  var d = Utilities.formatDate(cbvNow_local(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'yyyyMMdd');
  var r = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  return p + '_' + d + '_' + r;
}

/**
 * @param {string} [prefix]
 * @returns {string}
 */
function cbvCoreV2NewEventId_local_(prefix) {
  var p = prefix || 'EVT';
  if (typeof cbvMakeId_local === 'function') {
    return cbvMakeId_local(p);
  }
  var d = Utilities.formatDate(cbvNow_local(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'yyyyMMdd');
  var r = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  return p + '_' + d + '_' + r;
}

/**
 * @returns {string}
 */
function cbvCoreV2IsoNow_local_() {
  try {
    return cbvNow_local().toISOString();
  } catch (e) {
    return String(cbvNow_local());
  }
}

/**
 * @param {string} v
 * @returns {boolean}
 */
function cbvCoreV2IsNonEmptyString_local_(v) {
  return v != null && String(v).trim() !== '';
}

/**
 * Global object for dynamic handler lookup (V8 + legacy GAS).
 * @returns {Object}
 */
function cbvCoreV2GlobalThis_local_() {
  if (typeof globalThis !== 'undefined') return globalThis;
  try {
    return Function('return this')();
  } catch (e) {
    return {};
  }
}

/**
 * Fallback normalize (không gọi CBV_L6 — HO_SO không bundle Level6).
 * @param {*} e
 * @returns {{ code: string, message: string }}
 */
function cbvCoreV2NormalizeError_local_(e) {
  if (e && typeof e === 'object' && e.code && e.message) {
    return { code: String(e.code), message: String(e.message) };
  }
  var msg = e && e.message ? String(e.message) : String(e);
  return { code: CBV_CORE_V2.ERROR_CODES.INTERNAL_ERROR, message: msg || 'Unknown error' };
}
