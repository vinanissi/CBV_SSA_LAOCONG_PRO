# Task Dependency Map — Case-Centric Refactor Audit

**Phase:** `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT`  
**Date:** 2026-06-01

---

## Where Task is assumed as root entity

| Layer | Assumption | Examples |
|-------|------------|----------|
| **Routing** | URL contains `taskId` | `/inbox/:taskId`, `/tasks/:taskId` |
| **State** | Selected row = task | `TasksPage` selection, focus runtime context |
| **API** | REST paths prefixed with task | All `/api/work-inbox/tasks/:taskId/*` |
| **GAS** | Rows keyed by `TASK_ID` | Checklist, attachments, timeline sheets |
| **Auth** | Permissions per work-inbox op on task | `workInboxPermissions.ts` |
| **OCMS** | Case derived **from** focused task | `deriveCaseReadModel(task, bundle)` |

---

## Components depending on Task shape

| Component | Task fields used |
|-----------|------------------|
| `TaskItem` / `contracts.ts` | id, status, owner, dates, relatedEntity*, title |
| `WorkInboxGroupsPanel` | Groups of tasks |
| `FocusTaskWorkspace` | Full `TaskItem` |
| `useWorkInboxChecklistRuntime` | `taskId` only |
| `useWorkInboxOperationalBundle` | `taskId` |
| `deriveCaseReadModel` | Entire task + bundle |
| AppSheet slices | `TASK_MAIN` row filters |

---

## APIs depending on Task shape

| Endpoint family | Handler |
|-----------------|---------|
| `/api/tasks/*` | `taskGsDb`, `tasks`, `taskWrite` |
| `/api/work-inbox/tasks/:taskId/*` | checklist, attachments, operational |
| GAS actions | `getTaskDetail`, `getTaskWorkspaceSnapshot`, `wiOp*` |

**No API accepts `caseId` as primary key today.**

---

## Adapters depending on Task shape

| Adapter | Contract |
|---------|----------|
| `googleSheetTaskDbAdapter` | Task DB actions with task payload |
| `googleSheetWorkInboxOperationalAdapter` | `taskId` in every wiOp call |
| `taskWriteAdapter` | Legacy PATCH by task id |

---

## UI flows depending on Task ID

1. Inbox row click → navigate with `taskId`.
2. Focus open → load bundle for `taskId`.
3. Checklist toggle → PATCH `.../checklist/:id` under task.
4. Complete / assign → mutate `TASK_MAIN` row.
5. Case strip → **displays** case context but does not change selection model.

---

## Migration / refactor risk

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking `/inbox/:taskId` bookmarks | HIGH | Add `/case/:caseKey` alias later; keep task routes |
| Duplicate loaders (task + case) | MEDIUM | Case read model wraps existing bundle |
| Checklist ownership confusion | MEDIUM | Authority phase: Case checklist vs Task checklist |
| Split brain AppSheet vs Workboard | MEDIUM | TASK_MAIN remains SoT for tasks per ADR |
| Premature `CASE_MAIN` | HIGH | Block until OCMS_05-style eval — **do not create in refactor 01** |
| Feature flag drift (`OCMS_CASE_STRIP_ENABLED` vs `VITE_*`) | LOW | Document alias in authority phase |

---

## What can remain task-rooted

Per `ADR_OCMS_FOUNDATION`: **TASK remains execution engine** for mutations.

- Task complete, assign, status change
- Task-scoped checklist/attachment **until** Case persistence approved
- Inbox row still represents a **work item** (often a task)

---

## What must shift to Case-centric (conceptual, later phases)

- Operator navigation primary key (optional case route)
- Strip → full Case Workspace shell
- Checklist at Case level with task spawn rules
- Federated timeline keyed by caseKey
- Discovery registry across tasks sharing caseKey

---

*Refactor should **wrap** not **replace** task execution in early phases.*
