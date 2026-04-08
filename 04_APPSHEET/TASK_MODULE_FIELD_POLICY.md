# TASK Module Field Policy

**Scope:** TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG  
**Source:** APPSHEET_FIELD_POLICY_MAP.csv, .json

---

## 1. Field Policy Map — TASK_MAIN

| Column | POLICY_TYPE | SHOW | EDITABLE | Notes |
|--------|-------------|------|----------|-------|
| ID | HIDDEN_READONLY | OFF | OFF | System key |
| TASK_CODE | VISIBLE_EDITABLE | ON | ON | Business |
| TITLE | VISIBLE_EDITABLE | ON | ON | Name field |
| DESCRIPTION | VISIBLE_EDITABLE | ON | ON | |
| TASK_TYPE | VISIBLE_CONTROLLED | ON | ON | Valid_If enum |
| STATUS | VISIBLE_CONTROLLED | ON | OFF | Workflow lock |
| PRIORITY | VISIBLE_CONTROLLED | ON | ON | Valid_If enum |
| OWNER_ID | VISIBLE_EDITABLE | ON | ON | |
| REPORTER_ID | VISIBLE_EDITABLE | ON | ON | |
| SHARED_WITH | VISIBLE_CONTROLLED | ON | ON | Show_If: USERROLE()="ADMIN"; Editable_If: USERROLE()="ADMIN"; List→Ref ACTIVE_USERS |
| IS_PRIVATE | VISIBLE_CONTROLLED | ON | ON | Show_If: USERROLE()="ADMIN"; Editable_If: USERROLE()="ADMIN"; default FALSE |
| RELATED_ENTITY_TYPE | VISIBLE_CONTROLLED | ON | ON | Valid_If enum |
| RELATED_ENTITY_ID | VISIBLE_EDITABLE | ON | ON | |
| START_DATE | VISIBLE_EDITABLE | ON | ON | |
| DUE_DATE | VISIBLE_EDITABLE | ON | ON | |
| DONE_AT | VISIBLE_READONLY | ON | OFF | GAS set on DONE |
| PROGRESS_PERCENT | VISIBLE_READONLY | ON | OFF | Lock — auto from checklist |
| RESULT_NOTE | VISIBLE_EDITABLE | ON | ON | |
| CREATED_AT | HIDDEN_READONLY | OFF | OFF | Audit |
| CREATED_BY | HIDDEN_READONLY | OFF | OFF | Audit |
| UPDATED_AT | HIDDEN_READONLY | OFF | OFF | Audit |
| UPDATED_BY | HIDDEN_READONLY | OFF | OFF | Audit |
| IS_DELETED | HIDDEN_READONLY | OFF | OFF | Slice only |

---

## 2. Show_If / Editable_If Expressions

### TASK_MAIN

| Field | Show_If | Editable_If |
|-------|---------|-------------|
| IS_PRIVATE | USERROLE() = "ADMIN" | USERROLE() = "ADMIN" |
| SHARED_WITH | AND(USERROLE() = "ADMIN", [IS_PRIVATE] = TRUE) | USERROLE() = "ADMIN" |
| ID | — | FALSE |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | — | FALSE |
| IS_DELETED | — | FALSE |
| STATUS | — | FALSE |
| DONE_AT | — | FALSE |
| PROGRESS_PERCENT | — | FALSE |
| TASK_TYPE | — | Valid_If: `IN([TASK_TYPE]; SELECT(ENUM_DICTIONARY[ENUM_VALUE]; AND(ENUM_DICTIONARY[ENUM_GROUP] = "TASK_TYPE"; ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))` |
| PRIORITY | — | Valid_If: `IN([PRIORITY]; SELECT(ENUM_DICTIONARY[ENUM_VALUE]; AND(ENUM_DICTIONARY[ENUM_GROUP] = "TASK_PRIORITY"; ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))` |
| RELATED_ENTITY_TYPE | — | Valid_If: `IN([RELATED_ENTITY_TYPE]; SELECT(ENUM_DICTIONARY[ENUM_VALUE]; AND(ENUM_DICTIONARY[ENUM_GROUP] = "RELATED_ENTITY_TYPE"; ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))` |

---

## 3. Locks

| Field | Lock | Enforcement |
|-------|------|-------------|
| STATUS | Workflow only | Editable=FALSE; change via GAS setTaskStatus |
| PROGRESS_PERCENT | Readonly | Editable=FALSE; auto from checklist |

---

## 4. Child Tables (Summary)

| Table | Key locks |
|-------|-----------|
| TASK_CHECKLIST | ID, TASK_ID, IS_DONE, DONE_AT, DONE_BY, CREATED_* = HIDDEN_READONLY or VISIBLE_READONLY |
| TASK_ATTACHMENT | ID, CREATED_* = HIDDEN_READONLY; ATTACHMENT_TYPE required |
| TASK_UPDATE_LOG | All columns VISIBLE_READONLY (GAS only) |

---

## 5. Bypass Risk — Fields That Must NOT Be Editable

| Field | If Editable | Risk |
|-------|-------------|------|
| STATUS | User sets DONE without checklist | **CRITICAL** — workflow bypass |
| PROGRESS_PERCENT | User overrides checklist-derived value | **CRITICAL** |
| DONE_AT (TASK_MAIN) | Falsify completion time | **CRITICAL** |
| IS_DONE (TASK_CHECKLIST) | Mark done without service | **CRITICAL** |
| DONE_AT, DONE_BY (TASK_CHECKLIST) | Falsify actor/time | **CRITICAL** |
| TASK_UPDATE_LOG (any) | Corrupt audit trail | **CRITICAL** |

**See:** APPSHEET_TASK_POLICY.md for full checklist and deployment verification.
