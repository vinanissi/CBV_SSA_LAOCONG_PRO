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
| TASK_START | `AND([STATUS] = "ASSIGNED", NOT(LEFT([PENDING_ACTION], 2) = "⏳"))` |
| TASK_WAIT | `AND([STATUS] = "IN_PROGRESS", NOT(LEFT([PENDING_ACTION], 2) = "⏳"))` |
| TASK_RESUME | `AND([STATUS] = "WAITING", NOT(LEFT([PENDING_ACTION], 2) = "⏳"))` |
| TASK_DONE | `AND([STATUS] = "IN_PROGRESS", COUNT(SELECT(TASK_CHECKLIST[ID], AND([TASK_ID] = [_THISROW].[ID], [IS_REQUIRED] = TRUE, [IS_DONE] <> TRUE))) = 0, NOT(LEFT([PENDING_ACTION], 2) = "⏳"))` |
| TASK_CANCEL | `AND(IN([STATUS], LIST("NEW","ASSIGNED","IN_PROGRESS","WAITING")), NOT(LEFT([PENDING_ACTION], 2) = "⏳"))` |
| TASK_REOPEN | `AND(IN([STATUS], LIST("DONE","CANCELLED")), NOT(LEFT([PENDING_ACTION], 2) = "⏳"))` |
| TASK_ARCHIVE | `AND(IN([STATUS], LIST("DONE","CANCELLED")), NOT(LEFT([PENDING_ACTION], 2) = "⏳"))` |

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

| Action | Confirmation message | PENDING_ACTION | GAS case | validStatuses |
|--------|---------------------|----------------|----------|---------------|
| ACT_TASK_START | "Xác nhận bắt đầu task? Hệ thống cần ~20 giây xử lý, vui lòng chờ sau khi nhấn OK." | `CMD:taskStart` | taskStart | NEW, ASSIGNED |
| ACT_TASK_WAIT | "Xác nhận tạm chờ task? Hệ thống cần ~20 giây xử lý, vui lòng chờ sau khi nhấn OK." | `CMD:taskWait` | taskWait | IN_PROGRESS |
| ACT_TASK_RESUME | "Xác nhận tiếp tục task? Hệ thống cần ~20 giây xử lý, vui lòng chờ sau khi nhấn OK." | `CMD:taskResume` | taskResume | WAITING |
| ACT_TASK_COMPLETE | "Xác nhận hoàn thành task? Hệ thống cần ~20 giây xử lý, vui lòng chờ sau khi nhấn OK." | `CMD:taskComplete` | taskComplete | IN_PROGRESS, WAITING |
| ACT_TASK_CANCEL | "Xác nhận huỷ task? Hệ thống cần ~20 giây xử lý, vui lòng chờ sau khi nhấn OK." | `CMD:taskCancel` | taskCancel | NEW, ASSIGNED, IN_PROGRESS, WAITING |
| ACT_TASK_REOPEN | "Xác nhận mở lại task? Hệ thống cần ~20 giây xử lý, vui lòng chờ sau khi nhấn OK." | `CMD:taskReopen` | taskReopen | DONE, CANCELLED |
| ACT_TASK_ARCHIVE | "Xác nhận lưu trữ task? Hệ thống cần ~20 giây xử lý, vui lòng chờ sau khi nhấn OK." | `CMD:taskArchive` | taskArchive | DONE, CANCELLED |

---

## 8. Action Feedback Pattern — CMD: Protocol

**Mục đích:** Thông báo trạng thái xử lý realtime, chặn Bot fire nhiều lần, hướng dẫn user chờ trong thời gian GAS xử lý (~20 giây).

### Luồng hoàn chỉnh

