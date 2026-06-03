# PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL — Report

**Date:** 2026-05-31  
**Phase:** `PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL`  
**Mode:** DOC-ONLY  
**Branch:** `phase/ocms-foundation-v1`  
**Status:** **GO**

---

## 1. Summary

Loaded **CBV-RCLA v1.1** and added **Case Lifecycle Model** — operational phases independent of **Task Status**, **Result**, and checklist state. Ten global lifecycle states with transition rules, per-type hints, reopen/archive rules, and CRM integration. No runtime, schema, API, or UI changes.

**RUNTIME_STATE:** `NOT_WIRED`

---

## 2. Files created / updated

### Created

| Path |
|------|
| `002_DECISIONS/ADR_OCMS_CASE_LIFECYCLE_ADDENDUM.md` |
| `OCMS/OCMS_CASE_LIFECYCLE_MODEL.md` |
| `000_REPORTS/PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL_REPORT.md` |
| `001_HANDOFF/PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL_HANDOFF.md` |
| `005_TEST_EVIDENCE/PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL_TEST_EVIDENCE.md` |
| `006_PHASES/PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL.md` |

### Updated (append-only)

| Path |
|------|
| `OCMS/OCMS_ROADMAP.md` (v0.4) |
| `OCMS/OCMS_DOMAIN_MODEL.md` (§12) |
| `OCMS/OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` (§12) |
| `OCMS/OCMS_RESULT_MODEL.md` (§10) |
| `OCMS/OCMS_CASE_TYPE_CATALOG.md` (§7) |
| `006_PHASES/PHASE_REGISTRY.md` |

---

## 3. Lifecycle model

**Frame:**

```text
CASE → CASE TYPE | LIFECYCLE | RESPONSIBILITY | WORK/STEPS | MEMORY | RESULT | MODULE PROJECTION
```

**10 states:** NEW, TRIAGE, ACTIVE, WAITING, REVIEW, BLOCKED, RESOLVED, CLOSED, ARCHIVED, REOPENED

**Primary flow:** NEW → TRIAGE → ACTIVE → (WAITING | REVIEW)* → RESOLVED → CLOSED → ARCHIVED

**Branches:** ACTIVE ↔ BLOCKED; CLOSED → REOPENED → ACTIVE; ESCALATED via BLOCKED + Responsibility + Memory (not mandatory lifecycle state)

---

## 4. Lifecycle vs Task Status vs Result

| Layer | Example |
|-------|---------|
| Task Status | Task In Progress / Done |
| Lifecycle | REVIEW |
| Result | Approved / Returned / Rejected |

Completing a task does **not** auto-close case lifecycle or set Result.

---

## 5. Transition rules (summary)

- Forward matrix documented in lifecycle model §5.4
- Backward allowed with Memory Decision (rework from REVIEW)
- Reopen from CLOSED with mandatory Decision; ARCHIVED reopen admin-only
- Archive: CLOSED → ARCHIVED; terminal Result expected

---

## 6. Per Case Type lifecycle hints

Catalog §7 + lifecycle model §6 — e.g. HO_SO: TRIAGE + REVIEW + ARCHIVED; OPERATIONS: skip TRIAGE, rare REVIEW.

---

## 7. Roadmap / registry

- **OCMS_01B** inserted after **01A**, before **02**
- Registry row + ADR index appended

---

## 8. Verification

| Check | Result |
|-------|--------|
| No apps/workers/gas-runtime-api changes | **PASS** |
| No CASE_MAIN / lifecycle sheet / column | **PASS** |
| No TASK_MAIN change | **PASS** |
| `/inbox` unchanged | **PASS** |
| ADR extends (no override) foundation/CRM/type-result | **PASS** |
| Roadmap/registry append-only | **PASS** |
| phase_tmp archive + 12 root files | **PASS** |

---

## 9. phase_tmp archive + copy result

Previous 11 files moved to `phase_tmp/archive_001/`. Current phase: 12 files at `phase_tmp/` root (prefixed names).

---

## 10. Risks

| Risk | Mitigation |
|------|------------|
| Lifecycle vs inbox Waiting group | Documented separation |
| State count | Secondary UI only (future strip) |
| Derivation complexity | OCMS_02 contract phase |

---

## 11. Next recommended phase

**`PHASE_OCMS_02_READ_MODEL_CONTRACT`** — fields `lifecycle`, `result`, `caseType` separate from task status — or **`PHASE_OCMS_01_CASE_KEY_CONVENTION`** if operator prefers keys first.

---

## 12. Exit status

**GO**

---

*Append-only report.*
