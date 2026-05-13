# PHASE 92 — WebApp Runtime Health / Report Viewer (Report)

**Phase:** `PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER`  
**Theme:** Operational Observability Layer (read-first).  
**Date:** 2026-05-13  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Standards:** CBV Operational Ecosystem Standard V1; CBV Test Console Standard CBV_TCS_V1.

---

## 1. Files created

Runtime:

- `05_GAS_RUNTIME/994_WEBAPP_OBSERVABILITY_DATA.js`
- `05_GAS_RUNTIME/995_WEBAPP_OBSERVABILITY_RENDERER.js`
- `05_GAS_RUNTIME/996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js`

HTML:

- `05_GAS_RUNTIME/html/WEBAPP_RUNTIME_HEALTH.html`
- `05_GAS_RUNTIME/html/WEBAPP_REPORT_VIEWER.html`
- `05_GAS_RUNTIME/html/WEBAPP_OBSERVABILITY_COMPONENTS.html`

Docs:

- `docs/webapp/PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER.md`
- `docs/webapp/WEBAPP_RUNTIME_HEALTH_DATA_BINDING.md`
- `docs/webapp/WEBAPP_REPORT_VIEWER_DATA_BINDING.md`
- `docs/webapp/WEBAPP_OBSERVABILITY_UAT_CHECKLIST.md`

Brain:

- `00_SYSTEM_BRAIN/000_PROMPTS/031_PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/031_PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER_REPORT.md` (this file)
- `00_SYSTEM_BRAIN/001_HANDOFF/031_PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER_HANDOFF.md`

## 2. Files updated

