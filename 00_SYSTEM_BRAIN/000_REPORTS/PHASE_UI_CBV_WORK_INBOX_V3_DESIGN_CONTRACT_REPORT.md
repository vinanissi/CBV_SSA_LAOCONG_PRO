# PHASE UI — CBV_WORK_INBOX_V3 DESIGN CONTRACT REPORT

**Date:** 2026-05-29  
**Status:** GO  
**Standard:** CBV Operational Ecosystem Standard V1

---

## Summary

Created **CBV_WORK_INBOX_V3** design contract pack (operator-first Work Inbox target spec).

Prior pack aligned to current `apps/workboard` runtime (`/tasks`, cognition grouping) was **preserved** (not deleted) at:

`00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/_archive_runtime_baseline_20260529/`

---

## Created Folders

- `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3`
- `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/wireframes`
- `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/_archive_runtime_baseline_20260529` (relocated prior files)

---

## Created / Updated Files (canonical V3 target)

| File |
|------|
| `001_UI_PRINCIPLES.md` |
| `002_INFORMATION_ARCHITECTURE.md` |
| `003_SCREEN_MAP.md` |
| `004_LAYOUT_SPEC.md` |
| `005_COMPONENT_LIBRARY.md` |
| `006_DESIGN_TOKENS.md` |
| `007_USER_FLOW.md` |
| `008_ROUTING_CONTRACT.md` |
| `009_ROLE_PERMISSION.md` |
| `010_FOCUS_MODE_SPEC.md` |
| `011_SEARCH_SPEC.md` |
| `012_TASK_DETAIL_SPEC.md` |
| `013_ACCEPTANCE_CRITERIA.md` |
| `AI_IMPLEMENTATION_CONTRACT.md` |
| `wireframes/README.md` |
| `wireframes/desktop.md` |
| `wireframes/tablet.md` |
| `wireframes/mobile.md` |
| `wireframes/focus-mode.md` |

**Also:** `000_REPORTS/CBV_WORK_INBOX_V3_DESIGN_CONTRACT_PACK_REPORT.md` (first pass, still valid as history)

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Default entry `/inbox` | Work Inbox as operational front door — not raw TASK module |
| IA groups: Need Action / Waiting / Follow Up / Completed | Operator language; hides cognition/SLA internals |
| Focus Mode = **one task** | Reduces distraction vs dim-multi-card baseline |
| Top nav: Inbox, Hồ sơ, Tài chính, Tài liệu, Điều hành | ≤5 top-level items |
| `TaskCardModel` contract | Stable FE boundary for cards + deep links |
| Migration aliases `/tasks` → `/inbox` | Không phá runtime hiện hữu trong một bước |
| Archive prior pack | Append-only — no overwrite of first contract pass |

---

## Risks

| Risk | Mitigation |
|------|------------|
| This phase only creates design contract | No frontend code changed |
| Route mismatch vs `apps/workboard` (`/tasks`) | Documented aliases + archive baseline |
| Focus Mode differs from `focusQueueMode` session | Decision note in implementation phase |
| Mobile layout not in current shell (1366 min) | V3 requires responsive phase |
| Admin routes not in local FE yet | Stub/guard in implementation |

---

## Acceptance Check

- [x] UI principles created
- [x] IA created
- [x] Screen map created
- [x] Layout spec created
- [x] Component library created
- [x] Design tokens created
- [x] User flow created
- [x] Routing contract created
- [x] Role permission created
- [x] Focus mode spec created
- [x] Search spec created
- [x] Task detail spec created
- [x] Acceptance criteria created
- [x] AI implementation contract created
- [x] Wireframes created
- [x] Prior contract archived (not overwritten)
- [x] Report created

---

## Next Step

Run next phase:

**PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION**

Suggested order:

1. Route aliases + `/inbox` page shell
2. `TaskCardModel` adapter from API snapshot
3. Inbox groups (Need Action / Waiting / …)
4. Focus Mode panel (single task)
5. Mobile layout + bottom nav
6. Admin route guards
7. UAT against `013_ACCEPTANCE_CRITERIA.md`

---

## Git

No commit performed (not requested).

---

## AUTHORITY_NOTE (append-only — 2026-05-29)

**Superseded for governance coordination by:**

`00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/AUTHORITY/` + `README.md`

| This report described | Authority classification |
|-----------------------|-------------------------|
| **Target** operator-first pack + archive of pass 1 | **TO-BE contract creation** (pass 2) |

**Do not** infer code already implements `/inbox` or V3 groups from this report alone.  
See: `AUTHORITY/001_CURRENT_RUNTIME_TRUTH.md` (AS-IS) vs `002_TARGET_DESIGN_TRUTH.md` (TO-BE).

Full governance report: `PHASE_UI_CBV_WORK_INBOX_V3_AUTHORITY_PACK_REPORT.md`
