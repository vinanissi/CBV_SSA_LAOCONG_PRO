# Checklist Drive Persistence Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_08_SHEET_DRIVE_PERSISTENCE_DECISION`  
**Status:** ACTIVE — folder bootstrap in phase 10; upload/bridge deferred to phase 11+

---

## Principle

```text
Drive stores actual files.
Sheet stores file metadata (CHECKLIST_ATTACHMENTS tab).
```

---

## Folder strategy

Adapt to existing CBV operational Drive layout when phase 10 runs. Default proposal:

```text
<CBV_OPERATIONAL_DRIVE_ROOT>/
└── OCMS_CHECKLIST_FILES/
    └── TASK_<task_id>/
        └── ITEM_<checklist_item_id>/
            ├── <attachment_id>_<sanitized_file_name>.pdf
            └── ...
```

| Segment | Rule |
|---------|------|
| `task_id` | Sanitized `TASK_ID` from TASK_MAIN (no `/` `\`) |
| `checklist_item_id` | `TASK_CHECKLIST.ID` |
| File name | Prefix with `attachment_id` to avoid collisions |

**Idempotent create:** phase 10 must use get-or-create folder per path segment; no duplicate trees on retry.

---

## Metadata mapping (Sheet ↔ Drive)

| Sheet column | Drive source |
|--------------|--------------|
| `drive_file_id` | `DriveApp` file ID after upload |
| `drive_url` | Sharing link or `https://drive.google.com/...` view URL |
| `file_name` | Original operator filename |
| `mime_type` | Drive `getMimeType()` |
| `size` | Drive `getSize()` |
| `task_id` | Parent task |
| `checklist_item_id` | Parent checklist item |
| `created_by` | Operator at upload time |
| `created_at` | Upload timestamp |

---

## Rules

| Rule | Detail |
|------|--------|
| No binary in Sheet | Never Base64 file bodies in cells |
| No default file delete | Remove = mark attachment inactive in Sheet first |
| Upload later | Phase 11 only; phase 08 does not upload |
| URL-only attachments | Allowed without Drive file until operator uploads |
| Task attachments | Existing `TASK_ATTACHMENT` remains separate; checklist files use `OCMS_CHECKLIST_FILES/` |

---

## Relationship to TASK_ATTACHMENT

| Store | Scope |
|-------|--------|
| `TASK_ATTACHMENT` | Task-level operational bundle (Work Inbox focus) |
| `CHECKLIST_ATTACHMENTS` + Drive | Checklist-item-scoped evidence |

Cross-reference allowed: checklist attachment `source=existing_document` may point to task attachment URL without copying bytes.

---

## Security

- Folder ACLs follow existing CBV Drive service account / shared drive policy (document in phase 10 handoff).
- Operators access files via Work Inbox auth + link permissions — no public anonymous upload endpoints in bridge v1.
