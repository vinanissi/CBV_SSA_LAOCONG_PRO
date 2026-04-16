/**
 * Star/Pin Service — Toggle IS_STARRED và IS_PINNED trên TASK_MAIN, HO_SO_MASTER, FINANCE_TRANSACTION.
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY
 */

/**
 * Các bảng được phép toggle star/pin.
 * Dùng để validate sheetName đầu vào — không cho phép gọi tùy tiện lên bảng khác.
 */
var STAR_PIN_ALLOWED_SHEETS = [
  CBV_CONFIG.SHEETS.TASK_MAIN,
  CBV_CONFIG.SHEETS.HO_SO_MASTER,
  CBV_CONFIG.SHEETS.FINANCE_TRANSACTION
];

/**
 * @param {string} sheetName
 */
function _assertStarPinAllowed(sheetName) {
  cbvAssert(sheetName != null && String(sheetName).trim() !== '', 'sheetName required');
  cbvAssert(STAR_PIN_ALLOWED_SHEETS.indexOf(sheetName) !== -1, 'Star/pin not allowed for table: ' + sheetName);
}

/**
 * @param {string} sheetName
 * @param {string} recordId
 * @param {boolean} value
 * @returns {{ ok: boolean, id?: string, field?: string, value?: boolean, error?: string }}
 */
function setStarred(sheetName, recordId, value) {
  var id = recordId != null ? String(recordId).trim() : '';
  try {
    _assertStarPinAllowed(sheetName);
    cbvAssert(id !== '', 'recordId required');
    cbvAssert(value === true || value === false, 'value must be boolean');
    var row = typeof _findById === 'function' ? _findById(sheetName, id) : null;
    if (!row) {
      return { ok: false, error: 'NOT_FOUND', id: id };
    }
    if (typeof _updateRow === 'function') {
      _updateRow(sheetName, row._rowNumber, { IS_STARRED: value });
    }
    if (typeof _invalidateRowsCache === 'function') _invalidateRowsCache(sheetName);
    return { ok: true, id: id, field: 'IS_STARRED', value: value };
  } catch (e) {
    return { ok: false, error: String(e.message || e), id: id };
  }
}

/**
 * @param {string} sheetName
 * @param {string} recordId
 * @param {boolean} value
 * @returns {{ ok: boolean, id?: string, field?: string, value?: boolean, error?: string }}
 */
function setPinned(sheetName, recordId, value) {
  var id = recordId != null ? String(recordId).trim() : '';
  try {
    _assertStarPinAllowed(sheetName);
    cbvAssert(id !== '', 'recordId required');
    cbvAssert(value === true || value === false, 'value must be boolean');
    var row = typeof _findById === 'function' ? _findById(sheetName, id) : null;
    if (!row) {
      return { ok: false, error: 'NOT_FOUND', id: id };
    }
    if (typeof _updateRow === 'function') {
      _updateRow(sheetName, row._rowNumber, { IS_PINNED: value });
    }
    if (typeof _invalidateRowsCache === 'function') _invalidateRowsCache(sheetName);
    return { ok: true, id: id, field: 'IS_PINNED', value: value };
  } catch (e) {
    return { ok: false, error: String(e.message || e), id: id };
  }
}
