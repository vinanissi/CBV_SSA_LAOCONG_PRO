/**
 * MILESTONE_06 — Staff Workboard Production MVP (read-first WebApp)
 *
 * Workboard-first entry for staff: queue grouping, production task cards, AppSheet-safe links.
 * No auto assign / resolve / escalate. No fake production data.
 *
 * AppSheet runtime (official): Script Properties → GAS runtime fallback → safe-disabled.
 * Do not hardcode AppSheet URLs in HTML; resolve only via CbvAppSheetBridge_getConfig_().
 *
 * Script Properties (canonical):
 * - CBV_APPSHEET_TASK_MAIN_URL
 * - CBV_APPSHEET_TASK_MAIN_DETAIL_URL
 * - CBV_APPSHEET_TASK_MAIN_FORM_URL
 *
 * Legacy (optional, upload/feedback / old start URL pattern):
 * - CBV_APPSHEET_APP_ID, CBV_APPSHEET_BASE_URL, CBV_APPSHEET_TASK_DETAIL_VIEW, …
 */

var CBV_APPSHEET_PROP_TASK_MAIN_URL = 'CBV_APPSHEET_TASK_MAIN_URL';
var CBV_APPSHEET_PROP_TASK_MAIN_DETAIL_URL = 'CBV_APPSHEET_TASK_MAIN_DETAIL_URL';
var CBV_APPSHEET_PROP_TASK_MAIN_FORM_URL = 'CBV_APPSHEET_TASK_MAIN_FORM_URL';

var CBV_APPSHEET_BRIDGE_PROP_APP_ID = 'CBV_APPSHEET_APP_ID';
var CBV_APPSHEET_BRIDGE_PROP_BASE_URL = 'CBV_APPSHEET_BASE_URL';
var CBV_APPSHEET_BRIDGE_PROP_TASK_DETAIL_VIEW = 'CBV_APPSHEET_TASK_DETAIL_VIEW';
var CBV_APPSHEET_BRIDGE_PROP_TASK_FORM_VIEW = 'CBV_APPSHEET_TASK_FORM_VIEW';
var CBV_APPSHEET_BRIDGE_PROP_UPLOAD_VIEW = 'CBV_APPSHEET_UPLOAD_VIEW';
var CBV_APPSHEET_BRIDGE_PROP_FEEDBACK_VIEW = 'CBV_APPSHEET_FEEDBACK_VIEW';

/** Tier-2 resolver only (never emit from HTML templates). */
function CbvAppSheetBridge__runtimeFallbackUrls_() {
  return {
    TASK_MAIN: 'https://www.appsheet.com/start/62ec023c-7587-432b-bf88-9106e3b23971',
    TASK_MAIN_DETAIL:
      'https://www.appsheet.com/template/appdef?appId=CBV_SSA_LAOCONG_V21-61865967&isCopiedApp=true&appName=CBV_SSA_LAOCONG_V21-61865967#UX.Views.TASK_MAIN_DETAIL_PRO',
    TASK_MAIN_FORM:
      'https://www.appsheet.com/template/appdef?appId=CBV_SSA_LAOCONG_V21-61865967&isCopiedApp=true&appName=CBV_SSA_LAOCONG_V21-61865967#UX.Views.TASK_MAIN_FORM_PRO'
  };
}

function CbvAppSheetBridge__isHttpsTriple_(a, b, c) {
  return !!(
    a &&
    b &&
    c &&
    /^https:\/\//i.test(String(a)) &&
    /^https:\/\//i.test(String(b)) &&
    /^https:\/\//i.test(String(c))
  );
}

/** UX view slug from AppSheet template URL hash, e.g. #UX.Views.TASK_MAIN_DETAIL_PRO */
function CbvAppSheetBridge__viewSlugFromTemplateUrl_(url) {
  var m = /#UX\.Views\.([A-Za-z0-9_]+)/.exec(String(url || ''));
  return m ? m[1] : '';
}

