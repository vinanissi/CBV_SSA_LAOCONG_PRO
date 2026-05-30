# 000_CURRENT_RUNTIME — As-Is Baseline

**Authority level:** AS-IS only — **not** the product target.

Describes `apps/workboard` and related runtime **as it runs today**.

## Primary documents

| File | Content |
|------|---------|
| [001_CURRENT_RUNTIME_TRUTH.md](./001_CURRENT_RUNTIME_TRUTH.md) | Routes, filters, cognition, focus queue |
| [008_ROUTING_CONTRACT_RUNTIME.md](./008_ROUTING_CONTRACT_RUNTIME.md) | `/tasks` URL contract (archived spec) |
| [010_FOCUS_MODE_RUNTIME.md](./010_FOCUS_MODE_RUNTIME.md) | `focusQueueMode` behavior (archived spec) |

## Code source of truth (behavior)

```text
apps/workboard/src/app/routes.tsx
apps/workboard/src/modules/task/TasksPage.tsx
```

When docs conflict with code → **code wins** for AS-IS.

## Related history

- `../_archive_runtime_baseline_20260529/` — full doc snapshot pass 1
- `000_REPORTS/CBV_WORK_INBOX_V3_DESIGN_CONTRACT_PACK_REPORT.md` — report narrative for AS-IS era

## Target design

See `../100_TARGET_DESIGN/` — do not implement V3 from this folder alone.
