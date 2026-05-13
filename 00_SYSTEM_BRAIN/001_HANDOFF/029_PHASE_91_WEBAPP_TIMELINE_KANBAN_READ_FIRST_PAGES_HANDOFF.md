# PHASE 91 — WebApp Timeline / Kanban Read-First Pages — Handoff

| Field | Value |
|-------|-------|
| Phase | PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES |
| Branch | `phase/from-v2.4.1-TASK-FIN` |
| Status | Pilot read-first; **NOT** production-ready |
| Envelope contract | CBV_TCS_V1 |

## Phase 91 scope

- Replace Phase 90 placeholder pages for `/home-alert/timeline` and `/home-alert/kanban` with read-first renderers backed by real HOME_ALERT data.
- Add Phase 91 Test Console (`🧪 CBV Test Console → Phase 91 — Timeline / Kanban`).
- Surface state handling (`empty`, `warning`, `error`, `partial`, `ready`).
- Keep Phase 90 placeholder fallback if Phase 91 renderer not loaded / throws.

## Routes affected

| Route | Phase 91 binding |
|-------|-------------------|
| `/home-alert/timeline` | `CbvWebAppTimelineKanban_renderTimeline()` via `CbvWebAppPilotRenderer_renderTimelinePlaceholder()` |
| `/home-alert/kanban` | `CbvWebAppTimelineKanban_renderKanban()` via `CbvWebAppPilotRenderer_renderKanbanPlaceholder()` |

`?action=ping` and the rest of the WebApp dispatcher (`999_WEBAPP_DOGET_DISPATCHER_FINAL.js`) are unchanged. `999_*` remains the absolute last file in `.clasp.json` `filePushOrder`.

## Timeline / Kanban functions

### Data (`05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js`)

- `CbvWebAppTimelineKanban_getTimelineData(options)`
- `CbvWebAppTimelineKanban_getKanbanData(options)`
- `CbvWebAppTimelineKanban_validate()`

All return `{ ok, data, warnings, errors, checkedAt }`. Defaults: 100 rows for Timeline, 50 cards/column for Kanban. Sort: `UPDATED_AT` desc → fallback `CREATED_AT` desc for Timeline; SLA breach desc → updatedAt desc inside each Kanban column.

### Renderer (`05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js`)

- `CbvWebAppTimelineKanban_renderTimeline()` → `{ bodyHtml, warnings }`.
- `CbvWebAppTimelineKanban_renderKanban()` → `{ bodyHtml, warnings }`.
- Helpers: `CbvWebAppTimelineKanban_renderTimelineRow_(row)`, `CbvWebAppTimelineKanban_renderKanbanColumn_(column)`, `CbvWebAppTimelineKanban_renderKanbanCard_(card)`, `CbvWebAppTimelineKanban_renderState_(state)`.
- Templates: `html/WEBAPP_WORKSPACE_TIMELINE.html`, `html/WEBAPP_WORKSPACE_KANBAN.html`. Inline HTML fallback if templates absent.

### Test Console (`05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js`)

- `CbvWebAppTimelineKanban_TestConsole_run()` (CBV_TCS_V1 envelope).
- `CbvWebAppTimelineKanban_TestConsole_showTimelineData()`
- `CbvWebAppTimelineKanban_TestConsole_showKanbanData()`
- `CbvWebAppTimelineKanban_TestConsole_showHandoffPrompt()`
- `CbvWebAppTimelineKanban_TestConsole_copyLatestReport()`

Health check validates function presence, route bridge to Phase 91, HOME_ALERT readability, no mutation function exposed in the Phase 91 namespace, safety phrases present, no drag-drop save recommendation, no production-ready claim.

## Known limitations

- HOME_ALERT recommended columns are required to render full operator context (`ASSIGNED_TO`, `SLA_STATUS`, `SLA_BREACH_LEVEL`, `OPERATOR_PRIMARY_TEXT`, `OPERATOR_SECONDARY_TEXT`, `OPERATOR_META_TEXT`, `OPERATOR_NEXT_ACTION`, `UPDATED_AT`, `CREATED_AT`). Missing columns degrade gracefully with warnings — they do not block render.
- Pilot caps: Timeline 100 rows / Kanban 50 cards per column. Column count still reflects true totals.
- Kanban column order is the discovery order in HOME_ALERT rows — no enforced status ordering yet (deferred to Phase 92+).
- No drag-drop interaction or save (intentional).
- Apps Script GAS runtime cannot read `.clasp.json` at execution time; the "999 dispatcher last" rule is enforced by local repo lint and `CLASP_PUSH_ORDER.md`.

## No mutation rule (must remain enforced)

Phase 91 **MUST NOT** introduce any write/mutation function. Specifically:

- No claim / resolve / escalate / assign / write / save / mutate / drag-save APIs.
- No auto assign, no auto resolve, no auto escalate.
- No drag-drop save (UI does not register drag handlers).
- `CbvWebAppTimelineKanban_validate()` actively probes the namespace for `_save`, `_write`, `_mutate`, `_claim`, `_resolve`, `_escalate`, `_assign`, `_drag` names and surfaces them as errors.

## Pilot readiness

- **GO_WITH_WARNINGS** until operator UAT completes per `docs/webapp/WEBAPP_TIMELINE_KANBAN_UAT_CHECKLIST.md`.

## Production readiness

- **NOT YET.** Production certification deferred to Phase 92+. Optional pilot tag `v2.4.8-webapp-timeline-kanban-readfirst` only after manual route render verification.

## Recommended next phase

**Phase 92 — WebApp Runtime Health / Report Viewer Pages**

Goals:

- `/runtime/health`: read-first runtime health dashboard (last seed/test/audit results, schema integrity, trigger inventory).
- `/reports`: append-only viewer for `CBV_TEST_REPORTS` + Drive archive (CBV_TCS_V1 envelopes).
- Test Console Phase 92 with the same CBV_TCS_V1 envelope contract.
- Still read-first; no production claim.

## Safety footer (must remain visible)

No auto assign · No auto resolve · No auto escalate · No production claim · No drag-drop save
