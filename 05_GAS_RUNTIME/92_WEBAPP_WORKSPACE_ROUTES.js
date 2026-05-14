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
      route: '/workspace/role-home',
      screenCode: 'WORKSPACE_ROLE_HOME',
      title: 'Workspace — Role home',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.ROLE_HOME,
      requiredRole: '*',
      dataSourceSheet: '',
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Milestone 01 — role-based landing (read-first).'
    },
    {
      route: '/workspace/today',
      screenCode: 'WORKSPACE_TODAY_OPS',
      title: 'Workspace — Today',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.TODAY_OPS,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Milestone 01 — today operations dashboard (read-first aggregates).'
    },
    {
      route: '/workspace/guided',
      screenCode: 'WORKSPACE_GUIDED_FLOW',
      title: 'Workspace — Guided',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.GUIDED_OPS,
      requiredRole: '*',
      dataSourceSheet: '',
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Milestone 01 — guided SOP inline (read-first).'
    },
    {
      route: '/workspace/daily',
      screenCode: 'DAILY_OPERATION_HOME',
      title: 'Workspace — Daily',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.DAILY_OPERATION_HOME,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Milestone 03 — task-first daily home (HOME_ALERT adapter; read-first).'
    },
    {
      route: '/daily',
      screenCode: 'DAILY_OPERATION_HOME_ALIAS',
      title: 'Daily',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.DAILY_OPERATION_HOME,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Alias route for Milestone 03 daily home.'
    },
    {
      route: '/workspace/staff/tasks',
      screenCode: 'STAFF_TASK_INBOX',
      title: 'Workspace — Staff tasks',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.STAFF_TASKS,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Milestone 02 — staff task workspace (HOME_ALERT adapter; read-first).'
    },
    {
      route: '/staff/tasks',
      screenCode: 'STAFF_TASK_INBOX_ALIAS',
      title: 'Staff — Tasks',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.STAFF_TASKS,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Alias route for staff inbox (same renderer as /workspace/staff/tasks).'
    },
    {
      route: '/workspace/staff/task-detail',
      screenCode: 'STAFF_TASK_DETAIL',
      title: 'Workspace — Task detail',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.STAFF_TASK_DETAIL,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Milestone 02 — task detail + timeline (query taskId).'
    },
    {
      route: '/staff/task-detail',
      screenCode: 'STAFF_TASK_DETAIL_ALIAS',
      title: 'Staff — Task detail',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.STAFF_TASK_DETAIL,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Alias route for task detail.'
    },
    {
      route: '/workspace/focus',
      screenCode: 'OPERATION_FOCUS_MODE',
      title: 'Workspace — Focus',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.FOCUS_MODE,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Milestone 04 — focus execution mode (read-first; optional taskId).'
    },
    {
      route: '/focus',
      screenCode: 'OPERATION_FOCUS_MODE_ALIAS',
      title: 'Focus',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.FOCUS_MODE,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Alias for Milestone 04 focus mode.'
    },
    {
      route: '/workspace/execution/task',
      screenCode: 'EXECUTION_TASK_DETAIL_WS',
      title: 'Workspace — Execution task',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.STAFF_TASK_DETAIL,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Milestone 04 — alias to task detail execution cockpit (query taskId).'
    },
    {
      route: '/execution/task',
      screenCode: 'EXECUTION_TASK_DETAIL_ALIAS',
      title: 'Execution — Task',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.STAFF_TASK_DETAIL,
      requiredRole: '*',
      dataSourceSheet: CBV_WEBAPP_WS_SHEETS.HOME_ALERT,
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Alias for execution task detail cockpit.'
    },
    {
      route: '/workspace/sop',
      screenCode: 'GUIDED_SOP_RUNTIME_WS',
      title: 'Workspace — Guided SOP',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.GUIDED_SOP_RUNTIME,
      requiredRole: '*',
      dataSourceSheet: '',
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Milestone 05 — guided SOP runtime (read-first; optional taskId).'
    },
    {
      route: '/sop',
      screenCode: 'GUIDED_SOP_RUNTIME_ALIAS',
      title: 'Guided SOP',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.GUIDED_SOP_RUNTIME,
      requiredRole: '*',
      dataSourceSheet: '',
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Alias for guided SOP runtime page.'
    },
    {
      route: '/workspace/staff/feedback',
      screenCode: 'STAFF_FEEDBACK',
      title: 'Workspace — Staff feedback',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.STAFF_FEEDBACK,
      requiredRole: '*',
      dataSourceSheet: '',
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Milestone 02 — staff feedback (safe sink when sheet exists).'
    },
    {
      route: '/staff/feedback',
      screenCode: 'STAFF_FEEDBACK_ALIAS',
      title: 'Staff — Feedback',
      pageType: CBV_WEBAPP_WS_PAGE_TYPES.STAFF_FEEDBACK,
      requiredRole: '*',
      dataSourceSheet: '',
      mode: CBV_WEBAPP_WS_MODES.READ_FIRST,
      isEnabled: true,
      isPilotReady: true,
      notes: 'Alias route for staff feedback.'
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

