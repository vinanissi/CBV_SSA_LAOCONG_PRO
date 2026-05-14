/**
 * MILESTONE_01 — Internal operational workspace UX (Phases 101–104)
 *
 * Read-first. No business writes. Role resolver + Today aggregator + guided copy.
 * Depends: 91 config, 92 routes, 94 renderer (augment hook), 83 CbvRef_* (optional), 97 pilot data.
 */

function CbvWebAppOpUx_buildRouteUrl_(route) {
  var r = String(route || '').trim();
  if (r && r.charAt(0) !== '/') r = '/' + r;
  if (typeof CbvWebAppRouteUrl_build === 'function') {
    try {
      return CbvWebAppRouteUrl_build(r);
    } catch (e) {
      return r;
    }
  }
  return r || '/workspace';
}

/**
 * Workspace role for home routing (not AppSheet security — display only).
 * OWNER | ADMIN | TECHNICAL | SUPERVISOR | STAFF | UNKNOWN
 */
function CbvWebAppOpUx_resolveWorkspaceRole_(email) {
  var em = String(email || '').trim();
  if (!em && typeof Session !== 'undefined' && Session.getActiveUser) {
    try {
      em = Session.getActiveUser().getEmail();
    } catch (e0) {
      em = '';
    }
  }
  var le = em.toLowerCase();
  var row = (typeof CbvRef_getUserByEmail === 'function') ? CbvRef_getUserByEmail(em) : null;

  var flags = {
    isAdmin: false,
    isSupervisor: false,
    isTechnical: false,
    isStaff: false,
    isOwner: false
  };

  try {
    if (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.ADMIN_EMAILS && CBV_CONFIG.ADMIN_EMAILS.length) {
      for (var i = 0; i < CBV_CONFIG.ADMIN_EMAILS.length; i++) {
        if (String(CBV_CONFIG.ADMIN_EMAILS[i] || '').toLowerCase() === le) {
          flags.isAdmin = true;
          break;
        }
      }
    }
  } catch (e1) { /* ignore */ }

  if (row) {
    if (String(row.IS_RUNTIME_OWNER || '').toUpperCase() === 'TRUE' || String(row.IS_RUNTIME_OWNER) === 'true') flags.isOwner = true;
    if (String(row.IS_ADMIN || '').toUpperCase() === 'TRUE' || String(row.IS_ADMIN) === 'true') flags.isAdmin = true;
    if (String(row.IS_APPSHEET_ADMIN || '').toUpperCase() === 'TRUE') flags.isTechnical = true;
    if (String(row.IS_SUPERVISOR || '').toUpperCase() === 'TRUE' || String(row.IS_SUPERVISOR) === 'true') flags.isSupervisor = true;
    var rc = String(row.ROLE_CODE || row.ROLE || '').trim().toUpperCase();
    if (rc.indexOf('ADMIN') >= 0) flags.isAdmin = true;
    if (rc.indexOf('SUPER') >= 0 || rc === 'SUPERVISOR') flags.isSupervisor = true;
    if (rc === 'IT' || rc.indexOf('TECH') >= 0 || rc === 'DEVELOPER') flags.isTechnical = true;
    if (String(row.CAN_APPROVE || '').toUpperCase() === 'TRUE') flags.isSupervisor = true;
  }

  var role = 'UNKNOWN';
  if (flags.isOwner) role = 'OWNER';
  else if (flags.isAdmin) role = 'ADMIN';
  else if (flags.isTechnical) role = 'TECHNICAL';
  else if (flags.isSupervisor) role = 'SUPERVISOR';
  else if (row) role = 'STAFF';

  return {
    workspaceRole: role,
    email: em,
    source: row ? 'USER_DIRECTORY' : (em ? 'UNKNOWN_USER' : 'NO_SESSION'),
    flags: flags,
    directoryRowPresent: !!row
  };
}

