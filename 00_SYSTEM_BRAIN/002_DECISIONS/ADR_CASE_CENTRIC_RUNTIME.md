# ADR — Case-Centric Runtime (CBV/OCMS Refactor)

- **ID:** `ADR_CASE_CENTRIC_RUNTIME`
- **Date:** 2026-06-01
- **Status:** **ACCEPTED** (`PHASE_CASE_REFACTOR_01_CASE_AUTHORITY`)
- **Branch:** `phase/case-centric-runtime-refactor`
- **Related:** `ADR_OCMS_FOUNDATION.md`, `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`, `CASE_RUNTIME_AUTHORITY_V1.md`
- **Supersedes:** None (extends OCMS foundation; does not revoke Work Inbox or TASK SoT ADRs)

---

## Context

`PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT` confirmed:

- Production runtime is **Task-centric** (`TASK_MAIN`, `/inbox/:taskId`, task-scoped work-inbox APIs).
- OCMS already delivers **logical Case** via read model + Case Context Strip (flag-gated).
- Rebuild would risk Work Inbox V3, `SHARED_WITH`/`IS_PRIVATE` baseline, and dual GAS projects.
- No `CASE_MAIN` exists; persistence is not yet justified.

Operators need one **operational memory container** per real matter (hồ sơ, hóa đơn, khiếu nại, …) while keeping proven task execution.

---

## Decision

1. **CBV/OCMS evolves from Task-Centric Runtime to Case-Centric Runtime through controlled refactor, not full rebuild.**

2. **Case is the primary operational unit** — the matter being handled. **Task is a work item under Case** when Case Runtime is active in the operator UX.

3. **Task remains the persistence and mutation root** until `PHASE_CASE_REFACTOR_05_PERSISTENCE_DECISION` (or equivalent) accepts a Case store. `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md` and `ADR_OCMS_FOUNDATION.md` remain in force.

4. **Case is read-model root first** — `CaseReadModel` (OCMS contract) is composed from TASK_MAIN, anchors, module projections, and diagnostics. No Case write API in refactor phases 02–04.

5. **No `CASE_MAIN`** in this refactor branch until persistence decision phase proves necessity (volume, multi-task coordination, cross-module writes).

6. **Work Inbox V3 stays the front door** (`ADR_001_CBV_WORK_INBOX_V3_WORK_INBOX_DECISION.md`). Case Workspace is deeper context, not a replacement landing route.

7. **Authority pack** under `00_SYSTEM_BRAIN/CASE/` binds phases 02+:
   - `CASE_RUNTIME_AUTHORITY_V1.md`
   - `CASE_ENTITY_BOUNDARY_CONTRACT.md`
   - `CASE_READ_MODEL_AUTHORITY.md`
   - `CASE_WORKSPACE_LAYOUT_AUTHORITY.md`

8. **OCMS authorities remain valid** where not explicitly extended. Case refactor authorities **specialize** OCMS for runtime evolution; conflicts must be reported, not guessed.

---

## Accepted model

```text
CASE (operational root — logical → optional persistence later)
├── Context
├── Checklist
├── Tasks
├── Documents
├── Timeline (Comments as entry types)
├── Handoff
└── WorkflowState
```

---

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| Full rebuild with Case-first DB | High risk; duplicates TASK_MAIN SoT |
| Immediate `CASE_MAIN` + Case API | Audit: anchors + read model sufficient for P0–P4 |
| Replace Work Inbox with Case inbox | Violates ADR-001; inbox rows remain work items |
| Merge checklist into tasks by default | Loses step/evidence model; operator overload |
| Workflow engine in refactor branch | Out of scope; WorkflowState is display/derived only |
| Comment as separate persisted entity (P0) | Unnecessary surface; timeline entry type preferred |

---

## Persistence boundary

- **No** new sheet tables or columns in phases 01–04.
- **No** Case Service, Repository, Store, or mutation endpoint.
- Persistence eval deferred to **`PHASE_CASE_REFACTOR_05_PERSISTENCE_DECISION`**.

---

## Migration boundary

- Additive routes and flags only until UI phase.
- Task routes (`/inbox/:taskId`) remain valid through transition.
- Checklist/attachment rows remain `TASK_*` keyed until dual-write ADR.
- AppSheet paths unchanged unless separate phase.

---

## Consequences

**Positive:** Shared refactor vocabulary; clear phase gates; preserves production task stack.

**Negative:** Dual mental model during transition (task URL, case context). Requires disciplined read-model phase before workspace UI.

**Follow-up:** `PHASE_CASE_REFACTOR_02_CASE_READ_MODEL` — harden contract and derivation; still no persistence.

---

*Accepted by phase charter. Amend via ADR addendum only.*
