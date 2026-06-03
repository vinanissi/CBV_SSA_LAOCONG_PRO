# ADR Addendum — OCMS Case Type + Result Model

- **ID**: ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM
- **Date**: 2026-05-31
- **Status**: **ACCEPTED** (implementation `PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL`)
- **Supersedes**: none
- **Extends**: `ADR_OCMS_FOUNDATION.md`, `ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md` (does **not** override)
- **Related**: `OCMS_CASE_TYPE_CATALOG.md`, `OCMS_RESULT_MODEL.md`, `PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL_REPORT.md`

---

## Context

OCMS foundation (`ADR_OCMS_FOUNDATION.md`) and CRM addendum (`ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md`) established **Case + Responsibility + Memory** with derived **Result** as a brief outcome concept. Audit of `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` found:

1. **Case Type** missing — operators and future UI cannot answer *đây là loại case gì?* without ad-hoc labels.
2. **Result** under-specified — collapsed toward task status / COMPLETED; no type-specific outcome vocabulary for review, evidence, deferral, escalation.

CBV OCMS complete conceptual frame requires:

```text
CASE
├── CASE TYPE
├── RESPONSIBILITY
├── WORK / STEPS
├── MEMORY
├── RESULT
└── MODULE PROJECTION
```

This addendum closes the gap **documentation-only** on branch `phase/ocms-foundation-v1`.

---

## Decision

1. **Case Type** is a **conceptual classification** in V0/V0A/V0B — not a persisted sheet or enum column in this phase. Ten pilot types are cataloged in `OCMS_CASE_TYPE_CATALOG.md`.

2. **Case Type drives design defaults** (not runtime enforcement yet):
   - Checklist pattern templates
   - Required document / attachment emphasis
   - SLA intent (documentation only)
   - Default responsibility role hints
   - Suggested result model per type
   - Related modules (HO_SO, FINANCE, etc.)

3. **Result** is a **derived outcome or milestone** in V0/V0A/V0B — distinct from task **status** (`TASK_MAIN` status fields). Result answers: *case đã xong chưa, xong theo kiểu nào, cần review/evidence không?* Full spec: `OCMS_RESULT_MODEL.md`.

4. **Result ≠ status** — Task status mutates via `TASK_MAIN` runtime; Case Result is computed or declared at case level from Work Items + Memory + Responsibility closure rules (future binding).

5. **No persistence** in this phase — no `CASE_MAIN`, `CASE_TYPE` sheet, `RESULT` sheet, or changes to `TASK_MAIN`, `TASK_CHECKLIST`, `TASK_ATTACHMENT`.

6. **Work Inbox V3 unchanged** — `/inbox` remains task queue; Case Type and Result are OCMS design layers, not inbox labels.

7. **Dependency note** — `PHASE_OCMS_01A` may run before `PHASE_OCMS_01_CASE_KEY_CONVENTION`; Case Key remains logical dependency for **implementation** phases after OCMS_02.

---

## Binding for future OCMS phases

| Phase area | Must use |
|------------|----------|
| Case Key convention | Case Type code in key composition examples |
| Read model contract | Case Type + Result as read-only fields |
| Focus case strip | Type badge + result summary (secondary UI) |
| Federated timeline | Result transitions as Memory Decision/Update events |
| Registry eval | Assess whether Case Type / Result need persistence |

---

## Non-goals (this addendum)

- `CASE_MAIN`, `CASE_TYPE` table, `RESULT` table
- Worker/GAS/FE changes
- TASK_MAIN schema or status enum changes
- SLA automation or timers
- Work Inbox rebrand to "Case"
- Overriding foundation or CRM ADRs

---

## Risks

| Risk | Mitigation |
|------|------------|
| Case Type catalog too broad for pilot | `pilot priority` per type in catalog |
| Result vs task status confusion | Explicit § in `OCMS_RESULT_MODEL.md`; inbox unchanged |
| Premature SLA enforcement | SLA documented as intent only until ADR + runtime phase |
| Type proliferation | V0 catalog frozen at 10 codes; new types via ADR amend |

---

## Future phase impact

| Phase | Impact |
|-------|--------|
| `PHASE_OCMS_01_CASE_KEY_CONVENTION` | Include `CASE_TYPE` code segment in key examples |
| `PHASE_OCMS_02_READ_MODEL_CONTRACT` | Contract fields: `caseType`, `result`, `resultGroup` |
| `PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP` | Optional type + result chip |
| Work Inbox checklist/attachments | Checklist patterns align to Case Type catalog |
| `PHASE_OCMS_05_CASE_REGISTRY_EVAL` | Eval persistence for type + result vs federated derive |

---

## Consequences

**Positive**

- Complete OCMS conceptual skeleton before read-model implementation.
- Shared vocabulary across HO_SO, FINANCE, COMPLAINT, etc.
- Result model supports review, return, evidence — not binary done/undone.

**Negative / residual**

- Types and results not enforced in production until binding phases.
- Operators still see task-centric UI until OCMS_03+.

---

*Append-only ADR addendum.*
