# AppSheet Display Name Policy — CBV_SSA_LAOCONG_PRO

**Mục tiêu:** Chuyển tất cả tên cột kỹ thuật thành nhãn tiếng Việt dễ đọc cho giao diện AppSheet.

---

## 1. NGUYÊN TẮC ĐẶT TÊN

### RULE 1 — KHÔNG ĐỔI TÊN CỘT TRONG DATABASE

- Chỉ thiết lập **Display Name** trong AppSheet
- Không đổi tên cột trong Google Sheets
- Tên cột (COLUMN_NAME) giữ nguyên trong schema

### RULE 2 — DISPLAY NAME PHẢI DỄ ĐỌC

- Không dùng snake_case, ALL_CAPS
- Dùng tiếng Việt phù hợp vận hành
- Bỏ hậu tố _ID, _AT, _BY khi không cần thiết

### RULE 3 — NHẤT QUÁN TOÀN HỆ THỐNG

| Khái niệm | Display Name | Bảng áp dụng |
|-----------|--------------|--------------|
| Chủ task / người phụ trách | Chủ task / Người phụ trách | TASK_MAIN, HO_SO_MASTER |
| Người tạo | Người tạo | TASK_MAIN.REPORTER_ID |
| Người thực hiện | Người thực hiện | TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG |
| Người duyệt | Người duyệt | FINANCE_TRANSACTION.CONFIRMED_BY |
| Người hoàn thành | Người hoàn thành | TASK_CHECKLIST.DONE_BY |
| Trạng thái | Trạng thái | Tất cả STATUS |
| Mức độ ưu tiên | Mức độ ưu tiên | TASK_MAIN.PRIORITY |

### RULE 4 — BỎ NHIỄU KỸ THUẬT

- OWNER_ID → Chủ task / Người phụ trách
- REPORTER_ID → Người tạo
- CREATED_AT → Thời điểm tạo
- DONE_BY → Người hoàn thành

### RULE 5 — TỪ VỰNG VẬN HÀNH

| Tiếng Anh | Tiếng Việt |
|-----------|------------|
| Owner | Chủ task / Người phụ trách |
| Reporter | Người tạo |
| Assignee | Người thực hiện |
| Confirmer | Người duyệt |
| Created by | Người tạo (hệ thống) |
| Updated by | Người cập nhật |
| Done by | Người hoàn thành |

### RULE 6 — CHUẨN HÓA NGÀY GIỜ

| Pattern | Display Name |
|---------|--------------|
| *_AT | Thời điểm ... |
| *_DATE | Ngày ... |
| CREATED_AT | Thời điểm tạo |
| UPDATED_AT | Thời điểm cập nhật |
| DONE_AT | Thời điểm hoàn thành |
| START_DATE | Ngày bắt đầu |
| DUE_DATE | Hạn hoàn thành |
| END_DATE | Ngày kết thúc |

### RULE 7 — STATUS / ENUM

| Column | Display Name |
|--------|--------------|
| STATUS | Trạng thái |
| PRIORITY | Mức độ ưu tiên |
| TASK_TYPE | Loại công việc |
| ATTACHMENT_TYPE | Loại đính kèm |

---

## 2. TỪ ĐIỂN CHUẨN

### Cột hệ thống (thường ẩn)

| Column | Display Name |
|--------|--------------|
| ID | Mã [bảng] |
| CREATED_AT | Thời điểm tạo |
| CREATED_BY | Người tạo (hệ thống) |
| UPDATED_AT | Thời điểm cập nhật |
| UPDATED_BY | Người cập nhật |
| IS_DELETED | Đã xóa |

### Cột vai trò / người

| Column | Display Name |
|--------|--------------|
| OWNER_ID | Chủ task / Người phụ trách |
| REPORTER_ID | Người tạo |
| DONE_BY | Người hoàn thành |
| CONFIRMED_BY | Người duyệt |
| ACTOR_ID | Người thực hiện |
| CREATED_BY | Người tạo |
| UPDATED_BY | Người cập nhật |

### Cột file / đính kèm

| Column | Display Name |
|--------|--------------|
| FILE_URL | Tệp đính kèm / Tệp hồ sơ / Tệp chứng từ |
| FILE_NAME | Tên file |
| ATTACHMENT_TYPE | Loại đính kèm / Loại chứng từ |

### Cột nghiệp vụ chung

| Column | Display Name |
|--------|--------------|
| TITLE | Tiêu đề / Nội dung checklist |
| DESCRIPTION | Mô tả |
| NOTE | Ghi chú |
| AMOUNT | Số tiền |
| CATEGORY | Loại thu/chi |

---

## 3. ĐÚNG vs SAI

### Sai (không dùng)

| Sai | Lý do |
|-----|-------|
| OWNER_ID | Kỹ thuật, không dễ đọc |
| created_at | Tiếng Anh, snake_case |
| STATUS_ID | Hậu tố thừa |
| Người tạo task | Dài, không nhất quán |

### Đúng

| Đúng | Ghi chú |
|------|---------|
| Chủ task | Ngắn gọn, rõ nghĩa |
| Thời điểm tạo | Tự nhiên |
| Trạng thái | Nhất quán |
| Người tạo | Dùng cho REPORTER_ID |

---

## 4. MODULE-SPECIFIC

### TASK

- OWNER_ID → Chủ task
- REPORTER_ID → Người tạo
- DONE_BY → Người hoàn thành
- PROGRESS_PERCENT → Tiến độ (%)

### HO_SO

- OWNER_ID → Người phụ trách
- HTX_ID → Hợp tác xã
- ID_NO → Số CMND/CCCD

### FINANCE

- CONFIRMED_BY → Người duyệt
- AMOUNT → Số tiền
- CATEGORY → Loại thu/chi

### MASTER_CODE (Admin)

- SHORT_NAME → Tên ngắn / Email (USER = email)
- PARENT_CODE → Mã cha / Vai trò (USER = role)

---

## 5. ÁP DỤNG

1. Dùng APPSHEET_DISPLAY_NAME_MAP.csv làm nguồn
2. Trong AppSheet: Data → Columns → [Table] → [Column] → Display Name
3. Không đổi Column Name
4. Kiểm tra trên Form, Detail, List view
