# Clasp Push Order — Deterministic Deployment

## Why the order matters

Apps Script loads files in a single global scope. `filePushOrder` in `.clasp.json` defines the deployment order. Dependents must load **after** their dependencies to avoid reference errors during script assembly.

---

## Dependency direction

```
CONFIG → ENUM → MASTER_CODE → USER → SHARED (repository, validation, logger, file helper, ACTION_REGISTRY, PENDING_FEEDBACK) → SCHEMA → USER_SEED → MODULES → TASK → DISPLAY → BOOTSTRAP_INIT/TASK/AUDIT → APPSHEET → DEBUG → BOOTSTRAP_MENU/TRIGGER/INSTALL
```

---

## Documented filePushOrder (exact sequence)

| # | File | Layer | Depends on |
|---|------|-------|------------|
| 1 | 00_CORE_CONFIG.js | CONFIG | — |
| 2 | 00_CORE_CONSTANTS.js | CONFIG | — |
| 3 | 00_CORE_UTILS.js | CONFIG | 00_CORE_CONFIG (cbvMakeId uses CBV_CONFIG) |
| 4 | 01_ENUM_CONFIG.js | ENUM | — |
| 5 | 01_ENUM_REPOSITORY.js | ENUM | 00_CORE_CONFIG, 00_CORE_CONSTANTS |
| 6 | 01_ENUM_SYNC_SERVICE.js | ENUM | 00_CORE_CONFIG, 01_ENUM_CONFIG |
| 7 | 01_ENUM_SERVICE.js | ENUM | 01_ENUM_REPOSITORY, 01_ENUM_SYNC_SERVICE |
| 8 | 01_ENUM_SEED.js | ENUM | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_CONFIG |
| 9 | 01_ENUM_AUDIT.js | ENUM | 01_ENUM_SERVICE |
| 10 | 02_MASTER_CODE_SERVICE.js | MASTER_CODE | 00_CORE_CONFIG |
| 11 | 02_USER_SERVICE.js | USER | 00_CORE_CONFIG, 00_CORE_UTILS |
| 12 | 03_SHARED_ROW_READER.js | SHARED | 00_CORE_UTILS (blank-row helpers) |
| 13 | 03_SHARED_REPOSITORY.js | SHARED | 00_CORE_UTILS, 03_SHARED_ROW_READER |
| 14 | 03_SHARED_VALIDATION.js | SHARED | 00_CORE_UTILS |
| 15 | 03_SHARED_LOGGER.js | SHARED | — |
| 16 | 03_SHARED_FILE_HELPER.js | SHARED | — |
| 17 | 03_SHARED_ACTION_REGISTRY.js | SHARED | — |
| 18 | 03_SHARED_PENDING_FEEDBACK.js | SHARED | 03_SHARED_ACTION_REGISTRY, 00_CORE_UTILS, 03_SHARED_REPOSITORY |
| 19 | 03_USER_MIGRATION_HELPER.js | USER | 00_CORE_CONFIG, 02_USER_SERVICE, 03_SHARED_REPOSITORY, 03_SHARED_LOGGER |
| 20 | 02_USER_VALIDATION.js | USER | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 03_SHARED_REPOSITORY |
| 21 | 01_ENUM_ADMIN_SERVICE.js | ADMIN | 01_ENUM_*, 03_SHARED_* |
| 22 | 02_MASTER_CODE_ADMIN_SERVICE.js | ADMIN | 02_MASTER_CODE, 01_ENUM, 03_SHARED_* |
| 23 | 03_ADMIN_AUDIT_SERVICE.js | ADMIN | 03_SHARED_LOGGER |
| 24 | 90_BOOTSTRAP_SCHEMA.js | BOOTSTRAP | — (manifest only) |
| 25 | 90_BOOTSTRAP_USER_SEED.js | BOOTSTRAP | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA |
| 26 | 90_BOOTSTRAP_AUDIT_SCHEMA.js | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA |
| 27 | 90_BOOTSTRAP_LIFECYCLE.js | BOOTSTRAP | — |
| 28 | 90_BOOTSTRAP_PROTECTION.js | BOOTSTRAP | — |
| 29 | 10_HOSO_SERVICE.js | MODULES | 00_CORE_CONFIG, 03_SHARED_*, 01_ENUM_SERVICE, 02_USER_SERVICE |
| 30 | 20_TASK_REPOSITORY.js | TASK | 00_CORE_CONFIG, 03_SHARED_REPOSITORY |
| 31 | 20_TASK_VALIDATION.js | TASK | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 20_TASK_REPOSITORY |
| 32 | 20_TASK_SERVICE.js | TASK | 20_TASK_REPOSITORY, 20_TASK_VALIDATION, 02_USER_SERVICE, 01_ENUM_SERVICE |
| 32a | 21_MASTER_DATA_HELPER.js | TASK | 00_CORE_CONFIG, 03_SHARED_REPOSITORY |
| 33 | 20_TASK_MIGRATION_HELPER.js | TASK | 20_TASK_REPOSITORY, 03_USER_MIGRATION_HELPER |
| 34 | 30_FINANCE_SERVICE.js | MODULES | 00_CORE_CONFIG, 03_SHARED_*, 01_ENUM_SERVICE, 02_USER_SERVICE |
| 35 | 40_DISPLAY_MAPPING_SERVICE.js | DISPLAY | 01_ENUM_*, 02_MASTER_CODE_SERVICE |
| 36 | 90_BOOTSTRAP_INIT.js | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 01_ENUM_SEED, 40_DISPLAY |
| 36a | 95_TASK_SYSTEM_BOOTSTRAP.js | BOOTSTRAP | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA |
| 37 | 90_BOOTSTRAP_TASK.js | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_INIT |
| 38 | 90_BOOTSTRAP_AUDIT.js | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 00_CORE_UTILS, 03_SHARED_ROW_READER |
| 39 | 90_BOOTSTRAP_REPAIR.js | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA |
| 40 | 50_APPSHEET_VERIFY.js | APPSHEET | 90_BOOTSTRAP_AUDIT, 90_BOOTSTRAP_SCHEMA |
| 41 | 99_DEBUG_TEST_HOSO.js | DEBUG | 10_HOSO_SERVICE |
| 42 | 99_DEBUG_TASK_TEST.js | DEBUG | 20_TASK_SERVICE (defines runTaskTests) |
| 43 | 99_DEBUG_TEST_TASK.js | DEBUG | runTaskTests (via 99_DEBUG_TASK_TEST) |
| 44 | 99_DEBUG_TEST_FINANCE.js | DEBUG | 30_FINANCE_SERVICE |
| 45 | 99_DEBUG_TEST_RUNNER.js | DEBUG | 99_DEBUG_TEST_* |
| 46 | 99_DEBUG_SAMPLE_DATA.js | DEBUG | 10, 20, 30 |
| 47 | 90_BOOTSTRAP_MENU.js | BOOTSTRAP | initAll, repairSchemaAndData, installTriggers, runAllModuleTests, seedGoldenDataset, verifyAppSheetReadiness, runEnumHealthCheck, runSafeRepairDryRun, auditSystem |
| 48 | 90_BOOTSTRAP_TRIGGER.js | BOOTSTRAP | — |
| 49 | 90_BOOTSTRAP_INSTALL.js | BOOTSTRAP | 00_CORE_UTILS |

