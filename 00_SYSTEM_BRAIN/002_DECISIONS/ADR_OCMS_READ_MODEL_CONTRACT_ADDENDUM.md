# ADR Addendum — OCMS Read Model Contract

- **ID**: ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM
- **Date**: 2026-05-31
- **Status**: **ACCEPTED** (implementation `PHASE_OCMS_02_READ_MODEL_CONTRACT`)
- **Supersedes**: none
- **Extends**: all prior OCMS ADRs (foundation, CRM, case type/result, lifecycle, relation) — does **not** override
- **Related**: `OCMS_READ_MODEL_CONTRACT.md`, `OCMS_READ_MODEL_MAPPING.md`, `OCMS_READ_MODEL_EXAMPLES.md`

---

## Context

OCMS foundation phases (00–01C) defined conceptual Case, CRM, Case Type, Result, Lifecycle, and Relation. **OCMS_03** (Focus Case Context Strip) requires a **stable read contract** before any UI or runtime code — without introducing `CASE_MAIN` or fake production data.

Principle: **READ FIRST, WRITE LATER.**

---

## Decision

1. **`CaseReadModel`** is the canonical **read-only contract** for OCMS UI and future Worker read endpoints — documented in `OCMS_READ_MODEL_CONTRACT.md`. It is **not** a persistence schema.

2. **Read Model ≠ Persistence Model** — no `CASE_MAIN`, `CASE_READ_MODEL` sheet, or case store in this phase. Values are **derived** from AS-IS runtimes (`TASK_MAIN`, `HO_SO_*`, `FINANCE_*`, etc.) per `OCMS_READ_MODEL_MAPPING.md`.

3. **Orthogonal fields (binding)** — contract must expose separately:
   - `workItems[].status` (taskStatus)
   - `lifecycle` (caseLifecycle)
   - `result` (caseResult, nullable)
   - `caseType`
   - `relations[]`
   - `projections`
   - `memorySummary`

4. **No real API** in this phase — contract is spec only for `PHASE_OCMS_03` / `04` and future `GET /api/ocms/case-read-model` (name TBD).

5. **No silent fake data** in production mode — missing sources surface in `diagnostics`; empty/null with warnings, not mock fill (aligns with ecosystem no-silent-degradation rule).

6. **Work Inbox V3 unchanged** — `/inbox` remains task queue; CaseReadModel is secondary context (strip/panel), not inbox row replacement.

7. **Mutations** remain on source runtimes (`TASK_MAIN`, attachments, checklist) — `permissions.canMutateTask` gates UI only; CaseReadModel has no write surface.

---

## Non-goals

- CASE_MAIN, CASE_RELATION table, MEMORY_MAIN
- Worker/GAS/FE implementation
- TASK_MAIN schema changes
- Work Inbox rebrand
- Production mock/fallback data

---

## Risks

| Risk | Mitigation |
|------|------------|
| Derivation confidence low | `diagnostics.confidence` + warnings |
| Field collapse (lifecycle = task status) | Contract schema + anti-patterns |
| OCMS_03 scope creep | Strip reads contract subset only |
| Missing HO_SO on task | TASK_ANCHORED fallback + missingRelations |

---

## Future implementation impact

| Phase | Uses contract |
|-------|---------------|
| `PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP` | `caseType`, `lifecycle`, `title`, `relations[PRIMARY]`, `memorySummary.recent` |
| `PHASE_OCMS_04_FEDERATED_TIMELINE_READ` | `memorySummary` expansion |
| Future Worker read route | Full `CaseReadModel` JSON |
| `PHASE_OCMS_05_CASE_REGISTRY_EVAL` | Compare derive vs persist need |

---

## Consequences

**Positive**

- OCMS_03 can implement against frozen contract.
- Clear separation for operators and engineers.

**Negative / residual**

- Derivation logic not built until IMPLEMENT phase.
- Case Key convention (`OCMS_01`) still optional doc — contract allows derived keys.

---

*Append-only ADR addendum.*
