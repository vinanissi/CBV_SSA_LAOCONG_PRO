# SERVICE CONTRACT - TASK_CENTER

**Workflow rules:** See `TASK_WORKFLOW_RULES.md` — transition map, validateTaskTransition, ensureTaskEditable.  
**Progress logic:** See `TASK_PROGRESS_LOGIC.md` — checklist as source of truth, calculateProgress, syncTaskProgress.  
**API & enforcement:** See `TASK_SERVICE_API.md`, `TASK_ENFORCEMENT_RULES.md`.

## createTask(data)
### Validation
- TITLE, OWNER_ID, PRIORITY required
- assertValidEnumValue(PRIORITY, TASK_TYPE, RELATED_ENTITY_TYPE)

### Side effects
- Append TASK_MAIN (STATUS=NEW)
- addTaskUpdate(NOTE, 'Task created')

## assignTask(taskId, ownerId)
### Validation
- ownerId required
- task exists, not ARCHIVED
- status in NEW | ASSIGNED | IN_PROGRESS

### Side effects
- Update OWNER_ID
- If NEW → STATUS=ASSIGNED, log STATUS_CHANGE
- Else log NOTE (reassigned)

### Idempotent
- Same owner and not NEW → no change

## completeTask(taskId, note)
### Validation
- task exists, not ARCHIVED
- validateTaskTransition → DONE
- ensureTaskCanComplete (required checklist done)

### Side effects
- set DONE, DONE_AT, PROGRESS_PERCENT=100
- ghi TASK_UPDATE_LOG (STATUS_CHANGE)

### Idempotent
- Already DONE → no change

## cancelTask(taskId, note)
### Validation
- task exists, not ARCHIVED
- validateTaskTransition → CANCELLED

### Side effects
- set STATUS=CANCELLED
- ghi TASK_UPDATE_LOG

### Idempotent
- Already CANCELLED → no change

## updateTaskStatus(taskId, newStatus, note)
### Validation
- validateTaskTransition
- if DONE → ensureTaskCanComplete

### Idempotent
- Same status → no change
