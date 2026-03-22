# AppSheet Task Action Rules

**Model:** AppSheet is UI only. All workflow transitions are **GAS-enforced**.

**Purpose:** Define which actions are AppSheet-safe (call GAS webhook) and which must remain GAS-only.

---

## 1. Valid Status Transitions (GAS: 20_TASK_VALIDATION.gs)

| From | To | GAS Function |
|------|-----|--------------|
| NEW | ASSIGNED | assignTask |
| NEW | CANCELLED | cancelTask / setTaskStatus |
| ASSIGNED | IN_PROGRESS | setTaskStatus |
| ASSIGNED | CANCELLED | cancelTask |
| IN_PROGRESS | WAITING | setTaskStatus |
| IN_PROGRESS | DONE | completeTask |
| IN_PROGRESS | CANCELLED | cancelTask |
| WAITING | IN_PROGRESS | setTaskStatus |
| WAITING | CANCELLED | cancelTask |
| DONE | ARCHIVED | setTaskStatus |
| CANCELLED | ARCHIVED | setTaskStatus |
| ARCHIVED | — | (terminal) |

---

## 2. AppSheet-Safe Actions (Phase 1)

These actions **invoke GAS via webhook**. AppSheet shows a button; user taps; GAS executes.

| Action | Purpose | GAS Call | Show_If |
|--------|---------|----------|---------|
| **ACT_TASK_ASSIGN** | Assign owner (NEW → ASSIGNED) | assignTask(taskId, ownerId) | `[STATUS] = "NEW"` |
| **ACT_TASK_START** | Start work (ASSIGNED → IN_PROGRESS) | setTaskStatus(taskId, "IN_PROGRESS", "") | `[STATUS] = "ASSIGNED"` |
| **ACT_TASK_WAIT** | Put on hold (IN_PROGRESS → WAITING) | setTaskStatus(taskId, "WAITING", "") | `[STATUS] = "IN_PROGRESS"` |
| **ACT_TASK_RESUME** | Resume (WAITING → IN_PROGRESS) | setTaskStatus(taskId, "IN_PROGRESS", "") | `[STATUS] = "WAITING"` |
| **ACT_TASK_COMPLETE** | Complete task (IN_PROGRESS → DONE) | completeTask(taskId, resultSummary) | See §4 |
| **ACT_TASK_CANCEL** | Cancel task | cancelTask(taskId, note) | `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))` |

---

## 3. Action Rules — Start / Complete / Cancel

### ACT_TASK_START

- **Condition:** `[STATUS] = "ASSIGNED"`
- **GAS:** `setTaskStatus(taskId, "IN_PROGRESS", "")`
- **Effect:** STATUS → IN_PROGRESS; log entry created
- **No user input** (optional: prompt for note)

### ACT_TASK_COMPLETE

- **Condition:** `AND([STATUS] = "IN_PROGRESS", COUNT(SELECT(TASK_CHECKLIST[ID], AND([TASK_ID] = [_THISROW].[ID], [IS_REQUIRED] = TRUE, [IS_DONE] <> TRUE))) = 0)`
- **GAS:** `completeTask(taskId, resultSummary)` — user may provide RESULT_SUMMARY via form/prompt
- **Effect:** STATUS → DONE; DONE_AT = now; PROGRESS_PERCENT = 100; optional RESULT_SUMMARY
- **Blocked** if required checklist items incomplete (GAS: ensureTaskCanComplete)

### ACT_TASK_CANCEL

- **Condition:** `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))`
- **GAS:** `cancelTask(taskId, note)` — optional note
- **Effect:** STATUS → CANCELLED; log entry
- **Cannot cancel** DONE or ARCHIVED

---

## 4. Action Visibility (Show_If)

| Action | Show_If |
|--------|---------|
| TASK_ASSIGN | `[STATUS] = "NEW"` |
| TASK_START | `[STATUS] = "ASSIGNED"` |
| TASK_WAIT | `[STATUS] = "IN_PROGRESS"` |
| TASK_RESUME | `[STATUS] = "WAITING"` |
| TASK_DONE | `AND([STATUS] = "IN_PROGRESS", COUNT(SELECT(TASK_CHECKLIST[ID], AND([TASK_ID] = [_THISROW].[ID], [IS_REQUIRED] = TRUE, [IS_DONE] <> TRUE))) = 0)` |
| TASK_CANCEL | `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))` |

---

## 5. Child-Table Actions (GAS-Required)

| Action | Table | GAS Function | AppSheet |
|--------|-------|--------------|----------|
| Add checklist item | TASK_CHECKLIST | addChecklistItem | Inline add (TASK_ID pre-filled) or GAS action |
| Mark checklist done | TASK_CHECKLIST | markChecklistDone | GAS action only (IS_DONE not editable) |
| Add attachment | TASK_ATTACHMENT | addTaskAttachment | Inline add or GAS action |
| Add log entry | TASK_UPDATE_LOG | addTaskUpdateLog | GAS action only (no AppSheet add) |

**Checklist add:** AppSheet inline add is allowed if TASK_ID is pre-filled from parent and user cannot change it.

**Checklist done:** Must go through GAS (markChecklistDone) — sets IS_DONE, DONE_AT, DONE_BY, syncs PROGRESS_PERCENT.

---

## 6. What Must Remain GAS-Enforced

| Item | Reason |
|------|--------|
| STATUS changes | Enforce valid transitions; no jump NEW→DONE |
| DONE_AT | Set only on completion flow |
| PROGRESS_PERCENT | Derived from checklist; sync on add/done |
| IS_DONE (checklist) | Must set DONE_AT, DONE_BY, log, sync progress |
| DONE_AT, DONE_BY (checklist) | Audit integrity |
| TASK_UPDATE_LOG rows | Append-only; actor, timestamp from GAS |
| ensureTaskCanComplete | Block DONE when required checklist incomplete |
| ARCHIVED guard | Block edit of ARCHIVED tasks |

**AppSheet must never:** Directly edit STATUS, DONE_AT, PROGRESS_PERCENT, IS_DONE, DONE_AT/DONE_BY, or TASK_UPDATE_LOG.

---

## 7. Webhook Contract (AppSheet → GAS)

If AppSheet calls GAS via webhook/Apps Script run:

| Action | Parameters | GAS Function |
|--------|------------|--------------|
| ACT_TASK_ASSIGN | taskId, ownerId | assignTask(taskId, ownerId) |
| ACT_TASK_START | taskId | setTaskStatus(taskId, "IN_PROGRESS", "") |
| ACT_TASK_WAIT | taskId | setTaskStatus(taskId, "WAITING", "") |
| ACT_TASK_RESUME | taskId | setTaskStatus(taskId, "IN_PROGRESS", "") |
| ACT_TASK_COMPLETE | taskId, resultSummary? | completeTask(taskId, resultSummary) |
| ACT_TASK_CANCEL | taskId, note? | cancelTask(taskId, note) |
| ACT_CHECKLIST_DONE | checklistId, note? | markChecklistDone(checklistId, note) |
| ACT_ADD_LOG | taskId, updateType, content | addTaskUpdateLog({ taskId, updateType, content }) |

---

## 8. Summary

- **Start / Complete / Cancel** are AppSheet-safe **only when they call GAS**.
- No direct STATUS, DONE_AT, PROGRESS_PERCENT, IS_DONE edit in AppSheet.
- GAS remains primary validator and workflow engine.
