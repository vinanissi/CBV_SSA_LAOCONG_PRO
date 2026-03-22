# Blank Row Handling Audit

## Issue Addressed

**Problem**: The system falsely treated fully blank trailing rows as real records, producing false audit errors:

- blank ROLE
- blank STATUS
- blank TASK_TYPE
- blank ACTION
- etc.

**Root cause**: `getRange(2, 1, lastRow, lastCol)` includes the last row. If that row (or interstitial rows) is fully blank, it is still returned and audited as a record.

## Solution Implemented

- **Centralized blank-row detection** in `03_SHARED_ROW_READER.gs`
- **Shared helpers**: `isEffectivelyBlankRow`, `filterRealDataRows`, `readNormalizedRows`
- **Meaningful-fields map** per table; audit-only columns excluded
- **Consistent application** in `_rows`, `_auditGetRows`, `_goldenAllRows`

## Blank-Row Rule

| Condition | Action |
|-----------|--------|
| All meaningful business fields blank | Row **ignored** |
| Any meaningful field has data | Row **kept** (partial rows still audited) |
| Only audit fields (CREATED_AT, UPDATED_AT, IS_DELETED, etc.) filled | Row **ignored** |

## Files Changed

| File | Change |
|------|--------|
| `05_GAS_RUNTIME/03_SHARED_ROW_READER.gs` | **NEW** — helpers, meaningful-fields map |
| `05_GAS_RUNTIME/03_SHARED_REPOSITORY.gs` | `_rows()` uses `readNormalizedRows` |
| `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT.gs` | `_auditGetRows()` uses `readNormalizedRows` |
| `05_GAS_RUNTIME/99_DEBUG_SAMPLE_DATA.gs` | `_goldenAllRows()` uses `readNormalizedRows` |
| `.clasp.json` | Added `03_SHARED_ROW_READER.gs` to filePushOrder |

## Helpers Added

| Function | Purpose |
|----------|---------|
| `isEffectivelyBlankRow(rowObj, meaningfulFields, options)` | True if all meaningful fields are blank |
| `filterRealDataRows(rowObjs, meaningfulFields, options)` | Drop fully blank rows |
| `getMeaningfulFieldsForTable(tableName, headers)` | Resolve meaningful columns for a table |
| `readNormalizedRows(sheet, tableName)` | Read and return only non-blank rows |

## Verification

### Rerun order

1. `selfAuditBootstrap()`
2. `verifyAppSheetReadiness()`

### Expected outcome

- No false "blank ROLE", "blank STATUS", etc. for fully blank trailing rows
- Partial rows (some data, missing required fields) still produce audit findings
- `readNormalizedRows` / `filterRealDataRows` used by audit, repository, and seed helpers

## Examples

**a) Fully blank row — ignored**

```
{ ID: '', USER_CODE: '', FULL_NAME: '', ROLE: '', STATUS: '', ... }
→ Excluded by filterRealDataRows
```

**b) Partial row — still audited**

```
{ ID: 'TASK_001', TITLE: 'Fix bug', TASK_TYPE: '', STATUS: '' }
→ Kept; audit flags blank TASK_TYPE, STATUS
```
