# UX Audit Report — CBV PRO Level

**Ngày:** 2025-03-18  
**Phạm vi:** Form, Detail, Inline views — TASK, HO_SO, FINANCE

---

## 1. TỔNG QUAN

| Hạng mục | Trạng thái |
|----------|------------|
| Flat forms (form phẳng) | ⚠️ Phát hiện — cần nhóm |
| Quá nhiều fields hiển thị | ⚠️ Có thể — cần giảm |
| Thiếu grouping | ⚠️ Có — chưa áp dụng |
| Thứ tự xấu | ⚠️ Có — chưa theo business flow |
| Icon không nhất quán | ⚠️ Có — chưa có icon map |
| Inline readonly | ⚠️ TASK_UPDATE_LOG, FINANCE_LOG cần disable Add |

---

## 2. FLAT FORMS DETECTED

**Vấn đề:** Form hiển thị tất cả cột theo thứ tự database — không nhóm logic.

| Form | Fields visible (ước tính) | Rủi ro |
|------|---------------------------|--------|
| TASK_FORM | 20+ nếu không ẩn | Overwhelming |
| HO_SO_FORM | 19+ | Khó quét |
| FINANCE_FORM | 22+ | Quá nhiều |

**Fix:** Áp dụng APPSHEET_VIEW_UX_MAP.md — nhóm 1-7, ẩn hệ thống.

---

## 3. TOO MANY FIELDS

| Form | Khuyến nghị | Hiện tại (nếu chưa áp dụng) |
|------|-------------|-----------------------------|
| TASK_FORM | 10 fields | 20+ |
| HO_SO_FORM | 14 fields | 19 |
| FINANCE_FORM | 12 fields | 22+ |

**Rule:** Form chính ≤ 12 fields visible. Rest = hidden hoặc progressive disclosure.

---

## 4. MISSING GROUPING

| Form | Nhóm thiếu |
|------|------------|
| TASK_FORM | Thông tin chính / Phân loại / Người / Thời gian |
| HO_SO_FORM | Thông tin chính / Liên hệ / Định danh |
| FINANCE_FORM | Phân loại / Số tiền / Đối tác / Thanh toán |

**Fix:** APPSHEET_GROUP_STRUCTURE.md — áp dụng pattern.

---

## 5. BAD ORDERING

**Vấn đề:** CREATED_AT, ID có thể xuất hiện giữa form; STATUS có thể trước TITLE.

**Chuẩn:**
- TITLE / NAME đầu tiên
- Phân loại (TYPE, PRIORITY) trước ngày
- Người (OWNER_ID) trước thời gian
- Hệ thống (ID, CREATED_*) ẩn hoặc cuối

**Fix:** APPSHEET_FIELD_ORDER_MAP.csv — DISPLAY_ORDER.

---

## 6. ICON INCONSISTENCY

**Vấn đề:** Chưa có icon map; icon random hoặc không có.

**Fix:** APPSHEET_ICON_MAP.csv — cùng field = cùng icon toàn hệ thống.

| Field | Icon | Ý nghĩa |
|-------|------|---------|
| TITLE | 📝 | Tiêu đề |
| OWNER_ID | 👑 | Chủ task |
| AMOUNT | 💰 | Số tiền |
| STATUS | 🔄 | Trạng thái |

---

## 7. INLINE VIEW ISSUES

| Inline | Vấn đề | Fix |
|--------|--------|-----|
| TASK_UPDATE_LOG | Có thể Add — sai | Disable Add; readonly |
| FINANCE_LOG | Có thể Add — sai | Disable Add; readonly |
| TASK_CHECKLIST | Quá nhiều field khi Add | Chỉ TITLE, IS_REQUIRED |
| TASK_ATTACHMENT | Thiếu FILE_URL nổi bật | FILE_URL = upload chính |

---

## 8. CONDITIONAL SHOW GAPS

| Field | Nên ẩn khi | Hiện tại |
|-------|-----------|----------|
| RESULT_NOTE | STATUS <> DONE | Có thể luôn hiện |
| DONE_AT | STATUS <> DONE | Có thể luôn hiện |
| CONFIRMED_AT, CONFIRMED_BY | STATUS <> CONFIRMED | Có thể luôn hiện |
| FINANCE business fields | STATUS = CONFIRMED | Editable_If đã có |

**Fix:** Show_If cho RESULT_NOTE, DONE_AT, CONFIRMED_*.

---

## 9. USER FLOW GAPS

**Tạo task nhanh:** User cần 6 fields — TITLE, TASK_TYPE, PRIORITY, OWNER_ID, START_DATE, DUE_DATE. Nếu form yêu cầu 15+ fields → flow bị phá.

**Fix:** Form chỉ hiện 10 fields chính; DESCRIPTION, RELATED_* optional.

---

## 10. KHUYẾN NGHỊ ƯU TIÊN

| # | Hành động | Ưu tiên |
|---|-----------|---------|
| 1 | Áp dụng APPSHEET_FIELD_ORDER_MAP — sắp xếp cột | Cao |
| 2 | Ẩn cột hệ thống (ID, CREATED_*, UPDATED_*) | Cao |
| 3 | Áp dụng APPSHEET_ICON_MAP — gán icon | Trung bình |
| 4 | Disable Add cho TASK_UPDATE_LOG, FINANCE_LOG | Cao |
| 5 | Show_If cho RESULT_NOTE, DONE_AT, CONFIRMED_* | Trung bình |
| 6 | Giảm fields TASK_FORM xuống ≤ 10 | Cao |

---

## 11. KẾT LUẬN

| Hạng mục | Trạng thái |
|----------|------------|
| Artifacts tạo | ✓ APPSHEET_VIEW_UX_MAP, FIELD_ORDER_MAP, ICON_MAP, GROUP_STRUCTURE, MANUAL_UX_CHECKLIST |
| Flat forms | ⚠️ Cần áp dụng nhóm |
| Too many fields | ⚠️ Cần giảm |
| Icon | ⚠️ Cần gán theo map |
| Inline readonly | ⚠️ Cần disable Add |

**Sau khi áp dụng:** Form đơn giản, Detail rõ ràng, flow tự nhiên → **CBV PRO UX level**.
