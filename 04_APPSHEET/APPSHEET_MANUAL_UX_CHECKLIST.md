# AppSheet Manual UX Checklist — CBV PRO Level

**Mục tiêu:** Form và Detail có cấu trúc, nhóm, icon — không layout database phẳng.

**Nguồn:** APPSHEET_VIEW_UX_MAP.md, APPSHEET_FIELD_ORDER_MAP.csv, APPSHEET_ICON_MAP.csv

---

## BƯỚC 0 — CHUẨN BỊ

- [ ] Mở AppSheet Editor
- [ ] Có APPSHEET_FIELD_ORDER_MAP.csv và APPSHEET_ICON_MAP.csv
- [ ] Đã thiết lập Display Name (APPSHEET_MANUAL_RENAME_CHECKLIST)

---

## BƯỚC 1 — TASK_FORM — Sắp xếp cột

Vào **UX → Views → TASK_FORM** (hoặc Form view của TASK_MAIN).

**Thứ tự cột hiển thị (theo nhóm):**

1. TITLE
2. DESCRIPTION
3. TASK_TYPE
4. PRIORITY
5. OWNER_ID
6. REPORTER_ID
7. RELATED_ENTITY_TYPE
8. RELATED_ENTITY_ID
9. START_DATE
10. DUE_DATE

**Ẩn:** ID, TASK_CODE, STATUS, DONE_AT, PROGRESS_PERCENT, RESULT_NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED

- [ ] Đã sắp xếp TASK_FORM
- [ ] Đã ẩn cột hệ thống

---

## BƯỚC 2 — TASK_FORM — Gán icon

Với mỗi cột hiển thị, set **Icon** (nếu AppSheet hỗ trợ):

| Column | Icon |
|--------|------|
| TITLE | 📝 |
| DESCRIPTION | 📄 |
| TASK_TYPE | 🧩 |
| PRIORITY | ⚡ |
| OWNER_ID | 👑 |
| REPORTER_ID | 🧑‍💼 |
| RELATED_ENTITY_TYPE | 🔗 |
| RELATED_ENTITY_ID | 🔗 |
| START_DATE | 📅 |
| DUE_DATE | ⏰ |

- [ ] Đã gán icon TASK_FORM

---

## BƯỚC 3 — TASK_DETAIL — Cấu trúc

Vào **UX → Views → TASK_DETAIL**.

**Thứ tự section / cột:**

1. **Tóm tắt:** TITLE, STATUS, PRIORITY (STATUS dạng badge nếu có)
2. **Người:** OWNER_ID, REPORTER_ID
3. **Thời gian:** START_DATE, DUE_DATE, DONE_AT
4. **Tiến độ:** PROGRESS_PERCENT
5. **Kết quả:** RESULT_NOTE (Show_If: STATUS = "DONE")
6. **Mô tả:** DESCRIPTION
7. **Liên quan:** RELATED_ENTITY_TYPE, RELATED_ENTITY_ID
8. **Inline:** TASK_CHECKLIST
9. **Inline:** TASK_ATTACHMENT
10. **Inline:** TASK_UPDATE_LOG (readonly)

- [ ] Đã cấu trúc TASK_DETAIL
- [ ] RESULT_NOTE, DONE_AT: Show_If khi DONE

---

## BƯỚC 4 — TASK_CHECKLIST inline — Form Add

**TASK_CHECKLIST_FORM** (khi Add từ inline):

- [ ] Chỉ hiển thị: TITLE, IS_REQUIRED
- [ ] Ẩn: ID, TASK_ID, IS_DONE, DONE_AT, DONE_BY, CREATED_*
- [ ] Icon TITLE: 📝, IS_REQUIRED: ⚠️

---

## BƯỚC 5 — TASK_ATTACHMENT inline — Form Add

**TASK_ATTACHMENT_FORM:**

- [ ] Hiển thị: ATTACHMENT_TYPE, TITLE, FILE_URL
- [ ] Ẩn: ID, TASK_ID, FILE_NAME, DRIVE_FILE_ID, CREATED_*
- [ ] Icon: 📎 cho FILE_URL

---

## BƯỚC 6 — TASK_UPDATE_LOG inline

