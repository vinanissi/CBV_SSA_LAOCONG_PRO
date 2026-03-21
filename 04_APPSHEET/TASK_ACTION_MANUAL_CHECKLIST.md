# TASK Action Manual Checklist — AppSheet Setup

Step-by-step setup for TASK state-driven actions in AppSheet.

---

## Prerequisites

- [ ] TASK_MAIN table with STATUS column (enum: NEW, ASSIGNED, IN_PROGRESS, WAITING, DONE, CANCELLED, ARCHIVED)
- [ ] TASK_CHECKLIST table with TASK_ID, IS_REQUIRED, IS_DONE
- [ ] STATUS column **not editable** in any form (Editable_If = FALSE or hide)
- [ ] GAS web app deployed with assignTask, setTaskStatus, completeTask

---

## 1. Lock STATUS Field

| Setting     | Value |
|-------------|-------|
| Table       | TASK_MAIN |
| Column      | STATUS |
| Editable_If | `FALSE` (or hide column in forms) |
| Note        | User must never edit STATUS directly |

---

## 2. Create Actions (AppSheet Editor)

For each action below, create an **Action** in the TASK detail view.

### TASK_ASSIGN

| Property   | Value |
|------------|-------|
| Action type | Web Request (or AppSheet Action → Run script) |
| Show_If    | `[STATUS] = "NEW"` |
| Label      | Giao task |
| Icon       | 👑 (or Crown) |
| Color      | Blue |

**Web Request (if using GAS web app):**
- URL: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`
- Method: POST
- Body: `{"action": "assignTask", "taskId": [_THISROW].[ID], "ownerId": [OWNER_ID]}`

---

### TASK_START

| Property   | Value |
|------------|-------|
| Show_If    | `[STATUS] = "ASSIGNED"` |
| Label      | Bắt đầu làm |
| Icon       | ▶️ |
| Color      | Green |

**Web Request:**
- Body: `{"action": "setTaskStatus", "taskId": [_THISROW].[ID], "newStatus": "IN_PROGRESS"}`

---

### TASK_WAIT

| Property   | Value |
|------------|-------|
| Show_If    | `[STATUS] = "IN_PROGRESS"` |
| Label      | Tạm chờ |
| Icon       | ⏸️ |
| Color      | Orange |

**Web Request:**
- Body: `{"action": "setTaskStatus", "taskId": [_THISROW].[ID], "newStatus": "WAITING"}`

---

### TASK_RESUME

| Property   | Value |
|------------|-------|
| Show_If    | `[STATUS] = "WAITING"` |
| Label      | Tiếp tục |
| Icon       | ▶️ |
| Color      | Green |

**Web Request:**
- Body: `{"action": "setTaskStatus", "taskId": [_THISROW].[ID], "newStatus": "IN_PROGRESS"}`

---

### TASK_DONE

| Property   | Value |
|------------|-------|
| Show_If    | `AND([STATUS] = "IN_PROGRESS", COUNT(SELECT(TASK_CHECKLIST[ID], AND([TASK_ID] = [_THISROW].[ID], [IS_REQUIRED] = TRUE, [IS_DONE] <> TRUE))) = 0)` |
| Label      | Hoàn thành |
| Icon       | ✅ |
| Color      | Green |

**Web Request:**
- Body: `{"action": "completeTask", "taskId": [_THISROW].[ID], "note": [RESULT_NOTE]}`

**Important:** This action is **hidden** when checklist is incomplete. User cannot click DONE until all required items are done.

---

### TASK_CANCEL

| Property   | Value |
|------------|-------|
| Show_If    | `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))` |
| Label      | Hủy |
| Icon       | ❌ |
| Color      | Red |

**Web Request:**
- Body: `{"action": "setTaskStatus", "taskId": [_THISROW].[ID], "newStatus": "CANCELLED"}`

---

## 3. Button Order (Position)

Arrange in this order on the form:

1. TASK_ASSIGN
2. TASK_START
3. TASK_WAIT
4. TASK_RESUME
5. TASK_DONE
6. TASK_CANCEL

---

## 4. Verification Checklist

- [ ] STATUS column is not editable in TASK form
- [ ] TASK_ASSIGN visible only when STATUS = NEW
- [ ] TASK_START visible only when STATUS = ASSIGNED
- [ ] TASK_WAIT visible only when STATUS = IN_PROGRESS
- [ ] TASK_RESUME visible only when STATUS = WAITING
- [ ] TASK_DONE visible only when STATUS = IN_PROGRESS **and** checklist complete
- [ ] TASK_CANCEL visible when NEW, ASSIGNED, IN_PROGRESS, WAITING
- [ ] No actions visible when STATUS = DONE
- [ ] No actions visible when STATUS = CANCELLED
- [ ] All actions call GAS (no direct sheet update for STATUS)

---

## 5. GAS Web App Handler

Ensure your GAS `doPost` (or equivalent) handles:

- `action: "assignTask"` → assignTask(taskId, ownerId)
- `action: "setTaskStatus"` → setTaskStatus(taskId, newStatus, note)
- `action: "completeTask"` → completeTask(taskId, note)

---

## 6. Final Goal

After applying:

- User cannot break workflow
- User always knows next step
- UI becomes interactive system, not static form
