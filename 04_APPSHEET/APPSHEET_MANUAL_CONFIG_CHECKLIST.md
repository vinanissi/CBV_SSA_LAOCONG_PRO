# AppSheet Manual Configuration Checklist — CBV_SSA_LAOCONG_PRO

Step-by-step checklist for human operators. Execute in AppSheet Editor. Phase 1 safe. Aligned with view architecture, field policy, attachment system, enum binding.

---

## PART 1 — PRECHECK (VERY IMPORTANT)

Complete before starting configuration.

### 1.1 Data Source

- [ ] Google Sheets workbook is created and contains all required sheets
- [ ] AppSheet app is created and connected to the correct Google Sheets workbook
- [ ] Data source connection is active (no red errors in AppSheet)

### 1.2 Required Sheets (must exist)

- [x] HO_SO_MASTER
- [x] HO_SO_FILE
- [x] HO_SO_RELATION
- [x] TASK_MAIN
- [x] TASK_CHECKLIST
- [ ] TASK_UPDATE_LOG
- [ ] TASK_ATTACHMENT
- [ ] FINANCE_TRANSACTION
- [ ] FINANCE_ATTACHMENT
- [ ] FINANCE_LOG
- [ ] ENUM_DICTIONARY
- [ ] MASTER_CODE (if used)
- [ ] ADMIN_AUDIT_LOG (if admin app)

### 1.3 Column Names

- [ ] Column names in each sheet match schema exactly (case-sensitive)
- [ ] No extra or missing columns that would break Ref/Valid_If

### 1.4 ENUM_DICTIONARY

- [ ] ENUM_DICTIONARY sheet exists
- [ ] ENUM_DICTIONARY has columns: ID, ENUM_GROUP, ENUM_VALUE, DISPLAY_TEXT, SORT_ORDER, IS_ACTIVE, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY
- [ ] ENUM_DICTIONARY is populated (run initAll() or seedEnumDictionary() in GAS if empty)
- [ ] At least these groups exist: HO_SO_TYPE, HO_SO_STATUS, FILE_GROUP, TASK_TYPE, TASK_STATUS, TASK_PRIORITY, TASK_ATTACHMENT_TYPE, RELATED_ENTITY_TYPE, FINANCE_TYPE, FINANCE_STATUS, FIN_CATEGORY, PAYMENT_METHOD, FINANCE_ATTACHMENT_TYPE, UPDATE_TYPE

### 1.5 MASTER_CODE (if used)

- [ ] MASTER_CODE sheet exists and is populated (or empty is OK for Phase 1)
- [ ] Organizational units are **DON_VI** only; **FINANCE_TRANSACTION.DON_VI_ID** → Ref **ACTIVE_DON_VI** (not MASTER_CODE)

### 1.6 Summary Checkbox

- [ ] **DB connected** — AppSheet sees the workbook
- [ ] **Tables detected** — All 13 tables appear in AppSheet Data
- [ ] **ENUM loaded** — ENUM_DICTIONARY has rows
- [ ] **MASTER_CODE loaded** — MASTER_CODE exists (can be empty)

---

## PART 2 — DATA → TABLES SETUP

For each table, confirm in AppSheet: **Data → Tables**.

### 2.1 HO_SO_MASTER

- [ ] Table added (or auto-detected)
- [ ] Source: HO_SO_MASTER sheet
- [ ] Key column: **ID**
- [ ] Label column: **NAME**
- [ ] Add table if missing: Data → Add new table → Select HO_SO_MASTER sheet

### 2.2 HO_SO_FILE

- [ ] Table added
- [ ] Key: **ID**
- [ ] Label: **FILE_NAME**

### 2.3 HO_SO_RELATION

- [ ] Table added
- [ ] Key: **ID**
- [ ] Label: **RELATION_TYPE**

### 2.4 TASK_MAIN

- [ ] Table added
- [ ] Key: **ID**
- [ ] Label: **TITLE**

### 2.5 TASK_CHECKLIST

- [ ] Table added
- [ ] Key: **ID**
- [ ] Label: **TITLE**

### 2.6 TASK_UPDATE_LOG

- [ ] Table added
- [ ] Key: **ID**
- [ ] Label: **ACTION**

### 2.7 TASK_ATTACHMENT

- [ ] Table added
- [ ] Key: **ID**
- [ ] Label: **TITLE** (or FILE_NAME)

### 2.8 FINANCE_TRANSACTION

- [ ] Table added
- [ ] Key: **ID**
- [ ] Label: **TRANS_CODE**

### 2.9 FINANCE_ATTACHMENT

- [ ] Table added
- [ ] Key: **ID**
- [ ] Label: **TITLE**

### 2.10 FINANCE_LOG

- [ ] Table added
- [ ] Key: **ID**
- [ ] Label: **ACTION**

### 2.11 ENUM_DICTIONARY

- [ ] Table added (required for Valid_If)
- [ ] Key: **ID**
- [ ] Label: **DISPLAY_TEXT** (primary; fallback ENUM_VALUE)

### 2.12 MASTER_CODE

- [ ] Table added (required for user refs)
- [ ] Key: **ID**
- [ ] Label: **DISPLAY_TEXT** (primary; run ensureDisplayTextForMasterCodeRows() if empty)

### 2.13 ADMIN_AUDIT_LOG

