# Checklist Template Authority

**Phase:** `PHASE_CHECKLIST_07_TEMPLATE_RUNTIME`

| Concern | Authority |
|---------|-----------|
| Types | `checklistTemplateTypes.ts` |
| Library | `checklistTemplateLibrary.ts` |
| Apply | `checklistTemplateApply.ts` |
| Hook | `useChecklistTemplateRuntime.ts` |
| UI | `ChecklistTemplatePanel.tsx`, toolbar in `ChecklistListToolbar.tsx` |
| Orchestration | `WorkInboxChecklistSection.tsx` |
| Diagnostics | `checklistTemplateChecks.ts` |

---

## Verify

```bash
cd apps/workboard
npx tsx -e "import { runChecklistTemplateRuntimeChecks } from './src/modules/task/inbox/checklist/checklistTemplateChecks.ts'; console.log(runChecklistTemplateRuntimeChecks());"
```