---

## Key rules enforced

1. **CONFIG first** — CBV_CONFIG and CBV_ENUM before any service.
2. **ENUM before MASTER_CODE** — Both before shared infra.
3. **SHARED before MODULES** — 03_* (repository, validation, logger, file helper, ACTION_REGISTRY, PENDING_FEEDBACK) before 10/20/30. Registry + pending feedback load immediately after file helper so modules can `registerAction` at load time and webhook can dispatch generically.
4. **SCHEMA before USER_SEED** — 90_BOOTSTRAP_USER_SEED depends on getSchemaHeaders (90_BOOTSTRAP_SCHEMA).
5. **MODULES before DISPLAY** — 40_DISPLAY uses enum/master-code; modules use shared.
6. **DISPLAY before BOOTSTRAP_INIT** — initAll calls ensureDisplayTextForEnumRows/MasterCodeRows.
7. **BOOTSTRAP_AUDIT before APPSHEET** — verifyAppSheetReadiness calls selfAuditBootstrap.
8. **DEBUG after MODULES** — 99_* calls createHoSo, createTask, createTransaction.
9. **BOOTSTRAP_MENU last** — onOpen references all menu handlers; they must exist.

---

## HTML files

HTML files under `05_GAS_RUNTIME/` (e.g. `05_GAS_RUNTIME/html/*.html`) are pushed by `clasp push` as part of the Apps Script project, but they are **not** part of `.clasp.json` `filePushOrder` (which orders JS assembly only). If HTML templates depend on server-side functions, ensure those JS files load earlier in `filePushOrder`.

---

## Exact filePushOrder (matches .clasp.json)

The sequence in `.clasp.json` filePushOrder is the deployment order. **HOME_ALERT + UI contract** (excerpt):

