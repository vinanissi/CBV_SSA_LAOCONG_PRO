# PHASE 91 — WebApp Timeline / Kanban Read-First Pages — Report

| Field | Value |
|-------|-------|
| Phase | PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES |
| Contract version | CBV_TCS_V1 |
| Branch | `phase/from-v2.4.1-TASK-FIN` |
| Commit hash | `<TO_BE_FILLED_AFTER_COMMIT>` |
| Pilot readiness | **GO_WITH_WARNINGS** (until operator UAT) |
| Production readiness | **NOT YET** |

## Files created

Runtime:

- `05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js`
- `05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js`
- `05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js`

HTML:

- `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_TIMELINE.html`
- `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_KANBAN.html`

Docs:

- `docs/webapp/PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES.md`
- `docs/webapp/WEBAPP_TIMELINE_DATA_BINDING.md`
- `docs/webapp/WEBAPP_KANBAN_DATA_BINDING.md`
- `docs/webapp/WEBAPP_TIMELINE_KANBAN_UAT_CHECKLIST.md`

Brain:

- `00_SYSTEM_BRAIN/000_PROMPTS/029_PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/029_PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES_REPORT.md` (this file)
- `00_SYSTEM_BRAIN/001_HANDOFF/029_PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES_HANDOFF.md`

## Files updated

