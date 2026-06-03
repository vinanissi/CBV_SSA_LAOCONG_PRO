# Checklist Sheet/Drive Bridge Authority

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_11_SHEET_DRIVE_BRIDGE_IMPLEMENTATION`

---

## Source of truth when bridge enabled

| Concern | Authority |
|---------|-----------|
| Checklist items | `TASK_CHECKLIST` (existing GAS CRUD) |
| Feedback, links, history, attachment metadata | Satellite Sheet tabs via bridge |
| File bytes | Drive (`ensureChecklistItemDriveFolder` only in phase 11) |
| UI cache when flag off | browser localStorage (legacy) |

---

## Who may write

| Actor | Permission |
|-------|------------|
| `wiOpClBridge` via Worker | Read/write per method; NOTES permission for mutations |
| Operators | Enable flag after schema bootstrap (09) + Drive bootstrap (10) |
| Automated migration (phase 12) | **Not in phase 11** |

---

## Validation

`validateChecklistSheetDriveBridge()` — combines sheet schema validate + drive folder validate + method availability.

---

## Rollback

Disable feature flag → FE reverts to localStorage loaders; Sheet rows remain (non-destructive).

---

## Next phase

`PHASE_CHECKLIST_12_LOCAL_RUNTIME_MIGRATION` — optional import from localStorage; not automatic in phase 11.
