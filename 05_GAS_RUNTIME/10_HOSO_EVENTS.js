/**
 * HO_SO Events — thin emit helpers (one per canonical event).
 * Never throws; delegates to cbvTryEmitCoreEvent_.
 * Dependencies: 04_CORE_EVENT_TYPES, 04_CORE_EVENT_QUEUE.
 *
 * Design: keep this file as the ONLY place where HO_SO event constants are
 * referenced by service code. When the rule engine becomes authoritative
 * (EVENT_DRIVEN_MIGRATION_PLAN §10.2 W2/P7), refactor lives in this one file.
 */

function hosoEmit_(eventType, refId, payload) {
  if (typeof cbvTryEmitCoreEvent_ !== 'function') return null;
  return cbvTryEmitCoreEvent_({
    eventType: eventType,
    sourceModule: 'HO_SO',
    refId: String(refId || ''),
    entityType: 'HO_SO_MASTER',
    payload: payload || {}
  });
}

function hosoEmitCreated_(record) {
  if (!record) return null;
  return hosoEmit_(
    typeof CBV_CORE_EVENT_TYPE_HO_SO_CREATED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_CREATED : 'HO_SO_CREATED',
    record.ID,
    {
      STATUS: record.STATUS,
      HO_SO_TYPE_ID: record.HO_SO_TYPE_ID,
      HO_SO_CODE: record.HO_SO_CODE,
      HTX_ID: record.HTX_ID || '',
      DON_VI_ID: record.DON_VI_ID || ''
    }
  );
}

function hosoEmitUpdated_(id, before, after, changedFields) {
  return hosoEmit_(
    typeof CBV_CORE_EVENT_TYPE_HO_SO_UPDATED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_UPDATED : 'HO_SO_UPDATED',
    id,
    {
      fieldsChanged: Array.isArray(changedFields) ? changedFields : [],
      before: before || {},
      after: after || {}
    }
  );
}

function hosoEmitStatusChanged_(id, previousStatus, newStatus, note) {
  return hosoEmit_(
    typeof CBV_CORE_EVENT_TYPE_HO_SO_STATUS_CHANGED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_STATUS_CHANGED : 'HO_SO_STATUS_CHANGED',
    id,
    {
      previousStatus: String(previousStatus || ''),
      newStatus: String(newStatus || ''),
      note: note || ''
    }
  );
}

function hosoEmitClosed_(id, previousStatus, note) {
  return hosoEmit_(
    typeof CBV_CORE_EVENT_TYPE_HO_SO_CLOSED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_CLOSED : 'HO_SO_CLOSED',
    id,
    {
      previousStatus: String(previousStatus || ''),
      note: note || ''
    }
  );
}

function hosoEmitSoftDeleted_(id, previousStatus) {
  return hosoEmit_(
    typeof CBV_CORE_EVENT_TYPE_HO_SO_DELETED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_DELETED : 'HO_SO_DELETED',
    id,
    {
      previousStatus: String(previousStatus || '')
    }
  );
}

function hosoEmitFileAdded_(hosoId, fileRec) {
  if (!fileRec) return null;
  return hosoEmit_(
    typeof CBV_CORE_EVENT_TYPE_HO_SO_FILE_ADDED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_FILE_ADDED : 'HO_SO_FILE_ADDED',
    hosoId,
    {
      fileId: fileRec.ID,
      FILE_GROUP: fileRec.FILE_GROUP || '',
      DOC_TYPE: fileRec.DOC_TYPE || '',
      FILE_NAME: fileRec.FILE_NAME || ''
    }
  );
}

function hosoEmitFileRemoved_(hosoId, fileRec) {
  if (!fileRec) return null;
  return hosoEmit_(
    typeof CBV_CORE_EVENT_TYPE_HO_SO_FILE_REMOVED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_FILE_REMOVED : 'HO_SO_FILE_REMOVED',
    hosoId,
    {
      fileId: fileRec.ID,
      FILE_NAME: fileRec.FILE_NAME || ''
    }
  );
}

