/**
 * PHASE_RF_03 — Operational Coordination Runtime v1
 *
 * Read-first queue/overdue/workload + assignment with EXECUTION_LOCKED from WebApp.
 * No schema change. No auto-assign. Human-in-loop.
 */

var CBV_RF03_PHASE_ID = 'PHASE_RF_03_OPERATIONAL_COORDINATION';
var CBV_RF03_CONTRACT_VERSION = 'CBV_RF03_V1';
var CBV_RF03_COORDINATION_SOURCE = 'RF_03_COORDINATION';

function CBV_Coordination__safeEnvelope_(payload) {
  var p = payload || {};
  return {
    ok: p.ok !== false,
    phase: CBV_RF03_PHASE_ID,
    contractVersion: CBV_RF03_CONTRACT_VERSION,
    empty: p.empty === true,
    data: p.data != null ? p.data : null,
    warnings: p.warnings || [],
    errors: p.errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CBV_Coordination__href_(path, params) {
  if (typeof CbvRf02__routeHref_ === 'function') return CbvRf02__routeHref_(path, params);
  return path;
}

function CBV_Coordination__loadTasks_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var warnings = (ctx.warnings || []).slice();
  var rows = [];
  if (typeof CbvStaffWorkspace_getTaskInboxModel_ === 'function') {
    try {
      var inbox = CbvStaffWorkspace_getTaskInboxModel_(ctx.email);
      warnings = warnings.concat(inbox.adapterWarnings || []);
      rows = inbox.inbox || [];
    } catch (eIn) {
      warnings.push('inbox: ' + (eIn && eIn.message ? eIn.message : String(eIn)));
    }
  } else {
    warnings.push('CbvStaffWorkspace_getTaskInboxModel_ not loaded');
  }
  return { ctx: ctx, rows: rows, warnings: warnings };
}

function CBV_Coordination__canTeamView_(ctx) {
  return CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_TEAM_VIEW, null);
}

function CBV_Coordination__isMine_(row, ctx) {
  var email = String((ctx && ctx.email) || '').trim().toLowerCase();
  var a = String((row && row.assignedTo) || '').trim().toLowerCase();
  return !!(email && a && (a === email || a.indexOf(email) >= 0));
}

function CBV_Coordination__isUnassigned_(row) {
  return !String((row && row.assignedTo) || '').trim();
}

function CBV_Coordination__isBlocked_(row) {
  if (typeof CbvStaffWorkspace__isBlockedStatus_ === 'function') {
    return CbvStaffWorkspace__isBlockedStatus_(row.status);
  }
  return String(row.status || '').toUpperCase().indexOf('BLOCK') >= 0;
}

function CBV_Coordination__isWaitingApproval_(row) {
  var u = String(row.status || '').toUpperCase();
  return u.indexOf('WAIT') >= 0 || u.indexOf('APPROV') >= 0;
}

function CBV_Coordination__isOverdueRow_(row) {
  var s = String(row.slaState || '').toUpperCase();
  if (s.indexOf('OVER') >= 0 || s.indexOf('BREACH') >= 0) return true;
  var od = CBV_Coordination__overdueDays_(row.dueAt || row.dueDate || (row.raw && row.raw.updatedAt));
  return od != null && od > 0;
}

function CBV_Coordination__parseDate_(v) {
  if (v instanceof Date) return v.getTime();
  if (!v) return null;
  var t = new Date(v).getTime();
  return isNaN(t) ? null : t;
}

