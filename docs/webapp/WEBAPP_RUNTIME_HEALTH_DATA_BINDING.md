# WebApp Runtime Health — Data Binding (Phase 92, read-first)

## Health cards

Returned from `CbvWebAppObservability_getRuntimeHealth()` under `data.healthCards`. Shape:

```json
{
  "code": "PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES",
  "label": "Phase 91 — Timeline / Kanban",
  "status": "GO_WITH_WARNINGS",
  "severity": "WARNING",
  "value": "<checkedAt>",
  "note": "Summary or hint."
}
```

The per-phase catalog (`CBV_WEBAPP_OBSERVABILITY_PHASE_CATALOG`) enumerates:

| Phase code | Probed function | Property key |
|---|---|---|
| `PHASE_85_UNIFIED_UI_CONTRACT` | `CbvUiContract_healthCheck` | — |
| `PHASE_86_UI_CONTRACT_PILOT_BINDING` | `CbvUiPilotBinding_healthCheck` | — |
| `PHASE_87_APPSHEET_PILOT_SETUP_BINDING` | `CbvAppSheetPilot_healthCheck` | — |
| `PHASE_88_FE_ARCHITECTURE_REBALANCE_CLOSEOUT` | `CbvFeArchitecture_TestConsole_run` | `CBV_FE_ARCH_TC_LAST_REPORT_JSON` |
| `PHASE_89_WEBAPP_OPERATIONAL_WORKSPACE_SKELETON` | `CbvWebAppWorkspace_TestConsole_run` | `CBV_WEBAPP_WS_TC_LAST_REPORT_JSON` |
| `PHASE_90_WEBAPP_WORKSPACE_PILOT_PAGES_DATA_BINDING` | `CbvWebAppPilot_TestConsole_run` | `CBV_WEBAPP_PILOT_TC_LAST_REPORT_JSON` |
| `PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES` | `CbvWebAppTimelineKanban_TestConsole_run` | `CBV_WEBAPP_TLK_TC_LAST_REPORT_JSON` |
| `PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER` | `CbvWebAppObservability_TestConsole_run` | `CBV_WEBAPP_OBS_TC_LAST_REPORT_JSON` |

For each entry:

1. If the function is **not loaded** → `status = NOT_LOADED`, severity `WARNING`.
2. If a stored report exists in `PropertiesService` → use its `status` + `severity` + `summary`.
3. If function is loaded but no report yet → `status = PENDING`, severity `WARNING`.

The page does **not** execute the Test Console as a side-effect — it only probes existence and reads previously stored reports. Running Test Consoles is an operator-initiated action via the spreadsheet menu.

## Source priority

| Section | Source | Behavior if missing |
|---|---|---|
| Health cards | per-phase probe + PropertiesService | function missing → NOT_LOADED card with warning |
| Route summary | `CbvWebAppWorkspace_routeRegistry()` | warning, `missing: true` flag |
| Report summary — `inMemoryCount` | count of phases that stored a report | always available |
| Report summary — `systemHealthLogRows` | `SYSTEM_HEALTH_LOG` row count | warning if sheet absent |
| Report summary — `cbvTestReportsRows` | `CBV_TEST_REPORTS` row count | warning + `cbvTestReportsMissing: true` |

`CBV_TEST_REPORTS` missing is **WARNING only** — Phase 92 never auto-creates the sheet (read-first).

## Warning / error rules

- All sheet-access failures become **warnings**, never errors.
- Mutation-name probe within the `CbvWebAppObservability_*` namespace will surface an **error** if a verb-at-start function (e.g. `setStatus`, `resolveAlert`, `deleteRow`, `healRoute`) is added without being explicitly allowlisted — same pattern as Phase 91.1.
- All other validation failures (missing functions, missing sheets, missing renderers) are warnings unless they break the envelope.

## Overall status roll-up

`data.status` is derived from the worst card severity:

| Worst severity | Overall status |
|---|---|
| `CRITICAL` / `ERROR` | `FAIL` |
| `WARNING` | `GO_WITH_WARNINGS` |
| `OK` | `GO` |

This is presented at the top of the page next to the severity badge.
