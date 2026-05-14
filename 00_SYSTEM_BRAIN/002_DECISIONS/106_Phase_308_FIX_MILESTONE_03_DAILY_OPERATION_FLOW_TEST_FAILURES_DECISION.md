# DECISION — 106 Phase 308 (Fix M03 test failures)

**Date:** 2026-05-14  
**Status:** Accepted  

## Decision

1. **Repair `tagStem`**: use **`MILESTONE_03_DAILY_OPERATION_FLOW`** only; numeric prefix remains sole responsibility of Drive exporter (`{NNN}_`).

2. **Stable test contract for nav**: assert presence of canonical route via **`data-route`** first, then encoded `encodeURIComponent(path)`, then raw substring — matching real `/exec?route=` links.

3. **No relaxation of REPORT_ENVELOPE**: envelope stays strict; passing is achieved by fixing underlying checks.

## Rationale

- Duplicate `105_105_` was configuration error, not exporter bug.  
- Tests must align with Phase 96.1 URL encoding to avoid false FAIL on otherwise correct UI.
