/**
 * PHASE_89 — WebApp Operational Workspace Skeleton (renderer)
 *
 * Integration: this file defines global doGet as a dispatcher that preserves existing webhook ping behavior.
 */

function CbvWebAppWorkspace_doGet(e) {
  e = e || {};
  var p = e.parameter || {};
  var action = String(p.action || '').toLowerCase();

  // Preserve legacy webhook ping behavior (Phase <89).
  if (action === 'ping') {
    var payload = { ok: true, code: 'PONG', message: 'Webhook active' };
    if (typeof _webhookJsonResponse === 'function') return _webhookJsonResponse(payload);
    return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
  }

  var parsed = CbvWebAppWorkspace__parseDoGetRoute_(e);
  return CbvWebAppWorkspace_render(parsed.route, parsed.params);
}

/**
 * Resolve route path + merged query params (M06: `route` may contain inner `?taskId=`).
 */
function CbvWebAppWorkspace__parseDoGetRoute_(e) {
  e = e || {};
  var p = e.parameter || {};
  var raw = String(p.route || p.path || '').trim();
  if (raw && typeof CbvWebAppRoute_parseRouteAndParams_ === 'function') {
    return CbvWebAppRoute_parseRouteAndParams_(raw, e);
  }
  var pi = String(e.pathInfo || '').trim();
  if (pi) {
    var rawPi = pi.charAt(0) === '/' ? pi : '/' + pi;
    if (typeof CbvWebAppRoute_parseRouteAndParams_ === 'function') {
      return CbvWebAppRoute_parseRouteAndParams_(rawPi, e);
    }
    return { route: CbvWebAppRoute_normalizePath_(rawPi), params: {} };
  }
  if (typeof CbvWebAppRoute_mergeParams_ === 'function') {
    return CbvWebAppRoute_mergeParams_(e, { route: '/workspace', params: {} });
  }
  return { route: '/workspace', params: {} };
}

function CbvWebAppWorkspace__resolveRoute_(e) {
  var pr = CbvWebAppWorkspace__parseDoGetRoute_(e);
  return pr.route;
}

