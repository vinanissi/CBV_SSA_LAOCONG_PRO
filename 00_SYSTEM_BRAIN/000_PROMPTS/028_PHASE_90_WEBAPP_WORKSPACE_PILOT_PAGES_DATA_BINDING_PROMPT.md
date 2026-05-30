# PHASE 90 — WEBAPP WORKSPACE PILOT PAGES / DATA BINDING — PROMPT

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

## Metadata

- **Repo**: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`
- **Branch**: `phase/from-v2.4.1-TASK-FIN`
- **Standards**: CBV Operational Ecosystem Standard V1; CBV Test Console Standard `CBV_TCS_V1`

## Architecture

- Sheets/GAS = operational database + runtime
- WebApp = operational workspace
- AppSheet = lightweight operator shell

## Mission

Upgrade Phase 89 skeleton into **pilot pages with clearer read-first data binding**.

Constraints:

- Read-first only (no write mutation)
- No auto assign / resolve / escalate
- No AI runtime, no ENV-A, no queue intelligence
- No production claim

## Deliverables

Runtime:

- `05_GAS_RUNTIME/97_WEBAPP_WORKSPACE_PILOT_DATA.js`
- `05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js`
- `05_GAS_RUNTIME/990_WEBAPP_WORKSPACE_PILOT_TEST_CONSOLE.js`

HTML:

- `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_COMPONENTS.html`
- `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_HOME_PILOT.html`
- `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_QUEUE_PILOT.html`
- `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_SLA_PILOT.html`

Docs:

- `docs/webapp/PHASE_90_WEBAPP_WORKSPACE_PILOT_PAGES_DATA_BINDING.md`
- `docs/webapp/WEBAPP_HOME_WORKSPACE_DATA_BINDING.md`
- `docs/webapp/WEBAPP_QUEUE_DATA_BINDING.md`
- `docs/webapp/WEBAPP_SLA_DASHBOARD_DATA_BINDING.md`
- `docs/webapp/WEBAPP_FE_STATE_STANDARD.md`
- `docs/webapp/WEBAPP_PILOT_UAT_CHECKLIST.md`

Brain:

- `00_SYSTEM_BRAIN/000_REPORTS/028_PHASE_90_WEBAPP_WORKSPACE_PILOT_PAGES_DATA_BINDING_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/028_PHASE_90_WEBAPP_WORKSPACE_PILOT_PAGES_DATA_BINDING_HANDOFF.md`

Wiring updates:

- `.clasp.json`: add `97_`, `98_`, `990_` after Phase 89 files and **before** `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` (keep `999` absolute last)
- Integrate pilot renderer into `05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js` with safe fallback
- Add 🧪 menu: Phase 90 — WebApp Pilot Pages + wrappers

