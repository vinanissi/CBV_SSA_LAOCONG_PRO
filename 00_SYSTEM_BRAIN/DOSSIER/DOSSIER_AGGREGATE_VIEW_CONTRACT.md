# Dossier Aggregate View Contract

**Phase:** `PHASE_DOSSIER_01_RIGHT_PANEL_AGGREGATE_VIEW`  
**Status:** ACTIVE

---

## Role

Read-only aggregate of task + checklist evidence in the right panel **Hồ sơ** tab.

---

## Model

```text
DossierAggregate {
  taskId
  counts { taskAttachments, checklistAttachments, checklistLinks, checklistFeedback, totalDossierItems }
  groups: DossierGroup[]
}
```

---

## Sources (read-only)

| Source | Maps to |
|--------|---------|
| Task attachments API | `task_level` group |
| Checklist attachments | per-item group |
| Checklist links | per-item group |
| Checklist feedback (latest 3/item) | per-item group |
| Sheet bridge | when flag on; local fallback |

---

## API

| Function | Role |
|----------|------|
| `buildDossierAggregate` | Pure aggregation |
| `useDossierAggregateRuntime` | Load + build |
| `validateDossierAggregateRuntime` | Diagnostics |

---

## Out of scope (this phase)

Writes, upload, filter, navigation, center-panel removal.

---

## Next

`PHASE_DOSSIER_02_REMOVE_RECENT_DOCUMENTS_FROM_CENTER`
