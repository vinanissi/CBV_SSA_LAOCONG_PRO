# APPSHEET ACTION MAP MASTER

See `CBV_LAOCONG_PRO_REFERENCE.md` for deployment order and GAS/AppSheet mapping.

## HO_SO
- ACT_HO_SO_ACTIVATE
- ACT_HO_SO_DEACTIVATE
- ACT_HO_SO_ARCHIVE

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
- ACT_FIN_CONFIRM
- ACT_FIN_CANCEL
- ACT_FIN_ARCHIVE

## Quy tắc
- Action không sửa raw status nếu không có guard.
- Nếu dùng AppSheet action update status trực tiếp thì phải mirror đúng workflow guard bằng condition chặt.
- Khuyến nghị: action gọi GAS webhook/service nếu cần chặt hơn.

**CMD: Protocol:**

- Actions ghi `PENDING_ACTION` = `"CMD:[actionName]"` — không ghi tên action thuần.
- Bot condition: `LEFT([PENDING_ACTION], 4) = "CMD:"` — chỉ fire khi có prefix.
- GAS strip prefix → route đúng case → `withTaskFeedback()` với `validStatuses`.
- `validStatuses` guard: silent skip nếu STATUS không hợp lệ — chặn Bot fire lần 2.
- `FEEDBACK_DISPLAY`: hiển thị trạng thái realtime cho user.
- Confirmation message: báo user chờ ~20 giây trước khi nhấn OK.
- Performance: Delayed sync = OFF để auto-sync sau action.
