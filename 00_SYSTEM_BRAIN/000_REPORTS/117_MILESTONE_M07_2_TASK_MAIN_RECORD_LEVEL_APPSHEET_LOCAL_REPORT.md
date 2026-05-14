# 117 — Milestone M07.2 — TASK_MAIN record-level AppSheet deeplink — Local report

**Date:** 2026-05-14  
**Environment:** Local repo only (GAS / Drive tests **NOT VERIFIED** in this session)

## Summary

Implemented M07.2: official `/start/` runtime URLs with `{{TASK_ROW_KEY}}` templates, `CbvAppSheetBridge_resolveTaskRowKey_`, `buildTaskMainUrl_` / `buildTaskMainDetailUrl_` / `buildTaskMainFormUrl_`, workboard card title + three AppSheet actions (`Mở chi tiết`, `Xử lý ngay`, `Mở AppSheet`), ribbon `list` mode and updated labels. Extended pilot + `normalizeTaskRow_` for optional TASK_MAIN row columns.

## Local verification

| Check | Result |
|-------|--------|
| `node scripts/cbv-marker-contract-self-check.mjs` | PASS (M06/M07/M08 marker contracts) |

## GAS / production

**Status:** NOT VERIFIED ON GAS — run M07 and M08 test consoles after `clasp push`; confirm Drive bundles and `envelopeOk=true` before declaring GO or tagging.

## Files touched

- `05_GAS_RUNTIME/998Y_WEBAPP_STAFF_WORKBOARD_PRODUCTION.js`
- `05_GAS_RUNTIME/999B_MILESTONE_07_APPSHEET_LIVE_BRIDGE.js`
- `05_GAS_RUNTIME/999C_MILESTONE_07_APPSHEET_LIVE_BRIDGE_TEST_CONSOLE.js`
- `05_GAS_RUNTIME/998Q_WEBAPP_STAFF_OPERATION_WORKSPACE.js`
- `05_GAS_RUNTIME/97_WEBAPP_WORKSPACE_PILOT_DATA.js`
