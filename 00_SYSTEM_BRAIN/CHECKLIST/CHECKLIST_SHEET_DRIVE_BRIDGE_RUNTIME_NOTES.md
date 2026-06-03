# Checklist Sheet/Drive Bridge — Runtime Notes

**Phase:** `PHASE_CHECKLIST_11_SHEET_DRIVE_BRIDGE_IMPLEMENTATION`

---

## Code map

| Layer | Path |
|-------|------|
| GAS bridge | `gas-runtime-api/53_ChecklistSheetDriveBridge.js` (+ clasp `05_GAS_RUNTIME` copy) |
| GAS router | `gas-runtime-api/46_WorkInboxOperationalService.js` → `wiOpClBridge` |
| Test console | `gas-runtime-api/87_ChecklistSheetDriveBridgeTestConsole.js` |
| Worker | `workers/api/src/modules/workInboxChecklistBridge.ts` |
| Worker route | `POST /api/work-inbox/tasks/:taskId/checklist-bridge` |
| FE API | `checklistBridgeApi.ts`, `client.callWorkInboxChecklistBridge` |
| FE flag | `checklistBridgeConfig.ts` |
| FE hooks | `useChecklistFeedback/Attachment/Link/HistoryRuntime` (bridge when enabled) |

---

## Enable bridge (pilot)

1. Complete phase 09 sheet bootstrap + phase 10 Drive config on Task DB.
2. Deploy GAS + Worker.
3. In browser console or `.env`: enable flag (see contract).
4. `CBV_TCS_CHECKLIST_11_validateBridge()` in Apps Script.

---

## Attachment flow (phase 11)

1. Operator registers attachment metadata in UI.
2. Bridge ensures `ITEM_*` Drive folder (no file upload).
3. Row appended/upserted in `CHECKLIST_ATTACHMENTS`.
4. `CHECKLIST_HISTORY` row `attachment_metadata_persisted`.

---

## Out of scope (phase 11)

- File binary upload UI/runtime (phase 13)
- Bulk localStorage migration (phase 12)
- Background sync / conflict resolution
