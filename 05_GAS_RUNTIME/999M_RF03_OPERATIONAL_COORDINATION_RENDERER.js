/**
 * PHASE_RF_03 — Operational Coordination Renderer
 */

function CbvRf03Coord__esc_(s) {
  return String(s != null ? s : '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function CbvRf03Coord__href_(path, params) {
  if (typeof CBV_Coordination__href_ === 'function') return CBV_Coordination__href_(path, params);
  if (typeof CbvRf02Workboard__href_ === 'function') return CbvRf02Workboard__href_(path, params);
  return path;
}

function CbvRf03Coord_buildNavHtml_(activeRoute, ctx) {
  var ar = String(activeRoute || '');
  var canTeam = CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_TEAM_VIEW, null);
  var tabs = [
    { route: '/workspace/coordination/manager', label: 'Điều phối', managerOnly: true },
    { route: '/workspace/coordination/queue', label: 'Queue' },
    { route: '/workspace/coordination/overdue', label: 'Quá hạn' },
    { route: '/workspace/coordination/workload', label: 'Tải NV' },
    { route: '/workspace/coordination/assignment', label: 'Giao việc' },
    { route: '/workspace/workboard', label: '← Workboard' }
  ];
  var out = '<nav class="cbv-rf03-nav cbv-thumb-zone" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    if (t.managerOnly && !canTeam) continue;
    var href = CbvRf03Coord__href_(t.route);
    var active = ar === t.route ? ' cbv-action-active' : '';
    out += '<a class="cbv-btn-operational cbv-action-xl cbv-busy-link' + active + '" href="' + CbvRf03Coord__esc_(href) + '">' + CbvRf03Coord__esc_(t.label) + '</a>';
  }
  out += '</nav>';
  return out;
}

function CbvRf03Coord_wrap_(inner, route, ctx) {
  var shellFn = typeof CbvRf02Workboard_wrapBody_ === 'function' ? CbvRf02Workboard_wrapBody_ : null;
  var header = '<div class="cbv-rf03-coord"><h2 style="margin-top:0">Điều phối vận hành</h2>' + CbvRf03Coord_buildNavHtml_(route, ctx) + '</div>';
  var body = header + (inner || '');
  if (shellFn) {
    return shellFn(body, route, ctx);
  }
  return '<div class="cbv-rf03-coord">' + body + '</div>';
}

function CbvRf03Coord__empty_(title, msg) {
  return '<div class="cbv-rf03-state cbv-workboard-empty-state cbv-card"><p><strong>' + CbvRf03Coord__esc_(title) + '</strong></p><p class="cbv-muted">' + CbvRf03Coord__esc_(msg) + '</p></div>';
}

function CbvRf03Coord__taskCards_(items) {
  if (!items || !items.length) return CbvRf03Coord__empty_('Trống', 'Không có việc trong nhóm này.');
  return items.map(function (it) {
    return (
      '<article class="cbv-rf03-queue-card cbv-card cbv-workboard-mobile-stack" style="margin-bottom:10px">' +
      '<strong>' + CbvRf03Coord__esc_(it.title) + '</strong>' +
      '<div class="cbv-muted" style="font-size:12px">' + CbvRf03Coord__esc_(it.status) + ' · ' + CbvRf03Coord__esc_(it.assignee || '—') + '</div>' +
      '<div class="cbv-muted" style="font-size:12px">Hạn: ' + CbvRf03Coord__esc_(it.dueDate || '—') + (it.ageDays != null ? ' · ' + it.ageDays + ' ngày' : '') + '</div>' +
      '<a class="cbv-workboard-primary-cta cbv-action-xl cbv-busy-link" href="' + CbvRf03Coord__esc_(it.href) + '">' + CbvRf03Coord__esc_(it.nextAction || 'Xem') + '</a></article>'
    );
  }).join('');
}

