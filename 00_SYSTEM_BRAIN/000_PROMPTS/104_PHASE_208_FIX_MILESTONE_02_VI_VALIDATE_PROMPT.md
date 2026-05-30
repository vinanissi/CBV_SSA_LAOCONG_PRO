# 104 — Phase 208 Fix Milestone 02 VI validation + envelope (prompt archive)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Append-only** · 2026-05-14 · Branch `phase/from-v2.4.1-TASK-FIN`

## Problem

Drive bundle `103_MILESTONE_02_STAFF_WORKSPACE_*`: `VI_VALIDATE` ERROR → `REPORT_ENVELOPE` ERROR, `envelopeOk=false`, final FAIL despite other M02 checks passing.

## Root cause (confirmed in code)

`CbvWebAppVi_validate` in `998F_WEBAPP_VI_UX_COPY.js` required `CbvWebAppVi_getNavItems().length === 11` while Milestone 02 added two nav entries (`nav_staff_tasks`, `nav_staff_feedback`) → **13 items**. Hardcoded `11` caused deterministic VI failure.

## Fix direction

- Single source `CBV_WEBAPP_VI_NAV_PAIRS` for nav pairs + validate count/labels.
- Extend `frozen` route title list for staff workspace + `/staff/*` aliases.
- Add staff UX label keys to `CBV_WEBAPP_VI_LABELS`.
- M02 test console: rich `detail` on `VI_VALIDATE` check via `CbvTcsMilestone02StaffWorkspace__viValidateDetail_`.
- Phase 96 VI test console: update sorted route registry expectation for new paths.

## Expected next Drive prefix

`104_MILESTONE_02_STAFF_WORKSPACE_*` (append-only; do not alter `103_*`).
