# TASK Log Enforcement Rules — Full Traceability

System can answer: **ai làm gì**, **lúc nào**, **thay đổi gì**, **từ trạng thái nào → trạng thái nào**. No hidden behavior.

---

## 1. Log Rules

| Rule        | Enforcement |
|-------------|-------------|
| No edit     | TASK_UPDATE_LOG: all columns Editable_If = FALSE |
| No delete   | No Delete action on TASK_UPDATE_LOG; sheet protection |
| Append only | GAS `_appendRecord` only; no `_updateRow` on log |

---

## 2. Auto Logging (Required)

Every workflow action **must**:

1. Write to TASK_UPDATE_LOG via `addTaskUpdate` (or equivalent)
2. Include **OLD_STATUS** and **NEW_STATUS** for status changes
3. Set **ACTOR_ID** = cbvUser() (or mapped user ID)
4. Set **CREATED_AT** = cbvNow()

---

## 3. GAS → Log Mapping

| GAS Function      | Must call addTaskUpdate with |
|-------------------|------------------------------|
| createTask        | ACTION=CREATED, OLD_STATUS=NEW, NEW_STATUS=NEW |
| assignTask        | ACTION=ASSIGN, OLD_STATUS, NEW_STATUS=ASSIGNED |
| setTaskStatus     | ACTION=START|WAIT|RESUME|DONE|CANCEL (by transition), OLD_STATUS, NEW_STATUS |
| completeTask      | ACTION=DONE, OLD_STATUS=IN_PROGRESS, NEW_STATUS=DONE |
| cancelTask        | ACTION=CANCEL, OLD_STATUS, NEW_STATUS=CANCELLED |
| addChecklistItem  | ACTION=CHECKLIST_ADD, NOTE=item title |
| markChecklistDone | ACTION=CHECKLIST_DONE, NOTE=item title |
| createTaskAttachment | ACTION=ATTACHMENT_ADD, NOTE=filename |
| addTaskLogEntry   | ACTION=NOTE|QUESTION|ANSWER, NOTE=user content |

---

## 4. ACTION Derivation

For `setTaskStatus(taskId, newStatus, note)`:

| oldStatus → newStatus | LOG_ACTION |
|----------------------|------------|
| NEW → ASSIGNED       | ASSIGN (via assignTask) |
| ASSIGNED → IN_PROGRESS | START |
| IN_PROGRESS → WAITING | WAIT |
| WAITING → IN_PROGRESS | RESUME |
| IN_PROGRESS → DONE   | DONE |
| * → CANCELLED        | CANCEL |

---

## 5. AppSheet Security

| Setting              | Value |
|----------------------|-------|
| TASK_UPDATE_LOG Add  | OFF   |
| TASK_UPDATE_LOG Edit | OFF   |
| TASK_UPDATE_LOG Delete | OFF |
| All columns Editable_If | FALSE |

---

## 6. Sheet Protection

- TASK_UPDATE_LOG sheet protected (90_BOOTSTRAP_PROTECTION.js)
- Only GAS service account can write

---

## 7. GAS Implementation Note

**Current:** `addTaskUpdate` uses ACTION = STATUS_CHANGE for all status changes. OLD_STATUS and NEW_STATUS are stored.

**Recommended:** Extend `TASK_UPDATE_LOG_ACTIONS` to include ASSIGN, START, WAIT, RESUME, DONE, CANCEL. Use explicit ACTION when logging status changes for clearer audit trail.

---

## 8. Verification Checklist

- [ ] createTask logs CREATED
- [ ] assignTask logs ASSIGN with OLD_STATUS, NEW_STATUS
- [ ] setTaskStatus logs START/WAIT/RESUME/DONE/CANCEL with OLD_STATUS, NEW_STATUS
- [ ] addChecklistItem logs CHECKLIST_ADD
- [ ] markChecklistDone logs CHECKLIST_DONE
- [ ] createTaskAttachment logs ATTACHMENT_ADD
- [ ] addTaskLogEntry logs NOTE/QUESTION/ANSWER
- [ ] TASK_UPDATE_LOG: All columns Editable_If = FALSE
- [ ] TASK_UPDATE_LOG: No Add, Edit, Delete in AppSheet
