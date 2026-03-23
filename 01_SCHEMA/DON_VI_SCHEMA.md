# DON_VI Schema (Final)

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

## Purpose

Sole organization/unit table. Covers CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM. There is NO separate HTX table. DON_VI is NOT stored in MASTER_CODE.

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key; DV_YYYYMMDD_<6-8 chars> |
| 2 | DON_VI_TYPE | Text | Yes | CONG_TY \| HTX \| DOI_KINH_DOANH \| BO_PHAN \| NHOM |
| 3 | CODE | Text | Yes | Machine-safe |
| 4 | NAME | Text | Yes | Full canonical name |
| 5 | DISPLAY_TEXT | Text | No | UI override |
| 6 | SHORT_NAME | Text | No | Abbreviated label |
| 7 | PARENT_ID | Text | No | Ref DON_VI (hierarchical parent) |
| 8 | STATUS | Text | Yes | ACTIVE \| INACTIVE \| ARCHIVED |
| 9 | SORT_ORDER | Number | No | Display order |
| 10 | MANAGER_USER_ID | Text | No | Ref USER_DIRECTORY |
| 11 | EMAIL | Text | No | Unit contact |
| 12 | PHONE | Text | No | Unit contact |
| 13 | ADDRESS | Text | No | Physical address |
| 14 | NOTE | Text | No | Admin note |
| 15 | CREATED_AT | Datetime | No | |
| 16 | CREATED_BY | Text | No | |
| 17 | UPDATED_AT | Datetime | No | |
| 18 | UPDATED_BY | Text | No | |
| 19 | IS_DELETED | Yes/No | Yes | Soft delete |

---

## References

| Ref Field | Target | Notes |
|-----------|--------|-------|
| PARENT_ID | DON_VI | Self-reference; root = blank |
| MANAGER_USER_ID | USER_DIRECTORY | Unit manager |

---

## Inbound References

| Ref Field | Table | Notes |
|-----------|-------|-------|
| DON_VI_ID | TASK_MAIN | Task organizational ownership |
| DON_VI_ID | FINANCE_TRANSACTION | Finance unit attribution |

---

## DON_VI_TYPE Values

| Value | Display |
|-------|---------|
| CONG_TY | Công ty |
| HTX | Hợp tác xã |
| DOI_KINH_DOANH | Đội kinh doanh |
| BO_PHAN | Bộ phận |
| NHOM | Nhóm |
