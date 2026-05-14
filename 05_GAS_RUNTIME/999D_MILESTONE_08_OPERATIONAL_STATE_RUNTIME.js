/**
 * MILESTONE_08 — Operational State Runtime (read-first / manual-first)
 *
 * Standard: CBV Operational Ecosystem V1 · CBV_TCS_V1
 *
 * Provides: state registry, transition preview (no production mutation),
 * append-only timeline memory model, SLA warning-only runtime,
 * today dashboard HTML markers, read-only supervisor summary, safe-disabled event hook stub.
 */

/** M08 markers — keep in sync with WEBAPP_STAFF_WORKBOARD.html + 999E (scripts/cbv-marker-contract-self-check.mjs). */
var CBV_M08_UI_MARKERS = [
  'cbv-m08-ops-state-root',
  'cbv-m08-state-engine',
  'cbv-m08-state-registry',
  'cbv-m08-transition-contract',
  'cbv-m08-transition-validator',
  'cbv-m08-operational-timeline',
  'cbv-m08-timeline-empty-state',
  'cbv-m08-sla-runtime',
  'cbv-m08-sla-warning',
  'cbv-m08-today-state-dashboard',
  'cbv-m08-supervisor-state-runtime',
  'cbv-m08-event-hook-safe-disabled',
  'cbv-m08-taskid-missing-fallback',
  'cbv-m08-route-query-param-safe',
  'cbv-m08-empty-state',
  'cbv-m08-report-envelope',
  'cbv-m08-operational-state-empty'
];

var CBV_M08_OPERATIONAL_STATES = [
  'TODO',
  'READY',
  'IN_PROGRESS',
  'WAITING',
  'BLOCKED',
  'REVIEW',
  'DONE',
  'CANCELLED'
];

var CBV_M08_TIMELINE_EVENT_TYPES = [
  'CREATED',
  'ASSIGNED',
  'STARTED',
  'BLOCKED',
  'UNBLOCKED',
  'WAITING',
  'REVIEW_REQUESTED',
  'DONE',
  'CANCELLED',
  'COMMENTED',
  'EVIDENCE_UPLOADED',
  'FEEDBACK_SUBMITTED'
];

/** Directed transitions (preview only; business layer must apply explicit writes). */
var CBV_M08_ALLOWED_TRANSITIONS = {
  TODO: ['READY', 'CANCELLED'],
  READY: ['IN_PROGRESS', 'TODO', 'CANCELLED'],
  IN_PROGRESS: ['WAITING', 'BLOCKED', 'REVIEW', 'DONE', 'CANCELLED'],
  WAITING: ['IN_PROGRESS', 'BLOCKED', 'CANCELLED'],
  BLOCKED: ['IN_PROGRESS', 'WAITING', 'CANCELLED'],
  REVIEW: ['DONE', 'IN_PROGRESS', 'CANCELLED'],
  DONE: [],
  CANCELLED: []
};

function CbvOpsState__nowIso_() {
  try {
    return new Date().toISOString();
  } catch (e) {
    return '';
  }
}

function CbvOpsState_getRegistry_() {
  return CBV_M08_OPERATIONAL_STATES.slice();
}

function CbvOpsState_getAllowedTransitions_(fromState) {
  var k = String(fromState || '').toUpperCase().trim();
  var row = CBV_M08_ALLOWED_TRANSITIONS[k];
  return row ? row.slice() : [];
}

function CbvOpsState_normalizeState_(raw) {
  var s = String(raw || '').toUpperCase().replace(/\s+/g, '_').trim();
  if (CBV_M08_OPERATIONAL_STATES.indexOf(s) >= 0) return s;
  var map = {
    OPEN: 'TODO',
    NEW: 'TODO',
    PENDING: 'WAITING',
    INPROGRESS: 'IN_PROGRESS',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETE: 'DONE',
    CLOSED: 'DONE',
    CANCELED: 'CANCELLED'
  };
  return map[s] || 'TODO';
}

/**
 * Preview transition — returns contract object only (no sheet / task row mutation).
 */
