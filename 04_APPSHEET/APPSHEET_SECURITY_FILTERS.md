# APPSHEET SECURITY FILTERS

**Note:** User filters use USER_DIRECTORY.ID. OWNER_ID and REPORTER_ID store USER_DIRECTORY.ID, not email.

## HO_SO_MASTER
- ADMIN: `TRUE`
- OPERATOR: `OR(ISBLANK([OWNER_ID]), [OWNER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL())))))`
- VIEWER: `TRUE`

## TASK_MAIN
- ADMIN: `TRUE` (override bởi Security Filter bên dưới — ADMIN thấy tất cả)
- ALL ROLES (single filter):
  `OR(
    USERROLE() = "ADMIN",
    NOT([IS_PRIVATE]),
    AND(
      [IS_PRIVATE],
      OR(
        [OWNER_ID]    = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))),
        [REPORTER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))),
        CONTAINS([SHARED_WITH], ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))))
      )
    )
  )`

Note: Dùng `ANY()` thay `FIRST()`. Dùng `CONTAINS(list_col, value)` cho List column.

Note: `IS_PRIVATE=FALSE` (default) → tất cả thấy. `IS_PRIVATE=TRUE` → chỉ ADMIN/OWNER/REPORTER/SHARED_WITH.

## FINANCE_TRANSACTION
- ADMIN: `TRUE`
- OPERATOR: `TRUE`
- VIEWER: `TRUE`

Ghi chú: nếu sau này có UNIT_ID chuẩn thì thay bằng filter theo đơn vị.
