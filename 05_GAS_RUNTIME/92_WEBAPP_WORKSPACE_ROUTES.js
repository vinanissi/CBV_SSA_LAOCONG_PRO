/**
 * PHASE_89 — WebApp Operational Workspace Skeleton (route registry)
 * READ_FIRST only.
 */

function CbvWebAppWorkspace_routeRegistry() {
  var routes = [
    {
      route: '/workspace',
      screenCode: 'HOME_WORKSPACE',
      title: 'Workspace',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.HOME,
      requiredRole: '*',
      dataSourceSheet: '',
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Home operational workspace (read-first).'
    },
    {
      route: '/home-alert/my-queue',
      screenCode: 'HOME_ALERT_MY_QUEUE',
      title: 'HOME_ALERT — My Queue',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.QUEUE,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Read-first list; no write actions in Phase 89.'
    },
    {
      route: '/home-alert/sla',
      screenCode: 'HOME_ALERT_SLA_DASHBOARD',
      title: 'HOME_ALERT — SLA Dashboard',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.SLA,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Read-first SLA summary; placeholder if columns missing.'
    },
    {
      route: '/home-alert/timeline',
      screenCode: 'HOME_ALERT_TIMELINE',
      title: 'HOME_ALERT — Timeline',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.PLACEHOLDER,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: false,
      notes: 'Reserved placeholder (next phase).'
    },
    {
      route: '/home-alert/kanban',
      screenCode: 'HOME_ALERT_KANBAN',
      title: 'HOME_ALERT — Kanban',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.PLACEHOLDER,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: false,
      notes: 'Reserved placeholder (next phase).'
    },
    {
      route: '/runtime/health',
      screenCode: 'RUNTIME_HEALTH_DASHBOARD',
      title: 'Runtime — Health',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.PLACEHOLDER,
      requiredRole: 'ADMIN',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.SYSTEM_HEALTH_LOG,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: false,
      notes: 'Placeholder: runtime health surface (read-first).'
    },
    {
      route: '/reports',
      screenCode: 'REPORT_HANDOFF_VIEWER',
      title: 'Reports',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.PLACEHOLDER,
      requiredRole: 'ADMIN',
      dataSourceSheet: '',
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: false,
      notes: 'Placeholder: handoff/report viewer in WebApp later.'
    },
    {
      route: '/admin/reference',
      screenCode: 'ADMIN_REFERENCE_VIEWER',
      title: 'Admin — Reference',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.PLACEHOLDER,
      requiredRole: 'ADMIN',
      dataSourceSheet: '',
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: false,
      notes: 'Placeholder: reference explorer in WebApp later.'
    }
  ];
  return routes;
}

function CbvWebAppWorkspace_routeByPath(route) {
  var rt = String(route || '').trim();
  if (!rt) return null;
  var all = CbvWebAppWorkspace_routeRegistry();
  for (var i = 0; i < all.length; i++) {
    if (String(all[i].route) === rt) return all[i];
  }
  return null;
}

