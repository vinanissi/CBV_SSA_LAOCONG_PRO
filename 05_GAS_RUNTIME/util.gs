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
