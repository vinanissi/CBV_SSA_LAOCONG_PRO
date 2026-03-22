# Data Quality Repair — Report

**Date:** 2025-03-21  
**Scope:** Enum/data-quality fixes after schema blockers resolved  

---

## 1. Exact Rows Fixed (by repair logic)

| Table | Column | Row(s) | From | To | Decision |
|-------|--------|--------|------|-----|----------|
| USER_DIRECTORY | ROLE | blank row | (blank) | OPERATOR | Safe default for non-admin |
| USER_DIRECTORY | STATUS | blank row | (blank) | ACTIVE | Safe default |
| HO_SO_MASTER | HO_SO_TYPE | rows where ID prefix HTX_/XV_/XE_/TX_ | (blank) | HTX/XA_VIEN/XE/TAI_XE | Inferred from ID prefix |
| HO_SO_MASTER | STATUS | blank rows | (blank) | ACTIVE or NEW | ACTIVE if has HO_SO_FILE rows; else NEW |
| HO_SO_FILE | FILE_GROUP | 2 blank rows | (blank) | KHAC | Unknown = Khác (other) |
| FINANCE_TRANSACTION | STATUS | 1 blank row | (blank) | NEW | Safe default |
| FINANCE_TRANSACTION | TRANS_TYPE | 1 blank row | (blank) | INCOME or EXPENSE | Only if inferable from CATEGORY (THU_KHAC→INCOME, CHI_KHAC→EXPENSE, etc.) |
| TASK_UPDATE_LOG | ACTION | rows 7, 12 (and any other blank) | (blank) | NOTE | Compatibility with legacy readers |
| TASK_UPDATE_LOG | UPDATE_TYPE | blank where ACTION blank | (blank) | NOTE | Default |

**Note:** `repairSchemaAndData()` returns `rowsFixed` with exact `{ sheet, row, col, from, to, decision }` for each repair. Run it and inspect the result for row-level details.

---

## 2. Exact Enum Changes Made

| Enum | Change |
|------|--------|
| ROLE | ACCOUNTANT already added (previous pass). 01_ENUM_CONFIG, 00_CORE_CONSTANTS, 02_USER_SERVICE, 01_ENUM_SEED. |

No new enum changes in this pass. ACCOUNTANT support was added in the schema repair pass.

---

## 3. Rows Still Needing Manual Review

After `repairSchemaAndData()`, inspect `manualReview`:

| Table | Column | Condition |
|-------|--------|-----------|
| HO_SO_MASTER | HO_SO_TYPE | ID not prefixed HTX_/XV_/XE_/TX_ — exact rows returned in manualReview |
| FINANCE_TRANSACTION | TRANS_TYPE | Blank and CATEGORY not in {THU_KHAC,VAN_HANH,NHIEN_LIEU,SUA_CHUA,LUONG,CHI_KHAC} — exact row id returned |
| TASK_MAIN | HTX_ID | Blank and no HTX in HO_SO_MASTER |
| USER_DIRECTORY | ROLE | Blank when validRoles has no OPERATOR (should not occur) |

---

## 4. Files Changed

| File | Change |
|------|--------|
| 90_BOOTSTRAP_REPAIR.gs | Extended repairUserDirectoryBlanks (rowsFixed, ACCOUNTANT normalize); repairHoSoMasterBlanks (STATUS=ACTIVE/NEW by HO_SO_FILE, rowsFixed); repairHoSoFileBlanks (new); repairFinanceTransactionBlanks (new); repairTaskUpdateLogBlanks (rowsFixed); repairSchemaAndData (hoSoFile, finance, rowsFixed, manualReview, rerunOrder) |

---

## 5. Exact Rerun Order

1. **seedEnumDictionary()** — Ensure ACCOUNTANT in ENUM_DICTIONARY (or run initAll)
2. **repairSchemaAndData({})** — Full repair (or `repairSchemaAndData({ skipSchema: true })` for data-only)
3. **selfAuditBootstrap()** — Verify findings cleared
4. **verifyAppSheetReadiness()** — Confirm AppSheet-ready

---

## 6. Repair Decision Log

| Rule | Rationale |
|------|------------|
| USER_DIRECTORY.ROLE blank → OPERATOR | Conservative; avoids granting ADMIN |
| USER_DIRECTORY.STATUS blank → ACTIVE | Standard default |
| HO_SO_MASTER.HO_SO_TYPE | Infer from ID prefix; else flag — no guess |
| HO_SO_MASTER.STATUS | ACTIVE if has HO_SO_FILE (in use); else NEW |
| HO_SO_FILE.FILE_GROUP blank → KHAC | Khác = other/unknown per enum |
| FINANCE_TRANSACTION.STATUS blank → NEW | Safe draft state |
| FINANCE_TRANSACTION.TRANS_TYPE | Only infer from CATEGORY; else flag — no guess |
| TASK_UPDATE_LOG.ACTION blank → NOTE | Legacy compatibility |
