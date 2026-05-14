# WebApp — Staff Trial Runbook (tiếng Việt) — Phase 97

**Chuẩn:** CBV Operational Ecosystem V1 · WebApp read-first · Phase 94 route freeze · Phase 96.1 URL canonical · CBV_TCS_V1 (Test Console).

**Không** xác nhận sẵn sàng vận hành môi trường production. Đây là **pilot / staff trial** chỉ.

---

## 1. Mục tiêu trial

- Cho nhân sự **Admin**, **Supervisor**, **Operator** dùng thử WebApp trên thiết bị thật.
- Xác minh điều hướng (URL `/exec?route=`), nhãn tiếng Việt (Phase 96), footer an toàn, khả năng đọc trên mobile.
- Ghi nhận phản hồi **append-only** vào sheet `CBV_WEBAPP_UAT_FEEDBACK` (hoặc qua `CbvWebAppStaffTrial_createFeedback` từ Apps Script).
- Tổng hợp bằng ma trận triage (`WEBAPP_STAFF_TRIAL_TRIAGE_MATRIX.md`) để đề xuất **GO / GO_WITH_WARNINGS / NO_GO** (quyết định cuối do người, không tự động).

---

## 2. Link WebApp chính thức (canonical)

Dùng URL dạng:

`https://script.google.com/macros/s/AKfycbxJNx9Vw6NBRmSZx0ds7-sNAeyGo6VKTfO8PUDpcz8e7kq1o3W0eUWRP78zPfRlKXBUPA/exec`

Deep link ví dụ: thêm `?route=/workspace` (encode đúng theo trình duyệt).

**Không** dùng URL `googleusercontent.com` làm link chia sẻ chính thức. Chi tiết: `WEBAPP_LINKS_AND_ROUTES_VI.md`, `WEBAPP_CANONICAL_ROUTE_URL_STANDARD.md`.

---

## 3. Tám route vận hành cần smoke test

| Route | Ghi chú ngắn |
|-------|----------------|
| `/workspace` | Trang chủ workspace — mọi vai trò |
| `/home-alert/my-queue` | Operator — hàng đợi |
| `/home-alert/sla` | Supervisor |
| `/home-alert/timeline` | Supervisor |
| `/home-alert/kanban` | Supervisor |
| `/runtime/health` | Admin |
| `/reports` | Admin |
| `/admin/reference` | Admin |

**Hỗ trợ:** `?action=ping` — kiểm tra dispatcher (read-only).

---

## 4. Vai trò và checklist tóm tắt

### 4.1 Admin

- [ ] Mở `/workspace`, `/runtime/health`, `/reports`, `/admin/reference`.
- [ ] Xác nhận footer có nội dung cấm: tự động giao việc / hoàn tất / leo thang; không tuyên bố production; (nơi áp dụng) không kéo-thả lưu.
- [ ] `?action=ping` trả lời hợp lệ.

### 4.2 Supervisor

- [ ] `/workspace`, `/home-alert/sla`, `/home-alert/timeline`, `/home-alert/kanban`.
- [ ] Footer đủ ý an toàn (kể cả cấm kéo-thả lưu trên timeline/kanban nếu có trong UI).

### 4.3 Operator

- [ ] `/workspace`, `/home-alert/my-queue` trên **Desktop**, **Tablet**, **Mobile**.
- [ ] Chữ đọc được; nút/lớp không bị che vô lý.

---

## 5. Checklist mobile (tất cả vai khi dùng điện thoại)

- [ ] Xoay ngang / dọc: nội dung chính vẫn dùng được.
- [ ] Không bắt buộc thao tác chuột hover để hiểu nội dung quan trọng.

---

## 6. Checklist điều hướng (Phase 96.1)

- [ ] Mỗi lần bấm menu trong WebApp, URL vẫn là `script.google.com/macros/.../exec?route=...` (không “lạc” sang host iframe cho route vận hành).
- [ ] Reload trang: route ổn định.

---

## 7. Checklist footer an toàn

Trên **mỗi** route vận hành, xác nhận có các **ý** sau (có thể tiếng Việt — Phase 96):

- Không tự động giao việc.
- Không tự động hoàn tất.
- Không tự động leo thang.
- Không tuyên bố đã xác nhận production.
- Timeline / Kanban: không kéo-thả để lưu thay đổi (nếu áp dụng).

---

## 8. Tiêu chí GO / GO_WITH_WARNINGS / NO_GO (tóm tắt)

| Kết quả | Ý nghĩa (trial) |
|---------|------------------|
| **GO** | Không có vấn đề CRITICAL chặn pilot; read-first được tôn trọng; điều hướng canonical ổn. |
| **GO_WITH_WARNINGS** | Còn HIGH/MEDIUM (copy, hiệu năng nhẹ…) nhưng có **waiver** và kế hoạch xử lý rõ ràng; không CRITICAL navigation/access/safety. |
| **NO_GO** | CRITICAL thuộc navigation / access / safety; hoặc nhiều người gặp HIGH navigation/mobile; hoặc vi phạm read-first / footer an toàn. |

Chi tiết bổ sung: `WEBAPP_PILOT_GO_NO_GO_CRITERIA.md` (Phase 95) + ma trận Phase 97.

---

## 9. Cách ghi feedback

1. Trong Google Sheet bound script, chạy menu **🧪 CBV Test Console → Phase 97 — Staff Trial → Run Staff Trial Health Check** (một lần sau deploy).
2. Tạo / kiểm tra sheet **`CBV_WEBAPP_UAT_FEEDBACK`** (header đúng 22 cột — `CbvWebAppStaffTrial_ensureSchema()`).
3. Mỗi issue: **một dòng mới** (append-only). Không xóa dòng. Không sửa TASK_MAIN hay bảng nghiệp vụ.
4. Trường bắt buộc tối thiểu khi ghi bằng API: `ROLE`, `ROUTE`, `FEEDBACK_TYPE`, `SEVERITY`, `TITLE`.  
   Enum và mô tả cột: `WEBAPP_UAT_FEEDBACK_SCHEMA.md` (mục Phase 97).

---

## 10. Sau trial

- Tổng hợp theo `WEBAPP_STAFF_TRIAL_TRIAGE_MATRIX.md`.
- Dùng `docs/webapp/WEBAPP_PHASE_97_AI_HANDOFF.md` + `CbvWebAppStaffTrial_buildHandoffPrompt()` để bàn giao cho AI / dev.
- Test Console: **Copy Latest Report** lưu JSON envelope (CBV_TCS_V1).