- `.clasp.json` — `filePushOrder` extended with `994_…`, `995_…`, `996_…` after Phase 91 files and before `999_WEBAPP_DOGET_DISPATCHER_FINAL.js`.
- `05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js` — added `CbvWebAppPilotRenderer_renderRuntimeHealthPlaceholder()` and `…_renderReportsPlaceholder()` with Phase 92 delegation + placeholder fallback.
- `05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js` — added route-bridge `else if` branches for `/runtime/health` and `/reports` calling the new dispatchers.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js` — added submenu `Phase 92 — Observability` under `🧪 CBV Test Console`.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js` — added six `menuCbvTestConsoleWebAppObs92_*` wrappers.
- `05_GAS_RUNTIME/CLASP_PUSH_ORDER.md` — documented Phase 92 load-order rationale.
- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` — added Phase 92 section.

## 3. Data functions added

| Function | Returns | Notes |
|---|---|---|
| `CbvWebAppObservability_getRuntimeHealth()` | `{ ok, data: { status, severity, healthCards, testConsoleSummary, routeSummary, reportSummary, warnings, errors }, warnings, errors, checkedAt }` | Per-phase probe (`CBV_WEBAPP_OBSERVABILITY_PHASE_CATALOG`) — no Test Console is executed; functions are only probed by name and last reports are read from `PropertiesService`. |
| `CbvWebAppObservability_getRecentReports({ limit })` | `{ data: { count, rows[] } }` | Merges in-memory PropertiesService reports + `CBV_TEST_REPORTS` (if present) + `SYSTEM_HEALTH_LOG`; sorts by `checkedAt` desc; default limit `50`. |
| `CbvWebAppObservability_getReportDetail(reportId)` | `{ data: { reportId, reportText, reportJson, source } }` | Resolves by prop-key/traceId for in-memory entries; falls back to `SYSTEM_HEALTH_LOG` `RUN_ID` lookup. |
| `CbvWebAppObservability_getTraceSummary({ limit })` | `{ data: { count, traces[] } }` | Unique trace IDs across visible reports. |
| `CbvWebAppObservability_validate()` | `{ data: { functions, renderer, sheets, noMutationExposed, mutationProbe, mutationAllowlist } }` | Read-first validation; missing `CBV_TEST_REPORTS` is **WARNING only**; mutation-name probe is **scoped to `CbvWebAppObservability_*`** with verb-at-start matcher + explicit allowlist (Phase 91.1 pattern). |

## 4. Renderer functions added

- `CbvWebAppObservability_renderRuntimeHealth()` — top-level page renderer (template-first, inline fallback).
- `CbvWebAppObservability_renderReportViewer()` — top-level page renderer.
- `CbvWebAppObservability_renderHealthCard_(card)` — per-card HTML.
- `CbvWebAppObservability_renderReportRow_(row)` — per-row HTML.
- `CbvWebAppObservability_renderState_(state)` — normalize FE state descriptor (`empty | warning | error | partial | ready`).

## 5. Routes affected

| Route | Before (Phase 89) | After (Phase 92) |
|---|---|---|
| `/runtime/health` | Generic placeholder | Phase 92 renderer via `CbvWebAppPilotRenderer_renderRuntimeHealthPlaceholder`; placeholder fallback if Phase 92 not loaded. |
| `/reports` | Generic placeholder | Phase 92 renderer via `CbvWebAppPilotRenderer_renderReportsPlaceholder`; placeholder fallback if Phase 92 not loaded. |

Both routes remain `READ_FIRST` mode in the route registry. The dispatcher in `94_WEBAPP_WORKSPACE_RENDERER.js` checks for the new placeholder dispatchers via `typeof … === 'function'` before delegating.

## 6. Test Console added

Menu: `🧪 CBV Test Console → Phase 92 — Observability`.

Items:

- Run Observability Health Check (`CbvWebAppObservability_TestConsole_run`)
- Show Runtime Health Data
- Show Recent Reports
- Show Trace Summary
- Show AI Handoff Prompt
- Copy Latest Report

Health checks: data + renderer presence, route-bridge inspection (source-of-function scan), route registration, sheet probes (warning-only on missing), data smoke (shape check), `doGet` presence, all-routes-READ_FIRST, safety phrase audit (`No auto-heal`, `No auto resolve`, `No auto escalate`, `No production claim`), no auto-heal recommendation, no production-ready claim, no delete-/edit-report recommendation, no write mutation in Phase 92 namespace (delegated to `CbvWebAppObservability_validate` mutation probe), and CBV_TCS_V1 envelope shape.

Returns the standard envelope `{ ok, phase, status, checkedAt, runBy, traceId, testSuite, summary, checks, warnings, errors, nextStep, severity, reportText, reportJson, contractVersion, envelopeOk }`. The latest report is persisted to `PropertiesService` under `CBV_WEBAPP_OBS_TC_LAST_REPORT_JSON` so subsequent Phase 92 runs surface it directly in the Recent Reports view.

## 7. Local test result

```
node --check 05_GAS_RUNTIME/994_WEBAPP_OBSERVABILITY_DATA.js     → OK
node --check 05_GAS_RUNTIME/995_WEBAPP_OBSERVABILITY_RENDERER.js → OK
node --check 05_GAS_RUNTIME/996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js → OK
node --check 05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js → OK
node --check 05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js      → OK
node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js                  → OK
node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js         → OK
node --check 05_GAS_RUNTIME/999_WEBAPP_DOGET_DISPATCHER_FINAL.js  → OK
node -e "JSON.parse(...schema_manifest.json...)"                  → OK
```

Forbidden-phrase audit (`auto-heal`, `auto resolve`, `auto escalate`, `production ready`, `delete report`, `edit report`) found only **prohibitions and warnings** — never recommendations or production claims.

## 8. GAS test result

Pending operator execution after `clasp push --force` + Apps Script "New deployment version":

```
🧪 CBV Test Console → Phase 92 — Observability → Run Observability Health Check
Expected: status=GO or GO_WITH_WARNINGS, envelopeOk=yes, errors=0.
```

## 9. WebApp route test result

Pending operator manual verification:

```
?route=/runtime/health → "Runtime Health (read-first)" with phase cards
?route=/reports        → "Report Viewer (read-first)" with merged report list
```

## 10. Warnings

- `CBV_TEST_REPORTS` sheet does not exist yet — by design Phase 92 does **not** create it. Recent Reports view falls back to in-memory + `SYSTEM_HEALTH_LOG` until the sheet is provisioned by a future phase (e.g. Phase 93+ if scoped).
- Health Cards may show `NOT_LOADED` for Phase 85/86/87 if their health-check functions are not bound to the global scope in the current deployment — that is informational, not a regression.
- Manual UAT against the deployed WebApp dispatcher is still required (see `docs/webapp/WEBAPP_OBSERVABILITY_UAT_CHECKLIST.md`).

## 11. Next step

Phase 93 — **WebApp Admin Reference Viewer / Settings Read-First**: surface enum/master-code/user-role registries via read-first WebApp pages and Test Console.

## 12. Pilot readiness

`GO_WITH_WARNINGS` until operator UAT confirms route render + missing-source warnings + no-mutation footer.

## 13. Production readiness

`NOT YET`. Phase 92 only adds observability surfaces — it does not certify any operational path for production.

## 14. Git commands

```bash
git add .clasp.json \
  05_GAS_RUNTIME/994_WEBAPP_OBSERVABILITY_DATA.js \
  05_GAS_RUNTIME/995_WEBAPP_OBSERVABILITY_RENDERER.js \
  05_GAS_RUNTIME/996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js \
  05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js \
  05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js \
  05_GAS_RUNTIME/html/WEBAPP_RUNTIME_HEALTH.html \
  05_GAS_RUNTIME/html/WEBAPP_REPORT_VIEWER.html \
  05_GAS_RUNTIME/html/WEBAPP_OBSERVABILITY_COMPONENTS.html \
  05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js \
  05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js \
  05_GAS_RUNTIME/CLASP_PUSH_ORDER.md \
  docs/webapp docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md \
  00_SYSTEM_BRAIN/000_PROMPTS/031_PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER_PROMPT.md \
  00_SYSTEM_BRAIN/000_REPORTS/031_PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER_REPORT.md \
  00_SYSTEM_BRAIN/001_HANDOFF/031_PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER_HANDOFF.md

git commit -m "feat(webapp): add phase 92 observability pages"
git push origin phase/from-v2.4.1-TASK-FIN
clasp push --force
```

## 15. Commit hash

To be backfilled with a follow-up commit after the initial Phase 92 commit lands (mirroring the append-only audit pattern used for Phase 91): see `phase-92-commit-hash-here`.

## 16. Push result

Pending — will be recorded after `git push origin phase/from-v2.4.1-TASK-FIN`.

## 17. Clasp result

Pending — will be recorded after `clasp push --force`.

## 18. Deployment note

After `clasp push --force`, open Apps Script → Deploy → Manage deployments → Edit → Version: **New version** → Deploy. Then re-run Phase 92 Test Console from the spreadsheet menu and manually visit `?route=/runtime/health` and `?route=/reports` on the deployed WebApp dispatcher.

Optional pilot tag — only after GAS Phase 92 health = `GO`/`GO_WITH_WARNINGS` and routes render manually verified:

```bash
git tag -a v2.4.9-webapp-observability -m "phase 92 webapp observability read-first"
```

Do **not** tag production.
