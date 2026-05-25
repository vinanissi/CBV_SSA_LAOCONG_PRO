# PHASE_RF_02 — Test Evidence

## Test suite

- **Name:** `CBV_RF02_Test_runWorkboardCoreHealth`
- **Alias:** `CbvTcsRf02WorkboardCore_TestConsole_runFull`
- **Standard:** CBV_TCS_V1
- **Menu:** 🧪 CBV Test Console → Run RF_02 Workboard Core Health Test

## Local session (Cursor)

| Item | Result |
|------|--------|
| Branch verified | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| Files created | 4 GAS modules + SYSTEM_BRAIN artifacts |
| GAS menu execution | **Not run** — requires bound Spreadsheet + clasp push |
| Drive bundle export | **Not run** — RF_02 uses in-memory/document Properties report only |

## Expected checks (post-push)

- PERMISSION_RUNTIME_EXISTS
- ROUTE_RF02_* (tasks, detail, search, notifications, files)
- TASK_LIST_SAFE_ENVELOPE
- TASK_DETAIL_MISSING_ID / TASK_DETAIL_UNKNOWN_ID
- TIMELINE_SAFE_ENVELOPE
- SEARCH_STUB_ENVELOPE
- NOTIFICATION_STUB_ENVELOPE
- FILE_STUB_ENVELOPE
- PERMISSION_SERVER_SIDE_MATRIX
- REPORT_ENVELOPE

## Operator action

After deploy, paste latest JSON from **Copy RF_02 Latest Test Report** into this file appendix (append-only).
