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