function CbvWebAppOpUx_getTodayOpsModel_(userEmail) {
  var warnings = [];
  var email = String(userEmail || '').trim();
  if (!email && typeof Session !== 'undefined' && Session.getActiveUser) {
    try {
      email = Session.getActiveUser().getEmail();
    } catch (e) {
      email = '';
    }
  }

  var home = null;
  try {
    if (typeof CbvWebAppPilotData_getHomeDashboard === 'function') {
      home = CbvWebAppPilotData_getHomeDashboard();
      if (home && home.warnings) warnings = warnings.concat(home.warnings);
    } else {
      warnings.push('CbvWebAppPilotData_getHomeDashboard not loaded.');
    }
  } catch (eH) {
    warnings.push('Home dashboard: ' + (eH && eH.message ? eH.message : String(eH)));
    home = { ok: false, data: null };
  }

  var queue = null;
  try {
    if (typeof CbvWebAppWorkspace_getMyQueueSummary === 'function') {
      queue = CbvWebAppWorkspace_getMyQueueSummary(email);
      if (queue && queue.warnings) warnings = warnings.concat(queue.warnings);
    }
  } catch (eQ) {
    warnings.push('Queue summary: ' + (eQ && eQ.message ? eQ.message : String(eQ)));
  }

  var totals = (home && home.data && home.data.totals) ? home.data.totals : {};
  var qCount = queue && queue.data && queue.data.count !== undefined ? queue.data.count : 0;

  var summary = {
    pendingQueue: qCount,
    myQueueTotal: totals.myQueue || 0,
    unassigned: totals.unassigned || 0,
    breached: totals.breached || 0,
    escalated: totals.escalated || 0,
    blocked: totals.blocked || 0,
    resolvedToday: totals.resolvedToday || 0
  };

  var items = [];

  function pushItem(priority, slaType, title, detail, ctaRoute, ctaLabel) {
    items.push({
      priority: priority,
      slaType: slaType,
      title: title,
      detail: detail,
      ctaRoute: ctaRoute,
      ctaLabel: ctaLabel,
      ctaHref: CbvWebAppOpUx_buildRouteUrl_(ctaRoute)
    });
  }

  if (summary.breached > 0) {
    pushItem('CRITICAL', 'SLA_OVERDUE', 'SLA breached items', String(summary.breached) + ' row(s) in pilot totals.', '/home-alert/sla', 'Open SLA');
  }
  if (summary.blocked > 0) {
    pushItem('HIGH', 'BLOCKED_TOO_LONG', 'Blocked work', String(summary.blocked) + ' blocked (pilot totals).', '/home-alert/my-queue', 'Open queue');
  }
  if (summary.escalated > 0) {
    pushItem('HIGH', 'SLA_WARNING', 'Escalated items', String(summary.escalated) + ' escalated.', '/home-alert/my-queue', 'Review queue');
  }
  if (summary.pendingQueue > 0) {
    pushItem('NORMAL', 'SLA_WARNING', 'My queue', String(summary.pendingQueue) + ' open row(s) assigned to you.', '/home-alert/my-queue', 'Open My Queue');
  }
  if (summary.unassigned > 0) {
    pushItem('NORMAL', 'SLA_WARNING', 'Unassigned pool', String(summary.unassigned) + ' unassigned (read-first aggregate).', '/workspace', 'Back to home');
  }

  var runtimeAlerts = [];
  try {
    if (typeof CbvWebAppPilotData_getHomeDashboard === 'function' && home && home.warnings && home.warnings.length) {
      runtimeAlerts = home.warnings.slice(0, 5).map(function (w) {
        return { severity: 'WARNING', text: String(w) };
      });
    }
  } catch (eR) { /* ignore */ }

  return {
    summary: summary,
    items: items,
    runtimeAlerts: runtimeAlerts,
    warnings: warnings,
    homeOk: !!(home && home.ok),
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CbvWebAppOpUx_getGuidedStepsForRole_(role) {
  var r = String(role || 'UNKNOWN').toUpperCase();
  var commonFirst = [
    { step: 1, title: 'Chọn luồng', body: 'Dùng thanh thao tác nhanh: Hôm nay · Việc của tôi · SLA.', ctaRoute: '/workspace/today', ctaLabel: 'Mở Hôm nay', ctaHref: CbvWebAppOpUx_buildRouteUrl_('/workspace/today') },
    { step: 2, title: 'READ_FIRST', body: 'WebApp chỉ xem; thao tác ghi qua AppSheet theo quy trình.', ctaRoute: '/home-alert/my-queue', ctaLabel: 'Mở My Queue', ctaHref: CbvWebAppOpUx_buildRouteUrl_('/home-alert/my-queue') }
  ];
  if (r === 'STAFF' || r === 'UNKNOWN') {
    return commonFirst.concat([
      { step: 3, title: 'Việc của tôi', body: 'Xử lý theo OPERATOR_NEXT_ACTION trên thẻ queue.', ctaRoute: '/home-alert/my-queue', ctaLabel: 'Mở My Queue', ctaHref: CbvWebAppOpUx_buildRouteUrl_('/home-alert/my-queue') },
      { step: 4, title: 'Thiếu chứng từ', body: 'Nếu SOP yêu cầu: bổ sung chứng từ trên AppSheet (không upload qua WebApp pilot).', ctaRoute: '/workspace', ctaLabel: 'Về trang chủ', ctaHref: CbvWebAppOpUx_buildRouteUrl_('/workspace') }
    ]);
  }
  if (r === 'SUPERVISOR') {
    return commonFirst.concat([
      { step: 3, title: 'Duyệt / gỡ chặn', body: 'Ưu tiên BLOCKED và SLA_OVERDUE trong trang Hôm nay.', ctaRoute: '/workspace/today', ctaLabel: 'Mở Hôm nay', ctaHref: CbvWebAppOpUx_buildRouteUrl_('/workspace/today') },
      { step: 4, title: 'Chưa duyệt', body: 'Đối chiếu queue và SLA; không auto-resolve.', ctaRoute: '/home-alert/sla', ctaLabel: 'Mở SLA', ctaHref: CbvWebAppOpUx_buildRouteUrl_('/home-alert/sla') }
    ]);
  }
  if (r === 'TECHNICAL' || r === 'ADMIN' || r === 'OWNER') {
    return commonFirst.concat([
      { step: 3, title: 'Runtime & báo cáo', body: 'Health / báo cáo trong menu kỹ thuật; Test Console trên Google Sheet.', ctaRoute: '/runtime/health', ctaLabel: 'Runtime health', ctaHref: CbvWebAppOpUx_buildRouteUrl_('/runtime/health') },
      { step: 4, title: 'Test Console', body: 'Chạy kiểm thử từ menu 🧪 CBV Test Console (tách menu nghiệp vụ).', ctaRoute: '/reports', ctaLabel: 'Reports (read-first)', ctaHref: CbvWebAppOpUx_buildRouteUrl_('/reports') }
    ]);
  }
  return commonFirst;
}

function CbvWebAppOpUx_buildGlobalActionBarHtml_(activeRoute) {
  var ar = String(activeRoute || '');
  function btn(route, label) {
    var href = CbvWebAppOpUx_buildRouteUrl_(route);
    var active = ar === route ? ' cbv-action-active' : '';
    return '<a class="cbv-btn-operational cbv-busy-link' + active + '" href="' +
      String(href).replace(/"/g, '&quot;') + '">' + String(label).replace(/</g, '&lt;') + '</a>';
  }
  function Lb(key, fb) {
    if (typeof CbvWebAppVi_getLabel === 'function') {
      try {
        var t = CbvWebAppVi_getLabel(key);
        if (t) return t;
      } catch (eL) { /* ignore */ }
    }
    return fb;
  }
  return '<div id="cbv-global-action-bar" class="cbv-global-action-bar cbv-mobile-stack">' +
    btn('/workspace', Lb('nav_workspace', 'Home')) +
    btn('/workspace/today', Lb('nav_today_ops', 'Today')) +
    btn('/workspace/role-home', Lb('nav_role_home', 'Role')) +
    btn('/workspace/guided', Lb('nav_guided', 'Guide')) +
    btn('/home-alert/my-queue', Lb('nav_my_queue', 'Queue')) +
    btn('/home-alert/sla', Lb('nav_sla', 'SLA')) +
    '</div>';
}

function CbvWebAppOpUx_augmentPageForShell_(page, route) {
  page = page || {};
  page.currentRoute = route;
  page.actionBarHtml = CbvWebAppOpUx_buildGlobalActionBarHtml_(route);
  return page;
}

function CbvWebAppOpUx_renderRoleHomePage_() {
  var warn = [];
  var email = '';
  try {
    email = Session.getActiveUser().getEmail();
  } catch (e) {
    warn.push('Active user email unavailable.');
  }
  var rolePack = CbvWebAppOpUx_resolveWorkspaceRole_(email);
  var model = {
    rolePack: rolePack,
    routeUrls: (typeof CbvWebAppPilotRenderer__routeUrls_ === 'function') ? CbvWebAppPilotRenderer__routeUrls_() : {},
    todayUrl: CbvWebAppOpUx_buildRouteUrl_('/workspace/today'),
    guidedUrl: CbvWebAppOpUx_buildRouteUrl_('/workspace/guided')
  };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_ROLE_HOME');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: warn };
  } catch (e2) {
    return { bodyHtml: '<p>Role home template missing.</p>', warnings: warn.concat([String(e2 && e2.message ? e2.message : e2)]) };
  }
}

function CbvWebAppOpUx_renderTodayPage_() {
  var email = '';
  try {
    email = Session.getActiveUser().getEmail();
  } catch (e) {
    email = '';
  }
  var today = CbvWebAppOpUx_getTodayOpsModel_(email);
  var model = { today: today, routeUrls: (typeof CbvWebAppPilotRenderer__routeUrls_ === 'function') ? CbvWebAppPilotRenderer__routeUrls_() : {} };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_TODAY_OPS');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: today.warnings || [] };
  } catch (e2) {
    return { bodyHtml: '<p>Today dashboard template missing.</p>', warnings: (today.warnings || []).concat([String(e2)]) };
  }
}

function CbvWebAppOpUx_renderGuidedPage_() {
  var email = '';
  try {
    email = Session.getActiveUser().getEmail();
  } catch (e) {
    email = '';
  }
  var rolePack = CbvWebAppOpUx_resolveWorkspaceRole_(email);
  var steps = CbvWebAppOpUx_getGuidedStepsForRole_(rolePack.workspaceRole);
  var model = { rolePack: rolePack, steps: steps };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_GUIDED');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: [] };
  } catch (e2) {
    return { bodyHtml: '<p>Guided flow template missing.</p>', warnings: [String(e2)] };
  }
}

