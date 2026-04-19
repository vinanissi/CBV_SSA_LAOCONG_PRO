/**
 * Event-driven core — append-only EVENT_QUEUE rows.
 * Depends: 00_CORE_UTILS, 03_SHARED_REPOSITORY, 00_CORE_CONFIG, 04_CORE_EVENT_TYPES.
 */

/**
 * @param {{ eventType: string, sourceModule: string, refId: string, entityType?: string, payload?: Object, correlationId?: string }} spec
 * @returns {Object|null} persisted row shape (no _rowNumber until re-read) or null if skipped/off
 */
function createCoreEvent(spec) {
  spec = spec || {};
  if (cbvCoreEventMode_() === 'off') return null;
  var sheetName = CBV_CONFIG.SHEETS.EVENT_QUEUE;
  if (!sheetName) return null;

  var rec = {
    ID: cbvMakeId('EVT'),
    EVENT_TYPE: String(spec.eventType || ''),
    SOURCE_MODULE: String(spec.sourceModule || ''),
    REF_ID: String(spec.refId || ''),
    ENTITY_TYPE: String(spec.entityType || ''),
    PAYLOAD_JSON: JSON.stringify(spec.payload != null ? spec.payload : {}),
    STATUS: 'PENDING',
    CORRELATION_ID: String(spec.correlationId || ''),
    ERROR_MESSAGE: '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    PROCESSED_AT: ''
  };
  _appendRecord(sheetName, rec);
  return rec;
}

/**
 * Safe for hot paths (webhook): never throws; logs on failure.
 * @param {{ eventType: string, sourceModule: string, refId: string, entityType?: string, payload?: Object, correlationId?: string }} spec
 * @returns {Object|null}
 */
function cbvTryEmitCoreEvent_(spec) {
  try {
    return createCoreEvent(spec);
  } catch (e) {
    Logger.log('[cbvTryEmitCoreEvent_] ' + (e && e.message ? e.message : e));
    return null;
  }
}
