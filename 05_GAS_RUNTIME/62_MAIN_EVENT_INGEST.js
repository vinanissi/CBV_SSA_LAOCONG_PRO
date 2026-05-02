/**
 * MAIN Command Center — nhận POST { action: "mainEventIngest", ... } từ module con.
 * Ghi vào EVENT_QUEUE qua cbvTryEmitCoreEvent_ (không đọc sheet con).
 *
 * Phụ thuộc: 60_HOSO_API_GATEWAY (_jsonOut_), 04_CORE_EVENT_QUEUE, 00_CORE_UTILS (cbvUser optional).
 * Load sau 60_HOSO_API_GATEWAY; 61_UNIFIED_ROUTER gọi mainEventIngestFromBody_.
 */

/**
 * @param {Object} body - đã JSON.parse
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function mainEventIngestFromBody_(body) {
  body = body || {};
  try {
    var eventType = String(body.eventType || '').trim();
    var sourceModule = String(body.sourceModule || '').trim();
    var refId = String(body.refId != null ? body.refId : body.ref_id || '').trim();
    if (!eventType || !sourceModule || !refId) {
      return _jsonOut_({
        ok: false,
        code: 'MAIN_EVENT_INVALID',
        message: 'eventType, sourceModule, refId required'
      });
    }

    var entityType = body.entityType != null ? String(body.entityType).trim() : '';
    var payload = body.payload && typeof body.payload === 'object' ? body.payload : {};
    var trace = body.correlationId != null ? body.correlationId : (body.requestId != null ? body.requestId : body.traceId);

    if (typeof cbvSetRequestCorrelationId_ === 'function') {
      cbvSetRequestCorrelationId_(trace);
    }
    try {
      if (typeof cbvTryEmitCoreEvent_ === 'function') {
        cbvTryEmitCoreEvent_({
          eventType: eventType,
          sourceModule: sourceModule,
          refId: refId,
          entityType: entityType,
          payload: payload,
          correlationId: trace
        });
      }
      return _jsonOut_({ ok: true, code: 'MAIN_EVENT_INGESTED', message: 'OK' });
    } finally {
      if (typeof cbvClearRequestCorrelationId_ === 'function') {
        cbvClearRequestCorrelationId_();
      }
    }
  } catch (err) {
    Logger.log('[mainEventIngestFromBody_] ' + (err && err.message ? err.message : err));
    return _jsonOut_({ ok: false, code: 'MAIN_EVENT_ERROR', message: err && err.message ? err.message : String(err) });
  }
}
