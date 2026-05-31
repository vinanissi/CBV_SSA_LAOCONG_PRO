# PHASE_GAS_RUNTIME_API_FILE_LOAD_ORDER_REFACTOR — Report

**Phase:** PHASE_GAS_RUNTIME_API_FILE_LOAD_ORDER_REFACTOR  
**Verdict:** GO_WITH_WARNINGS  
**Date:** 2026-05-31  
**Scope:** `gas-runtime-api/` (36 `.js` files renamed; logic unchanged)

---

## 1. Summary

Renumbered all Google Apps Script sources in `gas-runtime-api/` to explicit load-order prefixes `00_`–`99_` per CBV GAS tier convention. Entrypoint `Code.js` → `90_DoGetDoPost.js` (`doGet` / `doPost` preserved). Clasp project files (`appsscript.json`, `.clasp.json`) untouched. Workboard static check suites updated to read new filenames.

**No deploy performed** (per phase charter).

---

## 2. File mapping (old → new)

| Old name | New name | Tier |
|----------|----------|------|
| `Config.js` | `00_Config.js` | 00 config |
| `taskDbConfig.js` | `01_TaskDbConfig.js` | 00 config |
| `authDbConfig.js` | `02_AuthDbConfig.js` | 00 config |
| `homeAlertConfig.js` | `03_HomeAlertConfig.js` | 00 config |
| `workInboxOperationalConfig.js` | `04_WorkInboxOperationalConfig.js` | 00 config |
| `Utils.js` | `10_Utils.js` | 10 utils |
| `Permissions.js` | `11_Permissions.js` | 10 utils |
| `workInboxAppendContext.js` | `12_WorkInboxAppendContext.js` | 10 utils |
| `workInboxAppendFast.js` | `13_WorkInboxAppendFast.js` | 10 utils |
| `workInboxMutationFast.js` | `14_WorkInboxMutationFast.js` | 10 utils |
| `taskDbAudit.js` | `20_TaskDbAudit.js` | 20 audit |
| `taskDbObservation.js` | `21_TaskDbObservation.js` | 20 trace |
| `workInboxPerformanceTrace.js` | `22_WorkInboxPerformanceTrace.js` | 20 trace |
| `Timeline.js` | `30_Timeline.js` | 30 repo |
| `taskDbSchemaMap.js` | `31_TaskDbSchemaMap.js` | 30 repo |
| `taskDbRowIndex.js` | `32_TaskDbRowIndex.js` | 30 repo |
| `taskDbCache.js` | `33_TaskDbCache.js` | 30 repo |
| `taskDbUserDisplay.js` | `34_TaskDbUserDisplay.js` | 30 repo |
| `taskDbService.js` | `40_TaskDbService.js` | 40 domain |
| `Tasks.js` | `41_Tasks.js` | 40 domain (RF_12) |
| `Finance.js` | `42_Finance.js` | 40 domain |
| `HoSo.js` | `43_HoSo.js` | 40 domain |
| `authDbService.js` | `44_AuthDbService.js` | 40 domain |
| `homeAlertService.js` | `45_HomeAlertService.js` | 40 domain |
| `workInboxOperationalService.js` | `46_WorkInboxOperationalService.js` | 40 domain |
| `workInboxCombinedAction.js` | `47_WorkInboxCombinedAction.js` | 40 domain |
| `workInboxCreateTask.js` | `48_WorkInboxCreateTask.js` | 40 domain |
| `taskDbApi.js` | `60_TaskDbApi.js` | 60 API |
| `authDbApi.js` | `61_AuthDbApi.js` | 60 API |
| `homeAlertApi.js` | `62_HomeAlertApi.js` | 60 API |
| `authDbTestConsoleGs01a.js` | `80_AuthDbTestConsoleGs01a.js` | 80 test |
| `taskDbTestConsole.js` | `81_TaskDbTestConsole.js` | 80 test |
| `taskDbTestConsoleGs02.js` | `82_TaskDbTestConsoleGs02.js` | 80 test |
| `taskDbTestConsoleGs02a.js` | `83_TaskDbTestConsoleGs02a.js` | 80 test |
| `taskDbTestConsoleGs03.js` | `84_TaskDbTestConsoleGs03.js` | 80 test |
| `Code.js` | `90_DoGetDoPost.js` | 90 entry |

