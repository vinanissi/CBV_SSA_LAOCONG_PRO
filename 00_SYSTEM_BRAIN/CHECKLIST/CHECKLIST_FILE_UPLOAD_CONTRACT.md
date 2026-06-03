# Checklist File Upload Contract

**Phase:** `PHASE_CHECKLIST_13_FILE_UPLOAD_RUNTIME`  
**Status:** ACTIVE

---

## API

| Layer | Function |
|-------|----------|
| FE | `validateChecklistUpload`, `uploadChecklistFile` |
| Bridge | `uploadChecklistFile` via `clBridgeDispatch_` |
| GAS | `clBridgeUploadChecklistFile_`, `validateChecklistFileUploadRuntime` |

---

## Flow

1. Operator selects file on checklist item attachment panel (**+ Tải tệp lên**).
2. FE validates size/ids; reads base64.
3. Bridge ensures Drive `ITEM_*` folder.
4. GAS uploads file with unique timestamp name (no overwrite).
5. GAS writes `CHECKLIST_ATTACHMENTS` metadata.
6. GAS appends `CHECKLIST_HISTORY` (`file_uploaded`).

---

## Limits

- Max size: **10 MB**
- Requires Sheet bridge flag enabled
- No public sharing; no file delete in phase 13

---

## ChecklistUploadResult

See `checklistFileUploadTypes.ts` — includes `driveFileId`, `driveUrl`, `attachmentId`, `metadataWritten`, `historyWritten`.

---

## Collision policy

If filename exists in item folder → append numeric suffix; record warning.

---

## Rollback

Disable bridge; local metadata references remain; Drive files are not auto-deleted.
