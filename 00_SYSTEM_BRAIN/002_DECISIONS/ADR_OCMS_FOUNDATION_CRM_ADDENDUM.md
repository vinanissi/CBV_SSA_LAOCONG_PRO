# ADR Addendum — OCMS Foundation CRM (Case + Responsibility + Memory)

- **ID**: ADR_OCMS_FOUNDATION_CRM_ADDENDUM
- **Date**: 2026-05-31
- **Status**: **ACCEPTED** (implementation `PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL`)
- **Supersedes**: none
- **Extends**: `ADR_OCMS_FOUNDATION.md` (does **not** replace or override)
- **Related**: `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md`, `OCMS_DOMAIN_MODEL.md`, `PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL_REPORT.md`

---

## Terminology notice

**CRM** in this addendum means **Case + Responsibility + Memory** — an internal CBV strategic triad. It is **not** Customer Relationship Management.

---

## Context

`PHASE_OCMS_00_DESIGN_AUTHORITY` established OCMS as CBV's evolution frame with a logical **Case**, **Work Item**, and **Episode** model. That foundation correctly bound AS-IS runtimes (`TASK_MAIN`, `HOME_ALERT`, module sheets) and preserved Work Inbox V3.

Gap identified in audit:

1. **Case** was defined as aggregate but not as the operator-facing **matter** (việc / hồ sơ / vấn đề vận hành) distinct from a single task row.
2. **Responsibility** collapsed toward `OWNER_ID` / `assigned_to` — insufficient for support, review, escalation, and watch roles.
3. **Memory** collapsed toward timeline / Episode — insufficient for checklist activity, attachments, decisions, handoffs, and evidence as first-class memory types.

CBV strategic core must be explicit before Case Key convention and read-model phases proceed.

---

## Decision

1. **CBV OCMS strategic core is CRM:** **Case + Responsibility + Memory**. All future OCMS phases must align design and charters to this triad unless a ratified ADR scopes a narrower exception.

2. **Case (extended binding)** — An operational matter requiring coordinated handling across time and modules. A Case:
   - May contain zero or many **Work Items** (tasks, alerts, module todos) per `OCMS_DOMAIN_MODEL.md`.
   - May anchor on hồ sơ, task cluster, finance matter, or cross-module problem — **Case ≠ Task**.
   - Remains **logical in V0/V0A** — no `CASE_MAIN`, no new sheet in this addendum.

3. **Responsibility (new binding)** — Who is accountable and in what role. Responsibility is **not** equivalent to `TASK_MAIN.ASSIGNEE_ID` or `OWNER_ID` alone. Binding roles for future phases:
   - **Responsible** — ultimate accountability for case outcome
   - **Support** — executes work under Responsible direction
   - **Reviewer** — approves, validates, or signs off
   - **Escalation** — receives escalation when blocked or overdue
   - **Watcher** — informed; no mandatory action

   AS-IS task fields may **map** to Responsible/Support but do not **define** the full Responsibility model.

4. **Memory (new binding)** — Durable operational record of what happened, was decided, attached, handed off, or proven. Memory is **not** equivalent to a single timeline stream. Binding memory types:
   - Timeline, Checklist Activity, Attachment, Comment, Update, Decision, Handoff, Evidence

   Federated logs (`TASK_UPDATE_LOG`, `HO_SO_UPDATE_LOG`, checklist/attachment runtimes) are **sources** that populate Memory views — not the Memory model itself.

5. **Work / Steps and Result** — Case execution decomposes into **Work / Steps** (actionable units, often TaskWorkItems + checklist steps) and resolves to **Result** (outcome state: done, rejected, deferred, escalated). Result is derived; not a separate persistence layer in V0A.

6. **Work Inbox V3 unchanged** — `/inbox` remains task-queue front door. CRM does not rebrand inbox rows as "cases" in UI.

7. **Delivery** — DOC-ONLY: this addendum + `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md`. No API, UI, schema, or runtime code.

---

## Non-goals (this addendum)

- `CASE_MAIN` or responsibility/memory tables
- New Worker routes or GAS actions
- Work Inbox V3 route, group, or Focus redesign
- Replacing `ADR_OCMS_FOUNDATION.md`
- Customer Relationship Management semantics
- Auto-assignment or auto-escalation rules

---

## Impact

| Area | Impact |
|------|--------|
| `ADR_OCMS_FOUNDATION.md` | Unchanged; this document extends only |
| `OCMS_DOMAIN_MODEL.md` | Remains V0.1; CRM model is sibling extension |
| Work Inbox V3 | None |
| TASK_MAIN schema | None |
| Operator UI | None |
| Future OCMS phases | Must reference CRM triad in charter |

---

## Future phases affected

| Phase | CRM alignment expected |
|-------|------------------------|
| `PHASE_OCMS_01_CASE_KEY_CONVENTION` | Case identity under CRM Case pillar |
| `PHASE_OCMS_02_READ_MODEL_CONTRACT` | Read shell exposes Responsibility + Memory slices |
| `PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP` | Strip shows Case context + key roles + memory summary |
| `PHASE_OCMS_04_FEDERATED_TIMELINE_READ` | Timeline is one Memory type, not whole Memory |
| Work Inbox checklist / attachments runtime | Checklist Activity + Attachment = Memory sources |
| `PHASE_OCMS_05_CASE_REGISTRY_EVAL` | Evaluates need for persisted Case vs federated CRM |

---

## Consequences

**Positive**

- CBV positioned clearly as **Operational Case Management System** with accountable ownership and auditable memory.
- Responsibility and Memory phases can bind to existing task/checklist/attachment runtimes without schema shock.

**Negative / residual**

- Role assignment beyond task owner/assignee requires future binding phases.
- Memory federation complexity increases before UI merges views.
- Operators still see inbox-first UX until read-model phases ship.

---

## Alternatives considered

| Alternative | Verdict |
|-------------|---------|
| Extend only `OCMS_DOMAIN_MODEL.md` in place | ⚠️ Kept separate CRM doc to preserve V0.1 baseline |
| Use "CRM" as product name | ❌ Conflicts with industry meaning; internal triad only |
| Persist Responsibility table now | ❌ Violates no-schema constraint |
| Timeline-only memory | ❌ Ignores checklist, attachments, handoffs already in flight |

---

*Append-only ADR addendum.*
