# Checklist Multi-User Sync — Runtime Notes

**Phase:** `PHASE_CHECKLIST_14_MULTI_USER_SYNC`

---

## Code

| Artifact | Path |
|----------|------|
| Sync runtime | `checklistMultiUserSyncRuntime.ts` |
| Remote snapshot | `checklistRemoteSnapshot.ts` |
| Hook | `useChecklistMultiUserSyncRuntime.ts` |
| UI | `ChecklistSyncStatusBar.tsx` |
| GAS validate | `56_ChecklistMultiUserSync.js` |

---

## Enable

```javascript
localStorage.setItem('cbv-checklist-sheet-bridge:v1', 'true')
```

---

## Pilot

1. Operator A edits checklist on Sheet (or another browser).
2. Operator B opens same task → sees **Cần làm mới** or conflict on write attempt.
3. Operator B clicks **Đồng bộ** → data reloads from Sheet.
4. Attempt overwrite before refresh → blocked with Vietnamese warning.

```bash
npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistMultiUserSyncChecks.ts
```

GAS: `CBV_TCS_CHECKLIST_14_validateSync()`
