# Phase — CASE_REFACTOR_01 Case Authority

| Field | Value |
|-------|-------|
| **Phase ID** | `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY` |
| **Mode** | DOC-ONLY |
| **Branch** | `phase/case-centric-runtime-refactor` |
| **Depends on** | `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT` (GO_WITH_WARNINGS) |

---

## GOAL

Formal Case-Centric Runtime Authority — definitions, boundaries, read-model rules, workspace layout spec, ADR.

**Forbidden:** CASE_MAIN, Case API, runtime/UI/schema changes.

---

## DELIVERABLES

| Artifact | Path |
|----------|------|
| ADR | `002_DECISIONS/ADR_CASE_CENTRIC_RUNTIME.md` |
| Authority V1 | `CASE/CASE_RUNTIME_AUTHORITY_V1.md` |
| Boundary contract | `CASE/CASE_ENTITY_BOUNDARY_CONTRACT.md` |
| Read model authority | `CASE/CASE_READ_MODEL_AUTHORITY.md` |
| Workspace layout | `CASE/CASE_WORKSPACE_LAYOUT_AUTHORITY.md` |
| Report / Handoff / Test evidence | standard folders |

---

## NEXT

`PHASE_CASE_REFACTOR_02_CASE_READ_MODEL` — after acceptance.
