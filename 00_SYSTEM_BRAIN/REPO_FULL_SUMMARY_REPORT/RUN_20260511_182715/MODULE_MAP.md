# MODULE_MAP — CBV_SSA_LAOCONG_PRO

Trạng thái gợi ý: **PRO** = baseline vận hành đã chốt/chạy thực tế; **PILOT** = triển khai tùy HTX; **TEST** = chỉ test harness; **DRAFT** = thiết kế/code chưa bind; **LEGACY** = mirror hoặc API cũ; **UNKNOWN** = cần xác minh deployment.

---

## TASK

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | Quản lý công việc TASK_MAIN, checklist, log, đính kèm; visibility `SHARED_WITH` / `IS_PRIVATE` (PRO baseline). |
| **Entry points** | Monolith: router/task handlers; Clasp: `apps-script/task/src/20_TASK_SERVICE.js`, bootstrap `90_BOOTSTRAP_TASK.js`. |
| **Menu** | Qua `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js` (Tasks); TASK_OBS: `307_TASK_OBS_MENU.js` (nếu deploy trong project TASK). |
| **Sheet/DB** | `TASK_MAIN`, `TASK_CHECKLIST`, `TASK_ATTACHMENT`, `TASK_UPDATE_LOG`, … (xem `06_DATABASE/`). |
| **Runtime chính** | `05_GAS_RUNTIME/*TASK*`; `apps-script/task/src/*`. |
| **Test console** | `97_TASK_SYSTEM_TEST_*`, `99_DEBUG_TASK_TEST.js`, OBS trong TASK (vendored core). |
| **Report** | Audit `ADMIN_AUDIT_LOG`; OBS sheets khi chạy TASK_OBS; tài liệu `09_AUDIT/TASK_*.md`. |
| **Trạng thái** | Nghiệp vụ + schema: **PRO** (theo rule). Clasp độc lập: **DRAFT/T0** (chưa `.clasp.json` thật — theo roadmap). |

---

## HO_SO

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | Hồ sơ, file, quan hệ, in; service `hoso*` canonical. |
| **Entry points** | `100_HO_SO_V2_COMMAND_HANDLER.js`, monolith `10_HOSO_SERVICE.js`. |
| **Menu** | `121_HO_SO_V2_MENU.js` (monolith), `apps-script/hoso/src/121_*`, WebApp `201_*`. |
| **Sheet/DB** | `HO_SO_MASTER`, detail sheets — `02_MODULES/HO_SO/`. |
| **Runtime** | `apps-script/hoso/src/*`; mirror `05_GAS_RUNTIME/*HOSO*`. |
| **Test console** | `hosoRunSmokeTest`, `hosoAudit`, tests trong `120_*`, `119_*HEALTH*`. |
| **Report** | Audit log, health; docs `HO_SO_MODULE_PRO.md`. |
| **Trạng thái** | **PRO** (baseline naming Phase C). |

---

## FINANCE

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | Giao dịch, workflow xác nhận, gắn HO_SO/đơn vị. |
| **Entry points** | `05_GAS_RUNTIME/*FINANCE*`; `apps-script/finance/src/30_FINANCE_SERVICE.js` (đại diện). |
| **Menu** | Nhánh Finance trong `90_BOOTSTRAP_MENU.js`. |
| **Sheet/DB** | Theo `02_MODULES/FINANCE/SERVICE_MAP.md`. |
| **Runtime** | Monolith + clasp finance (phụ thuộc core). |
| **Test console** | `99_DEBUG_TEST_FINANCE.js` (monolith), smoke handoff pack. |
| **Report** | `_handoff/CLAUDE_FINANCE_PACK/`, audit docs. |
| **Trạng thái** | **PILOT / PRO** tùy triển khai HTX — coi **PILOT_CANDIDATE** trong repo. |

---

## INVOICE

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | Module **INVOICE_MEMBER** được đề cập trong thiết kế OBS — **không** có thư mục `apps-script` tương ứng trong repo này. |
| **Trạng thái** | **UNKNOWN / ngoài repo** (có repo LAB trong `REPO_INVENTORY` workspace). |

---

## MAIN_CONTROL

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | Điều phối Core V2, Level-6, CONFIG, connection package, WebApp, **MC_OBS**. |
| **Entry points** | `10_CBV_CORE_V2_BOOTSTRAP.js`, `200_MAIN_CONTROL_WEBAPP.js`, `020_MC_BOOTSTRAP_CONTROL_PLANE.js`. |
| **Menu** | `95_CBV_CORE_V2_MENU.js`, `140_CBV_LEVEL6_HARDENING_MENU.js`, `167_CBV_CONFIG_MENU.js`, `307_MC_OBS_MENU.js`, `91_MAIN_CONTROL_DASHBOARD_MENU.js`, `90_BOOTSTRAP_MENU.js`. |
| **Sheet/DB** | Core registry sheets + **MC_OBS** sheets (schema `010_MC_SCHEMA.js` / `300_MC_OBS_SCHEMA.js`). |
| **Runtime** | Toàn bộ `apps-script/main-control/src/`. |
| **Test console** | `304_MC_OBS_TEST_RUNNER.js`, `90_CBV_CORE_V2_TESTS.js`, `139_*HARDENING_TESTS*`. |
| **Report** | OBS writer + AI export; docs `docs/MAIN_CONTROL_CURRENT_STATE_AND_UPGRADE_PLAN.md`. |
| **Trạng thái** | **PRO candidate** (clasp có `scriptId` thật trong `.clasp.json` đã thấy — môi trường cụ thể do operator xác nhận). |

---

## CONFIG

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | Module CONFIG (enum, rule, validator, health) trong main-control. |
| **Entry points** | `162_CBV_CONFIG_MODULE_HANDLER.js`, `161_*BOOTSTRAP*`, `165_*AUDIT*`, `166_*HEALTH*`. |
| **Menu** | `167_CBV_CONFIG_MENU.js`. |
| **Trạng thái** | **PRO candidate** (cùng main-control). |

---

## TEST CONSOLE (khái niệm chéo module)

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | Kiểm thử smoke/system/OBS. |
| **Vị trí** | `07_TEST/`, menu monolith, **MAIN_CONTROL OBS**, debug `99_*`. |
| **Trạng thái** | **TEST** — **chưa** thống nhất một menu “🧪 CBV Test Console” toàn cục. |

---

## SYSTEM BRAIN

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | Inventory, architecture links, AI handoff, phase report — không chạy GAS. |
| **Trạng thái** | **PRO docs** (living). |

---

## AI WORK BRAIN

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | `AI_HANDOFF_PACKAGE`, export MC_OBS — hỗ trợ Cursor/ChatGPT. |
| **Trạng thái** | **PRO docs** + **PRO toolpath** (export) khi OBS deploy. |

---

## CORE_RUNTIME_LIB

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | Event, sheet helpers, audit, **CBV_OBS_CORE** B1 (schema/writer/menu helpers). |
| **Trạng thái** | **PRO candidate** (project clasp riêng). |

---

## GAS_MONOLITH (05_GAS_RUNTIME)

| Hạng mục | Chi tiết |
|----------|----------|
| **Mục đích** | Mirror đầy đủ surface GAS một project. |
| **Trạng thái** | **LEGACY mirror / PRO** tùy deployment — rủi ro **drift** với clasp. |
