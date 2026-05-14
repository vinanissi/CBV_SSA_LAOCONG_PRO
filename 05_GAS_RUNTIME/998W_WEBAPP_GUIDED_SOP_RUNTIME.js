/**
 * MILESTONE_05 — Guided SOP Runtime (read-first registry + step engine + stepper UI)
 *
 * In-code SOP template registry only (no sheet writes). No auto-advance / auto-complete.
 * CTAs are safe navigation only. Step validation is warning-only (no hard mutation).
 *
 * Depends: 998U helpers optional (CbvExecFlow_detectBlockers_, CbvExecFlow__href_); 998H/998O for URLs.
 */

function CbvGuidedSop__href_(route) {
  var r = String(route || '').trim();
  if (typeof CbvExecFlow__href_ === 'function') {
    try {
      return CbvExecFlow__href_(r);
    } catch (e0) { /* */ }
  }
  if (typeof CbvWebAppOpUx_buildRouteUrl_ === 'function') {
    try {
      return CbvWebAppOpUx_buildRouteUrl_(r);
    } catch (e1) { /* */ }
  }
  return r || '#';
}

function CbvGuidedSop__escapeHtml_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function CbvGuidedSop__blockersForTask_(task) {
  if (typeof CbvExecFlow_detectBlockers_ === 'function') {
    try {
      return CbvExecFlow_detectBlockers_(task || {});
    } catch (eB) {
      return ['UNKNOWN'];
    }
  }
  return ['UNKNOWN'];
}

function CbvGuidedSop__sortSteps_(steps) {
  var arr = (steps || []).slice();
  arr.sort(function (a, b) {
    return (Number(a.order) || 0) - (Number(b.order) || 0);
  });
  return arr;
}

function CbvGuidedSop_getTemplateRegistry_() {
  return [
    {
      templateId: 'DEFAULT_TASK_SOP',
      title: 'SOP xử lý task cơ bản',
      appliesTo: { sourceModule: '*', taskType: '*', priority: '*' },
      steps: [
        {
          stepId: 'CHECK_DATA',
          order: 1,
          title: 'Kiểm tra dữ liệu',
          instruction: 'Đọc nội dung task và xác định thiếu gì.',
          ctaLabel: 'Mở chi tiết',
          ctaRoute: '/workspace/staff/task-detail',
          requiredSignals: [],
          blockerHints: [],
          manualOnly: true
        },
        {
          stepId: 'ADD_EVIDENCE',
          order: 2,
          title: 'Bổ sung chứng từ',
          instruction: 'Thu thập chứng từ theo SOP đơn vị; kênh ghi chính là AppSheet (WebApp pilot chỉ đọc).',
          ctaLabel: 'Mở phản hồi',
          ctaRoute: '/workspace/staff/feedback',
          requiredSignals: [],
          blockerHints: [],
          manualOnly: true
        },
        {
          stepId: 'CONFIRM_FLOW',
          order: 3,
          title: 'Gửi xác nhận',
          instruction: 'Theo dõi bước xác nhận trên AppSheet / quy trình nội bộ.',
          ctaLabel: 'Mở quy trình',
          ctaRoute: '/workspace/guided',
          requiredSignals: [],
          blockerHints: [],
          manualOnly: true
        },
        {
          stepId: 'REPORT_STUCK',
          order: 4,
          title: 'Báo kẹt nếu thiếu dữ liệu',
          instruction: 'Khi thiếu dữ liệu hoặc không rõ bước tiếp — gửi phản hồi an toàn.',
          ctaLabel: 'Báo kẹt',
          ctaRoute: '/workspace/staff/feedback',
          requiredSignals: [],
          blockerHints: ['BLOCKED_STATUS', 'UNKNOWN', 'NEED_SUPPORT'],
          manualOnly: true
        }
      ]
    },
    {
      templateId: 'SLA_BREACH_SOP',
      title: 'SOP xử lý khi quá hạn SLA',
      appliesTo: { sourceModule: '*', taskType: '*', priority: '*' },
      steps: [
        {
          stepId: 'HANDLE_SLA',
          order: 1,
          title: 'Xử lý ưu tiên SLA',
          instruction: 'Task đang quá hạn — ưu tiên đọc lại SLA, due và phạm vi xử lý trước khi chuyển bước.',
          ctaLabel: 'Mở Focus',
          ctaRoute: '/workspace/focus',
          requiredSignals: [],
          blockerHints: ['SLA_BREACH'],
          manualOnly: true
        },
        {
          stepId: 'CHECK_DATA',
          order: 2,
          title: 'Kiểm tra dữ liệu',
          instruction: 'Đối chiếu dữ liệu tối thiểu để xử lý SLA (read-first).',
          ctaLabel: 'Mở chi tiết',
          ctaRoute: '/workspace/staff/task-detail',
          requiredSignals: [],
          blockerHints: [],
          manualOnly: true
        },
        {
          stepId: 'REPORT_STUCK',
          order: 3,
          title: 'Báo kẹt / cần hỗ trợ',
          instruction: 'Nếu không đủ quyền hoặc thiếu dữ liệu — dùng phản hồi an toàn.',
          ctaLabel: 'Cần hỗ trợ',
          ctaRoute: '/workspace/staff/feedback',
          requiredSignals: [],
          blockerHints: ['NEED_SUPPORT'],
          manualOnly: true
        }
      ]
    },
    {
      templateId: 'MISSING_DATA_SOP',
      title: 'SOP khi thiếu dữ liệu',
      appliesTo: { sourceModule: '*', taskType: '*', priority: '*' },
      steps: [
        {
          stepId: 'SUPPLY_DATA',
          order: 1,
          title: 'Bổ sung dữ liệu',
          instruction: 'Xác định trường thiếu và bổ sung trên kênh ghi chính (AppSheet).',
          ctaLabel: 'Mở chi tiết',
          ctaRoute: '/workspace/staff/task-detail',
          requiredSignals: [],
          blockerHints: ['MISSING_DATA'],
          manualOnly: true
        },
        {
          stepId: 'CHECKLIST',
          order: 2,
          title: 'Xem checklist',
          instruction: 'Đối chiếu checklist nội bộ trước khi sang bước tiếp.',
          ctaLabel: 'Xem checklist',
          ctaRoute: '/workspace/guided',
          requiredSignals: [],
          blockerHints: [],
          manualOnly: true
        },
        {
          stepId: 'REPORT_STUCK',
          order: 3,
          title: 'Báo kẹt nếu vẫn thiếu',
          instruction: 'Nếu không thể bổ sung — báo kẹt kèm taskId.',
          ctaLabel: 'Báo kẹt',
          ctaRoute: '/workspace/staff/feedback',
          requiredSignals: [],
          blockerHints: ['BLOCKED_STATUS'],
          manualOnly: true
        }
      ]
    }
  ];
}

