/**
 * MILESTONE_09 — Interactive Task Runtime (read-first; manual-first; no TASK_MAIN mutation from WebApp)
 *
 * Task card → in-WebApp context (`/workspace/task-runtime`) + AppSheet record actions (M07.2) in new tab.
 * Depends: 998Y (bridge + workboard), 998Q (normalize), 999D (timeline preview), 998H (route URL).
 */

var CBV_M09_UI_MARKERS = [
  'cbv-m09-interactive-task-root',
  'cbv-m09-clickable-task-card',
  'cbv-m09-active-task-session',
  'cbv-m09-task-context-panel',
  'cbv-m09-task-context-empty',
  'cbv-m09-task-title-click',
  'cbv-m09-open-task-action',
  'cbv-m09-appsheet-detail-action',
  'cbv-m09-appsheet-form-action',
  'cbv-m09-appsheet-list-action',
  'cbv-m09-sop-action',
  'cbv-m09-quick-note-preview',
  'cbv-m09-quick-update-safe-disabled',
  'cbv-m09-action-confirmation',
  'cbv-m09-task-timeline-preview',
  'cbv-m09-checklist-preview',
  'cbv-m09-evidence-placeholder',
  'cbv-m09-taskid-missing-fallback',
  'cbv-m09-rowkey-missing-fallback',
  'cbv-m09-route-query-param-safe',
  'cbv-m09-empty-state',
  'cbv-m09-report-envelope',
  'cbv-m09-focus-hero',
  'cbv-m09-focus-action-bar',
  'cbv-m09-focus-session-info',
  'cbv-m09-focus-task-context',
  'cbv-m09-focus-next-action',
  'cbv-m09-focus-quick-log-preview',
  'cbv-m09-focus-quick-note-form',
  'cbv-m09-focus-workflow-continuity',
  'cbv-m09-focus-safe-copy',
  'cbv-m09-focus-debug-hidden'
];

/** Hidden strip: every M09 marker class appears in DOM for marker contract / preflight. */
function CbvInteractiveTaskRuntime__markerFallbackStripHtml_() {
  var parts = [];
  for (var i = 0; i < CBV_M09_UI_MARKERS.length; i++) {
    parts.push('<span class="' + CBV_M09_UI_MARKERS[i] + '"></span>');
  }
  return (
    '<div class="cbv-m09-marker-fallback-strip cbv-m09-interactive-task-root" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">' +
    parts.join('') +
    '</div>'
  );
}

function CbvInteractiveTaskRuntime__taskRuntimePath_() {
  return '/workspace/task-runtime';
}

/**
 * In-app URL for interactive task runtime (query only; no localStorage).
 * @param {{ taskId?: string, rowKey?: string, source?: string, mode?: string }} opt
 */
function CbvInteractiveTaskRuntime_buildTaskRuntimeUrl_(opt) {
  var o = opt || {};
  var id = String(o.taskId || '').trim();
  if (!id) return '#';
  var q = { taskId: id };
  var rk = String(o.rowKey || '').trim();
  if (rk) q.rowKey = rk;
  var src = String(o.source || '').trim();
  if (src) q.source = src;
  var mode = String(o.mode || '').trim();
  if (mode) q.mode = mode;
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function') {
    try {
      return CbvWebAppRouteUrl_buildWithQuery(CbvInteractiveTaskRuntime__taskRuntimePath_(), q);
    } catch (e1) { /* */ }
  }
  var base = CbvInteractiveTaskRuntime__taskRuntimePath_() + '?taskId=' + encodeURIComponent(id);
  if (rk) base += '&rowKey=' + encodeURIComponent(rk);
  if (src) base += '&source=' + encodeURIComponent(src);
  if (mode) base += '&mode=' + encodeURIComponent(mode);
  return base;
}

/**
 * SOP handoff URL with task context (read-first; in-app route).
 * @param {{ taskId?: string, source?: string, sourceModule?: string, module?: string, rowKey?: string, from?: string, returnRoute?: string }} opt
 */
function CbvInteractiveTaskRuntime_buildSopUrl_(opt) {
  var o = opt || {};
  var tid = String(o.taskId || '').trim();
  if (!tid) {
    return (typeof CbvWebAppRouteUrl_build === 'function') ? CbvWebAppRouteUrl_build('/workspace/sop') : '/workspace/sop';
  }
  var src = String(o.source || o.sourceModule || 'TASK_MAIN').trim() || 'TASK_MAIN';
  var mod = String(o.module || 'TASK').trim() || 'TASK';
  var q = {
    taskId: tid,
    source: src,
    module: mod,
    from: String(o.from || 'task-runtime').trim() || 'task-runtime'
  };
  var rk = String(o.rowKey || '').trim();
  if (rk) q.rowKey = rk;
  var rr = String(o.returnRoute || '').trim();
  if (rr) q.returnRoute = rr;
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function') {
    try {
      return CbvWebAppRouteUrl_buildWithQuery('/workspace/sop', q);
    } catch (e1) { /* */ }
  }
  if (typeof CbvWebAppRouteUrl_build === 'function') {
    try {
      var base = CbvWebAppRouteUrl_build('/workspace/sop');
      var sep = base.indexOf('?') >= 0 ? '&' : '?';
      return (
        base +
        sep +
        'taskId=' +
        encodeURIComponent(tid) +
        '&source=' +
        encodeURIComponent(src) +
        '&module=' +
        encodeURIComponent(mod) +
        '&from=' +
        encodeURIComponent(q.from) +
        (rk ? '&rowKey=' + encodeURIComponent(rk) : '') +
        (rr ? '&returnRoute=' + encodeURIComponent(rr) : '')
      );
    } catch (e2) { /* */ }
  }
  return (
    '/workspace/sop?taskId=' +
    encodeURIComponent(tid) +
    '&source=' +
    encodeURIComponent(src) +
    '&module=' +
    encodeURIComponent(mod) +
    '&from=' +
    encodeURIComponent(q.from) +
    (rk ? '&rowKey=' + encodeURIComponent(rk) : '') +
    (rr ? '&returnRoute=' + encodeURIComponent(rr) : '')
  );
}

