# AppSheet View UX Map — CBV PRO Level

**Mục tiêu:** Form và Detail có cấu trúc, nhóm logic, phân cấp rõ — không phải layout database phẳng.

---

## 1. TASK MODULE (PRO)

**Spec:** [TASK_MAIN_PRO_SPEC.md](TASK_MAIN_PRO_SPEC.md) — visible/hidden fields, refs, actions BẮT ĐẦU/HOÀN THÀNH/HỦY, validation.

### 1.1 TASK_FORM — Cấu trúc Form (PRO)

| Group | Section Title | Fields | Order |
|-------|---------------|--------|-------|
| 1 | Đơn vị & Phân loại | DON_VI_ID, TASK_TYPE_ID | 1-2 |
| 2 | Thông tin chính | TITLE, DESCRIPTION | 3-4 |
| 3 | Ưu tiên | PRIORITY | 5 |
| 4 | Thời gian | START_DATE, DUE_DATE | 6-7 |
| 5 | Người phụ trách | OWNER_ID | 8 |
| 6 | Liên quan | RELATED_ENTITY_TYPE, RELATED_ENTITY_ID | 9-10 |

**Field order target:** DON_VI_ID, TASK_TYPE_ID, TITLE, DESCRIPTION, PRIORITY, START_DATE, DUE_DATE, OWNER_ID

**Ẩn:** ID, TASK_CODE, STATUS, DONE_AT, PROGRESS_PERCENT, RESULT_SUMMARY, REPORTER_ID, CREATED_*, UPDATED_*, IS_DELETED.

**Auto:** STATUS=NEW; REPORTER_ID=USEREMAIL()→USER_DIRECTORY mapping (readonly)

**Lưu ý:** OWNER_ID = Chủ task. REF từ ACTIVE_USERS. Users are global; no HTX filter.

---

### 1.2 TASK_DETAIL — Cấu trúc Detail (PRO)

| Section | Title | Content | Style |
|---------|-------|---------|-------|
| 0 | Actions | BẮT ĐẦU, HOÀN THÀNH, HỦY, MỞ LẠI | Top action buttons |
| 1 | Tóm tắt | TITLE, STATUS (badge), PRIORITY, DON_VI_ID, TASK_TYPE_ID | Header |
| 2 | Người | OWNER_ID, REPORTER_ID | Card |
| 3 | Thời gian | START_DATE, DUE_DATE, DONE_AT | Timeline |
| 4 | Tiến độ | PROGRESS_PERCENT, checklist summary | Progress bar |
| 5 | Kết quả | RESULT_SUMMARY | Show when DONE |
| 6 | Mô tả | DESCRIPTION | Collapsible |
| 7 | Liên quan | RELATED_ENTITY_TYPE, RELATED_ENTITY_ID | Optional |
| 8 | Checklist | TASK_CHECKLIST inline | Inline |
| 9 | Đính kèm | TASK_ATTACHMENT inline | Inline |
| 10 | Lịch sử | TASK_UPDATE_LOG inline | Readonly |

**Workflow actions:** GAS: taskStartAction, taskCompleteAction, taskCancelAction, taskReopenAction. STATUS not editable in form.

---

### 1.3 TASK_CHECKLIST_FORM (Inline Add)

| Group | Fields |
|-------|--------|
| Nội dung | TITLE, IS_REQUIRED |
| Ẩn | ID, TASK_ID, IS_DONE, DONE_AT, DONE_BY, CREATED_* |

---

### 1.4 TASK_ATTACHMENT_FORM (Inline Add)

| Group | Fields |
|-------|--------|
| Đính kèm | ATTACHMENT_TYPE, TITLE, FILE_URL |
| Ẩn | ID, TASK_ID, FILE_NAME, DRIVE_FILE_ID, CREATED_* |

---

## 2. HO_SO MODULE

### 2.1 HO_SO_FORM — Cấu trúc Form

| Group | Section Title | Fields | Order |
|-------|---------------|--------|-------|
| 1 | Thông tin chính | NAME, CODE, HO_SO_TYPE | 1-3 |
| 2 | Phân loại | HTX_ID, STATUS (readonly) | 4-5 |
| 3 | Người phụ trách | OWNER_ID | 6 |
| 4 | Liên hệ | PHONE, EMAIL | 7-8 |
| 5 | Định danh | ID_NO, ADDRESS | 9-10 |
| 6 | Thời gian | START_DATE, END_DATE | 11-12 |
| 7 | Ghi chú | NOTE, TAGS_TEXT | 13-14 |

**Ẩn:** ID, CREATED_*, UPDATED_*, IS_DELETED

