# TASK Status Workflow Rules

**Module:** TASK_CENTER  
**Implementation:** `05_GAS_RUNTIME/20_TASK_SERVICE.gs`

---

## 1. Transition Map

```
NEW → ASSIGNED → IN_PROGRESS → WAITING → DONE
         ↓            ↓            ↓
      CANCELLED ←←←←←←←←←←←←←←←←←←←
         ↓
      ARCHIVED ←← DONE
```

### VALID_TRANSITIONS (TASK_VALID_TRANSITIONS)

| From       | To                                      |
|------------|-----------------------------------------|
| NEW        | ASSIGNED, CANCELLED                      |
| ASSIGNED   | IN_PROGRESS, CANCELLED                   |
| IN_PROGRESS| WAITING, DONE, CANCELLED                 |
| WAITING    | IN_PROGRESS, CANCELLED                   |
| DONE       | ARCHIVED                                |
| CANCELLED  | ARCHIVED                                |
| ARCHIVED   | *(none — terminal)*                      |

### Rules enforced

- **No jump NEW → DONE** — must follow flow via ASSIGNED → IN_PROGRESS
- **ARCHIVED is terminal** — cannot reopen without explicit rule
- **Cannot edit ARCHIVED** — no checklist, attachment, or status change

---

## 2. Validation Function

```javascript
/**
 * @param {string} from - Current STATUS
 * @param {string} to - Target STATUS
 * @returns {boolean} True if transition is allowed
 */
function validateTaskTransition(from, to)
```

**Usage:** `cbvAssert(validateTaskTransition(current.STATUS, newStatus), 'Invalid transition: ...')`

---

## 3. Guards

| Guard                 | Purpose                                      |
|-----------------------|----------------------------------------------|
| `validateTaskTransition(from, to)` | Blocks invalid status transitions     |
| `ensureTaskEditable(taskId)`      | Blocks any edit when STATUS = ARCHIVED |
| `ensureTaskCanComplete(taskId)`   | Blocks DONE if required checklist incomplete |

---

## 4. Logging

Every status change is logged to **TASK_UPDATE_LOG**:

- `ACTION` = `STATUS_CHANGED`
- `OLD_STATUS`, `NEW_STATUS` recorded
- `NOTE` = optional note
- `ACTOR_ID`, `CREATED_AT` set

---

## 5. Integration Points

| Entry point           | Guard(s)                          | Logging      |
|-----------------------|-----------------------------------|--------------|
| `setTaskStatus(id, status, note)` | ARCHIVED block, validateTaskTransition, ensureTaskCanComplete (if DONE) | addTaskUpdate |
| `addChecklistItem(data)`         | ensureTaskEditable                | addTaskUpdate (CHECKLIST_ADDED) |
| `createTaskAttachment(data)`     | ensureTaskEditable                | —            |
| `markChecklistDone(id, note)`    | ensureTaskEditable                | addTaskUpdate (CHECKLIST_DONE) |

### AppSheet actions → GAS

| Action             | Calls                    | Valid when STATUS =   |
|---------------------|--------------------------|------------------------|
| ACT_TASK_ASSIGN      | setTaskStatus(id, ASSIGNED) | NEW                    |
| ACT_TASK_START       | setTaskStatus(id, IN_PROGRESS) | ASSIGNED            |
| ACT_TASK_WAITING     | setTaskStatus(id, WAITING) | IN_PROGRESS          |
| ACT_TASK_RESUME      | setTaskStatus(id, IN_PROGRESS) | WAITING             |
| ACT_TASK_COMPLETE    | setTaskStatus(id, DONE)   | IN_PROGRESS (+ checklist) |
| ACT_TASK_CANCEL      | setTaskStatus(id, CANCELLED) | NEW, ASSIGNED, IN_PROGRESS, WAITING |
| ACT_TASK_ARCHIVE     | setTaskStatus(id, ARCHIVED) | DONE, CANCELLED      |

**Note:** AppSheet actions MUST call GAS webhook/service — do not update STATUS directly in forms.
