# TASK State Rules — CBV_SSA_LAOCONG_PRO

State-driven UI for TASK module. Enforces ACTION UX: user always sees correct next action, never invalid action, never breaks workflow.

---

## 1. State Machine

```
                    ┌─────────────┐
                    │     NEW     │
                    └──────┬──────┘
                           │ TASK_ASSIGN (assign owner)
                           ▼
                    ┌─────────────┐
                    │  ASSIGNED   │
                    └──────┬──────┘
                           │ TASK_START (bắt đầu làm)
                           ▼
                    ┌─────────────┐     TASK_WAIT      ┌─────────────┐
                    │ IN_PROGRESS │◄───────────────────│   WAITING    │
                    └──────┬──────┘                    └──────┬──────┘
                           │ TASK_RESUME                      │
                           │◄─────────────────────────────────┘
                           │
                           │ TASK_DONE (checklist complete)
                           ▼
                    ┌─────────────┐
                    │    DONE     │
                    └─────────────┘

TASK_CANCEL: NEW | ASSIGNED | IN_PROGRESS | WAITING → CANCELLED
```

---

## 2. Valid Transitions (GAS: 20_TASK_SERVICE.js)

| From       | To          | Action        |
|------------|-------------|---------------|
| NEW        | ASSIGNED    | assignTask    |
| NEW        | CANCELLED   | setTaskStatus |
| ASSIGNED   | IN_PROGRESS | setTaskStatus |
| ASSIGNED   | CANCELLED   | setTaskStatus |
| IN_PROGRESS| WAITING     | setTaskStatus |
| IN_PROGRESS| DONE        | completeTask  |
| IN_PROGRESS| CANCELLED   | setTaskStatus |
| WAITING    | IN_PROGRESS | setTaskStatus |
| WAITING    | CANCELLED   | setTaskStatus |
| DONE       | ARCHIVED    | (archive)     |
| CANCELLED  | ARCHIVED    | (archive)     |

---

## 3. Action Visibility Rules

| Action      | Show_If |
|-------------|---------|
| TASK_ASSIGN | `[STATUS] = "NEW"` |
| TASK_START  | `[STATUS] = "ASSIGNED"` |
| TASK_WAIT   | `[STATUS] = "IN_PROGRESS"` |
| TASK_RESUME | `[STATUS] = "WAITING"` |
| TASK_DONE   | `AND([STATUS] = "IN_PROGRESS", COUNT(SELECT(TASK_CHECKLIST[ID], AND([TASK_ID] = [_THISROW].[ID], [IS_REQUIRED] = TRUE, [IS_DONE] <> TRUE))) = 0)` |
| TASK_CANCEL | `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))` |

---

## 4. Hard Block Rules

1. **DONE hidden if checklist incomplete**  
   TASK_DONE only visible when all required checklist items are done.

2. **No action on DONE**  
   When `[STATUS] = "DONE"`, no workflow action buttons shown.

3. **No action on CANCELLED**  
   When `[STATUS] = "CANCELLED"`, no workflow action buttons shown.

4. **No direct STATUS edit**  
   STATUS must never be editable in forms. All changes via GAS actions (assignTask, setTaskStatus, completeTask).

5. **ARCHIVED is terminal**  
   ARCHIVED tasks cannot be edited or reopened without explicit rule.

---

## 5. Checklist Rule (GAS: ensureTaskCanComplete)

Task can transition to DONE only when:

```
COUNT(SELECT(TASK_CHECKLIST[ID], AND(
  [TASK_ID] = taskId,
  [IS_REQUIRED] = TRUE,
  [IS_DONE] <> TRUE
))) = 0
```

AppSheet Show_If for TASK_DONE uses the same logic with `[_THISROW].[ID]`.

---

## 6. UX Rules

- Show actions as **primary buttons** (not secondary links).
- Order: **ASSIGN → START → WAIT → RESUME → DONE → CANCEL**.
- Only show valid next actions (state-driven).
- No direct STATUS dropdown or edit.

---

## 7. GAS Functions

| Function        | Purpose                    |
|-----------------|----------------------------|
| assignTask      | NEW → ASSIGNED (set owner) |
| setTaskStatus   | All other transitions      |
| completeTask    | IN_PROGRESS → DONE (with validation) |
