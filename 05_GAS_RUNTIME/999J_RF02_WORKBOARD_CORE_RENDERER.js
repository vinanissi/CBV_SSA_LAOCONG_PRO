/**
 * PHASE_RF_02 — Workboard Core Renderer
 *
 * RF02 shell + pages: tasks, task-detail, search, notifications, files.
 * Uses existing WEBAPP_WORKSPACE_SHELL via CbvWebAppWorkspace_renderShell_ pattern.
 */

function CbvRf02Workboard__esc_(s) {
  return String(s != null ? s : '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function CbvRf02Workboard__href_(path, params) {
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function' && params && Object.keys(params).length) {
    try {
      return CbvWebAppRouteUrl_buildWithQuery(path, params);
    } catch (e0) { /* */ }
  }
  if (typeof CbvWebAppRouteUrl_build === 'function') {
    try {
      return CbvWebAppRouteUrl_build(path);
    } catch (e1) { /* */ }
  }
  return path;
}

function CbvRf02Workboard_buildHeaderHtml_(ctx, activeRoute) {
  var c = ctx || CBV_Permission_getCurrentUserContext();
  var searchHref = CbvRf02Workboard__href_('/workspace/workboard/search');
  var notifHref = CbvRf02Workboard__href_('/workspace/workboard/notifications');
  return (
    '<header class="cbv-rf02-header cbv-card" style="margin-bottom:12px;padding:12px">' +
    '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between">' +
    '<div><strong>CBV Workboard</strong><div class="cbv-muted" style="font-size:12px">' +
    CbvRf02Workboard__esc_(c.displayName || c.email || 'Khách') + ' · ' + CbvRf02Workboard__esc_(c.role || 'VIEW_ONLY') +
    '</div></div>' +
    '<div class="cbv-rf02-header-actions" style="display:flex;gap:8px;flex-wrap:wrap">' +
    (CBV_Permission_can(c, CBV_PERMISSION_ACTIONS.SEARCH_RUN, null)
      ? '<a class="cbv-btn-operational cbv-action-xl cbv-busy-link" href="' + CbvRf02Workboard__esc_(searchHref) + '">🔍 Tìm</a>'
      : '') +
    (CBV_Permission_can(c, CBV_PERMISSION_ACTIONS.NOTIFICATION_VIEW, null)
      ? '<a class="cbv-btn-operational cbv-busy-link" href="' + CbvRf02Workboard__esc_(notifHref) + '">🔔</a>'
      : '') +
    '</div></div></header>'
  );
}

function CbvRf02Workboard_buildNavHtml_(activeRoute) {
  var ar = String(activeRoute || '');
  var tabs = [
    { route: '/workspace', label: 'Trang chủ' },
    { route: '/workspace/workboard', label: 'Công việc' },
    { route: '/workspace/workboard/tasks', label: 'Danh sách' },
    { route: '/workspace/workboard/notifications', label: 'Thông báo' }
  ];
  var ctxNav = typeof CBV_Permission_getCurrentUserContext === 'function' ? CBV_Permission_getCurrentUserContext() : {};
  if (typeof CBV_Permission_can === 'function' && CBV_Permission_can(ctxNav, CBV_PERMISSION_ACTIONS.COORDINATION_VIEW, null)) {
    tabs.splice(3, 0, { route: '/workspace/coordination/queue', label: 'Điều phối' });
  }
  if (typeof CBV_Permission_can === 'function' && CBV_Permission_can(ctxNav, CBV_PERMISSION_ACTIONS.FINANCE_VIEW, null)) {
    tabs.splice(tabs.length - 1, 0, { route: '/workspace/plugins/finance', label: 'Tài chính' });
  }
  if (typeof CBV_Permission_can === 'function' && CBV_Permission_can(ctxNav, CBV_PERMISSION_ACTIONS.HO_SO_VIEW, null)) {
    tabs.splice(tabs.length - 1, 0, { route: '/workspace/plugins/ho-so', label: 'Hồ sơ' });
  }
  if (typeof CBV_Permission_can === 'function' && CBV_Permission_can(ctxNav, CBV_PERMISSION_ACTIONS.OBSERVATION_VIEW, null)) {
    tabs.splice(tabs.length - 1, 0, { route: '/workspace/observation', label: 'Quan sát' });
  }
  var out = '<nav class="cbv-rf02-nav cbv-workboard-bottom-nav cbv-thumb-zone" aria-label="Workboard navigation" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    var href = CbvRf02Workboard__href_(t.route);
    var active = ar === t.route ? ' cbv-action-active' : '';
    var stub = t.stub ? ' cbv-rf02-nav-stub' : '';
    out += '<a class="cbv-btn-operational cbv-busy-link cbv-action-xl' + active + stub + '" href="' + CbvRf02Workboard__esc_(href) + '" title="' + CbvRf02Workboard__esc_(t.title || t.label) + '">' +
      CbvRf02Workboard__esc_(t.label) + '</a>';
  }
  out += '</nav>';
  return out;
}