- [ ] Table added (admin app only)
- [ ] Key: **ID**
- [ ] Label: **ACTION**

---

## PART 2.5 — SLICES (Data → Slices)

Create slices before configuring Ref columns. See APPSHEET_SLICE_MAP.md.

- [ ] **ACTIVE_USERS** — Source: MASTER_CODE; Filter: `AND([MASTER_GROUP] = "USER", [STATUS] = "ACTIVE", [IS_DELETED] = FALSE)`
- [ ] **ACTIVE_MASTER_CODES** — Source: MASTER_CODE; Filter: `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)`
- [ ] **ACTIVE_HTX** — Source: HO_SO_MASTER; Filter: `AND([HO_SO_TYPE_ID].[CODE] = "HTX", [IS_DELETED] = FALSE)` (cột `HO_SO_TYPE_ID` là Ref → `MASTER_CODE`)
- [ ] **HO_SO_ACTIVE** — Source: HO_SO_MASTER; Filter: `[IS_DELETED] = FALSE`
- [ ] **TASK_OPEN** — Source: TASK_MAIN; Filter: `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))`
- [ ] **TASK_DONE** — Source: TASK_MAIN; Filter: `[STATUS] = "DONE"`
- [ ] **FIN_DRAFT** — Source: FINANCE_TRANSACTION; Filter: `[STATUS] = "NEW"`
- [ ] **FIN_CONFIRMED** — Source: FINANCE_TRANSACTION; Filter: `[STATUS] = "CONFIRMED"`

---

## PART 2.6 — FINANCE: EXPORT CSV (CHỌN CHU KỲ / ĐƠN VỊ / NGƯỜI)

**Schema:** Sheet **`FIN_EXPORT_FILTER`** (bootstrap GAS / `ensureSchemas`). Chi tiết slice + công thức: `02_MODULES/FINANCE/APPSHEET_UX_SPEC.md`.

### 2.6.1 Data source

- [ ] Thêm table **FIN_EXPORT_FILTER** (cùng spreadsheet) — Key = **ID**; cột: `USER_EMAIL`, `DATE_FROM`, `DATE_TO`, `DON_VI_ID`, `USER_REF_ID`, `NOTE`, `UPDATED_AT`
- [ ] `DON_VI_ID` → Ref → **ACTIVE_DON_VI** (hoặc `DON_VI`)
- [ ] `USER_REF_ID` → Ref → **ACTIVE_USERS** — lọc **`FINANCE_TRANSACTION.CREATED_BY`** (người tạo)

### 2.6.2 Slice + list export

- [ ] Tạo slice **FIN_EXPORT_CSV** (source `FINANCE_TRANSACTION`) — copy **Row filter** từ `APPSHEET_UX_SPEC` (mục *Slice FIN_EXPORT_CSV*)
- [ ] Tạo view Table **FIN_LIST_EXPORT** (hoặc tên tương đương) dùng slice **FIN_EXPORT_CSV**

### 2.6.3 Form chọn tham số (mỗi user một dòng)

- [ ] View **Form** hoặc **Deck**: bảng `FIN_EXPORT_FILTER`; **Security filter** `[USER_EMAIL] = USEREMAIL()`
- [ ] **Initial value** (hoặc Valid_If): `USER_EMAIL` = `USEREMAIL()` khi thêm dòng
- [ ] Hướng dẫn user: điền **DATE_FROM**, **DATE_TO**; để trống **DON_VI_ID** = mọi đơn vị; để trống **USER_REF_ID** = mọi người (theo chu kỳ)

### 2.6.4 Action Export CSV

