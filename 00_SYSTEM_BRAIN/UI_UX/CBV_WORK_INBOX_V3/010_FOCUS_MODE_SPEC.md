# Focus Mode Spec

**Contract:** CBV_WORK_INBOX_V3

---

## Purpose

Focus Mode giúp nhân sự chỉ xử lý **1 việc** tại một thời điểm.

> **Khác** với runtime baseline “focus queue” (dim nhiều card): V3 Focus Mode = **single task surface**.

---

## Required Behavior

Khi bật Focus Mode:

- Chỉ hiển thị **1 task**
- Ẩn dashboard
- Ẩn filter
- Ẩn navigation phụ
- Hiển thị progress: `1 / N`
- Có nút quay lại Inbox

---

## Required Actions

```text
Hoàn thành
Chuyển tiếp
Tạm dừng
Việc trước
Việc tiếp
```

---

## Focus Card Must Show

- Tiêu đề task
- Mã task
- Trạng thái (chip)
- Hạn xử lý
- Người phụ trách
- Nút hành động chính (Mở xử lý / Hoàn thành)

---

## Forbidden

- Không hiển thị nhiều task trong Focus Mode
- Không hiển thị advanced filter trong Focus Mode
- Không tự động hoàn thành task
- Không auto-advance sau complete (operator chọn Việc tiếp)

---

## Navigation

| Control | Action |
|---------|--------|
| X / Quay lại Inbox | Exit focus → `/inbox` |
| Việc trước / Việc tiếp | Index trong queue đã lọc (Need Action first) |
| Progress `k / N` | Derived from visible queue at focus entry |

---

## Wireframe

See `wireframes/focus-mode.md`.

---

## Migration note

`apps/workboard` hiện có `focusQueueMode` (session dim). Implementation phase có thể:

1. Rename/replace thành V3 Focus Mode panel, hoặc
2. Giữ dim mode cho supervisor + V3 focus cho operator

Decision note required if both coexist.
