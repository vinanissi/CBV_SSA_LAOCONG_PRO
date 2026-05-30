## PHASE 80B — HOME_ALERT_OPERATIONAL_STATE_RUNTIME (PROMPT LOG)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

Bạn đang làm việc trong repo `CBV_SSA_LAOCONG_PRO`, trên branch TASK+FIN hiện tại.

Tham chiếu bắt buộc: **CBV Operational Ecosystem Standard V1** — runtime-first, memory-first, append-only, manual-first → auto-later.
Mọi phase phải có prompt, report, decision, trace, handoff; không overwrite/xóa lịch sử.

## MỤC TIÊU

Nâng HOME_ALERT từ “bảng cảnh báo hiển thị” thành **Operational State Runtime**.

HOME_ALERT phải hỗ trợ vòng đời vận hành:

```txt
OPEN
ACKNOWLEDGED
IN_PROGRESS
WAITING_RESPONSE
ESCALATED
RESOLVED
AUTO_CLEARED
EXPIRED
```

## YÊU CẦU CHÍNH (diễn giải để triển khai)

- **State machine rõ ràng**: define allowed transitions, không nhảy trạng thái bừa.
- **Manual-first**: refresh không được “đè” trạng thái vận hành do người thao tác (ACK/IN_PROGRESS/…).
- **Append-only**: không xoá alert; chỉ update trạng thái/fields.
- **Trace**: mỗi lần refresh/transition có `TRACE_ID`.
- **Tối thiểu hoá AppSheet logic**: AppSheet chỉ data-change actions (set STATUS, timestamps), không bot/automation, không VC.

