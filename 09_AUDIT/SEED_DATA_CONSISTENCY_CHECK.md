# Seed Data Consistency Check

**Source:** 02_SEED/*.tsv  
**Last verified:** 2025-03-22

---

## Cross-Table References Verified

| Ref | Source | Target | Status |
|-----|--------|--------|--------|
| DON_VI.MANAGER_USER_ID | DON_VI | USER_DIRECTORY.ID | ✓ All 9 managers exist |
| DON_VI.PARENT_ID | DON_VI | DON_VI.ID | ✓ Hierarchy valid |
| DON_VI.DON_VI_TYPE | DON_VI | ENUM_DICTIONARY (DON_VI_TYPE) | ✓ CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM |
| DON_VI.STATUS | DON_VI | RECORD_STATUS / ACTIVE | ✓ |
| USER_DIRECTORY.DON_VI_ID | USER_DIRECTORY | DON_VI.ID | ✓ All refs exist |
| USER_DIRECTORY.ROLE | USER_DIRECTORY | ENUM_DICTIONARY (USER_ROLE) | ✓ ADMIN, OPERATOR, VIEWER |
| USER_DIRECTORY.STATUS | USER_DIRECTORY | RECORD_STATUS | ✓ ACTIVE |

---

## Key Relationships

- **DON_VI → USER_DIRECTORY:** MANAGER_USER_ID points to UD_20250322_001..009
- **USER_DIRECTORY → DON_VI:** DON_VI_ID (optional) points to DV_20250322_001..009
- **Enum alignment:** DON_VI_TYPE, USER_ROLE, TASK_STATUS, PRIORITY, RECORD_STATUS, YES_NO

---

## Load Order for Import

1. ENUM_DICTIONARY (no refs)
2. USER_DIRECTORY (refs ENUM only)
3. DON_VI (refs USER_DIRECTORY + ENUM)
4. MASTER_CODE (no refs to other seed tables)

---

## Summary

| Table | Rows | Refs validated |
|-------|------|----------------|
| ENUM_DICTIONARY | 19 | — |
| USER_DIRECTORY | 11 | ROLE, STATUS, DON_VI_ID |
| DON_VI | 9 | DON_VI_TYPE, STATUS, PARENT_ID, MANAGER_USER_ID |
| MASTER_CODE | 25 | — |
