/**
 * PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_P0 — TASK_MAIN taskId → rowNumber index cache.
 */

var TASK_DB_REQ_ROW_INDEX_ = null;
var TASK_DB_ROW_INDEX_TRACE_ = { hit: false, miss: false, fallback: false, rowsScanned: 0 };

function taskDbRowIndexResetTrace_() {
  TASK_DB_ROW_INDEX_TRACE_ = { hit: false, miss: false, fallback: false, rowsScanned: 0 };
}

function taskDbRowIndexCacheKey_() {
  var ssId = String(CBV_TASK_DB_CONFIG.SPREADSHEET_ID || CBV_TASK_DB_ID || '');
  var gen = typeof taskDbCacheGetGeneration_ === 'function' ? taskDbCacheGetGeneration_() : 0;
  return 'taskDbRowIndex:' + ssId + ':g' + gen;
}

function taskDbInvalidateTaskRowIndex_() {
  TASK_DB_REQ_ROW_INDEX_ = null;
  try {
    CacheService.getScriptCache().remove(taskDbRowIndexCacheKey_());
  } catch (e) {
    /* ignore */
  }
}

function taskDbBuildTaskRowIndex_() {
  var info = taskDbGetMainHeaderMap_();
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  var map = {};
  var rowsScanned = 0;
  var readStart = Date.now();
  if (lastRow >= 2) {
    var lastCol = Math.max(sheet.getLastColumn(), 1);
    var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
    rowsScanned = values.length;
    if (typeof wiPerfAddSheetRead_ === 'function') wiPerfAddSheetRead_(rowsScanned, Date.now() - readStart);
    for (var i = 0; i < values.length; i++) {
      var rec = taskDbRowToRecord_(info.headerMap, values[i]);
      if (!rec.ID || taskDbIsDeleted_(rec)) continue;
      map[String(rec.ID)] = i + 2;
    }
  }
  var payload = { map: map, lastRow: lastRow, builtAt: Date.now() };
  TASK_DB_REQ_ROW_INDEX_ = payload;
  TASK_DB_ROW_INDEX_TRACE_.miss = true;
  TASK_DB_ROW_INDEX_TRACE_.rowsScanned += rowsScanned;
  try {
    CacheService.getScriptCache().put(taskDbRowIndexCacheKey_(), JSON.stringify(payload), 300);
  } catch (e) {
    /* ignore */
  }
  return payload;
}

function taskDbGetTaskRowIndex_() {
  if (TASK_DB_REQ_ROW_INDEX_) return TASK_DB_REQ_ROW_INDEX_;
  try {
    var raw = CacheService.getScriptCache().get(taskDbRowIndexCacheKey_());
    if (raw) {
      TASK_DB_REQ_ROW_INDEX_ = JSON.parse(raw);
      TASK_DB_ROW_INDEX_TRACE_.miss = true;
      return TASK_DB_REQ_ROW_INDEX_;
    }
  } catch (e) {
    /* ignore */
  }
  return taskDbBuildTaskRowIndex_();
}

function taskDbGetTaskRowByIdFast_(taskId) {
  var idx = taskDbGetTaskRowIndex_();
  return idx.map[String(taskId || '')] || null;
}

function taskDbRowIndexPut_(taskId, rowNumber) {
  if (!taskId || !rowNumber) return;
  var idx = taskDbGetTaskRowIndex_();
  idx.map[String(taskId)] = rowNumber;
  idx.lastRow = Math.max(idx.lastRow || 0, rowNumber);
  try {
    CacheService.getScriptCache().put(taskDbRowIndexCacheKey_(), JSON.stringify(idx), 300);
  } catch (e) {
    /* ignore */
  }
}

function taskDbFindMainRowScan_(taskId) {
  TASK_DB_ROW_INDEX_TRACE_.fallback = true;
  var info = taskDbGetMainHeaderMap_();
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var findReadStart = Date.now();
  var values = sheet.getRange(2, 1, lastRow, sheet.getLastColumn()).getValues();
  var scanned = values.length;
  TASK_DB_ROW_INDEX_TRACE_.rowsScanned += scanned;
  if (typeof wiPerfAddSheetRead_ === 'function') wiPerfAddSheetRead_(scanned, Date.now() - findReadStart);
  for (var i = 0; i < values.length; i++) {
    var rec = taskDbRowToRecord_(info.headerMap, values[i]);
    if (String(rec.ID) === String(taskId) && !taskDbIsDeleted_(rec)) {
      var rowNumber = i + 2;
      taskDbRowIndexPut_(taskId, rowNumber);
      return { rowNumber: rowNumber, record: rec, info: info };
    }
  }
  return null;
}

function taskDbFindMainRowFast_(taskId) {
  taskId = String(taskId || '');
  if (!taskId) return null;
  var info = taskDbGetMainHeaderMap_();
  var idx = taskDbGetTaskRowIndex_();
  var rowNumber = idx.map[taskId];
  if (!rowNumber) {
    return taskDbFindMainRowScan_(taskId);
  }
  var sheet = info.sheet;
  if (rowNumber > sheet.getLastRow()) {
    taskDbInvalidateTaskRowIndex_();
    return taskDbFindMainRowScan_(taskId);
  }
  var readStart = Date.now();
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var rowValues = sheet.getRange(rowNumber, 1, rowNumber, lastCol).getValues();
  if (typeof wiPerfAddSheetRead_ === 'function') wiPerfAddSheetRead_(1, Date.now() - readStart);
  TASK_DB_ROW_INDEX_TRACE_.hit = true;
  TASK_DB_ROW_INDEX_TRACE_.rowsScanned += 1;
  var rec = taskDbRowToRecord_(info.headerMap, rowValues[0]);
  if (String(rec.ID) !== taskId || taskDbIsDeleted_(rec)) {
    taskDbInvalidateTaskRowIndex_();
    TASK_DB_ROW_INDEX_TRACE_.hit = false;
    TASK_DB_ROW_INDEX_TRACE_.fallback = true;
    return taskDbFindMainRowScan_(taskId);
  }
  return { rowNumber: rowNumber, record: rec, info: info };
}

function taskDbRowIndexFlushPerf_() {
  if (typeof wiPerfMergeRowIndex_ === 'function') {
    wiPerfMergeRowIndex_(TASK_DB_ROW_INDEX_TRACE_);
  }
}
