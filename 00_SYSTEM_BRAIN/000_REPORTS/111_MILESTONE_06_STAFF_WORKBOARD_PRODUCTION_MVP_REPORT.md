# 111 — Milestone 06 Staff Workboard Production MVP — Local report

**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Standard:** CBV Operational Ecosystem V1 · CBV_TCS_V1  
**Drive folder:** `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG` — expect bundle prefix `111_MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP_*` when sequence reaches 111 (Drive exporter uses next numeric prefix from folder scan).

## Files created

- `05_GAS_RUNTIME/998Y_WEBAPP_STAFF_WORKBOARD_PRODUCTION.js` — workboard model/group/rank/render + AppSheet bridge (Script Properties keys only; no real appId in repo).
- `05_GAS_RUNTIME/998Z_MILESTONE_06_STAFF_WORKBOARD_TEST_CONSOLE.js` — one-click test `CbvTcsMilestone06StaffWorkboard_TestConsole_runFull`.
- `05_GAS_RUNTIME/html/WEBAPP_STAFF_WORKBOARD.html` — workboard shell body.
- `00_SYSTEM_BRAIN/000_PROMPTS/111_MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP_PROMPT.md` — prompt archive.
- This report; matching handoff and decision under `001_HANDOFF/` and `002_DECISIONS/`.

## Files updated

- `05_GAS_RUNTIME/998H_WEBAPP_ROUTE_URL_HELPER.js` — `CbvWebAppRoute_parseRouteAndParams_`, `CbvWebAppRoute_mergeParams_`, `CbvWebAppRoute_normalizePath_`, `CbvWebAppRouteUrl_buildWithQuery`, frozen set + route map (`workboardWs`, `workboardAlias`), `getNavItemsVi` +1 row.
- `05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js` — `CbvWebAppWorkspace__parseDoGetRoute_`, render branch for `STAFF_WORKBOARD`.
- `05_GAS_RUNTIME/91_WEBAPP_WORKSPACE_CONFIG.js` — `CBV_WEBAPP_WS_PAGE_TYPES.STAFF_WORKBOARD`.
- `05_GAS_RUNTIME/92_WEBAPP_WORKSPACE_ROUTES.js` — `/workspace/workboard`, `/workboard`.
- `05_GAS_RUNTIME/998F_WEBAPP_VI_UX_COPY.js` — `nav_workboard`, route titles, primary nav pair, `getWebAppLinks`, VI frozen routes.
- `05_GAS_RUNTIME/998Q_WEBAPP_STAFF_OPERATION_WORKSPACE.js` — bottom nav workboard first; task card URLs use `buildWithQuery` + SOP `/workspace/sop`.
- `05_GAS_RUNTIME/998O_WEBAPP_OPERATIONAL_UX_MILESTONE01.js` + `html/WEBAPP_WORKSPACE_ROLE_HOME.html` — `workboardUrl` for STAFF block.
- `05_GAS_RUNTIME/998G_WEBAPP_VI_UX_TEST_CONSOLE.js`, `05_GAS_RUNTIME/998I_WEBAPP_ROUTE_URL_TEST_CONSOLE.js` — nav count / route registry expected paths aligned with M06.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js`, `90_BOOTSTRAP_MENU_WRAPPERS.js` — Test Console M06 items.
- `05_GAS_RUNTIME/96_WEBAPP_DOGET_DISPATCHER.js`, `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` — supported query examples include workboard routes.
- `.clasp.json` — push order `998Y`, `998Z` before `96_*`.

## Status summary

| Area | Status |
|------|--------|
| Query param fix (`route` + inner `?taskId=` + encoded + `&taskId=`) | Implemented in `998H` + `94` |
| Workboard routes + model + groups | Implemented in `998Y` + `92`/`91`/`94` |
| Production task cards + markers | Implemented in `998Y` + hidden probe row in HTML |
| AppSheet bridge safe-disabled | Implemented; no hardcoded App ID |
| Mobile-first markers | Implemented in workboard HTML/CSS classes |
| Integration (staff/SOP/feedback/detail) | Links via `CbvWebAppRouteUrl_buildWithQuery` |
| Test menu | Run Milestone 06 Staff Workboard Production MVP Test |
| Runtime verify | **Pending:** run menu in GAS; confirm Drive bundle + `envelopeOk` |

## Next step

1. `clasp push` then in bound Sheet: **🧪 CBV Test Console → Run Milestone 06 Staff Workboard Production MVP Test**.  
2. Confirm Drive files and `GO` / `GO_WITH_WARNINGS` with `envelopeOk: true`.  
3. Only then: `git tag milestone-06-staff-workboard-production-mvp` (per user policy).

## Warnings

- Local GAS execution not run in this session; Drive export depends on `DriveApp` + folder access.
