# REPO_FULL_SUMMARY — CBV_SSA_LAOCONG_PRO

**Phạm vi:** chỉ đọc repo, không thay đổi mã production.  
**Thời điểm phân tích:** 2026-05-11  
**Output:** `00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/RUN_20260511_182715/`

---

## 1. Repo này là gì

**CBV_SSA_LAOCONG_PRO** là gói thiết kế và triển khai **Google Sheets + Apps Script (GAS) + AppSheet** cho nghiệp vụ HTX/CBV: **Hồ sơ (HO_SO)**, **Công việc (TASK)**, **Tài chính (FINANCE)**, cùng lớp **điều phối (MAIN_CONTROL)**, **thư viện core (core-runtime-lib)**, tài liệu **AppSheet**, **schema/CSV**, **automation/trigger**, **audit & test**.

Repo đồng thời giữ **bản mirror monolith** `05_GAS_RUNTIME/` (đầy đủ file GAS để đối chiếu/copy) và **các project clasp tách** trong `apps-script/` (main-control, hoso, task, finance, core-runtime-lib).

---

## 2. Mục tiêu hệ thống

- Chuẩn hóa **schema**, **enum/master code**, **audit log**, **permission**, **event bus/worker**.
- Vận hành nghiệp vụ trên **một spreadsheet** làm “logical DB”, AppSheet làm UI row-level security.
- Tách dần runtime theo module clasp, có **OBS (observability)** — health, test run, findings, AI export — đặc biệt trên **MAIN_CONTROL** và đang mở rộng **TASK_OBS** / **CBV_OBS_CORE** (B1).

---

## 3. Ai dùng hệ này

| Nhóm | Vai trò |
|------|---------|
| **Vận hành HTX / nhân sự nghiệp vụ** | Dùng AppSheet (slice theo vai trò). |
| **Admin / kỹ thuật** | GAS menu bootstrap, audit, repair, Level-6 hardening, CONFIG. |
| **Dev / kiến trúc** | Repo này + clasp push, tài liệu `docs/`, `09_AUDIT/`. |
| **AI hỗ trợ triển khai** | `00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/`, export AI từ MC_OBS. |

---

## 4. Hệ đang ở level nào

| Khía cạnh | Đánh giá ngắn |
|------------|----------------|
| **HO_SO** | **PRO baseline** — service canonical `hoso*`, Phase C naming (theo rule workspace). |
| **TASK (nghiệp vụ + visibility)** | **PRO baseline** đã chốt (`SHARED_WITH`, `IS_PRIVATE`) trên monolith + tài liệu; module `apps-script/task` **chưa sẵn sàng** chạy clasp độc lập (binding T0). |
| **FINANCE** | **PILOT / PRO từng HTX** — song song monolith + pack handoff `_handoff/`. |
| **MAIN_CONTROL** | **PRO candidate** — core V2 + Level-6 + CONFIG + WebApp + **MC_OBS** (test/health/export). |
| **Test / Report chuẩn thống nhất** | **Chưa đạt** checklist “🧪 CBV Test Console” + contract JSON đầy đủ cho mọi domain (xem `RUNTIME_AND_TEST_CONSOLE_AUDIT.md`). |

**Kết luận trạng thái repo:** **GO_WITH_WARNINGS** — nền tảng production đủ mạnh cho monolith + main-control, nhưng **ranh giới test/prod**, **contract báo cáo**, và **tách module TASK** cần hoàn thiện có kiểm soát.

---

## 5. Module chính

META/Overview, HO_SO, TASK, FINANCE, MAIN_CONTROL, CORE_RUNTIME_LIB, AppSheet specs, Database/schema, Automation, Audit/Test, GAS monolith mirror, tools (`repo-audit`, scripts).

Chi tiết: `MODULE_MAP.md`, `SYSTEM_MAP.md` (trong `00_SYSTEM_BRAIN`).

---

## 6. Runtime chính

1. **05_GAS_RUNTIME** — mirror đầy đủ, thường là nguồn truth lịch sử + deploy một project GAS “dày”.
2. **apps-script/main-control** — điều phối, menu, OBS, WebApp entry.
3. **apps-script/hoso** — domain HO_SO V2.
4. **apps-script/task**, **apps-script/finance** — copy module; TASK cần core/shared đi kèm khi push.
5. **apps-script/core-runtime-lib** — event bus/worker, audit, OBS core B1 (schema/writer/helpers).

---

## 7. Luồng nghiệp vụ (rút gọn)

