# HOME_ALERT — Supervisor Manual

**Audience:** Supervisor / Team Lead chịu trách nhiệm vận hành HOME_ALERT cho 1 team.  
**Phase reference:** DOCS-A.  
**Prerequisites:** Operator đã đọc `HOME_ALERT_OPERATOR_MANUAL.md`; admin đã cài AppSheet theo
`APPSHEET_HOME_ALERT_INSTALL_GUIDE.md`.

---

## 1. Vai trò supervisor

Supervisor đảm bảo:

- Đội operator xử lý alert đúng quy trình.
- Không có alert "lạc" (không ai claim trong thời gian dài).
- SLA breach được nhìn thấy, nguyên nhân được hiểu.
- Escalation được review trước khi đẩy lên admin/runtime owner.

Supervisor **không phải** runtime owner. Mọi can thiệp vào policy / automation / schema phải đi qua
admin (xem `HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md`).

---

## 2. Đọc dashboard

Mỗi sáng / sau lunch / cuối ngày, supervisor xem 4 view:

| View | Mục đích |
|------|----------|
| `HOME_ALERT_OPERATOR_DASHBOARD` | Tổng quan team |
| `HOME_ALERT_SLA_DASHBOARD` | BREACHED + OVERDUE + DUE_SOON |
| `HOME_ALERT_ESCALATED_QUEUE` | Cần review escalation |
| `HOME_ALERT_DAILY_SNAPSHOT` | Snapshot lịch sử (Phase 84) |

Chỉ số chính:

- Tổng `ACTIVE_COUNT`
- `BREACHED_COUNT`, `OVERDUE_COUNT`, `DUE_SOON_COUNT`
- `UNASSIGNED_COUNT` (không nên kéo dài)
- `BLOCKED_COUNT` (cần biết blocker là gì)
- `OPERATOR_OVERLOAD_COUNT` (operator nào đang quá tải)

---

## 3. Xử lý overload

Một operator được coi là **overload** khi:

- `HOME_ALERT_WORKLOAD.ACTIVE_ALERT_COUNT` của họ cao hơn rõ rệt so với bình quân team.
- Hoặc nhiều cảnh báo của họ đang `OVERDUE` / `BREACHED` / `WAITING` cùng lúc.

Hành động:

1. Mở view filter theo `ASSIGNED_TO = <operator>`.
2. Dùng action `Assign` đưa các alert phù hợp sang operator khác (theo skill / khu vực).
3. Nhắc operator overload `Mark Waiting`/`Block` đúng quy trình (không che giấu công việc).
4. Ghi note ngắn lý do reassign trong từng alert.

**Không** dùng auto-balance / auto-assign. Mọi reassignment đều human-in-the-loop.

---

## 4. Xử lý stuck

Alert được runtime đánh dấu `IS_STUCK = TRUE` khi:

- Đã ở 1 status quá lâu (WAITING ≥ 72h, BLOCKED ≥ 24h, …)
- SLA `OVERDUE`/`BREACHED` mà chưa có động thái.
- Đang `IN_PROGRESS` mà không có cập nhật vận hành mới.

`STUCK_REASON` mô tả tín hiệu gốc.

Quy trình:

1. Mở alert stuck → đọc `STUCK_REASON` và `NOTE` gần nhất.
2. Hỏi operator phụ trách (chat ngắn): "có thật sự đang chờ gì, hay đã bỏ quên?"
3. Quyết định:
   - Resume: yêu cầu operator xử lý tiếp.
   - Reassign: chuyển cho operator khác.
   - Escalate: dùng `Escalate` với lý do rõ ràng.
   - Resolve: nếu thật sự đã xong (operator quên đóng).

KHÔNG xoá flag `IS_STUCK` thủ công. Flag sẽ tự cập nhật trong lần refresh runtime kế tiếp.

---

## 5. Xử lý breached SLA

Alert `SLA_STATUS = BREACHED` (`SLA_BREACH_LEVEL` 1 hoặc 2):

1. Mở alert, đọc `SLA_DUE_AT` và `SLA_ELAPSED_MINUTES`.
2. Xác định: lỗi vận hành (operator chậm) hay lỗi nguồn (policy SLA quá chặt / nguồn tạo alert không
   đúng)?
3. Nếu lỗi vận hành:
   - Reassign hoặc nhắc operator xử lý ngay.
   - Ghi note "BREACHED do vận hành — đã xử lý xxx".
4. Nếu lỗi nguồn:
   - KHÔNG sửa policy ngay trong giờ vận hành. Ghi lại quan sát + báo admin.
   - Đến cuối tuần / khi policy review, admin sẽ điều chỉnh `HOME_ALERT_SLA_POLICY`.
5. Không "fake resolve" để xoá BREACHED khỏi dashboard.

---

## 6. Review escalation

Khi alert vào `Escalated Queue` (`ESCALATION_STATUS ∈ SUGGESTED / ESCALATED / ACKNOWLEDGED`):

1. Đọc `ESCALATION_REASON` + `ESCALATED_BY`.
2. Nếu hợp lý → bấm `Acknowledge Escalation` (gọi `HomeAlert_acknowledgeEscalation`) + phân công
   hành động tiếp theo.
