# TASK Service API

**Module:** TASK_CENTER  
**Implementation:** `05_GAS_RUNTIME/20_TASK_SERVICE.js`

---

## Service API List

| Function | Params | Returns | Description |
|----------|--------|---------|-------------|
| `createTask(data)` | `{ TITLE, OWNER_ID, PRIORITY, ... }` | `cbvResponse` | Create task with STATUS=NEW |
| `assignTask(taskId, ownerId)` | `taskId`, `ownerId` | `cbvResponse` | Assign/reassign owner; NEW→ASSIGNED |
| `updateTaskStatus(taskId, newStatus, note)` | `taskId`, `newStatus`, `note` | `cbvResponse` | Generic status transition |
| `completeTask(taskId, note)` | `taskId`, `note` | `cbvResponse` | Transition to DONE |
| `cancelTask(taskId, note)` | `taskId`, `note` | `cbvResponse` | Transition to CANCELLED |
| `addChecklistItem(data)` | `{ TASK_ID, TITLE, ... }` | `cbvResponse` | Add checklist item |
| `markChecklistDone(checklistId, note)` | `checklistId`, `note` | `cbvResponse` | Mark item done, sync progress |
| `createTaskAttachment(data)` | `{ TASK_ID, FILE_URL, ATTACHMENT_TYPE, ... }` | `cbvResponse` | Add attachment |
| `addTaskLogEntry(taskId, action, note)` | `taskId`, `action`, `note` | `cbvResponse` | Add NOTE/QUESTION/ANSWER |

---

## Core Workflow Functions

### createTask(data)
- **Required:** TITLE, OWNER_ID, PRIORITY
- **Optional:** TASK_CODE, DESCRIPTION, TASK_TYPE, REPORTER_ID, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, START_DATE, DUE_DATE
- **Validation:** assertValidEnumValue for PRIORITY, TASK_TYPE, RELATED_ENTITY_TYPE
- **Side effects:** Append TASK_MAIN, addTaskUpdate(NOTE, 'Task created')

### assignTask(taskId, ownerId)
- **Validation:** task exists, not ARCHIVED, status in NEW|ASSIGNED|IN_PROGRESS
- **Idempotent:** If same owner and not NEW → return success, no change
- **Side effects:** Update OWNER_ID; if NEW → STATUS=ASSIGNED, log STATUS_CHANGE; else log NOTE

### updateTaskStatus(taskId, newStatus, note)
- **Alias:** setTaskStatus
- **Validation:** validateTaskTransition; if DONE → ensureTaskCanComplete
- **Idempotent:** If same status → return TASK_NO_CHANGE
- **Side effects:** Update STATUS, UPDATED_AT, UPDATED_BY; if DONE set DONE_AT, PROGRESS_PERCENT=100; addTaskUpdate(STATUS_CHANGE)

### completeTask(taskId, note)
- **Wrapper:** updateTaskStatus(taskId, 'DONE', note)
- **Idempotent:** If already DONE → return success

### cancelTask(taskId, note)
- **Wrapper:** updateTaskStatus(taskId, 'CANCELLED', note)
- **Idempotent:** If already CANCELLED → return success

---

## AppSheet Action → Service Mapping

| AppSheet Action | Service Call |
|-----------------|--------------|
| ACT_TASK_ASSIGN | assignTask(taskId, ownerId) |
| ACT_TASK_START | updateTaskStatus(taskId, 'IN_PROGRESS', '') |
| ACT_TASK_WAITING | updateTaskStatus(taskId, 'WAITING', note) |
| ACT_TASK_RESUME | updateTaskStatus(taskId, 'IN_PROGRESS', '') |
| ACT_TASK_COMPLETE | completeTask(taskId, note) |
| ACT_TASK_CANCEL | cancelTask(taskId, note) |
| ACT_TASK_ARCHIVE | updateTaskStatus(taskId, 'ARCHIVED', '') |

---

## Internal Helpers (not public API)

| Function | Purpose |
|----------|---------|
| `validateTaskTransition(from, to)` | Check transition allowed |
| `ensureTaskEditable(taskId)` | Block if ARCHIVED |
| `calculateProgress(taskId)` | From checklist |
| `syncTaskProgress(taskId)` | Update PROGRESS_PERCENT |
| `addTaskUpdate(taskId, action, note, oldStatus, newStatus)` | Append TASK_UPDATE_LOG |
