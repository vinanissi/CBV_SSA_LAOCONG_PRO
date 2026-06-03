# PHASE_OCMS_02_READ_MODEL_CONTRACT — Report

**Date:** 2026-05-31  
**Phase:** `PHASE_OCMS_02_READ_MODEL_CONTRACT`  
**Mode:** DOC-ONLY  
**Branch:** `phase/ocms-foundation-v1`  
**Status:** **GO**

---

## 1. Summary

Loaded **CBV-RCLA v1.1** and delivered **`CaseReadModel`** read-only contract — schema, AS-IS mapping, and three P0 examples (OPERATIONS, HO_SO, FINANCE) — enabling OCMS_03 Case Context Strip without `CASE_MAIN` or live API.

**RUNTIME_STATE:** `NOT_WIRED`

---

## 2. Files created / updated

### Created

| Path |
|------|
| `002_DECISIONS/ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md` |
| `OCMS/OCMS_READ_MODEL_CONTRACT.md` |
| `OCMS/OCMS_READ_MODEL_MAPPING.md` |
| `OCMS/OCMS_READ_MODEL_EXAMPLES.md` |
| `000_REPORTS/PHASE_OCMS_02_READ_MODEL_CONTRACT_REPORT.md` |
| `001_HANDOFF/PHASE_OCMS_02_READ_MODEL_CONTRACT_HANDOFF.md` |
| `005_TEST_EVIDENCE/PHASE_OCMS_02_READ_MODEL_CONTRACT_TEST_EVIDENCE.md` |
| `006_PHASES/PHASE_OCMS_02_READ_MODEL_CONTRACT.md` |

### Updated (append-only)

| Path |
|------|
| `OCMS/OCMS_ROADMAP.md` (v0.6; OCMS_02 history) |
| `OCMS/OCMS_DOMAIN_MODEL.md` (§14) |
| `OCMS/OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` (§14) |
| `OCMS/OCMS_CASE_RELATION_MODEL.md` (§16) |
| `OCMS/OCMS_CASE_LIFECYCLE_MODEL.md` (§16) |
| `OCMS/OCMS_RESULT_MODEL.md` (§12) |
| `OCMS/OCMS_CASE_TYPE_CATALOG.md` (§9) |
| `006_PHASES/PHASE_REGISTRY.md` |

---

## 3. CaseReadModel contract

Top-level fields: `caseKey`, `caseType`, `title`, `lifecycle`, `result`, `responsibility`, `relations[]`, `workItems[]`, `memorySummary`, `projections`, `permissions`, `source`, `diagnostics`.

**Orthogonal:** `workItems[].status` (taskStatus) ≠ `lifecycle` ≠ `result`.

---

## 4. Read Model vs Persistence Model

| Read Model | Persistence Model |
|------------|-------------------|
| Derived JSON view | CASE_MAIN (future, not created) |
| Spec-only this phase | Sheets / tables |
| OCMS_03 consumer | OCMS_05+ eval |

---

## 5. Mapping from AS-IS

TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG, HOME_ALERT, HO_SO_*, FINANCE_* → contract fields per `OCMS_READ_MODEL_MAPPING.md`. **No silent fake data.**

---

## 6. Examples

Three full JSON: OPERATIONS (TASK_ANCHORED), HO_SO (MIXED), FINANCE (FINANCE_ANCHORED).

---

## 7. Permissions & diagnostics

- **permissions:** canView, canOpenSource, canMutateTask (task runtime only)
- **diagnostics:** confidence, missingRelations, missingProjections, warnings, runtimeState

---

## 8. Roadmap / registry

OCMS_02 marked complete in phase history. Registry row appended.

---

## 9. Verification

| Check | Result |
|-------|--------|
| No apps/workers/gas-runtime-api | **PASS** |
| No CASE_MAIN / read sheet / API | **PASS** |
| No TASK schema change | **PASS** |
| `/inbox` unchanged | **PASS** |
| 3 P0 examples | **PASS** |
| phase_tmp archive_003 + 16 root files | **PASS** |

---

## 10. phase_tmp

13 files from OCMS_01C → `archive_003/`; 16 current phase files at root.

---

## 11. Risks

| Risk | Mitigation |
|------|------------|
| Low inference confidence | diagnostics.confidence |
| OCMS_03 scope | Strip uses subset of contract |
| OCMS_01 Case Key optional | Derived keys in mapping |

---

## 12. Next recommended phase

**`PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP`** — FE read derive behind flag; subset: title, caseType, lifecycle, primary relation, memorySummary.recent.

---

## 13. Exit status

**GO**

---

*Append-only report.*
