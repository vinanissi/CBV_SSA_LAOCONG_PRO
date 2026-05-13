# WebApp Route Registry (Phase 89)

## Purpose

Provide a deterministic route registry for the WebApp operational workspace.

- **WebApp-led** hybrid (Sheets/GAS runtime is source of truth).
- **READ_FIRST** only in Phase 89.

## Route entry shape

```js
{
  route,
  screenCode,
  title,
  pageType,
  requiredRole,
  dataSourceSheet,
  mode,          // READ_FIRST
  isEnabled,
  isPilotReady,
  notes
}
```

## Required routes (Phase 89 baseline)

- `/workspace` → `HOME_WORKSPACE` (HOME)
- `/home-alert/my-queue` → `HOME_ALERT_MY_QUEUE` (QUEUE)
- `/home-alert/sla` → `HOME_ALERT_SLA_DASHBOARD` (SLA)
- `/home-alert/timeline` → `HOME_ALERT_TIMELINE` (PLACEHOLDER)
- `/home-alert/kanban` → `HOME_ALERT_KANBAN` (PLACEHOLDER)
- `/runtime/health` → `RUNTIME_HEALTH_DASHBOARD` (PLACEHOLDER)
- `/reports` → `REPORT_HANDOFF_VIEWER` (PLACEHOLDER)
- `/admin/reference` → `ADMIN_REFERENCE_VIEWER` (PLACEHOLDER)

Implementation:

- `05_GAS_RUNTIME/92_WEBAPP_WORKSPACE_ROUTES.js`

