# Dossier Actions Contract

**Phase:** `PHASE_DOSSIER_05_DOSSIER_ACTIONS`  
**Status:** ACTIVE

---

## DossierAction

```text
DossierAction {
  id, dossierItemId
  type: open_item | copy_link | open_drive_file | focus_checklist_item | view_source_context
  label, enabled, reasonDisabled?
  targetUrl?, driveFileId?, checklistItemId?
  source: dossier_attachment | dossier_link | dossier_feedback | dossier_task_attachment
}
```

## DossierActionResult

```text
DossierActionResult {
  ok, status: GO | GO_WITH_WARNINGS | FAIL
  actionId, dossierItemId, actionType
  performed, message?, warnings[], errors[]
}
```

---

## Rules

| Action | Rule |
|--------|------|
| open_item | Valid http(s) URL required |
| copy_link | Clipboard API or fallback message |
| open_drive_file | driveUrl or built from driveFileId |
| focus_checklist_item | Delegates to Phase 04 cross-focus |
| view_source_context | Read-only source label display |

No delete, move, upload, or persistence writes.

---

## Next

`PHASE_DOSSIER_06_DOSSIER_UAT_LOCK`
