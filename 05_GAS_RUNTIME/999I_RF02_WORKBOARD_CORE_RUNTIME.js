/**
 * PHASE_RF_02 — Workboard Core Runtime (adapters)
 *
 * Read-first projections: task list/detail, timeline, search, notification, file stubs.
 * No schema change. No destructive writes.
 */

var CBV_RF02_PHASE_ID = 'PHASE_RF_02_WORKBOARD_CORE';
var CBV_RF02_CONTRACT_VERSION = 'CBV_RF02_V1';

function CbvRf02__safeEnvelope_(payload) {
  var p = payload || {};
  return {
    ok: p.ok !== false,
    phase: CBV_RF02_PHASE_ID,
    contractVersion: CBV_RF02_CONTRACT_VERSION,
    empty: p.empty === true,
    data: p.data != null ? p.data : null,
    warnings: p.warnings || [],
    errors: p.errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CbvRf02__routeHref_(path, params) {
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function' && params && Object.keys(params).length) {
    try {
      return CbvWebAppRouteUrl_buildWithQuery(path, params);
    } catch (e0) { /* fall through */ }
  }
  if (typeof CbvWebAppRouteUrl_build === 'function') {
    try {
      return CbvWebAppRouteUrl_build(path);
    } catch (e1) { /* fall through */ }
  }
  return path;
}

function CbvRf02__normalizeTaskItem_(row, userContext) {
  var t = row || {};
  var taskId = String(t.taskId || t.id || '').trim();
  var assignee = String(t.assignedTo || '').trim();
  var lastUpdated = String(t.dueAt || (t.raw && t.raw.updatedAt) || '').trim();
  return {
    taskId: taskId,
    title: String(t.title || '(Không tiêu đề)').trim(),
    status: String(t.status || '').trim(),
    assignee: assignee,
    priority: String(t.priority || '').trim(),
    dueDate: lastUpdated,
    module: String(t.sourceModule || 'HOME_ALERT').trim(),
    lastUpdated: lastUpdated,
    href: CbvRf02__routeHref_('/workspace/workboard/task-detail', taskId ? { taskId: taskId } : {}),
    permissionAllowed: CBV_Permission_can(userContext, CBV_PERMISSION_ACTIONS.TASK_VIEW, null)
  };
}

function CbvRf02TaskList__filterRows_(rows, filterKey, userContext) {
  var fk = String(filterKey || 'all').toLowerCase();
  var email = String((userContext && userContext.email) || '').trim().toLowerCase();
  var list = rows || [];

  if (fk === 'mine') {
    return list.filter(function (t) {
      var a = String(t.assignedTo || '').trim().toLowerCase();
      return a && email && (a === email || a.indexOf(email) >= 0);
    });
  }
  if (fk === 'overdue') {
    return list.filter(function (t) {
      var s = String(t.slaState || '').toUpperCase();
      return s.indexOf('OVER') >= 0 || s.indexOf('BREACH') >= 0;
    });
  }
  if (fk === 'pending') {
    return list.filter(function (t) {
      if (typeof CbvStaffWorkspace__isPendingStatus_ === 'function') {
        return CbvStaffWorkspace__isPendingStatus_(t.status);
      }
      var u = String(t.status || '').toUpperCase();
      return u && u !== 'DONE' && u !== 'RESOLVED' && u !== 'CLOSED' && u !== 'CANCELLED';
    });
  }
  if (fk === 'approval' || fk === 'waiting') {
    return list.filter(function (t) {
      var u = String(t.status || '').toUpperCase();
      return u.indexOf('WAIT') >= 0 || u.indexOf('APPROV') >= 0 || u.indexOf('PENDING') >= 0;
    });
  }
  return list;
}

/**
 * Task list v1 — safe envelope from HOME_ALERT adapter.
 */
function CbvRf02TaskList_getModel_(userContext, filterKey) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var warnings = (ctx.warnings || []).slice();
  var errors = [];

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.TASK_LIST, null);
  } catch (ePerm) {
    return CbvRf02__safeEnvelope_({
      ok: false,
      empty: true,
      data: { items: [], filter: filterKey || 'all', counts: {} },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  var norm = [];
  if (typeof CbvStaffWorkspace_getTaskInboxModel_ === 'function') {
    try {
      var inbox = CbvStaffWorkspace_getTaskInboxModel_(ctx.email);
      warnings = warnings.concat(inbox.adapterWarnings || []);
      norm = inbox.inbox || [];
    } catch (eIn) {
      warnings.push('inbox: ' + (eIn && eIn.message ? eIn.message : String(eIn)));
    }
  } else {
    warnings.push('CbvStaffWorkspace_getTaskInboxModel_ not loaded');
  }

  var filtered = CbvRf02TaskList__filterRows_(norm, filterKey, ctx);
  var items = filtered.map(function (r) {
    return CbvRf02__normalizeTaskItem_(r, ctx);
  });

  return CbvRf02__safeEnvelope_({
    ok: true,
    empty: items.length === 0,
    data: {
      items: items,
      filter: String(filterKey || 'all'),
      counts: {
        total: norm.length,
        shown: items.length
      },
      filtersAvailable: ['mine', 'overdue', 'pending', 'approval', 'all']
    },
    warnings: warnings,
    errors: errors
  });
}

/**
 * Task detail v1 — safe handling for missing/unknown id.
 */
function CbvRf02TaskDetail_getModel_(userContext, taskId) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var tid = String(taskId || '').trim();
  var warnings = (ctx.warnings || []).slice();

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.TASK_DETAIL, null);
  } catch (ePerm) {
    return CbvRf02__safeEnvelope_({
      ok: false,
      empty: true,
      data: null,
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  if (!tid) {
    return CbvRf02__safeEnvelope_({
      ok: true,
      empty: true,
      data: { task: null, quickActions: [], files: [] },
      warnings: warnings.concat(['NO_TASK_ID'])
    });
  }

  var detail = null;
  if (typeof CbvStaffWorkspace_getTaskDetailModel_ === 'function') {
    try {
      detail = CbvStaffWorkspace_getTaskDetailModel_(tid);
      warnings = warnings.concat(detail.warnings || []);
    } catch (eDet) {
      return CbvRf02__safeEnvelope_({
        ok: true,
        empty: true,
        data: { task: null, taskId: tid, quickActions: [], files: [] },
        warnings: warnings.concat(['DETAIL_ERROR: ' + (eDet && eDet.message ? eDet.message : String(eDet))])
      });
    }
  } else {
    warnings.push('CbvStaffWorkspace_getTaskDetailModel_ not loaded');
    return CbvRf02__safeEnvelope_({
      ok: true,
      empty: true,
      data: { task: null, taskId: tid, quickActions: [], files: [] },
      warnings: warnings
    });
  }

  if (detail.empty || !detail.task) {
    return CbvRf02__safeEnvelope_({
      ok: true,
      empty: true,
      data: {
        task: null,
        taskId: tid,
        quickActions: [],
        files: [],
        notFound: true
      },
      warnings: warnings
    });
  }

  var task = CbvRf02__normalizeTaskItem_(detail.task, ctx);
  task.description = String((detail.task.raw && detail.task.raw.operatorMetaText) || detail.task.nextAction || '').trim();
  task.assignee = task.assignee || String(detail.task.assignedTo || '').trim();

  var quickActions = CBV_Permission_filterActions(ctx, [
    { code: CBV_PERMISSION_ACTIONS.TASK_STATUS_UPDATE, label: 'Cập nhật trạng thái', stub: true },
    { code: CBV_PERMISSION_ACTIONS.TASK_ASSIGN, label: 'Giao việc', stub: true },
    { code: CBV_PERMISSION_ACTIONS.FILE_UPLOAD_STUB, label: 'Tải file lên', stub: true }
  ]);

  var filesEnv = CbvRf02File_getModel_(ctx, tid);

  return CbvRf02__safeEnvelope_({
    ok: true,
    empty: false,
    data: {
      task: task,
      timelineRoute: CbvRf02__routeHref_('/workspace/workboard/task-detail', { taskId: tid }),
      quickActions: quickActions,
      files: (filesEnv.data && filesEnv.data.items) ? filesEnv.data.items : [],
      correlationId: detail.correlationId || tid
    },
    warnings: warnings
  });
}

function CbvRf02Timeline__readTaskUpdateLog_(taskId) {
  var events = [];
  var tid = String(taskId || '').trim();
  if (!tid) return events;
  try {
    var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_UPDATE_LOG)
      ? CBV_CONFIG.SHEETS.TASK_UPDATE_LOG
      : 'TASK_UPDATE_LOG';
    var ss = SpreadsheetApp.getActive();
    var sheet = ss ? ss.getSheetByName(sheetName) : null;
    if (!sheet || sheet.getLastRow() < 2) return events;
    if (typeof loadSheetDataSafe === 'function') {
      var loaded = loadSheetDataSafe(sheet, sheetName);
      var rows = (loaded && loaded.rows) ? loaded.rows : [];
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (String(r.TASK_ID || '') !== tid) continue;
        if (r.IS_DELETED === true || String(r.IS_DELETED) === 'true') continue;
        events.push({
          time: r.CREATED_AT || r.UPDATED_AT || '',
          actor: r.ACTOR_ID || r.CREATED_BY || '',
          action: r.ACTION || r.UPDATE_TYPE || 'NOTE',
          message: r.NOTE || r.CONTENT || String(r.ACTION || r.UPDATE_TYPE || ''),
          source: 'TASK_UPDATE_LOG'
        });
      }
    }
  } catch (eLog) { /* read-only safe */ }
  return events;
}

