# CBV_SSA FINAL LOCK PRO - LAOCONG

Bộ này là bản **pro/full** cho hệ CBV_SSA quy mô nhỏ, vận hành bền, theo hướng:
- operation-first
- standard-driven
- manual-first, auto-later
- Google Sheets as database
- AppSheet as frontend
- Apps Script as service/runtime layer

## Mục tiêu của pack
1. Khóa luật hệ thống trước khi build.
2. Có đủ tài liệu để giao người khác build mà không lệch chuẩn.
3. Có generator tạo repo, schema CSV, manifest và sample data.
4. Có GAS runtime khung sâu hơn mức MVP.
5. Có checklist audit để giữ hệ thống sống lâu.

## Cấu trúc
- `00_META`: hiến pháp hệ.
- `02_MODULES`: đặc tả sâu cho 3 module HO_SO / TASK_CENTER / FINANCE.
- `03_SHARED`: từ điển dùng chung, data flow, module map.
- `04_APPSHEET`: build spec, UX, slice/action/expression rules.
- `05_GAS_RUNTIME`: runtime Apps Script khung chuẩn.
- `06_DATABASE`: schema sheets, CSV headers, manifest.
- `07_AUTOMATION`: trigger và automation rule.
- `08_STORAGE`: cấu trúc lưu trữ Drive.
- `09_AUDIT`: checklist và rule audit.
- `99_TOOLS`: tool Python để sinh repo, CSV, sample data, manifest.

## Gói tài liệu Finance (handoff)
- Chi tiết: [`_handoff/CLAUDE_FINANCE_PACK/INDEX.md`](_handoff/CLAUDE_FINANCE_PACK/INDEX.md), [`manifest.json`](_handoff/CLAUDE_FINANCE_PACK/manifest.json).
- Chạy `.\scripts\export-claude-finance-pack.ps1` từ thư mục gốc repo (PowerShell) để tạo bản mirror theo tầng. Các thư mục `tier*` trong pack bị `.gitignore`; nén `_handoff/CLAUDE_FINANCE_PACK` sau khi export nếu cần gửi đi.

## Cách dùng nhanh
### 1) Sinh repo mới từ pack
```bash
python 99_TOOLS/generate_cbv_ssa_laocong_pro.py "D:/Workspace/projects/CBV_SSA_LAOCONG_PRO"
```

### 2) Xuất schema CSV để import vào Google Sheets
```bash
python 99_TOOLS/export_sheet_schema_csv.py "D:/Workspace/projects/CBV_SSA_LAOCONG_PRO/06_DATABASE/_generated_schema"
```

### 3) Xuất sample data để thử AppSheet
```bash
python 99_TOOLS/generate_sample_data.py "D:/Workspace/projects/CBV_SSA_LAOCONG_PRO/_sample_data"
```

### 4) Build manifest để kiểm tài liệu
```bash
python 99_TOOLS/build_manifest.py
```

## Thứ tự triển khai khuyến nghị
1. Đọc `00_META/*`
2. Đọc `03_SHARED/SYSTEM_DATA_FLOW_MASTER.md`
3. Tạo Google Sheets theo `06_DATABASE/_generated_schema/*.csv` (hoặc dùng initAll)
4. clasp push hoặc dán GAS runtime từ `05_GAS_RUNTIME/`
5. Chạy `initAll()` — tạo sheets, seed enum, fill display
6. Chạy `installTriggers()` nếu dùng
7. Chạy `auditEnumConsistency()`, `verifyAppSheetReadiness()`
8. Build AppSheet theo `04_APPSHEET/`
9. Chạy audit theo `09_AUDIT/`

**Reference:** `CBV_LAOCONG_PRO_REFERENCE.md` — consolidated structure, deployment order, functions

## Nguyên tắc khóa
- Không để business logic nằm ở AppSheet.
- Không cho cập nhật sheet trực tiếp ngoài service layer.
- Mọi record đều có ID, log, timestamps, soft delete.
- Enum phải khóa.
- Workflow phải có transition hợp lệ.
- Quy mô nhỏ nhưng cấu trúc phải đúng ngay từ đầu.
