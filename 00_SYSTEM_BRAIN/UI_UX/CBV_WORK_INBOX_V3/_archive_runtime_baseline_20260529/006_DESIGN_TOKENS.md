# CBV_WORK_INBOX_V3 — Design Tokens

**Version:** V3.0 · **Date:** 2026-05-29  
**Source:** `apps/workboard/tailwind.config.ts`, `apps/workboard/src/styles/index.css`

---

## 1. Color — surfaces

| Token | Hex | Tailwind | Use |
|-------|-----|----------|-----|
| `surface.DEFAULT` | `#f3f4f6` | `bg-surface` | Shell background |
| `surface.raised` | `#eef2f7` | `bg-surface-raised` | Elevated strips |
| `surface.overlay` | `#eef2f7` | `bg-surface-overlay` | Hover states |
| `surface.content` | `#ffffff` | `bg-surface-content` | Cards, panels |
| `surface.active` | `#f8fafc` | `bg-surface-active` | Main canvas |

---

## 2. Color — borders

| Token | Hex | Use |
|-------|-----|-----|
| `border.DEFAULT` | `#d7dce5` | Standard borders |
| `border.soft` | `#c8ced8` | Hover emphasis |
| `border.strong` | `#b8bec9` | Strong dividers |

---

## 3. Color — text (operational)

| Token | Hex | Tailwind | Use |
|-------|-----|----------|-----|
| `operational.text` | `#0f172a` | `text-operational-text` | Primary body |
| `operational.secondary` | `#1e293b` | `text-operational-secondary` | Secondary |
| `operational.muted` | `#334155` | `text-operational-muted` | Muted labels |

**Light theme body:** `text-slate-900` at 16px base.

---

## 4. Color — accent & actions

| Token | Hex | Use |
|-------|-----|-----|
| `accent.DEFAULT` | `#1d4ed8` | Primary buttons |
| `accent.muted` | `#1e40af` | Primary hover |
| Button primary | `bg-blue-700` → `hover:bg-blue-800` | `.btn-primary` |

---

## 5. Color — priority

| Token | Hex | Use |
|-------|-----|-----|
| `priority.high` | `#b45309` | High priority |
| `priority.urgent` | `#b91c1c` | Urgent |
| `priority.normal` | `#64748b` | Normal |
| `priority.done` | `#15803d` | Completed |

Background variants: `priority.*-bg` at 8% opacity.

---

## 6. Color — status & signals

| Token | Hex | Class prefix |
|-------|-----|--------------|
| OK | `#16a34a` | `status.ok` |
| Warn | `#d97706` | `status.warn` |
| Error | `#dc2626` | `status.error` |
| Info | `#0284c7` | `status.info` |

### Signal left borders

| Signal | Color | Class |
|--------|-------|-------|
| Overdue / critical | red-700 | `task-signal-overdue`, `signal-pattern-overdue` |
| Escalation / hot | amber-700 | `task-signal-hot`, `signal-pattern-escalation` |
| Waiting | slate-700 | `task-signal-waiting` |
| Blocked | orange-700 | `task-signal-blocked` |
| Neutral | transparent | `task-signal-neutral` |

### Dominant signal text

| Class | Color |
|-------|-------|
| `dominant-critical` | red-700 |
| `dominant-escalation` | amber-700 |
| `dominant-overdue` | amber-700 |

---

## 7. Color — focus chips

| State | Border | Background | Text |
|-------|--------|------------|------|
| Active | amber-300 | amber-50 | amber-900 |
| Muted | border | surface-raised | operational-muted |

---

## 8. Typography

| Token | Size | Line height | Use |
|-------|------|-------------|-----|
| `operational-base` | 16px | 1.5 | Body default |
| `operational-sm` | 14px | 1.45 | Meta, controls |
| `operational-menu` | 15px | 1.4 | Sidebar nav |

### Element mapping

| Element | Classes |
|---------|---------|
| Page title | `text-2xl font-semibold text-slate-900` |
| Card title | `text-base font-semibold leading-6 text-slate-900` |
| Card operational line | `text-sm font-medium leading-5 text-slate-800` |
| Passive meta | `text-sm font-medium text-slate-700` |
| Panel header | `text-sm font-semibold tracking-wide` |
| Filter tab | `task-filter-tab` (see CSS) |
| Status bar | `text-xs` / `text-sm` compact |

**Font family:** `'Segoe UI', system-ui, -apple-system, sans-serif`

---

## 9. Spacing & sizing

| Token | Value |
|-------|-------|
| `minWidth.shell` | 1366px |
| `width.detail` | 400px |
| Card min height | 3.125rem (50px) |
| Button min height | 2.25rem |
| Action zone width | 4.75rem |
| Icon action slot | 1.75rem (h-7 w-7) |

---

## 10. Radius & shadow

| Element | Radius | Shadow |
|---------|--------|--------|
| Panel | `rounded-lg` | `shadow-sm shadow-gray-300/40` |
| Main canvas | `rounded-xl` | `shadow-sm shadow-gray-300/30` |
| Card | `rounded-md` | `shadow-sm shadow-gray-300/35` |
| Button | `rounded-md` | none |
| Focus chip | `rounded-lg` | none |

---

## 11. Motion

| Property | Value |
|----------|-------|
| Card hover | `transition-colors duration-150` |
| Action fade | `opacity-0 → group-hover:opacity-100` |
| Theme switch | instant class toggle on `html.theme-light` / `theme-dark` |

---

## 12. CSS component classes (reference)

Implementers must use existing classes — do not duplicate with inline styles:

```
.panel, .panel-header, .panel-body
.main-canvas
.btn, .btn-primary, .btn-ghost, .btn-card-action
.task-card-compact, .task-card-scan-row, .task-card-focused
.operational-control-strip, .operational-control-focus
.task-filter-tab, .task-filter-tab-active
.sidebar-shell, .sidebar-nav-link, .sidebar-nav-link.active
.detail-panel-aside
.runtime-status-bar (see RuntimeStatusBar)
```

---

## 13. Theme contract

| Mode | Root class | Default |
|------|------------|---------|
| Light | `html.theme-light` | **yes** (operational) |
| Dark | `html.theme-dark` | optional toggle |

`color-scheme: light` / `dark` set on html element.

---

## 14. Token change policy

- New tokens require update to this file + `tailwind.config.ts`.
- Do not introduce one-off hex values in components when a token exists.
- Signal colors are semantic — do not repurpose for decoration.
