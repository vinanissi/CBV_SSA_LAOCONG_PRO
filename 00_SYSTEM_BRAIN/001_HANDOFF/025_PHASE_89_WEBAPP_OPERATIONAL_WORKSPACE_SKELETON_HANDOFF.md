# Handoff — Phase 89 WebApp Operational Workspace Skeleton

## Architecture context (Phase 88)

Final FE split:

- Sheets/GAS = operational database + runtime
- WebApp = operational workspace
- AppSheet = lightweight operator shell

Phase 89 is **WebApp-led** and **read-first**.

## What Phase 89 adds

- Route registry + dispatcher (`/workspace`, `/home-alert/*`, `/runtime/health`, `/reports`, `/admin/reference`)
- Read-first APIs for summaries
- HTML shell + basic pages (Home / My Queue / SLA)
- Placeholders for Timeline/Kanban/Runtime/Reports/Admin Reference
- Test Console gate under 🧪 menu (CBV_TCS_V1)

## Route list

- `/workspace`
- `/home-alert/my-queue`
- `/home-alert/sla`
- `/home-alert/timeline` (placeholder)
- `/home-alert/kanban` (placeholder)
- `/runtime/health` (placeholder)
- `/reports` (placeholder)
- `/admin/reference` (placeholder)

## API list

- `CbvWebAppWorkspace_getRouteRegistry()`
- `CbvWebAppWorkspace_getRoute(route)`
- `CbvWebAppWorkspace_getHomeSummary()`
- `CbvWebAppWorkspace_getMyQueueSummary(userEmail)`
- `CbvWebAppWorkspace_getSlaSummary()`
- `CbvWebAppWorkspace_getRuntimeHealthSummary()`
- `CbvWebAppWorkspace_validate()`

## Renderer integration notes

- Web App `doGet` is now a dispatcher in `94_WEBAPP_WORKSPACE_RENDERER.js`.
- It preserves `action=ping` GET behavior for the existing webhook path.
- Routing is based on `e.pathInfo` (preferred) or `?route=/...` fallback.

## What is intentionally placeholder

- Timeline, Kanban, Runtime Health, Reports, Admin Reference viewer (Phase 90+).
- No write actions in Phase 89 pages.

## What not to do next

- No destructive writes.
- No uncontrolled automation.
- No AppSheet Bot.
- No auto assign.
- No auto resolve.
- No auto escalate.
- No production claim.
- No ENV-A, AI runtime, queue intelligence.

## Recommended next phase

**Phase 90 — WebApp Workspace Pilot Pages / Data Binding**

- Bind queue list fields and SLA stats to real columns consistently.
- Add manual actions only after explicit governance approval + audit trail.

