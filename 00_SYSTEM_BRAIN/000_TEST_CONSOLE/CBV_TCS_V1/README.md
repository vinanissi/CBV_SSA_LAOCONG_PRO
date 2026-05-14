# CBV Test Console Standard V1

**Tên chuẩn**: CBV Test Console Standard V1  
**Code**: CBV_TCS_V1  
**Contract Version**: CBV_TCS_V1  

## Mục tiêu

- Chuẩn hoá “Test Console” cho repo CBV theo hướng **tách test runtime khỏi business runtime**.
- Chuẩn hoá **envelope contract** để report **AI-readable**, audit-first.
- Chuẩn hoá nơi lưu report (Sheet + Drive + repo) theo quy tắc **append-only**.

## Phạm vi áp dụng

Áp dụng cho các domain/module:

- MAIN_CONTROL
- TASK
- FINANCE
- HO_SO
- INVOICE_MEMBER
- CONFIG
- WEBAPP_FE
- APPSHEET_BINDING
- L6_RUNTIME

## Nguyên tắc bắt buộc (CBV_TCS_V1)

- **Append-only**: không overwrite lịch sử report; report mới phải có prefix tăng dần.
- **Audit-first**: mọi test run phải tạo envelope JSON theo contract và tạo markdown report.
- **Tách runtime**: test console/menu/report không được trộn vào business menu/flow.
- **Không destructive**: không xoá dữ liệu/sheet/report cũ; không migration phá vỡ.
- **Không sửa business runtime**: chỉ thêm tài liệu/template/contract/prompt/report skeleton/reference code.
- **Không auto-run**: không tự chạy test, không tự thêm trigger nếu chưa được yêu cầu.

## Nơi lưu report

- **Report Sheet**: `CBV_TEST_REPORTS`
- **Drive folder archive**: `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- **Repo reports (append-only)**: `00_SYSTEM_BRAIN/000_REPORTS`
- **Repo prompts**: `00_SYSTEM_BRAIN/000_PROMPTS`
- **Repo AI handoff**: `00_SYSTEM_BRAIN/000_AI_HANDOFF`

## Cách ChatGPT/Cursor audit

Khi audit một lần chạy test console theo CBV_TCS_V1:

- Verify envelope có đủ `requiredFields` theo contract `CBV_TCS_V1`.
- Verify `status` ∈ `GO | GO_WITH_WARNINGS | FAIL`.
- Verify `severity` ∈ `OK | WARNING | ERROR | CRITICAL`.
- Verify `reportText` (markdown) và `reportJson` (raw JSON) đều tồn tại.
- Verify report được lưu (append-only) trong repo `00_SYSTEM_BRAIN/000_REPORTS` và (nếu có) Drive.

## Quy tắc “không phase jump nếu FAIL”

- Nếu `status = FAIL`: **không được** nhảy sang phase/module khác.
- Chỉ được fix đúng vùng failing/warning, giữ nguyên guardrails và append-only audit.

## Quy tắc append-only

- Không sửa/ghi đè report cũ.
- Không đổi tên file report cũ.
- Nếu cần cập nhật, tạo report mới với prefix tiếp theo và ghi rõ “supersedes/continues from …”.

