# 032 — Phase 93 WebApp Admin Reference Viewer / Settings Read-First — Handoff

For: the next AI or engineer continuing the WebApp track.

---

## Phase 93 scope

- `/admin/reference` is now a **read-first** Operational Governance Layer page.
- It surfaces governance summary + enum / user-role / feature flag / system registry / UI contract / route registry summaries.
- All write paths are explicitly forbidden in this namespace and verified by the Phase 93 mutation validator.

## Routes affected

| Route | Renderer | Fallback |
|-------|----------|----------|
| `/admin/reference` | `CbvWebAppAdminRef_renderReferenceViewer()` | `CbvWebAppPilotRenderer_renderAdminReferencePlaceholder()` placeholder |

## Data functions (`05_GAS_RUNTIME/997_WEBAPP_ADMIN_REFERENCE_DATA.js`)

- `CbvWebAppAdminRef_getGovernanceSummary()`
- `CbvWebAppAdminRef_getEnumSummary(options)`
- `CbvWebAppAdminRef_getUserRoleSummary(options)`
- `CbvWebAppAdminRef_getFeatureFlagSummary(options)`
- `CbvWebAppAdminRef_getSystemRegistrySummary(options)`
- `CbvWebAppAdminRef_getUiContractSummary(options)`
- `CbvWebAppAdminRef_getRouteRegistrySummary()`
- `CbvWebAppAdminRef_validate()`

All return the envelope `{ ok, data, warnings, errors, checkedAt }`.

## Renderer functions (`05_GAS_RUNTIME/998_WEBAPP_ADMIN_REFERENCE_RENDERER.js`)

- `CbvWebAppAdminRef_renderReferenceViewer()`
- `CbvWebAppAdminRef_renderGovernanceSummary_()`
- `CbvWebAppAdminRef_renderEnumSummary_()`
- `CbvWebAppAdminRef_renderUserRoleSummary_()`
- `CbvWebAppAdminRef_renderFeatureFlagSummary_()`
- `CbvWebAppAdminRef_renderSystemRegistrySummary_()`
- `CbvWebAppAdminRef_renderUiContractSummary_()`
- `CbvWebAppAdminRef_renderRouteRegistrySummary_()`
- `CbvWebAppAdminRef_renderState_(state)`

The renderer ships its own component CSS (`html/WEBAPP_ADMIN_REFERENCE_COMPONENTS.html`) and falls back to the Phase 92 components if the file isn’t loaded.

## Test Console (`05_GAS_RUNTIME/998A_WEBAPP_ADMIN_REFERENCE_TEST_CONSOLE.js`)

- Menu: `🧪 CBV Test Console → Phase 93 — Admin Reference`
- Actions: Run Admin Reference Health Check · Show Governance Summary · Show Enum Summary · Show User/Role Summary · Show UI Contract Summary · Show Route Registry Summary · Show AI Handoff Prompt · Copy Latest Report.
- Returns the full CBV_TCS_V1 envelope with `phase = PHASE_93_WEBAPP_ADMIN_REFERENCE_VIEWER_SETTINGS_READ_FIRST` and `contractVersion = CBV_TCS_V1`.

## Known limitations

- Some reference sheets may not exist on every tenant (e.g., `FEATURE_FLAG`, `SYSTEM_REGISTRY`). They surface as warnings, never errors.
- `CbvUiContract_getAll()` returns only rows where `IS_ENABLED` is truthy; the summary count therefore reflects enabled contracts.
- The route registry summary depends on `CbvWebAppWorkspace_routeRegistry()` (Phase 89). If that function is missing, the section emits a warning only.
- The UI contract sample is capped at 50 rows; the user/role users sample at 25.
- The validator only audits names in the **global** scope at probe time. Functions added inside closures will not appear; this is acceptable because the standard is for Phase 93 namespace functions to be exposed globally and follow the `CbvWebAppAdminRef_*` prefix.

## No mutation rule (Phase 93)

- The data layer scans every function whose name starts with `CbvWebAppAdminRef_` and whose action begins with one of: `set`, `update`, `create`, `delete`, `save`, `mutate`, `assign`, `escalate`, `resolve`, `complete`, `toggle`, `enable`, `disable`, `grant`, `revoke`, `provision`, `deprovision`, `edit`, `reset`, `rotate`.
- An explicit `mutationAllowlist` lists the legitimate `_get*Summary`, `_render*`, `_validate`, plus the renderer state mapper and the test-console namespace (`CbvWebAppAdminRef_TestConsole_*`).
- A regex allow-list also matches `*State_$`, `^CbvWebAppAdminRef__` (private helpers), `^CbvWebAppAdminRef_TestConsole_`, `^CbvWebAppAdminRef_render`.
- Result is surfaced as `data.noMutationExposed` and `data.mutationProbe`, consumed by the `NO_WRITE_MUTATION` check in the Test Console.

If you add a new Phase 93 helper that uses one of the forbidden verbs (legitimately or not), add it to the `mutationAllowlist` explicitly; never widen the regex.

## Masking / secrets rule

- Secret patterns: `SECRET`, `TOKEN`, `APIKEY`, `API_KEY`, `PRIVATE_KEY`, `PASSWORD`, `PASS_HASH`, `CLIENT_SECRET`, `WEBHOOK_SECRET`, `BEARER`, `OAUTH_TOKEN`.
- If a sheet header matches any pattern, the data layer:
  1. records the column name in `data.secretColumns`;
  2. emits a top-level warning;
  3. **never** copies the value into the response.
- Emails are masked via `CbvWebAppAdminRef__maskEmail_()` whenever surfaced.
- The renderer does **not** echo arbitrary row JSON; every per-section adapter selects a fixed field set, eliminating accidental exposure.

If you add a section, follow the same pattern: explicit field whitelist in the data layer, no `JSON.stringify(row)` of raw sheet rows.

## Recommended next phase

**Phase 94 — WebApp UI Foundation Freeze / UAT Hardening.**

Focus areas for Phase 94:

1. Freeze the navigation contract + layout shell across all pilot pages.
2. Standardize state mapping (`{ empty | warning | error | partial | ready }`) under a single helper used by Phase 90/91/92/93 renderers.
3. UAT Hardening: cross-tenant scenario tests, missing-sheet drills, secret-column synthetic tests.
4. Lock down the read-first contract: any future write surface must live outside the WebApp namespace.

Until Phase 94 ships, do **not** claim production readiness for `/admin/reference`. Pilot tag `v2.4.10-webapp-admin-reference` is permitted after UAT sign-off.

## Safety summary (must persist in future phases)

- Read-first only.
- No edit / toggle / delete / permission change / feature flag toggle.
- Secrets / tokens / api keys / private keys / passwords masked.
- Missing reference sheets are WARNINGS, never auto-created.
- No auto assign / auto resolve / auto escalate.
- No production claim.
- `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` is the absolute last file in `.clasp.json` filePushOrder.
