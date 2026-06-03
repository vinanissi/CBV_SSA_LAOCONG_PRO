# PHASE_OPERATOR_DESIGN_BASELINE_V1 — Handoff

**Result:** GO_WITH_WARNINGS

## Verify

```powershell
cd apps/workboard
npx tsx -e "import { runOperatorDesignBaselineV1Checks } from './src/modules/task/inbox/focusRuntime/operatorDesignBaselineV1Checks.ts'; console.log(runOperatorDesignBaselineV1Checks());"
```

Open focus task → confirm larger task title, checklist titles, right panel text; collapsed rows show 💬/📎/🔗/🕒 counts; focused row shows full chips.

## Key files

- `apps/workboard/src/styles/operator-design-baseline-v1.css`
- `apps/workboard/src/runtime/themeRuntime.ts`
- `apps/workboard/src/modules/task/inbox/checklist/SmartChecklistItemRow.tsx`
- `00_SYSTEM_BRAIN/OPERATOR/OPERATOR_DESIGN_BASELINE_AUTHORITY.md`

## Do not regress

- Footer-only sync/runtime.
- Technical IDs in collapsed block only.
- Density mode chip hiding rules.