3. Nếu không hợp lý (operator escalate quá sớm / không đủ lý do) → trao đổi với operator, không
   dùng nút "downgrade escalation" — escalation là dấu vết. Thay vào đó:
   - Bạn xử lý / phân công lại.
   - Khi xong: `Resolve Escalation` (gọi `HomeAlert_resolveEscalation`).
4. Escalation cấp 2+ hoặc cần thay đổi policy → forward admin/runtime owner.

> Supervisor KHÔNG được sửa `ESCALATION_LEVEL` / `ESCALATION_STATUS` thủ công từ AppSheet edit form.

---

## 7. Review daily snapshot

Phase 84 thêm `HOME_ALERT_DAILY_SNAPSHOT`. Mỗi ngày 1 hàng (upsert theo `SNAPSHOT_DATE`, không xoá
lịch sử).

Mỗi sáng:

1. Mở view `HOME_ALERT_DAILY_SNAPSHOT`, đọc snapshot hôm qua.
2. So sánh với 3–5 ngày trước:
   - `ACTIVE_COUNT` đang tăng hay giảm?
   - `BREACHED_COUNT` lặp lại ở cùng `ALERT_CODE` không? (đọc `TOP_ALERT_CODES_JSON`)
   - `TOP_OPERATORS_JSON` có ai overload lặp lại không?
3. Đọc `SUMMARY_TEXT` và `RECOMMENDED_ACTIONS_TEXT` (auto-generated, tham khảo).
4. Nếu thấy pattern (ví dụ TASK_OVERDUE BREACHED tăng 3 ngày liên tiếp) → đưa vào weekly review.

---

## 8. Điều chỉnh policy

Supervisor **không edit trực tiếp** `HOME_ALERT_SLA_POLICY`. Quy trình:

1. Mở view `HOME_ALERT_POLICY_ADMIN` (read-only nếu role không phải Admin).
2. Ghi xuống `POLICY_CODE` cần điều chỉnh, đề xuất giá trị mới và lý do (đính kèm dữ liệu snapshot).
3. Gửi đề xuất cho admin/runtime owner qua kênh chính thức.
4. Admin chạy `HomeAlertSlaPolicy_upsertPolicy(...)` rồi `HomeAlertSlaPolicy_recomputeAllAlerts()`.
5. Sau khi thay đổi: theo dõi 2–3 ngày, đọc snapshot xem có chuyển biến.

Nguyên tắc: **chỉ đổi 1 chiều mỗi lần** (siết lại HOẶC nới ra), không vừa siết vừa nới.

---

## 9. Khi nào can thiệp thủ công

Supervisor can thiệp khi:

- Operator nghỉ đột xuất → reassign trên các alert đang gán họ.
- Có sự kiện vận hành lớn (sự cố hệ thống, hôm nay khối lượng cực lớn) → tạm tăng team capacity
  hoặc giảm phạm vi xử lý + ghi rõ trong báo cáo cuối ngày.
- Operator dùng sai action (`Resolve` sai, `Mark Waiting` không deadline) → trao đổi trực tiếp, có
  thể cần chỉnh lại status (vẫn đi qua action GAS, không edit thẳng cột).
- Khối `Unassigned` để quá lâu → đích danh giao việc.

Mọi can thiệp ghi `NOTE` để rõ trách nhiệm.

---

## 10. Khi nào báo admin / runtime owner

Báo admin khi:

- Một loại `ALERT_CODE` tạo ra alert sai (nội dung không khớp record nguồn).
- `SLA_STATUS` cảm thấy không hợp lý lặp lại nhiều ngày → có thể policy lệch.
- `IS_STUCK` báo cùng `STUCK_REASON` cho nhiều alert → có thể logic stuck cần xem lại.
- AppSheet hiển thị sai trường operator (ví dụ thấy `DESKTOP_TITLE` thay vì `OPERATOR_PRIMARY_TEXT`)
  → đây là vi phạm DOCS-A spec, báo admin.
- Có nghi vấn về safe automation: `HOME_ALERT_AUTOMATION_RUN_LOG` có lỗi liên tục cho 1
  `AUTOMATION_CODE`.

---

## 11. Weekly review checklist

Cuối tuần (Thứ Sáu cuối giờ hoặc Thứ Hai đầu giờ):

- [ ] Đọc 5 snapshot gần nhất (`HOME_ALERT_DAILY_SNAPSHOT`).
- [ ] Tổng kết:
   - Top 3 `ALERT_CODE` gây breach nhiều nhất tuần.
   - Top 3 operator giữ nhiều alert nhất.
   - Số escalation tuần và tỉ lệ Acknowledged / Resolved.
- [ ] Đề xuất điều chỉnh policy (nếu có) bằng văn bản chính thức (`HOME_ALERT_SLA_POLICY` proposal).
- [ ] Review danh sách `Blocked` còn tồn — alert nào > 1 tuần phải có owner rõ.
- [ ] Đọc `HOME_ALERT_AUTOMATION_RUN_LOG`: có run nào FAIL nhiều lần không?
- [ ] Báo admin: 1 tin tóm tắt (số liệu chính + đề xuất chính).
- [ ] Lưu báo cáo tuần (file riêng) — không sửa các sheet runtime để chứa số liệu báo cáo.
