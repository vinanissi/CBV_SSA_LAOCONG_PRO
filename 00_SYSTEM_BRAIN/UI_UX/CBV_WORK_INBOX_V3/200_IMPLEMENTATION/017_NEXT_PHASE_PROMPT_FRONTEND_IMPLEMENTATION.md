# NEXT PHASE PROMPT — PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION

Use this prompt only after **AUTHORITY_PACK** is complete.

---

## Must Read First

1. `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/000_DESIGN_AUTHORITY.md`
2. `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/100_TARGET_DESIGN/014_DATA_CONTRACT.md`
3. `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/200_IMPLEMENTATION/015_FRONTEND_IMPLEMENTATION_ROADMAP.md`
4. `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/100_TARGET_DESIGN/013_ACCEPTANCE_CRITERIA.md`
5. `00_SYSTEM_BRAIN/002_DECISIONS/ADR_001_CBV_WORK_INBOX_V3_WORK_INBOX_DECISION.md`
6. `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/000_CURRENT_RUNTIME/001_CURRENT_RUNTIME_TRUTH.md` (compatibility only)

---

## Phase Scope

Implement **Phase A only** unless explicitly asked otherwise:

```text
Phase A — Route Alias & Shell
```

---

## Hard Rules

- Do not implement all phases at once
- Do not remove `/tasks`
- Add `/inbox`
- `/` should route to `/inbox` (or redirect after login — decision in report)
- `/tasks` remains compatibility route
- No cognition primary UI change in Phase A
- Generate report
- No commit unless user requests

---

## Required Report

Create:

```text
00_SYSTEM_BRAIN/000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_A_ROUTE_ALIAS_REPORT.md
```

---

## Authority reminder

**AS-IS:** `/tasks`, `group=cognition` — still works after Phase A  
**TO-BE default:** `/inbox` — Phase A introduces route only