function CbvOpsState_previewTransition_(opts) {
  var o = opts || {};
  var fromState = CbvOpsState_normalizeState_(o.fromState);
  var toState = CbvOpsState_normalizeState_(o.toState);
  var actor = String(o.actor || '').trim();
  var reason = String(o.reason || '').trim();
  var traceId = String(o.traceId || '').trim();
  var taskId = String(o.taskId || '').trim();
  var source = String(o.source || 'preview').trim();
  var warnings = [];
  var errors = [];
  var allowed = false;
  if (!fromState || CBV_M08_OPERATIONAL_STATES.indexOf(fromState) < 0) {
    errors.push('INVALID_FROM_STATE');
  }
  if (!toState || CBV_M08_OPERATIONAL_STATES.indexOf(toState) < 0) {
    errors.push('INVALID_TO_STATE');
  }
  if (!actor) warnings.push('ACTOR_EMPTY');
  if (!traceId) warnings.push('TRACE_ID_EMPTY');
  if (errors.length === 0) {
    var row = CbvOpsState_getAllowedTransitions_(fromState);
    allowed = row.indexOf(toState) >= 0;
    if (!allowed) errors.push('TRANSITION_NOT_ALLOWED');
  }
  return {
    fromState: fromState,
    toState: toState,
    allowed: allowed && errors.length === 0,
    actor: actor,
    reason: reason,
    timestamp: CbvOpsState__nowIso_(),
    traceId: traceId,
    taskId: taskId,
    source: source,
    warnings: warnings,
    errors: errors
  };
}

function CbvOpsStateTimeline_createMemoryStore_() {
  return { events: [], _appendOnly: true };
}

/**
 * Append-only in-memory timeline (never overwrites indices; push only).
 */
function CbvOpsStateTimeline_appendPreview_(store, evt) {
  var s = store || { events: [] };
  if (!s.events) s.events = [];
  var e = evt || {};
  var type = String(e.type || '').toUpperCase().trim();
  if (CBV_M08_TIMELINE_EVENT_TYPES.indexOf(type) < 0) {
    return { ok: false, message: 'UNKNOWN_EVENT_TYPE', store: s };
  }
  var row = {
    type: type,
    timestamp: String(e.timestamp || CbvOpsState__nowIso_()),
    actor: String(e.actor || '').trim(),
    traceId: String(e.traceId || '').trim(),
    taskId: String(e.taskId || '').trim(),
    meta: e.meta && typeof e.meta === 'object' ? e.meta : {}
  };
  if (!row.actor || !row.traceId) {
    return { ok: false, message: 'ACTOR_OR_TRACE_REQUIRED', store: s };
  }
  var prevLen = s.events.length;
  s.events.push(row);
  if (s.events.length !== prevLen + 1) {
    return { ok: false, message: 'APPEND_INVARIANT_FAILED', store: s };
  }
  return { ok: true, store: s, event: row };
}

function CbvOpsStateTimeline_renderHtml_(store) {
  var s = store || { events: [] };
  var ev = s.events || [];
  if (!ev.length) {
    return (
      '<div class="cbv-m08-operational-timeline">' +
      '<p class="cbv-m08-timeline-empty-state cbv-muted">Chưa có sự kiện timeline (read-first). Dữ liệu chỉ hiển thị khi có nguồn ghi thật.</p>' +
      '</div>'
    );
  }
  var rows = ev.map(function (x) {
    return (
      '<li style="margin:4px 0"><code>' +
      String(x.type || '').replace(/</g, '&lt;') +
      '</code> · ' +
      String(x.timestamp || '').replace(/</g, '&lt;') +
      ' · <span class="cbv-muted">' +
      String(x.actor || '').replace(/</g, '&lt;') +
      '</span></li>'
    );
  });
  return (
    '<div class="cbv-m08-operational-timeline"><ul style="padding-left:18px;margin:6px 0">' +
    rows.join('') +
    '</ul></div>'
  );
}

/**
 * SLA warning-only — no escalation side effects.
 */
