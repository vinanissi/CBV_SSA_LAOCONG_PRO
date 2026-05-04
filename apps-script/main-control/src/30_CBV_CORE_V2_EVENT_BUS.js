/**
 * CBV Core V2 — event emit (EVENT_LOG + EVENT_QUEUE).
 */

/**
 * @param {Object} raw
 * @returns {Object} normalized event
 */
function cbvCoreV2NormalizeEvent_(raw) {
  var e = raw || {};
  return {
    eventType: String(e.eventType || e.EVENT_TYPE || '').trim(),
    moduleCode: String(e.moduleCode || e.MODULE_CODE || '').trim(),
    entityType: String(e.entityType || e.ENTITY_TYPE || '').trim(),
    entityId: String(e.entityId || e.ENTITY_ID || '').trim(),
    sourceCommandId: String(e.sourceCommandId || e.SOURCE_COMMAND_ID || '').trim(),
    payload: e.payload != null ? e.payload : {},
    createdBy: String(e.createdBy || e.CREATED_BY || cbvUser()).trim()
  };
}

/**
 * @param {Object} event normalized
 * @returns {{ ok: boolean, errors: string[] }}
 */
function cbvCoreV2ValidateEvent_(event) {
  var errors = [];
  if (!cbvCoreV2IsNonEmptyString_(event.eventType)) errors.push('eventType required');
  if (!cbvCoreV2IsNonEmptyString_(event.moduleCode)) errors.push('moduleCode required');
  if (!cbvCoreV2IsNonEmptyString_(event.entityType)) errors.push('entityType required');
  if (!cbvCoreV2IsNonEmptyString_(event.entityId)) errors.push('entityId required');
  return { ok: errors.length === 0, errors: errors };
}

/**
 * @param {Object} event normalized
 * @returns {Object} { eventId }
 */
function cbvCoreV2EmitEventInternal_(event) {
  var eventId = cbvCoreV2NewEventId_('EVT');
  var payloadJson = cbvCoreV2SafeStringify_(event.payload);
  var now = cbvCoreV2IsoNow_();

  var resLog = cbvCoreV2EnsureCoreSheet_('EVENT_LOG', 'EVENT_LOG');
  var logSheet = resLog.sheet;
  cbvCoreV2AppendRowByHeaders_(logSheet, {
    EVENT_ID: eventId,
    EVENT_TYPE: event.eventType,
    MODULE_CODE: event.moduleCode,
    ENTITY_TYPE: event.entityType,
    ENTITY_ID: event.entityId,
    SOURCE_COMMAND_ID: event.sourceCommandId,
    PAYLOAD_JSON: payloadJson,
    CREATED_AT: now,
    CREATED_BY: event.createdBy
  });

  var resQ = cbvCoreV2EnsureCoreSheet_('EVENT_QUEUE', 'EVENT_QUEUE');
  var qSheet = resQ.sheet;
  cbvCoreV2AppendRowByHeaders_(qSheet, {
    EVENT_ID: eventId,
    EVENT_TYPE: event.eventType,
    MODULE_CODE: event.moduleCode,
    ENTITY_TYPE: event.entityType,
    ENTITY_ID: event.entityId,
    SOURCE_COMMAND_ID: event.sourceCommandId,
    PAYLOAD_JSON: payloadJson,
    STATUS: CBV_CORE_V2.EVENT_QUEUE_STATUS.PENDING,
    RETRY_COUNT: 0,
    NEXT_RUN_AT: now,
    ERROR_CODE: '',
    CREATED_AT: now,
    PROCESSED_AT: ''
  });

  return { eventId: eventId };
}

/**
 * @param {Object} event
 * @returns {Object}
 */
function CBV_CoreV2_emitEvent(event) {
  try {
    var norm = cbvCoreV2NormalizeEvent_(event);
    var v = cbvCoreV2ValidateEvent_(norm);
    if (!v.ok) {
      return {
        ok: false,
        code: CBV_CORE_V2.ERROR_CODES.VALIDATION_ERROR,
        message: v.errors.join('; '),
        data: {},
        error: { code: CBV_CORE_V2.ERROR_CODES.VALIDATION_ERROR, message: v.errors.join('; ') }
      };
    }
    var out = cbvCoreV2EmitEventInternal_(norm);
    return { ok: true, code: 'EVENT_EMITTED', message: 'OK', data: out, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}
