/**
 * PHASE_RF_05 — Plugin Renderer
 */

function CbvRf05Plugin__esc_(s) {
  return String(s != null ? s : '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function CbvRf05Plugin__href_(path, params) {
  if (typeof CBV_Plugin__href_ === 'function') return CBV_Plugin__href_(path, params);
  return path;
}

function CbvRf05Plugin_buildNavHtml_(activeRoute) {
  var ar = String(activeRoute || '');
  var tabs = [
    { route: '/workspace/plugins', label: 'Module' },
    { route: '/workspace/plugins/task', label: 'Task' },
    { route: '/workspace/plugins/finance', label: 'Finance' },
    { route: '/workspace/plugins/ho-so', label: 'Hồ sơ' },
    { route: '/workspace/plugins/health', label: 'Health' },
    { route: '/workspace/observation', label: '← Quan sát' }
  ];
  var out = '<nav class="cbv-rf05-nav cbv-thumb-zone" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    var active = ar === t.route ? ' cbv-action-active' : '';
    out += '<a class="cbv-btn-operational cbv-action-xl cbv-busy-link' + active + '" href="' + CbvRf05Plugin__esc_(CbvRf05Plugin__href_(t.route)) + '">' + CbvRf05Plugin__esc_(t.label) + '</a>';
  }
  out += '</nav>';
  return out;
}

function CbvRf05Plugin_wrap_(inner, route, ctx) {
  var header = '<div class="cbv-rf05-plugin"><h2 style="margin-top:0">Module Plugin</h2>' + CbvRf05Plugin_buildNavHtml_(route) + '</div>';
  var body = header + (inner || '');
  if (typeof CbvRf02Workboard_wrapBody_ === 'function') {
    return CbvRf02Workboard_wrapBody_(body, route, ctx);
  }
  return '<div class="cbv-rf05-plugin">' + body + '</div>';
}

function CbvRf05Plugin__empty_(title, msg) {
  return '<div class="cbv-rf05-state cbv-workboard-empty-state cbv-card"><p><strong>' + CbvRf05Plugin__esc_(title) + '</strong></p><p class="cbv-muted">' + CbvRf05Plugin__esc_(msg) + '</p></div>';
}

function CbvRf05Plugin__statusBadge_(status) {
  return '<span class="cbv-badge">' + CbvRf05Plugin__esc_(status) + '</span>';
}

function CbvRf05Plugin_renderHomePage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Plugin_getDashboardModel_(ctx);
  if (!env.ok) {
    return { title: 'Module Plugin', bodyHtml: CbvRf05Plugin_wrap_(CbvRf05Plugin__empty_('Không có quyền', (env.errors || []).join('; ')), '/workspace/plugins', ctx) };
  }
  var plugins = (env.data && env.data.plugins) ? env.data.plugins : [];
  var inner = plugins.map(function (p) {
    return (
      '<a class="cbv-rf05-card cbv-card cbv-busy-link" href="' + CbvRf05Plugin__esc_(p.href) + '" style="display:block;margin-bottom:10px;padding:12px;text-decoration:none;color:inherit">' +
      '<strong>' + CbvRf05Plugin__esc_(p.label) + '</strong> ' + CbvRf05Plugin__statusBadge_(p.status) +
      '<div class="cbv-muted">' + CbvRf05Plugin__esc_(p.module) + ' · ' + p.activeCapabilityCount + '/' + p.capabilityCount + ' capability · ' + p.warningCount + ' cảnh báo</div>' +
      '<div class="cbv-muted">Next: ' + CbvRf05Plugin__esc_(p.nextStep) + '</div></a>'
    );
  }).join('') || CbvRf05Plugin__empty_('Trống', 'Không có plugin cho role này.');
  inner += '<p class="cbv-muted">Registry hardcoded · không auto-execute.</p>';
  return { title: 'Module Plugin', bodyHtml: CbvRf05Plugin_wrap_(inner, '/workspace/plugins', ctx) };
}

