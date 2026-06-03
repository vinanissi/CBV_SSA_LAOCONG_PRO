# Case Read Model Derivation Rules

**Phase:** `PHASE_CASE_REFACTOR_02_CASE_READ_MODEL`  
**Implementation:** `apps/workboard/src/modules/ocms/caseReadModelProjection.ts`, `deriveCaseRuntimeReadModel.ts`

---

## Pipeline

```text
TaskItem + TaskOperationalBundle? + WorkInboxChecklistItem[]?
    → deriveCaseReadModel() → CaseReadModel (ocmsCore)
    → project*() slices
    → CaseRuntimeReadModel
```

---

## Task → Case

| Step | Rule |
|------|------|
| Discovery | `runCaseDiscovery(task)` — OCMS authority |
| Key | `resolveCaseKeyWithDiagnostics()` |
| Permissions | `permissionAllowed === false` → null model |
| Title | `task.title` or diagnostic `MISSING_TITLE` |
| Source | Discovery winner → `CaseReadSource` |

**Invariant:** Task remains persistence root; Case is projection.

---

## Status → Lifecycle / WorkflowState

| TASK_MAIN.STATUS (normalized) | Lifecycle code |
|-------------------------------|----------------|
| NEW, ASSIGNED | TRIAGE |
| IN_PROGRESS | ACTIVE |
| WAITING | WAITING |
| BLOCKED | BLOCKED |
| DONE, COMPLETED | RESOLVED |
| CANCELLED | CLOSED |

Unknown → ACTIVE + `AMBIGUOUS_LIFECYCLE` diagnostic.

**WorkflowState:** `projectWorkflowState(lifecycle)` — same code/label initially.

---

## Owner → Responsibility

| Field | Source |
|-------|--------|
| Responsible | `ownerId` / `ownerDisplayName` / `displayOwner` |
| Support | `assignedTo` if ≠ owner |
| Reviewer / Escalation / Watcher | Empty until module data — no fabrication |

Missing responsible → `MISSING_RESPONSIBLE` diagnostic.

---

## Checklist → CaseChecklistItem

| Input | `WorkInboxChecklistItem[]` (optional; from focus runtime hook) |
| Map | `id` ← checklistId, `label` ← title, `done` ← isDone/status |
| promoteToTaskCandidate | `isRequired && !done` |

Empty → `NO_CHECKLIST` (INFO).

**Not converted to Tasks.**

---

## Task → CaseTaskRef

V1: single focus task in `tasks[]`.  
`MULTI_TASK_GROUPING_DEFERRED` diagnostic always emitted until grouping phase.

---

## Attachment/Document → CaseDocumentRef

From `bundle.documents` when `bundle.taskId === task.taskId`.

| Field | Source |
|-------|--------|
| documentId, title, url | TaskDocument |
| linkedTaskId | taskId |
| source | `TASK_DOCUMENT` |

Empty → `NO_DOCUMENTS` (INFO).

---

## Timeline / Comment → CaseTimelineEntry

| Source | entryType |
|--------|-----------|
| bundle.timeline | Mapped from eventType (HANDOFF, CHECKLIST, TASK_UPDATE, …) |
| bundle.notes | `COMMENT` |

Append-only flag `appendOnly: true` on all entries.

Empty timeline → `NO_TIMELINE` (INFO).

---

## Handoff → CaseHandoff

`buildFocusHandoffView(bundle, taskDetail)` — existing focus helper.

Null → `NO_HANDOFF` (INFO).

---

## Case type mapping

| Discovery anchor | caseType default |
|------------------|------------------|
| HO_SO_ANCHORED | HO_SO |
| FINANCE_ANCHORED | FINANCE |
| ALERT_ANCHORED | OPERATIONS |
| TASK_ANCHORED | OPERATIONS |

Refine via `OCMS_CASE_TYPE_CATALOG` in future; unknown → diagnostic path in OCMS derive.

---

## No silent fallback

| Gap | Behavior |
|-----|----------|
| Missing data | null / empty + diagnostic code |
| Weak key | OCMS warnings + `CASE_KEY_FALLBACK` |
| No permission | null model |

---

*Pure functions only — no fetch, no POST.*
