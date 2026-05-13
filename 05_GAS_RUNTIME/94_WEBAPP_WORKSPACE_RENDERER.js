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

  var route = CbvWebAppWorkspace__resolveRoute_(e);
  return CbvWebAppWorkspace_render(route, p);
}

function CbvWebAppWorkspace__resolveRoute_(e) {
  e = e || {};
  var p = e.parameter || {};
  var rt = String(p.route || p.path || '').trim();
  if (rt) return rt.charAt(0) === '/' ? rt : '/' + rt;

  var pi = String(e.pathInfo || '').trim();
  if (pi) return pi.charAt(0) === '/' ? pi : '/' + pi;

  return '/workspace';
}

function CbvWebAppWorkspace_render(route, params) {
  var rt = String(route || '').trim() || '/workspace';
  if (rt.charAt(0) !== '/') rt = '/' + rt;

  var reg = (typeof CbvWebAppWorkspace_routeByPath === 'function') ? CbvWebAppWorkspace_routeByPath(rt) : null;
  if (!reg) {
    return CbvWebAppWorkspace_renderShell_({
      title: 'Not found',
      status: 'NOT_FOUND',
      route: rt,
      bodyHtml: '<p>Unknown route: <code>' + rt + '</code></p>' + CbvWebAppWorkspace__navHtml_()
    });
  }

  var page;
  if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.HOME) {
    page = (typeof CbvWebAppPilotRenderer_renderHome === 'function') ? CbvWebAppPilotRenderer_renderHome() : CbvWebAppWorkspace_renderHome_();
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.QUEUE) {
    page = (typeof CbvWebAppPilotRenderer_renderQueue === 'function') ? CbvWebAppPilotRenderer_renderQueue() : CbvWebAppWorkspace_renderQueue_();
  } else if (reg.pageType === CBV_WEBAPP_WS_PAGE_TYPES.SLA) {
    page = (typeof CbvWebAppPilotRenderer_renderSla === 'function') ? CbvWebAppPilotRenderer_renderSla() : CbvWebAppWorkspace_renderSla_();
  } else if (reg.route === '/home-alert/timeline' && typeof CbvWebAppPilotRenderer_renderTimelinePlaceholder === 'function') {
    page = CbvWebAppPilotRenderer_renderTimelinePlaceholder();
  } else if (reg.route === '/home-alert/kanban' && typeof CbvWebAppPilotRenderer_renderKanbanPlaceholder === 'function') {
    page = CbvWebAppPilotRenderer_renderKanbanPlaceholder();
  } else if (reg.route === '/runtime/health' && typeof CbvWebAppPilotRenderer_renderRuntimeHealthPlaceholder === 'function') {
    page = CbvWebAppPilotRenderer_renderRuntimeHealthPlaceholder();
  } else if (reg.route === '/reports' && typeof CbvWebAppPilotRenderer_renderReportsPlaceholder === 'function') {
    page = CbvWebAppPilotRenderer_renderReportsPlaceholder();
  } else {
    page = CbvWebAppWorkspace_renderPlaceholder_(reg.route);
  }

  page.title = reg.title;
  page.route = reg.route;
  page.status = 'READ_FIRST';
  return CbvWebAppWorkspace_renderShell_(page);
}

function CbvWebAppWorkspace_renderShell_(page) {
  var model = page || {};
  model.navHtml = CbvWebAppWorkspace__navHtml_();
  model.checkedAt = CbvWebAppWorkspace__now_();

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

function CbvWebAppWorkspace__navHtml_() {
  var links = [
    { href: '/workspace', label: 'Workspace' },
    { href: '/home-alert/my-queue', label: 'My Queue' },
    { href: '/home-alert/sla', label: 'SLA' },
    { href: '/home-alert/timeline', label: 'Timeline' },
    { href: '/home-alert/kanban', label: 'Kanban' },
    { href: '/runtime/health', label: 'Runtime' }
  ];
  var out = '<div style="display:flex;flex-wrap:wrap;gap:8px">';
  links.forEach(function(l) {
    out += '<a href="' + l.href + '" style="padding:6px 10px;border:1px solid #ddd;border-radius:8px;text-decoration:none;color:#111;background:#fafafa">' + l.label + '</a>';
  });
  out += '</div>';
  return out;
}

