# CBV Test Case Matrix

**Scope:** Schema, Seed, Enum, Ref, Hierarchy, Workflow, Field Policy, AppSheet Readiness, Migration, Regression.

---

## A. SCHEMA TESTS

| ID | Test Case | Table | Check | Severity | Pass Condition |
|----|-----------|-------|-------|----------|----------------|
| S-1 | Required sheets exist | ALL | USER_DIRECTORY, DON_VI, MASTER_CODE, ENUM_DICTIONARY, TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG, ADMIN_AUDIT_LOG | HIGH | All present |
| S-2 | USER_DIRECTORY columns | USER_DIRECTORY | ID, EMAIL, DISPLAY_NAME, ROLE, STATUS, IS_DELETED | MEDIUM | No missing |
| S-3 | DON_VI columns | DON_VI | ID, DON_VI_TYPE, CODE, NAME, PARENT_ID, STATUS, MANAGER_USER_ID, IS_DELETED | MEDIUM | No missing |
| S-4 | MASTER_CODE columns | MASTER_CODE | ID, MASTER_GROUP, CODE, NAME, STATUS, IS_DELETED | MEDIUM | No missing |
| S-5 | ENUM_DICTIONARY columns | ENUM_DICTIONARY | ID, ENUM_GROUP, ENUM_VALUE, DISPLAY_TEXT, IS_ACTIVE | MEDIUM | No missing |
| S-6 | TASK_MAIN columns | TASK_MAIN | ID, TITLE, STATUS, PRIORITY, OWNER_ID, DON_VI_ID, TASK_TYPE_ID, IS_DELETED, DONE_AT | MEDIUM | No missing |
| S-7 | TASK_CHECKLIST columns | TASK_CHECKLIST | ID, TASK_ID, TITLE, IS_REQUIRED, IS_DONE, DONE_BY | MEDIUM | No missing |
| S-8 | TASK_UPDATE_LOG columns | TASK_UPDATE_LOG | ID, TASK_ID, UPDATE_TYPE, ACTOR_ID, IS_DELETED | MEDIUM | No missing |
| S-9 | ADMIN_AUDIT_LOG columns | ADMIN_AUDIT_LOG | ID, AUDIT_TYPE, ENTITY_TYPE, ACTION, ACTOR_ID, CREATED_AT | MEDIUM | No missing |

---

## B. SEED DATA TESTS

| ID | Test Case | Table | Check | Severity | Pass Condition |
|----|-----------|-------|-------|----------|----------------|
| D-1 | No duplicate IDs | ALL | Each ID unique per table | HIGH | 0 duplicates |
| D-2 | No blank ID | ALL | ID not empty | HIGH | 0 blank |
| D-3 | No blank EMAIL | USER_DIRECTORY | EMAIL not empty | HIGH | 0 blank |
| D-4 | EMAIL unique | USER_DIRECTORY | EMAIL unique | MEDIUM | 0 duplicates |
| D-5 | IS_DELETED boolean | ALL | TRUE/FALSE only | MEDIUM | 0 invalid |
| D-6 | STATUS valid | USER_DIRECTORY, DON_VI, MASTER_CODE | ACTIVE, INACTIVE, ARCHIVED | MEDIUM | 0 invalid |
| D-7 | No architecture violation | MASTER_CODE | No DON_VI, no USER in MASTER_CODE | HIGH | 0 violation |

---

## C. ENUM TESTS

| ID | Test Case | Scope | Check | Severity | Pass Condition |
|----|-----------|-------|-------|----------|----------------|
| E-1 | Each ENUM_GROUP has ≥1 active value | ENUM_DICTIONARY | TASK_STATUS, PRIORITY, DON_VI_TYPE, USER_ROLE, RECORD_STATUS | HIGH | All have active |
| E-2 | At most 1 default per group | ENUM_DICTIONARY | IS_DEFAULT=TRUE | MEDIUM | ≤1 per group |
| E-3 | ENUM_VALUE machine-safe | ENUM_DICTIONARY | No spaces, uppercase | LOW | 0 invalid |
| E-4 | DISPLAY_TEXT exists | ENUM_DICTIONARY | Non-empty | LOW | Warn if empty |
| E-5 | (GROUP, VALUE) unique | ENUM_DICTIONARY | Per group | HIGH | 0 duplicates |
| E-6 | USER_DIRECTORY.ROLE valid | USER_DIRECTORY | In USER_ROLE | HIGH | 0 invalid |
| E-7 | DON_VI.DON_VI_TYPE valid | DON_VI | In DON_VI_TYPE | HIGH | 0 invalid |
| E-8 | TASK_MAIN.STATUS valid | TASK_MAIN | In TASK_STATUS | HIGH | 0 invalid |
| E-9 | TASK_MAIN.PRIORITY valid | TASK_MAIN | In TASK_PRIORITY / PRIORITY | HIGH | 0 invalid |

