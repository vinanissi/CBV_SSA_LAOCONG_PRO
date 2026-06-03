# Case Runtime Extraction Plan — Phased Refactor

**Phase:** `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT`  
**Date:** 2026-06-01  
**Prerequisite:** This audit accepted (GO / GO_WITH_WARNINGS)

---

## Answer: Can existing runtime be safely refactored?

**Yes — with constraints.** The repository already has:

- Production Task + Work Inbox stack (worker, gas-runtime-api, TASK_MAIN)
- OCMS read-model + Case Context Strip (flag-gated)
- Accepted ADRs forbidding blind `CASE_MAIN` creation

Refactor = **elevate Case as operator mental model** while **keeping Task as execution/persistence engine** until explicit persistence phase.

---

## Phased refactor plan

| Phase | ID | Mode | Goal |
|-------|-----|------|------|
| **00** | `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT` | AUDIT | This document set |
| **01** | `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY` | DOC-ONLY | Case as operational root; boundaries |
| **02** | `PHASE_CASE_REFACTOR_02_CASE_READ_MODEL` | IMPLEMENT | Harden read model, flag alignment, tests |
| **03** | `PHASE_CASE_REFACTOR_03_CASE_WORKSPACE_UI` | IMPLEMENT | Expand strip → workspace shell (read-only+) |
| **04** | `PHASE_CASE_REFACTOR_04_FEDERATED_TIMELINE` | IMPLEMENT | Case-key timeline merge (read) |
| **05** | `PHASE_CASE_REFACTOR_05_PERSISTENCE_EVAL` | AUDIT | CASE_MAIN justification |
| **06+** | TBD | TBD | Persistence, write model — ADR required |

**Do not skip 01 → 02.** Do not implement UI workspace (03) before read model (02) accepted.

---

## Extract first

1. **Case authority pack** (`00_SYSTEM_BRAIN/CASE/` + ADR) — definitions, boundaries.
2. **Unify feature flag naming** (`VITE_OCMS_CASE_STRIP_ENABLED` vs docs).
3. **Case read model module** — consolidate `deriveCaseReadModel`, discovery, key resolver behind stable export API.
4. **Static contract tests** — extend `ocmsCaseContextStripChecks.ts` for refactor invariants.

---

## Leave untouched (until later ADR)

- `TASK_MAIN` schema and `90_BOOTSTRAP_SCHEMA.js`
- Worker route shapes (`/api/work-inbox/tasks/:taskId/*`)
- GAS action names (`wiOp*`, task DB actions)
- AppSheet security filters and slices
- `SHARED_WITH` / `IS_PRIVATE` production baseline

---

## Adapt (wrapper pattern)

| Current | Adapter role |
|---------|--------------|
| `deriveCaseReadModel(task, bundle)` | `getCaseContextForTask(taskId)` → same data, stable interface |
| Operational bundle loader | Optional `getCaseOperationalView(caseKey)` aggregating tasks |
| Focus workspace | Case header + existing task panels |
| Timeline APIs | Read aggregators keyed by `caseKey` |

---

## Do not touch (high risk)

- `45_SHARED_WITH_SERVICE.js` visibility logic
- Inbox group assignment algorithms
- Auth/session adapters
- DSR sync runtime (orthogonal subsystem)

---

## Rollback strategy

- All UI changes behind **feature flags** (`VITE_OCMS_CASE_STRIP_ENABLED`, future `VITE_CASE_WORKSPACE_ENABLED`).
- No schema migrations in phases 01–04 → rollback = disable flag + deploy previous FE bundle.
- Keep task-only routes working — Case routes are additive aliases.

---

## Risk controls

| Control | Action |
|---------|--------|
| No silent mock fallback | Enforce existing worker envelope rules |
| Phase registry | Register each phase before IMPLEMENT |
| Bundle ≤10 files | Per RCLA handoff |
| Test evidence | Static checks + optional `npm run build` in workboard |
| Operator UAT | Repeat OCMS_03B pattern after UI phase |

---

## Expected next phase

**`PHASE_CASE_REFACTOR_01_CASE_AUTHORITY`** — formalize Case-Centric Runtime Authority; define Case/Checklist/Task/Document/Timeline/Handoff boundaries; preserve read-model-first and persistence-later.

**Do not start** `PHASE_CASE_REFACTOR_02_CASE_READ_MODEL` until 01 is accepted.

---

*Extraction plan is reversible and additive.*
