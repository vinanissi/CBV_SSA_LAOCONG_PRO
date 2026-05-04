/**
 * CBV Level 6 Pro — CBV_ERROR_LOG append.
 * Dependencies: 132_CBV_LEVEL6_ERROR_CODE.js
 */

/**
 * @param {Object} errorObj
 * @returns {Object}
 */
function CBV_L6_logError(errorObj) {
  try {
    var e = errorObj || {};
    var norm = CBV_L6_normalizeError(e.error || e, e);
    cbvL6EnsureCoreSheet_('ERROR_LOG', 'ERROR_LOG');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.ERROR_LOG);
    var errorId = e.errorId || e.ERROR_ID || cbvCoreV2NewEventId_('ERR');
    var moduleCode = cbvL6NormalizeModuleCode_(e.moduleCode || e.MODULE_CODE || norm.errorCode.split('_')[0] || 'CORE');
    var row = {
      ERROR_ID: errorId,
      MODULE_CODE: moduleCode,
      ERROR_CODE: norm.errorCode,
      SEVERITY: e.severity || norm.severity,
      COMMAND_ID: String(e.commandId || e.COMMAND_ID || ''),
      EVENT_ID: String(e.eventId || e.EVENT_ID || ''),
      ENTITY_TYPE: String(e.entityType || e.ENTITY_TYPE || ''),
      ENTITY_ID: String(e.entityId || e.ENTITY_ID || ''),
      SOURCE: String(e.source || e.SOURCE || ''),
      MESSAGE: String(e.message != null ? e.message : norm.techMessage),
      STACK: String(e.stack || e.STACK || ''),
      PAYLOAD_JSON: e.payload != null ? cbvCoreV2SafeStringify_(e.payload) : (e.PAYLOAD_JSON != null ? cbvCoreV2SafeStringify_(e.PAYLOAD_JSON) : ''),
      CREATED_AT: cbvCoreV2IsoNow_(),
      CREATED_BY: String(e.createdBy || e.CREATED_BY || (typeof cbvUser === 'function' ? cbvUser() : '') || 'system')
    };
    cbvCoreV2AppendRowByHeaders_(sheet, row);
    return { ok: true, code: 'ERROR_LOGGED', message: 'OK', data: { errorId: errorId }, error: null };
  } catch (ex) {
    var n = cbvCoreV2NormalizeError_(ex);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}
