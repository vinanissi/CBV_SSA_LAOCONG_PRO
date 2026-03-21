# TASK Anti-Mistake Policy — CBV_SSA_LAOCONG_PRO

Eliminate common user mistakes at UI level. System must prevent mistakes **before** they happen, not rely only on backend validation, and guide user to correct action.

---

## 1. Invalid Action Blocking (Show_If)

| Action      | Mistake Prevented              | Show_If |
|-------------|--------------------------------|---------|
| TASK_DONE   | Complete task with incomplete checklist | `AND([STATUS] = "IN_PROGRESS", COUNT(SELECT(TASK_CHECKLIST[ID], AND([TASK_ID] = [_THISROW].[ID], [IS_REQUIRED] = TRUE, [IS_DONE] <> TRUE))) = 0)` |
| TASK_START  | Start when already IN_PROGRESS  | `[STATUS] = "ASSIGNED"` only |
| TASK_RESUME | Resume when not WAITING        | `[STATUS] = "WAITING"` only |
| TASK_CANCEL | Cancel when DONE               | `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))` |

**Rule:** Hide invalid actions. User never sees buttons they cannot use.

---

## 2. Form Validation (Strict)

| Field       | Rule                    | AppSheet Expression |
|-------------|-------------------------|----------------------|
| TITLE       | Required, min 5 chars   | Valid_If: `AND(ISNOTBLANK([TITLE]), LEN([TITLE]) >= 5)` |
| DUE_DATE    | Must be >= START_DATE   | Valid_If: `OR(ISBLANK([DUE_DATE]), ISBLANK([START_DATE]), [DUE_DATE] >= [START_DATE])` |
| OWNER_ID    | Must be ACTIVE user     | Ref → ACTIVE_USERS; Allow other values: **No** |
| PRIORITY    | Must not be blank       | Valid_If: `ISNOTBLANK([PRIORITY])` |

---

## 3. Smart Defaults

| Field       | Default Expression |
|-------------|---------------------|
| REPORTER_ID | `FIRST(SELECT(MASTER_CODE[ID], AND([MASTER_GROUP] = "USER", [SHORT_NAME] = USEREMAIL())))` |
| START_DATE  | `TODAY()` |
| PRIORITY    | `"MEDIUM"` |

---

## 4. Conditional Required

| Field       | Required When |
|-------------|---------------|
| RESULT_NOTE | Only when STATUS = DONE (on complete action) |

**Implementation:** TASK_DONE action prompts for RESULT_NOTE; GAS `completeTask(taskId, note)` requires note. Form Editable_If for RESULT_NOTE: `[STATUS] = "DONE"` (visible only after completion) or handled in action flow.

---

## 5. Disable Dangerous Edits (Editable_If = FALSE)

| Table        | Columns |
|--------------|---------|
| TASK_MAIN    | STATUS, DONE_AT, PROGRESS_PERCENT, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY |
| TASK_CHECKLIST | DONE_AT, DONE_BY, CREATED_AT, CREATED_BY (IS_DONE via GAS only) |

**Rule:** User cannot override system-controlled fields.

---

## 6. Inline Safety

### TASK_UPDATE_LOG

- **Add:** OFF (GAS only)
- **Edit:** OFF
- **Delete:** OFF

### TASK_ATTACHMENT

- **TASK_ID:** Required; Ref → TASK_MAIN; pre-filled from parent
- **No orphan file:** Inline add only under TASK_DETAIL; TASK_ID = [TASK_MAIN].[ID]

---

## 7. User Guidance (Virtual Columns)

| Column           | Purpose |
|------------------|---------|
| NEXT_ACTION_HINT | Tells user what to do next |
| CHECKLIST_HINT   | Shows checklist completion status |
| OVERDUE_HINT    | Highlights overdue tasks |

See **TASK_HINT_COLUMNS.md**.

---

## 8. Error Prevention UI

| Condition                    | UI Treatment |
|-----------------------------|--------------|
| Overdue task (DUE_DATE < TODAY, STATUS open) | Highlight row; show OVERDUE_HINT |
| Checklist incomplete        | Hide TASK_DONE; show CHECKLIST_HINT |
| DONE without RESULT_NOTE    | completeTask requires note; form validation |

---

## 9. Final Goal

User cannot:

- Complete task sai (wrong state or incomplete checklist)
- Chọn sai trạng thái (no direct STATUS edit)
- Nhập dữ liệu lỗi (Valid_If, Ref constraints, conditional required)

System guides user automatically via hints and hidden invalid actions.