function CbvRf02Workboard_wrapBody_(innerHtml, activeRoute, ctx) {
  return (
    '<div class="cbv-rf02-workboard cbv-workboard cbv-workboard-mobile-stack">' +
    CbvRf02Workboard_buildHeaderHtml_(ctx, activeRoute) +
    CbvRf02Workboard_buildNavHtml_(activeRoute) +
    '<main class="cbv-rf02-main">' + (innerHtml || '') + '</main>' +
    '</div>'
  );
}

function CbvRf02Workboard__stateBlock_(kind, title, message, ctaHref, ctaLabel) {
  if (kind === 'loading') {
    return '<div class="cbv-rf02-state cbv-workboard-empty-state cbv-card"><p>Đang tải…</p><div class="cbv-muted">' + CbvRf02Workboard__esc_(message || '') + '</div></div>';
  }
  if (kind === 'error') {
    return '<div class="cbv-rf02-state cbv-card" style="border-color:#c0392b"><p><strong>Lỗi</strong></p><p>' + CbvRf02Workboard__esc_(message || 'Không tải được') + '</p></div>';
  }
  var cta = ctaHref ? '<p><a class="cbv-btn-operational cbv-action-xl cbv-busy-link" href="' + CbvRf02Workboard__esc_(ctaHref) + '">' + CbvRf02Workboard__esc_(ctaLabel || 'Thử lại') + '</a></p>' : '';
  return '<div class="cbv-rf02-state cbv-workboard-empty-state cbv-card"><p><strong>' + CbvRf02Workboard__esc_(title || 'Trống') + '</strong></p><p class="cbv-muted">' + CbvRf02Workboard__esc_(message || '') + '</p>' + cta + '</div>';
}

function CbvRf02Workboard_renderTasksPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var p = params || {};
  var filter = String(p.filter || p.f || 'mine').trim();
  var env = CbvRf02TaskList_getModel_(ctx, filter);
  if (!env.ok) {
    return {
      title: 'Danh sách việc',
      bodyHtml: CbvRf02Workboard_wrapBody_(CbvRf02Workboard__stateBlock_('error', 'Không có quyền', (env.errors || []).join('; ')), '/workspace/workboard/tasks', ctx)
    };
  }
  var items = (env.data && env.data.items) ? env.data.items : [];
  var chips = (env.data.filtersAvailable || []).map(function (fk) {
    var href = CbvRf02Workboard__href_('/workspace/workboard/tasks', { filter: fk });
    var active = fk === filter ? ' cbv-action-active' : '';
    return '<a class="cbv-workboard-filter-chip cbv-btn-operational cbv-busy-link' + active + '" href="' + CbvRf02Workboard__esc_(href) + '">' + CbvRf02Workboard__esc_(fk) + '</a>';
  }).join('');
  var cards = items.length
    ? items.map(function (it) {
      return (
        '<article class="cbv-workboard-task-card cbv-card cbv-workboard-mobile-stack" data-task-id="' + CbvRf02Workboard__esc_(it.taskId) + '">' +
        '<div><strong>' + CbvRf02Workboard__esc_(it.title) + '</strong></div>' +
        '<div class="cbv-muted" style="font-size:12px">' + CbvRf02Workboard__esc_(it.status) + ' · ' + CbvRf02Workboard__esc_(it.priority) + ' · ' + CbvRf02Workboard__esc_(it.module) + '</div>' +
        '<div class="cbv-muted" style="font-size:12px">Giao: ' + CbvRf02Workboard__esc_(it.assignee || '—') + ' · Hạn: ' + CbvRf02Workboard__esc_(it.dueDate || '—') + '</div>' +
        '<a class="cbv-workboard-primary-cta cbv-action-xl cbv-busy-link" href="' + CbvRf02Workboard__esc_(it.href) + '">Xem chi tiết</a>' +
        '</article>'
      );
    }).join('')
    : CbvRf02Workboard__stateBlock_('empty', 'Không có việc', 'Thử filter khác hoặc kiểm tra queue HOME_ALERT.', CbvRf02Workboard__href_('/workspace/workboard'), 'Về workboard');
  var inner = '<div class="cbv-rf02-filter-bar" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">' + chips + '</div>' + cards;
  return {
    title: 'Danh sách việc',
    bodyHtml: CbvRf02Workboard_wrapBody_(inner, '/workspace/workboard/tasks', ctx)
  };
}

