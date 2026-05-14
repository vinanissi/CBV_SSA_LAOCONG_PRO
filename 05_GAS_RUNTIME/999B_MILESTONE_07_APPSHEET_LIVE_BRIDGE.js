/**
 * MILESTONE_07 — AppSheet Live Bridge (read-first; manual-first; no destructive mutation)
 *
 * Deep links + WebApp↔AppSheet handoff context + workboard ribbon UI.
 * Depends: 998Y (CbvAppSheetBridge_*), 998H (CbvWebAppRouteUrl_*), 998F (optional VI).
 */

var CBV_M07_UI_MARKERS = [
  'cbv-m07-appsheet-live-bridge-root',
  'cbv-m07-appsheet-config-runtime',
  'cbv-m07-appsheet-safe-disabled',
  'cbv-m07-deeplink-builder',
  'cbv-m07-context-handoff',
  'cbv-m07-upload-runtime',
  'cbv-m07-feedback-runtime',
  'cbv-m07-return-workboard',
  'cbv-m07-appsheet-health-runtime',
  'cbv-m07-route-query-param-safe',
  'cbv-m07-taskid-missing-fallback',
  'cbv-m07-empty-state',
  'cbv-m07-report-envelope',
  'cbv-appsheet-live-bridge-safe-disabled'
];

/**
 * Hidden strip: every M07 marker class appears in DOM even when AppSheet is off / taskId missing (UI Marker Contract).
 */
function CbvAppSheetLiveBridge__markerFallbackStripHtml_() {
  return (
    '<div class="cbv-m07-marker-fallback-strip cbv-m07-appsheet-live-bridge-root" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">' +
    '<span class="cbv-m07-appsheet-config-runtime"></span>' +
    '<span class="cbv-m07-appsheet-safe-disabled cbv-appsheet-live-bridge-safe-disabled" hidden></span>' +
    '<span class="cbv-m07-deeplink-builder"></span>' +
    '<span class="cbv-m07-context-handoff"></span>' +
    '<span class="cbv-m07-upload-runtime"></span>' +
    '<span class="cbv-m07-feedback-runtime"></span>' +
    '<span class="cbv-m07-return-workboard"></span>' +
    '<span class="cbv-m07-appsheet-health-runtime"></span>' +
    '<span class="cbv-m07-route-query-param-safe"></span>' +
    '<span class="cbv-m07-taskid-missing-fallback"></span>' +
    '<span class="cbv-m07-empty-state"></span>' +
    '<span class="cbv-m07-report-envelope"></span>' +
    '</div>'
  );
}

function CbvAppSheetLiveBridge_buildWebAppReturnUrl_(returnRoute, taskId) {
  var rr = String(returnRoute || '/workspace/workboard').trim() || '/workspace/workboard';
  if (rr.charAt(0) !== '/') rr = '/' + rr;
  var tid = String(taskId || '').trim();
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function') {
    try {
      return tid ? CbvWebAppRouteUrl_buildWithQuery(rr, { taskId: tid }) : CbvWebAppRouteUrl_build(rr);
    } catch (e0) { /* */ }
  }
  if (tid) return rr + (rr.indexOf('?') >= 0 ? '&' : '?') + 'taskId=' + encodeURIComponent(tid);
  if (typeof CbvWebAppRouteUrl_build === 'function') {
    try {
      return CbvWebAppRouteUrl_build(rr);
    } catch (e1) { /* */ }
  }
  return rr;
}

function CbvAppSheetLiveBridge__encodeHandoff_(ctx) {
  var o = {
    v: 1,
    route: String(ctx.route || '').trim(),
    role: String(ctx.role || '').trim(),
    source: String(ctx.source || 'webapp').trim(),
    returnRoute: String(ctx.returnRoute || '').trim(),
    mode: String(ctx.mode || 'detail').trim()
  };
  var json = JSON.stringify(o);
  try {
    if (typeof Utilities !== 'undefined' && Utilities.base64EncodeWebSafe && Utilities.newBlob) {
      return Utilities.base64EncodeWebSafe(Utilities.newBlob(json).getBytes());
    }
  } catch (e) { /* */ }
  return encodeURIComponent(json);
}

