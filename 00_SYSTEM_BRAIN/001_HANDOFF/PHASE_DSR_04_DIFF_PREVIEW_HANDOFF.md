# PHASE_DSR_04_DIFF_PREVIEW — Handoff

**To:** `PHASE_DSR_05_MANUAL_SYNC_APPLY`  
**From:** `PHASE_DSR_04_DIFF_PREVIEW`  
**Date:** 2026-06-01  
**Report:** `00_SYSTEM_BRAIN/000_REPORTS/PHASE_DSR_04_DIFF_PREVIEW_REPORT.md`  
**ADR:** `00_SYSTEM_BRAIN/002_DECISIONS/ADR_DSR_DIFF_PREVIEW_ADDENDUM.md`

---

## What changed

1. `84_DATA_SYNC_RUNTIME_DIFF_PREVIEW.js` — structure diff runtime  
2. Menu item **6. Diff Preview SOURCE ↔ DEST**  
3. `SYNC_PLAN` populated per compared sheet (append-only)  

---

## How to run

1. Deploy GAS including `84_DATA_SYNC_RUNTIME_DIFF_PREVIEW.js`.  
2. Set `SOURCE_SPREADSHEET_ID` and `DESTINATION_SPREADSHEET_ID` in `SYNC_CONFIG`.  
3. Run menu **4** (connection) then **6** (diff preview).  

---

## How to verify

| Check | Expected |
|-------|----------|
| `SYNC_PLAN` | New rows per sheet with `RUN_ID`, `STATUS`, `ACTION` |
| `SYNC_REPORT` | `READY_FOR_SYNC` or `REVIEW_REQUIRED` |
| Dashboard | Match/mismatch/review counts updated |
| SOURCE/DEST data | No cell overwrites; no new backup tabs |

---

## What not to do

- Do not use this menu for sync apply or backup.  
- Do not expect row-level data diff.  

---

## Known warnings

- `REVIEW_REQUIRED` when headers or dimensions differ.  
- `BAK_*` sheets excluded from comparison on DESTINATION.  

---

## Next phase recommendation

**`PHASE_DSR_05_MANUAL_SYNC_APPLY`**