function CbvRf03Coord_renderManagerPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Coordination_getManagerModel_(ctx);
  if (!env.ok) {
    return { title: 'Điều phối', bodyHtml: CbvRf03Coord_wrap_(CbvRf03Coord__empty_('Không có quyền', (env.errors || []).join('; ')), '/workspace/coordination/manager', ctx) };
  }
  var cards = (env.data && env.data.cards) ? env.data.cards : [];
  var cardHtml = cards.map(function (c) {
    return (
      '<a class="cbv-rf03-coord-card cbv-card cbv-busy-link" href="' + CbvRf03Coord__esc_(c.href) + '" style="display:block;margin-bottom:10px;padding:12px;text-decoration:none;color:inherit">' +
      '<div style="font-size:28px;font-weight:700">' + CbvRf03Coord__esc_(String(c.count)) + '</div>' +
      '<div>' + CbvRf03Coord__esc_(c.label) + '</div>' +
      '<span class="cbv-badge">' + CbvRf03Coord__esc_(c.severity) + '</span></a>'
    );
  }).join('');
  var qa = (env.data && env.data.quickActions) ? env.data.quickActions : [];
  var qaHtml = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">' + qa.map(function (a) {
    var cls = a.enabled ? 'cbv-btn-operational' : 'cbv-muted';
    return '<span class="' + cls + ' cbv-action-xl" title="' + CbvRf03Coord__esc_(a.reason || '') + '">' + CbvRf03Coord__esc_(a.label) + (a.enabled ? '' : ' 🔒') + '</span>';
  }).join('') + '</div>';
  return {
    title: 'Điều phối — Manager',
    bodyHtml: CbvRf03Coord_wrap_('<div class="cbv-rf03-manager-cards">' + cardHtml + qaHtml + '</div>', '/workspace/coordination/manager', ctx)
  };
}