function hosoEmitRelationAdded_(hosoId, relRec) {
  if (!relRec) return null;
  return hosoEmit_(
    typeof CBV_CORE_EVENT_TYPE_HO_SO_RELATION_ADDED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_RELATION_ADDED : 'HO_SO_RELATION_ADDED',
    hosoId,
    {
      relationId: relRec.ID,
      FROM_HO_SO_ID: relRec.FROM_HO_SO_ID || '',
      TO_HO_SO_ID: relRec.TO_HO_SO_ID || '',
      RELATED_TABLE: relRec.RELATED_TABLE || '',
      RELATED_RECORD_ID: relRec.RELATED_RECORD_ID || '',
      RELATION_TYPE: relRec.RELATION_TYPE || ''
    }
  );
}

function hosoEmitRelationRemoved_(hosoId, relRec) {
  if (!relRec) return null;
  return hosoEmit_(
    typeof CBV_CORE_EVENT_TYPE_HO_SO_RELATION_REMOVED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_RELATION_REMOVED : 'HO_SO_RELATION_REMOVED',
    hosoId,
    {
      relationId: relRec.ID,
      FROM_HO_SO_ID: relRec.FROM_HO_SO_ID || '',
      TO_HO_SO_ID: relRec.TO_HO_SO_ID || '',
      RELATED_TABLE: relRec.RELATED_TABLE || '',
      RELATED_RECORD_ID: relRec.RELATED_RECORD_ID || ''
    }
  );
}

// ---------------------------------------------------------------------------
// Phase D (2026-04-21): register HO_SO core-action handlers. RULE_DEF rows
// invoke these by name via ACTIONS_JSON:
//   { "type": "INVOKE_SERVICE",
//     "params": { "handler": "HOSO_RECHECK_COMPLETENESS",
//                 "args": { "hosoId": "$event.REF_ID" } } }
// Keeping handlers thin + side-effect-safe: never throw out, always return
// a plain object. The core processor already wraps in try/catch and logs
// INVOKE_SERVICE_FAILED, but defense-in-depth keeps the queue green.
// ---------------------------------------------------------------------------

/**
 * Recheck completeness for a HO_SO after a file add/remove.
 * @param {{hosoId?:string}} args
 */
function hosoActionRecheckCompleteness_(args) {
  var id = String((args && args.hosoId) || '').trim();
  if (!id) return { ok: false, skipped: true, reason: 'missing hosoId' };
  if (typeof hosoCheckCompleteness !== 'function') {
    return { ok: false, skipped: true, reason: 'hosoCheckCompleteness not loaded' };
  }
  try {
    var r = hosoCheckCompleteness(id);
    return { ok: true, hosoId: id, result: r };
  } catch (e) {
    return { ok: false, hosoId: id, error: String(e && e.message ? e.message : e) };
  }
}

/**
 * Write a structured ADMIN_AUDIT_LOG entry for any HO_SO event.
 * @param {{action?:string, message?:string}} args
 * @param {{event:Object, payload:Object}} ctx
 */
function hosoActionLogAudit_(args, ctx) {
  if (typeof logAdminAudit !== 'function') return { ok: false, skipped: true };
  var evt = ctx && ctx.event ? ctx.event : {};
  var action = String((args && args.action) || 'HOSO_EVENT');
  var message = String((args && args.message) || evt.EVENT_TYPE || '');
  try {
    logAdminAudit(
      'HO_SO',
      String(evt.EVENT_TYPE || 'UNKNOWN'),
      String(evt.REF_ID || ''),
      action,
      { payload: (ctx && ctx.payload) || {}, eventId: evt.ID },
      {},
      message,
      { actorId: typeof cbvSystemActor === 'function' ? cbvSystemActor() : undefined }
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

/**
 * Idempotent: registers HO_SO action handlers in the core registry.
 * Safe to call many times; overwrites with latest pointer.
 */
function hosoRegisterCoreActionHandlers_() {
  if (typeof cbvRegisterCoreAction_ !== 'function') return;
  cbvRegisterCoreAction_('HOSO_RECHECK_COMPLETENESS', hosoActionRecheckCompleteness_);
  cbvRegisterCoreAction_('HOSO_LOG_AUDIT', hosoActionLogAudit_);
}

// Execute registration on script load so RULE_DEF rows that reference these
// handlers work immediately (including triggered/webhook entry points, which
// skip menu-based bootstrap).
(function hosoRegisterCoreActionHandlersOnLoad_() {
  try { hosoRegisterCoreActionHandlers_(); } catch (e) {
    Logger.log('[hosoRegisterCoreActionHandlers_] load error: ' + (e && e.message ? e.message : e));
  }
})();