/**
 * Timeline read v1 — TASK_UPDATE_LOG + HOME_ALERT synthetic events.
 */
function CbvRf02Timeline_getModel_(userContext, taskId) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var tid = String(taskId || '').trim();
  var warnings = (ctx.warnings || []).slice();

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.TASK_VIEW, null);
  } catch (ePerm) {
    return CbvRf02__safeEnvelope_({
      ok: false,
      empty: true,
      data: { items: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  if (!tid) {
    return CbvRf02__safeEnvelope_({
      ok: true,
      empty: true,
      data: { items: [] },
      warnings: warnings.concat(['NO_TASK_ID'])
    });
  }

  var items = CbvRf02Timeline__readTaskUpdateLog_(tid);
  if (typeof CbvStaffWorkspace_getTaskTimeline_ === 'function') {
    try {
      var syn = CbvStaffWorkspace_getTaskTimeline_(tid) || [];
      for (var s = 0; s < syn.length; s++) {
        var ev = syn[s];
        items.push({
          time: ev.at || '',
          actor: '',
          action: ev.kind || ev.label || 'event',
          message: ev.detail || ev.label || '',
          source: 'HOME_ALERT'
        });
      }
    } catch (eSyn) {
      warnings.push('synthetic timeline: ' + (eSyn && eSyn.message ? eSyn.message : String(eSyn)));
    }
  }
  if (!items.length) {
    warnings.push('TIMELINE_EMPTY — không có log trong phạm vi read-first');
  }

  return CbvRf02__safeEnvelope_({
    ok: true,
    empty: items.length === 0,
    data: { taskId: tid, items: items },
    warnings: warnings
  });
}

function CbvRf02Search__matchTask_(row, q, ctx) {
  var t = row || {};
  var ql = String(q || '').trim().toLowerCase();
  if (!ql) return null;
  var taskId = String(t.taskId || '').trim();
  var title = String(t.title || '').trim();
  if (taskId && taskId.toLowerCase() === ql) {
    return { matchedField: 'taskId', matchedValue: taskId };
  }
  if (taskId && taskId.toLowerCase().indexOf(ql) >= 0) {
    return { matchedField: 'taskId', matchedValue: taskId };
  }
  if (title && title.toLowerCase().indexOf(ql) >= 0) {
    return { matchedField: 'title', matchedValue: title };
  }
  return null;
}

/**
 * Unified search stub v1 — task search real; other modules stub empty.
 */
function CbvRf02Search_search_(userContext, opts) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var o = opts || {};
  var q = String(o.keyword || o.q || '').trim();
  var moduleFilter = String(o.module || '').trim().toLowerCase();
  var warnings = (ctx.warnings || []).slice();
  var groups = [];

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.SEARCH_RUN, null);
  } catch (ePerm) {
    return CbvRf02__safeEnvelope_({
      ok: false,
      empty: true,
      data: { query: q, groups: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  if (q.length < 2 && q.indexOf('_') < 0 && q.indexOf('-') < 0) {
    return CbvRf02__safeEnvelope_({
      ok: true,
      empty: true,
      data: { query: q, groups: [], hint: 'Nhập ít nhất 2 ký tự hoặc mã việc chính xác.' },
      warnings: warnings.concat(['QUERY_TOO_SHORT'])
    });
  }

  var taskItems = [];
  if (!moduleFilter || moduleFilter === 'task') {
    if (typeof CbvStaffWorkspace_getTaskInboxModel_ === 'function') {
      var inbox = CbvStaffWorkspace_getTaskInboxModel_(ctx.email);
      warnings = warnings.concat(inbox.adapterWarnings || []);
      var norm = inbox.inbox || [];
      for (var i = 0; i < norm.length; i++) {
        var hit = CbvRf02Search__matchTask_(norm[i], q, ctx);
        if (!hit) continue;
        var nt = CbvRf02__normalizeTaskItem_(norm[i], ctx);
        taskItems.push({
          id: nt.taskId,
          type: 'TASK',
          title: nt.title,
          subtitle: nt.status,
          status: nt.status,
          module: 'TASK',
          href: nt.href,
          matchedField: hit.matchedField,
          permissionAllowed: nt.permissionAllowed
        });
        if (taskItems.length >= 20) break;
      }
    }
    groups.push({ module: 'TASK', label: 'Công việc', items: taskItems });
  }

  if (!moduleFilter || moduleFilter === 'finance') {
    groups.push({
      module: 'FINANCE',
      label: 'Tài chính',
      items: [],
      stubNote: 'RF_02 stub — chưa bind FINANCE search'
    });
  }
  if (!moduleFilter || moduleFilter === 'ho_so' || moduleFilter === 'hoso') {
    groups.push({
      module: 'HO_SO',
      label: 'Hồ sơ',
      items: [],
      stubNote: 'RF_02 stub — chưa bind HO_SO search'
    });
  }
  if (!moduleFilter || moduleFilter === 'file') {
    groups.push({
      module: 'FILE',
      label: 'File',
      items: [],
      stubNote: 'RF_02 stub — chưa bind file metadata search'
    });
  }

  var total = taskItems.length;
  return CbvRf02__safeEnvelope_({
    ok: true,
    empty: total === 0,
    data: { query: q, module: moduleFilter || 'all', groups: groups, total: total },
    warnings: warnings
  });
}

function CbvRf02Notification__severity_(slaState, status) {
  var s = String(slaState || '').toUpperCase();
  if (s.indexOf('BREACH') >= 0 || s.indexOf('OVER') >= 0) return 'high';
  if (typeof CbvStaffWorkspace__isBlockedStatus_ === 'function' && CbvStaffWorkspace__isBlockedStatus_(status)) return 'medium';
  return 'low';
}

/**
 * Notification center stub v1 — derived from HOME_ALERT inbox.
 */
function CbvRf02Notification_getModel_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var warnings = (ctx.warnings || []).slice();
  var items = [];

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.NOTIFICATION_VIEW, null);
  } catch (ePerm) {
    return CbvRf02__safeEnvelope_({
      ok: false,
      empty: true,
      data: { items: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  if (typeof CbvStaffWorkspace_getTaskInboxModel_ === 'function') {
    try {
      var inbox = CbvStaffWorkspace_getTaskInboxModel_(ctx.email);
      var norm = inbox.inbox || [];
      for (var i = 0; i < norm.length; i++) {
        var t = norm[i];
        var sla = String(t.slaState || '').toUpperCase();
        var st = String(t.status || '');
        var isOver = sla.indexOf('OVER') >= 0 || sla.indexOf('BREACH') >= 0;
        var isBlocked = typeof CbvStaffWorkspace__isBlockedStatus_ === 'function' && CbvStaffWorkspace__isBlockedStatus_(st);
        var isPending = typeof CbvStaffWorkspace__isPendingStatus_ === 'function' && CbvStaffWorkspace__isPendingStatus_(st);
        if (!isOver && !isBlocked && !isPending) continue;
        var type = isOver ? 'task_overdue' : (isBlocked ? 'task_returned' : 'task_pending');
        items.push({
          id: 'N_' + String(t.taskId || i),
          type: type,
          severity: CbvRf02Notification__severity_(t.slaState, t.status),
          title: t.title || t.taskId,
          message: isOver ? 'Việc quá hạn / SLA' : (isBlocked ? 'Việc bị chặn / trả lại' : 'Việc chờ xử lý'),
          href: CbvRf02__routeHref_('/workspace/workboard/task-detail', t.taskId ? { taskId: t.taskId } : {}),
          createdAt: t.dueAt || '',
          read: false
        });
        if (items.length >= 30) break;
      }
    } catch (eN) {
      warnings.push('notification: ' + (eN && eN.message ? eN.message : String(eN)));
    }
  } else {
    warnings.push('CbvStaffWorkspace_getTaskInboxModel_ not loaded');
  }

  return CbvRf02__safeEnvelope_({
    ok: true,
    empty: items.length === 0,
    data: { items: items, financeStub: true, hosoStub: true },
    warnings: warnings
  });
}

/**
 * File runtime stub v1 — read Drive links from card raw if present; no migration.
 */
function CbvRf02File_getModel_(userContext, linkedTo) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var linkId = String(linkedTo || '').trim();
  var warnings = [];
  var items = [];

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.FILE_VIEW, null);
  } catch (ePerm) {
    return CbvRf02__safeEnvelope_({
      ok: false,
      empty: true,
      data: { items: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  if (linkId && typeof CbvStaffWorkspace__findCardById_ === 'function') {
    try {
      var card = CbvStaffWorkspace__findCardById_(linkId);
      if (card) {
        var raw = card.raw || card;
        var url = String(raw.driveUrl || raw.fileUrl || raw.attachmentUrl || '').trim();
        if (url && /^https:\/\//i.test(url)) {
          items.push({
            id: 'F_' + linkId,
            name: String(raw.fileName || 'File liên quan').trim(),
            type: 'link',
            url: url,
            source: 'HOME_ALERT',
            linkedTo: linkId,
            createdAt: String(raw.updatedAt || '')
          });
        }
      }
    } catch (eF) {
      warnings.push('file probe: ' + (eF && eF.message ? eF.message : String(eF)));
    }
  }

  if (!items.length) {
    warnings.push('FILE_STUB_EMPTY — upload action stub only; không di chuyển file');
  }

  return CbvRf02__safeEnvelope_({
    ok: true,
    empty: items.length === 0,
    data: {
      items: items,
      uploadStub: true,
      uploadAllowed: CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.FILE_UPLOAD_STUB, null)
    },
    warnings: warnings
  });
}