function CbvRf02Workboard_renderTaskDetailPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var p = params || {};
  var taskId = String(p.taskId || '').trim();
  var detailEnv = CbvRf02TaskDetail_getModel_(ctx, taskId);
  var tlEnv = CbvRf02Timeline_getModel_(ctx, taskId);

  if (!detailEnv.ok) {
    return {
      title: 'Chi tiết việc',
      bodyHtml: CbvRf02Workboard_wrapBody_(CbvRf02Workboard__stateBlock_('error', 'Không có quyền', (detailEnv.errors || []).join('; ')), '/workspace/workboard/task-detail', ctx)
    };
  }
  if (detailEnv.empty || !detailEnv.data || !detailEnv.data.task) {
    return {
      title: 'Chi tiết việc',
      bodyHtml: CbvRf02Workboard_wrapBody_(
        CbvRf02Workboard__stateBlock_('empty', 'Không tìm thấy việc', 'ID: ' + (taskId || '(trống)') + ' — an toàn, không fake dữ liệu.', CbvRf02Workboard__href_('/workspace/workboard/tasks'), '← Danh sách'),
        '/workspace/workboard/task-detail',
        ctx
      )
    };
  }

  var t = detailEnv.data.task;
  var tlItems = (tlEnv.data && tlEnv.data.items) ? tlEnv.data.items : [];
  var tlHtml = tlItems.length
    ? '<ol>' + tlItems.map(function (ev) {
      return '<li><span class="cbv-muted">' + CbvRf02Workboard__esc_(ev.time || '') + '</span> · <strong>' + CbvRf02Workboard__esc_(ev.action) + '</strong> — ' + CbvRf02Workboard__esc_(ev.message) + ' <span class="cbv-muted">(' + CbvRf02Workboard__esc_(ev.source) + ')</span></li>';
    }).join('') + '</ol>'
    : '<p class="cbv-muted">Chưa có timeline — read-first stub.</p>';

  var actions = (detailEnv.data.quickActions || []).map(function (a) {
    return '<span class="cbv-btn-operational cbv-muted" style="opacity:.7" title="Stub RF_02">' + CbvRf02Workboard__esc_(a.label) + ' (stub)</span>';
  }).join(' ');

  var files = (detailEnv.data.files || []).map(function (f) {
    return '<li><a class="cbv-busy-link" href="' + CbvRf02Workboard__esc_(f.url) + '" target="_blank" rel="noopener">' + CbvRf02Workboard__esc_(f.name) + '</a></li>';
  }).join('');
  var filesHtml = files ? '<ul>' + files + '</ul>' : '<p class="cbv-muted">Chưa có file — upload stub.</p>';

  var inner =
    '<div class="cbv-card cbv-rf02-detail-summary">' +
    '<h2 style="margin-top:0">' + CbvRf02Workboard__esc_(t.title) + '</h2>' +
    '<div class="cbv-kv">' +
    '<div class="cbv-muted">Mã</div><div><code>' + CbvRf02Workboard__esc_(t.taskId) + '</code></div>' +
    '<div class="cbv-muted">Trạng thái</div><div>' + CbvRf02Workboard__esc_(t.status) + '</div>' +
    '<div class="cbv-muted">Ưu tiên</div><div>' + CbvRf02Workboard__esc_(t.priority) + '</div>' +
    '<div class="cbv-muted">Phụ trách</div><div>' + CbvRf02Workboard__esc_(t.assignee || '—') + '</div>' +
    '<div class="cbv-muted">Hạn</div><div>' + CbvRf02Workboard__esc_(t.dueDate || '—') + '</div>' +
    '</div></div>' +
    '<div class="cbv-card" style="margin-top:12px"><h3>Timeline</h3>' + tlHtml + '</div>' +
    '<div class="cbv-card" style="margin-top:12px"><h3>File</h3>' + filesHtml + '</div>' +
    '<div class="cbv-card" style="margin-top:12px"><h3>Thao tác</h3><div style="display:flex;flex-wrap:wrap;gap:8px">' + (actions || '<span class="cbv-muted">Không có action cho role này</span>') + '</div></div>';

  return {
    title: 'Chi tiết việc',
    bodyHtml: CbvRf02Workboard_wrapBody_(inner, '/workspace/workboard/task-detail', ctx)
  };
}

