# Case Entity Boundary Contract

**Version:** 1.0  
**Status:** ACCEPTED  
**Phase:** `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY`  
**Authority:** `CASE_RUNTIME_AUTHORITY_V1.md`  
**ADR:** `ADR_CASE_CENTRIC_RUNTIME.md`

---

## Purpose

Define **hard boundaries** between Case and related entities so implementers do not collapse concepts during refactor.

---

## Case vs Task

| Dimension | Case | Task |
|-----------|------|------|
| Question answered | *What matter are we handling?* | *What action is assigned now?* |
| Operator root (target) | Yes | No (child section) |
| Persistence (now) | Read-model / logical | `TASK_MAIN` |
| ID in URL (today) | Optional future `caseKey` route | `taskId` required |
| Lifecycle | WorkflowState (§ lifecycle authority) | `STATUS` |
| Completion | Case outcome / result | Task complete |
| Can exist alone? | Logical Case from weak data → diagnostics | Yes — orphan task allowed in transition |

**Invariant:** Completing a Task does not automatically close a Case.

---

## Case vs Checklist

| Dimension | Case | Checklist item |
|-----------|------|----------------|
| Scope | Whole matter | Step / criterion within matter |
| Default type | Container | Step (not Task) |
| Owner | Case responsibility | Often implicit; no separate owner unless promoted |
| Persistence today | N/A (logical) | `TASK_CHECKLIST` row |

**Promotion trigger (all required: at least one):**

1. Separate owner  
2. Separate deadline  
3. Separate status tracking  
4. Separate document requirement  
5. Separate follow-up / timeline trace  

**Anti-pattern:** Auto-create Task for every checklist line.

---

## Case vs Document

| Dimension | Case | Document |
|-----------|------|----------|
| Ownership | Primary | Belongs to Case |
| Task-specific doc | — | Linked to Task **and** visible on Case |
| Examples | Hồ sơ file set | Attachment on one action |

**Rule:** Case Documents panel shows **union** of Case-level and linked Task documents in read model (phase 02+).

---

## Case vs Timeline

| Dimension | Case | Timeline |
|-----------|------|----------|
| Semantics | History of the matter | Append-only event stream |
| Scope | All modules feeding Case | Entries tagged with source |
| Comment | — | Entry type, not sibling entity |

**Invariant:** Timeline entries are never deleted in operator UX; corrections are new entries.

---

## Case vs Handoff

| Dimension | Case | Handoff |
|-----------|------|---------|
| Relationship | Owner of handoff state | Structured snapshot of Case |
| Task assign | — | May **trigger** handoff entry, not replace Case handoff |

**Rule:** Operator “hand off task” UI writes task assign + timeline; Case handoff **summarizes** at matter level.

---

## Comment: Timeline entry vs separate entity

| Option | Decision |
|--------|----------|
| A — Timeline entry type | **ACCEPTED** for V1 |
| B — Separate Case sub-entity | **REJECTED** until persistence phase re-evaluates |

**Mapping:**

```text
TimelineEntry.entryType ∈ { TASK_UPDATE, CHECKLIST, DOCUMENT, HANDOFF, COMMENT, WORKFLOW, SYSTEM, … }
```

---

## WorkflowState vs Workflow Engine

| | WorkflowState | Workflow Engine |
|---|---------------|-----------------|
| Purpose | Display current Case stage | Automate routing |
| V1 | Allowed (derived) | **Forbidden** |
| Transitions | Manual / derived display | Auto rules — out of scope |

---

## Boundary diagram

```text
┌─────────────────────────────────────────────┐
│ CASE                                         │
│  WorkflowState ──────────────────────────── │
│  Context / Responsibility                    │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Checklist   │  │ Timeline (append)    │  │
│  │  (steps)    │  │  incl. COMMENT type  │  │
│  └──────┬──────┘  └──────────────────────┘  │
│         │ promote (criteria)                 │
│  ┌──────▼──────┐  ┌──────────┐  Handoff    │
│  │ Tasks       │  │ Documents│  (summary)  │
│  └─────────────┘  └──────────┘              │
└─────────────────────────────────────────────┘
         │ mutations today ▼
    TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, …
```

---

## Contract violations (forbid)

- Using `TASK_MAIN.STATUS` as Case WorkflowState without explicit mapping  
- Storing Case lifecycle in a new column without ADR  
- Case API POST in read-model phases  
- Checklist item = Task by default  
- Fabricating Responsible when USER_DIRECTORY / owner missing  

---

*Implementers: phase 02+ must cite this contract in PR / phase reports.*
