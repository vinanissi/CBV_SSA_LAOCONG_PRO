/**
 * HO_SO Service — business logic; no direct sheet calls (uses hosoRepo*).
 * Public API: createHoso, updateHoso, changeHosoStatus, addHosoFile, addHosoRelation, softDeleteHoso, queries.
 */

function hosoStampCreate() {
  return { CREATED_AT: cbvNow(), CREATED_BY: cbvUser(), UPDATED_AT: cbvNow(), UPDATED_BY: cbvUser() };
}

function hosoStampUpdate() {
  return { UPDATED_AT: cbvNow(), UPDATED_BY: cbvUser() };
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
    ACTOR_ID: typeof hosoResolveActorId === 'function' ? hosoResolveActorId() : '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser(),
    IS_DELETED: false
  };
  if (rec.ACTOR_ID) hosoValidateOptionalRefUser(rec.ACTOR_ID);
  hosoRepoAppend(CBV_CONFIG.SHEETS.HO_SO_UPDATE_LOG, rec);
}

/**
 * @param {Object} data
 * @returns {Object} cbvResponse
 */
function createHoso(data) {
  data = data || {};
  hosoValidateTypeMasterId(data.HO_SO_TYPE_ID, 'HO_SO_TYPE_ID');
  ensureRequired(data.TITLE || data.DISPLAY_NAME, 'TITLE or DISPLAY_NAME');

  hosoValidateOptionalRefDonVi(data.DON_VI_ID);
  hosoValidateOptionalRefUser(data.OWNER_ID);
  hosoValidateOptionalRefUser(data.MANAGER_USER_ID);

  var st = data.STATUS != null && String(data.STATUS).trim() !== '' ? String(data.STATUS).trim() : 'NEW';
  hosoAssertEnum('HO_SO_STATUS', st, 'STATUS');

  hosoAssertEnum('PRIORITY', data.PRIORITY, 'PRIORITY');
  hosoAssertEnum('RELATED_ENTITY_TYPE', data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
  hosoAssertEnum('ID_TYPE', data.ID_TYPE, 'ID_TYPE');
  hosoAssertEnum('SOURCE_CHANNEL', data.SOURCE_CHANNEL, 'SOURCE_CHANNEL');

  hosoValidateDateOrder(data.START_DATE, data.END_DATE);

  var code = typeof hosoRepoAllocateHoSoCode === 'function'
    ? hosoRepoAllocateHoSoCode(data.HO_SO_TYPE_ID, 80)
    : (typeof hosoRepoNextHoSoCode === 'function' ? hosoRepoNextHoSoCode(data.HO_SO_TYPE_ID) : 'HS-GEN-000001');

  var stamp = hosoStampCreate();
  var id = cbvMakeId('HS');
  var record = {
    ID: id,
    HO_SO_CODE: code,
    TITLE: data.TITLE || '',
    DISPLAY_NAME: data.DISPLAY_NAME || data.TITLE || '',
    HO_SO_TYPE_ID: data.HO_SO_TYPE_ID,
    STATUS: st,
    DON_VI_ID: data.DON_VI_ID || '',
    OWNER_ID: data.OWNER_ID || '',
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
    PRIORITY: data.PRIORITY || 'MEDIUM',
    SOURCE_CHANNEL: data.SOURCE_CHANNEL || 'DIRECT',
    SUMMARY: data.SUMMARY || '',
    NOTE: data.NOTE || '',
    TAGS_TEXT: data.TAGS_TEXT || '',
    IS_DELETED: false
  };
  Object.assign(record, stamp);

  hosoAssertEnum('RELATED_ENTITY_TYPE', record.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');

  hosoRepoAppend(CBV_CONFIG.SHEETS.HO_SO_MASTER, record);
  hosoAppendLogEntry(id, 'CREATE', { NOTE: 'HO_SO created', NEW_VALUE: record.HO_SO_CODE });

  return cbvResponse(true, 'HOSO_CREATED', 'Hồ sơ đã tạo', record, []);
}

/**
 * @param {string} id
 * @param {Object} patch
 */
function updateHoso(id, patch) {
  patch = patch || {};
  if (patch.STATUS != null) throw new Error('STATUS must be changed via changeHosoStatus()');
  if (patch.HO_SO_CODE != null) throw new Error('HO_SO_CODE is system-assigned');
  if (patch.ID != null) throw new Error('ID cannot be updated');

  var current = hosoRepoFindMasterById(id);
  cbvAssert(current, 'HO_SO not found');

  if (patch.HO_SO_TYPE_ID != null) hosoValidateTypeMasterId(patch.HO_SO_TYPE_ID, 'HO_SO_TYPE_ID');
  if (patch.DON_VI_ID !== undefined) hosoValidateOptionalRefDonVi(patch.DON_VI_ID);
  if (patch.OWNER_ID !== undefined) hosoValidateOptionalRefUser(patch.OWNER_ID);
  if (patch.MANAGER_USER_ID !== undefined) hosoValidateOptionalRefUser(patch.MANAGER_USER_ID);

  hosoAssertEnum('PRIORITY', patch.PRIORITY, 'PRIORITY');
  hosoAssertEnum('RELATED_ENTITY_TYPE', patch.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
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

  hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_MASTER, current._rowNumber, next);

  if (changed.length) {
    hosoAppendLogEntry(id, 'UPDATE_INFO', {
      FIELD_CHANGED: changed.map(function(x) { return x.f; }).join(','),
      OLD_VALUE: JSON.stringify(changed.reduce(function(a, x) { a[x.f] = x.o; return a; }, {})),
      NEW_VALUE: JSON.stringify(changed.reduce(function(a, x) { a[x.f] = x.n; return a; }, {}))
    });
  }

  return cbvResponse(true, 'HOSO_UPDATED', 'Đã cập nhật', next, []);
}

function changeHosoStatus(id, newStatus, note) {
  var current = hosoRepoFindMasterById(id);
  cbvAssert(current, 'HO_SO not found');
  var ns = String(newStatus || '').trim();
  hosoAssertEnum('HO_SO_STATUS', ns, 'STATUS');
  hosoValidateStatusTransition(String(current.STATUS || ''), ns);

  var next = cbvClone(current);
  next.STATUS = ns;
  Object.assign(next, hosoStampUpdate());
  hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_MASTER, current._rowNumber, next);

  hosoAppendLogEntry(id, 'CHANGE_STATUS', {
    OLD_STATUS: current.STATUS,
    NEW_STATUS: ns,
    NOTE: note || ''
  });

  return cbvResponse(true, 'HOSO_STATUS_CHANGED', 'Đã đổi trạng thái', next, []);
}

function addHosoFile(data) {
  data = data || {};
  cbvAssert(hosoRepoFindMasterById(data.HO_SO_ID), 'HO_SO not found');
  ensureRequired(data.FILE_NAME || data.TITLE, 'FILE_NAME or TITLE');
  hosoAssertEnum('FILE_TYPE', data.FILE_TYPE || 'OTHER', 'FILE_TYPE');

  var stamp = hosoStampCreate();
  var rec = {
    ID: cbvMakeId('HFILE'),
    HO_SO_ID: data.HO_SO_ID,
    FILE_TYPE: data.FILE_TYPE || 'OTHER',
    TITLE: data.TITLE || data.FILE_NAME || '',
    FILE_NAME: data.FILE_NAME || '',
    FILE_URL: data.FILE_URL || '',
    DRIVE_FILE_ID: data.DRIVE_FILE_ID || '',
    MIME_TYPE: data.MIME_TYPE || '',
    FILE_SIZE: data.FILE_SIZE != null ? data.FILE_SIZE : '',
    VERSION_NO: data.VERSION_NO != null ? data.VERSION_NO : '',
    ISSUED_DATE: data.ISSUED_DATE || '',
    EXPIRED_DATE: data.EXPIRED_DATE || '',
    NOTE: data.NOTE || '',
    IS_DELETED: false
  };
  Object.assign(rec, stamp);
  hosoRepoAppend(CBV_CONFIG.SHEETS.HO_SO_FILE, rec);

  hosoAppendLogEntry(data.HO_SO_ID, 'ADD_FILE', {
    NEW_VALUE: rec.FILE_NAME || rec.TITLE,
    NOTE: rec.FILE_TYPE
  });

  return cbvResponse(true, 'HOSO_FILE_ADDED', 'Đã thêm file', rec, []);
}

function addHosoRelation(data) {
  data = data || {};
  cbvAssert(hosoRepoFindMasterById(data.HO_SO_ID), 'HO_SO not found');
  ensureRequired(data.RELATED_TABLE, 'RELATED_TABLE');
  ensureRequired(data.RELATED_RECORD_ID, 'RELATED_RECORD_ID');
  ensureRequired(data.RELATION_TYPE, 'RELATION_TYPE');
  if (typeof hosoValidateRelationTarget === 'function') {
    hosoValidateRelationTarget(data.RELATED_TABLE, data.RELATED_RECORD_ID);
  }

  var stamp = hosoStampCreate();
  var rec = {
    ID: cbvMakeId('HREL'),
    HO_SO_ID: data.HO_SO_ID,
    RELATED_TABLE: String(data.RELATED_TABLE).trim(),
    RELATED_RECORD_ID: String(data.RELATED_RECORD_ID).trim(),
    RELATION_TYPE: String(data.RELATION_TYPE).trim(),
    NOTE: data.NOTE || '',
    IS_DELETED: false
  };
  Object.assign(rec, stamp);
  hosoRepoAppend(CBV_CONFIG.SHEETS.HO_SO_RELATION, rec);

  hosoAppendLogEntry(data.HO_SO_ID, 'LINK_ENTITY', {
    NEW_VALUE: rec.RELATED_TABLE + ':' + rec.RELATED_RECORD_ID,
    NOTE: rec.RELATION_TYPE
  });

  return cbvResponse(true, 'HOSO_RELATION_ADDED', 'Đã liên kết', rec, []);
}

function removeHosoFile(fileId, note) {
  var row = typeof hosoRepoFindFileById === 'function' ? hosoRepoFindFileById(fileId) : null;
  cbvAssert(row, 'HO_SO_FILE not found');
  cbvAssert(hosoRepoFindMasterById(row.HO_SO_ID), 'HO_SO not found');
  var next = cbvClone(row);
  next.IS_DELETED = true;
  Object.assign(next, hosoStampUpdate());
  hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_FILE, row._rowNumber, next);
  hosoAppendLogEntry(row.HO_SO_ID, 'REMOVE_FILE', {
    NEW_VALUE: String(row.FILE_NAME || row.TITLE || fileId),
    NOTE: note || ''
  });
  return cbvResponse(true, 'HOSO_FILE_REMOVED', 'Đã gỡ file (soft)', next, []);
}

