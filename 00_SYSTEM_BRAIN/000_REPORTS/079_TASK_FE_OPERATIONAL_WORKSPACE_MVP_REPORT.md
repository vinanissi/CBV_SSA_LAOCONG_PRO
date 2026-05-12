# 079 — TASK FE Operational Workspace MVP Report

- **phase:** PHASE_79_TASK_FE  
- **status (engineering self-check):** GO_WITH_WARNINGS (expected until real TASK_MAIN + TASK service bind)  
- **productionReadiness:** NOT_READY  
- **checkedAt (repo):** 2026-05-12  
- **contractVersion:** 2.0.0 (aligned with `CBV_TEST_CONSOLE_REPORT_CONTRACT.js`)  
- **appendOnlyNote:** File created as Phase 79 artefact; subsequent runs should add new timestamped rows/files per org policy — do not rewrite history in TASK audit sheets.

## Summary

Delivered minimal operational HTML modals (Home, Focus, Detail/Timeline, Admin) plus isolated TASK FE test console entries under **🧪 CBV Test Console**. Services read `TASK_MAIN` / related sheets when present; otherwise a **safe mock** is used with explicit warnings. Actions delegate to TASK module functions (`taskStartAction`, `setTaskStatus`, `taskCompleteAction`, `updateTask`) when the bound project includes them; otherwise the UI explains that only timeline append / non-destructive logging occurred.

## Checks (high level)

| Code                         | Result | Notes                                                |
| ---------------------------- | ------ | ---------------------------------------------------- |
| MENU_WORKSPACE               | OK     | `buildTaskFeWorkspaceMenu_` in `79_TASK_FE_MENU.js` |
| MENU_TEST_SEPARATE           | OK     | TASK FE tests only in `CBV_TEST_CONSOLE_MENU.js`   |
| HOME_SERVICE                 | OK     | `TASK_FE_Home_getSnapshot`                         |
| FOCUS_SERVICE                | WARN   | Depends on valid TASK_ID in real DB                 |
| TIMELINE_SERVICE             | OK     | Reads logs when sheets exist                       |
| ADMIN_SERVICE                | OK     | Aggregates from TASK_MAIN or mock                  |
| HTML_TEMPLATES               | OK     | `79_TASK_FE_*.html`                                |
| REPORT_CONTRACT              | OK     | Uses `CBV_TestConsole_buildReportEnvelope_`         |
| NO_DESTRUCTIVE_OPS (design) | OK     | No sheet deletes / audit overwrites in Phase 79 path |

## Warnings

1. **onOpen hook:** `buildTaskFeWorkspaceMenu_()` is **not** auto-wired from this repo’s `main-control` `onOpen` (out of scope). Bound spreadsheet must call it alongside existing menus.  
2. **TASK service:** Production-core may run without `apps-script/task` functions — actions return `TASK_SERVICE_UNAVAILABLE` until library/bind is configured.  
3. **Pilot:** No real-data pilot, permission matrix, or append-only Drive export verification is claimed here.

## Errors

None blocking code delivery in-repo. Runtime FAIL is possible if HTML files are not deployed to the Apps Script project.

## Next step

1. Add `buildTaskFeWorkspaceMenu_()` to the spreadsheet `onOpen` for the deployment that carries `production-core`.  
2. Bind TASK spreadsheet + enable TASK library so `TASK_FE_Focus_applyAction` hits real services.  
3. Run **TASK FE Smoke Test** from 🧪 menu in Sheets and confirm `status` is **GO** on real data.  
4. Pilot with operators; collect UX feedback without redesign scope creep.

## AI handoff (short)

Phase 79 adds operator-facing TASK workspace UIs in `apps-script/production-core/src/79_TASK_FE_*`, hooks test menu only, and reuses CBV Test Console report envelope. FE calls server functions only; business rules stay in `*SERVICE.js`. Remaining gap: wire `onOpen`, bind real TASK DB + permissions, validate action flows on production-like data — **do not mark PRODUCTION READY** until those are done.
