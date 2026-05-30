# PHASE 92 — WebApp Runtime Health / Report Viewer Pages (Prompt)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

> Snapshot of the AI handoff prompt used to drive Phase 92. Captured into `00_SYSTEM_BRAIN/000_PROMPTS/` per CBV Operational Ecosystem Standard V1.

---

Repo: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
GitHub: `https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO`  
Branch: `phase/from-v2.4.1-TASK-FIN`

**Context:** Ecosystem standards via Runtime Entrypoint. Phase-specific:

- CBV Test Console Standard — `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/docs/CBV_TCS_V1_STANDARD.md`


## Current architecture

- Sheets/GAS = operational database + runtime
- WebApp = operational workspace
- AppSheet = lightweight operator shell

## Phase 91 status

- `/home-alert/timeline` renders real HOME_ALERT data (UPDATED_AT desc).
- `/home-alert/kanban` groups by STATUS with read-only cards.
- No mutation, no drag-drop save.
- Safety footer preserved.
- Operational Visualization Surface = GO.
- Suggested pilot tag: `v2.4.8-webapp-timeline-kanban-readfirst`.
- Hotfix 91.1 narrowed the mutation-name validator to Phase 91 namespace + verb-at-start matcher.

## Phase 92 theme

Operational Observability Layer.

## Mission

1. Replace placeholder for `/runtime/health` with a read-first Runtime Health page.
2. Replace placeholder for `/reports` with a read-first Report Viewer.
3. Expose trace/report/audit summaries.
4. No destructive write.
5. No automation.
6. No AI runtime.
7. No production claim.

## In scope

- Runtime health center (per-phase Test Console probe, route summary, report summary).
- Test report viewer (recent reports, severity, trace).
- Recent report browser (sheet + in-memory fallback).
- Error/warning summary.
- Basic trace viewer.
- Audit/report read-first summaries.
- WebApp pages: `/runtime/health`, `/reports`.
- CBV_TCS_V1 Test Console.

## Out of scope

- Deleting reports.
- Editing reports.
- Auto-healing.
- Auto-resolve.
- Auto-escalate.
- AI analysis.
- ENV-A.
- Queue intelligence.
- Production certification.

## Files to create

Runtime:

1. `05_GAS_RUNTIME/994_WEBAPP_OBSERVABILITY_DATA.js`
2. `05_GAS_RUNTIME/995_WEBAPP_OBSERVABILITY_RENDERER.js`
3. `05_GAS_RUNTIME/996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js`

HTML:

4. `05_GAS_RUNTIME/html/WEBAPP_RUNTIME_HEALTH.html`
5. `05_GAS_RUNTIME/html/WEBAPP_REPORT_VIEWER.html`
6. `05_GAS_RUNTIME/html/WEBAPP_OBSERVABILITY_COMPONENTS.html`

Docs:

7. `docs/webapp/PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER.md`
8. `docs/webapp/WEBAPP_RUNTIME_HEALTH_DATA_BINDING.md`
9. `docs/webapp/WEBAPP_REPORT_VIEWER_DATA_BINDING.md`
10. `docs/webapp/WEBAPP_OBSERVABILITY_UAT_CHECKLIST.md`

Brain:

11. `00_SYSTEM_BRAIN/000_REPORTS/031_PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER_REPORT.md`
12. `00_SYSTEM_BRAIN/001_HANDOFF/031_PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER_HANDOFF.md`

## Updates