---

## D. REF INTEGRITY TESTS

| ID | Test Case | Ref | Target | Severity | Pass Condition |
|----|-----------|-----|--------|----------|----------------|
| R-1 | USER_DIRECTORY.DON_VI_ID → DON_VI.ID | DON_VI_ID | DON_VI | MEDIUM | When not blank |
| R-2 | DON_VI.MANAGER_USER_ID → USER_DIRECTORY.ID | MANAGER_USER_ID | USER_DIRECTORY | HIGH | When not blank |
| R-3 | DON_VI.PARENT_ID → DON_VI.ID | PARENT_ID | DON_VI | HIGH | When not blank |
| R-4 | TASK_MAIN.OWNER_ID → USER_DIRECTORY.ID | OWNER_ID | USER_DIRECTORY | HIGH | Always |
| R-5 | TASK_MAIN.REPORTER_ID → USER_DIRECTORY.ID | REPORTER_ID | USER_DIRECTORY | MEDIUM | When not blank |
| R-6 | TASK_MAIN.DON_VI_ID → DON_VI.ID | DON_VI_ID | DON_VI | MEDIUM | When not blank |
| R-7 | TASK_MAIN.TASK_TYPE_ID → MASTER_CODE | TASK_TYPE_ID | MASTER_GROUP=TASK_TYPE | HIGH | When not blank |
| R-8 | TASK_CHECKLIST.TASK_ID → TASK_MAIN.ID | TASK_ID | TASK_MAIN | HIGH | Always |
| R-9 | TASK_CHECKLIST.DONE_BY → USER_DIRECTORY.ID | DONE_BY | USER_DIRECTORY | MEDIUM | When not blank |
| R-10 | TASK_ATTACHMENT.TASK_ID → TASK_MAIN.ID | TASK_ID | TASK_MAIN | HIGH | Always |
| R-11 | TASK_UPDATE_LOG.TASK_ID → TASK_MAIN.ID | TASK_ID | TASK_MAIN | HIGH | Always |
| R-12 | TASK_UPDATE_LOG.ACTOR_ID → USER_DIRECTORY.ID | ACTOR_ID | USER_DIRECTORY | MEDIUM | When not blank |

---

## E. HIERARCHY TESTS

| ID | Test Case | Check | Severity | Pass Condition |
|----|-----------|-------|----------|----------------|
| H-1 | No self-parent | DON_VI.PARENT_ID ≠ ID | HIGH | 0 self-refs |
| H-2 | No circular chain | No A→B→A | HIGH | 0 cycles |
| H-3 | No orphan parent | PARENT_ID exists when not blank | HIGH | 0 orphans |
| H-4 | At least one root | PARENT_ID empty | HIGH | ≥1 root |
| H-5 | Max depth ≤5 | Tree depth | LOW | Warn if >5 |
| H-6 | Tree path report | Path from root to leaf | INFO | Report only |

---

## F. TASK WORKFLOW TESTS

| ID | Test Case | Check | Severity | Pass Condition |
|----|-----------|-------|----------|----------------|
| W-1 | Valid transitions | NEW→IN_PROGRESS, IN_PROGRESS→DONE, etc. | HIGH | Per TASK_VALID_TRANSITIONS |
| W-2 | Invalid transition blocked | NEW→DONE blocked | HIGH | 0 invalid |
| W-3 | DONE_AT set when STATUS=DONE | TASK_MAIN | MEDIUM | 0 DONE without DONE_AT |
| W-4 | START_DATE logic | Optional; BẮT ĐẦU sets if blank | INFO | Report only |
| W-5 | REPORTER_ID mapping | Auto from USEREMAIL | INFO | Report only |

---

## G. FIELD POLICY TESTS

