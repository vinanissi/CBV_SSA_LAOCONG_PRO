# PHASE UI — CBV_WORK_INBOX_V3 FRONTEND PHASE D TASK CARD V3 REPORT

## Status

**GO**

## Summary

Phase D replaces the Phase C title-only inbox preview rows with **`WorkInboxTaskCardV3`** cards driven exclusively by **`TaskCardModel`**. Data flows through the existing adapter (`TaskItem` → `InboxItem` → `TaskCardModel`). `WorkInboxGroupsPanel` now renders up to **5 cards per group** via `WorkInboxGroupSection`. Legacy `TasksPage` / `TaskGroupedList` / filters are unchanged.

## Authority Read

- `900_AUTHORITY/000_DESIGN_AUTHORITY.md`
- `900_AUTHORITY/001_AUTHORITY_INDEX.md`
- `100_TARGET_DESIGN/014_DATA_CONTRACT.md`
- `100_TARGET_DESIGN/005_COMPONENT_LIBRARY.md`
- `100_TARGET_DESIGN/004_LAYOUT_SPEC.md`
- `100_TARGET_DESIGN/013_ACCEPTANCE_CRITERIA.md`
- `200_IMPLEMENTATION/015_FRONTEND_IMPLEMENTATION_ROADMAP.md` (Phase D)
- `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_B_DATA_ADAPTER_REPORT.md`
- `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_C_INBOX_GROUPS_REPORT.md`

## Created Files

| File | Purpose |
|------|---------|
| `apps/workboard/src/modules/task/inbox/components/WorkInboxTaskCardV3.tsx` | V3 card UI from `TaskCardModel` |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxStatusChip.tsx` | Status chip mapping (🔴/🟠/🟡/🔵/🟢/⚪) |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxGroupSection.tsx` | Group header + card list |
| `apps/workboard/src/modules/task/inbox/inboxCardModels.ts` | `mapInboxGroupBucketToCardModels` |
| `apps/workboard/src/modules/task/inbox/taskCardV3Checks.ts` | Dev sanity suite |

## Updated Files

| File | Change |
|------|--------|
| `apps/workboard/src/modules/task/inbox/WorkInboxGroupsPanel.tsx` | Card models + sections; limit 5 |
| `apps/workboard/src/styles/index.css` | V3 card / status chip styles |

## Components

| Component | Props | Notes |
|-----------|-------|-------|
| `WorkInboxTaskCardV3` | `model: TaskCardModel` | Title, chip, assignee, due (optional), primary CTA |
| `WorkInboxStatusChip` | `status: InboxStatus` | Operator labels per spec |
| `WorkInboxGroupSection` | `bucket`, `cards[]` | Empty: "Không có công việc" |

## Data Flow

```text
TaskItem[] (TasksPage snapshot collector)
  → mapTasksToInboxItems()
  → buildVisibleInboxGroups()
  → mapInboxGroupBucketToCardModels(bucket, 5)
      → mapInboxItemToTaskCardModel() per item
  → WorkInboxTaskCardV3
```

No direct snapshot / raw field rendering in cards.

## UI Integration

- Panel still gated by `/inbox` + `VITE_CBV_WORK_INBOX_GROUPS_V3` (Phase C).
- Primary action: `model.primaryActionHref` (adapter: `/inbox/:id`) via `navigate()`.
- `/tasks/:id` legacy list below panel unchanged.

## Tests

`runTaskCardV3Checks()` in `taskCardV3Checks.ts` — component source + adapter mapping checks.

Covers: title, status, assignee, action, missing assignee/due, unknown status, empty data, adapter-only panel, `/inbox/` href.

## Build Result

```text
cd apps/workboard && npm run build
→ PASS
```

## Runtime Impact

- **No** API / GAS / Worker / schema changes.
- **No** `TasksPage` rewrite (panel integration unchanged from Phase C).
- CSS additive for V3 cards only.

## Acceptance Check

- [x] TaskCardV3 created
- [x] Uses `TaskCardModel`
- [x] Uses adapter output
- [x] Status chip works
- [x] Primary action works
- [x] Group panel updated
- [x] TasksPage preserved
- [x] No API change
- [x] No schema change
- [x] Build passed

## Risks

| Risk | Mitigation |
|------|------------|
| Dual list UX (V3 cards + cognition list) | Expected until Focus Mode / list convergence |
| Assignee fallback "Chưa gán" when directory miss | Matches safe adapter behavior |
| `/inbox/:id` vs in-app `/tasks/:id` navigation | Adapter canonical href; TasksPage still opens detail on both routes |

## Next Step

**PHASE E — Focus Mode V3**

- Single-task focus surface using `WorkInboxFocusItem` + adapter

---

*Generated: PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_D. No commit.*
