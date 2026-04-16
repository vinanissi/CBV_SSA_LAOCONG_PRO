/**
 * Generic PENDING_ACTION feedback wrapper (TASK, FINANCE, HO_SO, future modules).
 * Depends on globals: cbvResponse, cbvNow, cbvUser, SpreadsheetApp, Utilities, Session,
 * taskFindById, taskUpdateMain, _findById, _updateRow, getHosoById, CBV_CONFIG.
 * Push order: after 03_SHARED_ACTION_REGISTRY.js, before 10_/20_/30_ modules.
 */

/**
 * @param {string} recordId
 * @param {string} label
 * @param {Function} fn
 * @param {Array} validStatuses - [] or null skips STATUS guard
 * @param {{ findById: Function, updatePending: Function }} adapter
 * @returns {*}
 */
function withPendingFeedback(recordId, label, fn, validStatuses, adapter) {
  if (!adapter || typeof adapter.findById !== 'function' || typeof adapter.updatePending !== 'function') {
    throw new Error('withPendingFeedback: adapter.findById và adapter.updatePending là bắt buộc');
  }
  var record = adapter.findById(recordId);
  if (!record || !record._rowNumber) {
    throw new Error('Không tìm thấy bản ghi: ' + recordId);
  }
  var row = record._rowNumber;

  if (validStatuses && validStatuses.length > 0) {
    var currentStatus = String(record.STATUS || '');
    if (validStatuses.indexOf(currentStatus) === -1) {
      return cbvResponse(
        false,
        'INVALID_STATUS',
        'Bỏ qua: STATUS ' + currentStatus + ' không hợp lệ cho action này',
        null,
        []
      );
    }
  }

  adapter.updatePending(row, {
    PENDING_ACTION: '⏳ Đang xử lý ' + label + '...',
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser()
  });
  SpreadsheetApp.flush();

  try {
    var result = fn();
    var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm dd/MM');
    adapter.updatePending(row, {
      PENDING_ACTION: '✅ ' + label + ' lúc ' + now,
      UPDATED_AT: cbvNow(),
      UPDATED_BY: cbvUser()
    });
    return result;
  } catch (err) {
    var errMsg = err && err.message ? err.message : String(err);
    adapter.updatePending(row, {
      PENDING_ACTION: '❌ Lỗi: ' + errMsg,
      UPDATED_AT: cbvNow(),
      UPDATED_BY: cbvUser()
    });
    throw err;
  }
}

/** @type {{ findById: Function, updatePending: Function }} */
var PENDING_ADAPTER_TASK = {
  findById: function(id) {
    return taskFindById(id);
  },
  updatePending: function(row, patch) {
    taskUpdateMain(row, patch);
  }
};

/** @type {{ findById: Function, updatePending: Function }} */
var PENDING_ADAPTER_FINANCE = {
  findById: function(id) {
    return _findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, id);
  },
  updatePending: function(row, patch) {
    _updateRow(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, row, patch);
  }
};

/** @type {{ findById: Function, updatePending: Function }} */
var PENDING_ADAPTER_HOSO = {
  findById: function(id) {
    return getHosoById(id);
  },
  updatePending: function(row, patch) {
    _updateRow(CBV_CONFIG.SHEETS.HO_SO_MASTER, row, patch);
  }
};