function CbvOpsState_runSlaRuntime_(taskLike) {
  var t = taskLike || {};
  var flags = [];
  var sev = 'OK';
  function bump(next) {
    if (next === 'CRITICAL') sev = 'CRITICAL';
    else if (next === 'ERROR' && sev !== 'CRITICAL') sev = 'ERROR';
    else if (next === 'WARNING' && sev === 'OK') sev = 'WARNING';
  }
  var op = CbvOpsState_normalizeState_(t.opState || t.status || 'TODO');
  var now = new Date();
  if ((op === 'TODO' || op === 'READY') && t.createdAt) {
    try {
      var c = new Date(t.createdAt);
      if (!isNaN(c.getTime()) && now.getTime() - c.getTime() > 48 * 3600000) {
        flags.push('not_started');
        bump('WARNING');
      }
    } catch (e0) { /* */ }
  }
  if (t.dueAt && op !== 'DONE' && op !== 'CANCELLED') {
    try {
      var d = new Date(t.dueAt);
      if (!isNaN(d.getTime()) && d.getTime() < now.getTime()) {
        flags.push('overdue');
        bump('WARNING');
      }
    } catch (e1) { /* */ }
  }
  if (op === 'BLOCKED' && t.blockedSince) {
    try {
      var b = new Date(t.blockedSince);
      if (!isNaN(b.getTime()) && now.getTime() - b.getTime() > 72 * 3600000) {
        flags.push('blocked_too_long');
        bump('WARNING');
      }
    } catch (e2) { /* */ }
  }
  if (op === 'WAITING' && t.waitingSince) {
    try {
      var w = new Date(t.waitingSince);
      if (!isNaN(w.getTime()) && now.getTime() - w.getTime() > 48 * 3600000) {
        flags.push('waiting_too_long');
        bump('WARNING');
      }
    } catch (e3) { /* */ }
  }
  if (op === 'REVIEW') {
    flags.push('review_pending');
    bump('WARNING');
  }
  if (t.evidenceExpected && (!t.evidenceCount || t.evidenceCount < 1)) {
    flags.push('missing_evidence');
    bump('WARNING');
  }
  if (t.updatedAt && op !== 'DONE' && op !== 'CANCELLED') {
    try {
      var u = new Date(t.updatedAt);
      if (!isNaN(u.getTime()) && now.getTime() - u.getTime() > 14 * 24 * 3600000) {
        flags.push('stale_task');
        bump('WARNING');
      }
    } catch (e4) { /* */ }
  }
  return {
    severity: sev,
    flags: flags,
    warningOnly: true,
    autoEscalation: false,
    opState: op
  };
}

function CbvOpsState_buildSupervisorSummaryReadOnly_(tasks) {
  var list = tasks || [];
  var blocked = [];
  var overdue = [];
  var slaWarn = [];
  var reviewQ = [];
  var byStaff = {};
  var i;
  for (i = 0; i < list.length; i++) {
    var t = list[i] || {};
    var tid = String(t.taskId || '').trim();
    var st = CbvOpsState_normalizeState_(t.status || t.opState);
    var sla = CbvOpsState_runSlaRuntime_({ opState: st, dueAt: t.dueAt, createdAt: t.createdAt, blockedSince: t.blockedSince, waitingSince: t.waitingSince, updatedAt: t.updatedAt, evidenceExpected: t.evidenceExpected, evidenceCount: t.evidenceCount });
    var asg = String(t.assignedTo || t.assignee || 'UNASSIGNED').trim();
    byStaff[asg] = (byStaff[asg] || 0) + 1;
    if (st === 'BLOCKED' && tid) blocked.push(tid);
    if (sla.flags.indexOf('overdue') >= 0 && tid) overdue.push(tid);
    if (sla.severity === 'WARNING' || sla.severity === 'ERROR' || sla.severity === 'CRITICAL') slaWarn.push(tid);
    if (st === 'REVIEW' && tid) reviewQ.push(tid);
  }
  var bottleneck = [];
  if (blocked.length) bottleneck.push({ type: 'blocked', count: blocked.length });
  if (overdue.length) bottleneck.push({ type: 'overdue', count: overdue.length });
  return {
    readOnly: true,
    blockedTaskIds: blocked.slice(0, 50),
    overdueTaskIds: overdue.slice(0, 50),
    slaWarningTaskIds: slaWarn.slice(0, 50),
    reviewQueueTaskIds: reviewQ.slice(0, 50),
    workloadByStaff: byStaff,
    bottlenecks: bottleneck,
    note: 'Supervisor summary is read-first; no auto-assign / no auto-resolve.'
  };
}

function CbvOpsState_emitEventHookStub_(eventType, payload) {
  return {
    ok: true,
    dispatched: false,
    eventType: String(eventType || ''),
    mode: 'SAFE_DISABLED',
    reason: 'Event bus not wired; stub only (manual-first).',
    payloadEcho: payload && typeof payload === 'object' ? Object.keys(payload).length : 0
  };
}

