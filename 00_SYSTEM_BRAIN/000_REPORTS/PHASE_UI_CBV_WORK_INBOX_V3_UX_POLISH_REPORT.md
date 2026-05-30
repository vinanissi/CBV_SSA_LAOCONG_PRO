# PHASE UI — CBV_WORK_INBOX_V3 UX POLISH REPORT

## Status

**GO**

## Summary

Operator UX polish for Work Inbox V3 on `/inbox`: **KPI strip**, **Focus preview panel**, **prominent Focus CTA**, **compact task cards**, and tighter spacing — without changing adapter, API, GAS, Worker, or runtime transition architecture.

## Before / After

| Area | Before | After |
|------|--------|-------|
| Top of inbox | Subtitle + small "Focus Mode" button | **KPI strip** (Việc / Quá hạn / Đang mở / Cảnh báo) + **🎯 Focus N việc** (primary) |
| Focus context | Empty until full Focus Mode | **Side Focus panel** with current task, progress, Mở xử lý, Việc tiếp |
| Task card height | ~140px stacked layout | **~70–80px** horizontal compact row |
| Cards per group | 5 preview | **10** preview |
| Group spacing | `space-y-3`, `p-3`, `gap-2` | `space-y-2`, `p-1.5`, `gap-1` |
| Shell header | Title + long subtitle | Compact **Hộp việc** title only |

**Goal:** Operator sees counts, next action, and entry point within **&lt; 3 seconds** of opening `/inbox`.

## KPI Strip

**Component:** `WorkInboxKpiStrip`  
**Data:** `deriveWorkInboxKpi(tasks, snapshot.counts)` — uses existing `TaskWorkspaceCounts` when passed from `TasksPage`; falls back to task row heuristics. No new API.

| Cell | Source |
|------|--------|
| Việc | `counts.total` |
| Quá hạn | `counts.overdue` |
| Đang mở | `counts.open + counts.inProgress` |
| Cảnh báo | `blocked + overdue + noOwner` |

## Focus Panel

**Component:** `WorkInboxFocusPanel`  
**Placement:** Left column beside group list (stacked on narrow viewports).

- Shows **🎯 Focus** + `x / N`
- Current queue item: title, status chip, assignee, due
- **Mở xử lý** + **Việc tiếp** (cycles preview index)
- Link **Mở Focus toàn màn** → existing `WorkInboxFocusModeV3`
- Empty: **Chọn việc để bắt đầu Focus**

## Compact Card

**Component:** `WorkInboxTaskCardV3` with `compact` (default in groups)

```text
[ Title                    ] [Mở xử lý]
[ 🔴 assignee · due label  ]
```

- Status as inline emoji + meta line (no full chip block)
- Action button inline right

## Focus CTA

- Label: **`🎯 Focus {N} việc`** (or **Bắt đầu Focus** when empty)
- Style: `btn-primary` + bold
- Position: directly under KPI strip

## Visual Cleanup

- `PREVIEW_LIMIT`: 5 → **10**
- `WorkInboxGroupSection`: reduced header/padding/gaps
- `WorkInboxGroupsPanel`: `space-y-2`, 2-column layout with focus panel
- `WorkInboxShell`: smaller header margin

## Build Result

```text
cd apps/workboard && npm run build → PASS
```

## Runtime Impact

- **No** API / GAS / Worker / schema changes
- **No** changes to `mapTasksToInboxItems`, `buildInboxGroups`, `TaskCardModel`, `WorkInboxFocusItem`
- Optional prop `counts` on `WorkInboxGroupsPanel` from existing snapshot (read-only)

## Acceptance Check

- [x] KPI Strip visible
- [x] Focus CTA prominent
- [x] Focus Panel has content
- [x] Cards visibly shorter (compact layout)
- [x] More tasks per viewport (10/group + compact)
- [x] No API change
- [x] No schema change
- [x] No GAS/Worker change
- [x] Build passed

## Created Files

| File |
|------|
| `apps/workboard/src/modules/task/inbox/workInboxKpi.ts` |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxKpiStrip.tsx` |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxFocusPanel.tsx` |

## Updated Files

| File |
|------|
| `apps/workboard/src/modules/task/inbox/WorkInboxGroupsPanel.tsx` |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxTaskCardV3.tsx` |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxGroupSection.tsx` |
| `apps/workboard/src/components/inbox/WorkInboxShell.tsx` |
| `apps/workboard/src/modules/task/TasksPage.tsx` |
| `apps/workboard/src/styles/index.css` |

---

*Generated: PHASE_UI_CBV_WORK_INBOX_V3_UX_POLISH. No commit.*
