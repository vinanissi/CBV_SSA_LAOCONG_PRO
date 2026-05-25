/**
 * PHASE_RF_04 — Observation Renderer
 */

function CbvRf04Obs__esc_(s) {
  return String(s != null ? s : '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function CbvRf04Obs__href_(path, params) {
  if (typeof CBV_Observation__href_ === 'function') return CBV_Observation__href_(path, params);
  return path;
}

function CbvRf04Obs_buildNavHtml_(activeRoute, ctx) {
  var ar = String(activeRoute || '');
  var tabs = [
    { route: '/workspace/observation', label: 'Tổng quan' },
    { route: '/workspace/observation/health', label: 'Runtime' },
    { route: '/workspace/observation/projections', label: 'Projection' },
    { route: '/workspace/observation/queues', label: 'Queue' },
    { route: '/workspace/observation/sync', label: 'Sync' },
    { route: '/workspace/observation/audit', label: 'Audit' },
    { route: '/workspace/observation/alerts', label: 'Cảnh báo' },
    { route: '/workspace/coordination/manager', label: '← Điều phối' }
  ];
  var out = '<nav class="cbv-rf04-nav cbv-thumb-zone" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    var active = ar === t.route ? ' cbv-action-active' : '';
    out += '<a class="cbv-btn-operational cbv-action-xl cbv-busy-link' + active + '" href="' + CbvRf04Obs__esc_(CbvRf04Obs__href_(t.route)) + '">' + CbvRf04Obs__esc_(t.label) + '</a>';
  }
  out += '</nav>';
  return out;
}

function CbvRf04Obs_wrap_(inner, route, ctx) {
  var header = '<div class="cbv-rf04-observation"><h2 style="margin-top:0">Quan sát vận hành</h2>' + CbvRf04Obs_buildNavHtml_(route, ctx) + '</div>';
  var body = header + (inner || '');
  if (typeof CbvRf02Workboard_wrapBody_ === 'function') {
    return CbvRf02Workboard_wrapBody_(body, route, ctx);
  }
  return '<div class="cbv-rf04-observation">' + body + '</div>';
}

function CbvRf04Obs__empty_(title, msg) {
  return '<div class="cbv-rf04-state cbv-workboard-empty-state cbv-card"><p><strong>' + CbvRf04Obs__esc_(title) + '</strong></p><p class="cbv-muted">' + CbvRf04Obs__esc_(msg) + '</p></div>';
}

function CbvRf04Obs_renderHomePage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Observation_getDashboardModel_(ctx);
  if (!env.ok) {
    return { title: 'Quan sát', bodyHtml: CbvRf04Obs_wrap_(CbvRf04Obs__empty_('Không có quyền', (env.errors || []).join('; ')), '/workspace/observation', ctx) };
  }
  var cards = (env.data && env.data.cards) ? env.data.cards : [];
  var cardHtml = cards.map(function (c) {
    return (
      '<a class="cbv-rf04-card cbv-card cbv-busy-link" href="' + CbvRf04Obs__esc_(c.href) + '" style="display:block;margin-bottom:10px;padding:12px;text-decoration:none;color:inherit">' +
      '<div style="font-size:24px;font-weight:700">' + CbvRf04Obs__esc_(String(c.count)) + '</div>' +
      '<div>' + CbvRf04Obs__esc_(c.label) + '</div>' +
      '<span class="cbv-badge">' + CbvRf04Obs__esc_(c.severity) + '</span></a>'
    );
  }).join('');
  var alerts = (env.data && env.data.alerts) ? env.data.alerts : [];
  var alertHtml = alerts.length
    ? '<h3>Cảnh báo gần đây</h3>' + alerts.map(function (a) {
      return '<div class="cbv-card" style="margin-bottom:8px"><strong>' + CbvRf04Obs__esc_(a.title) + '</strong> — ' + CbvRf04Obs__esc_(a.message) + '</div>';
    }).join('')
    : '<p class="cbv-muted">Không có cảnh báo vận hành.</p>';
  return {
    title: 'Quan sát vận hành',
    bodyHtml: CbvRf04Obs_wrap_(cardHtml + alertHtml, '/workspace/observation', ctx)
  };
}