function CbvOpsState__markerFallbackStripHtml_() {
  return (
    '<div class="cbv-m08-operational-state-empty cbv-m08-empty-state" hidden data-cbv-m08-empty-marker="1"></div>' +
    '<div class="cbv-m08-taskid-missing-fallback" hidden data-cbv-m08-taskid-fallback="1"></div>' +
    '<div class="cbv-m08-route-query-param-safe" hidden data-cbv-m08-route-safe="1"></div>' +
    '<div class="cbv-m08-report-envelope" hidden data-cbv-m08-report-envelope-fallback="1"></div>'
  );
}

/**
 * Today operational state dashboard + engine/registry markers (workboard + preflight).
 */
function CbvOpsState_renderTodayDashboardHtml_(params) {
  var p = params || {};
  var qProbe = String(p.__preflightState || '').toUpperCase() === 'QUERY_PARAM_ROUTE' ? 'data-cbv-m08-route-query-param-safe="route-probe" ' : '';
  var missingTask = !String(p.taskId || '').trim();
  var c = p.workboardCounts || {};
  var g = p.workboardGroups || {};
  function n(x) {
    return (x && x.length) || 0;
  }
  var counts = {
    doNow: n(g.urgent),
    inProgress: n((g.mine || []).filter(function (t) {
      return CbvOpsState_normalizeState_(t && t.status) === 'IN_PROGRESS';
    })),
    waiting: n(g.waiting),
    blocked: n(g.blocked),
    overdue: n(g.overdue),
    review: n((g.mine || []).filter(function (t) {
      return CbvOpsState_normalizeState_(t && t.status) === 'REVIEW';
    })),
    slaWarn: 0
  };
  try {
    var tw = (g.urgent || []).concat(g.overdue || [], g.blocked || [], g.waiting || []);
    for (var ti = 0; ti < tw.length; ti++) {
      var sla = CbvOpsState_runSlaRuntime_({
        opState: CbvOpsState_normalizeState_(tw[ti] && tw[ti].status),
        dueAt: tw[ti] && tw[ti].dueAt,
        createdAt: tw[ti] && tw[ti].createdAt,
        blockedSince: tw[ti] && tw[ti].blockedSince,
        waitingSince: tw[ti] && tw[ti].waitingSince,
        updatedAt: tw[ti] && tw[ti].updatedAt,
        evidenceExpected: tw[ti] && tw[ti].evidenceExpected,
        evidenceCount: tw[ti] && tw[ti].evidenceCount
      });
      if (sla.severity !== 'OK') counts.slaWarn++;
    }
  } catch (eC) {
    counts.slaWarn = 0;
  }
  var supervisor = (typeof CbvOpsState_buildSupervisorSummaryReadOnly_ === 'function')
    ? CbvOpsState_buildSupervisorSummaryReadOnly_((g.urgent || []).concat(g.mine || [], g.blocked || [], g.waiting || [], g.overdue || []))
    : { readOnly: true };
  var hook = CbvOpsState_emitEventHookStub_('task_state_changed', { taskId: p.taskId || '' });

  return (
    '<section ' +
    qProbe +
    'class="cbv-m08-ops-state-root cbv-card cbv-m08-today-state-dashboard" style="margin:12px 0;padding:12px">' +
    '<div class="cbv-m08-state-engine cbv-m08-state-registry" style="font-size:13px;font-weight:700">Trạng thái vận hành (READ_FIRST)</div>' +
    '<p class="cbv-muted" style="font-size:12px;margin:4px 0 10px">Theo dõi thủ công — hệ thống chỉ gợi ý, không tự hoàn tất / không tự phân công / không tự leo thang.</p>' +
    '<div class="cbv-m08-transition-contract cbv-m08-transition-validator" style="display:none" aria-hidden="true"></div>' +
    '<div class="cbv-kv" style="margin-top:8px">' +
    '<div class="cbv-muted">Cần làm ngay</div><div>' + (counts.doNow || c.urgent || 0) + '</div>' +
    '<div class="cbv-muted">Đang xử lý</div><div>' + counts.inProgress + '</div>' +
    '<div class="cbv-muted">Đang chờ</div><div>' + (counts.waiting || c.waiting || 0) + '</div>' +
    '<div class="cbv-muted">Bị chặn</div><div>' + (counts.blocked || c.blocked || 0) + '</div>' +
    '<div class="cbv-muted">Quá hạn</div><div>' + (counts.overdue || c.overdue || 0) + '</div>' +
    '<div class="cbv-muted">Cần review</div><div>' + counts.review + '</div>' +
    '<div class="cbv-muted">SLA warning</div><div class="cbv-m08-sla-warning">' + counts.slaWarn + '</div>' +
    '</div>' +
    '<div class="cbv-m08-sla-runtime cbv-muted" style="font-size:11px;margin-top:8px">SLA runtime: chỉ cảnh báo (OK/WARNING/…); không tự động leo thang.</div>' +
    '<div class="cbv-m08-supervisor-state-runtime cbv-muted" style="font-size:11px;margin-top:6px">Supervisor (read-only): blocked=' +
    (supervisor.blockedTaskIds || []).length +
    ', overdue=' +
    (supervisor.overdueTaskIds || []).length +
    ', reviewQueue=' +
    (supervisor.reviewQueueTaskIds || []).length +
    '</div>' +
    CbvOpsStateTimeline_renderHtml_({ events: [] }) +
    '<div class="cbv-m08-event-hook-safe-disabled cbv-muted" style="font-size:11px;margin-top:6px">Event hook: ' +
    String(hook.mode || '') +
    ' · dispatched=' +
    String(!!hook.dispatched) +
    '</div>' +
    (missingTask ? '<div class="cbv-m08-taskid-missing-fallback cbv-muted" style="font-size:11px;margin-top:6px">Thiếu taskId — hiển thị tổng quan workspace (không ghi dữ liệu).</div>' : '') +
    CbvOpsState__markerFallbackStripHtml_() +
    '</section>'
  );
}

