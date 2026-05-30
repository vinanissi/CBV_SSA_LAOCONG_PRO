# CBV_WORK_INBOX_V3 — Layout Specification

**Version:** V3.0 · **Date:** 2026-05-29  
**Implementation reference:** `apps/workboard/src/components/layout/AppShell.tsx`

---

## 1. Shell geometry

| Property | Value | Token / class |
|----------|-------|---------------|
| Viewport | `100vh` flex column | `h-screen` |
| Min width | 1366px | `min-w-[1366px]`, `minWidth.shell` |
| Background | Light gray surface | `bg-surface` `#f3f4f6` |
| Root class | Operational runtime | `operational-runtime` |

---

## 2. Vertical stack (top → bottom)

```
┌─ TopBar ──────────────────── fixed height ~56px ─────────────┐
├─ Main row (flex-1, min-h-0) ──────────────────────────────────┤
│  ├─ Sidebar (~240px)                                           │
│  └─ Main column (flex-1)                                       │
│       ├─ Scroll region (operational-main-scroll)               │
│       │    ├─ FocusStrip (hidden on /tasks)                    │
│       │    └─ main-canvas                                      │
│       └─ DetailPanel (xl: side / mobile: bottom sheet)         │
├─ RuntimeStatusBar ──────────── fixed height ~32–40px ──────────┤
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Zone dimensions

| Zone | Width | Height | Scroll |
|------|-------|--------|--------|
| Sidebar | ~240px fixed | flex-1 | vertical internal |
| Main canvas | flex-1 | flex-1 | `overflow-y-auto` on scroll region |
| Detail panel | 360–420px (`w-detail` 400px) | flex-1 | vertical internal |
| Bottom sheet detail | 100% width | max 70vh | vertical |

---

## 4. Main canvas (`main-canvas`)

```css
rounded-xl border border-border bg-surface-active p-5 shadow-sm
```

Contains Work Inbox content stack:

| Block | Spacing |
|-------|---------|
| OperationalAlertHeader | `mb-3` when visible |
| TaskControlSurface | `mb-4` |
| TaskGroupedList | fills remaining |
| Inline feedback strips | `mt-2` |

---

## 5. Control strip layout

`TaskControlSurface` uses two rows when context available:

**Row 1 — Feedback** (conditional): filter feedback or queue summary  
**Row 2 — Primary controls:**

```
[ Việc của tôi | Chờ xử lý | Quá hạn | Chờ duyệt ]  |  [Group ▼]  [Quick focus chips]  [Focus queue ☐]
```

**Row 3 — Context** (hidden in focus queue mode): execution memory, resume chip, recent tasks

Focus queue active → add class `operational-control-focus`; hide context row.

---

## 6. Task queue layout

| Element | Layout |
|---------|--------|
| Group header | Sticky optional; `task-group-header` |
| Group body | `space-y-0.5 p-1` |
| Task card | Full width row, min-height 3.125rem (`task-card-scan-row`) |
| Card grid | Single column list only — no multi-column card grid in V3 |

### Card internal grid

```
┌─ signal border ─┬─ title + operational line (flex-1 min-w-0) ─┬─ action zone 4.75rem ─┐
```

Action zone: primary inline button + icon cluster (hover reveal for secondary).

---

## 7. Detail panel layout

| Section | Order |
|---------|-------|
| Header | Title + ESC close |
| Body | OperationalContextPanel sections |
| Mobile | Fixed bottom overlay, z-40 |

Empty state copy: *"Chọn việc để xem ngữ cảnh vận hành — SLA, timeline, tài liệu và bước tiếp theo."*

---

## 8. Runtime status bar

Fixed footer; contains:
- Connection / refresh state
- Task telemetry counters (`CompactRuntimeCounters`)
- Stale/degraded hint
- User context chip (non-PII)

Must not overlap main scroll content — shell uses flex, not fixed main.

---

## 9. Spacing scale (operational)

| Token | Value | Use |
|-------|-------|-----|
| Shell padding | `px-5 py-4` | Main scroll region |
| Panel padding | `p-4` / `px-4 py-3` | panel-body / panel-header |
| Card padding | `px-2 py-1` | compact card |
| Control gap | `gap-2` / `gap-1.5` | filter tabs, chips |
| Section gap | `space-y-5` | page-level (search) |

---

## 10. Z-index stack

| Layer | z-index |
|-------|---------|
| Main content | auto |
| Detail bottom sheet | 40 |
| Modals / drawers | 50+ |
| Runtime footer drawer | per `RuntimeFooterDrawer` |

---

## 11. Layout anti-patterns (forbidden)

- Removing sidebar or status bar from Work Inbox
- Floating detail panel over list on desktop (use fixed aside)
- Multi-column task grid on desktop
- Collapsing filter tabs into hamburger on desktop (≥1366px)
- Layout shift when toggling focus queue (use dim, not reflow)

---

## 12. Layout acceptance probes

CSS markers checked by operational visibility tests:

- `.operational-runtime` with `text-base` / 16px
- `.main-canvas` present
- `.task-card-scan-row` min-height
- `.detail-panel-aside` at xl breakpoint

See `taskOperationalVisibilityChecks.ts`.
