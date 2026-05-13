# PHASE 91 — WEBAPP TIMELINE / KANBAN READ-FIRST PAGES (Prompt)

> Snapshot of the AI handoff prompt used to drive Phase 91. Captured into `00_SYSTEM_BRAIN/000_PROMPTS/` as required by CBV Operational Ecosystem Standard V1.

---

Repo: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
GitHub: `https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO`  
Branch: `phase/from-v2.4.1-TASK-FIN`

Standards:

- CBV Operational Ecosystem Standard V1
- CBV Test Console Standard: `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/docs/CBV_TCS_V1_STANDARD.md`

## Current architecture

- Sheets/GAS = operational database + runtime
- WebApp = operational workspace
- AppSheet = lightweight operator shell

## Phase 90 status (read-first)

WebApp pilot pages render real data:

- `/workspace` renders pilot dashboard.
- HOME_ALERT aggregate works.
- My Queue / Unassigned / Breached / Escalated / Blocked / Resolved Today cards display.
- READ_FIRST badge present.
- Safety footer: No auto assign · No auto resolve · No auto escalate · No production claim.
- Phase 90 milestone tag candidate: `v2.4.7-webapp-pilot-pages`.

## Mission

Phase 91 — promote Timeline and Kanban from placeholder previews into **read-first pages** powered by real HOME_ALERT data.

Read-first only:

- No write mutation.
- No drag-drop save.
- No auto assign.
- No auto resolve.
- No auto escalate.
- No AI runtime.
- No ENV-A.
- No queue intelligence.
- No production claim.

## Goal

1. Timeline page:
   - Vertical timeline of HOME_ALERT, sorted by `UPDATED_AT` (fallback `CREATED_AT`).
   - Display status, SLA, assignedTo, module, operator text.
   - No edits / no mutation buttons.
2. Kanban page:
   - Group HOME_ALERT cards by `STATUS`.
   - Cards are read-only.
   - No drag-drop save.
   - No mutation.

## Scope

In scope:

- Timeline read-first data binding.
- Kanban read-first grouping.
- Replace placeholder routes `/home-alert/timeline` and `/home-alert/kanban` with real Phase 91 renderers (Phase 90 placeholder kept as fallback).
- Read-only cards.
- FE state handling (empty/warning/error/partial/ready).
- Phase 91 Test Console (CBV_TCS_V1 envelope).
- Docs/report/handoff.

Out of scope:

- Drag-drop writeback.
- Claim / resolve / escalate buttons.
- Mutation API.
- Auto routing.
- AI runtime.
- ENV-A.
- Queue intelligence.
- Production certification.

## Files to create

Runtime:

1. `05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js`
2. `05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js`
3. `05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js`

HTML:

4. `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_TIMELINE.html`
5. `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_KANBAN.html`

Docs:

6. `docs/webapp/PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES.md`
7. `docs/webapp/WEBAPP_TIMELINE_DATA_BINDING.md`
8. `docs/webapp/WEBAPP_KANBAN_DATA_BINDING.md`
9. `docs/webapp/WEBAPP_TIMELINE_KANBAN_UAT_CHECKLIST.md`

Brain:

10. `00_SYSTEM_BRAIN/000_REPORTS/029_PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES_REPORT.md`
11. `00_SYSTEM_BRAIN/001_HANDOFF/029_PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES_HANDOFF.md`

## Updates

- `.clasp.json` `filePushOrder`: add `991_…`, `992_…`, `993_…` after Phase 90 files and before `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` (must remain absolute last).
- `05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js`: route `/home-alert/timeline` and `/home-alert/kanban` to Phase 91 renderer if available; keep Phase 90 placeholder fallback.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js`: add Phase 91 submenu under `🧪 CBV Test Console`.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js`: add menu wrappers.
- `05_GAS_RUNTIME/CLASP_PUSH_ORDER.md`: document new files.
- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md`: add Phase 91 docs.

## Data requirements

`991_WEBAPP_TIMELINE_KANBAN_DATA.js` must expose:

- `CbvWebAppTimelineKanban_getTimelineData(options)` — sorted by `UPDATED_AT` desc, fallback `CREATED_AT` desc, default limit 100 rows.
- `CbvWebAppTimelineKanban_getKanbanData(options)` — group by `STATUS`, unknown bucket = `UNKNOWN`, max 50 cards/column.
- `CbvWebAppTimelineKanban_validate()` — warns on missing optional columns; no uncontrolled throws.

Returns must include: `ok`, `data`, `warnings`, `errors`, `checkedAt`.

## Rendering requirements

`992_WEBAPP_TIMELINE_KANBAN_RENDERER.js` exports:

- `CbvWebAppTimelineKanban_renderTimeline()`
- `CbvWebAppTimelineKanban_renderKanban()`
- `CbvWebAppTimelineKanban_renderTimelineRow_(row)`
- `CbvWebAppTimelineKanban_renderKanbanColumn_(column)`
- `CbvWebAppTimelineKanban_renderKanbanCard_(card)`
- `CbvWebAppTimelineKanban_renderState_(state)`

UI rules:

- No action buttons.
- No drag/drop.
- Show id, status, SLA, assignedTo, operator text.
- States: `empty`, `warning`, `error`, `partial`, `ready`.

## Test Console (CBV_TCS_V1)

`993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js`:

- `CbvWebAppTimelineKanban_TestConsole_run()`
- `CbvWebAppTimelineKanban_TestConsole_showTimelineData()`
- `CbvWebAppTimelineKanban_TestConsole_showKanbanData()`
- `CbvWebAppTimelineKanban_TestConsole_showHandoffPrompt()`
- `CbvWebAppTimelineKanban_TestConsole_copyLatestReport()`

Health check validates timeline/kanban data/renderer presence, route integration, HOME_ALERT readability, no write mutation introduced, no drag-drop save language as recommendation, safety phrases present, 999 dispatcher last in `filePushOrder`, envelope OK.

## Local tests

```
git status --short
node --check 05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js
node --check 05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js
node --check 05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js
node --check 05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js
node --check 05_GAS_RUNTIME/999_WEBAPP_DOGET_DISPATCHER_FINAL.js
node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js
node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js
node -e "JSON.parse(require('fs').readFileSync('06_DATABASE/schema_manifest.json','utf8')); console.log('schema_manifest.json OK')"
```

## Git

```
git add .clasp.json 05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js \
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

## Tagging

Do not tag production. Optional pilot tag after GAS Phase 91 health GO/GO_WITH_WARNINGS and manual route render verification:

```
v2.4.8-webapp-timeline-kanban-readfirst
```

## Expected final status

- Timeline/Kanban read-first readiness: **GO_WITH_WARNINGS** until operator UAT.
- Production readiness: **NOT YET**.
- Next: Phase 92 — WebApp Runtime Health / Report Viewer Pages.
