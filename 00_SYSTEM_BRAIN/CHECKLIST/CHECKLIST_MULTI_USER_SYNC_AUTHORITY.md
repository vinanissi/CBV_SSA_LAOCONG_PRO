# Checklist Multi-User Sync Authority

**Phase:** `PHASE_CHECKLIST_14_MULTI_USER_SYNC`

---

## Authority

| Store | Role |
|-------|------|
| Google Sheet | Source of truth after manual refresh |
| Local runtime | Cache / draft; never auto-cleared |
| Sync metadata | `localStorage` per task (`cbv-checklist-sync:v1:`) |

---

## Operator control

- **Manual refresh only** — no background daemon.
- Sync status always visible when bridge on.
- Conflict warning before overwrite.

---

## Not authorized

- Silent remote overwrite
- Auto-delete local or Sheet rows
- Realtime collaboration
- Background polling

---

## Next

`PHASE_CHECKLIST_15_OPERATOR_UAT`
