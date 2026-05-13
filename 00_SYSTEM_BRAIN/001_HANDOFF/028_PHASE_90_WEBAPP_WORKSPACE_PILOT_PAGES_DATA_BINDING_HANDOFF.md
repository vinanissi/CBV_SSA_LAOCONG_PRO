# Handoff — Phase 90 WebApp Workspace Pilot Pages / Data Binding

## Scope (Phase 90)

- Improve WebApp pilot pages with **read-first data binding**.
- No write actions, no automation-first.

## Routes affected

- `/workspace` (pilot dashboard)
- `/home-alert/my-queue` (pilot cards)
- `/home-alert/sla` (pilot widgets)
- `/home-alert/timeline` (preview placeholder)
- `/home-alert/kanban` (preview placeholder)

## Data functions (Phase 90)

- `CbvWebAppPilotData_getHomeDashboard()`
- `CbvWebAppPilotData_getQueueCards(userEmail)`
- `CbvWebAppPilotData_getSlaWidgets()`
- `CbvWebAppPilotData_getTimelinePreview()`
- `CbvWebAppPilotData_getKanbanPreview()`
- `CbvWebAppPilotData_validate()`

## Renderer functions (Phase 90)

- `CbvWebAppPilotRenderer_renderHome()`
- `CbvWebAppPilotRenderer_renderQueue()`
- `CbvWebAppPilotRenderer_renderSla()`
- `CbvWebAppPilotRenderer_renderTimelinePlaceholder()`
- `CbvWebAppPilotRenderer_renderKanbanPlaceholder()`

Integration:

- `94_WEBAPP_WORKSPACE_RENDERER.js` uses pilot renderer when available, otherwise falls back to Phase 89 skeleton.

## Test console (Phase 90)

Menu:

- 🧪 CBV Test Console → Phase 90 — WebApp Pilot Pages

Functions:

- `CbvWebAppPilot_TestConsole_run()`
- `CbvWebAppPilot_TestConsole_showHomeDashboard()`
- `CbvWebAppPilot_TestConsole_showQueueCards()`
- `CbvWebAppPilot_TestConsole_showSlaWidgets()`
- `CbvWebAppPilot_TestConsole_copyLatestReport()`

## Known limitations

- Reads first 200 rows for pilot; widgets are best-effort with missing-column warnings.
- Timeline/Kanban are previews only (Phase 91 will implement full read-first pages).

## What not to do next

- No mutations (claim/resolve/escalate).
- No AppSheet Bot.
- No auto assign / resolve / escalate.
- No ENV-A, AI runtime, queue intelligence.
- No production claim.

## Recommended next phase

**Phase 91 — Timeline/Kanban Read-First Pages**

