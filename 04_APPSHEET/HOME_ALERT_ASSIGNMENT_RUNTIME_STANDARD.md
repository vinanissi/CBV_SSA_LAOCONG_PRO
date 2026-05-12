# HOME_ALERT — Operational Assignment Runtime Standard (Phase 81)

Tham chiếu: **CBV Operational Ecosystem Standard V1** — runtime-first, memory-first, append-only, manual-first; **không** Virtual Column, **không** AppSheet Bot, **không** formula workload trên AppSheet; GAS/Sheet là runtime điều phối; AppSheet chỉ hiển thị + bấm action (gọi GAS / cập nhật qua policy đã chuẩn hoá).

---

## A. Assignment Runtime Scope

`HOME_ALERT` phải hỗ trợ trường / trạng thái điều phối (cột vật lý, GAS sinh / cập nhật) tương ứng các giá trị **`ASSIGNMENT_STATUS`**:

| ASSIGNMENT_STATUS   | Ý nghĩa vận hành (tóm tắt)        |
|---------------------|-----------------------------------|
| `UNASSIGNED`        | Chưa gán người xử lý rõ ràng      |
| `ASSIGNED`          | Đã gán (sheet-level)              |
| `IN_PROGRESS`       | Đang xử lý                        |
| `WAITING_RESPONSE`  | Chờ phản hồi                      |
| `ESCALATED`         | Đã escalate vận hành              |
| `BLOCKED`           | Đánh dấu kẹt / chờ phụ thuộc      |
| `RESOLVED`          | Kết thúc vận hành                 |

Trạng thái **80B** (`STATUS` trên sheet) vẫn là state machine chính; `ASSIGNMENT_STATUS` là lớp điều phối (derive + persist qua GAS) không thay thế policy transition 80B.

---

## B. Operator Actions (AppSheet → GAS / manual sheet)

| Hành động            | Runtime GAS (tham chiếu)        |
|----------------------|----------------------------------|
| Nhận xử lý         | `HomeAlert_claimAlert`          |
| Giao người xử lý   | `HomeAlert_assignAlert`         |
| Chuyển queue       | `HomeAlert_transferQueue`       |
| Chờ phản hồi       | `HomeAlert_markWaiting`         |
| Escalate           | `HomeAlert_escalateOperational` |
| Đánh dấu blocked   | `HomeAlert_markBlocked`         |
| Hoàn tất           | `HomeAlert_resolveOperational`  |

Mọi action phải **append** ghi chú / audit theo policy runtime hiện hành; không duplicate `ALERT_ID`; sau action phải **enrich** lại `OPERATOR_*`, `ATTENTION_*`, `ASSIGNMENT_*`.

---

## C. Queue Logic (`ASSIGNMENT_QUEUE` + slice tương ứng)

Mã queue chuẩn (GAS: `HOME_ALERT_RUNTIME_QUEUE_CODES`):

| Mã                  | Ý nghĩa              |
|---------------------|----------------------|
| `UNASSIGNED_QUEUE`  | Chưa ai nhận        |
| `MY_QUEUE`          | Việc của tôi        |
| `TEAM_QUEUE`        | Việc của đội        |
| `WAITING_QUEUE`     | Chờ phản hồi        |
| `ESCALATED_QUEUE`   | Escalated           |
| `BLOCKED_QUEUE`     | Bị kẹt / blocked    |
| `DONE_QUEUE`        | Đã xử lý (terminal) |

**Chuyển queue** thủ công: ghi `ASSIGNED_TEAM` = mã queue hợp lệ (routing tạm) trên các trạng thái OPEN/ACK/IN_PROGRESS; các transition vận hành chính **xoá** routing tạm để không che WAITING/ESCALATED.

---

## D. Dashboard Sections (`OPERATOR_DASHBOARD_GROUP` / `OPERATOR_DASHBOARD_SORT`)

GAS gán `OPERATOR_DASHBOARD_GROUP` theo nhóm (ví dụ):

- 🚨 Chưa ai nhận  
- 👤 Việc của tôi  
- 👥 Việc của đội  
- ⚠ Bị kẹt  
- ⏳ Chờ phản hồi  
- 🔥 Escalated  
- ✅ Đã xử lý  

**Sort:** `OPERATOR_DASHBOARD_SORT` **DESC** (số composite từ queue + priority).

---

## E. AppSheet Policy

- Operator **chỉ** bấm action; **không** dùng Virtual Column; **không** Bot; **không** công thức workload trên AppSheet.  
- Workload tổng hợp: sheet **`HOME_ALERT_WORKLOAD`**, refresh thủ công `HomeAlertWorkload_refresh()` (không trigger production).  
- Deck **điều phối** (tùy triển khai): Group by = `OPERATOR_DASHBOARD_GROUP`, Sort by = `OPERATOR_DASHBOARD_SORT` DESC; Primary / Secondary / Summary = `OPERATOR_PRIMARY_TEXT` / `OPERATOR_SECONDARY_TEXT` / `OPERATOR_META_TEXT` (chuẩn hiển thị văn bản operator).  
- Deck **attention (80F)** vẫn có thể dùng `ATTENTION_LABEL` + `DESKTOP_SORT` theo `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md` — hai chế độ view khác nhau (coordination vs attention), không xóa cột cũ.

---

## F. Tài liệu liên quan

- `HOME_ALERT_APPSHEET_SETUP.md` — actions + views Phase 81.  
- `HOME_ALERT_DESKTOP_WORKSPACE.md` — workspace desktop + workload dashboard.  
- `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md` — chuẩn cột operator 80F + bổ sung coordination.
