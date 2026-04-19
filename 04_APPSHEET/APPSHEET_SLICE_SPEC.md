# APPSHEET SLICE SPEC

**Full map:** APPSHEET_SLICE_MAP.md

## Required for Ref Columns

### ACTIVE_USERS
Source: USER_DIRECTORY
Condition: `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)`
Used by: OWNER_ID, REPORTER_ID, DONE_BY, CONFIRMED_BY

### ACTIVE_HTX
Source: HO_SO_MASTER
Condition: `AND([HO_SO_TYPE_ID].[CODE] = "HTX", [IS_DELETED] = FALSE)`
Used by: HO_SO_MASTER.HTX_ID, TASK_MAIN.HTX_ID (legacy)

### ACTIVE_DON_VI
Source: DON_VI
Condition: `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)`
Used by: TASK_MAIN.DON_VI_ID

### ACTIVE_TASK_TYPE
Source: MASTER_CODE
Condition: `AND([MASTER_GROUP] = "TASK_TYPE", [STATUS] = "ACTIVE", [IS_DELETED] = FALSE)`
Used by: TASK_MAIN.TASK_TYPE_ID

### ACTIVE_MASTER_CODES
Source: MASTER_CODE
Condition: `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)`
Used by: polymorphic / future MASTER_GROUP refs (not DON_VI — use DON_VI table + DON_VI_ID on tables)

## Business Slices

### HO_SO_ACTIVE
Source: HO_SO_MASTER
Condition: `[IS_DELETED] = FALSE`

### TASK_OPEN
Source: TASK_MAIN
Condition: `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))`
PRO flow: NEW → IN_PROGRESS → DONE / CANCELLED

### TASK_DONE
Source: TASK_MAIN
Condition: `[STATUS] = "DONE"`

### FIN_DRAFT
Source: FINANCE_TRANSACTION
Condition: `[STATUS] = "NEW"`
Referenced by: **FIN_CONFIRM_QUEUE** (view — pending confirmation; same slice, not a separate slice name).

### FIN_CONFIRMED
Source: FINANCE_TRANSACTION
Condition: `[STATUS] = "CONFIRMED"`

### FIN_EXPORT_CSV
Source: FINANCE_TRANSACTION
Condition: Lọc theo `FIN_EXPORT_FILTER` (chu kỳ `DATE_FROM`–`DATE_TO`, tuỳ chọn `DON_VI_ID`, tuỳ chọn `USER_REF_ID` → `CREATED_BY`) — công thức đầy đủ: `02_MODULES/FINANCE/APPSHEET_UX_SPEC.md`.
