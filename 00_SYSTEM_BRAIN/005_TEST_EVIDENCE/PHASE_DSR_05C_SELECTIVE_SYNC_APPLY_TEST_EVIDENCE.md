# PHASE_DSR_05C_SELECTIVE_SYNC_APPLY — Test Evidence

**Date:** 2026-06-01 | **Method:** Static + test-console logic (no live sync)

| # | Test | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 1 | SELECTIVE_SYNC_REQUIRED in contract | TRUE | PASS | SYNC_GUARD_CONTRACT |
| 2 | ALLOW_SYNC_ALL_WHITELIST FALSE | FALSE | PASS | Config seed |
| 3 | SYNC_SELECTION sheet spec | Exists | PASS | Foundation headers |
| 4 | SYNC_SELECTION 12 headers | Match | PASS | Test console |
| 5 | Whitelist no selection | Not synced | PASS | validate permission |
| 6 | Empty OPERATOR_DECISION | Not synced | PASS | Logic test |
| 7 | SKIP | Not synced | PASS | Logic test |
| 8 | HOLD | Not synced | PASS | Logic test |
| 9 | BLOCK | Not synced | PASS | Logic test |
| 10 | APPROVE not READY | Not synced | PASS | Logic test |
| 11 | APPROVE + READY | Eligible | PASS | Logic test |
| 12 | Forbidden approved | Blocked | PASS | SYNC_LOG pattern |
| 13 | Non-whitelist approved | Blocked | PASS | RANDOM sheet |
| 14 | Latest row wins | Code path | PASS | readLatestSyncSelections |
| 15 | Build plan no business write | Append only | PASS | Code review |
| 16–20 | Backup/diff/SYNC_ALLOWED/whitelist/forbidden | Preserved | PASS | Guard chain |
| 21 | Legacy menu 7 blocked | SELECTIVE_SYNC_REQUIRED | PASS | manual sync early return |
| 22 | DEST-only preserved | No delete | PASS | Code review |
| 23 | SOURCE read-only | openById read | PASS | Code review |
| 24–25 | Append-only log/audit | Unchanged | PASS | |
| 26 | Report selection metrics | selectionSummary | PASS | report.js |
| 27 | No trigger | Static | PASS | |
| 28 | No automation | Static | PASS | |
| 29 | Bundle <=10 files | ZIP | PASS | phase_tmp |
