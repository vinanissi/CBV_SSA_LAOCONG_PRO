# PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL — Report

**Date:** 2026-05-31  
**Phase:** `PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL`  
**Mode:** DOC-ONLY  
**Branch:** `phase/ocms-foundation-v1`  
**Status:** **GO**

---

## 1. Summary

Loaded **CBV-RCLA v1.1**, completed OCMS foundation with **Case Type** catalog (10 types) and **Result** model — closing the gap in the CRM frame. Case Type answers *loại case gì*; Result answers *kết quả / trạng thái kết thúc* (≠ task status). No runtime, schema, API, or UI changes.

**RUNTIME_STATE:** `NOT_WIRED`

---

## 2. Files created / updated

### Created

| Path |
|------|
| `00_SYSTEM_BRAIN/002_DECISIONS/ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM.md` |
| `00_SYSTEM_BRAIN/OCMS/OCMS_CASE_TYPE_CATALOG.md` |
| `00_SYSTEM_BRAIN/OCMS/OCMS_RESULT_MODEL.md` |
| `00_SYSTEM_BRAIN/000_REPORTS/PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL_REPORT.md` |
| `00_SYSTEM_BRAIN/001_HANDOFF/PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL_HANDOFF.md` |
| `00_SYSTEM_BRAIN/005_TEST_EVIDENCE/PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL_TEST_EVIDENCE.md` |
| `00_SYSTEM_BRAIN/006_PHASES/PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL.md` |

### Updated (append-only)

| Path |
|------|
| `00_SYSTEM_BRAIN/OCMS/OCMS_ROADMAP.md` (v0.3; OCMS_01A row) |
| `00_SYSTEM_BRAIN/OCMS/OCMS_DOMAIN_MODEL.md` (§11) |
| `00_SYSTEM_BRAIN/OCMS/OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` (§11) |
| `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` |

### Unchanged (by design)

| Path |
|------|
| `ADR_OCMS_FOUNDATION.md`, `ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md` |
| `apps/`, `workers/`, `gas-runtime-api/` |

---

## 3. Case Type model

**10 codes:** `HO_SO`, `FINANCE`, `INVOICE`, `MEMBERSHIP`, `COMPLAINT`, `OPERATIONS`, `PROJECT`, `SUPPORT`, `COMPLIANCE`, `DOCUMENT`

Each type defines: mô tả, ví dụ, module, checklist pattern, responsibility defaults, memory emphasis, result hints, pilot priority (P0: HO_SO, OPERATIONS, FINANCE).

**Case Type drives (design):** checklist mẫu, tài liệu, SLA intent, role mặc định, result vocabulary, module liên quan.

---

## 4. Result model

- **Result ≠ task status** (`TASK_MAIN` unchanged)
- **Result ≠ COMPLETED only** — groups: OPEN, COMPLETED, APPROVED, REJECTED, RETURNED, DEFERRED, CANCELLED, ESCALATED, CLOSED
- **Per-type results** documented (e.g. HO_SO: Received → Validating → Approved / Returned / Rejected → Archived)
- **Binding:** Result closure ties Responsible/Reviewer + Evidence + Decision + Timeline (Memory)

---

## 5. Complete OCMS frame

```text
CASE
├── CASE TYPE
├── RESPONSIBILITY
├── WORK / STEPS
├── MEMORY
├── RESULT
└── MODULE PROJECTION
```

---

## 6. Roadmap update

- Added **OCMS_01A** after **OCMS_01**, before **OCMS_02**
- Note: 01A may run before 01 (DOC-ONLY); Case Key still required for post-OCMS_02 implementation

---

## 7. Registry update

Appended row `PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL` + ADR index entry.

---

## 8. Verification

| # | Check | Result |
|---|-------|--------|
| 1 | No `apps/` changes | **PASS** |
| 2 | No `workers/` changes | **PASS** |
| 3 | No `gas-runtime-api/` changes | **PASS** |
| 4 | No `CASE_MAIN` / type / result sheets | **PASS** |
| 5 | No `/inbox` / Work Inbox rebrand | **PASS** |
| 6 | Roadmap append-only | **PASS** |
| 7 | Registry append-only | **PASS** |
| 8 | Links to foundation + CRM ADR | **PASS** |
| 9 | `phase_tmp` cleared + phase files only | **PASS** |
| 10 | Git diff in `00_SYSTEM_BRAIN/` + `phase_tmp/` | **PASS** |

---

## 9. phase_tmp copy result

11 files copied with directory prefix (see test evidence). `phase_tmp/` cleared before copy.

---

## 10. Risks

| Risk | Mitigation |
|------|------------|
| 10 types too many for pilot | P0/P1/P2 priority in catalog |
| Result vs status confusion | Explicit model §2; inbox unchanged |
| OCMS_01 vs 01A order | Roadmap sequencing note |
| SLA doc without runtime | Intent-only until future ADR |

---

## 11. Next recommended phase

**`PHASE_OCMS_01_CASE_KEY_CONVENTION`** — Case Key including optional `CASE_TYPE` segment — then **`PHASE_OCMS_02_READ_MODEL_CONTRACT`**.

---

## 12. Exit status

**GO**

---

*Append-only report.*
