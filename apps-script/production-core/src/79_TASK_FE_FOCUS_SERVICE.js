/**
 * Phase 79 — Focus Task screen service.
 */

/**
 * @param {string} taskId
 */
function TASK_FE_Focus_open(taskId) {
  var tid = String(taskId || '').trim();
  if (!tid) tid = TASK_FE_getActiveTaskId_();
  var t = HtmlService.createTemplateFromFile('79_TASK_FE_FOCUS_TASK');
  t.bootTaskId = JSON.stringify(tid);
  SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(960).setHeight(780), 'CBV TASK — Focus');
}

/**
 * @param {string} taskId
 * @returns {{ ok: boolean, code: string, message: string, data: Object, errors: Array }}
 */
function TASK_FE_Focus_getTaskContext(taskId) {
  var tid = String(taskId || '').trim();
  var probe = TASK_FE_probeDb_();
  var row = TASK_FE_Focus_findRow_(tid);
  if (!row && probe.mockMode) {
    var mock = TASK_FE_Home_mockTasks_();
    for (var i = 0; i < mock.length; i++) {
      if (String(mock[i].ID) === tid) row = mock[i];
    }
  }
  if (!row) {
    return TASK_FE_response_(false, 'TASK_NOT_FOUND', 'Không tìm thấy việc — kiểm tra TASK_ID.', null, ['NO_ROW']);
  }
  var vm = TASK_FE_Focus_buildViewModel_(row);
  return TASK_FE_response_(true, 'TASK_FE_FOCUS_OK', 'OK', vm, []);
}

/**
 * @param {Object} payload
 * @returns {{ ok: boolean, code: string, message: string, data: Object, errors: Array }}
 */
function TASK_FE_Focus_applyAction(payload) {
  var p = payload || {};
  var taskId = String(p.taskId || '').trim();
  var action = String(p.action || '').trim();
  var note = String(p.note || '').trim();
  if (!taskId) return TASK_FE_response_(false, 'BAD_INPUT', 'Thiếu taskId.', null, ['NO_TASK_ID']);

  var model = TASK_FE_Focus_buildActionModel_(taskId, action, note);
  if (!model.allowed) {
    return TASK_FE_response_(false, 'ACTION_NOT_ALLOWED', model.reason || 'Hành động không khả dụng.', { model: model }, []);
  }

  try {
    if (typeof TASK_FE_Timeline_appendEvent_ === 'function') {
      TASK_FE_Timeline_appendEvent_({
        traceId: typeof CBV_TestConsole_newTraceId_ === 'function' ? CBV_TestConsole_newTraceId_() : '',
        eventType: 'TASK_FE_ACTION',
        actor: typeof CBV_TestConsole_runBy_ === 'function' ? CBV_TestConsole_runBy_() : '',
        action: action,
        taskId: taskId,
        metadata: { note: note },
        note: 'TASK_FE_APPEND_ONLY'
      });
    }
  } catch (e0) {
    /* non-blocking */
  }

  var svc = TASK_FE_Focus_dispatchServiceAction_(taskId, action, note);
  if (!svc.handled) {
    return TASK_FE_response_(
      false,
      'TASK_SERVICE_UNAVAILABLE',
      'Chưa gọi được service TASK (script bind TASK) — chỉ ghi nhận timeline nội bộ. Kiểm tra triển khai thư viện.',
      { model: model, serviceHint: svc.hint },
      ['NO_TASK_SERVICE']
    );
  }
  if (svc.res && svc.res.ok === false) {
    return TASK_FE_response_(false, String(svc.res.code || 'TASK_ACTION_FAILED'), String(svc.res.message || 'Lỗi'), svc.res.data, svc.res.errors || []);
  }
  return TASK_FE_response_(true, 'TASK_FE_ACTION_OK', String(svc.res && svc.res.message ? svc.res.message : 'Đã xử lý'), svc.res ? svc.res.data : null, []);
}

/**
 * @param {string} taskId
 * @param {string} action
 * @param {string} note
 * @returns {Object}
 */
