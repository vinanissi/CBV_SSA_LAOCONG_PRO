# Attachment & Log Traceability Audit Report

**Audit date:** 2025-03-18  
**Scope:** TASK_ATTACHMENT typing, TASK_UPDATE_LOG structure, key action logging

---

## 1. Attachment typed correctly

### Verdict: **PASS** (GAS) / **FAIL** (AppSheet policy)

| Check | Result |
|-------|--------|
| createTaskAttachment: ATTACHMENT_TYPE required | ✓ ensureRequired + assertValidEnumValue |
| ATTACHMENT_TYPE in enum (DRAFT, RESULT, SOP, REFERENCE) | ✓ |
| TASK_ID link | ✓ Schema: TASK_ID → TASK_MAIN |
| APPSHEET_FIELD_POLICY_MAP: ATTACHMENT_TYPE, TITLE | **MISSING** |

**Issue:** Policy map has TASK_ATTACHMENT with FILE_NAME, FILE_URL, NOTE but no ATTACHMENT_TYPE or TITLE. If form allows direct add, type could be omitted.

---

## 2. Log structured (not free text chaos)

### Verdict: **PASS** (GAS) / **FAIL** (AppSheet policy)

| Check | Result |
|-------|--------|
| addTaskUpdate validates ACTION in enum | ✓ TASK_UPDATE_LOG_ACTIONS |
| ACTION required | ✓ cbvAssert |
| addTaskLogEntry: NOTE required | ✓ |
| TASK_UPDATE_LOG read-only in AppSheet | **VIOLATION** |

**Issue:** APPSHEET_FIELD_POLICY_MAP sets TASK_UPDATE_LOG columns (TASK_ID, ACTION, OLD_STATUS, NEW_STATUS, NOTE, ACTOR_ID) as VISIBLE_EDITABLE. Users could edit log directly → free text chaos, structure bypass.

---

## 3. Important actions logged

### Verdict: **PASS** (with 1 gap)

| Action | Logged | UPDATE_TYPE |
|--------|--------|-------------|
| createTask | ✓ | NOTE |
| setTaskStatus | ✓ | STATUS_CHANGE |
| addChecklistItem | ✓ | NOTE |
| markChecklistDone | ✓ | NOTE |
| createTaskAttachment | **No** | — |
| addTaskLogEntry (user) | ✓ | NOTE/QUESTION/ANSWER |

**Gap:** createTaskAttachment does not log to TASK_UPDATE_LOG. Attachment add is not traceable in log.

---

## Fixes applied

| Issue | Fix |
|-------|-----|
| TASK_ATTACHMENT missing ATTACHMENT_TYPE, TITLE in policy map | Add to csv, json |
| TASK_UPDATE_LOG editable | Set all columns VISIBLE_READONLY |
| createTaskAttachment not logged | Add addTaskUpdate after append |

---

## Verdict

**TRACEABILITY READY** (after fixes applied)

- Attachments typed (ATTACHMENT_TYPE required; policy map includes ATTACHMENT_TYPE, TITLE).
- Log structured (TASK_UPDATE_LOG read-only; ACTION validated).
- Key actions logged (createTask, setTaskStatus, addChecklistItem, markChecklistDone, createTaskAttachment).