/**
 * @param {{ taskId?: string, route?: string, role?: string, source?: string, returnRoute?: string, mode?: string }} opt
 * @returns {{ ok: boolean, url: string, reason: string, mode: string, returnWebAppUrl: string, safeDisabled: boolean, handoff?: Object }}
 * mode: detail|form|upload|feedback|view (view aliases to detail)
 */
function CbvAppSheetLiveBridge_buildDeepLink_(opt) {
  var o = opt || {};
  var mode = String(o.mode || 'detail').toLowerCase();
  if (mode === 'view') mode = 'detail';
  var taskId = String(o.taskId || '').trim();
  var task = { taskId: taskId };
  var retPath = String(o.returnRoute || o.route || '/workspace/workboard').trim() || '/workspace/workboard';
  if (retPath.charAt(0) !== '/') retPath = '/' + retPath;
  var retUrl = CbvAppSheetLiveBridge_buildWebAppReturnUrl_(retPath, taskId);
  var ctx = {
    route: String(o.route || '').trim(),
    role: String(o.role || '').trim(),
    source: String(o.source || 'webapp').trim(),
    returnRoute: String(o.returnRoute || o.route || '/workspace/workboard').trim(),
    mode: mode
  };
  var handoff = CbvAppSheetLiveBridge__encodeHandoff_(ctx);
  var baseResult = { ok: false, url: '', reason: 'NOT_CONFIGURED', mode: mode, returnWebAppUrl: retUrl, safeDisabled: true };

  if (typeof CbvAppSheetBridge_getConfig_ !== 'function') {
    baseResult.reason = 'BRIDGE_MISSING';
    return baseResult;
  }

  var cfg = CbvAppSheetBridge_getConfig_();
  if (!cfg || cfg.configured !== true) {
    return baseResult;
  }

  if (!taskId) {
    return { ok: false, url: '', reason: 'NO_TASK_ID', mode: mode, returnWebAppUrl: retUrl, safeDisabled: true };
  }

  var r = null;
  if (mode === 'form' && typeof CbvAppSheetBridge_buildTaskEditLink_ === 'function') {
    r = CbvAppSheetBridge_buildTaskEditLink_(task);
  } else if (mode === 'upload' && typeof CbvAppSheetBridge_buildUploadLink_ === 'function') {
    r = CbvAppSheetBridge_buildUploadLink_(task);
  } else if (mode === 'feedback' && typeof CbvAppSheetBridge_buildFeedbackLink_ === 'function') {
    r = CbvAppSheetBridge_buildFeedbackLink_(task);
  } else if (typeof CbvAppSheetBridge_buildTaskDetailLink_ === 'function') {
    r = CbvAppSheetBridge_buildTaskDetailLink_(task);
  }

  if (!r || r.ok !== true || !r.url) {
    return { ok: false, url: '', reason: (r && r.reason) ? r.reason : 'LINK_FAIL', mode: mode, returnWebAppUrl: retUrl, safeDisabled: true };
  }

  var sep = String(r.url).indexOf('?') >= 0 ? '&' : '?';
  var u = String(r.url) + sep + 'cbvHandoff=' + encodeURIComponent(handoff) + '&cbvReturn=' + encodeURIComponent(retUrl);
  return { ok: true, url: u, reason: '', mode: mode, returnWebAppUrl: retUrl, safeDisabled: false, handoff: ctx };
}

/**
 * Ribbon for staff workboard: markers + contextual AppSheet actions + return link.
 * Honors __preflightState: HAS_DATA | EMPTY_DATA | APPSHEET_UNCONFIGURED | MISSING_TASKID | QUERY_PARAM_ROUTE
 */
