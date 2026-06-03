# Handoff — CHECKLIST_12 Local Runtime Migration

| **Next** | `PHASE_CHECKLIST_13_FILE_UPLOAD_RUNTIME` |

---

## Pilot steps

1. Deploy GAS + Worker (phases 09–11).
2. On a pilot task with local data: open checklist → migration panel.
3. Export JSON → Dry-run → review → Commit (checkbox).
4. Enable bridge flag → reload → confirm data from Sheet.

```bash
npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistLocalRuntimeMigrationChecks.ts
```

GAS: `CBV_TCS_CHECKLIST_12_validateMigration()`

---

## Rollback

Disable bridge flag; local data still in browser until manually cleared.