function CbvRf02Workboard_renderSearchPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var p = params || {};
  var q = String(p.q || p.keyword || '').trim();
  var inner = '<div class="cbv-card"><h2 style="margin-top:0">Tìm kiếm</h2>' +
    '<form method="get" action="' + CbvRf02Workboard__esc_(CbvRf02Workboard__href_('/workspace/workboard/search')) + '">' +
    '<input type="hidden" name="route" value="/workspace/workboard/search"/>' +
    '<input name="q" value="' + CbvRf02Workboard__esc_(q) + '" placeholder="Tên, mã việc…" style="width:100%;max-width:420px;padding:10px;margin-bottom:8px"/>' +
    '<button type="submit" class="cbv-btn-operational cbv-action-xl">Tìm</button></form></div>';

  if (q) {
    var env = CbvRf02Search_search_(ctx, { keyword: q, module: p.module });
    if (!env.ok) {
      inner += CbvRf02Workboard__stateBlock_('error', 'Tìm kiếm', (env.errors || []).join('; '));
    } else {
      var groups = (env.data && env.data.groups) ? env.data.groups : [];
      for (var g = 0; g < groups.length; g++) {
        var grp = groups[g];
        inner += '<div class="cbv-card" style="margin-top:12px"><h3>' + CbvRf02Workboard__esc_(grp.label || grp.module) + '</h3>';
        if (grp.stubNote) inner += '<p class="cbv-muted">' + CbvRf02Workboard__esc_(grp.stubNote) + '</p>';
        var gItems = grp.items || [];
        if (!gItems.length && !grp.stubNote) inner += '<p class="cbv-muted">(trống)</p>';
        inner += gItems.map(function (it) {
          return '<div style="margin:8px 0"><a class="cbv-busy-link" href="' + CbvRf02Workboard__esc_(it.href) + '"><strong>' + CbvRf02Workboard__esc_(it.title) + '</strong></a> — ' + CbvRf02Workboard__esc_(it.subtitle) + '</div>';
        }).join('');
        inner += '</div>';
      }
    }
  } else {
    inner += '<p class="cbv-muted" style="margin-top:12px">Nhập từ khóa để tìm việc (task search thật; module khác stub).</p>';
  }

  return {
    title: 'Tìm kiếm',
    bodyHtml: CbvRf02Workboard_wrapBody_(inner, '/workspace/workboard/search', ctx)
  };
}

