/**
 * CBV Enum Service - Validation and lookup.
 * Reads from ENUM_DICTIONARY via enum_repository. Fallback to CBV_ENUM.
 */

/**
 * @param {string} enumGroup - e.g. HO_SO_TYPE, TASK_STATUS
 * @returns {string[]} Active enum values for group
 */
function getEnumValues(enumGroup) {
  var map = buildEnumMap();
  return map[enumGroup] || [];
}

/**
 * @param {string} enumGroup
 * @param {boolean} activeOnly
 * @returns {string[]} All values if activeOnly=false; else active only
 */
function getActiveEnumValues(enumGroup) {
  return getEnumValues(enumGroup);
}

/**
 * @param {string} enumGroup
 * @param {*} value
 * @returns {boolean}
 */
function isValidEnumValue(enumGroup, value) {
  if (value === null || value === undefined) return false;
  var values = getEnumValues(enumGroup);
  return values.indexOf(String(value).trim()) !== -1;
}

/**
 * Asserts value is valid for enumGroup. Throws if invalid.
 * Use this in services instead of ensureEnum with hardcoded arrays.
 * @param {string} enumGroup - e.g. HO_SO_TYPE, TASK_STATUS
 * @param {*} value
 * @param {string} fieldName - for error message
 */
function assertValidEnumValue(enumGroup, value, fieldName) {
  if (!isValidEnumValue(enumGroup, value)) {
    throw new Error('Invalid ' + (fieldName || enumGroup) + ': ' + value);
  }
}
