# PHASE_OCMS_02A_CASE_STRIP_VISIBILITY_RULES — Report

**Date:** 2026-05-31  
**Phase:** `PHASE_OCMS_02A_CASE_STRIP_VISIBILITY_RULES`  
**Mode:** DOC-ONLY  
**Branch:** `phase/ocms-foundation-v1`  
**Status:** **GO**

---

## 1. Summary

Chốt **Case Strip visibility rules** trước OCMS_03: 4 visibility levels, source-specific profiles, field matrix, permissions, fallbacks, feature flag `OCMS_CASE_STRIP_ENABLED`. Case Strip là context phụ — không thay task header. No runtime/UI/API changes.

**RUNTIME_STATE:** `NOT_WIRED`

---

## 2. Files created / updated

### Created

| Path |
|------|
| `002_DECISIONS/ADR_OCMS_CASE_STRIP_VISIBILITY_RULES.md` |
| `OCMS/OCMS_CASE_STRIP_VISIBILITY_RULES.md` |
| `000_REPORTS/PHASE_OCMS_02A_CASE_STRIP_VISIBILITY_RULES_REPORT.md` |
| `001_HANDOFF/PHASE_OCMS_02A_CASE_STRIP_VISIBILITY_RULES_HANDOFF.md` |
| `005_TEST_EVIDENCE/PHASE_OCMS_02A_CASE_STRIP_VISIBILITY_RULES_TEST_EVIDENCE.md` |
| `006_PHASES/PHASE_OCMS_02A_CASE_STRIP_VISIBILITY_RULES.md` |

### Updated

| Path |
|------|
| `OCMS/OCMS_READ_MODEL_CONTRACT.md` (§12) |
| `OCMS/OCMS_ROADMAP.md` (v0.7) |
| `006_PHASES/PHASE_REGISTRY.md` |

---

## 3. Visibility levels

| Level | Use |
|-------|-----|
| HIDDEN | canView false, flag off |
| MINIMAL | LOW confidence, compact task-only |
| STANDARD | Default strip |
| EXPANDED | HO_SO/FINANCE MEDIUM+ |

---

## 4. Field display rules

Always: caseType, lifecycle.label, primary relation (STANDARD+).  
Never: raw caseKey, projection.data, debug diagnostics (prod).

---

## 5. Source-specific rules

- **OPERATIONS:** MINIMAL/STANDARD compact  
- **HO_SO/MIXED:** STANDARD→EXPANDED, deep link if canOpenRelated  
- **FINANCE:** result + roles; privacy gate  
- **ALERT orphan:** warning only, no fake case  
- **MANUAL_CASE_KEY:** MEDIUM+ or fallback message  

---

## 6. Permission rules

`canView` → HIDDEN; `canOpenRelated` → no links; `canSeePrivateFields` → hide finance sensitive.

---

## 7. Fallback rules

Documented in spec §9 — no fake PRIMARY relation or projections.

---

## 8. OCMS_03 implementation notes

- Flag `OCMS_CASE_STRIP_ENABLED`  
- `resolveStripVisibility(model)` → level + fields  
- Place below CompactTaskHeader  
- Fixtures from `OCMS_READ_MODEL_EXAMPLES.md`  

---

## 9. Verification

| Check | Result |
|-------|--------|
| No apps/workers/gas-runtime-api | **PASS** |
| No FE/hook/API | **PASS** |
| ADR links read model contract | **PASS** |
| phase_tmp_archive + 9 root files | **PASS** |

---

## 10. phase_tmp

16 OCMS_02 files → `phase_tmp_archive/archive_001/`; legacy `archive_002`, `archive_003` dirs moved from `phase_tmp/` to `phase_tmp_archive/`; **9** OCMS_02A files at `phase_tmp/` root.

---

## 11. Risks

| Risk | Mitigation |
|------|------------|
| Strip vs header | Secondary placement ADR |
| Finance leak | canSeePrivateFields |
| Operator overload | MINIMAL for OPERATIONS |

---

## 12. Next phase

**`PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP`**

---

## 13. Exit status

**GO**

---

*Append-only report.*
