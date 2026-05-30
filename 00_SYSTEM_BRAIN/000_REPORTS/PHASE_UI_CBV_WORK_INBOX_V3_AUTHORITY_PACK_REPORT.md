# PHASE UI — CBV_WORK_INBOX_V3 AUTHORITY PACK REPORT

**Date:** 2026-05-29  
**Phase:** `PHASE_UI_CBV_WORK_INBOX_V3_AUTHORITY_PACK`  
**Status:** GO  
**Standard:** CBV Operational Ecosystem Standard V1  
**Type:** Documentation / governance only — **no runtime code changes**

---

## Summary

Chuẩn hóa **CBV_WORK_INBOX_V3** thành **Design Authority Pack** duy nhất:

- Tách rõ **CURRENT RUNTIME (AS-IS)** vs **TARGET DESIGN (TO-BE)**
- Ma trận nguồn sự thật + AI read order + misread guardrails
- Điều phối hai report contract trước đó (không xóa)

---

## Problem solved

| Risk | Mitigation |
|------|------------|
| AI đọc `/tasks` + cognition là thiết kế cuối | `006_COMMON_MISREAD_GUARDRAILS.md` |
| Hai report mâu thuẫn (runtime vs target) | `003_SOURCE_OF_TRUTH_MATRIX.md` |
| Archive bị nhầm là spec chính | Labeled HISTORICAL in index |
| focusQueueMode nhầm V3 Focus | `005_MIGRATION_BOUNDARY.md` |

---

## Created folders

```text
00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/AUTHORITY/
```

---

## Created / updated files

| File | Action |
|------|--------|
| `UI_UX/CBV_WORK_INBOX_V3/README.md` | Created — pack entry |
| `AUTHORITY/000_AUTHORITY_INDEX.md` | Created |
| `AUTHORITY/001_CURRENT_RUNTIME_TRUTH.md` | Created |
| `AUTHORITY/002_TARGET_DESIGN_TRUTH.md` | Created |
| `AUTHORITY/003_SOURCE_OF_TRUTH_MATRIX.md` | Created |
| `AUTHORITY/004_AI_READ_ORDER.md` | Created |
| `AUTHORITY/005_MIGRATION_BOUNDARY.md` | Created |
| `AUTHORITY/006_COMMON_MISREAD_GUARDRAILS.md` | Created |
| `AI_AUTHORITY_ADDENDUM.md` | Created — binding addendum |
| `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_AUTHORITY_PACK_REPORT.md` | Created (this file) |

### Append-only notes (existing reports)

| File | Note |
|------|------|
| `CBV_WORK_INBOX_V3_DESIGN_CONTRACT_PACK_REPORT.md` | `AUTHORITY_NOTE` section appended |
| `PHASE_UI_CBV_WORK_INBOX_V3_DESIGN_CONTRACT_REPORT.md` | `AUTHORITY_NOTE` section appended |

**Not modified:** `001`–`013` target specs, `AI_IMPLEMENTATION_CONTRACT.md` body, `apps/workboard/**`

---

## Design decisions

| Decision | Rationale |
|----------|-----------|
| `AUTHORITY/` subfolder | Single governance namespace |
| Code > 001 doc > target specs for AS-IS behavior | Runtime-first |
| Root `001–013` remain TO-BE normative | No rename — avoid churn |
| Archive stays read-only historical | Append-only ecosystem |
| No code in authority phase | User charter |

---

## Two prior reports — authoritative reading

| Report | Role after authority pack |
|--------|-------------------------|
| `CBV_WORK_INBOX_V3_DESIGN_CONTRACT_PACK_REPORT.md` | **History** — pass 1 documented runtime-aligned pack |
| `PHASE_UI_CBV_WORK_INBOX_V3_DESIGN_CONTRACT_REPORT.md` | **History** — pass 2 created target + archive |

**Single coordination point:** `UI_UX/CBV_WORK_INBOX_V3/README.md` + `AUTHORITY/000`

---

## Acceptance check

- [x] Authority index created
- [x] Current runtime truth documented (`/tasks`, cognition, focusQueueMode)
- [x] Target design truth linked to `001`–`013`
- [x] Source-of-truth matrix created
- [x] AI read order created
- [x] Migration boundary documented
- [x] Misread guardrails created
- [x] Prior reports annotated (append-only)
- [x] No frontend/runtime code changed
- [x] No git commit (not requested)

---

## Risks

| Risk | Note |
|------|------|
| `001` drifts from code over time | Update 001 when routes change (same PR as code) |
| Agents skip AUTHORITY | Enforce via `AI_AUTHORITY_ADDENDUM` + cursor rule (future) |
| Team still bookmarks old report only | Point README to AUTHORITY |

---

## Next step

```text
PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION
```

