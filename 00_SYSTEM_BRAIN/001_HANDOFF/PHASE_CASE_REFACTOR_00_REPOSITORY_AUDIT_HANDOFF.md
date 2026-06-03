# Handoff — CASE_REFACTOR_00 Repository Audit

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT` |
| **Result** | GO_WITH_WARNINGS |
| **Next** | `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY` |

---

## Summary

Repository audit confirms **safe, incremental refactor** from Task-Centric to Case-Centric runtime. Production stack (`TASK_MAIN` + Work Inbox V3 + worker + gas-runtime-api) stays intact. OCMS Case Context Strip is the seed for a future **Case Workspace** — read-model-first, no `CASE_MAIN` yet.

---

## Current state

- **Branch:** `phase/case-centric-runtime-refactor`
- **Case persistence:** None (`CASE_MAIN` absent — verified)
- **Case UI:** `WorkInboxCaseContextStrip` behind `VITE_OCMS_CASE_STRIP_ENABLED` (default off)
- **Execution:** All mutations task-scoped
- **Audit pack:** `00_SYSTEM_BRAIN/CASE/*.md` (8 maps + roadmap)

---

## Critical findings

1. Refactor = **wrap/adapt**, not replace Task runtime.
2. Major modules classified in `KEEP_DROP_REWRITE_MATRIX.md`.
3. Next phase is **authority only** — no implementation.

---

## Next phase objective

`PHASE_CASE_REFACTOR_01_CASE_AUTHORITY`:

- Case as operational root (documentation)
- Checklist vs Task spawn rules
- Read-model-first + persistence-later reaffirmed
- ADR for Case-Centric Runtime Authority
- Resolve `OCMS_CASE_STRIP_ENABLED` vs `VITE_OCMS_CASE_STRIP_ENABLED` naming

---

## Do-not-do list

- Do NOT create `CASE_MAIN` / Case API / Case Service
- Do NOT skip to `PHASE_CASE_REFACTOR_02` before 01 accepted
- Do NOT change `TASK_MAIN` schema in phase 01
- Do NOT redesign Work Inbox routes in phase 01
- Do NOT implement Case Workspace UI until read model phase accepted

---

## Files to read next

1. `00_SYSTEM_BRAIN/CASE/CASE_RUNTIME_EXTRACTION_PLAN.md`
2. `00_SYSTEM_BRAIN/CASE/CASE_TARGET_ARCHITECTURE.md`
3. `00_SYSTEM_BRAIN/CASE/KEEP_DROP_REWRITE_MATRIX.md`
4. `00_SYSTEM_BRAIN/002_DECISIONS/ADR_OCMS_FOUNDATION.md`
5. `00_SYSTEM_BRAIN/OCMS/OCMS_READ_MODEL_CONTRACT.md`
6. `000_RUNTIME_ENTRYPOINT.md`

---

## Risk notes

- Reconcile unstaged `apps/workboard` edits before any IMPLEMENT phase.
- Keep feature flags for rollback.
- Register phase 01 in `PHASE_REGISTRY.md` before execution.

---

*Handoff bundle: `phase_tmp/0001_PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT.zip`*
