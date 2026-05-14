/**
 * MILESTONE_02 — Staff operation workspace (read-first WebApp)
 *
 * Runtime models + HOME_ALERT queue adapter (pilot). No TASK_MAIN mutation from WebApp.
 * Manual-first quick actions: links only (detail, SOP, feedback, queue).
 */

var CBV_STAFF_WS_FEEDBACK_SHEET = 'CBV_STAFF_OPERATION_FEEDBACK';
var CBV_STAFF_WS_FEEDBACK_HEADERS = [
  'TRACE_ID',
  'CREATED_AT',
  'CREATED_BY',
  'SOURCE_ROUTE',
  'TASK_ID',
  'FEEDBACK_TYPE',
  'NOTE',
  'USER_EMAIL'
];

function CbvStaffWorkspace__email_() {
  var em = '';
  try {
    if (typeof Session !== 'undefined' && Session.getActiveUser) em = Session.getActiveUser().getEmail();
  } catch (e) { em = ''; }
  return String(em || '').trim();
}

function CbvStaffWorkspace__deriveSlaState_(card) {
  var c = card || {};
  var breach = Number(c.slaBreachLevel || 0);
  if (breach > 0) return 'SLA_BREACH';
  var s = String(c.slaStatus || '').toUpperCase();
  if (s.indexOf('OVER') >= 0 || s.indexOf('BREACH') >= 0) return 'SLA_OVERDUE';
  if (s.indexOf('WARN') >= 0) return 'SLA_WARNING';
  if (s) return s;
  return 'SLA_UNKNOWN';
}

function CbvStaffWorkspace__isBlockedStatus_(status) {
  var u = String(status || '').toUpperCase();
  return u.indexOf('BLOCK') >= 0;
}

function CbvStaffWorkspace__isPendingStatus_(status) {
  var u = String(status || '').toUpperCase();
  if (!u) return true;
  if (u.indexOf('BLOCK') >= 0) return false;
  if (u === 'RESOLVED' || u === 'CLOSED' || u === 'DONE' || u === 'CANCELLED') return false;
  return true;
}