function CbvAppSheetLiveBridge_renderWorkboardRibbon_(params) {
  var p = params || {};
  var pf = String(p.__preflightState || '').toUpperCase();
  var tid = String(p.taskId || '').trim();
  if (pf === 'MISSING_TASKID') tid = '';
  var appsheetOff = pf === 'APPSHEET_UNCONFIGURED';

  var qProbe = pf === 'QUERY_PARAM_ROUTE' ? ' data-cbv-m07-route-query-param-safe="probe-1" ' : '';
  var routeCtx = String(p.route || '/workspace/workboard').trim() || '/workspace/workboard';
  if (routeCtx.charAt(0) !== '/') routeCtx = '/' + routeCtx;
  var returnRoute = String(p.returnRoute || routeCtx).trim() || routeCtx;
  if (returnRoute.charAt(0) !== '/') returnRoute = '/' + returnRoute;
  var sourceCtx = String(p.source || 'workboard').trim() || 'workboard';
  var roleCtx = String(p.role || '*').trim() || '*';

  var returnBase = CbvAppSheetLiveBridge_buildWebAppReturnUrl_(returnRoute, tid);

  var cfg = { configured: false };
  if (!appsheetOff && typeof CbvAppSheetBridge_getConfig_ === 'function') {
    cfg = CbvAppSheetBridge_getConfig_() || cfg;
  }

  var row =
    '<div class="cbv-m07-appsheet-live-bridge-root cbv-m07-context-handoff cbv-m07-deeplink-builder"' + qProbe + ' style="margin:12px 0;padding:10px;border:1px solid #233256;border-radius:8px">' +
    CbvAppSheetLiveBridge__markerFallbackStripHtml_() +
    '<div class="cbv-m07-appsheet-config-runtime cbv-muted" style="font-size:12px">AppSheet Live Bridge (M07) — READ_FIRST · <code>' + routeCtx.replace(/</g, '&lt;') + '</code></div>';

  if (!tid) {
    row += '<p class="cbv-m07-taskid-missing-fallback cbv-muted">Chọn một việc trên workboard để mở AppSheet đúng việc (không mở app chung khi thiếu mã việc).</p>';
  }

  if (!cfg || cfg.configured !== true || appsheetOff) {
    row += '<div class="cbv-m07-appsheet-safe-disabled cbv-appsheet-live-bridge-safe-disabled cbv-muted">AppSheet chưa cấu hình — liên hệ quản trị để cấu hình Script Properties (CBV_APPSHEET_TASK_MAIN_URL, CBV_APPSHEET_TASK_MAIN_DETAIL_URL, CBV_APPSHEET_TASK_MAIN_FORM_URL) hoặc cấu hình legacy (BASE_URL, APP_ID, views).</div>';
  }

  var modes = [
    { label: 'AppSheet (chi tiết)', m: 'detail' },
    { label: 'AppSheet (biểu mẫu)', m: 'form' },
    { label: 'Tải bằng chứng / chứng từ / hình ảnh', m: 'upload' },
    { label: 'Gửi phản hồi / báo kẹt', m: 'feedback' }
  ];
  row += '<div class="cbv-m07-upload-runtime cbv-m07-feedback-runtime" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;align-items:center">';

  for (var i = 0; i < modes.length; i++) {
    var mk = modes[i];
    var dl = CbvAppSheetLiveBridge_buildDeepLink_({
      taskId: tid,
      mode: mk.m,
      route: routeCtx,
      role: roleCtx,
      source: sourceCtx,
      returnRoute: returnRoute
    });
    if (appsheetOff) dl = { ok: false, url: '', reason: 'PROBE' };
    if (typeof CbvAppSheetBridge_buildSafeActionHtml_ === 'function') {
      row += CbvAppSheetBridge_buildSafeActionHtml_(mk.label, dl, 'Chưa cấu hình AppSheet link');
    } else {
      row += (dl && dl.ok ? '<a class="cbv-appsheet-link" href="' + String(dl.url).replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer">' + String(mk.label).replace(/</g, '&lt;') + '</a>' : '<span class="cbv-appsheet-safe-disabled">—</span>');
    }
  }
  row += '</div>';

  row += '<div class="cbv-m07-appsheet-health-runtime cbv-muted" style="margin-top:8px;font-size:11px">Health: chạy <strong>🧪 CBV Test Console → M07 — Run AppSheet Live Bridge Test</strong> để kiểm tra đầy đủ (read-first).</div>';

  row += '<div class="cbv-m07-return-workboard" style="margin-top:8px">' +
    '<a class="cbv-workboard-secondary-cta cbv-busy-link" href="' + String(returnBase).replace(/"/g, '&quot;') + '">' +
    (returnRoute.indexOf('workboard') >= 0 || returnRoute === '/workboard' ? 'Quay lại Workboard' : 'Quay lại vị trí làm việc') +
    '</a></div>';

  if (pf === 'EMPTY_DATA') {
    row += '<p class="cbv-m07-empty-state cbv-muted" style="margin-top:6px">(Trạng thái rỗng — probe)</p>';
  } else {
    row += '<p class="cbv-m07-empty-state" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)" aria-hidden="true"></p>';
  }

  row += '<span class="cbv-m07-report-envelope" data-cbv-m07-envelope="1" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)"></span>';
  row += '</div>';
  return row;
}

/**
 * @returns {{ ok: boolean, checks: Array<{code:string,ok:boolean,severity:string,message:string,detail:Object}> }}
 */
function CbvAppSheetLiveBridge_runHealth_() {
  var checks = [];
  function add(code, ok, sev, msg, det) {
    var s = ok ? 'OK' : (sev === 'WARNING' || sev === 'ERROR' || sev === 'CRITICAL' ? sev : 'ERROR');
    checks.push({ code: code, ok: ok === true, severity: s, message: msg, detail: det || {} });
  }

  add('M07_BRIDGE_GETCONFIG', typeof CbvAppSheetBridge_getConfig_ === 'function', 'OK', 'CbvAppSheetBridge_getConfig_', {});
  var cfg = (typeof CbvAppSheetBridge_getConfig_ === 'function') ? CbvAppSheetBridge_getConfig_() : null;
  add('M07_CONFIG_EXISTS', !!cfg, 'ERROR', 'Config object readable', {});
  add('M07_CONFIGURED_BOOLEAN', !!(cfg && (cfg.configured === true || cfg.configured === false)), 'ERROR', 'configured is boolean', { configured: cfg ? cfg.configured : null });

  var contractOk =
    !!cfg &&
    cfg.TASK_MAIN !== undefined &&
    cfg.TASK_MAIN_DETAIL !== undefined &&
    cfg.TASK_MAIN_FORM !== undefined &&
    typeof cfg.configured === 'boolean' &&
    typeof cfg.safeDisabled === 'boolean' &&
    typeof cfg.source === 'string';
  add('M07_APP_SHEET_RUNTIME', contractOk, contractOk ? 'OK' : 'ERROR', 'CbvAppSheetBridge_getConfig_ resolver contract (TASK_MAIN*, safeDisabled, source)', {
    source: cfg ? cfg.source : null,
    safeDisabled: cfg ? cfg.safeDisabled : null
  });

  var dl = CbvAppSheetLiveBridge_buildDeepLink_({ taskId: 'HEALTH_ROW', mode: 'detail', route: '/workspace/workboard', source: 'health', returnRoute: '/workspace/workboard' });
  var urlStr = String(dl.url || '');
  var urlOk = !urlStr || /^https:\/\//i.test(urlStr);
  add('M07_DEEPLINK_HTTPS_OR_EMPTY', urlOk, urlOk ? 'OK' : 'ERROR', 'Deep link must be https or empty when disabled', { ok: dl.ok, urlLen: urlStr.length });

  var dlBad = CbvAppSheetLiveBridge_buildDeepLink_({ taskId: '', mode: 'upload' });
  add('M07_NO_TASK_SAFE', dlBad.ok === false, 'OK', 'Missing taskId does not return ok URL', { ok: dlBad.ok });

  var ribbonProbe = '';
  try {
    ribbonProbe = CbvAppSheetLiveBridge_renderWorkboardRibbon_({ __preflightState: 'HAS_DATA', taskId: 'MARKER_PROBE' });
  } catch (eR) {
    ribbonProbe = '';
  }
  var missing = [];
  for (var mi = 0; mi < CBV_M07_UI_MARKERS.length; mi++) {
    var mk = CBV_M07_UI_MARKERS[mi];
    if (ribbonProbe.indexOf(mk) < 0) missing.push(mk);
  }
  add('M07_MARKERS_IN_RIBBON', missing.length === 0, 'ERROR', 'Ribbon HTML contains all M07 marker tokens', { missing: missing });

  var fatal = checks.filter(function (c) { return c.ok === false && (c.severity === 'ERROR' || c.severity === 'CRITICAL'); });
  return { ok: fatal.length === 0, checks: checks };
}