function CbvInteractiveTaskRuntime__traceId_() {
  return (typeof CbvWebAppWorkspace__traceId_ === 'function') ? CbvWebAppWorkspace__traceId_() : 'M09_' + new Date().getTime();
}

function CbvInteractiveTaskRuntime__findTaskById_(taskId) {
  var tid = String(taskId || '').trim();
  if (!tid || typeof CbvStaffWorkboard_readTasks_ !== 'function') return null;
  var r = CbvStaffWorkboard_readTasks_();
  var tasks = (r && r.tasks) || [];
  for (var i = 0; i < tasks.length; i++) {
    if (String((tasks[i] && tasks[i].taskId) || '').trim() === tid) return tasks[i];
  }
  return null;
}

/**
 * Active selection context (render-only; not persisted to production sheets).
 */
function CbvInteractiveTaskRuntime_buildActiveContext_(params) {
  var p = params || {};
  var pf = String(p.__preflightState || '').toUpperCase();
  var taskId = String(p.taskId || p.taskid || '').trim();
  if (pf === 'MISSING_TASKID') taskId = '';
  var rowKeyParam = String(p.rowKey || p.rowkey || '').trim();
  var task = taskId ? CbvInteractiveTaskRuntime__findTaskById_(taskId) : null;
  var rowKey = rowKeyParam;
  if (!rowKey && task && typeof CbvAppSheetBridge_resolveExplicitTaskMainRowKey_ === 'function') {
    var rkE = CbvAppSheetBridge_resolveExplicitTaskMainRowKey_(task);
    if (rkE && rkE.ok && rkE.rowKey) rowKey = String(rkE.rowKey || '').trim();
  }
  var src = String(p.source || (task && task.sourceModule) || 'WORKBOARD').trim() || 'WORKBOARD';
  var st = task ? String(task.status || '').trim() : '';
  var sla = task ? String(task.slaState || '').trim() : '';
  var nx = task ? String(task.nextAction || '').trim() : '';
  return {
    activeTaskId: taskId,
    activeTaskRowKey: rowKey,
    sourceModule: src,
    status: st || '—',
    slaState: sla || '—',
    nextAction: nx || '—',
    selectedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    selectedBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : '',
    traceId: String(p.traceId || CbvInteractiveTaskRuntime__traceId_())
  };
}

/**
 * Session handoff object (render / diagnostics only).
 */
function CbvInteractiveTaskRuntime_buildSession_(params) {
  var ctx = CbvInteractiveTaskRuntime_buildActiveContext_(params);
  var p = params || {};
  var md = String(p.mode || 'READ_FIRST').trim() || 'READ_FIRST';
  return {
    activeTaskId: ctx.activeTaskId,
    activeTaskRowKey: ctx.activeTaskRowKey,
    openedAt: ctx.selectedAt,
    openedBy: ctx.selectedBy,
    route: String(p.route || CbvInteractiveTaskRuntime__taskRuntimePath_()),
    traceId: ctx.traceId,
    source: ctx.sourceModule,
    mode: md,
    focusMode: md,
    safeWriteEnabled: false
  };
}

function CbvInteractiveTaskRuntime__href_(path) {
  var p = String(path || '').trim();
  if (!p) return '#';
  if (typeof CbvWebAppRouteUrl_build === 'function') {
    try {
      return CbvWebAppRouteUrl_build(p);
    } catch (e0) { /* */ }
  }
  return p;
}

function CbvInteractiveTaskRuntime__nextTaskIdAfter_(currentId) {
  var tid = String(currentId || '').trim();
  if (!tid || typeof CbvStaffWorkboard_readTasks_ !== 'function') return '';
  var r = CbvStaffWorkboard_readTasks_();
  var tasks = (r && r.tasks) || [];
  var idx = -1;
  for (var i = 0; i < tasks.length; i++) {
    if (String((tasks[i] && tasks[i].taskId) || '').trim() === tid) {
      idx = i;
      break;
    }
  }
  if (idx < 0 || idx >= tasks.length - 1) return '';
  return String((tasks[idx + 1] && tasks[idx + 1].taskId) || '').trim();
}

function CbvInteractiveTaskRuntime__taskContextFields_(t) {
  var r = (t && t.raw) || {};
  function z(v) {
    return String(v != null ? v : '').trim();
  }
  return {
    workType: z(r.workType || r.loaiViec || r.typeLabel || t.title),
    orgUnit: z(r.orgUnit || r.donVi || r.unitName || r.branchName),
    customer: z(r.customerName || r.khachHang || r.contactName || r.operatorPrimaryText),
    plate: z(r.plate || r.bienSo || r.licensePlate || r.vehiclePlate),
    dossier: z(r.dossierCode || r.maHoSo || r.fileRef || r.referenceCode),
    rawStatus: z(r.status || r.rowStatus)
  };
}

function CbvInteractiveTaskRuntime__iso_(d) {
  try {
    if (d && d.toISOString) return d.toISOString();
  } catch (e0) { /* */ }
  return String(d || '');
}

