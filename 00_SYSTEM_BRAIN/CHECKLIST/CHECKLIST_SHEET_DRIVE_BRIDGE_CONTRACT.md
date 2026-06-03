# Checklist Sheet/Drive Bridge Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_11_SHEET_DRIVE_BRIDGE_IMPLEMENTATION`  
**Status:** ACTIVE (feature flag default off)

---

## Purpose

Operational persistence adapter between Checklist Runtime and Google Sheet metadata + Google Drive folder references per `ADR_CHECKLIST_SHEET_DRIVE_PERSISTENCE.md`.

---

## Bridge API (`clBridgeDispatch_` / Worker `POST .../checklist-bridge`)

| Method | Sheet / Drive | Behavior |
|--------|---------------|----------|
| `readChecklistItems` | `TASK_CHECKLIST` | Delegates `wiOpListChecklist_` |
| `upsertChecklistItem` | `TASK_CHECKLIST` | Create/update via `wiOpCreate/UpdateChecklistItem_` + history |
| `readFeedback` | `CHECKLIST_FEEDBACK` | Filter by `taskId` / `checklistItemId` |
| `appendFeedback` | `CHECKLIST_FEEDBACK` | Append-only row |
| `readAttachmentMetadata` | `CHECKLIST_ATTACHMENTS` | Read metadata rows |
| `appendAttachmentMetadata` | `CHECKLIST_ATTACHMENTS` | Upsert by `ATTACHMENT_ID` |
| `readLinks` | `CHECKLIST_LINKS` | Read rows |
| `appendLink` | `CHECKLIST_LINKS` | Upsert by `LINK_ID` |
| `readHistory` | `CHECKLIST_HISTORY` | Read append-only log |
| `appendHistory` | `CHECKLIST_HISTORY` | Append-only row |
| `readTemplates` | `CHECKLIST_TEMPLATES` + items | Read active templates |
| `applyTemplate` | `TASK_CHECKLIST` | Append items only via create |
| `ensureChecklistItemDriveFolder` | Drive | `bootstrapChecklistDriveFolders` |

---

## BridgeResult

```text
ok: boolean
status: GO | GO_WITH_WARNINGS | FAIL
traceId: string
message?: string
data?: unknown
warnings?: string[]
errors?: string[]
```

---

## Non-destructive rules

```text
MUST NOT: delete Sheet rows, clear tabs, delete/move Drive files, createFile upload, setSharing
MUST: append-only for CHECKLIST_FEEDBACK and CHECKLIST_HISTORY
MAY: upsert attachment/link metadata by stable id
MAY: patch TASK_CHECKLIST item fields via existing wiOp handlers
```

---

## Bridge history events (CHECKLIST_HISTORY)

```text
checklist_item_upserted
feedback_persisted
attachment_metadata_persisted
link_persisted
template_applied
drive_folder_ensured
```

---

## Feature flag (Workboard)

```text
VITE_CHECKLIST_SHEET_BRIDGE_ENABLED=true
localStorage cbv-checklist-sheet-bridge:v1=true
```

Default: **off** — localStorage satellite runtimes remain until operator enables bridge.

---

## GAS actions

```text
wiOpClBridge — dispatch by payload.method
wiOpClBridgeValidate — validateChecklistSheetDriveBridge()
```

---

## Related

- `53_CHECKLIST_SHEET_DRIVE_BRIDGE.js`
- `workers/api` route `/api/work-inbox/tasks/:taskId/checklist-bridge`
- `checklistBridgeApi.ts`, `checklistBridgeSatelliteLoaders.ts`
