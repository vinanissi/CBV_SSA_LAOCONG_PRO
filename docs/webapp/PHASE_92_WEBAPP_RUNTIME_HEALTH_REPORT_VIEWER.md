# PHASE 92 — WebApp Runtime Health / Report Viewer Pages

## Purpose

Promote `/runtime/health` and `/reports` from Phase 89 placeholders to **read-first observability pages**:

- `/runtime/health` — runtime health center: per-phase Test Console probe, route summary, report summary, warnings/errors.
- `/reports` — report viewer: list recent reports from `CBV_TEST_REPORTS` (if present), `SYSTEM_HEALTH_LOG`, and in-memory `PropertiesService` keys (read-only).

## Operational observability layer

Phase 92 is purely a **read-first observability surface**:

- It probes function presence (never *runs* heavy test consoles).
- It reads sheets it didn't create (no auto-create).
- It reads `PropertiesService` keys that other phases populate as a side-effect of their own test consoles.
- It renders structured state (`ready | partial | warning | empty | error`) and surfaces warnings/errors as data, not actions.

## Scope / out of scope

In scope:

- Runtime health center (`CbvWebAppObservability_getRuntimeHealth`).
- Recent report browser (`CbvWebAppObservability_getRecentReports`).
- Report detail lookup by ID (`CbvWebAppObservability_getReportDetail`).
- Trace summary across visible reports (`CbvWebAppObservability_getTraceSummary`).
- Read-first renderer for both pages with structured state handling.
- Phase 92 Test Console (CBV_TCS_V1 envelope).
- HTML partials `WEBAPP_RUNTIME_HEALTH.html`, `WEBAPP_REPORT_VIEWER.html`, `WEBAPP_OBSERVABILITY_COMPONENTS.html`.
- Routes `/runtime/health` and `/reports` now delegate to Phase 92 renderer when available; placeholder fallback preserved.

Out of scope:

- Deleting reports.
- Editing reports.
- Auto-healing.
- Auto-resolve.
- Auto-escalate.
- AI analysis.
- ENV-A.
- Queue intelligence.
- Production certification.

## Routes affected

- `/runtime/health` → Phase 92 renderer (`CbvWebAppObservability_renderRuntimeHealth`); placeholder fallback preserved.
- `/reports` → Phase 92 renderer (`CbvWebAppObservability_renderReportViewer`); placeholder fallback preserved.

## Safety rules (must remain visible on page + report)

- No auto-heal
- No auto resolve
- No auto escalate
- No production claim
- No delete report
- No edit report

## Implementation pointers

- Data: `05_GAS_RUNTIME/994_WEBAPP_OBSERVABILITY_DATA.js`
- Renderer: `05_GAS_RUNTIME/995_WEBAPP_OBSERVABILITY_RENDERER.js`
- Test console: `05_GAS_RUNTIME/996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js`
- HTML: `05_GAS_RUNTIME/html/WEBAPP_RUNTIME_HEALTH.html`, `WEBAPP_REPORT_VIEWER.html`, `WEBAPP_OBSERVABILITY_COMPONENTS.html`
- Route bridge: `05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js` (`renderRuntimeHealthPlaceholder` / `renderReportsPlaceholder`)
- Route dispatch: `05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js` (else-if branches for `/runtime/health` and `/reports`)
- Menu: `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js` → submenu `Phase 92 — Observability`.

## Next phase

Phase 93 — WebApp Admin Reference Viewer / Settings Read-First.
