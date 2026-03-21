# AppSheet Manual Rename Checklist — Display Name

**Mục đích:** Thiết lập Display Name cho tất cả cột trong AppSheet. Không đổi tên cột trong Google Sheets.

**Nguồn:** APPSHEET_DISPLAY_NAME_MAP.csv

---

## BƯỚC 0 — CHUẨN BỊ

- [ ] Mở AppSheet Editor
- [ ] Mở file APPSHEET_DISPLAY_NAME_MAP.csv (hoặc in ra)
- [ ] Vào **Data → Columns**

---

## BƯỚC 1 — TASK_MAIN

Vào Data → Columns → TASK_MAIN. Với mỗi cột, bấm vào cột → **Display Name** → nhập giá trị:

| Column | Display Name |
|--------|--------------|
| ID | Mã task |
| TASK_CODE | Mã công việc |
| TITLE | Tiêu đề |
| DESCRIPTION | Mô tả |
| TASK_TYPE | Loại công việc |
| STATUS | Trạng thái |
| PRIORITY | Mức độ ưu tiên |
| OWNER_ID | Chủ task |
| REPORTER_ID | Người tạo |
| RELATED_ENTITY_TYPE | Loại liên quan |
| RELATED_ENTITY_ID | Đối tượng liên quan |
| START_DATE | Ngày bắt đầu |
| DUE_DATE | Hạn hoàn thành |
| DONE_AT | Thời điểm hoàn thành |
| PROGRESS_PERCENT | Tiến độ (%) |
| RESULT_NOTE | Kết quả |
| CREATED_AT | Thời điểm tạo |
| CREATED_BY | Người tạo (hệ thống) |
| UPDATED_AT | Thời điểm cập nhật |
| UPDATED_BY | Người cập nhật |
| IS_DELETED | Đã xóa |

- [ ] Đã thiết lập xong TASK_MAIN

---

## BƯỚC 2 — TASK_CHECKLIST

| Column | Display Name |
|--------|--------------|
| ID | Mã checklist |
| TASK_ID | Công việc |
| ITEM_NO | Số thứ tự |
| SORT_ORDER | Thứ tự hiển thị |
| TITLE | Nội dung checklist |
| IS_REQUIRED | Bắt buộc |
| IS_DONE | Đã hoàn thành |
| DONE_AT | Thời điểm hoàn thành |
| DONE_BY | Người hoàn thành |
| NOTE | Ghi chú |
| CREATED_AT | Thời điểm tạo |
| CREATED_BY | Người tạo |

- [ ] Đã thiết lập xong TASK_CHECKLIST

---

## BƯỚC 3 — TASK_UPDATE_LOG

| Column | Display Name |
|--------|--------------|
| ID | Mã log |
| TASK_ID | Công việc |
| ACTION | Hành động |
| OLD_STATUS | Trạng thái cũ |
| NEW_STATUS | Trạng thái mới |
| NOTE | Ghi chú |
| ACTOR_ID | Người thực hiện |
| CREATED_AT | Thời điểm |

- [ ] Đã thiết lập xong TASK_UPDATE_LOG

---

## BƯỚC 4 — TASK_ATTACHMENT

| Column | Display Name |
|--------|--------------|
| ID | Mã đính kèm |
| TASK_ID | Công việc |
| ATTACHMENT_TYPE | Loại đính kèm |
| TITLE | Tiêu đề |
| FILE_NAME | Tên file |
| FILE_URL | Tệp đính kèm |
| DRIVE_FILE_ID | ID Drive |
| NOTE | Ghi chú |
| CREATED_AT | Thời điểm tải lên |
| CREATED_BY | Người tải lên |

- [ ] Đã thiết lập xong TASK_ATTACHMENT

---

## BƯỚC 5 — HO_SO_MASTER

| Column | Display Name |
|--------|--------------|
| ID | Mã hồ sơ |
| HO_SO_TYPE | Loại hồ sơ |
| CODE | Mã |
| NAME | Tên hồ sơ |
| STATUS | Trạng thái |
| HTX_ID | Hợp tác xã |
| OWNER_ID | Người phụ trách |
| PHONE | Số điện thoại |
| EMAIL | Email |
| ID_NO | Số CMND/CCCD |
| ADDRESS | Địa chỉ |
| START_DATE | Ngày bắt đầu |
| END_DATE | Ngày kết thúc |
| NOTE | Ghi chú |
| TAGS | Nhãn |
| CREATED_AT | Thời điểm tạo |
| CREATED_BY | Người tạo |
| UPDATED_AT | Thời điểm cập nhật |
| UPDATED_BY | Người cập nhật |
| IS_DELETED | Đã xóa |

- [ ] Đã thiết lập xong HO_SO_MASTER

---

## BƯỚC 6 — HO_SO_FILE

| Column | Display Name |
|--------|--------------|
| ID | Mã file |
| HO_SO_ID | Hồ sơ |
| FILE_GROUP | Nhóm file |
| FILE_NAME | Tên file |
| FILE_URL | Tệp hồ sơ |
| DRIVE_FILE_ID | ID Drive |
| STATUS | Trạng thái |
| NOTE | Ghi chú |
| CREATED_AT | Thời điểm tải lên |
| CREATED_BY | Người tải lên |

- [ ] Đã thiết lập xong HO_SO_FILE

---

## BƯỚC 7 — HO_SO_RELATION

| Column | Display Name |
|--------|--------------|
| ID | Mã quan hệ |
| FROM_HO_SO_ID | Hồ sơ gốc |
| TO_HO_SO_ID | Hồ sơ đích |
| RELATION_TYPE | Loại quan hệ |
| START_DATE | Ngày bắt đầu |
| END_DATE | Ngày kết thúc |
| STATUS | Trạng thái |
| NOTE | Ghi chú |
| CREATED_AT | Thời điểm tạo |
| CREATED_BY | Người tạo |

