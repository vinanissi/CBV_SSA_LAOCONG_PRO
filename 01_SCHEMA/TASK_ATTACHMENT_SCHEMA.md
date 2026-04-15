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
| 3 | ATTACHMENT_TYPE | Text | No | Enum TASK_ATTACHMENT_TYPE |
| 4 | TITLE | Text | No | Display label |
| 5 | FILE_URL | Text | No | URL or legacy file column |
| 6 | DRIVE_FILE_ID | Text | No | Drive file ID |
| 7 | SOURCE_MODE | Text | No | UPLOAD \| LINK \| DRIVE |
| 8 | FILE_NAME | Text | No | Original filename |
| 9 | UPLOAD_FILE | File | No | AppSheet file upload column |
| 10 | FILE_EXT | Text | No | Extension (.jpg, .pdf …); GAS set |
| 11 | LINK_DOMAIN | Text | No | Domain when SOURCE_MODE=LINK; GAS set |
| 12 | SORT_ORDER | Number | No | Display order |
| 13 | STATUS | Text | No | ACTIVE \| ARCHIVED |
| 14 | NOTE | Text | No | |
| 15 | CREATED_AT | Datetime | No | |
| 16 | CREATED_BY | Text | No | |
| 17 | UPDATED_AT | Datetime | No | |
| 18 | UPDATED_BY | Text | No | |
| 19 | IS_DELETED | Yes/No | Yes | Soft delete |