- `.clasp.json` `filePushOrder`: insert `994_…`, `995_…`, `996_…` after Phase 91 files; keep `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` as the absolute last entry.
- `05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js`: route `/runtime/health` and `/reports` to Phase 92 renderer when present; keep prior placeholder fallback.
- `05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js`: route those paths through the new Phase 92 placeholder dispatcher.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js`: add submenu `Phase 92 — Observability` under `🧪 CBV Test Console`.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js`: add Phase 92 wrappers.
- `05_GAS_RUNTIME/CLASP_PUSH_ORDER.md`: document the new ordering.
- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md`: add Phase 92 docs.

## Data requirements

`994_WEBAPP_OBSERVABILITY_DATA.js` exposes:

- `CbvWebAppObservability_getRuntimeHealth()` — health cards, route summary, report summary.
- `CbvWebAppObservability_getRecentReports(options)` — sheet + in-memory fallback; default limit 50; sorted by checkedAt desc.
- `CbvWebAppObservability_getReportDetail(reportId)` — reportText + reportJson by ID.
- `CbvWebAppObservability_getTraceSummary(options)` — trace IDs across reports.
- `CbvWebAppObservability_validate()` — function presence + mutation namespace probe; missing CBV_TEST_REPORTS is a WARNING only.

Envelope: `{ ok, data, warnings, errors, checkedAt }`. Read-first. No mutation.

## Rendering requirements

`995_WEBAPP_OBSERVABILITY_RENDERER.js` exposes:

- `CbvWebAppObservability_renderRuntimeHealth()`
- `CbvWebAppObservability_renderReportViewer()`
- `CbvWebAppObservability_renderHealthCard_(card)`
- `CbvWebAppObservability_renderReportRow_(row)`
- `CbvWebAppObservability_renderState_(state)` (states: empty | warning | error | partial | ready)

No auto-heal / mutation / delete / edit buttons. Safety footer preserved.

## Test Console (CBV_TCS_V1)

`996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js`:

- `CbvWebAppObservability_TestConsole_run()`
- `CbvWebAppObservability_TestConsole_showRuntimeHealth()`
- `CbvWebAppObservability_TestConsole_showRecentReports()`
- `CbvWebAppObservability_TestConsole_showTraceSummary()`
- `CbvWebAppObservability_TestConsole_showHandoffPrompt()`
- `CbvWebAppObservability_TestConsole_copyLatestReport()`

Health check validates: data + renderer presence, route bridges for `/runtime/health` and `/reports`, missing CBV_TEST_REPORTS warning, no mutation function exposed in Phase 92 namespace, safety phrases present, no auto-heal / auto-resolve / auto-escalate / production claim, `999_*` dispatcher remains last in `filePushOrder`, envelope OK.

## Local tests

```
git status --short
node --check 05_GAS_RUNTIME/994_WEBAPP_OBSERVABILITY_DATA.js
node --check 05_GAS_RUNTIME/995_WEBAPP_OBSERVABILITY_RENDERER.js
node --check 05_GAS_RUNTIME/996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js
node --check 05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js
node --check 05_GAS_RUNTIME/999_WEBAPP_DOGET_DISPATCHER_FINAL.js
node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js
node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js
node -e "JSON.parse(require('fs').readFileSync('06_DATABASE/schema_manifest.json','utf8'))"
```

Forbidden-phrase scan (only allowed as prohibitions/warnings): `auto-heal`, `auto resolve`, `auto escalate`, `production ready`, `delete report`, `edit report`.

## Git

```
git add .clasp.json 05_GAS_RUNTIME/994_*.js 05_GAS_RUNTIME/995_*.js 05_GAS_RUNTIME/996_*.js \
  05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js \
  05_GAS_RUNTIME/html/WEBAPP_RUNTIME_HEALTH.html \
  05_GAS_RUNTIME/html/WEBAPP_REPORT_VIEWER.html \
  05_GAS_RUNTIME/html/WEBAPP_OBSERVABILITY_COMPONENTS.html \
  05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js 05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js \
  05_GAS_RUNTIME/CLASP_PUSH_ORDER.md \
  docs/webapp docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md \
  00_SYSTEM_BRAIN/000_PROMPTS/031_*.md \
  00_SYSTEM_BRAIN/000_REPORTS/031_*.md \
  00_SYSTEM_BRAIN/001_HANDOFF/031_*.md
git commit -m "feat(webapp): add phase 92 observability pages"
git push origin phase/from-v2.4.1-TASK-FIN
clasp push --force
```

## Tagging

Do NOT tag production. Optional pilot tag after manual verification: `v2.4.9-webapp-observability`.

## Expected final status

- Observability readiness: **GO_WITH_WARNINGS** until UAT.
- Production readiness: **NOT YET**.
- Next: Phase 93 — WebApp Admin Reference Viewer / Settings Read-First.