- [ ] Đã thiết lập xong HO_SO_RELATION

---

## BƯỚC 8 — FINANCE_TRANSACTION

| Column | Display Name |
|--------|--------------|
| ID | Mã giao dịch |
| TRANS_CODE | Mã phiếu |
| TRANS_DATE | Ngày giao dịch |
| TRANS_TYPE | Loại (Thu/Chi) |
| STATUS | Trạng thái |
| CATEGORY | Loại thu/chi |
| AMOUNT | Số tiền |
| UNIT_ID | Đơn vị |
| COUNTERPARTY | Đối tác |
| PAYMENT_METHOD | Phương thức thanh toán |
| REFERENCE_NO | Số chứng từ |
| RELATED_ENTITY_TYPE | Loại liên quan |
| RELATED_ENTITY_ID | Đối tượng liên quan |
| DESCRIPTION | Mô tả |
| EVIDENCE_URL | Link chứng từ |
| CONFIRMED_AT | Thời điểm duyệt |
| CONFIRMED_BY | Người duyệt |
| CREATED_AT | Thời điểm tạo |
| CREATED_BY | Người tạo |
| UPDATED_AT | Thời điểm cập nhật |
| UPDATED_BY | Người cập nhật |
| IS_DELETED | Đã xóa |

- [ ] Đã thiết lập xong FINANCE_TRANSACTION

---

## BƯỚC 9 — FINANCE_ATTACHMENT

| Column | Display Name |
|--------|--------------|
| ID | Mã đính kèm |
| FINANCE_ID | Giao dịch |
| ATTACHMENT_TYPE | Loại chứng từ |
| TITLE | Tiêu đề |
| FILE_NAME | Tên file |
| FILE_URL | Tệp chứng từ |
| DRIVE_FILE_ID | ID Drive |
| NOTE | Ghi chú |
| CREATED_AT | Thời điểm tải lên |
| CREATED_BY | Người tải lên |

- [ ] Đã thiết lập xong FINANCE_ATTACHMENT

---

## BƯỚC 10 — FINANCE_LOG

| Column | Display Name |
|--------|--------------|
| ID | Mã log |
| FIN_ID | Giao dịch |
| ACTION | Hành động |
| BEFORE_JSON | Dữ liệu trước |
| AFTER_JSON | Dữ liệu sau |
| NOTE | Ghi chú |
| ACTOR_ID | Người thực hiện |
| CREATED_AT | Thời điểm |

- [ ] Đã thiết lập xong FINANCE_LOG

---

## BƯỚC 11 — MASTER_CODE (Admin)

| Column | Display Name |
|--------|--------------|
| ID | Mã |
| MASTER_GROUP | Nhóm |
| CODE | Mã |
| NAME | Tên |
| DISPLAY_TEXT | Tên hiển thị |
| SHORT_NAME | Tên ngắn / Email |
| PARENT_CODE | Mã cha / Vai trò |
| STATUS | Trạng thái |
| SORT_ORDER | Thứ tự |
| IS_SYSTEM | Hệ thống |
| ALLOW_EDIT | Cho phép sửa |
| NOTE | Ghi chú |
| CREATED_AT | Thời điểm tạo |
| CREATED_BY | Người tạo |
| UPDATED_AT | Thời điểm cập nhật |
| UPDATED_BY | Người cập nhật |
| IS_DELETED | Đã xóa |

- [ ] Đã thiết lập xong MASTER_CODE

---

## BƯỚC 12 — ENUM_DICTIONARY (Admin)

| Column | Display Name |
|--------|--------------|
| ID | Mã |
| ENUM_GROUP | Nhóm enum |
| ENUM_VALUE | Giá trị |
| DISPLAY_TEXT | Tên hiển thị |
| SORT_ORDER | Thứ tự |
| IS_ACTIVE | Đang dùng |
| NOTE | Ghi chú |
| CREATED_AT | Thời điểm tạo |
| CREATED_BY | Người tạo |
| UPDATED_AT | Thời điểm cập nhật |
| UPDATED_BY | Người cập nhật |

- [ ] Đã thiết lập xong ENUM_DICTIONARY

---

## BƯỚC 13 — ADMIN_AUDIT_LOG (Admin)

| Column | Display Name |
|--------|--------------|
| ID | Mã |
| AUDIT_TYPE | Loại audit |
| ENTITY_TYPE | Loại đối tượng |
| ENTITY_ID | Mã đối tượng |
| ACTION | Hành động |
| BEFORE_JSON | Dữ liệu trước |
| AFTER_JSON | Dữ liệu sau |
| NOTE | Ghi chú |
| ACTOR_ID | Người thực hiện |
| CREATED_AT | Thời điểm |

- [ ] Đã thiết lập xong ADMIN_AUDIT_LOG

---

## BƯỚC 14 — KIỂM TRA UX

- [ ] Mở Form TASK: kiểm tra tiêu đề cột không còn technical
- [ ] Mở Detail TASK: kiểm tra tiêu đề cột
- [ ] Mở Form HO_SO: kiểm tra
- [ ] Mở Form FINANCE: kiểm tra
- [ ] Mở Form TASK_CHECKLIST (inline): kiểm tra
- [ ] Mở Form TASK_ATTACHMENT (inline): kiểm tra

---

## HOÀN THÀNH

- [ ] Tất cả 13 bảng đã thiết lập Display Name
- [ ] Không có cột nào còn hiển thị tên kỹ thuật
- [ ] Giao diện đọc được dễ dàng cho người vận hành
