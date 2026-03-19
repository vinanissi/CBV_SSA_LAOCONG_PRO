function createHoSo(data) {
  ensureRequired(data.HO_SO_TYPE, 'HO_SO_TYPE');
  ensureRequired(data.CODE, 'CODE');
  ensureRequired(data.NAME, 'NAME');
  assertValidEnumValue('HO_SO_TYPE', data.HO_SO_TYPE, 'HO_SO_TYPE');

  const existing = _rows(_sheet(CBV_CONFIG.SHEETS.HO_SO_MASTER)).find(function(r) {
    return String(r.HO_SO_TYPE) === String(data.HO_SO_TYPE) && String(r.CODE) === String(data.CODE);
  });
  cbvAssert(!existing, 'Duplicate CODE in HO_SO_TYPE');

  const record = {
    ID: cbvMakeId(data.HO_SO_TYPE === 'HTX' ? 'HTX' : data.HO_SO_TYPE === 'XA_VIEN' ? 'XV' : data.HO_SO_TYPE === 'XE' ? 'XE' : 'TX'),
    HO_SO_TYPE: data.HO_SO_TYPE,
    CODE: data.CODE,
    NAME: data.NAME,
    STATUS: 'NEW',
    HTX_ID: data.HTX_ID || '',
    OWNER_ID: data.OWNER_ID || '',
    PHONE: data.PHONE || '',
    EMAIL: data.EMAIL || '',
    ID_NO: data.ID_NO || '',
    ADDRESS: data.ADDRESS || '',
    START_DATE: data.START_DATE || '',
    END_DATE: data.END_DATE || '',
    NOTE: data.NOTE || '',
    TAGS: data.TAGS || '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser(),
    IS_DELETED: false
  };

  _appendRecord(CBV_CONFIG.SHEETS.HO_SO_MASTER, record);
  return cbvResponse(true, 'HO_SO_CREATED', 'Hồ sơ đã tạo', record, []);
}

function updateHoSo(id, patch) {
  const current = _findById(CBV_CONFIG.SHEETS.HO_SO_MASTER, id);
  cbvAssert(current, 'HO_SO not found');
  if (patch && patch.HO_SO_TYPE != null) assertValidEnumValue('HO_SO_TYPE', patch.HO_SO_TYPE, 'HO_SO_TYPE');
  if (patch && patch.STATUS != null) assertValidEnumValue('HO_SO_STATUS', patch.STATUS, 'STATUS');

  const next = cbvClone(current);
  Object.keys(patch || {}).forEach(function(k) { next[k] = patch[k]; });
  next.UPDATED_AT = cbvNow();
  next.UPDATED_BY = cbvUser();

  _updateRow(CBV_CONFIG.SHEETS.HO_SO_MASTER, current._rowNumber, next);
  return cbvResponse(true, 'HO_SO_UPDATED', 'Hồ sơ đã cập nhật', next, []);
}

function setHoSoStatus(id, newStatus) {
  const allowed = {
    NEW: ['ACTIVE'],
    ACTIVE: ['INACTIVE', 'ARCHIVED'],
    INACTIVE: ['ACTIVE', 'ARCHIVED']
  };
  const current = _findById(CBV_CONFIG.SHEETS.HO_SO_MASTER, id);
  cbvAssert(current, 'HO_SO not found');
  ensureTransition(String(current.STATUS), newStatus, allowed);
  current.STATUS = newStatus;
  current.UPDATED_AT = cbvNow();
  current.UPDATED_BY = cbvUser();
  _updateRow(CBV_CONFIG.SHEETS.HO_SO_MASTER, current._rowNumber, current);
  return cbvResponse(true, 'HO_SO_STATUS_CHANGED', 'Status updated', current, []);
}

function attachHoSoFile(hoSoId, fileMeta) {
  cbvAssert(_findById(CBV_CONFIG.SHEETS.HO_SO_MASTER, hoSoId), 'HO_SO not found');
  ensureRequired(fileMeta.FILE_NAME, 'FILE_NAME');
  ensureRequired(fileMeta.FILE_URL, 'FILE_URL');
  assertValidEnumValue('FILE_GROUP', fileMeta.FILE_GROUP || 'KHAC', 'FILE_GROUP');

  const record = {
    ID: cbvMakeId('HFILE'),
    HO_SO_ID: hoSoId,
    FILE_GROUP: fileMeta.FILE_GROUP || 'KHAC',
    FILE_NAME: fileMeta.FILE_NAME,
    FILE_URL: fileMeta.FILE_URL,
    DRIVE_FILE_ID: fileMeta.DRIVE_FILE_ID || '',
    STATUS: 'ACTIVE',
    NOTE: fileMeta.NOTE || '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser()
  };
  _appendRecord(CBV_CONFIG.SHEETS.HO_SO_FILE, record);
  return cbvResponse(true, 'HO_SO_FILE_ATTACHED', 'Đã gắn file', record, []);
}
