# APPSHEET ACTION MAP MASTER

See `CBV_LAOCONG_PRO_REFERENCE.md` for deployment order and GAS/AppSheet mapping.

## HO_SO
- ACT_HO_SO_ACTIVATE
- ACT_HO_SO_DEACTIVATE
- ACT_HO_SO_ARCHIVE

## TASK_CENTER
- ACT_TASK_ASSIGN
- ACT_TASK_START
- ACT_TASK_WAITING
- ACT_TASK_RESUME
- ACT_TASK_COMPLETE
- ACT_TASK_CANCEL
- ACT_TASK_ARCHIVE

## FINANCE
- ACT_FIN_CONFIRM
- ACT_FIN_CANCEL
- ACT_FIN_ARCHIVE

## Quy tắc
- Action không sửa raw status nếu không có guard.
- Nếu dùng AppSheet action update status trực tiếp thì phải mirror đúng workflow guard bằng condition chặt.
- Khuyến nghị: action gọi GAS webhook/service nếu cần chặt hơn.
