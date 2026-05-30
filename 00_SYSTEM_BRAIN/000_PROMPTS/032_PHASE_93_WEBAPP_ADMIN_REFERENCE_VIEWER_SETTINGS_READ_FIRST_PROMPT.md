# PHASE 93 — WebApp Admin Reference Viewer / Settings Read-First (Prompt)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

> Snapshot of the AI handoff prompt used to drive Phase 93. Captured into `00_SYSTEM_BRAIN/000_PROMPTS/` per CBV Operational Ecosystem Standard V1.

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

## Phase 92 status

- `/runtime/health` and `/reports` are read-first (Observability Layer = GO_WITH_WARNINGS).
- `CBV_TEST_REPORTS` missing is acceptable (warning only).
- No auto-heal. No edit/delete report. No production claim.
- Suggested pilot tag: `v2.4.9-webapp-observability`.

## Phase 93 theme

Operational Governance Layer (read-first).

## Mission

Promote `/admin/reference` from placeholder to a real read-first governance page exposing:

- reference registry (sheet presence + row counts)
- enum dictionary summary
- user / role / team directory summary
- feature flag summary
- system registry summary
- UI contract summary (Phase 85)
- route registry summary (Phase 89)
- AppSheet / WebApp ownership settings

## In scope

- Admin Reference Viewer read-first.
- Settings / registry summaries read-first.
- Warnings when sheets/config are missing.
- CBV_TCS_V1 Test Console.

## Out of scope

- Editing settings, creating/updating users, toggling feature flags, permission changes.
- Secrets / tokens / API keys / private keys exposure.
- ENV-A, AI runtime, queue intelligence, production certification.

## Files to create

Runtime:

1. `05_GAS_RUNTIME/997_WEBAPP_ADMIN_REFERENCE_DATA.js`
2. `05_GAS_RUNTIME/998_WEBAPP_ADMIN_REFERENCE_RENDERER.js`
3. `05_GAS_RUNTIME/998A_WEBAPP_ADMIN_REFERENCE_TEST_CONSOLE.js`

HTML:

4. `05_GAS_RUNTIME/html/WEBAPP_ADMIN_REFERENCE_VIEWER.html`
5. `05_GAS_RUNTIME/html/WEBAPP_ADMIN_REFERENCE_COMPONENTS.html`

Docs:

6. `docs/webapp/PHASE_93_WEBAPP_ADMIN_REFERENCE_VIEWER_SETTINGS_READ_FIRST.md`
7. `docs/webapp/WEBAPP_ADMIN_REFERENCE_DATA_BINDING.md`
8. `docs/webapp/WEBAPP_ADMIN_REFERENCE_UAT_CHECKLIST.md`
9. `docs/webapp/WEBAPP_GOVERNANCE_LAYER_OVERVIEW.md`

Brain:

10. `00_SYSTEM_BRAIN/000_REPORTS/032_PHASE_93_WEBAPP_ADMIN_REFERENCE_VIEWER_SETTINGS_READ_FIRST_REPORT.md`
11. `00_SYSTEM_BRAIN/001_HANDOFF/032_PHASE_93_WEBAPP_ADMIN_REFERENCE_VIEWER_SETTINGS_READ_FIRST_HANDOFF.md`

## Updates