function CbvGuidedSop_getDefaultTemplate_() {
  var all = CbvGuidedSop_getTemplateRegistry_();
  for (var i = 0; i < all.length; i++) {
    if (all[i].templateId === 'DEFAULT_TASK_SOP') return all[i];
  }
  return all[0] || null;
}

function CbvGuidedSop_listTemplates_() {
  return CbvGuidedSop_getTemplateRegistry_().map(function (t) {
    return t.templateId;
  });
}

function CbvGuidedSop_validateTemplate_(template) {
  var errs = [];
  var t = template || {};
  if (!t.templateId) errs.push('missing templateId');
  if (!t.title) errs.push('missing title');
  if (!Array.isArray(t.steps) || !t.steps.length) errs.push('missing steps');
  var seen = {};
  for (var i = 0; i < (t.steps || []).length; i++) {
    var s = t.steps[i] || {};
    if (!s.stepId) errs.push('step ' + i + ' missing stepId');
    if (typeof s.order !== 'number') errs.push('step ' + i + ' missing numeric order');
    if (!s.title) errs.push('step ' + i + ' missing title');
    if (!s.instruction) errs.push('step ' + i + ' missing instruction');
    if (!s.ctaLabel) errs.push('step ' + i + ' missing ctaLabel');
    if (!s.ctaRoute) errs.push('step ' + i + ' missing ctaRoute');
    if (s.manualOnly !== true) errs.push('step ' + i + ' manualOnly must be true');
    if (s.stepId) seen[s.stepId] = true;
  }
  return { ok: errs.length === 0, errors: errs };
}

