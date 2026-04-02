# DATA MODEL — HO_SO (PRO)

Canonical tables per **CBV final architecture**. Legacy columns (`HO_SO_TYPE`, `CODE`, `NAME`, `HTX_ID`, …) may still exist on old sheets for migration only; logic PRO **không** dùng chúng.

## HO_SO_MASTER

| Column | Type | Notes |
|--------|------|--------|
| ID | PK | |
| HO_SO_CODE | string | Unique; generated `HS-…` |
| TITLE | string | |
| DISPLAY_NAME | string | |
| HO_SO_TYPE_ID | ref | → `MASTER_CODE.ID`, `MASTER_GROUP=HO_SO_TYPE` |
| STATUS | enum | `HO_SO_STATUS` |
| DON_VI_ID | ref | → `DON_VI.ID`, optional |
| OWNER_ID | ref | → `USER_DIRECTORY.ID` |
| MANAGER_USER_ID | ref | → `USER_DIRECTORY.ID` |
| RELATED_ENTITY_TYPE | enum | |
| RELATED_ENTITY_ID | string | Logical id of related entity |
| FULL_NAME, PHONE, EMAIL, ID_TYPE, ID_NO, DOB, ADDRESS | | |
| START_DATE, END_DATE | date | |
| PRIORITY, SOURCE_CHANNEL | enum | |
| SUMMARY, NOTE, TAGS_TEXT | string | |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | audit | |
| IS_DELETED | bool | Soft delete |

## HO_SO_FILE

ID, HO_SO_ID (→ master), FILE_TYPE, TITLE, FILE_NAME, FILE_URL, DRIVE_FILE_ID, MIME_TYPE, FILE_SIZE, VERSION_NO, ISSUED_DATE, EXPIRED_DATE, NOTE, audit fields, IS_DELETED.

## HO_SO_RELATION

ID, HO_SO_ID, RELATED_TABLE, RELATED_RECORD_ID, RELATION_TYPE, NOTE, audit fields, IS_DELETED.

`RELATED_TABLE` whitelist: `TASK`, `DON_VI`, `FINANCE_TRANSACTION`, `USER_DIRECTORY`, `HO_SO` (→ `HO_SO_MASTER`).

## HO_SO_UPDATE_LOG

ID, HO_SO_ID, ACTION_TYPE (`HO_SO_ACTION_TYPE`), OLD_STATUS, NEW_STATUS, FIELD_CHANGED, OLD_VALUE, NEW_VALUE, NOTE, ACTOR_ID (optional), audit fields, IS_DELETED.
