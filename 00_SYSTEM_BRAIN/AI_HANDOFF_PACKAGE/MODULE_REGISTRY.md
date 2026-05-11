# MODULE_REGISTRY — CBV_SSA_LAOCONG_PRO

**Chú thích cột:** `TEST_CONSOLE` = nơi chạy thử tương tác (GAS Editor / menu). `TEST_REPORT` = template hoặc báo cáo đã ghi.

| MODULE_CODE | PATH | PURPOSE | STATUS | ENTRYPOINT | TEST_CONSOLE | OWNER_NOTE |
|---------------|------|---------|--------|--------------|--------------|------------|
| META | `00_META/`, `00_OVERVIEW/` | Governance, log standard, kiến trúc sự kiện | PRO docs | Đọc `README.md` gốc repo | CHƯA_XÁC_MINH | Không có executable |
| MAIN_CONTROL | `apps-script/main-control/src/` | Bootstrap, menu, health, Level-6, config | PRO candidate | `10_CBV_CORE_V2_BOOTSTRAP.js`, menu `95_CBV_CORE_V2_MENU.js` | Apps Script project main-control + menu CBV | Đối chiếu `docs/MODULE_BOUNDARY.md` |
| CORE_LIB | `apps-script/core-runtime-lib/src/` | Event worker, sheet helpers | PRO candidate | `appsscript.json` + file `31_*EVENT*` | GAS project core-runtime-lib | Clasp project riêng |
| HOSO | `apps-script/hoso/src/`, `05_GAS_RUNTIME/10_HOSO_*` | Service hồ sơ canonical | PRO baseline | `100_HO_SO_V2_COMMAND_HANDLER.js`, `10_HOSO_SERVICE.js` (monolith) | Menu HOSO + `hosoRunSmokeTest` / tests trong `120_*` | Phase C canonical |
| TASK | `apps-script/task/src/`, `05_GAS_RUNTIME/*TASK*` | TASK_MAIN, checklist, audit | PRO baseline (visibility) | `61_UNIFIED_ROUTER.js`, task handlers | `99_DEBUG_TEST_TASK.js`, `97_TASK_SYSTEM_TEST_MOCK.js` | OBS file mới: xem `docs/TASK_OBS_*` |
| FINANCE | `apps-script/finance/src/`, `05_GAS_RUNTIME/*FINANCE*` | Giao dịch tài chính | PILOT/PRO tùy HTX | Service files trong `05_GAS_RUNTIME` | `_handoff/CLAUDE_FINANCE_PACK/` + smoke | Song song monolith |
| GAS_MONOLITH | `05_GAS_RUNTIME/` | Mirror đầy đủ, copy-paste / đối chiếu | PRO mirror | `appsscript.json`, `CLASP_PUSH_ORDER.md` | Cùng TEST_CONSOLE với project đích | Drift với clasp — backlog |
| APPSHEET | `04_APPSHEET/` | Spec UX, filter, slice | PRO docs | `APPSHEET_MASTER_CODE_BINDING.md` | AppSheet emulator **CHƯA_XÁC_MINH** | Không chạy trong repo |
| DATABASE | `06_DATABASE/`, `01_SCHEMA/` | Schema CSV, manifest | PRO docs | `schema_manifest.json`, tools `99_TOOLS/` | Python export scripts | Không phải DB engine |
| AUDIT | `09_AUDIT/` | Báo cáo, gap, migration plan | Living docs | Các file `*_AUDIT*.md` | Manual review | |
| TEST | `07_TEST/` | Runner doc, template regression | PRO docs | `TEST_RUNNER_DOCUMENTATION.md`, `CBV_TEST_RUNNER.js` | Dán runner vào GAS + chạy hàm test | Tách business vs mock |

**Repo ngoài (workspace):** xem `../REPO_INVENTORY.md` — không liệt kê đầy đủ tại đây.
