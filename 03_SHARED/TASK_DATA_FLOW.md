# TASK Data Flow

**Purpose:** Document how data flows in the TASK system under the canonical architecture.

---

## 1. Create Task

```
AppSheet Form / Action
        →
GAS createTask(data)
        →
Validates: TITLE, OWNER_ID (assertActiveUserId), PRIORITY
        →
Optional: HTX_ID (if provided, must ref valid HTX)
Optional: REPORTER_ID default = mapCurrentUserEmailToInternalId()
        →
_appendRecord(TASK_MAIN, record)
        →
addTaskUpdate(taskId, NOTE, 'Task created')
```

**Data sources:**
- OWNER_ID: USER_DIRECTORY (ACTIVE_USERS slice)
- REPORTER_ID: USER_DIRECTORY (default from current user)
- HTX_ID: HO_SO_MASTER (ACTIVE_HTX slice) — when task belongs to HTX

---

## 2. Assign Task

```
AppSheet Action (assignTask)
        →
GAS assignTask(taskId, ownerId)
        →
assertActiveUserId(ownerId, 'OWNER_ID')
        →
_updateRow(TASK_MAIN, OWNER_ID = ownerId)
        →
addTaskUpdate(taskId, STATUS_CHANGE or NOTE)
```

**Owner:** Always from USER_DIRECTORY.

---

## 3. Mark Checklist Done

```
AppSheet Action (markChecklistDone)
        →
GAS markChecklistDone(taskId, itemId)
        →
DONE_BY = mapCurrentUserEmailToInternalId()
        →
_updateRow(TASK_CHECKLIST)
        →
addTaskUpdate(taskId, NOTE)
syncTaskProgress(taskId)
```

**DONE_BY:** USER_DIRECTORY.ID (current user).

---

## 4. Status Change

```
AppSheet Action (updateTaskStatus)
        →
GAS updateTaskStatus(taskId, newStatus)
        →
validateTaskTransition(from, to)
ensureTaskCanComplete (if → DONE)
        →
_updateRow(TASK_MAIN)
        →
addTaskUpdate(taskId, STATUS_CHANGE)
```

**ACTOR_ID in log:** mapCurrentUserEmailToInternalId() || cbvUser()

---

## 5. Task–HTX Scoping

When TASK_MAIN has HTX_ID:
- Filter tasks by HTX: `[HTX_ID] = <selected HTX>`
- Users can operate on tasks across HTX (shared users)
- HTX_ID on task determines which HTX the task belongs to for reporting/filtering

---

## 6. No Direct Sheet Writes

| Path | Allowed |
|------|---------|
| AppSheet → GAS → _appendRecord / _updateRow | Yes |
| AppSheet → Sheet direct | No (for TASK_*, STATUS, PROGRESS_PERCENT, DONE_AT, DONE_BY) |
| GAS service functions | Only 20_TASK_SERVICE.gs, 03_SHARED_REPOSITORY |

---

## 7. References

- 03_SHARED/TASK_SYSTEM_ARCHITECTURE.md
- 02_MODULES/TASK_CENTER/TASK_ENFORCEMENT_RULES.md
- 05_GAS_RUNTIME/20_TASK_SERVICE.gs