function removeHosoRelation(relationId, note) {
  var row = typeof hosoRepoFindRelationById === 'function' ? hosoRepoFindRelationById(relationId) : null;
  cbvAssert(row, 'HO_SO_RELATION not found');
  cbvAssert(hosoRepoFindMasterById(row.HO_SO_ID), 'HO_SO not found');
  var next = cbvClone(row);
  next.IS_DELETED = true;
  Object.assign(next, hosoStampUpdate());
  hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_RELATION, row._rowNumber, next);
  hosoAppendLogEntry(row.HO_SO_ID, 'UNLINK_ENTITY', {
    OLD_VALUE: String(row.RELATED_TABLE || '') + ':' + String(row.RELATED_RECORD_ID || ''),
    NOTE: note || ''
  });
  return cbvResponse(true, 'HOSO_RELATION_REMOVED', 'Đã gỡ liên kết (soft)', next, []);
}

/**
 * Đóng hồ sơ (STATUS=CLOSED) với log ACTION_TYPE CLOSE (khác CHANGE_STATUS).
 */
function closeHoso(id, note) {
  var current = hosoRepoFindMasterById(id);
  cbvAssert(current, 'HO_SO not found');
  var ns = 'CLOSED';
  hosoAssertEnum('HO_SO_STATUS', ns, 'STATUS');
  hosoValidateStatusTransition(String(current.STATUS || ''), ns);
  var next = cbvClone(current);
  next.STATUS = ns;
  Object.assign(next, hosoStampUpdate());
  hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_MASTER, current._rowNumber, next);
  hosoAppendLogEntry(id, 'CLOSE', {
    OLD_STATUS: current.STATUS,
    NEW_STATUS: ns,
    NOTE: note || ''
  });
  return cbvResponse(true, 'HOSO_CLOSED', 'Đã đóng hồ sơ', next, []);
}

