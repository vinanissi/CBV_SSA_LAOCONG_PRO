# HOTFIX_WORK_INBOX_V3_FOCUS_PANEL_COMPACT_LAYOUT_REPORT

## Scope

Compact the **side Focus preview panel** (`WorkInboxFocusPanel`) so actions sit immediately under task meta. No API, GAS, Worker, schema, or adapter changes. Legacy runtime and full-screen `WorkInboxFocusModeV3` unchanged.

## Root cause

The preview panel stretched to the height of the adjacent inbox groups column because of:

| Source | Issue |
|---|---|
| `WorkInboxFocusPanel.tsx` | Inner body used `flex-1` (grow to fill column) |
| `WorkInboxFocusPanel.tsx` | Action block used `mt-auto` (push buttons to bottom) |
| `WorkInboxFocusPanel.tsx` | Empty state used `flex flex-1` (vertical centering in tall cell) |
| `index.css` `.work-inbox-focus-panel` | `min-height: 10rem` forced minimum card height |
| CSS grid parent | Default `align-items: stretch` made aside match tallest column |

Together this created a large blank area between task meta and action buttons.

## CSS / classes changed

### Removed / overridden

- `min-height: 10rem` on generic `.work-inbox-focus-panel` (replaced by compact variant)
- Tailwind `flex-1` on preview body and empty state
- Tailwind `mt-auto` on action container
- `p-2.5` + loose `gap-2` / `mb-2` in favor of compact scoped rules

### Added

- `work-inbox-focus-panel--compact` on preview `<aside>`
- BEM blocks: `__header`, `__body`, `__meta`, `__actions`, `__actions-row`
- CSS (`index.css`):
  - `height: auto; min-height: 0; align-self: start; justify-content: flex-start`
  - `padding: 0.625rem 0.75rem` (~10–12px)
  - `gap: 0.375rem` (~6px) on panel, body, meta, actions

Full-screen mode keeps class `work-inbox-focus-v3` only — not affected by compact rules.

## Files changed

| File | Change |
|---|---|
| `apps/workboard/src/modules/task/inbox/components/WorkInboxFocusPanel.tsx` | Compact structure; inline secondary actions; combined assignee · due line |
| `apps/workboard/src/styles/index.css` | Compact preview panel styles scoped to `--compact` modifier |

**Audited, unchanged:**

- `WorkInboxFocusModeV3.tsx` — full Focus Mode layout preserved
- `WorkInboxGroupsPanel.tsx` — still mounts preview panel in grid (no logic change)
- `workInboxAdapter.ts` — not touched

## Before / after behavior

### Before

```text
FOCUS                    1 / 97
Task title
Status
Assignee
Due (separate line)

[ large empty vertical space ]

[Mở xử lý]
[Việc tiếp]
[Mở Focus toàn màn]   (link under stack)
```

Panel height ≈ height of inbox groups column; actions at bottom.

### After

```text
FOCUS                    1 / 97
TRƯỜNG CÔNG TRÚC - 1987
○ Chưa xác định
👤 Tường Vy · Chưa có hạn

[Mở xử lý]
[Việc tiếp] [Mở Focus toàn màn]
```

Panel height fits content (`align-self: start` in grid). Actions directly under meta.

### Button bindings (preserved)

| Action | Handler | Status |
|---|---|---|
| Mở xử lý | `onOpenDetail(current)` | OK |
| Việc tiếp | `goNext` → `onFocusIndexChange` | OK |
| Mở Focus toàn màn | `onStartFullFocus` | OK |

## Build result

```text
cd apps/workboard && npm run build
→ PASS (tsc --noEmit && vite build)
```

## Remaining risks

- On very narrow viewports, side-by-side secondary buttons may wrap to two lines (acceptable; still compact).
- If future grid layout sets explicit row height on the focus column, ensure `align-self: start` remains on the compact panel.
- Long task titles still use `line-clamp-2` — may need scroll only on extremely small breakpoints (unchanged from before).

## Git

Per instruction: **no commit**, **no push**. Run `git status` to review local changes.
