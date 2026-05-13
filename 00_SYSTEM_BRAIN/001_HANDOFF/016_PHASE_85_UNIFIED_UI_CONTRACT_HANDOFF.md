# Handoff — Phase 85 CBV Unified UI Contract

**Date:** 2026-05-13  
**Phase id:** `PHASE_85_UNIFIED_UI_CONTRACT`  
**Status:** IMPLEMENTATION_COMPLETE (runtime + docs + menus; execute GAS QA after `clasp push`)

## Delivered

- **Sheet manifest:** `CBV_UI_CONTRACT` in `90_BOOTSTRAP_SCHEMA.js`, `06_DATABASE/schema_manifest.json`, `CBV_CONFIG.SHEETS`, `90_BOOTSTRAP_AUDIT_SCHEMA.js` (`CBV_AUDIT_SCHEMA`).
- **Runtime:** `05_GAS_RUNTIME/84_UNIFIED_UI_CONTRACT_RUNTIME.js` — bootstrap (append-only seed by `SCREEN_CODE`), CRUD-style getters, validation (baseline codes, channel/type, `OPERATOR_*` for `HOME_ALERT_*`, forbidden prefixes, AppSheet expr hygiene), health envelope, pilot matrix, WebApp route map, AppSheet guide builder, audit append helper.
- **Test console:** `05_GAS_RUNTIME/85_UNIFIED_UI_CONTRACT_TEST_CONSOLE.js` — `CbvUiContract_TestConsole_run`, handoff prompt dialog, copy-report modal; menus in `90_BOOTSTRAP_MENU.js` + wrappers in `90_BOOTSTRAP_MENU_WRAPPERS.js`.
- **Clasp:** `.clasp.json` includes `84_*.js`, `85_*.js` after `83_OPERATIONAL_REFERENCE_RUNTIME.js`.
- **Docs:** `docs/ui-contract/` (overview, schema, role split, AppSheet binding, WebApp routes, pilot matrix).

## Invariants

- **Never** point new UI bindings at `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*` for operator-facing HOME_ALERT surfaces; use `OPERATOR_*` fields only.
- AppSheet stored expressions: no leading `=`; no `_THISUSER`.
- Ecosystem bans unchanged: no AppSheet Bot, no auto-escalation/assign/resolve from this layer.

## Next actions (human)

1. `clasp push` from repo root (`05_GAS_RUNTIME` as `rootDir`).
2. In Spreadsheet: **🧪 CBV Test Console → Phase 85 — UI Contract → Bootstrap**, then **Validate** / **Health Check**.
3. Optionally run `CbvUiContract_TestConsole_run()` in the script editor for full suite + `ADMIN_AUDIT_LOG` append.
4. Align AppSheet view names with `APPSHEET_VIEW` planner values (rename in AppSheet or adjust sheet rows—prefer updating AppSheet to match contract for pilot stability).

## AI follow-up prompt (short)

Use `CbvUiContract_TestConsole_showHandoffPrompt()` output or `CBV_UI_CONTRACT_HANDOFF_PROMPT` in `85_UNIFIED_UI_CONTRACT_TEST_CONSOLE.js`.
