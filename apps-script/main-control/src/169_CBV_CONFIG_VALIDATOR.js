/**
 * CONFIG module — payload validation (throws on invalid input before writes).
 * Dependencies: none
 */

/**
 * @param {string} key
 * @param {*} value — allowed empty
 */
function Config_validateKeyValue_(key, value) {
  void value;
  if (!key || !String(key).trim()) throw new Error('CONFIG_KEY_REQUIRED');
  return true;
}

/**
 * @param {Object} payload
 */
function Config_validateEnum_(payload) {
  var p = payload || {};
  if (!String(p.enumGroup || p.ENUM_GROUP || '').trim()) throw new Error('ENUM_GROUP_REQUIRED');
  if (!String(p.enumKey || p.ENUM_KEY || '').trim()) throw new Error('ENUM_KEY_REQUIRED');
}

/**
 * @param {Object} payload
 */
function Config_validateUpdateEnum_(payload) {
  var p = payload || {};
  var id = String(p.enumId || p.ENUM_ID || '').trim();
  var g = String(p.enumGroup || p.ENUM_GROUP || '').trim();
  var k = String(p.enumKey || p.ENUM_KEY || '').trim();
  if (!id && (!g || !k)) throw new Error('ENUM_ID_OR_GROUP_KEY_REQUIRED');
}

/**
 * @param {Object} payload
 */
function Config_validateRule_(payload) {
  var p = payload || {};
  var raw = p.ruleJson != null ? p.ruleJson : p.RULE_JSON;
  var s = raw != null ? String(raw) : '{}';
  try {
    JSON.parse(s || '{}');
  } catch (e) {
    throw new Error('RULE_JSON_INVALID');
  }
}

/**
 * @param {Object} payload
 */
function Config_validateRegisterModule_(payload) {
  var p = payload || {};
  if (!String(p.moduleCode || p.MODULE_CODE || '').trim()) throw new Error('CONFIG_MODULE_CODE_REQUIRED');
}

/**
 * @param {Object} payload
 */
function Config_validateRegisterSheet_(payload) {
  var p = payload || {};
  if (!String(p.moduleCode || p.MODULE_CODE || '').trim()) throw new Error('CONFIG_MODULE_CODE_REQUIRED');
  if (!String(p.tableCode || p.TABLE_CODE || '').trim()) throw new Error('CONFIG_TABLE_CODE_REQUIRED');
  if (!String(p.sheetName || p.SHEET_NAME || '').trim()) throw new Error('CONFIG_SHEET_NAME_REQUIRED');
}

/**
 * @param {Object} payload
 */
function Config_validateFeatureFlag_(payload) {
  var p = payload || {};
  if (!String(p.flagKey || p.FLAG_KEY || '').trim()) throw new Error('CONFIG_FLAG_KEY_REQUIRED');
}