```
   80_HOME_ALERT_RUNTIME.js
   81_HOME_ALERT_SLA_POLICY_RUNTIME.js
   82_HOME_ALERT_SAFE_AUTOMATION_RUNTIME.js
   83_OPERATIONAL_REFERENCE_RUNTIME.js
   84_UNIFIED_UI_CONTRACT_RUNTIME.js
   85_UNIFIED_UI_CONTRACT_TEST_CONSOLE.js
   86_UI_CONTRACT_PILOT_BINDING_RUNTIME.js
   87_UI_CONTRACT_PILOT_BINDING_TEST_CONSOLE.js
   88_APPSHEET_PILOT_SETUP_RUNTIME.js
   89_APPSHEET_PILOT_SETUP_TEST_CONSOLE.js
   90_FE_ARCHITECTURE_REBALANCE_TEST_CONSOLE.js
   91_WEBAPP_WORKSPACE_CONFIG.js
   92_WEBAPP_WORKSPACE_ROUTES.js
   93_WEBAPP_WORKSPACE_API.js
   94_WEBAPP_WORKSPACE_RENDERER.js
   95_WEBAPP_WORKSPACE_TEST_CONSOLE.js
   97_WEBAPP_WORKSPACE_PILOT_DATA.js
   98_WEBAPP_WORKSPACE_PILOT_RENDERER.js
   990_WEBAPP_WORKSPACE_PILOT_TEST_CONSOLE.js
   991_WEBAPP_TIMELINE_KANBAN_DATA.js
   992_WEBAPP_TIMELINE_KANBAN_RENDERER.js
   993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js
   994_WEBAPP_OBSERVABILITY_DATA.js
   995_WEBAPP_OBSERVABILITY_RENDERER.js
   996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js
   96_WEBAPP_DOGET_DISPATCHER.js
   999_WEBAPP_DOGET_DISPATCHER_FINAL.js
```

### Phase 91 — Timeline / Kanban read-first (load order rationale)

- `991_WEBAPP_TIMELINE_KANBAN_DATA.js` defines data helpers + constants used by the renderer and test console.
- `992_WEBAPP_TIMELINE_KANBAN_RENDERER.js` depends on Phase 91 data; provides `CbvWebAppTimelineKanban_renderTimeline()` / `_renderKanban()` used by `98_WEBAPP_WORKSPACE_PILOT_RENDERER.js` lazily (no load-order coupling).
- `993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js` depends on data + renderer; provides `CbvWebAppTimelineKanban_TestConsole_*` for menu under `🧪 CBV Test Console → Phase 91 — Timeline / Kanban`.

### Phase 92 — Observability / Runtime Health / Report Viewer (load order rationale)

- `994_WEBAPP_OBSERVABILITY_DATA.js` defines `CbvWebAppObservability_getRuntimeHealth`, `_getRecentReports`, `_getReportDetail`, `_getTraceSummary`, `_validate` plus the per-phase test-console catalog. Pure read-first; reads `SYSTEM_HEALTH_LOG`, optionally `CBV_TEST_REPORTS`, and `PropertiesService` keys ending in `_LAST_REPORT_JSON`.
- `995_WEBAPP_OBSERVABILITY_RENDERER.js` provides `CbvWebAppObservability_renderRuntimeHealth()` / `_renderReportViewer()`. Consumed lazily by `98_WEBAPP_WORKSPACE_PILOT_RENDERER.js` (`renderRuntimeHealthPlaceholder` / `renderReportsPlaceholder`) — no hard load-order coupling.
- `996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js` provides the Phase 92 Test Console (`CbvWebAppObservability_TestConsole_*`) for menu under `🧪 CBV Test Console → Phase 92 — Observability`. Read-first only.
- `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` **MUST remain absolute last** in `filePushOrder`.

SHARED layer excerpt (matches push order after file helper):

```
   03_SHARED_FILE_HELPER.js
   03_SHARED_ACTION_REGISTRY.js
   03_SHARED_PENDING_FEEDBACK.js
   03_USER_MIGRATION_HELPER.js
```

Task system files:

```
… 10_HOSO_SERVICE.js
   20_TASK_REPOSITORY.js
   20_TASK_VALIDATION.js
   20_TASK_SERVICE.js
   20_TASK_MIGRATION_HELPER.js
   30_FINANCE_SERVICE.js
   …
   90_BOOTSTRAP_INIT.js
   90_BOOTSTRAP_TASK.js
   90_BOOTSTRAP_AUDIT.js
   …
   99_DEBUG_TASK_TEST.js
   99_DEBUG_TEST_TASK.js
   …
```

---

## Verification

```bash
clasp push
```

Then run `initAll()` and confirm menu items work (Init All, Run All Tests, etc.).
