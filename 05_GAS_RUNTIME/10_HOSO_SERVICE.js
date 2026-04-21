/**
 * HO_SO Service — business logic only. No direct sheet calls.
 *
 * Layering contract (enforced by grep):
 *   rg '_findById|_appendRecord|_rows\\(|_sheet\\(' 10_HOSO_SERVICE.js  → MUST return 0
 * Reads/writes go through hosoRepo* (10_HOSO_REPOSITORY.js).
 * Events go through hosoEmit* (10_HOSO_EVENTS.js).
 *
 * Canonical public API (Phase A):
 *   hosoCreate(data)
 *   hosoUpdate(id, patch)
 *   hosoSetStatus(id, newStatus, note?)
 *   hosoSoftDelete(id, note?)
 *   hosoFileAdd(data)
 *   hosoFileRemove(fileId, note?)
 *   hosoRelationAdd(data)
 *   hosoRelationRemove(relationId, note?)
 *   hosoGetById(id)
 *   hosoListFiles(hosoId)
 *   hosoListRelations(hosoId)
 *   hosoListLogs(hosoId)
 *   hosoQueryExpiring(days)
 *   hosoQueryExpired()
 *   hosoQueryExpiringDocs(daysAhead)
 *   hosoCheckCompleteness(hosoId)
 *   hosoGenerateReport(hosoId)
 *
 * Every legacy name (createHoSo / createHoso / updateHoso / changeHosoStatus /
 * setHoSoStatus / closeHoso / softDeleteHoso / addHosoFile / attachHoSoFile /
 * addHosoRelation / createHoSoRelation / removeHosoFile / removeHosoRelation /
 * getHosoById / getHosoFiles / getHosoRelations / getHosoLogs / getExpiringHoso /
 * getExpiredHoso / checkHoSoCompleteness / getExpiringDocs / generateHoSoReport)
 * is kept as a thin @deprecated wrapper for Phase A safety.
 */

// ---------------------------------------------------------------------------
// Stamps + logging
// ---------------------------------------------------------------------------

function hosoStampCreate() {
  return { CREATED_AT: cbvNow(), CREATED_BY: cbvUser(), UPDATED_AT: cbvNow(), UPDATED_BY: cbvUser() };
}

function hosoStampUpdate() {
  return { UPDATED_AT: cbvNow(), UPDATED_BY: cbvUser() };
}

/**
 * Resolve caller's USER.ID; returns '' when unknown or invalid. Never throws.
 * Used by hosoAppendLogEntry so a bad actor never blocks a mutation's log.
 */
function hosoResolveActorIdSafe_() {
  try {
    var id = typeof hosoResolveActorId === 'function' ? hosoResolveActorId() : '';
    if (!id) return '';
    if (typeof hosoValidateOptionalRefUser === 'function') {
      hosoValidateOptionalRefUser(id);
    }
    return id;
  } catch (e) {
    return '';
  }
}

function hosoAppendLogEntry(hosoId, actionType, extra) {
  extra = extra || {};
  var rec = {
    ID: cbvMakeId('HUL'),
    HO_SO_ID: hosoId,
    ACTION_TYPE: actionType,
    OLD_STATUS: extra.OLD_STATUS != null ? extra.OLD_STATUS : '',
    NEW_STATUS: extra.NEW_STATUS != null ? extra.NEW_STATUS : '',
    FIELD_CHANGED: extra.FIELD_CHANGED || '',
    OLD_VALUE: extra.OLD_VALUE != null ? String(extra.OLD_VALUE) : '',
    NEW_VALUE: extra.NEW_VALUE != null ? String(extra.NEW_VALUE) : '',
    NOTE: extra.NOTE || '',
    ACTOR_ID: hosoResolveActorIdSafe_(),
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser(),
    IS_DELETED: false
  };
  hosoRepoAppendLog(rec);
}

// ---------------------------------------------------------------------------
// CANONICAL PUBLIC API
// ---------------------------------------------------------------------------

/**
 * hosoCreate — create a HO_SO_MASTER row.
 * Canonical entrypoint; legacy createHoSo / createHoso are wrappers.
 * @param {Object} data
 * @returns {Object} cbvResponse
 */
