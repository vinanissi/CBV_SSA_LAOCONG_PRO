/**
 * MILESTONE_04 — Operation execution flow (read-first execution cockpit + focus mode)
 *
 * Depends: 998Q (staff task/detail), 998S (daily next-action / rank when loaded).
 * No auto assign / resolve / escalate. No claim / complete buttons. No production mutation.
 */

function CbvExecFlow__href_(route) {
  var r = String(route || '').trim();
  if (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') {
    try {
      return CbvWebAppOpUx_buildRouteUrl_(r);
    } catch (e0) { /* */ }
  }
  return r || '#';
}

function CbvExecFlow_detectBlockers_(task) {
  var t = task || {};
  var out = [];
  var sla = String(t.slaState || '').toUpperCase();
  if (sla.indexOf('BREACH') >= 0 || sla.indexOf('OVERDUE') >= 0) out.push('SLA_BREACH');
  if (typeof CbvStaffWorkspace__isBlockedStatus_ === 'function' && CbvStaffWorkspace__isBlockedStatus_(t.status)) {
    out.push('BLOCKED_STATUS');
  }
  var asg = String(t.assignedTo || '').trim();
  if (!asg) out.push('UNASSIGNED');
  var title = String(t.title || '');
  if (!title || title === '(Không tiêu đề)') out.push('MISSING_DATA');
  var st = String(t.status || '').toUpperCase();
  if (st.indexOf('HELP') >= 0 || st.indexOf('SUPPORT') >= 0) out.push('NEED_SUPPORT');
  if (!out.length) out.push('UNKNOWN');
  return out;
}

function CbvExecFlow_getBlockerResolution_(blockerType) {
  var b = String(blockerType || 'UNKNOWN').toUpperCase();
  if (b === 'SLA_BREACH') {
    return { type: b, reason: 'Task quá hạn', next: 'Xử lý ngay hoặc báo supervisor nếu không đủ dữ liệu' };
  }
  if (b === 'BLOCKED_STATUS') {
    return { type: b, reason: 'Task đang bị chặn', next: 'Báo kẹt và ghi chú lý do' };
  }
  if (b === 'UNASSIGNED') {
    return { type: b, reason: 'Chưa có người phụ trách', next: 'Báo supervisor hỗ trợ phân công' };
  }
  if (b === 'MISSING_DATA') {
    return { type: b, reason: 'Thiếu dữ liệu', next: 'Bổ sung dữ liệu hoặc báo thiếu dữ liệu' };
  }
  if (b === 'NEED_SUPPORT') {
    return { type: b, reason: 'Cần hỗ trợ', next: 'Gửi phản hồi cần hỗ trợ' };
  }
  return { type: 'UNKNOWN', reason: 'Chưa rõ nguyên nhân', next: 'Mở chi tiết / báo kẹt nếu không xử lý được' };
}