function TASK_FE_Focus_buildActionModel_(taskId, action, note) {
  var row = TASK_FE_Focus_findRow_(taskId);
  if (!row) {
    return { allowed: false, reason: 'Không tìm thấy việc trong TASK_MAIN (hoặc mock không khớp ID).' };
  }
  var st = String(row.STATUS || '');
  var a = String(action || '').toUpperCase();
  if (a === 'ACCEPT') {
    if (['NEW', 'ASSIGNED'].indexOf(st) === -1) return { allowed: false, reason: 'Chỉ nhận việc khi trạng thái là Việc mới.' };
    return { allowed: true, targetStatus: 'IN_PROGRESS', label: 'Nhận việc' };
  }
  if (a === 'IN_PROGRESS') {
    if (['NEW', 'ASSIGNED'].indexOf(st) === -1) return { allowed: false, reason: 'Chỉ bắt đầu xử lý từ Việc mới.' };
    return { allowed: true, targetStatus: 'IN_PROGRESS', label: 'Đang xử lý' };
  }
  if (a === 'NEED_INFO') {
    if (['IN_PROGRESS', 'ASSIGNED', 'NEW'].indexOf(st) === -1) return { allowed: false, reason: 'Chỉ yêu cầu bổ sung khi đang xử lý hoặc mới giao.' };
    return { allowed: true, targetStatus: 'WAITING', label: 'Yêu cầu bổ sung', pendingHint: 'INFO_REQUEST' };
  }
  if (a === 'COMPLETE') {
    if (['IN_PROGRESS', 'WAITING', 'ASSIGNED', 'NEW'].indexOf(st) === -1) return { allowed: false, reason: 'Không thể hoàn tất từ trạng thái hiện tại.' };
    return { allowed: true, targetStatus: 'DONE', label: 'Hoàn tất' };
  }
  if (a === 'ESCALATE_ADMIN') {
    if (['IN_PROGRESS', 'NEW', 'ASSIGNED', 'WAITING'].indexOf(st) === -1) return { allowed: false, reason: 'Không thể chuyển admin từ trạng thái này.' };
    return { allowed: true, targetStatus: 'WAITING', label: 'Chuyển admin', pendingHint: 'ADMIN_APPROVAL' };
  }
  return { allowed: false, reason: 'Hành động không hợp lệ.' };
}

/**
 * @param {Object} row
 * @returns {Object}
 */
function TASK_FE_Focus_buildViewModel_(row) {
  var checklist = TASK_FE_Focus_loadChecklist_(String(row.ID || ''));
  var actions = TASK_FE_Focus_suggestedActions_(row);
  return {
    taskId: String(row.ID || ''),
    title: String(row.TITLE || 'Không tiêu đề'),
    goal: String(row.DESCRIPTION || row.RESULT_SUMMARY || 'Hoàn thành đúng yêu cầu nghiệp vụ và cập nhật kết quả rõ ràng.'),
    statusLabel: TASK_FE_mapStatusToLabel_(row),
    nextAction: TASK_FE_Home_nextHint_(row),
    checklist: checklist,
    actions: actions,
    ownerId: String(row.OWNER_ID || ''),
    due: row.DUE_DATE instanceof Date ? row.DUE_DATE.toISOString().slice(0, 10) : String(row.DUE_DATE || ''),
    mockMode: TASK_FE_probeDb_().mockMode
  };
}

/**
 * @param {string} taskId
 * @returns {Object|null}
 */
function TASK_FE_Focus_findRow_(taskId) {
  if (!taskId) return null;
  var sh = TASK_FE_getSheet_('TASK_MAIN');
  if (!sh) return null;
  var rows = TASK_FE_sheetToObjects_(sh);
  var i;
  for (i = 0; i < rows.length; i++) {
    if (String(rows[i].ID || '').trim() === taskId) return rows[i];
  }
  return null;
}

/**
 * @param {string} taskId
 * @returns {Array<{ id: string, title: string, done: boolean }>}
 */
