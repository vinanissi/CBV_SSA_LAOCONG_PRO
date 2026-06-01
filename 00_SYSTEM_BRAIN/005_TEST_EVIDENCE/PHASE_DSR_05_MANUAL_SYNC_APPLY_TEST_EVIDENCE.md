# PHASE_DSR_05_MANUAL_SYNC_APPLY — Test Evidence

**Date:** 2026-06-01

---

## Static verification

| # | Test | Status |
|---|------|--------|
| 1 | Foundation reuse | PASS |
| 2 | Config loaded | PASS |
| 3 | SYNC_ALLOWED seed FALSE | PASS |
| 4 | SYNC_ALLOWED=FALSE blocks | PASS — guard |
| 5 | Missing backup blocks | PASS — BACKUP_REQUIRED |
| 6 | Missing diff blocks | PASS — DIFF_REQUIRED |
| 7 | Diff not READY blocks | PASS |
| 8 | Invalid source blocks | PASS — CONFIG/GUARD |
| 9 | Invalid dest blocks | PASS |
| 10 | Runtime sheets excluded | PASS — `cbvDsrShouldIncludeSheetInSyncApply_` |
| 11 | BAK_ excluded | PASS |
| 12 | Dest-only preserved | PASS — no deleteSheet |
| 13 | Create dest sheet path | PASS — `insertSheet` |
| 14 | Clear after guards | PASS — apply after `ValidateSyncGuards` |
| 15 | Values only setValues | PASS |
| 16 | SYNC_LOG append | PASS |
| 17 | SYNC_AUDIT append | PASS |
| 18 | SYNC_REPORT append | PASS |
| 19 | Dashboard update | PASS |
| 20 | No trigger | PASS — grep |
| 21 | No SOURCE modify | PASS — read only on source |
| 22 | No clear before guards | PASS — guards before open write |
| 23 | PARTIAL_SYNC list | PASS — failedSheets array |
| 24 | nextStep in report | PASS |

---

## Live tests

| Test | Status |
|------|--------|
| L01 Full guarded sync | PENDING |
| L02 GUARD_BLOCKED | PENDING |

---

## Suite

**GO_WITH_WARNINGS** — 24/24 static PASS.
