/**
 * HO_SO Service — business logic; no direct sheet calls (uses hosoRepo*).
 * Public API: createHoSo/createHoso, updateHoso, changeHosoStatus, addHosoFile, attachHoSoFile, addHosoRelation, createHoSoRelation, softDeleteHoso, queries.
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
 * Tạo HO_SO_MASTER (canonical contract name: createHoSo).
 * @param {Object} data
 * @returns {Object} cbvResponse
 */
function createHoSo(data) {
  data = data || {};
  hosoValidateTypeMasterId(data.HO_SO_TYPE_ID, 'HO_SO_TYPE_ID');
  ensureRequired(data.TITLE || data.DISPLAY_NAME, 'TITLE or DISPLAY_NAME');

  if (data.DON_VI_ID) hosoValidateOptionalRefDonVi(data.DON_VI_ID);
  hosoValidateOptionalRefUser(data.OWNER_ID);
  hosoValidateOptionalRefUser(data.MANAGER_USER_ID);
  if (data.HTX_ID) cbvAssert(hosoRepoFindMasterById(data.HTX_ID), 'HTX_ID invalid (HO_SO_MASTER not found)');

  var st = data.STATUS != null && String(data.STATUS).trim() !== '' ? String(data.STATUS).trim() : 'NEW';
  hosoAssertEnum('HO_SO_STATUS', st, 'STATUS');

  var mcRow = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.MASTER_CODE, data.HO_SO_TYPE_ID) : null;
  var hoSoTypeLegacy = data.HO_SO_TYPE != null && String(data.HO_SO_TYPE).trim() !== '' ? String(data.HO_SO_TYPE).trim() : (mcRow ? String(mcRow.CODE || '').trim() : '');
  if (hoSoTypeLegacy) hosoAssertEnum('HO_SO_TYPE', hoSoTypeLegacy, 'HO_SO_TYPE');

  var pr = data.PRIORITY != null && String(data.PRIORITY).trim() !== '' ? String(data.PRIORITY).trim() : 'TRUNG_BINH';
  hosoAssertEnum('PRIORITY', pr, 'PRIORITY');
  if (data.RELATED_ENTITY_TYPE != null && String(data.RELATED_ENTITY_TYPE).trim() !== '') {
    hosoAssertEnum('RELATED_ENTITY_TYPE', data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
  }
  if (data.ID_TYPE != null && String(data.ID_TYPE).trim() !== '') hosoAssertEnum('ID_TYPE', data.ID_TYPE, 'ID_TYPE');
  if (data.SOURCE_CHANNEL != null && String(data.SOURCE_CHANNEL).trim() !== '') {
    hosoAssertEnum('SOURCE_CHANNEL', data.SOURCE_CHANNEL, 'SOURCE_CHANNEL');
  }

  hosoValidateDateOrder(data.START_DATE, data.END_DATE);

  var tagsVal = '';
  if (data.TAGS != null && String(data.TAGS).trim() !== '') tagsVal = String(data.TAGS).trim();

  var code = typeof hosoRepoAllocateHoSoCode === 'function'
    ? hosoRepoAllocateHoSoCode(data.HO_SO_TYPE_ID, 80)
    : (typeof hosoRepoNextHoSoCode === 'function' ? hosoRepoNextHoSoCode(data.HO_SO_TYPE_ID) : 'HS-GEN-000001');

  var codeLegacy = data.CODE != null ? String(data.CODE) : '';
  var nameLegacy = data.NAME != null && String(data.NAME).trim() !== '' ? String(data.NAME).trim() : String(data.TITLE || data.DISPLAY_NAME || '');

  var stamp = hosoStampCreate();
  var id = cbvMakeId('HS');
  var record = {
    ID: id,
    HO_SO_TYPE: hoSoTypeLegacy,
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
    TAGS: tagsVal,
    IS_STARRED: false,
    IS_PINNED: false,
    IS_DELETED: false
  };
  Object.assign(record, stamp);

  hosoAssertEnum('RELATED_ENTITY_TYPE', record.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');

  hosoRepoAppend(CBV_CONFIG.SHEETS.HO_SO_MASTER, record);
  hosoAppendLogEntry(id, 'CREATE', { NOTE: 'HO_SO created', NEW_VALUE: record.HO_SO_CODE });

  return cbvResponse(true, 'HOSO_CREATED', 'Hồ sơ đã tạo', record, []);
}

/** @param {Object} data @returns {Object} cbvResponse */
function createHoso(data) {
  return createHoSo(data);
}

/**
 * @param {string} id
 * @param {Object} patch
 */
function updateHoso(id, patch) {
  patch = patch || {};
  if (patch && patch.STATUS !== undefined) {
    throw new Error('STATUS không thể patch trực tiếp. Dùng setHoSoStatus() để đổi trạng thái.');
  }
  if (patch.HO_SO_CODE != null) throw new Error('HO_SO_CODE is system-assigned');
  if (patch.ID != null) throw new Error('ID cannot be updated');

  var current = hosoRepoFindMasterById(id);
  cbvAssert(current, 'HO_SO not found');

  if (patch.HO_SO_TYPE_ID != null) hosoValidateTypeMasterId(patch.HO_SO_TYPE_ID, 'HO_SO_TYPE_ID');
  if (patch.DON_VI_ID !== undefined) hosoValidateOptionalRefDonVi(patch.DON_VI_ID);
  if (patch.OWNER_ID !== undefined) hosoValidateOptionalRefUser(patch.OWNER_ID);
  if (patch.MANAGER_USER_ID !== undefined) hosoValidateOptionalRefUser(patch.MANAGER_USER_ID);
  if (patch.HTX_ID !== undefined && patch.HTX_ID) {
    cbvAssert(hosoRepoFindMasterById(patch.HTX_ID), 'HTX_ID invalid (HO_SO_MASTER not found)');
  }

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
  var currentStatus = current.STATUS;
  var ns = String(newStatus || '').trim();
  if (String(currentStatus) === String(ns)) {
    return cbvResponse(true, 'HO_SO_STATUS_UNCHANGED', 'Trạng thái không thay đổi', current, []);
  }
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
  var fg = data.FILE_GROUP != null && String(data.FILE_GROUP).trim() !== '' ? String(data.FILE_GROUP).trim()
    : (data.FILE_TYPE != null && String(data.FILE_TYPE).trim() !== '' ? String(data.FILE_TYPE).trim() : 'KHAC');
  hosoAssertEnum('FILE_GROUP', fg, 'FILE_GROUP');

  var stamp = hosoStampCreate();
  var rec = {
    ID: cbvMakeId('HFILE'),
    HO_SO_ID: data.HO_SO_ID,
    FILE_GROUP: fg,
    FILE_NAME: data.FILE_NAME || '',
    FILE_URL: data.FILE_URL || '',
    DRIVE_FILE_ID: data.DRIVE_FILE_ID || '',
    STATUS: 'ACTIVE',
    NOTE: data.NOTE || data.TITLE || '',
    DOC_TYPE: data.DOC_TYPE != null && String(data.DOC_TYPE).trim() !== '' ? String(data.DOC_TYPE).trim() : '',
    DOC_NO: data.DOC_NO != null ? String(data.DOC_NO) : '',
    ISSUED_DATE: data.ISSUED_DATE || '',
    EXPIRY_DATE: data.EXPIRY_DATE != null ? data.EXPIRY_DATE : (data.EXPIRED_DATE || '')
  };
  rec.CREATED_AT = stamp.CREATED_AT;
  rec.CREATED_BY = stamp.CREATED_BY;
  hosoRepoAppend(CBV_CONFIG.SHEETS.HO_SO_FILE, rec);

  hosoAppendLogEntry(data.HO_SO_ID, 'ADD_FILE', {
    NEW_VALUE: rec.FILE_NAME || '',
    NOTE: rec.FILE_GROUP
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

  var fromId = String(data.HO_SO_ID).trim();
  var relTable = String(data.RELATED_TABLE || '').trim();
  var relId = String(data.RELATED_RECORD_ID || '').trim();
  var toHoSo = '';
  if (relTable === 'HO_SO' || relTable === 'HO_SO_MASTER') {
    toHoSo = relId;
  }

  var rt = String(data.RELATION_TYPE).trim();
  hosoAssertEnum('HO_SO_RELATION_TYPE', rt, 'RELATION_TYPE');

  var stamp = hosoStampCreate();
  var rec = {
    ID: cbvMakeId('HREL'),
    FROM_HO_SO_ID: fromId,
    TO_HO_SO_ID: toHoSo,
    RELATION_TYPE: rt,
    STATUS: 'ACTIVE',
    HO_SO_ID: fromId,
    RELATED_TABLE: relTable,
    RELATED_RECORD_ID: relId,
    NOTE: data.NOTE || '',
    START_DATE: data.START_DATE || '',
    END_DATE: data.END_DATE || '',
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
  next.STATUS = 'ARCHIVED';
  hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_FILE, row._rowNumber, next);
  hosoAppendLogEntry(row.HO_SO_ID, 'REMOVE_FILE', {
    NEW_VALUE: String(row.FILE_NAME || fileId),
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
  return hosoFilterActiveRows(hosoRepoListFilesForHoso(hosoId)).filter(function(r) {
    return String(r.STATUS || '') !== 'ARCHIVED';
  });
}

function getHosoRelations(hosoId) {
  var all = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_RELATION) : [];
  return hosoFilterActiveRows((all || []).filter(function(r) {
    var hid = String(hosoId);
    return String(r.HO_SO_ID) === hid || String(r.FROM_HO_SO_ID) === hid || String(r.TO_HO_SO_ID) === hid;
  }));
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
    var ex = hosoParseDate(f.EXPIRED_DATE) || hosoParseDate(f.EXPIRY_DATE);
    if (ex && hosoStartOfDay(ex) < today) {
      var m = hosoRepoFindMasterById(f.HO_SO_ID);
      if (m && !hosoIsRowDeleted(m)) expiredIds[m.ID] = m;
    }
  });
  return Object.keys(expiredIds).map(function(k) { return expiredIds[k]; });
}

function setHoSoStatus(id, newStatus) {
  return changeHosoStatus(id, newStatus, '');
}

function attachHoSoFile(hoSoId, fileMeta) {
  fileMeta = fileMeta || {};
  var hoSo = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.HO_SO_MASTER, hoSoId) : null;
  if (!hoSo && typeof hosoRepoFindMasterById === 'function') hoSo = hosoRepoFindMasterById(hoSoId);
  cbvAssert(hoSo, 'HO_SO not found');

  var url = fileMeta.FILE_URL != null ? String(fileMeta.FILE_URL).trim() : '';
  var driveId = fileMeta.DRIVE_FILE_ID != null ? String(fileMeta.DRIVE_FILE_ID).trim() : '';
  if (!url && !driveId) {
    throw new Error('FILE_URL hoặc DRIVE_FILE_ID là bắt buộc');
  }

  var docType = fileMeta.DOC_TYPE != null && String(fileMeta.DOC_TYPE).trim() !== '' ? String(fileMeta.DOC_TYPE).trim() : 'KHAC';
  if (typeof assertValidEnumValue === 'function') {
    assertValidEnumValue('DOC_TYPE', docType, 'DOC_TYPE');
  }

  var fileGroup = fileMeta.FILE_GROUP != null && String(fileMeta.FILE_GROUP).trim() !== '' ? String(fileMeta.FILE_GROUP).trim() : docType;
  hosoAssertEnum('FILE_GROUP', fileGroup, 'FILE_GROUP');

  var record = {
    ID: cbvMakeId('HFILE'),
    HO_SO_ID: hoSoId,
    FILE_GROUP: fileGroup,
    FILE_NAME: fileMeta.FILE_NAME != null ? String(fileMeta.FILE_NAME) : '',
    FILE_URL: url,
    DRIVE_FILE_ID: driveId,
    STATUS: 'ACTIVE',
    NOTE: fileMeta.NOTE != null ? String(fileMeta.NOTE) : '',
    DOC_TYPE: docType,
    DOC_NO: fileMeta.DOC_NO != null ? String(fileMeta.DOC_NO) : '',
    ISSUED_DATE: fileMeta.ISSUED_DATE != null ? fileMeta.ISSUED_DATE : '',
    EXPIRY_DATE: fileMeta.EXPIRY_DATE != null ? fileMeta.EXPIRY_DATE : '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser()
  };

  _appendRecord(CBV_CONFIG.SHEETS.HO_SO_FILE, record);
  hosoAppendLogEntry(hoSoId, 'ADD_FILE', {
    NEW_VALUE: record.FILE_NAME || '',
    NOTE: record.DOC_TYPE || ''
  });

  return cbvResponse(true, 'HOSO_FILE_ATTACHED', 'Đã đính kèm giấy tờ', record, []);
}

/**
 * Tạo quan hệ giữa hai HO_SO (FROM → TO) + optional polymorphic ref.
 * @param {Object} data
 * @returns {Object} cbvResponse
 */
function createHoSoRelation(data) {
  data = data || {};
  ensureRequired(data.FROM_HO_SO_ID, 'FROM_HO_SO_ID');
  ensureRequired(data.TO_HO_SO_ID, 'TO_HO_SO_ID');
  ensureRequired(data.RELATION_TYPE, 'RELATION_TYPE');

  var fromId = String(data.FROM_HO_SO_ID).trim();
  var toId = String(data.TO_HO_SO_ID).trim();
  cbvAssert(hosoRepoFindMasterById(fromId), 'FROM_HO_SO_ID not found');
  cbvAssert(hosoRepoFindMasterById(toId), 'TO_HO_SO_ID not found');

  var st = data.STATUS != null && String(data.STATUS).trim() !== '' ? String(data.STATUS).trim() : 'ACTIVE';
  hosoAssertEnum('HO_SO_STATUS', st, 'STATUS');
  var rt = String(data.RELATION_TYPE).trim();
  hosoAssertEnum('HO_SO_RELATION_TYPE', rt, 'RELATION_TYPE');

  var ctx = data.HO_SO_ID != null && String(data.HO_SO_ID).trim() !== '' ? String(data.HO_SO_ID).trim() : fromId;

  var stamp = hosoStampCreate();
  var rec = {
    ID: cbvMakeId('HREL'),
    FROM_HO_SO_ID: fromId,
    TO_HO_SO_ID: toId,
    RELATION_TYPE: rt,
    STATUS: st,
    HO_SO_ID: ctx,
    RELATED_TABLE: data.RELATED_TABLE != null ? String(data.RELATED_TABLE) : '',
    RELATED_RECORD_ID: data.RELATED_RECORD_ID != null ? String(data.RELATED_RECORD_ID) : '',
    NOTE: data.NOTE || '',
    START_DATE: data.START_DATE || '',
    END_DATE: data.END_DATE || '',
    IS_DELETED: false
  };
  Object.assign(rec, stamp);
  hosoRepoAppend(CBV_CONFIG.SHEETS.HO_SO_RELATION, rec);

  hosoAppendLogEntry(ctx, 'LINK_ENTITY', {
    NEW_VALUE: fromId + '→' + toId,
    NOTE: rt
  });

  return cbvResponse(true, 'HO_SO_RELATION_CREATED', 'Đã tạo quan hệ', rec, []);
}

/**
 * Kiểm tra đủ giấy tờ theo DOC_REQUIREMENT (theo mã loại hồ sơ trong MASTER_CODE).
 * @param {string} hoSoId
 * @returns {Object} cbvResponse
 */
function checkHoSoCompleteness(hoSoId) {
  var hoSo = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.HO_SO_MASTER, hoSoId) : null;
  if (!hoSo && typeof hosoRepoFindMasterById === 'function') hoSo = hosoRepoFindMasterById(hoSoId);
  cbvAssert(hoSo, 'HO_SO not found: ' + hoSoId);

  var typeCode = '';
  if (hoSo.HO_SO_TYPE_ID && typeof _findById === 'function') {
    var mcRow = _findById(CBV_CONFIG.SHEETS.MASTER_CODE, hoSo.HO_SO_TYPE_ID);
    if (mcRow) typeCode = String(mcRow.CODE || '').trim();
  }

  var reqRows = _rows(_sheet(CBV_CONFIG.SHEETS.DOC_REQUIREMENT)).filter(function(r) {
    return String(r.HO_SO_TYPE || '').trim() === typeCode &&
      (String(r.IS_ACTIVE) === 'true' || r.IS_ACTIVE === true);
  });

  var fileRows = _rows(_sheet(CBV_CONFIG.SHEETS.HO_SO_FILE)).filter(function(r) {
    return String(r.HO_SO_ID) === String(hoSoId) && String(r.STATUS) === 'ACTIVE';
  });

  var hasDocs = {};
  fileRows.forEach(function(f) {
    hasDocs[String(f.DOC_TYPE)] = true;
  });

  var missing = reqRows.filter(function(r) {
    var req = String(r.IS_REQUIRED) === 'true' || r.IS_REQUIRED === true;
    return req && !hasDocs[String(r.DOC_TYPE)];
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
 * Giấy tờ sắp hết hạn trong khoảng daysAhead (mặc định 60 ngày).
 * @param {number} [daysAhead]
 * @returns {Object} cbvResponse
 */
function getExpiringDocs(daysAhead) {
  daysAhead = (typeof daysAhead === 'number') ? daysAhead : 60;
  var now = new Date();
  var cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  var rows = _rows(_sheet(CBV_CONFIG.SHEETS.HO_SO_FILE)).filter(function(f) {
    if (!f.EXPIRY_DATE || String(f.STATUS) === 'ARCHIVED') return false;
    var exp = new Date(f.EXPIRY_DATE);
    return !isNaN(exp.getTime()) && exp <= cutoff;
  });

  return cbvResponse(true, 'EXPIRING_DOCS', '', { rows: rows, count: rows.length, daysAhead: daysAhead }, []);
}

/**
 * Báo cáo tổng hợp một hồ sơ (in/kiểm tra).
 * @param {string} hoSoId
 * @returns {Object} cbvResponse
 */
function generateHoSoReport(hoSoId) {
  var hoSo = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.HO_SO_MASTER, hoSoId) : null;
  if (!hoSo && typeof hosoRepoFindMasterById === 'function') hoSo = hosoRepoFindMasterById(hoSoId);
  cbvAssert(hoSo, 'HO_SO not found: ' + hoSoId);

  var files = _rows(_sheet(CBV_CONFIG.SHEETS.HO_SO_FILE)).filter(function(f) {
    return String(f.HO_SO_ID) === String(hoSoId) && String(f.STATUS) !== 'ARCHIVED';
  });

  var relations = _rows(_sheet(CBV_CONFIG.SHEETS.HO_SO_RELATION)).filter(function(r) {
    var hid = String(hoSoId);
    var ok = String(r.HO_SO_ID) === hid || String(r.FROM_HO_SO_ID) === hid || String(r.TO_HO_SO_ID) === hid;
    return ok && !(typeof hosoIsRowDeleted === 'function' && hosoIsRowDeleted(r));
  });

  var completeness = checkHoSoCompleteness(hoSoId);
  var expiring = getExpiringDocs(60);
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
