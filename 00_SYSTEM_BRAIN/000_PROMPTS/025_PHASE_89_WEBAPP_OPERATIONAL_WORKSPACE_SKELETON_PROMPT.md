# PHASE 89 — WEBAPP OPERATIONAL WORKSPACE SKELETON — PROMPT

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

## Metadata

- **Repo**: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`
- **Branch**: `phase/from-v2.4.1-TASK-FIN`
- **Standards**: CBV Operational Ecosystem Standard V1; CBV Test Console Standard V1 (`CBV_TCS_V1`)

## Architecture decision (from Phase 88)

Final FE split:

- Sheets/GAS = operational database + runtime
- WebApp = operational workspace
- AppSheet = lightweight operator shell

## Mission

Start Phase 89 — build the first **WebApp Operational Workspace skeleton** (safe, read-first).

This phase is skeleton only:

- route registry + dispatcher
- FE test baseline
- read-first pages + basic HTML shell
- no destructive writes
- no automation-first
- no ENV-A
- no AI runtime
- no queue intelligence
- no production claim

## Core rules (must not violate)

- Runtime-first
- Memory-first
- Append-only
- Manual-first → Auto-later
- Audit-first
- Human-in-the-loop
- No destructive migration
- No uncontrolled automation
- No AppSheet Bot
- No auto assign
- No auto resolve
- No auto escalate
- No production claim

## Deliverables (files)

Runtime:

1. `05_GAS_RUNTIME/91_WEBAPP_WORKSPACE_CONFIG.js`
2. `05_GAS_RUNTIME/92_WEBAPP_WORKSPACE_ROUTES.js`
3. `05_GAS_RUNTIME/93_WEBAPP_WORKSPACE_API.js`
4. `05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js`
5. `05_GAS_RUNTIME/95_WEBAPP_WORKSPACE_TEST_CONSOLE.js`

HTML templates:

6. `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_SHELL.html`
7. `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_HOME.html`
8. `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_QUEUE.html`
9. `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_SLA.html`
10. `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_PLACEHOLDER.html`

Docs:

11. `docs/webapp/PHASE_89_WEBAPP_OPERATIONAL_WORKSPACE_SKELETON.md`
12. `docs/webapp/WEBAPP_ROUTE_REGISTRY.md`
13. `docs/webapp/WEBAPP_READ_FIRST_API.md`
14. `docs/webapp/WEBAPP_WORKSPACE_PAGE_MAP.md`
15. `docs/webapp/WEBAPP_FE_TEST_BASELINE.md`

Brain:

16. `00_SYSTEM_BRAIN/000_REPORTS/025_PHASE_89_WEBAPP_OPERATIONAL_WORKSPACE_SKELETON_REPORT.md`
17. `00_SYSTEM_BRAIN/001_HANDOFF/025_PHASE_89_WEBAPP_OPERATIONAL_WORKSPACE_SKELETON_HANDOFF.md`

Menu:

- Add submenu under **🧪 CBV Test Console** only: `Phase 89 — WebApp Workspace`

## Required routes

- `/workspace` → `HOME_WORKSPACE` (HOME, READ_FIRST)
- `/home-alert/my-queue` → `HOME_ALERT_MY_QUEUE` (QUEUE, READ_FIRST)
- `/home-alert/sla` → `HOME_ALERT_SLA_DASHBOARD` (SLA, READ_FIRST)
- `/home-alert/timeline` → `HOME_ALERT_TIMELINE` (PLACEHOLDER, READ_FIRST)
- `/home-alert/kanban` → `HOME_ALERT_KANBAN` (PLACEHOLDER, READ_FIRST)
- `/runtime/health` → `RUNTIME_HEALTH_DASHBOARD` (PLACEHOLDER, READ_FIRST)
- `/reports` → `REPORT_HANDOFF_VIEWER` (PLACEHOLDER, READ_FIRST)
- `/admin/reference` → `ADMIN_REFERENCE_VIEWER` (PLACEHOLDER, READ_FIRST)

## API requirements (read-first)

- `CbvWebAppWorkspace_getRouteRegistry()`
- `CbvWebAppWorkspace_getRoute(route)`
- `CbvWebAppWorkspace_getHomeSummary()`
- `CbvWebAppWorkspace_getMyQueueSummary(userEmail)`
- `CbvWebAppWorkspace_getSlaSummary()`
- `CbvWebAppWorkspace_getRuntimeHealthSummary()`
- `CbvWebAppWorkspace_validate()`

Envelope:

```js
{ ok, data, warnings, errors, checkedAt }
```

## Renderer requirements

- `CbvWebAppWorkspace_doGet(e)`
- `CbvWebAppWorkspace_render(route, params)`
- `CbvWebAppWorkspace_renderShell_(page)`
- `CbvWebAppWorkspace_renderHome_()`
- `CbvWebAppWorkspace_renderQueue_()`
- `CbvWebAppWorkspace_renderSla_()`
- `CbvWebAppWorkspace_renderPlaceholder_(route)`

Integration note:

- If existing `doGet` exists, preserve current behavior (e.g. webhook `ping`).

