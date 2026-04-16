/**
 * AppSheet → GAS Web App: route JSON tới 20_TASK_SERVICE (và action đã register).
 * Deploy: Web App, POST JSON { action, ... }.
 */

function _webhookDoPost_(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
    if (!String(raw).trim()) throw new Error('Empty body');
    var body = JSON.parse(raw);
    if (!body || typeof body !== 'object') throw new Error('Body must be a JSON object');
    return _webhookJsonResponse(_routeWebhookAction(body));
  } catch (err) {
    var msg = String(err && err.message ? err.message : err);
    return _webhookJsonResponse({ ok: false, code: 'WEBHOOK_ERROR', message: msg });
  }
}

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
 * Thin wrapper — PENDING_ACTION / flush / guard qua withPendingFeedback + PENDING_ADAPTER_TASK.
 * @param {string} taskId
 * @param {string} label
 * @param {Function} fn
 * @param {Array} validStatuses
 * @returns {*}
 */
function withTaskFeedback(taskId, label, fn, validStatuses) {
  return withPendingFeedback(taskId, label, fn, validStatuses, PENDING_ADAPTER_TASK);
}

/**
 * Router theo body.action. Strip prefix "CMD:" nếu AppSheet ghi "CMD:taskStart".
 * Action có trong registry → withPendingFeedback + handler.
 * checklistDone / addLog không dùng feedback pattern.
 * @param {Object} body
 * @returns {Object} cbvResponse
 */
function _routeWebhookAction(body) {
  var action = String(body.action || '').trim();
  if (action.indexOf('CMD:') === 0) {
    action = action.substring(4);
  }

  var entry = getRegisteredAction(action);
  if (entry) {
    var id = String(body[entry.idParam] || '');
    _webhookRequireParam(id, entry.idParam);
    return withPendingFeedback(id, entry.label, function() {
      return entry.handler(id, body);
    }, entry.validStatuses, entry.adapter);
  }

  var note = String(body.note || '');

  switch (action) {

    case 'checklistDone': {
      var checklistId = String(body.checklistId || '');
      _webhookRequireParam(checklistId, 'checklistId');
      return markChecklistDone(checklistId, note);
    }

    case 'addLog': {
      var taskId = String(body.taskId || '');
      _webhookRequireParam(taskId, 'taskId');
      var updateType = String(body.updateType || 'NOTE');
      var content = String(body.content || '');
      return addTaskLogEntry(taskId, updateType, content);
    }

    default:
      return cbvResponse(false, 'UNKNOWN_ACTION',
        'Action không hợp lệ: ' + action, null, []);
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

registerAction({
  action: 'taskStart',
  idParam: 'taskId',
  label: 'Bắt đầu',
  validStatuses: ['NEW', 'ASSIGNED'],
  adapter: PENDING_ADAPTER_TASK,
  handler: function(id, body) {
    return taskStartAction(id);
  }
});

registerAction({
  action: 'taskWait',
  idParam: 'taskId',
  label: 'Tạm chờ',
  validStatuses: ['IN_PROGRESS'],
  adapter: PENDING_ADAPTER_TASK,
  handler: function(id, body) {
    return setTaskStatus(id, 'WAITING', String(body.note || ''));
  }
});

registerAction({
  action: 'taskResume',
  idParam: 'taskId',
  label: 'Tiếp tục',
  validStatuses: ['WAITING'],
  adapter: PENDING_ADAPTER_TASK,
  handler: function(id, body) {
    return setTaskStatus(id, 'IN_PROGRESS', String(body.note || ''));
  }
});

registerAction({
  action: 'taskComplete',
  idParam: 'taskId',
  label: 'Hoàn thành',
  validStatuses: ['IN_PROGRESS', 'WAITING'],
  adapter: PENDING_ADAPTER_TASK,
  handler: function(id, body) {
    return completeTask(id, String(body.resultSummary || ''));
  }
});

registerAction({
  action: 'taskCancel',
  idParam: 'taskId',
  label: 'Huỷ task',
  validStatuses: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING'],
  adapter: PENDING_ADAPTER_TASK,
  handler: function(id, body) {
    return cancelTask(id, String(body.note || ''));
  }
});

registerAction({
  action: 'taskReopen',
  idParam: 'taskId',
  label: 'Mở lại',
  validStatuses: ['DONE', 'CANCELLED'],
  adapter: PENDING_ADAPTER_TASK,
  handler: function(id, body) {
    return taskReopenAction(id);
  }
});

registerAction({
  action: 'taskArchive',
  idParam: 'taskId',
  label: 'Lưu trữ',
  validStatuses: ['DONE', 'CANCELLED'],
  adapter: PENDING_ADAPTER_TASK,
  handler: function(id, body) {
    return setTaskStatus(id, 'ARCHIVED', String(body.note || ''));
  }
});
