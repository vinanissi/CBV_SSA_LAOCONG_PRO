# AppSheet — HO_SO PRO (Small-Scale)

## Tables (data source)

| AppSheet table | Sheet | Key |
|----------------|-------|-----|
| HO_SO_MASTER | HO_SO_MASTER | ID |
| HO_SO_FILE | HO_SO_FILE | ID |
| HO_SO_RELATION | HO_SO_RELATION | ID |
| HO_SO_UPDATE_LOG | HO_SO_UPDATE_LOG | ID |

## Ref columns

| Column | Ref to | Suggested slice for dropdown |
|--------|--------|------------------------------|
| HO_SO_TYPE_ID | MASTER_CODE | `MASTER_CODE` where `MASTER_GROUP = HO_SO_TYPE`, `STATUS = ACTIVE` |
| DON_VI_ID | DON_VI | Active DON_VI |
| OWNER_ID, MANAGER_USER_ID | USER_DIRECTORY | Active users |
| HO_SO_ID (child) | HO_SO_MASTER | Parent row / `_RowNumber` |
| ACTOR_ID | USER_DIRECTORY | Optional; allow blank |

## Enum columns (Valid_If)

| Column | Enum group |
|--------|------------|
| STATUS | HO_SO_STATUS |
| PRIORITY | PRIORITY |
| RELATED_ENTITY_TYPE | RELATED_ENTITY_TYPE |
| ID_TYPE | ID_TYPE |
| SOURCE_CHANNEL | SOURCE_CHANNEL |
| FILE_TYPE | FILE_TYPE |
| ACTION_TYPE | HO_SO_ACTION_TYPE |

## Slices (examples)

```
HO_SO_MASTER_Active: IS_DELETED = FALSE
HO_SO_MASTER_MyItems: IS_DELETED = FALSE, OWNER_ID = [USER_REF]
HO_SO_MASTER_Expiring: IS_DELETED = FALSE, END_DATE within next 30 days (expression), STATUS not in (CLOSED, ARCHIVED)
HO_SO_MASTER_Expired: END_DATE < TODAY(), IS_DELETED = FALSE
HO_SO_FILE_Active: IS_DELETED = FALSE
HO_SO_RELATION_Active: IS_DELETED = FALSE
HO_SO_UPDATE_LOG_Active: IS_DELETED = FALSE
```

## Views

| View | Type | Content |
|------|------|---------|
| HO_SO_HOME | Menu | Links to list / my / expiring |
| HO_SO_MASTER_Table | Table | Slice Active |
| HO_SO_MASTER_Detail | Detail | Fields + **inline** FILE, RELATION, UPDATE_LOG |
| HO_SO_Form | Form | Create/edit; hide system fields |
| HO_SO_My_View | Deck/Gallery | Slice MyItems |
| HO_SO_Expiring_View | Table | Slice Expiring |
| HO_SO_Expired_View | Table | Slice Expired |
| HO_SO_FILE_Inline | Inline | HO_SO_ID = parent |
| HO_SO_RELATION_Inline | Inline | HO_SO_ID = parent |
| HO_SO_UPDATE_LOG_Inline | Inline | HO_SO_ID = parent; read-only |

## UX rules

1. **STATUS**: default `Editable_If` = `FALSE` for operators; actions call automation or grouped edit restricted to allowed transitions.
2. **HO_SO_CODE**: read-only; never show in create form as input.
3. **RELATED_TABLE**: enum or fixed list matching GAS whitelist: TASK, DON_VI, FINANCE_TRANSACTION, USER_DIRECTORY, HO_SO.
4. **Child tables**: prefer inline from Detail over editing raw child sheets.
5. **ACTOR_ID** on log: hidden; populated by backend if needed.

## Actions (suggested)

- “Gửi duyệt”: `IN_REVIEW`
- “Kích hoạt”: `ACTIVE`
- “Đóng hồ sơ”: `CLOSED` (maps to service `closeHoso` if using Apps Script automation)
- “Lưu trữ”: `ARCHIVED` / soft delete flow

---

*Bản spec này align với `05_GAS_RUNTIME/10_HOSO_*.gs` và `02_MODULES/HO_SO/HO_SO_MODULE_PRO.md`.*
