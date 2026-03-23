# TASK_ATTACHMENT Schema (Final)

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

## Purpose

File attachments for tasks.

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key |
| 2 | TASK_ID | Text | Yes | Ref TASK_MAIN |
| 3 | FILE_NAME | Text | No | Original filename |
| 4 | FILE_URL | Text | No | URL |
| 5 | DRIVE_FILE_ID | Text | No | Drive file ID |
| 6 | ATTACHMENT_TYPE | Text | No | Enum |
| 7 | TITLE | Text | No | Display label |
| 8 | NOTE | Text | No | |
| 9 | CREATED_AT | Datetime | No | |
| 10 | CREATED_BY | Text | No | |
| 11 | UPDATED_AT | Datetime | No | |
| 12 | UPDATED_BY | Text | No | |
| 13 | IS_DELETED | Yes/No | Yes | Soft delete |