function CbvRf04Obs_renderHealthPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Observation_getRuntimeHealth_(ctx);
  if (!env.ok) {
    return { title: 'Runtime Health', bodyHtml: CbvRf04Obs_wrap_(CbvRf04Obs__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/observation/health', ctx) };
  }
  var mods = (env.data && env.data.modules) ? env.data.modules : [];
  var inner = mods.map(function (m) {
    return (
      '<article class="cbv-rf04-health-row cbv-card" style="margin-bottom:8px">' +
      '<strong>' + CbvRf04Obs__esc_(m.module) + '</strong> <span class="cbv-badge">' + CbvRf04Obs__esc_(m.severity) + '</span>' +
      '<p class="cbv-muted">' + CbvRf04Obs__esc_(m.message) + '</p>' +
      '<p class="cbv-muted">Next: ' + CbvRf04Obs__esc_(m.nextStep || '—') + '</p></article>'
    );
  }).join('') || CbvRf04Obs__empty_('Trống', 'Không có module health.');
  return { title: 'Runtime Health', bodyHtml: CbvRf04Obs_wrap_(inner, '/workspace/observation/health', ctx) };
}

function CbvRf04Obs_renderProjectionsPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Observation_getProjectionHealth_(ctx);
  if (!env.ok) {
    return { title: 'Projection Health', bodyHtml: CbvRf04Obs_wrap_(CbvRf04Obs__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/observation/projections', ctx) };
  }
  var projs = (env.data && env.data.projections) ? env.data.projections : [];
  var inner = projs.map(function (p) {
    return (
      '<article class="cbv-rf04-proj-row cbv-card" style="margin-bottom:8px">' +
      '<strong>' + CbvRf04Obs__esc_(p.label) + '</strong> · ' + CbvRf04Obs__esc_(p.source) +
      ' · ' + p.recordCount + ' bản ghi <span class="cbv-badge">' + CbvRf04Obs__esc_(p.severity) + '</span>' +
      (p.missingFields && p.missingFields.length ? '<p class="cbv-muted">Thiếu: ' + CbvRf04Obs__esc_(p.missingFields.join(', ')) + '</p>' : '') +
      '</article>'
    );
  }).join('') || CbvRf04Obs__empty_('Trống', 'Không có projection.');
  return { title: 'Projection Health', bodyHtml: CbvRf04Obs_wrap_(inner, '/workspace/observation/projections', ctx) };
}

function CbvRf04Obs_renderQueuesPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Observation_getQueueHealth_(ctx);
  if (!env.ok) {
    return { title: 'Queue Health', bodyHtml: CbvRf04Obs_wrap_(CbvRf04Obs__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/observation/queues', ctx) };
  }
  var qs = (env.data && env.data.queues) ? env.data.queues : [];
  var inner = qs.map(function (q) {
    return (
      '<article class="cbv-rf04-queue-row cbv-card" style="margin-bottom:8px">' +
      '<strong>' + CbvRf04Obs__esc_(q.label) + '</strong> (' + q.count + ')' +
      ' · quá hạn: ' + q.overdueCount + ' · kẹt: ' + q.blockedCount +
      ' · oldest: ' + q.oldestAgeDays + 'd <span class="cbv-badge">' + CbvRf04Obs__esc_(q.severity) + '</span></article>'
    );
  }).join('') || CbvRf04Obs__empty_('Trống', 'Không có queue health.');
  return { title: 'Queue Health', bodyHtml: CbvRf04Obs_wrap_(inner, '/workspace/observation/queues', ctx) };
}

function CbvRf04Obs_renderSyncPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Observation_getSyncHealthStub_(ctx);
  if (!env.ok) {
    return { title: 'Sync Health', bodyHtml: CbvRf04Obs_wrap_(CbvRf04Obs__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/observation/sync', ctx) };
  }
  var syncs = (env.data && env.data.syncs) ? env.data.syncs : [];
  var inner = syncs.map(function (s) {
    return (
      '<article class="cbv-rf04-sync-row cbv-card" style="margin-bottom:8px">' +
      '<strong>' + CbvRf04Obs__esc_(s.syncId) + '</strong> · ' + CbvRf04Obs__esc_(s.source) + ' → ' + CbvRf04Obs__esc_(s.target) +
      '<p><span class="cbv-badge">' + CbvRf04Obs__esc_(s.status) + '</span> ' + CbvRf04Obs__esc_(s.message) + '</p></article>'
    );
  }).join('');
  inner += '<p class="cbv-muted">Stub only — không auto-sync check.</p>';
  return { title: 'Sync Health', bodyHtml: CbvRf04Obs_wrap_(inner, '/workspace/observation/sync', ctx) };
}

function CbvRf04Obs_renderAuditPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Observation_getAuditFeed_(ctx);
  if (!env.ok && env.errors && env.errors.length) {
    return { title: 'Audit Feed', bodyHtml: CbvRf04Obs_wrap_(CbvRf04Obs__empty_('Lỗi', env.errors.join('; ')), '/workspace/observation/audit', ctx) };
  }
  var items = (env.data && env.data.items) ? env.data.items : [];
  var inner = items.length
    ? items.map(function (a) {
      return (
        '<article class="cbv-rf04-audit-row cbv-card" style="margin-bottom:8px">' +
        '<span class="cbv-muted">' + CbvRf04Obs__esc_(String(a.time)) + '</span> · <strong>' + CbvRf04Obs__esc_(a.action) + '</strong>' +
        ' · ' + CbvRf04Obs__esc_(a.module) + ' — ' + CbvRf04Obs__esc_(a.message) +
        ' <span class="cbv-muted">(' + CbvRf04Obs__esc_(a.source) + ')</span></article>'
      );
    }).join('')
    : CbvRf04Obs__empty_('Audit trống', 'Không fake audit — chưa có log hoặc không có quyền audit view.');
  return { title: 'Audit Feed', bodyHtml: CbvRf04Obs_wrap_(inner, '/workspace/observation/audit', ctx) };
}

function CbvRf04Obs_renderAlertsPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Observation_getAlerts_(ctx);
  if (!env.ok) {
    return { title: 'Alerts', bodyHtml: CbvRf04Obs_wrap_(CbvRf04Obs__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/observation/alerts', ctx) };
  }
  var alerts = (env.data && env.data.alerts) ? env.data.alerts : [];
  var inner = alerts.length
    ? alerts.map(function (a) {
      return (
        '<article class="cbv-rf04-alert-row cbv-card" style="margin-bottom:8px;border-left:4px solid #e67e22">' +
        '<strong>' + CbvRf04Obs__esc_(a.title) + '</strong> <span class="cbv-badge">' + CbvRf04Obs__esc_(a.severity) + '</span>' +
        '<p>' + CbvRf04Obs__esc_(a.message) + '</p>' +
        '<p class="cbv-muted">Next: ' + CbvRf04Obs__esc_(a.nextStep) + '</p>' +
        (a.href ? '<a class="cbv-workboard-primary-cta cbv-action-xl cbv-busy-link" href="' + CbvRf04Obs__esc_(a.href) + '">Xem</a>' : '') +
        '</article>'
      );
    }).join('')
    : CbvRf04Obs__empty_('Không có cảnh báo', 'Hệ thống ổn trong phạm vi projection hiện tại.');
  inner += '<p class="cbv-muted">Không auto-resolve · không auto-escalate.</p>';
  return { title: 'Operational Alerts', bodyHtml: CbvRf04Obs_wrap_(inner, '/workspace/observation/alerts', ctx) };
}

function CbvRf04Obs_renderPageByType_(pageType, params) {
  var pt = String(pageType || '');
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF04_OBSERVATION_HOME) return CbvRf04Obs_renderHomePage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF04_OBSERVATION_HEALTH) return CbvRf04Obs_renderHealthPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF04_OBSERVATION_PROJECTIONS) return CbvRf04Obs_renderProjectionsPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF04_OBSERVATION_QUEUES) return CbvRf04Obs_renderQueuesPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF04_OBSERVATION_SYNC) return CbvRf04Obs_renderSyncPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF04_OBSERVATION_AUDIT) return CbvRf04Obs_renderAuditPage_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF04_OBSERVATION_ALERTS) return CbvRf04Obs_renderAlertsPage_(params);
  return { title: 'Observation', bodyHtml: CbvRf04Obs__empty_('Unknown', pt) };
}
