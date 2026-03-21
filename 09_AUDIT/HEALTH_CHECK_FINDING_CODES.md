# Health Check Finding Codes — CBV_SSA_LAOCONG_PRO

Reference for `issue_code` values returned by `selfAuditBootstrap()`.

---

## SCHEMA

| Code | Severity | Meaning |
|------|----------|---------|
| SCHEMA_MISSING_SHEET | CRITICAL | Required sheet does not exist |
| SCHEMA_EMPTY_HEADERS | HIGH | Sheet has no headers |
| SCHEMA_MISSING_COLUMN | HIGH | Required column missing |
| SCHEMA_DUPLICATE_HEADER | HIGH | Duplicate column header |
| SCHEMA_BLANK_HEADER | HIGH | Blank header (AppSheet will fail) |
| SCHEMA_UNEXPECTED_COLUMN | LOW | Column not in schema definition |

---

## ENUM

| Code | Severity | Meaning |
|------|----------|---------|
| ENUM_MISSING_OR_EMPTY | MEDIUM | ENUM_DICTIONARY missing or empty |
| ENUM_MISSING_COLUMNS | CRITICAL | ENUM_GROUP or ENUM_VALUE missing |
| ENUM_DUPLICATE_VALUE | HIGH | Duplicate group+value in ENUM_DICTIONARY |

---

## MASTER_CODE

| Code | Severity | Meaning |
|------|----------|---------|
| MC_EMPTY | INFO | MASTER_CODE empty (OK for new system) |
| MC_DUPLICATE_ID | CRITICAL | Duplicate ID in MASTER_CODE |

---

## REF

| Code | Severity | Meaning |
|------|----------|---------|
| REF_ORPHAN | HIGH/MEDIUM | Child row references non-existent parent |

---

## WORKFLOW

| Code | Severity | Meaning |
|------|----------|---------|
| WORKFLOW_DONE_NO_DONE_AT | HIGH | STATUS=DONE but DONE_AT blank |
| WORKFLOW_INCONSISTENT | MEDIUM | STATUS=NEW but PROGRESS_PERCENT=100 |
| WORKFLOW_PROGRESS_RANGE | HIGH | PROGRESS_PERCENT out of 0-100 |
| WORKFLOW_CHECKLIST_CORRUPT | CRITICAL | CHECKLIST_DONE > CHECKLIST_TOTAL |

---

## DATA

| Code | Severity | Meaning |
|------|----------|---------|
| DATA_REQUIRED_BLANK | HIGH/MEDIUM | Required field blank in N rows |
| DATA_DUPLICATE_KEY | CRITICAL | Duplicate primary key |

---

## SOFT_DELETE

| Code | Severity | Meaning |
|------|----------|---------|
| SOFT_DELETE_INCONSISTENT | MEDIUM | IS_DELETED=TRUE but STATUS=ACTIVE |

---

## LOG

| Code | Severity | Meaning |
|------|----------|---------|
| LOG_MISSING_ACTION | HIGH | Log row has blank ACTION |
| LOG_MISSING_CREATED_AT | MEDIUM | Log row has blank CREATED_AT |

---

## APPSHEET

| Code | Severity | Meaning |
|------|----------|---------|
| APPSHEET_NOT_READY | HIGH | Schema/ref/key blockers prevent AppSheet readiness |
