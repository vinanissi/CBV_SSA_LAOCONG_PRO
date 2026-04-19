/**
 * 90_BOOTSTRAP_ON_EDIT.gs
 * Time-driven trigger — fill TASK_CODE cho tasks mới từ AppSheet.
 * Chạy mỗi 1 phút tự động.
 *
 * Khi ghi log "Task created" (dòng mới không qua createTask GAS), emit **TASK_CREATED** vào EVENT_QUEUE
 * để đồng bộ với event-driven core (AppSheet không gọi 20_TASK_SERVICE.createTask).
 *
 * Mỗi phút còn gọi **cbvTaskStatusSnapshotSyncFromSheet_** (20_TASK_STATUS_SNAPSHOT.js): phát hiện đổi STATUS
 * trực tiếp trên sheet/AppSheet → emit **TASK_STATUS_CHANGED** (payload note `sheet_sync`).
 *
 * Cài trigger: chạy installTaskSyncTrigger() 1 lần trong GAS Editor.
 */

/**
 * Entry point — GAS time trigger gọi mỗi 1 phút.
 * Scan TASK_MAIN tìm rows cần xử lý.
 */
function taskSyncMinutely() {
  _fillBlankTaskCodes();
  if (typeof cbvTaskStatusSnapshotSyncFromSheet_ === 'function') {
    cbvTaskStatusSnapshotSyncFromSheet_();
  }
}

/**
 * Kiểm tra TASK_UPDATE_LOG đã có log "Task created" cho taskId chưa.
 * @param {string} taskId
 * @returns {boolean} — false nếu chưa có hoặc nếu có lỗi
 */
function _hasTaskCreatedLog(taskId) {
  try {
    var ss = SpreadsheetApp.getActive();
    var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_UPDATE_LOG)
      ? CBV_CONFIG.SHEETS.TASK_UPDATE_LOG : 'TASK_UPDATE_LOG';
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return false;

    var lastRow = sheet.getLastRow();
    var h = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    var tidIdx = h.indexOf('TASK_ID');
    var typeIdx = h.indexOf('UPDATE_TYPE');
    var actionIdx = h.indexOf('ACTION');

    // Thiếu cột bắt buộc → false
    if (tidIdx === -1 || typeIdx === -1 || actionIdx === -1) return false;

    // Data rows: row 2 .. lastRow-1 (ràng buộc spec)
    var rows = sheet.getRange(2, 1, lastRow - 1, h.length).getValues();

    return rows.some(function(r) {
      return String(r[tidIdx] || '').trim() === taskId
        && String(r[typeIdx] || '').trim() === 'NOTE'
        && String(r[actionIdx] || '').trim() === 'Task created';
    });
  } catch (e) {
    return false; // Mọi lỗi → false, không throw
  }
}

/**
 * Fill TASK_CODE cho tất cả rows blank.
 * Ghi TASK_UPDATE_LOG "Task created" cho mỗi task mới.
 */
function _fillBlankTaskCodes() {
  var ss = SpreadsheetApp.getActive();
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_MAIN)
    ? CBV_CONFIG.SHEETS.TASK_MAIN : 'TASK_MAIN';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return;

  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIdx = headers.indexOf('ID');
  var codeIdx = headers.indexOf('TASK_CODE');
  var statusIdx = headers.indexOf('STATUS');
  var updatedAtIdx = headers.indexOf('UPDATED_AT');
  var updatedByIdx = headers.indexOf('UPDATED_BY');

  if (idIdx === -1 || codeIdx === -1) return;

  var rows = sheet.getRange(2, 1, lastRow, headers.length).getValues();
  var filled = 0;

  rows.forEach(function(row, i) {
    var id = String(row[idIdx] || '').trim();
    var code = String(row[codeIdx] || '').trim();
    if (!id || code) return; // skip: blank ID hoặc đã có code

    var rowNum = i + 2;
    var newCode = typeof cbvMakeId === 'function' ? cbvMakeId('TK') : 'TK_' + Date.now();

    // Ghi TASK_CODE
    sheet.getRange(rowNum, codeIdx + 1).setValue(newCode);

    // Ghi UPDATED_AT, UPDATED_BY
    var now = typeof cbvNow === 'function' ? cbvNow() : new Date().toISOString();
    if (updatedAtIdx !== -1) sheet.getRange(rowNum, updatedAtIdx + 1).setValue(now);
    if (updatedByIdx !== -1) sheet.getRange(rowNum, updatedByIdx + 1).setValue('system');

    // Ghi TASK_UPDATE_LOG — chỉ ghi nếu chưa có log "Task created"
    try {
      if (!_hasTaskCreatedLog(id)) {
        _addTaskUpdateLog(id, 'NOTE', 'Task created', 'NEW', 'NEW');
        if (typeof cbvTryEmitCoreEvent_ === 'function') {
          cbvTryEmitCoreEvent_({
            eventType: typeof CBV_CORE_EVENT_TYPE_TASK_CREATED !== 'undefined' ? CBV_CORE_EVENT_TYPE_TASK_CREATED : 'TASK_CREATED',
            sourceModule: 'TASK',
            refId: id,
            entityType: 'TASK_MAIN',
            payload: { source: 'APPSHEET_SHEET_ROW', note: 'TASK_CODE filled by taskSyncMinutely; row was not created via createTask()' }
          });
        }
        if (typeof cbvTaskStatusSnapshotSet_ === 'function') {
          var stSnap = statusIdx !== -1 ? String(row[statusIdx] || '').trim() : 'NEW';
          cbvTaskStatusSnapshotSet_(id, stSnap || 'NEW');
        }
      }
    } catch (e) {
      // Non-blocking
    }

    filled++;
    Logger.log('[taskSync] Filled TASK_CODE for ' + id + ': ' + newCode);
  });

  if (filled > 0) Logger.log('[taskSync] Total filled: ' + filled);
}

/**
 * Cài time-driven trigger chạy mỗi 1 phút.
 * Chạy 1 lần trong GAS Editor.
 */
function installTaskSyncTrigger() {
  // Xóa trigger cũ cùng tên để tránh duplicate
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'taskSyncMinutely' ||
        t.getHandlerFunction() === 'onEditTaskHandler') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('taskSyncMinutely')
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log('Time trigger installed: taskSyncMinutely (every 1 min)');
}

/**
 * Gỡ trigger.
 */
function uninstallTaskSyncTrigger() {
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'taskSyncMinutely') {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  Logger.log('Removed ' + removed + ' trigger(s)');
}

/**
 * Migration: fill TASK_CODE cho tất cả tasks cũ đang blank.
 * Chạy 1 lần thủ công trong GAS Editor.
 */
function migrateFillTaskCode() {
  Logger.log('[migration] Start fill TASK_CODE...');
  _fillBlankTaskCodes();
  Logger.log('[migration] Done.');
}

/**
 * Gỡ trigger onEdit cũ và/hoặc time sync (taskSyncMinutely).
 * Chạy trước khi cài lại; hoặc dùng từ menu để tắt đồng bộ.
 */
function uninstallOnEditTrigger() {
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    var h = t.getHandlerFunction();
    if (h === 'onEditTaskHandler' || h === 'taskSyncMinutely') {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  Logger.log('uninstallOnEditTrigger: removed ' + removed);
}

/**
 * Alias — menu CBV vẫn gọi tên cũ; chuyển sang time trigger.
 */
function installOnEditTrigger() {
  installTaskSyncTrigger();
}
