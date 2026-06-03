# Dossier Cross-Focus Navigation Contract

**Phase:** `PHASE_DOSSIER_04_CROSS_FOCUS_NAVIGATION`  
**Status:** ACTIVE

---

## Models

### DossierFocusRequest

```text
DossierFocusRequest {
  id: string
  taskId: string
  checklistItemId?: string | null
  dossierItemId?: string | null
  dossierItemType?: attachment | link | feedback
  source: dossier_attachment | dossier_link | dossier_feedback | dossier_group | step_deep_link
  behavior: { scroll, highlight, expand }
  createdAt?: string | null
}
```

### DossierFocusResult

```text
DossierFocusResult {
  ok: boolean
  status: GO | GO_WITH_WARNINGS | FAIL
  taskId: string
  checklistItemId?: string | null
  dossierItemId?: string | null
  focused, scrolled, highlighted, expanded: boolean
  message?: string | null
  warnings: string[]
  errors: string[]
}
```

---

## Operations (UI-only)

| Operation | Description |
|-----------|-------------|
| focus_checklist_item | Publish focus request via bus |
| scroll_to_checklist_item | `scrollIntoView` on `#cbv-checklist-item-{id}` |
| highlight_checklist_item | Temporary CSS highlight (~2.6s) |
| expand_checklist_item | Layout expand via `setItemExpanded` |
| clear_focus_highlight | Auto-clear after timeout |

---

## Rules

- Task-level evidence: no checklist focus; show message.
- Stale `checklistItemId`: warn, do not scroll.
- No Sheet/Drive writes for focus actions.

---

## Next

`PHASE_DOSSIER_05_DOSSIER_ACTIONS`
