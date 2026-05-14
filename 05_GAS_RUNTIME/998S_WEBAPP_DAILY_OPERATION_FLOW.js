/**
 * MILESTONE_03 — Daily operation flow (task-first, read-first)
 *
 * Depends: 91 config, 92 routes, 998Q staff workspace (HOME_ALERT adapter).
 * No TASK_MAIN mutation. No auto assign / resolve / escalate.
 */

function CbvDailyOp__email_() {
  return (typeof CbvStaffWorkspace__email_ === 'function') ? CbvStaffWorkspace__email_() : '';
}

/**
 * Next action engine V1 — guidance only (no mutation).
 */
function CbvDailyOp_getNextActionForTask_(task) {
  var t = task || {};
  if (typeof CbvStaffWorkspace__isBlockedStatus_ === 'function' && CbvStaffWorkspace__isBlockedStatus_(t.status)) {
    return 'Báo kẹt / Cần supervisor hỗ trợ';
  }
  var sla = String(t.slaState || '').toUpperCase();
  if (sla.indexOf('OVERDUE') >= 0 || sla.indexOf('BREACH') >= 0) return 'Xử lý ngay / Mở chi tiết';
  var title = String(t.title || '');
  if (!title || title === '(Không tiêu đề)') return 'Bổ sung dữ liệu / Gửi phản hồi';
  if (typeof CbvStaffWorkspace__isPendingStatus_ === 'function' && CbvStaffWorkspace__isPendingStatus_(t.status)) {
    return 'Tiếp tục xử lý';
  }
  return 'Mở chi tiết để kiểm tra';
}

function CbvDailyOp_getNextActionReason_(task) {
  var t = task || {};
  if (typeof CbvStaffWorkspace__isBlockedStatus_ === 'function' && CbvStaffWorkspace__isBlockedStatus_(t.status)) return 'BLOCKED';
  var sla = String(t.slaState || '').toUpperCase();
  if (sla.indexOf('OVERDUE') >= 0 || sla.indexOf('BREACH') >= 0) return 'SLA_OVERDUE';
  var title = String(t.title || '');
  if (!title || title === '(Không tiêu đề)') return 'MISSING_DATA';
  if (typeof CbvStaffWorkspace__isPendingStatus_ === 'function' && CbvStaffWorkspace__isPendingStatus_(t.status)) return 'PENDING';
  return 'UNKNOWN';
}

function CbvDailyOp_getActionPriority_(task) {
  return CbvDailyOp_rankTaskUrgency_(task);
}

function CbvDailyOp_rankTaskUrgency_(task) {
  var t = task || {};
  var s = 0;
  if (typeof CbvStaffWorkspace__isBlockedStatus_ === 'function' && CbvStaffWorkspace__isBlockedStatus_(t.status)) s += 85;
  var sla = String(t.slaState || '').toUpperCase();
  if (sla.indexOf('BREACH') >= 0) s += 80;
  else if (sla.indexOf('OVERDUE') >= 0) s += 70;
  else if (sla.indexOf('WARN') >= 0) s += 40;
  var p = String(t.priority || '').toUpperCase();
  if (p.indexOf('HIGH') >= 0 || p === 'P1' || p === '1' || p === 'CRITICAL') s += 35;
  var title = String(t.title || '');
  if (!title || title === '(Không tiêu đề)') s += 28;
  var st = String(t.status || '').toUpperCase();
  if (st.indexOf('WAIT') >= 0 || st.indexOf('PENDING') >= 0 || st.indexOf('CONFIRM') >= 0) s += 12;
  return s;
}

function CbvDailyOp__enrichTask_(row) {
  var t = row || {};
  var na = CbvDailyOp_getNextActionForTask_(t);
  var nr = CbvDailyOp_getNextActionReason_(t);
  return {
    taskId: t.taskId,
    title: t.title,
    status: t.status,
    priority: t.priority,
    slaState: t.slaState,
    assignedTo: t.assignedTo,
    nextAction: t.nextAction,
    sourceModule: t.sourceModule,
    dueAt: t.dueAt,
    raw: t.raw,
    dailyNextAction: na,
    dailyNextReason: nr,
    dailyRank: CbvDailyOp_rankTaskUrgency_(t),
    dailyBlocked: typeof CbvStaffWorkspace__isBlockedStatus_ === 'function' ? CbvStaffWorkspace__isBlockedStatus_(t.status) : false,
    dailySlaHot: (function () {
      var u = String(t.slaState || '').toUpperCase();
      return u.indexOf('OVERDUE') >= 0 || u.indexOf('BREACH') >= 0;
    })(),
    dailyMissingData: !String(t.title || '').trim() || String(t.title) === '(Không tiêu đề)'
  };
}

