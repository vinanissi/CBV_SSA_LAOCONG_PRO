# Báo cáo Repo Audit

| Trường | Giá trị |
|--------|---------|
| Ngày | YYYY-MM-DD |
| Máy / người chạy | |
| Root quét | `D:\Workspace\projects` |
| Script | `tools/repo-audit/repo-audit.ps1` |

## 1. Tóm tắt điều hành

| Chỉ số | Giá trị |
|--------|---------|
| Số thư mục con | |
| Có `.git` | |
| Có `package.json` | |
| Có `appsscript.json` | |
| Có `.clasp.json` | |
| Có `supabase/config.toml` | |

## 2. Rủi ro / cần xử lý

- (ví dụ) PAT trong `git remote` — rotate và `git remote set-url`
- (ví dụ) Repo không git, chỉ copy — backup

## 3. Kết luận

- (điền sau khi review báo cáo tự động)

## 4. Đính kèm

- File báo cáo đầy đủ do `repo-audit.ps1` sinh: `...`
