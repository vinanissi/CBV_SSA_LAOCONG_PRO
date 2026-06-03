# Checklist Attachment Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_03_ATTACHMENTS`  
**Status:** ACCEPTED (reference-only runtime — no new persistence tables)

---

## Purpose

Operational **evidence/reference** attached to a checklist item. Not global document management or storage architecture.

---

## ChecklistAttachment

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Unique per attachment ref |
| `checklistItemId` | string | yes | Parent checklist item |
| `name` | string | yes | Display name (e.g. `CCCD.pdf`) |
| `url` | string \| null | no | Open link when valid `http(s)://` |
| `mimeType` | string \| null | no | Hint for display |
| `size` | number \| null | no | Bytes when known |
| `source` | `local` \| `url` \| `drive` \| `existing_document` \| string | no | Provenance |
| `createdBy` | string \| null | no | Operator label |
| `createdAt` | string \| null | no | ISO timestamp |

---

## SmartChecklistItem extension

```text
attachmentCount: number   // = attachments.length when enriched
attachments?: ChecklistAttachment[]
```

Defaults: `attachments = []`, `attachmentCount = 0`.

---

## Safe input modes (phase 03)

| Mode | Behavior |
|------|----------|
| Name + optional URL | Register reference (`source: url` or `local`) |
| File picker | Metadata only (`name`, `size`, `mimeType`) — **no upload** |
| Task attachment pick | Copy ref from existing task attachments (`existing_document`) |

---

## Runtime storage

`localStorage` key: `cbv-checklist-attachment:v1:{taskId}`

Server / Drive / schema migration: **out of scope**.

---

## Out of scope

Drive upload, R2/S3, preview engine, OCR, `CHECKLIST_ATTACHMENT_TABLE`, workflow, agents.
