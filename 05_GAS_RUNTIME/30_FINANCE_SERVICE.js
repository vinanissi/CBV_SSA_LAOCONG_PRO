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
  if (data.RELATED_ENTITY_TYPE != null && String(data.RELATED_ENTITY_TYPE).trim() !== '') {
    if (typeof assertValidRelatedEntityType === 'function') assertValidRelatedEntityType(data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
    else assertValidEnumValue('RELATED_ENTITY_TYPE', data.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
  }

  var pending = data.PENDING_ACTION != null && String(data.PENDING_ACTION).trim() !== ''
    ? String(data.PENDING_ACTION).trim() : '';

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
    IS_DELETED: false,
    IS_STARRED: false,
    IS_PINNED: false,
    PENDING_ACTION: pending
  };
  _appendRecord(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, record);
  logFinance(record.ID, 'CREATED', {}, record, 'Transaction created');
  if (typeof cbvTryEmitCoreEvent_ === 'function') {
    cbvTryEmitCoreEvent_({
      eventType: typeof CBV_CORE_EVENT_TYPE_FINANCE_CREATED !== 'undefined' ? CBV_CORE_EVENT_TYPE_FINANCE_CREATED : 'FINANCE_CREATED',
      sourceModule: 'FINANCE',
      refId: record.ID,
      entityType: 'FINANCE_TRANSACTION',
      payload: {
        STATUS: record.STATUS,
        TRANS_TYPE: record.TRANS_TYPE,
        CATEGORY: record.CATEGORY,
        AMOUNT: record.AMOUNT
      }
    });
  }
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
  if (patch && patch.RELATED_ENTITY_TYPE != null && String(patch.RELATED_ENTITY_TYPE).trim() !== '') {
    if (typeof assertValidRelatedEntityType === 'function') assertValidRelatedEntityType(patch.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
    else assertValidEnumValue('RELATED_ENTITY_TYPE', patch.RELATED_ENTITY_TYPE, 'RELATED_ENTITY_TYPE');
  }

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
  if (typeof cbvTryEmitCoreEvent_ === 'function') {
    cbvTryEmitCoreEvent_({
      eventType: typeof CBV_CORE_EVENT_TYPE_FINANCE_STATUS_CHANGED !== 'undefined' ? CBV_CORE_EVENT_TYPE_FINANCE_STATUS_CHANGED : 'FINANCE_STATUS_CHANGED',
      sourceModule: 'FINANCE',
      refId: id,
      entityType: 'FINANCE_TRANSACTION',
      payload: {
        previousStatus: String(beforeObj.STATUS || ''),
        newStatus: String(newStatus),
        note: note || ''
      }
    });
  }
  return cbvResponse(true, 'FIN_STATUS_CHANGED', 'Đã đổi trạng thái', current, []);
}

function confirmTransaction(id, note) {
  const current = _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  cbvAssert(current, 'Transaction not found');
  cbvAssert(String(current.STATUS) === 'NEW', 'Chỉ xác nhận khi STATUS = NEW');
  ensurePositiveNumber(current.AMOUNT, 'AMOUNT');
  assertValidEnumValue('FIN_CATEGORY', current.CATEGORY, 'CATEGORY');
  return setFinanceStatus(id, 'CONFIRMED', note);
}

function cancelTransaction(id, note) {
  return setFinanceStatus(id, 'CANCELLED', note);
}

function archiveTransaction(id) {
  return setFinanceStatus(id, 'ARCHIVED', '');
}

/**
 * Canonical export header order for finance sheets — matches Google Sheet row 1 / CBV_SCHEMA_MANIFEST.
 * @param {"FINANCE_TRANSACTION"|"FINANCE_LOG"|"FINANCE_ATTACHMENT"} sheetKey
 * @returns {string[]}
 */
function getFinanceExportHeaders(sheetKey) {
  var allowed = { FINANCE_TRANSACTION: true, FINANCE_LOG: true, FINANCE_ATTACHMENT: true };
  cbvAssert(allowed[sheetKey], 'getFinanceExportHeaders: invalid sheet ' + sheetKey);
  return getSchemaHeaders(sheetKey);
}

function _financeExportTz_() {
  return (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.TIMEZONE) ? CBV_CONFIG.TIMEZONE : (Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh');
}

/** @param {*} transDate @param {string} tz */
function _financeRowDateKey_(transDate, tz) {
  if (transDate == null || transDate === '') return '';
  var d = transDate instanceof Date ? transDate : new Date(transDate);
  if (isNaN(d.getTime())) return '';
  return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
}

/**
 * Giá trị ô an toàn cho Range.setValues — tránh Array/Object làm Sheets hiểu sai kích thước (lỗi "số hàng không khớp").
 * @param {*} v
 * @returns {string|number|boolean|Date}
 */
function _financeScalarForSheet_(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v;
  if (typeof v === 'boolean' || typeof v === 'number') return v;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    if (Array.isArray(v)) return JSON.stringify(v);
    try {
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  }
  return String(v);
}

function _moveNewSpreadsheetToActiveParentFolder_(newSpreadsheetId) {
  try {
    var activeId = SpreadsheetApp.getActive().getId();
    if (String(activeId) === String(newSpreadsheetId)) return;
    var activeFile = DriveApp.getFileById(activeId);
    var parents = activeFile.getParents();
    if (!parents.hasNext()) return;
    var folder = parents.next();
    DriveApp.getFileById(newSpreadsheetId).moveTo(folder);
  } catch (e) {}
}

/**
 * Lọc FINANCE_TRANSACTION theo TRANS_DATE (theo ngày, timezone CBV), tạo Google Sheet mới trên Drive (cùng thư mục với spreadsheet đang mở nếu có).
 * @param {{ start: Date, end: Date }} period Biên [start..end] theo lịch (inclusive), dùng phần ngày sau khi parse từ yyyy-MM-dd.
 * @returns {{ ok: boolean, message?: string, url?: string, fileId?: string, rowCount?: number, fileName?: string }}
 */
function exportFinancePeriodToDrive(period) {
  try {
    cbvAssert(period && period.start && period.end, 'exportFinancePeriodToDrive: period.start/end required');
    var tz = _financeExportTz_();
    var startKey = Utilities.formatDate(period.start, tz, 'yyyy-MM-dd');
    var endKey = Utilities.formatDate(period.end, tz, 'yyyy-MM-dd');
    if (endKey < startKey) {
      return { ok: false, message: 'Đến ngày phải ≥ Từ ngày' };
    }
    if (typeof _invalidateRowsCache === 'function') {
      _invalidateRowsCache(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION);
    }
    var srcSheet = _sheet(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION);
    var all = _rows(srcSheet);
    var filtered = [];
    for (var i = 0; i < all.length; i++) {
      var r = all[i];
      if (r.IS_DELETED === true || String(r.IS_DELETED) === 'true') continue;
      var dk = _financeRowDateKey_(r.TRANS_DATE, tz);
      if (!dk) continue;
      if (dk >= startKey && dk <= endKey) filtered.push(r);
    }
    filtered.sort(function(a, b) {
      var ka = _financeRowDateKey_(a.TRANS_DATE, tz);
      var kb = _financeRowDateKey_(b.TRANS_DATE, tz);
      if (ka !== kb) return ka < kb ? -1 : 1;
      return String(a.ID || '').localeCompare(String(b.ID || ''));
    });
    var headers = getFinanceExportHeaders('FINANCE_TRANSACTION');
    var stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmm');
    var fileName = 'CBV_FINANCE_' + startKey + '_' + endKey + '_' + stamp;
    var newSs = SpreadsheetApp.create(fileName);
    var sh = newSs.getSheets()[0];
    sh.setName('FINANCE_TRANSACTION');
    var headerRow = headers.map(function(h) {
      return _financeScalarForSheet_(h);
    });
    sh.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
    if (filtered.length > 0) {
      var dataRows = [];
      for (var ri = 0; ri < filtered.length; ri++) {
        var row = filtered[ri];
        var line = [];
        for (var hi = 0; hi < headers.length; hi++) {
          line.push(_financeScalarForSheet_(row[headers[hi]]));
        }
        dataRows.push(line);
      }
      var n = dataRows.length;
      cbvAssert(n === filtered.length, 'exportFinancePeriodToDrive: row count mismatch');
      // Sheet.getRange(row, col, numRows, numColumns) — tham số 3 là SỐ HÀNG, không phải chỉ số hàng cuối.
      sh.getRange(2, 1, n, headers.length).setValues(dataRows);
    }
    SpreadsheetApp.flush();
    var fileId = newSs.getId();
    _moveNewSpreadsheetToActiveParentFolder_(fileId);
    return {
      ok: true,
      fileId: fileId,
      url: newSs.getUrl(),
      fileName: fileName,
      rowCount: filtered.length
    };
  } catch (e) {
    return { ok: false, message: String(e.message || e) };
  }
}

/**
 * @param {Object} [filters]
 * @returns {Object} cbvResponse
 */
function getFinanceSummary(filters) {
  filters = filters || {};
  var sheet = typeof _sheet === 'function' ? _sheet(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION) : null;
  if (!sheet) return cbvResponse(false, 'FIN_SUMMARY_ERROR', 'Missing sheet', {}, []);
  var rows = typeof _rows === 'function' ? _rows(sheet) : [];
  var byStatus = {};
  var n = 0;
  var total = 0;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r.IS_DELETED === true || String(r.IS_DELETED) === 'true') continue;
    n++;
    var st = String(r.STATUS || '');
    byStatus[st] = (byStatus[st] || 0) + 1;
    total += Number(r.AMOUNT) || 0;
  }
  return cbvResponse(true, 'FIN_SUMMARY', '', { rowCount: n, totalAmount: total, byStatus: byStatus, filters: filters }, []);
}

registerAction({
  action: 'finConfirm', idParam: 'finId', label: 'Xác nhận GD',
  validStatuses: ['NEW'], adapter: PENDING_ADAPTER_FINANCE,
  handler: function(id, body) { return confirmTransaction(id, String(body.note || '')); }
});
registerAction({
  action: 'finCancel', idParam: 'finId', label: 'Huỷ GD',
  validStatuses: ['NEW'], adapter: PENDING_ADAPTER_FINANCE,
  handler: function(id, body) { return cancelTransaction(id, String(body.note || '')); }
});
registerAction({
  action: 'finArchive', idParam: 'finId', label: 'Lưu trữ GD',
  validStatuses: ['CONFIRMED', 'CANCELLED'], adapter: PENDING_ADAPTER_FINANCE,
  handler: function(id, body) { return archiveTransaction(id); }
});