function CbvRf02Workboard_renderNotificationsPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CbvRf02Notification_getModel_(ctx);
  if (!env.ok) {
    return {
      title: 'Thông báo',
      bodyHtml: CbvRf02Workboard_wrapBody_(CbvRf02Workboard__stateBlock_('error', 'Không có quyền', (env.errors || []).join('; ')), '/workspace/workboard/notifications', ctx)
    };
  }
  var items = (env.data && env.data.items) ? env.data.items : [];
  var inner = items.length
    ? items.map(function (n) {
      return (
        '<article class="cbv-card cbv-rf02-notif" data-severity="' + CbvRf02Workboard__esc_(n.severity) + '" style="margin-bottom:10px">' +
        '<div><strong>' + CbvRf02Workboard__esc_(n.title) + '</strong> <span class="cbv-badge">' + CbvRf02Workboard__esc_(n.type) + '</span></div>' +
        '<p class="cbv-muted">' + CbvRf02Workboard__esc_(n.message) + '</p>' +
        '<a class="cbv-workboard-primary-cta cbv-action-xl cbv-busy-link" href="' + CbvRf02Workboard__esc_(n.href) + '">Xem</a></article>'
      );
    }).join('')
    : CbvRf02Workboard__stateBlock_('empty', 'Không có thông báo', 'Queue trống hoặc chưa có cảnh báo trong phạm vi read-first.');
  if (env.data && env.data.financeStub) {
    inner += '<p class="cbv-muted" style="margin-top:12px">Tài chính / hồ sơ thiếu — stub RF_02.</p>';
  }
  return {
    title: 'Thông báo',
    bodyHtml: CbvRf02Workboard_wrapBody_(inner, '/workspace/workboard/notifications', ctx)
  };
}

function CbvRf02Workboard_renderFilesPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var p = params || {};
  var linkedTo = String(p.taskId || p.linkedTo || '').trim();
  var env = CbvRf02File_getModel_(ctx, linkedTo);
  if (!env.ok) {
    return {
      title: 'File',
      bodyHtml: CbvRf02Workboard_wrapBody_(CbvRf02Workboard__stateBlock_('error', 'Không có quyền', (env.errors || []).join('; ')), '/workspace/workboard/files', ctx)
    };
  }
  var items = (env.data && env.data.items) ? env.data.items : [];
  var inner = items.length
    ? '<ul>' + items.map(function (f) {
      return '<li><a class="cbv-busy-link" href="' + CbvRf02Workboard__esc_(f.url) + '" target="_blank" rel="noopener">' + CbvRf02Workboard__esc_(f.name) + '</a> <span class="cbv-muted">(' + CbvRf02Workboard__esc_(f.source) + ')</span></li>';
    }).join('') + '</ul>'
    : CbvRf02Workboard__stateBlock_('empty', 'Chưa có file', 'Preview/upload stub — không di chuyển file thật.');
  if (env.data && env.data.uploadStub) {
    inner += '<p class="cbv-muted" style="margin-top:12px">Upload: stub' + (env.data.uploadAllowed ? ' (quyền OK, chưa implement)' : ' (không có quyền)') + '</p>';
  }
  return {
    title: 'File',
    bodyHtml: CbvRf02Workboard_wrapBody_(inner, '/workspace/workboard/files', ctx)
  };
}

/**
 * RF02 shell wrapper for existing M06 workboard — inject header/nav without breaking M06 body.
 */
function CbvRf02Workboard_renderShellPage_(params) {
  if (typeof CbvStaffWorkboard_renderPage_ === 'function') {
    var m06 = CbvStaffWorkboard_renderPage_(params || {});
    var ctx = CBV_Permission_getCurrentUserContext();
    var body = (m06 && m06.bodyHtml) ? m06.bodyHtml : '<p>Workboard unavailable</p>';
    var headerNav = CbvRf02Workboard_buildHeaderHtml_(ctx, '/workspace/workboard') + CbvRf02Workboard_buildNavHtml_('/workspace/workboard');
    return {
      title: 'Báo việc',
      bodyHtml: '<div class="cbv-rf02-workboard">' + headerNav + body + '</div>',
      warnings: (m06 && m06.warnings) ? m06.warnings : []
    };
  }
  return CbvRf02Workboard_renderTasksPage_({ filter: 'mine' });
}

function CbvRf02Workboard_renderPageByType_(pageType, params) {
  var pt = String(pageType || '');
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_SHELL) return CbvRf02Workboard_renderShellPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_TASKS) return CbvRf02Workboard_renderTasksPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_TASK_DETAIL) return CbvRf02Workboard_renderTaskDetailPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_SEARCH) return CbvRf02Workboard_renderSearchPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_NOTIFICATIONS) return CbvRf02Workboard_renderNotificationsPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_FILES) return CbvRf02Workboard_renderFilesPage_(params);
  return { title: 'Workboard', bodyHtml: CbvRf02Workboard__stateBlock_('error', 'Unknown page', pt) };
}
