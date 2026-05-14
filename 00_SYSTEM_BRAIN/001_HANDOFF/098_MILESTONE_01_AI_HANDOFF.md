# 098 — Milestone 01 — AI Handoff

## Context

Branch: `phase/from-v2.4.1-TASK-FIN`. Milestone 01 adds internal operational workspace UX (loading/empty/mobile/large actions), role-based home, guided SOP inline, today operations dashboard routes, and a **single Test Console menu** run that exports a six-file append-only bundle to Drive folder `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`.

## Key entry points

- **GAS UX / routing:** `998O_WEBAPP_OPERATIONAL_UX_MILESTONE01.js`; routes in `92_WEBAPP_WORKSPACE_ROUTES.js`; renderer branches in `94_WEBAPP_WORKSPACE_RENDERER.js`.
- **Shell / components:** `html/WEBAPP_WORKSPACE_SHELL.html`, `html/WEBAPP_WORKSPACE_COMPONENTS.html`.
- **Test + Drive bundle:** `998P_MILESTONE_01_OPERATIONAL_WORKSPACE_TEST_CONSOLE.js` (`CbvTcsMilestone01OpWorkspace_TestConsole_runFull`), exporter `CbvTcsDriveReport_exportMilestoneFullTestBundle` in `998L_TEST_CONSOLE_DRIVE_REPORT_EXPORTER.js`.
- **Menus:** `90_BOOTSTRAP_MENU.js` + `90_BOOTSTRAP_MENU_WRAPPERS.js` — items `menuCbvTestConsoleMilestone01_runFull`, `menuCbvTestConsoleMilestone01_copyReport`.

## What to verify next

1. After deploy, open WebApp with `?route=/workspace/today` and `?route=/workspace/role-home` and `?route=/workspace/guided`.
2. Run the Milestone 01 Test Console item; confirm six Drive files and `status` in the JSON report.
3. If `CbvWebAppVi_validate` or `CbvWebAppRouteUrl_validate` fails, fix frozen-route / nav drift before tagging.

## Contract

- Report envelope: **CBV_TCS_V1** (fields per `998N` / standard doc).
