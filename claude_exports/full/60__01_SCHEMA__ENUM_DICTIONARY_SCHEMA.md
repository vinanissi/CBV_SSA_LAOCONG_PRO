# ENUM_DICTIONARY Schema (Final)

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

## Purpose

Enum dictionary only. Locked workflow enums.

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key |
| 2 | ENUM_GROUP | Text | Yes | Family: TASK_STATUS, ROLE, etc. |
| 3 | ENUM_VALUE | Text | Yes | Machine-safe value |
| 4 | DISPLAY_TEXT | Text | No | User-facing label |
| 5 | SORT_ORDER | Number | No | Display order |
| 6 | IS_ACTIVE | Yes/No | No | Controls usability |
| 7 | NOTE | Text | No | Admin note |
| 8 | CREATED_AT | Datetime | No | |
| 9 | CREATED_BY | Text | No | |
| 10 | UPDATED_AT | Datetime | No | |
| 11 | UPDATED_BY | Text | No | |
