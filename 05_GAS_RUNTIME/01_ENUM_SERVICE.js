/**
 * CBV Enum Service - Validation and lookup.
 * Prefers ENUM_DICTIONARY via enum sync engine. Fallback to enum_repository / CBV_ENUM.
 */

/**
 * @param {string} enumGroup - e.g. HO_SO_TYPE, TASK_STATUS
 * @param {Object} options - { activeOnly } (used when sync engine available)
 * @returns {string[]} Active enum values for group
 */
function getEnumValues(enumGroup, options) {
  if (typeof getEnumValuesFromRegistry === 'function') {
    return getEnumValuesFromRegistry(enumGroup, options || {});
  }
  var map = typeof buildEnumMap === 'function' ? buildEnumMap() : {};
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
