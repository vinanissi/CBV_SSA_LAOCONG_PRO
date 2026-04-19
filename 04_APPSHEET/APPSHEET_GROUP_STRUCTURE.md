# AppSheet Group Structure — CBV PRO

**Nguyên tắc:** Không form phẳng. Mọi form chia thành nhóm logic.

---

## 1. NHÓM CHUẨN (Áp dụng toàn hệ thống)

| Group ID | Tên | Mục đích | Ví dụ fields |
|----------|-----|----------|---------------|
| 1 | Thông tin chính | Thông tin cốt lõi | TITLE, NAME, DESCRIPTION |
| 2 | Phân loại | Loại, trạng thái, ưu tiên | TASK_TYPE, CATEGORY, PRIORITY, STATUS |
| 3 | Người phụ trách | Vai trò, người liên quan | OWNER_ID, REPORTER_ID |
| 4 | Liên quan / Đối tác | Ref, liên kết | RELATED_ENTITY_*, COUNTERPARTY |
| 5 | Thời gian | Ngày, hạn | START_DATE, DUE_DATE, DONE_AT |
| 6 | Kết quả | Kết quả, tiến độ | RESULT_NOTE, PROGRESS_PERCENT |
| 7 | Ghi chú | Ghi chú, mô tả phụ | NOTE, TAGS |
| 8 | Hệ thống | Ẩn | ID, CREATED_*, UPDATED_* |

---

## 2. PATTERN THEO MODULE

### TASK

```
[1] Thông tin chính: TITLE, DESCRIPTION
[2] Phân loại: TASK_TYPE, PRIORITY, STATUS
[3] Người: OWNER_ID, REPORTER_ID
[4] Liên quan: RELATED_ENTITY_TYPE, RELATED_ENTITY_ID
[5] Thời gian: START_DATE, DUE_DATE, DONE_AT
[6] Kết quả: PROGRESS_PERCENT, RESULT_NOTE
[7] Hệ thống: (hidden)
```

### HO_SO

```
[1] Thông tin chính: NAME, CODE, HO_SO_TYPE
[2] Phân loại: HTX_ID, STATUS
[3] Người: OWNER_ID
[4] Liên hệ: PHONE, EMAIL
[5] Định danh: ID_NO, ADDRESS
[6] Thời gian: START_DATE, END_DATE
[7] Ghi chú: NOTE, TAGS
[8] Hệ thống: (hidden)
```

### FINANCE

```
[1] Phân loại: TRANS_TYPE, CATEGORY
[2] Số tiền: AMOUNT
[3] Thời gian: TRANS_DATE
[4] Đối tác: COUNTERPARTY, DON_VI_ID
[5] Thanh toán: PAYMENT_METHOD, REFERENCE_NO
[6] Liên quan: RELATED_ENTITY_*, DESCRIPTION, EVIDENCE_URL
[7] Duyệt: CONFIRMED_AT, CONFIRMED_BY (when CONFIRMED)
[8] Hệ thống: (hidden)
```

---

## 3. QUY TẮC SẮP XẾP TRONG NHÓM

1. **Quan trọng nhất trước** — TITLE trước DESCRIPTION
2. **Chọn trước ngày** — TASK_TYPE, PRIORITY trước START_DATE
3. **Ngày trước hệ thống** — Không đặt CREATED_AT đầu form
4. **Ref trước text** — OWNER_ID trước NOTE

---

## 4. HIERARCHY VISUAL

```
Form
├── Section 1: Thông tin chính (collapsible: no)
├── Section 2: Phân loại
├── Section 3: Người phụ trách
├── Section 4: Liên quan
├── Section 5: Thời gian
├── Section 6: Kết quả (collapsible: yes, khi cần)
└── Section 7: Hệ thống (hidden)
```

---

## 5. REUSABLE PATTERNS

| Pattern | Áp dụng |
|---------|---------|
| Thông tin chính → Phân loại → Người → Thời gian | TASK, HO_SO |
| Phân loại → Số tiền → Thời gian → Đối tác | FINANCE |
| File: Loại → Tên → URL | TASK_ATTACHMENT, HO_SO_FILE, FINANCE_ATTACHMENT |
| Checklist: Nội dung → Bắt buộc | TASK_CHECKLIST |

---

## 6. APP SHEET IMPLEMENTATION

**AppSheet Sections:** Dùng Virtual columns hoặc Form Sections (nếu có).

**Cách 1 — Column order:** Sắp xếp cột theo DISPLAY_ORDER trong Form view.

**Cách 2 — Multiple forms:** Tạo Form 1 (nhóm 1-3), Form 2 (nhóm 4-5) nếu cần progressive disclosure.

**Cách 3 — Show_If:** Ẩn nhóm khi không cần (RESULT_NOTE khi STATUS <> DONE).
