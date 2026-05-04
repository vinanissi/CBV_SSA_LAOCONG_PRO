# Kế hoạch migration: `05_GAS_RUNTIME` → `apps-script/*` modules

Mục tiêu: tổ chức repo và clasp theo module **không** xóa nguồn gốc, **không** đổi logic/schema/command/event trong đợt này.

## Phase 0 — Audit file hiện tại

- [x] Liệt kê file trong `05_GAS_RUNTIME` và `.clasp.json` root (`filePushOrder`).
- [x] Xác định nhóm MAIN_CONTROL / HOSO / TASK / FINANCE theo mapping đã chốt.

## Phase 1 — Copy sang `apps-script/*`

- [x] Copy file theo mapping vào `apps-script/main-control/src`, `apps-script/hoso/src`, `apps-script/task/src`, `apps-script/finance/src`.
- [x] Giữ nguyên nội dung file (không sửa logic).
- [x] **Không** xóa file trong `05_GAS_RUNTIME`.

## Phase 2 — `.clasp.json.example`

- [x] Tạo `.clasp.json.example` cho từng module với `scriptId` placeholder và `filePushOrder` khớp bản copy.

## Phase 3 — Script push

- [x] `scripts/push-main.ps1`, `push-hoso.ps1`, `push-task.ps1`, `push-finance.ps1`, `push-all.ps1`.
- [x] `scripts/check-clasp-projects.ps1` — cảnh báo nếu thiếu `.clasp.json` hoặc placeholder.

## Phase 4 — Test push main-control

- [ ] Tạo Apps Script project mới (hoặc dùng project dev), copy `.clasp.json.example` → `.clasp.json`, điền `scriptId`.
- [ ] `.\scripts\push-main.ps1` — xác minh compile, chạy self-test Core / L6.

## Phase 5 — Test push hoso

- [ ] Project GAS HOSO dev, điền `scriptId`, `.\scripts\push-hoso.ps1`.
- [ ] Xác minh: nếu thiếu dependency từ monolith, ghi lại gap và bổ sung file **theo quyết định** (không tự động trong phase này).

## Phase 6 — Freeze `05_GAS_RUNTIME`

- [ ] Sau khi Phase 4–5 ổn định: thống nhất “single source of truth” cho dev (monolith vs module) trong team.
- [ ] Có thể đánh dấu trong README nội bộ: monolith vẫn deploy được bằng clasp root.

## Phase 7 — Archive (1–2 tuần sau)

- [ ] Di chuyển `05_GAS_RUNTIME` → ví dụ `archive/05_GAS_RUNTIME_YYYYMMDD` **chỉ** khi đã xác minh không cần monolith cho deploy hotfix.
- [ ] Cập nhật CI/docs trỏ sang module clasp.

---

## Checklist rollback

| Tình huống | Hành động |
|------------|-----------|
| `clasp push` lỗi trên module mới | Giữ nguyên `05_GAS_RUNTIME`; deploy lại bằng `.clasp.json` root (`rootDir`: `05_GAS_RUNTIME`) như trước. |
| Thiếu file / thứ tự sai | Sửa `filePushOrder` hoặc bổ sung copy từ `05_GAS_RUNTIME`; không xóa gốc cho đến khi verify. |
| ScriptId nhầm project | Sửa `.clasp.json` local; không đổi dữ liệu Sheets. |

## Nguyên tắc

- Không xóa file gốc trước khi test đủ.
- Không đổi schema Google Sheets trong kế hoạch này.
- Không push lên GAS production trừ khi được yêu cầu rõ.
