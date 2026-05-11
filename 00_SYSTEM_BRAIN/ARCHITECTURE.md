# ARCHITECTURE — 00_SYSTEM_BRAIN

Thư mục này **không** chứa runtime GAS; chỉ chứa **tài liệu điều phối** giữa con người và AI.

## Kiến trúc tổng thể (runtime)

Xem **`SYSTEM_MAP.md`** — tóm tắt:

- **Presentation:** AppSheet (spec `04_APPSHEET/`).
- **Application / domain services:** Apps Script (`apps-script/*`, mirror `05_GAS_RUNTIME/`).
- **Persistence:** Google Sheets + Drive.
- **Observability:** Audit logs, file `09_AUDIT/`.

## Quan hệ với repo khác trên PC

`REPO_INVENTORY.md` liệt kê ~149 thư mục; chỉ một phần là git repo; nhiều repo **Apps Script** độc lập.

## Quyết định kiến trúc (ADR)

Thư mục đề xuất: `decisions/` — **CHƯA_XÁC_MINH** nếu chưa tạo file ADR đầu tiên.
