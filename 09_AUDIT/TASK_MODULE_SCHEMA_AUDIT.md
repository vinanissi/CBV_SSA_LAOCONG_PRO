# TASK Module Schema Audit — CBV_SSA_LAOCONG_PRO

**Audit date:** 2025-03-18  
**Scope:** TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG; ENUM_DICTIONARY, MASTER_CODE

---

## 1. TASK_MAIN

### Target (PRO level)

| Field | Required |
|-------|----------|
| ID | ✓ |
| NAME | ✓ |
| DESCRIPTION | ✓ |
| STATUS | ✓ |
| PRIORITY | ✓ |
| TASK_TYPE | ✓ |
| OWNER_ID | ✓ |
| ASSIGNEE_ID | optional |
| START_DATE | ✓ |
| DUE_DATE | ✓ |
| COMPLETED_AT | ✓ |
| CREATED_AT, CREATED_BY | ✓ |
| UPDATED_AT, UPDATED_BY | ✓ |

### Current schema

| Column | Type | Mapping |
|--------|------|---------|
| ID | Key | ✓ |
| TASK_CODE | Text | Business code; unique |
| TITLE | Text | **= NAME** (task name/label) |
| DESCRIPTION | Text | ✓ |
| TASK_TYPE | Enum | ✓ |
| STATUS | Enum | ✓ |
| PRIORITY | Enum | ✓ |
| OWNER_ID | Text | **= ASSIGNEE** (assignee) |
| REPORTER_ID | Text | Creator; not in target |
| RELATED_ENTITY_TYPE | Enum | Link to HO_SO, FINANCE, etc. |
| RELATED_ENTITY_ID | Ref | Polymorphic ref |
| START_DATE | Date | ✓ |
| DUE_DATE | Date | ✓ |
| DONE_AT | Date | **= COMPLETED_AT** |
| RESULT_NOTE | Text | Completion note |
| CREATED_AT, CREATED_BY | ✓ | ✓ |
| UPDATED_AT, UPDATED_BY | ✓ | ✓ |
| IS_DELETED | Yes/No | CBV soft delete |

### Verdict

**COMPLETE.** All target fields present. TITLE = NAME, DONE_AT = COMPLETED_AT, OWNER_ID = assignee. No changes needed.

---

## 2. TASK_CHECKLIST

### Target (PRO level)

| Field | Required |
|-------|----------|
| ID | ✓ |
| TASK_ID | Ref | ✓ |
| TITLE | ✓ |
| IS_DONE | ✓ |
| SORT_ORDER | ✓ |
| CREATED_AT | ✓ |

### Current schema

| Column | Type | Mapping |
|--------|------|---------|
| ID | Key | ✓ |
| TASK_ID | Ref | ✓ |
| ITEM_NO | Number | Item number |
| TITLE | Text | ✓ |
| IS_REQUIRED | Yes/No | Required for completion |
| IS_DONE | Yes/No | ✓ |
| DONE_AT | Date | When completed |
| DONE_BY | Text | Who completed |
| NOTE | Text | Optional note |
| CREATED_AT | Date | ✓ |
| CREATED_BY | Text | Audit |

### Missing

- **SORT_ORDER** — for display order. ITEM_NO can serve but SORT_ORDER is explicit.

### Fix applied

Add SORT_ORDER (Number) after ITEM_NO.

---

## 3. TASK_ATTACHMENT

### Target (PRO level)

| Field | Required |
|-------|----------|
| ID | ✓ |
| TASK_ID | Ref | ✓ |
| ATTACHMENT_TYPE | ✓ |
| FILE_URL | ✓ |
| TITLE | ✓ |
| NOTE | ✓ |
| CREATED_AT | ✓ |

### Current schema

| Column | Type | Mapping |
|--------|------|---------|
| ID | Key | ✓ |
| TASK_ID | Ref | ✓ |
| ATTACHMENT_TYPE | Enum | ✓ |
| TITLE | Text | ✓ |
| FILE_NAME | Text | Optional; from upload |
| FILE_URL | Text/File | ✓ |
| DRIVE_FILE_ID | Text | Internal; Drive integration |
| NOTE | Text | ✓ |
| CREATED_AT | Date | ✓ |
| CREATED_BY | Text | Audit |

### Verdict

**COMPLETE.** All target fields present. FILE_NAME, DRIVE_FILE_ID, CREATED_BY are useful extras. No removal.

---

## 4. TASK_UPDATE_LOG

### Target (PRO level)

| Field | Required |
|-------|----------|
| ID | ✓ |
| TASK_ID | Ref | ✓ |
| UPDATE_TYPE | ✓ |
| CONTENT | ✓ |
| ACTOR_ID | ✓ |
| CREATED_AT | ✓ |

### Current schema

| Column | Type | Mapping |
|--------|------|---------|
| ID | Key | ✓ |
| TASK_ID | Ref | ✓ |
| ACTION | Text | **= UPDATE_TYPE** (enum UPDATE_TYPE) |
| OLD_STATUS | Text | Status change |
| NEW_STATUS | Text | Status change |
| NOTE | Text | **= CONTENT** |
| ACTOR_ID | Text | ✓ |
| CREATED_AT | Date | ✓ |

### Verdict

**COMPLETE.** ACTION = UPDATE_TYPE. NOTE = CONTENT. OLD_STATUS, NEW_STATUS are status-specific. No changes needed.

---

## 5. Foreign keys

| Child | Ref column | Parent | Status |
|-------|------------|--------|--------|
| TASK_CHECKLIST | TASK_ID | TASK_MAIN | ✓ |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN | ✓ |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN | ✓ |

All foreign keys exist and consistent.

---

## 6. Duplicated / ambiguous columns

| Item | Resolution |
|------|------------|
| TITLE vs NAME (TASK_MAIN) | TITLE = task name; no NAME column |
| DONE_AT vs COMPLETED_AT | DONE_AT = COMPLETED_AT, keep DONE_AT |
| OWNER_ID vs ASSIGNEE_ID | OWNER_ID = assignee; no ASSIGNEE_ID |
| ACTION vs UPDATE_TYPE | ACTION = UPDATE_TYPE; column name ACTION |
| NOTE vs CONTENT (TASK_UPDATE_LOG) | NOTE = content; no CONTENT column |

No redundant columns added.

---

## 7. ENUM_DICTIONARY

| ENUM_GROUP | Used by | Status |
|------------|---------|--------|
| TASK_TYPE | TASK_MAIN | ✓ |
| TASK_STATUS | TASK_MAIN | ✓ |
| TASK_PRIORITY | TASK_MAIN | ✓ |
| TASK_ATTACHMENT_TYPE | TASK_ATTACHMENT | ✓ |
| RELATED_ENTITY_TYPE | TASK_MAIN | ✓ |
| UPDATE_TYPE | TASK_UPDATE_LOG.ACTION | ✓ |

All required enum groups present. No MASTER_CODE used by TASK module.

---

## 8. Schema changes applied

| Table | Change |
|-------|--------|
| TASK_CHECKLIST | Add SORT_ORDER (Number) after ITEM_NO |

---

## 9. Normalized schema summary

See 06_DATABASE/TASK_MODULE_SCHEMA_NORMALIZED.md.

---

## 10. Deployment note

**Existing TASK_CHECKLIST sheet:** Add column SORT_ORDER (Number) after ITEM_NO. Run initAll() or manually add header to sheet. Existing rows will have empty SORT_ORDER; GAS addChecklistItem defaults to ITEM_NO or 0.
