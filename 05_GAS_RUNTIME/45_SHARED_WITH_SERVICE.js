/**
 * 45_SHARED_WITH_SERVICE.gs
 * Thêm cột SHARED_WITH vào TASK_MAIN + Security Filter helper.
 *
 * Bước 1: Chạy addSharedWithColumn()   → thêm cột vào Google Sheet
 * Bước 2: Config AppSheet theo hướng dẫn trong SHARED_WITH_APPSHEET_GUIDE.md
 *
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_LOGGER
 * Idempotent: chạy nhiều lần an toàn.
 */

/* =========================================================
   BƯỚC 1 — THÊM CỘT SHARED_WITH VÀO GOOGLE SHEET
   ========================================================= */

/**
 * Thêm cột SHARED_WITH vào TASK_MAIN nếu chưa có.
 * Vị trí: ngay sau REPORTER_ID (hoặc cuối nếu không tìm thấy).
 * @returns {{ ok: boolean, action: string, colIndex: number, message: string }}
 */
function addSharedWithColumn() {
  var ss = SpreadsheetApp.getActive();
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_MAIN)
    ? CBV_CONFIG.SHEETS.TASK_MAIN : 'TASK_MAIN';

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return { ok: false, action: 'ERROR', colIndex: -1, message: 'Sheet ' + sheetName + ' không tìm thấy.' };
  }

  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Idempotent check
  if (headers.indexOf('SHARED_WITH') !== -1) {
    return {
      ok: true,
      action: 'SKIPPED',
      colIndex: headers.indexOf('SHARED_WITH') + 1,
      message: 'Cột SHARED_WITH đã tồn tại tại vị trí ' + (headers.indexOf('SHARED_WITH') + 1) + '.'
    };
  }

  // Chèn sau REPORTER_ID; nếu không có thì append cuối
  var insertAfter = headers.indexOf('REPORTER_ID');
  var newColPos;
  if (insertAfter !== -1) {
    newColPos = insertAfter + 2; // 1-based, sau REPORTER_ID
    sheet.insertColumnAfter(insertAfter + 1);
  } else {
    newColPos = lastCol + 1;
  }

  sheet.getRange(1, newColPos).setValue('SHARED_WITH');

  // Ghi audit log nếu có logger
  if (typeof logAction === 'function') {
    try {
      logAction('SCHEMA', 'TASK_MAIN', 'SCHEMA_CHANGE', null, 'SHARED_WITH',
        null, null, 'Added column SHARED_WITH at position ' + newColPos);
    } catch (e) { /* ignore logger errors */ }
  }

  return {
    ok: true,
    action: 'CREATED',
    colIndex: newColPos,
    message: 'Đã thêm cột SHARED_WITH tại vị trí ' + newColPos + ' (sau REPORTER_ID).'
  };
}

/**
 * Chạy và log kết quả ra console (dùng để test thủ công).
 */
function runAddSharedWithColumn() {
  var result = addSharedWithColumn();
  Logger.log('[SHARED_WITH] ' + result.action + ' | ' + result.message);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result;
}

/* =========================================================
   IS_PRIVATE — THÊM CỘT + AUDIT + SET PRIVATE
   ========================================================= */

/**
 * Thêm cột IS_PRIVATE vào TASK_MAIN nếu chưa có (ngay sau SHARED_WITH, hoặc cuối nếu không có SHARED_WITH).
 * @returns {{ ok: boolean, action: string, colIndex: number, message: string }}
 */
function addIsPrivateColumn() {
  var ss = SpreadsheetApp.getActive();
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_MAIN)
    ? CBV_CONFIG.SHEETS.TASK_MAIN : 'TASK_MAIN';

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return { ok: false, action: 'ERROR', colIndex: -1, message: 'Sheet ' + sheetName + ' không tìm thấy.' };
  }

  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  if (headers.indexOf('IS_PRIVATE') !== -1) {
    var existingIdx = headers.indexOf('IS_PRIVATE');
    return {
      ok: true,
      action: 'SKIPPED',
      colIndex: existingIdx + 1,
      message: 'Cột IS_PRIVATE đã tồn tại tại vị trí ' + (existingIdx + 1) + '.'
    };
  }

  var swIdx = headers.indexOf('SHARED_WITH');
  var newColPos;

  if (swIdx !== -1) {
    sheet.insertColumnAfter(swIdx + 1);
    newColPos = swIdx + 2;
  } else {
    newColPos = lastCol + 1;
  }

  sheet.getRange(1, newColPos).setValue('IS_PRIVATE');

  if (typeof logAction === 'function') {
    try {
      logAction('SCHEMA', 'TASK_MAIN', 'SCHEMA_CHANGE', null, 'IS_PRIVATE',
        null, null, 'Added column IS_PRIVATE at position ' + newColPos);
    } catch (e) { /* ignore */ }
  }

  return {
    ok: true,
    action: 'CREATED',
    colIndex: newColPos,
    message: 'Đã thêm cột IS_PRIVATE tại vị trí ' + newColPos + (swIdx !== -1 ? ' (sau SHARED_WITH).' : ' (cuối sheet — không tìm thấy SHARED_WITH).')
  };
}

