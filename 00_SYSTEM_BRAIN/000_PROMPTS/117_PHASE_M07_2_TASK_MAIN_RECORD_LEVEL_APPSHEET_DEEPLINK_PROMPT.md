# 117 — Phase M07.2 — TASK_MAIN record-level AppSheet deeplink

**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`

## Objective

Record-level AppSheet runtime for TASK_MAIN: Script Properties / runtime fallback → `CbvAppSheetBridge_resolveTaskRowKey_` → substitute `{{TASK_ROW_KEY}}` in official `/start/…` templates. No editor `template/appdef` URLs for operators. No hardcoded sample row id.

## Canonical Script Properties

- `CBV_APPSHEET_TASK_MAIN_URL` — list runtime (`/start/…`, `view=TASK_MAIN`)
- `CBV_APPSHEET_TASK_MAIN_DETAIL_URL_TEMPLATE` — must contain `{{TASK_ROW_KEY}}`, `TASK_MAIN_DETAIL_PRO`
- `CBV_APPSHEET_TASK_MAIN_FORM_URL_TEMPLATE` — must contain `{{TASK_ROW_KEY}}`, `TASK_MAIN_FORM_PRO`  
Legacy keys without `_TEMPLATE` still read if new keys empty.

## Implementation (this phase)

- `05_GAS_RUNTIME/998Y_WEBAPP_STAFF_WORKBOARD_PRODUCTION.js` — resolver, row key, URL builders, workboard card links
- `05_GAS_RUNTIME/999B_MILESTONE_07_APPSHEET_LIVE_BRIDGE.js` — ribbon copy, `list` deep link mode, health contract
- `05_GAS_RUNTIME/999C_MILESTONE_07_APPSHEET_LIVE_BRIDGE_TEST_CONSOLE.js` — M07.2 checks
- `05_GAS_RUNTIME/998Q_WEBAPP_STAFF_OPERATION_WORKSPACE.js` — `taskRowKey` on normalized task
- `05_GAS_RUNTIME/97_WEBAPP_WORKSPACE_PILOT_DATA.js` — optional `TASK_ROW_KEY`, `TASK_MAIN_ID`, `TASK_ID` columns on cards

## Verification

- `node scripts/cbv-marker-contract-self-check.mjs` — PASS
- GAS (NOT run in Cursor): M07 + M08 test consoles, Drive 6-file bundles, `envelopeOk=true`

## Full original prompt

See user message in Cursor thread **M07.2 TASK_MAIN RECORD-LEVEL APPSHEET DEEPLINK UPDATE** (2026-05-14) for complete acceptance criteria, marker list, and Drive folder id.
