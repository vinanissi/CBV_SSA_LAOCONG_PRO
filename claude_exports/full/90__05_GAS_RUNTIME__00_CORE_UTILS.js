function cbvNow() {
  return new Date();
}

function cbvUser() {
  try {
    return Session.getActiveUser().getEmail() || 'system';
  } catch (e) {
    return 'system';
  }
}

function cbvResponse(ok, code, message, data, errors) {
  return {
    ok: ok,
    code: code,
    message: message || '',
    data: data || {},
    errors: errors || []
  };
}

function cbvAssert(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * @returns {boolean} True if current user is in ADMIN_EMAILS whitelist
 */
function isAdminUser() {
  var whitelist = CBV_CONFIG.ADMIN_EMAILS;
  if (!whitelist || !Array.isArray(whitelist) || whitelist.length === 0) return false;
  var email = String(cbvUser() || '').trim().toLowerCase();
  return whitelist.some(function(e) { return String(e || '').trim().toLowerCase() === email; });
}

/**
 * Throws if current user is not authorized for admin operations.
 * Requires CBV_CONFIG.ADMIN_EMAILS to be configured with at least one email.
 */
function assertAdminAuthority() {
  var user = cbvUser();
  if (!user || String(user).trim() === '' || String(user).toLowerCase() === 'system') {
    throw new Error('Admin operations require a signed-in user. System/trigger context not allowed.');
  }
  var whitelist = CBV_CONFIG.ADMIN_EMAILS;
  if (!whitelist || !Array.isArray(whitelist) || whitelist.length === 0) {
    throw new Error('Admin operations require CBV_CONFIG.ADMIN_EMAILS. Add admin email(s) to 00_CORE_CONFIG.js.');
  }
  if (!isAdminUser()) {
    throw new Error('Not authorized for admin operations.');
  }
}

function cbvMakeId(prefix) {
  const date = Utilities.formatDate(cbvNow(), CBV_CONFIG.TIMEZONE, 'yyyyMMdd');
  const random = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  return [prefix, date, random].join('_');
}

function cbvClone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

/** @returns {Object} Empty bootstrap result structure */
function buildStructuredBootstrapReport() {
  return {
    ok: true,
    code: 'INIT_OK',
    message: 'Bootstrap completed',
    data: {
      createdSheets: [],
      existingSheets: [],
      updatedSheets: [],
      mismatchedSheets: [],
      createdTriggers: [],
      skippedTriggers: [],
      warnings: []
    },
    errors: []
  };
}
