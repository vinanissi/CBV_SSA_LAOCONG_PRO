# AppSheet Deploy Checklist Master — CBV_SSA_LAOCONG_PRO

**Operator/build checklist.** Execute in AppSheet Editor. Phase 1 safe.

---

## Prerequisites

- [ ] initAll() run; protectSensitiveSheets() run
- [ ] Google Sheets workbook has all required sheets
- [ ] AppSheet app connected to workbook
- [ ] ENUM_DICTIONARY populated (seedEnumDictionary)

---

## 1. Add Tables

Order: HO_SO_MASTER, HO_SO_FILE, HO_SO_RELATION, TASK_MAIN, TASK_CHECKLIST, TASK_UPDATE_LOG, TASK_ATTACHMENT, FINANCE_TRANSACTION, FINANCE_ATTACHMENT, FINANCE_LOG, ENUM_DICTIONARY, MASTER_CODE, ADMIN_AUDIT_LOG (admin app)

Key = ID for all. Label per 01_TABLES/APPSHEET_TABLE_CONFIG_MASTER.

---

## 2. Columns Config

Per table: Data → Columns → [Table]. Set types, Hide, Editable.

**Critical Editable=FALSE:**
- TASK_MAIN: ID, STATUS, PROGRESS_PERCENT, DONE_AT, CREATED_*, UPDATED_*
- TASK_CHECKLIST: ID, TASK_ID, IS_DONE, DONE_AT, DONE_BY, CREATED_*
- TASK_UPDATE_LOG: ALL columns (operationally read-only)
- FINANCE_TRANSACTION: STATUS; business fields when STATUS="CONFIRMED" (Editable_If)
- Log tables: ALL columns

See 01_TABLES/APPSHEET_FIELD_POLICY_MASTER.

---

## 3. Ref Configuration

Per 01_TABLES/APPSHEET_TABLE_CONFIG_MASTER (Ref Map):
- HO_SO_ID → HO_SO_MASTER, TASK_ID → TASK_MAIN, FINANCE_ID → FINANCE_TRANSACTION, etc.
- IsPartOf = ON for child tables (HO_SO_FILE, TASK_CHECKLIST, TASK_ATTACHMENT, FINANCE_ATTACHMENT)

---

## 4. Enum / Valid_If

For each enum field, set Valid_If per 02_BINDING/APPSHEET_ENUM_MASTER_CODE_BINDING.

Pattern: `IN([FIELD], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "GROUP", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))`

Do NOT enable "Allow other values".

---

## 5. Views

Create per 03_VIEWS_ACTIONS/APPSHEET_VIEW_MASTER:
- HO_SO_LIST, HO_SO_DETAIL, HO_SO_FORM
- TASK_LIST, TASK_DETAIL, TASK_FORM
- FINANCE_LIST, FINANCE_DETAIL, FINANCE_FORM
- Child forms: HO_SO_FILE_FORM, TASK_CHECKLIST_FORM, TASK_ATTACHMENT_FORM, FINANCE_ATTACHMENT_FORM, etc.

---

## 6. Inline Relations

| Parent | Child | Filter | IsPartOf | Add |
|--------|-------|--------|----------|-----|
| HO_SO_DETAIL | HO_SO_FILE | [HO_SO_ID]=[HO_SO_MASTER].[ID] | ON | Yes |
| HO_SO_DETAIL | HO_SO_RELATION | FROM or TO = current | OFF | Yes |
| TASK_DETAIL | TASK_CHECKLIST | [TASK_ID]=[TASK_MAIN].[ID] | ON | Yes |
| TASK_DETAIL | TASK_ATTACHMENT | [TASK_ID]=[TASK_MAIN].[ID] | ON | Yes |
| TASK_DETAIL | TASK_UPDATE_LOG | [TASK_ID]=[TASK_MAIN].[ID] | OFF | No |
| FINANCE_DETAIL | FINANCE_ATTACHMENT | [FINANCE_ID]=[FINANCE_TRANSACTION].[ID] | ON | Yes |
| FINANCE_DETAIL | FINANCE_LOG | [FIN_ID]=[FINANCE_TRANSACTION].[ID] | OFF | No |

---

## 7. FILE_URL = File Type

For HO_SO_FILE, TASK_ATTACHMENT, FINANCE_ATTACHMENT: Data → Columns → FILE_URL → Type = **File**.

---

## 8. TASK Workflow Lock

- [ ] STATUS, PROGRESS_PERCENT, DONE_AT (TASK_MAIN) — Editable=OFF, Editable_If=FALSE
- [ ] IS_DONE, DONE_AT, DONE_BY (TASK_CHECKLIST) — Editable=OFF, Editable_If=FALSE
- [ ] TASK_UPDATE_LOG — All columns Editable=OFF, Editable_If=FALSE
- [ ] Actions call GAS webhook — NOT "Update row"

---

## 9. Slices

Per 03_VIEWS_ACTIONS/APPSHEET_SLICE_SECURITY_MASTER:
- HO_SO_ALL: IS_DELETED = FALSE
- TASK_OPEN: STATUS in (NEW, ASSIGNED, IN_PROGRESS, WAITING)
- FIN_DRAFT: STATUS = "NEW"
- FIN_CONFIRMED: STATUS = "CONFIRMED"

---

## 10. Verify

- [ ] verifyAppSheetReadiness()
- [ ] Test: create HO_SO, add file; create TASK, add checklist, add attachment; create FINANCE, add attachment

---

## Common Errors

| Error | Fix |
|-------|-----|
| FILE_URL not uploadable | Type = File |
| Related section missing | Set Ref, add Related table to Detail |
| Valid_If rejects | ENUM_DICTIONARY populated? ENUM_GROUP correct? |
| STATUS editable | Editable? = FALSE |
| FINANCE editable when CONFIRMED | Editable_If = `[STATUS] <> "CONFIRMED"` |
