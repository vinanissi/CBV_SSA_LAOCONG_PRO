# TASK Module Schema — Normalized (PRO Level)

**Source:** schema_manifest.json, 90_BOOTSTRAP_SCHEMA.gs  
**Audit:** 09_AUDIT/TASK_MODULE_SCHEMA_AUDIT.md

---

## TASK_MAIN

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Key |
| TASK_CODE | Text | No | Business code; GAS may generate |
| TITLE | Text | Yes | Task name (label) |
| DESCRIPTION | Text | No | |
| TASK_TYPE | Enum | Yes | TASK_TYPE |
| STATUS | Enum | Yes | TASK_STATUS; GAS action only |
| PRIORITY | Enum | Yes | TASK_PRIORITY |
| OWNER_ID | Text | Yes | Assignee |
| REPORTER_ID | Text | No | Creator |
| RELATED_ENTITY_TYPE | Enum | No | RELATED_ENTITY_TYPE |
| RELATED_ENTITY_ID | Text/Ref | No | Polymorphic ref |
| START_DATE | Date | No | |
| DUE_DATE | Date | No | |
| DONE_AT | Date | No | Completed at (= COMPLETED_AT) |
| RESULT_NOTE | Text | No | Completion note |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| IS_DELETED | Yes/No | No | Soft delete |

**Mapping:** TITLE = NAME, DONE_AT = COMPLETED_AT, OWNER_ID = assignee

---

## TASK_CHECKLIST

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Key |
| TASK_ID | Ref | Yes | → TASK_MAIN |
| ITEM_NO | Number | No | Item number |
| SORT_ORDER | Number | No | Display order (added) |
| TITLE | Text | Yes | |
| IS_REQUIRED | Yes/No | No | Required for completion |
| IS_DONE | Yes/No | No | GAS or action |
| DONE_AT | Date | No | When completed |
| DONE_BY | Text | No | Who completed |
| NOTE | Text | No | |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |

---

## TASK_ATTACHMENT

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Key |
| TASK_ID | Ref | Yes | → TASK_MAIN |
| ATTACHMENT_TYPE | Enum | Yes | TASK_ATTACHMENT_TYPE |
| TITLE | Text | No | |
| FILE_NAME | Text | No | From upload |
| FILE_URL | File | Yes | AppSheet Type = File |
| DRIVE_FILE_ID | Text | No | Internal |
| NOTE | Text | No | |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |

---

## TASK_UPDATE_LOG

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Key |
| TASK_ID | Ref | Yes | → TASK_MAIN |
| ACTION | Text | Yes | = UPDATE_TYPE (enum) |
| OLD_STATUS | Text | No | Status change |
| NEW_STATUS | Text | No | Status change |
| NOTE | Text | No | = CONTENT |
| ACTOR_ID | Text | No | |
| CREATED_AT | Datetime | No | |

**Mapping:** ACTION = UPDATE_TYPE, NOTE = CONTENT

---

## Foreign Keys

| Child | Ref | Parent |
|-------|-----|--------|
| TASK_CHECKLIST | TASK_ID | TASK_MAIN |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN |

---

## ENUM Groups

| ENUM_GROUP | Table.Column |
|------------|--------------|
| TASK_TYPE | TASK_MAIN.TASK_TYPE |
| TASK_STATUS | TASK_MAIN.STATUS |
| TASK_PRIORITY | TASK_MAIN.PRIORITY |
| TASK_ATTACHMENT_TYPE | TASK_ATTACHMENT.ATTACHMENT_TYPE |
| RELATED_ENTITY_TYPE | TASK_MAIN.RELATED_ENTITY_TYPE |
| UPDATE_TYPE | TASK_UPDATE_LOG.ACTION |

---

## Schema Change Summary

| Table | Change |
|-------|--------|
| TASK_CHECKLIST | + SORT_ORDER (Number) |

No fields removed. No column renames.
