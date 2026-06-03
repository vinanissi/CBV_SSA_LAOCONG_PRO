# Checklist Drive Folder Bootstrap Authority

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_10_DRIVE_FOLDER_BOOTSTRAP`

---

## Authority split

| Concern | Authority |
|---------|-----------|
| File bytes | Google Drive under `OCMS_CHECKLIST_FILES/` |
| File metadata | Google Sheet `CHECKLIST_ATTACHMENTS` (phase 11 bridge) |
| Folder creation | GAS `bootstrapChecklistDriveFolders` only in phase 10 |
| Workboard FE | **No** Drive folder creation in phase 10 |

---

## Who may create folders

| Actor | Permission |
|-------|------------|
| `bootstrapChecklistDriveFolders` | Create missing root/task/item folders |
| Operators (manual) | Run test console after reviewing dry-run |
| Upload / bridge (phase 11) | May call bootstrap before `createFile` — must not delete folders |

---

## Configuration authority

| Script property | Role |
|-----------------|------|
| `CBV_CHECKLIST_DRIVE_ROOT_FOLDER_ID` | Canonical checklist files root |
| `CBV_OPERATIONAL_DRIVE_ROOT_FOLDER_ID` | Parent for first-time `OCMS_CHECKLIST_FILES` create |
| `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID` | Fallback parent (existing CBV archive folder) |

Setting root id after bootstrap (`persistRootId: true`) is operator-opt-in only.

---

## TASK_ATTACHMENT boundary

Task-level attachments remain under `CBV_STORAGE/02_TASK_ATTACHMENTS/` policy. Checklist item files use `OCMS_CHECKLIST_FILES/` only — no automatic merge.

---

## Diagnostics

```bash
npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistDriveFolderBootstrapChecks.ts
```

Live: `CBV_TCS_CHECKLIST_10_validateDriveFolders` in GAS.

---

## Next phase

`PHASE_CHECKLIST_11_SHEET_DRIVE_BRIDGE_IMPLEMENTATION` — metadata writes + upload path; not in phase 10.
