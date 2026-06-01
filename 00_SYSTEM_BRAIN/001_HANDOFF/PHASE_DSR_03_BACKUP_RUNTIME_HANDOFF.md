# PHASE_DSR_03_BACKUP_RUNTIME — Handoff

**To:** `PHASE_DSR_04_DIFF_PREVIEW`  
**From:** `PHASE_DSR_03_BACKUP_RUNTIME`  
**Date:** 2026-06-01  
**Report:** `00_SYSTEM_BRAIN/000_REPORTS/PHASE_DSR_03_BACKUP_RUNTIME_REPORT.md`  
**ADR:** `00_SYSTEM_BRAIN/002_DECISIONS/ADR_DSR_BACKUP_RUNTIME_ADDENDUM.md`

---

## What changed

1. `84_DATA_SYNC_RUNTIME_BACKUP.js` — destination backup runtime  
2. Menu **5. Backup DESTINATION**  
3. ADR addendum + authority update  

---

## How to run

1. Deploy GAS including `84_DATA_SYNC_RUNTIME_BACKUP.js`.  
2. Set `DESTINATION_SPREADSHEET_ID` in `SYNC_CONFIG` (and recommended `BACKUP_NAME_PREFIX=BAK`).  
3. **🚀 CBV Runtime** → **🔁 Data Sync Runtime** → **5. Backup DESTINATION**  

---

## How to verify

| Check | Expected |
|-------|----------|
| New tabs on DESTINATION | `BAK_<sheet>_<yyyyMMdd_HHmmss>` |
| Original sheets | Unchanged (not deleted) |
| `SYNC_BACKUP_INDEX` | `BACKUP_CREATED` rows |
| SOURCE workbook | Not modified |
| No sync | No SOURCE→DEST business copy |

---

## What not to do

- Do not expect diff/sync from this menu.  
- Do not delete `BAK_*` sheets via this runtime (not implemented).  
- Do not install triggers.  

---

## Known warnings

- `NEEDS_CONFIG` when destination ID empty.  
- Runtime sheets skipped unless `BACKUP_INCLUDE_RUNTIME_SHEETS=TRUE`.  

---

## Next phase recommendation

**`PHASE_DSR_04_DIFF_PREVIEW`**
