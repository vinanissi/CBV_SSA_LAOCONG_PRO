# Phase — CASE_REFACTOR_02 Case Read Model

| Field | Value |
|-------|-------|
| **Phase ID** | `PHASE_CASE_REFACTOR_02_CASE_READ_MODEL` |
| **Mode** | IMPLEMENT (read-only projection) |
| **Depends on** | `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY` |

---

## GOAL

Formal contract + pure FE projection: `CaseRuntimeReadModel` from task + bundle.

**Forbidden:** CASE_MAIN, Case API, schema changes, UI workspace redesign.

---

## DELIVERABLES

See report. Entry: `getCaseReadModelForTask()`.

---

## NEXT

`PHASE_CASE_REFACTOR_03_CASE_WORKSPACE`