function CbvRf05Plugin_renderDetailPage_(params, moduleOrId) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env;
  if (moduleOrId === 'TASK' || moduleOrId === 'FINANCE' || moduleOrId === 'HO_SO') {
    env = CBV_Plugin_getDetailByModule_(moduleOrId, ctx);
  } else {
    var pid = moduleOrId || CBV_Plugin_resolvePluginIdFromParams_(params);
    env = CBV_Plugin_getDetailModel_(pid, ctx);
  }
  var route = '/workspace/plugins/' + String(moduleOrId || 'detail').toLowerCase().replace('_', '-');
  if (moduleOrId === 'HO_SO') route = '/workspace/plugins/ho-so';
  if (!env.ok) {
    return { title: 'Plugin Detail', bodyHtml: CbvRf05Plugin_wrap_(CbvRf05Plugin__empty_('Lỗi', (env.errors || []).join('; ')), route, ctx) };
  }
  var d = env.data || {};
  var desc = d.descriptor || {};
  var caps = d.capabilities || [];
  var coord = d.coordination || {};
  var actions = d.quickActions || [];

  var capHtml = caps.map(function (c) {
    return '<li>' + CbvRf05Plugin__esc_(c.label) + ' · ' + CbvRf05Plugin__statusBadge_(c.status) + ' · ' + CbvRf05Plugin__esc_(c.type) + '</li>';
  }).join('');

  var actionHtml = actions.length
    ? actions.map(function (a) {
      return (
        '<div class="cbv-card" style="margin-bottom:8px">' +
        '<strong>' + CbvRf05Plugin__esc_(a.label) + '</strong> · ' + CbvRf05Plugin__esc_(a.executionMode) +
        (a.href ? ' <a class="cbv-busy-link" href="' + CbvRf05Plugin__esc_(a.href) + '">Mở</a>' : '') +
        '</div>'
      );
    }).join('')
    : '<p class="cbv-muted">Không có quick action khả dụng.</p>';

  var obs = d.observationHealth;
  var obsHtml = obs
    ? '<p>' + CbvRf05Plugin__statusBadge_(obs.severity) + ' ' + CbvRf05Plugin__esc_(obs.message) + '</p>'
    : '<p class="cbv-muted">Chưa có observation health.</p>';

  var inner =
    '<article class="cbv-rf05-detail cbv-card">' +
    '<h3>' + CbvRf05Plugin__esc_(desc.label) + ' ' + CbvRf05Plugin__statusBadge_(desc.status) + '</h3>' +
    '<p class="cbv-muted">v' + CbvRf05Plugin__esc_(desc.version) + ' · ' + CbvRf05Plugin__esc_(desc.source) + '</p>' +
    '<p>' + CbvRf05Plugin__esc_(desc.notes || '') + '</p></article>' +
    '<h4>Capabilities</h4><ul>' + capHtml + '</ul>' +
    '<h4>Coordination</h4><p class="cbv-muted">Queue: ' + CbvRf05Plugin__esc_(String(coord.queueSupported)) +
    ' · Assign: ' + CbvRf05Plugin__esc_(String(coord.assignmentSupported)) +
    ' · Workload: ' + CbvRf05Plugin__esc_(String(coord.workloadSupported)) + '</p>' +
    '<h4>Observation</h4>' + obsHtml +
    '<h4>Quick Actions</h4>' + actionHtml +
    '<p class="cbv-muted">Không auto-execute · destructive = EXECUTION_LOCKED.</p>';

  return { title: desc.label || 'Plugin', bodyHtml: CbvRf05Plugin_wrap_(inner, route, ctx) };
}

function CbvRf05Plugin_renderHealthPage_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_PluginObservation_getHealth(ctx);
  if (!env.ok) {
    return { title: 'Plugin Health', bodyHtml: CbvRf05Plugin_wrap_(CbvRf05Plugin__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/plugins/health', ctx) };
  }
  var items = (env.data && env.data.plugins) ? env.data.plugins : [];
  var inner = items.map(function (p) {
    return (
      '<article class="cbv-rf05-health-row cbv-card" style="margin-bottom:8px">' +
      '<strong>' + CbvRf05Plugin__esc_(p.module) + '</strong> ' + CbvRf05Plugin__statusBadge_(p.severity) +
      '<p class="cbv-muted">' + CbvRf05Plugin__esc_(p.message) + '</p>' +
      '<p class="cbv-muted">Next: ' + CbvRf05Plugin__esc_(p.nextStep) + '</p></article>'
    );
  }).join('') || CbvRf05Plugin__empty_('Trống', 'Không có plugin health.');
  return { title: 'Plugin Health', bodyHtml: CbvRf05Plugin_wrap_(inner, '/workspace/plugins/health', ctx) };
}

function CbvRf05Plugin_renderPageByType_(pageType, params) {
  var pt = String(pageType || '');
  var p = params || {};
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF05_PLUGIN_HOME) return CbvRf05Plugin_renderHomePage_(p);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF05_PLUGIN_TASK) return CbvRf05Plugin_renderDetailPage_(p, 'TASK');
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF05_PLUGIN_FINANCE) return CbvRf05Plugin_renderDetailPage_(p, 'FINANCE');
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF05_PLUGIN_HO_SO) return CbvRf05Plugin_renderDetailPage_(p, 'HO_SO');
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF05_PLUGIN_DETAIL) {
    var pid = p.pluginId || CBV_Plugin_resolvePluginIdFromParams_(p);
    return CbvRf05Plugin_renderDetailPage_(p, pid);
  }
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF05_PLUGIN_HEALTH) return CbvRf05Plugin_renderHealthPage_(p);
  return { title: 'Plugin', bodyHtml: CbvRf05Plugin__empty_('Unknown', pt) };
}
