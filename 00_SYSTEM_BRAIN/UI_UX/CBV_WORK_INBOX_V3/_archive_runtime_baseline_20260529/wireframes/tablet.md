# Wireframe — Tablet (768–1365px)

**Screen:** WI_V3_INBOX_LIST · **Secondary — horizontal scroll acceptable**

---

## Layout strategy

V3 does **not** target tablet-first redesign. Shell retains `min-w-[1366px]` — tablet users scroll horizontally or use zoom.

```
┌──────────────────────────────────────────────────────────── viewport ────┐
│  ◄──────────── horizontal scroll if width < 1366 ────────────────►       │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ TOP BAR (full min-width)                                            │  │
│  ├────────┬───────────────────────────────────────────┬───────────────┤  │
│  │Sidebar │ MAIN (list fills)                          │ DETAIL        │  │
│  │240px   │                                           │ 360-400px     │  │
│  │        │  Controls may wrap to 2 lines:            │ (if ≥1280)    │  │
│  │        │  [tabs...]                                 │               │  │
│  │        │  [group][quick focus][focus toggle]        │               │  │
│  │        │  Cards single column                       │               │  │
│  └────────┴───────────────────────────────────────────┴───────────────┘  │
│  STATUS BAR                                                               │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Breakpoint: 768–1279px (no side detail)

Detail panel moves to **bottom sheet** (same as mobile):

```
┌──────────────────────────────────────┐
│ TOP BAR                              │
├──────┬───────────────────────────────┤
│ Side │ LIST (full width)             │
│ bar  │                               │
│      │  [cards...]                   │
│      │                               │
├──────┴───────────────────────────────┤
│ STATUS BAR                           │
├──────────────────────────────────────┤
│ ▲ BOTTOM SHEET (when task selected)  │
│ │ Task title              [Đóng]    │
│ │ Next action / detail body...       │
│ │ (max 70vh scroll)                  │
└──────────────────────────────────────┘
```

---

## Control strip wrap

When control row exceeds width:

```
Row 1: [Việc của tôi] [Chờ xử lý] [Quá hạn] [Chờ duyệt]
Row 2: [Nhóm ▼]  [Quick focus chips...]  [Focus queue ☐]
Row 3: (context chips if not focus mode)
```

**Rule:** Filter tabs must remain visible — wrap secondary controls, not tabs.

---

## Touch targets

Minimum 44px touch height on:
- Filter tabs
- Focus queue toggle
- Card primary action
- Bottom sheet close

Use existing `min-h-[2.25rem]` button baseline.

---

## Constraints

- Do not collapse sidebar into drawer in V3
- Do not hide filter tabs
- Bottom sheet z-index 40 — above list, below modals

---

## Acceptance (tablet best-effort)

- [ ] Usable at 1024×768 with horizontal scroll
- [ ] Bottom sheet detail functional < xl
- [ ] Filter tabs tappable
- [ ] No control overlap with status bar
