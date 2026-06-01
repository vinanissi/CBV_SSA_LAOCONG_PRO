# PHASE_DSR_02_CONNECTION_CHECK — Handoff

**To:** `PHASE_DSR_03_BACKUP_RUNTIME`  
**From:** `PHASE_DSR_02_CONNECTION_CHECK`  
**Date:** 2026-06-01  
**Report:** `00_SYSTEM_BRAIN/000_REPORTS/PHASE_DSR_02_CONNECTION_CHECK_REPORT.md`  
**ADR:** `00_SYSTEM_BRAIN/002_DECISIONS/ADR_DSR_CONNECTION_CHECK_ADDENDUM.md`

---

## What changed

1. **`84_DATA_SYNC_RUNTIME_CONNECTION.js`** — connection check runtime
2. **Menu item 4** — Connection Check SOURCE/DEST
3. **ADR addendum** — read-only cross-SS policy
4. **Authority** — connection scope documented

---

## How to run

1. Deploy `05_GAS_RUNTIME` (include `84_DATA_SYNC_RUNTIME_CONNECTION.js`).
2. On DSR host sheet: Bootstrap (if needed) → fill `SYNC_CONFIG`:
   - `SOURCE_SPREADSHEET_ID`
   - `DESTINATION_SPREADSHEET_ID`
   - Recommended: `SYNC_MODE` = `ONE_WAY_SOURCE_TO_DESTINATION`
   - Recommended: `SAFETY_MODE` = `BACKUP_BEFORE_WRITE`
3. **🚀 CBV Runtime** → **🔁 Data Sync Runtime** → **4. Connection Check SOURCE/DEST**

---

## How to verify

| Check | Expected |
|-------|----------|
| Empty IDs | Result `NEEDS_CONFIG`; rows in SYNC_LOG / SYNC_REPORT |
| Valid IDs + access | Result `CONNECTED`; source/dest sheet lists in SYNC_REPORT JSON |
| Bad source ID | `SOURCE_ERROR` or `FAILED` |
| Bad dest ID | `DESTINATION_ERROR` |
| Dashboard | Runtime Status / Last Run labels updated |
| SOURCE/DEST books | No new sheets, no cell overwrites on business tabs |

---

## What not to do

- Do not expect data sync (not implemented).
- Do not run backup/diff/apply from this menu.
- Do not install triggers.

---

## Known warnings

- First run with empty IDs is **NEEDS_CONFIG** — not a code failure.
- Operator must authorize script access to both external spreadsheets.

---

## Next phase recommendation

**`PHASE_DSR_03_BACKUP_RUNTIME`**
