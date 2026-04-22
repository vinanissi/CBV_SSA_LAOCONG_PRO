/**
 * AppSheet → GAS Web App: route JSON tới 20_TASK_SERVICE.
 * Deploy: Web App, POST JSON { action, ... }.
 */

function doPost(e) {
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
 * Bọc task action với feedback pattern dùng PENDING_ACTION.
 *
 * Guard strategy:
 *   - Kiểm tra STATUS hợp lệ TRƯỚC khi chạy (tham số validStatuses)
 *   - Nếu STATUS không hợp lệ → silent skip (không ghi lỗi, không throw)
 *   - Mục đích: chặn Bot fire lần 2 sau khi STATUS đã thay đổi
 *
 * Flush strategy:
 *   - Chỉ flush 1 lần sau bước ghi "⏳..." để clear CMD: prefix ngay
 *   - GAS tự flush khi execution kết thúc
 *
 * @param {string}   taskId        - ID của task trong TASK_MAIN
 * @param {string}   label         - Tên action hiển thị (vd: "Bắt đầu")
 * @param {Function} fn            - Logic chính, không nhận tham số
 * @param {Array}    validStatuses - Danh sách STATUS hợp lệ để chạy action
 *                                   Nếu [] hoặc null → bỏ qua kiểm tra
 * @returns {Object} cbvResponse
 */
function withTaskFeedback(taskId, label, fn, validStatuses) {
  var task = taskFindById(taskId);
  if (!task || !task._rowNumber) {
    throw new Error('Không tìm thấy task: ' + taskId);
  }
  var row = task._rowNumber;

  // GUARD: kiểm tra STATUS hợp lệ
  // Chặn lần Bot fire thứ 2 khi STATUS đã thay đổi từ lần fire thứ 1
  if (validStatuses && validStatuses.length > 0) {
    var currentStatus = String(task.STATUS || '');
    if (validStatuses.indexOf(currentStatus) === -1) {
      // Silent skip — không ghi lỗi vào PENDING_ACTION, không throw
      return cbvResponse(
        false,
        'INVALID_STATUS',
        'Bỏ qua: STATUS ' + currentStatus + ' không hợp lệ cho action này',
        null,
        []
      );
    }
  }

  // Ghi "⏳..." + flush ngay để clear CMD: prefix
  // → Bot không fire lại (PENDING_ACTION không còn bắt đầu bằng "CMD:")
  taskUpdateMain(row, {
    PENDING_ACTION: '⏳ Đang xử lý ' + label + '...',
    UPDATED_AT: cbvNow(),
    UPDATED_BY: cbvUser()
  });
  SpreadsheetApp.flush(); // ← flush duy nhất, bắt buộc

  try {
    // Chạy logic chính
    var result = fn();

    // Thành công — không flush, GAS tự flush khi kết thúc
    var now = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'HH:mm dd/MM'
    );
    taskUpdateMain(row, {
      PENDING_ACTION: '✅ ' + label + ' lúc ' + now,
      UPDATED_AT: cbvNow(),
      UPDATED_BY: cbvUser()
    });
    return result;

  } catch (err) {
    // Lỗi thật (không phải Bot fire lần 2) — ghi lỗi để user biết
    var errMsg = err && err.message ? err.message : String(err);
    taskUpdateMain(row, {
      PENDING_ACTION: '❌ Lỗi: ' + errMsg,
      UPDATED_AT: cbvNow(),
      UPDATED_BY: cbvUser()
    });
    throw err; // Re-throw để doPost trả {ok: false}
  }
}

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
    // Non-blocking
  }
}

/**
 * Router theo body.action → 20_TASK_SERVICE.
 * Strip prefix "CMD:" nếu AppSheet ghi dạng "CMD:taskStart".
 * Các case workflow dùng withTaskFeedback để hiển thị trạng thái cho user.
 * @param {Object} body
 * @returns {Object} cbvResponse
 */
function _routeWebhookAction(body) {
  // Strip prefix "CMD:" — AppSheet ghi "CMD:taskStart", GAS xử lý "taskStart"
  var action = String(body.action || '').trim();
  if (action.indexOf('CMD:') === 0) {
    action = action.substring(4).trim();
  }

  var taskId = String(body.taskId || '');
  var note = String(body.note || '');
  var checklistId = String(body.checklistId || '');
  var resultSummary = String(body.resultSummary || '');

  switch (action) {

    case 'taskStart':
      _webhookRequireParam(taskId, 'taskId');
      return withTaskFeedback(taskId, 'Bắt đầu', function() {
        return taskStartAction(taskId);
      }, ['NEW', 'ASSIGNED']);

    case 'taskWait':
      _webhookRequireParam(taskId, 'taskId');
      return withTaskFeedback(taskId, 'Tạm chờ', function() {
        return setTaskStatus(taskId, 'WAITING', note);
      }, ['IN_PROGRESS']);

    case 'taskResume':
      _webhookRequireParam(taskId, 'taskId');
      return withTaskFeedback(taskId, 'Tiếp tục', function() {
        return setTaskStatus(taskId, 'IN_PROGRESS', note);
      }, ['WAITING']);

    case 'taskComplete':
      _webhookRequireParam(taskId, 'taskId');
      return withTaskFeedback(taskId, 'Hoàn thành', function() {
        return completeTask(taskId, resultSummary);
      }, ['IN_PROGRESS', 'WAITING']);

    case 'taskCancel':
      _webhookRequireParam(taskId, 'taskId');
      return withTaskFeedback(taskId, 'Huỷ task', function() {
        return cancelTask(taskId, note);
      }, ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING']);

    case 'taskReopen':
      _webhookRequireParam(taskId, 'taskId');
      return withTaskFeedback(taskId, 'Mở lại', function() {
        return taskReopenAction(taskId);
      }, ['DONE', 'CANCELLED']);

    case 'taskArchive':
      _webhookRequireParam(taskId, 'taskId');
      return withTaskFeedback(taskId, 'Lưu trữ', function() {
        return setTaskStatus(taskId, 'ARCHIVED', note);
      }, ['DONE', 'CANCELLED']);

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
