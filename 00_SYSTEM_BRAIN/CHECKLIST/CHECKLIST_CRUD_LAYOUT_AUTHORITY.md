# Checklist CRUD & Layout Authority

**Phase:** `PHASE_CHECKLIST_06_CRUD_AND_LAYOUT_RUNTIME`

| Concern | Authority |
|---------|-----------|
| API CRUD | `useWorkInboxChecklistRuntime.ts` |
| Archive/note overlay | `useChecklistCrudOverlayRuntime.ts` + `checklistCrudOverlayLocalStore.ts` |
| Layout | `useChecklistLayoutRuntime.ts` + `checklistLayoutLocalStore.ts` |
| Enrichment | `enrichSmartChecklistWithCrudLayout.ts` |
| UI | `ChecklistListToolbar.tsx`, `ChecklistItemCrudMenu.tsx`, `SmartChecklistItemRow.tsx` |
| Orchestration | `WorkInboxChecklistSection.tsx` |
| Diagnostics | `checklistCrudLayoutChecks.ts` |

---

## Verify

```bash
cd apps/workboard
npx tsx -e "import { runChecklistCrudLayoutRuntimeChecks } from './src/modules/task/inbox/checklist/checklistCrudLayoutChecks.ts'; console.log(runChecklistCrudLayoutRuntimeChecks());"
```
