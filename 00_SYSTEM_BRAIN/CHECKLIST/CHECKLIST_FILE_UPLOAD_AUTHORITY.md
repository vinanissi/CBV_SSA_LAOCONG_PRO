# Checklist File Upload Authority

**Phase:** `PHASE_CHECKLIST_13_FILE_UPLOAD_RUNTIME`

---

## Authority

| Store | Role |
|-------|------|
| Drive | File bytes in `OCMS_CHECKLIST_FILES/TASK_*/ITEM_*` |
| Sheet `CHECKLIST_ATTACHMENTS` | Metadata after successful Drive upload |
| History | Append-only upload events |

---

## Operator control

Upload is **manual only** — button on attachment panel. No background queue.

---

## Not authorized

- File delete/overwrite
- Public links
- Auto-upload on page load
- OCR / virus scan (deferred)

---

## Next

`PHASE_CHECKLIST_14_MULTI_USER_SYNC`
