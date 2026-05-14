# 107 — Milestone 04 — AI handoff

## Intent

Deliver execution cockpit (task detail + execution aliases), focus mode, action stack V1, blocker resolution copy, cognition guide, inline SOP + mini timeline, markers for TCS probe, and Milestone 04 Test Console with Drive bundle stem `MILESTONE_04_OPERATION_EXECUTION_FLOW`.

## Key integration points

- **Renderer:** `FOCUS_MODE` → `CbvExecFlow_renderFocusPage_`. Task detail routes unchanged; body now from `CbvExecFlow_renderTaskExecutionBodyHtml_` when `998U` is present.
- **Routes:** New paths must stay in `998H` `CBV_WEBAPP_ROUTE_URL_FROZEN` (sorted) and `CbvWebAppRouteUrl_getRouteMap()` values must match that set exactly.
- **VI:** `998F` frozen route list + `CBV_WEBAPP_VI_ROUTE_PAGE_TITLE` + `nav_focus` label + primary nav pair for `/workspace/focus`.
- **Tests:** `998V` depends on `998P` envelope helpers and `998L` Drive exporter; push order: `998Q`, `998S`, `998U`, `998T`, `998V`.

## Safety (unchanged product rules)

No auto assign / resolve / escalate; no Claim / Hoàn tất CTAs in WebApp stack; feedback routes are safe sinks only.

## Follow-up for human

1. `clasp push` and run **Run Milestone 04 Operation Execution Flow Test** from Sheets UI.  
2. Audit Drive bundle; then optionally tag per user runbook.  
3. If `ROUTE_URL_VALIDATE` fails, diff sorted `Object.values(getRouteMap())` vs `CBV_WEBAPP_ROUTE_URL_FROZEN`.