/**
 * Chạy addIsPrivateColumn() và log; throw nếu !ok.
 */
function runAddIsPrivateColumn() {
  var result = addIsPrivateColumn();
  Logger.log('[IS_PRIVATE] ' + result.action + ' | ' + result.message);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result;
}

/**
 * Kiểm tra TASK_MAIN có cột IS_PRIVATE chưa.
 * @returns {{ ok: boolean, exists: boolean, colIndex: number, allHeaders: string[] }}
 */
function auditIsPrivateColumn() {
  var ss = SpreadsheetApp.getActive();
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_MAIN)
    ? CBV_CONFIG.SHEETS.TASK_MAIN : 'TASK_MAIN';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log('[AUDIT IS_PRIVATE] sheet not found: ' + sheetName);
    return { ok: false, exists: false, colIndex: -1, allHeaders: [] };
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idx = headers.indexOf('IS_PRIVATE');

  Logger.log('[AUDIT IS_PRIVATE] exists=' + (idx !== -1) + ' colIndex=' + (idx >= 0 ? idx + 1 : -1));
  Logger.log('[AUDIT IS_PRIVATE] headers=' + headers.join(' | '));

  return {
    ok: idx !== -1,
    exists: idx !== -1,
    colIndex: idx + 1,
    allHeaders: headers
  };
}

/**
 * Đặt IS_PRIVATE cho một task theo ID.
 * @param {string} taskId
 * @param {boolean|string} isPrivate
 * @returns {{ ok: boolean, message: string }}
 */
function setTaskPrivate(taskId, isPrivate) {
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_MAIN)
    ? CBV_CONFIG.SHEETS.TASK_MAIN : 'TASK_MAIN';
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return { ok: false, message: 'Sheet ' + sheetName + ' không tìm thấy.' };
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf('ID');
  var privIdx = headers.indexOf('IS_PRIVATE');

  if (idIdx < 0 || privIdx < 0) {
    return { ok: false, message: 'Cột ID hoặc IS_PRIVATE không tồn tại.' };
  }

  var val = isPrivate === true || String(isPrivate).toUpperCase() === 'TRUE';

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]).trim() === String(taskId).trim()) {
      sheet.getRange(i + 1, privIdx + 1).setValue(val);
      return { ok: true, message: 'IS_PRIVATE=' + val + ' cho task ' + taskId + '.' };
    }
  }

  return { ok: false, message: 'Không tìm thấy task ID=' + taskId + '.' };
}

/* =========================================================
   HELPER — LẤY USER_ID TỪ EMAIL HIỆN TẠI (dùng trong GAS)
   ========================================================= */

/**
 * Lấy USER_DIRECTORY.ID của user đang chạy script (GAS context).
 * @returns {string|null}
 */
function _getCurrentUserId() {
  var ss = SpreadsheetApp.getActive();
  var udName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.USER_DIRECTORY)
    ? CBV_CONFIG.SHEETS.USER_DIRECTORY : 'USER_DIRECTORY';
  var udSheet = ss.getSheetByName(udName);
  if (!udSheet) return null;

  var email = Session.getActiveUser().getEmail().toLowerCase();
  var data = udSheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf('ID');
  var emailIdx = headers.indexOf('EMAIL');
  var statusIdx = headers.indexOf('STATUS');

  if (idIdx < 0 || emailIdx < 0) return null;

  for (var i = 1; i < data.length; i++) {
    var rowEmail = String(data[i][emailIdx] || '').toLowerCase().trim();
    var rowStatus = statusIdx >= 0 ? String(data[i][statusIdx] || '').trim() : 'ACTIVE';
    if (rowEmail === email && rowStatus === 'ACTIVE') {
      return String(data[i][idIdx] || '').trim() || null;
    }
  }
  return null;
}

