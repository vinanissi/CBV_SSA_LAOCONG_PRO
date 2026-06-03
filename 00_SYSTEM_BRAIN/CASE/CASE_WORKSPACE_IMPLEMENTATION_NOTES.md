# Case Workspace — Implementation Notes

**Phase:** `PHASE_CASE_REFACTOR_03_CASE_WORKSPACE`  
**Date:** 2026-06-01

---

## Before: Task Detail / Focus structure

```text
FocusHeader
CompactTaskHeader (task title, status, assignee, due)
[optional] WorkInboxCaseContextStrip (VITE_OCMS_CASE_STRIP_ENABLED)
FocusContentCards
  ├── AI Tóm tắt
  ├── WorkInboxChecklistSection (task-scoped)
  └── WorkInboxAttachmentsSection
FocusActionBar
NextTaskCard
RightContextTabs (portal) — Detail / Timeline / Handoff / Documents
```

Mental model: **task-first**.

---

## After: Case Workspace (flag ON)

```text
FocusHeader (unchanged — inbox navigation)
CaseWorkspace
  ├── Case Header (title, type, workflow state, responsible, displayKey)
  ├── Case Context (WorkInboxCaseContextStrip from read model)
  ├── AI Summary (case-labeled)
  ├── Grid
  │   ├── Checklist (Case) — WorkInboxChecklistSection
  │   ├── Tasks under Case — read model task refs + focus highlight
  │   ├── Documents — read model list + WorkInboxAttachmentsSection
  │   ├── Timeline preview — read model + hint → right panel
  │   └── Handoff — read model + hint → right panel
FocusActionBar (unchanged)
NextTaskCard (unchanged)
RightContextTabs (unchanged)
```

Mental model: **case-first**; current task = execution item.

---

## Components changed

| File | Change |
|------|--------|
| `ocms/CaseWorkspace.tsx` | **NEW** — workspace regions |
| `ocms/ocmsFeature.ts` | `isCaseWorkspaceEnabled`, `isCaseReadModelDerivationEnabled` |
| `ocms/useCaseReadModel.ts` | Derivation when workspace OR strip flag |
| `focusRuntime/FocusTaskWorkspace.tsx` | Branch: CaseWorkspace vs legacy |
| `styles/index.css` | `.case-workspace*` styles |
| `vite-env.d.ts`, `.env.example` | `VITE_CASE_WORKSPACE_ENABLED` |

---

## Case Read Model usage

```text
useWorkInboxChecklistRuntime → checklistItems
useCaseReadModel → runtimeReadModel + stripView + ocmsCore
CaseWorkspace ← runtimeReadModel props
```

No backend Case fetch. Mutations via existing task/checklist/attachment APIs.

---

## Feature flags

| Flag | Effect |
|------|--------|
| `VITE_CASE_WORKSPACE_ENABLED=true` | Case Workspace layout |
| `VITE_OCMS_CASE_STRIP_ENABLED=true` (workspace OFF) | Legacy + strip only |
| Both OFF | Legacy Focus (pre-OCMS strip path) |

Workspace ON supersedes standalone strip placement (strip embedded in workspace context).

---

## Rollback

Set `VITE_CASE_WORKSPACE_ENABLED` unset/false → **exact legacy** CompactTaskHeader + FocusContentCards path. No placeholder gap.

---

## Known limitations

1. Multi-task per Case not grouped — diagnostic + single task list.  
2. Timeline/handoff full UX still in right panel tabs.  
3. AI summary still task-derived text when no case summary field.  
4. Checklist physically `TASK_CHECKLIST` — labeled as Case checklist.

---

*Read-model driven; no CASE_MAIN.*
