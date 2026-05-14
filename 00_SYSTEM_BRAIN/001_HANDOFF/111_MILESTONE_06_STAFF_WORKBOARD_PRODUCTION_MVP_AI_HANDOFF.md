# AI Handoff — 111 Milestone 06 Staff Workboard Production MVP

## Intent

Deliver the staff-facing **workboard** as the primary operational surface: grouped queues, production task cards, fixed **WebApp route + query** parsing (`taskId` no longer swallowed into the route path), **AppSheet-safe** links from Script Properties only, and **M06 Test Console** with Drive six-file bundle (`tagStem`: `MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP`).

## What shipped (code)

- **Route/query:** `CbvWebAppRoute_parseRouteAndParams_`, `CbvWebAppRoute_mergeParams_`, `CbvWebAppRoute_normalizePath_` in `998H`; `CbvWebAppWorkspace__parseDoGetRoute_` in `94` merges embedded and top-level params before `CbvWebAppWorkspace_render`.
- **URLs with params:** `CbvWebAppRouteUrl_buildWithQuery(routePath, { taskId, type, ... })` for canonical `?route=...&taskId=...`.
- **Workboard:** `998Y` — `CbvStaffWorkboard_getModel_`, `readTasks_`, `groupTasks_`, `rankTasks_`, `getSummary_`, `renderPage_`; reuses `CbvStaffWorkspace_*` HOME_ALERT adapter; empty states without throwing.
- **Routes:** `/workspace/workboard`, `/workboard`; page type `STAFF_WORKBOARD`.
- **VI + nav:** `nav_workboard`, primary nav entry, route titles; role home STAFF CTA “Báo việc”; staff bottom nav leads with workboard.
- **Tests:** `998Z` — `CbvTcsMilestone06StaffWorkboard_TestConsole_runFull` + copy helper; menu label **Run Milestone 06 Staff Workboard Production MVP Test**.

## Config (operator)

AppSheet (optional; all Script Properties):

- `CBV_APPSHEET_APP_ID`, `CBV_APPSHEET_BASE_URL` (https), `CBV_APPSHEET_TASK_DETAIL_VIEW`, `CBV_APPSHEET_TASK_FORM_VIEW`, `CBV_APPSHEET_UPLOAD_VIEW`, `CBV_APPSHEET_FEEDBACK_VIEW`

If unset: UI shows **“Chưa cấu hình AppSheet link”** (no fake URLs).

## Verification checklist

1. Open WebApp: `?route=/workspace/staff/task-detail&taskId=HAL_xxx` and `?route=/workspace/staff/task-detail?taskId=HAL_xxx` — detail page loads.  
2. `/workspace/workboard` and `/workboard` render workboard.  
3. Run M06 test from Sheet menu; confirm Drive bundle and envelope.  
4. Regression: M01–M05 routes still in registry; `CbvWebAppVi_validate` and `CbvWebAppRouteUrl_validate` should pass after push.

## Tag policy

Do **not** tag until Drive evidence shows `GO` or `GO_WITH_WARNINGS` with `envelopeOk: true` (user rule).
