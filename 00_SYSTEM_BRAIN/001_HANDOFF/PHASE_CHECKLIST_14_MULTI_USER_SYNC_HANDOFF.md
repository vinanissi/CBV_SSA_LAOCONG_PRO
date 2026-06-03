# Handoff — CHECKLIST_14 Multi-User Sync

| **Next** | `PHASE_CHECKLIST_15_OPERATOR_UAT` |

---

## Pilot steps

1. Deploy GAS + Worker (phases 09–13 + 14).
2. Enable bridge flag on two operator sessions.
3. Session A: edit checklist item title on Sheet or via UI.
4. Session B: attempt title edit without refresh → blocked with stale/conflict message.
5. Session B: click **Đồng bộ** → sees Session A changes.

```bash
npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistMultiUserSyncChecks.ts
```

GAS: `CBV_TCS_CHECKLIST_14_validateSync()`

---

## Rollback

Disable bridge flag; sync bar shows off; local runtime unchanged.