**Unchanged:** `appsscript.json`, `.clasp.json`, `README.md`, `SETUP.md`

---

## 3. Ancillary updates (path references only)

| File | Change |
|------|--------|
| `apps/workboard/src/modules/task/taskGoogleSheetsPerformanceChecks.ts` | Raw import paths |
| `apps/workboard/src/modules/task/inbox/operationalRuntime/workInboxOperationalRuntimeChecks.ts` | `readRepo` paths |
| `apps/workboard/src/modules/task/inbox/create/workInboxCreateTaskChecks.ts` | `readGas` paths |
| `apps/workboard/src/modules/task/inbox/performance/*.ts` (5 files) | `readGas` paths |

Historical `00_SYSTEM_BRAIN/000_REPORTS/*` and prompts **not** rewritten (append-only audit trail).

---

## 4. Dependency review

### Verified chains

- Config globals (`RF12_CONFIG`, `CBV_TASK_DB_*`, `CBV_AUTH_*`, `CBV_HOME_ALERT_*`, `CBV_WI_OP_*`) → utilities → repositories → services → API handlers → `90_DoGetDoPost`.
- `90_DoGetDoPost` routes: auth (61) → home alert (62) → task-db (60) → RF_12 legacy (41/30/10).
- Test consoles (80–84) call public `CBV_*` / `CBV_TCS_*` functions defined in services/APIs — load after targets.

### Uncertain / low-risk (no reorder needed)

| Item | Notes |
|------|-------|
| **RF_12 vs TASK_GS dual runtime** | `41_Tasks` + `30_Timeline` vs `40_TaskDbService` + `20_TaskDbAudit` — parallel stacks; no shared globals at parse time. |
| **Duplicate time/ID helpers** | `taskDbNowIso_` (40) vs `nowIso_` (10) vs `wiOpNow_` (46) — intentional module isolation. |
| **Tier 50–59 / 70–79 empty** | Reserved; inline response builders in 60–62 today. |
| **No `onOpen`** | Web App only; menu tier (80) holds test consoles, not UI menu. |
| **Lazy `typeof fn === 'function'` guards in 90** | Still required for partial deploy safety; numbering does not replace them. |

---

## 5. Entrypoint verification

| Function | File | Present |
|----------|------|---------|
| `doGet` | `90_DoGetDoPost.js` | Yes |
| `doPost` | `90_DoGetDoPost.js` | Yes |
| `onOpen` | — | N/A (not used) |

---

## 6. Test results

| Check | Result |
|-------|--------|
| `clasp status` (gas-runtime-api) | **PASS** — 36 tracked `.js` + `appsscript.json` |
| `npm run build` (apps/workboard) | **PASS** |
| `runWorkInboxOperationalRuntimeChecks` | **GO** (19/19) |
| `runWorkInboxUserCreateTaskRuntimeChecks` | **GO_WITH_WARNINGS** |
| `runWorkInboxRuntimePerformanceP0Checks` | **GO_WITH_WARNINGS** |
| `runWorkInboxLatencyP0FixChecks` | **GO_WITH_WARNINGS** |
| `runWorkInboxLatencyP1AppendGasOverheadChecks` | **GO_WITH_WARNINGS** |
| `runTaskGoogleSheetsPerformanceChecks` via tsx | **SKIP** — pre-existing `import.meta.env` failure when loading `@/api/client.ts?raw` outside Vite (unchanged by this phase) |
| `clasp push --dry-run` | **N/A** — clasp 3.1.1 has no dry-run flag |
| GAS live deploy | **NOT RUN** (per charter) |

---

## 7. Documentation

- **ADR:** `00_SYSTEM_BRAIN/002_DECISIONS/ADR_GAS_FILE_LOAD_ORDER.md` (new)
- **Handoff:** `00_SYSTEM_BRAIN/001_HANDOFF/PHASE_GAS_RUNTIME_API_FILE_LOAD_ORDER_REFACTOR_HANDOFF.md`

---

## 8. Verdict rationale

**GO_WITH_WARNINGS** because:

- Local rename + static checks + build pass.
- Remote Apps Script project still has old filenames until operator runs `clasp push` + new deployment version.
- Historical docs still cite old names (intentional).

---

*Append-only report. Do not overwrite prior phase reports.*
