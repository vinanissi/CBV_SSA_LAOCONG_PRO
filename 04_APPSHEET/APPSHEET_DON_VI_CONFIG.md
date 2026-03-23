# AppSheet DON_VI Table Config

**Purpose:** Key, label, ref, and slice configuration for the DON_VI organizational unit table.

---

## Key / Label

| Property | Value |
|----------|-------|
| Key | ID |
| Label | DISPLAY_TEXT |

**Label fallback:** If DISPLAY_TEXT is blank, use `IF(ISNOTBLANK([DISPLAY_TEXT]), [DISPLAY_TEXT], [NAME])`

---

## Ref Columns

| Column | Ref Target | Display | Editable |
|--------|------------|---------|----------|
| PARENT_ID | DON_VI | DISPLAY_TEXT | Yes (hierarchy) |
| MANAGER_USER_ID | ACTIVE_USERS | FULL_NAME (or DISPLAY_NAME) | Yes |

**PARENT_ID:** Self-reference for hierarchy. Filter to ACTIVE_DON_VI when used as dropdown.
**MANAGER_USER_ID:** Ref USER_DIRECTORY via ACTIVE_USERS slice.

---

## Slice: ACTIVE_DON_VI

| Property | Value |
|----------|-------|
| Source | DON_VI |
| Condition | `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)` |

Used by: TASK_MAIN.DON_VI_ID, DON_VI.PARENT_ID (optional filter)

---

## Enum Fields

| Column | ENUM_GROUP | Valid Values |
|--------|------------|--------------|
| DON_VI_TYPE | DON_VI_TYPE | CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM |
| STATUS | DON_VI_STATUS | ACTIVE, INACTIVE, ARCHIVED |

---

## Field Policy

| Field | Show | Editable | Notes |
|-------|------|----------|-------|
| ID | List (ref) | No | System key |
| DON_VI_TYPE | Yes | Yes | Dropdown |
| CODE | Yes | Yes | Unique per type |
| NAME | Yes | Yes | Full name |
| DISPLAY_TEXT | Yes | Yes | UI label (required for refs) |
| SHORT_NAME | Yes | Yes | Abbrev |
| PARENT_ID | Yes | Yes | Ref DON_VI |
| STATUS | Yes | Admin/GAS | ACTIVE/INACTIVE/ARCHIVED |
| SORT_ORDER | Yes | Yes | Number |
| MANAGER_USER_ID | Yes | Yes | Ref ACTIVE_USERS |
| EMAIL, PHONE, ADDRESS, NOTE | Yes | Yes | Contact |
| CREATED_AT, CREATED_BY | No | No | Audit |
| UPDATED_AT, UPDATED_BY | No | No | Audit |
| IS_DELETED | No | No | Slice only |

---

## Consuming Tables

| Table | Column | Ref Slice |
|-------|--------|-----------|
| TASK_MAIN | DON_VI_ID | ACTIVE_DON_VI |