function CbvExecFlow_buildBlockerResolutionHtml_(model) {
  var m = model || {};
  var rows = (m.blockerResolutions || []).map(function (br) {
    return (
      '<li class="cbv-exec-blocker-type" data-blocker="' + String(br.type || '').replace(/"/g, '&quot;') + '">' +
      '<span class="cbv-exec-blocker-reason">' + String(br.reason || '').replace(/</g, '&lt;') + '</span> — ' +
      '<span class="cbv-exec-blocker-resolution">' + String(br.next || '').replace(/</g, '&lt;') + '</span>' +
      ' <a class="cbv-exec-help-action cbv-link cbv-exec-safe-action cbv-busy-link" href="' +
      String(CbvExecFlow__href_('/workspace/staff/feedback')).replace(/"/g, '&quot;') + '">Phản hồi</a></li>'
    );
  }).join('');
  return '<ul class="cbv-exec-blocker-resolution-list" style="margin:0;padding-left:18px">' + (rows || '<li class="cbv-muted">—</li>') + '</ul>';
}

function CbvExecFlow_getUrgencyExplanation_(task) {
  var t = task || {};
  var parts = [];
  if (typeof CbvDailyOp_rankTaskUrgency_ === 'function') {
    var rk = CbvDailyOp_rankTaskUrgency_(t);
    if (rk >= 70) parts.push('Điểm ưu tiên cao (' + rk + '): SLA hoặc trạng thái kẹt.');
    else if (rk >= 40) parts.push('Điểm ưu tiên trung-bình (' + rk + '): cần theo dõi.');
    else parts.push('Ưu tiên theo queue read-first (điểm ' + rk + ').');
  } else {
    parts.push('Ưu tiên theo trạng thái SLA và trạng thái task trên queue read-first.');
  }
  var sla = String(t.slaState || '');
  if (sla) parts.push('SLA hiện tại: ' + sla + '.');
  return parts.join(' ');
}

function CbvExecFlow_getOperatorPrompt_(task) {
  var t = task || {};
  var na = (typeof CbvDailyOp_getNextActionForTask_ === 'function') ? CbvDailyOp_getNextActionForTask_(t) : 'Tiếp tục theo SOP.';
  return [
    'Bây giờ: ' + na,
    'Nếu kẹt: dùng Báo kẹt / Cần hỗ trợ (chỉ điều hướng, không ghi TASK_MAIN từ WebApp).',
    'Không tự động giao việc / kết thúc task / leo thang — thao tác ghi trên AppSheet theo quy trình.'
  ].join(' ');
}

function CbvExecFlow_buildCognitionGuideHtml_(model) {
  var m = model || {};
  var u = String(m.urgencyExplanation || '').replace(/</g, '&lt;');
  var p = String(m.operatorPrompt || '').replace(/</g, '&lt;');
  var prefix = '';
  try {
    if (typeof CbvGuidedSop_buildStepFlowModel_ === 'function') {
      var fm = CbvGuidedSop_buildStepFlowModel_(m.task || null);
      if (typeof CbvGuidedSop_buildCurrentStepBannerHtml_ === 'function') {
        prefix += '<div class="cbv-sop-m05-cognition-banner">' + CbvGuidedSop_buildCurrentStepBannerHtml_(fm) + '</div>';
      }
      if (typeof CbvGuidedSop_buildStepValidationHtml_ === 'function') {
        prefix += '<div class="cbv-sop-m05-cognition-validation">' + CbvGuidedSop_buildStepValidationHtml_(fm) + '</div>';
      }
    }
  } catch (eC) {
    prefix = '';
  }
  return (
    '<aside class="cbv-exec-cognition-guide cbv-card" style="margin-top:12px;border-style:dashed">' +
    prefix +
    '<h3 class="cbv-exec-why-urgent">Vì sao việc này gấp?</h3><p class="cbv-muted">' + u + '</p>' +
    '<h3 class="cbv-exec-now-do">Bây giờ làm gì?</h3><p class="cbv-muted">' + String(m.nextAction || '—').replace(/</g, '&lt;') + '</p>' +
    '<h3 class="cbv-exec-if-blocked">Nếu không làm được thì bấm gì?</h3><p class="cbv-muted">Báo kẹt hoặc Cần hỗ trợ → form phản hồi an toàn.</p>' +
    '<h3 class="cbv-exec-safety-note">Không được tự động làm gì?</h3><p class="cbv-exec-safety-note cbv-muted">Không tự giao việc · không tự kết thúc task · không tự leo thang · không claim từ WebApp pilot.</p>' +
    '<p class="cbv-muted" style="font-size:12px;margin-top:8px">' + p + '</p></aside>'
  );
}

function CbvExecFlow_getPrimaryCta_(task) {
  var t = task || {};
  var id = String(t.taskId || '').trim();
  var path = '/workspace/staff/task-detail';
  if (id) path += '?taskId=' + encodeURIComponent(id);
  return { label: 'Xử lý ngay', href: CbvExecFlow__href_(path), kind: 'OPEN_DETAIL' };
}

function CbvExecFlow_getSecondaryCtas_(task) {
  var t = task || {};
  var id = String(t.taskId || '').trim();
  var sop = CbvExecFlow__href_('/workspace/guided');
  var fb = CbvExecFlow__href_('/workspace/staff/feedback');
  var stuck = fb + (id ? '?type=STUCK&taskId=' + encodeURIComponent(id) : '?type=STUCK');
  var help = fb + (id ? '?type=SUPERVISOR_HELP&taskId=' + encodeURIComponent(id) : '?type=SUPERVISOR_HELP');
  var daily = CbvExecFlow__href_('/workspace/daily');
  return [
    { label: 'Xem SOP', href: sop, kind: 'SOP' },
    { label: 'Báo kẹt', href: stuck, kind: 'STUCK' },
    { label: 'Cần hỗ trợ', href: help, kind: 'HELP' },
    { label: 'Quay lại Daily', href: daily, kind: 'DAILY' }
  ];
}

function CbvExecFlow_getActionStack_(task) {
  return {
    primary: CbvExecFlow_getPrimaryCta_(task),
    secondary: CbvExecFlow_getSecondaryCtas_(task)
  };
}

function CbvExecFlow_buildActionStackHtml_(task) {
  var stack = CbvExecFlow_getActionStack_(task);
  var p = stack.primary || {};
  var sec = (stack.secondary || []).map(function (s) {
    var retCls = (s.kind === 'DAILY') ? ' cbv-exec-return-daily' : '';
    return '<a class="cbv-exec-secondary-action cbv-exec-safe-action cbv-btn-operational cbv-busy-link' + retCls + '" href="' +
      String(s.href).replace(/"/g, '&quot;') + '">' + String(s.label).replace(/</g, '&lt;') + '</a>';
  }).join('');
  return (
    '<div class="cbv-exec-action-stack cbv-exec-no-auto-mutation cbv-thumb-zone">' +
    '<a class="cbv-exec-primary-action cbv-exec-primary-cta cbv-btn-operational cbv-busy-link cbv-action-xl" href="' +
    String(p.href || '#').replace(/"/g, '&quot;') + '">' + String(p.label || 'Xử lý ngay').replace(/</g, '&lt;') + '</a>' +
    '<div class="cbv-row cbv-exec-secondary-action" style="margin-top:10px;flex-wrap:wrap;gap:8px">' + sec + '</div></div>'
  );
}

function CbvExecFlow_buildExecutionActionZoneHtml_(model) {
  var m = model || {};
  var t = m.task || {};
  return (
    '<section class="cbv-exec-action-zone cbv-card">' +
    '<h2 class="cbv-muted" style="margin-top:0;font-size:14px">ACTION ZONE</h2>' +
    CbvExecFlow_buildActionStackHtml_(t) +
    '</section>'
  );
}

function CbvExecFlow__buildInlineSopLegacyHtml_(model) {
  var m = model || {};
  var tid = String(m.taskId || '').replace(/</g, '&lt;');
  return (
    '<section class="cbv-exec-inline-sop cbv-card">' +
    '<h3>SOP — thực thi tại chỗ</h3>' +
    '<ol style="margin:0;padding-left:18px">' +
    '<li class="cbv-exec-sop-step"><strong>Bước 1:</strong> Đọc tiêu đề, SLA và bước tiếp trên thẻ.</li>' +
    '<li class="cbv-exec-sop-step"><strong>Bước 2:</strong> Mở AppSheet / chứng từ theo kênh chính nếu cần (không upload qua WebApp pilot).</li>' +
    '<li class="cbv-exec-sop-step"><strong>Bước 3:</strong> Ghi nhận tiến độ trên AppSheet theo SOP đơn vị.</li>' +
    '</ol>' +
    '<p class="cbv-muted" style="font-size:13px;margin-top:8px">Khi nào báo kẹt: không có quyền / thiếu dữ liệu / không rõ bước tiếp. Khi nào cần supervisor: cần phân công / gỡ chặn / xác nhận ngoài phạm vi hiện tại.</p>' +
    '<p class="cbv-muted" style="font-size:12px">taskId: <code>' + tid + '</code></p></section>'
  );
}

function CbvExecFlow_buildInlineSopHtml_(model) {
  try {
    if (typeof CbvGuidedSop_buildStepFlowModel_ === 'function' && typeof CbvGuidedSop_buildStepperHtml_ === 'function') {
      var m = model || {};
      var fm = CbvGuidedSop_buildStepFlowModel_(m.task || null);
      var stepper = CbvGuidedSop_buildStepperHtml_(fm);
      return (
        '<section class="cbv-exec-inline-sop cbv-card cbv-exec-m05-guided-sop">' +
        stepper +
        '</section>'
      );
    }
  } catch (eG) {
    /* fall back */
  }
  return CbvExecFlow__buildInlineSopLegacyHtml_(model);
}

function CbvExecFlow_buildMiniTimelineHtml_(model) {
  var m = model || {};
  var evs = (m.timeline || []).slice(0, 12);
  if (!evs.length) {
    return '<section class="cbv-exec-mini-timeline cbv-card"><h3>Mini timeline</h3><p class="cbv-muted">Chưa có sự kiện chi tiết — chỉ hiển thị dữ liệu read-first từ queue.</p></section>';
  }
  var rows = evs.map(function (ev) {
    return '<li><strong>' + String(ev.label || '').replace(/</g, '&lt;') + '</strong> — ' + String(ev.detail || '').replace(/</g, '&lt;') +
      (ev.at ? ' <span class="cbv-muted">(' + String(ev.at).replace(/</g, '&lt;') + ')</span>' : '') + '</li>';
  }).join('');
  return '<section class="cbv-exec-mini-timeline cbv-card"><h3>Mini timeline</h3><ol style="margin:0;padding-left:18px">' + rows + '</ol></section>';
}

function CbvExecFlow_buildBlockerPanelHtml_(model) {
  var m = model || {};
  var types = (m.blockers || []).join(', ') || 'UNKNOWN';
  return (
    '<section class="cbv-exec-blocker-panel cbv-card">' +
    '<h3>Blocker</h3><p class="cbv-muted">Phát hiện: <code>' + String(types).replace(/</g, '&lt;') + '</code></p>' +
    CbvExecFlow_buildBlockerResolutionHtml_(m) +
    '<p class="cbv-muted" style="font-size:12px;margin-top:8px">Hướng xử lý an toàn: chỉ đọc + phản hồi / AppSheet; không ghi đè audit nghiệp vụ từ WebApp.</p></section>'
  );
}

function CbvExecFlow_getTaskExecutionModel_(taskId) {
  var tid = String(taskId || '').trim();
  var dm = (typeof CbvStaffWorkspace_getTaskDetailModel_ === 'function') ? CbvStaffWorkspace_getTaskDetailModel_(tid) : { empty: true, task: null, timeline: [], warnings: [] };
  var warnings = [].concat(dm.warnings || []);
  if (dm.empty || !dm.task) {
    return {
      ok: true,
      empty: true,
      taskId: tid,
      task: null,
      detail: dm,
      blockers: ['UNKNOWN'],
      blockerResolutions: [CbvExecFlow_getBlockerResolution_('UNKNOWN')],
      urgencyExplanation: 'Không có task để phân tích.',
      operatorPrompt: CbvExecFlow_getOperatorPrompt_(null),
      nextAction: '—',
      timeline: [],
      warnings: warnings
    };
  }
  var task = dm.task;
  var blockers = CbvExecFlow_detectBlockers_(task);
  var resolutions = blockers.map(function (b) { return CbvExecFlow_getBlockerResolution_(b); });
  var nextAction = (typeof CbvDailyOp_getNextActionForTask_ === 'function') ? CbvDailyOp_getNextActionForTask_(task) : '';
  return {
    ok: true,
    empty: false,
    taskId: tid,
    task: task,
    detail: dm,
    blockers: blockers,
    blockerResolutions: resolutions,
    urgencyExplanation: CbvExecFlow_getUrgencyExplanation_(task),
    operatorPrompt: CbvExecFlow_getOperatorPrompt_(task),
    nextAction: nextAction,
    timeline: dm.timeline || [],
    warnings: warnings
  };
}

function CbvExecFlow_pickFocusTask_() {
  try {
    if (typeof CbvDailyOp_getUrgentItems_ === 'function') {
      var u = CbvDailyOp_getUrgentItems_('');
      if (u && u.length && u[0].taskId) return String(u[0].taskId);
    }
  } catch (eU) { /* */ }
  try {
    var inbox = (typeof CbvStaffWorkspace_getTaskInboxModel_ === 'function') ? CbvStaffWorkspace_getTaskInboxModel_('') : { inbox: [] };
    var first = (inbox.inbox || [])[0];
    if (first && first.taskId) return String(first.taskId);
  } catch (eI) { /* */ }
  return '';
}

function CbvExecFlow_getFocusModel_(taskId) {
  var tid = String(taskId || '').trim();
  if (!tid) tid = CbvExecFlow_pickFocusTask_();
  var exec = CbvExecFlow_getTaskExecutionModel_(tid);
  return {
    focusTaskId: tid,
    pickedAutomatically: !String(taskId || '').trim() && !!tid,
    execution: exec,
    hasTask: !!(exec && !exec.empty && exec.task)
  };
}

function CbvExecFlow_renderTaskExecutionBodyHtml_(params) {
  var p = params || {};
  var taskId = String(p.taskId || p.taskid || '').trim();
  var em = CbvExecFlow_getTaskExecutionModel_(taskId);
  var tk = em && em.task ? em.task : null;
  var m08Strip = '';
  if (typeof CbvOpsState_renderTaskContextStripHtml_ === 'function') {
    m08Strip = CbvOpsState_renderTaskContextStripHtml_({
      taskId: taskId,
      route: p.route || '/workspace/execution/task',
      __preflightState: p.__preflightState,
      traceId: (typeof CbvWebAppWorkspace__traceId_ === 'function') ? CbvWebAppWorkspace__traceId_() : '',
      status: tk ? tk.status : '',
      dueAt: tk ? (tk.dueAt || (tk.raw && tk.raw.dueAt)) : '',
      createdAt: tk && tk.raw ? tk.raw.createdAt : '',
      updatedAt: tk && tk.raw ? tk.raw.updatedAt : '',
      blockedSince: tk && tk.raw ? tk.raw.blockedSince : '',
      waitingSince: tk && tk.raw ? tk.raw.waitingSince : '',
      evidenceExpected: tk && tk.evidenceExpected,
      evidenceCount: tk && tk.evidenceCount
    });
  }
  var model = {
    exec: em,
    m08OpsStripHtml: m08Strip,
    actionZone: CbvExecFlow_buildExecutionActionZoneHtml_(em),
    summaryHtml: CbvExecFlow__buildSummaryHtml_(em),
    sopHtml: CbvExecFlow_buildInlineSopHtml_(em),
    timelineHtml: CbvExecFlow_buildMiniTimelineHtml_(em),
    blockerHtml: CbvExecFlow_buildBlockerPanelHtml_(em),
    cognitionHtml: CbvExecFlow_buildCognitionGuideHtml_(em),
    returnDailyHref: CbvExecFlow__href_('/workspace/daily')
  };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_OPERATION_EXECUTION_TASK');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = model;
    return { html: t.evaluate().getContent(), warnings: em.warnings || [] };
  } catch (e2) {
    return { html: '<p>Execution template missing.</p>', warnings: (em.warnings || []).concat([String(e2 && e2.message ? e2.message : e2)]) };
  }
}

function CbvExecFlow__buildSummaryHtml_(em) {
  var m = em || {};
  if (m.empty || !m.task) {
    return (
      '<section class="cbv-exec-summary cbv-card"><h3>Tóm tắt thực thi</h3>' +
      '<p class="cbv-muted">Chưa có task — thêm <code>?taskId=</code> hoặc quay Daily.</p></section>'
    );
  }
  var t = m.task;
  var blk = (m.blockers || []).join(', ');
  return (
    '<section class="cbv-exec-summary cbv-card">' +
    '<h3>EXECUTION SUMMARY</h3>' +
    '<div class="cbv-kv">' +
    '<div class="cbv-muted">taskId</div><div><code>' + String(t.taskId || '').replace(/</g, '&lt;') + '</code></div>' +
    '<div class="cbv-muted">title</div><div>' + String(t.title || '').replace(/</g, '&lt;') + '</div>' +
    '<div class="cbv-muted">status</div><div><span class="cbv-badge">' + String(t.status || '').replace(/</g, '&lt;') + '</span></div>' +
    '<div class="cbv-muted">priority</div><div>' + String(t.priority || '—').replace(/</g, '&lt;') + '</div>' +
    '<div class="cbv-muted">SLA</div><div>' + String(t.slaState || '—').replace(/</g, '&lt;') + '</div>' +
    '<div class="cbv-muted">Urgency</div><div>' + String(m.urgencyExplanation || '').replace(/</g, '&lt;') + '</div>' +
    '<div class="cbv-muted">Blocker types</div><div><code>' + String(blk).replace(/</g, '&lt;') + '</code></div>' +
    '<div class="cbv-muted">Next action</div><div>' + String(m.nextAction || '').replace(/</g, '&lt;') + '</div>' +
    '<div class="cbv-muted">Source</div><div>' + String(t.sourceModule || '').replace(/</g, '&lt;') + '</div>' +
    '<div class="cbv-muted">updatedAt</div><div>' + String((t.raw && t.raw.updatedAt) ? t.raw.updatedAt : '—').replace(/</g, '&lt;') + '</div>' +
    '<div class="cbv-muted">dueAt</div><div>' + String((t.raw && t.raw.dueAt) ? t.raw.dueAt : (t.dueAt || '—')).replace(/</g, '&lt;') + '</div>' +
    '</div></section>'
  );
}

function CbvExecFlow_renderTaskExecutionPage_(params) {
  return CbvExecFlow_renderTaskExecutionBodyHtml_(params || {});
}

function CbvExecFlow_renderFocusPage_(params) {
  var p = params || {};
  var fm = CbvExecFlow_getFocusModel_(p.taskId || p.taskid || '');
  var warnings = [].concat((fm.execution && fm.execution.warnings) || []);
  if (!fm.hasTask) {
    warnings.push('FOCUS_EMPTY: không có task ưu tiên trong phạm vi adapter.');
  }
  var execBody = fm.hasTask
    ? CbvExecFlow_renderTaskExecutionBodyHtml_({ taskId: fm.focusTaskId })
    : { html: '', warnings: [] };
  warnings = warnings.concat(execBody.warnings || []);
  var m07Bridge = (typeof CbvAppSheetLiveBridge_renderWorkboardRibbon_ === 'function')
    ? CbvAppSheetLiveBridge_renderWorkboardRibbon_({
      taskId: fm.focusTaskId,
      route: '/workspace/focus',
      source: 'focus',
      returnRoute: '/workspace/focus',
      __preflightState: fm.focusTaskId ? '' : 'MISSING_TASKID'
    })
    : '';
  var m08Focus = (typeof CbvOpsState_renderTodayDashboardHtml_ === 'function')
    ? CbvOpsState_renderTodayDashboardHtml_({
      taskId: fm.focusTaskId,
      route: '/workspace/focus',
      __preflightState: fm.focusTaskId ? '' : 'MISSING_TASKID',
      workboardCounts: {},
      workboardGroups: {}
    })
    : '';
  var model = {
    focus: fm,
    cockpitHtml: execBody.html || '',
    m07BridgeHtml: m07Bridge,
    m08FocusHtml: m08Focus,
    dailyHref: CbvExecFlow__href_('/workspace/daily'),
    focusHrefSelf: CbvExecFlow__href_('/workspace/focus' + (fm.focusTaskId ? '?taskId=' + encodeURIComponent(fm.focusTaskId) : ''))
  };
  try {
    var t = HtmlService.createTemplateFromFile('html/WEBAPP_OPERATION_FOCUS_MODE');
    t.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    t.MODEL = model;
    return { bodyHtml: t.evaluate().getContent(), warnings: warnings };
  } catch (e2) {
    return { bodyHtml: '<p>Focus template missing.</p>', warnings: warnings.concat([String(e2)]) };
  }
}

function CbvExecFlow__readHtmlRaw_(path) {
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

function CbvExecFlow_probeExecutionMarkersInProject_() {
  var need = [
    'cbv-exec-task-cockpit',
    'cbv-exec-action-zone',
    'cbv-exec-primary-cta',
    'cbv-exec-secondary-action',
    'cbv-exec-summary',
    'cbv-exec-inline-sop',
    'cbv-exec-sop-step',
    'cbv-exec-mini-timeline',
    'cbv-exec-blocker-panel',
    'cbv-exec-return-daily',
    'cbv-exec-focus-mode',
    'cbv-exec-focus-task',
    'cbv-exec-focus-reason',
    'cbv-exec-focus-next-step',
    'cbv-exec-focus-action-stack',
    'cbv-exec-focus-empty',
    'cbv-exec-action-stack',
    'cbv-exec-primary-action',
    'cbv-exec-safe-action',
    'cbv-exec-no-auto-mutation',
    'cbv-exec-blocker-type',
    'cbv-exec-blocker-reason',
    'cbv-exec-blocker-resolution',
    'cbv-exec-help-action',
    'cbv-exec-cognition-guide',
    'cbv-exec-why-urgent',
    'cbv-exec-now-do',
    'cbv-exec-if-blocked',
    'cbv-exec-safety-note',
    'cbv-sop-stepper'
  ];
  var files = [
    'html/WEBAPP_OPERATION_EXECUTION_TASK',
    'html/WEBAPP_OPERATION_FOCUS_MODE',
    'html/WEBAPP_WORKSPACE_COMPONENTS',
    'html/WEBAPP_WORKSPACE_SHELL'
  ];
  var combined = '';
  for (var i = 0; i < files.length; i++) {
    combined += CbvExecFlow__readHtmlRaw_(files[i]);
  }
  var missing = need.filter(function (x) { return combined.indexOf(x) < 0; });
  return { ok: missing.length === 0, missing: missing, combinedLen: combined.length };
}