| ID | Test Case | Field | Policy | Severity | Pass Condition |
|----|-----------|-------|--------|----------|----------------|
| P-1 | TITLE visible, required | TASK_MAIN.TITLE | Visible, editable | INFO | Audit |
| P-2 | TASK_TYPE_ID ref, dropdown | TASK_MAIN.TASK_TYPE_ID | ACTIVE_TASK_TYPE slice | INFO | Audit |
| P-3 | PRIORITY enum, dropdown | TASK_MAIN.PRIORITY | TASK_PRIORITY | INFO | Audit |
| P-4 | OWNER_ID ref, dropdown | TASK_MAIN.OWNER_ID | ACTIVE_USERS | INFO | Audit |
| P-5 | DON_VI_ID ref, dropdown | TASK_MAIN.DON_VI_ID | ACTIVE_DON_VI | INFO | Audit |
| P-6 | STATUS hidden, non-editable | TASK_MAIN.STATUS | Workflow actions only | HIGH | Not form-editable |
| P-7 | REPORTER_ID hidden/readonly | TASK_MAIN.REPORTER_ID | Auto-mapped | INFO | Audit |
| P-8 | DONE_AT hidden | TASK_MAIN.DONE_AT | Set by GAS | HIGH | Not form-editable |
| P-9 | IS_DELETED hidden | TASK_MAIN.IS_DELETED | Slice filter | HIGH | Not form-editable |
| P-10 | CREATED_*, UPDATED_* hidden | TASK_MAIN | Audit fields | MEDIUM | Not form-editable |

---

## H. APPSHEET READINESS TESTS

| ID | Test Case | Check | Severity | Pass Condition |
|----|-----------|-------|----------|----------------|
| A-1 | ACTIVE_USERS slice | STATUS=ACTIVE, IS_DELETED=FALSE | HIGH | Exists |
| A-2 | ACTIVE_DON_VI slice | STATUS=ACTIVE, IS_DELETED=FALSE | HIGH | Exists |
| A-3 | ACTIVE_TASK_TYPE slice | MASTER_GROUP=TASK_TYPE, STATUS=ACTIVE | HIGH | Exists |
| A-4 | Key fields present | TITLE, OWNER_ID, DON_VI_ID, TASK_TYPE_ID, PRIORITY | HIGH | All present |
| A-5 | Ref dropdown-only | OWNER_ID, DON_VI_ID, TASK_TYPE_ID | MEDIUM | No free-text |
| A-6 | Master tables read-only | MASTER_CODE, ENUM_DICTIONARY | MEDIUM | Admin only |
| A-7 | No unsafe "New" in refs | Prevent orphan refs | MEDIUM | Valid_If in place |

---

## I. SAFE MIGRATION TESTS

| ID | Test Case | Check | Severity | Pass Condition |
|----|-----------|-------|----------|----------------|
| M-1 | No destructive rename | Column names stable | HIGH | 0 renames |
| M-2 | Append-safe missing columns | New columns OK | MEDIUM | Can append |
| M-3 | Existing rows pass min checks | Required fields | MEDIUM | 0 invalid |
| M-4 | Legacy values normalizable | STATUS, PRIORITY mapping | LOW | Document |

---

## J. REGRESSION TESTS

| ID | Test Case | Check | Severity | Pass Condition |
|----|-----------|-------|----------|----------------|
| G-1 | Baseline health | Run all above | — | Store counts |
| G-2 | Before/after comparison | Issue count by severity | — | No new HIGH |
| G-3 | Issue count by severity | HIGH, MEDIUM, LOW | — | Report |
| G-4 | PASS/WARN/FAIL summary | Overall verdict | — | Structured |

---

## Summary Counts

| Category | Test Count | HIGH | MEDIUM | LOW/INFO |
|----------|------------|------|--------|----------|
| A. Schema | 9 | 1 | 8 | 0 |
| B. Seed Data | 7 | 3 | 4 | 0 |
| C. Enum | 9 | 4 | 2 | 3 |
| D. Ref | 12 | 6 | 6 | 0 |
| E. Hierarchy | 6 | 4 | 0 | 2 |
| F. Workflow | 5 | 2 | 1 | 2 |
| G. Field Policy | 10 | 3 | 1 | 6 |
| H. AppSheet | 7 | 4 | 3 | 0 |
| I. Migration | 4 | 1 | 2 | 1 |
| J. Regression | 4 | — | — | — |
| **Total** | **73** | **29** | **27** | **14** |
