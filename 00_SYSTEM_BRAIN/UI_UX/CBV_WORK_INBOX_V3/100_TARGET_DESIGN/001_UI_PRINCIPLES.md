# CBV Work Inbox V3 — UI Principles

**Contract:** CBV_WORK_INBOX_V3  
**Standard:** CBV Operational Ecosystem Standard V1  
**Status:** Target design contract (implementation phase separate)

---

## Core Philosophy

CBV_WORK_INBOX_V3 không phải là Task Management System.

Đây là **Work Inbox** cho nhân sự vận hành.

Người dùng phải trả lời được trong 2 giây:

1. Tôi cần làm gì?
2. Việc nào quan trọng nhất?
3. Tôi bấm ở đâu?

---

## Design Direction

- Operator-first
- Action-first
- Mobile-ready
- Reduce cognitive load
- Hide technical/runtime details from normal users
- Admin/runtime/debug information must not appear by default

---

## Ecosystem alignment (bắt buộc)

| Principle | Application |
|-----------|-------------|
| Runtime-first | GAS/Sheet + API envelope là nguồn sự thật; UI không bịa trạng thái |
| Memory-first | Working context, focus progress, resume flow — append-only session memory |
| Append-only | Timeline, comments, audit — không xóa/sửa lịch sử trên UI Operator |
| Manual-first → auto-later | Hành động do người bấm; không auto-assign/resolve/escalate |
| Không phá runtime hiện hữu | Refactor theo phase; giữ envelope/route cũ cho đến khi migration có decision note |

---

## Do

- Hiển thị việc cần làm ngay
- Ưu tiên trạng thái dễ hiểu
- Dùng chip trạng thái rõ ràng
- Dùng action button nổi bật
- Dùng Focus Mode cho người dễ bị phân tán
- Dùng deep-link sang module liên quan

---

## Do Not

- Không đưa Cognition ra mặc định
- Không đưa SLA kỹ thuật ra mặc định
- Không hiển thị runtime internals với Operator
- Không tạo menu nhiều tầng
- Không để quá nhiều filter trên màn hình chính
- Không bắt người dùng hiểu cấu trúc dữ liệu nội bộ

---

## Baseline note

Bản mô tả runtime hiện tại (`/tasks`, cognition grouping) được lưu tại:

`_archive_runtime_baseline_20260529/`

Implementation phase phải có **decision note** khi chuyển route `/tasks` → `/inbox` và IA mới.
