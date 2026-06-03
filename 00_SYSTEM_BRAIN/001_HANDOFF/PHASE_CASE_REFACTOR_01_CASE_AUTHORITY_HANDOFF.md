# Handoff — CASE_REFACTOR_01 Case Authority

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY` |
| **Result** | GO_WITH_WARNINGS |
| **Next** | `PHASE_CASE_REFACTOR_02_CASE_READ_MODEL` |

---

## Summary

Case-Centric Runtime Authority **V1** is accepted in documentation. Case is the operational root; Task remains execution/persistence root until phase 05. Comments are timeline entries. No `CASE_MAIN`, no Case API.

---

## Accepted authority decisions

1. Refactor, not rebuild (`ADR_CASE_CENTRIC_RUNTIME`)
2. Case = matter; Task = work item under Case
3. Checklist ≠ Task by default; explicit promotion rules
4. Document → Case primary; Timeline append-only; Handoff → Case
5. WorkflowState ≠ workflow engine ≠ task STATUS
6. Lifecycle canonical codes (10 values)
7. Read-model-first through phase 04
8. Workspace layout spec ready for phase 03

---

## Do-not-do list (phase 02)

- Do NOT create `CASE_MAIN` or Case mutation API
- Do NOT skip read model phase for workspace UI
- Do NOT change `TASK_MAIN` schema without ADR
- Do NOT add workflow engine or agent runtime
- Do NOT fabricate Case identity or Responsible

---

## Next phase objective

**`PHASE_CASE_REFACTOR_02_CASE_READ_MODEL`:**

- Harden `CaseReadModel` alignment with `CASE_READ_MODEL_AUTHORITY.md`
- Stable derivation API from task + bundle
- Extend static checks; optional `npm run build`
- Still projection-only; taskId entry point

---

## Files to read next

1. `CASE/CASE_READ_MODEL_AUTHORITY.md`
2. `CASE/CASE_ENTITY_BOUNDARY_CONTRACT.md`
3. `CASE/CASE_RUNTIME_AUTHORITY_V1.md`
4. `002_DECISIONS/ADR_CASE_CENTRIC_RUNTIME.md`
5. `OCMS/OCMS_READ_MODEL_CONTRACT.md`
6. `apps/workboard/src/modules/ocms/deriveCaseReadModel.ts`

---

## Risk notes

- Physical `TASK_CHECKLIST` vs logical Case checklist — document in phase 02 report.
- Enable strip flag only in controlled UAT until read model hardened.

---

*Bundle: `phase_tmp/0001_PHASE_CASE_REFACTOR_01_CASE_AUTHORITY.zip`*
