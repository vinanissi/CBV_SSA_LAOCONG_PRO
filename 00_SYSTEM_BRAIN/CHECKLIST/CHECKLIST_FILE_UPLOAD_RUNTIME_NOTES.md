# Checklist File Upload — Runtime Notes

**Phase:** `PHASE_CHECKLIST_13_FILE_UPLOAD_RUNTIME`

---

## Code

| Artifact | Path |
|----------|------|
| GAS upload | `55_ChecklistFileUpload.js` |
| Bridge dispatch | `uploadChecklistFile` in `53_ChecklistSheetDriveBridge.js` |
| FE runtime | `checklistFileUploadRuntime.ts` |
| UI | `ChecklistAttachmentPanel` → **+ Tải tệp lên** |

---

## Enable

```javascript
localStorage.setItem('cbv-checklist-sheet-bridge:v1', 'true')
```

Deploy GAS + Worker; configure Drive root (phase 10).

---

## Test console

`CBV_TCS_CHECKLIST_13_validateUpload()` in Apps Script.

---

## Pilot

1. Open checklist item → 📎 Tài liệu → expand
2. Click **+ Tải tệp lên**
3. Select PDF/image ≤10MB
4. Confirm Drive file + Sheet row + history
