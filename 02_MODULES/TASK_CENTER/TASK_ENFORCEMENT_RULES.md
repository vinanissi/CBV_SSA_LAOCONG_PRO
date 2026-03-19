# TASK Enforcement Rules

**Module:** TASK_CENTER  
**Implementation:** `05_GAS_RUNTIME/20_TASK_SERVICE.gs`

---

## 1. No Direct Sheet Write

| Rule | Enforcement |
|------|-------------|
| All TASK_* writes via service | Only `20_TASK_SERVICE.gs` and `03_SHARED_REPOSITORY.gs` call `_appendRecord` / `_updateRow` on TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG |
| AppSheet forms | Field policy: STATUS, PROGRESS_PERCENT, DONE_AT, IS_DONE, DONE_AT, DONE_BY = readonly. Actions MUST call GAS webhook. |
| No bypass | No other script or AppSheet action may write directly to TASK_* tables. |

---

## 2. All Changes Validated

| Function | Validation |
|----------|------------|
| createTask | ensureRequired(TITLE, OWNER_ID, PRIORITY); assertValidEnumValue(PRIORITY, TASK_TYPE, RELATED_ENTITY_TYPE) |
| assignTask | ensureRequired(ownerId); ensureTaskEditable; status in NEW\|ASSIGNED\|IN_PROGRESS |
| updateTaskStatus | ensureTaskEditable; validateTaskTransition; if DONE → ensureTaskCanComplete |
| completeTask | (via updateTaskStatus) ensureTaskCanComplete |
| cancelTask | (via updateTaskStatus) validateTaskTransition |
| addChecklistItem | ensureRequired(TASK_ID, TITLE); ensureTaskEditable |
| markChecklistDone | ensureTaskEditable |
| createTaskAttachment | ensureRequired(TASK_ID, FILE_URL, ATTACHMENT_TYPE); ensureTaskEditable; assertValidEnumValue(ATTACHMENT_TYPE) |
| addTaskLogEntry | ensureRequired(note); action in NOTE\|QUESTION\|ANSWER; ensureTaskEditable |

---

## 3. All Changes Logged

| Function | Log |
|----------|-----|
| createTask | addTaskUpdate(NOTE, 'Task created') |
| assignTask | addTaskUpdate(STATUS_CHANGE or NOTE) |
| updateTaskStatus | addTaskUpdate(STATUS_CHANGE) |
| addChecklistItem | addTaskUpdate(NOTE, title) |
| markChecklistDone | addTaskUpdate(NOTE) |
| createTaskAttachment | addTaskUpdate(NOTE, 'Attachment added: ...') |
| addTaskLogEntry | addTaskUpdate(action, note) |

---

## 4. Idempotent Behavior

| Function | Idempotent When |
|----------|-----------------|
| updateTaskStatus | Same status → return TASK_NO_CHANGE, no write |
| completeTask | Already DONE → return success |
| cancelTask | Already CANCELLED → return success |
| assignTask | Same owner and not NEW → return TASK_NO_CHANGE |
| markChecklistDone | Already IS_DONE=true → return TASK_NO_CHANGE |

---

## 5. Workflow Guards

| Guard | Blocks |
|-------|--------|
| `validateTaskTransition(from, to)` | Invalid status transitions (e.g. NEW→DONE) |
| `ensureTaskEditable(taskId)` | Any edit when STATUS=ARCHIVED |
| `ensureTaskCanComplete(taskId)` | DONE when required checklist incomplete |

---

## 6. Data Flow

```
AppSheet Action → GAS Webhook → Service Function → _appendRecord/_updateRow
                                    ↓
                              addTaskUpdate (TASK_UPDATE_LOG)
```

No direct AppSheet → Sheet writes for TASK_* tables.
