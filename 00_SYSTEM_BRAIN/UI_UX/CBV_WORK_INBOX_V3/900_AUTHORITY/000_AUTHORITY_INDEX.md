# CBV_WORK_INBOX_V3 — Authority Index

**Pack ID:** `CBV_WORK_INBOX_V3_AUTHORITY`  
**Version:** 1.0  
**Date:** 2026-05-29  
**Standard:** CBV Operational Ecosystem Standard V1

---

## 1. Mục đích pack

Chuẩn hóa **một nguồn governance duy nhất** để:

1. Mô tả **hiện trạng runtime** (code thật).
2. Mô tả **thiết kế đích V3** (operator Work Inbox).
3. Chỉ rõ **ưu tiên nguồn sự thật** theo ngữ cảnh công việc.
4. Ngăn AI/FE đọc nhầm archive hoặc `/tasks` là thiết kế cuối.
5. **Không** thay đổi code trong phase authority.

---

## 2. Đọc theo vai trò

| Vai trò | Thứ tự đọc |
|---------|------------|
| **Cursor / AI agent** | `004_AI_READ_ORDER.md` → `006_COMMON_MISREAD_GUARDRAILS.md` |
| **FE developer (sửa code)** | `001_CURRENT_RUNTIME_TRUTH.md` → `005_MIGRATION_BOUNDARY.md` → `002_TARGET_DESIGN_TRUTH.md` |
| **PM / reviewer** | File này → `003_SOURCE_OF_TRUTH_MATRIX.md` |
| **QA** | `002` acceptance → `001` để biết chưa implement gì |

---

## 3. Tài liệu authority (normative cho governance)

| File | Trả lời câu hỏi |
|------|-----------------|
| [001_CURRENT_RUNTIME_TRUTH.md](./001_CURRENT_RUNTIME_TRUTH.md) | Hôm nay app **thực sự** làm gì? |
| [002_TARGET_DESIGN_TRUTH.md](./002_TARGET_DESIGN_TRUTH.md) | V3 **phải** trở thành gì? |
| [003_SOURCE_OF_TRUTH_MATRIX.md](./003_SOURCE_OF_TRUTH_MATRIX.md) | Khi conflict, tin ai? |
| [004_AI_READ_ORDER.md](./004_AI_READ_ORDER.md) | Agent đọc file nào, theo thứ tự nào? |
| [005_MIGRATION_BOUNDARY.md](./005_MIGRATION_BOUNDARY.md) | Khoảng cách runtime ↔ target |
| [006_COMMON_MISREAD_GUARDRAILS.md](./006_COMMON_MISREAD_GUARDRAILS.md) | Các lỗi hiểu nhầm cấm |

---

## 4. Tài liệu design contract (target specs)

Các file `../001_*.md` … `../013_*.md` là **đặc tả đích** — normative cho phase implementation, **không** mô tả đầy đủ code hiện tại.

| Path | Authority level |
|------|-----------------|
| `../001`–`../013`, `../wireframes/` | TARGET (future) |
| `../AI_IMPLEMENTATION_CONTRACT.md` + `../AI_AUTHORITY_ADDENDUM.md` | TARGET + governance binding |
| `../_archive_runtime_baseline_20260529/` | HISTORICAL SNAPSHOT — không dùng làm target |

---

## 5. Code là runtime truth tối thượng (hành vi)

Khi docs và code lệch nhau về **hành vi đang chạy**:

```text
apps/workboard/src/**  >  AUTHORITY/001_CURRENT_RUNTIME_TRUTH.md  >  mọi doc khác
```

Khi lập kế hoạch **thay đổi** hành vi:

```text
AUTHORITY/002_TARGET_DESIGN_TRUTH.md  +  001–013  >  code (sau khi có decision note + phase FE)
```

---

## 6. Verdict nhanh cho agent

| Câu hỏi | Trả lời |
|---------|---------|
| Default route hôm nay? | `/` → OperationalHome; inbox thực tế: **`/tasks`** |
| Default route V3 target? | **`/inbox`** |
| Grouping mặc định hôm nay? | **`cognition`** (`?group=cognition`) |
| Grouping V3 target? | **Need Action / Waiting / Follow Up / Completed** |
| Focus hôm nay? | `focusQueueMode` — dim nhiều card (session) |
| Focus V3 target? | **Một task** — full screen panel |
| Được sửa code trong phase authority? | **KHÔNG** |

---

## 7. Phase tiếp theo

```text
PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION
```

Chỉ bắt đầu sau khi agent/human xác nhận đã đọc pack authority này.
