/**
 * PHASE_RF_04 — Observation Runtime Core v1
 *
 * Read-first operational observation: health, projections, queues, sync stub, audit, alerts.
 * No auto-resolve. No auto-escalate. No schema change.
 */

var CBV_RF04_PHASE_ID = 'PHASE_RF_04_OBSERVATION_RUNTIME';
var CBV_RF04_CONTRACT_VERSION = 'CBV_RF04_V1';

function CBV_Observation__safeEnvelope_(payload) {
  var p = payload || {};
  return {
    ok: p.ok !== false,
    phase: CBV_RF04_PHASE_ID,
    contractVersion: CBV_RF04_CONTRACT_VERSION,
    empty: p.empty === true,
    data: p.data != null ? p.data : null,
    warnings: p.warnings || [],
    errors: p.errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CBV_Observation__href_(path, params) {
  if (typeof CBV_Coordination__href_ === 'function') return CBV_Coordination__href_(path, params);
  if (typeof CbvRf02__routeHref_ === 'function') return CbvRf02__routeHref_(path, params);
  return path;
}

function CBV_Observation__assertView_(ctx) {
  CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.OBSERVATION_VIEW, null);
}

function CBV_Observation__canTeamObserve_(ctx) {
  return CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.COORDINATION_TEAM_VIEW, null);
}

function CBV_Observation__healthRow_(module, ok, status, severity, message, nextStep) {
  return {
    module: module,
    ok: ok === true,
    status: status || (ok ? 'OK' : 'WARN'),
    severity: severity || (ok ? 'OK' : 'WARNING'),
    message: message || '',
    nextStep: nextStep || '',
    checkedAt: new Date().toISOString()
  };
}

/**
 * Runtime Health v1 — probe RF_02/RF_03 modules.
 */
