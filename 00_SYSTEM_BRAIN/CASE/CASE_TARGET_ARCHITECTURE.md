# Case Target Architecture — Case-Centric Runtime (Design Only)

**Phase:** `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT`  
**Date:** 2026-06-01  
**Status:** Proposed — **not implemented**

---

## Proposed Case-Centric Runtime model

```text
CASE (operational root — logical, then optionally persisted)
├── Context          ← discovery + anchors + module projections
├── Checklist        ← steps to complete the Case (not always Tasks)
├── Tasks            ← work items with owner/status/deadline when needed
├── Documents        ← files, links, proofs (Drive, PDF, images)
├── Timeline         ← append-only operational history (federated read)
├── Comments         ← operator notes (may map to existing note sheets)
├── Handoff          ← transfer context (read from assign + timeline)
└── WorkflowState    ← Case lifecycle stage (≠ task STATUS)
```

---

## Case Workspace layout (target)

```text
┌─────────────────────────────────────────────────────────────┐
│ Case Header (type, key, lifecycle, responsibility)          │
├──────────────────────────┬──────────────────────────────────┤
│ Case Checklist           │ Case Timeline (read, federated)  │
│ (steps, spawn task)      │                                  │
├──────────────────────────┼──────────────────────────────────┤
│ Tasks under Case         │ Documents / Attachments          │
│ (inbox-style list)       │                                  │
├──────────────────────────┴──────────────────────────────────┤
│ Handoff panel │ Actions (complete task, assign, module links)│
└─────────────────────────────────────────────────────────────┘
```

**Evolution path:** Current `FocusTaskWorkspace` + `WorkInboxCaseContextStrip` → expand strip into header + split panels — **no big-bang rewrite**.

---

## Relations

### Case → Checklist

- Checklist items are **Case steps**.
- Item becomes a **Task** only when needing separate owner, deadline, status, document, or follow-up.
- **Today:** checklist rows are `TASK_CHECKLIST` — migration = adapter or dual-write phase (TBD).

### Case → Task

- Tasks are **children** for execution.
- `TASK_MAIN` remains mutation target per `ADR_OCMS_FOUNDATION`.
- Multiple tasks may share one `caseKey` via `RELATED_ENTITY_*` anchors.

### Case → Document

- Union of `TASK_ATTACHMENT`, `HO_SO_FILE`, operational document ops — **read model merge**.
- Writes stay on existing stores until Case document ADR.

### Case → Timeline

- Federated append-only view: `TASK_TIMELINE` + `TASK_UPDATE_LOG` + module logs.
- Aligns with proposed `PHASE_OCMS_04_FEDERATED_TIMELINE_READ`.

### Case → Handoff

- Composed read model: last assign event + operator notes + responsibility memory (OCMS CRM triad).

### WorkflowState

- Case stage (e.g. intake, processing, waiting, closed).
- **Not** `TASK_MAIN.STATUS`.
- **No workflow engine** in early phases — display-only derived state.

---

## Rules (binding for refactor branch)

1. **Read-model-first** — Case UI consumes composed reads; no Case write API until ADR.
2. **Persistence-later** — No new sheets until eval phase proves need.
3. **Work Inbox V3 front door** — `/inbox` remains; Case workspace is deeper context, not replacement landing.
4. **TASK execution engine** — Completing work still updates `TASK_MAIN`.

---

## Explicit: no `CASE_MAIN` until proven necessary

This audit finds:

- OCMS already delivers **CaseReadModel** from task + anchors without `CASE_MAIN`.
- Anchors exist: `RELATED_ENTITY_TYPE/ID`, HO_SO, FINANCE, ALERT.
- Risk of duplicate SoT outweighs benefit **until** multi-task-per-case operations require stable Case ID across modules.

**Decision for refactor branch:** Proceed with **logical Case** + read models through phase 02–03; schedule **registry eval** (OCMS_05 analog) before any `CASE_MAIN` column/table.

---

## Alignment with accepted ADRs

| ADR | Alignment |
|-----|-----------|
| `ADR_OCMS_FOUNDATION` | Case logical; Task executes — **preserved** |
| `ADR_OCMS_READ_MODEL_CONTRACT` | CaseReadModel — **extends** |
| `ADR_001 Work Inbox V3` | Inbox unchanged — **preserved** |
| `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH` | TASK_MAIN — **preserved** |

---

*Design-only artifact. Implementation requires `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY` acceptance.*