---

### 2.2 HO_SO_DETAIL — Cấu trúc Detail

| Section | Title | Fields |
|---------|-------|--------|
| 1 | Tóm tắt | NAME, CODE, HO_SO_TYPE, STATUS |
| 2 | Người phụ trách | OWNER_ID |
| 3 | Liên hệ | PHONE, EMAIL, ADDRESS |
| 4 | Thời gian | START_DATE, END_DATE |
| 5 | Ghi chú | NOTE, TAGS_TEXT |
| 6 | File | HO_SO_FILE inline |
| 7 | Quan hệ | HO_SO_RELATION inline |

---

### 2.3 HO_SO_FILE_FORM (Inline Add)

| Group | Fields |
|-------|--------|
| File | FILE_GROUP, FILE_NAME, FILE_URL |
| Ẩn | ID, HO_SO_ID, DRIVE_FILE_ID, STATUS, CREATED_* |

---

## 3. FINANCE MODULE

### 3.1 FINANCE_FORM — Cấu trúc Form

| Group | Section Title | Fields | Order |
|-------|---------------|--------|-------|
| 1 | Phân loại | TRANS_TYPE, CATEGORY | 1-2 |
| 2 | Số tiền | AMOUNT | 3 |
| 3 | Thời gian | TRANS_DATE | 4 |
| 4 | Đối tác | COUNTERPARTY, DON_VI_ID | 5-6 |
| 5 | Thanh toán | PAYMENT_METHOD, REFERENCE_NO | 7-8 |
| 6 | Liên quan | RELATED_ENTITY_TYPE, RELATED_ENTITY_ID | 9-10 |
| 7 | Mô tả | DESCRIPTION, EVIDENCE_URL | 11-12 |

**Ẩn:** ID, TRANS_CODE, STATUS, CONFIRMED_AT, CONFIRMED_BY, CREATED_*, UPDATED_*, IS_DELETED

**Editable_If:** [STATUS] <> "CONFIRMED"

---

### 3.2 FINANCE_DETAIL — Cấu trúc Detail

| Section | Title | Fields |
|---------|-------|--------|
| 1 | Tóm tắt | TRANS_CODE, TRANS_DATE, TRANS_TYPE, STATUS, AMOUNT |
| 2 | Chi tiết | CATEGORY, COUNTERPARTY, PAYMENT_METHOD |
| 3 | Duyệt | CONFIRMED_AT, CONFIRMED_BY (when CONFIRMED) |
| 4 | Mô tả | DESCRIPTION, EVIDENCE_URL |
| 5 | Chứng từ | FINANCE_ATTACHMENT inline |
| 6 | Lịch sử | FINANCE_LOG inline (readonly) |

---

### 3.3 FINANCE_ATTACHMENT_FORM (Inline Add)

| Group | Fields |
|-------|--------|
| Chứng từ | ATTACHMENT_TYPE, TITLE, FILE_URL |
| Ẩn | ID, FINANCE_ID, DRIVE_FILE_ID, CREATED_* |

---

## 4. INLINE VIEW RULES

| Inline | Editable | Add | Style |
|--------|----------|-----|-------|
| TASK_CHECKLIST | Yes (TITLE, IS_REQUIRED); IS_DONE via action | Yes | Compact; mark done via action |
| TASK_ATTACHMENT | Yes | Yes | Upload-friendly |
| TASK_UPDATE_LOG | No | No | Readonly; no Add |
| HO_SO_FILE | Yes | Yes | Upload-friendly |
| HO_SO_RELATION | Yes | Yes | FROM/TO selection |
| FINANCE_ATTACHMENT | Yes | Yes | Upload-friendly |
| FINANCE_LOG | No | No | Readonly; no Add |

---

## 5. CONDITIONAL SHOW

| Field | Show_If |
|-------|---------|
| RESULT_SUMMARY | [STATUS] = "DONE" |
| DONE_AT | [STATUS] = "DONE" |
| PROGRESS_PERCENT | Always (readonly) |
| CONFIRMED_AT, CONFIRMED_BY | [STATUS] = "CONFIRMED" |
| FINANCE business fields | [STATUS] <> "CONFIRMED" |

---

## 6. USER FLOW

**Tạo task:** TITLE → TASK_TYPE_ID → PRIORITY → OWNER_ID → START_DATE → DUE_DATE (6 fields chính)

**Xem task:** Summary → People → Timeline → Progress → Checklist → Attachments → Log

**Tạo giao dịch:** TRANS_TYPE → CATEGORY → AMOUNT → TRANS_DATE → COUNTERPARTY (5 fields chính)
