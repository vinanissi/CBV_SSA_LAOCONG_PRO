# PHASE_DSR_02_CONNECTION_CHECK — Test Evidence

**Date:** 2026-06-01  
**Environment:** Repo static analysis

---

## Static verification

| Test name | Expected result | Actual result | Status | Notes |
|-----------|-----------------|---------------|--------|-------|
| T01 — Foundation reuse | Calls `cbvDsrEnsureFoundationSheets_` / bootstrap if missing | Present in `cbvDsrConnectionCheck` | PASS | |
| T02 — Config read | `cbvDsrReadConfig_` reads SYNC_CONFIG | Implemented | PASS | |
| T03 — Missing config | Returns `NEEDS_CONFIG` | Branch in `cbvDsrConnectionCheck` | PASS | |
| T04 — Invalid ID format | Errors in validation | `cbvDsrIsValidSpreadsheetId_` | PASS | |
| T05 — SOURCE_ERROR path | Source fail, dest ok | Result assignment logic | PASS | |
| T06 — DESTINATION_ERROR path | Dest fail, source ok | Result assignment logic | PASS | |
| T07 — CONNECTED path | Both open + inspect | Both ok → CONNECTED | PASS | |
| T08 — Header preview limit | Max 20 columns | `CBV_DSR_HEADER_PREVIEW_MAX_COLS = 20` | PASS | |
| T09 — SYNC_LOG append | `cbvDsrAppendLog_` on check | `cbvDsrWriteConnectionReport_` | PASS | |
| T10 — SYNC_AUDIT append | Audit row | `CONNECTION_CHECK` audit type | PASS | |
| T11 — SYNC_REPORT append | Report row | `reportJson: payload` | PASS | |
| T12 — Dashboard update | Label-based column B only | `cbvDsrUpdateDashboardConnectionStatus_` | PASS | |
| T13 — No sync | No copyTo / row copy between SS | Grep: no `copyTo` in connection file | PASS | |
| T14 — No backup/trigger | No insertSheet on remote / newTrigger | Grep: no matches | PASS | |
| T15 — No remote writes | openById read-only inspect | No setValues on remote ss | PASS | |
| T16 — Menu item 4 | `menuCbvDsrConnectionCheck` | In menu file | PASS | |

---

## Live tests (operator)

| Test name | Expected result | Actual result | Status |
|-----------|-----------------|---------------|--------|
| L01 — NEEDS_CONFIG with empty IDs | NEEDS_CONFIG + log rows | PENDING | After deploy |
| L02 — CONNECTED with valid IDs | CONNECTED + sheet summaries | PENDING | After deploy |
| L03 — Permission denied | SOURCE_ERROR or DESTINATION_ERROR | PENDING | |

---

## Suite status

**GO_WITH_WARNINGS** — 16/16 static PASS; live tests PENDING.