function CBV_Coordination__overdueDays_(dueVal) {
  var dueMs = CBV_Coordination__parseDate_(dueVal);
  if (dueMs == null) return null;
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var due = new Date(dueMs);
  due.setHours(0, 0, 0, 0);
  var diff = Math.floor((now.getTime() - due.getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

function CBV_Coordination__overdueSeverity_(days) {
  if (days == null || days <= 0) return 'OK';
  if (days <= 2) return 'WARNING';
  if (days <= 6) return 'ERROR';
  return 'CRITICAL';
}

function CBV_Coordination__toQueueItem_(row, ctx) {
  var taskId = String(row.taskId || '').trim();
  var due = row.dueAt || row.dueDate || '';
  var od = CBV_Coordination__overdueDays_(due);
  return {
    taskId: taskId,
    title: String(row.title || '(Không tiêu đề)').trim(),
    status: String(row.status || '').trim(),
    assignee: String(row.assignedTo || '').trim(),
    priority: String(row.priority || '').trim(),
    dueDate: String(due || ''),
    ageDays: od != null ? od : null,
    href: CBV_Coordination__href_('/workspace/workboard/task-detail', taskId ? { taskId: taskId } : {}),
    nextAction: String(row.nextAction || row.operatorNextAction || '').trim(),
    permissionAllowed: CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.TASK_VIEW, null)
  };
}

function CBV_Coordination__filterRowsForScope_(rows, ctx) {
  if (CBV_Coordination__canTeamView_(ctx)) return rows;
  return (rows || []).filter(function (r) { return CBV_Coordination__isMine_(r, ctx); });
}

function CBV_Coordination__buildQueue_(queueId, label, severity, items) {
  return {
    queueId: queueId,
    label: label,
    count: (items || []).length,
    severity: severity || 'OK',
    items: items || []
  };
}

/**
 * Queue Runtime v1 — read-first projection.
 */
function CBV_Coordination_getQueueModel_(userContext) {
  var loaded = CBV_Coordination__loadTasks_(userContext);
  var ctx = loaded.ctx;
  var warnings = loaded.warnings;

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_VIEW, null);
  } catch (ePerm) {
    return CBV_Coordination__safeEnvelope_({
      ok: false,
      empty: true,
      data: { queues: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  var scoped = CBV_Coordination__filterRowsForScope_(loaded.rows, ctx);
  var email = ctx.email;

  var myItems = scoped.filter(function (r) { return CBV_Coordination__isMine_(r, ctx); }).map(function (r) {
    return CBV_Coordination__toQueueItem_(r, ctx);
  });
  var teamItems = CBV_Coordination__canTeamView_(ctx)
    ? loaded.rows.map(function (r) { return CBV_Coordination__toQueueItem_(r, ctx); })
    : [];
  var unassignedItems = CBV_Coordination__canTeamView_(ctx)
    ? loaded.rows.filter(CBV_Coordination__isUnassigned_).map(function (r) { return CBV_Coordination__toQueueItem_(r, ctx); })
    : [];
  var waitingItems = scoped.filter(CBV_Coordination__isWaitingApproval_).map(function (r) {
    return CBV_Coordination__toQueueItem_(r, ctx);
  });
  var blockedItems = scoped.filter(CBV_Coordination__isBlocked_).map(function (r) {
    return CBV_Coordination__toQueueItem_(r, ctx);
  });
  var overdueItems = scoped.filter(CBV_Coordination__isOverdueRow_).map(function (r) {
    return CBV_Coordination__toQueueItem_(r, ctx);
  });

  var queues = [
    CBV_Coordination__buildQueue_('MY_QUEUE', 'Việc của tôi', 'OK', myItems),
    CBV_Coordination__buildQueue_('OVERDUE', 'Quá hạn', overdueItems.length ? 'ERROR' : 'OK', overdueItems),
    CBV_Coordination__buildQueue_('WAITING_APPROVAL', 'Chờ duyệt', waitingItems.length ? 'WARNING' : 'OK', waitingItems),
    CBV_Coordination__buildQueue_('BLOCKED', 'Bị kẹt', blockedItems.length ? 'WARNING' : 'OK', blockedItems)
  ];
  if (CBV_Coordination__canTeamView_(ctx)) {
    queues.push(CBV_Coordination__buildQueue_('TEAM_QUEUE', 'Queue đội', 'OK', teamItems));
    queues.push(CBV_Coordination__buildQueue_('UNASSIGNED', 'Chưa có người xử lý', unassignedItems.length ? 'WARNING' : 'OK', unassignedItems));
  } else if (!email) {
    warnings.push('STAFF_SCOPE: chỉ MY_QUEUE — không có email user');
  }

  return CBV_Coordination__safeEnvelope_({
    ok: true,
    empty: scoped.length === 0,
    data: { queues: queues, scope: CBV_Coordination__canTeamView_(ctx) ? 'TEAM' : 'SELF' },
    warnings: warnings
  });
}

/**
 * Overdue Runtime v1.
 */
function CBV_Coordination_getOverdueModel_(userContext) {
  var loaded = CBV_Coordination__loadTasks_(userContext);
  var ctx = loaded.ctx;
  var warnings = loaded.warnings;

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_VIEW, null);
  } catch (ePerm) {
    return CBV_Coordination__safeEnvelope_({
      ok: false,
      empty: true,
      data: { items: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  var scoped = CBV_Coordination__filterRowsForScope_(loaded.rows, ctx);
  var items = [];
  var unknownDue = 0;

  for (var i = 0; i < scoped.length; i++) {
    var row = scoped[i];
    var slaOver = CBV_Coordination__isOverdueRow_(row);
    if (!slaOver) continue;
    var due = row.dueAt || row.dueDate || '';
    var od = CBV_Coordination__overdueDays_(due);
    if (od == null && !String(row.slaState || '').match(/OVER|BREACH/i)) {
      unknownDue++;
      continue;
    }
    var days = od != null ? od : 1;
    items.push({
      taskId: String(row.taskId || '').trim(),
      title: String(row.title || '').trim(),
      assignee: String(row.assignedTo || '').trim(),
      dueDate: String(due || ''),
      overdueDays: days,
      severity: CBV_Coordination__overdueSeverity_(days),
      nextAction: String(row.nextAction || row.operatorNextAction || 'Xem chi tiết và xử lý').trim(),
      href: CBV_Coordination__href_('/workspace/workboard/task-detail', row.taskId ? { taskId: row.taskId } : {})
    });
  }

  if (unknownDue > 0) warnings.push('unknownDueDate: ' + unknownDue + ' row(s) skipped — không fake overdue');

  items.sort(function (a, b) { return (b.overdueDays || 0) - (a.overdueDays || 0); });

  return CBV_Coordination__safeEnvelope_({
    ok: true,
    empty: items.length === 0,
    data: { items: items, unknownDueDateCount: unknownDue },
    warnings: warnings
  });
}

function CBV_Coordination__workloadStatus_(active, overdue, waiting, blocked) {
  var score = active + overdue * 2 + waiting + blocked;
  if (active === 0 && overdue === 0) return 'OK';
  if (score >= 12 || overdue >= 4) return 'OVERLOADED';
  if (score >= 6 || overdue >= 2) return 'BUSY';
  return 'OK';
}

function CBV_Coordination__workloadAction_(status) {
  if (status === 'OVERLOADED') return 'Cân bằng tải — giao lại hoặc ưu tiên việc quá hạn';
  if (status === 'BUSY') return 'Theo dõi — có thể cần hỗ trợ';
  return 'Ổn định';
}

/**
 * Staff Workload Runtime v1.
 */
function CBV_Coordination_getWorkloadModel_(userContext) {
  var loaded = CBV_Coordination__loadTasks_(userContext);
  var ctx = loaded.ctx;
  var warnings = loaded.warnings;

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_VIEW, null);
  } catch (ePerm) {
    return CBV_Coordination__safeEnvelope_({
      ok: false,
      empty: true,
      data: { staff: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  if (!CBV_Coordination__canTeamView_(ctx)) {
    warnings.push('WORKLOAD_SELF_SCOPE — chỉ hiển thị tải của bạn');
  }

  var rows = CBV_Coordination__canTeamView_(ctx) ? loaded.rows : loaded.rows.filter(function (r) {
    return CBV_Coordination__isMine_(r, ctx);
  });

  var map = {};
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var key = String(r.assignedTo || '').trim() || '__UNASSIGNED__';
    if (!map[key]) {
      map[key] = { staffId: key, staffName: key === '__UNASSIGNED__' ? '(Chưa giao)' : key, active: 0, overdue: 0, waiting: 0, blocked: 0 };
    }
    var bucket = map[key];
    if (typeof CbvStaffWorkspace__isPendingStatus_ === 'function' ? CbvStaffWorkspace__isPendingStatus_(r.status) : true) bucket.active++;
    if (CBV_Coordination__isOverdueRow_(r)) bucket.overdue++;
    if (CBV_Coordination__isWaitingApproval_(r)) bucket.waiting++;
    if (CBV_Coordination__isBlocked_(r)) bucket.blocked++;
  }

  var staff = [];
  var keys = Object.keys(map);
  for (var k = 0; k < keys.length; k++) {
    var b = map[keys[k]];
    var ls = CBV_Coordination__workloadStatus_(b.active, b.overdue, b.waiting, b.blocked);
    staff.push({
      staffId: b.staffId,
      staffName: b.staffName,
      role: '',
      activeCount: b.active,
      overdueCount: b.overdue,
      waitingApprovalCount: b.waiting,
      blockedCount: b.blocked,
      loadStatus: ls,
      recommendedAction: CBV_Coordination__workloadAction_(ls)
    });
  }
  staff.sort(function (a, b) {
    var sa = (a.loadStatus === 'OVERLOADED' ? 3 : a.loadStatus === 'BUSY' ? 2 : 1);
    var sb = (b.loadStatus === 'OVERLOADED' ? 3 : b.loadStatus === 'BUSY' ? 2 : 1);
    return sb - sa || (b.overdueCount - a.overdueCount);
  });

  return CBV_Coordination__safeEnvelope_({
    ok: true,
    empty: staff.length === 0,
    data: { staff: staff },
    warnings: warnings
  });
}

function CBV_Coordination_canAssign(userContext, task) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  return CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_ASSIGN, { task: task });
}

function CBV_Coordination_getAssignmentOptions(userContext, taskId) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var warnings = [];
  if (!CBV_Coordination_canAssign(ctx, { taskId: taskId })) {
    return { ok: false, options: [], warnings: ['Permission denied for assignment'], executionLocked: true };
  }
  var options = [];
  if (typeof getActiveUsers === 'function') {
    try {
      options = getActiveUsers().map(function (u) {
        return { userId: u.id, label: u.displayText || u.name || u.code, email: u.email };
      });
    } catch (eU) {
      warnings.push('getActiveUsers: ' + (eU && eU.message ? eU.message : String(eU)));
    }
  } else {
    warnings.push('getActiveUsers not loaded — options empty');
  }
  return { ok: true, options: options, warnings: warnings, executionLocked: true };
}

function CBV_Coordination_buildAssignmentAction(userContext, task) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var tid = String((task && task.taskId) || task || '').trim();
  var can = CBV_Coordination_canAssign(ctx, task);
  return {
    actionId: 'ASSIGN_TASK',
    label: 'Giao việc',
    type: 'ASSIGN',
    resourceType: 'TASK',
    resourceId: tid,
    enabled: can,
    reason: can ? 'EXECUTION_LOCKED — xác nhận trên AppSheet/menu nghiệp vụ' : 'Không có quyền giao việc',
    requiresConfirmation: true,
    href: CBV_Coordination__href_('/workspace/coordination/assignment', tid ? { taskId: tid } : {})
  };
}

function CBV_Coordination_buildCoordinationEvent_(payload) {
  var p = payload || {};
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function') ? CbvWebAppWorkspace__traceId_() : ('RF03_' + new Date().getTime());
  return {
    eventId: 'CE_' + traceId,
    taskId: String(p.taskId || '').trim(),
    actor: String(p.actor || (typeof cbvUser === 'function' ? cbvUser() : '')).trim(),
    action: String(p.action || 'COORDINATION').trim(),
    before: p.before != null ? p.before : null,
    after: p.after != null ? p.after : null,
    message: String(p.message || '').trim(),
    createdAt: (typeof cbvNow === 'function') ? cbvNow() : new Date(),
    traceId: traceId,
    source: CBV_RF03_COORDINATION_SOURCE
  };
}

/**
 * Assignment — never auto-runs from WebApp RF_03 without confirmed business path.
 */
function CBV_Coordination_assignTask(input) {
  var inp = input || {};
  var ctx = CBV_Permission_getCurrentUserContext();
  var taskId = String(inp.taskId || '').trim();
  var ownerId = String(inp.ownerId || inp.assigneeId || '').trim();
  var warnings = [];

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_ASSIGN, { taskId: taskId });
  } catch (ePerm) {
    return {
      ok: false,
      status: 'PERMISSION_DENIED',
      message: ePerm && ePerm.message ? ePerm.message : String(ePerm),
      executionLocked: true
    };
  }

  if (inp.confirmed !== true) {
    return {
      ok: false,
      status: 'CONFIRMATION_REQUIRED',
      message: 'Cần xác nhận thủ công (confirmed=true) — không auto-assign',
      executionLocked: true
    };
  }

  var taskMain = typeof taskFindById === 'function' ? taskFindById(taskId) : null;
  if (!taskMain) {
    warnings.push('Task không có trong TASK_MAIN — HOME_ALERT read-only');
    return {
      ok: false,
      status: 'EXECUTION_LOCKED',
      message: 'STUB_PENDING_SAFE_UPDATE — giao việc qua AppSheet hoặc menu nghiệp vụ TASK_MAIN',
      executionLocked: true,
      warnings: warnings,
      event: CBV_Coordination_buildCoordinationEvent_({
        taskId: taskId,
        action: 'ASSIGN_ATTEMPT',
        message: 'WebApp RF_03 locked — no TASK_MAIN row',
        before: null,
        after: { ownerId: ownerId }
      })
    };
  }

  return {
    ok: false,
    status: 'EXECUTION_LOCKED',
    message: 'WebApp RF_03 không ghi TASK_MAIN trực tiếp — dùng assignTask từ menu nghiệp vụ sau pilot',
    executionLocked: true,
    warnings: ['assignTask() exists but WebApp path intentionally locked in RF_03'],
    event: CBV_Coordination_buildCoordinationEvent_({
      taskId: taskId,
      action: 'ASSIGN_LOCKED',
      message: 'Execution locked for production safety',
      before: { OWNER_ID: taskMain.OWNER_ID },
      after: { OWNER_ID: ownerId }
    })
  };
}

/**
 * Manager coordination dashboard model.
 */
function CBV_Coordination_getManagerModel_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var warnings = [];

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_VIEW, null);
  } catch (ePerm) {
    return CBV_Coordination__safeEnvelope_({
      ok: false,
      empty: true,
      data: null,
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  var q = CBV_Coordination_getQueueModel_(ctx);
  var od = CBV_Coordination_getOverdueModel_(ctx);
  var wl = CBV_Coordination_getWorkloadModel_(ctx);
  warnings = warnings.concat(q.warnings || [], od.warnings || [], wl.warnings || []);

  var queues = (q.data && q.data.queues) ? q.data.queues : [];
  function countId(id) {
    for (var i = 0; i < queues.length; i++) {
      if (queues[i].queueId === id) return queues[i].count || 0;
    }
    return 0;
  }

  var overloaded = ((wl.data && wl.data.staff) ? wl.data.staff : []).filter(function (s) {
    return s.loadStatus === 'OVERLOADED';
  }).length;

  return CBV_Coordination__safeEnvelope_({
    ok: true,
    empty: false,
    data: {
      cards: [
        { id: 'today', label: 'Việc hôm nay', count: countId('MY_QUEUE'), severity: 'OK', href: CBV_Coordination__href_('/workspace/coordination/queue') },
        { id: 'overdue', label: 'Quá hạn', count: countId('OVERDUE'), severity: countId('OVERDUE') ? 'ERROR' : 'OK', href: CBV_Coordination__href_('/workspace/coordination/overdue') },
        { id: 'approval', label: 'Chờ duyệt', count: countId('WAITING_APPROVAL'), severity: countId('WAITING_APPROVAL') ? 'WARNING' : 'OK', href: CBV_Coordination__href_('/workspace/coordination/queue') },
        { id: 'unassigned', label: 'Chưa giao', count: countId('UNASSIGNED'), severity: countId('UNASSIGNED') ? 'WARNING' : 'OK', href: CBV_Coordination__href_('/workspace/coordination/queue') },
        { id: 'overload', label: 'Quá tải', count: overloaded, severity: overloaded ? 'CRITICAL' : 'OK', href: CBV_Coordination__href_('/workspace/coordination/workload') }
      ],
      scope: q.data ? q.data.scope : 'SELF',
      quickActions: CBV_Coordination_getQuickActions_(ctx)
    },
    warnings: warnings
  });
}

function CBV_Coordination_getQuickActions_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var actions = [
    {
      actionId: 'QA_ASSIGN',
      label: 'Giao việc',
      type: 'ASSIGN',
      resourceType: 'TASK',
      resourceId: '',
      enabled: CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_ASSIGN, null),
      reason: CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_ASSIGN, null) ? 'EXECUTION_LOCKED' : 'Không có quyền',
      requiresConfirmation: true,
      href: CBV_Coordination__href_('/workspace/coordination/assignment')
    },
    {
      actionId: 'QA_REASSIGN',
      label: 'Chuyển xử lý',
      type: 'REASSIGN',
      resourceType: 'TASK',
      resourceId: '',
      enabled: CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_ASSIGN, null),
      reason: 'EXECUTION_LOCKED — stub RF_03',
      requiresConfirmation: true,
      href: CBV_Coordination__href_('/workspace/coordination/assignment')
    },
    {
      actionId: 'QA_TIMELINE',
      label: 'Xem timeline',
      type: 'VIEW',
      resourceType: 'TASK',
      resourceId: '',
      enabled: CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.TASK_VIEW, null),
      reason: '',
      requiresConfirmation: false,
      href: CBV_Coordination__href_('/workspace/workboard/task-detail')
    },
    {
      actionId: 'QA_DETAIL',
      label: 'Mở chi tiết',
      type: 'VIEW',
      resourceType: 'TASK',
      resourceId: '',
      enabled: CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.TASK_DETAIL, null),
      reason: '',
      requiresConfirmation: false,
      href: CBV_Coordination__href_('/workspace/workboard/tasks')
    },
    {
      actionId: 'QA_WATCH',
      label: 'Theo dõi',
      type: 'WATCH',
      resourceType: 'TASK',
      resourceId: '',
      enabled: false,
      reason: 'Stub — chưa có safe watch flag',
      requiresConfirmation: false,
      href: '#'
    },
    {
      actionId: 'QA_REMIND',
      label: 'Nhắc xử lý',
      type: 'REMIND',
      resourceType: 'TASK',
      resourceId: '',
      enabled: false,
      reason: 'Stub — chưa có safe remind mechanism',
      requiresConfirmation: true,
      href: '#'
    }
  ];
  return actions;
}
