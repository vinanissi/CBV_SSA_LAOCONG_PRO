/**
 * CBV Core V2 — error normalization.
 */

/**
 * @param {*} e
 * @returns {{ code: string, message: string }}
 */
function cbvCoreV2NormalizeError_(e) {
  if (
    typeof CBV_L6_normalizeError === 'function' &&
    e &&
    typeof e === 'object' &&
    e.code &&
    String(e.code).indexOf('_') > 0 &&
    /^[A-Z][A-Z0-9_]+$/.test(String(e.code))
  ) {
    try {
      var l6 = CBV_L6_normalizeError(e, {});
      return { code: String(l6.errorCode), message: String(l6.techMessage || l6.userMessage || e.message || '') };
    } catch (eL6) {
      /* fall through */
    }
  }
  if (e && typeof e === 'object' && e.code && e.message) {
    return { code: String(e.code), message: String(e.message) };
  }
  var msg = e && e.message ? String(e.message) : String(e);
  return { code: CBV_CORE_V2.ERROR_CODES.INTERNAL_ERROR, message: msg || 'Unknown error' };
}
