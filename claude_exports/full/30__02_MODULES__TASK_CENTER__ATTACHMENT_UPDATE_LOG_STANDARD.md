# TASK Attachment & Update Log Standard

**Module:** TASK_CENTER

---

## 1. Enum Mapping

### TASK_ATTACHMENT_TYPE (ATTACHMENT_TYPE column)

| ENUM_VALUE | Display | Use |
|------------|---------|-----|
| DRAFT | Bản nháp | Work in progress |
| RESULT | Kết quả | Deliverable / outcome |
| SOP | Quy trình | Procedure, process doc |
| REFERENCE | Tham khảo | Reference material |

**Rule:** No free text — ATTACHMENT_TYPE required. No OTHER.

### UPDATE_TYPE (ACTION column in TASK_UPDATE_LOG)

| ENUM_VALUE | Display | Use |
|------------|---------|-----|
| NOTE | Ghi chú | General note, system events (created, checklist) |
| QUESTION | Câu hỏi | User asks a question |
| ANSWER | Trả lời | User answers |
| STATUS_CHANGE | Đổi trạng thái | Status transition |

**Rule:** No free text without type — every log entry must have ACTION. NOTE content required for user entries.

---

## 2. Structure Validation

### TASK_ATTACHMENT

| Rule | Enforcement |
|------|-------------|
| Linked by TASK_ID | Schema: TASK_ID → TASK_MAIN.ID |
| ATTACHMENT_TYPE required | ensureRequired + assertValidEnumValue |
| ATTACHMENT_TYPE in enum | TASK_ATTACHMENT_TYPE: DRAFT, RESULT, SOP, REFERENCE |

### TASK_UPDATE_LOG

| Rule | Enforcement |
|------|-------------|
| Linked by TASK_ID | Schema: TASK_ID → TASK_MAIN.ID |
| ACTION required | addTaskUpdate validates ACTION in TASK_UPDATE_LOG_ACTIONS |
| ACTION in enum | NOTE, QUESTION, ANSWER, STATUS_CHANGE |
| No free text without type | addTaskLogEntry requires NOTE; ACTION required |

---

## 3. Mandatory Logging for Key Actions

| Action | UPDATE_TYPE | Logged by |
|--------|-------------|-----------|
| createTask | NOTE | addTaskUpdate |
| setTaskStatus | STATUS_CHANGE | addTaskUpdate |
| addChecklistItem | NOTE | addTaskUpdate |
| markChecklistDone | NOTE | addTaskUpdate |
| createTaskAttachment | NOTE | addTaskUpdate |
| User note/question/answer | NOTE / QUESTION / ANSWER | addTaskLogEntry |

---

## 4. API

### createTaskAttachment(data)

- **Required:** TASK_ID, FILE_URL, ATTACHMENT_TYPE
- **Validation:** assertValidEnumValue('TASK_ATTACHMENT_TYPE', data.ATTACHMENT_TYPE)

### addTaskLogEntry(taskId, action, note)

- **Required:** taskId, action, note
- **action:** NOTE | QUESTION | ANSWER
- **Validation:** ensureTaskEditable, ensureRequired(note)
