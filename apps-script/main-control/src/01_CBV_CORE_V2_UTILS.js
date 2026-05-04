/**
 * CBV Core V2 — utilities (safe JSON, ids, dates).
 * Dependencies: 00_CORE_UTILS.js (cbvNow, cbvUser, cbvMakeId), 00_CBV_CORE_V2_CONSTANTS.js
 */

/**
 * @param {*} obj
 * @returns {string}
 */
function cbvCoreV2SafeStringify_(obj) {
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
function cbvCoreV2SafeParseJson_(raw) {
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
function cbvCoreV2NewCommandId_(prefix) {
  var p = prefix || 'CMD';
  if (typeof cbvMakeId === 'function') {
    return cbvMakeId(p);
  }
  var d = Utilities.formatDate(cbvNow(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'yyyyMMdd');
  var r = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  return p + '_' + d + '_' + r;
}

/**
 * @param {string} [prefix]
 * @returns {string}
 */
function cbvCoreV2NewEventId_(prefix) {
  var p = prefix || 'EVT';
  if (typeof cbvMakeId === 'function') {
    return cbvMakeId(p);
  }
  var d = Utilities.formatDate(cbvNow(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'yyyyMMdd');
  var r = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  return p + '_' + d + '_' + r;
}

/**
 * @returns {string}
 */
function cbvCoreV2IsoNow_() {
  try {
    return cbvNow().toISOString();
  } catch (e) {
    return String(cbvNow());
  }
}

/**
 * @param {string} v
 * @returns {boolean}
 */
function cbvCoreV2IsNonEmptyString_(v) {
  return v != null && String(v).trim() !== '';
}

/**
 * Global object for dynamic handler lookup (V8 + legacy GAS).
 * @returns {Object}
 */
function cbvCoreV2GlobalThis_() {
  if (typeof globalThis !== 'undefined') return globalThis;
  try {
    return Function('return this')();
  } catch (e) {
    return {};
  }
}
