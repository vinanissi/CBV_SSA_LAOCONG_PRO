# Checklist Sheet/Drive Mapping Notes

**Phase:** `PHASE_CHECKLIST_08_SHEET_DRIVE_PERSISTENCE_DECISION`

---

## LocalStorage keys (pre-bridge)

```text
cbv-checklist-feedback:v1:{taskId}
cbv-checklist-attachment:v1:{taskId}
cbv-checklist-link:v1:{taskId}
cbv-checklist-history:v1:{taskId}
cbv-checklist-crud-overlay:v1:{taskId}
cbv-checklist-layout:v1:{taskId}
```

---

## FE runtime → Sheet tab

| FE module / key | Target tab | Operation |
|-----------------|------------|-----------|
| `useWorkInboxChecklistRuntime` | `TASK_CHECKLIST` | list/create/update/toggle/soft-delete |
| `checklistFeedbackLocalStore` | `CHECKLIST_FEEDBACK` | append rows |
| `checklistAttachmentLocalStore` | `CHECKLIST_ATTACHMENTS` + Drive | insert metadata; upload file phase 11 |
| `checklistLinkLocalStore` | `CHECKLIST_LINKS` | CRUD rows |
| `checklistHistoryLocalStore` | `CHECKLIST_HISTORY` | append only |
| `checklistCrudOverlayLocalStore` (`note`, `isArchived`) | `TASK_CHECKLIST` + columns | merge into item row |
| `checklistLayoutLocalStore` | `CHECKLIST_LAYOUT_STATE` | upsert by task/item |
| `checklistTemplateLibrary` | `CHECKLIST_TEMPLATES` + `CHECKLIST_TEMPLATE_ITEMS` | seed then Sheet CRUD (admin later) |

---

## Type mapping (representative)

| FE type | Sheet row |
|---------|-----------|
| `ChecklistFeedback.id` | `feedback_id` |
| `ChecklistAttachment.id` | `attachment_id` |
| `ChecklistAttachment.url` | `drive_url` or external URL column |
| `ChecklistLink.id` | `link_id` |
| `ChecklistHistoryEntry` | `CHECKLIST_HISTORY` row |
| `WorkInboxChecklistItem.checklistId` | `ID` |

---

## ID strategy

| Entity | Format (proposed) |
|--------|-------------------|
| Checklist item | `TCL_*` (existing `taskDbMakeId_`) |
| Feedback | `TCF_*` |
| Attachment | `TCA_*` |
| Link | `TCLNK_*` |
| History | `TCH_*` |
| Template | `TPL_*` |
| Template item | `TPLI_*` |
| Layout state | `TCLS_*` |

Migration: **keep** existing localStorage IDs when possible to avoid breaking in-session references; on import generate new IDs only when collision with Sheet.

---

## Read model enrichment (unchanged contract)

Smart Checklist enrichment order remains:

1. Feedback → 2. Attachments → 3. Links → 4. History → 5. Inline actions → 6. CRUD/layout overlay

Bridge replaces **loaders** only; enrichers stay the same.

---

## Case projection

`caseReadModelProjection.ts` today reads localStorage for satellite data. Phase 11: optional Sheet snapshot endpoint or client-side batch read — **Case stays projection-only**; no Case write API.
