# Handoff — DOSSIER_01 Right Panel Aggregate View

| **Next** | `PHASE_DOSSIER_02_REMOVE_RECENT_DOCUMENTS_FROM_CENTER` |

---

## Pilot

1. Focus mode on task with checklist + documents.
2. Right panel → **Hồ sơ** → verify groups and counts.
3. Confirm center still shows **Tài liệu gần đây**.

```bash
npx tsx 00_SYSTEM_BRAIN/DOSSIER/dossierAggregateChecks.ts
```

---

## Rollback

Restore `documents` tab in `RightContextTabs.tsx` if operators need panel mutate UI.
