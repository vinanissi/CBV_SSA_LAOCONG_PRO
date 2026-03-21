# AppSheet Task Field Policy — Final

**Model:** Task belongs to HTX; users shared. AppSheet is UI only; **GAS is the workflow engine**.

**Purpose:** Prevent AppSheet users from breaking task workflow or corrupting data.

**Related:** APPSHEET_TASK_ACTION_RULES.md (workflow actions), TASK_FIELD_EDIT_RULES.md (Editable_If)  
**Consolidated reference:** 02_MODULES/TASK_CENTER/TASK_SYSTEM_REFERENCE.md

---

## 1. TASK_MAIN

| Column | Show | Editable | Control | Notes |
|--------|------|----------|---------|-------|
| ID | OFF | **OFF** | Never editable | System key |
| TASK_CODE | ON | **Controlled** | GAS generates on create; user may edit if policy allows | |
| TITLE | ON | ON | Editable when task open | Editable_If: task not DONE/CANCELLED |
| DESCRIPTION | ON | ON | Same | |
| TASK_TYPE | ON | ON | Enum; Valid_If TASK_TYPE | |
| STATUS | ON | **OFF** | **GAS only** | Never freely editable |
| PRIORITY | ON | ON | Enum; Valid_If TASK_PRIORITY | |
| HTX_ID | ON | ON | Ref → ACTIVE_HTX; Allow Adds OFF | Editable only when task open; state-aware if needed |
| OWNER_ID | ON | ON | Ref → ACTIVE_USERS; Allow Adds OFF | **Assignment via GAS preferred**; direct edit allowed when open |
| REPORTER_ID | ON | ON | Ref → ACTIVE_USERS; Allow Adds OFF | Auto-filled from USEREMAIL; protected from arbitrary change |
| START_DATE | ON | ON | | |
| DUE_DATE | ON | ON | | |
| DONE_AT | ON | **OFF** | **GAS only** | Set on completion flow |
| PROGRESS_PERCENT | ON | **OFF** | **GAS only** | Checklist-derived |
| RESULT_SUMMARY | ON | ON | Editable when DONE | Add note after complete |
| RELATED_ENTITY_TYPE | ON | ON | Enum; Valid_If | |
| RELATED_ENTITY_ID | ON | ON | Polymorphic | |
| CREATED_AT | OFF | **OFF** | Protected | Audit |
| CREATED_BY | OFF | **OFF** | Protected | Audit |
| UPDATED_AT | OFF | **OFF** | Protected | Audit |
| UPDATED_BY | OFF | **OFF** | Protected | Audit |
| IS_DELETED | OFF | **OFF** | Protected | Slice filter only |

### Editable_If for Business Fields

```
AND([STATUS] <> "DONE", [STATUS] <> "CANCELLED")
```

**Exclusions:** ID, STATUS, DONE_AT, PROGRESS_PERCENT, CREATED_*, UPDATED_*, IS_DELETED always OFF.

**RESULT_SUMMARY:** `Editable_If = [STATUS] = "DONE"` (post-completion note).

---

## 2. TASK_CHECKLIST

| Column | Show | Editable | Control | Notes |
|--------|------|----------|---------|-------|
| ID | OFF | **OFF** | Never editable | |
| TASK_ID | OFF | **OFF** | Protected; set by parent | Allow Adds OFF; cannot change |
| ITEM_NO | ON | ON | | |
| TITLE | ON | ON | When parent open | |
| DESCRIPTION | ON | ON | Same | |
| IS_REQUIRED | ON | ON | Same | |
| IS_DONE | ON | **OFF** | **GAS only** | markChecklistDone |
| DONE_AT | ON | **OFF** | **GAS only** | |
| DONE_BY | ON | **OFF** | **GAS only** | Set by GAS |
| NOTE | ON | ON | When parent open | |
| CREATED_AT | OFF | **OFF** | Protected | |
| CREATED_BY | OFF | **OFF** | Protected | |
| UPDATED_AT | OFF | **OFF** | Protected | |
| UPDATED_BY | OFF | **OFF** | Protected | |
| IS_DELETED | OFF | **OFF** | Protected | |

**Editable_If for business fields:** Parent task open (`[TASK_MAIN].[STATUS] <> "DONE"` and `<> "CANCELLED"`).

---

## 3. TASK_ATTACHMENT

