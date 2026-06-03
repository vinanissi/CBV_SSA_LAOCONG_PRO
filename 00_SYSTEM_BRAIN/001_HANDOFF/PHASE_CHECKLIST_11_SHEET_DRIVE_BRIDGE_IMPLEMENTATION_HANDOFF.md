# Handoff — CHECKLIST_11 Sheet/Drive Bridge

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_11_SHEET_DRIVE_BRIDGE_IMPLEMENTATION` |
| **Result** | **GO_WITH_WARNINGS** |
| **Next** | `PHASE_CHECKLIST_12_LOCAL_RUNTIME_MIGRATION` |

---

## Deploy

1. `clasp push` (includes `53_CHECKLIST_SHEET_DRIVE_BRIDGE.js`)
2. Deploy Worker API
3. `CBV_TCS_CHECKLIST_11_validateBridge()` on Task DB

---

## Enable (pilot)

```text
localStorage.setItem('cbv-checklist-sheet-bridge:v1', 'true')
```

Or `VITE_CHECKLIST_SHEET_BRIDGE_ENABLED=true` at build time.

---

## Verify

```bash
npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistSheetDriveBridgeChecks.ts
cd apps/workboard && npm run build
```

---

## API

```http
POST /api/work-inbox/tasks/{taskId}/checklist-bridge
{ "method": "readFeedback", "taskId": "..." }
```
