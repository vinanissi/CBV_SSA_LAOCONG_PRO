const FIN_ALLOWED_TRANSITIONS = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ARCHIVED'],
  CANCELLED: ['ARCHIVED']
};

function createTransaction(data) {
  ensureRequired(data.TRANS_TYPE, 'TRANS_TYPE');
  ensureRequired(data.CATEGORY, 'CATEGORY');
  ensurePositiveNumber(data.AMOUNT, 'AMOUNT');
  assertValidEnumValue('FINANCE_TYPE', data.TRANS_TYPE, 'TRANS_TYPE');
  assertValidEnumValue('FIN_CATEGORY', data.CATEGORY, 'CATEGORY');
  assertValidEnumValue('PAYMENT_METHOD', data.PAYMENT_METHOD || 'OTHER', 'PAYMENT_METHOD');
  if (data.RELATED_ENTITY_TYPE != null) assertValidEnumValue('RELATED_ENTITY_TYPE', data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');

  const record = {
    ID: cbvMakeId('FIN'),
    TRANS_CODE: data.TRANS_CODE || cbvMakeId('TR'),
    TRANS_DATE: data.TRANS_DATE || cbvNow(),
    TRANS_TYPE: data.TRANS_TYPE,
    STATUS: 'NEW',
    CATEGORY: data.CATEGORY,
    AMOUNT: Number(data.AMOUNT),
    DON_VI_ID: data.DON_VI_ID || '',
    COUNTERPARTY: data.COUNTERPARTY || '',
    PAYMENT_METHOD: data.PAYMENT_METHOD || 'OTHER',
    REFERENCE_NO: data.REFERENCE_NO || '',
    RELATED_ENTITY_TYPE: data.RELATED_ENTITY_TYPE || 'NONE',
    RELATED_ENTITY_ID: data.RELATED_ENTITY_ID || '',
    DESCRIPTION: data.DESCRIPTION || '',
    EVIDENCE_URL: data.EVIDENCE_URL || '',
    CONFIRMED_AT: '',
    CONFIRMED_BY: '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser(),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser(),
    IS_DELETED: false
  };
  _appendRecord(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, record);
  logFinance(record.ID, 'CREATED', {}, record, 'Transaction created');
  return cbvResponse(true, 'FIN_CREATED', 'Đã tạo giao dịch', record, []);
}

function logFinance(finId, action, beforeObj, afterObj, note) {
  var actorId = (typeof mapCurrentUserEmailToInternalId === 'function' ? mapCurrentUserEmailToInternalId() : null) || cbvUser();
  const record = {
    ID: cbvMakeId('FLOG'),
    FIN_ID: finId,
    ACTION: action,
    BEFORE_JSON: JSON.stringify(beforeObj || {}),
    AFTER_JSON: JSON.stringify(afterObj || {}),
    NOTE: note || '',
    ACTOR_ID: actorId,
    CREATED_AT: cbvNow()
  };
  _appendRecord(CBV_CONFIG.SHEETS.FINANCE_LOG, record);
  return record;
}

function updateDraftTransaction(id, patch) {
  const current = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  cbvAssert(current, 'Transaction not found');
  cbvAssert(String(current.STATUS) === 'NEW', 'Only NEW transaction can be edited');
  if (patch && patch.TRANS_TYPE != null) assertValidEnumValue('FINANCE_TYPE', patch.TRANS_TYPE, 'TRANS_TYPE');
  if (patch && patch.CATEGORY != null) assertValidEnumValue('FIN_CATEGORY', patch.CATEGORY, 'CATEGORY');
  if (patch && patch.PAYMENT_METHOD != null) assertValidEnumValue('PAYMENT_METHOD', patch.PAYMENT_METHOD, 'PAYMENT_METHOD');
  if (patch && patch.RELATED_ENTITY_TYPE != null) assertValidEnumValue('RELATED_ENTITY_TYPE', patch.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');

  const beforeObj = cbvClone(current);
  Object.keys(patch || {}).forEach(function(k) {
    current[k] = patch[k];
  });
  current.UPDATED_AT = cbvNow();
  current.UPDATED_BY = cbvUser();
  _updateRow(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, current._rowNumber, current);
  logFinance(id, 'UPDATED', beforeObj, current, 'Draft updated');
  return cbvResponse(true, 'FIN_UPDATED', 'Đã cập nhật draft', current, []);
}

function createFinanceAttachment(data) {
  ensureRequired(data.FINANCE_ID, 'FINANCE_ID');
  ensureRequired(data.FILE_URL, 'FILE_URL');
  cbvAssert(_findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, data.FINANCE_ID), 'Finance transaction not found');
  assertValidEnumValue('FINANCE_ATTACHMENT_TYPE', data.ATTACHMENT_TYPE || 'OTHER', 'ATTACHMENT_TYPE');

  var record = {
    ID: cbvMakeId('FATT'),
    FINANCE_ID: data.FINANCE_ID,
    ATTACHMENT_TYPE: data.ATTACHMENT_TYPE || 'OTHER',
    TITLE: data.TITLE || data.FILE_NAME || '',
    FILE_NAME: data.FILE_NAME || '',
    FILE_URL: data.FILE_URL,
    DRIVE_FILE_ID: data.DRIVE_FILE_ID || '',
    NOTE: data.NOTE || '',
    CREATED_AT: cbvNow(),
    CREATED_BY: cbvUser()
  };
  _appendRecord(CBV_CONFIG.SHEETS.FINANCE_ATTACHMENT, record);
  return cbvResponse(true, 'FINANCE_ATTACHMENT_ADDED', 'Đã gắn chứng từ', record, []);
}

function setFinanceStatus(id, newStatus, note) {
  const current = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  cbvAssert(current, 'Transaction not found');
  ensureTransition(String(current.STATUS), newStatus, FIN_ALLOWED_TRANSITIONS);

  const beforeObj = cbvClone(current);
  current.STATUS = newStatus;
  if (newStatus === 'CONFIRMED') {
    current.CONFIRMED_AT = cbvNow();
    current.CONFIRMED_BY = (typeof mapCurrentUserEmailToInternalId === 'function' ? mapCurrentUserEmailToInternalId() : null) || '';
  }
  current.UPDATED_AT = cbvNow();
  current.UPDATED_BY = cbvUser();
  _updateRow(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, current._rowNumber, current);
  logFinance(id, 'STATUS_CHANGED', beforeObj, current, note || '');
  return cbvResponse(true, 'FIN_STATUS_CHANGED', 'Đã đổi trạng thái', current, []);
}
