# UI Runtime Map — Case-Centric Refactor Audit

**Phase:** `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT`  
**Date:** 2026-06-01

---

## Work Inbox UI flow

```text
/inbox  →  WorkInboxShell  →  TasksPage
              │
              ├─ WorkInboxGroupsPanel (groups, counts)
              ├─ Search top bar (optional)
              └─ Select taskId (URL /inbox/:taskId)
```

1. Load workspace snapshot (`getTaskWorkspaceSnapshot` / loader).
2. Render grouped task rows (V3 groups when enabled).
3. User selects task → updates route → loads task detail + operational bundle.

**Root UX entity:** selected `taskId`.

---

## Focus Mode UI flow

```text
task selected + VITE_CBV_WORK_INBOX_FOCUS_RUNTIME
  →  WorkInboxFocusRuntime
       →  WorkInboxFocusActionHost (actions, bundle)
            →  FocusTaskWorkspace
                 ├─ CompactTaskHeader
                 ├─ WorkInboxCaseContextStrip (if VITE_OCMS_CASE_STRIP_ENABLED)
                 ├─ WorkInboxChecklistSection
                 ├─ WorkInboxAttachmentsSection
                 └─ Right tabs (timeline, handoff, notes, …)
```

**DetailPanel:** hidden on `/inbox` when focus runtime enabled (`DetailPanel.tsx`).

---

## Task Detail flow (legacy / non-focus)

| Path | UI |
|------|-----|
| `/tasks/:taskId` | `TasksPage` + `TaskDetailContent` in `DetailPanel` |
| Modules | Module pages with own lists |

Timeline, files, update form live in `TaskDetailContent` — parallel to focus tabs.

---

## Case Context Strip position

| Property | Value |
|----------|-------|
| Parent | `FocusTaskWorkspace.tsx` |
| Placement | Below compact header, above checklist (per OCMS layout ADR) |
| Data | `useCaseReadModel(task, operationalBundle)` |
| Default | **Not rendered** — `VITE_OCMS_CASE_STRIP_ENABLED` unset/false |

---

## Right panel structure (focus runtime)

| Tab / section | Data source | Case-centric? |
|---------------|-------------|---------------|
| Checklist | `/api/work-inbox/tasks/:id/checklist` | Task-scoped |
| Attachments | `.../attachments` | Task-scoped |
| Timeline | Operational bundle / append API | Task-scoped |
| Handoff | Timeline + assign dialog | Task-scoped |
| Notes / appointment / document | `wiOp` writes | Task-scoped |

---

## Operator flow map

```text
Login → Home/Dashboard → Work Inbox (/inbox)
  → Pick group → Pick task (Focus opens)
       → [Optional] See Case Context Strip
       → Complete checklist items
       → Add attachment / note
       → Handoff (assign) / Complete task
  → Deep link to HO_SO / Finance (module routes) via strip links when anchored
```

**Mental model today:** "I am working on **this task**."  
**Target mental model:** "I am working on **this case**; tasks are items under it."

---

## Feature flag map

| Flag | Effect on UI |
|------|----------------|
| `VITE_CBV_WORK_INBOX_GROUPS_V3` | Group panel layout |
| `VITE_CBV_WORK_INBOX_FOCUS_RUNTIME` | Focus workspace vs legacy detail |
| `VITE_OCMS_CASE_STRIP_ENABLED` | Case strip visibility |
| `VITE_CBV_TASK_RUNTIME_MODE` | Real sheet vs mock data |

---

## Checklist / document / timeline / handoff UI mapping

| Concern | Component | API prefix |
|---------|-----------|------------|
| Checklist | `WorkInboxChecklistSection` | `/api/work-inbox/tasks/:taskId/checklist` |
| Documents | `WorkInboxAttachmentsSection`, document op | `.../attachments`, `.../document` |
| Timeline | Focus tabs + `appendWorkInboxTimeline` | `.../timeline` |
| Handoff | `HandoffDialog`, `InlineHandoffStrip` | assign + timeline |

All paths require **taskId** in URL — primary refactor friction point.

---

*UI map reflects production structure; flag defaults documented in `apps/workboard/.env.example`.*