function CbvGuidedSop_getTemplateForTask_(task) {
  var blockers = CbvGuidedSop__blockersForTask_(task);
  var reg = CbvGuidedSop_getTemplateRegistry_();
  var pick = function (id) {
    for (var i = 0; i < reg.length; i++) {
      if (reg[i].templateId === id) return reg[i];
    }
    return CbvGuidedSop_getDefaultTemplate_();
  };
  if (blockers.indexOf('SLA_BREACH') >= 0) return pick('SLA_BREACH_SOP');
  if (blockers.indexOf('MISSING_DATA') >= 0) return pick('MISSING_DATA_SOP');
  return pick('DEFAULT_TASK_SOP');
}

function CbvGuidedSop__pickCurrentStepFromTemplate_(task, template) {
  var t = template || CbvGuidedSop_getDefaultTemplate_();
  var steps = CbvGuidedSop__sortSteps_(t.steps || []);
  var blockers = CbvGuidedSop__blockersForTask_(task);
  var priority = ['SLA_BREACH', 'MISSING_DATA', 'BLOCKED_STATUS', 'NEED_SUPPORT', 'UNASSIGNED', 'UNKNOWN'];

  function stepMatchesBlocker(step, blocker) {
    var hints = step.blockerHints || [];
    for (var h = 0; h < hints.length; h++) {
      if (String(hints[h]).toUpperCase() === String(blocker).toUpperCase()) return true;
    }
    return false;
  }

  for (var p = 0; p < priority.length; p++) {
    var b = priority[p];
    if (blockers.indexOf(b) < 0) continue;
    for (var i = 0; i < steps.length; i++) {
      if (stepMatchesBlocker(steps[i], b)) return steps[i];
    }
  }

  if (blockers.indexOf('BLOCKED_STATUS') >= 0) {
    for (var j = 0; j < steps.length; j++) {
      if (steps[j].stepId === 'REPORT_STUCK') return steps[j];
    }
  }

  return steps[0] || null;
}

function CbvGuidedSop_getCurrentStep_(task, template) {
  var tpl = template || CbvGuidedSop_getTemplateForTask_(task);
  return CbvGuidedSop__pickCurrentStepFromTemplate_(task, tpl);
}

function CbvGuidedSop_getNextStep_(task, template) {
  var tpl = template || CbvGuidedSop_getTemplateForTask_(task);
  var steps = CbvGuidedSop__sortSteps_(tpl.steps || []);
  var cur = CbvGuidedSop_getCurrentStep_(task, tpl);
  if (!cur) return null;
  var co = Number(cur.order) || 0;
  for (var i = 0; i < steps.length; i++) {
    if ((Number(steps[i].order) || 0) > co) return steps[i];
  }
  return null;
}

function CbvGuidedSop_detectBlockedStep_(task, template) {
  var tpl = template || CbvGuidedSop_getTemplateForTask_(task);
  var blockers = CbvGuidedSop__blockersForTask_(task);
  if (!blockers.length || (blockers.length === 1 && blockers[0] === 'UNKNOWN')) return null;
  return CbvGuidedSop_getCurrentStep_(task, tpl);
}

function CbvGuidedSop_getStepState_(task, template) {
  var tpl = template || CbvGuidedSop_getTemplateForTask_(task);
  var steps = CbvGuidedSop__sortSteps_(tpl.steps || []);
  var cur = CbvGuidedSop_getCurrentStep_(task, tpl);
  var nxt = CbvGuidedSop_getNextStep_(task, tpl);
  var blk = CbvGuidedSop_detectBlockedStep_(task, tpl);
  var out = {};
  var curId = cur && cur.stepId;
  var nxtId = nxt && nxt.stepId;
  var blkId = blk && blk.stepId;
  var curOrder = cur ? Number(cur.order) || 0 : -1;

  if (!curId) {
    for (var z = 0; z < steps.length; z++) {
      out[steps[z].stepId] = 'TODO';
    }
    return out;
  }

  for (var i = 0; i < steps.length; i++) {
    var sid = steps[i].stepId;
    var ord = Number(steps[i].order) || 0;
    if (sid === curId) out[sid] = 'CURRENT';
    else if (sid === nxtId) out[sid] = 'READY';
    else if (blkId && sid === blkId && sid !== curId) out[sid] = 'BLOCKED';
    else if (curId && ord < curOrder) out[sid] = 'DONE_SAFE_PLACEHOLDER';
    else if (curId && sid !== curId && ord > curOrder) out[sid] = 'WAITING_INFO';
    else out[sid] = 'TODO';
  }
  return out;
}

