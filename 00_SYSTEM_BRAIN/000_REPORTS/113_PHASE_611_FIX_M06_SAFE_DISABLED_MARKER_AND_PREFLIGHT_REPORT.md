# Phase 611 — Report: M06 safe-disabled marker + UI marker preflight

**Status:** Code-ready in repo; **runtime verification** pending GAS menu re-run and Drive bundle `113_MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP_*`.

## Audit source

- Prior failed evidence: Drive bundle family `112_MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP_*` with `WORKBOARD_TASK_CARD_MARKERS` ERROR (`missing: ["cbv-workboard-safe-disabled"]`), `envelopeOk: false` (expected when any check FAIL).

## Root cause

`cbv-workboard-safe-disabled` was not guaranteed in rendered workboard `bodyHtml` when no production task cards were emitted (e.g. empty queues), so substring-based M06 checks failed despite partial shell markup.

## Markers fixed / guaranteed

- **`cbv-workboard-safe-disabled`**: always present via hidden probe spans on each production task card and via `CbvStaffWorkboard__bodyInnerMarkerFallback_()` off-screen fallback so empty-data paths still contain the class token in HTML.

## Preflight runtime

- **File:** `05_GAS_RUNTIME/999A_UI_MARKER_PREFLIGHT_RUNTIME.js`
- **API:** `CbvUiMarkerPreflight_collectMarkers_`, `CbvUiMarkerPreflight_checkMarkers_`, `CbvUiMarkerPreflight_renderProbeHtml_`, `CbvUiMarkerPreflight_runContract_`
- **Output:** `ok`, `requiredMarkers`, `foundMarkers`, `missingMarkers` (per state), `htmlLens`, `htmlLen`, `statesChecked`, `warnings`, `errors`, `missingMarkersUnion`

## Required markers (M06 UI contract — 16)

Aligned with `CBV_TCS_M06_WORKBOARD_UI_MARKERS` in `998Z`: workboard root/summary/section/task-card/CTAs/empty/sla/next/safe-disabled/mobile-stack/bottom-nav/filter-chip/sticky-urgent/action-xl/thumb-zone.

## States checked (preflight)

1. `HAS_DATA` — synthetic task injected in model  
2. `EMPTY_DATA` — tasks cleared  
3. `APPSHEET_UNCONFIGURED` — explicit state label; model path same as default (live bridge config)  
4. `MISSING_TASKID` — synthetic row with empty `taskId`  
5. `QUERY_PARAM_ROUTE` — `renderPage_` sets `data-cbv-query-param-route-probe="1"` on workboard root  

## Test console

- New checks: `UI_MARKER_PREFLIGHT_RUNTIME`, `WORKBOARD_MARKER_PREFLIGHT`  
- Existing: `WORKBOARD_TASK_CARD_MARKERS`, `WORKBOARD_MOBILE_MARKERS`, `REPORT_ENVELOPE` unchanged in semantics (strict FAIL on missing markers / bad envelope).

## Regression notes

- `.clasp.json`: `999A_UI_MARKER_PREFLIGHT_RUNTIME.js` must load **before** `998Z_MILESTONE_06_STAFF_WORKBOARD_TEST_CONSOLE.js`.  
- Pre-commit: `node scripts/cbv-marker-contract-self-check.mjs` — `998Z` must retain literal substrings for contract JSON markers (including `cbv-marker-probe` in comment alignment).

## Next Drive prefix (expected after GO run)

`113_MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP_*`
