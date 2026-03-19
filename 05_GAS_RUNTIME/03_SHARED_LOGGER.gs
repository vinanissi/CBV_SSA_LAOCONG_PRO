/**
 * Append a row to ADMIN_AUDIT_LOG for admin operations.
 * @param {string} auditType - ENUM_EDIT, MASTER_CODE_EDIT, ROLE_ASSIGN
 * @param {string} entityType - ENUM_DICTIONARY, MASTER_CODE, USER_ROLE
 * @param {string} entityId - Row ID when applicable
 * @param {string} action - CREATE, UPDATE, ACTIVATE, INACTIVATE
 * @param {Object} beforeObj - Snapshot before change
 * @param {Object} afterObj - Snapshot after change
 * @param {string} [note] - Optional note
 */
function logAdminAudit(auditType, entityType, entityId, action, beforeObj, afterObj, note) {
  var record = {
    ID: cbvMakeId('AAL'),
    AUDIT_TYPE: auditType || '',
    ENTITY_TYPE: entityType || '',
    ENTITY_ID: entityId || '',
    ACTION: action || '',
    BEFORE_JSON: JSON.stringify(beforeObj || {}),
    AFTER_JSON: JSON.stringify(afterObj || {}),
    NOTE: note || '',
    ACTOR_ID: cbvUser(),
    CREATED_AT: cbvNow()
  };
  _appendRecord(CBV_CONFIG.SHEETS.ADMIN_AUDIT_LOG, record);
}

function logAction(module, entityType, entityId, action, beforeObj, afterObj, note) {
  const sheetName = module === 'FINANCE' ? CBV_CONFIG.SHEETS.FINANCE_LOG : CBV_CONFIG.SHEETS.TASK_UPDATE_LOG;
  const idPrefix = module === 'FINANCE' ? 'FLOG' : 'TLOG';
  const record = {
    ID: cbvMakeId(idPrefix),
    MODULE: module,
    ENTITY_TYPE: entityType,
    ENTITY_ID: entityId,
    ACTION: action,
    BEFORE_JSON: JSON.stringify(beforeObj || {}),
    AFTER_JSON: JSON.stringify(afterObj || {}),
    NOTE: note || '',
    ACTOR_ID: cbvUser(),
    CREATED_AT: cbvNow()
  };

  const sheet = _sheet(sheetName);
  const headers = _headers(sheet);
  const row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
  sheet.appendRow(row);
}