function CbvWebAppWorkspace_render(route, params) {
  var rt = String(route || '').trim() || '/workspace';
  if (rt.charAt(0) !== '/') rt = '/' + rt;

  var reg = (typeof CbvWebAppWorkspace_routeByPath === 'function') ? CbvWebAppWorkspace_routeByPath(rt) : null;
  if (!reg) {
    var nfTitle = (typeof CbvWebAppVi_getLabel === 'function') ? CbvWebAppVi_getLabel('not_found_title') : 'Not found';
    var nfBody = (typeof CbvWebAppVi_getLabel === 'function') ? CbvWebAppVi_getLabel('not_found_body') : 'Unknown route';
    return CbvWebAppWorkspace_renderShell_({
      title: nfTitle,
      status: 'NOT_FOUND',
      route: rt,
      bodyHtml: '<p>' + nfBody + ': <code>' + rt + '</code></p>' + CbvWebAppWorkspace__navHtml_()
    });
  }

  var page;
  if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.HOME) {
    page = (typeof CbvWebAppPilotRenderer_renderHome === 'function') ? CbvWebAppPilotRenderer_renderHome() : CbvWebAppWorkspace_renderHome_();
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.QUEUE) {
    page = (typeof CbvWebAppPilotRenderer_renderQueue === 'function') ? CbvWebAppPilotRenderer_renderQueue() : CbvWebAppWorkspace_renderQueue_();
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.SLA) {
    page = (typeof CbvWebAppPilotRenderer_renderSla === 'function') ? CbvWebAppPilotRenderer_renderSla() : CbvWebAppWorkspace_renderSla_();
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.ROLE_HOME && typeof CbvWebAppOpUx_renderRoleHomePage_ === 'function') {
    page = CbvWebAppOpUx_renderRoleHomePage_();
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.TODAY_OPS && typeof CbvWebAppOpUx_renderTodayPage_ === 'function') {
    page = CbvWebAppOpUx_renderTodayPage_();
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.GUIDED_OPS && typeof CbvWebAppOpUx_renderGuidedPage_ === 'function') {
    page = CbvWebAppOpUx_renderGuidedPage_();
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.GUIDED_SOP_RUNTIME && typeof CbvGuidedSop_renderGuidedSopPage_ === 'function') {
    page = CbvGuidedSop_renderGuidedSopPage_(params || {});
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.DAILY_OPERATION_HOME && typeof CbvDailyOp_renderDailyPage_ === 'function') {
    page = CbvDailyOp_renderDailyPage_(params || {});
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.FOCUS_MODE && typeof CbvExecFlow_renderFocusPage_ === 'function') {
    page = CbvExecFlow_renderFocusPage_(params || {});
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.STAFF_TASKS && typeof CbvStaffWorkspace_renderTasksPage_ === 'function') {
    page = CbvStaffWorkspace_renderTasksPage_();
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.STAFF_WORKBOARD && typeof CbvRf02Workboard_renderShellPage_ === 'function') {
    page = CbvRf02Workboard_renderShellPage_(params || {});
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.STAFF_WORKBOARD && typeof CbvStaffWorkboard_renderPage_ === 'function') {
    page = CbvStaffWorkboard_renderPage_(params || {});
  } else if (
    (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_TASKS ||
      reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_TASK_DETAIL ||
      reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_SEARCH ||
      reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_NOTIFICATIONS ||
      reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.RF02_WORKBOARD_FILES) &&
    typeof CbvRf02Workboard_renderPageByType_ === 'function'
  ) {
    page = CbvRf02Workboard_renderPageByType_(reg.pageType, params || {});
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.INTERACTIVE_TASK_RUNTIME && typeof CbvInteractiveTaskRuntime_renderPage_ === 'function') {
    page = CbvInteractiveTaskRuntime_renderPage_(params || {});
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.STAFF_TASK_DETAIL && typeof CbvStaffWorkspace_renderTaskDetailPage_ === 'function') {
    page = CbvStaffWorkspace_renderTaskDetailPage_(params || {});
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.STAFF_FEEDBACK && typeof CbvStaffWorkspace_renderFeedbackPage_ === 'function') {
    page = CbvStaffWorkspace_renderFeedbackPage_(params || {});
  } else if (reg.route === '/home-alert/timeline' && typeof CbvWebAppPilotRenderer_renderTimelinePlaceholder === 'function') {
    page = CbvWebAppPilotRenderer_renderTimelinePlaceholder();
  } else if (reg.route === '/home-alert/kanban' && typeof CbvWebAppPilotRenderer_renderKanbanPlaceholder === 'function') {
    page = CbvWebAppPilotRenderer_renderKanbanPlaceholder();
  } else if (reg.route === '/runtime/health' && typeof CbvWebAppPilotRenderer_renderRuntimeHealthPlaceholder === 'function') {
    page = CbvWebAppPilotRenderer_renderRuntimeHealthPlaceholder();
  } else if (reg.route === '/reports' && typeof CbvWebAppPilotRenderer_renderReportsPlaceholder === 'function') {
    page = CbvWebAppPilotRenderer_renderReportsPlaceholder();
  } else if (reg.route === '/admin/reference' && typeof CbvWebAppPilotRenderer_renderAdminReferencePlaceholder === 'function') {
    page = CbvWebAppPilotRenderer_renderAdminReferencePlaceholder();
  } else {
    page = CbvWebAppWorkspace_renderPlaceholder_(reg.route);
  }

  page.title = (typeof CbvWebAppVi_getRouteLabel === 'function')
    ? CbvWebAppVi_getRouteLabel(reg.route)
    : reg.title;
  page.route = reg.route;
  page.status = 'READ_FIRST';
  if (typeof CbvWebAppOpUx_augmentPageForShell_ === 'function') {
    page = CbvWebAppOpUx_augmentPageForShell_(page, reg.route);
  }
  return CbvWebAppWorkspace_renderShell_(page);
}

/** Pilot-style absolute links for legacy HOME template (98 may load after 94 in push order). */
function CbvWebAppWorkspace__routeUrlsForHome_() {
  if (typeof CbvWebAppPilotRenderer__routeUrls_ === 'function') {
    try {
      return CbvWebAppPilotRenderer__routeUrls_();
    } catch (eP) { /* fall through */ }
  }
  function b(route) {
    if (typeof CbvWebAppRouteUrl_build === 'function') {
      try {
        return CbvWebAppRouteUrl_build(route);
      } catch (e1) { /* ignore */ }
    }
    return '#';
  }
  return {
    myQueue: b('/home-alert/my-queue'),
    sla: b('/home-alert/sla'),
    timeline: b('/home-alert/timeline'),
    kanban: b('/home-alert/kanban'),
    runtimeHealth: b('/runtime/health'),
    reports: b('/reports')
  };
}