| Column | Show | Editable | Control | Notes |
|--------|------|----------|---------|-------|
| ID | OFF | **OFF** | Never editable | |
| TASK_ID | OFF | **OFF** | Protected; set by parent | Allow Adds OFF |
| ATTACHMENT_TYPE | ON | ON | Enum; Valid_If TASK_ATTACHMENT_TYPE | |
| TITLE | ON | ON | When parent open | |
| FILE_URL | ON | ON | Same | |
| DRIVE_FILE_ID | OFF | **OFF** | Hidden | |
| NOTE | ON | ON | When parent open | |
| CREATED_AT | OFF | **OFF** | Protected | |
| CREATED_BY | OFF | **OFF** | Protected | |
| UPDATED_AT | OFF | **OFF** | Protected | |
| UPDATED_BY | OFF | **OFF** | Protected | |
| IS_DELETED | OFF | **OFF** | Protected | |

**Policy:** Allow **add** via inline form. **Allow Delete = OFF** (or route via GAS soft delete). Restrict **destructive edits** (deletes, TASK_ID change).

---

## 4. TASK_UPDATE_LOG

| Column | Show | Editable | Control | Notes |
|--------|------|----------|---------|-------|
| ID | OFF | **OFF** | Never editable | |
| TASK_ID | OFF | **OFF** | Protected | |
| UPDATE_TYPE | ON | **OFF** | GAS sets | |
| CONTENT | ON | **OFF** | GAS sets | |
| ACTOR_ID | ON | **OFF** | GAS sets | |
| CREATED_AT | ON | **OFF** | Protected | |
| CREATED_BY | OFF | **OFF** | Protected | |
| UPDATED_AT | OFF | **OFF** | Protected | |
| UPDATED_BY | OFF | **OFF** | Protected | |
| IS_DELETED | OFF | **OFF** | Protected | |

**Table:** Append-only. **No Add/Edit/Delete from AppSheet.** GAS creates via addTaskUpdateLog, setTaskStatus, assignTask, completeTask, etc. Existing rows must not be casually edited.

---

## 5. Bypass Risks — Must Remain Non-Editable

| Field | Risk |
|-------|------|
| STATUS (TASK_MAIN) | Bypass checklist completion; invalid transitions |
| PROGRESS_PERCENT | Override checklist-derived value |
| DONE_AT (TASK_MAIN) | Falsify completion time |
| IS_DONE (TASK_CHECKLIST) | Mark done without GAS (no DONE_BY, no log) |
| DONE_AT, DONE_BY (TASK_CHECKLIST) | Falsify actor/time |
| TASK_UPDATE_LOG (all) | Corrupt audit trail |

---

## 6. Valid_If Expressions

### TASK_MAIN

- TASK_TYPE: `IN([TASK_TYPE], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND([ENUM_GROUP] = "TASK_TYPE", [IS_ACTIVE] = TRUE)))`
- PRIORITY: `IN([PRIORITY], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND([ENUM_GROUP] = "TASK_PRIORITY", [IS_ACTIVE] = TRUE)))`
- RELATED_ENTITY_TYPE: `IN([RELATED_ENTITY_TYPE], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND([ENUM_GROUP] = "RELATED_ENTITY_TYPE", [IS_ACTIVE] = TRUE)))`
- HTX_ID: `IN([HTX_ID], SELECT(HO_SO_MASTER[ID], AND([HO_SO_TYPE] = "HTX", [IS_DELETED] = FALSE)))`
- OWNER_ID, REPORTER_ID: `IN([OWNER_ID], SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)))`

### TASK_ATTACHMENT

- ATTACHMENT_TYPE: `IN([ATTACHMENT_TYPE], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND([ENUM_GROUP] = "TASK_ATTACHMENT_TYPE", [IS_ACTIVE] = TRUE)))`

---

## 7. REPORTER_ID Initial Value

```
FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE, LOWER([EMAIL]) = LOWER(USEREMAIL()))))
```

Apply as **Initial Value** on TASK_FORM. Empty if no match; user selects manually.

---

## 8. Summary

| Table | Key Protections |
|-------|-----------------|
| TASK_MAIN | ID, STATUS, DONE_AT, PROGRESS_PERCENT, CREATED_*, UPDATED_*, IS_DELETED never editable |
| TASK_CHECKLIST | TASK_ID, IS_DONE, DONE_AT, DONE_BY protected |
| TASK_ATTACHMENT | TASK_ID protected; add allowed; no destructive direct edit |
| TASK_UPDATE_LOG | All columns read-only; append-only via GAS |