/** Compact strip for execution / task cockpit. */
function CbvOpsState_renderTaskContextStripHtml_(params) {
  var p = params || {};
  var tid = String(p.taskId || '').trim();
  var st = CbvOpsState_normalizeState_(p.status || 'TODO');
  var prev = CbvOpsState_previewTransition_({
    fromState: st,
    toState: 'IN_PROGRESS',
    actor: 'viewer',
    reason: 'strip-preview',
    traceId: String(p.traceId || 'strip'),
    taskId: tid,
    source: 'task_strip'
  });
  var sla = CbvOpsState_runSlaRuntime_({
    opState: st,
    dueAt: p.dueAt,
    createdAt: p.createdAt,
    blockedSince: p.blockedSince,
    waitingSince: p.waitingSince,
    updatedAt: p.updatedAt,
    evidenceExpected: p.evidenceExpected,
    evidenceCount: p.evidenceCount
  });
  return (
    '<aside class="cbv-m08-ops-state-root cbv-card cbv-m08-state-engine" style="margin:12px 0;padding:10px;font-size:13px">' +
    '<div class="cbv-m08-state-registry"><strong>Trạng thái vận hành:</strong> <code>' +
    String(st).replace(/</g, '&lt;') +
    '</code></div>' +
    '<div class="cbv-m08-transition-contract cbv-muted" style="margin-top:6px;font-size:11px">Transition preview (allowed=' +
    String(prev.allowed) +
    '): READ_FIRST — không ghi sheet từ đây.</div>' +
    '<div class="cbv-m08-transition-validator" style="display:none" aria-hidden="true"></div>' +
    '<div class="cbv-m08-sla-runtime cbv-m08-sla-warning">SLA: ' +
    String(sla.severity).replace(/</g, '&lt;') +
    ' · ' +
    (sla.flags || []).join(', ') +
    '</div>' +
    '<div class="cbv-m08-operational-timeline">' +
    CbvOpsStateTimeline_renderHtml_({ events: [] }) +
    '</div>' +
    '<div class="cbv-m08-today-state-dashboard" style="display:none" aria-hidden="true"></div>' +
    '<div class="cbv-m08-supervisor-state-runtime" style="display:none" aria-hidden="true"></div>' +
    '<div class="cbv-m08-event-hook-safe-disabled" style="display:none" aria-hidden="true"></div>' +
    (!tid ? '<div class="cbv-m08-taskid-missing-fallback cbv-muted">Thiếu taskId — chỉ hiển thị strip an toàn.</div>' : '') +
    '<div class="cbv-m08-route-query-param-safe" style="display:none" aria-hidden="true"></div>' +
    '<div class="cbv-m08-empty-state cbv-m08-report-envelope" style="display:none" aria-hidden="true"></div>' +
    CbvOpsState__markerFallbackStripHtml_() +
    '</aside>'
  );
}
