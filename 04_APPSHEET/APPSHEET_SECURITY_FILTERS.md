# APPSHEET SECURITY FILTERS

**Note:** User filters use USER_DIRECTORY.ID. OWNER_ID and REPORTER_ID store USER_DIRECTORY.ID, not email.

## HO_SO_MASTER
- ADMIN: `TRUE`
- OPERATOR: `OR(ISBLANK([OWNER_ID]), [OWNER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL())))))`
- VIEWER: `TRUE`

**Phạm vi HTX (multi-tenant):** Nếu dùng filter theo tổ chức, ví dụ `[HTX_ID] = [_USERINFO("htx_id")]`, **không** được áp dụng thuần cho bản ghi **gốc HTX** (`HO_SO_TYPE_ID` → `MASTER_CODE.CODE = "HTX"`, `HTX_ID` luôn trống). Dùng dạng:

`OR([HO_SO_TYPE_ID].[CODE] = "HTX", [HTX_ID] = [_USERINFO("htx_id")])`

(kết hợp thêm `USERROLE() = "ADMIN"` hoặc điều kiện org khác nếu cần).

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

Ghi chú: lọc theo đơn vị dùng DON_VI_ID (Ref DON_VI), không dùng MASTER_CODE cho đơn vị tổ chức.
