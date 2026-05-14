# AI Handoff — Milestone 07 (AppSheet Live Bridge)

## What shipped (code)

- **`05_GAS_RUNTIME/999B_MILESTONE_07_APPSHEET_LIVE_BRIDGE.js`** — `CbvAppSheetLiveBridge_buildDeepLink_`, `CbvAppSheetLiveBridge_buildWebAppReturnUrl_`, `CbvAppSheetLiveBridge_renderWorkboardRibbon_`, `CbvAppSheetLiveBridge_runHealth_` (read-first; `cbvHandoff` + `cbvReturn` query params on AppSheet URLs when configured).
- **`05_GAS_RUNTIME/999C_MILESTONE_07_APPSHEET_LIVE_BRIDGE_TEST_CONSOLE.js`** — `CbvTcsMilestone07AppSheetLiveBridge_TestConsole_runFull` + copy helper; Drive bundle via existing `998L` / `998P` helpers.
- **Integration:** `998Y` workboard body injects ribbon; `998U` Focus + `998W` SOP pass `route` / `source` / `returnRoute`; HTML templates `WEBAPP_OPERATION_FOCUS_MODE.html`, `WEBAPP_GUIDED_SOP_RUNTIME.html` render `MODEL.m07BridgeHtml`.
- **Markers:** `WEBAPP_STAFF_WORKBOARD.html` probe extended; `CBV_WORKBOARD_MARKER_CONTRACT.json` + new `CBV_M07_APPSHEET_LIVE_BRIDGE_MARKER_CONTRACT.json`; `998Z` preflight marker list extended for M07 tokens.

## What you must verify (runtime)

- **GAS:** Run the new Test Console menu item; confirm Drive export and `envelopeOk` without ERROR/CRITICAL.
- **Script Properties:** `CBV_APPSHEET_*` keys (see `998Y`) — no real App ID in HTML.

## Constraints preserved

- No auto resolve / assign / escalate; no WebApp upload mutation; AppSheet remains target for evidence/feedback when configured.
