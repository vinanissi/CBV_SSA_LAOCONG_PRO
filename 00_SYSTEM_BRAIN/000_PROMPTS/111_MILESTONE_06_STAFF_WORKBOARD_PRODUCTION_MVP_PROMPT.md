# 111 — Milestone 06 Staff Workboard Production MVP — Prompt archive

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Repo:** `CBV_SSA_LAOCONG_PRO` · **Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Standards:** CBV Operational Ecosystem Standard V1 · `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/docs/CBV_TCS_V1_STANDARD.md`  
**Drive (TCS):** folder `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`

This file records the **M06** implementation request (staff workboard MVP). The full original multi-phase specification (601–608, DONE criteria, CONSTRAINTS, EXPECTED OUTPUT) was provided in the Cursor session **2026-05-14** as the user message titled *M06 — STAFF WORKBOARD PRODUCTION MVP*.

## Implemented mapping (summary)

| Phase | Scope |
|-------|--------|
| 601 | `CbvWebAppRoute_parseRouteAndParams_` / merge / normalize + `doGet` wiring (`998H`, `94`) |
| 602 | Routes `/workspace/workboard`, `/workboard`; model `998Y` |
| 603 | Production task cards + required CSS markers |
| 604 | `CbvAppSheetBridge_*` Script Properties only; safe-disabled copy |
| 605 | Mobile-first markers (sticky urgent, bottom nav wrapper, filter chips, XL CTA) |
| 606 | VI `nav_workboard`, primary nav, role-home STAFF, staff bottom nav, SOP `/workspace/sop` |
| 607 | `998Z` + menu **Run Milestone 06 Staff Workboard Production MVP Test** |
| 608 | Local `111_*` REPORT / HANDOFF / DECISION |

## Test entrypoint

- Function: `CbvTcsMilestone06StaffWorkboard_TestConsole_runFull`
- Drive `tagStem`: `MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP`

## Git

Commit message used: `phase: add milestone 06 staff workboard production mvp`