function CbvWebAppWorkspace_renderShell_(page) {
  var model = page || {};
  model.navHtml = CbvWebAppWorkspace__navHtml_(model.route);
  model.checkedAt = CbvWebAppWorkspace__now_();
  if (typeof CbvWebAppVi_getShellI18n_ === 'function') {
    try {
      model.i18n = CbvWebAppVi_getShellI18n_();
    } catch (eI18n) {
      model.i18n = null;
    }
  } else {
    model.i18n = null;
  }
  if (typeof CbvWebAppVi_getSafetyFooter === 'function') {
    try {
      model.footerSafetyVi = CbvWebAppVi_getSafetyFooter(model.route || '');
    } catch (eF) {
      model.footerSafetyVi = null;
    }
  } else {
    model.footerSafetyVi = null;
  }

  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_SHELL');
    t.MODEL = model;
    return t.evaluate().setTitle(model.title || 'WebApp Workspace').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (e) {
    var html = [
      '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"/>',
      '<title>' + (model.title || 'WebApp Workspace') + '</title>',
      '<style>body{font-family:system-ui,sans-serif;padding:16px} code{background:#f2f2f2;padding:2px 4px;border-radius:4px}</style>',
      '</head><body>',
      '<h2>' + (model.title || 'WebApp Workspace') + '</h2>',
      '<div>' + (model.navHtml || '') + '</div>',
      '<hr/>',
      '<div>' + (model.bodyHtml || '<p>Shell template missing.</p>') + '</div>',
      '<hr/><small>checkedAt=' + model.checkedAt + '</small>',
      '</body></html>'
    ].join('');
    return HtmlService.createHtmlOutput(html).setTitle(model.title || 'WebApp Workspace');
  }
}

function CbvWebAppWorkspace_renderHome_() {
  var warn = [];
  var data = null;
  try {
    var res = CbvWebAppWorkspace_getHomeSummary();
    data = res.data;
    warn = (res.warnings || []);
  } catch (e) {
    warn = ['Home summary error: ' + (e && e.message ? e.message : String(e))];
  }

  var model = { warnings: warn, data: data || {} };
  model.routeUrls = CbvWebAppWorkspace__routeUrlsForHome_();
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_HOME');
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: warn };
  } catch (e2) {
    return { bodyHtml: '<p>Home template missing.</p>', warnings: warn };
  }
}

function CbvWebAppWorkspace_renderQueue_() {
  var warn = [];
  var data = null;
  try {
    var res = CbvWebAppWorkspace_getMyQueueSummary(Session.getActiveUser().getEmail());
    data = res.data;
    warn = (res.warnings || []);
  } catch (e) {
    warn = ['Queue summary error: ' + (e && e.message ? e.message : String(e))];
  }

  var model = { warnings: warn, data: data || {} };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_QUEUE');
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: warn };
  } catch (e2) {
    return { bodyHtml: '<p>Queue template missing.</p>', warnings: warn };
  }
}

function CbvWebAppWorkspace_renderSla_() {
  var warn = [];
  var data = null;
  try {
    var res = CbvWebAppWorkspace_getSlaSummary();
    data = res.data;
    warn = (res.warnings || []);
  } catch (e) {
    warn = ['SLA summary error: ' + (e && e.message ? e.message : String(e))];
  }

  var model = { warnings: warn, data: data || {} };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_SLA');
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: warn };
  } catch (e2) {
    return { bodyHtml: '<p>SLA template missing.</p>', warnings: warn };
  }
}

function CbvWebAppWorkspace_renderPlaceholder_(route) {
  var model = { route: String(route || ''), notes: 'Reserved page in Phase 89 (skeleton). No write actions; read-first only.' };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_PLACEHOLDER');
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: [] };
  } catch (e) {
    return { bodyHtml: '<p>Placeholder for <code>' + model.route + '</code></p>', warnings: [] };
  }
}

function CbvWebAppWorkspace__navHtml_(activeRoute) {
  if (typeof CbvWebAppVi_buildSecondaryNavHtml_ === 'function') {
    try {
      return CbvWebAppVi_buildSecondaryNavHtml_(activeRoute || '');
    } catch (eSec) { /* fall through */ }
  }
  var links;
  if (typeof CbvWebAppVi_getNavItems === 'function') {
    try {
      links = CbvWebAppVi_getNavItems();
    } catch (eNav) {
      links = null;
    }
  }
  if (!links || !links.length) {
    links = [
      { route: '/workspace', label: 'Workspace' },
      { route: '/home-alert/my-queue', label: 'My Queue' },
      { route: '/home-alert/sla', label: 'SLA' },
      { route: '/home-alert/timeline', label: 'Timeline' },
      { route: '/home-alert/kanban', label: 'Kanban' },
      { route: '/runtime/health', label: 'Runtime' },
      { route: '/reports', label: 'Reports' },
      { route: '/admin/reference', label: 'Admin Reference' }
    ];
  }
  var out = '<div style="display:flex;flex-wrap:wrap;gap:8px">';
  links.forEach(function(l) {
    var href = l.href;
    if (!href && l.route && typeof CbvWebAppRouteUrl_build === 'function') {
      try {
        href = CbvWebAppRouteUrl_build(l.route);
      } catch (eL) {
        href = l.route;
      }
    }
    if (!href) href = l.href || l.route || '#';
    out += '<a href="' + href + '" style="padding:6px 10px;border:1px solid #ddd;border-radius:8px;text-decoration:none;color:#111;background:#fafafa">' + l.label + '</a>';
  });
  out += '</div>';
  return out;
}

