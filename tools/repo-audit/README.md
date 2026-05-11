# repo-audit

Công cụ **read-only** quét các thư mục con (repo / project) và sinh báo cáo Markdown.

## Cách chạy

```powershell
Set-Location "D:\Workspace\projects\CBV_SSA_LAOCONG_PRO\tools\repo-audit"
.\repo-audit.ps1 -RootPath "D:\Workspace\projects" -ReportPath ".\out\repo-audit-report.md"
```

Tham số:

| Tham số | Mặc định | Mô tả |
|---------|----------|--------|
| `-RootPath` | `D:\Workspace\projects` | Thư mục cha cần quét các folder con cấp 1 |
| `-ReportPath` | `.\out\repo-audit-report.md` | File báo cáo đầu ra (tạo thư mục nếu thiếu) |
| `-MaxDepthFiles` | `8` | Độ sâu tối đa khi tìm `package.json`, `appsscript.json`, `.clasp.json`, `supabase\config.toml` **bên trong** mỗi repo con |

**Lưu ý:** script **không** sửa `git`, **không** ghi vào repo con — chỉ đọc và ghi file báo cáo bạn chỉ định.

## Template

Điền thủ công phần “Kết luận” sau khi có báo cáo: `repo-audit-report-template.md`.
