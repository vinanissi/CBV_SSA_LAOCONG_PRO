# AppSheet TASK Policy — Workflow Lock

**Purpose:** Prevent workflow bypass via form edits. All status and progress changes MUST go through GAS service.

---

## 1. Fields That MUST NOT Be Directly Editable

| Table | Column | Policy | Bypass Risk |
|-------|--------|--------|-------------|
| TASK_MAIN | STATUS | Editable=OFF | **CRITICAL** — user could set DONE without checklist |
| TASK_MAIN | PROGRESS_PERCENT | Editable=OFF | **CRITICAL** — override checklist-derived progress |
| TASK_MAIN | DONE_AT | Editable=OFF | **CRITICAL** — falsify completion time |
| TASK_CHECKLIST | IS_DONE | Editable=OFF | **CRITICAL** — mark done without markChecklistDone |
| TASK_CHECKLIST | DONE_AT | Editable=OFF | **CRITICAL** — falsify |
| TASK_CHECKLIST | DONE_BY | Editable=OFF | **CRITICAL** — falsify actor |
| TASK_UPDATE_LOG | All columns | Editable=OFF | **CRITICAL** — corrupt audit trail |

---

## 2. How to Change These Fields

| Field | Valid path |
|-------|------------|
| STATUS | GAS: updateTaskStatus, completeTask, cancelTask, assignTask |
| PROGRESS_PERCENT | GAS: syncTaskProgress (called by markChecklistDone, addChecklistItem) |
| DONE_AT (TASK_MAIN) | GAS: setTaskStatus when DONE |
| IS_DONE (TASK_CHECKLIST) | GAS: markChecklistDone |
| DONE_AT, DONE_BY (TASK_CHECKLIST) | GAS: markChecklistDone |
| TASK_UPDATE_LOG | GAS: addTaskUpdate only; append-only |

---

## 3. AppSheet Configuration Checklist (Deployment Must-Lock)

| Table | Field | Show | Editable | Editable_If | Controlled By |
|-------|-------|------|----------|-------------|---------------|
| TASK_MAIN | STATUS | ON | OFF | FALSE | GAS: updateTaskStatus, completeTask, cancelTask, assignTask |
| TASK_MAIN | PROGRESS_PERCENT | ON | OFF | FALSE | GAS: syncTaskProgress (checklist-derived) |
| TASK_MAIN | DONE_AT | ON | OFF | FALSE | GAS: setTaskStatus when DONE |
| TASK_CHECKLIST | IS_DONE | ON | OFF | FALSE | GAS: markChecklistDone |
| TASK_CHECKLIST | DONE_AT | ON | OFF | FALSE | GAS: markChecklistDone |
| TASK_CHECKLIST | DONE_BY | ON | OFF | FALSE | GAS: markChecklistDone |
| TASK_UPDATE_LOG | All columns | per view | OFF | FALSE | GAS: addTaskUpdate only |

- [ ] TASK_MAIN: STATUS, PROGRESS_PERCENT, DONE_AT — Editable=OFF, Editable_If=FALSE
- [ ] TASK_CHECKLIST: IS_DONE, DONE_AT, DONE_BY — Editable=OFF, Editable_If=FALSE
- [ ] TASK_UPDATE_LOG: All columns Editable=OFF, Editable_If=FALSE (operationally read-only)
- [ ] Actions: ACT_TASK_ASSIGN, ACT_TASK_START, etc. call GAS webhook — NOT "Update row"

---

## 4. Bypass Identification

If any workflow field is editable in form:

1. User can set STATUS=DONE without ensureTaskCanComplete
2. User can set PROGRESS_PERCENT=100 without checklist
3. User can mark IS_DONE=true without DONE_AT, DONE_BY, log
4. Audit trail incomplete; no traceability

**Verdict:** CRITICAL — workflow and integrity broken.

---

## 5. Deployment Expectations

| Layer | Responsibility |
|-------|----------------|
| **AppSheet** | Lock STATUS, PROGRESS_PERCENT, DONE_AT, IS_DONE, DONE_AT, DONE_BY, TASK_UPDATE_LOG in forms. No direct "Update row" for workflow. |
| **GAS** | Validates transitions (validateTaskTransition), enforces checklist (ensureTaskCanComplete). Webhook receives ACTOR_ID. |
| **Webhook** | If webhook permission validation is implemented: validate caller identity. If not: document as deployment requirement. |

## 6. Source

- **APPSHEET_FIELD_POLICY_MAP.csv** — authoritative for Show/Editable
- **APPSHEET_MANUAL_CONFIG_CHECKLIST.md** — step-by-step deployment
