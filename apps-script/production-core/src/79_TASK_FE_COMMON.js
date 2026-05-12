/**
 * Phase 79 — TASK FE Operational Workspace — shared helpers (production-core).
 * Safe fallbacks when TASK module / sheets are not bound in this script project.
 */

var TASK_FE_PHASE_ = 'PHASE_79_TASK_FE';
var TASK_FE_USER_PROP_ACTIVE_TASK_ = 'TASK_FE_ACTIVE_TASK_ID';
var TASK_FE_USER_PROP_LAST_REPORT_ = 'TASK_FE_LAST_REPORT_JSON';
var TASK_FE_USER_PROP_LAST_HANDOFF_ = 'TASK_FE_LAST_AI_HANDOFF';

/**
 * @param {boolean} ok
 * @param {string} code
 * @param {string} message
 * @param {*} data
 * @param {Array} errors
 * @returns {{ ok: boolean, code: string, message: string, data: *, errors: Array }}
 */
function TASK_FE_response_(ok, code, message, data, errors) {
  return {
    ok: !!ok,
    code: String(code || ''),
    message: String(message || ''),
    data: data == null ? null : data,
    errors: Array.isArray(errors) ? errors : []
  };
}

/**
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet|null}
 */
function TASK_FE_getActiveSpreadsheet_() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e0) {
    return null;
  }
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet|null} sh
 * @returns {Array<Object>}
 */
function TASK_FE_sheetToObjects_(sh) {
  if (!sh) return [];
  var lr = sh.getLastRow();
  var lc = sh.getLastColumn();
  if (lr < 2 || lc < 1) return [];
  var values = sh.getRange(1, 1, lr, lc).getValues();
  var headers = [];
  var c;
  for (c = 0; c < values[0].length; c++) headers.push(String(values[0][c] || '').trim());
  var out = [];
  var r;
  for (r = 1; r < values.length; r++) {
    var row = values[r];
    var obj = { _sheetRow: r + 1 };
    var any = false;
    for (c = 0; c < headers.length; c++) {
      var key = headers[c];
      if (!key) continue;
      obj[key] = row[c];
      if (row[c] !== '' && row[c] != null) any = true;
    }
    if (any) out.push(obj);
  }
  return out;
}

/**
 * @param {string} sheetName
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function TASK_FE_getSheet_(sheetName) {
  var ss = TASK_FE_getActiveSpreadsheet_();
  if (!ss || !sheetName) return null;
  try {
    return ss.getSheetByName(String(sheetName));
  } catch (e0) {
    return null;
  }
}

/**
 * @returns {{ hasTaskMain: boolean, mockMode: boolean, warnings: string[] }}
 */
function TASK_FE_probeDb_() {
  var warnings = [];
  var sh = TASK_FE_getSheet_('TASK_MAIN');
  if (!sh || sh.getLastRow() < 2) {
    warnings.push('TASK_MAIN sheet missing or empty — UI uses safe mock preview.');
    return { hasTaskMain: false, mockMode: true, warnings: warnings };
  }
  return { hasTaskMain: true, mockMode: false, warnings: warnings };
}

/**
 * @param {*} dueVal
 * @returns {number|null}
 */
function TASK_FE_dueStartMillis_(dueVal) {
  if (dueVal === undefined || dueVal === null || dueVal === '') return null;
  var d = dueVal instanceof Date ? new Date(dueVal.getTime()) : new Date(dueVal);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function TASK_FE_todayStartMillis_() {
  var t = new Date();
  t.setHours(0, 0, 0, 0);
  return t.getTime();
}

/**
 * @param {*} v
 * @returns {number|null} epoch millis
 */
function TASK_FE_toEpochMillis_(v) {
  if (v === undefined || v === null || v === '') return null;
  var d = v instanceof Date ? new Date(v.getTime()) : new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.getTime();
}

/**
 * @param {Object} row
 * @returns {boolean}
 */
function TASK_FE_isOverdueRow_(row) {
  if (!row) return false;
  var st = String(row.STATUS || '').trim();
  if (['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING'].indexOf(st) === -1) return false;
  var dueMs = TASK_FE_dueStartMillis_(row.DUE_DATE);
  if (dueMs === null) return false;
  return dueMs < TASK_FE_todayStartMillis_();
}

/**
 * Heuristic: WAITING + PENDING_ACTION hints admin queue.
 * @param {Object} row
 * @returns {string} friendly status bucket for UI
 */
function TASK_FE_mapStatusToLabel_(row) {
  if (!row) return '—';
  var st = String(row.STATUS || '').trim();
  var pend = String(row.PENDING_ACTION || '').toUpperCase();
  if (TASK_FE_isOverdueRow_(row)) return 'Quá hạn';
  if (st === 'NEW' || st === 'ASSIGNED') return 'Việc mới';
  if (st === 'IN_PROGRESS') {
    if (!TASK_FE_isOverdueRow_(row)) {
      var startedMs = TASK_FE_toEpochMillis_(row.START_DATE);
      if (startedMs !== null && Date.now() - startedMs > 14 * 86400000) return 'Bị kẹt';
    }
    return 'Đang xử lý';
  }
  if (st === 'WAITING') {
    if (pend.indexOf('ADMIN') !== -1 || pend.indexOf('APPROVAL') !== -1 || pend.indexOf('DUYỆT') !== -1) {
      return 'Đang chờ admin duyệt';
    }
    if (pend.indexOf('INFO') !== -1 || pend.indexOf('BOSUNG') !== -1 || pend.indexOf('BỔ SUNG') !== -1) {
      return 'Cần bổ sung thông tin';
    }
    return 'Đang chờ khách phản hồi';
  }
  if (st === 'DONE') return 'Đã hoàn tất';
  if (st === 'CANCELLED') return 'Đã huỷ';
  if (st === 'ARCHIVED') return 'Đã lưu trữ';
  return 'Đang xử lý';
}

/**
 * @param {string} taskId
 */
function TASK_FE_setActiveTaskId_(taskId) {
  try {
    PropertiesService.getUserProperties().setProperty(TASK_FE_USER_PROP_ACTIVE_TASK_, String(taskId || ''));
  } catch (e0) {
    /* ignore */
  }
}

/**
 * FE helper — persist last selected task for Focus / Detail menus.
 * @param {string} taskId
 * @returns {{ ok: boolean, code: string, message: string, data: { taskId: string }, errors: Array }}
 */
function TASK_FE_syncActiveTaskId_(taskId) {
  TASK_FE_setActiveTaskId_(taskId);
  return TASK_FE_response_(true, 'TASK_FE_ACTIVE_SET', 'OK', { taskId: String(taskId || '') }, []);
}

/**
 * @returns {string}
 */
function TASK_FE_getActiveTaskId_() {
  try {
    return String(PropertiesService.getUserProperties().getProperty(TASK_FE_USER_PROP_ACTIVE_TASK_) || '');
  } catch (e0) {
    return '';
  }
}