function CbvGuidedSop_validateStepReadiness_(task, step) {
  var warnings = [];
  var blockers = CbvGuidedSop__blockersForTask_(task);
  if (blockers.indexOf('MISSING_DATA') >= 0) {
    warnings.push('Thiếu dữ liệu — chưa nên chuyển bước (chỉ hướng dẫn, không khóa thao tác).');
  }
  if (blockers.indexOf('SLA_BREACH') >= 0) {
    warnings.push('Quá hạn SLA — ưu tiên xử lý ngay (read-first).');
  }
  if (blockers.indexOf('UNASSIGNED') >= 0) {
    warnings.push('Chưa có người phụ trách — kiểm tra phân công trên AppSheet.');
  }
  if (blockers.indexOf('UNKNOWN') >= 0 && blockers.length === 1) {
    warnings.push('Chưa đủ tín hiệu — mở chi tiết để kiểm tra.');
  }
  var st = step || {};
  var nxt = CbvGuidedSop_getNextStep_(task, CbvGuidedSop_getTemplateForTask_(task));
  if (nxt && st.stepId && nxt.stepId && st.stepId !== nxt.stepId) {
    /* readiness toward next is informational only */
  }
  return { ok: true, warnings: warnings, readOnly: true };
}

function CbvGuidedSop_getStepWarnings_(task, step) {
  var r = CbvGuidedSop_validateStepReadiness_(task, step);
  return (r && r.warnings) ? r.warnings.slice() : [];
}

function CbvGuidedSop_buildStepWarningHtml_(warnings) {
  var w = warnings || [];
  if (!w.length) {
    return '<div class="cbv-sop-readiness-warning cbv-sop-not-hard-block cbv-sop-read-first cbv-muted" style="font-size:13px">Không có cảnh báo thêm cho bước này.</div>';
  }
  var rows = w.map(function (x) {
    return '<li class="cbv-sop-step-warning">' + CbvGuidedSop__escapeHtml_(x) + '</li>';
  }).join('');
  return (
    '<ul class="cbv-sop-readiness-warning cbv-sop-not-hard-block cbv-sop-read-first" style="margin:0;padding-left:18px">' +
    rows +
    '</ul>'
  );
}

function CbvGuidedSop_getStepCta_(step, task) {
  var s = step || {};
  var t = task || {};
  var id = String(t.taskId || '').trim();
  var route = String(s.ctaRoute || '/workspace').trim();
  var href = route;
  if (route.indexOf('/workspace/staff/task-detail') === 0 || route.indexOf('/staff/task-detail') === 0) {
    href = id ? (route + (route.indexOf('?') >= 0 ? '&' : '?') + 'taskId=' + encodeURIComponent(id)) : route;
  } else if (route.indexOf('/workspace/focus') === 0 || route.indexOf('/focus') === 0) {
    href = id ? (route + (route.indexOf('?') >= 0 ? '&' : '?') + 'taskId=' + encodeURIComponent(id)) : route;
  } else if (route.indexOf('/workspace/staff/feedback') === 0 || route.indexOf('/staff/feedback') === 0) {
    var q = [];
    if (id) q.push('taskId=' + encodeURIComponent(id));
    var lbl = String(s.ctaLabel || '');
    var fbType = 'STUCK';
    if (lbl.toLowerCase().indexOf('hỗ trợ') >= 0) fbType = 'SUPERVISOR_HELP';
    q.push('type=' + encodeURIComponent(fbType));
    href = route + '?' + q.join('&');
  } else if (route.indexOf('/workspace/sop') === 0 || route.indexOf('/sop') === 0) {
    href = id ? route + (route.indexOf('?') >= 0 ? '&' : '?') + 'taskId=' + encodeURIComponent(id) : route;
  }
  return {
    label: String(s.ctaLabel || 'Mở'),
    href: CbvGuidedSop__href_(href),
    route: route,
    manualOnly: true
  };
}

