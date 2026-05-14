/**
 * PHASE_96_1 — WebApp canonical route URL helper (read-only)
 *
 * Apps Script Web Apps run inside googleusercontent.com; relative hrefs like
 * `/workspace` resolve to the wrong host. All in-app links must be:
 *   BASE + '?route=' + encodeURIComponent(normalizedRoute)
 *
 * Override base (optional): Script Properties key `CBV_WEBAPP_BASE_URL`
 * (must be https, must not be googleusercontent.com, should end with /exec).
 */

var CBV_WEBAPP_ROUTE_URL_PHASE_ID = 'PHASE_96_1_WEBAPP_CANONICAL_ROUTE_URL_FIX';
var CBV_WEBAPP_ROUTE_URL_CONTRACT_VERSION = 'CBV_TCS_V1';

var CBV_WEBAPP_ROUTE_URL_DEFAULT_BASE =
  'https://script.google.com/macros/s/AKfycbxJNx9Vw6NBRmSZx0ds7-sNAeyGo6VKTfO8PUDpcz8e7kq1o3W0eUWRP78zPfRlKXBUPA/exec';

var CBV_WEBAPP_ROUTE_URL_PROP_KEY = 'CBV_WEBAPP_BASE_URL';

var CBV_WEBAPP_ROUTE_URL_FROZEN = [
  '/admin/reference',
  '/daily',
  '/execution/task',
  '/focus',
  '/home-alert/kanban',
  '/home-alert/my-queue',
  '/home-alert/sla',
  '/home-alert/timeline',
  '/reports',
  '/runtime/health',
  '/sop',
  '/workspace',
  '/workspace/daily',
  '/workspace/execution/task',
  '/workspace/focus',
  '/workspace/guided',
  '/workspace/role-home',
  '/workspace/sop',
  '/workspace/today',
  '/workspace/workboard',
  '/workboard',
  '/workspace/task-runtime'
];

function CbvWebAppRouteUrl__trimExec_(base) {
  var b = String(base || '').trim();
  if (!b) return CBV_WEBAPP_ROUTE_URL_DEFAULT_BASE;
  b = b.replace(/\?.*$/, '');
  if (b.indexOf('googleusercontent.com') >= 0) return CBV_WEBAPP_ROUTE_URL_DEFAULT_BASE;
  if (!/^https:\/\//i.test(b)) return CBV_WEBAPP_ROUTE_URL_DEFAULT_BASE;
  if (/\/exec$/i.test(b)) return b;
  return b.replace(/\/+$/, '') + '/exec';
}

function CbvWebAppRouteUrl_getBaseUrl() {
  try {
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) {
      var raw = PropertiesService.getScriptProperties().getProperty(CBV_WEBAPP_ROUTE_URL_PROP_KEY);
      if (raw && String(raw).trim()) {
        return CbvWebAppRouteUrl__trimExec_(raw);
      }
    }
  } catch (e) { /* fall through */ }
  return CBV_WEBAPP_ROUTE_URL_DEFAULT_BASE;
}

/**
 * Normalize route path (leading slash, no googleusercontent fragments).
 */
function CbvWebAppRouteUrl_normalizeRoute(route) {
  var r = String(route || '').trim();
  if (!r || r.indexOf('googleusercontent.com') >= 0) return '/workspace';
  r = r.replace(/^\/+/, '');
  if (!r) return '/workspace';
  if (r === 'workspace') return '/workspace';
  r = '/' + r.replace(/\/+/g, '/');
  if (r.length > 1 && r.charAt(r.length - 1) === '/') r = r.substring(0, r.length - 1);
  return r;
}

/**
 * Absolute navigation URL for a frozen route.
 */
function CbvWebAppRouteUrl_build(route) {
  var base = CbvWebAppRouteUrl_getBaseUrl();
  var nr = CbvWebAppRouteUrl_normalizeRoute(route);
  return base + '?route=' + encodeURIComponent(nr);
}

