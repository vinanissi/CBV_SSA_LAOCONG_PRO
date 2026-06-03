# Handoff — CASE_REFACTOR_02 Case Read Model

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_02_CASE_READ_MODEL` |
| **Result** | GO_WITH_WARNINGS |
| **Next** | `PHASE_CASE_REFACTOR_03_CASE_WORKSPACE` |

---

## Summary

`CaseRuntimeReadModel` implemented as read-only projection over existing task + operational bundle. OCMS `CaseReadModel` preserved as `ocmsCore` for strip. API: `getCaseReadModelForTask()`.

---

## Read model contract summary

- **caseId / caseKey / displayKey** — logical identity; displayKey operator-safe  
- **checklist, documents, timeline, handoff, tasks** — projected slices  
- **Comment** — timeline entry type `COMMENT`  
- **diagnostics** — explicit codes, no silent fallback  

Docs: `CASE_READ_MODEL_CONTRACT.md`, `DERIVATION_RULES.md`, `DIAGNOSTICS.md`.

---

## Do-not-do list (phase 03)

- No CASE_MAIN / Case API / schema  
- No workspace without using `runtimeReadModel`  
- Do not remove `ocmsCore` strip path  
- Do not auto-promote checklist items to tasks  

---

## Next phase objective

Refactor Focus toward Case Workspace layout authority; pass `checklistItems` into `useCaseReadModel`; render regions from `runtimeReadModel`.

---

## Files to read next

1. `apps/workboard/src/modules/ocms/getCaseReadModelForTask.ts`
2. `apps/workboard/src/modules/ocms/caseRuntimeReadModelTypes.ts`
3. `CASE/CASE_WORKSPACE_LAYOUT_AUTHORITY.md`
4. `CASE/CASE_READ_MODEL_CONTRACT.md`

---

*Bundle: phase_tmp/0001_PHASE_CASE_REFACTOR_02_CASE_READ_MODEL.zip*
