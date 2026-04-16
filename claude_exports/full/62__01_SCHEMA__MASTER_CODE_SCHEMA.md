# MASTER_CODE Schema (Final)

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

## Purpose

Static/semi-static business master data only. MASTER_CODE does NOT store DON_VI or USER.

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key; MC_YYYYMMDD_xxxxx |
| 2 | MASTER_GROUP | Text | Yes | Family: TASK_TYPE, PROVINCE, etc. |
| 3 | CODE | Text | Yes | Unique per (MASTER_GROUP, CODE) |
| 4 | NAME | Text | No | Full canonical name |
| 5 | DISPLAY_TEXT | Text | No | UI override |
| 6 | STATUS | Text | Yes | ACTIVE \| INACTIVE \| ARCHIVED |
| 7 | SORT_ORDER | Number | No | Display order |
| 8 | IS_SYSTEM | Yes/No | No | System-seeded |
| 9 | ALLOW_EDIT | Yes/No | No | Admin editable |
| 10 | NOTE | Text | No | Admin note |
| 11 | CREATED_AT | Datetime | No | |
| 12 | CREATED_BY | Text | No | |
| 13 | UPDATED_AT | Datetime | No | |
| 14 | UPDATED_BY | Text | No | |
| 15 | IS_DELETED | Yes/No | Yes | Soft delete |

---

## Exclusions

- **DON_VI** is NOT in MASTER_CODE. Use DON_VI table.
- **USER** is NOT in MASTER_CODE. Use USER_DIRECTORY table.

---

## Common MASTER_GROUPS

| MASTER_GROUP | Used By |
|--------------|---------|
| TASK_TYPE | TASK_MAIN.TASK_TYPE_ID |
| (others) | Various reference fields |
