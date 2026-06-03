# Checklist Drive Folder Bootstrap Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_10_DRIVE_FOLDER_BOOTSTRAP`  
**Status:** ACTIVE (folder bootstrap; upload/bridge deferred)

---

## Purpose

Idempotent Google Drive folder structure for checklist **file bytes** per `ADR_CHECKLIST_SHEET_DRIVE_PERSISTENCE.md`. Sheet tab `CHECKLIST_ATTACHMENTS` holds metadata only (phase 11+).

---

## Folder tree

```text
<operational_parent>/
└── OCMS_CHECKLIST_FILES/          ← checklist root (logical: OCMS_CHECKLIST_FILES_ROOT)
    └── TASK_<task_id>/
        └── ITEM_<checklist_item_id>/
            └── (files uploaded in phase 11+)
```

| Segment | Rule |
|---------|------|
| Root name | `OCMS_CHECKLIST_FILES` (fixed) |
| Task folder | `TASK_` + sanitized `task_id` |
| Item folder | `ITEM_` + sanitized `checklist_item_id` |
| Sanitize | Replace `/\?%*:|"<>` and whitespace; max 180 chars per segment |

---

## Root resolution (priority)

1. **configured_root** — Script property `CBV_CHECKLIST_DRIVE_ROOT_FOLDER_ID` points at existing root folder.
2. **existing_root** — Child folder `OCMS_CHECKLIST_FILES` found under parent (no create).
3. **created_root** — `OCMS_CHECKLIST_FILES` created under parent (bootstrap only).
4. **missing_config** — No root id and no resolvable parent → report warning; do not create task/item folders.

**Parent resolution:** `options.parentFolderId` → `CBV_OPERATIONAL_DRIVE_ROOT_FOLDER_ID` → `HomeAlert_getSystemBrainDriveFolderId_()` / `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID`.

Do not create a competing root; reuse configured root when set.

---

## Data contracts (report objects)

### ChecklistDriveRoot

```text
rootFolderId?: string | null
rootFolderName: "OCMS_CHECKLIST_FILES"
source: "existing_root" | "created_root" | "configured_root" | "missing_config" | string
createdAt?: string | null
driveUrl?: string | null
```

### ChecklistTaskFolder

```text
taskId: string
folderName: "TASK_<task_id>"
folderId?: string | null
parentFolderId?: string | null
driveUrl?: string | null
createdAt?: string | null
```

### ChecklistItemFolder

```text
taskId: string
checklistItemId: string
folderName: "ITEM_<checklist_item_id>"
folderId?: string | null
parentFolderId?: string | null
driveUrl?: string | null
createdAt?: string | null
```

---

## Bootstrap API

| Function | Behavior |
|----------|----------|
| `bootstrapChecklistDriveFolders(options)` | Idempotent get-or-create root / task / item folders |
| `validateChecklistDriveFolders(options)` | Read-only inspection + naming validation |

**Options:** `dryRun`, `taskId`, `checklistItemId`, `parentFolderId`, `persistRootId` (writes `CBV_CHECKLIST_DRIVE_ROOT_FOLDER_ID` when true and root created).

---

## Non-destructive rules

```text
MUST NOT: deleteFolder, removeFile, move file, setSharing, createFile/upload, Spreadsheet writes
MAY: createFolder when missing, find by name under parent
MUST: skip task/item creation when taskId or checklistItemId missing
```

---

## Operator runbook

1. Set `CBV_OPERATIONAL_DRIVE_ROOT_FOLDER_ID` (or `CBV_CHECKLIST_DRIVE_ROOT_FOLDER_ID` if root already exists).
2. `CBV_TCS_CHECKLIST_10_bootstrapDriveFoldersDryRun()`
3. `CBV_TCS_CHECKLIST_10_bootstrapDriveRoot()`
4. Per task/item: `CBV_TCS_CHECKLIST_10_bootstrapDriveTaskItem(taskId, itemId)`
5. `CBV_TCS_CHECKLIST_10_validateDriveFolders(taskId, itemId)`

---

## Related

- `CHECKLIST_DRIVE_PERSISTENCE_CONTRACT.md` (metadata mapping)
- `52_CHECKLIST_DRIVE_FOLDER_BOOTSTRAP.js`
- `checklistDriveFolderManifest.ts`
