# Checklist History Authority

**Phase:** `PHASE_CHECKLIST_05_HISTORY`  
**Owner:** Work Inbox / Smart Checklist runtime

---

## Authority

| Concern | Authority |
|---------|-----------|
| History entry shape | `checklistHistoryTypes.ts` + this contract |
| Persistence | `checklistHistoryLocalStore.ts` (browser localStorage) |
| Append API | `useChecklistHistoryRuntime.ts` → `recordEvent`, `addManualNote` |
| Enrichment | `enrichSmartChecklistWithHistory.ts` |
| UI | `ChecklistHistoryPanel.tsx`, inline chip in `ChecklistInlineActionRow.tsx` |
| Event capture | `WorkInboxChecklistSection.tsx` wrappers (feedback, attachment, link, toggle) |
| Diagnostics | `checklistHistoryChecks.ts` |

---

## Boundaries

- **Task** remains execution root; history does not mutate TASK_MAIN.
- **Case** read model may load history map for projection counts only; no case timeline persistence.
- History ≠ workflow, ≠ global audit log, ≠ agent memory.

---

## Verification

```bash
cd apps/workboard
npx tsx -e "import { runChecklistHistoryRuntimeChecks } from './src/modules/task/inbox/checklist/checklistHistoryChecks.ts'; console.log(runChecklistHistoryRuntimeChecks());"
```
