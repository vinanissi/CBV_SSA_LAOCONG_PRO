# TASK Schema — Copy-Paste Ready

**Model:** Task belongs to HTX; users shared across system.  
**Source:** schema_manifest.json, 90_BOOTSTRAP_SCHEMA.gs  
**Reference:** 02_MODULES/TASK_CENTER/TASK_SYSTEM_REFERENCE.md

---

## TASK_MAIN

```
ID, TASK_CODE, TITLE, DESCRIPTION, TASK_TYPE, STATUS, PRIORITY, HTX_ID, OWNER_ID, REPORTER_ID, START_DATE, DUE_DATE, DONE_AT, PROGRESS_PERCENT, RESULT_SUMMARY, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED
```

| Column | Type | Required | Ref | Enum |
|--------|------|----------|-----|------|
| ID | Text | Yes | Key | |
| TASK_CODE | Text | No | | |
| TITLE | Text | Yes | | |
| DESCRIPTION | Text | No | | |
| TASK_TYPE | Text | Yes | | TASK_TYPE |
| STATUS | Text | Yes | | TASK_STATUS |
| PRIORITY | Text | Yes | | TASK_PRIORITY |
| HTX_ID | Text | Yes | → ACTIVE_HTX (HO_SO_MASTER) | |
| OWNER_ID | Text | Yes | → ACTIVE_USERS | |
| REPORTER_ID | Text | No | → ACTIVE_USERS | |
| START_DATE | Date | No | | |
| DUE_DATE | Date | No | | |
| DONE_AT | DateTime | No | | |
| PROGRESS_PERCENT | Number | No | | |
| RESULT_SUMMARY | Text | No | | |
| RELATED_ENTITY_TYPE | Text | No | | RELATED_ENTITY_TYPE |
| RELATED_ENTITY_ID | Text | No | Polymorphic | |
| CREATED_AT | DateTime | No | | |
| CREATED_BY | Text | No | | |
| UPDATED_AT | DateTime | No | | |
| UPDATED_BY | Text | No | | |
| IS_DELETED | Yes/No | No | | |

---

## TASK_CHECKLIST

```
ID, TASK_ID, ITEM_NO, TITLE, DESCRIPTION, IS_REQUIRED, IS_DONE, DONE_AT, DONE_BY, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED
```

| Column | Type | Required | Ref | Enum |
|--------|------|----------|-----|------|
| ID | Text | Yes | Key | |
| TASK_ID | Text | Yes | → TASK_MAIN | |
| ITEM_NO | Number | No | | |
| TITLE | Text | Yes | | |
| DESCRIPTION | Text | No | | |
| IS_REQUIRED | Yes/No | No | | |
| IS_DONE | Yes/No | No | | |
| DONE_AT | DateTime | No | | |
| DONE_BY | Text | No | → ACTIVE_USERS | |
| NOTE | Text | No | | |
| CREATED_AT | DateTime | No | | |
| CREATED_BY | Text | No | | |
| UPDATED_AT | DateTime | No | | |
| UPDATED_BY | Text | No | | |
| IS_DELETED | Yes/No | No | | |

---

## TASK_ATTACHMENT

```
ID, TASK_ID, ATTACHMENT_TYPE, TITLE, FILE_URL, DRIVE_FILE_ID, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED
```

| Column | Type | Required | Ref | Enum |
|--------|------|----------|-----|------|
| ID | Text | Yes | Key | |
| TASK_ID | Text | Yes | → TASK_MAIN | |
| ATTACHMENT_TYPE | Text | No | | TASK_ATTACHMENT_TYPE |
| TITLE | Text | No | | |
| FILE_URL | Text/File | No | | |
| DRIVE_FILE_ID | Text | No | | |
| NOTE | Text | No | | |
| CREATED_AT | DateTime | No | | |
| CREATED_BY | Text | No | | |
| UPDATED_AT | DateTime | No | | |
| UPDATED_BY | Text | No | | |
| IS_DELETED | Yes/No | No | | |

---

## TASK_UPDATE_LOG

```
ID, TASK_ID, UPDATE_TYPE, CONTENT, ACTOR_ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED
```

