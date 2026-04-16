# APPSHEET ACTION MAP MASTER

See `CBV_LAOCONG_PRO_REFERENCE.md` for deployment order and GAS/AppSheet mapping.

## HO_SO

| Action | PENDING_ACTION | GAS (after `CMD:`) | Body id param | Confirmation |
|--------|----------------|-------------------|-----------------|---------------|
| ACT_HO_SO_ACTIVATE | CMD:hosoActivate | `changeHosoStatus` → ACTIVE | `hoSoId` | optional |
| ACT_HO_SO_CLOSE | CMD:hosoClose | `changeHosoStatus` → CLOSED | `hoSoId` | optional |
| ACT_HO_SO_ARCHIVE | CMD:hosoArchive | `changeHosoStatus` → ARCHIVED | `hoSoId` | optional |

Automation (mirror TASK): table `HO_SO_MASTER`, event Updates, condition `LEFT([PENDING_ACTION], 4) = "CMD:"`, POST Web App JSON `{ "action": [PENDING_ACTION], "hoSoId": [ID], "note": "" }`.

`HO_SO_MASTER` cần cột `PENDING_ACTION`; adapter `PENDING_ADAPTER_HOSO` trong `03_SHARED_PENDING_FEEDBACK.js`.

## TASK_CENTER

| Action | PENDING_ACTION | validStatuses | Confirmation |
|--------|----------------|---------------|--------------|
| ACT_TASK_START | CMD:taskStart | NEW, ASSIGNED | ✅ |
| ACT_TASK_WAIT | CMD:taskWait | IN_PROGRESS | ✅ |
| ACT_TASK_RESUME | CMD:taskResume | WAITING | ✅ |
| ACT_TASK_COMPLETE | CMD:taskComplete | IN_PROGRESS, WAITING | ✅ |
| ACT_TASK_CANCEL | CMD:taskCancel | NEW,ASSIGNED,IN_PROGRESS,WAITING | ✅ |
| ACT_TASK_REOPEN | CMD:taskReopen | DONE, CANCELLED | ✅ |
| ACT_TASK_ARCHIVE | CMD:taskArchive | DONE, CANCELLED | ✅ |

## FINANCE

| Action | PENDING_ACTION | validStatuses | GAS Route | Confirmation |
|--------|----------------|---------------|-----------|----------------|
| ACT_FIN_CONFIRM | CMD:finConfirm | NEW | registerAction → withPendingFeedback | ✅ |
| ACT_FIN_CANCEL | CMD:finCancel | NEW | registerAction → withPendingFeedback | ✅ |
| ACT_FIN_ARCHIVE | CMD:finArchive | CONFIRMED, CANCELLED | registerAction → withPendingFeedback | ✅ |

Ghi chú: các Finance actions được đăng ký vào ACTION_REGISTRY trong `30_FINANCE_SERVICE.js`; `_routeWebhookAction` (`99_APPSHEET_WEBHOOK.js`) tra `getRegisteredAction` rồi dispatch (`withPendingFeedback` + adapter) mà không cần thêm `switch` cho từng action.

## Quy tắc
- Action không sửa raw status nếu không có guard.
- Nếu dùng AppSheet action update status trực tiếp thì phải mirror đúng workflow guard bằng condition chặt.
- Khuyến nghị: action gọi GAS webhook/service nếu cần chặt hơn.

**CMD: Protocol:**

- Actions ghi `PENDING_ACTION` = `"CMD:[actionName]"` — không ghi tên action thuần.
- Bot condition: `LEFT([PENDING_ACTION], 4) = "CMD:"` — chỉ fire khi có prefix.
- GAS strip prefix → tra ACTION_REGISTRY (`getRegisteredAction`) → `withPendingFeedback()` với `validStatuses` và adapter tương ứng (các action đã `registerAction`: task, finance, …). Riêng `checklistDone` / `addLog`: router `switch`, gọi handler trực tiếp (không bọc feedback ⏳/✅/❌).
- `validStatuses` guard: silent skip nếu STATUS không hợp lệ — chặn Bot fire lần 2.
- `FEEDBACK_DISPLAY`: hiển thị trạng thái realtime cho user.
- Confirmation message: báo user chờ ~20 giây trước khi nhấn OK.
- Performance: Delayed sync = OFF để auto-sync sau action.
