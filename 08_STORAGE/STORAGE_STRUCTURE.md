# STORAGE STRUCTURE

## Root
CBV_STORAGE/
- 01_HO_SO/
  - HTX/
  - XA_VIEN/
  - XE/
  - TAI_XE/
  - MISC/   (fallback when HO_SO_TYPE unknown)
- 02_TASK_ATTACHMENTS/
- 03_FINANCE_EVIDENCE/
- 99_ARCHIVE/

## Module-Based Paths

| Module | Base Path | Entity Subfolder |
|--------|-----------|------------------|
| HO_SO | CBV_STORAGE/01_HO_SO/{MASTER_CODE.CODE}/ | Folder segment = `MASTER_CODE.CODE` resolved from `HO_SO_MASTER.HO_SO_TYPE_ID` (not a text column on the sheet). Optional: {HO_SO_ID}/ |
| TASK | CBV_STORAGE/02_TASK_ATTACHMENTS/ | Optional: {TASK_ID}/ |
| FINANCE | CBV_STORAGE/03_FINANCE_EVIDENCE/ | Optional: {FINANCE_ID}/ |

## Path Logic

- **Static default:** Use base path only. Simple; no entity-specific subfolders.
- **Entity-based (optional):** Add subfolder per parent ID for organization. Use when volume grows.
- **GAS helpers:** `buildHoSoStoragePath(code, hoSoId)`, `buildHoSoStoragePathFromHoSoRow(row)`, `buildTaskStoragePath()`, `buildFinanceStoragePath()` — return recommended paths; do not create folders.

## Rules

- Files must go to correct module folder.
- File names: prefix with date or entity code when useful.
- Sheets store URL / DRIVE_FILE_ID only; no binary in Sheets.
- AppSheet handles upload; GAS does not move or create files.