| Column | Type | Required | Ref | Enum |
|--------|------|----------|-----|------|
| ID | Text | Yes | Key | |
| TASK_ID | Text | Yes | → TASK_MAIN | |
| UPDATE_TYPE | Text | Yes | | UPDATE_TYPE |
| CONTENT | Text | No | | |
| ACTOR_ID | Text | Yes | → ACTIVE_USERS | |
| CREATED_AT | DateTime | No | | |
| CREATED_BY | Text | No | | |
| UPDATED_AT | DateTime | No | | |
| UPDATED_BY | Text | No | | |
| IS_DELETED | Yes/No | No | | |

---

## Ref Mapping Summary

| Child Table | Column | Parent |
|-------------|--------|--------|
| TASK_MAIN | HTX_ID | HO_SO_MASTER (slice ACTIVE_HTX) |
| TASK_MAIN | OWNER_ID | USER_DIRECTORY |
| TASK_MAIN | REPORTER_ID | USER_DIRECTORY |
| TASK_CHECKLIST | TASK_ID | TASK_MAIN |
| TASK_CHECKLIST | DONE_BY | USER_DIRECTORY |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN |
| TASK_UPDATE_LOG | ACTOR_ID | USER_DIRECTORY |

---

## Enum-Backed Fields

| Table | Column | MASTER_GROUP |
|-------|--------|--------------|
| TASK_MAIN | TASK_TYPE | TASK_TYPE |
| TASK_MAIN | STATUS | TASK_STATUS |
| TASK_MAIN | PRIORITY | TASK_PRIORITY |
| TASK_MAIN | RELATED_ENTITY_TYPE | RELATED_ENTITY_TYPE |
| TASK_ATTACHMENT | ATTACHMENT_TYPE | TASK_ATTACHMENT_TYPE |
| TASK_UPDATE_LOG | UPDATE_TYPE | UPDATE_TYPE |

---

## Notes

- **ACTIVE_HTX:** Slice of HO_SO_MASTER where HO_SO_TYPE = 'HTX' and STATUS active.
- **ACTIVE_USERS:** Slice of USER_DIRECTORY where STATUS active (or equivalent).
- No attachments in TASK_MAIN; no logs in TASK_MAIN.

---

## Schema Conflicts (vs Current Repo)

| Area | Old | New | Action |
|------|-----|-----|--------|
| TASK_MAIN | RESULT_NOTE | RESULT_SUMMARY | Rename column; GAS must use RESULT_SUMMARY |
| TASK_MAIN | No HTX_ID | HTX_ID required | Add column; GAS must validate HTX_ID |
| TASK_CHECKLIST | SORT_ORDER | Removed | Drop if exists; use ITEM_NO for order |
| TASK_CHECKLIST | No DESCRIPTION, UPDATED_*, IS_DELETED | Added | Append columns |
| TASK_ATTACHMENT | FILE_NAME | Removed | Drop column; TITLE holds display name |
| TASK_ATTACHMENT | No UPDATED_*, IS_DELETED | Added | Append columns |
| TASK_UPDATE_LOG | ACTION, OLD_STATUS, NEW_STATUS, NOTE | UPDATE_TYPE, CONTENT | Rename/replace; GAS addTaskUpdate must write UPDATE_TYPE + CONTENT |
| TASK_UPDATE_LOG | No CREATED_BY, UPDATED_*, IS_DELETED | Added | Append columns |

---

## Next Implementation Step

1. **GAS 20_TASK_SERVICE.gs**
   - Replace `RESULT_NOTE` with `RESULT_SUMMARY`.
   - Add `HTX_ID` to `createTask` (required); validate against ACTIVE_HTX.
   - Update `addTaskUpdate` to use `UPDATE_TYPE` and `CONTENT` instead of `ACTION`, `OLD_STATUS`, `NEW_STATUS`, `NOTE`. Map: `ACTION` → `UPDATE_TYPE`; for status changes store old/new in CONTENT or keep UPDATE_TYPE=STATUS_CHANGE with CONTENT as note.
   - Update `addTaskLogEntry` to pass UPDATE_TYPE and CONTENT.

2. **MASTER_CODE**
   - Add `UPDATE_TYPE` group with values: NOTE, QUESTION, ANSWER, STATUS_CHANGE (or reuse existing enum if present).

3. **AppSheet**
   - Add HTX_ID ref to TASK_MAIN (ACTIVE_HTX slice).
   - Rename RESULT_NOTE → RESULT_SUMMARY in TASK_MAIN.
   - Update TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG column bindings per schema.