User tap button  
↓  
Confirmation dialog: "Xác nhận [action]? Hệ thống cần ~20 giây xử lý, vui lòng chờ sau khi nhấn OK."  
↓ User nhấn OK  
AppSheet ghi `PENDING_ACTION` = `"CMD:taskXxx"`  
↓  
`FEEDBACK_DISPLAY` = `"⏳ Đang gửi yêu cầu..."` ← user thấy ngay  
Tất cả action buttons ẩn (`Show_If` có `NOT(LEFT([PENDING_ACTION], 2) = "⏳")`)  
↓  
Bot fire (`LEFT([PENDING_ACTION], 4) = "CMD:"`)  
↓  
GAS (Action Registry + `withPendingFeedback` + adapter TASK): webhook tra registry theo tên action sau khi strip `CMD:`; cùng hành vi feedback cho mọi action đã đăng ký. `withTaskFeedback` trong code chỉ bọc `withPendingFeedback` cho TASK — không đổi hành vi phía AppSheet.  
→ `validStatuses` guard: STATUS có hợp lệ không?  
→ Không hợp lệ: silent skip, return `INVALID_STATUS`  
→ Hợp lệ:  
`PENDING_ACTION` = `"⏳ Đang xử lý [label]..."` + `flush()`  
→ `fn()` chạy logic + ghi log  
→ `PENDING_ACTION` = `"✅ [label] lúc HH:mm dd/MM"` hoặc `"❌ Lỗi: [message]"`  
↓  
AppSheet sync → `FEEDBACK_DISPLAY` cập nhật  
Action buttons hiện lại

### PENDING_ACTION value protocol

| Giá trị | Nguồn | Bot fire? | FEEDBACK_DISPLAY |
|---------|-------|-----------|------------------|
| `""` | Reset | ❌ | Ẩn |
| `"CMD:taskXxx"` | AppSheet action | ✅ | "⏳ Đang gửi yêu cầu..." |
| `"⏳ Đang xử lý..."` | GAS bước 1 | ❌ | "⏳ Đang xử lý [label]..." |
| `"✅ [label] lúc..."` | GAS thành công | ❌ | "✅ [label] lúc HH:mm" |
| `"❌ Lỗi: ..."` | GAS thất bại | ❌ | "❌ Lỗi: [message]" |

### Virtual column FEEDBACK_DISPLAY

- **Formula:** `IF(LEFT([PENDING_ACTION], 4) = "CMD:", "⏳ Đang gửi yêu cầu...", [PENDING_ACTION])`
- **Show_If:** `[PENDING_ACTION] <> ""`
- **Position:** Đầu tiên trong Detail View
- **Editable:** FALSE
- **Label:** (để trống)

### Bot BOT_TASK_WEBHOOK

- **Event:** `EVENT_PENDING_ACTION_CHANGED` (TASK_MAIN, Updates)
- **Condition:** `LEFT([PENDING_ACTION], 4) = "CMD:"`
- **Process:** `STEP_CALL_GAS` → `POST { action: [PENDING_ACTION], taskId: [ID] }`

### GAS runtime (registry + `withPendingFeedback`)

- Webhook `_routeWebhookAction`: strip `CMD:` → `getRegisteredAction(action)` → nếu có entry thì `withPendingFeedback(id, label, fn, validStatuses, adapter)` (adapter TASK / FINANCE / … tùy module).
- Task workflow: `withTaskFeedback(...)` trong `99_APPSHEET_WEBHOOK.gs` chỉ chuyển tiếp sang `withPendingFeedback` + `PENDING_ADAPTER_TASK` — cùng guard và cùng chuỗi ⏳ / ✅ / ❌.

```text
validStatuses: danh sách STATUS hợp lệ
→ Guard chặn Bot fire lần 2 khi STATUS đã thay đổi
→ Silent skip nếu STATUS không trong validStatuses
→ Một lần flush() sau ghi "⏳..."
```

### Performance settings (AppSheet)

| Setting | Value |
|---------|--------|
| Delayed sync | OFF — tắt để auto-sync sau action |
| Quick sync | ON |
| Automatic updates | ON |

### GAS Warm-up trigger

- **Function:** `warmUpWebhook()`
- **Trigger:** Time-driven, every 10 minutes
- **Mục đích:** Tránh cold start ~5–8s

---

## 9. Summary

- **Start / Complete / Cancel** are AppSheet-safe **only when they call GAS**.
- No direct STATUS, DONE_AT, PROGRESS_PERCENT, IS_DONE edit in AppSheet.
- GAS remains primary validator and workflow engine.
