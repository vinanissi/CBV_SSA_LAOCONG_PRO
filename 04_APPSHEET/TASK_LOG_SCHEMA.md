# TASK_UPDATE_LOG Schema — Full Traceability

Every action must be **logged**, **attributable**, **timestamped**, **immutable**.

---

## 1. Table: TASK_UPDATE_LOG

| Column    | Type   | Required | Editable | Purpose |
|-----------|--------|----------|----------|---------|
| ID        | Text   | Yes      | No       | Primary key (TLOG_xxx) |
| TASK_ID   | Ref    | Yes      | No       | Links to TASK_MAIN |
| ACTION    | Text   | Yes      | No       | Action type (enum) |
| OLD_STATUS| Text   | No       | No       | Status before change |
| NEW_STATUS| Text   | No       | No       | Status after change |
| NOTE      | Text   | No       | No       | Optional context |
| ACTOR_ID  | Text   | Yes      | No       | Who performed (cbvUser()) |
| CREATED_AT| DateTime| Yes     | No       | When (cbvNow()) |

---

## 2. ACTION Enum

### Workflow actions (status changes)

| ACTION  | Meaning           | OLD_STATUS → NEW_STATUS |
|---------|-------------------|--------------------------|
| ASSIGN  | Giao task         | NEW → ASSIGNED |
| START   | Bắt đầu làm       | ASSIGNED → IN_PROGRESS |
| WAIT    | Tạm chờ           | IN_PROGRESS → WAITING |
| RESUME  | Tiếp tục          | WAITING → IN_PROGRESS |
| DONE    | Hoàn thành        | IN_PROGRESS → DONE |
| CANCEL  | Hủy               | * → CANCELLED |

### Non-workflow actions

| ACTION       | Meaning              | OLD_STATUS | NEW_STATUS |
|--------------|----------------------|------------|------------|
| NOTE        | Ghi chú thường       | ''         | ''         |
| QUESTION    | Câu hỏi              | ''         | ''         |
| ANSWER      | Trả lời              | ''         | ''         |
| CREATED     | Task created         | NEW        | NEW        |
| CHECKLIST_ADD| Thêm checklist item | ''         | ''         |
| CHECKLIST_DONE | Đánh dấu xong    | ''         | ''         |
| ATTACHMENT_ADD | Thêm file đính kèm | ''       | ''         |

**Legacy:** `STATUS_CHANGE` may be used by existing GAS; prefer explicit ACTION (ASSIGN, START, WAIT, RESUME, DONE, CANCEL) for workflow.

---

## 3. Traceability Requirements

| Requirement   | Implementation |
|---------------|----------------|
| Logged        | Every action creates TASK_UPDATE_LOG row |
| Attributable  | ACTOR_ID = cbvUser() (no override) |
| Timestamped   | CREATED_AT = cbvNow() |
| Immutable     | No edit, no delete; append only |

---

## 4. ID Format

- Prefix: `TLOG`
- Example: `TLOG_abc123xyz`

---

## 5. Ref: TASK_ID

- Ref target: TASK_MAIN
- Display: TITLE (or TASK_CODE)
- Filter: N/A (log is append-only; no user filter on write)
