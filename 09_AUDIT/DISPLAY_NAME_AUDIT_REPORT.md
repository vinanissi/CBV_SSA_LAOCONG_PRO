# Display Name Audit Report — CBV_SSA_LAOCONG_PRO

**Ngày:** 2025-03-18  
**Phạm vi:** Tất cả cột trong TASK, HO_SO, FINANCE, MASTER_CODE, ENUM_DICTIONARY, ADMIN_AUDIT_LOG

---

## 1. TỔNG QUAN

| Hạng mục | Số lượng |
|----------|----------|
| Bảng | 13 |
| Cột | 171 |
| Cột đã map Display Name | 171 |
| Cột còn technical name | 0 (sau khi áp dụng) |

---

## 2. CỘT CÒN DÙNG TÊN KỸ THUẬT (TRƯỚC KHI ÁP DỤNG)

Nếu AppSheet chưa thiết lập Display Name, các cột sau sẽ hiển thị tên kỹ thuật:

| Bảng | Cột | Rủi ro UX |
|------|-----|------------|
| TASK_MAIN | OWNER_ID, REPORTER_ID | Người dùng không hiểu |
| TASK_MAIN | RELATED_ENTITY_TYPE, RELATED_ENTITY_ID | Quá kỹ thuật |
| TASK_MAIN | PROGRESS_PERCENT, IS_DELETED | Không thân thiện |
| TASK_CHECKLIST | IS_REQUIRED, IS_DONE, DONE_BY | Khó đọc |
| HO_SO_MASTER | HTX_ID, OWNER_ID, ID_NO | Không rõ nghĩa |
| FINANCE_TRANSACTION | CONFIRMED_BY, REFERENCE_NO | Kỹ thuật |
| MASTER_CODE | SHORT_NAME, PARENT_CODE, IS_SYSTEM | Admin khó hiểu |
| ENUM_DICTIONARY | ENUM_GROUP, ENUM_VALUE, IS_ACTIVE | Kỹ thuật |

---

## 3. NHẤT QUÁN GIỮA CÁC MODULE

### 3.1 Đã chuẩn hóa

| Khái niệm | Display Name | Bảng |
|-----------|--------------|------|
| Chủ / Người phụ trách | Chủ task / Người phụ trách | TASK_MAIN, HO_SO_MASTER |
| Người tạo | Người tạo | TASK_MAIN.REPORTER_ID, CREATED_BY |
| Người thực hiện | Người thực hiện | TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG |
| Người duyệt | Người duyệt | FINANCE_TRANSACTION.CONFIRMED_BY |
| Người hoàn thành | Người hoàn thành | TASK_CHECKLIST.DONE_BY |
| Trạng thái | Trạng thái | Tất cả STATUS |
| Thời điểm tạo | Thời điểm tạo | CREATED_AT |
| Ghi chú | Ghi chú | NOTE |

### 3.2 Khác biệt có chủ đích

| Module | Context | Display Name |
|--------|---------|--------------|
| TASK | OWNER_ID | Chủ task |
| HO_SO | OWNER_ID | Người phụ trách |
| TASK | FILE_URL | Tệp đính kèm |
| HO_SO | FILE_URL | Tệp hồ sơ |
| FINANCE | FILE_URL | Tệp chứng từ |

Lý do: Ngữ cảnh nghiệp vụ khác nhau; tên phù hợp từng module.

---

## 4. TRÙNG NGHĨA / KHÁC NHÃN

| Cột | Ý nghĩa | Display Name | Ghi chú |
|-----|---------|--------------|---------|
| REPORTER_ID | Người tạo task | Người tạo | OK |
| CREATED_BY | Người tạo (hệ thống) | Người tạo (hệ thống) | Phân biệt với REPORTER_ID |
| ACTOR_ID | Người thực hiện hành động | Người thực hiện | OK |
| DONE_BY | Người hoàn thành checklist | Người hoàn thành | OK |
| CONFIRMED_BY | Người duyệt giao dịch | Người duyệt | OK |

Không có trùng nghĩa gây nhầm lẫn.

---

## 5. KHUYẾN NGHỊ SỬA

### 5.1 Ưu tiên cao

1. **Áp dụng APPSHEET_DISPLAY_NAME_MAP.csv** — Thiết lập Display Name cho tất cả cột theo checklist
2. **Ẩn cột hệ thống** — ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED, DRIVE_FILE_ID, BEFORE_JSON, AFTER_JSON
3. **Kiểm tra Form** — Đảm bảo Form không hiển thị cột kỹ thuật

### 5.2 Ưu tiên trung bình

1. **Ref columns** — OWNER_ID, REPORTER_ID, DONE_BY, CONFIRMED_BY: Display Name áp dụng cho header của cột; giá trị hiển thị lấy từ DISPLAY_TEXT của bảng target
2. **Inline views** — Đảm bảo TASK_ID, HO_SO_ID, FINANCE_ID khi inline có Display Name phù hợp (hoặc ẩn)

### 5.3 Ưu tiên thấp

1. **Cột ADMIN** — MASTER_CODE, ENUM_DICTIONARY: Có thể giữ tên kỹ thuật hơn cho admin; nhưng vẫn nên dùng Display Name cho dễ đọc

---

## 6. PATTERN TỰ ĐỘNG (CHO CỘT MỚI)

Khi thêm cột mới, áp dụng:

| Pattern | Display Name |
|---------|--------------|
| *_ID | Chuyển thành vai trò/đối tượng (VD: OWNER_ID → Chủ task) |
| *_AT | Thời điểm ... |
| *_DATE | Ngày ... |
| IS_* | Có ... / Đã ... (VD: IS_DONE → Đã hoàn thành) |
| *_BY | Người ... |
| TOTAL | Tổng ... |
| COUNT | Số lượng ... |

---

## 7. KẾT LUẬN

| Hạng mục | Trạng thái |
|----------|------------|
| Bản đồ Display Name | ✓ Hoàn thành (APPSHEET_DISPLAY_NAME_MAP.csv) |
| Chính sách đặt tên | ✓ Hoàn thành (APPSHEET_DISPLAY_NAME_POLICY.md) |
| Checklist thủ công | ✓ Hoàn thành (APPSHEET_MANUAL_RENAME_CHECKLIST.md) |
| Nhất quán giữa module | ✓ Đã chuẩn hóa |
| Sẵn sàng áp dụng | ✓ Có |

**Hành động:** Áp dụng theo APPSHEET_MANUAL_RENAME_CHECKLIST.md. Sau khi áp dụng, không còn cột nào hiển thị tên kỹ thuật trong giao diện người dùng.
