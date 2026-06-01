# PHASE_DSR_05_MANUAL_SYNC_APPLY — Handoff

**To:** `PHASE_DSR_06_RUNTIME_REPORT`  
**From:** `PHASE_DSR_05_MANUAL_SYNC_APPLY`  
**Date:** 2026-06-01  

---

## What changed

1. `84_DATA_SYNC_RUNTIME_MANUAL_SYNC_APPLY.js`  
2. `SYNC_GUARD_CONTRACT.md`  
3. Menu **7. Manual Sync Apply SOURCE → DEST** (YES confirm)  

---

## How to run

1. Deploy GAS including manual sync file.  
2. `SYNC_CONFIG`: set IDs, `SYNC_MODE`, `SAFETY_MODE`, run menus **4**, **5**, **6**.  
3. Set `LAST_DIFF_RESULT` = `READY_FOR_SYNC` via diff menu.  
4. Set **`SYNC_ALLOWED`** = **`TRUE`** (manual).  
5. Menu **7** → confirm YES.  

---

## Guard conditions

| Guard | Requirement |
|-------|-------------|
| SYNC_ALLOWED | TRUE |
| Backup | BACKUP_CREATED in index |
| Diff | LAST_DIFF_RESULT = READY_FOR_SYNC |
| Modes | ONE_WAY… / BACKUP_BEFORE_WRITE |

---

## How to verify

- Guards fail → no DESTINATION clear; `GUARD_BLOCKED` in SYNC_REPORT  
- Success → SOURCE values on DESTINATION tabs; SOURCE unchanged  
- `SYNC_LOG` / `SYNC_AUDIT` append-only  

---

## What not to do

- Do not set SYNC_ALLOWED TRUE without backup + diff.  
- Do not install triggers.  
- Do not expect formatting/formula copy.  

---

## Next phase

**`PHASE_DSR_06_RUNTIME_REPORT`**
