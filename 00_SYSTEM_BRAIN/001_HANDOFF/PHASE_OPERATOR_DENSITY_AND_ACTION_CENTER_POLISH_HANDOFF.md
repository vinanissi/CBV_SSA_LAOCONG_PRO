# PHASE_OPERATOR_DENSITY_AND_ACTION_CENTER_POLISH — Handoff

**Result:** GO_WITH_WARNINGS

## What changed

1. **Checklist** — `SmartChecklistItemRow` + `WorkInboxChecklistSection`: operator density mode, focus bar complete step.
2. **Right panel** — `OperatorDetailPanel`: business-first section order.
3. **Footer** — `RuntimeStatusBar` + `QUICK_BAR_PRIMARY_IDS` / `QUICK_BAR_MORE_IDS`.
4. **Sidebar** — `OperatorMainSidebar`: collapsible system section.
5. **Authority** — `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md`, `CHECKLIST_RIGHT_PANEL_LAYOUT_AUTHORITY.md`.

## Verify locally

```text
cd apps/workboard
npx tsx -e "import { runOperatorDensityAndActionCenterPolishChecks } from './src/modules/task/inbox/focusRuntime/operatorDensityAndActionCenterPolishChecks.ts'; console.log(runOperatorDensityAndActionCenterPolishChecks());"
```

Open focus task → confirm compact rows, focus reveals chips, right panel order, footer **Thêm** menu.

## Do not regress

- Sync status stays in footer only.
- Checkbox-only completion on row; focus bar complete uses same `toggleItem`.
- Unsupported **Đổi hạn** must stay disabled.

## Next

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` when operator requests full browser evidence.