function softDeleteHoso(id) {
  var current = hosoRepoFindMasterById(id);
  cbvAssert(current, 'HO_SO not found');
  var next = cbvClone(current);
  next.IS_DELETED = true;
  Object.assign(next, hosoStampUpdate());
  hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_MASTER, current._rowNumber, next);
  hosoAppendLogEntry(id, 'ARCHIVE', { NOTE: 'Soft delete (IS_DELETED)' });
  return cbvResponse(true, 'HOSO_SOFT_DELETED', 'Đã đánh dấu xóa', next, []);
}

function getHosoById(id) {
  return hosoRepoFindMasterById(id);
}

function getHosoFiles(hosoId) {
  return hosoFilterActiveRows(hosoRepoListFilesForHoso(hosoId));
}

function getHosoRelations(hosoId) {
  return hosoFilterActiveRows(hosoRepoListRelationsForHoso(hosoId));
}

function getHosoLogs(hosoId) {
  return hosoRepoListLogsForHoso(hosoId).filter(function(r) { return !hosoIsRowDeleted(r); });
}

function getExpiringHoso(days) {
  var d = Number(days) || 30;
  var today = typeof hosoStartOfDay === 'function' ? hosoStartOfDay(cbvNow()) : cbvNow();
  var until = new Date(today.getTime() + d * 86400000);
  var rows = hosoFilterActiveRows(hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER));
  return rows.filter(function(r) {
    var end = hosoParseDate(r.END_DATE);
    if (!end) return false;
    var e = hosoStartOfDay(end);
    return e >= today && e <= until && String(r.STATUS || '') !== 'CLOSED' && String(r.STATUS || '') !== 'ARCHIVED';
  });
}

