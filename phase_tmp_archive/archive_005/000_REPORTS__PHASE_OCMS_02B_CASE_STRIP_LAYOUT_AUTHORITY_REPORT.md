# PHASE_OCMS_02B_CASE_STRIP_LAYOUT_AUTHORITY — Report

**Date:** 2026-05-31  
**Phase:** `PHASE_OCMS_02B_CASE_STRIP_LAYOUT_AUTHORITY`  
**Mode:** DOC-ONLY  
**Branch:** `phase/ocms-foundation-v1`  
**Status:** **GO**

---

## 1. Summary

Chốt **Layout Authority** cho Case Context Strip: Main Area below `CompactTaskHeader`, height budgets per visibility level, collapse rules, Main/Right Panel boundaries. OCMS_02A = what; OCMS_02B = where/how much. No code/UI/schema changes.

**RUNTIME_STATE:** `NOT_WIRED`

---

## 2. Files created / updated

### Created

| Path |
|------|
| `002_DECISIONS/ADR_OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md` |
| `OCMS/OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md` |
| `000_REPORTS/PHASE_OCMS_02B_CASE_STRIP_LAYOUT_AUTHORITY_REPORT.md` |
| `001_HANDOFF/PHASE_OCMS_02B_CASE_STRIP_LAYOUT_AUTHORITY_HANDOFF.md` |
| `005_TEST_EVIDENCE/PHASE_OCMS_02B_CASE_STRIP_LAYOUT_AUTHORITY_TEST_EVIDENCE.md` |
| `006_PHASES/PHASE_OCMS_02B_CASE_STRIP_LAYOUT_AUTHORITY.md` |

### Updated

| Path |
|------|
| `OCMS/OCMS_CASE_STRIP_VISIBILITY_RULES.md` (§14) |
| `OCMS/OCMS_READ_MODEL_CONTRACT.md` (§13) |
| `OCMS/OCMS_ROADMAP.md` (v0.8) |
| `006_PHASES/PHASE_REGISTRY.md` |

---

## 3. Placement decision

**Main Area** — below CompactTaskHeader, above AI Summary / Checklist.  
**Not** Right Panel for OCMS_03.

---

## 4. Height budgets

| Level | Max height |
|-------|------------|
| HIDDEN | 0 |
| MINIMAL | 28–36px |
| STANDARD | 48–72px |
| EXPANDED | 96–128px |

---

## 5. Layout stack

CompactTaskHeader → CaseContextStrip → AI Summary → Checklist → Attachments → Action Bar

---

## 6. Main Area / Right Panel boundaries

- Main: strip slot only; header/checklist unchanged  
- Right: no Case tab, no strip, no IA change in OCMS_03  

---

## 7. Interaction rules

Read-only; deep links if `canOpenRelated`; collapse without refetch; flag off = zero layout delta.

---

## 8. OCMS_03 implementation notes

Mount in `FocusTaskWorkspace`; `WorkInboxCaseContextStrip.tsx`; max-height CSS; flag guard.

---

## 9. Verification

| Check | Result |
|-------|--------|
| No apps/workers/gas-runtime-api | **PASS** |
| No FE/hook/API | **PASS** |
| ADR links visibility + read model | **PASS** |
| phase_tmp_archive + 10 root files | **PASS** |

---

## 10. phase_tmp

9 OCMS_02A files → `phase_tmp_archive/archive_004/`; **10** OCMS_02B files at `phase_tmp/` root.

---

## 11. Risks

| Risk | Mitigation |
|------|------------|
| Checklist pushed down | Height caps |
| Right Panel temptation | ADR boundary |
| EXPANDED clutter | Collapse required |

---

## 12. Next phase

**`PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP`**

---

## 13. Exit status

**GO**

---

*Append-only report.*
