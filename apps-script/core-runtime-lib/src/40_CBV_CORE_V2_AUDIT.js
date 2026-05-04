/**
 * CBV Core V2 — CBV_AUDIT_LOG.
 */

/**
 * @param {Object} audit
 * @param {string} audit.moduleCode
 * @param {string} audit.entityType
 * @param {string} audit.entityId
 * @param {string} audit.action
 * @param {string} [audit.fieldName]
 * @param {string} [audit.oldValue]
 * @param {string} [audit.newValue]
 * @param {string} [audit.actorEmail]
 * @param {string} [audit.source]
 * @param {string} [audit.commandId]
 */
function cbvCoreV2AuditAppend_(audit) {
  var res = cbvCoreV2EnsureCoreSheet_('AUDIT_LOG', 'AUDIT_LOG');
  var sheet = res.sheet;
  var auditId = cbvCoreV2NewEventId_('AUD');
  var fields = {
    AUDIT_ID: auditId,
    MODULE_CODE: audit.moduleCode || '',
    ENTITY_TYPE: audit.entityType || '',
    ENTITY_ID: audit.entityId || '',
    ACTION: audit.action || '',
    FIELD_NAME: audit.fieldName != null ? audit.fieldName : '',
    OLD_VALUE: audit.oldValue != null ? String(audit.oldValue) : '',
    NEW_VALUE: audit.newValue != null ? String(audit.newValue) : '',
    ACTOR_EMAIL: audit.actorEmail != null ? audit.actorEmail : cbvUser(),
    SOURCE: audit.source || '',
    COMMAND_ID: audit.commandId || '',
    CREATED_AT: cbvCoreV2IsoNow_()
  };
  cbvCoreV2AppendRowByHeaders_(sheet, fields);
}

/**
 * Public: append Core V2 audit row.
 * @param {Object} audit
 */
function CBV_CoreV2_logAudit(audit) {
  try {
    cbvCoreV2AuditAppend_(audit || {});
    return { ok: true, code: 'AUDIT_LOGGED', message: 'OK', data: {}, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}