function getExpiredHoso() {
  var today = typeof hosoStartOfDay === 'function' ? hosoStartOfDay(cbvNow()) : cbvNow();
  var masters = hosoFilterActiveRows(hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER));
  var expiredIds = {};
  masters.forEach(function(r) {
    var end = hosoParseDate(r.END_DATE);
    if (end && hosoStartOfDay(end) < today) expiredIds[r.ID] = r;
  });
  var files = hosoFilterActiveRows(hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_FILE));
  files.forEach(function(f) {
    var ex = hosoParseDate(f.EXPIRED_DATE);
    if (ex && hosoStartOfDay(ex) < today) {
      var m = hosoRepoFindMasterById(f.HO_SO_ID);
      if (m && !hosoIsRowDeleted(m)) expiredIds[m.ID] = m;
    }
  });
  return Object.keys(expiredIds).map(function(k) { return expiredIds[k]; });
}

/** @deprecated Use createHoso with PRO schema */
function createHoSo(data) {
  throw new Error('createHoSo (legacy) removed. Use createHoso({ HO_SO_TYPE_ID, TITLE, ... }). See 02_MODULES/HO_SO/HO_SO_MODULE_PRO.md');
}

function setHoSoStatus(id, newStatus) {
  return changeHosoStatus(id, newStatus, '');
}

function attachHoSoFile(hoSoId, fileMeta) {
  fileMeta = fileMeta || {};
  return addHosoFile({
    HO_SO_ID: hoSoId,
    FILE_TYPE: fileMeta.FILE_TYPE || fileMeta.FILE_GROUP || 'OTHER',
    TITLE: fileMeta.TITLE || fileMeta.FILE_NAME,
    FILE_NAME: fileMeta.FILE_NAME || '',
    FILE_URL: fileMeta.FILE_URL || '',
    DRIVE_FILE_ID: fileMeta.DRIVE_FILE_ID || '',
    NOTE: fileMeta.NOTE || ''
  });
}