function CbvWebAppRouteUrl_getRouteMap() {
  return {
    workspace: '/workspace',
    roleHome: '/workspace/role-home',
    todayOps: '/workspace/today',
    guidedOps: '/workspace/guided',
    guidedSopWs: '/workspace/sop',
    guidedSopAlias: '/sop',
    dailyHome: '/workspace/daily',
    dailyAlias: '/daily',
    focusHome: '/workspace/focus',
    focusAlias: '/focus',
    execTaskWs: '/workspace/execution/task',
    execTaskAlias: '/execution/task',
    workboardWs: '/workspace/workboard',
    workboardAlias: '/workboard',
    myQueue: '/home-alert/my-queue',
    sla: '/home-alert/sla',
    timeline: '/home-alert/timeline',
    kanban: '/home-alert/kanban',
    runtimeHealth: '/runtime/health',
    reports: '/reports',
    adminReference: '/admin/reference'
  };
}

function CbvWebAppRouteUrl_getNavItemsVi() {
  var m = CbvWebAppRouteUrl_getRouteMap();
  var rows = [
    { label: 'Trang chủ', route: m.workspace },
    { label: 'Daily', route: m.dailyHome },
    { label: 'Hôm nay', route: m.todayOps },
    { label: 'Báo việc', route: m.workboardWs },
    { label: 'Theo vai trò', route: m.roleHome },
    { label: 'Hướng dẫn', route: m.guidedOps },
    { label: 'Việc của tôi', route: m.myQueue },
    { label: 'SLA / Quá hạn', route: m.sla },
    { label: 'Dòng thời gian', route: m.timeline },
    { label: 'Bảng trạng thái', route: m.kanban },
    { label: 'Sức khỏe hệ thống', route: m.runtimeHealth },
    { label: 'Báo cáo', route: m.reports },
    { label: 'Quản trị', route: m.adminReference }
  ];
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    out.push({ label: row.label, route: row.route, url: CbvWebAppRouteUrl_build(row.route) });
  }
  return out;
}

function CbvWebAppRouteUrl__out_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CbvWebAppRouteUrl_validate() {
  var warnings = [];
  var errors = [];
  var base = CbvWebAppRouteUrl_getBaseUrl();
  var detail = {
    baseUrl: base,
    routeMap: CbvWebAppRouteUrl_getRouteMap(),
    frozenMatch: true,
    allBuildContainExecRoute: true,
    noGoogleusercontent: true
  };

  if (base.indexOf('https://script.google.com/macros/s/') !== 0) {
    errors.push('Base URL must start with https://script.google.com/macros/s/');
  }
  if (!/\/exec$/i.test(base)) {
    errors.push('Base URL must end with /exec');
  }
  if (base.indexOf('googleusercontent.com') >= 0) {
    errors.push('Base URL must not contain googleusercontent.com');
    detail.noGoogleusercontent = false;
  }

  var m = CbvWebAppRouteUrl_getRouteMap();
  var keys = ['workspace', 'roleHome', 'todayOps', 'guidedOps', 'guidedSopWs', 'guidedSopAlias', 'dailyHome', 'dailyAlias', 'focusHome', 'focusAlias', 'execTaskWs', 'execTaskAlias', 'workboardWs', 'workboardAlias', 'myQueue', 'sla', 'timeline', 'kanban', 'runtimeHealth', 'reports', 'adminReference'];
  for (var i = 0; i < keys.length; i++) {
    if (!m[keys[i]]) errors.push('Route map missing key: ' + keys[i]);
  }
  var paths = keys.map(function(k) { return m[k]; }).sort().join('|');
  var exp = CBV_WEBAPP_ROUTE_URL_FROZEN.slice().sort().join('|');
  if (paths !== exp) {
    detail.frozenMatch = false;
    errors.push('Route map paths drifted from frozen operational set');
  }

  for (var j = 0; j < CBV_WEBAPP_ROUTE_URL_FROZEN.length; j++) {
    var u = CbvWebAppRouteUrl_build(CBV_WEBAPP_ROUTE_URL_FROZEN[j]);
    if (u.indexOf('?route=') < 0) {
      detail.allBuildContainExecRoute = false;
      errors.push('Built URL missing ?route= for ' + CBV_WEBAPP_ROUTE_URL_FROZEN[j]);
    }
    if (u.indexOf('googleusercontent.com') >= 0) {
      detail.noGoogleusercontent = false;
      errors.push('Built URL contains googleusercontent.com');
    }
  }

  if (typeof CbvWebAppVi_getWebAppLinks === 'function') {
    try {
      var links = CbvWebAppVi_getWebAppLinks();
      var canon = links && links.canonicalExecUrl ? links.canonicalExecUrl : '';
      if (canon && canon.indexOf('googleusercontent.com') >= 0) {
        warnings.push('CbvWebAppVi_getWebAppLinks canonicalExecUrl still references googleusercontent.com');
      }
    } catch (eL) {
      warnings.push('CbvWebAppVi_getWebAppLinks probe: ' + (eL && eL.message ? eL.message : String(eL)));
    }
  }

  return CbvWebAppRouteUrl__out_(errors.length === 0, detail, warnings, errors);
}

