# Schema and Data Repair — Must-Fix Pass

**Date:** 2025-03-21  
**Scope:** Address selfAuditBootstrap blockers and data issues  

---

## 1. Files Changed

| File | Change |
|------|--------|
| 01_ENUM_CONFIG.js | Added ACCOUNTANT to ROLE enum |
| 00_CORE_CONSTANTS.js | Added ACCOUNTANT to CBV_ENUM.ROLE |
| 02_USER_SERVICE.js | Added ACCOUNTANT to CBV_USER_ROLES |
| 01_ENUM_SEED.js | Added ACCOUNTANT to ENUM_SEED_SPEC |
| 90_BOOTSTRAP_AUDIT_SCHEMA.js | Added ACTION, OLD_STATUS, NEW_STATUS, NOTE, RESULT_NOTE, FILE_NAME to TASK_UPDATE_LOG optionalColumns |
| 90_BOOTSTRAP_REPAIR.js | **New** — repairSchemaColumns, repairUserDirectoryBlanks, repairHoSoMasterBlanks, repairTaskUpdateLogBlanks, repairTaskMainHtxIdBlanks, repairSchemaAndData |
| 90_BOOTSTRAP_MENU.js | Added Run Schema & Data Repair menu item; runSchemaAndDataRepair handler |
| .clasp.json | Added 90_BOOTSTRAP_REPAIR.js to filePushOrder |

---

## 2. Schema Repairs Applied

| Table | Repair | Method |
|-------|--------|--------|
| TASK_MAIN | Add HTX_ID if missing | insertColumnBefore at schema position; non-destructive |
| TASK_UPDATE_LOG | Add UPDATE_TYPE if missing | insertColumnBefore at schema position; non-destructive |

Legacy columns kept for transition: ACTION, OLD_STATUS, NEW_STATUS, NOTE, RESULT_NOTE, FILE_NAME.

---

## 3. Data Backfill Rules

| Table.Column | Rule | Default / Logic |
|--------------|------|-----------------|
| USER_DIRECTORY.ROLE | Blank → OPERATOR | Safe default for non-admin users |
| USER_DIRECTORY.STATUS | Blank → ACTIVE | Standard default |
| HO_SO_MASTER.HO_SO_TYPE | Infer from ID prefix | HTX_→HTX, XV_→XA_VIEN, XE_→XE, TX_→TAI_XE; else flag manual |
| HO_SO_MASTER.STATUS | Blank → ACTIVE | Standard default |
| TASK_UPDATE_LOG.UPDATE_TYPE | From ACTION when blank | ACTION→UPDATE_TYPE map: note/Note/NOTE→NOTE, status_change→STATUS_CHANGE, etc.; else NOTE |
| TASK_UPDATE_LOG.ACTION | Blank → NOTE | Compatibility for legacy readers |
| TASK_MAIN.HTX_ID | Blank → first HTX in HO_SO_MASTER | When inferable; else flag manual |

---

## 4. Rows Needing Manual Review

After `repairSchemaAndData()`, check the returned object:

- **userManualReview:** USER_DIRECTORY rows where ROLE could not be filled (no valid enum)
- **hoSoManualReview:** HO_SO_MASTER rows where HO_SO_TYPE could not be inferred (ID not HTX_/XV_/XE_/TX_)
- **taskMainManualReview:** TASK_MAIN rows where HTX_ID is blank and no HTX exists in HO_SO_MASTER

---

## 5. Rerun Order

1. **seedEnumDictionary()** — Ensures ACCOUNTANT is in ENUM_DICTIONARY (or run initAll)
2. **repairSchemaAndData()** — Full repair pass (or use menu: Run Schema & Data Repair)
3. **selfAuditBootstrap()** — Verify blockers cleared
4. **verifyAppSheetReadiness()** — Confirm AppSheet-ready

---

## 6. Verification Commands

```javascript
// In Apps Script editor or clasp run
repairSchemaAndData({});
selfAuditBootstrap();
verifyAppSheetReadiness();
```