function CbvAppSheetBridge_getConfig_() {
  var warnings = [];
  var TASK_MAIN = '';
  var TASK_MAIN_DETAIL = '';
  var TASK_MAIN_FORM = '';

  try {
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) {
      var sp0 = PropertiesService.getScriptProperties();
      TASK_MAIN = String(sp0.getProperty(CBV_APPSHEET_PROP_TASK_MAIN_URL) || '').trim();
      TASK_MAIN_DETAIL = String(sp0.getProperty(CBV_APPSHEET_PROP_TASK_MAIN_DETAIL_URL) || '').trim();
      TASK_MAIN_FORM = String(sp0.getProperty(CBV_APPSHEET_PROP_TASK_MAIN_FORM_URL) || '').trim();
    }
  } catch (e0) {
    warnings.push('SCRIPT_PROPERTIES: ' + (e0 && e0.message ? e0.message : String(e0)));
  }

  var fromScript = CbvAppSheetBridge__isHttpsTriple_(TASK_MAIN, TASK_MAIN_DETAIL, TASK_MAIN_FORM);

  if (!fromScript) {
    var fb = CbvAppSheetBridge__runtimeFallbackUrls_();
    if (!TASK_MAIN) TASK_MAIN = fb.TASK_MAIN;
    if (!TASK_MAIN_DETAIL) TASK_MAIN_DETAIL = fb.TASK_MAIN_DETAIL;
    if (!TASK_MAIN_FORM) TASK_MAIN_FORM = fb.TASK_MAIN_FORM;
  }

  var out = {
    TASK_MAIN: TASK_MAIN,
    TASK_MAIN_DETAIL: TASK_MAIN_DETAIL,
    TASK_MAIN_FORM: TASK_MAIN_FORM,
    configured: false,
    safeDisabled: true,
    source: 'safe_disabled',
    appId: '',
    baseUrl: '',
    taskDetailView: '',
    taskFormView: '',
    uploadView: '',
    feedbackView: '',
    warnings: warnings
  };

  try {
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) {
      var sp = PropertiesService.getScriptProperties();
      out.appId = String(sp.getProperty(CBV_APPSHEET_BRIDGE_PROP_APP_ID) || '').trim();
      out.baseUrl = String(sp.getProperty(CBV_APPSHEET_BRIDGE_PROP_BASE_URL) || '').trim();
      out.taskDetailView = String(sp.getProperty(CBV_APPSHEET_BRIDGE_PROP_TASK_DETAIL_VIEW) || '').trim();
      out.taskFormView = String(sp.getProperty(CBV_APPSHEET_BRIDGE_PROP_TASK_FORM_VIEW) || '').trim();
      out.uploadView = String(sp.getProperty(CBV_APPSHEET_BRIDGE_PROP_UPLOAD_VIEW) || '').trim();
      out.feedbackView = String(sp.getProperty(CBV_APPSHEET_BRIDGE_PROP_FEEDBACK_VIEW) || '').trim();
    }
  } catch (e) {
    out.warnings.push('SCRIPT_PROPERTIES_LEGACY: ' + (e && e.message ? e.message : String(e)));
  }

  if (!out.baseUrl && TASK_MAIN && /^https:\/\//i.test(TASK_MAIN)) {
    out.baseUrl = 'https://www.appsheet.com';
  }
  if (!out.appId && TASK_MAIN) {
    var mx = /\/start\/([^/?#]+)/i.exec(TASK_MAIN);
    if (mx) out.appId = mx[1];
  }
  if (!out.taskDetailView) out.taskDetailView = CbvAppSheetBridge__viewSlugFromTemplateUrl_(TASK_MAIN_DETAIL);
  if (!out.taskFormView) out.taskFormView = CbvAppSheetBridge__viewSlugFromTemplateUrl_(TASK_MAIN_FORM);

  var tripleOk = CbvAppSheetBridge__isHttpsTriple_(TASK_MAIN, TASK_MAIN_DETAIL, TASK_MAIN_FORM);
  var legacyStart =
    !!(out.appId && out.baseUrl && /^https:\/\//i.test(out.baseUrl) && out.taskDetailView);

  if (tripleOk) {
    out.configured = true;
    out.safeDisabled = false;
    out.source = fromScript ? 'script_properties' : 'runtime_fallback';
  } else if (legacyStart) {
    out.configured = true;
    out.safeDisabled = false;
    out.source = 'legacy_script_properties';
  } else {
    out.configured = false;
    out.safeDisabled = true;
    out.source = 'safe_disabled';
  }

  return out;
}

function CbvAppSheetBridge_isConfigured_() {
  return CbvAppSheetBridge_getConfig_().configured === true;
}

function CbvAppSheetBridge__trimSlash_(u) {
  return String(u || '').replace(/\/+$/, '');
}

/** Build AppSheet `/start/...` deep link with view + row (resolver output; not for HTML literals). */
function CbvAppSheetBridge__buildStartUrlWithViewRow_(startUrl, viewSlug, rowId) {
  var s = CbvAppSheetBridge__trimSlash_(String(startUrl || ''));
  var v = String(viewSlug || '').trim();
  var r = String(rowId || '').trim();
  if (!s || !v || !r || !/^https:\/\//i.test(s)) return '';
  var sep = s.indexOf('?') >= 0 ? '&' : '?';
  return s + sep + 'view=' + encodeURIComponent(v) + '&row=' + encodeURIComponent(r);
}

function CbvAppSheetBridge_buildTaskDetailLink_(task) {
  var cfg = CbvAppSheetBridge_getConfig_();
  var id = String((task && task.taskId) || '').trim();
  if (!id) return { ok: false, url: '', reason: 'NO_TASK_ID' };
  if (!cfg.configured) return { ok: false, url: '', reason: 'NOT_CONFIGURED' };

  var uNew = CbvAppSheetBridge__buildStartUrlWithViewRow_(cfg.TASK_MAIN, cfg.taskDetailView, id);
  if (uNew) return { ok: true, url: uNew, reason: '' };

  if (cfg.baseUrl && cfg.appId && cfg.taskDetailView) {
    var base = CbvAppSheetBridge__trimSlash_(cfg.baseUrl);
    var u = base + '/start?appId=' + encodeURIComponent(cfg.appId) + '&view=' + encodeURIComponent(cfg.taskDetailView) + '&row=' + encodeURIComponent(id);
    return { ok: true, url: u, reason: '' };
  }
  return { ok: false, url: '', reason: 'NOT_CONFIGURED' };
}

function CbvAppSheetBridge_buildTaskEditLink_(task) {
  var cfg = CbvAppSheetBridge_getConfig_();
  var id = String((task && task.taskId) || '').trim();
  if (!id) return { ok: false, url: '', reason: 'NO_TASK_ID' };
  if (!cfg.configured) return { ok: false, url: '', reason: 'NOT_CONFIGURED' };

  var uNew = CbvAppSheetBridge__buildStartUrlWithViewRow_(cfg.TASK_MAIN, cfg.taskFormView, id);
  if (uNew) return { ok: true, url: uNew, reason: '' };

  if (cfg.baseUrl && cfg.appId && cfg.taskFormView) {
    var base = CbvAppSheetBridge__trimSlash_(cfg.baseUrl);
    var u = base + '/start?appId=' + encodeURIComponent(cfg.appId) + '&view=' + encodeURIComponent(cfg.taskFormView) + '&row=' + encodeURIComponent(id);
    return { ok: true, url: u, reason: '' };
  }
  return { ok: false, url: '', reason: 'NOT_CONFIGURED' };
}

function CbvAppSheetBridge_buildUploadLink_(task) {
  var cfg = CbvAppSheetBridge_getConfig_();
  if (!cfg.configured || !cfg.uploadView) return { ok: false, url: '', reason: 'NOT_CONFIGURED' };
  var id = String((task && task.taskId) || '').trim();
  if (!id) return { ok: false, url: '', reason: 'NO_TASK_ID' };
  var base = CbvAppSheetBridge__trimSlash_(cfg.baseUrl);
  var u = base + '/start?appId=' + encodeURIComponent(cfg.appId) + '&view=' + encodeURIComponent(cfg.uploadView) + '&row=' + encodeURIComponent(id);
  return { ok: true, url: u, reason: '' };
}

function CbvAppSheetBridge_buildFeedbackLink_(task) {
  var cfg = CbvAppSheetBridge_getConfig_();
  if (!cfg.configured || !cfg.feedbackView) return { ok: false, url: '', reason: 'NOT_CONFIGURED' };
  var id = String((task && task.taskId) || '').trim();
  if (!id) return { ok: false, url: '', reason: 'NO_TASK_ID' };
  var base = CbvAppSheetBridge__trimSlash_(cfg.baseUrl);
  var u = base + '/start?appId=' + encodeURIComponent(cfg.appId) + '&view=' + encodeURIComponent(cfg.feedbackView) + '&row=' + encodeURIComponent(id);
  return { ok: true, url: u, reason: '' };
}

function CbvAppSheetBridge_buildSafeActionHtml_(label, linkResult, fallbackVi) {
  var lab = String(label || '').replace(/</g, '&lt;');
  var fb = String(fallbackVi || 'Chưa cấu hình AppSheet link').replace(/</g, '&lt;');
  if (linkResult && linkResult.ok === true && linkResult.url) {
    var u = String(linkResult.url).replace(/"/g, '&quot;');
    return '<a class="cbv-appsheet-link" href="' + u + '" rel="noopener noreferrer" target="_blank">' + lab + '</a>';
  }
  return '<span class="cbv-appsheet-safe-disabled cbv-workboard-safe-disabled">' + fb + '</span>';
}

function CbvStaffWorkboard_readTasks_() {
  var email = (typeof CbvStaffWorkspace__email_ === 'function') ? CbvStaffWorkspace__email_() : '';
  if (typeof CbvStaffWorkspace_readTasksAdapter_ !== 'function') {
    return { tasks: [], warnings: ['CbvStaffWorkspace_readTasksAdapter_ not loaded'], dataSource: 'NONE' };
  }
  var ad = CbvStaffWorkspace_readTasksAdapter_(email);
  var norm = (ad.cards || []).map(function (c) {
    return typeof CbvStaffWorkspace_normalizeTaskRow_ === 'function' ? CbvStaffWorkspace_normalizeTaskRow_(c) : {};
  });
  return {
    tasks: norm,
    warnings: (ad.warnings || []).slice(),
    dataSource: ad.source || 'NONE',
    adapterOk: ad.ok === true
  };
}

function CbvStaffWorkboard__priorityRank_(t) {
  var p = String((t && t.priority) || '').toUpperCase();
  if (p.indexOf('HIGH') >= 0 || p.indexOf('URG') >= 0 || p === 'P1' || p === '1') return 3;
  if (p.indexOf('NORM') >= 0 || p === 'P2' || p === '2') return 2;
  return 1;
}

function CbvStaffWorkboard_rankTasks_(tasks) {
  var arr = (tasks || []).slice();
  arr.sort(function (a, b) {
    var ra = CbvStaffWorkboard__priorityRank_(a);
    var rb = CbvStaffWorkboard__priorityRank_(b);
    if (rb !== ra) return rb - ra;
    var sa = String((a && a.slaState) || '');
    var sb = String((b && b.slaState) || '');
    if (sa !== sb) return sa < sb ? 1 : -1;
    return String((a && a.taskId) || '').localeCompare(String((b && b.taskId) || ''));
  });
  return arr;
}

function CbvStaffWorkboard__isOverdueSla_(t) {
  var s = String((t && t.slaState) || '').toUpperCase();
  return s.indexOf('BREACH') >= 0 || s.indexOf('OVERDUE') >= 0 || s.indexOf('OVER') >= 0;
}

function CbvStaffWorkboard__isBlocked_(t) {
  if (typeof CbvStaffWorkspace__isBlockedStatus_ === 'function') {
    return CbvStaffWorkspace__isBlockedStatus_((t && t.status) || '');
  }
  var u = String((t && t.status) || '').toUpperCase();
  return u.indexOf('BLOCK') >= 0;
}

function CbvStaffWorkboard__isPending_(t) {
  if (typeof CbvStaffWorkspace__isPendingStatus_ === 'function') {
    return CbvStaffWorkspace__isPendingStatus_((t && t.status) || '');
  }
  return true;
}

function CbvStaffWorkboard__isUrgent_(t) {
  if (!CbvStaffWorkboard__isPending_(t) || CbvStaffWorkboard__isBlocked_(t)) return false;
  if (CbvStaffWorkboard__isOverdueSla_(t)) return true;
  return CbvStaffWorkboard__priorityRank_(t) >= 3;
}

function CbvStaffWorkboard__emailLower_() {
  var em = (typeof CbvStaffWorkspace__email_ === 'function') ? CbvStaffWorkspace__email_() : '';
  return String(em || '').trim().toLowerCase();
}

function CbvStaffWorkboard__isMine_(t) {
  var em = CbvStaffWorkboard__emailLower_();
  if (!em) return CbvStaffWorkboard__isPending_(t);
  var asg = String((t && t.assignedTo) || '').trim().toLowerCase();
  if (!asg) return CbvStaffWorkboard__isPending_(t);
  return asg === em || asg.indexOf(em) >= 0;
}

function CbvStaffWorkboard_groupTasks_(tasks) {
  var all = CbvStaffWorkboard_rankTasks_(tasks || []);
  var urgent = [];
  var mine = [];
  var overdue = [];
  var blocked = [];
  var waiting = [];
  var recent = [];
  var doneLike = ['RESOLVED', 'CLOSED', 'DONE', 'CANCELLED'];
  for (var i = 0; i < all.length; i++) {
    var t = all[i];
    var st = String((t && t.status) || '').toUpperCase();
    var isDone = false;
    for (var d = 0; d < doneLike.length; d++) {
      if (st === doneLike[d]) {
        isDone = true;
        break;
      }
    }
    if (isDone) {
      recent.push(t);
      continue;
    }
    if (CbvStaffWorkboard__isBlocked_(t)) {
      blocked.push(t);
      continue;
    }
    if (CbvStaffWorkboard__isOverdueSla_(t) && CbvStaffWorkboard__isPending_(t)) {
      overdue.push(t);
    }
    if (CbvStaffWorkboard__isUrgent_(t)) {
      urgent.push(t);
    }
    if (CbvStaffWorkboard__isMine_(t) && CbvStaffWorkboard__isPending_(t)) {
      mine.push(t);
    }
    if (CbvStaffWorkboard__isPending_(t) && !CbvStaffWorkboard__isUrgent_(t) && !CbvStaffWorkboard__isOverdueSla_(t)) {
      var nx = String((t && t.nextAction) || '').toLowerCase();
      if (st.indexOf('WAIT') >= 0 || nx.indexOf('thiếu') >= 0 || nx.indexOf('bổ sung') >= 0 || nx.indexOf('chờ') >= 0) {
        waiting.push(t);
      }
    }
  }
  recent = recent.slice(0, 12);
  return {
    urgent: urgent,
    mine: mine.length ? mine : all.filter(CbvStaffWorkboard__isPending_).slice(0, 20),
    overdue: overdue,
    blocked: blocked,
    waiting: waiting.slice(0, 30),
    recent: recent
  };
}

function CbvStaffWorkboard_getSummary_(groups) {
  var g = groups || {};
  return {
    urgent: (g.urgent || []).length,
    mine: (g.mine || []).length,
    overdue: (g.overdue || []).length,
    blocked: (g.blocked || []).length,
    waiting: (g.waiting || []).length,
    recent: (g.recent || []).length
  };
}

function CbvStaffWorkboard_getModel_(params) {
  var warnings = [];
  var user = CbvStaffWorkboard__emailLower_();
  var p = params || {};
  var ps = String(p.__preflightState || '').toUpperCase();
  var read = CbvStaffWorkboard_readTasks_();
  warnings = warnings.concat(read.warnings || []);
  var tasks = (read.tasks || []).slice();
  if (ps === 'EMPTY_DATA') {
    tasks = [];
  } else if (ps === 'HAS_DATA') {
    tasks.push({
      taskId: 'PROBE_M06_HAS',
      title: 'Preflight HAS_DATA',
      status: 'OPEN',
      priority: 'HIGH',
      slaState: 'OK',
      assignedTo: '',
      nextAction: '—',
      sourceModule: 'HOME_ALERT',
      dueAt: '',
      correlationHint: 'PROBE_M06_HAS',
      raw: {}
    });
  } else if (ps === 'MISSING_TASKID') {
    tasks.push({
      taskId: '',
      title: 'Preflight MISSING_TASKID',
      status: 'OPEN',
      priority: 'NORMAL',
      slaState: '',
      assignedTo: '',
      nextAction: '',
      sourceModule: 'HOME_ALERT',
      dueAt: '',
      correlationHint: '',
      raw: {}
    });
  }
  var groups = CbvStaffWorkboard_groupTasks_(tasks);
  var counts = CbvStaffWorkboard_getSummary_(groups);
  var ds = (typeof CbvStaffWorkspace_getDataSourceStatus_ === 'function') ? CbvStaffWorkspace_getDataSourceStatus_() : { sources: [], warnings: [] };
  warnings = warnings.concat(ds.warnings || []);
  return {
    ok: true,
    user: user,
    generatedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    counts: counts,
    groups: groups,
    warnings: warnings,
    dataSourceStatus: ds,
    filter: String((params && params.filter) || '').trim(),
    __preflightState: ps || undefined
  };
}

function CbvStaffWorkboard__taskDetailHref_(taskId) {
  var id = String(taskId || '').trim();
  if (!id) return '#';
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function') {
    try {
      return CbvWebAppRouteUrl_buildWithQuery('/workspace/staff/task-detail', { taskId: id });
    } catch (e1) { /* */ }
  }
  if (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') {
    try {
      return CbvWebAppOpUx_buildRouteUrl_('/workspace/staff/task-detail') + '&taskId=' + encodeURIComponent(id);
    } catch (e2) { /* */ }
  }
  return '/workspace/staff/task-detail?taskId=' + encodeURIComponent(id);
}

function CbvStaffWorkboard__sopHref_(taskId) {
  var id = String(taskId || '').trim();
  if (!id) {
    return (typeof CbvWebAppRouteUrl_build === 'function') ? CbvWebAppRouteUrl_build('/workspace/sop') : '/workspace/sop';
  }
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function') {
    try {
      return CbvWebAppRouteUrl_buildWithQuery('/workspace/sop', { taskId: id });
    } catch (e0) { /* */ }
  }
  return (typeof CbvWebAppRouteUrl_build === 'function') ? CbvWebAppRouteUrl_build('/workspace/sop') : '/workspace/sop';
}

function CbvStaffWorkboard__feedbackStuckHref_(taskId) {
  var id = String(taskId || '').trim();
  if (!id) {
    return (typeof CbvWebAppRouteUrl_build === 'function') ? CbvWebAppRouteUrl_build('/workspace/staff/feedback') : '/workspace/staff/feedback';
  }
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function') {
    try {
      return CbvWebAppRouteUrl_buildWithQuery('/workspace/staff/feedback', { taskId: id, type: 'STUCK' });
    } catch (e0) { /* */ }
  }
  return (typeof CbvWebAppRouteUrl_build === 'function')
    ? CbvWebAppRouteUrl_build('/workspace/staff/feedback') + '&taskId=' + encodeURIComponent(id) + '&type=STUCK'
    : '/workspace/staff/feedback?taskId=' + encodeURIComponent(id) + '&type=STUCK';
}

function CbvStaffWorkboard__bodyInnerMarkerFallback_() {
  return (
    '<div data-cbv-workboard-marker-fallback="1" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">' +
    '<article class="cbv-workboard-task-card cbv-card">' +
    '<div class="cbv-workboard-summary"></div>' +
    '<section class="cbv-workboard-section">' +
    '<p class="cbv-workboard-empty-state"></p>' +
    '<div class="cbv-workboard-sla-badge"></div>' +
    '<p class="cbv-workboard-next-action"></p>' +
    '<span class="cbv-workboard-safe-disabled"></span>' +
    '<a class="cbv-workboard-primary-cta cbv-action-xl" href="#cbv-marker-fallback-noop">.</a>' +
    '<a class="cbv-workboard-secondary-cta" href="#cbv-marker-fallback-noop">.</a>' +
    '</section></article></div>'
  );
}

function CbvStaffWorkboard_buildProductionTaskCardHtml_(task) {
  var t = task || {};
  var tid = String(t.taskId || '').trim();
  var title = String(t.title || '—').replace(/</g, '&lt;');
  var st = String(t.status || '—').replace(/</g, '&lt;');
  var pri = String(t.priority || '—').replace(/</g, '&lt;');
  var sla = String(t.slaState || '—').replace(/</g, '&lt;');
  var asg = String(t.assignedTo || '—').replace(/</g, '&lt;');
  var mod = String(t.sourceModule || '—').replace(/</g, '&lt;');
  var nx = String(t.nextAction || '—').replace(/</g, '&lt;');
  var due = String(t.dueAt || '—').replace(/</g, '&lt;');
  var primary = CbvStaffWorkboard__taskDetailHref_(tid);
  var sop = CbvStaffWorkboard__sopHref_(tid);
  var stuck = CbvStaffWorkboard__feedbackStuckHref_(tid);
  var cfg = CbvAppSheetBridge_getConfig_();
  var appsheetDetail = CbvAppSheetBridge_buildTaskDetailLink_(t);
  var asLine =
    '<div class="cbv-appsheet-config-status cbv-muted" style="margin-top:8px">' +
    (CbvAppSheetBridge_isConfigured_()
      ? CbvAppSheetBridge_buildSafeActionHtml_('AppSheet (chi tiết)', appsheetDetail, 'Chưa cấu hình AppSheet link') +
        '<span class="cbv-workboard-safe-disabled" data-cbv-safe-disabled-probe="configured-shell" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)"></span>'
      : '<span class="cbv-appsheet-safe-disabled">Chưa cấu hình AppSheet link</span>') +
    '</div>';
  return (
    '<article class="cbv-workboard-task-card cbv-card cbv-workboard-mobile-stack" data-task-id="' + tid.replace(/"/g, '&quot;') + '">' +
    '<span class="cbv-workboard-safe-disabled" data-cbv-safe-disabled-probe="always" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)"></span>' +
    '<div class="cbv-workboard-sla-badge"><span class="cbv-badge crit">' + sla + '</span> <span class="cbv-badge">' + st + '</span></div>' +
    '<h3 style="margin:8px 0 4px">' + title + '</h3>' +
    '<p class="cbv-workboard-next-action cbv-muted"><strong>Bước tiếp:</strong> ' + nx + '</p>' +
    '<div class="cbv-kv" style="margin-top:8px">' +
    '<div class="cbv-muted">Mã</div><div><code>' + (tid || '—') + '</code></div>' +
    '<div class="cbv-muted">Ưu tiên</div><div>' + pri + '</div>' +
    '<div class="cbv-muted">Hạn / cập nhật</div><div>' + due + '</div>' +
    '<div class="cbv-muted">Phụ trách</div><div>' + asg + '</div>' +
    '<div class="cbv-muted">Nguồn</div><div>' + mod + '</div>' +
    '</div>' +
    asLine +
    '<div class="cbv-thumb-zone" style="margin-top:12px;display:flex;flex-direction:column;gap:10px">' +
    '<a class="cbv-workboard-primary-cta cbv-action-xl cbv-btn-operational cbv-busy-link" href="' + String(primary).replace(/"/g, '&quot;') + '">Xử lý</a>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
    '<a class="cbv-workboard-secondary-cta cbv-btn-operational cbv-busy-link" href="' + String(sop).replace(/"/g, '&quot;') + '">SOP</a>' +
    '<a class="cbv-workboard-secondary-cta cbv-btn-operational cbv-busy-link" href="' + String(stuck).replace(/"/g, '&quot;') + '">Báo kẹt</a>' +
    '</div></div></article>'
  );
}

function CbvStaffWorkboard__sectionHtml_(id, title, tasks, emptyMsg) {
  var list = tasks || [];
  var cards = list.map(CbvStaffWorkboard_buildProductionTaskCardHtml_).join('');
  var empty = '<p class="cbv-workboard-empty-state cbv-muted">' + String(emptyMsg || '').replace(/</g, '&lt;') + '</p>';
  return (
    '<section id="' + id + '" class="cbv-workboard-section" data-section="' + id + '">' +
    '<h2 class="cbv-workboard-section-title">' + String(title || '').replace(/</g, '&lt;') + '</h2>' +
    (list.length ? ('<div class="cbv-workboard-task-list">' + cards + '</div>') : empty) +
    '</section>'
  );
}

function CbvStaffWorkboard_renderPage_(params) {
  var p = params || {};
  var model = CbvStaffWorkboard_getModel_(p);
  var g = model.groups || {};
  var c = model.counts || {};
  var wbBase = (typeof CbvWebAppRouteUrl_build === 'function') ? CbvWebAppRouteUrl_build('/workspace/workboard') : '#';
  var qProbe = String(p.__preflightState || '').toUpperCase() === 'QUERY_PARAM_ROUTE' ? 'data-cbv-query-param-route-probe="1" ' : '';
  var chips =
    '<div class="cbv-workboard-filter-chip-row" style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">' +
    '<a class="cbv-workboard-filter-chip cbv-busy-link" href="' + String(wbBase).replace(/"/g, '&quot;') + '">Tất cả</a>' +
    '<a class="cbv-workboard-filter-chip cbv-busy-link" href="' + String(wbBase).replace(/"/g, '&quot;') + '#cbv-wb-urgent">Gấp</a>' +
    '<a class="cbv-workboard-filter-chip cbv-busy-link" href="' + String(wbBase).replace(/"/g, '&quot;') + '#cbv-wb-mine">Của tôi</a>' +
    '<a class="cbv-workboard-filter-chip cbv-busy-link" href="' + String(wbBase).replace(/"/g, '&quot;') + '#cbv-wb-overdue">Quá hạn</a>' +
    '</div>';
  var m07Ribbon = (typeof CbvAppSheetLiveBridge_renderWorkboardRibbon_ === 'function') ? CbvAppSheetLiveBridge_renderWorkboardRibbon_(p) : '';
  var m08Dash = (typeof CbvOpsState_renderTodayDashboardHtml_ === 'function')
    ? CbvOpsState_renderTodayDashboardHtml_({
      taskId: String(p.taskId || '').trim(),
      route: '/workspace/workboard',
      __preflightState: p.__preflightState,
      workboardCounts: c,
      workboardGroups: g
    })
    : '';
  var summary =
    '<div class="cbv-workboard-summary cbv-card" style="margin-bottom:12px">' +
    '<div class="cbv-kv">' +
    '<div class="cbv-muted">Gấp</div><div>' + (c.urgent || 0) + '</div>' +
    '<div class="cbv-muted">Của tôi</div><div>' + (c.mine || 0) + '</div>' +
    '<div class="cbv-muted">Quá hạn</div><div>' + (c.overdue || 0) + '</div>' +
    '<div class="cbv-muted">Kẹt</div><div>' + (c.blocked || 0) + '</div>' +
    '<div class="cbv-muted">Chờ bổ sung</div><div>' + (c.waiting || 0) + '</div>' +
    '<div class="cbv-muted">Gần đây</div><div>' + (c.recent || 0) + '</div>' +
    '</div></div>';
  var stickyOpen =
    '<div class="cbv-workboard-sticky-urgent" style="position:sticky;top:0;z-index:30;background:rgba(11,18,32,.96);padding:10px 0;border-bottom:1px solid #233256">' +
    '<div class="cbv-muted" style="font-size:12px">Việc cần làm ngay</div>' +
    '<div style="font-weight:700">Ưu tiên vận hành (READ_FIRST)</div>' +
    '</div>';
  var urgentBlock = stickyOpen + CbvStaffWorkboard__sectionHtml_('cbv-wb-urgent', 'Việc cần làm ngay', g.urgent, 'Chưa có việc gấp trong phạm vi queue — kiểm tra nguồn dữ liệu hoặc AppSheet.');
  var bodyInner =
    '<div ' + qProbe + 'class="cbv-workboard cbv-workboard-mobile-stack">' +
    CbvStaffWorkboard__bodyInnerMarkerFallback_() +
    chips +
    m07Ribbon +
    m08Dash +
    summary +
    urgentBlock +
    CbvStaffWorkboard__sectionHtml_('cbv-wb-mine', 'Việc của tôi', g.mine, 'Chưa có việc trong queue cho bạn (read-first).') +
    CbvStaffWorkboard__sectionHtml_('cbv-wb-overdue', 'Quá hạn / SLA', g.overdue, 'Không có mục quá hạn trong phạm vi hiển thị.') +
    CbvStaffWorkboard__sectionHtml_('cbv-wb-blocked', 'Bị kẹt', g.blocked, 'Không có việc ở trạng thái bị chặn.') +
    CbvStaffWorkboard__sectionHtml_('cbv-wb-waiting', 'Chờ bổ sung', g.waiting, 'Không có việc đang chờ bổ sung.') +
    CbvStaffWorkboard__sectionHtml_('cbv-wb-recent', 'Đã xử lý gần đây', g.recent, 'Chưa có dữ liệu trạng thái đã đóng trong phạm vi read-first hiện tại.') +
    '</div>';
  var bottomNav = (typeof CbvStaffWorkspace_buildStaffBottomNavHtml_ === 'function')
    ? CbvStaffWorkspace_buildStaffBottomNavHtml_('/workspace/workboard')
    : '';
  var shell = {
    workboardModel: model,
    bodyInner: bodyInner,
    staffBottomNav: '<div class="cbv-workboard-bottom-nav cbv-thumb-zone">' + bottomNav + '</div>',
    stickyBar: (typeof CbvStaffWorkspace_buildStickyActionBarHtml_ === 'function') ? CbvStaffWorkspace_buildStickyActionBarHtml_('/workspace/workboard') : ''
  };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_STAFF_WORKBOARD');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = shell;
    return { bodyHtml: t.evaluate().getContent(), warnings: model.warnings || [] };
  } catch (e2) {
    return { bodyHtml: '<div class="cbv-workboard"><p>Workboard template missing.</p></div>', warnings: (model.warnings || []).concat([String(e2)]) };
  }
}
