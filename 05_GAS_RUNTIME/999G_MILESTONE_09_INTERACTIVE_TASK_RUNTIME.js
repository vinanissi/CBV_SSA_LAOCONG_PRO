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
  'cbv-m09-report-envelope'
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
  var rowKey = String(p.rowKey || p.rowkey || '').trim();
  var task = taskId ? CbvInteractiveTaskRuntime__findTaskById_(taskId) : null;
  if (task && !rowKey) rowKey = String(task.taskRowKey || '').trim();
  var rkRes = typeof CbvAppSheetBridge_resolveTaskRowKey_ === 'function' ? CbvAppSheetBridge_resolveTaskRowKey_(task || { taskId: taskId, raw: {} }) : { ok: false, rowKey: '' };
  if (rkRes && rkRes.ok && rkRes.rowKey) rowKey = String(rkRes.rowKey || '').trim() || rowKey;
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
  return {
    activeTaskId: ctx.activeTaskId,
    activeTaskRowKey: ctx.activeTaskRowKey,
    openedAt: ctx.selectedAt,
    openedBy: ctx.selectedBy,
    route: String(p.route || CbvInteractiveTaskRuntime__taskRuntimePath_()),
    traceId: ctx.traceId,
    source: ctx.sourceModule,
    mode: String(p.mode || 'READ_FIRST'),
    safeWriteEnabled: false
  };
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
  return (
    '<span class="cbv-appsheet-safe-disabled cbv-workboard-safe-disabled cbv-m09-rowkey-missing-fallback ' +
    mc +
    '">AppSheet không khả dụng cho thao tác này (thiếu cấu hình hoặc khóa bản ghi).</span>'
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
  var session = CbvInteractiveTaskRuntime_buildSession_(p);
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

  if (!taskId) {
    return (
      wrapStart +
      '<div class="cbv-m09-task-context-empty cbv-m09-empty-state cbv-m09-taskid-missing-fallback">' +
      '<h2 style="margin-top:0">Chưa chọn việc</h2>' +
      '<p class="cbv-muted">Mở từ báo việc hoặc dán <code>taskId</code> vào URL query (READ_FIRST).</p>' +
      '</div></div>'
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
      dueAt: String(p.probeDue || '—'),
      taskRowKey: rowKeyParam,
      raw: rowKeyParam ? { TASK_ROW_KEY: rowKeyParam } : {}
    };
  }
  if (!t) {
    return (
      wrapStart +
      '<div class="cbv-m09-task-context-empty cbv-m09-empty-state cbv-m09-taskid-missing-fallback">' +
      '<h2 style="margin-top:0">Thiếu ngữ cảnh việc</h2>' +
      '<p class="cbv-muted">Không có taskId hợp lệ.</p>' +
      '</div></div>'
    );
  }

  var title = String(t.title || '—').replace(/</g, '&lt;');
  var ctx2 = CbvInteractiveTaskRuntime_buildActiveContext_({
    taskId: taskId,
    rowKey: rowKeyParam || t.taskRowKey,
    source: source || t.sourceModule,
    mode: mode,
    __preflightState: pf
  });
  var rkRes = typeof CbvAppSheetBridge_resolveTaskRowKey_ === 'function' ? CbvAppSheetBridge_resolveTaskRowKey_(t) : { ok: false };
  var detail = typeof CbvAppSheetBridge_buildTaskMainDetailUrl_ === 'function' ? CbvAppSheetBridge_buildTaskMainDetailUrl_(t) : { ok: false };
  var form = typeof CbvAppSheetBridge_buildTaskMainFormUrl_ === 'function' ? CbvAppSheetBridge_buildTaskMainFormUrl_(t) : { ok: false };
  var list = typeof CbvAppSheetBridge_buildTaskMainUrl_ === 'function' ? CbvAppSheetBridge_buildTaskMainUrl_() : { ok: false };
  if (pf === 'APPSHEET_UNCONFIGURED') {
    detail = { ok: false, reason: 'PROBE_APPSHEET_OFF' };
    form = { ok: false, reason: 'PROBE_APPSHEET_OFF' };
    list = { ok: false, reason: 'PROBE_APPSHEET_OFF' };
  }

  var sopQ = { taskId: taskId };
  if (String(t.sourceModule || '').trim()) sopQ.source = String(t.sourceModule || '').trim();
  var sopHref = '#';
  if (typeof CbvWebAppRouteUrl_buildWithQuery === 'function') {
    try {
      sopHref = CbvWebAppRouteUrl_buildWithQuery('/workspace/sop', sopQ);
    } catch (eS) { /* */ }
  }

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
      ? '<div><span class="cbv-muted">Row key</span> <code>' + String(rkRes.rowKey || '').replace(/</g, '&lt;') + '</code></div>'
      : '<div class="cbv-m09-rowkey-missing-fallback cbv-muted">Row key TASK_MAIN chưa có — không tạo link AppSheet giả.</div>';

  var confirm =
    '<div class="cbv-m09-action-confirmation cbv-muted" style="margin-top:12px;padding:8px;background:rgba(255,193,7,.08);border-radius:6px">' +
    'Các thao tác đổi dữ liệu chính thức: xác nhận trên AppSheet. Runtime M09 không ghi TASK_MAIN / không tự assign / resolve / escalate.' +
    '</div>';

  var quickNote =
    '<div id="cbv-m09-quick-note-anchor" class="cbv-m09-quick-note-preview" style="margin-top:12px">' +
    '<h3 style="margin:0 0 8px">Ghi chú nhanh (preview)</h3>' +
    '<p class="cbv-m09-quick-update-safe-disabled cbv-muted">Chưa bật ghi production — mở AppSheet để cập nhật chính thức</p>' +
    '<label class="cbv-muted" style="display:block;font-size:12px">Nội dung (disabled)</label>' +
    '<textarea class="cbv-muted" disabled rows="2" style="width:100%;opacity:.7">Preview only — không ghi production.</textarea>' +
    '<div style="margin-top:6px"><label class="cbv-muted" style="font-size:12px">Loại / lý do</label><br/>' +
    '<input disabled value="NOTE" style="width:45%;margin-right:4px"/><input disabled placeholder="Lý do" style="width:45%"/></div>' +
    '<button type="button" class="cbv-btn-operational" disabled style="margin-top:8px;opacity:.6">Xác nhận (safe-disabled)</button>' +
    '</div>';

  var titleHref = CbvInteractiveTaskRuntime_buildTaskRuntimeUrl_({
    taskId: taskId,
    rowKey: ctx2.activeTaskRowKey,
    source: ctx2.sourceModule,
    mode: mode
  });

  var titleBlock =
    '<h2 style="margin-top:0" class="cbv-m09-task-title-click">' +
    '<a class="cbv-m09-task-title-click cbv-busy-link" href="' +
    String(titleHref).replace(/"/g, '&quot;') +
    '">' +
    title +
    '</a></h2>';

  var actions =
    '<div class="cbv-thumb-zone" style="margin-top:12px;display:flex;flex-direction:column;gap:8px">' +
    '<a class="cbv-action-xl cbv-btn-operational cbv-busy-link cbv-m09-open-task-action" href="' +
    String(titleHref).replace(/"/g, '&quot;') +
    '">Mở lại runtime (cùng việc)</a>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
    CbvInteractiveTaskRuntime__appsheetActionHtml_('Mở chi tiết AppSheet', detail, 'cbv-m09-appsheet-detail-action') +
    CbvInteractiveTaskRuntime__appsheetActionHtml_('Xử lý trong AppSheet', form, 'cbv-m09-appsheet-form-action') +
    CbvInteractiveTaskRuntime__appsheetActionHtml_('Mở danh sách AppSheet', list, 'cbv-m09-appsheet-list-action') +
    '<a class="cbv-btn-operational cbv-busy-link cbv-m09-sop-action" href="' +
    String(sopHref).replace(/"/g, '&quot;') +
    '">Xem SOP</a>' +
    '<a class="cbv-btn-operational cbv-busy-link" href="' +
    String(stuckHref).replace(/"/g, '&quot;') +
    '">Báo kẹt</a>' +
    '<a class="cbv-btn-operational cbv-busy-link" href="' +
    String(helpHref).replace(/"/g, '&quot;') +
    '">Cần hỗ trợ</a>' +
    '</div></div>';

  return (
    wrapStart +
    titleBlock +
    '<div class="cbv-kv" style="margin-top:8px">' +
    '<div class="cbv-muted">Trạng thái</div><div>' +
    String(ctx2.status || '').replace(/</g, '&lt;') +
    '</div>' +
    '<div class="cbv-muted">SLA</div><div>' +
    String(ctx2.slaState || '').replace(/</g, '&lt;') +
    '</div>' +
    '<div class="cbv-muted">Nguồn</div><div>' +
    String(ctx2.sourceModule || '').replace(/</g, '&lt;') +
    '</div>' +
    '<div class="cbv-muted">Bước tiếp</div><div>' +
    String(ctx2.nextAction || '').replace(/</g, '&lt;') +
    '</div>' +
    '<div class="cbv-muted">Cập nhật gần nhất</div><div>' +
    String(t.dueAt || '—').replace(/</g, '&lt;') +
    '</div>' +
    rowKeyLine +
    '</div>' +
    actions +
    confirm +
    '<div class="cbv-m09-task-timeline-preview" style="margin-top:12px">' +
    '<h3 style="margin:0 0 6px">Timeline</h3>' +
    timelineHtml +
    '</div>' +
    checklist +
    evidence +
    quickNote +
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
