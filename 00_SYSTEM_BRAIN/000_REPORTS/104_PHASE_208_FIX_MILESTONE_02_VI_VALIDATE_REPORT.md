# 104 — Phase 208 Fix Milestone 02 VI validate (local report)

**Append-only** · 2026-05-14

## Audit source

- Failed Drive evidence: `103_MILESTONE_02_STAFF_WORKSPACE_*` (VI_VALIDATE ERROR, REPORT_ENVELOPE ERROR, `envelopeOk=false`).
- Prior local notes: `103_MILESTONE_02_STAFF_OPERATION_WORKSPACE_REPORT.md`.

## Root cause

`CbvWebAppVi_validate` enforced **exactly 11** nav items (`Nav must expose exactly 11 items`). After Milestone 02, `CbvWebAppVi_getNavItems()` returns **13** items (added `/workspace/staff/tasks` and `/workspace/staff/feedback`). Route page titles for staff routes were already present; the **count guard** was stale.

## Files updated

- `05_GAS_RUNTIME/998F_WEBAPP_VI_UX_COPY.js` — `CBV_WEBAPP_VI_NAV_PAIRS`; validate uses `CBV_WEBAPP_VI_NAV_PAIRS.length`, per-nav label checks, extended `frozen` route list for staff + alias paths; `detail` now includes `missingRoutes`, `missingLabels`, `navExpectedCount`, `navActualCount`, `labelKeysCount`, `routeKeysCount` (renamed from ambiguous `labelKeys`/`routeKeys` arrays on `detail`).
- `05_GAS_RUNTIME/998R_MILESTONE_02_STAFF_WORKSPACE_TEST_CONSOLE.js` — `CbvTcsMilestone02StaffWorkspace__viValidateDetail_`; `VI_VALIDATE` check `detail` populated for audit.
- `05_GAS_RUNTIME/998G_WEBAPP_VI_UX_TEST_CONSOLE.js` — `ROUTE_PATHS_UNCHANGED` expected sorted path string updated for staff routes (removes false “drift” warning).

## Files created

- `00_SYSTEM_BRAIN/000_PROMPTS/104_PHASE_208_FIX_MILESTONE_02_VI_VALIDATE_PROMPT.md`
- This report
- `00_SYSTEM_BRAIN/001_HANDOFF/104_PHASE_208_FIX_MILESTONE_02_VI_VALIDATE_AI_HANDOFF.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/104_PHASE_208_FIX_MILESTONE_02_VI_VALIDATE_DECISION.md`

## Route / label mappings added

- **Labels:** `staff_task_title`, `staff_task_detail_title`, `staff_feedback_title`, `staff_empty_state`, `staff_next_action`, `staff_quick_action`, `staff_sla`, `staff_priority`, `staff_blocked`, `staff_pending`, `staff_feedback_stuck`, `staff_feedback_help`, `staff_read_first_note` (for templates/runtime copy; nav keys unchanged).
- **Frozen VI routes:** all six staff paths plus existing operational routes.

## Validator / test detail

- `CbvWebAppVi_validate().data` carries audit-friendly fields when failing.
- M02 Test Console attaches `CbvTcsMilestone02StaffWorkspace__viValidateDetail_(vu)` to the `VI_VALIDATE` check row.

## REPORT_ENVELOPE rule

Unchanged: if `VI_VALIDATE` is ERROR, final run is FAIL and `envelopeOk` stays false until VI passes.

## M01 regression

- `/workspace/role-home`, `/workspace/today`, `/workspace/guided` titles unchanged.
- Nav pairs preserve M01 ordering with staff entries inserted after guided.
- `CbvTcsMilestone01OpWorkspace_TestConsole_runFull` still calls the same `CbvWebAppVi_validate`; it benefits from the fix.

## Expected next Drive prefix

`104_MILESTONE_02_STAFF_WORKSPACE_*`

## Tag readiness

**Not tagged** — await real GAS run + Drive bundle `104_*` with GO / GO_WITH_WARNINGS and `envelopeOk=true`.

## Local test result

GAS not executed in Cursor; re-run **Run Milestone 02 Staff Workspace Test** after `clasp push`.
