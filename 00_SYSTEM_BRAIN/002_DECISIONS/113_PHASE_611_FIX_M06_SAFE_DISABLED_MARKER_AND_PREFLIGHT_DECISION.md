# Decision — Phase 611: M06 marker contract + preflight runtime

**Date:** 2026-05-14  
**Scope:** Milestone 06 staff workboard production HTML markers and Test Console strictness.

## Decisions

1. **Runtime-first fix** — Address missing `cbv-workboard-safe-disabled` in real `998Y` HTML output (fallback block + per-card hidden spans), not by weakening tests or faking reports.
2. **Dedicated preflight module (`999A`)** — Centralize multi-state HTML substring contract checks so future phases can reuse the same pattern without duplicating state matrices in each milestone file.
3. **Probe states** — Use five explicit states (`HAS_DATA`, `EMPTY_DATA`, `APPSHEET_UNCONFIGURED`, `MISSING_TASKID`, `QUERY_PARAM_ROUTE`) where `APPSHEET_UNCONFIGURED` is an explicit label on the default model path (live Script Properties / bridge); no fake “disabled” UI when AppSheet is configured—only class-level placeholders allowed per OES/TCS rules.
4. **Strictness preserved** — `WORKBOARD_TASK_CARD_MARKERS`, `WORKBOARD_MOBILE_MARKERS`, and `REPORT_ENVELOPE` remain ERROR-level failures when violated; new preflight adds coverage, not noise downgrades.
5. **Clasp ordering** — `999A` must precede `998Z` so `CbvUiMarkerPreflight_runContract_` exists at parse time for the milestone test file.

## Non-decisions / out of scope

- Changing Drive folder ID or TCS envelope schema.  
- Tagging without fresh Drive evidence under the `113_*` prefix.
