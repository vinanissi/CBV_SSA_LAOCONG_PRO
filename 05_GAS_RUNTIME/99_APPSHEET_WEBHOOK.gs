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
 * Xóa PENDING_ACTION về "" sau khi xử lý xong.
 * Tránh Bot AppSheet fire lại.
 * @param {string} taskId
 */
function _clearPendingAction(taskId) {
  try {
    var task = taskFindById(taskId);
    if (task && task._rowNumber) {
      taskUpdateMain(task._rowNumber, {
        PENDING_ACTION: '',
        UPDATED_AT: cbvNow(),
        UPDATED_BY: cbvUser()
      });
    }
  } catch (e) {
    // Non-blocking — không throw nếu clear thất bại
  }
}

/**
 * Router theo body.action → 20_TASK_SERVICE.
 * @param {Object} body
 * @returns {Object} cbvResponse
 */
function _routeWebhookAction(body) {
  var action = String(body.action || '').trim();
  var taskId = String(body.taskId || '');
  var note = String(body.note || '');
  var checklistId = String(body.checklistId || '');
  var resultSummary = String(body.resultSummary || '');
  var result;

  switch (action) {
    case 'taskStart':
      _webhookRequireParam(taskId, 'taskId');
      result = taskStartAction(taskId);
      if (result && result.ok) _clearPendingAction(taskId);
      return result;
    case 'taskWait':
      _webhookRequireParam(taskId, 'taskId');
      result = setTaskStatus(taskId, 'WAITING', note);
      if (result && result.ok) _clearPendingAction(taskId);
      return result;
    case 'taskResume':
      _webhookRequireParam(taskId, 'taskId');
      result = setTaskStatus(taskId, 'IN_PROGRESS', note);
      if (result && result.ok) _clearPendingAction(taskId);
      return result;
    case 'taskComplete':
      _webhookRequireParam(taskId, 'taskId');
      result = completeTask(taskId, resultSummary);
      if (result && result.ok) _clearPendingAction(taskId);
      return result;
    case 'taskCancel':
      _webhookRequireParam(taskId, 'taskId');
      result = cancelTask(taskId, note);
      if (result && result.ok) _clearPendingAction(taskId);
      return result;
    case 'taskReopen':
      _webhookRequireParam(taskId, 'taskId');
      result = taskReopenAction(taskId);
      if (result && result.ok) _clearPendingAction(taskId);
      return result;
    case 'taskArchive':
      _webhookRequireParam(taskId, 'taskId');
      result = setTaskStatus(taskId, 'ARCHIVED', note);
      if (result && result.ok) _clearPendingAction(taskId);
      return result;
    case 'checklistDone':
      _webhookRequireParam(checklistId, 'checklistId');
      return markChecklistDone(checklistId, note);
    case 'addLog':
      _webhookRequireParam(taskId, 'taskId');
      var updateType = String(body.updateType || 'NOTE');
      var content = String(body.content || '');
      result = addTaskLogEntry(taskId, updateType, content);
      if (result && result.ok) _clearPendingAction(taskId);
      return result;
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
