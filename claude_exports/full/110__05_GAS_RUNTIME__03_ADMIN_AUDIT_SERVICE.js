/**
 * CBV Admin Audit Service - Contract and alias for admin audit logging.
 * Implementation: logAdminAudit in 03_SHARED_LOGGER.js appends to ADMIN_AUDIT_LOG.
 *
 * CONTRACT
 * - Every admin mutating operation must call logAdminAudit (or logAdminAction) after success.
 * - BEFORE_JSON / AFTER_JSON: record snapshots; redact secrets if any.
 * - AUDIT_TYPE: ENUM_EDIT | MASTER_CODE_EDIT | ROLE_ASSIGN
 * - ENTITY_TYPE: ENUM_DICTIONARY | MASTER_CODE | USER_ROLE
 * - ACTION: CREATE | UPDATE | ACTIVATE | INACTIVATE
 */

/**
 * Alias for logAdminAudit. Logs admin action to ADMIN_AUDIT_LOG.
 * @param {string} auditType - ENUM_EDIT, MASTER_CODE_EDIT, ROLE_ASSIGN
 * @param {string} entityType - ENUM_DICTIONARY, MASTER_CODE, USER_ROLE
 * @param {string} entityId - Row ID when applicable
 * @param {string} action - CREATE, UPDATE, ACTIVATE, INACTIVATE
 * @param {Object} beforeObj - Snapshot before change
 * @param {Object} afterObj - Snapshot after change
 * @param {string} [note] - Optional note
 */
function logAdminAction(auditType, entityType, entityId, action, beforeObj, afterObj, note) {
  logAdminAudit(auditType, entityType, entityId, action, beforeObj, afterObj, note);
}
