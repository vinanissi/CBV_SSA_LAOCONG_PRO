# Gói upload Claude — module Finance và liên kết hệ CBV

## Mục đích

Đây là bản sao các file spec, schema, GAS và AppSheet cần để **thiết kế hoặc debug module Finance** trong ngữ cảnh **HO_SO, TASK_CENTER, USER, enum, bootstrap**. Tên file trong thư mục `claude/` **chỉ phục vụ upload** (đánh số và đường dẫn phẳng); **không thay thế** tên file trong repo gốc.

## Tạo lại gói (mỗi lần chạy: xóa hết nội dung cũ trong `claude/`, xuất lại)

Từ thư mục gốc repository (PowerShell):

```powershell
.\scripts\export-claude-finance-upload.ps1
```

## Thứ tự đọc

1. **`00_HUONG_DAN.md`** (file này)
2. **`01__*` …**: theo số tăng dần — cùng thứ tự tier trong `manifest.json` (tier 1: `CBV_MODULE_BUILD_PROTOCOL` trước, rồi toàn bộ spec `02_MODULES/FINANCE`; sau đó kiến trúc và shared → schema → tham chiếu TASK_CENTER → GAS → AppSheet).
3. Trong nhóm Finance (`02_MODULES__FINANCE__*`), nên đọc: descriptor → data model → workflow → business spec → service map → service contract → sheet dictionary → AppSheet UX.

## Quy ước tên file xuất

- `NN__` = thứ tự đọc (hai chữ số).
- Phần sau = đường dẫn nguồn trong repo; ký tự `/` đổi thành `__`.

Ví dụ: `03__02_MODULES__FINANCE__DATA_MODEL.md` tương ứng file gốc `02_MODULES/FINANCE/DATA_MODEL.md`.

## Ghi chú schema / nhiều bảng Finance

- Manifest bootstrap trong repo có thể liệt kê từng phần; gói vẫn kèm CSV mẫu cho **FINANCE_TRANSACTION**, **FINANCE_ATTACHMENT**, **FINANCE_LOG** — đối chiếu với `SHEET_DICTIONARY` và `90_BOOTSTRAP_SCHEMA.js`.

## Prompt gợi ý (tiếng Việt)

```text
Bạn là kiến trúc sư nghiệp vụ CBV. Làm việc trên các file đã đánh số trong thư mục claude/ (đọc 00 rồi 01, 02…).
Tuân thủ CBV_MODULE_BUILD_PROTOCOL và CBV_FINAL_ARCHITECTURE. Đọc spec tier 1–3 trước khi đề xuất đổi GAS/AppSheet.

Nhiệm vụ: [mô tả].

Đầu ra: liệt kê rõ đường dẫn file trong repo cần sửa; nếu đổi schema thì nêu cột và cập nhật schema_manifest, audit schema, GAS, AppSheet.
```

## Nguồn danh sách file

Danh sách file được copy từ `_handoff/CLAUDE_FINANCE_PACK/manifest.json` (cùng bộ với `export-claude-finance-pack.ps1`, thêm bản phẳng đánh số cho upload).