/**
 * Raw template source (Apps Script <? ?> tags break HtmlService.createHtmlOutputFromFile HTML parse).
 * Falls back to createHtmlOutputFromFile().getContent() only if getCode is unavailable.
 */
function CbvWebAppOpUx__readHtmlTemplateRaw_(path) {
  var p = String(path || '').trim();
  if (!p) return '';
  try {
    var tpl = HtmlService.createTemplateFromFile(p);
    if (tpl && typeof tpl.getCode === 'function') return String(tpl.getCode() || '');
  } catch (e0) { /* fall through */ }
  try {
    return String(HtmlService.createHtmlOutputFromFile(p).getContent() || '');
  } catch (e1) {
    return '';
  }
}

function CbvWebAppOpUx_probeUiMarkersInProject_() {
  var out = { components: false, shell: false, detail: { mode: 'raw-template-marker-check' } };
  try {
    var c = CbvWebAppOpUx__readHtmlTemplateRaw_('html/WEBAPP_WORKSPACE_COMPONENTS');
    var needC = ['cbv-loading-overlay', 'cbv-empty-state', 'cbv-btn-operational'];
    var missC = needC.filter(function (m) { return c.indexOf(m) < 0; });
    out.components = missC.length === 0;
    out.detail.componentsLen = c.length;
    out.detail.componentsMissing = missC;
    out.detail.componentsFile = 'html/WEBAPP_WORKSPACE_COMPONENTS';
  } catch (e1) {
    out.detail.componentsErr = String(e1 && e1.message ? e1.message : e1);
  }
  try {
    var s = CbvWebAppOpUx__readHtmlTemplateRaw_('html/WEBAPP_WORKSPACE_SHELL');
    var needS = ['cbv-global-action-bar', 'cbv-toast-host', 'cbv-loading-overlay', 'cbv-busy-link', 'data-cbv-loading', 'cbv-btn-operational'];
    var missS = needS.filter(function (m) { return s.indexOf(m) < 0; });
    out.shell = missS.length === 0;
    out.detail.shellLen = s.length;
    out.detail.shellMissing = missS;
    out.detail.requiredMarkers = needS;
    out.detail.shellFile = 'html/WEBAPP_WORKSPACE_SHELL';
  } catch (e2) {
    out.detail.shellErr = String(e2 && e2.message ? e2.message : e2);
  }
  return out;
}
