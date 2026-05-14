# AI Handoff — Phase 611 (M06 safe-disabled + UI marker preflight)

## What shipped in repo

1. **`998Y`** — `__preflightState` on `CbvStaffWorkboard_getModel_` / `CbvStaffWorkboard_renderPage_`; hidden `cbv-workboard-safe-disabled` on every task card plus `CbvStaffWorkboard__bodyInnerMarkerFallback_()` for no-card states; query-param probe attribute when state is `QUERY_PARAM_ROUTE`.
2. **`999A`** — reusable preflight helpers; `runContract_` runs renderer per state and unions missing markers.
3. **`998Z`** — `CBV_TCS_M06_WORKBOARD_UI_MARKERS` (16); `UI_MARKER_PREFLIGHT_RUNTIME` + `WORKBOARD_MARKER_PREFLIGHT`; existing marker checks derive slices from the same array.
4. **`.clasp.json`** — `999A` inserted before `998Z`.

## What you must do in GAS

1. `clasp push` (or deploy pipeline) so Apps Script loads new file order and `999A`.
2. **🧪 CBV Test Console** → **Run Milestone 06 Staff Workboard Production MVP Test**.
3. Confirm Drive folder `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG` receives bundle **`113_MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP_*`** with six files, `envelopeOk: true`, status **GO** or **GO_WITH_WARNINGS**.

## Tag policy

Do **not** tag until `113_*` bundle meets GO / GO_WITH_WARNINGS and `envelopeOk: true` per phase brief.

## If preflight still fails

Inspect `WORKBOARD_MARKER_PREFLIGHT.detail.missingMarkers` per state; ensure `WEBAPP_STAFF_WORKBOARD.html` template still evaluates (HtmlService) and `998Y` `bodyInner` includes all 16 class tokens in every state.
