# Phase 611 — FIX M06 WORKBOARD SAFE-DISABLED MARKER + CBV UI MARKER CONTRACT PREFLIGHT V1

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Append-only prompt record.** Source: user phase brief (2026-05-14).

## Target

1. Fix `WORKBOARD_TASK_CARD_MARKERS` / missing `cbv-workboard-safe-disabled` in M06 HTML probe (runtime-first in `998Y`).
2. Add `999A_UI_MARKER_PREFLIGHT_RUNTIME.js` with multi-state contract (`HAS_DATA`, `EMPTY_DATA`, `APPSHEET_UNCONFIGURED`, `MISSING_TASKID`, `QUERY_PARAM_ROUTE`).
3. Integrate into `998Z` checks: `UI_MARKER_PREFLIGHT_RUNTIME`, `WORKBOARD_MARKER_PREFLIGHT`; keep `REPORT_ENVELOPE` strict.
4. Required M06 UI markers (16): workboard shell + card + mobile markers per TASK E list in phase brief.
5. Local docs `113_*` (report, handoff, decision); Drive evidence prefix `113_MILESTONE_06_STAFF_WORKBOARD_PRODUCTION_MVP_*` after GAS re-run.
6. Commit message: `fix: add ui marker preflight runtime for m06`; tag only after Drive GO / GO_WITH_WARNINGS with `envelopeOk: true`.

## Implementation refs (repo)

- `05_GAS_RUNTIME/998Y_WEBAPP_STAFF_WORKBOARD_PRODUCTION.js` — `__preflightState`, `CbvStaffWorkboard__bodyInnerMarkerFallback_`, per-card `cbv-workboard-safe-disabled` placeholders.
- `05_GAS_RUNTIME/999A_UI_MARKER_PREFLIGHT_RUNTIME.js` — `CbvUiMarkerPreflight_*` helpers.
- `05_GAS_RUNTIME/998Z_MILESTONE_06_STAFF_WORKBOARD_TEST_CONSOLE.js` — `CBV_TCS_M06_WORKBOARD_UI_MARKERS`, preflight check.
- `.clasp.json` — load order `999A` before `998Z`.
