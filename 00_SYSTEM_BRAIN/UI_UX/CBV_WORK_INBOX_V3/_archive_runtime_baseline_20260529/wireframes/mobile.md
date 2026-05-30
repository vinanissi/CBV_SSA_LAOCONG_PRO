# Wireframe — Mobile (< 768px)

**Screen:** WI_V3_INBOX_* · **Best-effort — not V3 primary target**

---

## Strategy

Mobile is **supported opportunistically** via bottom sheet detail and horizontal scroll shell. AppSheet remains the recommended mobile operator channel for high-frequency CRUD.

---

## View — list only (no selection)

```
┌─────────────────────────────┐
│ TOP BAR (compressed)        │
│ [Module] [🔍] [User]        │
├──────┬──────────────────────┤
│ Nav  │ ← scroll →           │
│ icon │  (min-w 1366 shell)  │
│ only │                      │
│ ?    │  OR full sidebar     │
│      │  scrolls horizontally│
├──────┴──────────────────────┤
│ STATUS BAR (compact)        │
└─────────────────────────────┘
```

**Note:** Current implementation keeps full sidebar — mobile UX is not optimized in V3.

---

## View — task selected (bottom sheet)

```
┌─────────────────────────────┐
│ TOP BAR                     │
├─────────────────────────────┤
│                             │
│  LIST (dimmed behind)       │
│  ┌─────────────────────┐    │
│  │ >>> focused card    │    │
│  └─────────────────────┘    │
│  ┌ dimmed cards ...    ┐    │
│                             │
├─────────────────────────────┤
│████████████████████████████│ ← bottom sheet (z-40)
│ Task title        [Đóng]   │
│────────────────────────────│
│ >>> Nhận xử lý             │
│ Due · Owner                │
│ Timeline (scroll)          │
│                             │
│ (max-height 70vh)          │
├─────────────────────────────┤
│ STATUS BAR                 │
└─────────────────────────────┘
```

---

## TopBar search (mobile)

```
[ 🔍 Tìm... ]  →  full width search on /search route
```

Submit navigates to `/search?q=` — same contract as desktop.

---

## Interactions

| Action | Mobile behavior |
|--------|-----------------|
| Tap card | Open bottom sheet + `/tasks/:id` |
| Tap Đóng | clearDetail(), navigate `/tasks` |
| Filter tab | Same as desktop (may wrap) |
| Inline action | In sheet or card zone — pending state preserved |
| Focus queue | Same toggle — dims list behind sheet |

---

## Mobile anti-patterns (forbidden in V3)

- Native app shell simulation
- Swipe-to-complete gestures
- Pull-to-refresh replacing status bar refresh
- Hiding status bar
- Separate mobile component tree

---

## Recommended operator path

For phones: **AppSheet TASK slices** (MY_OPEN, MY_TASKS) per `04_APPSHEET/` docs.

WebApp mobile = emergency access only in V3.

---

## Acceptance (best-effort)

- [ ] Bottom sheet opens without layout crash at 375px
- [ ] Close button reachable
- [ ] Primary action tappable
- [ ] No horizontal overflow on bottom sheet content
