# WebApp Route Freeze Matrix (Phase 94)

Authoritative matrix of WebApp routes frozen at pilot tier. Source of truth: `CbvWebAppUiFreeze_getRouteFreezeMatrix()` in `05_GAS_RUNTIME/998B_WEBAPP_UI_FREEZE_AUDIT.js`. Cross-verified against `CbvWebAppWorkspace_routeRegistry()` in `05_GAS_RUNTIME/92_WEBAPP_WORKSPACE_ROUTES.js`.

---

## 1. Operational routes

| # | Route | Owner | Mode | Status | Page | Expected renderer | Required role | Manual test URL |
|---|-------|-------|------|--------|------|-------------------|---------------|------------------|
| 1 | `/workspace` | WebApp | READ_FIRST | PILOT | Home Workspace | `CbvWebAppPilotRenderer_renderHome` | * | `?route=/workspace` |
| 2 | `/home-alert/my-queue` | WebApp + AppSheet lightweight shell | READ_FIRST | PILOT | My Queue | `CbvWebAppPilotRenderer_renderQueue` | * | `?route=/home-alert/my-queue` |
| 3 | `/home-alert/sla` | WebApp | READ_FIRST | PILOT | SLA Dashboard | `CbvWebAppPilotRenderer_renderSla` | * | `?route=/home-alert/sla` |
| 4 | `/home-alert/timeline` | WebApp | READ_FIRST | PILOT | Timeline | `CbvWebAppTimelineKanban_renderTimeline` | * | `?route=/home-alert/timeline` |
| 5 | `/home-alert/kanban` | WebApp | READ_FIRST | PILOT | Kanban | `CbvWebAppTimelineKanban_renderKanban` | * | `?route=/home-alert/kanban` |
| 6 | `/runtime/health` | WebApp | READ_FIRST | PILOT | Runtime Health | `CbvWebAppObservability_renderRuntimeHealth` | ADMIN | `?route=/runtime/health` |
| 7 | `/reports` | WebApp | READ_FIRST | PILOT | Report Viewer | `CbvWebAppObservability_renderReportViewer` | ADMIN | `?route=/reports` |
| 8 | `/admin/reference` | WebApp | READ_FIRST | PILOT | Admin Reference Viewer | `CbvWebAppAdminRef_renderReferenceViewer` | ADMIN | `?route=/admin/reference` |

## 2. Support endpoints

| Endpoint | Owner | Mode | Status | Handler | Manual test URL |
|----------|-------|------|--------|---------|------------------|
| `?action=ping` | WebApp dispatcher | READ_ONLY | SUPPORT | `999_WEBAPP_DOGET_DISPATCHER_FINAL` | `?action=ping` |

## 3. Freeze rules

- **No new operational route** may be added without bumping a new phase and updating this matrix.
- **No mode drift.** Every operational route must remain `READ_FIRST` until a future, explicitly-named mutation phase changes it.
- **No renderer name change** without updating both the matrix and `CbvWebAppUiFreeze_getRouteFreezeMatrix()`.
- **No production claim** in any per-route doc or report.

## 4. Validation

Run `🧪 CBV Test Console → Phase 94 — UI Freeze / UAT → Run UI Freeze Health Check`. The Test Console asserts:

- Every route in this matrix is registered in `CbvWebAppWorkspace_routeRegistry()`.
- Every registered mode equals the frozen mode.
- No frozen route is missing.
- `?action=ping` handler exists (covered by Phase 89.2 dispatcher tests).

## 5. Manual smoke

For each operational route, open the manual test URL on the live deployment and confirm:

1. Page renders without a white screen.
2. Page title matches the matrix.
3. `READ_FIRST` badge present.
4. Safety footer present with exact phrases (Timeline / Kanban also include `No drag-drop save`).
5. No edit / toggle / delete / save / drag-drop affordances are visible.
6. Warnings / errors render as text + badge (not colour only).

## 6. Future polish guard

Polish work on these routes (typography, spacing, badge colours) is allowed **only if**:

- The route + mode + renderer + safety phrases are unchanged.
- No new mutation surface is introduced.
- The Phase 94 Test Console still returns GO or GO_WITH_WARNINGS.
