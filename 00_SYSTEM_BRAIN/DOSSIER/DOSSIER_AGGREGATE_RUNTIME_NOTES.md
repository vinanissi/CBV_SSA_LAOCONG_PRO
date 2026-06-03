# Dossier Aggregate — Runtime Notes

**Phase:** `PHASE_DOSSIER_01_RIGHT_PANEL_AGGREGATE_VIEW`

---

## Code

| Artifact | Path |
|----------|------|
| Builder | `dossier/buildDossierAggregate.ts` |
| Hook | `dossier/useDossierAggregateRuntime.ts` |
| UI | `dossier/DossierAggregatePanel.tsx` |
| Tab | `RightContextTabs` → **Hồ sơ** |

---

## Pilot

1. Open Focus task with checklist items + attachments/links.
2. Right panel → **Hồ sơ**.
3. Confirm grouped items + task-level section.
4. Center **Tài liệu gần đây** still visible (phase 02 removes).

```bash
npx tsx 00_SYSTEM_BRAIN/DOSSIER/dossierAggregateChecks.ts
```

---

## Rollback

Revert `RightContextTabs` to prior tab set if needed; no data impact.
