# HOTFIX_WORK_INBOX_V3_OPEN_ACTION_NOT_WORKING_REPORT

## Scope

Fix Work Inbox V3 operational action binding so `Mở xử lý`, card click, and Focus panel actions open task detail reliably.

Constraints honored:

- No UI redesign
- No API / GAS / Worker / Google Sheet schema changes
- Legacy runtime preserved

## Root cause

Two issues combined to make V3 actions appear dead:

1. **Auto-close effect in `TasksPage`** — When a task was opened via `/inbox/:id`, `loadTaskDetail` ran, then an effect checked visibility only against **legacy** `flatTasks`. Tasks visible in V3 (`inboxRuntimeTasks`) but filtered out of the legacy queue were treated as “not visible”, which **cleared the detail panel** and **replaced the route** back to `/tasks?…` without `taskId`. Operators perceived this as “click does nothing”.

2. **Disconnected navigation path** — `WorkInboxGroupsPanel` called `navigate(href)` internally without going through `TasksPage.openWorkInboxTask`, so selection, working context, coordination memory, and detail loading were not consistently coordinated with the runtime shell.

Event swallowing (`pointer-events`, missing `type="button"`) was **not** the cause — buttons were correctly typed and not blocked by CSS overlays.

## Broken buttons / actions found

| Component | Action | Symptom |
|---|---|---|
| `WorkInboxTaskCardV3` | `Mở xử lý` | Navigate fired but detail closed immediately (legacy filter effect) |
| `WorkInboxTaskCardV3` | Card row click | No selection sync with Focus panel / context |
| `WorkInboxFocusPanel` | `Mở xử lý` | Same route/detail race as card button |
| `WorkInboxFocusPanel` | `Việc tiếp` | Index advanced locally but not tied to `selectedTaskId` from page |
| `TasksPage` | (implicit) | Cleared V3-opened tasks not in `flatTasks` |

## Files changed

| File | Change |
|---|---|
| `apps/workboard/src/modules/task/inbox/workInboxOpenAction.ts` | **New** — resolve open href, `console.warn` on missing id/href, focus index helper |
| `apps/workboard/src/modules/task/TasksPage.tsx` | `openWorkInboxTask`, visibility guard uses `inboxRuntimeTasks`, panel props, inbox-aware ESC/list redirect |
| `apps/workboard/src/modules/task/inbox/WorkInboxGroupsPanel.tsx` | Parent-driven `onOpenTask` / `onSelectTask`, `selectedTaskId` sync for Focus |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxGroupSection.tsx` | Pass `onOpen` / `onSelect` / `selectedTaskId` |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxTaskCardV3.tsx` | `onOpen(model)` / `onSelect(model)`, warn if unbound, selected ring |

**Audited, unchanged (behavior already correct or intentionally stubbed):**

- `workInboxAdapter.ts` — `derivePrimaryActionHref` → `/inbox/:id`
- `inboxCardModels.ts` — maps adapter models only
- `WorkInboxFocusModeV3.tsx` — prev/next + disabled Phase E actions unchanged

## Final route used

**Primary (authority + adapter):** `/inbox/:id`

```ts
derivePrimaryActionHref(taskId) // => `/inbox/${encodeURIComponent(taskId)}`
```

**Fallback (documented):** `/tasks/:id` remains valid via `TASKS_LEGACY_ROUTE` in `workInboxOpenAction.buildWorkInboxOpenHref` and legacy `openTask()` for cognition list — not used for V3 card open when on inbox route.

Detail panel opens through existing `TasksPage.loadTaskDetail` + `OperationalContextPanel` (no new API).

## Action-binding audit (post-fix)

| Component | Action | Current behavior | Expected | Fixed? |
|---|---|---|---|---|
| `WorkInboxGroupsPanel` | Focus CTA | Opens full Focus Mode V3 | Open Focus + UI state | Yes |
| `WorkInboxTaskCardV3` | Card click | `onSelect` → `openWorkInboxTask` | Select + context panel | **Yes** |
| `WorkInboxTaskCardV3` | `Mở xử lý` | `onOpen` → `openWorkInboxTask` | Open `/inbox/:id` + detail | **Yes** |
| `WorkInboxFocusPanel` | `Mở xử lý` | `resolveFocusItemOpenTarget` → `openWorkInboxTask` | Navigate + detail | **Yes** |
| `WorkInboxFocusPanel` | `Việc tiếp` | Advances `focusPreviewIndex`; syncs from `selectedTaskId` | Next focus item | **Yes** |
| `WorkInboxFocusModeV3` | `Việc trước` / `Việc tiếp` | Index prev/next with boundary disable | Navigate queue | Yes (unchanged) |
| `LegacyTaskRuntimePanel` | `Hiện Runtime cũ` | Toggles `showLegacyRuntime` | Expand legacy | Yes (unchanged) |
| `WorkInboxFocusModeV3` | `Hoàn thành` / `Chuyển tiếp` / `Tạm dừng` | `disabled` + stub title | Safe non-write Phase E | Intentionally disabled |

## Manual test checklist

- [ ] On `/inbox`, click **Mở xử lý** on a V3 card → URL `/inbox/:id`, detail panel shows task, panel stays open ≥10s
- [ ] Click card row (not only button) → same selection, Focus panel shows same task, card has selected ring
- [ ] Focus panel **Việc tiếp** → preview index advances, title/assignee update
- [ ] Focus panel **Mở xử lý** → opens detail for current focus item
- [ ] **Focus CTA** → full Focus Mode; **Việc trước/tiếp** work at boundaries
- [ ] **Hiện Runtime cũ** → legacy filters/list expand; legacy card open still works (`/tasks/:id`)
- [ ] Change legacy filter so task leaves `flatTasks` but remains in V3 → detail **not** auto-closed
- [ ] Missing href edge: console shows `[WorkInboxV3]` warn (dev only)

## Build result

```text
cd apps/workboard && npm run build
→ PASS (tsc --noEmit && vite build)
```

## Remaining intentionally-disabled actions

| Action | Location | Reason |
|---|---|---|
| `Hoàn thành` | `WorkInboxFocusModeV3` | Phase E safe stub — no write from this UI path |
| `Chuyển tiếp` | `WorkInboxFocusModeV3` | Phase E safe stub |
| `Tạm dừng` | `WorkInboxFocusModeV3` | Phase E safe stub |
| Focus CTA | `WorkInboxGroupsPanel` | Disabled when `focusItems.length === 0` |
| `Việc trước` / `Việc tiếp` (full mode) | `WorkInboxFocusModeV3` | Disabled at first/last index |

## Git

Per instruction: **no commit**, **no push**. Run `git status` locally to review changed files.