function CbvStaffWorkspace__todayStart_() {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function CbvStaffWorkspace__rowTime_(v) {
  if (v instanceof Date) return v.getTime();
  return 0;
}

/**
 * Adapter: read task-like cards from existing pilot queue (HOME_ALERT). No spreadsheet ID literals.
 */
function CbvStaffWorkspace_readTasksAdapter_(userEmail) {
  var warnings = [];
  if (typeof CbvWebAppPilotData_getQueueCards !== 'function') {
    warnings.push('CbvWebAppPilotData_getQueueCards not loaded — empty inbox.');
    return { ok: false, cards: [], warnings: warnings, source: 'NONE' };
  }
  var email = String(userEmail || '').trim() || CbvStaffWorkspace__email_();
  var q = CbvWebAppPilotData_getQueueCards(email);
  warnings = warnings.concat(q.warnings || []);
  var cards = (q.data && q.data.cards) ? q.data.cards : [];
  return { ok: q.ok !== false, cards: cards, warnings: warnings, source: 'HOME_ALERT' };
}

function CbvStaffWorkspace_normalizeTaskRow_(card) {
  var c = card || {};
  return {
    taskId: String(c.id || '').trim(),
    title: String(c.title || c.operatorPrimaryText || '').trim() || '(Không tiêu đề)',
    status: String(c.status || '').trim(),
    priority: c.priority != null ? String(c.priority) : '',
    slaState: CbvStaffWorkspace__deriveSlaState_(c),
    assignedTo: String(c.assignedTo || '').trim(),
    nextAction: String(c.operatorNextAction || '').trim(),
    sourceModule: String(c.moduleCode || 'HOME_ALERT').trim(),
    dueAt: c.updatedAt ? String(c.updatedAt) : '',
    correlationHint: String(c.id || '').trim(),
    raw: c
  };
}

function CbvStaffWorkspace_getDataSourceStatus_() {
  var warnings = [];
  var homeAlertOk = false;
  try {
    if (typeof CbvWebAppPilotData_getQueueCards === 'function') {
      var r = CbvWebAppPilotData_getQueueCards(CbvStaffWorkspace__email_());
      homeAlertOk = r && r.ok === true;
      if (r && r.warnings && r.warnings.length) warnings = warnings.concat(r.warnings.map(function (w) { return 'HOME_ALERT:' + w; }));
    } else {
      warnings.push('Pilot queue reader not loaded.');
    }
  } catch (e) {
    warnings.push('HOME_ALERT probe: ' + (e && e.message ? e.message : String(e)));
  }
  return {
    hardcodedDbId: false,
    sources: [
      { code: 'HOME_ALERT', ok: homeAlertOk, reader: 'CbvWebAppPilotData_getQueueCards' },
      { code: 'TASK_MAIN', ok: false, reader: 'not wired (manual-first; use AppSheet for TASK_MAIN writes)' }
    ],
    warnings: warnings
  };
}

function CbvStaffWorkspace_getTaskInboxModel_(userEmail) {
  var email = String(userEmail || '').trim() || CbvStaffWorkspace__email_();
  var ad = CbvStaffWorkspace_readTasksAdapter_(email);
  var norm = (ad.cards || []).map(CbvStaffWorkspace_normalizeTaskRow_);
  var t0 = CbvStaffWorkspace__todayStart_();
  var today = norm.filter(function (t) {
    var raw = t.raw && t.raw.updatedAt;
    return CbvStaffWorkspace__rowTime_(raw) >= t0;
  });
  var pending = norm.filter(function (t) { return CbvStaffWorkspace__isPendingStatus_(t.status); });
  var blocked = norm.filter(function (t) { return CbvStaffWorkspace__isBlockedStatus_(t.status); });
  var todayList = today.length ? today : norm.slice(0, Math.min(10, norm.length));
  var todayIds = {};
  for (var ti = 0; ti < todayList.length; ti++) {
    if (todayList[ti].taskId) todayIds[todayList[ti].taskId] = true;
  }
  var inboxRest = norm.filter(function (t) { return !todayIds[t.taskId]; });
  return {
    userEmail: email,
    inbox: norm,
    today: todayList,
    inboxRest: inboxRest,
    pending: pending,
    blocked: blocked,
    counts: {
      inbox: norm.length,
      today: todayList.length,
      pending: pending.length,
      blocked: blocked.length
    },
    adapterWarnings: ad.warnings || [],
    dataSource: ad.source || 'NONE'
  };
}

function CbvStaffWorkspace_getTodayTaskCards_(userEmail) {
  var m = CbvStaffWorkspace_getTaskInboxModel_(userEmail);
  return { cards: m.today || [], warnings: m.adapterWarnings || [], dataSource: m.dataSource };
}

function CbvStaffWorkspace_buildTaskCardHtml_(task, detailRoute) {
  var t = task || {};
  var id = String(t.taskId || '').replace(/"/g, '&quot;');
  var path = '/workspace/staff/task-detail';
  if (t.taskId) path += '?taskId=' + encodeURIComponent(t.taskId);
  var detailHref = path;
  if (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') {
    try {
      detailHref = CbvWebAppOpUx_buildRouteUrl_(path);
    } catch (e1) { /* keep path */ }
  }
  var sopHref = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/workspace/guided') : '/workspace/guided';
  var fbBase = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/workspace/staff/feedback') : '/workspace/staff/feedback';
  var stuckHref = fbBase + (id ? '?type=STUCK&taskId=' + encodeURIComponent(t.taskId) : '?type=STUCK');
  var helpHref = fbBase + (id ? '?type=SUPERVISOR_HELP&taskId=' + encodeURIComponent(t.taskId) : '?type=SUPERVISOR_HELP');
  var queueHref = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/home-alert/my-queue') : '/home-alert/my-queue';

  var pri = String(t.priority || '—').replace(/</g, '&lt;');
  var sla = String(t.slaState || '—').replace(/</g, '&lt;');
  var st = String(t.status || '—').replace(/</g, '&lt;');
  var title = String(t.title || '').replace(/</g, '&lt;');
  var nx = String(t.nextAction || '—').replace(/</g, '&lt;');
  var mod = String(t.sourceModule || '').replace(/</g, '&lt;');
  var asg = String(t.assignedTo || '—').replace(/</g, '&lt;');

  return (
    '<article class="cbv-staff-task-card cbv-card cbv-staff-mobile-stack" data-task-id="' + id + '">' +
    '<h3>' + title + '</h3>' +
    '<div class="cbv-kv">' +
    '<div class="cbv-muted">Mã</div><div><code>' + (id || '—') + '</code></div>' +
    '<div class="cbv-muted">Trạng thái</div><div><span class="cbv-badge">' + st + '</span></div>' +
    '<div class="cbv-muted">Ưu tiên</div><div><span class="cbv-badge warn">' + pri + '</span></div>' +
    '<div class="cbv-muted">SLA</div><div><span class="cbv-badge crit">' + sla + '</span></div>' +
    '<div class="cbv-muted">Giao cho</div><div>' + asg + '</div>' +
    '<div class="cbv-muted">Nguồn</div><div>' + mod + '</div>' +
    '<div class="cbv-muted">Bước tiếp</div><div>' + nx + '</div>' +
    '</div>' +
    '<div class="cbv-row" style="margin-top:10px">' +
    '<a class="cbv-staff-quick-action cbv-btn-operational cbv-busy-link" href="' + String(detailHref).replace(/"/g, '&quot;') + '">Mở chi tiết</a>' +
    '<a class="cbv-staff-quick-action cbv-btn-operational cbv-busy-link" href="' + String(sopHref).replace(/"/g, '&quot;') + '">Xem SOP</a>' +
    '<a class="cbv-staff-quick-action cbv-btn-operational cbv-busy-link" href="' + String(stuckHref).replace(/"/g, '&quot;') + '">Báo kẹt</a>' +
    '<a class="cbv-staff-quick-action cbv-btn-operational cbv-busy-link" href="' + String(helpHref).replace(/"/g, '&quot;') + '">Cần hỗ trợ</a>' +
    '<a class="cbv-staff-quick-action cbv-btn-operational cbv-busy-link" href="' + String(queueHref).replace(/"/g, '&quot;') + '" title="Chứng từ trên AppSheet / queue read-first">Queue chứng từ</a>' +
    '</div></article>'
  );
}

function CbvStaffWorkspace__findCardById_(taskId) {
  var tid = String(taskId || '').trim();
  if (!tid) return null;
  var ad = CbvStaffWorkspace_readTasksAdapter_(CbvStaffWorkspace__email_());
  var hit = null;
  (ad.cards || []).forEach(function (c) {
    if (hit) return;
    if (String(c.id || '').trim() === tid) hit = c;
  });
  return hit;
}

function CbvStaffWorkspace_getTaskDetailModel_(taskId) {
  var warnings = [];
  var tid = String(taskId || '').trim();
  if (!tid) {
    return {
      ok: true,
      empty: true,
      task: null,
      timeline: [],
      correlationId: '',
      warnings: ['NO_TASK_ID'],
      sopInlineHtml: '<p class="cbv-muted">Chọn việc từ danh sách để xem chi tiết.</p>'
    };
  }
  var card = CbvStaffWorkspace__findCardById_(tid);
  if (!card) {
    warnings.push('TASK_NOT_IN_ADAPTER_SCOPE: không thấy trong HOME_ALERT queue cho user hiện tại (read-first).');
    return {
      ok: true,
      empty: true,
      task: null,
      timeline: [],
      correlationId: tid,
      warnings: warnings,
      sopInlineHtml: '<p class="cbv-muted">Không có bản ghi hiển thị — không tự tạo dữ liệu giả.</p>'
    };
  }
  return {
    ok: true,
    empty: false,
    task: CbvStaffWorkspace_normalizeTaskRow_(card),
    timeline: CbvStaffWorkspace_getTaskTimeline_(tid),
    correlationId: tid,
    warnings: warnings,
    sopInlineHtml: '<div class="cbv-pre">' + String(card.operatorMetaText || 'READ_FIRST: thao tác ghi trên AppSheet theo SOP.').replace(/</g, '&lt;') + '</div>'
  };
}

function CbvStaffWorkspace_getTaskTimeline_(taskId) {
  var card = CbvStaffWorkspace__findCardById_(taskId);
  var events = [];
  if (!card) return events;
  events.push({ kind: 'created', at: '', label: 'Tạo / nhập hệ thống', detail: 'Thời điểm tạo không map từ HOME_ALERT pilot row (an toàn).' });
  if (card.assignedTo) {
    events.push({ kind: 'assigned', at: String(card.updatedAt || ''), label: 'Phân công', detail: String(card.assignedTo) });
  }
  if (card.status) {
    events.push({ kind: 'status', at: String(card.updatedAt || ''), label: 'Trạng thái hiện tại', detail: String(card.status) });
  }
  if (CbvStaffWorkspace__isBlockedStatus_(card.status)) {
    events.push({ kind: 'blocked', at: String(card.updatedAt || ''), label: 'Bị chặn', detail: String(card.operatorNextAction || '') });
  }
  events.push({ kind: 'note', at: '', label: 'Ghi chú / handoff', detail: 'Placeholder — không ghi đè audit nghiệp vụ từ WebApp.' });
  return events;
}

function CbvStaffWorkspace_buildTaskDetailHtml_(model) {
  var m = model || {};
  if (m.empty || !m.task) {
    var listHref = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/workspace/staff/tasks') : '/workspace/staff/tasks';
    return (
      '<div class="cbv-staff-empty-state cbv-state cbv-empty-state">' +
      '<p><strong>Chưa chọn việc</strong></p>' +
      '<p class="cbv-muted">Thêm <code>?taskId=...</code> vào URL hoặc quay lại inbox.</p>' +
      '<p><a class="cbv-btn-operational cbv-busy-link" href="' + String(listHref).replace(/"/g, '&quot;') + '">← Về danh sách</a></p>' +
      '</div>'
    );
  }
  var t = m.task;
  var evs = m.timeline || [];
  var rows = evs.length ? evs.map(function (ev) {
    return '<li><strong>' + String(ev.label || '').replace(/</g, '&lt;') + '</strong> — ' + String(ev.detail || '').replace(/</g, '&lt;') +
      (ev.at ? ' <span class="cbv-muted">(' + String(ev.at).replace(/</g, '&lt;') + ')</span>' : '') + '</li>';
  }).join('') : '<li class="cbv-muted">(trống)</li>';

  var att = '<div class="cbv-staff-detail-section cbv-card"><h3>Đính kèm</h3><p class="cbv-muted">Chưa bind file — dùng AppSheet / Drive theo SOP.</p></div>';
  var audit = '<div class="cbv-staff-detail-section cbv-card"><h3>Audit / trace</h3><p>correlationId: <code>' + String(m.correlationId || '').replace(/</g, '&lt;') + '</code></p></div>';
  var sop = '<div class="cbv-staff-detail-section cbv-card"><h3>SOP</h3>' + (m.sopInlineHtml || '') + '</div>';
  var tl = '<div class="cbv-staff-detail-section cbv-card"><h3>Timeline</h3><ol>' + rows + '</ol></div>';

  var fbHref = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function')
    ? CbvWebAppOpUx_buildRouteUrl_('/workspace/staff/feedback?taskId=' + encodeURIComponent(t.taskId))
    : '/workspace/staff/feedback?taskId=' + encodeURIComponent(t.taskId);
  var sopLink = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/workspace/guided') : '/workspace/guided';

  return (
    '<div class="cbv-staff-detail-section cbv-card"><h3>Tóm tắt</h3>' +
    '<div class="cbv-kv">' +
    '<div class="cbv-muted">Tiêu đề</div><div>' + String(t.title || '').replace(/</g, '&lt;') + '</div>' +
    '<div class="cbv-muted">Trạng thái</div><div><span class="cbv-badge">' + String(t.status || '').replace(/</g, '&lt;') + '</span></div>' +
    '<div class="cbv-muted">Ưu tiên</div><div>' + String(t.priority || '').replace(/</g, '&lt;') + '</div>' +
    '<div class="cbv-muted">SLA</div><div><span class="cbv-badge warn">' + String(t.slaState || '').replace(/</g, '&lt;') + '</span></div>' +
    '<div class="cbv-muted">Bước tiếp</div><div>' + String(t.nextAction || '').replace(/</g, '&lt;') + '</div>' +
    '</div></div>' +
    tl + att + sop + audit +
    '<div class="cbv-row cbv-staff-mobile-stack" style="margin-top:12px">' +
    '<a class="cbv-staff-quick-action cbv-btn-operational cbv-busy-link" href="' + String(fbHref).replace(/"/g, '&quot;') + '">Phản hồi an toàn</a>' +
    '<a class="cbv-staff-quick-action cbv-btn-operational cbv-busy-link" href="' + String(sopLink).replace(/"/g, '&quot;') + '">SOP đầy đủ</a>' +
    '</div>'
  );
}

function CbvStaffWorkspace_getFeedbackSinkStatus_() {
  var mode = 'NONE';
  var message = 'Sheet `' + CBV_STAFF_WS_FEEDBACK_SHEET + '` chưa có trên spreadsheet đang mở — ghi nhận qua menu GAS / bổ sung sheet append-only.';
  try {
    if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getActiveSpreadsheet) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss && ss.getSheetByName(CBV_STAFF_WS_FEEDBACK_SHEET)) {
        mode = 'SHEET_APPEND';
        message = 'Append-only sink: ' + CBV_STAFF_WS_FEEDBACK_SHEET;
      }
    }
  } catch (e) {
    message = 'Không đọc được spreadsheet: ' + (e && e.message ? e.message : String(e));
  }
  return { mode: mode, sheetName: CBV_STAFF_WS_FEEDBACK_SHEET, ok: mode === 'SHEET_APPEND', message: message };
}

/**
 * Safe feedback: append row only when sink sheet exists. No delete/overwrite. No TASK mutation.
 */
function CbvStaffWorkspace_submitFeedbackSafe_(payload) {
  var p = payload || {};
  var traceId = String(p.traceId || '').trim();
  if (!traceId && typeof Utilities !== 'undefined' && Utilities.getUuid) traceId = Utilities.getUuid();
  if (!traceId) traceId = 'STAFFFB_' + new Date().getTime();

  var createdAt = (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date();
  var createdBy = (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : CbvStaffWorkspace__email_();
  var route = String(p.sourceRoute || '/workspace/staff/feedback').trim();
  var taskId = String(p.taskId || '').trim();
  var fbType = String(p.feedbackType || 'OTHER').trim().toUpperCase().replace(/\s+/g, '_');
  var note = String(p.note || '').trim();
  if (!note) {
    return { ok: false, traceId: traceId, warnings: [], errors: ['NOTE_REQUIRED'], sink: 'validation' };
  }

  var sink = CbvStaffWorkspace_getFeedbackSinkStatus_();
  if (sink.mode !== 'SHEET_APPEND') {
    return {
      ok: false,
      traceId: traceId,
      warnings: [sink.message || 'FEEDBACK_SINK_MISSING'],
      errors: ['SINK_DISABLED'],
      sink: 'none'
    };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(CBV_STAFF_WS_FEEDBACK_SHEET);
    var row = [traceId, createdAt, createdBy, route, taskId, fbType, note, CbvStaffWorkspace__email_()];
    sh.appendRow(row);
    return { ok: true, traceId: traceId, warnings: [], errors: [], sink: 'sheet', rowNumber: sh.getLastRow() };
  } catch (e) {
    return { ok: false, traceId: traceId, warnings: [], errors: [e && e.message ? e.message : String(e)], sink: 'error' };
  }
}

function CbvStaffWorkspace_buildFeedbackFormHtml_(params) {
  var p = params || {};
  var t = String(p.type || '').trim().toUpperCase();
  var taskId = String(p.taskId || '').trim();
  var sink = CbvStaffWorkspace_getFeedbackSinkStatus_();
  var opts = [
    { v: 'STUCK', l: 'Bị kẹt' },
    { v: 'MISSING_DATA', l: 'Thiếu dữ liệu' },
    { v: 'UNKNOWN_NEXT', l: 'Không biết làm gì tiếp' },
    { v: 'UI_BUG', l: 'Lỗi giao diện' },
    { v: 'SUPERVISOR_HELP', l: 'Cần supervisor hỗ trợ' }
  ];
  var optHtml = opts.map(function (o) {
    var sel = t === o.v ? ' selected' : '';
    return '<option value="' + o.v + '"' + sel + '>' + o.l + '</option>';
  }).join('');

  var back = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/workspace/staff/tasks') : '/workspace/staff/tasks';
  var sinkLine = sink.ok
    ? '<p class="cbv-badge ok">Sink: append-only sheet sẵn sàng.</p>'
    : '<p class="cbv-badge warn">Sink: chưa bật — chỉ xem hướng dẫn (không ghi DB).</p>';

  return (
    '<div class="cbv-staff-detail-section cbv-card">' +
    '<h2>Phản hồi vận hành</h2>' +
    sinkLine +
    '<p class="cbv-muted">WebApp READ_FIRST: không POST trực tiếp. Dùng menu Google Sheet (khi triển khai) gọi <code>CbvStaffWorkspace_submitFeedbackSafe_</code> hoặc tạo sheet <code>' + CBV_STAFF_WS_FEEDBACK_SHEET + '</code> với header: ' + CBV_STAFF_WS_FEEDBACK_HEADERS.join(', ') + '.</p>' +
    '<p>taskId hiện tại: <code>' + (taskId || '—') + '</code></p>' +
    '<label class="cbv-muted">Loại</label><br/><select id="cbvStaffFbType" class="cbv-btn-operational" style="width:100%;max-width:420px">' + optHtml + '</select>' +
    '<p class="cbv-muted" style="margin-top:10px">Ghi chú (mẫu — nhập trên Sheet / handoff):</p>' +
    '<textarea id="cbvStaffFbNote" rows="4" style="width:100%;max-width:520px;border-radius:12px;padding:10px"></textarea>' +
    '<p class="cbv-muted">traceId đề xuất: <code>' + String(p.traceHint || '').replace(/</g, '&lt;') + '</code></p>' +
    '<p><a class="cbv-btn-operational cbv-busy-link" href="' + String(back).replace(/"/g, '&quot;') + '">← Về việc của tôi</a></p>' +
    '</div>'
  );
}

function CbvStaffWorkspace_buildStaffBottomNavHtml_(activeRoute) {
  var ar = String(activeRoute || '');
  function item(route, label) {
    var href = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_(route) : route;
    var active = ar === route ? ' cbv-action-active' : '';
    return '<a class="cbv-btn-operational cbv-busy-link' + active + '" href="' + String(href).replace(/"/g, '&quot;') + '">' + String(label).replace(/</g, '&lt;') + '</a>';
  }
  return (
    '<nav class="cbv-staff-bottom-nav cbv-staff-mobile-stack" aria-label="Staff bottom nav" style="position:fixed;left:0;right:0;bottom:0;padding:12px;background:rgba(11,18,32,.95);border-top:1px solid #233256;z-index:50">' +
    '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:720px;margin:0 auto">' +
    item('/workspace/staff/tasks', 'Việc') +
    item('/workspace/today', 'Hôm nay') +
    item('/workspace/staff/feedback', 'Phản hồi') +
    item('/home-alert/my-queue', 'Queue') +
    '</div></nav>'
  );
}

function CbvStaffWorkspace_buildStickyActionBarHtml_(route) {
  return '<div class="cbv-staff-quick-action" style="position:sticky;top:0;z-index:40;padding:10px 0;background:linear-gradient(180deg,rgba(11,18,32,1),rgba(11,18,32,.85));">' +
    '<span class="cbv-muted">Thao tác nhanh (an toàn)</span> — <span class="cbv-badge">READ_FIRST</span>' +
    '</div>';
}

function CbvStaffWorkspace__readHtmlRaw_(path) {
  try {
    var tpl = HtmlService.createTemplateFromFile(path);
    if (tpl && typeof tpl.getCode === 'function') return String(tpl.getCode() || '');
  } catch (e0) { /* */ }
  try {
    return String(HtmlService.createHtmlOutputFromFile(path).getContent() || '');
  } catch (e1) {
    return '';
  }
}

function CbvStaffWorkspace_probeStaffMarkersInProject_() {
  var need = ['cbv-staff-bottom-nav', 'cbv-staff-task-card', 'cbv-staff-quick-action', 'cbv-staff-detail-section', 'cbv-staff-empty-state', 'cbv-loading-overlay', 'cbv-busy-link', 'cbv-staff-mobile-stack'];
  var files = ['html/WEBAPP_STAFF_TASKS', 'html/WEBAPP_STAFF_TASK_DETAIL', 'html/WEBAPP_STAFF_FEEDBACK', 'html/WEBAPP_WORKSPACE_SHELL', 'html/WEBAPP_WORKSPACE_COMPONENTS'];
  var combined = '';
  for (var i = 0; i < files.length; i++) {
    combined += CbvStaffWorkspace__readHtmlRaw_(files[i]);
  }
  var missing = need.filter(function (m) { return combined.indexOf(m) < 0; });
  return { ok: missing.length === 0, missing: missing, combinedLen: combined.length };
}

function CbvStaffWorkspace_renderTasksPage_() {
  var email = CbvStaffWorkspace__email_();
  var inbox = CbvStaffWorkspace_getTaskInboxModel_(email);
  var warnings = [].concat(inbox.adapterWarnings || []);
  var model = {
    inbox: inbox,
    staffBottomNav: CbvStaffWorkspace_buildStaffBottomNavHtml_('/workspace/staff/tasks'),
    stickyBar: CbvStaffWorkspace_buildStickyActionBarHtml_('/workspace/staff/tasks'),
    traceHint: (typeof CbvWebAppWorkspace__traceId_ === 'function') ? CbvWebAppWorkspace__traceId_() : ''
  };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_STAFF_TASKS');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: warnings };
  } catch (e2) {
    return { bodyHtml: '<p>Staff tasks template missing.</p>', warnings: warnings.concat([String(e2 && e2.message ? e2.message : e2)]) };
  }
}

function CbvStaffWorkspace_renderTaskDetailPage_(params) {
  var p = params || {};
  var taskId = String(p.taskId || p.taskid || '').trim();
  var detail = CbvStaffWorkspace_getTaskDetailModel_(taskId);
  var warnings = [].concat(detail.warnings || []);
  var model = {
    detail: detail,
    bodyInner: CbvStaffWorkspace_buildTaskDetailHtml_(detail),
    staffBottomNav: CbvStaffWorkspace_buildStaffBottomNavHtml_('/workspace/staff/task-detail'),
    stickyBar: CbvStaffWorkspace_buildStickyActionBarHtml_('/workspace/staff/task-detail')
  };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_STAFF_TASK_DETAIL');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: warnings };
  } catch (e2) {
    return { bodyHtml: '<p>Staff detail template missing.</p>', warnings: warnings.concat([String(e2)]) };
  }
}

function CbvStaffWorkspace_renderFeedbackPage_(params) {
  var p = params || {};
  var traceHint = (typeof CbvWebAppWorkspace__traceId_ === 'function') ? CbvWebAppWorkspace__traceId_() : '';
  var model = {
    formHtml: CbvStaffWorkspace_buildFeedbackFormHtml_({ type: p.type, taskId: p.taskId || p.taskid, traceHint: traceHint }),
    staffBottomNav: CbvStaffWorkspace_buildStaffBottomNavHtml_('/workspace/staff/feedback'),
    stickyBar: CbvStaffWorkspace_buildStickyActionBarHtml_('/workspace/staff/feedback')
  };
  var warnings = [];
  var st = CbvStaffWorkspace_getFeedbackSinkStatus_();
  if (!st.ok) warnings.push(st.message || 'FEEDBACK_SINK_OFF');
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_STAFF_FEEDBACK');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: warnings };
  } catch (e2) {
    return { bodyHtml: '<p>Staff feedback template missing.</p>', warnings: warnings.concat([String(e2)]) };
  }
}