- [ ] **Action**: **Do this** = **App: export this view to a CSV file** ([Help](https://support.google.com/appsheet/answer/11579391?hl=en))
- [ ] Gắn vào **FIN_LIST_EXPORT** (không gắn vào form filter)
- [ ] Kiểm tra trên **trình duyệt web** (bắt buộc cho export CSV)

### 2.6.5 Tối thiểu (không dùng FIN_EXPORT_FILTER)

- [ ] Gắn Export CSV lên `FIN_LIST` + slice **FIN_DRAFT** / **FIN_CONFIRMED** — không chọn chu kỳ/đơn vị/người qua form

---

## PART 3 — DATA → COLUMNS CONFIG

For each table, go to **Data → Columns → [Table name]** and configure.

### 3.1 HO_SO_MASTER

**Step 1:** Open Data → Columns → HO_SO_MASTER

**Step 2:** Set column types (leave as Text unless noted):
- ID → Text (Key)
- HO_SO_TYPE_ID → Ref → `MASTER_CODE` (slice loại HO_SO_TYPE); không cột `HO_SO_TYPE` text
- CODE → Text
- NAME → Text
- STATUS → Text (readonly)
- HTX_ID → **Ref** → ACTIVE_HTX slice (Display: NAME)
- OWNER_ID → **Ref** → ACTIVE_USERS slice (Display: DISPLAY_TEXT); Allow other values: **No**
- PHONE, EMAIL, ID_NO, ADDRESS → Text
- START_DATE, END_DATE → Date
- NOTE, TAGS → Text
- CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY → leave default
- IS_DELETED → Yes/No

**Step 3:** Hide (Show? = FALSE): ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED

**Step 4:** Editable? = FALSE: ID, STATUS, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY

---

### 3.2 HO_SO_FILE

**Step 1:** Open Data → Columns → HO_SO_FILE

**Step 2:** Set column types:
- ID → Text (Key)
- HO_SO_ID → **Ref** → HO_SO_MASTER (Display: NAME)
- FILE_GROUP → Text (enum; Valid_If later)
- FILE_NAME → Text
- FILE_URL → **File** ← CRITICAL for upload
- DRIVE_FILE_ID → Text
- STATUS → Text (readonly)
- NOTE → Text
- CREATED_AT, CREATED_BY → leave default

**Step 3:** Set HO_SO_ID → **IsPartOf** = **TRUE**

**Step 4:** Hide: ID, HO_SO_ID (when inline), DRIVE_FILE_ID, CREATED_AT, CREATED_BY

**Step 5:** Editable? = FALSE: ID, DRIVE_FILE_ID, CREATED_AT, CREATED_BY, STATUS

---

### 3.3 HO_SO_RELATION

**Step 1:** Open Data → Columns → HO_SO_RELATION

**Step 2:** Set column types:
- ID → Text (Key)
- FROM_HO_SO_ID → **Ref** → HO_SO_MASTER (Display: NAME)
- TO_HO_SO_ID → **Ref** → HO_SO_MASTER (Display: NAME)
- RELATION_TYPE → Text
- START_DATE, END_DATE → Date
- STATUS → Text (readonly)
- NOTE → Text
- CREATED_AT, CREATED_BY → leave default

**Step 3:** Hide: ID, CREATED_AT, CREATED_BY

**Step 4:** Editable? = FALSE: ID, STATUS, CREATED_AT, CREATED_BY

---

### 3.4 TASK_MAIN

**Step 1:** Open Data → Columns → TASK_MAIN

**Step 2:** Set column types:
- ID → Text (Key)
- TASK_CODE, TITLE, DESCRIPTION, RESULT_NOTE → Text
- TASK_TYPE, STATUS, PRIORITY, RELATED_ENTITY_TYPE → Text (enum; Valid_If later)
- OWNER_ID → **Ref** → ACTIVE_USERS (Display: DISPLAY_TEXT); Allow other values: **No**
- REPORTER_ID → **Ref** → ACTIVE_USERS (Display: DISPLAY_TEXT); Initial: `FIRST(SELECT(MASTER_CODE[ID], AND([MASTER_GROUP]="USER", [SHORT_NAME]=USEREMAIL())))`
- RELATED_ENTITY_ID → Ref (polymorphic; or Text for Phase 1)
- START_DATE, DUE_DATE → Date
- DONE_AT → Date (readonly)
- PROGRESS_PERCENT → Number (readonly; checklist-derived)
- CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY → leave default
- IS_DELETED → Yes/No

**Step 3:** Hide: ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED

**Step 4:** Editable? = FALSE: ID, STATUS, PROGRESS_PERCENT, DONE_AT, CREATED_*, UPDATED_*

> **CRITICAL:** PROGRESS_PERCENT is controlled-readonly. Visible if needed; never manually editable. Source of truth: checklist-driven (syncTaskProgress). Editable_If = FALSE.

---

### 3.5 TASK_CHECKLIST

**Step 1:** Open Data → Columns → TASK_CHECKLIST

**Step 2:** Set column types:
- ID → Text (Key)
- TASK_ID → **Ref** → TASK_MAIN (Display: TITLE)
- ITEM_NO → Number
- SORT_ORDER → Number
- TITLE, NOTE → Text
- IS_REQUIRED, IS_DONE → Yes/No
- DONE_AT → Date (readonly; GAS set)
- DONE_BY → **Ref** → ACTIVE_USERS (Display: DISPLAY_TEXT); readonly; GAS set
- CREATED_AT, CREATED_BY → leave default

**Step 3:** Set TASK_ID → **IsPartOf** = **TRUE**

**Step 4:** Hide: ID, TASK_ID (when inline), CREATED_AT, CREATED_BY

**Step 5:** Editable? = FALSE: ID, TASK_ID, IS_DONE, DONE_AT, DONE_BY, CREATED_AT, CREATED_BY

---

### 3.6 TASK_ATTACHMENT

**Step 1:** Open Data → Columns → TASK_ATTACHMENT

**Step 2:** Set column types:
- ID → Text (Key)
- TASK_ID → **Ref** → TASK_MAIN (Display: TITLE)
- ATTACHMENT_TYPE → Text (enum; Valid_If later)
- TITLE, FILE_NAME → Text
- FILE_URL → **File** ← CRITICAL for upload
- DRIVE_FILE_ID → Text
- NOTE → Text
- CREATED_AT, CREATED_BY → leave default

**Step 3:** Set TASK_ID → **IsPartOf** = **TRUE**

**Step 4:** Hide: ID, TASK_ID (when inline), FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY

**Step 5:** Editable? = FALSE: ID, TASK_ID, DRIVE_FILE_ID, CREATED_AT, CREATED_BY

---

### 3.7 TASK_UPDATE_LOG

**Step 1:** Open Data → Columns → TASK_UPDATE_LOG

**Step 2:** Set column types (all readonly):
- ID → Text (Key)
- TASK_ID → Ref → TASK_MAIN
- ACTION, OLD_STATUS, NEW_STATUS, NOTE, ACTOR_ID → Text
- CREATED_AT → Date

**Step 3:** Hide: ID, TASK_ID

**Step 4:** Editable? = FALSE for ALL columns. Editable_If = FALSE. **Operationally read-only.** No add/edit/delete in AppSheet. Only GAS service writes.

---

### 3.8 FINANCE_TRANSACTION

**Step 1:** Open Data → Columns → FINANCE_TRANSACTION

**Step 2:** Set column types:
- ID → Text (Key)
- TRANS_CODE, REFERENCE_NO, COUNTERPARTY, DESCRIPTION → Text
- TRANS_DATE → Date
- TRANS_TYPE, STATUS, CATEGORY, PAYMENT_METHOD, RELATED_ENTITY_TYPE → Text (enum; Valid_If later)
- AMOUNT → Number
- DON_VI_ID → **Ref** → ACTIVE_DON_VI (Display: DISPLAY_TEXT)
- RELATED_ENTITY_ID → Text or Ref
- EVIDENCE_URL → **File** (khuyến nghị để có nút tải/chọn file; AppSheet upload lên Drive và lưu URL vào ô) **hoặc** Text nếu chỉ dán link thủ công (legacy)
- CONFIRMED_AT → Date (hidden; GAS set)
- CONFIRMED_BY → **Ref** → ACTIVE_USERS (Display: DISPLAY_TEXT); hidden; GAS set
- CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY → leave default
- IS_DELETED → Yes/No

**Step 3:** Hide: ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED, CONFIRMED_AT, CONFIRMED_BY

**Step 4:** Editable? = FALSE: ID, STATUS, CREATED_*, UPDATED_*, CONFIRMED_*

**Step 5:** Editable_If for business fields: `[STATUS] <> "CONFIRMED"` (TRANS_CODE, TRANS_DATE, TRANS_TYPE, CATEGORY, AMOUNT, DON_VI_ID, COUNTERPARTY, PAYMENT_METHOD, REFERENCE_NO, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, DESCRIPTION, EVIDENCE_URL)

**Step 6 — Chứng từ tải file:** Nếu form đang hiển thị **EVIDENCE_URL** kiểu Text (chỉ nhập `http://`):
- Đổi cột **EVIDENCE_URL** sang type **File** (Data → Columns → FINANCE_TRANSACTION → EVIDENCE_URL). Lưu lại app; trên form sẽ có chọn/tải file thay vì ô text.
- **Nhiều file hoặc phân loại (hóa đơn/biên lai/…):** giữ **EVIDENCE_URL** tùy chọn hoặc ẩn trên form; dùng bảng con **FINANCE_ATTACHMENT** với **FILE_URL** = File và inline trên **FINANCE_DETAIL** (xem §3.9 và UX checklist Bước 11–12).

---

### 3.9 FINANCE_ATTACHMENT

**Step 1:** Open Data → Columns → FINANCE_ATTACHMENT

**Step 2:** Set column types:
- ID → Text (Key)
- FINANCE_ID → **Ref** → FINANCE_TRANSACTION (Display: TRANS_CODE)
- ATTACHMENT_TYPE → Text (enum; Valid_If later)
- TITLE, FILE_NAME → Text
- FILE_URL → **File** ← CRITICAL for upload
- DRIVE_FILE_ID → Text
- NOTE → Text
- CREATED_AT, CREATED_BY → leave default

**Step 3:** Set FINANCE_ID → **IsPartOf** = **TRUE**

**Step 4:** Hide: ID, FINANCE_ID (when inline), FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY

**Step 5:** Editable? = FALSE: ID, FINANCE_ID, DRIVE_FILE_ID, CREATED_AT, CREATED_BY

---

### 3.10 FINANCE_LOG

**Step 1:** Open Data → Columns → FINANCE_LOG

**Step 2:** Set column types (all readonly):
- ID → Text (Key)
- FIN_ID → Ref → FINANCE_TRANSACTION
- ACTION, NOTE, ACTOR_ID → Text
- BEFORE_JSON, AFTER_JSON → Text (hidden)
- CREATED_AT → Date

**Step 3:** Hide: ID, FIN_ID, BEFORE_JSON, AFTER_JSON

**Step 4:** Editable? = FALSE for ALL columns (read-only table)

---

## PART 4 — ENUM / VALID_IF CONFIG

For each enum-controlled field, go to **Data → Columns → [Table] → [Column]** and set **Valid_If**.

**AppSheet Valid_If:** Paste the exact formula. Do NOT enable "Allow other values" in List/Choice.

### 4.1 HO_SO_MASTER.HO_SO_TYPE_ID

- Table: HO_SO_MASTER | Column: HO_SO_TYPE_ID (Ref → MASTER_CODE)
- Valid_If:
```
IN([HO_SO_TYPE_ID], SELECT(MASTER_CODE[ID], AND([MASTER_GROUP] = "HO_SO_TYPE", [STATUS] = "ACTIVE", [IS_DELETED] = FALSE)))
```

### 4.2 HO_SO_MASTER.STATUS

- Table: HO_SO_MASTER | Column: STATUS
- Valid_If: Same pattern with ENUM_GROUP = "HO_SO_STATUS"
- Editable? = FALSE (GAS action only)

### 4.3 HO_SO_FILE.FILE_GROUP

- Table: HO_SO_FILE | Column: FILE_GROUP
- Valid_If:
```
IN([FILE_GROUP], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FILE_GROUP", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```

### 4.4 HO_SO_RELATION.STATUS

- Table: HO_SO_RELATION | Column: STATUS
- Valid_If: ENUM_GROUP = "HO_SO_STATUS"
- Editable? = FALSE

### 4.5 TASK_MAIN.TASK_TYPE

- Valid_If: ENUM_GROUP = "TASK_TYPE"

### 4.6 TASK_MAIN.STATUS

- Valid_If: ENUM_GROUP = "TASK_STATUS"
- Editable? = FALSE

### 4.7 TASK_MAIN.PRIORITY

- Valid_If: ENUM_GROUP = "TASK_PRIORITY"

### 4.8 TASK_MAIN.RELATED_ENTITY_TYPE

- Valid_If: ENUM_GROUP = "RELATED_ENTITY_TYPE"

### 4.9 TASK_ATTACHMENT.ATTACHMENT_TYPE

- Valid_If:
```
IN([ATTACHMENT_TYPE], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "TASK_ATTACHMENT_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```

### 4.10 FINANCE_TRANSACTION.TRANS_TYPE

- Valid_If: ENUM_GROUP = "FINANCE_TYPE"
- Editable_If: `[STATUS] <> "CONFIRMED"`

### 4.11 FINANCE_TRANSACTION.STATUS

- Valid_If: ENUM_GROUP = "FINANCE_STATUS"
- Editable? = FALSE

### 4.12 FINANCE_TRANSACTION.CATEGORY

- Valid_If: ENUM_GROUP = "FIN_CATEGORY"
- Editable_If: `[STATUS] <> "CONFIRMED"`

### 4.13 FINANCE_TRANSACTION.PAYMENT_METHOD

- Valid_If: ENUM_GROUP = "PAYMENT_METHOD"
- Editable_If: `[STATUS] <> "CONFIRMED"`

### 4.14 FINANCE_TRANSACTION.RELATED_ENTITY_TYPE

- Valid_If: ENUM_GROUP = "RELATED_ENTITY_TYPE"
- Editable_If: `[STATUS] <> "CONFIRMED"`

### 4.15 FINANCE_ATTACHMENT.ATTACHMENT_TYPE

- Valid_If:
```
IN([ATTACHMENT_TYPE], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FINANCE_ATTACHMENT_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```

---

## PART 5 — UX → VIEW CREATION

Go to **UX → Views**. Create each view. Use exact names.

### 5.1 HO_SO Views

- [ ] **HO_SO_LIST** — New View → Name: HO_SO_LIST → Data: HO_SO_MASTER → Type: Table → Slice: HO_SO_ALL (IS_DELETED = FALSE)
- [ ] **HO_SO_DETAIL** — New View → Name: HO_SO_DETAIL → Data: HO_SO_MASTER → Type: Detail
- [ ] **HO_SO_FORM** — New View → Name: HO_SO_FORM → Data: HO_SO_MASTER → Type: Form

### 5.2 TASK Views

- [ ] **TASK_LIST** — New View → Name: TASK_LIST → Data: TASK_MAIN → Type: Table → Slice: TASK_OPEN (STATUS != "DONE" AND STATUS != "ARCHIVED")
- [ ] **TASK_DETAIL** — New View → Name: TASK_DETAIL → Data: TASK_MAIN → Type: Detail
- [ ] **TASK_FORM** — New View → Name: TASK_FORM → Data: TASK_MAIN → Type: Form

### 5.3 FINANCE Views

- [ ] **FINANCE_LIST** — New View → Name: FINANCE_LIST → Data: FINANCE_TRANSACTION → Type: Table → Slice: FINANCE_PENDING (STATUS = "NEW") or FINANCE_CONFIRMED
- [ ] **FINANCE_DETAIL** — New View → Name: FINANCE_DETAIL → Data: FINANCE_TRANSACTION → Type: Detail
- [ ] **FINANCE_FORM** — New View → Name: FINANCE_FORM → Data: FINANCE_TRANSACTION → Type: Form

### 5.4 Child Forms (for inline add)

- [ ] **HO_SO_FILE_FORM** — Data: HO_SO_FILE → Type: Form
- [ ] **HO_SO_RELATION_FORM** — Data: HO_SO_RELATION → Type: Form
- [ ] **TASK_CHECKLIST_FORM** — Data: TASK_CHECKLIST → Type: Form
- [ ] **TASK_ATTACHMENT_FORM** — Data: TASK_ATTACHMENT → Type: Form
- [ ] **FINANCE_ATTACHMENT_FORM** — Data: FINANCE_ATTACHMENT → Type: Form

---

## PART 6 — INLINE RELATION SETUP

### 6.1 HO_SO_DETAIL → HO_SO_FILE

- [ ] Open UX → HO_SO_DETAIL
- [ ] Add **Related table** or **Inline view**: HO_SO_FILE
- [ ] Filter: `[HO_SO_ID] = [HO_SO_MASTER].[ID]` (or equivalent: current row's ID)
- [ ] Confirm HO_SO_ID IsPartOf = TRUE (already set in Part 3.2)
- [ ] Confirm "Add" button appears for HO_SO_FILE when viewing HO_SO_DETAIL
- [ ] Test: Open one HO_SO → scroll to Related HO_SO_FILE → tap + → form opens with HO_SO_ID pre-filled

### 6.2 HO_SO_DETAIL → HO_SO_RELATION

- [ ] Add Related table: HO_SO_RELATION
- [ ] Filter: `OR([FROM_HO_SO_ID] = [HO_SO_MASTER].[ID], [TO_HO_SO_ID] = [HO_SO_MASTER].[ID])`
- [ ] IsPartOf is OFF (dual ref); user selects FROM/TO when adding

### 6.3 TASK_DETAIL → TASK_CHECKLIST

- [ ] Add Related table: TASK_CHECKLIST
- [ ] Filter: `[TASK_ID] = [TASK_MAIN].[ID]`
- [ ] Confirm TASK_ID IsPartOf = TRUE
- [ ] Test: Open task → Related TASK_CHECKLIST → tap + → TASK_ID pre-filled

### 6.4 TASK_DETAIL → TASK_ATTACHMENT

- [ ] Add Related table: TASK_ATTACHMENT
- [ ] Filter: `[TASK_ID] = [TASK_MAIN].[ID]`
- [ ] Confirm TASK_ID IsPartOf = TRUE
- [ ] Test: Open task → Related TASK_ATTACHMENT → tap + → upload file → save → file appears

### 6.5 TASK_DETAIL → TASK_UPDATE_LOG

- [ ] Add Related table: TASK_UPDATE_LOG (read-only; no Add)
- [ ] Filter: `[TASK_ID] = [TASK_MAIN].[ID]`

### 6.6 FINANCE_DETAIL → FINANCE_ATTACHMENT

- [ ] Add Related table: FINANCE_ATTACHMENT
- [ ] Filter: `[FINANCE_ID] = [FINANCE_TRANSACTION].[ID]`
- [ ] Confirm FINANCE_ID IsPartOf = TRUE
- [ ] Test: Open transaction → Related FINANCE_ATTACHMENT → tap + → upload file → save

### 6.7 FINANCE_DETAIL → FINANCE_LOG

- [ ] Add Related table: FINANCE_LOG (read-only; no Add)
- [ ] Filter: `[FIN_ID] = [FINANCE_TRANSACTION].[ID]`

---

## PART 7 — FORM CONFIGURATION

For each form view, set column order and visibility.

### 7.1 HO_SO_FORM

- [ ] Open UX → HO_SO_FORM → Form columns
- [ ] Order: HO_SO_TYPE_ID, CODE, NAME, HTX_ID, OWNER_ID, PHONE, EMAIL, ID_NO, ADDRESS, START_DATE, END_DATE, NOTE, TAGS_TEXT, STATUS, PENDING_ACTION
- [ ] Hide: ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED
- [ ] STATUS: Editable? = FALSE

### 7.2 HO_SO_FILE_FORM

- [ ] Order: FILE_GROUP, FILE_NAME, FILE_URL, NOTE
- [ ] Hide: ID, HO_SO_ID, DRIVE_FILE_ID, STATUS, CREATED_AT, CREATED_BY
- [ ] FILE_URL: Visible, Editable, Type = File (already set in Data)

### 7.3 HO_SO_RELATION_FORM

- [ ] Order: FROM_HO_SO_ID, TO_HO_SO_ID, RELATION_TYPE, START_DATE, END_DATE, NOTE
- [ ] Hide: ID, STATUS, CREATED_AT, CREATED_BY

### 7.4 TASK_FORM

- [ ] Order: TASK_TYPE, TITLE, TASK_CODE, PRIORITY, OWNER_ID, REPORTER_ID, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, START_DATE, DUE_DATE, DESCRIPTION, RESULT_NOTE, STATUS
- [ ] Hide: ID, DONE_AT, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED
- [ ] STATUS: Editable? = FALSE

### 7.5 TASK_CHECKLIST_FORM

- [ ] Order: ITEM_NO, SORT_ORDER, TITLE, IS_REQUIRED, NOTE
- [ ] Hide: ID, TASK_ID, IS_DONE, DONE_AT, DONE_BY, CREATED_AT, CREATED_BY

### 7.6 TASK_ATTACHMENT_FORM

- [ ] Order: ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE
- [ ] Hide: ID, TASK_ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY
- [ ] FILE_URL: Visible, Editable

### 7.7 FINANCE_FORM

- [ ] Order: TRANS_TYPE, TRANS_DATE, CATEGORY, AMOUNT, DON_VI_ID, COUNTERPARTY, PAYMENT_METHOD, REFERENCE_NO, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, DESCRIPTION, EVIDENCE_URL, TRANS_CODE, STATUS
- [ ] Hide: ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED, CONFIRMED_AT, CONFIRMED_BY
- [ ] Editable_If for business fields: `[STATUS] <> "CONFIRMED"`
- [ ] STATUS: Editable? = FALSE

### 7.8 FINANCE_ATTACHMENT_FORM

- [ ] Order: ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE
- [ ] Hide: ID, FINANCE_ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY
- [ ] FILE_URL: Visible, Editable

---

## PART 8 — INLINE VIEW DISPLAY

For each Related/Inline section under parent Detail, configure visible columns.

### 8.1 HO_SO_FILE (under HO_SO_DETAIL)

- [ ] Show: FILE_GROUP, FILE_NAME, FILE_URL, NOTE
- [ ] Hide: ID, HO_SO_ID, DRIVE_FILE_ID, STATUS, CREATED_AT, CREATED_BY

### 8.2 HO_SO_RELATION (under HO_SO_DETAIL)

- [ ] Show: RELATION_TYPE, FROM_HO_SO_ID, TO_HO_SO_ID, START_DATE, NOTE
- [ ] Hide: ID, END_DATE, STATUS, CREATED_AT, CREATED_BY

### 8.3 TASK_CHECKLIST (under TASK_DETAIL)

- [ ] Show: ITEM_NO, SORT_ORDER, TITLE, IS_REQUIRED, IS_DONE, NOTE
- [ ] Hide: ID, TASK_ID, DONE_AT, DONE_BY, CREATED_AT, CREATED_BY

### 8.4 TASK_ATTACHMENT (under TASK_DETAIL)

- [ ] Show: ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE
- [ ] Hide: ID, TASK_ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY

### 8.5 TASK_UPDATE_LOG (under TASK_DETAIL)

- [ ] Show: ACTION, OLD_STATUS, NEW_STATUS, NOTE, CREATED_AT
- [ ] Hide: ID, TASK_ID, ACTOR_ID

### 8.6 FINANCE_ATTACHMENT (under FINANCE_DETAIL)

- [ ] Show: ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE
- [ ] Hide: ID, FINANCE_ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY

### 8.7 FINANCE_LOG (under FINANCE_DETAIL)

- [ ] Show: ACTION, NOTE, ACTOR_ID, CREATED_AT
- [ ] Hide: ID, FIN_ID, BEFORE_JSON, AFTER_JSON

---

## PART 9 — FINAL TEST FLOW

### 9.1 Test HO_SO File Upload

1. [ ] Open app
2. [ ] Go to HO_SO (HO_SO_LIST)
3. [ ] Open one HO_SO record (HO_SO_DETAIL)
4. [ ] Scroll to bottom
5. [ ] Find "Related HO_SO_FILE" or "HO_SO_FILE" section
6. [ ] Tap "+" or "Add"
7. [ ] Form opens with HO_SO_ID pre-filled (or hidden)
8. [ ] Select FILE_GROUP (e.g. CCCD)
9. [ ] Enter FILE_NAME (optional)
10. [ ] Tap FILE_URL → Upload file (camera or file picker)
11. [ ] Add NOTE (optional)
12. [ ] Save
13. [ ] Confirm new file row appears under HO_SO
14. [ ] Tap file row → file opens or downloads

### 9.2 Test TASK Attachment

1. [ ] Open app → TASK (TASK_LIST)
2. [ ] Open one task (TASK_DETAIL)
3. [ ] Scroll to Related TASK_ATTACHMENT
4. [ ] Tap "+"
5. [ ] Select ATTACHMENT_TYPE (e.g. RESULT)
6. [ ] Enter TITLE
7. [ ] Upload file via FILE_URL
8. [ ] Save
9. [ ] Confirm attachment appears in list
10. [ ] Verify file is accessible

### 9.3 Test FINANCE Attachment

1. [ ] Open app → FINANCE (FINANCE_LIST)
2. [ ] Open one transaction (FINANCE_DETAIL)
3. [ ] Scroll to Related FINANCE_ATTACHMENT
4. [ ] Tap "+"
5. [ ] Select ATTACHMENT_TYPE (e.g. INVOICE)
6. [ ] Enter TITLE
7. [ ] Upload file via FILE_URL
8. [ ] Save
9. [ ] Confirm evidence appears in list

### 9.4 Test TASK Checklist

1. [ ] Open task → Related TASK_CHECKLIST
2. [ ] Tap "+"
3. [ ] Enter ITEM_NO, SORT_ORDER (optional), TITLE, IS_REQUIRED
4. [ ] Save
5. [ ] Confirm checklist item appears (IS_DONE = No)

---

## PART 10 — COMMON ERRORS & FIX

| Error | Cause | Fix |
|-------|-------|-----|
| No "Related" section under parent detail | Ref not set, or inline view not added | Set child.PARENT_REF as Ref → Parent table; add Related table to Detail view |
| Cannot upload file | FILE_URL not File type | Data → Columns → [Table] → FILE_URL → Type = **File** |
| File not linked to parent | IsPartOf OFF, or parent ref not auto-filled | Set PARENT_REF column → IsPartOf = TRUE |
| "Related" shows wrong rows | Filter incorrect | Filter must be [PARENT_REF] = [PARENT_TABLE].[ID]; check table/column names |
| Valid_If rejects valid value | ENUM_DICTIONARY empty or wrong group | Run initAll() or seedEnumDictionary(); verify ENUM_GROUP and IS_ACTIVE |
| STATUS editable (should be readonly) | Editable? not set | Data → Columns → STATUS → Editable? = FALSE |
| FINANCE fields editable when CONFIRMED | Editable_If missing | Set Editable_If = `[STATUS] <> "CONFIRMED"` for business fields |
| HO_SO_ID / TASK_ID / FINANCE_ID visible in inline form | Show? not OFF | Form config → Hide parent ref when opened from parent |
| ENUM_DICTIONARY not found | Table not added | Data → Add table → Select ENUM_DICTIONARY sheet |

---

## PART 11 — FINAL OUTPUT SUMMARY

### 11.1 Full Checklist

- [ ] Part 1 Precheck complete
- [ ] Part 2 Tables setup complete (13 tables)
- [ ] Part 3 Columns config complete (all tables)
- [ ] Part 4 Enum/Valid_If complete (15+ fields)
- [ ] Part 5 Views created (18+ views)
- [ ] Part 6 Inline relations working (7 relations)
- [ ] Part 7 Form config complete (8 forms)
- [ ] Part 8 Inline display config complete (7 inline views)
- [ ] Part 9 Test flow passed (4 test scenarios)

### 11.2 Per-Table Config Summary

| Table | Key | Label | Ref Columns | IsPartOf | File Column | Valid_If Fields |
|-------|-----|-------|-------------|----------|-------------|----------------|
| HO_SO_MASTER | ID | NAME | HTX_ID | — | — | HO_SO_TYPE_ID, STATUS |
| HO_SO_FILE | ID | FILE_NAME | HO_SO_ID | ON | FILE_URL | FILE_GROUP |
| HO_SO_RELATION | ID | RELATION_TYPE | FROM, TO | OFF | — | STATUS |
| TASK_MAIN | ID | TITLE | RELATED_ENTITY_ID | — | — | TASK_TYPE, STATUS, PRIORITY, RELATED_ENTITY_TYPE |
| TASK_CHECKLIST | ID | TITLE | TASK_ID | ON | — | — |
| TASK_ATTACHMENT | ID | TITLE | TASK_ID | ON | FILE_URL | ATTACHMENT_TYPE |
| TASK_UPDATE_LOG | ID | ACTION | TASK_ID | OFF | — | — |
| FINANCE_TRANSACTION | ID | TRANS_CODE | DON_VI_ID, RELATED_ENTITY_ID | — | — | TRANS_TYPE, STATUS, CATEGORY, PAYMENT_METHOD, RELATED_ENTITY_TYPE |
| FINANCE_ATTACHMENT | ID | TITLE | FINANCE_ID | ON | FILE_URL | ATTACHMENT_TYPE |
| FINANCE_LOG | ID | ACTION | FIN_ID | OFF | — | — |

### 11.3 Per-View Config Summary

| View | Type | Table | Key Config |
|------|------|-------|------------|
| HO_SO_LIST | Table | HO_SO_MASTER | Slice: IS_DELETED = FALSE |
| HO_SO_DETAIL | Detail | HO_SO_MASTER | + HO_SO_FILE, HO_SO_RELATION inline |
| HO_SO_FORM | Form | HO_SO_MASTER | 14 visible fields |
| TASK_LIST | Table | TASK_MAIN | Slice: STATUS != DONE, ARCHIVED |
| TASK_DETAIL | Detail | TASK_MAIN | + TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG inline |
| TASK_FORM | Form | TASK_MAIN | 13 visible fields |
| FINANCE_LIST | Table | FINANCE_TRANSACTION | Slice: STATUS = NEW or CONFIRMED |
| FINANCE_DETAIL | Detail | FINANCE_TRANSACTION | + FINANCE_ATTACHMENT, FINANCE_LOG inline |
| FINANCE_FORM | Form | FINANCE_TRANSACTION | Editable_If STATUS <> CONFIRMED |
| HO_SO_FILE_FORM | Form | HO_SO_FILE | 4 fields; FILE_URL = File |
| TASK_ATTACHMENT_FORM | Form | TASK_ATTACHMENT | 4 fields; FILE_URL = File |
| FINANCE_ATTACHMENT_FORM | Form | FINANCE_ATTACHMENT | 4 fields; FILE_URL = File |

### 11.4 Inline Setup Summary

| Parent | Child | Filter | IsPartOf | Add Allowed |
|--------|-------|--------|----------|-------------|
| HO_SO_DETAIL | HO_SO_FILE | HO_SO_ID = current | ON | Yes |
| HO_SO_DETAIL | HO_SO_RELATION | FROM or TO = current | OFF | Yes |
| TASK_DETAIL | TASK_CHECKLIST | TASK_ID = current | ON | Yes |
| TASK_DETAIL | TASK_ATTACHMENT | TASK_ID = current | ON | Yes |
| TASK_DETAIL | TASK_UPDATE_LOG | TASK_ID = current | OFF | No |
| FINANCE_DETAIL | FINANCE_ATTACHMENT | FINANCE_ID = current | ON | Yes |
| FINANCE_DETAIL | FINANCE_LOG | FIN_ID = current | OFF | No |

### 11.5 Test Instructions

See Part 9. Execute all 4 test flows before declaring config complete.

### 11.6 Known Risks

- **ENUM_DICTIONARY:** Must exist and be populated before Valid_If works. Run initAll() in GAS first.
- **HO_SO_RELATION:** Dual ref; IsPartOf OFF. User must select FROM_HO_SO_ID and/or TO_HO_SO_ID when adding.
- **RELATION_TYPE:** No enum; free text. Consider MASTER_CODE later.
- **DON_VI_ID:** Must Ref **ACTIVE_DON_VI**; values must exist in DON_VI sheet.
- **AppSheet expression syntax:** If Valid_If fails, check AND() and SELECT() syntax for your AppSheet version.

### 11.7 Final Statement

**APP SHEET CONFIG CHECKLIST READY**

Execute Parts 1–9 in order. Verify with Part 9 test flows. Use Part 10 for troubleshooting. Phase 1 safe. CBV aligned.