function CbvRf03Coord_renderQueuePage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Coordination_getQueueModel_(ctx);
  if (!env.ok) {
    return { title: 'Queue', bodyHtml: CbvRf03Coord_wrap_(CbvRf03Coord__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/coordination/queue', ctx) };
  }
  var queues = (env.data && env.data.queues) ? env.data.queues : [];
  var inner = queues.map(function (q) {
    return '<section class="cbv-rf03-queue-section cbv-card" style="margin-bottom:12px"><h3>' + CbvRf03Coord__esc_(q.label) + ' (' + q.count + ')</h3>' + CbvRf03Coord__taskCards_(q.items) + '</section>';
  }).join('');
  return { title: 'Queue', bodyHtml: CbvRf03Coord_wrap_(inner || CbvRf03Coord__empty_('Trống', 'Không có queue.'), '/workspace/coordination/queue', ctx) };
}

function CbvRf03Coord_renderOverduePage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Coordination_getOverdueModel_(ctx);
  if (!env.ok) {
    return { title: 'Quá hạn', bodyHtml: CbvRf03Coord_wrap_(CbvRf03Coord__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/coordination/overdue', ctx) };
  }
  var items = (env.data && env.data.items) ? env.data.items : [];
  var inner = items.length
    ? items.map(function (it) {
      return (
        '<article class="cbv-rf03-overdue-card cbv-card" style="margin-bottom:10px;border-left:4px solid #c0392b">' +
        '<strong>' + CbvRf03Coord__esc_(it.title) + '</strong>' +
        '<div class="cbv-muted">' + it.overdueDays + ' ngày quá hạn · ' + CbvRf03Coord__esc_(it.severity) + '</div>' +
        '<div class="cbv-muted">Phụ trách: ' + CbvRf03Coord__esc_(it.assignee || '—') + '</div>' +
        '<a class="cbv-workboard-primary-cta cbv-action-xl cbv-busy-link" href="' + CbvRf03Coord__esc_(it.href) + '">' + CbvRf03Coord__esc_(it.nextAction) + '</a></article>'
      );
    }).join('')
    : CbvRf03Coord__empty_('Không quá hạn', 'Không fake overdue khi thiếu dueDate.');
  if (env.data && env.data.unknownDueDateCount) {
    inner += '<p class="cbv-muted">Bỏ qua ' + env.data.unknownDueDateCount + ' mục thiếu ngày hạn.</p>';
  }
  return { title: 'Quá hạn', bodyHtml: CbvRf03Coord_wrap_(inner, '/workspace/coordination/overdue', ctx) };
}

function CbvRf03Coord_renderWorkloadPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Coordination_getWorkloadModel_(ctx);
  if (!env.ok) {
    return { title: 'Tải nhân sự', bodyHtml: CbvRf03Coord_wrap_(CbvRf03Coord__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/coordination/workload', ctx) };
  }
  var staff = (env.data && env.data.staff) ? env.data.staff : [];
  var inner = staff.length
    ? staff.map(function (s) {
      return (
        '<article class="cbv-rf03-workload-card cbv-card" style="margin-bottom:10px">' +
        '<strong>' + CbvRf03Coord__esc_(s.staffName) + '</strong> <span class="cbv-badge">' + CbvRf03Coord__esc_(s.loadStatus) + '</span>' +
        '<div class="cbv-kv" style="margin-top:8px">' +
        '<div class="cbv-muted">Đang giữ</div><div>' + s.activeCount + '</div>' +
        '<div class="cbv-muted">Quá hạn</div><div>' + s.overdueCount + '</div>' +
        '<div class="cbv-muted">Chờ duyệt</div><div>' + s.waitingApprovalCount + '</div>' +
        '<div class="cbv-muted">Kẹt</div><div>' + s.blockedCount + '</div>' +
        '</div><p class="cbv-muted">' + CbvRf03Coord__esc_(s.recommendedAction) + '</p></article>'
      );
    }).join('')
    : CbvRf03Coord__empty_('Trống', 'Chưa có dữ liệu tải từ projection hiện tại.');
  return { title: 'Tải nhân sự', bodyHtml: CbvRf03Coord_wrap_(inner, '/workspace/coordination/workload', ctx) };
}

function CbvRf03Coord_renderAssignmentPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var p = params || {};
  var taskId = String(p.taskId || '').trim();
  var can = CBV_Coordination_canAssign(ctx, { taskId: taskId });
  var opts = CBV_Coordination_getAssignmentOptions(ctx, taskId);
  var act = CBV_Coordination_buildAssignmentAction(ctx, { taskId: taskId });

  var inner = '<div class="cbv-card">' +
    '<h3 style="margin-top:0">Giao / chuyển việc</h3>' +
    '<p class="cbv-muted">Không auto-assign. Xác nhận thủ công.</p>' +
    (taskId ? '<p>Mã việc: <code>' + CbvRf03Coord__esc_(taskId) + '</code></p>' : '<p class="cbv-muted">Chọn việc từ queue trước.</p>') +
    '<p><strong>' + CbvRf03Coord__esc_(act.label) + '</strong>: ' + (act.enabled ? CbvRf03Coord__esc_(act.reason) : CbvRf03Coord__esc_(act.reason)) + '</p>';

  if (can && opts.options && opts.options.length) {
    inner += '<ul>' + opts.options.slice(0, 15).map(function (o) {
      return '<li>' + CbvRf03Coord__esc_(o.label) + ' <span class="cbv-muted">(' + CbvRf03Coord__esc_(o.userId) + ')</span></li>';
    }).join('') + '</ul>';
  } else if (!can) {
    inner += CbvRf03Coord__empty_('Không có quyền', 'Chỉ ADMIN/MANAGER được giao việc.');
  }

  inner += '<p class="cbv-muted" style="margin-top:12px">Trạng thái: EXECUTION_LOCKED — WebApp RF_03 read-only assignment.</p></div>';
  return { title: 'Giao việc', bodyHtml: CbvRf03Coord_wrap_(inner, '/workspace/coordination/assignment', ctx) };
}

function CbvRf03Coord_renderCoordinationHome_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  if (CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_TEAM_VIEW, null)) {
    return CbvRf03Coord_renderManagerPage_(params);
  }
  return CbvRf03Coord_renderQueuePage_(params);
}

function CbvRf03Coord_renderPageByType_(pageType, params) {
  var pt = String(pageType || '');
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF03_COORDINATION_HOME) return CbvRf03Coord_renderCoordinationHome_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF03_COORDINATION_MANAGER) return CbvRf03Coord_renderManagerPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF03_COORDINATION_QUEUE) return CbvRf03Coord_renderQueuePage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF03_COORDINATION_OVERDUE) return CbvRf03Coord_renderOverduePage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF03_COORDINATION_WORKLOAD) return CbvRf03Coord_renderWorkloadPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF03_COORDINATION_ASSIGNMENT) return CbvRf03Coord_renderAssignmentPage_(params);
  return { title: 'Coordination', bodyHtml: CbvRf03Coord__empty_('Unknown', pt) };
}
