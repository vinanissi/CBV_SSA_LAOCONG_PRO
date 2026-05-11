---
doc: 020_STAGING_RUNTIME_RISK_REPORT
phase: PHASE_B_TEST_RUNTIME
purpose: Staging-safety scan for TASK_OBS / test runtime paths (read-only audit)
generatedAt: 2026-05-11T21:30:00+07:00
---

# Staging runtime risk report

Legend: **SAFE** | **WARNING** | **BLOCKER**

| Topic | Level | Evidence / notes |
|-------|-------|------------------|
| Hardcoded `spreadsheetId` in TASK_OBS sources | **SAFE** | DB id from `PropertiesService.getProperty('CBV_TASK_DB_ID')` only; `openById(dbId)`. |
| Active spreadsheet assumptions | **WARNING** | Menu + `255_*` use `SpreadsheetApp.getUi()` / `getActiveSpreadsheet()` for UX; guarded compare before `setActiveSheet`. Wrong-bound script still risks operator confusion — use staging-only deployment. |
| Dangerous delete / clear | **SAFE** (in reviewed TASK_OBS slice) | Writer path reviewed: append row; schema doc: no header delete/reorder. |
| Destructive migration | **SAFE** | No migration runner in TASK_OBS files audited. |
| Auto trigger install | **WARNING** | `onOpen` in `307_TASK_OBS_MENU.js` installs menu on every open — **expected** for operator UX; not a “silent” trigger but increases visibility of TASK script in bound spreadsheet. |
| Production-only menu | **WARNING** | Same menu on prod-bound spreadsheet would write OBS rows to prod TASK file if `CBV_TASK_DB_ID` points to prod — **BLOCKER** if misconfigured id on production. Mitigation: staging-only id + separate script project. |
| Sample data (`TaskObs_generateSampleData`) | **WARNING** | Writes `TEST_`-prefixed rows to OBS tables — acceptable on staging; avoid on prod until policy allows. |
| Optional MAIN_CONTROL URL + token | **WARNING** | Script properties for webapp emit — **never** commit values; rotate if leaked. |

## Overall

**WARNING** — Architecture is staging-friendly when `CBV_TASK_DB_ID` targets a non-production spreadsheet; mis-binding id is the primary **BLOCKER-class** operational risk (config, not code).
