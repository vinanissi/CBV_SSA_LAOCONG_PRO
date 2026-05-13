# PHASE 92 — WebApp Runtime Health / Report Viewer (AI Handoff)

> AI handoff prompt for the next session. Copy verbatim into the next AI conversation when continuing from Phase 92.

---

## Phase 92 scope

Operational Observability Layer (read-first):

- `/runtime/health` → real runtime health page (per-phase Test Console probe, route summary, report summary, warnings/errors).
- `/reports` → real report viewer (merges in-memory `PropertiesService` + `CBV_TEST_REPORTS` if present + `SYSTEM_HEALTH_LOG`).
- Trace summary across visible reports.
- CBV_TCS_V1 Test Console (`Phase 92 — Observability`).

## Routes affected

- `/runtime/health` — bridged via `CbvWebAppPilotRenderer_renderRuntimeHealthPlaceholder` → Phase 92 `CbvWebAppObservability_renderRuntimeHealth` (placeholder fallback retained).
- `/reports` — bridged via `CbvWebAppPilotRenderer_renderReportsPlaceholder` → Phase 92 `CbvWebAppObservability_renderReportViewer` (placeholder fallback retained).
- All routes remain `mode = READ_FIRST` in the route registry.

## Observability functions

Data layer (`05_GAS_RUNTIME/994_WEBAPP_OBSERVABILITY_DATA.js`):

- `CbvWebAppObservability_getRuntimeHealth()` — per-phase probe + route summary + report summary.
- `CbvWebAppObservability_getRecentReports({ limit })` — merged report list, default limit `50`.
- `CbvWebAppObservability_getReportDetail(reportId)` — by traceId / propKey / `SYSTEM_HEALTH_LOG.RUN_ID`.
- `CbvWebAppObservability_getTraceSummary({ limit })` — unique trace IDs.
- `CbvWebAppObservability_validate()` — read-first validation + scoped mutation probe.

Renderer layer (`05_GAS_RUNTIME/995_WEBAPP_OBSERVABILITY_RENDERER.js`):

- `CbvWebAppObservability_renderRuntimeHealth()`
- `CbvWebAppObservability_renderReportViewer()`
- `CbvWebAppObservability_renderHealthCard_(card)`
- `CbvWebAppObservability_renderReportRow_(row)`
- `CbvWebAppObservability_renderState_(state)`

Test Console (`05_GAS_RUNTIME/996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js`):

- `CbvWebAppObservability_TestConsole_run()`
- `CbvWebAppObservability_TestConsole_showRuntimeHealth()`
- `CbvWebAppObservability_TestConsole_showRecentReports()`
- `CbvWebAppObservability_TestConsole_showTraceSummary()`
- `CbvWebAppObservability_TestConsole_showHandoffPrompt()`
- `CbvWebAppObservability_TestConsole_copyLatestReport()`

## Known limitations

- `CBV_TEST_REPORTS` sheet is **not** created by Phase 92 (read-first). When absent, the Report Viewer falls back to in-memory + `SYSTEM_HEALTH_LOG` and the Runtime Health page surfaces a warning `cbvTestReportsMissing: true`.
- Health cards for Phase 85/86/87 will display `NOT_LOADED` if `CbvUiContract_healthCheck` / `CbvUiPilotBinding_healthCheck` / `CbvAppSheetPilot_healthCheck` aren't bound to the global scope in the active deployment.
- The mutation-name probe is **scoped to `CbvWebAppObservability_*`** with a verb-at-start matcher and explicit allowlist (same pattern as Phase 91.1). It will not see legacy/global runtime functions in other modules.
- `clasp.json` cannot be read from GAS runtime; the "999 dispatcher remains last" invariant is verified via the local lint and the static check `typeof doGet === 'function'`.

## No mutation rule

Phase 92 must remain strictly **read-first**:

- **No** delete-report controls.
- **No** edit-report controls.
- **No** auto-heal buttons.
- **No** auto resolve / auto escalate / auto assign controls.
- **No** ENV-A integration.
- **No** AI runtime.
- **No** queue intelligence.
- **No** production claim.

Adding a function in the `CbvWebAppObservability_*` namespace whose action portion starts with `set|update|resolve|complete|delete|save|mutate|assign|escalate|claim|drag|heal|repair|edit` followed by an uppercase letter will trigger the mutation-name probe and fail the Test Console — that is intentional.

## Recommended next phase

**Phase 93 — WebApp Admin Reference Viewer / Settings Read-First**

- Surface enum/master-code/user-role/operational reference registries via read-first WebApp pages.
- Surface settings (slice maps, view setup matrix, security filter matrix) as read-only inspection views.
- Continue CBV_TCS_V1 enforcement + scoped mutation probe + per-phase Test Console submenu (`Phase 93 — Admin Reference`).
- Must not enable any reference/settings edit controls. Edits remain manual via Apps Script editor / sheets, not via the WebApp.
- Suggested pilot tag after UAT: `v2.4.10-webapp-admin-reference-readfirst`.

## Safety footer (must remain visible on page + report)

```
No auto-heal · No auto resolve · No auto escalate · No production claim
No delete report · No edit report
```