function CbvGuidedSop_buildStepCtaHtml_(step, task) {
  var c = CbvGuidedSop_getStepCta_(step, task);
  return (
    '<a class="cbv-sop-step-cta cbv-busy-link cbv-btn-operational" href="' +
    CbvGuidedSop__escapeHtml_(c.href).replace(/"/g, '&quot;') +
    '" data-route="' + CbvGuidedSop__escapeHtml_(c.route).replace(/"/g, '&quot;') + '">' +
    CbvGuidedSop__escapeHtml_(c.label) +
    '</a>'
  );
}

function CbvGuidedSop_buildStepCardHtml_(step, task, stateMap) {
  var s = step || {};
  var st = (stateMap && stateMap[s.stepId]) ? stateMap[s.stepId] : 'TODO';
  var cta = CbvGuidedSop_buildStepCtaHtml_(s, task);
  var warn = CbvGuidedSop_buildStepWarningHtml_(CbvGuidedSop_getStepWarnings_(task, s));
  var manual = s.manualOnly === true ? 'true' : 'false';
  return (
    '<article class="cbv-sop-step-card cbv-exec-sop-step cbv-card" data-step-id="' + CbvGuidedSop__escapeHtml_(s.stepId) + '" style="margin-bottom:10px">' +
    '<header style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">' +
    '<div><div class="cbv-muted" style="font-size:12px">Bước ' + CbvGuidedSop__escapeHtml_(String(s.order)) + '</div>' +
    '<h4 style="margin:4px 0">' + CbvGuidedSop__escapeHtml_(s.title) + '</h4></div>' +
    '<span class="cbv-sop-step-state cbv-badge" data-state="' + CbvGuidedSop__escapeHtml_(st) + '">' + CbvGuidedSop__escapeHtml_(st) + '</span>' +
    '</header>' +
    '<p class="cbv-muted" style="font-size:14px;margin:6px 0">' + CbvGuidedSop__escapeHtml_(s.instruction) + '</p>' +
    '<div class="cbv-sop-manual-only cbv-muted" style="font-size:12px;margin-bottom:6px" data-manual-only="' + manual + '">Thủ công — hệ thống không tự chuyển bước.</div>' +
    '<div class="cbv-sop-warning">' + warn + '</div>' +
    '<div style="margin-top:8px">' + cta + '</div>' +
    '</article>'
  );
}

function CbvGuidedSop_buildCurrentStepBannerHtml_(flowModel) {
  var fm = flowModel || {};
  var cur = fm.currentStep || {};
  var nxt = fm.nextStep || {};
  var reasonParts = [];
  var rw = CbvGuidedSop_validateStepReadiness_(fm.task || {}, cur);
  if (rw && rw.warnings && rw.warnings.length) reasonParts = reasonParts.concat(rw.warnings);
  if (nxt && nxt.title) {
    reasonParts.push('Bước tiếp theo gợi ý: ' + nxt.title + ' (chỉ khi đã xử lý xong bước hiện tại theo quy trình).');
  }
  return (
    '<div class="cbv-sop-current-step cbv-card" style="margin-bottom:10px;border-left:4px solid #2563eb">' +
    '<div class="cbv-muted" style="font-size:12px">Bước hiện tại</div>' +
    '<div style="font-size:16px;font-weight:700">' + CbvGuidedSop__escapeHtml_(cur.title || '—') + '</div>' +
    '<p class="cbv-muted" style="font-size:13px;margin:6px 0">' + CbvGuidedSop__escapeHtml_(cur.instruction || '') + '</p>' +
    '<div class="cbv-sop-next-step cbv-muted" style="font-size:13px"><strong>Bước tiếp theo:</strong> ' +
    CbvGuidedSop__escapeHtml_(nxt.title || '—') + '</div>' +
    '<div class="cbv-sop-warning" style="margin-top:8px"><strong>Vì sao chưa nên qua bước sau?</strong> ' +
    CbvGuidedSop__escapeHtml_(reasonParts.join(' ')) + '</div>' +
    '</div>'
  );
}

function CbvGuidedSop_buildStepValidationHtml_(flowModel) {
  var fm = flowModel || {};
  var cur = fm.currentStep || {};
  var w = CbvGuidedSop_getStepWarnings_(fm.task || {}, cur);
  return '<div class="cbv-sop-validation cbv-sop-read-first">' + CbvGuidedSop_buildStepWarningHtml_(w) + '</div>';
}

function CbvGuidedSop_buildStepperHtml_(flowModel) {
  var fm = flowModel || {};
  var tpl = fm.template || CbvGuidedSop_getDefaultTemplate_();
  var steps = CbvGuidedSop__sortSteps_(tpl.steps || []);
  var stateMap = fm.stepStates || CbvGuidedSop_getStepState_(fm.task, tpl);
  var cards = steps.map(function (st) {
    return CbvGuidedSop_buildStepCardHtml_(st, fm.task, stateMap);
  }).join('');
  var tid = CbvGuidedSop__escapeHtml_(tpl.templateId || '');
  return (
    '<div class="cbv-sop-stepper" data-cbv-sop-template-id="' + tid + '">' +
    '<div class="cbv-sop-template-id cbv-muted" style="font-size:12px;margin-bottom:6px">SOP áp dụng: <code>' + tid + '</code> — ' +
    CbvGuidedSop__escapeHtml_(tpl.title || '') + '</div>' +
    cards +
    '</div>'
  );
}

function CbvGuidedSop_buildStepFlowModel_(task) {
  var warnings = [];
  var errors = [];
  var template = CbvGuidedSop_getTemplateForTask_(task);
  var v = CbvGuidedSop_validateTemplate_(template);
  if (!v.ok) errors = errors.concat(v.errors || []);

  var currentStep = CbvGuidedSop_getCurrentStep_(task, template);
  var nextStep = CbvGuidedSop_getNextStep_(task, template);
  var blockedStep = CbvGuidedSop_detectBlockedStep_(task, template);
  var stepStates = CbvGuidedSop_getStepState_(task, template);

  var stepsOut = CbvGuidedSop__sortSteps_(template.steps || []).map(function (s) {
    var cta = CbvGuidedSop_getStepCta_(s, task);
    var st = stepStates[s.stepId] || 'TODO';
    var sw = CbvGuidedSop_getStepWarnings_(task, s);
    var reason = '';
    if (st === 'CURRENT' && sw.length) reason = sw.join(' ');
    return {
      stepId: s.stepId,
      order: s.order,
      title: s.title,
      instruction: s.instruction,
      state: st,
      ctaLabel: cta.label,
      ctaHref: cta.href,
      reason: reason,
      manualOnly: true
    };
  });

  warnings = warnings.concat(CbvGuidedSop_getStepWarnings_(task, currentStep));

  return {
    template: template,
    currentStep: currentStep,
    nextStep: nextStep,
    blockedStep: blockedStep,
    steps: stepsOut,
    stepStates: stepStates,
    warnings: warnings,
    errors: errors,
    task: task || null
  };
}

function CbvGuidedSop_renderGuidedSopPage_(params) {
  var p = params || {};
  var taskId = String(p.taskId || p.taskid || '').trim();
  var task = null;
  if (taskId && typeof CbvStaffWorkspace_getTaskDetailModel_ === 'function') {
    try {
      var dm = CbvStaffWorkspace_getTaskDetailModel_(taskId);
      if (dm && dm.task) task = dm.task;
      else task = null;
    } catch (eT) {
      task = null;
    }
  }
  var flow = CbvGuidedSop_buildStepFlowModel_(task);
  var wExtra = [].concat(flow.warnings || []);
  if (taskId && !task) wExtra.push('READ_FIRST_NO_TASK_MATCH: không tải được task cho taskId trong query — hiển thị SOP demo read-first.');
  flow.warnings = wExtra;
  var stepper = CbvGuidedSop_buildStepperHtml_(flow);
  var banner = CbvGuidedSop_buildCurrentStepBannerHtml_(flow);
  var val = CbvGuidedSop_buildStepValidationHtml_(flow);
  var model = {
    taskId: taskId,
    bannerHtml: banner,
    validationHtml: val,
    stepperHtml: stepper,
    dailyHref: CbvGuidedSop__href_('/workspace/daily')
  };
  try {
    var tpl = HtmlService.createTemplateFromFile('html/WEBAPP_GUIDED_SOP_RUNTIME');
    tpl.COMPONENTS = HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    tpl.MODEL = model;
    return { bodyHtml: tpl.evaluate().getContent(), warnings: [].concat(flow.warnings || []) };
  } catch (e2) {
    return {
      bodyHtml: '<section class="cbv-sop-stepper" data-cbv-sop-template-id="FALLBACK"><p>Guided SOP template missing.</p></section>',
      warnings: [String(e2 && e2.message ? e2.message : e2)]
    };
  }
}
