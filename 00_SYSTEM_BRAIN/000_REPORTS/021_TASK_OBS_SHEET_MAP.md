---
doc: 021_TASK_OBS_SHEET_MAP
phase: PHASE_B_TEST_RUNTIME_GREEN_BASELINE
purpose: OBS sheet inventory for TASK module (from `TaskObs_getConfig`)
sourceOfTruth: apps-script/task/src/300_TASK_OBS_CONFIG.js
---

# TASK_OBS sheet map

| Sheet name | Purpose | Append-only? | Mutable? | Primary source functions | Used by | Retention note |
|------------|---------|----------------|----------|----------------------------|---------|------------------|
| `TASK_OBS_HEALTH` | Health check rows, bootstrap heartbeat | Yes (new rows) | New rows at bottom; headers add-only | `CBV_Obs_appendHealth` | `TaskObs_bootstrap`, `TaskObs_healthCheck` | Keep history for trend; archive old rows to copy if sheet too large. |
| `TASK_OBS_TEST_RUN` | One row per test run (start + final summary) | Yes | Same | `CBV_Obs_appendTestRun` | `TaskObs_runSelfTest` | Correlate by `RUN_ID`; do not edit finished run rows. |
| `TASK_OBS_TEST_RESULT` | Per-test-case results | Yes | Same | `CBV_Obs_appendTestResult` | `TaskObs_runSelfTest` | High row growth — monitor size on staging. |
| `TASK_OBS_FINDING` | Findings from health/self-test/sample | Yes | Same | `CBV_Obs_appendFinding` | `TaskObs_healthCheck`, `TaskObs_runSelfTest`, `TaskObs_generateSampleData` | Resolve workflow is operational (outside this map). |
| `TASK_OBS_AUDIT` | OBS-scoped audit rows | Yes | Same | `CBV_Obs_appendAudit` | Self-test write probe, sample data | Append-only audit trail. |
| `TASK_OBS_EVENT_TRACE` | Event trace rows | Yes | Same | `CBV_Obs_appendEventTrace` | Self-test, sample data | |
| `TASK_OBS_RUNTIME_METRIC` | Numeric/runtime metrics | Yes | Same | `CBV_Obs_appendRuntimeMetric` | Sample data path | Optional for baseline. |
| `TASK_OBS_AI_EXPORT` | AI diagnostic export rows | Yes | Same | `CBV_Obs_appendAiExport` | `TaskObs_generateAiDiagnosticExport` (if wired) | Avoid storing secrets in `DATA_JSON`. |
| `TASK_OBS_DASHBOARD` | Dashboard row snapshots | Yes | Same | `CBV_Obs_appendDashboardRow` | Future dashboard jobs | |
| `TASK_OBS_OPERATOR_GUIDE` | Operator guide rows | Yes | Same | `CBV_Obs_appendOperatorGuideRow` | Future guide seed | |

## Notes

- **Append-only** means new operational data is added as **new rows**; schema layer avoids deleting/reordering header columns per `250_*` contract.
- **Mutable** column: means “sheet receives new writes” — not in-place mutation of prior business fields by OBS self-test (self-test uses OBS tables only).
- **Bootstrap** creates missing sheets via `CBV_Obs_ensureSheets` — not a destructive migration.
