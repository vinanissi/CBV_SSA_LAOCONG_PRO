/**
 * CBV Finance Service — FINANCE_TRANSACTION + FINANCE_LOG.
 * Mọi mutation ghi FINANCE_LOG (append only). Dùng _appendRecord / _updateRow / _findById.
 * Enum TRANS_TYPE dùng nhóm FINANCE_TYPE trong ENUM_DICTIONARY / MASTER.
 */

function _financeAppendLog(finId, action, beforeObj, afterObj, note) {
  _appendRecord(CBV_CONFIG.SHEETS.FINANCE_LOG, {
    ID: cbvMakeId('FLOG'),
    FIN_ID: finId,
    ACTION: action,
    BEFORE_JSON: beforeObj === undefined || beforeObj === null ? '' : JSON.stringify(beforeObj),
    AFTER_JSON: afterObj === undefined || afterObj === null ? '' : JSON.stringify(afterObj),
    NOTE: note || '',
    ACTOR_ID: cbvUser(),
    CREATED_AT: cbvNow()
  });
}

/**
 * @param {Object} data
 * @returns {Object} cbvResponse
 */
function createTransaction(data) {
  data = data || {};
  try {
    ensureRequired(data.TRANS_TYPE, 'TRANS_TYPE');
    ensureRequired(data.CATEGORY, 'CATEGORY');
    ensureRequired(data.AMOUNT, 'AMOUNT');
    cbvAssert(Number(data.AMOUNT) > 0, 'AMOUNT phải lớn hơn 0');
    assertValidEnumValue('FINANCE_TYPE', data.TRANS_TYPE, 'TRANS_TYPE');
    assertValidEnumValue('FIN_CATEGORY', data.CATEGORY, 'CATEGORY');
    if (data.PAYMENT_METHOD != null && String(data.PAYMENT_METHOD).trim() !== '') {
      assertValidEnumValue('PAYMENT_METHOD', data.PAYMENT_METHOD, 'PAYMENT_METHOD');
    }
    if (data.RELATED_ENTITY_TYPE != null && String(data.RELATED_ENTITY_TYPE).trim() !== '') {
      assertValidEnumValue('RELATED_ENTITY_TYPE', data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
    }
  } catch (e) {
    return cbvResponse(false, 'FIN_VALIDATION', e.message || 'Validation failed', {}, [String(e.message || e)]);
  }

  var id = cbvMakeId('FIN');
  var now = cbvNow();
  var user = cbvUser();
  var record = {
    ID: id,
    TRANS_CODE: data.TRANS_CODE || cbvMakeId('TR'),
    TRANS_DATE: data.TRANS_DATE != null && String(data.TRANS_DATE) !== '' ? data.TRANS_DATE : now,
    TRANS_TYPE: data.TRANS_TYPE,
    STATUS: 'NEW',
    CATEGORY: data.CATEGORY,
    AMOUNT: Number(data.AMOUNT),
    DON_VI_ID: data.DON_VI_ID != null ? String(data.DON_VI_ID) : '',
    COUNTERPARTY: data.COUNTERPARTY != null ? String(data.COUNTERPARTY) : '',
    PAYMENT_METHOD: data.PAYMENT_METHOD != null ? String(data.PAYMENT_METHOD) : '',
    REFERENCE_NO: data.REFERENCE_NO != null ? String(data.REFERENCE_NO) : '',
    RELATED_ENTITY_TYPE: data.RELATED_ENTITY_TYPE != null ? String(data.RELATED_ENTITY_TYPE) : '',
    RELATED_ENTITY_ID: data.RELATED_ENTITY_ID != null ? String(data.RELATED_ENTITY_ID) : '',
    DESCRIPTION: data.DESCRIPTION != null ? String(data.DESCRIPTION) : '',
    EVIDENCE_URL: data.EVIDENCE_URL != null ? String(data.EVIDENCE_URL) : '',
    IS_STARRED: false,
    IS_PINNED: false,
    PENDING_ACTION: '',
    CONFIRMED_AT: '',
    CONFIRMED_BY: '',
    CREATED_AT: now,
    CREATED_BY: user,
    UPDATED_AT: now,
    UPDATED_BY: user,
    IS_DELETED: false
  };

  _appendRecord(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, record);
  _financeAppendLog(id, 'CREATED', null, record, 'Transaction created');
  return cbvResponse(true, 'FIN_CREATED', 'Đã tạo giao dịch', { id: id }, []);
}

/**
 * @param {string} id
 * @param {Object} patch
 * @returns {Object} cbvResponse
 */
function updateDraftTransaction(id, patch) {
  patch = patch || {};
  var current = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  if (!current) {
    return cbvResponse(false, 'FIN_NOT_FOUND', 'Không tìm thấy giao dịch', {}, ['Transaction not found']);
  }
  if (String(current.STATUS) !== 'NEW') {
    return cbvResponse(false, 'FIN_INVALID_STATE', 'Chi duoc sua khi STATUS = NEW', {}, ['STATUS must be NEW']);
  }

  var blocked = ['STATUS', 'PENDING_ACTION', 'CONFIRMED_AT', 'CONFIRMED_BY', 'CREATED_AT', 'CREATED_BY', 'IS_DELETED'];
  if (current.CONFIRMED_AT != null && String(current.CONFIRMED_AT).trim() !== '') {
    blocked.push('AMOUNT');
  }
  var safePatch = {};
  Object.keys(patch).forEach(function(k) {
    if (blocked.indexOf(k) !== -1) return;
    safePatch[k] = patch[k];
  });

  if (Object.keys(safePatch).length === 0) {
    return cbvResponse(true, 'FIN_NO_CHANGE', 'Khong co truong hop le de cap nhat', current, []);
  }

  try {
    if (safePatch.TRANS_TYPE != null) assertValidEnumValue('FINANCE_TYPE', safePatch.TRANS_TYPE, 'TRANS_TYPE');
    if (safePatch.CATEGORY != null) assertValidEnumValue('FIN_CATEGORY', safePatch.CATEGORY, 'CATEGORY');
    if (safePatch.PAYMENT_METHOD != null && String(safePatch.PAYMENT_METHOD).trim() !== '') {
      assertValidEnumValue('PAYMENT_METHOD', safePatch.PAYMENT_METHOD, 'PAYMENT_METHOD');
    }
    if (safePatch.RELATED_ENTITY_TYPE != null && String(safePatch.RELATED_ENTITY_TYPE).trim() !== '') {
      assertValidEnumValue('RELATED_ENTITY_TYPE', safePatch.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
    }
  } catch (e) {
    return cbvResponse(false, 'FIN_VALIDATION', e.message || 'Validation failed', {}, [String(e.message || e)]);
  }

  var beforeObj = cbvClone(current);
  safePatch.UPDATED_AT = cbvNow();
  safePatch.UPDATED_BY = cbvUser();
  _updateRow(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, current._rowNumber, safePatch);
  var updated = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  _financeAppendLog(id, 'UPDATED', beforeObj, updated, 'Draft updated');
  return cbvResponse(true, 'FIN_UPDATED', 'Đã cập nhật draft', updated, []);
}

/**
 * @param {string} id
 * @param {string} note
 * @returns {Object} cbvResponse
 */
function confirmTransaction(id, note) {
  var current = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  if (!current) {
    return cbvResponse(false, 'FIN_NOT_FOUND', 'Không tìm thấy giao dịch', {}, ['Transaction not found']);
  }
  if (String(current.STATUS) !== 'NEW') {
    return cbvResponse(false, 'FIN_INVALID_STATE', 'Chi xac nhan duoc tu NEW', {}, ['STATUS must be NEW']);
  }
  try {
    cbvAssert(Number(current.AMOUNT) > 0, 'AMOUNT khong hop le');
    assertValidEnumValue('FIN_CATEGORY', current.CATEGORY, 'CATEGORY');
  } catch (e) {
    return cbvResponse(false, 'FIN_VALIDATION', e.message || 'Validation failed', {}, [String(e.message || e)]);
  }

  var beforeObj = cbvClone(current);
  var now = cbvNow();
  var user = cbvUser();
  var patch = {
    STATUS: 'CONFIRMED',
    PENDING_ACTION: '',
    CONFIRMED_AT: now,
    CONFIRMED_BY: user,
    UPDATED_AT: now,
    UPDATED_BY: user
  };
  _updateRow(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, current._rowNumber, patch);
  var updated = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  _financeAppendLog(id, 'CONFIRMED', beforeObj, updated, note || '');
  return cbvResponse(true, 'FIN_CONFIRMED', 'Đã xác nhận', updated, []);
}

/**
 * @param {string} id
 * @param {string} note
 * @returns {Object} cbvResponse
 */
function cancelTransaction(id, note) {
  var current = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  if (!current) {
    return cbvResponse(false, 'FIN_NOT_FOUND', 'Không tìm thấy giao dịch', {}, ['Transaction not found']);
  }
  if (String(current.STATUS) !== 'NEW') {
    return cbvResponse(false, 'FIN_INVALID_STATE', 'Chi huy duoc tu NEW', {}, ['STATUS must be NEW']);
  }

  var beforeObj = cbvClone(current);
  var now = cbvNow();
  var user = cbvUser();
  var patch = {
    STATUS: 'CANCELLED',
    PENDING_ACTION: '',
    UPDATED_AT: now,
    UPDATED_BY: user
  };
  _updateRow(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, current._rowNumber, patch);
  var updated = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  _financeAppendLog(id, 'CANCELLED', beforeObj, updated, note || '');
  return cbvResponse(true, 'FIN_CANCELLED', 'Da huy giao dich', updated, []);
}

/**
 * @param {string} id
 * @returns {Object} cbvResponse
 */
function archiveTransaction(id) {
  var current = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  if (!current) {
    return cbvResponse(false, 'FIN_NOT_FOUND', 'Không tìm thấy giao dịch', {}, ['Transaction not found']);
  }
  var st = String(current.STATUS);
  if (['CONFIRMED', 'CANCELLED'].indexOf(st) === -1) {
    return cbvResponse(false, 'FIN_INVALID_STATE', 'Chi archive tu CONFIRMED hoac CANCELLED', {}, ['Invalid status for archive']);
  }

  var beforeObj = cbvClone(current);
  var now = cbvNow();
  var user = cbvUser();
  var patch = {
    STATUS: 'ARCHIVED',
    PENDING_ACTION: '',
    UPDATED_AT: now,
    UPDATED_BY: user
  };
  _updateRow(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, current._rowNumber, patch);
  var updated = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  _financeAppendLog(id, 'ARCHIVED', beforeObj, updated, '');
  return cbvResponse(true, 'FIN_ARCHIVED', 'Đã lưu trữ', updated, []);
}

/**
 * @param {string} id
 * @param {string} evidenceUrl
 * @returns {Object} cbvResponse
 */
function attachEvidence(id, evidenceUrl) {
  try {
    ensureRequired(evidenceUrl, 'evidenceUrl');
  } catch (e) {
    return cbvResponse(false, 'FIN_VALIDATION', e.message || 'Validation failed', {}, [String(e.message || e)]);
  }
  var current = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  if (!current) {
    return cbvResponse(false, 'FIN_NOT_FOUND', 'Không tìm thấy giao dịch', {}, ['Transaction not found']);
  }
  if (String(current.IS_DELETED) === 'true' || current.IS_DELETED === true) {
    return cbvResponse(false, 'FIN_INVALID_STATE', 'Giao dịch đã xóa mềm', {}, ['IS_DELETED']);
  }

  var beforeObj = cbvClone(current);
  var patch = {
    EVIDENCE_URL: String(evidenceUrl),
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser()
  };
  _updateRow(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, current._rowNumber, patch);
  var updated = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  _financeAppendLog(id, 'EVIDENCE_ATTACHED', beforeObj, updated, '');
  return cbvResponse(true, 'FIN_EVIDENCE', 'Da cap nhat EVIDENCE_URL', updated, []);
}

/**
 * @param {Object} filters - { donViId, fromDate, toDate, status, transType }
 * @returns {Object} cbvResponse
 */
function getFinanceSummary(filters) {
  filters = filters || {};
  var sheet = _sheet(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION);
  var rows = _rows(sheet);
  var filtered = rows.filter(function(r) {
    if (String(r.IS_DELETED) === 'true' || r.IS_DELETED === true) return false;
    if (filters.donViId != null && String(filters.donViId).trim() !== '' && String(r.DON_VI_ID) !== String(filters.donViId)) {
      return false;
    }
    if (filters.status != null && String(filters.status).trim() !== '' && String(r.STATUS) !== String(filters.status)) {
      return false;
    }
    if (filters.transType != null && String(filters.transType).trim() !== '' && String(r.TRANS_TYPE) !== String(filters.transType)) {
      return false;
    }
    var td = r.TRANS_DATE != null ? String(r.TRANS_DATE) : '';
    if (filters.fromDate != null && String(filters.fromDate).trim() !== '' && td < String(filters.fromDate)) return false;
    if (filters.toDate != null && String(filters.toDate).trim() !== '' && td > String(filters.toDate)) return false;
    return true;
  });

  var totalIncome = 0;
  var totalExpense = 0;
  filtered.forEach(function(r) {
    var amt = Number(r.AMOUNT) || 0;
    if (String(r.TRANS_TYPE) === 'INCOME') totalIncome += amt;
    else if (String(r.TRANS_TYPE) === 'EXPENSE') totalExpense += amt;
  });
  var netAmount = totalIncome - totalExpense;

  return cbvResponse(true, 'FIN_SUMMARY', 'OK', {
    totalIncome: totalIncome,
    totalExpense: totalExpense,
    netAmount: netAmount,
    count: filtered.length,
    rows: filtered
  }, []);
}
