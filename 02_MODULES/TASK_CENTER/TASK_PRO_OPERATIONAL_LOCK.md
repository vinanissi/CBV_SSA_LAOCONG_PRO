# TASK Module — PRO Operational Lock

**Status:** PRO OPERATIONAL READY  
**Lock date:** 2025-03-18  
**Scope:** TASK_CENTER module — schema, workflow, checklist, attachment, log, AppSheet, service layer

---

## 1. Final TASK Architecture Summary

### Tables

| Table | Purpose |
|-------|---------|
| TASK_MAIN | Task header; STATUS, PROGRESS_PERCENT, DONE_AT system-maintained |
| TASK_CHECKLIST | Checklist items; IS_DONE, DONE_AT, DONE_BY GAS-only |
| TASK_ATTACHMENT | Attachments; ATTACHMENT_TYPE required (DRAFT, RESULT, SOP, REFERENCE) |
| TASK_UPDATE_LOG | Audit log; ACTION required (NOTE, QUESTION, ANSWER, STATUS_CHANGE) |

### Workflow

```
NEW → ASSIGNED → IN_PROGRESS → WAITING → DONE → ARCHIVED
         ↓            ↓            ↓
      CANCELLED ←←←←←←←←←←←←←←←←←←←
         ↓
      ARCHIVED
```

- **Guards:** validateTaskTransition, ensureTaskEditable, ensureTaskCanComplete
- **No jump NEW→DONE** — must follow flow
- **ARCHIVED terminal** — no reopen

### Progress

- **Source of truth:** TASK_CHECKLIST
- **Formula:** doneCount / totalCount × 100
- **Auto-update:** addChecklistItem, markChecklistDone, setTaskStatus(DONE)
- **DONE blocked** when required checklist incomplete

### Attachment & Log

- **ATTACHMENT_TYPE:** DRAFT, RESULT, SOP, REFERENCE (no free text)
- **UPDATE_TYPE (ACTION):** NOTE, QUESTION, ANSWER, STATUS_CHANGE
- **All key actions logged** to TASK_UPDATE_LOG

---

## 2. Final Deployment Order

### GAS (CLASP_PUSH_ORDER)

| # | File | TASK dependency |
|---|------|-----------------|
| 9 | 03_SHARED_REPOSITORY.gs | _appendRecord, _updateRow, _findById |
| 10 | 03_SHARED_VALIDATION.gs | ensureTaskCanComplete |
| 11 | 03_SHARED_LOGGER.gs | — |
| 18 | **20_TASK_SERVICE.gs** | **TASK module** |
| 25 | 99_DEBUG_TEST_TASK.gs | createTask, setTaskStatus, etc. |

**Prerequisites:** 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_SERVICE, 03_SHARED_*

### Database

1. Create sheets: TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG
2. Headers from `06_DATABASE/_generated_schema/*.csv` or `90_BOOTSTRAP_INIT`
3. **TASK_MAIN** must include PROGRESS_PERCENT (after DONE_AT)

### AppSheet

1. Add tables: TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG
2. Apply field policy from `04_APPSHEET/APPSHEET_FIELD_POLICY_MAP.csv`
3. Configure actions to call GAS webhook (no direct STATUS/IS_DONE edit)

---

## 3. Final Service List

### Public API (AppSheet / Webhook)

| Function | Params | Use |
|----------|--------|-----|
| createTask | (data) | Create task |
| assignTask | (taskId, ownerId) | Assign/reassign |
| updateTaskStatus | (taskId, newStatus, note) | Generic status |
| completeTask | (taskId, note) | Mark DONE |
| cancelTask | (taskId, note) | Cancel |
| addChecklistItem | (data) | Add checklist item |
| markChecklistDone | (checklistId, note) | Mark item done |
| createTaskAttachment | (data) | Add attachment |
| addTaskLogEntry | (taskId, action, note) | Add NOTE/QUESTION/ANSWER |

### Internal (do not call from AppSheet)

| Function | Purpose |
|----------|---------|
| setTaskStatus | Core status transition |
| validateTaskTransition | Guard |
| ensureTaskEditable | Guard |
| calculateProgress | From checklist |
| syncTaskProgress | Update PROGRESS_PERCENT |
| addTaskUpdate | Append TASK_UPDATE_LOG |

---

## 4. Final Usage Rules

### DO

- Call service functions for all TASK writes
- Use completeTask for DONE (not updateTaskStatus with DONE if wrapper exists)
- Use assignTask for assignment (not updateTaskStatus ASSIGNED + manual OWNER_ID)
- Add checklist before completing (if required)
- Use ATTACHMENT_TYPE when adding attachments
- Use addTaskLogEntry for NOTE/QUESTION/ANSWER

### DO NOT

- Write directly to TASK_* sheets
- Edit STATUS, PROGRESS_PERCENT, DONE_AT, IS_DONE, DONE_AT, DONE_BY in AppSheet forms
- Bypass service with AppSheet action "Update row" for workflow fields
- Add attachment without ATTACHMENT_TYPE
- Add log entry without ACTION

### AppSheet Actions → Service

| Action | Service |
|--------|---------|
| ACT_TASK_ASSIGN | assignTask(taskId, ownerId) |
| ACT_TASK_START | updateTaskStatus(taskId, 'IN_PROGRESS', '') |
| ACT_TASK_WAITING | updateTaskStatus(taskId, 'WAITING', note) |
| ACT_TASK_RESUME | updateTaskStatus(taskId, 'IN_PROGRESS', '') |
| ACT_TASK_COMPLETE | completeTask(taskId, note) |
| ACT_TASK_CANCEL | cancelTask(taskId, note) |
| ACT_TASK_ARCHIVE | updateTaskStatus(taskId, 'ARCHIVED', '') |

---

## 5. Requirement Checklist

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Schema stable | ✓ TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG; PROGRESS_PERCENT |
| 2 | Workflow locked | ✓ TASK_VALID_TRANSITIONS, validateTaskTransition, ensureTaskEditable |
| 3 | Checklist-driven completion | ✓ calculateProgress, syncTaskProgress, ensureTaskCanComplete |
| 4 | Attachment & log structured | ✓ TASK_ATTACHMENT_TYPE, UPDATE_TYPE; no free text |
| 5 | AppSheet safe | ✓ Field policy; STATUS, PROGRESS, IS_DONE readonly |
| 6 | Service layer enforced | ✓ No direct write; validation; logs; idempotent |

---

## Final Verdict

**TASK MODULE PRO OPERATIONAL READY**

All six requirements met. Schema, workflow, checklist, attachment, log, AppSheet, and service layer are locked and enforced.