function hosoCreate(data) {
  data = data || {};
  hosoValidateTypeMasterId(data.HO_SO_TYPE_ID, 'HO_SO_TYPE_ID');
  ensureRequired(data.TITLE || data.DISPLAY_NAME, 'TITLE or DISPLAY_NAME');

  if (typeof hosoValidateHtxIdForHoSoType === 'function') {
    hosoValidateHtxIdForHoSoType(data.HO_SO_TYPE_ID, data.HTX_ID);
  }

  if (data.DON_VI_ID) hosoValidateOptionalRefDonVi(data.DON_VI_ID);
  hosoValidateOptionalRefUser(data.OWNER_ID);
  hosoValidateOptionalRefUser(data.MANAGER_USER_ID);

  if (data.HTX_ID != null && String(data.HTX_ID).trim() !== '') {
    var htxRow = hosoRepoFindMasterById(data.HTX_ID);
    cbvAssert(htxRow, 'HTX_ID invalid (HO_SO_MASTER not found)');
    cbvAssert(
      typeof hosoMasterRowIsHtx === 'function' && hosoMasterRowIsHtx(htxRow),
      'HTX_ID must reference HTX (HO_SO_TYPE_ID → MASTER_CODE.CODE=HTX)'
    );
  }

  var st = data.STATUS != null && String(data.STATUS).trim() !== '' ? String(data.STATUS).trim() : 'NEW';
  hosoAssertEnum('HO_SO_STATUS', st, 'STATUS');

  var pr = data.PRIORITY != null && String(data.PRIORITY).trim() !== '' ? String(data.PRIORITY).trim() : 'TRUNG_BINH';
  hosoAssertEnum('PRIORITY', pr, 'PRIORITY');
  if (data.RELATED_ENTITY_TYPE != null && String(data.RELATED_ENTITY_TYPE).trim() !== '') {
    if (typeof assertValidRelatedEntityType === 'function') assertValidRelatedEntityType(data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
    else hosoAssertEnum('RELATED_ENTITY_TYPE', data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
  }
  if (data.ID_TYPE != null && String(data.ID_TYPE).trim() !== '') hosoAssertEnum('ID_TYPE', data.ID_TYPE, 'ID_TYPE');
  if (data.SOURCE_CHANNEL != null && String(data.SOURCE_CHANNEL).trim() !== '') {
    hosoAssertEnum('SOURCE_CHANNEL', data.SOURCE_CHANNEL, 'SOURCE_CHANNEL');
  }

  hosoValidateDateOrder(data.START_DATE, data.END_DATE);

  var code = typeof hosoRepoAllocateHoSoCode === 'function'
    ? hosoRepoAllocateHoSoCode(data.HO_SO_TYPE_ID, 80)
    : (typeof hosoRepoNextHoSoCode === 'function' ? hosoRepoNextHoSoCode(data.HO_SO_TYPE_ID) : 'HS-GEN-000001');

  var codeLegacy = data.CODE != null ? String(data.CODE) : '';
  var nameLegacy = data.NAME != null && String(data.NAME).trim() !== '' ? String(data.NAME).trim() : String(data.TITLE || data.DISPLAY_NAME || '');

  var stamp = hosoStampCreate();
  var id = cbvMakeId('HS');
  var record = {
    ID: id,
    CODE: codeLegacy,
    NAME: nameLegacy,
    HO_SO_CODE: code,
    TITLE: data.TITLE || '',
    DISPLAY_NAME: data.DISPLAY_NAME || data.TITLE || '',
    HO_SO_TYPE_ID: data.HO_SO_TYPE_ID,
    STATUS: st,
    DON_VI_ID: data.DON_VI_ID || '',
    OWNER_ID: data.OWNER_ID || '',
    HTX_ID: data.HTX_ID || '',
    MANAGER_USER_ID: data.MANAGER_USER_ID || '',
    RELATED_ENTITY_TYPE: data.RELATED_ENTITY_TYPE || 'NONE',
    RELATED_ENTITY_ID: data.RELATED_ENTITY_ID || '',
    FULL_NAME: data.FULL_NAME || '',
    PHONE: typeof hosoNormalizePhone === 'function' ? hosoNormalizePhone(data.PHONE) : (data.PHONE || ''),
    EMAIL: typeof hosoNormalizeEmail === 'function' ? hosoNormalizeEmail(data.EMAIL) : (data.EMAIL || ''),
    ID_TYPE: data.ID_TYPE || '',
    ID_NO: typeof hosoNormalizeIdNo === 'function' ? hosoNormalizeIdNo(data.ID_NO) : (data.ID_NO || ''),
    DOB: data.DOB || '',
    ADDRESS: data.ADDRESS || '',
    START_DATE: data.START_DATE || '',
    END_DATE: data.END_DATE || '',
    PRIORITY: pr,
    SOURCE_CHANNEL: data.SOURCE_CHANNEL != null ? String(data.SOURCE_CHANNEL) : '',
    SUMMARY: data.SUMMARY || '',
    NOTE: data.NOTE || '',
    TAGS_TEXT: data.TAGS_TEXT || '',
    IS_STARRED: false,
    IS_PINNED: false,
    PENDING_ACTION: '',
    IS_DELETED: false
  };
  Object.assign(record, stamp);

  if (typeof assertValidRelatedEntityType === 'function') assertValidRelatedEntityType(record.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
  else hosoAssertEnum('RELATED_ENTITY_TYPE', record.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');

  hosoRepoAppendMaster(record);
  hosoAppendLogEntry(id, 'CREATE', { NOTE: 'HO_SO created', NEW_VALUE: record.HO_SO_CODE });
  hosoEmitCreated_(record);

  return cbvResponse(true, 'HOSO_CREATED', 'Hồ sơ đã tạo', record, []);
}

/**
 * hosoUpdate — patch an existing HO_SO (non-status fields only).
 * Canonical entrypoint; legacy updateHoso is a wrapper.
 * @param {string} id
 * @param {Object} patch
 */
function hosoUpdate(id, patch) {
  patch = patch || {};
  if (patch.STATUS !== undefined) {
    throw new Error('STATUS không thể patch trực tiếp. Dùng hosoSetStatus() để đổi trạng thái.');
  }
  if (patch.HO_SO_CODE != null) throw new Error('HO_SO_CODE is system-assigned');
  if (patch.ID != null) throw new Error('ID cannot be updated');

  var current = hosoRepoFindMasterById(id);
  cbvAssert(current, 'HO_SO not found');

  if (patch.HO_SO_TYPE_ID != null) hosoValidateTypeMasterId(patch.HO_SO_TYPE_ID, 'HO_SO_TYPE_ID');
  if (patch.DON_VI_ID !== undefined) hosoValidateOptionalRefDonVi(patch.DON_VI_ID);
  if (patch.OWNER_ID !== undefined) hosoValidateOptionalRefUser(patch.OWNER_ID);
  if (patch.MANAGER_USER_ID !== undefined) hosoValidateOptionalRefUser(patch.MANAGER_USER_ID);

  var effTypeId = patch.HO_SO_TYPE_ID !== undefined && patch.HO_SO_TYPE_ID != null ? patch.HO_SO_TYPE_ID : current.HO_SO_TYPE_ID;
  var effHtxId = patch.HTX_ID !== undefined ? patch.HTX_ID : current.HTX_ID;
  if (patch.HO_SO_TYPE_ID !== undefined || patch.HTX_ID !== undefined) {
    if (typeof hosoValidateHtxIdForHoSoType === 'function') {
      hosoValidateHtxIdForHoSoType(effTypeId, effHtxId);
    }
  }
  if (patch.HTX_ID !== undefined && patch.HTX_ID != null && String(patch.HTX_ID).trim() !== '') {
    var pHtx = hosoRepoFindMasterById(patch.HTX_ID);
    cbvAssert(pHtx, 'HTX_ID invalid (HO_SO_MASTER not found)');
    cbvAssert(
      typeof hosoMasterRowIsHtx === 'function' && hosoMasterRowIsHtx(pHtx),
      'HTX_ID must reference HTX (HO_SO_TYPE_ID → MASTER_CODE.CODE=HTX)'
    );
  }

  hosoAssertEnum('PRIORITY', patch.PRIORITY, 'PRIORITY');
  if (patch.RELATED_ENTITY_TYPE !== undefined) {
    if (typeof assertValidRelatedEntityType === 'function') assertValidRelatedEntityType(patch.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
    else hosoAssertEnum('RELATED_ENTITY_TYPE', patch.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
  }
  hosoAssertEnum('ID_TYPE', patch.ID_TYPE, 'ID_TYPE');
  hosoAssertEnum('SOURCE_CHANNEL', patch.SOURCE_CHANNEL, 'SOURCE_CHANNEL');

  var nextStart = patch.START_DATE !== undefined ? patch.START_DATE : current.START_DATE;
  var nextEnd = patch.END_DATE !== undefined ? patch.END_DATE : current.END_DATE;
  hosoValidateDateOrder(nextStart, nextEnd);

  var changed = [];
  (typeof HOSO_LOGGABLE_FIELDS !== 'undefined' ? HOSO_LOGGABLE_FIELDS : []).forEach(function(f) {
    if (patch[f] !== undefined && String(patch[f]) !== String(current[f])) {
      changed.push({ f: f, o: current[f], n: patch[f] });
    }
  });

  var next = cbvClone(current);
  Object.keys(patch).forEach(function(k) { next[k] = patch[k]; });
  if (patch.PHONE !== undefined) next.PHONE = hosoNormalizePhone(patch.PHONE);
  if (patch.EMAIL !== undefined) next.EMAIL = hosoNormalizeEmail(patch.EMAIL);
  if (patch.ID_NO !== undefined) next.ID_NO = hosoNormalizeIdNo(patch.ID_NO);
  Object.assign(next, hosoStampUpdate());

  hosoRepoUpdateMaster(current._rowNumber, next);

  if (changed.length) {
    var beforeObj = changed.reduce(function(a, x) { a[x.f] = x.o; return a; }, {});
    var afterObj = changed.reduce(function(a, x) { a[x.f] = x.n; return a; }, {});
    hosoAppendLogEntry(id, 'UPDATE_INFO', {
      FIELD_CHANGED: changed.map(function(x) { return x.f; }).join(','),
      OLD_VALUE: JSON.stringify(beforeObj),
      NEW_VALUE: JSON.stringify(afterObj)
    });
    hosoEmitUpdated_(id, beforeObj, afterObj, changed.map(function(x) { return x.f; }));
  }

  return cbvResponse(true, 'HOSO_UPDATED', 'Đã cập nhật', next, []);
}

/**
 * hosoSetStatus — canonical status transition. Merges changeHosoStatus / setHoSoStatus / closeHoso.
 * Emits HO_SO_STATUS_CHANGED; additionally emits HO_SO_CLOSED when newStatus==='CLOSED'.
 * @param {string} id
 * @param {string} newStatus
 * @param {string} [note]
 * @returns {Object} cbvResponse
 */
function hosoSetStatus(id, newStatus, note) {
  var current = hosoRepoFindMasterById(id);
  cbvAssert(current, 'HO_SO not found');
  var currentStatus = String(current.STATUS || '');
  var ns = String(newStatus || '').trim();
  if (currentStatus === ns) {
    return cbvResponse(true, 'HO_SO_STATUS_UNCHANGED', 'Trạng thái không thay đổi', current, []);
  }
  hosoAssertEnum('HO_SO_STATUS', ns, 'STATUS');
  hosoValidateStatusTransition(currentStatus, ns);

  var next = cbvClone(current);
  next.STATUS = ns;
  Object.assign(next, hosoStampUpdate());
  hosoRepoUpdateMaster(current._rowNumber, next);

  hosoAppendLogEntry(id, 'CHANGE_STATUS', {
    OLD_STATUS: currentStatus,
    NEW_STATUS: ns,
    NOTE: note || ''
  });

  hosoEmitStatusChanged_(id, currentStatus, ns, note);
  if (ns === 'CLOSED') hosoEmitClosed_(id, currentStatus, note);

  var code = ns === 'CLOSED' ? 'HOSO_CLOSED' : 'HOSO_STATUS_CHANGED';
  var msg = ns === 'CLOSED' ? 'Đã đóng hồ sơ' : 'Đã đổi trạng thái';
  return cbvResponse(true, code, msg, next, []);
}

/**
 * hosoSoftDelete — mark HO_SO as deleted (IS_DELETED=true). Does NOT cascade in Phase A
 * (future RULE_DEF will handle file/relation cascade).
 * @param {string} id
 * @param {string} [note]
 */
function hosoSoftDelete(id, note) {
  var current = hosoRepoFindMasterById(id);
  cbvAssert(current, 'HO_SO not found');
  if (String(current.IS_DELETED) === 'TRUE' || current.IS_DELETED === true) {
    return cbvResponse(true, 'HOSO_SOFT_DELETED', 'Đã đánh dấu xóa', current, []);
  }
  var prevStatus = String(current.STATUS || '');
  var next = cbvClone(current);
  next.IS_DELETED = true;
  Object.assign(next, hosoStampUpdate());
  hosoRepoUpdateMaster(current._rowNumber, next);
  hosoAppendLogEntry(id, 'ARCHIVE', { NOTE: note || 'Soft delete (IS_DELETED)' });
  hosoEmitSoftDeleted_(id, prevStatus);
  return cbvResponse(true, 'HOSO_SOFT_DELETED', 'Đã đánh dấu xóa', next, []);
}

/**
 * hosoFileAdd — canonical file attach. Merges addHosoFile + attachHoSoFile.
 * Contract:
 *   - HO_SO_ID required
 *   - Must have FILE_NAME OR (FILE_URL or DRIVE_FILE_ID) — loose to support both UIs
 *   - DOC_TYPE optional; if given, enum-validated
 *   - FILE_GROUP effective value = FILE_GROUP || FILE_TYPE || DOC_TYPE || 'KHAC'; enum-validated
 * @param {Object} data
 * @returns {Object} cbvResponse
 */
function hosoFileAdd(data) {
  data = data || {};
  ensureRequired(data.HO_SO_ID, 'HO_SO_ID');
  cbvAssert(hosoRepoFindMasterById(data.HO_SO_ID), 'HO_SO not found');

  var fileName = data.FILE_NAME != null ? String(data.FILE_NAME) : '';
  if (!fileName && data.TITLE) fileName = String(data.TITLE);
  var url = data.FILE_URL != null ? String(data.FILE_URL).trim() : '';
  var driveId = data.DRIVE_FILE_ID != null ? String(data.DRIVE_FILE_ID).trim() : '';
  if (!fileName && !url && !driveId) {
    throw new Error('hosoFileAdd: cần ít nhất FILE_NAME hoặc FILE_URL hoặc DRIVE_FILE_ID');
  }

  var docType = data.DOC_TYPE != null && String(data.DOC_TYPE).trim() !== '' ? String(data.DOC_TYPE).trim() : '';
  if (docType && typeof assertValidEnumValue === 'function') {
    assertValidEnumValue('DOC_TYPE', docType, 'DOC_TYPE');
  }

  var fgRaw = '';
  if (data.FILE_GROUP != null && String(data.FILE_GROUP).trim() !== '') fgRaw = String(data.FILE_GROUP).trim();
  else if (data.FILE_TYPE != null && String(data.FILE_TYPE).trim() !== '') fgRaw = String(data.FILE_TYPE).trim();
  else if (docType) fgRaw = docType;
  else fgRaw = 'KHAC';
  hosoAssertEnum('FILE_GROUP', fgRaw, 'FILE_GROUP');

  var stamp = hosoStampCreate();
  var rec = {
    ID: cbvMakeId('HFILE'),
    HO_SO_ID: String(data.HO_SO_ID).trim(),
    LINKED_RELATION_ID: data.LINKED_RELATION_ID != null && String(data.LINKED_RELATION_ID).trim() !== '' ? String(data.LINKED_RELATION_ID).trim() : '',
    FILE_GROUP: fgRaw,
    FILE_NAME: fileName,
    FILE_URL: url,
    DRIVE_FILE_ID: driveId,
    STATUS: 'ACTIVE',
    NOTE: data.NOTE != null ? String(data.NOTE) : (data.TITLE ? String(data.TITLE) : ''),
    DOC_TYPE: docType,
    DOC_NO: data.DOC_NO != null ? String(data.DOC_NO) : '',
    ISSUED_DATE: data.ISSUED_DATE != null ? data.ISSUED_DATE : '',
    EXPIRY_DATE: data.EXPIRY_DATE != null ? data.EXPIRY_DATE : (data.EXPIRED_DATE != null ? data.EXPIRED_DATE : '')
  };
  rec.CREATED_AT = stamp.CREATED_AT;
  rec.CREATED_BY = stamp.CREATED_BY;
  hosoRepoAppendFile(rec);

  hosoAppendLogEntry(rec.HO_SO_ID, 'ADD_FILE', {
    NEW_VALUE: rec.FILE_NAME || '',
    NOTE: rec.DOC_TYPE || rec.FILE_GROUP
  });
  hosoEmitFileAdded_(rec.HO_SO_ID, rec);

  return cbvResponse(true, 'HOSO_FILE_ADDED', 'Đã thêm file', rec, []);
}

/**
 * hosoFileRemove — soft-remove (STATUS='ARCHIVED').
 * @param {string} fileId
 * @param {string} [note]
 */
function hosoFileRemove(fileId, note) {
  var row = hosoRepoFindFileById(fileId);
  cbvAssert(row, 'HO_SO_FILE not found');
  cbvAssert(hosoRepoFindMasterById(row.HO_SO_ID), 'HO_SO not found');
  var next = cbvClone(row);
  next.STATUS = 'ARCHIVED';
  hosoRepoUpdateFile(row._rowNumber, next);
  hosoAppendLogEntry(row.HO_SO_ID, 'REMOVE_FILE', {
    NEW_VALUE: String(row.FILE_NAME || fileId),
    NOTE: note || ''
  });
  hosoEmitFileRemoved_(row.HO_SO_ID, row);
  return cbvResponse(true, 'HOSO_FILE_REMOVED', 'Đã gỡ file (soft)', next, []);
}

/**
 * hosoRelationAdd — canonical relation add. Merges addHosoRelation + createHoSoRelation.
 * Accepts either:
 *   - { FROM_HO_SO_ID, TO_HO_SO_ID, RELATION_TYPE, ... }         (HO_SO ↔ HO_SO)
 *   - { FROM_HO_SO_ID, RELATED_TABLE, RELATED_RECORD_ID, RELATION_TYPE, ... }  (polymorphic)
 * @param {Object} data
 * @returns {Object} cbvResponse
 */
function hosoRelationAdd(data) {
  data = data || {};
  ensureRequired(data.FROM_HO_SO_ID, 'FROM_HO_SO_ID');
  ensureRequired(data.RELATION_TYPE, 'RELATION_TYPE');

  var fromId = String(data.FROM_HO_SO_ID).trim();
  cbvAssert(hosoRepoFindMasterById(fromId), 'FROM_HO_SO_ID not found');

  var toHoSo = data.TO_HO_SO_ID != null && String(data.TO_HO_SO_ID).trim() !== '' ? String(data.TO_HO_SO_ID).trim() : '';
  var relTable = data.RELATED_TABLE != null ? String(data.RELATED_TABLE).trim() : '';
  var relId = data.RELATED_RECORD_ID != null ? String(data.RELATED_RECORD_ID).trim() : '';

  if (!toHoSo && (!relTable || !relId)) {
    throw new Error('hosoRelationAdd: cần TO_HO_SO_ID hoặc (RELATED_TABLE + RELATED_RECORD_ID)');
  }

  if (toHoSo) {
    cbvAssert(hosoRepoFindMasterById(toHoSo), 'TO_HO_SO_ID not found');
    if (!relTable) relTable = 'HO_SO';
    if (!relId) relId = toHoSo;
  } else if (relTable === 'HO_SO' || relTable === 'HO_SO_MASTER') {
    toHoSo = relId;
    cbvAssert(hosoRepoFindMasterById(toHoSo), 'TO_HO_SO_ID (from RELATED_RECORD_ID) not found');
  }

  if (typeof hosoValidateRelationTarget === 'function' && relTable && relId) {
    hosoValidateRelationTarget(relTable, relId);
  }

  var rt = String(data.RELATION_TYPE).trim();
  hosoAssertEnum('HO_SO_RELATION_TYPE', rt, 'RELATION_TYPE');

  var st = data.STATUS != null && String(data.STATUS).trim() !== '' ? String(data.STATUS).trim() : 'ACTIVE';

  var stamp = hosoStampCreate();
  var rec = {
    ID: cbvMakeId('HREL'),
    FROM_HO_SO_ID: fromId,
    TO_HO_SO_ID: toHoSo,
    RELATION_TYPE: rt,
    STATUS: st,
    RELATED_TABLE: relTable,
    RELATED_RECORD_ID: relId,
    NOTE: data.NOTE || '',
    START_DATE: data.START_DATE || '',
    END_DATE: data.END_DATE || '',
    IS_DELETED: false
  };
  Object.assign(rec, stamp);
  hosoRepoAppendRelation(rec);

  hosoAppendLogEntry(fromId, 'LINK_ENTITY', {
    NEW_VALUE: (toHoSo ? fromId + '→' + toHoSo : rec.RELATED_TABLE + ':' + rec.RELATED_RECORD_ID),
    NOTE: rt
  });
  hosoEmitRelationAdded_(fromId, rec);

  return cbvResponse(true, 'HOSO_RELATION_ADDED', 'Đã liên kết', rec, []);
}

/**
 * hosoRelationRemove — soft-remove (IS_DELETED=true).
 * @param {string} relationId
 * @param {string} [note]
 */
function hosoRelationRemove(relationId, note) {
  var row = hosoRepoFindRelationById(relationId);
  cbvAssert(row, 'HO_SO_RELATION not found');
  var logCtx = String(row.FROM_HO_SO_ID || row.TO_HO_SO_ID || '').trim();
  cbvAssert(logCtx && hosoRepoFindMasterById(logCtx), 'HO_SO not found');
  var next = cbvClone(row);
  next.IS_DELETED = true;
  Object.assign(next, hosoStampUpdate());
  hosoRepoUpdateRelation(row._rowNumber, next);
  hosoAppendLogEntry(logCtx, 'UNLINK_ENTITY', {
    OLD_VALUE: String(row.RELATED_TABLE || '') + ':' + String(row.RELATED_RECORD_ID || ''),
    NOTE: note || ''
  });
  hosoEmitRelationRemoved_(logCtx, row);
  return cbvResponse(true, 'HOSO_RELATION_REMOVED', 'Đã gỡ liên kết (soft)', next, []);
}

// ---------------------------------------------------------------------------
// QUERIES
// ---------------------------------------------------------------------------

function hosoGetById(id) {
  return hosoRepoFindMasterById(id);
}

function hosoListFiles(hosoId) {
  return hosoFilterActiveRows(hosoRepoListFilesForHoso(hosoId)).filter(function(r) {
    return String(r.STATUS || '') !== 'ARCHIVED';
  });
}

function hosoListRelations(hosoId) {
  var all = hosoRepoListRelationsForHoso(hosoId);
  return hosoFilterActiveRows(all || []);
}

function hosoListLogs(hosoId) {
  return hosoRepoListLogsForHoso(hosoId).filter(function(r) { return !hosoIsRowDeleted(r); });
}

function hosoQueryExpiring(days) {
  var d = Number(days) || 30;
  var today = typeof hosoStartOfDay === 'function' ? hosoStartOfDay(cbvNow()) : cbvNow();
  var until = new Date(today.getTime() + d * 86400000);
  var rows = hosoFilterActiveRows(hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER));
  return rows.filter(function(r) {
    var end = hosoParseDate(r.END_DATE);
    if (!end) return false;
    var e = hosoStartOfDay(end);
    var st = String(r.STATUS || '');
    return e >= today && e <= until && st !== 'CLOSED' && st !== 'ARCHIVED';
  });
}

function hosoQueryExpired() {
  var today = typeof hosoStartOfDay === 'function' ? hosoStartOfDay(cbvNow()) : cbvNow();
  var masters = hosoFilterActiveRows(hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER));
  var expiredIds = {};
  masters.forEach(function(r) {
    var end = hosoParseDate(r.END_DATE);
    if (end && hosoStartOfDay(end) < today) expiredIds[r.ID] = r;
  });
  var files = hosoFilterActiveRows(hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_FILE));
  files.forEach(function(f) {
    var ex = hosoParseDate(f.EXPIRED_DATE) || hosoParseDate(f.EXPIRY_DATE);
    if (ex && hosoStartOfDay(ex) < today) {
      var m = hosoRepoFindMasterById(f.HO_SO_ID);
      if (m && !hosoIsRowDeleted(m)) expiredIds[m.ID] = m;
    }
  });
  return Object.keys(expiredIds).map(function(k) { return expiredIds[k]; });
}

/**
 * hosoCheckCompleteness — verify all required DOC_REQUIREMENT rows for the HO_SO type are covered by files.
 * @param {string} hoSoId
 * @returns {Object} cbvResponse
 */
function hosoCheckCompleteness(hoSoId) {
  var hoSo = hosoRepoFindMasterById(hoSoId);
  cbvAssert(hoSo, 'HO_SO not found: ' + hoSoId);

  var typeCode = '';
  if (hoSo.HO_SO_TYPE_ID) {
    var mcRow = hosoRepoFindMasterCodeById(hoSo.HO_SO_TYPE_ID);
    if (mcRow) typeCode = String(mcRow.CODE || '').trim();
  }

  function boolCell(v) {
    if (v === true) return true;
    if (v === false) return false;
    var s = String(v || '').trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }

  var reqRows = hosoRepoRows(CBV_CONFIG.SHEETS.DOC_REQUIREMENT).filter(function(r) {
    return String(r.HO_SO_TYPE || '').trim() === typeCode && boolCell(r.IS_ACTIVE);
  });

  var fileRows = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_FILE).filter(function(r) {
    return String(r.HO_SO_ID) === String(hoSoId) && String(r.STATUS) === 'ACTIVE';
  });

  var hasDocs = {};
  fileRows.forEach(function(f) { hasDocs[String(f.DOC_TYPE)] = true; });

  var missing = reqRows.filter(function(r) {
    return boolCell(r.IS_REQUIRED) && !hasDocs[String(r.DOC_TYPE)];
  }).map(function(r) {
    return { DOC_TYPE: r.DOC_TYPE, DESCRIPTION: r.DESCRIPTION || '' };
  });

  return cbvResponse(missing.length === 0, 'COMPLETENESS_CHECK', '', {
    missing: missing,
    have: Object.keys(hasDocs).length,
    total: reqRows.length
  }, []);
}

/**
 * hosoQueryExpiringDocs — files expiring within daysAhead (default 60).
 * @param {number} [daysAhead]
 * @returns {Object} cbvResponse
 */
function hosoQueryExpiringDocs(daysAhead) {
  daysAhead = (typeof daysAhead === 'number') ? daysAhead : 60;
  var now = new Date();
  var cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  var rows = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_FILE).filter(function(f) {
    if (!f.EXPIRY_DATE || String(f.STATUS) === 'ARCHIVED') return false;
    var exp = new Date(f.EXPIRY_DATE);
    return !isNaN(exp.getTime()) && exp <= cutoff;
  });

  return cbvResponse(true, 'EXPIRING_DOCS', '', { rows: rows, count: rows.length, daysAhead: daysAhead }, []);
}

/**
 * hosoGenerateReport — aggregate view (master + files + relations + completeness + expiring).
 * @param {string} hoSoId
 * @returns {Object} cbvResponse
 */
function hosoGenerateReport(hoSoId) {
  var hoSo = hosoRepoFindMasterById(hoSoId);
  cbvAssert(hoSo, 'HO_SO not found: ' + hoSoId);

  var files = hosoRepoListFilesForHoso(hoSoId).filter(function(f) {
    return String(f.STATUS) !== 'ARCHIVED';
  });

  var relations = hosoRepoListRelationsForHoso(hoSoId).filter(function(r) {
    return !(typeof hosoIsRowDeleted === 'function' && hosoIsRowDeleted(r));
  });

  var completeness = hosoCheckCompleteness(hoSoId);
  var expiring = hosoQueryExpiringDocs(60);
  var expRows = expiring.data && expiring.data.rows ? expiring.data.rows : [];
  var expiringForThis = expRows.filter(function(f) {
    return String(f.HO_SO_ID) === String(hoSoId);
  });

  var miss = completeness.data && completeness.data.missing ? completeness.data.missing : [];
  var have = completeness.data && completeness.data.have != null ? completeness.data.have : 0;
  var total = completeness.data && completeness.data.total != null ? completeness.data.total : 0;

  return cbvResponse(true, 'HO_SO_REPORT', '', {
    hoSo: hoSo,
    files: files,
    relations: relations,
    missing: miss,
    expiring: expiringForThis,
    completeness: {
      ok: completeness.ok,
      have: have,
      total: total,
      missing_count: miss.length
    },
    generatedAt: cbvNow()
  }, []);
}

// ---------------------------------------------------------------------------
// Phase C (2026-04-21): deprecated wrappers removed. All callers MUST use the
// canonical hoso* surface declared above. Enforcement: auditHosoCanonicalOnly_()
// and CI grep gate documented in FUNCTION_WRAPPER_MAP.md.
// ---------------------------------------------------------------------------