Prerequisites:

1. Human/agent reads `AUTHORITY/004` + `006`
2. Decision note for focus migration (A/B/C in `005`)
3. Implement `/inbox` + aliases per `005`

---

## Git

No commit performed (not requested).

---

## V2 Restructure — Numbered Folders (append-only — 2026-05-29)

**Status:** GO  
**Scope:** Documentation/governance only — **no** `apps/workboard` changes

### Summary (v2)

Reorganized pack into authority-numbered folders:

```text
000_CURRENT_RUNTIME/   = As-Is
100_TARGET_DESIGN/     = To-Be
200_IMPLEMENTATION/    = Roadmap
900_AUTHORITY/         = Binding rules
```

**No files deleted.** Root `001`–`013`, `AUTHORITY/`, `_archive_*` preserved.

### Created folders (v2)

- `UI_UX/CBV_WORK_INBOX_V3/000_CURRENT_RUNTIME/`
- `UI_UX/CBV_WORK_INBOX_V3/100_TARGET_DESIGN/` (+ `wireframes/`)
- `UI_UX/CBV_WORK_INBOX_V3/200_IMPLEMENTATION/`
- `UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/`

### Created files (v2)

| File |
|------|
| `000_CURRENT_RUNTIME/README.md` |
| `000_CURRENT_RUNTIME/001_CURRENT_RUNTIME_TRUTH.md` (copy) |
| `000_CURRENT_RUNTIME/008_ROUTING_CONTRACT_RUNTIME.md` (copy) |
| `000_CURRENT_RUNTIME/010_FOCUS_MODE_RUNTIME.md` (copy) |
| `100_TARGET_DESIGN/README.md` |
| `100_TARGET_DESIGN/014_DATA_CONTRACT.md` |
| `100_TARGET_DESIGN/001`–`013`, `AI_*`, `wireframes/*` (copies) |
| `200_IMPLEMENTATION/README.md` |
| `200_IMPLEMENTATION/015_FRONTEND_IMPLEMENTATION_ROADMAP.md` |
| `200_IMPLEMENTATION/016_AS_IS_TO_BE_MAPPING.md` |
| `200_IMPLEMENTATION/017_NEXT_PHASE_PROMPT_FRONTEND_IMPLEMENTATION.md` |
| `900_AUTHORITY/000_DESIGN_AUTHORITY.md` |
| `900_AUTHORITY/001_AUTHORITY_INDEX.md` |
| `900_AUTHORITY/LEGACY_AUTHORITY_FOLDER.md` |
| `900_AUTHORITY/*` (v1 copies: misread, matrix, migration, …) |
| `LEGACY_ROOT_FILES.md` |
| `002_DECISIONS/ADR_001_CBV_WORK_INBOX_V3_WORK_INBOX_DECISION.md` |

### Updated files (v2)

| File | Action |
|------|------|
| `UI_UX/CBV_WORK_INBOX_V3/README.md` | Rewritten — authority entry + priority ladder |

### Authority decision (v2)

| Topic | Decision |
|-------|----------|
| Target default route | `/inbox` |
| Legacy route | `/tasks` (alias during migration) |
| Product model | Work Inbox-centric, not Task-centric |
| Report: `CBV_WORK_INBOX_V3_DESIGN_CONTRACT_PACK_REPORT.md` | **As-Is** narrative |
| Report: `PHASE_UI_CBV_WORK_INBOX_V3_DESIGN_CONTRACT_REPORT.md` | **Target** narrative |

### Acceptance check (v2)

- [x] Root README created/updated
- [x] Design Authority (`900_AUTHORITY/000_DESIGN_AUTHORITY.md`)
- [x] Authority Index (`900_AUTHORITY/001_AUTHORITY_INDEX.md`)
- [x] Data Contract (`100_TARGET_DESIGN/014_DATA_CONTRACT.md`)
- [x] Frontend Roadmap (`200_IMPLEMENTATION/015_*.md`)
- [x] As-Is / To-Be Mapping (`200_IMPLEMENTATION/016_*.md`)
- [x] ADR created
- [x] Next Phase Prompt created
- [x] Current runtime and target design clearly separated
- [x] No runtime code changed
- [x] No files deleted
- [x] Report updated (this append)

### Warnings (v2)

- Existing FE still defaults to `/tasks` and cognition grouping
- Root duplicate specs remain for append-only policy — edit `100_TARGET_DESIGN/` for new work
- `900_AUTHORITY/000_DESIGN_AUTHORITY.md` overrides older matrix when conflict

### Next step (v2)

```text
PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION
```

Start with **Phase A — Route Alias & Shell** (`200_IMPLEMENTATION/017_NEXT_PHASE_PROMPT_FRONTEND_IMPLEMENTATION.md`)
