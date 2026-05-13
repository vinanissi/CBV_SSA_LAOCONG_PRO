# PHASE 91 — WebApp Timeline / Kanban Read-First Pages

## Purpose

Promote `/home-alert/timeline` and `/home-alert/kanban` from Phase 90 placeholders to **read-first pages** backed by real HOME_ALERT data:

- Timeline: vertical list ordered by `UPDATED_AT` desc (fallback `CREATED_AT` desc).
- Kanban: columns grouped by `STATUS`, cards read-only.

## Scope / out of scope

In scope:

- Timeline read-first data binding (`CbvWebAppTimelineKanban_getTimelineData`).
- Kanban read-first grouping (`CbvWebAppTimelineKanban_getKanbanData`).
- Read-only renderer for both pages with structured state handling.
- Phase 91 Test Console (CBV_TCS_V1 envelope).
- HTML partials `WEBAPP_WORKSPACE_TIMELINE.html` / `WEBAPP_WORKSPACE_KANBAN.html`.
- Phase 90 placeholder routes (`/home-alert/timeline`, `/home-alert/kanban`) now delegate to Phase 91 renderer when available; Phase 90 fallback preserved.

Out of scope:

- Drag-drop writeback.
- Claim / resolve / escalate / assign buttons.
- Mutation API.
- Auto routing / auto assign / auto resolve / auto escalate.
- AI runtime.
- ENV-A.
- Queue intelligence.
- Production certification.

## Routes affected

- `/home-alert/timeline` → Phase 91 renderer (Phase 90 placeholder fallback).
- `/home-alert/kanban` → Phase 91 renderer (Phase 90 placeholder fallback).

## Safety rules (must remain visible on page + report)

- No auto assign
- No auto resolve
- No auto escalate
- No production claim
- No drag-drop save (read-first only)

## Implementation pointers

- Data: `05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js`
- Renderer: `05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js`
- Test console: `05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js`
- HTML: `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_TIMELINE.html`, `WEBAPP_WORKSPACE_KANBAN.html`
- Route bridge: `05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js` (`renderTimelinePlaceholder` / `renderKanbanPlaceholder`)
- Menu: `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js` → submenu `Phase 91 — Timeline / Kanban`.

## Next phase

Phase 92 — WebApp Runtime Health / Report Viewer Pages.