function TASK_FE_Focus_loadChecklist_(taskId) {
  if (!taskId) return [];
  if (typeof taskGetChecklistItems === 'function') {
    try {
      var items = taskGetChecklistItems(taskId) || [];
      return items.map(function (r) {
        return {
          id: String(r.ID || ''),
          title: String(r.TITLE || ''),
          done: String(r.IS_DONE) === 'true' || r.IS_DONE === true
        };
      });
    } catch (e0) {
      return [];
    }
  }
  var sh = TASK_FE_getSheet_('TASK_CHECKLIST');
  if (!sh) return [];
  var objs = TASK_FE_sheetToObjects_(sh);
  var out = [];
  var i;
  for (i = 0; i < objs.length; i++) {
    if (String(objs[i].TASK_ID || '').trim() !== taskId) continue;
    if (String(objs[i].IS_DELETED) === 'true') continue;
    out.push({
      id: String(objs[i].ID || ''),
      title: String(objs[i].TITLE || ''),
      done: String(objs[i].IS_DONE) === 'true' || objs[i].IS_DONE === true
    });
  }
  return out;
}

/**
 * @param {Object} row
 * @returns {Array<{ code: string, label: string, enabled: boolean }>}
 */
function TASK_FE_Focus_suggestedActions_(row) {
  var st = String(row.STATUS || '');
  function mk(code, label, enabled) {
    return { code: code, label: label, enabled: !!enabled };
  }
  return [
    mk('ACCEPT', 'Nhận việc', ['NEW', 'ASSIGNED'].indexOf(st) !== -1),
    mk('IN_PROGRESS', 'Đang xử lý', ['NEW', 'ASSIGNED'].indexOf(st) !== -1),
    mk('NEED_INFO', 'Yêu cầu bổ sung', ['IN_PROGRESS', 'ASSIGNED', 'NEW'].indexOf(st) !== -1),
    mk('COMPLETE', 'Hoàn tất', ['IN_PROGRESS', 'WAITING', 'ASSIGNED', 'NEW'].indexOf(st) !== -1),
    mk('ESCALATE_ADMIN', 'Chuyển admin', ['IN_PROGRESS', 'NEW', 'ASSIGNED', 'WAITING'].indexOf(st) !== -1)
  ];
}

/**
 * @param {string} taskId
 * @param {string} action
 * @param {string} note
 * @returns {{ handled: boolean, res: Object|null, hint: string }}
 */
function TASK_FE_Focus_dispatchServiceAction_(taskId, action, note) {
  var a = String(action || '').toUpperCase();
  var hint = 'Bind project apps-script/task hoặc thư viện có createTask/setTaskStatus/taskStartAction.';

  try {
    if (a === 'ACCEPT' || a === 'IN_PROGRESS') {
      if (typeof taskStartAction === 'function') {
        return { handled: true, res: taskStartAction(taskId), hint: hint };
      }
      if (typeof setTaskStatus === 'function') {
        return { handled: true, res: setTaskStatus(taskId, 'IN_PROGRESS', note || ''), hint: hint };
      }
    }
    if (a === 'NEED_INFO') {
      if (typeof setTaskStatus === 'function') {
        var extraN = note || 'Yêu cầu bổ sung thông tin';
        if (typeof updateTask === 'function') {
          try {
            updateTask(taskId, { PENDING_ACTION: 'INFO_REQUEST' });
          } catch (e1) {
            /* optional */
          }
        }
        return { handled: true, res: setTaskStatus(taskId, 'WAITING', extraN), hint: hint };
      }
    }
    if (a === 'ESCALATE_ADMIN') {
      if (typeof setTaskStatus === 'function') {
        if (typeof updateTask === 'function') {
          try {
            updateTask(taskId, { PENDING_ACTION: 'ADMIN_APPROVAL' });
          } catch (e2) {
            /* optional */
          }
        }
        return { handled: true, res: setTaskStatus(taskId, 'WAITING', note || 'Chuyển admin xử lý'), hint: hint };
      }
    }
    if (a === 'COMPLETE') {
      if (typeof taskCompleteAction === 'function') {
        return { handled: true, res: taskCompleteAction(taskId, note || ''), hint: hint };
      }
      if (typeof completeTask === 'function') {
        return { handled: true, res: completeTask(taskId, note || ''), hint: hint };
      }
    }
  } catch (e) {
    return { handled: true, res: { ok: false, code: 'TASK_EXCEPTION', message: String(e.message || e), data: null, errors: [] }, hint: hint };
  }

  return { handled: false, res: null, hint: hint };
}
