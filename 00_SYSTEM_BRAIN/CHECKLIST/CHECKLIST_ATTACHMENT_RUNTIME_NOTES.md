# Checklist Attachment Runtime Notes

**Phase:** `PHASE_CHECKLIST_03_ATTACHMENTS`

---

## Data flow

```text
Operator → + Thêm tài liệu
  → useChecklistAttachmentRuntime.registerAttachment
  → checklistAttachmentLocalStore
  → enrichSmartChecklistListRuntime (with feedback map)
  → SmartChecklistItemRow + ChecklistAttachmentPanel
```

Task attachments loaded once per section via `api.listWorkInboxAttachments` for **existing_document** quick-pick.

---

## Empty states

| State | UI |
|-------|-----|
| 0 attachments, collapsed | `📎 0 tài liệu` |
| 0 expanded | "Chưa có tài liệu đính kèm." |
| No URL | Plain text name (no `<a>`) |

---

## Cleanup

Deleting checklist item clears feedback **and** attachments for that item id.

---

## Limitations

- Per-browser localStorage only
- File input does not upload bytes
- No edit attachment metadata after register (remove + re-add)

---

## Follow-up

1. Durable attachment API (optional ADR)  
2. `PHASE_CHECKLIST_04_LINKS`
