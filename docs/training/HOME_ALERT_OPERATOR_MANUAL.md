# HOME_ALERT — Operator Manual

**Audience:** Operator vận hành cảnh báo (TASK / FINANCE / HOSO).  
**Phase reference:** DOCS-A (sau Phase 82/83/84).  
**Tool:** AppSheet HOME_ALERT (đã cài theo `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md`).

> Đây là tài liệu vận hành thật. Đọc kỹ trước khi go-live. Khi không chắc, **không tự động hoá**:
> luôn gọi supervisor.

---

## 1. HOME_ALERT là gì

HOME_ALERT là **danh sách cảnh báo vận hành**. Mỗi alert là một việc cần ai đó nhìn vào, quyết định
và xử lý. Alert sinh ra từ:

- TASK quá hạn / log lỗi (TASK runtime)
- FINANCE giao dịch chưa xác nhận / log lỗi
- HOSO thiếu thông tin / lỗi nghiệp vụ
- Runtime health check (Phase 84)

Một alert chỉ "biến mất" khi nó **RESOLVED** hoặc nguồn gốc đã hết (auto-clear bởi GAS, không phải
AppSheet).

---

## 2. Queue là gì

"Queue" là **một góc nhìn** của alert dựa vào tình trạng vận hành. Cùng một alert có thể xuất hiện
trong nhiều queue (ví dụ vừa MY_QUEUE vừa OVERDUE).

Operator không cần biết alert nằm sheet nào — chỉ cần biết alert đang ở **queue nào**.

---

## 3. My Queue / Unassigned / Escalated / Blocked

| Queue | Bạn thấy gì | Bạn cần làm |
|-------|-------------|-------------|
| **My Queue** | Alert đang gán cho bạn (`ASSIGNED_TO = bạn`) | Xử lý theo `OPERATOR_NEXT_ACTION` |
| **Unassigned Queue** | Alert chưa ai nhận | Nếu thuộc team bạn và bạn rảnh: bấm `Claim` |
| **Escalated Queue** | Alert đã hoặc đang được đẩy lên cấp cao hơn | Đọc, không tự gỡ escalation; chờ supervisor |
| **Blocked Queue** | Alert đang block do phụ thuộc bên ngoài | Theo dõi, nếu blocker đã hết → vào alert và `Resolve` hoặc unblock theo hướng dẫn supervisor |

---

## 4. SLA là gì

SLA = "Service Level Agreement" — thời gian tối đa cho phép xử lý.

| Giá trị `SLA_STATUS` | Ý nghĩa | Hành động đề nghị |
|----------------------|---------|-------------------|
| `ON_TRACK` | Còn đủ thời gian | Xử lý theo thứ tự `OPERATOR_DASHBOARD_SORT` |
| `DUE_SOON` | Sắp đến hạn | Ưu tiên xử lý ngay sau breached/overdue |
| `OVERDUE` | Đã trễ | Xử lý NGAY; nếu không thể, `Mark Waiting` kèm lý do hoặc báo supervisor |
| `BREACHED` | Vỡ SLA | Báo supervisor; vẫn xử lý; có thể bị escalate |

`SLA_BREACH_LEVEL`:
- `0` = chưa breach
- `1` = breach mức 1 (cảnh báo)
- `2` = breach mức 2 (nghiêm trọng)

---

## 5. Operator làm gì mỗi ngày

1. Mở AppSheet HOME_ALERT → view `HOME_ALERT_OPERATOR_DASHBOARD`.
2. Đọc `OPERATOR_DASHBOARD_GROUP` (nhóm) + `OPERATOR_DASHBOARD_SORT` (thứ tự).
3. Ưu tiên: BREACHED → OVERDUE → DUE_SOON → ON_TRACK.
4. Trong cùng nhóm, ưu tiên `SEVERITY` cao hơn và `OPERATOR_DASHBOARD_SORT` lớn hơn.
5. Mỗi alert đọc 4 dòng:
   - `OPERATOR_PRIMARY_TEXT` — tiêu đề
   - `OPERATOR_SECONDARY_TEXT` — bối cảnh
   - `OPERATOR_META_TEXT` — số liệu/timing
   - `OPERATOR_NEXT_ACTION` — gợi ý làm gì
6. Thực hiện action (Claim / Mark Waiting / Block / Resolve / Escalate) theo §6–§10.
7. Ghi `NOTE` ngắn (1–2 dòng) mô tả bạn đã làm gì.

---

## 6. Khi nào Claim

Bấm `Claim` khi:

- Alert trong **Unassigned Queue** thuộc team/khu vực của bạn.
- Bạn đang rảnh và sẵn sàng xử lý NGAY.
- Bạn hiểu `OPERATOR_NEXT_ACTION`.

KHÔNG `Claim` để "giữ chỗ" rồi để đó. Đã claim → bắt buộc xử lý hoặc giao lại trong ngày.

---

## 7. Khi nào Mark Waiting

`Mark Waiting` (`STATUS = WAITING_RESPONSE`) khi:

- Bạn đã làm phần của mình, đang chờ phản hồi từ:
  - Khách hàng / đối tác bên ngoài
  - Phòng ban khác
  - Hệ thống bên thứ ba
- Có deadline rõ trong note (ví dụ: "chờ khách phản hồi đến 17:00 hôm nay").

Quy tắc:
- Phải ghi `NOTE` rõ chờ AI, vì gì, deadline.
- Quay lại kiểm tra sau ≤ 24h, hoặc ngay khi có phản hồi.