/* =========================================================
   HELPER — KIỂM TRA USER CÓ ĐƯỢC XEM TASK KHÔNG (GAS)
   ========================================================= */

/**
 * Kiểm tra xem userId có được phép xem task không.
 * Logic mirror của Security Filter AppSheet (ADMIN; NOT IS_PRIVATE; hoặc IS_PRIVATE + owner/reporter/shared).
 * @param {Object} taskRow - object với keys: OWNER_ID, REPORTER_ID, SHARED_WITH, IS_PRIVATE, IS_DELETED
 * @param {string} userId - USER_DIRECTORY.ID
 * @param {string} userRole - 'ADMIN' hoặc role khác
 * @returns {boolean}
 */
function canUserSeeTask(taskRow, userId, userRole) {
  if (!taskRow || !userId) return false;
  if (userRole === 'ADMIN') return true;
  if (taskRow.IS_DELETED === true || taskRow.IS_DELETED === 'TRUE') return false;

  var isPrivate = taskRow.IS_PRIVATE === true || String(taskRow.IS_PRIVATE).toUpperCase() === 'TRUE';
  if (!isPrivate) return true;

  if (taskRow.OWNER_ID === userId) return true;
  if (taskRow.REPORTER_ID === userId) return true;

  var sharedWith = String(taskRow.SHARED_WITH || '');
  if (sharedWith) {
    var ids = sharedWith.split(',').map(function(s) { return s.trim(); });
    if (ids.indexOf(userId) !== -1) return true;
  }

  return false;
}

/* =========================================================
   HELPER — THÊM/XOÁ USER KHỎI SHARED_WITH (GAS)
   ========================================================= */

/**
 * Thêm userId vào SHARED_WITH của một task.
 * @param {string} taskId
 * @param {string} userId
 * @returns {{ ok: boolean, message: string }}
 */
function shareTaskWith(taskId, userId) {
  return _updateSharedWith(taskId, userId, 'ADD');
}

/**
 * Xoá userId khỏi SHARED_WITH của một task.
 * @param {string} taskId
 * @param {string} userId
 * @returns {{ ok: boolean, message: string }}
 */
function unshareTaskWith(taskId, userId) {
  return _updateSharedWith(taskId, userId, 'REMOVE');
}

function _updateSharedWith(taskId, userId, action) {
  var ss = SpreadsheetApp.getActive();
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_MAIN)
    ? CBV_CONFIG.SHEETS.TASK_MAIN : 'TASK_MAIN';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { ok: false, message: 'Sheet TASK_MAIN không tìm thấy.' };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf('ID');
  var swIdx = headers.indexOf('SHARED_WITH');

  if (idIdx < 0 || swIdx < 0) {
    return { ok: false, message: 'Cột ID hoặc SHARED_WITH không tồn tại.' };
  }

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]).trim() === taskId) {
      var current = String(data[i][swIdx] || '');
      var ids = current ? current.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];

      if (action === 'ADD') {
        if (ids.indexOf(userId) === -1) ids.push(userId);
      } else {
        ids = ids.filter(function(id) { return id !== userId; });
      }

      sheet.getRange(i + 1, swIdx + 1).setValue(ids.join(','));
      return { ok: true, message: action + ' userId=' + userId + ' cho task ' + taskId + ' thành công.' };
    }
  }

  return { ok: false, message: 'Không tìm thấy task ID=' + taskId + '.' };
}

/* =========================================================
   AUDIT — KIỂM TRA SCHEMA SAU KHI THÊM CỘT
   ========================================================= */

/**
 * Kiểm tra TASK_MAIN có cột SHARED_WITH chưa và trả về vị trí.
 * @returns {{ ok: boolean, exists: boolean, colIndex: number, allHeaders: string[] }}
 */
function auditSharedWithColumn() {
  var ss = SpreadsheetApp.getActive();
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_MAIN)
    ? CBV_CONFIG.SHEETS.TASK_MAIN : 'TASK_MAIN';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { ok: false, exists: false, colIndex: -1, allHeaders: [] };

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idx = headers.indexOf('SHARED_WITH');

  Logger.log('[AUDIT SHARED_WITH] exists=' + (idx !== -1) + ' colIndex=' + (idx + 1));
  Logger.log('[AUDIT SHARED_WITH] headers=' + headers.join(' | '));

  return {
    ok: idx !== -1,
    exists: idx !== -1,
    colIndex: idx + 1,
    allHeaders: headers
  };
}