/**
 * MILESTONE_06 — Parse `route` query value that may embed `?taskId=...` (WebApp READ_FIRST).
 * Preserves legacy routes when `route` is a plain path (no inner `?`).
 */
function CbvWebAppRoute__parseQueryString_(qs) {
  var out = {};
  var s = String(qs || '').trim();
  if (!s) return out;
  var parts = s.split('&');
  for (var i = 0; i < parts.length; i++) {
    var seg = parts[i];
    if (!seg) continue;
    var eq = seg.indexOf('=');
    var k = eq >= 0 ? seg.substring(0, eq) : seg;
    var v = eq >= 0 ? seg.substring(eq + 1) : '';
    try {
      k = decodeURIComponent(k.replace(/\+/g, ' '));
    } catch (e0) { /* keep */ }
    try {
      v = decodeURIComponent(v.replace(/\+/g, ' '));
    } catch (e1) { /* keep */ }
    if (k) out[k] = v;
  }
  return out;
}

function CbvWebAppRoute_normalizePath_(route) {
  return CbvWebAppRouteUrl_normalizeRoute(route);
}

/**
 * Merge inner query from `route` string with top-level `e.parameter` (excluding route/path keys).
 * Top-level wins on duplicate keys.
 */
function CbvWebAppRoute_mergeParams_(e, parsed) {
  e = e || {};
  var p = e.parameter || {};
  var inner = (parsed && parsed.params) ? parsed.params : {};
  var out = {};
  var k;
  for (k in inner) {
    if (Object.prototype.hasOwnProperty.call(inner, k)) {
      out[k] = inner[k];
    }
  }
  for (var k2 in p) {
    if (!Object.prototype.hasOwnProperty.call(p, k2)) continue;
    var lk = String(k2).toLowerCase();
    if (lk === 'route' || lk === 'path') continue;
    out[k2] = p[k2];
  }
  var rt = CbvWebAppRoute_normalizePath_((parsed && parsed.route) != null ? parsed.route : '');
  return { route: rt, params: out };
}

function CbvWebAppRoute_parseRouteAndParams_(rawRoute, e) {
  var raw = String(rawRoute != null ? rawRoute : '').trim();
  var guard = 0;
  while (guard < 5 && raw.indexOf('%') >= 0) {
    try {
      var dec = decodeURIComponent(raw);
      if (dec === raw) break;
      raw = dec;
    } catch (ex) {
      break;
    }
    guard++;
  }
  var path = raw;
  var qp = {};
  var qi = path.indexOf('?');
  if (qi >= 0) {
    qp = CbvWebAppRoute__parseQueryString_(path.substring(qi + 1));
    path = path.substring(0, qi);
  }
  path = CbvWebAppRoute_normalizePath_(path);
  return CbvWebAppRoute_mergeParams_(e, { route: path, params: qp });
}

/**
 * Canonical exec URL with `?route=` plus extra top-level query pairs (e.g. `&taskId=`).
 */
function CbvWebAppRouteUrl_buildWithQuery(routePath, extraParams) {
  var base = CbvWebAppRouteUrl_getBaseUrl();
  var nr = CbvWebAppRouteUrl_normalizeRoute(routePath);
  var u = base + '?route=' + encodeURIComponent(nr);
  var q = extraParams || {};
  for (var k in q) {
    if (!Object.prototype.hasOwnProperty.call(q, k)) continue;
    if (q[k] == null || q[k] === '') continue;
    u += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(String(q[k]));
  }
  return u;
}
