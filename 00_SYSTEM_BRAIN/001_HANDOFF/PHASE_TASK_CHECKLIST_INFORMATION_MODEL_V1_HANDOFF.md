# PHASE_TASK_CHECKLIST_INFORMATION_MODEL_V1 — Handoff

**Result:** GO_WITH_WARNINGS

## Verify

```powershell
cd apps/workboard
npx tsx -e "import { runTaskChecklistInformationModelV1Checks } from './src/modules/task/inbox/focusRuntime/taskChecklistInformationModelV1Checks.ts'; console.log(runTaskChecklistInformationModelV1Checks());"
```

## Extend schema

Edit `taskChecklistInformationModelSchemas.ts` + `resolveTaskChecklistFieldValues.ts` — do not hardcode labels in components.

## Do not

- Use task title as AI summary fallback.
- Add CASE fields to TASK_DETAIL_SCHEMA without ADR.