KHÔNG dùng Waiting như cách "ẩn việc". Nếu bạn không biết khi nào quay lại → đó là `Block`.

---

## 8. Khi nào Block

`Block` (`IS_BLOCKED = TRUE`) khi:

- Có **chặn cứng** mà bản thân bạn không phá được:
  - Hệ thống đang lỗi
  - Đang chờ quyết định cấp cao
  - Đang chờ tài liệu pháp lý / nội bộ chưa có
- Không biết khi nào blocker được gỡ.

Quy tắc:
- Phải ghi `BLOCKED_REASON` cụ thể, có thể đọc lại sau 1 tuần vẫn hiểu.
- Báo supervisor mỗi alert `Block` mới.

Đã `Block` thì alert vào **Blocked Queue**; supervisor sẽ review.

---

## 9. Khi nào Resolve

`Resolve` (`STATUS = RESOLVED`) khi:

- Vấn đề gốc đã xử lý xong.
- Bạn (hoặc người khác) đã làm action mà nguồn yêu cầu (ví dụ: TASK quá hạn → đã đóng task, hoặc
  task đã có due_at mới hợp lý).
- Nếu alert sẽ tái sinh do nguồn vẫn lỗi → KHÔNG resolve, dùng `Mark Waiting` hoặc báo runtime
  owner.

Quy tắc:
- Ghi `NOTE` mô tả ngắn cách giải quyết.
- Nếu không chắc đã resolve thật → hỏi supervisor trước khi resolve.

---

## 10. Khi nào Escalate

`Escalate` khi:

- Alert đã `OVERDUE` hoặc `BREACHED` mà bạn không thể tự xử lý.
- Cần quyết định nằm ngoài thẩm quyền của bạn (ví dụ: phê duyệt tài chính lớn, quyết định pháp lý).
- Đang `Waiting` quá lâu (> deadline trong note) và bên kia không trả lời.
- Hệ thống thật sự lỗi và cần admin/runtime owner can thiệp.

Quy tắc:
- Đặt `ESCALATION_REASON` rõ ràng.
- Sau khi bấm `Escalate`, alert vào **Escalated Queue** — supervisor sẽ xử lý tiếp.
- KHÔNG tự đảo `Escalate` đi rồi vào lại để "che số" — escalation là dấu vết minh bạch.

---

## 11. Những điều không được làm

- ❌ KHÔNG sửa trực tiếp các trường `SLA_*`, `ESCALATION_*`, `OPERATOR_*`, `IS_STUCK`, `IS_BLOCKED`,
  `ASSIGNED_TO` từ AppSheet edit form. Phải bấm đúng action.
- ❌ KHÔNG xoá alert. Không có nút xoá cho operator.
- ❌ KHÔNG `Resolve` để dọn dashboard nếu thực tế chưa xong.
- ❌ KHÔNG `Mark Waiting` thay cho `Block` khi không có deadline.
- ❌ KHÔNG `Claim` rồi để đó.
- ❌ KHÔNG mở `HOME_ALERT_POLICY_ADMIN` hay `HOME_ALERT_AUTOMATION_ADMIN` để chỉnh — đó là admin only.
- ❌ KHÔNG sửa Google Sheet trực tiếp.
- ❌ KHÔNG dùng `OPERATOR_PRIMARY_TEXT` trên các cột legacy `DISPLAY_*` / `CARD_*` / `DESKTOP_*` —
  nếu bạn thấy hiển thị sai, báo admin theo `HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md`.

---

## 12. Quy trình cuối ngày

Trước khi nghỉ:

1. Mở **My Queue**.
2. Với mỗi alert còn lại:
   - Nếu xử lý được → `Resolve` (kèm note).
   - Nếu đang chờ phản hồi rõ ràng + deadline → `Mark Waiting` (kèm note).
   - Nếu bị chặn cứng → `Block` (kèm `BLOCKED_REASON`).
   - Nếu vượt quá khả năng → `Escalate`.
3. Mọi `OVERDUE` / `BREACHED` còn lại đều phải có **note rõ** lý do tại sao chưa đóng.
4. Báo supervisor 1 câu tóm tắt cuối ngày (chat / mặt đối mặt): "Còn X cái, trong đó Y BREACHED, Z
   đang Waiting đến hết hôm nay".

---

## 13. Checklist 5 phút đầu ngày

- [ ] Mở `HOME_ALERT_OPERATOR_DASHBOARD`.
- [ ] Kiểm tra `BREACHED` của hôm qua còn không.
- [ ] Kiểm tra `WAITING` quá hạn (note hôm qua đã hết deadline).
- [ ] Kiểm tra `Unassigned Queue` (claim những cái thuộc team bạn).
- [ ] Note nhanh các ưu tiên trong đầu / sổ tay.

---

## 14. Checklist 5 phút cuối ngày

- [ ] Mỗi alert My Queue có status hợp lý (OPEN / IN_PROGRESS / WAITING / BLOCKED / ESCALATED / RESOLVED).
- [ ] Mỗi `WAITING` có deadline trong note.
- [ ] Mỗi `BLOCKED` có `BLOCKED_REASON`.
- [ ] Mỗi `RESOLVED` mới đều có note ngắn cách giải quyết.
- [ ] Đã báo supervisor tóm tắt.
- [ ] Không có alert `OVERDUE`/`BREACHED` không note.
