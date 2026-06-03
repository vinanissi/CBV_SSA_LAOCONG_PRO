# Checklist Drive Folder Bootstrap — Runtime Notes

**Phase:** `PHASE_CHECKLIST_10_DRIVE_FOLDER_BOOTSTRAP`

---

## Code locations

| Artifact | Path |
|----------|------|
| GAS bootstrap (clasp) | `05_GAS_RUNTIME/52_CHECKLIST_DRIVE_FOLDER_BOOTSTRAP.js` |
| Task DB mirror | `gas-runtime-api/52_ChecklistDriveFolderBootstrap.js` |
| Test console | `gas-runtime-api/86_ChecklistDriveFolderTestConsole.js` |
| Config | `00_CORE_CONFIG.js` → `CBV_CONFIG.CHECKLIST_DRIVE` |
| TS naming mirror | `checklistDriveFolderManifest.ts` |
| Static checks | `checklistDriveFolderBootstrapChecks.ts` |

**Clasp:** `52_CHECKLIST_DRIVE_FOLDER_BOOTSTRAP.js` after `51_CHECKLIST_SHEET_SCHEMA_BOOTSTRAP.js`.

**Dependency:** `HomeAlert_getSystemBrainDriveFolderId_` optional (loads if `80_HOME_ALERT_RUNTIME.js` present in project).

---

## Naming helpers (GAS + TS)

- `sanitizeChecklistDriveSegment(value, label)`
- `buildChecklistTaskFolderName(taskId)` → `TASK_*`
- `buildChecklistItemFolderName(checklistItemId)` → `ITEM_*`

---

## FE impact

**None.** Attachment UI still uses localStorage metadata; no Drive API from browser in this phase.

---

## Production checklist

1. Configure parent or root script property.
2. Dry run → bootstrap root → validate.
3. Bootstrap task/item folders on first upload prep (phase 11) or manual pilot tasks.
4. Do not enable public sharing on created folders.

---

## Known warnings

- CI cannot call `DriveApp`; live proof is manual.
- Multiple folders with same name under parent: bootstrap uses first `getFoldersByName` match — avoid duplicate manual folders.
