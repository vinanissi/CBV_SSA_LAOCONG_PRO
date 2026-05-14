# Report — Phase 96.1 — WebApp canonical route URL fix

**Date:** 2026-05-14  
**Phase ID:** `PHASE_96_1_WEBAPP_CANONICAL_ROUTE_URL_FIX`  
**Git:** `19230c0` on `phase/from-v2.4.1-TASK-FIN`

## Delivered

- `998H_WEBAPP_ROUTE_URL_HELPER.js` — `getBaseUrl`, `normalizeRoute`, `build`, `getRouteMap`, `getNavItemsVi`, `validate`; default macros `/exec` base; `CBV_WEBAPP_BASE_URL` override.
- `998I_WEBAPP_ROUTE_URL_TEST_CONSOLE.js` — `CbvWebAppRouteUrl_TestConsole_*`, envelope CBV_TCS_V1, storage key `CBV_WEBAPP_ROUTE_URL_TC_LAST_REPORT_JSON`.
- `.clasp.json` — `998H`, `998I` after `998G`, before `96_WEBAPP_DOGET_DISPATCHER.js`.
- `998F`, `91`, `94`, `98`, `998D`, `998G`, pilot + legacy home HTML updated to use canonical absolute URLs where applicable.
- Menu **Phase 96.1 — Route URL Fix** + wrappers `menuCbvTestConsoleWebAppRoute961_*`.
- Docs: `PHASE_96_1_*`, `WEBAPP_CANONICAL_ROUTE_URL_STANDARD.md`, `WEBAPP_ROUTE_LINK_AUDIT_CHECKLIST.md`; `WEBAPP_LINKS_AND_ROUTES_VI.md` refreshed; `HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` Phase 96.1 block; `CLASP_PUSH_ORDER.md` rationale.

## Constraints respected

- No new routes; frozen Phase 94 paths only.
- No WebApp write APIs; read-first posture unchanged.

## Verification notes

- Run `CbvWebAppRouteUrl_TestConsole_run()` from menu after `clasp push`.
- Manual click-test nav on deployed `/exec` URL.