User/AppSheet → (filter/security) → thao tác sheet hoặc webhook → GAS service (`hoso*`, `task*`, `finance*`) → ghi sheet + `ADMIN_AUDIT_LOG` + event tùy cấu hình → worker/time-driven xử lý nhẹ.

---

## 8. Luồng test

- **Monolith:** `runAllSystemTests()` / `runTaskSystemTests()` trong `97_TASK_SYSTEM_TEST_RUNNER.js` (theo `07_TEST/README.md`).
- **MAIN_CONTROL OBS:** `MC_Obs_runSelfTest`, `MC_Obs_runSmokeTest`, `MC_Obs_runSchemaTest` — ghi sheet OBS (test run, findings, …).
- **HO_SO:** smoke/audit trong menu và service tests.
- **Repo ngoài GAS:** `tools/repo-audit/repo-audit.ps1` (read-only).

---

## 9. Luồng report

- Sheet append: **MC_OBS** (test run, AI export, findings, metrics, …).
- Markdown audit: `09_AUDIT/*.md`, `docs/*.md`.
- Template: `tools/repo-audit/repo-audit-report-template.md`, `07_TEST/*_template.md`.

---

## 10. Luồng AI handoff

- Gói cố định: `00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/` (`AI_HANDOFF_SUMMARY.md`, `CURSOR_CONTINUE_PROMPT.md`, `NEXT_PHASE_BACKLOG.md`, …).
- Export runtime: `MC_Obs_generateAiDiagnosticExport()` → JSON/Markdown + hàng trên sheet **AI_EXPORT** (MAIN_CONTROL OBS).

---

## 11. Điểm đã tốt

- Tài liệu kiến trúc và boundary rõ (`docs/MODULE_BOUNDARY.md`, `03_SHARED/*`, `04_APPSHEET/*`).
- MAIN_CONTROL có **OBS** tách menu con Health/Self-Test, có sample data có kiểm soát (OBS-only).
- HO_SO đã qua giai đoạn **canonical naming** (rule workspace).
- TASK có roadmap và inventory thực tế (`docs/TASK_MODULE_CURRENT_STATE_AND_ROADMAP.md`).
- Webhook/gateway có ý thức **trace** (`correlationId` / `traceId`) ở monolith.

---

## 12. Điểm chưa hoàn chỉnh

- **Không có** menu top-level thống nhất **“🧪 CBV Test Console”**; test nằm rải rác (CBV PRO, OBS, HO_SO, Level 6, …).
- **Contract báo cáo** chuẩn (GO / GO_WITH_WARNINGS / FAIL, `envelopeOk`, `contractVersion`, check object thống nhất) **chưa** áp dụng đồng bộ mọi runner.
- **07_TEST/CBV_TEST_RUNNER.js** — cột bắt buộc `TASK_MAIN` trong runner **chưa thấy** khớp manifest PRO mới nhất (`SHARED_WITH`, `IS_PRIVATE`) → rủi ro drift kiểm thử.
- **Drift** tiềm ẩn giữa `05_GAS_RUNTIME` và `apps-script/*` nếu không quy trình push đơn trùng.
- **INVOICE_MEMBER** không có module code trong repo (chỉ tài liệu/gợi ý).

---

## 13. Rủi ro production

| Mức | Mô tả |
|-----|--------|
| **P0** | Chạy test/migration nhầm môi trường production spreadsheet — giảm nhờ OBS add-only nhưng menu vẫn dày. |
| **P1** | Schema drift giữa AppSheet filter và GAS/sheet thực tế. |
| **P1** | TASK module clasp: thiếu binding → dev tự ý push partial. |
| **P2** | PAT trong URL remote trên clone (đã ghi nhận trong `PHASE_REPORT` workspace-level). |

---

## 14. Khuyến nghị bước tiếp theo (tóm tắt)

1. **Phase T0 TASK:** bind `.clasp.json` thật, push đúng `filePushOrder`, xác nhận TASK_OBS xanh (đã mô tả trong roadmap TASK).  
2. **Chuẩn Test Console:** một menu top-level test + không trộn với menu nghiệp vụ (add-only).  
3. **Thống nhất report contract** cho runner chính (ít nhất MC_OBS + một domain pilot).  
4. **Cập nhật** `CBV_TEST_RUNNER.js` / matrix test để khớp TASK_MAIN PRO (SHARED_WITH / IS_PRIVATE).  

Chi tiết ưu tiên: `GAP_AND_NEXT_PHASE_PLAN.md`.  
Prompt triển khai cho Cursor: `CURSOR_NEXT_ACTION_PROMPT.md`.