- `.clasp.json` filePushOrder: insert `997_`, `998_`, `998A_` after Phase 92 files and before `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` (keep last).
- `05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js`: route `/admin/reference` to Phase 93 renderer; placeholder fallback retained.
- `05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js`: dispatch `/admin/reference` to the new placeholder dispatcher.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js`: submenu `Phase 93 — Admin Reference` under `🧪 CBV Test Console`.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js`: Phase 93 wrappers.
- `05_GAS_RUNTIME/CLASP_PUSH_ORDER.md`: Phase 93 rationale.
- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md`: Phase 93 section.

## Data requirements

`997_WEBAPP_ADMIN_REFERENCE_DATA.js` exposes:

- `CbvWebAppAdminRef_getGovernanceSummary()` — sheet presence + row counts + totals + warnings.
- `CbvWebAppAdminRef_getEnumSummary(options)` — grouped enum dictionary view (no sensitive fields).
- `CbvWebAppAdminRef_getUserRoleSummary(options)` — users/roles/teams with masked emails.
- `CbvWebAppAdminRef_getFeatureFlagSummary(options)` — count enabled/disabled.
- `CbvWebAppAdminRef_getSystemRegistrySummary(options)` — registries grouped by module.
- `CbvWebAppAdminRef_getUiContractSummary(options)` — uses `CbvUiContract_getAll()` if available.
- `CbvWebAppAdminRef_getRouteRegistrySummary()` — uses `CbvWebAppWorkspace_getRouteRegistry()` / `CbvWebAppWorkspace_routeRegistry()` if available.
- `CbvWebAppAdminRef_validate()` — function presence + sheet probe + Phase-93-scoped mutation probe + secrets scan.

Read-first envelope `{ ok, data, warnings, errors, checkedAt }`. Missing sheet → warning only.

## Security / privacy rules

Never render secrets / tokens / API keys / private keys / raw Script Properties.  
If a sheet column name matches the secret pattern (`SECRET`, `TOKEN`, `API_KEY`, `APIKEY`, `PRIVATE_KEY`, `PASSWORD`, `CLIENT_SECRET`, `WEBHOOK_SECRET`, `BEARER`) the value is masked — only the column name + a warning is surfaced.

## Rendering requirements

`998_WEBAPP_ADMIN_REFERENCE_RENDERER.js`:

- `CbvWebAppAdminRef_renderReferenceViewer()`
- `CbvWebAppAdminRef_renderGovernanceSummary_()`
- `CbvWebAppAdminRef_renderEnumSummary_()`
- `CbvWebAppAdminRef_renderUserRoleSummary_()`
- `CbvWebAppAdminRef_renderFeatureFlagSummary_()`
- `CbvWebAppAdminRef_renderSystemRegistrySummary_()`
- `CbvWebAppAdminRef_renderUiContractSummary_()`
- `CbvWebAppAdminRef_renderRouteRegistrySummary_()`
- `CbvWebAppAdminRef_renderState_(state)` (states: `empty | warning | error | partial | ready`)

No edit / toggle / delete buttons. Safety footer preserved.

## Test Console (CBV_TCS_V1)

`998A_WEBAPP_ADMIN_REFERENCE_TEST_CONSOLE.js`:

- `CbvWebAppAdminRef_TestConsole_run()`
- `CbvWebAppAdminRef_TestConsole_showGovernanceSummary()`
- `CbvWebAppAdminRef_TestConsole_showEnumSummary()`
- `CbvWebAppAdminRef_TestConsole_showUserRoleSummary()`
- `CbvWebAppAdminRef_TestConsole_showUiContractSummary()`
- `CbvWebAppAdminRef_TestConsole_showRouteRegistrySummary()`
- `CbvWebAppAdminRef_TestConsole_showHandoffPrompt()`
- `CbvWebAppAdminRef_TestConsole_copyLatestReport()`

Health check validates data + renderer presence, route bridge for `/admin/reference`, sheet probes (warning-only on missing), Phase 93-scoped mutation probe + secrets probe, no edit/toggle/delete recommendation, no auto assign / auto resolve / auto escalate / production claim, `999_*` dispatcher remains last in `filePushOrder`, envelope OK.

## Local tests

```
git status --short
node --check 05_GAS_RUNTIME/997_WEBAPP_ADMIN_REFERENCE_DATA.js
node --check 05_GAS_RUNTIME/998_WEBAPP_ADMIN_REFERENCE_RENDERER.js
node --check 05_GAS_RUNTIME/998A_WEBAPP_ADMIN_REFERENCE_TEST_CONSOLE.js
node --check 05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js
node --check 05_GAS_RUNTIME/999_WEBAPP_DOGET_DISPATCHER_FINAL.js
node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js
node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js
node -e "JSON.parse(require('fs').readFileSync('06_DATABASE/schema_manifest.json','utf8'))"
```

Forbidden-phrase scan (only allowed as prohibitions/warnings/masking rules, never as recommendations / exposed values): `auto assign`, `auto resolve`, `auto escalate`, `production ready`, `edit settings`, `toggle feature`, `delete user`, `token`, `api key`, `secret`.

## Git

```
git add .clasp.json 05_GAS_RUNTIME/997_*.js 05_GAS_RUNTIME/998_*.js 05_GAS_RUNTIME/998A_*.js \
  05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js \
  05_GAS_RUNTIME/html/WEBAPP_ADMIN_REFERENCE_VIEWER.html \
  05_GAS_RUNTIME/html/WEBAPP_ADMIN_REFERENCE_COMPONENTS.html \
  05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js 05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js \
  05_GAS_RUNTIME/CLASP_PUSH_ORDER.md \
  docs/webapp docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md \
  00_SYSTEM_BRAIN/000_PROMPTS/032_*.md \
  00_SYSTEM_BRAIN/000_REPORTS/032_*.md \
  00_SYSTEM_BRAIN/001_HANDOFF/032_*.md
git commit -m "feat(webapp): add phase 93 admin reference viewer"
git push origin phase/from-v2.4.1-TASK-FIN
clasp push --force
```

## Tagging

Do NOT tag production. Optional pilot tag after UAT: `v2.4.10-webapp-admin-reference`.

## Expected final status

- Admin Reference readiness: **GO_WITH_WARNINGS** until UAT.
- Production readiness: **NOT YET**.
- Next: Phase 94 — WebApp UI Foundation Freeze / UAT Hardening.
