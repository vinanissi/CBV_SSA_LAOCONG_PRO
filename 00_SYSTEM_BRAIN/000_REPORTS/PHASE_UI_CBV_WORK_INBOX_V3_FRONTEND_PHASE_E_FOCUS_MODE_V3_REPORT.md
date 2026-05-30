# PHASE UI — CBV_WORK_INBOX_V3 FRONTEND PHASE E FOCUS MODE V3 REPORT

## Status

**GO**

## Summary

Focus Mode V3 helps operators process **one task at a time** inside `WorkInboxGroupsPanel` on `/inbox`. Queue data flows through the V3 adapter pipeline to `WorkInboxFocusItem[]` and renders in `WorkInboxFocusModeV3`. Legacy `focusQueueMode`, `FocusStrip`, `TasksPage`, and `/tasks` are preserved. Secondary actions are visible but **disabled** (non-destructive Phase E stubs).

## Authority Read

- `900_AUTHORITY/000_DESIGN_AUTHORITY.md`
- `900_AUTHORITY/001_AUTHORITY_INDEX.md`
- `100_TARGET_DESIGN/010_FOCUS_MODE_SPEC.md`
- `100_TARGET_DESIGN/014_DATA_CONTRACT.md`
- `200_IMPLEMENTATION/015_FRONTEND_IMPLEMENTATION_ROADMAP.md` (Phase E)
- `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_D_TASK_CARD_V3_REPORT.md`

## Created Files

| File | Purpose |
|------|---------|
| `apps/workboard/src/modules/task/inbox/focusModeModels.ts` | `mapTaskCardModelsToFocusItems`, `clampFocusIndex` |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxFocusModeV3.tsx` | Single-task focus surface |
| `apps/workboard/src/modules/task/inbox/focusModeV3Checks.ts` | Dev sanity suite |

## Updated Files

| File | Change |
|------|--------|
| `apps/workboard/src/modules/task/inbox/WorkInboxGroupsPanel.tsx` | 🎯 Focus Mode; pipeline + `onOpenDetail` |
| `apps/workboard/src/modules/task/inbox/workInboxGroupsFeature.ts` | `isWorkInboxFocusV3Enabled()` |
| `apps/workboard/src/modules/task/inbox/inboxCardModels.ts` | `collectOrderedCardModelsFromBuckets` (Phase C/D) |
| `apps/workboard/src/styles/index.css` | `.work-inbox-focus-v3` |
| `apps/workboard/.env.example` | `VITE_CBV_WORK_INBOX_FOCUS_V3` documented |
| `apps/workboard/src/vite-env.d.ts` | Env types |

## Components

| Component | Role |
|-----------|------|
| `WorkInboxFocusModeV3` | One task; progress; nav; actions |
| `WorkInboxStatusChip` | Reused status display |

## Focus Model

```ts
mapTaskCardModelsToFocusItems(cards: TaskCardModel[]): WorkInboxFocusItem[]
```

| Field | Rule |
|-------|------|
| `progressIndex` | `index + 1` |
| `progressTotal` | `cards.length` |
| `detailHref` | `primaryActionHref` |
| `canComplete/Forward/Pause` | `status !== 'completed'` |

## Data Flow

```text
TaskItem[] (TasksPage snapshot collector)
  → mapTasksToInboxItems()
  → buildVisibleInboxGroups()
  → mapInboxGroupBucketToCardModels(bucket, all items)  // per group, fixed order
  → mapTaskCardModelsToFocusItems()
  → WorkInboxFocusModeV3
```

No direct snapshot → Focus UI rendering.

## Action Safety

| Action | Phase E behavior |
|--------|------------------|
| **Mở xử lý** | `onOpenDetail(item)` → `navigate(item.detailHref)` — safe read/navigation |
| **Hoàn thành** | `disabled` + tooltip — **no API, no status write** |
| **Chuyển tiếp** | `disabled` + tooltip — **no API** |
| **Tạm dừng** | `disabled` + tooltip — **no API** |
| **Việc trước / tiếp** | Local index only |
| **Thoát Focus** | UI state only |

Forbidden and **not implemented**: `api.complete`, task status mutation, GAS/Worker calls, Sheet writes.

## UI Integration

- Toolbar button: **🎯 Focus Mode** (when `isWorkInboxFocusV3Enabled()`).
- Active: group preview hidden; `WorkInboxFocusModeV3` shown.
- Gated by `VITE_CBV_WORK_INBOX_GROUPS_V3` + optional `VITE_CBV_WORK_INBOX_FOCUS_V3=false`.
- Empty queue: **Không có công việc để focus**.

## Tests

`runFocusModeV3Checks()` — maps/progress/empty/bounds/completed flags/single surface/safe actions/adapter chain/`onOpenDetail`.

## Build Result

```text
cd apps/workboard && npm run build → PASS
```

## Runtime Impact

- No API / schema / GAS / Worker changes.
- No `TasksPage` rewrite.
- Legacy focus runtime unchanged.

## Acceptance Check

- [x] Focus component created
- [x] Focus model builder created
- [x] Uses TaskCardModel / WorkInboxFocusItem
- [x] Shows exactly one task
- [x] Progress x/N works
- [x] Prev/Next works
- [x] Exit works
- [x] Actions are safe / non-destructive
- [x] Legacy focus preserved
- [x] No API change
- [x] No schema change
- [x] Build passed

## Risks

| Risk | Mitigation |
|------|------------|
| Dual focus UX (V3 vs `focusQueueMode`) | Documented; legacy kept until runtime transition phase |
| Focus queue = full snapshot groups, not filtered list | Matches spec group order |
| Disabled actions until Phase F+ wiring | Tooltips explain Phase E stub |

## Next Step

**PHASE_UI_CBV_WORK_INBOX_V3_RUNTIME_TRANSITION** — optional hide/replace OLD runtime per roadmap (not in Phase E scope).

---

*Generated: PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_E. No commit.*
