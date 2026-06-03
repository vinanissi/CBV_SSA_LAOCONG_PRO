# ADR Addendum — OCMS Case Lifecycle Model

- **ID**: ADR_OCMS_CASE_LIFECYCLE_ADDENDUM
- **Date**: 2026-05-31
- **Status**: **ACCEPTED** (implementation `PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL`)
- **Supersedes**: none
- **Extends**: `ADR_OCMS_FOUNDATION.md`, `ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md`, `ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM.md` (does **not** override)
- **Related**: `OCMS_CASE_LIFECYCLE_MODEL.md`, `PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL_REPORT.md`

---

## Context

OCMS foundation phases established Case, CRM, Case Type, and Result. Operators and future read models still cannot answer:

- Case sinh ra như thế nào?
- Case đi qua trạng thái vận hành nào?
- Khi nào review, đóng, archive, reopen?
- Case khác Task Status thế nào?

**Task status** (`TASK_MAIN`) governs a single Work Item. **Result** governs business outcome. Neither describes the **operational phase** of the whole Case (e.g. waiting for documents while tasks are "in progress").

---

## Decision

1. **Case Lifecycle** is a **conceptual operational phase model** (V0/V0B/V0C) — independent of task status, checklist state, and Case Result.

2. **Three-way separation (binding):**

   | Layer | Scope | Example |
   |-------|-------|---------|
   | **Task Status** | One Work Item | Task Open / Done |
   | **Case Lifecycle** | Whole Case phase | REVIEW, WAITING |
   | **Case Result** | Business outcome | Approved, Returned |

   Example: Lifecycle = **REVIEW** while Result may be unset or pending; final Result = **Approved** or **Returned**.

3. **Global lifecycle states** (10): NEW, TRIAGE, ACTIVE, WAITING, REVIEW, BLOCKED, RESOLVED, CLOSED, ARCHIVED, REOPENED — defined in `OCMS_CASE_LIFECYCLE_MODEL.md`.

4. **ESCALATED** is **not** a required lifecycle state. Escalation is expressed via **BLOCKED** lifecycle (optional), **Escalation** responsibility role, **Handoff/Decision** memory, and **ESCALATED** result group when terminal or milestone.

5. **No persistence** in this phase — no `CASE_MAIN`, `CASE_LIFECYCLE` sheet, lifecycle column on `TASK_MAIN`, or API/UI changes.

6. **Work Inbox V3 unchanged** — `/inbox` and task groups are not lifecycle labels.

7. **Future read model** must expose `lifecycle` separately from `result` and must not derive lifecycle solely from `TASK_MAIN.STATUS`.

---

## Non-goals

- Lifecycle column or sheet
- Sync lifecycle ↔ task status automation
- Work Inbox rebrand
- Overriding prior OCMS ADRs
- Checklist item state as lifecycle proxy

---

## Risks

| Risk | Mitigation |
|------|------------|
| Lifecycle confused with inbox "Waiting" group | Document mapping; inbox groups unchanged |
| Too many states for operators | Lifecycle shown in case context strip only (future) |
| Reopen abuse | Reopen rules + Memory Decision in model doc |
| BLOCKED vs WAITING overlap | Clear definitions in lifecycle model |

---

## Future phase impact

| Phase | Impact |
|-------|--------|
| `PHASE_OCMS_01_CASE_KEY_CONVENTION` | Lifecycle optional in read key metadata |
| `PHASE_OCMS_02_READ_MODEL_CONTRACT` | Fields: `lifecycle`, `lifecycleSince`, separate from `result` |
| `PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP` | Lifecycle chip (secondary) |
| `PHASE_OCMS_05_CASE_REGISTRY_EVAL` | Eval persisted lifecycle vs derived |

---

## Consequences

**Positive**

- Complete operational vocabulary before read-model contract.
- Supports pause, review, reopen without overloading task status.

**Negative / residual**

- Lifecycle not visible in production until binding phases.
- Derivation rules remain conceptual until implementation ADR.

---

*Append-only ADR addendum.*