function CbvDailyOp_getUrgentItems_(userEmail) {
  var m = CbvDailyOp_getDailyHomeModel_(userEmail, 'ALL');
  return (m && m.urgent) ? m.urgent.slice() : [];
}

function CbvDailyOp_getBlockedItems_(userEmail) {
  var m = CbvDailyOp_getDailyHomeModel_(userEmail, 'ALL');
  return (m && m.blocked) ? m.blocked.slice() : [];
}

function CbvDailyOp_getNextActions_(userEmail) {
  var m = CbvDailyOp_getDailyHomeModel_(userEmail, 'ALL');
  return (m && m.nextActionHints) ? m.nextActionHints.slice() : [];
}

function CbvDailyOp_getDailyHomeModel_(userEmail, filterKey) {
  var email = String(userEmail || '').trim() || CbvDailyOp__email_();
  var inbox = (typeof CbvStaffWorkspace_getTaskInboxModel_ === 'function') ? CbvStaffWorkspace_getTaskInboxModel_(email) : { inbox: [], blocked: [], pending: [], adapterWarnings: [] };
  var rows = (inbox.inbox || []).map(CbvDailyOp__enrichTask_);
  var blocked = rows.filter(function (r) { return r.dailyBlocked; });
  var urgent = rows.filter(function (r) {
    return r.dailyBlocked || r.dailySlaHot || r.dailyMissingData || r.dailyRank >= 40;
  });
  urgent.sort(function (a, b) { return (b.dailyRank || 0) - (a.dailyRank || 0); });

  var seen = {};
  var hints = [];
  for (var i = 0; i < urgent.length && hints.length < 6; i++) {
    var h = urgent[i].dailyNextAction;
    if (!seen[h]) {
      seen[h] = true;
      hints.push({ text: h, taskId: urgent[i].taskId, reason: urgent[i].dailyNextReason });
    }
  }

  var fk = String(filterKey || 'ALL').toUpperCase();
  var mineEmail = String(email || '').toLowerCase();
  function isMine(t) {
    var a = String(t.assignedTo || '').toLowerCase();
    return a && mineEmail && a.indexOf(mineEmail) >= 0;
  }
  var filtered = rows.slice();
  if (fk === 'URGENT' || fk === 'GAP') filtered = urgent.slice();
  else if (fk === 'OVERDUE' || fk === 'QUA_HAN') filtered = rows.filter(function (r) { return r.dailySlaHot; });
  else if (fk === 'STUCK' || fk === 'BI_KET') filtered = blocked.slice();
  else if (fk === 'MINE' || fk === 'CUA_TOI') filtered = rows.filter(isMine);
  else if (fk === 'HELP' || fk === 'CAN_TRO_GIUP') filtered = rows.filter(function (r) { return r.dailyBlocked || r.dailyMissingData; });

  return {
    userEmail: email,
    filter: fk,
    inbox: rows,
    urgent: urgent,
    blocked: blocked,
    filtered: filtered,
    nextActionHints: hints,
    counts: {
      inbox: rows.length,
      urgent: urgent.length,
      blocked: blocked.length,
      filtered: filtered.length
    },
    adapterWarnings: inbox.adapterWarnings || [],
    dataSource: inbox.dataSource || 'NONE',
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CbvDailyOp_getPrimaryActionForTask_(task) {
  var t = task || {};
  var id = String(t.taskId || '').trim();
  var path = '/workspace/staff/task-detail';
  if (id) path += '?taskId=' + encodeURIComponent(id);
  var href = path;
  if (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') {
    try {
      href = CbvWebAppOpUx_buildRouteUrl_(path);
    } catch (e1) { /* keep */ }
  }
  return { label: 'Xử lý ngay', href: href, route: path };
}

function CbvDailyOp_getSecondaryActionsForTask_(task) {
  var t = task || {};
  var id = String(t.taskId || '').trim();
  var sop = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/workspace/guided') : '/workspace/guided';
  var fb = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/workspace/staff/feedback') : '/workspace/staff/feedback';
  var stuck = fb + (id ? '?type=STUCK&taskId=' + encodeURIComponent(id) : '?type=STUCK');
  var help = fb + (id ? '?type=SUPERVISOR_HELP&taskId=' + encodeURIComponent(id) : '?type=SUPERVISOR_HELP');
  return [
    { key: 'sop', label: 'Xem SOP', href: sop },
    { key: 'stuck', label: 'Báo kẹt', href: stuck },
    { key: 'help', label: 'Cần hỗ trợ', href: help }
  ];
}

function CbvDailyOp_buildTaskCardV2Html_(task) {
  var t = task || {};
  var pri = CbvDailyOp_getPrimaryActionForTask_(t);
  var sec = CbvDailyOp_getSecondaryActionsForTask_(t);
  var secHtml = sec.map(function (s) {
    return '<a class="cbv-daily-secondary-action cbv-btn-operational cbv-busy-link cbv-action-xl" href="' +
      String(s.href).replace(/"/g, '&quot;') + '">' + String(s.label).replace(/</g, '&lt;') + '</a>';
  }).join('');
  var pBadge = String(t.priority || '—').replace(/</g, '&lt;');
  var slaBadge = String(t.slaState || '—').replace(/</g, '&lt;');
  var st = String(t.status || '—').replace(/</g, '&lt;');
  var title = String(t.title || '').replace(/</g, '&lt;');
  var nx = String(t.dailyNextAction || CbvDailyOp_getNextActionForTask_(t)).replace(/</g, '&lt;');
  var mod = String(t.sourceModule || '').replace(/</g, '&lt;');
  var due = String(t.dueAt || '—').replace(/</g, '&lt;');
  var tid = String(t.taskId || '').replace(/"/g, '&quot;');

  return (
    '<article class="cbv-daily-task-card cbv-card cbv-daily-mobile-stack" data-task-id="' + tid + '">' +
    '<div class="cbv-row" style="justify-content:space-between;align-items:flex-start">' +
    '<h3 style="margin:0;flex:1">' + title + '</h3>' +
    '<span class="cbv-daily-priority-badge cbv-badge warn">' + pBadge + '</span></div>' +
    '<div class="cbv-kv" style="margin-top:8px">' +
    '<div class="cbv-muted">Trạng thái</div><div><span class="cbv-badge">' + st + '</span></div>' +
    '<div class="cbv-muted">SLA</div><div><span class="cbv-daily-sla-badge cbv-badge crit">' + slaBadge + '</span></div>' +
    '<div class="cbv-muted">Nguồn</div><div>' + mod + '</div>' +
    '<div class="cbv-muted">Cập nhật</div><div>' + due + '</div>' +
    '</div>' +
    '<p class="cbv-daily-next-action cbv-muted" style="margin:10px 0 6px 0"><strong>Bước tiếp:</strong> ' + nx + '</p>' +
    '<div class="cbv-thumb-zone cbv-row" style="margin-top:10px">' +
    '<a class="cbv-daily-primary-action cbv-btn-operational cbv-busy-link cbv-action-xl" href="' +
    String(pri.href).replace(/"/g, '&quot;') + '">' + String(pri.label).replace(/</g, '&lt;') + '</a>' +
    secHtml +
    '</div></article>'
  );
}

function CbvDailyOp_buildDailyHomeHtml_(model) {
  var m = model || {};
  var list = m.filtered || [];
  var cards = list.map(CbvDailyOp_buildTaskCardV2Html_).join('');
  if (!cards) {
    var guided = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/workspace/guided') : '/workspace/guided';
    var fb = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/workspace/staff/feedback') : '/workspace/staff/feedback';
    cards =
      '<div class="cbv-daily-empty-state cbv-state cbv-empty-state">' +
      '<p><strong>Chưa có việc cần xử lý</strong></p>' +
      '<p class="cbv-muted">Khi có dữ liệu HOME_ALERT, danh sách sẽ hiện tại đây (read-first).</p>' +
      '<div class="cbv-thumb-zone cbv-row cbv-daily-mobile-stack" style="margin-top:12px">' +
      '<a class="cbv-btn-operational cbv-busy-link cbv-action-xl" href="' + String(guided).replace(/"/g, '&quot;') + '">Mở hướng dẫn</a>' +
      '<a class="cbv-btn-operational cbv-busy-link cbv-action-xl" href="' + String(fb).replace(/"/g, '&quot;') + '">Gửi phản hồi nếu thiếu dữ liệu</a>' +
      '</div></div>';
  }
  return cards;
}

function CbvDailyOp_buildBottomNavHtml_(activeRoute) {
  var ar = String(activeRoute || '');
  function item(route, label) {
    var href = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_(route) : route;
    var active = ar === route ? ' cbv-action-active' : '';
    return '<a class="cbv-btn-operational cbv-busy-link cbv-action-xl' + active + '" href="' + String(href).replace(/"/g, '&quot;') + '">' + String(label).replace(/</g, '&lt;') + '</a>';
  }
  return (
    '<nav class="cbv-daily-bottom-nav cbv-thumb-zone" aria-label="Daily bottom nav" style="position:fixed;left:0;right:0;bottom:0;padding:12px;background:rgba(11,18,32,.95);border-top:1px solid #233256;z-index:50">' +
    '<div class="cbv-daily-mobile-stack" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:900px;margin:0 auto">' +
    item('/workspace', 'Trang chủ') +
    item('/workspace/daily', 'Daily') +
    item('/workspace/staff/tasks', 'Việc NV') +
    item('/workspace/today', 'Hôm nay') +
    item('/workspace/staff/feedback', 'Phản hồi') +
    '</div></nav>'
  );
}

function CbvDailyOp_buildStickyPrimaryHtml_(model) {
  var m = model || {};
  var first = (m.urgent && m.urgent[0]) ? m.urgent[0] : null;
  var href;
  var label;
  if (first && first.taskId) {
    var pa = CbvDailyOp_getPrimaryActionForTask_(first);
    href = pa.href;
    label = 'Ưu tiên: ' + pa.label;
  } else {
    href = (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') ? CbvWebAppOpUx_buildRouteUrl_('/workspace/guided') : '/workspace/guided';
    label = 'Mở hướng dẫn';
  }
  return (
    '<div class="cbv-daily-sticky-action" style="position:sticky;top:0;z-index:40;padding:10px 0;background:linear-gradient(180deg,rgba(11,18,32,1),rgba(11,18,32,.88));border-bottom:1px solid #233256">' +
    '<a class="cbv-daily-primary-action cbv-btn-operational cbv-busy-link cbv-action-xl" style="width:100%;box-sizing:border-box;text-align:center" href="' +
    String(href).replace(/"/g, '&quot;') + '">' + String(label).replace(/</g, '&lt;') + '</a>' +
    '<div class="cbv-muted" style="font-size:12px;margin-top:6px">READ_FIRST · không tự giao / tự hoàn tất / tự leo thang</div></div>'
  );
}

function CbvDailyOp__buildFilteredDailyUrl_(filterKey) {
  var fk = encodeURIComponent(String(filterKey || 'ALL'));
  var base = (typeof CbvWebAppRouteUrl_getBaseUrl === 'function') ? CbvWebAppRouteUrl_getBaseUrl() : '';
  if (!base) return '/workspace/daily?filter=' + fk;
  return base + '?route=' + encodeURIComponent('/workspace/daily') + '&filter=' + fk;
}

function CbvDailyOp_buildFilterChipsHtml_(activeFilter) {
  var af = String(activeFilter || 'ALL').toUpperCase();
  function chip(key, label) {
    var href = CbvDailyOp__buildFilteredDailyUrl_(key);
    var on = af === String(key).toUpperCase() ? ' cbv-action-active' : '';
    return '<a class="cbv-daily-filter-chip cbv-link' + on + '" href="' + String(href).replace(/"/g, '&quot;') + '">' + String(label).replace(/</g, '&lt;') + '</a>';
  }
  return (
    '<div class="cbv-daily-filter-chip-row" style="display:flex;gap:8px;overflow-x:auto;padding:8px 0;white-space:nowrap">' +
    chip('ALL', 'Tất cả') +
    chip('URGENT', 'Gấp') +
    chip('OVERDUE', 'Quá hạn') +
    chip('STUCK', 'Bị kẹt') +
    chip('MINE', 'Của tôi') +
    chip('HELP', 'Cần hỗ trợ') +
    '</div>'
  );
}

function CbvDailyOp_renderDailyPage_(params) {
  var p = params || {};
  var fk = String(p.filter || p.FILTER || 'ALL').trim();
  var email = CbvDailyOp__email_();
  var home = CbvDailyOp_getDailyHomeModel_(email, fk);
  var urgentCards = (home.urgent || []).slice(0, 12).map(CbvDailyOp_buildTaskCardV2Html_).join('');
  if (!urgentCards) {
    urgentCards = '<div class="cbv-daily-empty-state cbv-muted">Không có mục khẩn cấp theo tiêu chí read-first hiện tại.</div>';
  }
  var blockedCards = (home.blocked || []).slice(0, 12).map(CbvDailyOp_buildTaskCardV2Html_).join('');
  if (!blockedCards) {
    blockedCards = '<div class="cbv-daily-empty-state cbv-muted">Không có việc bị kẹt.</div>';
  }
  var eml = String(email || '').toLowerCase();
  var mineCards = (home.inbox || []).filter(function (t) {
    var a = String(t.assignedTo || '').toLowerCase();
    return eml && a && a.indexOf(eml) >= 0;
  }).slice(0, 12).map(CbvDailyOp_buildTaskCardV2Html_).join('');
  if (!mineCards) mineCards = '<div class="cbv-daily-empty-state cbv-muted">Không có việc gán trực tiếp trong phạm vi adapter.</div>';

  var nextLines = (home.nextActionHints || []).map(function (h) {
    return '<li><strong>' + String(h.text).replace(/</g, '&lt;') + '</strong>' +
      (h.taskId ? ' <span class="cbv-muted">(' + String(h.taskId).replace(/</g, '&lt;') + ')</span>' : '') +
      '</li>';
  }).join('');
  if (!nextLines) nextLines = '<li class="cbv-muted">Không có gợi ý — mở chi tiết từng việc khi cần.</li>';

  var listBody = CbvDailyOp_buildDailyHomeHtml_(home);
  var warnings = [].concat(home.adapterWarnings || []);

  var model = {
    home: home,
    urgentCardsHtml: urgentCards,
    blockedCardsHtml: blockedCards,
    mineCardsHtml: mineCards,
    nextActionsHtml: nextLines,
    listBodyHtml: listBody,
    filterChipsHtml: CbvDailyOp_buildFilterChipsHtml_(home.filter),
    stickyPrimaryHtml: CbvDailyOp_buildStickyPrimaryHtml_(home),
    bottomNavHtml: CbvDailyOp_buildBottomNavHtml_('/workspace/daily'),
    traceHint: (typeof CbvWebAppWorkspace__traceId_ === 'function') ? CbvWebAppWorkspace__traceId_() : ''
  };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_DAILY_OPERATION_HOME');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: warnings };
  } catch (e2) {
    return { bodyHtml: '<p>Daily template missing.</p>', warnings: warnings.concat([String(e2 && e2.message ? e2.message : e2)]) };
  }
}

function CbvDailyOp__readHtmlRaw_(path) {
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

function CbvDailyOp_probeDailyMarkersInProject_() {
  var need = [
    'cbv-daily-task-card',
    'cbv-daily-primary-action',
    'cbv-daily-secondary-action',
    'cbv-daily-priority-badge',
    'cbv-daily-sla-badge',
    'cbv-daily-next-action',
    'cbv-daily-empty-state',
    'cbv-primary-nav',
    'cbv-secondary-quick-links',
    'cbv-nav-no-duplicate',
    'cbv-staff-default-daily',
    'cbv-daily-bottom-nav',
    'cbv-daily-sticky-action',
    'cbv-daily-filter-chip',
    'cbv-daily-mobile-stack',
    'cbv-thumb-zone',
    'cbv-action-xl'
  ];
  var files = ['html/WEBAPP_DAILY_OPERATION_HOME', 'html/WEBAPP_WORKSPACE_SHELL', 'html/WEBAPP_WORKSPACE_COMPONENTS', 'html/WEBAPP_STAFF_TASKS'];
  var combined = '';
  for (var i = 0; i < files.length; i++) {
    combined += CbvDailyOp__readHtmlRaw_(files[i]);
  }
  var missing = need.filter(function (x) { return combined.indexOf(x) < 0; });
  return { ok: missing.length === 0, missing: missing, combinedLen: combined.length };
}
