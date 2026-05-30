# PHASE UI — CBV_WORK_INBOX_V3 FRONTEND PHASE B DATA ADAPTER REPORT

## Status

**GO**

## Summary

Phase B adds a frontend data adapter layer that maps current task runtime / snapshot shapes (`TaskItem` and loose raw objects) into `InboxItem` and `TaskCardModel` per `014_DATA_CONTRACT.md`. The adapter is standalone: **`TasksPage` UI is unchanged**, no API/schema/GAS changes, and Phase A routes (`/inbox`, `/tasks`) remain intact. Primary action links use canonical **`/inbox/:id`**.

## Authority Read

- `900_AUTHORITY/000_DESIGN_AUTHORITY.md`
- `900_AUTHORITY/001_AUTHORITY_INDEX.md`
- `100_TARGET_DESIGN/014_DATA_CONTRACT.md`
- `200_IMPLEMENTATION/015_FRONTEND_IMPLEMENTATION_ROADMAP.md` (Phase B scope)
- `200_IMPLEMENTATION/016_AS_IS_TO_BE_MAPPING.md`
- `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_A_ROUTE_ALIAS_REPORT.md`

## Created Files

| File | Purpose |
|------|---------|
| `apps/workboard/src/modules/task/types/workInboxTypes.ts` | Inbox view-model types (014 contract) |
| `apps/workboard/src/modules/task/adapters/workInboxAdapter.ts` | Mapping functions + helpers |
| `apps/workboard/src/modules/task/adapters/workInboxAdapterChecks.ts` | Dev sanity suite (no Vitest in project) |

## Updated Files

None required for runtime UI (adapter-only phase).

## Adapter Functions

| Function | Description |
|----------|-------------|
| `mapTaskToInboxItem(rawTask)` | Single raw/snapshot task → `InboxItem` |
| `mapTasksToInboxItems(rawTasks)` | Array map (null-safe per element) |
| `mapInboxItemToTaskCardModel(item)` | `InboxItem` → `TaskCardModel` |
| `mapInboxItemsToTaskCardModels(items)` | Batch card models |
| `normalizeInboxStatus(raw)` | Status normalization helper |
| `deriveInboxGroup(status)` | Group from status |
| `deriveDueLabel(status, dueDate, isOverdue)` | Operator due copy |
| `derivePrimaryActionHref(taskId)` | `/inbox/:id` |
| `deriveRelatedEntities(raw)` | HO_SO / entity hints when present |

## Mapping Rules

| Field | Rule |
|-------|------|
| **ID** | `taskId`, `id`, `TASK_ID`, `maCongViec`, `code` → fallback `unknown-task` |
| **Title** | `title`, `name`, `taskName`, `noiDungCongViec`, … → fallback `Chưa có tiêu đề` |
| **Status** | Runtime status + `urgency` + `isOverdue` + due-today → `overdue` / `today` / `waiting` / `follow_up` / `completed` / `unknown` |
| **Group** | `completed`→`completed`; `waiting`→`waiting`; `follow_up`→`follow_up`; else `need_action` |
| **Due label** | Quá hạn / Hạn hôm nay / `Hạn: YYYY-MM-DD` / Chưa có hạn |
| **Primary action** | Label `Mở xử lý`; href **`/inbox/:id`** (canonical per Phase A) |
| **Module** | Default `TASK`; only map other modules when field is explicit |
| **Assignee/owner** | Prefer display fields from `TaskItem`; safe on missing data |

### Type contract notes

- Live API envelope remains `@/api/contracts` **`ApiEnvelope<T>`** (`warnings` / `errors` arrays).
- Target inbox envelope exported as **`InboxDataApiEnvelope<T>`** in `workInboxTypes.ts` to avoid name collision.
- Contract **`FocusItem`** exported as **`WorkInboxFocusItem`** to avoid clash with dashboard `FocusStrip.FocusItem`.

## Tests

No Vitest/Jest in `apps/workboard/package.json`.

**Sanity suite:** `runWorkInboxAdapterChecks()` in `workInboxAdapterChecks.ts`

Covers:

- maps empty raw task safely
- maps completed status
- maps waiting status
- maps overdue status
- maps unknown → `need_action`
- maps InboxItem → TaskCardModel (`/inbox/:id` href)
- maps array safely

**Manual:** import suite in browser devtools or future test console hook (same pattern as `taskGs04Checks`).

## Build Result

```text
cd apps/workboard && npm run build
→ PASS (tsc --noEmit && vite build)
```

## Runtime Impact

- **No** changes to `TasksPage`, `TaskCard`, snapshot fetch, Worker/GAS APIs, or Google Sheet schema.
- Adapter is **tree-shakeable** until Phase C+ imports it for inbox groups / V3 cards.
- Existing `/tasks` deep links in runtime navigation unchanged; adapter **emits** `/inbox/:id` for new view models only.

## Acceptance Check

- [x] Type contract created
- [x] Adapter created
- [x] Raw task maps to InboxItem
- [x] InboxItem maps to TaskCardModel
- [x] Missing data handled safely
- [x] No API contract changed
- [x] No schema changed
- [x] `/tasks` preserved
- [x] `/inbox` preserved
- [x] No big-bang UI rewrite
- [x] Build passed

## Risks

| Risk | Mitigation |
|------|------------|
| Status heuristics may mis-classify edge runtime statuses | Phase C can refine with snapshot context; helpers are exported for tuning |
| `IN_PROGRESS` → `unknown` / `need_action` until explicit rules added | Matches Phase B spec; aligns with “operator urgency first” grouping later |
| Dual envelope shapes during migration | `InboxDataApiEnvelope` documented; live code still uses `contracts.ApiEnvelope` |

## Next Step

**PHASE C — Inbox Groups**

- Render Need Action / Waiting / Follow Up / Completed using `InboxItem.group`
- Wire `mapTasksToInboxItems` from workspace snapshot in inbox shell (without removing current `TasksPage` path until UAT)

---

*Generated: PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_B. No commit.*
