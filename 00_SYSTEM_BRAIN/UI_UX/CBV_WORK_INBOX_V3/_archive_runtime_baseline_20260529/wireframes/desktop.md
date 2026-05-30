# Wireframe — Desktop (≥ 1366px)

**Screen:** WI_V3_INBOX_LIST · **Primary target for V3**

---

## Full shell — default inbox

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                                                   │
│ [≡ Module: Việc]                    [ 🔍 Tìm kiếm...          ] [Theme] [User ▼] [Logout]  │
├────────────┬─────────────────────────────────────────────────────────────┬───────────────┤
│ SIDEBAR    │ MAIN SCROLL REGION                                           │ DETAIL PANEL  │
│            │ ┌─ main-canvas ────────────────────────────────────────────┐ │ (xl: 400px)   │
│ Module     │ │                                                          │ │               │
│ launchpad  │ │  (OperationalAlertHeader — if stale/degraded)            │ │ ┌─ header ──┐ │
│            │ │                                                          │ │ │ Task title│ │
│ ─────────  │ │  ┌─ TaskControlSurface ───────────────────────────────┐  │ │ │     [ESC] │ │
│            │ │  │ [Việc của tôi][Chờ xử lý][Quá hạn][Chờ duyệt]      │  │ │ └───────────┘ │
│ 📋 Việc ●  │ │  │  | [Nhóm ▼] [All][Cần XL][Blocked][Team] [☐ Focus] │  │ │               │
│ 💰 Tài ch  │ │  │  (resume chip · recent · exec memory)                │  │ │ >>> Next act│ │
│ 📁 Hồ sơ   │ │  └────────────────────────────────────────────────────┘  │ │ [Nhận XL]   │ │
│            │ │                                                          │ │               │ │
│ ─────────  │ │  ┌─ Group: 🚨 Cần xử lý ngay ──────────────────────────┐  │ │ SLA / Due   │ │
│ ! Quá hạn  │ │  │ ▌🔴 Task title truncated...                          │  │ │ Owner: Name │ │
│            │ │  │   ⚠ Escalation · hạn 04/22 · Trần Thị B    [✓][→] │  │ │               │ │
│            │ │  │ ▌Task title two...                                   │  │ │ Timeline    │ │
│            │ │  │   Quá hạn · hạn 03/15 · Nguyễn Văn A      [✓][→] │  │ │ · update 1  │ │
│            │ │  └────────────────────────────────────────────────────┘  │ │ · update 2  │ │
│            │ │  ┌─ Group: 📋 Đang theo dõi ───────────────────────────┐  │ │               │ │
│            │ │  │ ▌...                                                  │  │ │ Files (n)   │ │
│            │ │  └────────────────────────────────────────────────────┘  │ │               │ │
│            │ └──────────────────────────────────────────────────────────┘ │               │ │
├────────────┴─────────────────────────────────────────────────────────────┴───────────────┤
│ RUNTIME STATUS BAR  │ 42 visible │ refresh 12s ago │ ● connected │ stale hint if any    │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Card row anatomy

```
┌──┬────────────────────────────────────────────────────────────┬────────────┐
│▌ │ Task title (16px semibold, truncate)                        │ [primary]  │
│  │ ⚠ Escalation · hạn MM/DD · Display Name (14px, 1 line)      │ [→] [⋯]   │
└──┴────────────────────────────────────────────────────────────┴────────────┘
 ▲ signal border (3px)                                          ▲ 4.75rem zone
```

---

## Selected task state

```
  >>> card: border highlight (task-card-focused)
  >>> detail panel populated
  >>> URL: /tasks/TSK_xxx?filter=mine
```

---

## Empty filter state

```
┌─ main-canvas ─────────────────────────────┐
│  [filter tabs active: Quá hạn]            │
│                                           │
│         (empty state illustration)        │
│         Không có việc quá hạn              │
│         Thử đổi bộ lọc hoặc quick focus   │
│                                           │
└───────────────────────────────────────────┘
```

---

## Notes

- FocusStrip **not shown** on `/tasks` (inbox has own controls)
- Sidebar always visible — no hamburger collapse on desktop
- Detail panel hidden below xl — see `mobile.md` for bottom sheet
