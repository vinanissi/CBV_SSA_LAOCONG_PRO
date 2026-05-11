# AI_HANDOFF_SUMMARY — CBV_SSA_LAOCONG_PRO

**Đối tượng:** AI / kỹ sư tiếp nhận repo. **Ngày:** 2026-05-11.

---

## 1. Tóm tắt dự án

Đây là **gói PRO / full** cho hệ **CBV_SSA LaoCong**: Google Sheets làm database logic, **AppSheet** làm UI, **Google Apps Script** làm service/runtime. Định hướng: **manual-first**, **operation-first**, chuẩn hoá schema/enum/audit trước khi mở rộng tự động hoá.

---

## 2. Mục tiêu hệ thống

| Mục tiêu | Nguồn tham chiếu |
|----------|------------------|
| Khóa luật hệ thống (schema, filter, workflow) | `00_META/`, `04_APPSHEET/`, `.cursor/rules/` |
| Tách biên module HO_SO / TASK / FINANCE / MAIN_CONTROL | `docs/MODULE_BOUNDARY.md` |
| Giữ production TASK_MAIN (SHARED_WITH, IS_PRIVATE, security filter) | `.cursor/rules/task-main-pro-production-baseline.mdc` |
| Có thể triển khai clasp đa project (`apps-script/*`) song song `05_GAS_RUNTIME` | `apps-script/*/`, `CLASP_PUSH_ORDER.md` |

---

## 3. Kiến trúc hiện tại (rút gọn)

- **Điều phối:** `apps-script/main-control/` + phần core trong `05_GAS_RUNTIME/`.
- **Domain:** `apps-script/hoso|task|finance/` (bản clasp) + mirror monolith `05_GAS_RUNTIME/`.
- **Chuẩn nghiệp vụ & AppSheet:** `02_MODULES/`, `04_APPSHEET/`.
- **Dữ liệu & sinh CSV:** `06_DATABASE/`, `99_TOOLS/` (Python).
- **Kiểm thử / audit:** `07_TEST/`, `09_AUDIT/`.

Bản đồ chi tiết: `../SYSTEM_MAP.md`. Inventory máy dev: `../REPO_INVENTORY.md`.

---

## 4. Quy tắc không được vi phạm

1. **Không** auto-migrate dữ liệu production; mọi thay đổi schema có kế hoạch + rollback.
2. **Không** đặt business logic chính vào AppSheet (chỉ UX / filter / action gọi service).
3. **Không** tạo alias HO_SO / vi phạm canonical naming (xem `.cursor/rules/cbv-naming-conventions.mdc`).
4. **Không** hạ cấp baseline TASK_MAIN (SHARED_WITH, IS_PRIVATE, audit) trừ migration có chủ đích.
5. **Không** commit secret (PAT trong `git remote`, `scriptId` nhạy cảm) — rotate nếu đã lộ.

---

## 5. Việc đang làm dở (theo git status / file mới)

| Hạng mục | Trạng thái |
|----------|------------|
| Module TASK OBS (file `250_*`, `251_*`, `300_*`, `307_*` trong `apps-script/task/`) | File mới / chưa merge — đối chiếu `docs/TASK_OBS_*.md` |
| `apps-script/task/.clasp.json.example` | Đã chỉnh (theo snapshot git ban đầu) |
| Docs handoff TASK | `docs/TASK_MODULE_CURRENT_STATE_AND_ROADMAP.md`, v.v. |

**CHƯA_XÁC_MINH:** mức độ đã push clasp / đã chạy smoke trên spreadsheet nào.

---

## 6. Hướng phát triển tiếp theo (gợi ý)

1. Hoàn thiện **TASK OBS** theo roadmap tài liệu; tách test runtime vs business runtime.
2. Chuẩn hoá **một** nguồn sự thật cho GAS: giảm drift `05_GAS_RUNTIME` ↔ `apps-script/*/src`.
3. Inventory workspace: dùng `tools/repo-audit/repo-audit.ps1` định kỳ; xử lý **PAT trong remote**.
4. Với **LAOCONG_VOS_PLATFORM**: contract API giữa web và GAS/Sheets — tài liệu hoá.

Xem `NEXT_PHASE_BACKLOG.md` trong cùng thư mục.
