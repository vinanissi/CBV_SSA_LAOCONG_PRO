# PHASE UI — CBV_WORK_INBOX_V3 FRONTEND PHASE C INBOX GROUPS REPORT

## Status

**GO**

## Summary

Phase C introduces the first operator-visible **Work Inbox V3** grouping layer on `/inbox`. Snapshot tasks from the existing `TasksPage` runtime are collected, mapped through **`mapTasksToInboxItems()`** (Phase B), partitioned with **`buildInboxGroups()`**, and rendered in **`WorkInboxGroupsPanel`** above the legacy task list. Cognition filters, `TaskGroupedList`, and `/tasks` behavior are unchanged.

## Authority Read

- `900_AUTHORITY/000_DESIGN_AUTHORITY.md` (inbox group labels)
- `900_AUTHORITY/001_AUTHORITY_INDEX.md`
- `100_TARGET_DESIGN/014_DATA_CONTRACT.md`
- `100_TARGET_DESIGN/001_UI_PRINCIPLES.md`
- `100_TARGET_DESIGN/002_INFORMATION_ARCHITECTURE.md`
- `100_TARGET_DESIGN/013_ACCEPTANCE_CRITERIA.md`
- `200_IMPLEMENTATION/015_FRONTEND_IMPLEMENTATION_ROADMAP.md` (Phase C)
- `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_A_ROUTE_ALIAS_REPORT.md`
- `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_B_DATA_ADAPTER_REPORT.md`

## Created Files

| File | Purpose |
|------|---------|
| `apps/workboard/src/modules/task/inbox/inboxGroups.ts` | `InboxGroupBucket`, `buildInboxGroups`, snapshot collector |
| `apps/workboard/src/modules/task/inbox/WorkInboxGroupsPanel.tsx` | V3 group preview UI |
| `apps/workboard/src/modules/task/inbox/workInboxGroupsFeature.ts` | `VITE_CBV_WORK_INBOX_GROUPS_V3` kill-switch |
| `apps/workboard/src/modules/task/inbox/inboxGroupsChecks.ts` | Dev sanity suite |

## Updated Files

| File | Change |
|------|--------|
| `apps/workboard/src/modules/task/TasksPage.tsx` | Renders panel on `/inbox` only (append) |
| `apps/workboard/vite-env.d.ts` | Optional env type |
| `apps/workboard/.env.example` | Document kill-switch |

## Group Model

```ts
interface InboxGroupBucket {
  key: 'need_action' | 'waiting' | 'follow_up' | 'completed';
  label: string; // 🔥 / 🟡 / 👀 / ✅
  items: InboxItem[];
}
```

Fixed order: `need_action` → `waiting` → `follow_up` → `completed`.

## Group Builder

| Function | Role |
|----------|------|
| `collectRuntimeTasksFromSnapshot(snapshot)` | Deduped `TaskItem[]` from snapshot lists |
| `buildInboxGroups(items)` | Partition by `InboxItem.group` (no status re-logic) |
| `buildVisibleInboxGroups(items)` | Non-empty buckets for UI |

Labels:

| Key | Label |
|-----|-------|
| `need_action` | 🔥 Cần làm ngay |
| `waiting` | 🟡 Chờ xử lý |
| `follow_up` | 👀 Theo dõi |
| `completed` | ✅ Hoàn thành |

Empty buckets: **hidden** in panel (`buildVisibleInboxGroups`).

## UI Integration

**Data flow (required):**

```text
TaskWorkspaceSnapshot (TasksPage)
  → collectRuntimeTasksFromSnapshot()
  → mapTasksToInboxItems()   [inside WorkInboxGroupsPanel]
  → buildVisibleInboxGroups()
  → WorkInboxGroupsPanel
```

- Shown when: `location.pathname.startsWith('/inbox')` **and** `isWorkInboxGroupsV3Enabled()` (default on).
- **Not** shown on `/tasks` (legacy path unchanged visually for groups V3).
- Panel shows: group header + count + top 3 titles/status per group (no Card V3).
- Full `TasksPage` list/filters remain below.

**Feature flag:** `VITE_CBV_WORK_INBOX_GROUPS_V3=false` disables panel (simple env pattern, no new package).

## Tests

No Vitest. Suite: `runInboxGroupsChecks()` in `inboxGroupsChecks.ts`

Covers: empty input, each group, fixed order, visible hides empty, adapter output, snapshot dedupe, mixed safety.

## Build Result

```text
cd apps/workboard && npm run build
→ PASS
```

## Runtime Impact

- **No** API / GAS / Worker / schema changes.
- **No** removal of cognition grouping or filters.
- **Append-only** `TasksPage` change (~10 lines render + imports).
- Bundle +3 modules (adapter already present from Phase B).

## Acceptance Check

- [x] Group model created
- [x] `buildInboxGroups` created
- [x] Uses `InboxItem`
- [x] Uses adapter output (`mapTasksToInboxItems`)
- [x] `WorkInboxGroupsPanel` created
- [x] Visible on `/inbox`
- [x] `TasksPage` preserved (list + controls below panel)
- [x] No API change
- [x] No schema change
- [x] Build passed

## Risks

| Risk | Mitigation |
|------|------------|
| Duplicate UX (V3 groups + cognition list) | Expected for Phase C preview; Phase D+ may converge cards |
| Snapshot lists may omit edge tasks | Collector unions `tasks`, `blockedTasks`, `dueTasks`, `overdueTasks` |
| Group counts vs filtered list differ | Groups use full snapshot; list respects active filters (documented) |

## Next Step

**PHASE D — Task Card V3**

- Replace preview rows with `TaskCardModel` card component
- Keep adapter + `buildInboxGroups` as data source

---

*Generated: PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_C. No commit.*