- [ ] **Readonly** — không Add, không Edit
- [ ] Chỉ hiển thị: ACTION, NOTE, ACTOR_ID, CREATED_AT
- [ ] Icon ACTION: 📜

---

## BƯỚC 7 — HO_SO_FORM — Sắp xếp + Icon

**Thứ tự:**

1. NAME, CODE, HO_SO_TYPE
2. HTX_ID, STATUS (readonly)
3. OWNER_ID
4. PHONE, EMAIL
5. ID_NO, ADDRESS
6. START_DATE, END_DATE
7. NOTE, TAGS_TEXT

**Icon:** NAME 📌, CODE 🔢, HO_SO_TYPE 📁, OWNER_ID 👑, PHONE 📞, EMAIL 📧, START_DATE 📅, END_DATE ⏰

- [ ] Đã sắp xếp HO_SO_FORM
- [ ] Đã gán icon

---

## BƯỚC 8 — HO_SO_DETAIL — Cấu trúc

- [ ] Section: Tóm tắt → Người → Liên hệ → Thời gian → Ghi chú
- [ ] Inline: HO_SO_FILE, HO_SO_RELATION

---

## BƯỚC 9 — HO_SO_FILE inline Form

- [ ] Hiển thị: FILE_GROUP, FILE_NAME, FILE_URL
- [ ] Ẩn: ID, HO_SO_ID, DRIVE_FILE_ID, CREATED_*

---

## BƯỚC 9b — HO_SO_RELATION inline Form

- [ ] Hiển thị: FROM_HO_SO_ID, TO_HO_SO_ID, RELATION_TYPE, START_DATE, END_DATE, NOTE
- [ ] Ẩn: ID, STATUS, CREATED_*
- [ ] Icon: 🔗 cho FROM/TO, 📅 cho dates

---

## BƯỚC 10 — FINANCE_FORM — Sắp xếp + Icon

**Thứ tự:**

1. TRANS_TYPE, CATEGORY
2. AMOUNT
3. TRANS_DATE
4. COUNTERPARTY, UNIT_ID
5. PAYMENT_METHOD, REFERENCE_NO
6. RELATED_ENTITY_TYPE, RELATED_ENTITY_ID
7. DESCRIPTION, EVIDENCE_URL

**Icon:** TRANS_TYPE 🧾, CATEGORY 🧾, AMOUNT 💰, TRANS_DATE 📅, PAYMENT_METHOD 💳

**Editable_If:** [STATUS] <> "CONFIRMED" cho tất cả business fields

- [ ] Đã sắp xếp FINANCE_FORM
- [ ] Đã set Editable_If
- [ ] Đã gán icon

---

## BƯỚC 11 — FINANCE_DETAIL — Cấu trúc

- [ ] Section: Tóm tắt (TRANS_CODE, AMOUNT, STATUS) → Chi tiết → Duyệt (khi CONFIRMED)
- [ ] Inline: FINANCE_ATTACHMENT, FINANCE_LOG (readonly)

---

## BƯỚC 12 — FINANCE_ATTACHMENT inline Form

- [ ] Hiển thị: ATTACHMENT_TYPE, TITLE, FILE_URL
- [ ] Ẩn: ID, FINANCE_ID, DRIVE_FILE_ID, CREATED_*

---

## BƯỚC 13 — FINANCE_LOG inline

- [ ] **Readonly** — không Add, không Edit
- [ ] Chỉ hiển thị: ACTION, NOTE, ACTOR_ID, CREATED_AT

---

## BƯỚC 14 — KIỂM TRA TỔNG THỂ

- [ ] TASK_FORM: < 12 fields visible; có nhóm logic
- [ ] HO_SO_FORM: < 15 fields visible
- [ ] FINANCE_FORM: < 13 fields visible
- [ ] Không form nào phẳng (tất cả fields một đống)
- [ ] Icon nhất quán (cùng field = cùng icon)
- [ ] Inline readonly: TASK_UPDATE_LOG, FINANCE_LOG không có nút Add

---

## HOÀN THÀNH

- [ ] Form cảm giác "Tạo công việc nhanh" chứ không "Điền database"
- [ ] Detail cảm giác dashboard, không phải bảng
- [ ] User có thể tạo task trong < 10 giây (với 6 fields chính)
