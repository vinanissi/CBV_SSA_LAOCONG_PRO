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

  switch (action) {
    case 'taskStart':
      _webhookRequireParam(taskId, 'taskId');
      return taskStartAction(taskId);
    case 'taskWait':
      _webhookRequireParam(taskId, 'taskId');
      return setTaskStatus(taskId, 'WAITING', note);
    case 'taskResume':
      _webhookRequireParam(taskId, 'taskId');
      return setTaskStatus(taskId, 'IN_PROGRESS', note);
    case 'taskComplete':
      _webhookRequireParam(taskId, 'taskId');
      return completeTask(taskId, resultSummary);
    case 'taskCancel':
      _webhookRequireParam(taskId, 'taskId');
      return cancelTask(taskId, note);
    case 'taskReopen':
      _webhookRequireParam(taskId, 'taskId');
      return taskReopenAction(taskId);
    case 'taskArchive':
      _webhookRequireParam(taskId, 'taskId');
      return setTaskStatus(taskId, 'ARCHIVED', note);
    case 'checklistDone':
      _webhookRequireParam(checklistId, 'checklistId');
      return markChecklistDone(checklistId, note);
    case 'addLog':
      _webhookRequireParam(taskId, 'taskId');
      var updateType = String(body.updateType || 'NOTE');
      var content = String(body.content || '');
      return addTaskLogEntry(taskId, updateType, content);
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
