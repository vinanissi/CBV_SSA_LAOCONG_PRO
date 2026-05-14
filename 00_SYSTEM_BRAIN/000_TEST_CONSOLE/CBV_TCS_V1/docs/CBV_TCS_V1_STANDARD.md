# CBV Test Console Standard V1 (CBV_TCS_V1)

**Tên chính thức**: CBV Test Console Standard V1  
**Code**: CBV_TCS_V1  
**Contract Version**: CBV_TCS_V1  

## 1) Mục tiêu và triết lý

- **Test runtime tách business runtime**: test console chỉ phục vụ kiểm thử/audit/diagnostics.
- **Audit-first**: mọi test run phải xuất report theo envelope contract để truy vết.
- **AI-readable**: report phải đủ cấu trúc để ChatGPT/Cursor đọc, xác định FAIL/WARN, và đưa next step mà không “đoán”.
- **Append-only**: report là nhật ký; không overwrite.

## 2) Các định danh chuẩn (MUST)

- **GAS menu**: `🧪 CBV Test Console`
- **Report Sheet**: `CBV_TEST_REPORTS`
- **Drive Folder**: `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- **Repo Reports**: `00_SYSTEM_BRAIN/000_REPORTS`
- **Repo Prompts**: `00_SYSTEM_BRAIN/000_PROMPTS`
- **Repo AI Handoff**: `00_SYSTEM_BRAIN/000_AI_HANDOFF`

## 3) Status chuẩn (MUST)

- `GO`
- `GO_WITH_WARNINGS`
- `FAIL`

Quy tắc:

- `FAIL` nghĩa là **cấm phase jump**. Chỉ xử lý đúng phần failing/warning.
- `GO_WITH_WARNINGS` cho phép tiếp tục nhưng **phải ghi warnings rõ ràng** và nêu mitigation.

## 4) Severity chuẩn (MUST)

- `OK`
- `WARNING`
- `ERROR`
- `CRITICAL`

Nguyên tắc mapping (khuyến nghị):

- `OK`: check pass.
- `WARNING`: không phá runtime nhưng cần chú ý / nợ kỹ thuật.
- `ERROR`: lỗi logic/thiếu dependency có thể gây sai hành vi.
- `CRITICAL`: lỗi có khả năng gây mất dữ liệu/vi phạm bảo mật/đứt vận hành.

## 5) Domain áp dụng (MUST ENUM)

- `MAIN_CONTROL`
- `TASK`
- `FINANCE`
- `HO_SO`
- `INVOICE_MEMBER`
- `CONFIG`
- `WEBAPP_FE`
- `APPSHEET_BINDING`
- `L6_RUNTIME`

## 6) Tách test runtime khỏi business runtime (MUST)

Cấm:

- Không đổi tên module nghiệp vụ.
- Không sửa production business flow.
- Không tự thêm trigger tự động khi chưa được yêu cầu.
- Không auto-run test.

Cho phép:

- Thêm “Test Console” tách biệt: menu `🧪 CBV Test Console`.
- Thêm hàm `*_TestConsole_run()`/`*_selfTest()` trong khối test runtime (khuyến nghị đặt file test riêng).
- Thêm template/prompt/report/contract/skeleton.

## 7) Report storage và archive (MUST)

### 7.1) Report Sheet: `CBV_TEST_REPORTS`

Mỗi lần chạy test nên ghi 1 record/row đại diện (không bắt buộc trong scope tài liệu, nhưng là chuẩn mục tiêu).

### 7.2) Drive archive folder

Folder ID: `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`

- Lưu 2 file: `.md` và `.json` theo format filename chuẩn.
- Nếu Drive save lỗi: **không fail test chính**, chỉ add warning `CBV_TEST_REPORT_DRIVE_SAVE_FAILED`.

### 7.3) Repo archive

Repo archive chính thức: `00_SYSTEM_BRAIN/000_REPORTS` (append-only).

## 8) Filename format (MUST)

Drive filename format:

- `{000-999}_{PHASE}_{TEST_SUITE}_{yyyyMMdd_HHmmss}_{STATUS}.md`
- `{000-999}_{PHASE}_{TEST_SUITE}_{yyyyMMdd_HHmmss}_{STATUS}.json`

Gợi ý:

- `PHASE`: dạng `PHASE_XX...` hoặc domain marker đồng nhất theo repo.
- `TEST_SUITE`: ví dụ `TASK_VISIBILITY`, `APPSHEET_BINDING_AUDIT`, `WEBAPP_FE_SMOKE`.

## 9) Envelope contract (MUST)

Mọi test run phải tạo một “envelope” JSON theo contract `CBV_TCS_V1` (xem `contracts/CBV_TCS_V1_ENVELOPE_CONTRACT.json`).

Yêu cầu tối thiểu:

- Có `checks[]` dạng item contract (code/ok/severity/message/detail).
- Có `warnings[]` và `errors[]` (string hoặc object chuẩn hoá tuỳ module, nhưng phải serializable).
- Có `nextStep` rõ ràng, không mơ hồ.

## 10) Guardrails khi FAIL (MUST)

- **Không phase jump nếu FAIL**.
- Fix đúng vùng FAIL/WARN, không redesign.
- Preserve append-only audit: report mới, không overwrite report cũ.