- `.clasp.json` — `filePushOrder` adds `991_…`, `992_…`, `993_…` after Phase 90 files; `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` remains absolute last.
- `05_GAS_RUNTIME/CLASP_PUSH_ORDER.md` — documents Phase 91 load-order rationale.
- `05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js` — `renderTimelinePlaceholder()` / `renderKanbanPlaceholder()` now delegate to Phase 91 renderer when available; Phase 90 fallback preserved.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js` — adds submenu `Phase 91 — Timeline / Kanban` under `🧪 CBV Test Console`.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js` — adds `menuCbvTestConsoleWebAppTlk91_*` wrappers.
- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` — adds Phase 91 docs section.

## Data functions added

- `CbvWebAppTimelineKanban_getTimelineData(options)` → `{ ok, data: { count, rows[…] }, warnings, errors, checkedAt }`.
- `CbvWebAppTimelineKanban_getKanbanData(options)` → `{ ok, data: { groupBy:"STATUS", total, columns[…] }, warnings, errors, checkedAt }`.
- `CbvWebAppTimelineKanban_validate()` → readability + column probe + mutation-namespace probe.

## Renderer functions added

- `CbvWebAppTimelineKanban_renderTimeline()`
- `CbvWebAppTimelineKanban_renderKanban()`
- `CbvWebAppTimelineKanban_renderTimelineRow_(row)`
- `CbvWebAppTimelineKanban_renderKanbanColumn_(column)`
- `CbvWebAppTimelineKanban_renderKanbanCard_(card)`
- `CbvWebAppTimelineKanban_renderState_(state)` — states: `empty`, `warning`, `error`, `partial`, `ready`.

## Timeline binding summary

- Source: HOME_ALERT sheet.
- Sort: `UPDATED_AT` desc, fallback `CREATED_AT` desc.
- Default limit: 100 rows.
- Fields surfaced: id, status, assignedTo, moduleCode, priority, slaStatus, slaBreachLevel, operator primary/secondary/meta/next-action, createdAt, updatedAt, timelineAt.
- Missing columns → warning, never throw.

## Kanban binding summary

- Source: HOME_ALERT sheet.
- Grouped by `STATUS`. Empty/missing `STATUS` → `UNKNOWN` bucket.
- In-column sort: SLA breach level desc, then `updatedAt` desc.
- Default cap: 50 cards / column. Column `count` reflects true total.
- Cards: id, title (operator primary fallback id), status, assignedTo, priority, slaStatus, slaBreachLevel, operatorMetaText, updatedAt.
- No drag-drop save. No mutation function exposed (validate() probes the `CbvWebAppTimelineKanban_*` namespace).

## Route integration summary

- `/home-alert/timeline` → `CbvWebAppPilotRenderer_renderTimelinePlaceholder()` → delegates to `CbvWebAppTimelineKanban_renderTimeline()` when present (fallback to Phase 90 preview if Phase 91 missing or errors).
- `/home-alert/kanban` → `CbvWebAppPilotRenderer_renderKanbanPlaceholder()` → delegates to `CbvWebAppTimelineKanban_renderKanban()` when present (fallback to Phase 90 preview if Phase 91 missing or errors).
- `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` remains the last entry of `.clasp.json` `filePushOrder` (verified locally).

## Test Console (CBV_TCS_V1)

- `CbvWebAppTimelineKanban_TestConsole_run()` — health check; returns standard envelope.
- `CbvWebAppTimelineKanban_TestConsole_showTimelineData()`
- `CbvWebAppTimelineKanban_TestConsole_showKanbanData()`
- `CbvWebAppTimelineKanban_TestConsole_showHandoffPrompt()`
- `CbvWebAppTimelineKanban_TestConsole_copyLatestReport()`

Health check validates:

- Timeline/Kanban data functions exist.
- Timeline/Kanban renderer + helper functions exist.
- `/home-alert/timeline` and `/home-alert/kanban` route bridges delegate to Phase 91 renderer (warning if not).
- HOME_ALERT readable or warning.
- No mutation function exposed under `CbvWebAppTimelineKanban_*` namespace.
- Safety phrases present: No auto assign / No auto resolve / No auto escalate / No production claim.
- No drag-drop save recommendation in safety text / handoff prompt.
- No production-ready claim.
- Standard CBV_TCS_V1 envelope (`envelopeOk: true`).

## Local test results

Run from `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`:

| Command | Expected | Actual |
|---------|----------|--------|
| `node --check 05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js` | exit 0 | exit 0 |
| `node --check 05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js` | exit 0 | exit 0 |
| `node --check 05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js` | exit 0 | exit 0 |
| `node --check 05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js` | exit 0 | exit 0 |
| `node --check 05_GAS_RUNTIME/999_WEBAPP_DOGET_DISPATCHER_FINAL.js` | exit 0 | exit 0 |
| `node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js` | exit 0 | exit 0 |
| `node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js` | exit 0 | exit 0 |
| `node -e "JSON.parse(require('fs').readFileSync('06_DATABASE/schema_manifest.json','utf8'))"` | OK | OK |
| `.clasp.json filePushOrder last == 999_WEBAPP_DOGET_DISPATCHER_FINAL.js` | true | true |

Forbidden phrase search (must not appear as a recommendation/claim in Phase 91 files):

- `auto assign` → only as prohibition in docs.
- `auto resolve` → only as prohibition.
- `auto escalate` → only as prohibition.
- `AppSheet Bot` → only as prohibition.
- `production ready` → not present.
- `drag-drop save` → only as prohibition.

## GAS test results

Run inside the spreadsheet:

1. `🧪 CBV Test Console → Phase 91 — Timeline / Kanban → Run Timeline/Kanban Health Check` → expect **GO** or **GO_WITH_WARNINGS** with `envelopeOk: true`.
2. `Show Timeline Data` → JSON envelope with `data.rows` truncated to 20 rows.
3. `Show Kanban Data` → JSON envelope with `data.columns` truncated to 10 cards/column.
4. `Copy Latest Report` → modal dialog exposes JSON for download/audit (append-only).

## WebApp route test results

Manual:

- `?route=/home-alert/timeline` → Timeline read-first page renders; safety footer visible.
- `?route=/home-alert/kanban` → Kanban read-first page renders; cards read-only; no drag/drop.
- `?action=ping` → unchanged JSON pong from `999_WEBAPP_DOGET_DISPATCHER_FINAL.js`.

## Warnings

- HOME_ALERT recommended columns may be missing on some environments (`ASSIGNED_TO`, `SLA_STATUS`, `SLA_BREACH_LEVEL`, `OPERATOR_*`); UI surfaces these as a warning block — no crash.
- Pilot caps: 100 rows for Timeline, 50 cards/column for Kanban; column count still reflects true totals.
- Status `GO_WITH_WARNINGS` expected until operator UAT signs off.

## Next step

- Run Phase 91 Test Console in spreadsheet; capture report into `CBV_TEST_REPORTS` + Drive archive (append-only).
- Manual route verification on the deployed Web App URL.
- Plan Phase 92 — WebApp Runtime Health / Report Viewer Pages (`/runtime/health`, `/reports`).
- Do NOT tag production; optional pilot tag `v2.4.8-webapp-timeline-kanban-readfirst` after manual route verification.

## Git commands

```
git add .clasp.json \
  05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js \
  05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js \
  05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js \
  05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js \
  05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_TIMELINE.html \
  05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_KANBAN.html \
  05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js \
  05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js \
  05_GAS_RUNTIME/CLASP_PUSH_ORDER.md \
  docs/webapp docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md \
  00_SYSTEM_BRAIN/000_PROMPTS/029_PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES_PROMPT.md \
  00_SYSTEM_BRAIN/000_REPORTS/029_PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES_REPORT.md \
  00_SYSTEM_BRAIN/001_HANDOFF/029_PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES_HANDOFF.md

git commit -m "feat(webapp): add phase 91 timeline kanban read-first pages"
git push origin phase/from-v2.4.1-TASK-FIN
clasp push --force
```

## Tagging (optional, pilot only)

Do **not** tag production. After GAS Phase 91 health is GO/GO_WITH_WARNINGS and manual route render is verified, an optional pilot tag may be created:

```
git tag -a v2.4.8-webapp-timeline-kanban-readfirst -m "Phase 91 — WebApp Timeline / Kanban read-first pages (pilot)"
git push origin v2.4.8-webapp-timeline-kanban-readfirst
```

## Safety footer (preserved)

No auto assign · No auto resolve · No auto escalate · No production claim
