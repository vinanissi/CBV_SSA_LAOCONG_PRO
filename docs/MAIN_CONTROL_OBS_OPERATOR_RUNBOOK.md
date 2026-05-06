## 1. OBS là gì

`MAIN_CONTROL_OBS` là lớp quan sát nội bộ cho `MAIN_CONTROL` giúp vận hành **không cần mở Apps Script Editor**:

- Bootstrap OBS sheets
- Health check
- Self-test / smoke test / schema test
- Ghi Findings / Audit / Event trace / Runtime metrics
- AI Diagnostic Export (JSON + Markdown) để copy gửi ChatGPT

Nguyên tắc:

- **Add-only** + **idempotent**
- **Không hardcode DB ID**
- **Không phá nghiệp vụ cũ**
- Operator-facing: **popup ngắn**; chi tiết ghi ra **sheet**

---

## 2. Cách bootstrap

Trong Google Sheets (script bound) mở menu:

`🛡️ MAIN_CONTROL OBS` → `🚀 Bootstrap` → `🚀 Bootstrap OBS`

Nếu muốn xem trước (không thay đổi dữ liệu):

`🛡️ MAIN_CONTROL OBS` → `🚀 Bootstrap` → `Dry Run Bootstrap`

---

## 3. Cách chạy health

`🛡️ MAIN_CONTROL OBS` → `🧪 Health` → `🧪 Run Health Check`

Kết quả chi tiết:

- `MC_OBS_HEALTH`
- `MC_OBS_DASHBOARD`

---

## 4. Cách chạy self-test

`🛡️ MAIN_CONTROL OBS` → `🧪 Self-Test` → `🧪 Run Self Test`

Hệ sẽ ghi:

- `MC_OBS_TEST_RUN`
- `MC_OBS_TEST_RESULT`
- `MC_OBS_FINDING` (nếu có WARN/ERROR/BLOCKER)
- refresh `MC_OBS_DASHBOARD`

---

## 5. Cách mở findings

Nếu popup báo: **“Có lỗi. Mở OBS Findings.”**

Vào:

`🛡️ MAIN_CONTROL OBS` → `📌 Findings` → `📂 Open Findings`

Bạn có thể copy dòng `MESSAGE`, `ACTION_REQUIRED`, `DATA_JSON` để gửi ChatGPT.

---

## 6. Cách export gửi ChatGPT

`🛡️ MAIN_CONTROL OBS` → `📤 AI Export` → `📤 Generate AI Diagnostic Export`

Sau đó mở:

`🛡️ MAIN_CONTROL OBS` → `📤 AI Export` → `📂 Open AI Export`

Copy:

- `EXPORT_JSON` hoặc
- `EXPORT_MARKDOWN`

---

## 7. Cách xử lý WARN / ERROR / BLOCKER

- **WARN**: cần chú ý, vẫn có thể vận hành, nên xem Findings và chạy self-test.
- **ERROR**: có lỗi, thường cần xử lý nhưng hệ có thể còn chạy được; xem Findings.
- **BLOCKER**: cần xử lý ngay trước khi vận hành MAIN_CONTROL/WebApp; mở Findings để xem ACTION_REQUIRED.

---

## 8. Cách repair setup

Menu:

`🛡️ MAIN_CONTROL OBS` → `⚙️ Setup / Repair`

Các thao tác:

- **Setup WebApp URL**: nhập và lưu `CBV_MAIN_CONTROL_WEBAPP_URL`
- **Setup Script Properties**: kiểm tra `CBV_CORE_DB_ID`, `CBV_CONFIG_DB_ID`, `CBV_MAIN_WEBAPP_TOKEN`, `CBV_MAIN_CONTROL_WEBAPP_URL`
- **Setup Connection Package Sheet**: ensure `CBV_CONNECTION_PACKAGE`
- **Repair Registry Headers**: ensure headers mở rộng trong `CBV_MODULE_REGISTRY`

Mọi thao tác đều ghi audit/metric/finding tương ứng vào OBS sheets.

---

## 9. Rollback

Rollback an toàn (không xoá sheet/cột):

- Ngừng dùng menu OBS, hoặc
- Bỏ call `buildMainControlObsMenu_()` trong `onOpen()` nếu cần ẩn menu.

OBS ghi add-only và không ảnh hưởng nghiệp vụ cũ.

