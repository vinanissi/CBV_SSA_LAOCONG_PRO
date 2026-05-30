# PHASE UI DB Design Audit — AI Handoff

**To:** Next agent / product owner  
**From:** `PHASE_UI_DB_DESIGN_AUDIT` (audit-only)  
**Date:** 2026-05-30  
**Report:** `00_SYSTEM_BRAIN/000_REPORTS/PHASE_UI_DB_DESIGN_AUDIT_REPORT.md`  
**Standard:** CBV Operational Ecosystem Standard V1

---

## What was delivered

1. **Full UI ↔ DB audit** of `apps/workboard` against `DEV_FIN_CBV_SSA_LAOCONG_DB` (sheet list via schema manifest + Spreadsheet ID `1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE`).
2. **IA findings:** dual inbox models, broken sidebar links, missing HO_SO split, HOME_ALERT not primary inbox source.
3. **Permission gaps:** `ROLE_PERMISSION_MATRIX` / `FEATURE_FLAG` exist in DB but UI uses hard-coded matrix.
4. **Action gaps:** list quick actions wired; Focus V3 actions still disabled stubs.
5. **TO-BE wireframes** (text) for Inbox, Task drawer, HoSo, Test Console, Health, Permission admin.
6. **5-phase implementation plan** — no code changed in this phase.

---

## Read first (mandatory order)

1. `000_REPORTS/PHASE_UI_DB_DESIGN_AUDIT_REPORT.md` (this audit)
2. `UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/004_AI_READ_ORDER.md`
3. `000_REPORTS/PHASE_TASK_PERMISSION_AUDIT_REPORT.md` (security baseline)
4. `apps/workboard/src/app/routes.tsx` + `OperatorMainSidebar.tsx`

---

## Critical findings (do not ignore)

| ID | Issue | Blocker for production? |
|----|-------|-------------------------|
| C1 | `TASK_MAIN` snapshot may return all rows — no `canUserSeeTask` on list | **YES** |
| C2 | Dual task sheets: `TASK_MAIN` (GS_01) vs `TASKS` (RF12) | **YES** for data truth |
| C3 | Focus Mode actions disabled — operators cannot complete in focus | **YES** for UX goal |
| C4 | Sidebar links `/observe`, `/config` → 404 | **YES** for operator trust |
| C5 | Permission not read from `ROLE_PERMISSION_MATRIX` | **YES** for governance |

---

## Recommended next phase

**`PHASE_UI_DB_DESIGN_IMPLEMENTATION_01`** — narrow scope:

- Fix sidebar routes
- Wire Focus V3 → `useInlineExecution`
- Single inbox grouping default (V3 groups; hide cognition)
- HOME_ALERT KPI in inbox header

**Not in phase 1:** permission sheet reader, HoSo tabs, Test Console page.

Prompt stub is in audit report §J.

---

## DB sheet quick map (operator-relevant)

| Sheet | Operator UI should… |
|-------|---------------------|
| `HOME_ALERT` | Drive inbox priority + alert header |
| `TASK_MAIN` | Task state + writes |
| `TASK_UPDATE_LOG` | Timeline (append-only) |
| `HO_SO_MASTER` (+ types) | Hồ sơ tabs |
| `ROLE_PERMISSION_MATRIX` | Gate buttons (future) |
| `FEATURE_FLAG` | Toggle modules (admin) |
| `SYSTEM_HEALTH_LOG` / `CBV_TEST_REPORTS` | Admin health only |
| `TASKS`, `TASK_TIMELINE`, `API_AUDIT_LOG` | Legacy RF12 — do not expose in operator UI |

---

## Operator menu TO-BE (summary)

```text
Operator (≤5): Inbox | Hồ sơ | Tài chính | (Tài liệu) | Admin▾
Admin▾: Cảnh báo | Health | Phân quyền | Feature Flag
Test Console: separate URL, NOT in operator sidebar
```

---

## Do NOT

- Modify this audit report (append-only)
- Auto-run Test Console or destructive GAS from UI
- Mix Test Console into operator nav
- Hard-code new permission rules in FE when implementing phase 4
- Delete or rename DB sheets (`TASKS`, `HO_SO_*`, etc.)

---

## Excel file note

`DEV_FIN_CBV_SSA_LAOCONG_DB.xlsx` was **not found in repo** during audit. Before implementation phase 2+, export sheet tab list from live spreadsheet and append a diff section to the audit report if names differ from `90_BOOTSTRAP_SCHEMA.js`.

---

## Git

No commit performed (not requested).

---

*Append-only handoff — PHASE_UI_DB_DESIGN_AUDIT — 2026-05-30*
