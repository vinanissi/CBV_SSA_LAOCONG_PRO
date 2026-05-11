# CODE_INVENTORY — CBV_SSA_LAOCONG_PRO

**Quét:** ~760 file (đã loại trừ `node_modules`, `.git`, `dist`, `build`, `.vercel`, `.next`, `temp`, `cache` theo script PowerShell).  
**Ngày:** 2026-05-11

---

## 1. Danh sách thư mục chính (cấp 1)

| Thư mục | Vai trò tóm tắt |
|---------|-----------------|
| `.cursor` | Rule agent (TASK_MAIN PRO, naming). |
| `.github` | CI (ví dụ clasp-push). |
| `_handoff` | Gói bàn giao ngoài (Finance pack). |
| `00_inbox`, `00_META`, `00_OVERVIEW` | Meta, governance, overview. |
| `00_SYSTEM_BRAIN` | Brain, system map, AI handoff, **báo cáo RUN này**. |
| `01_SCHEMA`, `02_MODULES`, `02_SEED` | Schema module, seed nghiệp vụ. |
| `03_SHARED` | Kiến trúc dùng chung, module map master, data flow. |
| `04_APPSHEET` | Spec AppSheet đầy đủ. |
| `04_OPERATIONS` | Vận hành. |
| `05_GAS_RUNTIME` | **Monolith GAS mirror** — production-equivalent surface. |
| `06_DATABASE` | CSV schema, notes, generated. |
| `07_AUTOMATION` | Trigger matrix, job notes. |
| `07_TEST` | Test strategy, fixtures, **CBV_TEST_RUNNER.js**, templates. |
| `08_STORAGE` | Lưu trữ tài liệu phụ trợ. |
| `09_AUDIT` | Báo cáo audit, gap, kiến trúc changelog. |
| `99_TOOLS` | Tool phụ. |
| `apps-script` | **Clasp projects** (main-control, hoso, task, finance, core-runtime-lib, shared). |
| `DEPLOYMENT`, `docs`, `gas`, `scripts`, `tools` | Triển khai, tài liệu deep-dive, script tiện ích, **repo-audit**. |

---

## 2. File / nhóm file quan trọng (theo chức năng)

### Production runtime (GAS — đại diện)

| Khu vực | File / pattern | Chức năng |
|---------|----------------|-----------|
| Monolith | `05_GAS_RUNTIME/90_BOOTSTRAP_*.js`, `00_CORE_CONFIG.js` | Init, menu CBV PRO, audit bootstrap. |
| Monolith | `05_GAS_RUNTIME/10_HOSO_SERVICE.js`, `60_HOSO_*`, `111_*` | HO_SO business + API/gateway. |
| Monolith | `05_GAS_RUNTIME/*TASK*`, `61_UNIFIED_ROUTER.js` | TASK routing + service. |
| Monolith | `05_GAS_RUNTIME/*FINANCE*` | FINANCE. |
| Monolith | `05_GAS_RUNTIME/30_CBV_CORE_V2_EVENT_BUS.js`, `31_*WORKER*` | Event. |
| Main control | `apps-script/main-control/src/10_CBV_CORE_V2_BOOTSTRAP.js` | Bootstrap V2. |
| Main control | `apps-script/main-control/src/20_21_22_*` | Router, log, idempotency. |
| Main control | `apps-script/main-control/src/30_31_*` | Event bus/worker. |
| Main control | `apps-script/main-control/src/300_307_MC_OBS_*` | Schema, bootstrap, writer, health, test, AI export, menu OBS. |
| HOSO clasp | `apps-script/hoso/src/100_HO_SO_V2_COMMAND_HANDLER.js`, `111_*DB*`, `119_*HEALTH*` | HO_SO V2. |
| Task clasp | `apps-script/task/src/20_TASK_*.js`, `90_BOOTSTRAP_TASK.js`, `300_*OBS*` | TASK + TASK_OBS. |
| Core lib | `apps-script/core-runtime-lib/src/*` | Core dùng chung + OBS core B1. |

### Test runtime

| File | Ghi chú |
|------|---------|
| `05_GAS_RUNTIME/97_TASK_SYSTEM_TEST_*.js` | Runner hệ thống task trên deploy monolith. |
| `apps-script/main-control/src/304_MC_OBS_TEST_RUNNER.js` | Self-test / smoke / schema OBS. |
| `apps-script/main-control/src/90_CBV_CORE_V2_TESTS.js`, `139_CBV_LEVEL6_HARDENING_TESTS.js` | Core / Level6 tests. |
| `apps-script/hoso/src/*TEST*`, `182_HOSO_CONFIG_MIGRATION_TEST.js` | HO_SO tests. |
| `apps-script/task/src/97_TASK_SYSTEM_TEST_*.js`, `99_DEBUG_TASK_TEST.js` | TASK. |
| `07_TEST/CBV_TEST_RUNNER.js` | Runner read-only copy-paste / tham chiếu. |

### Report / dialog (GAS UI)

| File | Chức năng |
|------|-----------|
| `302_MC_OBS_WRITER.js` | Append các sheet OBS (test run, findings, …). |
| `305_MC_OBS_AI_EXPORT.js` | Build JSON/Markdown + ghi export. |
| `307_MC_OBS_MENU.js` | Menu + hướng dẫn operator (UI). |
| Các `*MENU*.js` trong monolith và clasp | `SpreadsheetApp.getUi()` dialogs. |

### Documentation

| Vị trí | Nội dung |
|--------|----------|
| `docs/` | Module state, OBS, migration GAS, MAIN_CONTROL plan. |
| `02_MODULES/**/**.md` | Spec từng module. |
| `04_APPSHEET/**/*.md` | Binding, slice, security. |
| `09_AUDIT/*.md` | Audit theo đợt. |
| `00_SYSTEM_BRAIN/*.md` | Brain index, system map, phase report. |
| `OPERATOR_DEPLOY_AND_RUN_ORDER.md` | Bước deploy. |

### Prompt / brain / audit (không executable domain)

| File / thư mục | Mục đích |
|----------------|----------|
| `00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/` | Prompt continue, rules AI, backlog. |
| `00_inbox/obs_prompt_template.md` | Template OBS theo module. |
| `tools/repo-audit/*` | Audit repo read-only. |

---

## 3. File nghi ngờ trùng lặp hoặc legacy

| Hiện tượng | Ghi chú |
|-----------|---------|
| **Hai nguồn GAS** | Cùng một concern có thể tồn tại ở `05_GAS_RUNTIME` và `apps-script/*/src` — cần quy trình “single writer” khi sửa. |
| **TASK service naming** | `docs/TASK_MODULE_*` ghi nhận `createTask`/`updateTask` trong một số đoạn vs rule HO_SO canonical — TASK có thể vẫn mang tên lịch sử ở lớp service (đối chiếu trước khi đổi). |
| **Mirror chỉ dùng đọc** | Một số file trong `05_GAS_RUNTIME` có thể lệch version so với clasp nếu không sync — coi là **legacy risk** chứ không phải “dead code” tự động. |

---

## 4. Kết luận inventory

Repo là **hybrid documentation + multi-project GAS**. Đường **production runtime thực tế** phụ thuộc spreadsheet đang bind script nào (monolith vs main-control+hoso…); tài liệu khuyến nghị rõ ràng ở `MODULE_BOUNDARY.md` và roadmap TASK.
