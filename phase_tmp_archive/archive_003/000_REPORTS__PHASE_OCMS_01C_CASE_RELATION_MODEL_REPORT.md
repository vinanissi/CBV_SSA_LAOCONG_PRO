# PHASE_OCMS_01C_CASE_RELATION_MODEL — Report

**Date:** 2026-05-31  
**Phase:** `PHASE_OCMS_01C_CASE_RELATION_MODEL`  
**Mode:** DOC-ONLY  
**Branch:** `phase/ocms-foundation-v1`  
**Status:** **GO**

---

## 1. Summary

Loaded **CBV-RCLA v1.1** and added **Case Relation Model** — conceptual links from Case to business entities (12 target types, 10 roles), distinct from Case Key, Module Projection, Attachment, and Work Items. No runtime, schema, API, or UI changes.

**RUNTIME_STATE:** `NOT_WIRED`

---

## 2. Files created / updated

### Created

| Path |
|------|
| `002_DECISIONS/ADR_OCMS_CASE_RELATION_ADDENDUM.md` |
| `OCMS/OCMS_CASE_RELATION_MODEL.md` |
| `000_REPORTS/PHASE_OCMS_01C_CASE_RELATION_MODEL_REPORT.md` |
| `001_HANDOFF/PHASE_OCMS_01C_CASE_RELATION_MODEL_HANDOFF.md` |
| `005_TEST_EVIDENCE/PHASE_OCMS_01C_CASE_RELATION_MODEL_TEST_EVIDENCE.md` |
| `006_PHASES/PHASE_OCMS_01C_CASE_RELATION_MODEL.md` |

### Updated (append-only)

| Path |
|------|
| `OCMS/OCMS_ROADMAP.md` (v0.5) |
| `OCMS/OCMS_DOMAIN_MODEL.md` (§13) |
| `OCMS/OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` (§13) |
| `OCMS/OCMS_CASE_TYPE_CATALOG.md` (§8) |
| `OCMS/OCMS_CASE_LIFECYCLE_MODEL.md` (§15) |
| `OCMS/OCMS_RESULT_MODEL.md` (§11) |
| `006_PHASES/PHASE_REGISTRY.md` |

---

## 3. Case Relation model

```text
CASE
├── CASE TYPE
├── LIFECYCLE
├── RELATION(S)      ← new
├── RESPONSIBILITY
├── WORK / STEPS
├── MEMORY
├── RESULT
└── MODULE PROJECTION
```

**Relation tuple:** `{ targetType, targetId, role }`

---

## 4. Relation vs Case Key vs Projection vs Attachment

| Layer | Role |
|-------|------|
| Case Key | Identity (`HO_SO:HS-2026-001`) |
| Case Relation | Link + role (`XA_VIEN:XV-0001` TARGET) |
| Module Projection | Read UI data from sheets |
| Attachment | Memory evidence file |

---

## 5. Target types (12)

XA_VIEN, HO_SO, PHUONG_TIEN, DON_VI, FINANCE_TRANSACTION, INVOICE, DOCUMENT, PERSON, ORGANIZATION, PROJECT, ALERT, TASK

---

## 6. Relation roles (10)

PRIMARY, SECONDARY, SOURCE, TARGET, EVIDENCE_REF, DEPENDENCY, DUPLICATE_OF, CHILD_OF, PARENT_OF, BLOCKED_BY

---

## 7. Cardinality rules

- Case → many Relations; target → many Cases  
- One PRIMARY per target type group (guideline)  
- TASK relation ≠ Work Item replacement  
- DOCUMENT relation ≠ Attachment replacement  

---

## 8. Relation hints by Case Type

Catalog §8 + relation model §6–7 — e.g. HO_SO: PRIMARY=HO_SO, TARGET=XA_VIEN; FINANCE: PRIMARY=FINANCE_TRANSACTION.

---

## 9. Roadmap / registry

- **OCMS_01C** after **01B**, before **02**  
- Registry row + ADR index appended  

---

## 10. Verification

| Check | Result |
|-------|--------|
| No apps/workers/gas-runtime-api | **PASS** |
| No CASE_MAIN / CASE_RELATION sheet | **PASS** |
| No TASK_MAIN / checklist / attachment schema change | **PASS** |
| `/inbox` unchanged | **PASS** |
| ADR extends prior OCMS ADRs | **PASS** |
| phase_tmp archive_002 + 13 root files | **PASS** |

---

## 11. phase_tmp

Previous 12 files → `archive_002/`; current phase 13 files at `phase_tmp/` root.

---

## 12. Risks

| Risk | Mitigation |
|------|------------|
| Relation vs projection overlap | Separate fields in OCMS_02 contract |
| Multiple PRIMARY | One per type group rule |
| Derive from task HO_SO_ID | OCMS_02 mapping phase |

---

## 13. Next recommended phase

**`PHASE_OCMS_02_READ_MODEL_CONTRACT`** — include `relations[]`, `lifecycle`, `result`, `caseType` — or **`PHASE_OCMS_01_CASE_KEY_CONVENTION`** first.

---

## 14. Exit status

**GO**

---

*Append-only report.*
