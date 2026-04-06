/**
 * AppSheet → GAS Web App: chỉ route JSON tới 20_TASK_SERVICE (không duplicate _addTaskUpdateLog / taskAppendUpdateLog).
 * Deploy: Web App, POST JSON { action, ... }.
 */

/**
 * POST — parse JSON, route tới task service.
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
    if (!String(raw).trim()) {
      throw new Error('Empty body');
    }
    var body = JSON.parse(raw);
    if (!body || typeof body !== 'object') {
      throw new Error('Body must be a JSON object');
    }
    return _webhookJsonResponse(_routeWebhookAction(body));
  } catch (err) {
    var msg = String(err && err.message ? err.message : err);
    return _webhookJsonResponse({ ok: false, code: 'WEBHOOK_ERROR', message: msg });
  }
}

/**
 * GET — health check ?action=ping
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet(e) {
  e = e || {};
  var p = e.parameter || {};
  var action = String(p.action || '').toLowerCase();
  if (action === 'ping') {
    return _webhookJsonResponse({ ok: true, code: 'PONG', message: 'Webhook active' });
  }
  return _webhookJsonResponse({ ok: false, code: 'GET_NOT_SUPPORTED' });
}

/**
 * Clear PENDING_ACTION bằng rowNumber đã biết — không gọi taskFindById() lại.
 * @param {number} rowNumber
 */
function _clearPendingActionByRow(rowNumber) {
  try {
    if (!rowNumber) return;
    var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_MAIN)
      ? CBV_CONFIG.SHEETS.TASK_MAIN : 'TASK_MAIN';
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sh) return;
    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    var colP = headers.indexOf('PENDING_ACTION') + 1;
    var colUAt = headers.indexOf('UPDATED_AT') + 1;
    var colUBy = headers.indexOf('UPDATED_BY') + 1;
    var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
    if (colP > 0) sh.getRange(rowNumber, colP).setValue('');
    if (colUAt > 0) sh.getRange(rowNumber, colUAt).setValue(now);
    if (colUBy > 0) sh.getRange(rowNumber, colUBy).setValue(cbvUser());
    if (typeof _invalidateRowsCache === 'function') {
      _invalidateRowsCache(sheetName);
    }
  } catch (e) {
    // Non-blocking
  }
}

/**
 * @deprecated Dùng _clearPendingActionByRow(rowNumber) để tránh đọc lại sheet.
 * @param {string} taskId
 */
function _clearPendingAction(taskId) {
  try {
    var task = taskFindById(taskId);
    if (task && task._rowNumber) _clearPendingActionByRow(task._rowNumber);
  } catch (e) {
    // Non-blocking — không throw nếu clear thất bại
  }
}

/**
 * Sau khi action OK: clear PENDING_ACTION dùng _rowNumber từ result.data nếu có (addLog trả log row → fallback taskFindById).
 * @param {Object} result
 * @param {string} taskId
 */
function _clearPendingAfterOk(result, taskId) {
  if (!result || !result.ok) return;
  var rn = result.data && result.data._rowNumber;
  if (rn) {
    _clearPendingActionByRow(rn);
  } else {
    _clearPendingAction(taskId);
  }
}

/**
 * Router theo body.action → 20_TASK_SERVICE.
 * @param {Object} body
 * @returns {Object} cbvResponse
 */
function _routeWebhookAction(body) {
  var action = String(body.action || '').trim();
  if (action.indexOf('CMD:') === 0) {
    action = action.substring(4).trim();
  }
  var taskId = String(body.taskId || '');
  var note = String(body.note || '');
  var checklistId = String(body.checklistId || '');
  var resultSummary = String(body.resultSummary || '');
  var result;

  switch (action) {
    case 'taskStart':
      _webhookRequireParam(taskId, 'taskId');
      result = taskStartAction(taskId);
      _clearPendingAfterOk(result, taskId);
      return result;
    case 'taskWait':
      _webhookRequireParam(taskId, 'taskId');
      result = setTaskStatus(taskId, 'WAITING', note);
      _clearPendingAfterOk(result, taskId);
      return result;
    case 'taskResume':
      _webhookRequireParam(taskId, 'taskId');
      result = setTaskStatus(taskId, 'IN_PROGRESS', note);
      _clearPendingAfterOk(result, taskId);
      return result;
    case 'taskComplete':
      _webhookRequireParam(taskId, 'taskId');
      result = completeTask(taskId, resultSummary);
      _clearPendingAfterOk(result, taskId);
      return result;
    case 'taskCancel':
      _webhookRequireParam(taskId, 'taskId');
      result = cancelTask(taskId, note);
      _clearPendingAfterOk(result, taskId);
      return result;
    case 'taskReopen':
      _webhookRequireParam(taskId, 'taskId');
      result = taskReopenAction(taskId);
      _clearPendingAfterOk(result, taskId);
      return result;
    case 'taskArchive':
      _webhookRequireParam(taskId, 'taskId');
      result = setTaskStatus(taskId, 'ARCHIVED', note);
      _clearPendingAfterOk(result, taskId);
      return result;
    case 'checklistDone':
      _webhookRequireParam(checklistId, 'checklistId');
      return markChecklistDone(checklistId, note);
    case 'addLog':
      _webhookRequireParam(taskId, 'taskId');
      var updateType = String(body.updateType || 'NOTE');
      var content = String(body.content || '');
      result = addTaskLogEntry(taskId, updateType, content);
      _clearPendingAfterOk(result, taskId);
      return result;
    case 'deleteAttachment':
      var attachmentId = String(body.attachmentId || '');
      _webhookRequireParam(attachmentId, 'attachmentId');
      return deleteTaskAttachment(attachmentId, note);
    default:
      return cbvResponse(false, 'UNKNOWN_ACTION', 'Action không hợp lệ: ' + action, null, []);
  }
}

/**
 * @param {*} val
 * @param {string} name
 * @throws {Error}
 */
function _webhookRequireParam(val, name) {
  var s = val == null ? '' : String(val).trim();
  if (!s) {
    throw new Error('Thiếu tham số: ' + name);
  }
}

/**
 * @param {Object} data
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function _webhookJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