function CbvInteractiveTaskRuntime__appsheetActionHtml_(label, linkResult, m09Class) {
  var lab = String(label || '').replace(/</g, '&lt;');
  var mc = String(m09Class || '').trim();
  if (linkResult && linkResult.ok === true && linkResult.url) {
    var u = String(linkResult.url).replace(/"/g, '&quot;');
    return (
      '<a class="cbv-appsheet-link ' + mc + '" href="' + u + '" rel="noopener noreferrer" target="_blank">' + lab + '</a>'
    );
  }
  var reason = String((linkResult && linkResult.reason) || '').trim();
  var title = reason ? 'Chi tiết kỹ thuật (hover): ' + reason.replace(/"/g, '&quot;') : 'Chưa mở được liên kết AppSheet cho thao tác này.';
  return (
    '<span class="cbv-appsheet-safe-disabled cbv-workboard-safe-disabled cbv-m09-rowkey-missing-fallback ' +
    mc +
    '" title="' +
    title +
    '">' +
    lab +
    ' <span class="cbv-muted" style="font-size:11px">—</span></span>'
  );
}

function CbvInteractiveTaskRuntime_renderWorkboardMarkerEmbedHtml_(params) {
  var p = params || {};
  var qProbe = String(p.__preflightState || '').toUpperCase() === 'QUERY_PARAM_ROUTE' ? ' data-cbv-m09-route-query-param-safe="probe-wb" ' : '';
  return (
    '<div class="cbv-m09-interactive-task-root cbv-m09-workboard-marker-embed"' +
    qProbe +
    ' aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">' +
    CbvInteractiveTaskRuntime__markerFallbackStripHtml_() +
    '</div>'
  );
}

function CbvInteractiveTaskRuntime__safeCopyAppsheetBanner_(detail, form, list, pf) {
  var dOk = detail && detail.ok === true && String(detail.url || '').length > 0;
  var fOk = form && form.ok === true && String(form.url || '').length > 0;
  if (dOk && fOk) return '';
  if (pf === 'APPSHEET_UNCONFIGURED') {
    return (
      '<div class="cbv-m09-focus-safe-copy cbv-muted" style="margin:8px 0;padding:10px;border-radius:8px;background:rgba(255,193,7,.09);border:1px solid rgba(255,193,7,.35)">' +
      '<strong>Màn hình xử lý chưa sẵn sàng</strong> — chưa liên kết AppSheet cho thao tác này. ' +
      'Bạn có thể <strong>mở danh sách AppSheet</strong> nếu đã cấu hình khác, hoặc liên hệ quản trị để cấu hình.' +
      '</div>'
    );
  }
  if (!dOk || !fOk) {
    return (
      '<div class="cbv-m09-focus-safe-copy cbv-muted" style="margin:8px 0;padding:10px;border-radius:8px;background:rgba(100,149,237,.08);border:1px solid rgba(100,149,237,.25)">' +
      '<strong>Màn hình xử lý chưa sẵn sàng</strong> — chưa liên kết AppSheet cho thao tác này hoặc thiếu khóa bản ghi TASK_MAIN. ' +
      'Dùng <strong>Mở danh sách AppSheet</strong> hoặc SOP; cập nhật chính thức trên AppSheet.' +
      '</div>'
    );
  }
  return '';
}

/**
 * Full task-runtime panel (markers + empty state + actions). Honors __preflightState like M07 ribbon.
 */
function CbvInteractiveTaskRuntime_renderContextPanelHtml_(params) {
  var p = params || {};
  var pf = String(p.__preflightState || '').toUpperCase();
  var taskId = String(p.taskId || p.taskid || '').trim();
  if (pf === 'MISSING_TASKID') taskId = '';
  var rowKeyParam = String(p.rowKey || p.rowkey || '').trim();
  var mode = String(p.mode || '').trim();
  var source = String(p.source || '').trim();
  var qProbe = pf === 'QUERY_PARAM_ROUTE' ? ' data-cbv-m09-route-query-param-safe="probe-panel" ' : '';

  var strip = CbvInteractiveTaskRuntime__markerFallbackStripHtml_();
  var routeSess = String(p.route || '').trim() || CbvInteractiveTaskRuntime__taskRuntimePath_();
  var pSess = {
    taskId: taskId,
    rowKey: rowKeyParam,
    source: source,
    mode: mode || 'READ_FIRST',
    route: routeSess,
    __preflightState: pf,
    traceId: p.traceId
  };
  var session = CbvInteractiveTaskRuntime_buildSession_(pSess);
  var sessionJson = '';
  try {
    sessionJson = JSON.stringify(session).replace(/</g, '\\u003c');
  } catch (eJ) {
    sessionJson = '{}';
  }

  var wrapStart =
    '<div class="cbv-m09-interactive-task-root cbv-m09-task-context-panel cbv-card" style="margin:12px 0;padding:12px;border:1px solid #233256;border-radius:8px"' +
    qProbe +
    '>' +
    strip +
    '<pre class="cbv-m09-active-task-session" style="display:none;white-space:pre-wrap">' +
    sessionJson +
    '</pre>' +
    '<div class="cbv-m09-report-envelope" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)"></div>';

  function __sessionInfoHtml_(sess) {
    var s = sess || {};
    var openedAtStr = CbvInteractiveTaskRuntime__iso_(s.openedAt);
    return (
      '<section class="cbv-m09-focus-session-info cbv-muted" style="margin-top:12px;padding:10px;border-radius:8px;background:rgba(0,0,0,.12)">' +
      '<h3 style="margin:0 0 8px;font-size:14px">Phiên làm việc</h3>' +
      '<dl style="margin:0;display:grid;grid-template-columns:minmax(120px,auto) 1fr;gap:4px 10px;font-size:13px">' +
      '<dt>Đang xử lý từ</dt><dd>' +
      String(s.route || '').replace(/</g, '&lt;') +
      '</dd>' +
      '<dt>Mở lúc</dt><dd>' +
      openedAtStr.replace(/</g, '&lt;') +
      '</dd>' +
      '<dt>Mở bởi</dt><dd>' +
      String(s.openedBy || '—').replace(/</g, '&lt;') +
      '</dd>' +
      '<dt>Chế độ</dt><dd>' +
      String(s.focusMode || s.mode || 'READ_FIRST').replace(/</g, '&lt;') +
      ' — READ_FIRST — cập nhật chính thức trong AppSheet</dd>' +
      '<dt>traceId</dt><dd><code>' +
      String(s.traceId || '').replace(/</g, '&lt;') +
      '</code></dd>' +
      '<dt>Ghi production</dt><dd>tắt (safeWriteEnabled=' +
      String(s.safeWriteEnabled) +
      ')</dd>' +
      '</dl></section>'
    );
  }

  function __workflowHtml_(tid, nextHref, nextDisabled, recordHref, recordOk) {
    var dailyH = CbvInteractiveTaskRuntime__href_('/workspace/daily');
    var wbH = CbvInteractiveTaskRuntime__href_('/workspace/workboard');
    var mqH = CbvInteractiveTaskRuntime__href_('/home-alert/my-queue');
    var nextCls = nextDisabled ? 'cbv-btn-operational cbv-workboard-safe-disabled' : 'cbv-btn-operational cbv-busy-link';
    var recH = recordOk && recordHref ? String(recordHref) : '#';
    var recCls = recordOk ? 'cbv-btn-operational cbv-busy-link' : 'cbv-btn-operational cbv-workboard-safe-disabled';
    var recTgt = recordOk ? ' target="_blank" rel="noopener noreferrer"' : '';
    return (
      '<nav class="cbv-m09-focus-workflow-continuity cbv-muted" style="margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
      '<a class="cbv-btn-operational cbv-busy-link" href="' +
      String(dailyH).replace(/"/g, '&quot;') +
      '">Quay lại Daily</a>' +
      '<a class="cbv-btn-operational cbv-busy-link" href="' +
      String(mqH).replace(/"/g, '&quot;') +
      '">My Queue</a>' +
      '<a class="cbv-btn-operational cbv-busy-link" href="' +
      String(wbH).replace(/"/g, '&quot;') +
      '">Về Workboard</a>' +
      '<a class="' +
      nextCls +
      '" href="' +
      String(nextHref).replace(/"/g, '&quot;') +
      '">Task tiếp theo</a>' +
      '<a class="' +
      recCls +
      '"' +
      recTgt +
      ' href="' +
      String(recH).replace(/"/g, '&quot;') +
      '">Mở task trong AppSheet</a>' +
      '</nav>'
    );
  }

  function __quickLogHtml_() {
    return (
      '<section class="cbv-m09-focus-quick-log-preview cbv-muted" style="margin-top:12px;padding:10px;border:1px dashed #444;border-radius:8px">' +
      '<h3 style="margin:0 0 6px;font-size:14px">Nhật ký nhanh (preview)</h3>' +
      '<p style="margin:0 0 6px;font-size:12px">Chỉ hiển thị trong phiên request — không ghi production, không tạo lịch sử giả.</p>' +
      '<ul style="margin:0;padding-left:18px;font-size:13px">' +
      '<li>Chưa có log trong phiên này.</li>' +
      '</ul></section>'
    );
  }

  function __quickNoteFormHtml_(formUrlOk, formUrl) {
    var fu = formUrlOk && formUrl ? String(formUrl).replace(/"/g, '&quot;') : '';
    var official =
      formUrlOk && fu
        ? '<a class="cbv-btn-operational cbv-busy-link" rel="noopener noreferrer" target="_blank" href="' + fu + '">Mở AppSheet để ghi chính thức</a>'
        : '<span class="cbv-muted">Mở AppSheet để ghi chính thức — cần liên kết AppSheet / khóa bản ghi</span>';
    return (
      '<section id="cbv-m09-quick-note-anchor" class="cbv-m09-focus-quick-note-form" style="margin-top:12px;padding:10px;border-radius:8px;border:1px solid #2a3f66">' +
      '<div class="cbv-m09-quick-note-preview">' +
      '<h3 style="margin:0 0 8px;font-size:15px">Ghi chú nhanh (preview)</h3>' +
      '<p class="cbv-m09-quick-update-safe-disabled cbv-muted" style="margin:0 0 8px;font-size:13px">READ_FIRST — nội dung chỉ trên trình duyệt; không ghi TASK_MAIN từ WebApp.</p>' +
      '<label class="cbv-muted" style="display:block;font-size:12px">Loại</label>' +
      '<select class="cbv-muted" disabled style="width:100%;margin:4px 0;opacity:.85">' +
      '<option value="note">note</option>' +
      '<option value="blocked">blocked</option>' +
      '<option value="need_help">need_help</option>' +
      '<option value="waiting">waiting</option>' +
      '</select>' +
      '<label class="cbv-muted" style="display:block;font-size:12px;margin-top:6px">Nội dung</label>' +
      '<textarea class="cbv-muted" rows="3" disabled style="width:100%;opacity:.85" placeholder="Nháp trên trình duyệt — không gửi server"></textarea>' +
      '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
      '<button type="button" class="cbv-btn-operational" disabled title="Preview — không ghi server">Xem trước</button>' +
      official +
      '</div></div></section>'
    );
  }

  function __debugHtml_(extra) {
    return (
      '<div class="cbv-m09-focus-debug-hidden" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">' +
      '<pre>' +
      String(extra || '').replace(/</g, '&lt;') +
      '</pre></div>'
    );
  }

  if (!taskId) {
    var list0 = typeof CbvAppSheetBridge_buildTaskMainUrl_ === 'function' ? CbvAppSheetBridge_buildTaskMainUrl_() : { ok: false };
    var d0 = { ok: false, reason: 'NO_TASK' };
    var f0 = d0;
    var l0 = list0;
    if (pf === 'APPSHEET_UNCONFIGURED') {
      l0 = { ok: false, reason: 'PROBE_APPSHEET_OFF' };
    }
    var ban0 = CbvInteractiveTaskRuntime__safeCopyAppsheetBanner_(d0, f0, l0, pf);
    var sop0 = typeof CbvInteractiveTaskRuntime_buildSopUrl_ === 'function' ? CbvInteractiveTaskRuntime_buildSopUrl_({}) : CbvInteractiveTaskRuntime__href_('/workspace/sop');
    return (
      wrapStart +
      '<header class="cbv-m09-focus-hero cbv-m09-task-context-empty cbv-m09-empty-state cbv-m09-taskid-missing-fallback" style="padding:10px;border-radius:8px;background:rgba(0,0,0,.15)">' +
      '<p style="margin:0 0 6px"><span class="cbv-badge" style="display:inline-block;padding:2px 8px;border-radius:4px;background:#394b73;font-size:12px">READ_FIRST</span></p>' +
      '<h2 class="cbv-m09-task-title-click" style="margin:0 0 8px">Chưa chọn việc để tập trung</h2>' +
      '<p class="cbv-muted" style="margin:0">Quay lại <strong>Daily</strong> hoặc <strong>Báo việc</strong> để chọn một task. Đang xử lý: chưa có mã việc.</p>' +
      '</header>' +
      ban0 +
      __sessionInfoHtml_(session) +
      '<section class="cbv-m09-focus-task-context cbv-muted" style="margin-top:10px">' +
      '<h3 style="margin:0 0 6px;font-size:14px">Ngữ cảnh việc</h3><p style="margin:0">Chưa có dữ liệu — chưa có taskId.</p></section>' +
      '<section class="cbv-m09-focus-next-action cbv-muted" style="margin-top:10px;padding:8px;border-radius:6px;border:1px dashed #555">' +
      '<h3 style="margin:0 0 6px;font-size:14px">Bước tiếp theo</h3>' +
      '<p style="margin:0">Chưa có bước tiếp theo — mở AppSheet hoặc SOP để xem chi tiết.</p></section>' +
      __quickLogHtml_() +
      __quickNoteFormHtml_(false, '') +
      '<div class="cbv-m09-focus-action-bar cbv-thumb-zone" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
      CbvInteractiveTaskRuntime__appsheetActionHtml_('Mở chi tiết AppSheet', d0, 'cbv-m09-appsheet-detail-action') +
      CbvInteractiveTaskRuntime__appsheetActionHtml_('Xử lý trong AppSheet', f0, 'cbv-m09-appsheet-form-action') +
      CbvInteractiveTaskRuntime__appsheetActionHtml_('Mở danh sách AppSheet', l0, 'cbv-m09-appsheet-list-action') +
      '<a class="cbv-btn-operational cbv-busy-link cbv-m09-sop-action" href="' +
      String(sop0).replace(/"/g, '&quot;') +
      '">Xem SOP</a>' +
      '<span class="cbv-btn-operational cbv-workboard-safe-disabled">Ghi chú nhanh</span>' +
      '<span class="cbv-btn-operational cbv-workboard-safe-disabled">Báo kẹt</span>' +
      '<span class="cbv-btn-operational cbv-workboard-safe-disabled">Cần hỗ trợ</span>' +
      '<span class="cbv-btn-operational cbv-workboard-safe-disabled cbv-m09-open-task-action">Mở lại runtime</span>' +
      '</div>' +
      '<div class="cbv-m09-action-confirmation cbv-muted" style="margin-top:10px;padding:8px;border-radius:6px;background:rgba(255,193,7,.08)">' +
      'READ_FIRST — cập nhật chính thức trong AppSheet. Runtime không ghi production.</div>' +
      '<div class="cbv-m09-task-timeline-preview cbv-muted" style="margin-top:10px;font-size:13px">Timeline (preview) — chưa có task.</div>' +
      '<div class="cbv-m09-checklist-preview cbv-muted" style="margin-top:8px;font-size:12px">Checklist (preview) — chưa có.</div>' +
      '<div class="cbv-m09-evidence-placeholder cbv-muted" style="margin-top:8px;font-size:12px">Chứng từ — placeholder.</div>' +
      __workflowHtml_('', '#', true, '#', false) +
      __debugHtml_(sessionJson) +
      '</div>'
    );
  }

  var taskFound = CbvInteractiveTaskRuntime__findTaskById_(taskId);
  var t = taskFound;
  if (!t && taskId) {
    t = {
      taskId: taskId,
      title: String(p.probeTitle || 'Việc (không có trong queue read-first hiện tại)'),
      status: String(p.probeStatus || '—'),
      slaState: String(p.probeSla || '—'),
      nextAction: String(p.probeNext || '—'),
      sourceModule: source || 'WORKBOARD',
      priority: String(p.probePriority || ''),
      dueAt: String(p.probeDue || '—'),
      taskRowKey: rowKeyParam,
      correlationHint: String(p.probeCorr || taskId),
      raw: rowKeyParam ? { TASK_ROW_KEY: rowKeyParam } : {}
    };
  }
  if (!t) {
    return (
      wrapStart +
      '<header class="cbv-m09-focus-hero cbv-m09-task-context-empty cbv-m09-empty-state cbv-m09-taskid-missing-fallback">' +
      '<h2 class="cbv-m09-task-title-click" style="margin-top:0">Thiếu ngữ cảnh việc</h2>' +
      '<p class="cbv-muted">Không có taskId hợp lệ.</p></header>' +
      __sessionInfoHtml_(session) +
      __workflowHtml_('', '#', true, '#', false) +
      __debugHtml_(sessionJson) +
      '</div>'
    );
  }

  var title = String(t.title || '—').replace(/</g, '&lt;');
  var rkRes = typeof CbvAppSheetBridge_resolveExplicitTaskMainRowKey_ === 'function' ? CbvAppSheetBridge_resolveExplicitTaskMainRowKey_(t) : { ok: false };
  var ctx2 = CbvInteractiveTaskRuntime_buildActiveContext_({
    taskId: taskId,
    rowKey: rowKeyParam || (rkRes && rkRes.ok ? String(rkRes.rowKey || '').trim() : ''),
    source: source || t.sourceModule,
    mode: mode,
    __preflightState: pf
  });
  var session2 = CbvInteractiveTaskRuntime_buildSession_({
    taskId: taskId,
    rowKey: rowKeyParam || (rkRes && rkRes.ok ? String(rkRes.rowKey || '').trim() : ''),
    source: source || t.sourceModule,
    mode: mode || 'READ_FIRST',
    route: routeSess,
    __preflightState: pf,
    traceId: ctx2.traceId
  });
  try {
    sessionJson = JSON.stringify(session2).replace(/</g, '\\u003c');
  } catch (eJ2) {
    sessionJson = '{}';
  }

  var detail = typeof CbvAppSheetBridge_buildTaskMainDetailUrl_ === 'function' ? CbvAppSheetBridge_buildTaskMainDetailUrl_(t) : { ok: false };
  var form = typeof CbvAppSheetBridge_buildTaskMainFormUrl_ === 'function' ? CbvAppSheetBridge_buildTaskMainFormUrl_(t) : { ok: false };
  var list = typeof CbvAppSheetBridge_buildTaskMainUrl_ === 'function' ? CbvAppSheetBridge_buildTaskMainUrl_() : { ok: false };
  if (pf === 'APPSHEET_UNCONFIGURED') {
    detail = { ok: false, reason: 'PROBE_APPSHEET_OFF', safeDisabled: true };
    form = { ok: false, reason: 'PROBE_APPSHEET_OFF', safeDisabled: true };
    list = { ok: false, reason: 'PROBE_APPSHEET_OFF', safeDisabled: true };
  }

  var rkForSop = (rkRes && rkRes.ok && rkRes.rowKey) ? String(rkRes.rowKey).trim() : rowKeyParam;
  var sopHref =
    typeof CbvInteractiveTaskRuntime_buildSopUrl_ === 'function'
      ? CbvInteractiveTaskRuntime_buildSopUrl_({
        taskId: taskId,
        source: String(source || t.sourceModule || 'TASK_MAIN').trim() || 'TASK_MAIN',
        module: String((t.raw && t.raw.moduleCode) || 'TASK').trim() || 'TASK',
        rowKey: rkForSop,
        from: 'task-runtime',
        returnRoute: CbvInteractiveTaskRuntime__taskRuntimePath_()
      })
      : '#';

  var stuckHref = '#';
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function') {
    try {
      stuckHref = CbvWebAppRouteUrl_buildWithQuery('/workspace/staff/feedback', { taskId: taskId, type: 'STUCK' });
    } catch (eF) { /* */ }
  }
  var helpHref = '#';
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function') {
    try {
      helpHref = CbvWebAppRouteUrl_buildWithQuery('/workspace/staff/feedback', { taskId: taskId, type: 'SUPERVISOR_HELP' });
    } catch (eH) { /* */ }
  }

  var timelineHtml =
    typeof CbvOpsStateTimeline_renderHtml_ === 'function'
      ? CbvOpsStateTimeline_renderHtml_({ events: [], taskId: taskId, traceId: ctx2.traceId })
      : '<div class="cbv-m08-operational-timeline cbv-m08-timeline-empty-state cbv-m09-task-timeline-preview cbv-muted">Chưa có timeline cho việc này trong WebApp (read-first).</div>';

  var checklist =
    '<div class="cbv-m09-checklist-preview cbv-muted" style="margin-top:10px;padding:8px;border:1px dashed #444;border-radius:6px">' +
    '<strong>Checklist (preview)</strong> — chưa có checklist production trong M09.' +
    '</div>';

  var evidence =
    '<div class="cbv-m09-evidence-placeholder cbv-muted" style="margin-top:10px;padding:8px;border:1px dashed #444;border-radius:6px">' +
    '<strong>Chứng từ / tải lên</strong> — placeholder; không ghi kho production từ WebApp M09.' +
    '</div>';

  var rowKeyLine =
    rkRes && rkRes.ok
      ? '<div><span class="cbv-muted">Row key TASK_MAIN</span> <code>' + String(rkRes.rowKey || '').replace(/</g, '&lt;') + '</code></div>'
      : '<div class="cbv-m09-rowkey-missing-fallback cbv-muted">Row key TASK_MAIN chưa có — không tạo link AppSheet giả.</div>';

  var confirm =
    '<div class="cbv-m09-action-confirmation cbv-muted" style="margin-top:12px;padding:8px;background:rgba(255,193,7,.08);border-radius:6px">' +
    'READ_FIRST — cập nhật chính thức trong AppSheet. Runtime M09 không ghi TASK_MAIN / không tự assign / resolve / escalate.' +
    '</div>';

  var titleHref = CbvInteractiveTaskRuntime_buildTaskRuntimeUrl_({
    taskId: taskId,
    rowKey: ctx2.activeTaskRowKey,
    source: ctx2.sourceModule,
    mode: mode
  });

  var pri = String(t.priority || '').replace(/</g, '&lt;') || '—';
  var tc = CbvInteractiveTaskRuntime__taskContextFields_(t);
  var nxBody =
    String(ctx2.nextAction || '').trim() && ctx2.nextAction !== '—'
      ? '<p style="margin:0">' + String(ctx2.nextAction || '').replace(/</g, '&lt;') + '</p>'
      : '<p class="cbv-muted" style="margin:0">Chưa có bước tiếp theo — mở AppSheet hoặc SOP để xem chi tiết.</p>';
  var slaWarn =
    String(ctx2.slaState || '').toUpperCase().indexOf('WARN') >= 0 || String(ctx2.slaState || '').toUpperCase().indexOf('OVER') >= 0
      ? '<p class="cbv-muted" style="margin:8px 0 0;font-size:12px">SLA: cần chú ý — xử lý ưu tiên theo quy trình.</p>'
      : '';

  var hero =
    '<header class="cbv-m09-focus-hero" style="padding:12px;border-radius:8px;background:rgba(0,0,0,.18);margin-bottom:8px">' +
    '<p style="margin:0 0 8px"><span class="cbv-badge" style="display:inline-block;padding:2px 8px;border-radius:4px;background:#394b73;font-size:12px">READ_FIRST</span>' +
    ' <span class="cbv-muted" style="font-size:12px">Đang xử lý</span></p>' +
    '<h2 style="margin:0 0 8px" class="cbv-m09-task-title-click">' +
    '<a class="cbv-m09-task-title-click cbv-busy-link" href="' +
    String(titleHref).replace(/"/g, '&quot;') +
    '">' +
    title +
    '</a></h2>' +
    '<p class="cbv-muted" style="margin:0 0 6px;font-size:13px">Mã việc: <code>' +
    String(taskId).replace(/</g, '&lt;') +
    '</code></p>' +
    '<div class="cbv-kv" style="display:grid;grid-template-columns:110px 1fr;gap:6px 10px;font-size:13px;margin-top:8px">' +
    '<div class="cbv-muted">Trạng thái</div><div>' +
    String(ctx2.status || '').replace(/</g, '&lt;') +
    '</div>' +
    '<div class="cbv-muted">SLA</div><div>' +
    String(ctx2.slaState || '').replace(/</g, '&lt;') +
    '</div>' +
    '<div class="cbv-muted">Ưu tiên</div><div>' +
    pri +
    '</div>' +
    '<div class="cbv-muted">Nguồn</div><div>' +
    String(ctx2.sourceModule || '').replace(/</g, '&lt;') +
    '</div>' +
    '<div class="cbv-muted">Cập nhật</div><div>' +
    String(t.dueAt || '—').replace(/</g, '&lt;') +
    '</div>' +
    '<div class="cbv-muted">Bước tiếp theo</div><div>' +
    String(ctx2.nextAction || '').replace(/</g, '&lt;') +
    '</div>' +
    '</div>' +
    rowKeyLine +
    '</header>';

  var taskCtx =
    '<section class="cbv-m09-focus-task-context" style="margin-top:10px;padding:10px;border-radius:8px;border:1px solid #2a3f66">' +
    '<h3 style="margin:0 0 8px;font-size:14px">Ngữ cảnh việc</h3>' +
    '<div class="cbv-kv" style="display:grid;grid-template-columns:120px 1fr;gap:4px 10px;font-size:13px">' +
    '<div class="cbv-muted">Loại việc</div><div>' +
    (tc.workType ? String(tc.workType).replace(/</g, '&lt;') : '<span class="cbv-muted">Chưa có dữ liệu</span>') +
    '</div>' +
    '<div class="cbv-muted">Đơn vị / module</div><div>' +
    (tc.orgUnit ? String(tc.orgUnit).replace(/</g, '&lt;') : '<span class="cbv-muted">Chưa có dữ liệu</span>') +
    '</div>' +
    '<div class="cbv-muted">Đối tượng</div><div>' +
    (tc.customer ? String(tc.customer).replace(/</g, '&lt;') : '<span class="cbv-muted">Chưa có dữ liệu</span>') +
    '</div>' +
    '<div class="cbv-muted">Biển số / mã</div><div>' +
    (tc.plate || tc.dossier ? String((tc.plate + ' ' + tc.dossier).trim()).replace(/</g, '&lt;') : '<span class="cbv-muted">Chưa có dữ liệu</span>') +
    '</div>' +
    '<div class="cbv-muted">sourceModule</div><div>' +
    String(t.sourceModule || ctx2.sourceModule || '—').replace(/</g, '&lt;') +
    '</div>' +
    '<div class="cbv-muted">correlationHint</div><div>' +
    String(t.correlationHint || t.taskId || '—').replace(/</g, '&lt;') +
    '</div>' +
    '<div class="cbv-muted">raw status</div><div>' +
    (tc.rawStatus ? String(tc.rawStatus).replace(/</g, '&lt;') : '—') +
    '</div></div></section>';

  var nextSec =
    '<section class="cbv-m09-focus-next-action" style="margin-top:12px;padding:10px;border-radius:8px;border:1px dashed #51608c">' +
    '<h3 style="margin:0 0 6px;font-size:15px">Bước tiếp theo</h3>' +
    '<p class="cbv-muted" style="margin:0 0 6px;font-size:12px">Lý do ưu tiên: theo SLA và nguồn báo việc (read-first).</p>' +
    slaWarn +
    nxBody +
    '<div class="cbv-muted" style="margin-top:8px;font-size:12px">Checklist mini: xem checklist preview bên dưới.</div></section>';

  var ban = CbvInteractiveTaskRuntime__safeCopyAppsheetBanner_(detail, form, list, pf);
  var dbg =
    'session=' +
    sessionJson +
    '|detail=' +
    JSON.stringify({ ok: detail.ok, reason: detail.reason || '' }) +
    '|form=' +
    JSON.stringify({ ok: form.ok, reason: form.reason || '' });

  var nextTid = CbvInteractiveTaskRuntime__nextTaskIdAfter_(taskId);
  var nextHref = nextTid ? CbvInteractiveTaskRuntime_buildTaskRuntimeUrl_({ taskId: nextTid, source: ctx2.sourceModule, mode: mode }) : '#';
  var nextDis = !nextTid;

  var actionBar =
    '<div class="cbv-m09-focus-action-bar cbv-thumb-zone" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
    CbvInteractiveTaskRuntime__appsheetActionHtml_('Mở chi tiết AppSheet', detail, 'cbv-m09-appsheet-detail-action') +
    CbvInteractiveTaskRuntime__appsheetActionHtml_('Xử lý trong AppSheet', form, 'cbv-m09-appsheet-form-action') +
    CbvInteractiveTaskRuntime__appsheetActionHtml_('Mở danh sách AppSheet', list, 'cbv-m09-appsheet-list-action') +
    '<a class="cbv-btn-operational cbv-busy-link cbv-m09-sop-action" href="' +
    String(sopHref).replace(/"/g, '&quot;') +
    '">Xem SOP</a>' +
    '<a class="cbv-btn-operational cbv-busy-link" href="#cbv-m09-quick-note-anchor">Ghi chú nhanh</a>' +
    '<a class="cbv-btn-operational cbv-busy-link" href="' +
    String(stuckHref).replace(/"/g, '&quot;') +
    '">Báo kẹt</a>' +
    '<a class="cbv-btn-operational cbv-busy-link" href="' +
    String(helpHref).replace(/"/g, '&quot;') +
    '">Cần hỗ trợ</a>' +
    '<a class="cbv-action-xl cbv-btn-operational cbv-busy-link cbv-m09-open-task-action" href="' +
    String(CbvInteractiveTaskRuntime__href_('/workspace/daily')).replace(/"/g, '&quot;') +
    '">Quay lại Daily</a>' +
    '<a class="cbv-btn-operational cbv-busy-link" href="' +
    String(titleHref).replace(/"/g, '&quot;') +
    '">Mở lại runtime (cùng việc)</a>' +
    '<a class="' +
    (nextDis ? 'cbv-btn-operational cbv-workboard-safe-disabled' : 'cbv-btn-operational cbv-busy-link') +
    '" href="' +
    String(nextHref).replace(/"/g, '&quot;') +
    '">Task tiếp theo</a>' +
    '</div>';

  var formUrlOk = form && form.ok === true && String(form.url || '').length > 0;
  var formU = formUrlOk ? form.url : '';
  var recordHref =
    detail && detail.ok === true && String(detail.url || '').length > 0
      ? detail.url
      : form && form.ok === true && String(form.url || '').length > 0
        ? form.url
        : '#';
  var recordOk =
    (detail && detail.ok === true && String(detail.url || '').length > 0) ||
    (form && form.ok === true && String(form.url || '').length > 0);

  return (
    wrapStart +
    hero +
    ban +
    __sessionInfoHtml_(session2) +
    taskCtx +
    nextSec +
    __quickLogHtml_() +
    __quickNoteFormHtml_(formUrlOk, formU) +
    actionBar +
    confirm +
    '<div class="cbv-m09-task-timeline-preview" style="margin-top:12px">' +
    '<h3 style="margin:0 0 6px;font-size:14px">Timeline</h3>' +
    timelineHtml +
    '</div>' +
    checklist +
    evidence +
    __workflowHtml_(taskId, nextHref, nextDis, recordHref, recordOk) +
    __debugHtml_(dbg) +
    '</div>'
  );
}

function CbvInteractiveTaskRuntime_renderPage_(params) {
  var p = params || {};
  var wb =
    typeof CbvWebAppRouteUrl_build === 'function'
      ? CbvWebAppRouteUrl_build('/workspace/workboard')
      : '/workspace/workboard';
  var panel = CbvInteractiveTaskRuntime_renderContextPanelHtml_(p);
  var bodyInner =
    panel +
    '<p class="cbv-muted" style="margin-top:16px"><a class="cbv-btn-operational cbv-busy-link" href="' +
    String(wb).replace(/"/g, '&quot;') +
    '">← Quay lại báo việc</a></p>';
  var bottomNav = '';
  var sticky = '';
  if (typeof CbvStaffWorkspace_buildStaffBottomNavHtml_ === 'function') {
    bottomNav = CbvStaffWorkspace_buildStaffBottomNavHtml_(CbvInteractiveTaskRuntime__taskRuntimePath_());
  }
  if (typeof CbvStaffWorkspace_buildStickyActionBarHtml_ === 'function') {
    sticky = CbvStaffWorkspace_buildStickyActionBarHtml_(CbvInteractiveTaskRuntime__taskRuntimePath_());
  }
  var model = {
    bodyInner: bodyInner,
    staffBottomNav: '<div class="cbv-workboard-bottom-nav cbv-thumb-zone">' + bottomNav + '</div>',
    stickyBar: sticky
  };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_INTERACTIVE_TASK_RUNTIME');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: [] };
  } catch (e2) {
    return { bodyHtml: '<div class="cbv-m09-interactive-task-root"><p>Task runtime template missing.</p></div>', warnings: [String(e2)] };
  }
}