function CBV_Observation_getRuntimeHealth_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var warnings = (ctx.warnings || []).slice();
  var modules = [];

  try {
    CBV_Observation__assertView_(ctx);
  } catch (ePerm) {
    return CBV_Observation__safeEnvelope_({
      ok: false,
      empty: true,
      data: { modules: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  modules.push(CBV_Observation__healthRow_('PERMISSION', true, 'OK', 'OK', 'Permission runtime loaded', '—'));
  if (ctx.role === 'VIEW_ONLY' && (ctx.warnings || []).indexOf('NO_ACTIVE_USER_EMAIL — fallback VIEW_ONLY') >= 0) {
    modules.push(CBV_Observation__healthRow_('PERMISSION', false, 'FALLBACK', 'WARNING', 'VIEW_ONLY fallback active', 'Kiểm tra USER_DIRECTORY'));
  }

  var tl = typeof CbvRf02TaskList_getModel_ === 'function' ? CbvRf02TaskList_getModel_(ctx, 'mine') : null;
  modules.push(CBV_Observation__healthRow_('WORKBOARD', !!(tl && tl.ok), tl && tl.ok ? 'OK' : 'WARN', tl && tl.ok ? 'OK' : 'WARNING', tl && tl.ok ? 'Task list projection OK' : 'Task list issue', 'Mở workboard tasks'));

  modules.push(CBV_Observation__healthRow_('TASK', !!(tl && tl.ok), tl && tl.ok ? 'OK' : 'WARN', tl && tl.ok ? 'OK' : 'WARNING', 'HOME_ALERT adapter', 'Kiểm tra queue HOME_ALERT'));

  var cq = typeof CBV_Coordination_getQueueModel_ === 'function' ? CBV_Coordination_getQueueModel_(ctx) : null;
  modules.push(CBV_Observation__healthRow_('COORDINATION', !!(cq && cq.ok), cq && cq.ok ? 'OK' : 'WARN', cq && cq.ok ? 'OK' : 'WARNING', 'RF_03 queue runtime', 'Mở coordination queue'));

  var sr = typeof CbvRf02Search_search_ === 'function' ? CbvRf02Search_search_(ctx, { keyword: 'test' }) : null;
  modules.push(CBV_Observation__healthRow_('SEARCH', !!(sr && sr.ok), sr && sr.ok ? 'STUB' : 'WARN', 'OK', 'Search stub', '—'));

  var nf = typeof CbvRf02Notification_getModel_ === 'function' ? CbvRf02Notification_getModel_(ctx) : null;
  modules.push(CBV_Observation__healthRow_('NOTIFICATION', !!(nf && nf.ok), nf && nf.ok ? 'STUB' : 'WARN', 'OK', 'Notification stub', '—'));

  var ff = typeof CbvRf02File_getModel_ === 'function' ? CbvRf02File_getModel_(ctx) : null;
  modules.push(CBV_Observation__healthRow_('FILE', !!(ff && ff.ok), ff && ff.ok ? 'STUB' : 'WARN', 'OK', 'File stub', '—'));

  modules.push(CBV_Observation__healthRow_('OBSERVATION', true, 'OK', 'OK', 'RF_04 observation runtime', '—'));

  return CBV_Observation__safeEnvelope_({
    ok: true,
    empty: false,
    data: { modules: modules },
    warnings: warnings
  });
}

/**
 * Projection Health v1.
 */
function CBV_Observation_getProjectionHealth_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var warnings = [];
  var projections = [];

  try {
    CBV_Observation__assertView_(ctx);
  } catch (ePerm) {
    return CBV_Observation__safeEnvelope_({
      ok: false,
      empty: true,
      data: { projections: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  function addProj(id, label, source, env, missingFields) {
    var ok = env && env.ok === true;
    var count = 0;
    if (env && env.data) {
      if (env.data.items) count = env.data.items.length;
      else if (env.data.queues) count = env.data.queues.reduce(function (s, q) { return s + (q.count || 0); }, 0);
      else if (env.data.staff) count = env.data.staff.length;
      else if (env.data.groups) count = env.data.total || 0;
    }
    projections.push({
      projectionId: id,
      label: label,
      source: source,
      ok: ok,
      recordCount: count,
      missingFields: missingFields || [],
      warnings: (env && env.warnings) ? env.warnings.slice(0, 5) : [],
      severity: ok ? 'OK' : 'WARNING',
      checkedAt: new Date().toISOString()
    });
    if (env && env.warnings) warnings = warnings.concat(env.warnings);
  }

  addProj('TASK_LIST', 'Task list', 'HOME_ALERT', typeof CbvRf02TaskList_getModel_ === 'function' ? CbvRf02TaskList_getModel_(ctx, 'all') : null, []);
  addProj('QUEUE', 'Coordination queue', 'RF_03', typeof CBV_Coordination_getQueueModel_ === 'function' ? CBV_Coordination_getQueueModel_(ctx) : null, []);
  addProj('WORKLOAD', 'Staff workload', 'RF_03', typeof CBV_Coordination_getWorkloadModel_ === 'function' ? CBV_Coordination_getWorkloadModel_(ctx) : null, []);
  addProj('OVERDUE', 'Overdue', 'RF_03', typeof CBV_Coordination_getOverdueModel_ === 'function' ? CBV_Coordination_getOverdueModel_(ctx) : null, ['dueDate']);
  addProj('SEARCH', 'Search stub', 'RF_02', typeof CbvRf02Search_search_ === 'function' ? CbvRf02Search_search_(ctx, { keyword: 'ab' }) : null, ['finance', 'ho_so']);
  addProj('NOTIFICATION', 'Notification stub', 'RF_02', typeof CbvRf02Notification_getModel_ === 'function' ? CbvRf02Notification_getModel_(ctx) : null, ['finance', 'hoso']);

  return CBV_Observation__safeEnvelope_({
    ok: true,
    empty: projections.length === 0,
    data: { projections: projections },
    warnings: warnings
  });
}

/**
 * Queue Health v1 — from RF_03 queues.
 */
function CBV_Observation_getQueueHealth_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  try {
    CBV_Observation__assertView_(ctx);
  } catch (ePerm) {
    return CBV_Observation__safeEnvelope_({
      ok: false,
      empty: true,
      data: { queues: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  var qEnv = typeof CBV_Coordination_getQueueModel_ === 'function' ? CBV_Coordination_getQueueModel_(ctx) : null;
  if (!qEnv || !qEnv.ok) {
    return CBV_Observation__safeEnvelope_({
      ok: true,
      empty: true,
      data: { queues: [] },
      warnings: (qEnv && qEnv.warnings) ? qEnv.warnings : ['Queue model unavailable']
    });
  }

  var queues = (qEnv.data && qEnv.data.queues) ? qEnv.data.queues : [];
  var health = queues.map(function (q) {
    var items = q.items || [];
    var oldest = 0;
    var overdue = 0;
    var blocked = 0;
    var unassigned = 0;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.ageDays != null && it.ageDays > oldest) oldest = it.ageDays;
      if (it.status && String(it.status).toUpperCase().indexOf('BLOCK') >= 0) blocked++;
      if (!String(it.assignee || '').trim()) unassigned++;
      if (it.ageDays != null && it.ageDays > 0) overdue++;
    }
    var sev = q.count >= 20 ? 'CRITICAL' : q.count >= 10 ? 'ERROR' : q.count >= 5 ? 'WARNING' : 'OK';
    if (q.queueId === 'OVERDUE' && q.count > 0) sev = 'ERROR';
    return {
      queueId: q.queueId,
      label: q.label,
      count: q.count,
      oldestAgeDays: oldest,
      overdueCount: overdue,
      blockedCount: blocked,
      unassignedCount: unassigned,
      severity: sev,
      nextStep: q.count ? 'Xem queue ' + q.label : '—'
    };
  });

  return CBV_Observation__safeEnvelope_({
    ok: true,
    empty: health.length === 0,
    data: { queues: health },
    warnings: qEnv.warnings || []
  });
}

/**
 * Sync Health Stub v1 — forward-looking, no fake sync.
 */
function CBV_Observation_getSyncHealthStub_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  try {
    CBV_Observation__assertView_(ctx);
  } catch (ePerm) {
    return CBV_Observation__safeEnvelope_({
      ok: false,
      empty: true,
      data: { syncs: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  var now = new Date().toISOString();
  var syncs = [
    {
      syncId: 'SHEET_APPSHEET',
      source: 'Google Sheet',
      target: 'AppSheet',
      status: 'NOT_CONFIGURED',
      severity: 'WARNING',
      message: 'RF_04 stub — không có sync monitor runtime',
      nextStep: 'Kiểm tra AppSheet binding thủ công',
      lastChecked: now
    },
    {
      syncId: 'SHEET_WORKBOARD',
      source: 'Google Sheet',
      target: 'Workboard Projection',
      status: 'ACTIVE_READ',
      severity: 'OK',
      message: 'HOME_ALERT adapter read-first',
      nextStep: '—',
      lastChecked: now
    },
    {
      syncId: 'APPSHEET_SHEET',
      source: 'AppSheet',
      target: 'Google Sheet',
      status: 'STUB',
      severity: 'OK',
      message: 'Không monitor realtime ở RF_04',
      nextStep: '—',
      lastChecked: now
    },
    {
      syncId: 'WORKER_BRIDGE',
      source: 'Future Worker',
      target: 'API Bridge',
      status: 'NOT_CONFIGURED',
      severity: 'OK',
      message: 'Cloudflare Worker chưa triển khai',
      nextStep: 'Xem TARGET_ARCHITECTURE',
      lastChecked: now
    }
  ];

  return CBV_Observation__safeEnvelope_({
    ok: true,
    empty: false,
    data: { syncs: syncs },
    warnings: ['Sync health is stub only — no auto-sync check']
  });
}

function CBV_Observation__readAuditRows_(sheetName, limit) {
  var rows = [];
  try {
    var ss = SpreadsheetApp.getActive();
    var sheet = ss ? ss.getSheetByName(sheetName) : null;
    if (!sheet || sheet.getLastRow() < 2) return rows;
    if (typeof loadSheetDataSafe === 'function') {
      var loaded = loadSheetDataSafe(sheet, sheetName);
      var all = (loaded && loaded.rows) ? loaded.rows : [];
      for (var i = all.length - 1; i >= 0 && rows.length < limit; i--) {
        rows.push(all[i]);
      }
    }
  } catch (e) { /* read-only safe */ }
  return rows;
}

/**
 * Audit Feed v1 — read ADMIN_AUDIT_LOG / TASK_UPDATE_LOG if present.
 */
function CBV_Observation_getAuditFeed_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var warnings = [];

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.OBSERVATION_AUDIT_VIEW, null);
  } catch (ePerm) {
    return CBV_Observation__safeEnvelope_({
      ok: true,
      empty: true,
      data: { items: [], scope: 'DENIED' },
      warnings: ['OBSERVATION_AUDIT_VIEW denied — empty feed']
    });
  }

  var items = [];
  var adminName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.ADMIN_AUDIT_LOG)
    ? CBV_CONFIG.SHEETS.ADMIN_AUDIT_LOG
    : 'ADMIN_AUDIT_LOG';
  var adminRows = CBV_Observation__readAuditRows_(adminName, 15);
  for (var a = 0; a < adminRows.length; a++) {
    var r = adminRows[a];
    items.push({
      auditId: String(r.ID || 'AAL_' + a),
      time: r.CREATED_AT || '',
      actor: r.ACTOR_ID || r.CREATED_BY || '',
      module: r.ENTITY_TYPE || 'ADMIN',
      action: r.ACTION || r.AUDIT_TYPE || '',
      message: String(r.NOTE || r.AUDIT_TYPE || '').slice(0, 200),
      severity: 'OK',
      source: adminName,
      href: CBV_Observation__href_('/workspace/observation/audit')
    });
  }

  var taskLogName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_UPDATE_LOG)
    ? CBV_CONFIG.SHEETS.TASK_UPDATE_LOG
    : 'TASK_UPDATE_LOG';
  var taskRows = CBV_Observation__readAuditRows_(taskLogName, 10);
  for (var t = 0; t < taskRows.length; t++) {
    var tr = taskRows[t];
    items.push({
      auditId: String(tr.ID || 'TUL_' + t),
      time: tr.CREATED_AT || '',
      actor: tr.ACTOR_ID || tr.CREATED_BY || '',
      module: 'TASK',
      action: tr.ACTION || tr.UPDATE_TYPE || '',
      message: 'Task ' + String(tr.TASK_ID || ''),
      severity: 'OK',
      source: taskLogName,
      href: CBV_Observation__href_('/workspace/workboard/task-detail', tr.TASK_ID ? { taskId: tr.TASK_ID } : {})
    });
  }

  if (!items.length) {
    warnings.push('AUDIT_EMPTY — không fake audit rows');
  }

  items.sort(function (x, y) {
    var tx = CBV_Observation__parseTime_(x.time);
    var ty = CBV_Observation__parseTime_(y.time);
    return ty - tx;
  });

  return CBV_Observation__safeEnvelope_({
    ok: true,
    empty: items.length === 0,
    data: { items: items.slice(0, 25) },
    warnings: warnings
  });
}

function CBV_Observation__parseTime_(v) {
  if (v instanceof Date) return v.getTime();
  var t = new Date(v).getTime();
  return isNaN(t) ? 0 : t;
}

/**
 * Runtime Alert v1 — no auto-resolve / auto-escalate.
 */
function CBV_Observation_getAlerts_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var alerts = [];
  var warnings = [];

  try {
    CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.OBSERVATION_ALERT_VIEW, null);
  } catch (ePerm) {
    return CBV_Observation__safeEnvelope_({
      ok: false,
      empty: true,
      data: { alerts: [] },
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  var od = typeof CBV_Coordination_getOverdueModel_ === 'function' ? CBV_Coordination_getOverdueModel_(ctx) : null;
  if (od && od.data && od.data.items) {
    od.data.items.forEach(function (it) {
      if (it.severity === 'CRITICAL' || it.severity === 'ERROR') {
        alerts.push({
          alertId: 'AL_OD_' + it.taskId,
          type: 'task_overdue',
          severity: it.severity,
          title: it.title,
          message: it.overdueDays + ' ngày quá hạn',
          module: 'COORDINATION',
          resourceId: it.taskId,
          href: it.href,
          nextStep: it.nextAction,
          createdAt: new Date().toISOString()
        });
      }
    });
    if (od.data.unknownDueDateCount > 3) {
      alerts.push({
        alertId: 'AL_UNKNOWN_DUE',
        type: 'missing_dueDate',
        severity: 'WARNING',
        title: 'Thiếu ngày hạn',
        message: od.data.unknownDueDateCount + ' mục không tính overdue',
        module: 'PROJECTION',
        resourceId: '',
        href: CBV_Observation__href_('/workspace/observation/projections'),
        nextStep: 'Kiểm tra projection',
        createdAt: new Date().toISOString()
      });
    }
  }

  var qh = typeof CBV_Observation_getQueueHealth_ === 'function' ? CBV_Observation_getQueueHealth_(ctx) : null;
  if (qh && qh.data && qh.data.queues) {
    qh.data.queues.forEach(function (q) {
      if (q.severity === 'CRITICAL' || q.severity === 'ERROR') {
        alerts.push({
          alertId: 'AL_Q_' + q.queueId,
          type: 'queue_overload',
          severity: q.severity,
          title: q.label,
          message: q.count + ' việc trong queue',
          module: 'QUEUE',
          resourceId: q.queueId,
          href: CBV_Observation__href_('/workspace/observation/queues'),
          nextStep: q.nextStep,
          createdAt: new Date().toISOString()
        });
      }
      if (q.unassignedCount > 0 && CBV_Observation__canTeamObserve_(ctx)) {
        alerts.push({
          alertId: 'AL_UNASS_' + q.queueId,
          type: 'unassigned_tasks',
          severity: 'WARNING',
          title: 'Chưa giao việc',
          message: q.unassignedCount + ' mục chưa có người xử lý',
          module: 'COORDINATION',
          resourceId: q.queueId,
          href: CBV_Observation__href_('/workspace/coordination/assignment'),
          nextStep: 'Giao việc thủ công',
          createdAt: new Date().toISOString()
        });
      }
    });
  }

  var ph = typeof CBV_Observation_getProjectionHealth_ === 'function' ? CBV_Observation_getProjectionHealth_(ctx) : null;
  if (ph && ph.data && ph.data.projections) {
    ph.data.projections.forEach(function (p) {
      if (!p.ok) {
        alerts.push({
          alertId: 'AL_PROJ_' + p.projectionId,
          type: 'projection_warning',
          severity: p.severity || 'WARNING',
          title: p.label,
          message: 'Projection không ổn',
          module: 'PROJECTION',
          resourceId: p.projectionId,
          href: CBV_Observation__href_('/workspace/observation/projections'),
          nextStep: 'Xem chi tiết projection',
          createdAt: new Date().toISOString()
        });
      }
    });
  }

  if (ctx.role === 'VIEW_ONLY' && (ctx.warnings || []).length) {
    alerts.push({
      alertId: 'AL_PERM_FALLBACK',
      type: 'permission_fallback',
      severity: 'WARNING',
      title: 'Quyền fallback',
      message: ctx.warnings.join('; '),
      module: 'PERMISSION',
      resourceId: '',
      href: CBV_Observation__href_('/workspace/observation/health'),
      nextStep: 'Kiểm tra USER_DIRECTORY',
      createdAt: new Date().toISOString()
    });
  }

  var sync = typeof CBV_Observation_getSyncHealthStub_ === 'function' ? CBV_Observation_getSyncHealthStub_(ctx) : null;
  if (sync && sync.data && sync.data.syncs) {
    sync.data.syncs.forEach(function (s) {
      if (s.status === 'NOT_CONFIGURED') {
        alerts.push({
          alertId: 'AL_SYNC_' + s.syncId,
          type: 'sync_not_configured',
          severity: 'OK',
          title: s.syncId,
          message: s.message,
          module: 'SYNC',
          resourceId: s.syncId,
          href: CBV_Observation__href_('/workspace/observation/sync'),
          nextStep: s.nextStep,
          createdAt: new Date().toISOString()
        });
      }
    });
  }

  try {
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      var rf02 = PropertiesService.getDocumentProperties().getProperty('CBV_TCS_RF02_TC_LAST_REPORT_JSON');
      var rf03 = PropertiesService.getDocumentProperties().getProperty('CBV_TCS_RF03_TC_LAST_REPORT_JSON');
      if (!rf02 || !rf03) {
        alerts.push({
          alertId: 'AL_TEST_PENDING',
          type: 'runtime_test_pending',
          severity: 'WARNING',
          title: 'Test runtime pending',
          message: 'Chưa có report RF_02/RF_03 trong Properties',
          module: 'OBSERVATION',
          resourceId: '',
          href: CBV_Observation__href_('/workspace/observation/health'),
          nextStep: 'Chạy 🧪 CBV Test Console',
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (eProp) {
    warnings.push('PropertiesService: ' + (eProp && eProp.message ? eProp.message : String(eProp)));
  }

  if (!CBV_Observation__canTeamObserve_(ctx)) {
    alerts = alerts.filter(function (al) {
      return al.type !== 'queue_overload' || al.severity === 'CRITICAL';
    });
  }

  return CBV_Observation__safeEnvelope_({
    ok: true,
    empty: alerts.length === 0,
    data: { alerts: alerts, autoResolve: false, autoEscalate: false },
    warnings: warnings
  });
}

/**
 * Observation dashboard model.
 */
function CBV_Observation_getDashboardModel_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  try {
    CBV_Observation__assertView_(ctx);
  } catch (ePerm) {
    return CBV_Observation__safeEnvelope_({
      ok: false,
      empty: true,
      data: null,
      errors: [ePerm && ePerm.message ? ePerm.message : String(ePerm)]
    });
  }

  var rh = CBV_Observation_getRuntimeHealth_(ctx);
  var ph = CBV_Observation_getProjectionHealth_(ctx);
  var qh = CBV_Observation_getQueueHealth_(ctx);
  var sh = CBV_Observation_getSyncHealthStub_(ctx);
  var af = CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.OBSERVATION_AUDIT_VIEW, null)
    ? CBV_Observation_getAuditFeed_(ctx)
    : { ok: true, empty: true, data: { items: [] }, warnings: ['Audit view denied'] };
  var al = CBV_Observation_getAlerts_(ctx);

  function worstSeverity(modules) {
    var w = 'OK';
    (modules || []).forEach(function (m) {
      if (m.severity === 'CRITICAL') w = 'CRITICAL';
      else if (m.severity === 'ERROR' && w !== 'CRITICAL') w = 'ERROR';
      else if (m.severity === 'WARNING' && w === 'OK') w = 'WARNING';
    });
    return w;
  }

  var alertCount = (al.data && al.data.alerts) ? al.data.alerts.length : 0;
  var cards = [
    { id: 'runtime', label: 'Runtime Health', severity: worstSeverity(rh.data && rh.data.modules), count: (rh.data && rh.data.modules) ? rh.data.modules.length : 0, href: CBV_Observation__href_('/workspace/observation/health') },
    { id: 'projection', label: 'Projection Health', severity: worstSeverity(ph.data && ph.data.projections), count: (ph.data && ph.data.projections) ? ph.data.projections.length : 0, href: CBV_Observation__href_('/workspace/observation/projections') },
    { id: 'queue', label: 'Queue Health', severity: worstSeverity(qh.data && qh.data.queues), count: (qh.data && qh.data.queues) ? qh.data.queues.length : 0, href: CBV_Observation__href_('/workspace/observation/queues') },
    { id: 'sync', label: 'Sync Health', severity: 'OK', count: (sh.data && sh.data.syncs) ? sh.data.syncs.length : 0, href: CBV_Observation__href_('/workspace/observation/sync') },
    { id: 'audit', label: 'Audit Status', severity: af.empty ? 'OK' : 'OK', count: (af.data && af.data.items) ? af.data.items.length : 0, href: CBV_Observation__href_('/workspace/observation/audit') },
    { id: 'alerts', label: 'Alerts', severity: alertCount ? 'WARNING' : 'OK', count: alertCount, href: CBV_Observation__href_('/workspace/observation/alerts') }
  ];

  return CBV_Observation__safeEnvelope_({
    ok: true,
    empty: false,
    data: {
      cards: cards,
      alerts: (al.data && al.data.alerts) ? al.data.alerts.slice(0, 8) : [],
      autoResolve: false,
      autoEscalate: false
    },
    warnings: [].concat(rh.warnings || [], ph.warnings || [], qh.warnings || [], sh.warnings || [], af.warnings || [], al.warnings || [])
  });
}
